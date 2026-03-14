"""FastAPI dependencies for tenant extraction."""

from typing import Annotated

from fastapi import Depends, Header, HTTPException, Path, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.tenant import Tenant
from app.services import tenant_service


async def get_current_tenant_id(
    request: Request,
    x_tenant_id: str | None = Header(None, alias="X-Tenant-ID"),
) -> int:
    """Extract tenant ID from request.

    Priority:
    1. JWT token tenant_id claim (if available)
    2. X-Tenant-ID header

    Args:
        request: The incoming request
        x_tenant_id: Optional X-Tenant-ID header

    Returns:
        The tenant ID

    Raises:
        HTTPException: If tenant ID is not found
    """
    # Try to get tenant_id from JWT claims (if user is authenticated)
    # This would typically be set by the auth middleware
    tenant_id_from_request = getattr(request.state, "tenant_id", None)

    if tenant_id_from_request is not None:
        return tenant_id_from_request

    # Fall back to header
    if x_tenant_id is not None:
        try:
            return int(x_tenant_id)
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid tenant ID format",
            ) from e

    # No tenant context found
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Tenant context required",
    )


async def get_optional_tenant_id(
    x_tenant_id: str | None = Header(None, alias="X-Tenant-ID"),
) -> int | None:
    """Extract tenant ID from request if provided, otherwise return None.

    Args:
        x_tenant_id: Optional X-Tenant-ID header

    Returns:
        The tenant ID if provided, None otherwise
    """
    if x_tenant_id is not None:
        try:
            return int(x_tenant_id)
        except ValueError:
            return None
    return None


async def get_tenant_by_slug(
    slug: Annotated[str, Path(min_length=1, max_length=100, description="Tenant slug")],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Tenant:
    """Get a tenant by slug from the URL path.

    Args:
        slug: The tenant slug from the URL path
        db: Database session

    Returns:
        The tenant object

    Raises:
        HTTPException: If tenant is not found
    """
    tenant = await tenant_service.get_tenant_by_slug(db, slug)
    if tenant is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clinic not found",
        )
    return tenant
