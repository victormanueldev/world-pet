"""Central router for API v1 – registers all endpoint routers here."""

from fastapi import APIRouter

from app.api.v1.endpoints import health, tenants, users

api_router = APIRouter()

# Health-check endpoint (unauthenticated)
api_router.include_router(health.router, prefix="/health", tags=["health"])

# Tenant endpoints (require tenant context)
api_router.include_router(tenants.router, prefix="", tags=["tenants"])

# User endpoints (require tenant context)
api_router.include_router(users.router, prefix="", tags=["users"])
