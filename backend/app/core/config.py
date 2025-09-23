"""
MedTech Data Platform - Configuration Settings
Zentrale Konfiguration für alle Umgebungseinstellungen
"""

from pydantic_settings import BaseSettings
from pydantic import Field, validator
from typing import List, Optional, Any
import os
from pathlib import Path

class Settings(BaseSettings):
    """
    Application settings with environment variable support
    """
    
    # Application
    APP_NAME: str = "MedTech Data Platform"
    VERSION: str = "1.0.0"
    DEBUG: bool = Field(default=False, env="DEBUG")
    SECRET_KEY: str = Field(..., env="SECRET_KEY")
    
    # API
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "MedTech Data Platform"
    
    # Database
    DATABASE_URL: str = Field(..., env="DATABASE_URL")
    DATABASE_POOL_SIZE: int = Field(default=20, env="DATABASE_POOL_SIZE")
    DATABASE_MAX_OVERFLOW: int = Field(default=30, env="DATABASE_MAX_OVERFLOW")
    
    # Redis Cache
    REDIS_URL: str = Field(default="redis://localhost:6379", env="REDIS_URL")
    CACHE_TTL: int = Field(default=3600, env="CACHE_TTL")  # 1 hour
    
    # Security
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    REFRESH_TOKEN_EXPIRE_MINUTES: int = Field(default=60 * 24 * 7, env="REFRESH_TOKEN_EXPIRE_MINUTES")  # 7 days
    ALGORITHM: str = "HS256"
    
    # CORS
    ALLOWED_HOSTS: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000"],
        env="ALLOWED_HOSTS"
    )
    
    # File Upload
    MAX_FILE_SIZE: int = Field(default=100 * 1024 * 1024, env="MAX_FILE_SIZE")  # 100MB
    UPLOAD_DIR: str = Field(default="uploads", env="UPLOAD_DIR")
    ALLOWED_EXTENSIONS: List[str] = Field(
        default=[".csv", ".json", ".xml", ".xlsx", ".pdf"],
        env="ALLOWED_EXTENSIONS"
    )
    
    # Data Sources
    DATA_SOURCES_DIR: str = Field(default="data_sources", env="DATA_SOURCES_DIR")
    MAX_SOURCES: int = Field(default=400, env="MAX_SOURCES")
    SOURCE_UPDATE_INTERVAL: int = Field(default=3600, env="SOURCE_UPDATE_INTERVAL")  # 1 hour
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = Field(default=100, env="RATE_LIMIT_REQUESTS")
    RATE_LIMIT_WINDOW: int = Field(default=60, env="RATE_LIMIT_WINDOW")  # 1 minute
    
    # Logging
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    LOG_FORMAT: str = Field(default="json", env="LOG_FORMAT")
    
    # Monitoring
    ENABLE_METRICS: bool = Field(default=True, env="ENABLE_METRICS")
    METRICS_PORT: int = Field(default=9090, env="METRICS_PORT")
    
    # Celery
    CELERY_BROKER_URL: str = Field(default="redis://localhost:6379/0", env="CELERY_BROKER_URL")
    CELERY_RESULT_BACKEND: str = Field(default="redis://localhost:6379/0", env="CELERY_RESULT_BACKEND")
    
    # Email
    SMTP_TLS: bool = Field(default=True, env="SMTP_TLS")
    SMTP_PORT: Optional[int] = Field(default=None, env="SMTP_PORT")
    SMTP_HOST: Optional[str] = Field(default=None, env="SMTP_HOST")
    SMTP_USER: Optional[str] = Field(default=None, env="SMTP_USER")
    SMTP_PASSWORD: Optional[str] = Field(default=None, env="SMTP_PASSWORD")
    EMAILS_FROM_EMAIL: Optional[str] = Field(default=None, env="EMAILS_FROM_EMAIL")
    EMAILS_FROM_NAME: Optional[str] = Field(default=None, env="EMAILS_FROM_NAME")
    
    # Data Validation
    VALIDATION_STRICT: bool = Field(default=True, env="VALIDATION_STRICT")
    VALIDATION_RETRIES: int = Field(default=3, env="VALIDATION_RETRIES")
    
    # Performance
    ENABLE_COMPRESSION: bool = Field(default=True, env="ENABLE_COMPRESSION")
    ENABLE_CACHING: bool = Field(default=True, env="ENABLE_CACHING")
    
    # Testing
    TESTING: bool = Field(default=False, env="TESTING")
    TEST_DATABASE_URL: str = Field(default="sqlite:///./test.db", env="TEST_DATABASE_URL")
    
    @validator("ALLOWED_HOSTS", pre=True)
    def assemble_cors_origins(cls, v):
        if isinstance(v, str):
            return [i.strip() for i in v.split(",")]
        return v
    
    @validator("ALLOWED_EXTENSIONS", pre=True)
    def assemble_extensions(cls, v):
        if isinstance(v, str):
            return [i.strip() for i in v.split(",")]
        return v
    
    @validator("DATABASE_URL", pre=True)
    def validate_database_url(cls, v):
        if not v:
            raise ValueError("DATABASE_URL is required")
        return v
    
    @validator("SECRET_KEY", pre=True)
    def validate_secret_key(cls, v):
        if not v:
            raise ValueError("SECRET_KEY is required")
        if len(v) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters long")
        return v
    
    @property
    def upload_path(self) -> Path:
        """Get upload directory path"""
        path = Path(self.UPLOAD_DIR)
        path.mkdir(parents=True, exist_ok=True)
        return path
    
    @property
    def data_sources_path(self) -> Path:
        """Get data sources directory path"""
        path = Path(self.DATA_SOURCES_DIR)
        path.mkdir(parents=True, exist_ok=True)
        return path
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Global settings instance
settings = Settings()

# Environment-specific configurations
class DevelopmentSettings(Settings):
    DEBUG: bool = True
    LOG_LEVEL: str = "DEBUG"

class ProductionSettings(Settings):
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"
    VALIDATION_STRICT: bool = True

class TestingSettings(Settings):
    DEBUG: bool = True
    TESTING: bool = True
    DATABASE_URL: str = "sqlite:///./test.db"
    SECRET_KEY: str = "test-secret-key-for-testing-only"

def get_settings() -> Settings:
    """Get settings based on environment"""
    env = os.getenv("ENVIRONMENT", "development").lower()
    
    if env == "production":
        return ProductionSettings()
    elif env == "testing":
        return TestingSettings()
    else:
        return DevelopmentSettings()
