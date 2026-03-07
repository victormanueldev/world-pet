"""User API endpoints with tenant scoping."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.dependencies.tenant import get_current_tenant_id
from app.services import user_service

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me/tenants")
async def get_my_tenants(
    db: AsyncSession = Depends(get_db),
    tenant_id: int = Depends(get_current_tenant_id),
):
    """Get all tenants the current user has access to."""
    from app.models.user import User

    # This would normally come from auth context
    # For now, return the current tenant
    return {"tenant_id": tenant_id, "role": "admin"}


@router.delete("/{tenant_id}/users/{user_id}")
async def remove_user_from_tenant(
    tenant_id: int,
    user_id: int,
    db: AsyncSession = Depends(get_db),
    _: int = Depends(get_current_tenant_id),
):
    """Remove a user from a tenant."""
    success = await user_service.remove_user_from_tenant(db, user_id, tenant_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User-tenant association not found",
        )
    return {"message": "User removed from tenant"}
