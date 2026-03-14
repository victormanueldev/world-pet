"""Pet service with RBAC and tenant-scoped operations."""

import logging
from datetime import datetime, UTC
from typing import Optional

from sqlalchemy import and_, func, or_, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.pet import Pet
from app.models.user import User
from app.schemas.pet import PetCreate, PetFilters, PetUpdate
from app.services.s3_service import s3_service

logger = logging.getLogger(__name__)


async def create_pet(
    db: AsyncSession,
    tenant_id: int,
    current_user_id: int,
    user_role: str,
    pet_data: PetCreate,
) -> Pet:
    """
    Create a new pet.

    For owners: owner_id is auto-set to current user, status is 'owned'
    For admins: owner_id is optional, status can be specified
    """
    # Validate owner_id if provided
    if pet_data.owner_id:
        owner = await db.execute(select(User).where(User.id == pet_data.owner_id))
        if not owner.scalar_one_or_none():
            raise ValueError(f"Owner with ID {pet_data.owner_id} not found")

    # For owners, always set owner to themselves
    if user_role == "user":
        owner_id = current_user_id
        status = "owned"
    else:
        # For admins
        owner_id = pet_data.owner_id
        status = pet_data.status or ("owned" if owner_id else "available_for_adoption")

    # Verify photo exists in S3 if provided
    if pet_data.photo_key:
        if not s3_service.verify_object_exists(pet_data.photo_key):
            raise ValueError("Photo not found in storage")
        photo_url = s3_service.generate_cloudfront_url(pet_data.photo_key)
    else:
        photo_url = None

    # Create pet
    pet = Pet(
        tenant_id=tenant_id,
        name=pet_data.name,
        species=pet_data.species,
        breed=pet_data.breed,
        sex=pet_data.sex,
        birth_date=pet_data.birth_date,
        weight=pet_data.weight,
        sterilized=pet_data.sterilized,
        owner_id=owner_id,
        status=status,
        photo_key=pet_data.photo_key,
        photo_url=photo_url,
        adopted_at=datetime.now(UTC).replace(tzinfo=None) if owner_id else None,
        created_by=current_user_id,
    )

    db.add(pet)
    await db.commit()
    await db.refresh(pet)
    return pet


async def list_pets(
    db: AsyncSession,
    tenant_id: int,
    current_user_id: int,
    user_role: str,
    filters: PetFilters,
) -> tuple[list[Pet], int]:
    """
    List pets with role-based filtering and search.

    Owners see only their pets, admins see all clinic pets.
    """
    # Base query - always filter by tenant and exclude soft-deleted
    query = select(Pet).where(
        and_(
            Pet.tenant_id == tenant_id,
            Pet.deleted_at.is_(None),
        )
    )

    # Role-based filtering
    if user_role == "user":
        query = query.where(Pet.owner_id == current_user_id)
    # Admins see all pets in tenant

    # Apply filters
    if filters.owner_id:
        query = query.where(Pet.owner_id == filters.owner_id)

    if filters.status:
        query = query.where(Pet.status == filters.status)

    if filters.species:
        query = query.where(Pet.species == filters.species)

    if filters.search:
        # Case-insensitive search by name
        search_pattern = f"%{filters.search.lower()}%"
        query = query.where(func.lower(Pet.name).ilike(search_pattern))

    # Get total count before pagination
    count_query = (
        select(func.count(Pet.id))
        .select_from(Pet)
        .where(
            and_(
                Pet.tenant_id == tenant_id,
                Pet.deleted_at.is_(None),
            )
        )
    )

    # Apply same filters to count query
    if user_role == "user":
        count_query = count_query.where(Pet.owner_id == current_user_id)
    if filters.owner_id:
        count_query = count_query.where(Pet.owner_id == filters.owner_id)
    if filters.status:
        count_query = count_query.where(Pet.status == filters.status)
    if filters.species:
        count_query = count_query.where(Pet.species == filters.species)
    if filters.search:
        count_query = count_query.where(func.lower(Pet.name).ilike(search_pattern))

    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Apply pagination
    offset = (filters.page - 1) * filters.limit
    query = query.offset(offset).limit(filters.limit)

    # Execute query
    result = await db.execute(query)
    pets = result.scalars().all()

    return pets, total


