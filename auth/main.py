"""
PBS Unified Auth Service
FastAPI application for OAuth2 + JWT authentication
"""
import os
import uuid
from datetime import datetime, timezone
from typing import Optional
import httpx
from fastapi import FastAPI, HTTPException, Request, Depends, Header
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import logging

from .models import (
    SignupRequest, LoginRequest, TokenResponse, UserResponse,
    RefreshTokenRequest, WebhookEvent, OAuthProvider
)
from .jwt_handler import create_access_token, create_refresh_token, verify_access_token, verify_refresh_token
from .oauth_providers import get_oauth_user_info
from .database import get_db, User, OAuthConnection, Session as SessionModel
from .webhooks import send_webhook
from .rate_limiter import RateLimiter

logger = logging.getLogger(__name__)

app = FastAPI(
    title="PBS Unified Auth Service",
    description="OAuth2 + JWT authentication for all PBS products",
    version="1.0.0"
)

# CORS configuration - adjust for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:8000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiter
rate_limiter = RateLimiter(
    max_requests=100,
    window_seconds=60
)


async def get_current_user(
    authorization: Optional[str] = Header(None),
    db = Depends(get_db)
) -> UserResponse:
    """Dependency: verify and extract user from JWT"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    try:
        scheme, token = authorization.split(" ")
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authorization scheme")
        
        token_data = verify_access_token(token)
        
        # Get user from database
        user = db.query(User).filter(User.id == token_data.sub).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        return UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            avatar_url=user.avatar_url,
            tier=user.tier,
            credits=user.credits,
            created_at=user.created_at
        )
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")


# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "PBS Auth Service",
        "version": "1.0.0"
    }


# ============================================================================
# OAUTH FLOW - AUTHORIZATION ENDPOINTS
# ============================================================================

@app.get("/auth/authorize/{provider}")
async def authorize(provider: str, request: Request):
    """
    Redirect to OAuth provider
    GET /auth/authorize/google?redirect_uri=https://myapp.com/dashboard
    """
    redirect_uri = request.query_params.get("redirect_uri")
    if not redirect_uri:
        raise HTTPException(status_code=400, detail="Missing redirect_uri")
    
    # Store redirect URI in session (in production, use Redis or database)
    # For now, return authorization URL
    
    if provider.lower() == "google":
        auth_url = (
            f"https://accounts.google.com/o/oauth2/v2/auth?"
            f"client_id={os.getenv('GOOGLE_CLIENT_ID')}&"
            f"redirect_uri={os.getenv('GOOGLE_REDIRECT_URI')}&"
            f"response_type=code&"
            f"scope=openid+email+profile"
        )
    elif provider.lower() == "discord":
        auth_url = (
            f"https://discord.com/api/oauth2/authorize?"
            f"client_id={os.getenv('DISCORD_CLIENT_ID')}&"
            f"redirect_uri={os.getenv('DISCORD_REDIRECT_URI')}&"
            f"response_type=code&"
            f"scope=identify+email"
        )
    elif provider.lower() == "apple":
        auth_url = (
            f"https://appleid.apple.com/auth/authorize?"
            f"client_id={os.getenv('APPLE_CLIENT_ID')}&"
            f"redirect_uri={os.getenv('APPLE_REDIRECT_URI')}&"
            f"response_type=code+id_token&"
            f"response_mode=form_post&"
            f"scope=openid+email+name"
        )
    elif provider.lower() == "fortnite":
        auth_url = (
            f"https://www.epicgames.com/id/authorize?"
            f"client_id={os.getenv('FORTNITE_CLIENT_ID')}&"
            f"redirect_uri={os.getenv('FORTNITE_REDIRECT_URI')}&"
            f"response_type=code&"
            f"scope=basic+profile+email"
        )
    else:
        raise HTTPException(status_code=400, detail=f"Unknown provider: {provider}")
    
    return JSONResponse({
        "auth_url": auth_url,
        "provider": provider
    })


# ============================================================================
# SIGNUP / LOGIN
# ============================================================================

@app.post("/auth/signup", response_model=TokenResponse)
async def signup(
    request: SignupRequest,
    req: Request,
    db = Depends(get_db)
):
    """
    Create new user account
    """
    # Rate limit
    client_ip = req.client.host
    if not rate_limiter.is_allowed(f"signup:{client_ip}"):
        raise HTTPException(status_code=429, detail="Too many signup attempts")
    
    # Verify legal acceptance
    if not (request.accept_privacy_policy and request.accept_terms_of_service):
        raise HTTPException(
            status_code=400,
            detail="Must accept privacy policy and terms of service"
        )
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="Email already registered")
    
    # Check if OAuth connection exists
    existing_oauth = db.query(OAuthConnection).filter(
        OAuthConnection.provider == request.provider,
        OAuthConnection.provider_user_id == request.provider_user_id
    ).first()
    if existing_oauth:
        raise HTTPException(status_code=409, detail="OAuth account already linked")
    
    try:
        # Create user
        user_id = str(uuid.uuid4())
        user = User(
            id=user_id,
            email=request.email,
            name=request.name,
            avatar_url=request.avatar_url,
            tier="free",
            credits=0,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        db.add(user)
        
        # Link OAuth provider
        oauth_conn = OAuthConnection(
            id=str(uuid.uuid4()),
            user_id=user_id,
            provider=request.provider,
            provider_user_id=request.provider_user_id,
            provider_email=request.provider_email,
            created_at=datetime.now(timezone.utc)
        )
        db.add(oauth_conn)
        
        # Create session
        session = SessionModel(
            id=str(uuid.uuid4()),
            user_id=user_id,
            refresh_token=create_refresh_token(user_id),
            ip_address=client_ip,
            user_agent=request.headers.get("user-agent"),
            created_at=datetime.now(timezone.utc),
            expires_at=datetime.now(timezone.utc)  # Will be set by create_refresh_token
        )
        db.add(session)
        db.commit()
        
        # Generate tokens
        access_token = create_access_token(user_id, user.email, user.tier)
        refresh_token = session.refresh_token
        
        # Send webhook
        webhook_event = WebhookEvent(
            event_type="user.created",
            timestamp=datetime.now(timezone.utc),
            user_id=user_id,
            user_data=UserResponse(
                id=user.id,
                email=user.email,
                name=user.name,
                avatar_url=user.avatar_url,
                tier=user.tier,
                credits=user.credits,
                created_at=user.created_at
            ),
            metadata={"provider": request.provider}
        )
        await send_webhook("user.created", webhook_event)
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=15 * 60,
            user=UserResponse(
                id=user.id,
                email=user.email,
                name=user.name,
                avatar_url=user.avatar_url,
                tier=user.tier,
                credits=user.credits,
                created_at=user.created_at
            )
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Signup failed: {e}")
        raise HTTPException(status_code=500, detail="Signup failed")


@app.post("/auth/login", response_model=TokenResponse)
async def login(
    request: LoginRequest,
    req: Request,
    db = Depends(get_db)
):
    """
    Login existing user
    """
    # Rate limit
    client_ip = req.client.host
    if not rate_limiter.is_allowed(f"login:{client_ip}"):
        raise HTTPException(status_code=429, detail="Too many login attempts")
    
    try:
        # Find user by email + OAuth provider
        oauth_conn = db.query(OAuthConnection).filter(
            OAuthConnection.provider == request.provider,
            OAuthConnection.provider_user_id == request.provider_user_id
        ).first()
        
        if not oauth_conn:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        user = db.query(User).filter(User.id == oauth_conn.user_id).first()
        if not user or user.deleted_at:
            raise HTTPException(status_code=401, detail="User not found")
        
        # Create session
        session = SessionModel(
            id=str(uuid.uuid4()),
            user_id=user.id,
            refresh_token=create_refresh_token(user.id),
            ip_address=client_ip,
            user_agent=req.headers.get("user-agent"),
            created_at=datetime.now(timezone.utc),
            expires_at=datetime.now(timezone.utc)
        )
        db.add(session)
        db.commit()
        
        # Generate tokens
        access_token = create_access_token(user.id, user.email, user.tier)
        refresh_token = session.refresh_token
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=15 * 60,
            user=UserResponse(
                id=user.id,
                email=user.email,
                name=user.name,
                avatar_url=user.avatar_url,
                tier=user.tier,
                credits=user.credits,
                created_at=user.created_at
            )
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login failed: {e}")
        raise HTTPException(status_code=500, detail="Login failed")


# ============================================================================
# TOKEN MANAGEMENT
# ============================================================================

@app.post("/auth/refresh", response_model=TokenResponse)
async def refresh_token(
    request: RefreshTokenRequest,
    req: Request,
    db = Depends(get_db)
):
    """
    Refresh access token using refresh token
    """
    try:
        token_data = verify_refresh_token(request.refresh_token)
        
        # Get user
        user = db.query(User).filter(User.id == token_data.sub).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        # Generate new tokens
        access_token = create_access_token(user.id, user.email, user.tier)
        refresh_token = create_refresh_token(user.id)
        
        # Update session
        session = db.query(SessionModel).filter(
            SessionModel.refresh_token == request.refresh_token
        ).first()
        if session:
            session.refresh_token = refresh_token
            db.commit()
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=15 * 60,
            user=UserResponse(
                id=user.id,
                email=user.email,
                name=user.name,
                avatar_url=user.avatar_url,
                tier=user.tier,
                credits=user.credits,
                created_at=user.created_at
            )
        )
    except Exception as e:
        logger.error(f"Token refresh failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid refresh token")


@app.post("/auth/logout")
async def logout(
    current_user: UserResponse = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Logout user - invalidate all sessions
    """
    try:
        db.query(SessionModel).filter(SessionModel.user_id == current_user.id).delete()
        db.commit()
        return {"status": "logged_out"}
    except Exception as e:
        logger.error(f"Logout failed: {e}")
        raise HTTPException(status_code=500, detail="Logout failed")


