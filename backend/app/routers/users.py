from fastapi import APIRouter, HTTPException, Depends, status
from app.models import User, UserUpdate, ApiResponse
from app.auth import get_current_user
from app.database import get_database, RedisDatabase
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/me", response_model=User)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """Get current user information"""
    return current_user

@router.put("/me", response_model=User)
async def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: RedisDatabase = Depends(get_database)
):
    """Update current user information"""
    try:
        # Update user fields
        update_data = user_update.dict(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(current_user, field, value)
        
        # Update timestamp
        from datetime import datetime
        current_user.updated_at = datetime.utcnow()
        
        # Save to database
        await db.set(f"user:{current_user.id}", current_user.dict())
        
        return current_user
        
    except Exception as e:
        logger.error(f"User update error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user"
        )

@router.delete("/me", response_model=ApiResponse)
async def delete_current_user(
    current_user: User = Depends(get_current_user),
    db: RedisDatabase = Depends(get_database)
):
    """Delete current user account"""
    try:
        # Delete user data
        await db.delete(f"user:{current_user.id}")
        
        # Delete user's items
        user_items = await db.get_all_keys(f"item:{current_user.id}:*")
        for item_key in user_items:
            await db.delete(item_key)
        
        # Delete user's cart
        await db.delete(f"cart:{current_user.id}")
        
        return ApiResponse(
            success=True,
            message="User account deleted successfully"
        )
        
    except Exception as e:
        logger.error(f"User deletion error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete user account"
        )