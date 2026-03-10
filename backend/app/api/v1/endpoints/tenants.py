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
from app.schemas.tenant import TenantCreate, TenantList, TenantResponse, TenantUpdate
from app.services import tenant_service

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
