"""Tests for tenant public endpoints."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.models.tenant import Tenant
from app.models.user import User


class TestGetTenantBySlug:
    """Tests for GET /tenants/{slug} public endpoint."""

    @pytest.mark.asyncio
    async def test_get_tenant_by_slug_success(self) -> None:
        """Test successful tenant retrieval by slug."""
        from app.db.session import get_db

        mock_db = AsyncMock()

        async def mock_get_db_override():
            yield mock_db

        app.dependency_overrides[get_db] = mock_get_db_override

        try:
            # Mock tenant
            mock_tenant = MagicMock(spec=Tenant)
            mock_tenant.id = 1
            mock_tenant.name = "Happy Paws Clinic"
            mock_tenant.slug = "happy-paws"

            mock_result = MagicMock()
            mock_result.scalar_one_or_none.return_value = mock_tenant
            mock_db.execute = AsyncMock(return_value=mock_result)

            async with AsyncClient(
                transport=ASGITransport(app=app), base_url="http://test"
            ) as client:
                response = await client.get("/api/v1/tenants/happy-paws")

            assert response.status_code == 200
            data = response.json()
            assert data["id"] == 1
            assert data["name"] == "Happy Paws Clinic"
            assert data["slug"] == "happy-paws"
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_get_tenant_by_slug_not_found(self) -> None:
        """Test 404 when tenant slug doesn't exist."""
        from app.db.session import get_db

        mock_db = AsyncMock()

        async def mock_get_db_override():
            yield mock_db

        app.dependency_overrides[get_db] = mock_get_db_override

        try:
            mock_result = MagicMock()
            mock_result.scalar_one_or_none.return_value = None
            mock_db.execute = AsyncMock(return_value=mock_result)

            async with AsyncClient(
                transport=ASGITransport(app=app), base_url="http://test"
            ) as client:
                response = await client.get("/api/v1/tenants/non-existent")

            assert response.status_code == 404
            assert "Clinic not found" in response.json()["detail"]
        finally:
            app.dependency_overrides.clear()


class TestTenantRegistration:
    """Tests for POST /tenants/{slug}/register endpoint."""

    @pytest.mark.asyncio
    async def test_register_at_tenant_success(self) -> None:
        """Test successful registration at specific tenant."""
        from app.db.session import get_db

        mock_db = AsyncMock()

        async def mock_get_db_override():
            yield mock_db

        app.dependency_overrides[get_db] = mock_get_db_override

        try:
            # Mock tenant
            mock_tenant = MagicMock(spec=Tenant)
            mock_tenant.id = 1
            mock_tenant.name = "Happy Paws Clinic"
            mock_tenant.slug = "happy-paws"
            mock_tenant.created_at = "2024-01-01T00:00:00"
            mock_tenant.updated_at = "2024-01-01T00:00:00"

            # Mock tenant lookup (first call for existence check)
            mock_result = MagicMock()
            mock_result.scalar_one_or_none.return_value = mock_tenant
            mock_db.execute = AsyncMock(return_value=mock_result)

            # Mock auth service
            with patch("app.api.v1.endpoints.tenants.auth_service") as mock_auth:
                mock_user = MagicMock(spec=User)
                mock_user.id = 1
                mock_user.email = "new@example.com"
                mock_user.name = "New User"
                mock_user.tenant_id = 1
                mock_user.created_at = "2024-01-01T00:00:00"
                mock_user.last_login = None
                mock_user.is_active = True
                mock_user.password_hash = "$2b$12$test"

                mock_auth.get_user_by_email = AsyncMock(return_value=None)
                mock_auth.register_user = AsyncMock(return_value=mock_user)

                async with AsyncClient(
                    transport=ASGITransport(app=app), base_url="http://test"
                ) as client:
                    response = await client.post(
                        "/api/v1/tenants/happy-paws/register",
                        json={
                            "email": "new@example.com",
                            "name": "New User",
                            "password": "securepass123",
                        },
                    )

                assert response.status_code == 201
                data = response.json()
                assert data["email"] == "new@example.com"
                assert data["tenant_id"] == 1
                assert data["tenant_slug"] == "happy-paws"
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_register_at_tenant_tenant_not_found(self) -> None:
        """Test 404 when registering at non-existent tenant."""
        from app.db.session import get_db

        mock_db = AsyncMock()

        async def mock_get_db_override():
            yield mock_db

        app.dependency_overrides[get_db] = mock_get_db_override

        try:
            mock_result = MagicMock()
            mock_result.scalar_one_or_none.return_value = None
            mock_db.execute = AsyncMock(return_value=mock_result)

            async with AsyncClient(
                transport=ASGITransport(app=app), base_url="http://test"
            ) as client:
                response = await client.post(
                    "/api/v1/tenants/non-existent/register",
                    json={
                        "email": "new@example.com",
                        "name": "New User",
                        "password": "securepass123",
                    },
                )

            assert response.status_code == 404
            assert "Clinic not found" in response.json()["detail"]
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_register_at_tenant_email_exists(self) -> None:
        """Test 400 when email already registered."""
        from app.db.session import get_db

        mock_db = AsyncMock()

        async def mock_get_db_override():
            yield mock_db

        app.dependency_overrides[get_db] = mock_get_db_override

        try:
            # Mock tenant
            mock_tenant = MagicMock(spec=Tenant)
            mock_tenant.id = 1
            mock_tenant.name = "Happy Paws Clinic"
            mock_tenant.slug = "happy-paws"

            mock_result = MagicMock()
            mock_result.scalar_one_or_none.return_value = mock_tenant
            mock_db.execute = AsyncMock(return_value=mock_result)

            with patch("app.api.v1.endpoints.tenants.auth_service") as mock_auth:
                # Mock existing user
                mock_existing_user = MagicMock(spec=User)
                mock_auth.get_user_by_email = AsyncMock(return_value=mock_existing_user)

                async with AsyncClient(
                    transport=ASGITransport(app=app), base_url="http://test"
                ) as client:
                    response = await client.post(
                        "/api/v1/tenants/happy-paws/register",
                        json={
                            "email": "existing@example.com",
                            "name": "New User",
                            "password": "securepass123",
                        },
                    )

                assert response.status_code == 400
                assert "already registered" in response.json()["detail"]
        finally:
            app.dependency_overrides.clear()
