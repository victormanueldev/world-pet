"""Integration tests for auth endpoints."""

import pytest
from httpx import ASGITransport, AsyncClient
from unittest.mock import AsyncMock, MagicMock, patch

from app.main import app
from app.core.security import create_access_token, create_refresh_token
from app.models.user import User
from app.models.tenant import Tenant
from app.models.user_tenant import UserTenant


class TestRegisterEndpoint:
    """Tests for POST /auth/register endpoint."""

    @pytest.mark.asyncio
    async def test_register_success(self) -> None:
        """Test successful user registration."""
        with (
            patch("app.api.v1.endpoints.auth.auth_service") as mock_service,
            patch("app.api.v1.endpoints.auth.get_db") as mock_get_db,
        ):
            # Setup mocks
            mock_db = AsyncMock()
            mock_get_db.return_value = mock_db

            # Mock get_user_by_email to return None (email not taken)
            mock_service.get_user_by_email = AsyncMock(return_value=None)

            # Mock tenant existence check
            mock_tenant = MagicMock(spec=Tenant)
            mock_tenant.id = 1
            mock_tenant.name = "Test Tenant"
            mock_result = MagicMock()
            mock_result.scalar_one_or_none.return_value = mock_tenant
            mock_db.execute = AsyncMock(return_value=mock_result)

            # Mock register_user
            mock_user = MagicMock(spec=User)
            mock_user.id = 1
            mock_user.email = "new@example.com"
            mock_user.name = "New User"
            mock_user.tenant_id = 1
            mock_user.created_at = "2024-01-01T00:00:00"
            mock_service.register_user = AsyncMock(return_value=mock_user)

            async with AsyncClient(
                transport=ASGITransport(app=app), base_url="http://test"
            ) as client:
                response = await client.post(
                    "/api/v1/auth/register",
                    json={
                        "email": "new@example.com",
                        "name": "New User",
                        "password": "securepassword123",
                        "tenant_id": 1,
                    },
                )

            assert response.status_code == 201
            data = response.json()
            assert data["email"] == "new@example.com"

    @pytest.mark.asyncio
    async def test_register_email_already_exists(self) -> None:
        """Test registration fails when email already exists."""
        with (
            patch("app.api.v1.endpoints.auth.auth_service") as mock_service,
            patch("app.api.v1.endpoints.auth.get_db") as mock_get_db,
        ):
            mock_db = AsyncMock()
            mock_get_db.return_value = mock_db

            # Mock existing user
            mock_user = MagicMock(spec=User)
            mock_service.get_user_by_email = AsyncMock(return_value=mock_user)

            async with AsyncClient(
                transport=ASGITransport(app=app), base_url="http://test"
            ) as client:
                response = await client.post(
                    "/api/v1/auth/register",
                    json={
                        "email": "existing@example.com",
                        "name": "User",
                        "password": "password123",
                        "tenant_id": 1,
                    },
                )

            assert response.status_code == 400
            assert "already registered" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_register_password_too_short(self) -> None:
        """Test registration fails with short password."""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.post(
                "/api/v1/auth/register",
                json={
                    "email": "new@example.com",
                    "name": "User",
                    "password": "short",  # Less than 8 chars
                    "tenant_id": 1,
                },
            )

        assert response.status_code == 422  # Validation error


class TestLoginEndpoint:
    """Tests for POST /auth/login endpoint."""

    @pytest.mark.asyncio
    async def test_login_invalid_credentials(self) -> None:
        """Test login fails with invalid credentials."""
        with (
            patch("app.api.v1.endpoints.auth.auth_service") as mock_service,
            patch("app.api.v1.endpoints.auth.get_db") as mock_get_db,
        ):
            mock_db = AsyncMock()
            mock_get_db.return_value = mock_db

            # Mock failed authentication
            mock_service.authenticate_user = AsyncMock(return_value=None)

            async with AsyncClient(
                transport=ASGITransport(app=app), base_url="http://test"
            ) as client:
                response = await client.post(
                    "/api/v1/auth/login",
                    json={
                        "email": "user@example.com",
                        "password": "wrongpassword",
                    },
                )

            assert response.status_code == 401
            assert "Invalid credentials" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_login_inactive_account(self) -> None:
        """Test login fails with inactive account."""
        with (
            patch("app.api.v1.endpoints.auth.auth_service") as mock_service,
            patch("app.api.v1.endpoints.auth.get_db") as mock_get_db,
        ):
            mock_db = AsyncMock()
            mock_get_db.return_value = mock_db

            # Mock user with inactive account
            mock_user = MagicMock(spec=User)
            mock_user.is_active = False
            mock_service.authenticate_user = AsyncMock(return_value=mock_user)

            async with AsyncClient(
                transport=ASGITransport(app=app), base_url="http://test"
            ) as client:
                response = await client.post(
                    "/api/v1/auth/login",
                    json={
                        "email": "user@example.com",
                        "password": "password123",
                    },
                )

            assert response.status_code == 401
            assert "disabled" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_login_success_single_tenant(self) -> None:
        """Test successful login with single tenant."""
        with (
            patch("app.api.v1.endpoints.auth.auth_service") as mock_service,
            patch("app.api.v1.endpoints.auth.get_db") as mock_get_db,
        ):
            mock_db = AsyncMock()
            mock_get_db.return_value = mock_db

            # Mock successful authentication
            mock_user = MagicMock(spec=User)
            mock_user.id = 1
            mock_user.is_active = True
            mock_service.authenticate_user = AsyncMock(return_value=mock_user)

            # Mock single tenant association
            mock_association = MagicMock(spec=UserTenant)
            mock_association.tenant_id = 1
            mock_association.role = "admin"
            mock_service.get_user_tenant_associations = AsyncMock(
                return_value=[mock_association]
            )

            mock_service.update_last_login = AsyncMock(return_value=mock_user)

            async with AsyncClient(
                transport=ASGITransport(app=app), base_url="http://test"
            ) as client:
                response = await client.post(
                    "/api/v1/auth/login",
                    json={
                        "email": "user@example.com",
                        "password": "password123",
                    },
                )

            assert response.status_code == 200
            data = response.json()
            assert "access_token" in data
            assert "refresh_token" in data
            assert data["token_type"] == "bearer"


class TestRefreshEndpoint:
    """Tests for POST /auth/refresh endpoint."""

    @pytest.mark.asyncio
    async def test_refresh_invalid_token(self) -> None:
        """Test refresh fails with invalid token."""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.post(
                "/api/v1/auth/refresh",
                json={"refresh_token": "invalid-token"},
            )

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_refresh_with_access_token_fails(self) -> None:
        """Test refresh fails when using access token instead of refresh."""
        # Create an access token (wrong type)
        access_token = create_access_token(user_id=1, tenant_id=1, role="user")

        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.post(
                "/api/v1/auth/refresh",
                json={"refresh_token": access_token},
            )

        assert response.status_code == 401


class TestMeEndpoint:
    """Tests for GET /auth/me endpoint."""

    @pytest.mark.asyncio
    async def test_me_without_token(self) -> None:
        """Test /me endpoint without token returns 401."""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.get("/api/v1/auth/me")

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_me_with_invalid_token(self) -> None:
        """Test /me endpoint with invalid token returns 401."""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.get(
                "/api/v1/auth/me",
                headers={"Authorization": "Bearer invalid-token"},
            )

        assert response.status_code == 401
