"""Integration tests for multi-tenant user access."""

from unittest.mock import AsyncMock, MagicMock

import pytest

from app.models.user_tenant import UserTenant
from app.services import user_service


class TestUserTenantAssociation:
    """Tests for user-tenant association management."""

    @pytest.mark.asyncio
    async def test_add_user_to_tenant(self):
        """Test adding a user to a tenant."""
        mock_db = AsyncMock()
        mock_db.add = MagicMock()
        mock_db.commit = AsyncMock()
        mock_db.refresh = AsyncMock()

        await user_service.add_user_to_tenant(
            mock_db, user_id=1, tenant_id=1, role="user"
        )

        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_remove_user_from_tenant(self):
        """Test removing a user from a tenant."""
        mock_db = AsyncMock()

        # Setup mock to return an association
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = UserTenant(
            id=1,
            user_id=1,
            tenant_id=1,
            role="user",
            created_at=None,
        )
        mock_db.execute = AsyncMock(return_value=mock_result)
        mock_db.delete = AsyncMock()
        mock_db.commit = AsyncMock()

        result = await user_service.remove_user_from_tenant(
            mock_db, user_id=1, tenant_id=1
        )

        assert result is True
        mock_db.delete.assert_called_once()

    @pytest.mark.asyncio
    async def test_remove_user_from_tenant_not_found(self):
        """Test removing a user from a tenant when not associated."""
        mock_db = AsyncMock()

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute = AsyncMock(return_value=mock_result)

        result = await user_service.remove_user_from_tenant(
            mock_db, user_id=1, tenant_id=1
        )

        assert result is False

    @pytest.mark.asyncio
    async def test_get_user_tenants(self):
        """Test getting all tenants for a user."""
        mock_db = AsyncMock()

        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = [
            UserTenant(id=1, user_id=1, tenant_id=1, role="admin", created_at=None),
            UserTenant(id=2, user_id=1, tenant_id=2, role="user", created_at=None),
        ]
        mock_db.execute = AsyncMock(return_value=mock_result)

        result = await user_service.get_user_tenants(mock_db, user_id=1)

        assert len(result) == 2

    @pytest.mark.asyncio
    async def test_user_has_tenant_access(self):
        """Test checking if user has access to tenant."""
        mock_db = AsyncMock()

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = UserTenant(
            id=1, user_id=1, tenant_id=1, role="admin", created_at=None
        )
        mock_db.execute = AsyncMock(return_value=mock_result)

        result = await user_service.user_has_tenant_access(
            mock_db, user_id=1, tenant_id=1
        )

        assert result is True

    @pytest.mark.asyncio
    async def test_user_has_tenant_access_denied(self):
        """Test checking if user has access to tenant they don't belong to."""
        mock_db = AsyncMock()

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute = AsyncMock(return_value=mock_result)

        result = await user_service.user_has_tenant_access(
            mock_db, user_id=1, tenant_id=999
        )

        assert result is False

    @pytest.mark.asyncio
    async def test_get_user_role_in_tenant(self):
        """Test getting user's role in a specific tenant."""
        mock_db = AsyncMock()

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = UserTenant(
            id=1, user_id=1, tenant_id=1, role="admin", created_at=None
        )
        mock_db.execute = AsyncMock(return_value=mock_result)

        result = await user_service.get_user_role_in_tenant(
            mock_db, user_id=1, tenant_id=1
        )

        assert result == "admin"

    @pytest.mark.asyncio
    async def test_get_user_role_in_tenant_no_access(self):
        """Test getting user's role when they don't have access."""
        mock_db = AsyncMock()

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute = AsyncMock(return_value=mock_result)

        result = await user_service.get_user_role_in_tenant(
            mock_db, user_id=1, tenant_id=999
        )

        assert result is None


class TestMultiTenantUserQueries:
    """Tests for user queries with multi-tenant context."""

    def test_list_users_requires_tenant(self):
        """list_users should require tenant_id."""
        import inspect

        from app.services import user_service

        sig = inspect.signature(user_service.list_users)
        params = list(sig.parameters.keys())

        assert "tenant_id" in params

    def test_get_user_by_email_requires_tenant(self):
        """get_user_by_email should require tenant_id."""
        import inspect

        from app.services import user_service

        sig = inspect.signature(user_service.get_user_by_email)
        params = list(sig.parameters.keys())

        assert "tenant_id" in params

    def test_create_user_requires_tenant(self):
        """create_user should require tenant_id."""
        import inspect

        from app.services import user_service

        sig = inspect.signature(user_service.create_user)
        params = list(sig.parameters.keys())

        assert "tenant_id" in params
