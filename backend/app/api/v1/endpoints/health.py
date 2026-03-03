"""Health-check endpoint – verifies the API is alive."""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class HealthResponse(BaseModel):
    """Health-check response schema."""

    status: str
    version: str


@router.get("", response_model=HealthResponse, summary="Health check")
async def health_check() -> HealthResponse:
    """Return the current status and version of the API."""
    return HealthResponse(status="ok", version="0.1.0")
