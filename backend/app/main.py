from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

from app.api.v1 import auth, users
from app.core.config import settings, setup_logging

setup_logging()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(users.router, prefix=f"{settings.API_V1_STR}/users", tags=["users"])


@app.exception_handler(Exception)
async def universal_exception_handler(request: Request, exc: Exception):
    """Universal exception handler to ensure all errors follow the standard format."""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": 500,
                "message": str(exc),
                "status": "INTERNAL_SERVER_ERROR",
            }
        },
    )


@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "ok"}


@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME}"}
