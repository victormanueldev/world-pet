"""Authentication Pydantic schemas."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class LoginRequest(BaseModel):
    """Schema for login request."""

    email: EmailStr
    password: str = Field(..., min_length=1)
    tenant_id: int | None = Field(
        default=None,
        description="Tenant ID to login to. Required if user belongs to multiple tenants.",
    )


class TenantInfo(BaseModel):
    """Schema for tenant information in login response."""

    id: int
    name: str
    slug: str = ""
    role: str


class LoginUserInfo(BaseModel):
    """Schema for user information in login response."""

    id: int
    email: str
    name: str
    role: str
    tenant_id: int | None
    tenants: list[TenantInfo] = []

    model_config = ConfigDict(from_attributes=True)


class LoginResponse(BaseModel):
    """Schema for login response."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: LoginUserInfo


class LoginTenantSelectionRequired(BaseModel):
    """Schema for response when tenant selection is required."""

    detail: str = "Tenant selection required"
    available_tenants: list[TenantInfo]


class RegisterRequest(BaseModel):
    """Schema for registration request."""

    email: EmailStr
    name: str = Field(..., min_length=1, max_length=255)
    password: str = Field(
        ...,
        min_length=8,
        description="Password must be at least 8 characters long.",
    )
    tenant_id: int = Field(..., gt=0, description="Tenant ID to register user with.")


class RegisterResponse(BaseModel):
    """Schema for registration response."""

    id: int
    email: str
    name: str
    tenant_id: int | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenRefreshRequest(BaseModel):
    """Schema for token refresh request."""

    refresh_token: str


class TokenRefreshResponse(BaseModel):
    """Schema for token refresh response."""

    access_token: str
    token_type: str = "bearer"


class UserProfile(BaseModel):
    """Schema for user profile response (GET /auth/me)."""

    id: int
    email: str
    name: str
    role: str
    tenant_id: int | None
    is_active: bool
    created_at: datetime
    last_login: datetime | None
    tenants: list[TenantInfo] = []

    model_config = ConfigDict(from_attributes=True)


class UserTenantInfo(BaseModel):
    """Schema for user's tenant information including role."""

    tenant_id: int
    tenant_name: str
    role: str


class UserTenantsResponse(BaseModel):
    """Schema for user's accessible tenants response."""

    tenants: list[UserTenantInfo]
