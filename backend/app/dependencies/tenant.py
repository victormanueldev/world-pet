"""FastAPI dependencies for tenant extraction."""


from fastapi import Header, HTTPException, Request, status


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
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid tenant ID format",
            )

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
