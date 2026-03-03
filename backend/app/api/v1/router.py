"""Central router for API v1 – registers all endpoint routers here."""

from fastapi import APIRouter

from app.api.v1.endpoints import health

api_router = APIRouter()

# Health-check endpoint (unauthenticated)
api_router.include_router(health.router, prefix="/health", tags=["health"])
