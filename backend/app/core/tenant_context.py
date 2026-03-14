"""Tenant context for request-scoped tenant identification."""

from contextvars import ContextVar

tenant_context: ContextVar[int | None] = ContextVar("tenant_id", default=None)


class TenantContext:
    """Context manager for tenant ID in request scope."""

    def __init__(self, tenant_id: int) -> None:
        self.tenant_id = tenant_id
        self.token: str | None = None

    def __enter__(self) -> "TenantContext":
        self.token = tenant_context.set(self.tenant_id)  # type: ignore[assignment]
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:  # type: ignore[no-untyped-def]
        if self.token is not None:
            tenant_context.reset(self.token)  # type: ignore[arg-type]


def get_current_tenant_id() -> int | None:
    """Get the current tenant ID from context."""
    return tenant_context.get()


def set_current_tenant_id(tenant_id: int) -> None:
    """Set the current tenant ID in context."""
    tenant_context.set(tenant_id)
