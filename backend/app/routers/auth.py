from fastapi import APIRouter, HTTPException, Depends, status
from app.models import UserCreate, UserResponse, Token, OAuthCallback, ApiResponse
from app.auth import (
    create_access_token, 
    create_guest_user, 
    exchange_google_code, 
    get_google_user_info, 
    create_or_get_google_user,
    get_current_user
)
from app.database import get_database, RedisDatabase
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/guest", response_model=UserResponse)
async def login_guest(
    user_data: UserCreate,
    db: RedisDatabase = Depends(get_database)
):
    """Login as guest user"""
    try:
        # Create guest user
        user = await create_guest_user(user_data.name, db)
        
        # Create access token
        access_token = create_access_token(
            data={"sub": user.id, "email": user.email}
        )
        
        token = Token(
            access_token=access_token,
            expires_in=3600 * 24  # 24 hours
        )
        
        return UserResponse(user=user, token=token)
        
    except Exception as e:
        logger.error(f"Guest login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create guest user"
        )

@router.get("/google")
async def google_login():
    """Get Google OAuth2 login URL"""
    from app.config import settings
    import urllib.parse
    
    params = {
        "client_id": settings.google_client_id,
        "redirect_uri": settings.oauth_redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "include_granted_scopes": "true",
        "state": "google_oauth"
    }
    
    auth_url = "https://accounts.google.com/o/oauth2/v2/auth?" + urllib.parse.urlencode(params)
    
    return {"auth_url": auth_url}

@router.post("/google/callback", response_model=UserResponse)
async def google_callback(
    callback_data: OAuthCallback,
    db: RedisDatabase = Depends(get_database)
):
    """Handle Google OAuth2 callback"""
    try:
        # Exchange code for access token
        token_data = await exchange_google_code(callback_data.code)
        if not token_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to exchange code for token"
            )
        
        # Get user info from Google
        google_user_info = await get_google_user_info(token_data["access_token"])
        if not google_user_info:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to get user info from Google"
            )
        
        # Create or get user
        user = await create_or_get_google_user(google_user_info, db)
        
        # Create access token
        access_token = create_access_token(
            data={"sub": user.id, "email": user.email}
        )
        
        token = Token(
            access_token=access_token,
            expires_in=3600 * 24  # 24 hours
        )
        
        return UserResponse(user=user, token=token)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Google callback error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process Google authentication"
        )

@router.post("/logout", response_model=ApiResponse)
async def logout():
    """Logout user (client-side token removal)"""
    return ApiResponse(
        success=True,
        message="Logged out successfully"
    )

@router.post("/refresh", response_model=Token)
async def refresh_token(
    current_user = Depends(get_current_user)
):
    """Refresh access token"""
    try:
        access_token = create_access_token(
            data={"sub": current_user.id, "email": current_user.email}
        )
        
        return Token(
            access_token=access_token,
            expires_in=3600 * 24  # 24 hours
        )
        
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to refresh token"
        )