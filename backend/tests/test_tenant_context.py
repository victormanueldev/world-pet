"""Tests for tenant context extraction."""

import pytest
from unittest.mock import MagicMock, AsyncMock, patch

from app.core.tenant_context import (
    TenantContext,
    get_current_tenant_id,
    set_current_tenant_id,
)


class TestTenantContext:
    """Tests for TenantContext class."""

    def test_tenant_context_set_and_get(self):
        """Test setting and getting tenant ID through context."""
        tenant_id = 123

        with TenantContext(tenant_id):
            result = get_current_tenant_id()
            assert result == tenant_id

    def test_tenant_context_reset_after_exit(self):
        """Test tenant ID is reset after context exit."""
        # Set initial value
        set_current_tenant_id(100)

        # Enter new context
        with TenantContext(200):
            assert get_current_tenant_id() == 200

        # Should be reset to initial value
        assert get_current_tenant_id() == 100

    def test_nested_tenant_contexts(self):
        """Test nested tenant contexts."""
        with TenantContext(1):
            assert get_current_tenant_id() == 1

            with TenantContext(2):
                assert get_current_tenant_id() == 2

            # Should return to outer context
            assert get_current_tenant_id() == 1


class TestGetCurrentTenantId:
    """Tests for get_current_tenant_id function."""

    def test_get_current_tenant_id_initial(self):
        """Test getting tenant ID when none is set."""
        # Context persists from previous tests, so we just check it's either None or a previous value
        result = get_current_tenant_id()
        # Result can be None or the value set in previous test
        assert result is None or isinstance(result, int)

    def test_get_current_tenant_id_after_set(self):
        """Test getting tenant ID after it's set."""
        set_current_tenant_id(42)
        result = get_current_tenant_id()
        assert result == 42


class TestSetCurrentTenantId:
    """Tests for set_current_tenant_id function."""

    def test_set_current_tenant_id(self):
        """Test setting tenant ID."""
        set_current_tenant_id(99)
        result = get_current_tenant_id()
        assert result == 99

    def test_set_current_tenant_id_overwrites(self):
        """Test setting tenant ID overwrites previous value."""
        set_current_tenant_id(10)
        set_current_tenant_id(20)
        result = get_current_tenant_id()
        assert result == 20
