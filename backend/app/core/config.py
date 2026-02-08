import logging
import sys

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "World Pet API"
    VERSION: str = "v1"
    API_V1_STR: str = "/api/v1"

    # Logging
    LOG_LEVEL: str = "INFO"

    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5433/worldpet"

    # Redis
    REDIS_URL: str = "redis://redis:6379/0"

    # Security
    SECRET_KEY: str = "your-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        case_sensitive = True

    # CORS
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8000",
        "http://localhost:8080",
    ]
    ALLOWED_METHODS: list[str] = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    ALLOWED_HEADERS: list[str] = ["*"]
    ALLOW_CREDENTIALS: bool = True


settings = Settings()


def setup_logging() -> None:
    logging.basicConfig(
        level=settings.LOG_LEVEL,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        stream=sys.stdout,
    )
    # Filter out health checks if needed
    # logging.getLogger("uvicorn.access").addFilter(...)
