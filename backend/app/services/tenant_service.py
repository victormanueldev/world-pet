"""Tenant service with CRUD operations."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.tenant import Tenant
from app.schemas.tenant import TenantCreate, TenantUpdate


async def create_tenant(db: AsyncSession, tenant_data: TenantCreate) -> Tenant:
    """Create a new tenant."""
    tenant = Tenant(
        name=tenant_data.name,
        slug=tenant_data.slug,
        settings=tenant_data.settings,
    )
    db.add(tenant)
    await db.commit()
    await db.refresh(tenant)
    return tenant


async def get_tenant_by_id(db: AsyncSession, tenant_id: int) -> Tenant | None:
    """Get a tenant by ID."""
    result = await db.execute(select(Tenant).where(Tenant.id == tenant_id))
    return result.scalar_one_or_none()


async def get_tenant_by_slug(db: AsyncSession, slug: str) -> Tenant | None:
    """Get a tenant by slug."""
    result = await db.execute(select(Tenant).where(Tenant.slug == slug))
    return result.scalar_one_or_none()


async def update_tenant(
    db: AsyncSession, tenant: Tenant, tenant_data: TenantUpdate
) -> Tenant:
    """Update a tenant."""
    update_data = tenant_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(tenant, field, value)
    await db.commit()
    await db.refresh(tenant)
    return tenant


async def delete_tenant(db: AsyncSession, tenant: Tenant) -> None:
    """Delete a tenant."""
    await db.delete(tenant)
    await db.commit()


async def list_tenants(
    db: AsyncSession, skip: int = 0, limit: int = 20
) -> tuple[list[Tenant], int]:
    """List tenants with pagination."""
    result = await db.execute(select(Tenant).offset(skip).limit(limit))
    tenants = result.scalars().all()

    count_result = await db.execute(select(Tenant))
    total = len(count_result.scalars().all())

    return list(tenants), total


async def create_default_tenant(db: AsyncSession) -> Tenant:
    """Create default tenant if it doesn't exist."""
    existing = await get_tenant_by_slug(db, "default")
    if existing:
        return existing

    default_tenant = Tenant(
        name="Default",
        slug="default",
        settings=None,
    )
    db.add(default_tenant)
    await db.commit()
    await db.refresh(default_tenant)
    return default_tenant


async def tenant_has_users(db: AsyncSession, tenant_id: int) -> bool:
    """Check if a tenant has any users."""
    from sqlalchemy import func, select

    from app.models.user import User

    result = await db.execute(
        select(func.count(User.id)).where(User.tenant_id == tenant_id)
    )
    count = result.scalar() or 0
    return count > 0
