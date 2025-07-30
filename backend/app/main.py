from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import logging
from app.config import settings
from app.database import db
from app.routers import auth, users, items, cart, payments
from app.models import ApiResponse

# Configure logging
logging.basicConfig(
    level=logging.INFO if not settings.debug else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("Starting up Checkout App backend...")
    try:
        await db.connect()
        logger.info("Backend startup completed successfully")
    except Exception as e:
        logger.error(f"Failed to start backend: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down Checkout App backend...")
    try:
        await db.disconnect()
        logger.info("Backend shutdown completed successfully")
    except Exception as e:
        logger.error(f"Error during shutdown: {e}")

# Create FastAPI app
app = FastAPI(
    title="Checkout App API",
    description="Backend API for the Checkout App with OAuth2, Redis, and payment processing",
    version="1.0.0",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Add trusted host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.allowed_hosts
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(items.router, prefix="/api/items", tags=["Items"])
app.include_router(cart.router, prefix="/api/cart", tags=["Cart"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])

@app.get("/", response_model=ApiResponse)
async def root():
    """Root endpoint"""
    return ApiResponse(
        success=True,
        message="Checkout App API is running",
        data={
            "version": "1.0.0",
            "status": "healthy",
            "debug": settings.debug
        }
    )

@app.get("/health", response_model=ApiResponse)
async def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        await db.redis_client.ping()
        
        return ApiResponse(
            success=True,
            message="Service is healthy",
            data={
                "database": "connected",
                "timestamp": "2025-01-30T12:00:00Z"
            }
        )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service unhealthy"
        )

@app.get("/api/config")
async def get_config():
    """Get public configuration for frontend"""
    return {
        "google_client_id": settings.google_client_id,
        "stripe_publishable_key": settings.stripe_publishable_key,
        "oauth_redirect_uri": settings.oauth_redirect_uri,
        "max_file_size": settings.max_file_size,
        "allowed_extensions": settings.allowed_extensions
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level="debug" if settings.debug else "info"
    )