"""SQLAlchemy async database engine and session factory."""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

# ---------------------------------------------------------------------------
# Engine – created once at module import time.
# ---------------------------------------------------------------------------
engine = create_async_engine(
    settings.async_database_url,
    echo=settings.DEBUG,
    pool_pre_ping=True,
)

# ---------------------------------------------------------------------------
# Session factory
# ---------------------------------------------------------------------------
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


# ---------------------------------------------------------------------------
# Declarative base for all ORM models
# ---------------------------------------------------------------------------
class Base(DeclarativeBase):
    """Base class that all ORM models inherit from."""


# ---------------------------------------------------------------------------
# FastAPI dependency that yields an async database session.
# ---------------------------------------------------------------------------
async def get_db() -> AsyncGenerator[AsyncSession]:
    """Yield an async database session and close it when done."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
