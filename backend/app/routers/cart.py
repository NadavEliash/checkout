from fastapi import APIRouter, HTTPException, Depends, status
from app.models import Cart, CartItem, CartResponse, ApiResponse, Item
from app.auth import get_current_user
from app.database import get_database, RedisDatabase
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/", response_model=CartResponse)
async def get_cart(
    current_user = Depends(get_current_user),
    db: RedisDatabase = Depends(get_database)
):
    """Get user's shopping cart"""
    try:
        cart_data = await db.get(f"cart:{current_user.id}")
        
        if not cart_data:
            # Create empty cart
            cart = Cart(user_id=current_user.id)
        else:
            cart = Cart(**cart_data)
        
        total_price = cart.get_total_price()
        total_items = cart.get_total_items()
        
        return CartResponse(
            cart=cart,
            total_price=total_price,
            total_items=total_items
        )
        
    except Exception as e:
        logger.error(f"Get cart error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get cart"
        )

@router.post("/items/{item_id}", response_model=CartResponse)
async def add_to_cart(
    item_id: str,
    quantity: int = 1,
    current_user = Depends(get_current_user),
    db: RedisDatabase = Depends(get_database)
):
    """Add item to cart"""
    try:
        if quantity <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Quantity must be greater than 0"
            )
        
        # Get item
        item_data = await db.get(f"item:{current_user.id}:{item_id}")
        if not item_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Item not found"
            )
        
        item = Item(**item_data)
        
        # Get or create cart
        cart_data = await db.get(f"cart:{current_user.id}")
        if cart_data:
            cart = Cart(**cart_data)
        else:
            cart = Cart(user_id=current_user.id)
        
        # Check if item already in cart
        existing_item_index = None
        for i, cart_item in enumerate(cart.items):
            if cart_item.item.id == item_id:
                existing_item_index = i
                break
        
        if existing_item_index is not None:
            # Update quantity
            cart.items[existing_item_index].quantity += quantity
        else:
            # Add new item
            cart_item = CartItem(item=item, quantity=quantity)
            cart.items.append(cart_item)
        
        # Update timestamp
        from datetime import datetime
        cart.updated_at = datetime.utcnow()
        
        # Save cart
        await db.set(f"cart:{current_user.id}", cart.dict())
        
        total_price = cart.get_total_price()
        total_items = cart.get_total_items()
        
        return CartResponse(
            cart=cart,
            total_price=total_price,
            total_items=total_items
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Add to cart error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add item to cart"
        )

@router.put("/items/{item_id}", response_model=CartResponse)
async def update_cart_item(
    item_id: str,
    quantity: int,
    current_user = Depends(get_current_user),
    db: RedisDatabase = Depends(get_database)
):
    """Update item quantity in cart"""
    try:
        if quantity < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Quantity cannot be negative"
            )
        
        # Get cart
        cart_data = await db.get(f"cart:{current_user.id}")
        if not cart_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cart not found"
            )
        
        cart = Cart(**cart_data)
        
        # Find item in cart
        item_index = None
        for i, cart_item in enumerate(cart.items):
            if cart_item.item.id == item_id:
                item_index = i
                break
        
        if item_index is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Item not found in cart"
            )
        
        if quantity == 0:
            # Remove item from cart
            cart.items.pop(item_index)
        else:
            # Update quantity
            cart.items[item_index].quantity = quantity
        
        # Update timestamp
        from datetime import datetime
        cart.updated_at = datetime.utcnow()
        
        # Save cart
        await db.set(f"cart:{current_user.id}", cart.dict())
        
        total_price = cart.get_total_price()
        total_items = cart.get_total_items()
        
        return CartResponse(
            cart=cart,
            total_price=total_price,
            total_items=total_items
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update cart item error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update cart item"
        )

@router.delete("/items/{item_id}", response_model=CartResponse)
async def remove_from_cart(
    item_id: str,
    current_user = Depends(get_current_user),
    db: RedisDatabase = Depends(get_database)
):
    """Remove item from cart"""
    return await update_cart_item(item_id, 0, current_user, db)

@router.delete("/", response_model=ApiResponse)
async def clear_cart(
    current_user = Depends(get_current_user),
    db: RedisDatabase = Depends(get_database)
):
    """Clear all items from cart"""
    try:
        await db.delete(f"cart:{current_user.id}")
        
        return ApiResponse(
            success=True,
            message="Cart cleared successfully"
        )
        
    except Exception as e:
        logger.error(f"Clear cart error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to clear cart"
        )