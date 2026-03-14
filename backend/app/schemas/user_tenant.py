"""User-Tenant association Pydantic schemas."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class UserTenantBase(BaseModel):
    """Base user-tenant association schema."""

    user_id: int = Field(..., gt=0)
    tenant_id: int = Field(..., gt=0)
    role: str = Field(default="user", min_length=1, max_length=50)


class UserTenantCreate(UserTenantBase):
    """Schema for creating a user-tenant association."""


class UserTenantUpdate(BaseModel):
    """Schema for updating a user-tenant association."""

    role: str = Field(..., min_length=1, max_length=50)


class UserTenantResponse(UserTenantBase):
    """Schema for user-tenant association response."""

    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserTenantList(BaseModel):
    """Schema for list of user-tenant associations."""

    total: int
    associations: list[UserTenantResponse]