# ============================================================================
# USER PROFILE
# ============================================================================

@app.get("/auth/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Get current user profile
    """
    return current_user


@app.put("/auth/me")
async def update_user_profile(
    name: Optional[str] = None,
    avatar_url: Optional[str] = None,
    current_user: UserResponse = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Update current user profile
    """
    try:
        user = db.query(User).filter(User.id == current_user.id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if name:
            user.name = name
        if avatar_url:
            user.avatar_url = avatar_url
        
        user.updated_at = datetime.now(timezone.utc)
        db.commit()
        
        return UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            avatar_url=user.avatar_url,
            tier=user.tier,
            credits=user.credits,
            created_at=user.created_at
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Profile update failed: {e}")
        raise HTTPException(status_code=500, detail="Profile update failed")


# ============================================================================
# ACCOUNT MANAGEMENT
# ============================================================================

@app.post("/auth/delete-account")
async def delete_account(
    current_user: UserResponse = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Delete user account (soft delete)
    """
    try:
        user = db.query(User).filter(User.id == current_user.id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user.deleted_at = datetime.now(timezone.utc)
        db.commit()
        
        # Send webhook
        webhook_event = WebhookEvent(
            event_type="user.deleted",
            timestamp=datetime.now(timezone.utc),
            user_id=user.id,
            user_data=UserResponse(
                id=user.id,
                email=user.email,
                name=user.name,
                avatar_url=user.avatar_url,
                tier=user.tier,
                credits=user.credits,
                created_at=user.created_at
            )
        )
        await send_webhook("user.deleted", webhook_event)
        
        return {"status": "account_deleted"}
    except Exception as e:
        db.rollback()
        logger.error(f"Account deletion failed: {e}")
        raise HTTPException(status_code=500, detail="Account deletion failed")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
