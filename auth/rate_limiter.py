"""
Rate limiting to prevent spam signups and brute force attacks
"""
import os
import time
from typing import Dict
from collections import defaultdict


class RateLimiter:
    """In-memory rate limiter with sliding window"""
    
    def __init__(self, max_requests: int = 100, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: Dict[str, list] = defaultdict(list)
    
    def is_allowed(self, key: str) -> bool:
        """
        Check if request is allowed
        
        Args:
            key: Rate limit key (e.g., "signup:192.168.1.1")
        
        Returns:
            True if request is allowed, False if rate limited
        """
        now = time.time()
        window_start = now - self.window_seconds
        
        # Clean old timestamps
        self.requests[key] = [ts for ts in self.requests[key] if ts > window_start]
        
        # Check if limit exceeded
        if len(self.requests[key]) >= self.max_requests:
            return False
        
        # Add new request
        self.requests[key].append(now)
        return True


# For production, use Redis-based rate limiter
class RedisRateLimiter:
    """Redis-backed rate limiter for distributed deployments"""
    
    def __init__(self, redis_client, max_requests: int = 100, window_seconds: int = 60):
        self.redis = redis_client
        self.max_requests = max_requests
        self.window_seconds = window_seconds
    
    def is_allowed(self, key: str) -> bool:
        """Check if request is allowed using Redis"""
        try:
            pipe = self.redis.pipeline()
            pipe.incr(key)
            pipe.expire(key, self.window_seconds)
            result = pipe.execute()
            
            current_count = result[0]
            return current_count <= self.max_requests
        except Exception as e:
            # If Redis fails, allow the request (fail open)
            import logging
            logging.error(f"Rate limiter error: {e}")
            return True


# Initialize based on environment
if os.getenv("REDIS_URL"):
    import redis
    redis_client = redis.from_url(os.getenv("REDIS_URL"))
    DEFAULT_RATE_LIMITER = RedisRateLimiter(redis_client)
else:
    DEFAULT_RATE_LIMITER = RateLimiter()
