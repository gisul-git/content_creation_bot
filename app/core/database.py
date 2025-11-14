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
from app.models.chat import Chat
import logging
import certifi
import os

logger = logging.getLogger(__name__)

# MongoDB client
mongodb_client: AsyncIOMotorClient = None

# Redis client
redis_client: aioredis.Redis = None


async def connect_to_mongo():
    """Create database connection to MongoDB.
    
    Automatically handles:
    - Local MongoDB (mongodb://localhost:27017) - No SSL needed
    - MongoDB Atlas (mongodb+srv://...mongodb.net) - SSL required
    """
    global mongodb_client
    
    try:
        mongo_url = settings.MONGODB_URL
        is_atlas = (
            ".mongodb.net" in mongo_url.lower() or 
            "mongodb+srv://" in mongo_url.lower()
        )
        
        # Connection parameters - auto-configure based on connection type
        if is_atlas:
            # MongoDB Atlas (cloud) - SSL required
            logger.info("🔗 Connecting to MongoDB Atlas (cloud)...")
            mongodb_client = AsyncIOMotorClient(
                mongo_url,
                tls=True,
                tlsCAFile=certifi.where(),
                serverSelectionTimeoutMS=10000,
                connectTimeoutMS=10000,
            )
        else:
            # Local MongoDB - No SSL needed
            logger.info("🔗 Connecting to local MongoDB...")
            mongodb_client = AsyncIOMotorClient(
                mongo_url,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000,
            )
        
        # Test connection
        await mongodb_client.admin.command('ping')
        logger.info("✅ Connected to MongoDB successfully")
        
        # Initialize Beanie with document models
        await init_beanie(
            database=mongodb_client[settings.MONGODB_DB_NAME],
            document_models=[
                User,
                Session,
                PasswordResetToken,
                EmailVerificationToken,
                AuditLog,
                Chat,
            ]
        )
        logger.info(f"✅ Beanie initialized with database: {settings.MONGODB_DB_NAME}")
        
    except Exception as e:
        logger.error(f"❌ Error connecting to MongoDB: {e}")
        
        # Mask connection string
        masked = mongo_url.split('@')[-1] if '@' in mongo_url else mongo_url
        logger.error(f"Connection: ***@{masked}")
        
        # Helpful tips
        if is_atlas and ("SSL" in str(e) or "TLS" in str(e)):
            logger.error("💡 MongoDB Atlas SSL Error - Try:")
            logger.error("   1. Check your IP is whitelisted in Atlas Network Access")
            logger.error("   2. Verify connection string is correct")
            logger.error("   3. Run: pip install --upgrade certifi")
        elif not is_atlas:
            logger.error("💡 Local MongoDB Error - Check:")
            logger.error("   1. MongoDB is running: mongod")
            logger.error("   2. Connection string: mongodb://localhost:27017")
        
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

