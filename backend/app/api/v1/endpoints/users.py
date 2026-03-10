"""User API endpoints with tenant scoping."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.dependencies.auth import (
    get_authenticated_tenant_id,
    get_current_active_user,
    require_role,
)
from app.models.tenant import Tenant
from app.models.user import User
from app.models.user_tenant import UserTenant
from app.schemas.auth import UserTenantInfo, UserTenantsResponse
from app.services import user_service

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me/tenants", response_model=UserTenantsResponse)
async def get_my_tenants(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> UserTenantsResponse:
    """Get all tenants the current authenticated user has access to."""
    # Get user's tenant associations
    result = await db.execute(
        select(UserTenant).where(UserTenant.user_id == current_user.id)
    )
    associations = result.scalars().all()

    if not associations:
        return UserTenantsResponse(tenants=[])

    # Fetch tenant details
    tenant_ids = [a.tenant_id for a in associations]
    result = await db.execute(select(Tenant).where(Tenant.id.in_(tenant_ids)))
    tenants = {t.id: t for t in result.scalars().all()}

    # Build response
    tenant_infos = [
        UserTenantInfo(
            tenant_id=a.tenant_id,
            tenant_name=tenants[a.tenant_id].name
            if a.tenant_id in tenants
            else "Unknown",
            role=a.role,
        )
        for a in associations
    ]

    return UserTenantsResponse(tenants=tenant_infos)


@router.delete("/{target_tenant_id}/users/{user_id}")
async def remove_user_from_tenant(
    target_tenant_id: int,
    user_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role("admin"))],
    tenant_id: Annotated[int, Depends(get_authenticated_tenant_id)],
) -> dict[str, str]:
    """Remove a user from a tenant.

    Requires admin role in the current tenant context.
    """
    # Verify the target tenant matches the current auth context
    if target_tenant_id != tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot manage users in a different tenant",
        )

    success = await user_service.remove_user_from_tenant(db, user_id, target_tenant_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User-tenant association not found",
        )
    return {"message": "User removed from tenant"}
