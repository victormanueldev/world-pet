"""User service with tenant-scoped operations."""

from typing import cast

from sqlalchemy import func, select
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
    )
    db.add(user)
    await db.flush()  # Get user.id without committing

    # Create user-tenant association
    user_tenant = UserTenant(
        user_id=user.id,
        tenant_id=tenant_id,
        role=role,
    )
    db.add(user_tenant)
    await db.commit()
    await db.refresh(user)
    return user


async def get_user_by_id(db: AsyncSession, user_id: int, tenant_id: int) -> User | None:
    """Get a user by ID, scoped to tenant."""
    # Check if user has access to this tenant
    result = await db.execute(
        select(UserTenant).where(
            UserTenant.user_id == user_id,
            UserTenant.tenant_id == tenant_id,
        )
    )
    association = result.scalar_one_or_none()
    if not association:
        return None

    # Get the user
    user_result = await db.execute(select(User).where(User.id == user_id))
    return user_result.scalar_one_or_none()


async def get_user_by_email(
    db: AsyncSession, email: str, tenant_id: int
) -> User | None:
    """Get a user by email, scoped to tenant."""
    # First get the user by email (global)
    user_result = await db.execute(select(User).where(User.email == email))
    user = user_result.scalar_one_or_none()
    if not user:
        return None

    # Check if user has access to this tenant
    access_result = await db.execute(
        select(UserTenant).where(
            UserTenant.user_id == user.id,
            UserTenant.tenant_id == tenant_id,
        )
    )
    association = access_result.scalar_one_or_none()
    return user if association else None


async def list_users(
    db: AsyncSession, tenant_id: int, skip: int = 0, limit: int = 20
) -> tuple[list[User], int]:
    """List users with pagination, scoped to tenant."""
    # Get users who have access to this tenant
    result = await db.execute(
        select(User)
        .join(UserTenant, User.id == UserTenant.user_id)
        .where(UserTenant.tenant_id == tenant_id)
        .offset(skip)
        .limit(limit)
    )
    users = result.scalars().all()

    # Count total users in this tenant
    count_result = await db.execute(
        select(func.count(UserTenant.user_id)).where(UserTenant.tenant_id == tenant_id)
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
) -> str | None:
    """Get a user's role in a specific tenant."""
    result = await db.execute(
        select(UserTenant).where(
            UserTenant.user_id == user_id, UserTenant.tenant_id == tenant_id
        )
    )
    association = result.scalar_one_or_none()
    return association.role if association else None
