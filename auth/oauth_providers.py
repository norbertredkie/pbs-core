"""
OAuth provider integrations
Google, Apple ID, Discord, Fortnite (Epic Games)
"""
import os
import httpx
from typing import Optional, Dict, Any
from dataclasses import dataclass


@dataclass
class OAuthUserInfo:
    """Unified user info from any OAuth provider"""
    provider_user_id: str
    email: Optional[str] = None
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    raw_data: Dict[str, Any] = None


class GoogleOAuthProvider:
    """Google OAuth provider"""
    
    CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
    CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
    REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "https://api.pbs.local/auth/callback/google")
    TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"
    USERINFO_ENDPOINT = "https://www.googleapis.com/oauth2/v2/userinfo"
    
    @classmethod
    async def get_user_info(cls, code: str) -> OAuthUserInfo:
        """Exchange authorization code for user info"""
        async with httpx.AsyncClient() as client:
            # Exchange code for token
            token_response = await client.post(
                cls.TOKEN_ENDPOINT,
                data={
                    "client_id": cls.CLIENT_ID,
                    "client_secret": cls.CLIENT_SECRET,
                    "code": code,
                    "grant_type": "authorization_code",
                    "redirect_uri": cls.REDIRECT_URI,
                }
            )
            token_response.raise_for_status()
            token_data = token_response.json()
            
            # Get user info
            user_response = await client.get(
                cls.USERINFO_ENDPOINT,
                headers={"Authorization": f"Bearer {token_data['access_token']}"}
            )
            user_response.raise_for_status()
            user_data = user_response.json()
            
            return OAuthUserInfo(
                provider_user_id=str(user_data.get("id")),
                email=user_data.get("email"),
                name=user_data.get("name"),
                avatar_url=user_data.get("picture"),
                raw_data=user_data
            )


class AppleOAuthProvider:
    """Apple ID OAuth provider"""
    
    CLIENT_ID = os.getenv("APPLE_CLIENT_ID", "")
    TEAM_ID = os.getenv("APPLE_TEAM_ID", "")
    KEY_ID = os.getenv("APPLE_KEY_ID", "")
    PRIVATE_KEY = os.getenv("APPLE_PRIVATE_KEY", "")
    REDIRECT_URI = os.getenv("APPLE_REDIRECT_URI", "https://api.pbs.local/auth/callback/apple")
    TOKEN_ENDPOINT = "https://appleid.apple.com/auth/oauth2/token"
    
    @classmethod
    async def get_user_info(cls, code: str, user_data: Optional[Dict] = None) -> OAuthUserInfo:
        """Exchange authorization code for user info"""
        # Note: Apple returns limited info; user_data may be provided during initial signup
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                cls.TOKEN_ENDPOINT,
                data={
                    "client_id": cls.CLIENT_ID,
                    "code": code,
                    "grant_type": "authorization_code",
                    "redirect_uri": cls.REDIRECT_URI,
                }
            )
            token_response.raise_for_status()
            token_data = token_response.json()
            
            # Apple doesn't provide /userinfo endpoint; info comes from the initial request
            # Decode ID token to get user info
            import jwt as pyjwt
            id_token = token_data.get("id_token")
            if id_token:
                # Unverified decode for now (verify with Apple's public key in production)
                user_data_from_token = pyjwt.decode(id_token, options={"verify_signature": False})
            else:
                user_data_from_token = {}
            
            provider_user_id = user_data_from_token.get("sub", user_data.get("user") if user_data else "")
            
            return OAuthUserInfo(
                provider_user_id=provider_user_id,
                email=user_data_from_token.get("email") or (user_data.get("email") if user_data else None),
                name=user_data.get("name") if user_data else None,
                raw_data=user_data_from_token
            )


