from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx
from app.config import settings
from app.models import User, TokenData
from app.database import get_database, RedisDatabase
import uuid
import logging

logger = logging.getLogger(__name__)

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=settings.jwt_expiration_hours)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    return encoded_jwt

def verify_token(token: str) -> Optional[TokenData]:
    """Verify JWT token and return token data"""
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        user_id: str = payload.get("sub")
        email: str = payload.get("email")
        
        if user_id is None:
            return None
            
        token_data = TokenData(user_id=user_id, email=email)
        return token_data
    except JWTError:
        return None

async def get_user_by_id(user_id: str, db: RedisDatabase) -> Optional[User]:
    """Get user by ID from database"""
    try:
        user_data = await db.get(f"user:{user_id}")
        if user_data:
            return User(**user_data)
        return None
    except Exception as e:
        logger.error(f"Error getting user {user_id}: {e}")
        return None

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: RedisDatabase = Depends(get_database)
) -> User:
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = credentials.credentials
    token_data = verify_token(token)
    
    if token_data is None or token_data.user_id is None:
        raise credentials_exception
    
    user = await get_user_by_id(token_data.user_id, db)
    if user is None:
        raise credentials_exception
    
    return user

async def create_guest_user(name: str, db: RedisDatabase) -> User:
    """Create a new guest user"""
    user_id = f"guest_{uuid.uuid4().hex}"
    user = User(
        id=user_id,
        name=name,
        type="guest"
    )
    
    # Save user to database
    await db.set(f"user:{user_id}", user.dict())
    
    return user

async def get_google_user_info(access_token: str) -> Optional[Dict[str, Any]]:
    """Get user info from Google OAuth2"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            if response.status_code == 200:
                return response.json()
            return None
    except Exception as e:
        logger.error(f"Error getting Google user info: {e}")
        return None

async def exchange_google_code(code: str) -> Optional[Dict[str, Any]]:
    """Exchange Google OAuth2 code for access token"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "client_id": settings.google_client_id,
                    "client_secret": settings.google_client_secret,
                    "code": code,
                    "grant_type": "authorization_code",
                    "redirect_uri": settings.oauth_redirect_uri,
                }
            )
            
            if response.status_code == 200:
                return response.json()
            return None
    except Exception as e:
        logger.error(f"Error exchanging Google code: {e}")
        return None

async def create_or_get_google_user(google_user_info: Dict[str, Any], db: RedisDatabase) -> User:
    """Create or get Google user from user info"""
    google_id = google_user_info.get("id")
    email = google_user_info.get("email")
    name = google_user_info.get("name", email)
    avatar = google_user_info.get("picture")
    
    user_id = f"google_{google_id}"
    
    # Check if user already exists
    existing_user = await get_user_by_id(user_id, db)
    if existing_user:
        return existing_user
    
    # Create new Google user
    user = User(
        id=user_id,
        name=name,
        email=email,
        avatar=avatar,
        type="google"
    )
    
    # Save user to database
    await db.set(f"user:{user_id}", user.dict())
    
    return user

# Optional user dependency (doesn't require authentication)
async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: RedisDatabase = Depends(get_database)
) -> Optional[User]:
    """Get current user if authenticated, otherwise return None"""
    if not credentials:
        return None
    
    try:
        return await get_current_user(credentials, db)
    except HTTPException:
        return None