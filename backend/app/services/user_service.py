"""User service with tenant-scoped operations."""

from typing import Optional, cast

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.user_tenant import UserTenant


async def create_user(
    db: AsyncSession,
    email: str,
    name: str,
    password_hash: str,
    tenant_id: int,
    role: str = "user",
) -> User:
    """Create a new user with tenant association."""
    user = User(
        email=email,
        name=name,
        password_hash=password_hash,
        tenant_id=tenant_id,
        role=role,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def get_user_by_id(
    db: AsyncSession, user_id: int, tenant_id: int
) -> Optional[User]:
    """Get a user by ID, scoped to tenant."""
    result = await db.execute(
        select(User).where(User.id == user_id, User.tenant_id == tenant_id)
    )
    return result.scalar_one_or_none()


async def get_user_by_email(
    db: AsyncSession, email: str, tenant_id: int
) -> Optional[User]:
    """Get a user by email, scoped to tenant."""
    result = await db.execute(
        select(User).where(User.email == email, User.tenant_id == tenant_id)
    )
    return result.scalar_one_or_none()


async def list_users(
    db: AsyncSession, tenant_id: int, skip: int = 0, limit: int = 20
) -> tuple[list[User], int]:
    """List users with pagination, scoped to tenant."""
    result = await db.execute(
        select(User).where(User.tenant_id == tenant_id).offset(skip).limit(limit)
    )
    users = result.scalars().all()

    count_result = await db.execute(
        select(func.count(User.id)).where(User.tenant_id == tenant_id)
    )
    total = cast(int, count_result.scalar() or 0)

    return list(users), total


async def update_user(db: AsyncSession, user: User, **kwargs) -> User:
    """Update a user."""
    for key, value in kwargs.items():
        if value is not None and hasattr(user, key):
            setattr(user, key, value)
    await db.commit()
    await db.refresh(user)
    return user


async def delete_user(db: AsyncSession, user: User) -> None:
    """Delete a user."""
    await db.delete(user)
    await db.commit()


async def add_user_to_tenant(
    db: AsyncSession, user_id: int, tenant_id: int, role: str = "user"
) -> UserTenant:
    """Add a user to a tenant with a specific role."""
    association = UserTenant(
        user_id=user_id,
        tenant_id=tenant_id,
        role=role,
    )
    db.add(association)
    await db.commit()
    await db.refresh(association)
    return association


async def remove_user_from_tenant(
    db: AsyncSession, user_id: int, tenant_id: int
) -> bool:
    """Remove a user from a tenant."""
    result = await db.execute(
        select(UserTenant).where(
            UserTenant.user_id == user_id, UserTenant.tenant_id == tenant_id
        )
    )
    association = result.scalar_one_or_none()
    if association:
        await db.delete(association)
        await db.commit()
        return True
    return False


async def get_user_tenants(db: AsyncSession, user_id: int) -> list[UserTenant]:
    """Get all tenants a user belongs to."""
    result = await db.execute(select(UserTenant).where(UserTenant.user_id == user_id))
    return list(result.scalars().all())


async def user_has_tenant_access(
    db: AsyncSession, user_id: int, tenant_id: int
) -> bool:
    """Check if a user has access to a specific tenant."""
    result = await db.execute(
        select(UserTenant).where(
            UserTenant.user_id == user_id, UserTenant.tenant_id == tenant_id
        )
    )
    return result.scalar_one_or_none() is not None


async def get_user_role_in_tenant(
    db: AsyncSession, user_id: int, tenant_id: int
) -> Optional[str]:
    """Get a user's role in a specific tenant."""
    result = await db.execute(
        select(UserTenant).where(
            UserTenant.user_id == user_id, UserTenant.tenant_id == tenant_id
        )
    )
    association = result.scalar_one_or_none()
    return association.role if association else None
