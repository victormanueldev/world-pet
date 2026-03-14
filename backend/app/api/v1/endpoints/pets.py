"""Pet management API endpoints."""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.dependencies.auth import get_current_tenant_context
from app.schemas.pet import (
    AdoptPetRequest,
    PetCreate,
    PetDetailResponse,
    PetFilters,
    PaginatedPetResponse,
    PresignedUploadRequest,
    PresignedUploadResponse,
    PetResponse,
    PetUpdate,
)
from app.services import pet_service
from app.services.s3_service import s3_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/pets", tags=["pets"])


@router.post(
    "/upload-url",
    response_model=PresignedUploadResponse,
    status_code=status.HTTP_200_OK,
)
async def get_upload_url(
    request: PresignedUploadRequest,
    tenant_context: Annotated[dict, Depends(get_current_tenant_context)],
) -> PresignedUploadResponse:
    """Generate a presigned S3 upload URL for pet photos.

    Returns the URL, form fields, and CloudFront URL for direct client upload.
    """
    tenant_id = tenant_context["tenant_id"]

    try:
        response = s3_service.generate_upload_presigned_url(
            tenant_id=tenant_id,
            filename=request.filename,
            content_type=request.content_type,
            file_size=request.file_size,
        )
        return PresignedUploadResponse(**response)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Photo upload service temporarily unavailable",
        )


@router.post(
    "",
    response_model=PetResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_pet(
    request: PetCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    tenant_context: Annotated[dict, Depends(get_current_tenant_context)],
) -> PetResponse:
    """Create a new pet.

    Owners: owner_id is auto-set to themselves, status is 'owned'
    Admins: can create pets with or without owner, specify status
    """
    tenant_id = tenant_context["tenant_id"]
    current_user_id = tenant_context["user_id"]
    user_role = tenant_context["role"]

    try:
        pet = await pet_service.create_pet(
            db=db,
            tenant_id=tenant_id,
            current_user_id=current_user_id,
            user_role=user_role,
            pet_data=request,
        )
        return PetResponse.model_validate(pet)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get(
    "",
    response_model=PaginatedPetResponse,
    status_code=status.HTTP_200_OK,
)
async def list_pets(
    db: Annotated[AsyncSession, Depends(get_db)],
    tenant_context: Annotated[dict, Depends(get_current_tenant_context)],
    owner_id: int | None = Query(None),
    status: str | None = Query(None),
    species: str | None = Query(None),
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
) -> PaginatedPetResponse:
    """List pets with role-based filtering.

    Owners see their own pets, admins see all clinic pets.
    """
    tenant_id = tenant_context["tenant_id"]
    current_user_id = tenant_context["user_id"]
    user_role = tenant_context["role"]

    filters = PetFilters(
        owner_id=owner_id,
        status=status,
        species=species,
        search=search,
        page=page,
        limit=limit,
    )

    pets, total = await pet_service.list_pets(
        db=db,
        tenant_id=tenant_id,
        current_user_id=current_user_id,
        user_role=user_role,
        filters=filters,
    )

    return PaginatedPetResponse(
        items=[PetResponse.model_validate(pet) for pet in pets],
        total=total,
        page=page,
        limit=limit,
    )


@router.get(
    "/{pet_id}",
    response_model=PetResponse,
    status_code=status.HTTP_200_OK,
)
async def get_pet(
    pet_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    tenant_context: Annotated[dict, Depends(get_current_tenant_context)],
) -> PetResponse:
    """Get pet details."""
    tenant_id = tenant_context["tenant_id"]
    current_user_id = tenant_context["user_id"]
    user_role = tenant_context["role"]

    pet = await pet_service.get_pet(
        db=db,
        pet_id=pet_id,
        tenant_id=tenant_id,
        current_user_id=current_user_id,
        user_role=user_role,
    )

    if not pet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pet not found",
        )

    return PetResponse.model_validate(pet)


@router.put(
    "/{pet_id}",
    response_model=PetResponse,
    status_code=status.HTTP_200_OK,
)
async def update_pet(
    pet_id: int,
    request: PetUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    tenant_context: Annotated[dict, Depends(get_current_tenant_context)],
) -> PetResponse:
    """Update pet information.

    Owners can update their own pets, admins can update any pet in their clinic.
    """
    tenant_id = tenant_context["tenant_id"]
    current_user_id = tenant_context["user_id"]
    user_role = tenant_context["role"]

    try:
        pet = await pet_service.update_pet(
            db=db,
            pet_id=pet_id,
            tenant_id=tenant_id,
            current_user_id=current_user_id,
            user_role=user_role,
            pet_data=request,
        )

        if not pet:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pet not found",
            )

        return PetResponse.model_validate(pet)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.patch(
    "/{pet_id}/adopt",
    response_model=PetResponse,
    status_code=status.HTTP_200_OK,
)
async def adopt_pet(
    pet_id: int,
    request: AdoptPetRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    tenant_context: Annotated[dict, Depends(get_current_tenant_context)],
) -> PetResponse:
    """Assign owner to a pet (admin-only adoption workflow).

    Verifies owner exists in the same tenant and pet is not already owned.
    """
    tenant_id = tenant_context["tenant_id"]
    current_user_id = tenant_context["user_id"]
    user_role = tenant_context["role"]

    # Check admin permission
    if user_role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can assign pet ownership",
        )

    try:
        pet = await pet_service.adopt_pet(
            db=db,
            pet_id=pet_id,
            owner_id=request.owner_id,
            tenant_id=tenant_id,
            current_user_id=current_user_id,
        )

        if not pet:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pet not found",
            )

        return PetResponse.model_validate(pet)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.delete(
    "/{pet_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_pet(
    pet_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    tenant_context: Annotated[dict, Depends(get_current_tenant_context)],
) -> None:
    """Soft delete a pet (admin-only).

    Marks the pet as deleted and tags S3 photos for archival.
    """
    tenant_id = tenant_context["tenant_id"]
    user_role = tenant_context["role"]

    # Check admin permission
    if user_role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete pets",
        )

    deleted = await pet_service.soft_delete_pet(
        db=db,
        pet_id=pet_id,
        tenant_id=tenant_id,
        current_user_id=tenant_context["user_id"],
    )

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pet not found",
        )
