"""Authentication service for user registration and login."""

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password, verify_password
from app.models.user import User
from app.models.user_tenant import UserTenant


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    """Get a user by email (global, not tenant-scoped).

    Args:
        db: Database session.
        email: User's email address.

    Returns:
        User if found, None otherwise.
    """
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def authenticate_user(db: AsyncSession, email: str, password: str) -> User | None:
    """Authenticate a user by email and password.

    Args:
        db: Database session.
        email: User's email address.
        password: Plain text password.

    Returns:
        User if authentication successful, None otherwise.
    """
    user = await get_user_by_email(db, email)
    if user is None:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


async def register_user(
    db: AsyncSession,
    email: str,
    name: str,
    password: str,
    tenant_id: int,
    role: str = "user",
) -> User:
    """Register a new user with password hashing and tenant association.

    Args:
        db: Database session.
        email: User's email address.
        name: User's display name.
        password: Plain text password (will be hashed).
        tenant_id: Initial tenant to associate user with.
        role: User's role in the tenant.

    Returns:
        The created User.

    Note:
        This function does NOT check if email already exists.
        Caller should check first using get_user_by_email.
    """
    hashed = hash_password(password)

    user = User(
        email=email,
        name=name,
        password_hash=hashed,
        tenant_id=tenant_id,
        role=role,
        is_active=True,
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


async def update_last_login(db: AsyncSession, user: User) -> User:
    """Update user's last_login timestamp.

    Args:
        db: Database session.
        user: User to update.

    Returns:
        Updated user.
    """
    user.last_login = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(user)
    return user


async def get_user_tenant_associations(
    db: AsyncSession, user_id: int
) -> list[UserTenant]:
    """Get all tenant associations for a user.

    Args:
        db: Database session.
        user_id: User's ID.

    Returns:
        List of UserTenant associations.
    """
    result = await db.execute(select(UserTenant).where(UserTenant.user_id == user_id))
    return list(result.scalars().all())


async def get_user_role_in_tenant(
    db: AsyncSession, user_id: int, tenant_id: int
) -> str | None:
    """Get user's role in a specific tenant.

    Args:
        db: Database session.
        user_id: User's ID.
        tenant_id: Tenant's ID.

    Returns:
        Role string if association exists, None otherwise.
    """
    result = await db.execute(
        select(UserTenant).where(
            UserTenant.user_id == user_id,
            UserTenant.tenant_id == tenant_id,
        )
    )
    association = result.scalar_one_or_none()
    return association.role if association else None