class DiscordOAuthProvider:
    """Discord OAuth provider"""
    
    CLIENT_ID = os.getenv("DISCORD_CLIENT_ID", "")
    CLIENT_SECRET = os.getenv("DISCORD_CLIENT_SECRET", "")
    REDIRECT_URI = os.getenv("DISCORD_REDIRECT_URI", "https://api.pbs.local/auth/callback/discord")
    TOKEN_ENDPOINT = "https://discord.com/api/oauth2/token"
    USERINFO_ENDPOINT = "https://discord.com/api/users/@me"
    
    @classmethod
    async def get_user_info(cls, code: str) -> OAuthUserInfo:
        """Exchange authorization code for user info"""
        async with httpx.AsyncClient() as client:
            # Exchange code for token
            token_response = await client.post(
                cls.TOKEN_ENDPOINT,
                data={
                    "client_id": cls.CLIENT_ID,
                    "client_secret": cls.CLIENT_SECRET,
                    "code": code,
                    "grant_type": "authorization_code",
                    "redirect_uri": cls.REDIRECT_URI,
                }
            )
            token_response.raise_for_status()
            token_data = token_response.json()
            
            # Get user info
            user_response = await client.get(
                cls.USERINFO_ENDPOINT,
                headers={"Authorization": f"Bearer {token_data['access_token']}"}
            )
            user_response.raise_for_status()
            user_data = user_response.json()
            
            avatar_url = None
            if user_data.get("avatar"):
                avatar_url = f"https://cdn.discordapp.com/avatars/{user_data['id']}/{user_data['avatar']}.png"
            
            return OAuthUserInfo(
                provider_user_id=str(user_data.get("id")),
                email=user_data.get("email"),
                name=user_data.get("username"),
                avatar_url=avatar_url,
                raw_data=user_data
            )


class FortniteOAuthProvider:
    """Fortnite (Epic Games) OAuth provider"""
    
    CLIENT_ID = os.getenv("FORTNITE_CLIENT_ID", "")
    CLIENT_SECRET = os.getenv("FORTNITE_CLIENT_SECRET", "")
    REDIRECT_URI = os.getenv("FORTNITE_REDIRECT_URI", "https://api.pbs.local/auth/callback/fortnite")
    TOKEN_ENDPOINT = "https://account-public-service-prod.ol.epicgames.com/account/oauth/token"
    USERINFO_ENDPOINT = "https://account-public-service-prod.ol.epicgames.com/account/api/public/account"
    
    @classmethod
    async def get_user_info(cls, code: str) -> OAuthUserInfo:
        """Exchange authorization code for user info"""
        async with httpx.AsyncClient() as client:
            # Exchange code for token
            token_response = await client.post(
                cls.TOKEN_ENDPOINT,
                data={
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": cls.REDIRECT_URI,
                },
                auth=(cls.CLIENT_ID, cls.CLIENT_SECRET)
            )
            token_response.raise_for_status()
            token_data = token_response.json()
            
            # Get user info
            account_response = await client.get(
                cls.USERINFO_ENDPOINT,
                headers={"Authorization": f"Bearer {token_data['access_token']}"}
            )
            account_response.raise_for_status()
            account_data = account_response.json()
            
            return OAuthUserInfo(
                provider_user_id=str(account_data.get("id")),
                email=account_data.get("email"),
                name=account_data.get("displayName"),
                raw_data=account_data
            )


# Provider registry
OAUTH_PROVIDERS = {
    "google": GoogleOAuthProvider,
    "apple": AppleOAuthProvider,
    "discord": DiscordOAuthProvider,
    "fortnite": FortniteOAuthProvider,
}


async def get_oauth_user_info(provider: str, code: str, user_data: Optional[Dict] = None) -> OAuthUserInfo:
    """Get user info from any OAuth provider"""
    provider_class = OAUTH_PROVIDERS.get(provider.lower())
    if not provider_class:
        raise ValueError(f"Unknown provider: {provider}")
    
    if provider.lower() == "apple":
        return await provider_class.get_user_info(code, user_data)
    else:
        return await provider_class.get_user_info(code)