async def get_pet(
    db: AsyncSession,
    pet_id: int,
    tenant_id: int,
    current_user_id: int,
    user_role: str,
) -> Pet | None:
    """Get a single pet with RBAC validation."""
    # Query with tenant isolation
    query = select(Pet).where(
        and_(
            Pet.id == pet_id,
            Pet.tenant_id == tenant_id,
            Pet.deleted_at.is_(None),
        )
    )

    # Role-based filtering
    if user_role == "user":
        query = query.where(Pet.owner_id == current_user_id)

    result = await db.execute(query)
    return result.scalar_one_or_none()


async def update_pet(
    db: AsyncSession,
    pet_id: int,
    tenant_id: int,
    current_user_id: int,
    user_role: str,
    pet_data: PetUpdate,
) -> Pet | None:
    """Update a pet with RBAC validation and photo replacement."""
    # Get pet with validation
    pet = await get_pet(db, pet_id, tenant_id, current_user_id, user_role)
    if not pet:
        return None

    # Update fields (only update what's provided)
    if pet_data.name is not None:
        pet.name = pet_data.name
    if pet_data.breed is not None:
        pet.breed = pet_data.breed
    if pet_data.sex is not None:
        pet.sex = pet_data.sex
    if pet_data.birth_date is not None:
        pet.birth_date = pet_data.birth_date
    if pet_data.weight is not None:
        pet.weight = pet_data.weight
    if pet_data.sterilized is not None:
        pet.sterilized = pet_data.sterilized
    if pet_data.status is not None:
        pet.status = pet_data.status

    # Handle photo replacement
    if pet_data.photo_key is not None:
        if pet_data.photo_key == "":
            # Remove photo
            if pet.photo_key:
                s3_service.delete_object(pet.photo_key)
            pet.photo_key = None
            pet.photo_url = None
        else:
            # Replace with new photo
            if not s3_service.verify_object_exists(pet_data.photo_key):
                raise ValueError("Photo not found in storage")

            # Delete old photo
            if pet.photo_key:
                s3_service.delete_object(pet.photo_key)

            # Update with new photo
            pet.photo_key = pet_data.photo_key
            pet.photo_url = s3_service.generate_cloudfront_url(pet_data.photo_key)

    # Update audit trail
    pet.updated_by = current_user_id
    pet.updated_at = datetime.now(UTC).replace(tzinfo=None)

    await db.commit()
    await db.refresh(pet)
    return pet


async def soft_delete_pet(
    db: AsyncSession,
    pet_id: int,
    tenant_id: int,
    current_user_id: int,
) -> bool:
    """Soft delete a pet (admin only)."""
    # Get pet with tenant validation
    result = await db.execute(
        select(Pet).where(
            and_(
                Pet.id == pet_id,
                Pet.tenant_id == tenant_id,
                Pet.deleted_at.is_(None),
            )
        )
    )
    pet = result.scalar_one_or_none()
    if not pet:
        return False

    # Set soft delete timestamp
    pet.deleted_at = datetime.now(UTC).replace(tzinfo=None)

    # Tag S3 photo for archival
    if pet.photo_key:
        s3_service.tag_object(pet.photo_key, {"deleted": "true"})

    await db.commit()
    return True


async def adopt_pet(
    db: AsyncSession,
    pet_id: int,
    owner_id: int,
    tenant_id: int,
    current_user_id: int,
) -> Pet | None:
    """
    Assign owner to a pet (admin-only adoption).

    Verifies owner is in the same tenant and pet is not already owned.
    """
    # Verify owner exists in same tenant (through UserTenant)
    from app.models.user_tenant import UserTenant

    owner_check = await db.execute(
        select(UserTenant).where(
            and_(
                UserTenant.user_id == owner_id,
                UserTenant.tenant_id == tenant_id,
            )
        )
    )
    if not owner_check.scalar_one_or_none():
        raise ValueError("Owner not found in this tenant")

    # Get pet with validation
    result = await db.execute(
        select(Pet).where(
            and_(
                Pet.id == pet_id,
                Pet.tenant_id == tenant_id,
                Pet.deleted_at.is_(None),
            )
        )
    )
    pet = result.scalar_one_or_none()
    if not pet:
        return None

    # Check if already adopted
    if pet.owner_id is not None:
        raise ValueError("Pet is already owned")

    # Assign owner
    pet.owner_id = owner_id
    pet.status = "owned"
    pet.adopted_at = datetime.now(UTC).replace(tzinfo=None)
    pet.updated_by = current_user_id
    pet.updated_at = datetime.now(UTC).replace(tzinfo=None)

    await db.commit()
    await db.refresh(pet)
    return pet
