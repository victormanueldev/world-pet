"""Tests for tenant service CRUD operations."""

import pytest
from unittest.mock import AsyncMock, MagicMock
from datetime import datetime

from app.services.tenant_service import (
    create_tenant,
    get_tenant_by_id,
    get_tenant_by_slug,
    update_tenant,
    delete_tenant,
    list_tenants,
    create_default_tenant,
    tenant_has_users,
)
from app.models.tenant import Tenant
from app.schemas.tenant import TenantCreate, TenantUpdate


@pytest.fixture
def mock_db():
    """Create a mock database session."""
    db = AsyncMock()
    db.add = MagicMock()
    db.commit = AsyncMock()
    db.refresh = AsyncMock()
    db.delete = AsyncMock()
    return db


@pytest.fixture
def sample_tenant():
    """Create a sample tenant object."""
    tenant = Tenant(
        id=1,
        name="Test Tenant",
        slug="test-tenant",
        settings=None,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    return tenant


class TestCreateTenant:
    """Tests for create_tenant function."""

    @pytest.mark.asyncio
    async def test_create_tenant_success(self, mock_db, sample_tenant):
        """Test successful tenant creation."""
        # Setup mock to return tenant on refresh
        mock_db.refresh = AsyncMock(side_effect=lambda t: setattr(t, "id", 1))

        tenant_data = TenantCreate(name="Test Tenant", slug="test-tenant")

        result = await create_tenant(mock_db, tenant_data)

        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()
        assert result.name == "Test Tenant"
        assert result.slug == "test-tenant"


class TestGetTenantById:
    """Tests for get_tenant_by_id function."""

    @pytest.mark.asyncio
    async def test_get_tenant_by_id_found(self, mock_db, sample_tenant):
        """Test getting tenant by ID when it exists."""
        # Setup mock result
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = sample_tenant
        mock_db.execute = AsyncMock(return_value=mock_result)

        result = await get_tenant_by_id(mock_db, 1)

        assert result is not None
        assert result.id == 1
        assert result.name == "Test Tenant"

    @pytest.mark.asyncio
    async def test_get_tenant_by_id_not_found(self, mock_db):
        """Test getting tenant by ID when it doesn't exist."""
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute = AsyncMock(return_value=mock_result)

        result = await get_tenant_by_id(mock_db, 999)

        assert result is None


class TestGetTenantBySlug:
    """Tests for get_tenant_by_slug function."""

    @pytest.mark.asyncio
    async def test_get_tenant_by_slug_found(self, mock_db, sample_tenant):
        """Test getting tenant by slug when it exists."""
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = sample_tenant
        mock_db.execute = AsyncMock(return_value=mock_result)

        result = await get_tenant_by_slug(mock_db, "test-tenant")

        assert result is not None
        assert result.slug == "test-tenant"

    @pytest.mark.asyncio
    async def test_get_tenant_by_slug_not_found(self, mock_db):
        """Test getting tenant by slug when it doesn't exist."""
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute = AsyncMock(return_value=mock_result)

        result = await get_tenant_by_slug(mock_db, "nonexistent")

        assert result is None


class TestUpdateTenant:
    """Tests for update_tenant function."""

    @pytest.mark.asyncio
    async def test_update_tenant_success(self, mock_db, sample_tenant):
        """Test successful tenant update."""
        tenant_data = TenantUpdate(name="Updated Name")

        result = await update_tenant(mock_db, sample_tenant, tenant_data)

        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once()
        assert result.name == "Updated Name"


class TestDeleteTenant:
    """Tests for delete_tenant function."""

    @pytest.mark.asyncio
    async def test_delete_tenant_success(self, mock_db, sample_tenant):
        """Test successful tenant deletion."""
        await delete_tenant(mock_db, sample_tenant)

        mock_db.delete.assert_called_once_with(sample_tenant)
        mock_db.commit.assert_called_once()


class TestListTenants:
    """Tests for list_tenants function."""

    @pytest.mark.asyncio
    async def test_list_tenants_success(self, mock_db, sample_tenant):
        """Test successful tenant listing with pagination."""
        # Setup mock for tenants
        mock_tenants_result = MagicMock()
        mock_tenants_result.scalars.return_value.all.return_value = [sample_tenant]

        # Setup mock for count
        mock_count_result = MagicMock()
        mock_count_result.scalars.return_value.all.return_value = [1]

        # Execute returns different results based on query
        async def execute_side_effect(query):
            if hasattr(query, "offset"):
                return mock_tenants_result
            return mock_count_result

        mock_db.execute = AsyncMock(side_effect=execute_side_effect)

        result, total = await list_tenants(mock_db, skip=0, limit=20)

        assert total == 1
        assert len(result) == 1


class TestCreateDefaultTenant:
    """Tests for create_default_tenant function."""

    @pytest.mark.asyncio
    async def test_create_default_tenant_not_exists(self, mock_db):
        """Test default tenant creation when it doesn't exist."""
        # Setup mock to return None (tenant doesn't exist)
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute = AsyncMock(return_value=mock_result)
        mock_db.refresh = AsyncMock()

        result = await create_default_tenant(mock_db)

        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()
        assert result.slug == "default"
        assert result.name == "Default"

    @pytest.mark.asyncio
    async def test_create_default_tenant_already_exists(self, mock_db, sample_tenant):
        """Test default tenant creation when it already exists."""
        sample_tenant.slug = "default"

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = sample_tenant
        mock_db.execute = AsyncMock(return_value=mock_result)

        result = await create_default_tenant(mock_db)

        mock_db.add.assert_not_called()
        assert result.slug == "default"


class TestTenantHasUsers:
    """Tests for tenant_has_users function."""

    @pytest.mark.asyncio
    async def test_tenant_has_users_true(self, mock_db):
        """Test tenant has users returns True."""
        mock_result = MagicMock()
        mock_result.scalar.return_value = 5
        mock_db.execute = AsyncMock(return_value=mock_result)

        result = await tenant_has_users(mock_db, 1)

        assert result is True

    @pytest.mark.asyncio
    async def test_tenant_has_users_false(self, mock_db):
        """Test tenant has users returns False."""
        mock_result = MagicMock()
        mock_result.scalar.return_value = 0
        mock_db.execute = AsyncMock(return_value=mock_result)

        result = await tenant_has_users(mock_db, 1)

        assert result is False
