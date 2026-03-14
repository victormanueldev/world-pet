"""Pytest configuration and shared fixtures for tests."""

from unittest.mock import MagicMock

import pytest
from httpx import ASGITransport, AsyncClient

from app.core.security import create_access_token, create_refresh_token
from app.main import app
from app.models.tenant import Tenant
from app.models.user import User
from app.models.user_tenant import UserTenant


@pytest.fixture
def mock_user() -> MagicMock:
    """Create a mock active user."""
    user = MagicMock(spec=User)
    user.id = 1
    user.email = "test@example.com"
    user.name = "Test User"
    user.role = "user"
    user.is_active = True
    user.tenant_id = 1
    user.password_hash = "$2b$12$test_hash"
    user.created_at = "2024-01-01T00:00:00"
    user.last_login = None
    return user


@pytest.fixture
def mock_admin_user() -> MagicMock:
    """Create a mock admin user."""
    user = MagicMock(spec=User)
    user.id = 2
    user.email = "admin@example.com"
    user.name = "Admin User"
    user.role = "admin"
    user.is_active = True
    user.tenant_id = 1
    user.password_hash = "$2b$12$test_hash"
    user.created_at = "2024-01-01T00:00:00"
    user.last_login = None
    return user


@pytest.fixture
def mock_tenant() -> MagicMock:
    """Create a mock tenant."""
    tenant = MagicMock(spec=Tenant)
    tenant.id = 1
    tenant.name = "Test Tenant"
    tenant.slug = "test-tenant"
    tenant.settings = {}
    tenant.created_at = "2024-01-01T00:00:00"
    tenant.updated_at = "2024-01-01T00:00:00"
    return tenant


@pytest.fixture
def mock_user_tenant() -> MagicMock:
    """Create a mock user-tenant association."""
    ut = MagicMock(spec=UserTenant)
    ut.id = 1
    ut.user_id = 1
    ut.tenant_id = 1
    ut.role = "user"
    ut.created_at = "2024-01-01T00:00:00"
    return ut


@pytest.fixture
def mock_admin_tenant() -> MagicMock:
    """Create a mock admin user-tenant association."""
    ut = MagicMock(spec=UserTenant)
    ut.id = 2
    ut.user_id = 2
    ut.tenant_id = 1
    ut.role = "admin"
    ut.created_at = "2024-01-01T00:00:00"
    return ut


@pytest.fixture
def user_access_token(mock_user: MagicMock) -> str:
    """Create an access token for a regular user."""
    return create_access_token(
        user_id=mock_user.id,
        tenant_id=1,
        role="user",
    )


@pytest.fixture
def admin_access_token(mock_admin_user: MagicMock) -> str:
    """Create an access token for an admin user."""
    return create_access_token(
        user_id=mock_admin_user.id,
        tenant_id=1,
        role="admin",
    )


@pytest.fixture
def user_refresh_token(mock_user: MagicMock) -> str:
    """Create a refresh token for a regular user."""
    return create_refresh_token(user_id=mock_user.id)


@pytest.fixture
def auth_headers(user_access_token: str) -> dict[str, str]:
    """Create authorization headers with user token."""
    return {"Authorization": f"Bearer {user_access_token}"}


@pytest.fixture
def admin_auth_headers(admin_access_token: str) -> dict[str, str]:
    """Create authorization headers with admin token."""
    return {"Authorization": f"Bearer {admin_access_token}"}


@pytest.fixture
async def async_client():
    """Create an async HTTP client for testing."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        yield client
