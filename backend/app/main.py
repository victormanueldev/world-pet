from fastapi import FastAPI, APIRouter
from app.core.config import settings
from app.api.v1 import auth, users

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

api_v1_router = APIRouter()
api_v1_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_v1_router.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(api_v1_router, prefix=settings.API_V1_STR)

@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}
