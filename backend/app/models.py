from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class UserType(str, Enum):
    GUEST = "guest"
    GOOGLE = "google"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

# User Models
class User(BaseModel):
    id: str
    name: str
    email: Optional[EmailStr] = None
    avatar: Optional[str] = None
    type: UserType
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    type: UserType = UserType.GUEST

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    avatar: Optional[str] = None

# Item Models
class Price(BaseModel):
    amount: float = Field(gt=0)
    label: str

class Item(BaseModel):
    id: str
    name: str
    prices: List[Price]
    current_price: float = Field(gt=0)
    description: Optional[str] = None
    category: Optional[str] = None
    image: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ItemCreate(BaseModel):
    name: str
    prices: List[Price]
    current_price: float = Field(gt=0)
    description: Optional[str] = None
    category: Optional[str] = None
    image: Optional[str] = None

class ItemUpdate(BaseModel):
    name: Optional[str] = None
    prices: Optional[List[Price]] = None
    current_price: Optional[float] = Field(None, gt=0)
    description: Optional[str] = None
    category: Optional[str] = None
    image: Optional[str] = None

# Cart Models
class CartItem(BaseModel):
    item: Item
    quantity: int = Field(gt=0)

class Cart(BaseModel):
    user_id: str
    items: List[CartItem] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    def get_total_price(self) -> float:
        return sum(cart_item.item.current_price * cart_item.quantity for cart_item in self.items)
    
    def get_total_items(self) -> int:
        return sum(cart_item.quantity for cart_item in self.items)

# Payment Models
class PaymentRequest(BaseModel):
    cart_id: str
    payment_method: str = "stripe"
    currency: str = "usd"
    metadata: Optional[Dict[str, Any]] = None

class Payment(BaseModel):
    id: str
    user_id: str
    cart_id: str
    amount: float
    currency: str
    status: PaymentStatus
    payment_method: str
    stripe_payment_intent_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Authentication Models
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int

class TokenData(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None

class OAuthCallback(BaseModel):
    code: str
    state: Optional[str] = None

# Response Models
class ApiResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None

class UserResponse(BaseModel):
    user: User
    token: Token

class ItemListResponse(BaseModel):
    items: List[Item]
    total: int

class CartResponse(BaseModel):
    cart: Cart
    total_price: float
    total_items: int