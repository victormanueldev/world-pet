"""Core application configuration using pydantic-settings."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # ---------------------------------------------------------------------------
    # Database
    # ---------------------------------------------------------------------------
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "worldpetuser"
    POSTGRES_PASSWORD: str = "worldpetpassword"
    POSTGRES_DB: str = "world_pet"
    POSTGRES_PORT: int = 5432

    # ---------------------------------------------------------------------------
    # Security
    # ---------------------------------------------------------------------------
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15  # 15 minutes for access tokens
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7  # 7 days for refresh tokens

    # ---------------------------------------------------------------------------
    # Application
    # ---------------------------------------------------------------------------
    PROJECT_NAME: str = "World Pet API"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    @property
    def database_url(self) -> str:
        """Synchronous PostgreSQL URL for Alembic."""
        return (
            f"postgresql+psycopg2://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    @property
    def async_database_url(self) -> str:
        """Asynchronous PostgreSQL URL for SQLAlchemy async engine."""
        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )


# Singleton settings instance used throughout the application.
settings = Settings()
