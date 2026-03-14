"""Unit tests for auth dependencies."""

from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

from app.core.security import TokenPayload, create_access_token
from app.dependencies.auth import (
    get_authenticated_tenant_id,
    get_current_active_user,
    get_current_user,
    get_token_payload,
    require_role,
)
from app.models.user import User
from app.models.user_tenant import UserTenant


class TestGetCurrentUser:
    """Tests for get_current_user dependency."""

    @pytest.mark.asyncio
    async def test_no_credentials_raises_401(self) -> None:
        """Test that missing credentials raises 401."""
        db = AsyncMock()

        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(credentials=None, db=db)

        assert exc_info.value.status_code == 401
        assert exc_info.value.detail == "Not authenticated"

    @pytest.mark.asyncio
    async def test_invalid_token_raises_401(self) -> None:
        """Test that invalid token raises 401."""
        db = AsyncMock()
        credentials = HTTPAuthorizationCredentials(
            scheme="Bearer", credentials="invalid-token"
        )

        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(credentials=credentials, db=db)

        assert exc_info.value.status_code == 401
        assert exc_info.value.detail == "Invalid token"

    @pytest.mark.asyncio
    async def test_expired_token_raises_401(self) -> None:
        """Test that expired token raises 401."""
        from datetime import timedelta

        db = AsyncMock()
        token = create_access_token(
            user_id=1, tenant_id=1, role="user", expires_delta=timedelta(seconds=-1)
        )
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)

        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(credentials=credentials, db=db)

        assert exc_info.value.status_code == 401
        assert exc_info.value.detail == "Token expired"

    @pytest.mark.asyncio
    async def test_user_not_found_raises_401(self) -> None:
        """Test that non-existent user raises 401."""
        db = AsyncMock()
        # Mock the execute to return None for user
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        db.execute = AsyncMock(return_value=mock_result)

        token = create_access_token(user_id=999, tenant_id=1, role="user")
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)

        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(credentials=credentials, db=db)

        assert exc_info.value.status_code == 401
        assert exc_info.value.detail == "User not found"

    @pytest.mark.asyncio
    async def test_valid_token_returns_user(self) -> None:
        """Test that valid token returns user."""
        db = AsyncMock()
        mock_user = MagicMock(spec=User)
        mock_user.id = 1
        mock_user.email = "test@example.com"

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_user
        db.execute = AsyncMock(return_value=mock_result)

        token = create_access_token(user_id=1, tenant_id=1, role="user")
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)

        result = await get_current_user(credentials=credentials, db=db)

        assert result == mock_user


class TestGetCurrentActiveUser:
    """Tests for get_current_active_user dependency."""

    @pytest.mark.asyncio
    async def test_inactive_user_raises_401(self) -> None:
        """Test that inactive user raises 401."""
        mock_user = MagicMock(spec=User)
        mock_user.is_active = False

        with pytest.raises(HTTPException) as exc_info:
            await get_current_active_user(current_user=mock_user)

        assert exc_info.value.status_code == 401
        assert exc_info.value.detail == "Account disabled"

    @pytest.mark.asyncio
    async def test_active_user_returns_user(self) -> None:
        """Test that active user is returned."""
        mock_user = MagicMock(spec=User)
        mock_user.is_active = True

        result = await get_current_active_user(current_user=mock_user)

        assert result == mock_user


class TestGetAuthenticatedTenantId:
    """Tests for get_authenticated_tenant_id dependency."""

    @pytest.mark.asyncio
    async def test_no_credentials_raises_401(self) -> None:
        """Test that missing credentials raises 401."""
        db = AsyncMock()

        with pytest.raises(HTTPException) as exc_info:
            await get_authenticated_tenant_id(credentials=None, db=db, x_tenant_id=None)

        assert exc_info.value.status_code == 401

    @pytest.mark.asyncio
    async def test_uses_token_tenant_id_when_no_header(self) -> None:
        """Test that token tenant_id is used when no header provided."""
        db = AsyncMock()
        mock_user_tenant = MagicMock(spec=UserTenant)
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_user_tenant
        db.execute = AsyncMock(return_value=mock_result)

        token = create_access_token(user_id=1, tenant_id=42, role="user")
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)

        result = await get_authenticated_tenant_id(
            credentials=credentials, db=db, x_tenant_id=None
        )

        assert result == 42

    @pytest.mark.asyncio
    async def test_header_overrides_token_tenant(self) -> None:
        """Test that X-Tenant-ID header overrides token tenant."""
        db = AsyncMock()
        mock_user_tenant = MagicMock(spec=UserTenant)
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_user_tenant
        db.execute = AsyncMock(return_value=mock_result)

        token = create_access_token(user_id=1, tenant_id=42, role="user")
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)

        result = await get_authenticated_tenant_id(
            credentials=credentials, db=db, x_tenant_id="99"
        )

        assert result == 99

    @pytest.mark.asyncio
    async def test_invalid_tenant_id_format_raises_400(self) -> None:
        """Test that invalid tenant ID format raises 400."""
        db = AsyncMock()
        token = create_access_token(user_id=1, tenant_id=1, role="user")
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)

        with pytest.raises(HTTPException) as exc_info:
            await get_authenticated_tenant_id(
                credentials=credentials, db=db, x_tenant_id="not-an-int"
            )

        assert exc_info.value.status_code == 400
        assert exc_info.value.detail == "Invalid tenant ID format"

    @pytest.mark.asyncio
    async def test_no_access_to_tenant_raises_403(self) -> None:
        """Test that no access to tenant raises 403."""
        db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None  # No user-tenant association
        db.execute = AsyncMock(return_value=mock_result)

        token = create_access_token(user_id=1, tenant_id=42, role="user")
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)

        with pytest.raises(HTTPException) as exc_info:
            await get_authenticated_tenant_id(
                credentials=credentials, db=db, x_tenant_id=None
            )

        assert exc_info.value.status_code == 403
        assert exc_info.value.detail == "Tenant access denied"


class TestGetTokenPayload:
    """Tests for get_token_payload dependency."""

    @pytest.mark.asyncio
    async def test_no_credentials_raises_401(self) -> None:
        """Test that missing credentials raises 401."""
        with pytest.raises(HTTPException) as exc_info:
            await get_token_payload(credentials=None)

        assert exc_info.value.status_code == 401

    @pytest.mark.asyncio
    async def test_valid_token_returns_payload(self) -> None:
        """Test that valid token returns payload."""
        token = create_access_token(user_id=42, tenant_id=10, role="admin")
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)

        result = await get_token_payload(credentials=credentials)

        assert isinstance(result, TokenPayload)
        assert result.user_id == 42
        assert result.tenant_id == 10
        assert result.role == "admin"


class TestRequireRole:
    """Tests for require_role dependency factory."""

    def test_require_role_creates_dependency(self) -> None:
        """Test that require_role creates a callable dependency."""
        dependency = require_role("admin")
        assert callable(dependency)

    def test_require_role_accepts_string(self) -> None:
        """Test that require_role accepts a single role string."""
        dependency = require_role("admin")
        assert dependency is not None

    def test_require_role_accepts_list(self) -> None:
        """Test that require_role accepts a list of roles."""
        dependency = require_role(["admin", "moderator"])
        assert dependency is not None
