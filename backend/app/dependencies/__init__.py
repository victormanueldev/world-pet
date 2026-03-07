"""FastAPI dependencies."""

from app.dependencies.tenant import get_current_tenant_id, get_optional_tenant_id

__all__ = ["get_current_tenant_id", "get_optional_tenant_id"]
