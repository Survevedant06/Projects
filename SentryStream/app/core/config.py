from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    # API Config
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"]
    
    # Alerting (optional)
    DISCORD_WEBHOOK_URL: str | None = None
    SLACK_WEBHOOK_URL: str | None = None
    
    # Intelligence APIs (optional)
    VIRUSTOTAL_API_KEY: str | None = None
    GOOGLE_SAFE_BROWSING_API_KEY: str | None = None

    # Database
    DATABASE_URL: str = "sqlite:///./sentry_stream.db"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
