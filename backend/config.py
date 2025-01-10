import os
from pathlib import Path

class Config:
    # Base configuration
    BASE_DIR = Path(__file__).parent
    OUTPUTS_DIR = BASE_DIR / 'outputs'

    # Create necessary directories
    OUTPUTS_DIR.mkdir(exist_ok=True)
    for subdir in ['crew', 'doc', 'blogs', 'data']:
        (OUTPUTS_DIR / subdir).mkdir(exist_ok=True)

    # Security
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-key-change-in-production')

    # API Keys
    ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY')

    # CORS
    ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS').split(',')

    # File paths
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size

class ProductionConfig(Config):
    DEBUG = False
    TESTING = False

class DevelopmentConfig(Config):
    DEBUG = True
    TESTING = False

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
