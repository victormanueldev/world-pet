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


class TenantPublicInfo(BaseModel):
    """Schema for public tenant information (no auth required)."""

    id: int
    name: str
    slug: str

    model_config = ConfigDict(from_attributes=True)


class TenantRegisterRequest(BaseModel):
    """Schema for tenant-specific registration (tenant from URL)."""

    email: str = Field(..., min_length=1, max_length=255)
    name: str = Field(..., min_length=1, max_length=255)
    password: str = Field(
        ...,
        min_length=8,
        description="Password must be at least 8 characters long.",
    )


class TenantRegisterResponse(BaseModel):
    """Schema for tenant-specific registration response."""

    id: int
    email: str
    name: str
    tenant_id: int
    tenant_slug: str
    tenant_name: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
