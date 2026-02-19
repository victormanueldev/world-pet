import pytest
import asyncio
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool
from app.db.base import Base
from app.core.config import settings
from app.api.v1.auth import get_db
from app.main import app

@pytest.fixture(scope="session")
def engine():
    return create_async_engine(settings.SQLALCHEMY_DATABASE_URI, poolclass=NullPool)

@pytest.fixture(scope="session")
def async_session_maker(engine):
    return async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

@pytest.fixture(scope="session", autouse=True)
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture
async def db(engine, async_session_maker) -> AsyncGenerator[AsyncSession, None]:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async with async_session_maker() as session:
        yield session
        await session.rollback()
    
    async with engine.begin() as conn:
        # We drop all tables to ensure absolute isolation for the next test
        await conn.run_sync(Base.metadata.drop_all)

@pytest.fixture
async def client(db: AsyncSession) -> AsyncGenerator:
    async def override_get_db():
        yield db
    
    app.dependency_overrides[get_db] = override_get_db
    from httpx import AsyncClient, ASGITransport
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()
