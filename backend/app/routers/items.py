from fastapi import APIRouter, HTTPException, Depends, status, Query, UploadFile, File
from typing import List, Optional
from app.models import Item, ItemCreate, ItemUpdate, ItemListResponse, ApiResponse
from app.auth import get_current_user
from app.database import get_database, RedisDatabase
import uuid
import logging
import aiofiles
import os
from PIL import Image

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/", response_model=ItemListResponse)
async def get_items(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = None,
    category: Optional[str] = None,
    current_user = Depends(get_current_user),
    db: RedisDatabase = Depends(get_database)
):
    """Get user's items with pagination and filtering"""
    try:
        # Get all user items
        item_keys = await db.get_all_keys(f"item:{current_user.id}:*")
        items = []
        
        for item_key in item_keys:
            item_data = await db.get(item_key)
            if item_data:
                item = Item(**item_data)
                
                # Apply filters
                if search and search.lower() not in item.name.lower():
                    continue
                if category and item.category != category:
                    continue
                
                items.append(item)
        
        # Sort by creation date (newest first)
        items.sort(key=lambda x: x.created_at, reverse=True)
        
        # Apply pagination
        total = len(items)
        items = items[skip:skip + limit]
        
        return ItemListResponse(items=items, total=total)
        
    except Exception as e:
        logger.error(f"Get items error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get items"
        )

@router.get("/{item_id}", response_model=Item)
async def get_item(
    item_id: str,
    current_user = Depends(get_current_user),
    db: RedisDatabase = Depends(get_database)
):
    """Get specific item by ID"""
    try:
        item_data = await db.get(f"item:{current_user.id}:{item_id}")
        if not item_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Item not found"
            )
        
        return Item(**item_data)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get item error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get item"
        )

@router.post("/", response_model=Item)
async def create_item(
    item_data: ItemCreate,
    current_user = Depends(get_current_user),
    db: RedisDatabase = Depends(get_database)
):
    """Create new item"""
    try:
        item_id = str(uuid.uuid4())
        item = Item(
            id=item_id,
            **item_data.dict()
        )
        
        # Save to database
        await db.set(f"item:{current_user.id}:{item_id}", item.dict())
        
        return item
        
    except Exception as e:
        logger.error(f"Create item error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create item"
        )

@router.put("/{item_id}", response_model=Item)
async def update_item(
    item_id: str,
    item_update: ItemUpdate,
    current_user = Depends(get_current_user),
    db: RedisDatabase = Depends(get_database)
):
    """Update existing item"""
    try:
        # Get existing item
        item_data = await db.get(f"item:{current_user.id}:{item_id}")
        if not item_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Item not found"
            )
        
        item = Item(**item_data)
        
        # Update fields
        update_data = item_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(item, field, value)
        
        # Update timestamp
        from datetime import datetime
        item.updated_at = datetime.utcnow()
        
        # Save to database
        await db.set(f"item:{current_user.id}:{item_id}", item.dict())
        
        return item
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update item error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update item"
        )

@router.delete("/{item_id}", response_model=ApiResponse)
async def delete_item(
    item_id: str,
    current_user = Depends(get_current_user),
    db: RedisDatabase = Depends(get_database)
):
    """Delete item"""
    try:
        # Check if item exists
        if not await db.exists(f"item:{current_user.id}:{item_id}"):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Item not found"
            )
        
        # Delete item
        await db.delete(f"item:{current_user.id}:{item_id}")
        
        return ApiResponse(
            success=True,
            message="Item deleted successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete item error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete item"
        )

@router.post("/upload-image")
async def upload_item_image(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user)
):
    """Upload image for item"""
    try:
        from app.config import settings
        
        # Validate file type
        if not file.filename.lower().endswith(tuple(settings.allowed_extensions)):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type. Allowed types: {', '.join(settings.allowed_extensions)}"
            )
        
        # Check file size
        content = await file.read()
        if len(content) > settings.max_file_size:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File too large. Maximum size: {settings.max_file_size} bytes"
            )
        
        # Generate unique filename
        file_extension = file.filename.split('.')[-1].lower()
        filename = f"{current_user.id}_{uuid.uuid4().hex}.{file_extension}"
        file_path = os.path.join(settings.upload_dir, filename)
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(content)
        
        # Optionally optimize image
        try:
            with Image.open(file_path) as img:
                # Convert to RGB if needed
                if img.mode in ("RGBA", "P"):
                    img = img.convert("RGB")
                
                # Resize if too large
                max_size = (1200, 1200)
                img.thumbnail(max_size, Image.Resampling.LANCZOS)
                
                # Save optimized image
                img.save(file_path, optimize=True, quality=85)
        except Exception as e:
            logger.warning(f"Image optimization failed: {e}")
        
        return {
            "filename": filename,
            "url": f"/uploads/{filename}",
            "size": len(content)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload image error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload image"
        )