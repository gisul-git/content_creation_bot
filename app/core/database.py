"""
Database connection setup for MongoDB and Redis.
"""
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from redis import asyncio as aioredis
from typing import Optional
from app.core.config import settings
from app.models.user import User
from app.models.session import Session
from app.models.token import PasswordResetToken, EmailVerificationToken
from app.models.audit_log import AuditLog
import logging

logger = logging.getLogger(__name__)

# MongoDB client
mongodb_client: AsyncIOMotorClient = None

# Redis client
redis_client: aioredis.Redis = None


async def connect_to_mongo():
    """Create database connection to MongoDB."""
    global mongodb_client
    
    try:
        mongodb_client = AsyncIOMotorClient(settings.MONGODB_URL)
        
        # Initialize Beanie with document models
        await init_beanie(
            database=mongodb_client[settings.MONGODB_DB_NAME],
            document_models=[
                User,
                Session,
                PasswordResetToken,
                EmailVerificationToken,
                AuditLog,
            ]
        )
        
        logger.info("Connected to MongoDB")
    except Exception as e:
        logger.error(f"Error connecting to MongoDB: {e}")
        raise


async def close_mongo_connection():
    """Close MongoDB connection."""
    global mongodb_client
    if mongodb_client:
        mongodb_client.close()
        logger.info("Disconnected from MongoDB")


async def connect_to_redis():
    """Create connection to Redis."""
    global redis_client
    
    try:
        redis_client = aioredis.from_url(
            settings.REDIS_URL,
            db=settings.REDIS_SESSION_DB,
            decode_responses=True
        )
        
        # Test connection
        await redis_client.ping()
        logger.info("✅ Connected to Redis successfully")
    except Exception as e:
        logger.error(f"❌ Redis connection failed: {e}")
        logger.error("Redis is required for session management. Please ensure Redis is running.")
        raise


async def close_redis_connection():
    """Close Redis connection."""
    global redis_client
    if redis_client:
        try:
            await redis_client.close()
            logger.info("Disconnected from Redis")
        except Exception as e:
            logger.warning(f"Error closing Redis connection: {e}")
        finally:
            redis_client = None


def get_redis() -> aioredis.Redis:
    """Get Redis client. Raises error if Redis is not connected."""
    if redis_client is None:
        raise RuntimeError("Redis is not connected. Please ensure Redis server is running.")
    return redis_client

