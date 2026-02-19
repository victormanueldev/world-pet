from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr, ConfigDict, Field

class UserBase(BaseModel):
    email: EmailStr
    full_name: str | None = None
    is_active: bool = True

class UserCreate(UserBase):
    password: str = Field(min_length=8)
    tenant_name: str = Field(..., min_length=1) # Name of the clinic to create

class UserUpdate(BaseModel):
    full_name: str | None = None
    password: str | None = Field(None, min_length=8)
    is_active: bool | None = None

class UserInDBBase(UserBase):
    id: UUID
    tenant_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class User(UserInDBBase):
    pass

class UserInDB(UserInDBBase):
    hashed_password: str
