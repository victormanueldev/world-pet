"""FastAPI dependencies for authentication and authorization."""

from collections.abc import Awaitable, Callable
from typing import Annotated

from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import (
    TokenDecodeError,
    TokenExpiredError,
    TokenPayload,
    decode_token,
)
from app.db.session import get_db
from app.models.user import User
from app.models.user_tenant import UserTenant

# HTTP Bearer token security scheme
security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    """Get the current authenticated user from the JWT token.

    Args:
        credentials: HTTP Bearer credentials from Authorization header.
        db: Database session.

    Returns:
        The authenticated User object.

    Raises:
        HTTPException: If not authenticated or token is invalid.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = decode_token(credentials.credentials, expected_type="access")
    except TokenExpiredError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e
    except TokenDecodeError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e

    # Fetch user from database
    result = await db.execute(select(User).where(User.id == payload.user_id))
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Get the current user and verify they are active.

    Args:
        current_user: The current authenticated user.

    Returns:
        The authenticated active User object.

    Raises:
        HTTPException: If user account is disabled.
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account disabled",
        )
    return current_user


def require_role(
    allowed_roles: str | list[str],
) -> Callable[..., Awaitable[User]]:
    """Factory for creating role-based access control dependencies.

    Args:
        allowed_roles: Single role or list of allowed roles.

    Returns:
        A FastAPI dependency that checks user role.

    Example:
        @router.delete("/admin-only")
        async def admin_endpoint(
            user: User = Depends(require_role("admin"))
        ):
            ...

        @router.post("/moderators")
        async def mod_endpoint(
            user: User = Depends(require_role(["admin", "moderator"]))
        ):
            ...
    """
    if isinstance(allowed_roles, str):
        allowed_roles = [allowed_roles]

    async def role_checker(
        current_user: Annotated[User, Depends(get_current_active_user)],
        db: Annotated[AsyncSession, Depends(get_db)],
        tenant_id: Annotated[int, Depends(get_authenticated_tenant_id)],
    ) -> User:
        """Check if user has required role in current tenant.

        Args:
            current_user: The current authenticated active user.
            db: Database session.
            tenant_id: The authenticated tenant ID.

        Returns:
            The user if role check passes.

        Raises:
            HTTPException: If user doesn't have required role.
        """
        # Get user's role in the current tenant
        result = await db.execute(
            select(UserTenant).where(
                UserTenant.user_id == current_user.id,
                UserTenant.tenant_id == tenant_id,
            )
        )
        user_tenant = result.scalar_one_or_none()

        if user_tenant is None or user_tenant.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )

        return current_user

    return role_checker


async def get_authenticated_tenant_id(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
    db: Annotated[AsyncSession, Depends(get_db)],
    x_tenant_id: str | None = Header(None, alias="X-Tenant-ID"),
) -> int:
    """Get and validate tenant ID from token or header.

    Priority:
    1. X-Tenant-ID header (if provided, validated against user's access)
    2. tenant_id from JWT token

    Args:
        credentials: HTTP Bearer credentials.
        db: Database session.
        x_tenant_id: Optional X-Tenant-ID header for tenant switching.

    Returns:
        The validated tenant ID.

    Raises:
        HTTPException: If not authenticated or tenant access denied.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = decode_token(credentials.credentials, expected_type="access")
    except TokenExpiredError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e
    except TokenDecodeError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e

    # Determine target tenant: header overrides token
    target_tenant_id: int
    if x_tenant_id is not None:
        try:
            target_tenant_id = int(x_tenant_id)
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid tenant ID format",
            ) from e
    elif payload.tenant_id is not None:
        target_tenant_id = payload.tenant_id
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tenant context required",
        )

    # Validate user has access to target tenant
    result = await db.execute(
        select(UserTenant).where(
            UserTenant.user_id == payload.user_id,
            UserTenant.tenant_id == target_tenant_id,
        )
    )
    user_tenant = result.scalar_one_or_none()

    if user_tenant is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tenant access denied",
        )

    return target_tenant_id


async def get_token_payload(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
) -> TokenPayload:
    """Get the decoded token payload.

    Useful when you need access to token claims without fetching user from DB.

    Args:
        credentials: HTTP Bearer credentials.

    Returns:
        The decoded token payload.

    Raises:
        HTTPException: If not authenticated or token is invalid.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        return decode_token(credentials.credentials, expected_type="access")
    except TokenExpiredError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e
    except TokenDecodeError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e


async def get_current_tenant_context(
    current_user: Annotated[User, Depends(get_current_active_user)],
    tenant_id: Annotated[int, Depends(get_authenticated_tenant_id)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Get current user's tenant context including role and user ID.

    Args:
        current_user: The current authenticated active user.
        tenant_id: The authenticated tenant ID.
        db: Database session.

    Returns:
        Dictionary with tenant_id, user_id, and role.

    Raises:
        HTTPException: If user doesn't have access to tenant.
    """
    # Get user's role in the current tenant
    result = await db.execute(
        select(UserTenant).where(
            UserTenant.user_id == current_user.id,
            UserTenant.tenant_id == tenant_id,
        )
    )
    user_tenant = result.scalar_one_or_none()

    if user_tenant is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tenant access denied",
        )

    return {
        "tenant_id": tenant_id,
        "user_id": current_user.id,
        "role": user_tenant.role,
    }
