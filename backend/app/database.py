import redis.asyncio as redis
import json
from typing import Any, Optional, Dict, List
from app.config import settings
import logging

logger = logging.getLogger(__name__)

class RedisDatabase:
    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None
        
    async def connect(self):
        """Connect to Redis database"""
        try:
            self.redis_client = redis.from_url(
                settings.redis_url,
                encoding="utf-8",
                decode_responses=True
            )
            # Test connection
            await self.redis_client.ping()
            logger.info("Connected to Redis successfully")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            raise
    
    async def disconnect(self):
        """Disconnect from Redis database"""
        if self.redis_client:
            await self.redis_client.close()
            logger.info("Disconnected from Redis")
    
    async def get(self, key: str) -> Optional[Any]:
        """Get value by key"""
        try:
            value = await self.redis_client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.error(f"Error getting key {key}: {e}")
            return None
    
    async def set(self, key: str, value: Any, expire: Optional[int] = None) -> bool:
        """Set key-value pair with optional expiration"""
        try:
            json_value = json.dumps(value, default=str)
            result = await self.redis_client.set(key, json_value, ex=expire)
            return result
        except Exception as e:
            logger.error(f"Error setting key {key}: {e}")
            return False
    
    async def delete(self, key: str) -> bool:
        """Delete key"""
        try:
            result = await self.redis_client.delete(key)
            return result > 0
        except Exception as e:
            logger.error(f"Error deleting key {key}: {e}")
            return False
    
    async def exists(self, key: str) -> bool:
        """Check if key exists"""
        try:
            result = await self.redis_client.exists(key)
            return result > 0
        except Exception as e:
            logger.error(f"Error checking key {key}: {e}")
            return False
    
    async def expire(self, key: str, seconds: int) -> bool:
        """Set expiration for key"""
        try:
            result = await self.redis_client.expire(key, seconds)
            return result
        except Exception as e:
            logger.error(f"Error setting expiration for key {key}: {e}")
            return False
    
    async def get_all_keys(self, pattern: str = "*") -> List[str]:
        """Get all keys matching pattern"""
        try:
            keys = await self.redis_client.keys(pattern)
            return keys
        except Exception as e:
            logger.error(f"Error getting keys with pattern {pattern}: {e}")
            return []
    
    async def flush_db(self):
        """Clear all data from current database"""
        try:
            await self.redis_client.flushdb()
            logger.info("Database flushed successfully")
        except Exception as e:
            logger.error(f"Error flushing database: {e}")

# Create database instance
db = RedisDatabase()

# Dependency for FastAPI
async def get_database() -> RedisDatabase:
    return db