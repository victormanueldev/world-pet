"""Unit tests for auth service."""

import pytest
from datetime import datetime
from unittest.mock import AsyncMock, MagicMock, patch

from app.services.auth_service import (
    get_user_by_email,
    authenticate_user,
    register_user,
    update_last_login,
    get_user_tenant_associations,
    get_user_role_in_tenant,
)
from app.models.user import User
from app.models.user_tenant import UserTenant


class TestGetUserByEmail:
    """Tests for get_user_by_email function."""

    @pytest.mark.asyncio
    async def test_returns_user_when_found(self) -> None:
        """Test that user is returned when found."""
        db = AsyncMock()
        mock_user = MagicMock(spec=User)
        mock_user.email = "test@example.com"

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_user
        db.execute = AsyncMock(return_value=mock_result)

        result = await get_user_by_email(db, "test@example.com")

        assert result == mock_user

    @pytest.mark.asyncio
    async def test_returns_none_when_not_found(self) -> None:
        """Test that None is returned when user not found."""
        db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        db.execute = AsyncMock(return_value=mock_result)

        result = await get_user_by_email(db, "notfound@example.com")

        assert result is None


class TestAuthenticateUser:
    """Tests for authenticate_user function."""

    @pytest.mark.asyncio
    async def test_returns_none_when_user_not_found(self) -> None:
        """Test that None is returned when user doesn't exist."""
        db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        db.execute = AsyncMock(return_value=mock_result)

        result = await authenticate_user(db, "notfound@example.com", "password")

        assert result is None

    @pytest.mark.asyncio
    async def test_returns_none_when_password_wrong(self) -> None:
        """Test that None is returned when password is wrong."""
        from app.core.security import hash_password

        db = AsyncMock()
        mock_user = MagicMock(spec=User)
        mock_user.email = "test@example.com"
        mock_user.password_hash = hash_password("correct_password")

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_user
        db.execute = AsyncMock(return_value=mock_result)

        result = await authenticate_user(db, "test@example.com", "wrong_password")

        assert result is None

    @pytest.mark.asyncio
    async def test_returns_user_when_credentials_valid(self) -> None:
        """Test that user is returned when credentials are valid."""
        from app.core.security import hash_password

        db = AsyncMock()
        mock_user = MagicMock(spec=User)
        mock_user.email = "test@example.com"
        mock_user.password_hash = hash_password("correct_password")

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_user
        db.execute = AsyncMock(return_value=mock_result)

        result = await authenticate_user(db, "test@example.com", "correct_password")

        assert result == mock_user


class TestRegisterUser:
    """Tests for register_user function."""

    @pytest.mark.asyncio
    async def test_creates_user_with_hashed_password(self) -> None:
        """Test that user is created with hashed password."""
        db = AsyncMock()
        db.add = MagicMock()
        db.flush = AsyncMock()
        db.commit = AsyncMock()
        db.refresh = AsyncMock()

        # Mock the user ID assignment that happens on flush
        original_add = db.add

        def add_side_effect(obj):
            if isinstance(obj, User):
                obj.id = 1

        db.add = MagicMock(side_effect=add_side_effect)

        result = await register_user(
            db,
            email="new@example.com",
            name="New User",
            password="password123",
            tenant_id=1,
            role="user",
        )

        # Verify user was created
        assert result.email == "new@example.com"
        assert result.name == "New User"
        assert result.password_hash != "password123"  # Should be hashed
        assert result.password_hash.startswith("$2b$")  # bcrypt hash
        assert result.is_active is True

    @pytest.mark.asyncio
    async def test_creates_user_tenant_association(self) -> None:
        """Test that user-tenant association is created."""
        db = AsyncMock()
        added_objects = []

        def track_add(obj):
            if isinstance(obj, User):
                obj.id = 1
            added_objects.append(obj)

        db.add = MagicMock(side_effect=track_add)
        db.flush = AsyncMock()
        db.commit = AsyncMock()
        db.refresh = AsyncMock()

        await register_user(
            db,
            email="new@example.com",
            name="New User",
            password="password123",
            tenant_id=5,
            role="admin",
        )

        # Verify both user and user_tenant were added
        assert len(added_objects) == 2
        user_tenant = added_objects[1]
        assert isinstance(user_tenant, UserTenant)
        assert user_tenant.tenant_id == 5
        assert user_tenant.role == "admin"


class TestUpdateLastLogin:
    """Tests for update_last_login function."""

    @pytest.mark.asyncio
    async def test_updates_last_login_timestamp(self) -> None:
        """Test that last_login is updated."""
        db = AsyncMock()
        db.commit = AsyncMock()
        db.refresh = AsyncMock()

        mock_user = MagicMock(spec=User)
        mock_user.last_login = None

        before = datetime.utcnow()
        await update_last_login(db, mock_user)
        after = datetime.utcnow()

        # Verify timestamp was set
        assert mock_user.last_login is not None
        assert before <= mock_user.last_login <= after


class TestGetUserTenantAssociations:
    """Tests for get_user_tenant_associations function."""

    @pytest.mark.asyncio
    async def test_returns_list_of_associations(self) -> None:
        """Test that list of associations is returned."""
        db = AsyncMock()
        mock_associations = [
            MagicMock(spec=UserTenant, tenant_id=1, role="admin"),
            MagicMock(spec=UserTenant, tenant_id=2, role="user"),
        ]

        mock_result = MagicMock()
        mock_scalars = MagicMock()
        mock_scalars.all.return_value = mock_associations
        mock_result.scalars.return_value = mock_scalars
        db.execute = AsyncMock(return_value=mock_result)

        result = await get_user_tenant_associations(db, user_id=1)

        assert len(result) == 2
        assert result[0].tenant_id == 1
        assert result[1].tenant_id == 2

    @pytest.mark.asyncio
    async def test_returns_empty_list_when_no_associations(self) -> None:
        """Test that empty list is returned when no associations."""
        db = AsyncMock()
        mock_result = MagicMock()
        mock_scalars = MagicMock()
        mock_scalars.all.return_value = []
        mock_result.scalars.return_value = mock_scalars
        db.execute = AsyncMock(return_value=mock_result)

        result = await get_user_tenant_associations(db, user_id=1)

        assert result == []


class TestGetUserRoleInTenant:
    """Tests for get_user_role_in_tenant function."""

    @pytest.mark.asyncio
    async def test_returns_role_when_association_exists(self) -> None:
        """Test that role is returned when association exists."""
        db = AsyncMock()
        mock_association = MagicMock(spec=UserTenant)
        mock_association.role = "admin"

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_association
        db.execute = AsyncMock(return_value=mock_result)

        result = await get_user_role_in_tenant(db, user_id=1, tenant_id=1)

        assert result == "admin"

    @pytest.mark.asyncio
    async def test_returns_none_when_no_association(self) -> None:
        """Test that None is returned when no association."""
        db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        db.execute = AsyncMock(return_value=mock_result)

        result = await get_user_role_in_tenant(db, user_id=1, tenant_id=1)

        assert result is None
