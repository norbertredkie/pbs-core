"""
Database models for unified authentication system
"""
from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class OAuthProvider(str, Enum):
    """Supported OAuth providers"""
    GOOGLE = "google"
    APPLE = "apple"
    DISCORD = "discord"
    FORTNITE = "fortnite"


class UserTier(str, Enum):
    """User subscription tiers"""
    FREE = "free"
    PRO = "pro"
    ENTERPRISE = "enterprise"


# Database Models (for ORM - SQLAlchemy)
class UserDB(BaseModel):
    """User database record"""
    id: str  # UUID
    email: EmailStr
    name: str
    avatar_url: Optional[str] = None
    tier: UserTier = UserTier.FREE
    credits: int = 0
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class OAuthProviderDB(BaseModel):
    """OAuth provider link for user"""
    id: str  # UUID
    user_id: str
    provider: OAuthProvider
    provider_user_id: str  # User ID from OAuth provider
    provider_email: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class SessionDB(BaseModel):
    """Session record"""
    id: str  # UUID
    user_id: str
    refresh_token: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime
    expires_at: datetime
    
    class Config:
        from_attributes = True


# API Request/Response Models
class SignupRequest(BaseModel):
    """Signup request with legal acknowledgment"""
    email: EmailStr
    name: str
    provider: OAuthProvider
    provider_user_id: str
    provider_email: Optional[str] = None
    avatar_url: Optional[str] = None
    accept_privacy_policy: bool
    accept_terms_of_service: bool
    accept_safety_policy: bool
    age_18_plus: Optional[bool] = None  # For 18+ products
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "name": "John Doe",
                "provider": "google",
                "provider_user_id": "google_123456",
                "accept_privacy_policy": True,
                "accept_terms_of_service": True,
                "accept_safety_policy": True,
                "age_18_plus": True
            }
        }


class LoginRequest(BaseModel):
    """Login request"""
    email: EmailStr
    provider: OAuthProvider
    provider_user_id: str
    provider_email: Optional[str] = None


class TokenResponse(BaseModel):
    """JWT token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # Seconds
    user: "UserResponse"


class RefreshTokenRequest(BaseModel):
    """Refresh token request"""
    refresh_token: str


class UserResponse(BaseModel):
    """User public profile"""
    id: str
    email: str
    name: str
    avatar_url: Optional[str] = None
    tier: UserTier
    credits: int
    created_at: datetime


class WebhookEvent(BaseModel):
    """Webhook event for account lifecycle"""
    event_type: str  # user.created, user.updated, user.deleted
    timestamp: datetime
    user_id: str
    user_data: UserResponse
    metadata: Optional[dict] = None


class ErrorResponse(BaseModel):
    """Error response"""
    error: str
    error_description: Optional[str] = None
    error_code: Optional[str] = None
