from fastapi import APIRouter, HTTPException, Depends, status, Request
from app.models import PaymentRequest, Payment, PaymentStatus, Cart, ApiResponse
from app.auth import get_current_user
from app.database import get_database, RedisDatabase
import stripe
import uuid
import logging
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize Stripe
from app.config import settings
stripe.api_key = settings.stripe_secret_key

@router.post("/create-payment-intent")
async def create_payment_intent(
    payment_request: PaymentRequest,
    current_user = Depends(get_current_user),
    db: RedisDatabase = Depends(get_database)
):
    """Create Stripe payment intent"""
    try:
        # Get cart
        cart_data = await db.get(f"cart:{current_user.id}")
        if not cart_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cart not found"
            )
        
        cart = Cart(**cart_data)
        if not cart.items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cart is empty"
            )
        
        # Calculate total amount (in cents for Stripe)
        total_amount = int(cart.get_total_price() * 100)
        
        # Create payment record
        payment_id = str(uuid.uuid4())
        payment = Payment(
            id=payment_id,
            user_id=current_user.id,
            cart_id=payment_request.cart_id,
            amount=cart.get_total_price(),
            currency=payment_request.currency,
            status=PaymentStatus.PENDING,
            payment_method=payment_request.payment_method,
            metadata=payment_request.metadata or {}
        )
        
        # Create Stripe payment intent
        intent = stripe.PaymentIntent.create(
            amount=total_amount,
            currency=payment_request.currency,
            metadata={
                "payment_id": payment_id,
                "user_id": current_user.id,
                "cart_id": payment_request.cart_id
            }
        )
        
        # Update payment with Stripe data
        payment.stripe_payment_intent_id = intent.id
        
        # Save payment to database
        await db.set(f"payment:{payment_id}", payment.dict())
        
        return {
            "client_secret": intent.client_secret,
            "payment_id": payment_id,
            "amount": total_amount,
            "currency": payment_request.currency
        }
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Payment processing error: {str(e)}"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create payment intent error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create payment intent"
        )

@router.get("/{payment_id}")
async def get_payment(
    payment_id: str,
    current_user = Depends(get_current_user),
    db: RedisDatabase = Depends(get_database)
):
    """Get payment status"""
    try:
        payment_data = await db.get(f"payment:{payment_id}")
        if not payment_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment not found"
            )
        
        payment = Payment(**payment_data)
        
        # Verify payment belongs to current user
        if payment.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        return payment
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get payment error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get payment"
        )

@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    db: RedisDatabase = Depends(get_database)
):
    """Handle Stripe webhooks"""
    try:
        payload = await request.body()
        sig_header = request.headers.get('stripe-signature')
        
        # Verify webhook signature
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.stripe_webhook_secret
        )
        
        # Handle payment intent events
        if event['type'] == 'payment_intent.succeeded':
            payment_intent = event['data']['object']
            payment_id = payment_intent['metadata'].get('payment_id')
            
            if payment_id:
                # Update payment status
                payment_data = await db.get(f"payment:{payment_id}")
                if payment_data:
                    payment = Payment(**payment_data)
                    payment.status = PaymentStatus.COMPLETED
                    payment.updated_at = datetime.utcnow()
                    
                    await db.set(f"payment:{payment_id}", payment.dict())
                    
                    # Clear user's cart after successful payment
                    await db.delete(f"cart:{payment.user_id}")
                    
        elif event['type'] == 'payment_intent.payment_failed':
            payment_intent = event['data']['object']
            payment_id = payment_intent['metadata'].get('payment_id')
            
            if payment_id:
                # Update payment status
                payment_data = await db.get(f"payment:{payment_id}")
                if payment_data:
                    payment = Payment(**payment_data)
                    payment.status = PaymentStatus.FAILED
                    payment.updated_at = datetime.utcnow()
                    
                    await db.set(f"payment:{payment_id}", payment.dict())
        
        return {"status": "success"}
        
    except stripe.error.SignatureVerificationError:
        logger.error("Invalid Stripe webhook signature")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid signature"
        )
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Webhook processing failed"
        )

@router.get("/")
async def get_user_payments(
    current_user = Depends(get_current_user),
    db: RedisDatabase = Depends(get_database)
):
    """Get user's payment history"""
    try:
        # Get all payment keys for user
        payment_keys = await db.get_all_keys("payment:*")
        user_payments = []
        
        for payment_key in payment_keys:
            payment_data = await db.get(payment_key)
            if payment_data:
                payment = Payment(**payment_data)
                if payment.user_id == current_user.id:
                    user_payments.append(payment)
        
        # Sort by creation date (newest first)
        user_payments.sort(key=lambda x: x.created_at, reverse=True)
        
        return user_payments
        
    except Exception as e:
        logger.error(f"Get user payments error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get payment history"
        )