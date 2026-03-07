"""Tenant Pydantic schemas."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class TenantBase(BaseModel):
    """Base tenant schema."""

    name: str = Field(..., min_length=1, max_length=255)
    slug: str = Field(..., min_length=1, max_length=100)
    settings: str | None = None


class TenantCreate(TenantBase):
    """Schema for creating a tenant."""


class TenantUpdate(BaseModel):
    """Schema for updating a tenant."""

    name: str | None = Field(None, min_length=1, max_length=255)
    settings: str | None = None


class TenantResponse(TenantBase):
    """Schema for tenant response."""

    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TenantList(BaseModel):
    """Schema for paginated tenant list."""

    total: int
    tenants: list[TenantResponse]
