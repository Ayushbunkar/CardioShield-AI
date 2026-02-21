from loguru import logger
import sys
from app.core.config import settings

# Configure loguru
logger.remove()
logger.add(
    sys.stdout,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan> - <level>{message}</level>",
    level="DEBUG" if settings.DEBUG else "INFO"
)
logger.add(
    settings.LOGS_DIR / "app.log",
    rotation="10 MB",
    retention="7 days",
    level="DEBUG"
)

def format_patient_data(data: dict) -> str:
    """Format patient data for logging"""
    return f"Age: {data.get('age')}, Gender: {data.get('gender')}, BMI: {data.get('weight', 0) / ((data.get('height', 170) / 100) ** 2):.1f}"
