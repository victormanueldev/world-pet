"""Tenant API endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.dependencies.auth import (
    get_authenticated_tenant_id,
    get_current_active_user,
    require_role,
)
from app.models.user import User
from app.schemas.tenant import (
    TenantCreate,
    TenantList,
    TenantPublicInfo,
    TenantRegisterRequest,
    TenantRegisterResponse,
    TenantResponse,
    TenantUpdate,
)
from app.services import auth_service, tenant_service

router = APIRouter(prefix="/tenants", tags=["tenants"])


@router.post("", response_model=TenantResponse, status_code=status.HTTP_201_CREATED)
async def create_tenant(
    tenant_data: TenantCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role("admin"))],
) -> TenantResponse:
    """Create a new tenant.

    Requires admin role.
    """
    existing = await tenant_service.get_tenant_by_slug(db, tenant_data.slug)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tenant with this slug already exists",
        )
    tenant = await tenant_service.create_tenant(db, tenant_data)
    return TenantResponse.model_validate(tenant)


@router.get("", response_model=TenantList)
async def list_tenants(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
    skip: int = 0,
    limit: int = 20,
) -> TenantList:
    """List all tenants with pagination.

    Requires authentication.
    """
    tenants, total = await tenant_service.list_tenants(db, skip, limit)
    return TenantList(
        total=total,
        tenants=[TenantResponse.model_validate(t) for t in tenants],
    )


@router.get("/{slug}", response_model=TenantPublicInfo)
async def get_tenant_by_slug(
    slug: str,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TenantPublicInfo:
    """Get a tenant by slug (public endpoint).

    Returns basic tenant information without authentication.
    """
    tenant = await tenant_service.get_tenant_by_slug(db, slug)
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clinic not found",
        )
    return TenantPublicInfo(
        id=tenant.id,
        name=tenant.name,
        slug=tenant.slug,
    )


@router.post(
    "/{slug}/register",
    response_model=TenantRegisterResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register_at_tenant(
    slug: str,
    request: TenantRegisterRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TenantRegisterResponse:
    """Register a new user at a specific tenant (clinic).

    The tenant is determined by the URL slug, not the request body.
    """
    # Get tenant by slug
    tenant = await tenant_service.get_tenant_by_slug(db, slug)
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clinic not found",
        )

    # Check if email already exists
    existing_user = await auth_service.get_user_by_email(db, request.email)
    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Create user with the tenant from URL
    user = await auth_service.register_user(
        db=db,
        email=request.email,
        name=request.name,
        password=request.password,
        tenant_id=tenant.id,
        role="user",
    )

    return TenantRegisterResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        tenant_id=tenant.id,
        tenant_slug=tenant.slug,
        tenant_name=tenant.name,
        created_at=user.created_at,
    )


@router.get("/{tenant_id}", response_model=TenantResponse)
async def get_tenant(
    tenant_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> TenantResponse:
    """Get a tenant by ID.

    Requires authentication.
    """
    tenant = await tenant_service.get_tenant_by_id(db, tenant_id)
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found",
        )
    return TenantResponse.model_validate(tenant)


@router.patch("/{tenant_id}", response_model=TenantResponse)
async def update_tenant(
    tenant_id: int,
    tenant_data: TenantUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role("admin"))],
    auth_tenant_id: Annotated[int, Depends(get_authenticated_tenant_id)],
) -> TenantResponse:
    """Update a tenant.

    Requires admin role. Can only update the tenant you're authenticated for.
    """
    # Verify user is updating their own tenant
    if tenant_id != auth_tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot update a different tenant",
        )

    tenant = await tenant_service.get_tenant_by_id(db, tenant_id)
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found",
        )
    updated_tenant = await tenant_service.update_tenant(db, tenant, tenant_data)
    return TenantResponse.model_validate(updated_tenant)


@router.delete("/{tenant_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tenant(
    tenant_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role("admin"))],
    auth_tenant_id: Annotated[int, Depends(get_authenticated_tenant_id)],
) -> None:
    """Delete a tenant.

    Requires admin role. Can only delete the tenant you're authenticated for.
    """
    # Verify user is deleting their own tenant
    if tenant_id != auth_tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete a different tenant",
        )

    tenant = await tenant_service.get_tenant_by_id(db, tenant_id)
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found",
        )

    has_users = await tenant_service.tenant_has_users(db, tenant_id)
    if has_users:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete tenant with users",
        )

    await tenant_service.delete_tenant(db, tenant)
