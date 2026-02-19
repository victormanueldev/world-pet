from sqlalchemy.ext.asyncio import AsyncSession
from app.models.tenant import Tenant
import uuid

async def create_tenant(db: AsyncSession, name: str) -> Tenant:
    db_obj = Tenant(name=name)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj
