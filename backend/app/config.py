from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # Server Configuration
    debug: bool = True
    host: str = "0.0.0.0"
    port: int = 8000
    secret_key: str = "dev-secret-key-change-in-production"
    
    # Database Configuration
    redis_url: str = "redis://localhost:6379/0"
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_db: int = 0
    redis_password: str = ""
    
    # OAuth2 Configuration
    google_client_id: str = ""
    google_client_secret: str = ""
    oauth_redirect_uri: str = "http://localhost:3000/auth/callback"
    
    # JWT Configuration
    jwt_secret_key: str = "jwt-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24
    
    # Payment Configuration
    stripe_publishable_key: str = ""
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    
    # CORS Configuration
    cors_origins: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    allowed_hosts: List[str] = ["localhost", "127.0.0.1"]
    
    # File Upload Configuration
    max_file_size: int = 10485760  # 10MB
    upload_dir: str = "uploads"
    allowed_extensions: List[str] = ["jpg", "jpeg", "png", "gif", "webp"]
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Create settings instance
settings = Settings()

# Ensure upload directory exists
os.makedirs(settings.upload_dir, exist_ok=True)