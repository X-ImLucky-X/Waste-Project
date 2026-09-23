import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "EcoRecover AI"
    PROJECT_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Defaults to local SQLite database; set DATABASE_URL in .env to use PostgreSQL
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'ecorecover.db'}")
    
    # Upload storage directory
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    
    # Knowledge base directory
    DATA_DIR: Path = BASE_DIR / "app" / "data"

    class Config:
        case_sensitive = True

settings = Settings()
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
