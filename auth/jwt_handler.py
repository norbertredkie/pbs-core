"""
JWT token generation and validation
"""
from datetime import datetime, timedelta, timezone
from typing import Optional
import os
import jwt
from pydantic import BaseModel


class JWTConfig:
    """JWT configuration"""
    SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret-key-change-in-production")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 15
    REFRESH_TOKEN_EXPIRE_DAYS = 7


class TokenPayload(BaseModel):
    """JWT payload"""
    sub: str  # user_id
    email: str
    tier: str
    iat: int  # issued at
    exp: int  # expiration
    type: str  # "access" or "refresh"


def create_access_token(user_id: str, email: str, tier: str) -> str:
    """Create JWT access token"""
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=JWTConfig.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    payload = {
        "sub": user_id,
        "email": email,
        "tier": tier,
        "type": "access",
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    }
    
    return jwt.encode(payload, JWTConfig.SECRET_KEY, algorithm=JWTConfig.ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    """Create JWT refresh token"""
    now = datetime.now(timezone.utc)
    expire = now + timedelta(days=JWTConfig.REFRESH_TOKEN_EXPIRE_DAYS)
    
    payload = {
        "sub": user_id,
        "type": "refresh",
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    }
    
    return jwt.encode(payload, JWTConfig.SECRET_KEY, algorithm=JWTConfig.ALGORITHM)


def verify_token(token: str) -> Optional[TokenPayload]:
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, JWTConfig.SECRET_KEY, algorithms=[JWTConfig.ALGORITHM])
        return TokenPayload(**payload)
    except jwt.ExpiredSignatureError:
        raise Exception("Token has expired")
    except jwt.InvalidTokenError:
        raise Exception("Invalid token")


def verify_access_token(token: str) -> Optional[TokenPayload]:
    """Verify access token specifically"""
    token_data = verify_token(token)
    if token_data.type != "access":
        raise Exception("Invalid token type")
    return token_data


def verify_refresh_token(token: str) -> Optional[TokenPayload]:
    """Verify refresh token specifically"""
    token_data = verify_token(token)
    if token_data.type != "refresh":
        raise Exception("Invalid token type")
    return token_data
