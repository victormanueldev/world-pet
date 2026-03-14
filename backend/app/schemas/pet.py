"""Pet Pydantic schemas."""

from datetime import date, datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


# Enums
PetSpecies = Literal["dog", "cat", "bird", "rabbit", "other"]
PetSex = Literal["male", "female", "unknown"]
PetStatus = Literal["available_for_adoption", "owned", "inactive"]


# Base schemas
class PetBase(BaseModel):
    """Base pet schema with common fields."""

    name: str = Field(..., min_length=1, max_length=100)
    species: PetSpecies
    breed: Optional[str] = Field(None, max_length=100)
    sex: PetSex
    birth_date: Optional[date] = None
    weight: Optional[float] = Field(None, gt=0, le=999.99)
    sterilized: bool = False


class PetCreate(PetBase):
    """Schema for creating a pet."""

    photo_key: Optional[str] = None
    owner_id: Optional[int] = None
    status: Optional[PetStatus] = "owned"


class PetUpdate(BaseModel):
    """Schema for updating a pet."""

    name: Optional[str] = Field(None, min_length=1, max_length=100)
    breed: Optional[str] = Field(None, max_length=100)
    sex: Optional[PetSex] = None
    birth_date: Optional[date] = None
    weight: Optional[float] = Field(None, gt=0, le=999.99)
    sterilized: Optional[bool] = None
    photo_key: Optional[str] = None
    status: Optional[PetStatus] = None


class PetResponse(PetBase):
    """Schema for pet response."""

    id: int
    tenant_id: int
    owner_id: Optional[int] = None
    status: PetStatus
    photo_url: Optional[str] = None
    photo_key: Optional[str] = None
    adopted_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    created_by: int
    updated_by: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


class PetDetailResponse(PetResponse):
    """Extended pet response with owner information."""

    owner: Optional[dict] = None  # Contains id, name, email if owner exists


class PaginatedPetResponse(BaseModel):
    """Schema for paginated pet list."""

    items: list[PetResponse]
    total: int
    page: int
    limit: int


# Upload-related schemas
class PresignedUploadRequest(BaseModel):
    """Request for presigned upload URL."""

    filename: str = Field(..., min_length=1, max_length=255)
    content_type: str = Field(..., min_length=1)
    file_size: int = Field(..., gt=0, le=5 * 1024 * 1024)  # 5MB max


class PresignedUploadResponse(BaseModel):
    """Response with presigned upload URL."""

    upload_url: str
    fields: dict
    photo_key: str
    cdn_url: str


# Filter schemas
class PetFilters(BaseModel):
    """Filters for pet listing."""

    owner_id: Optional[int] = None
    status: Optional[PetStatus] = None
    species: Optional[PetSpecies] = None
    search: Optional[str] = None
    page: int = Field(1, ge=1)
    limit: int = Field(20, ge=1, le=100)


# Adoption schemas
class AdoptPetRequest(BaseModel):
    """Request to assign owner (adopt) a pet."""

    owner_id: int = Field(..., gt=0)
