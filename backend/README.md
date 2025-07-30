# Checkout App Backend

A FastAPI-based backend for the Checkout App with OAuth2 authentication, Redis database, and Stripe payment processing.

## Features

- **FastAPI Framework**: Modern, fast web framework for building APIs
- **OAuth2 Authentication**: Support for Google OAuth2 and guest login
- **Redis Database**: Fast, in-memory data storage
- **Stripe Payments**: Secure payment processing
- **File Uploads**: Image upload and optimization
- **CORS Support**: Cross-origin requests enabled
- **JWT Tokens**: Secure authentication tokens
- **Async Operations**: High-performance async operations

## Quick Start

### Prerequisites

- Python 3.8+
- Redis server
- Stripe account (for payments)
- Google OAuth2 credentials (optional)

### Installation

1. **Clone and navigate to backend directory:**
```bash
cd backend
```

2. **Create virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Start Redis server:**
```bash
redis-server
```

6. **Run the application:**
```bash
python run.py
```

The API will be available at `http://localhost:8000`

## Configuration

Edit the `.env` file with your settings:

### Required Settings
- `SECRET_KEY`: Your application secret key
- `REDIS_URL`: Redis connection URL
- `JWT_SECRET_KEY`: JWT signing key

### Optional Settings
- `GOOGLE_CLIENT_ID`: Google OAuth2 client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth2 client secret
- `STRIPE_SECRET_KEY`: Stripe secret key
- `STRIPE_PUBLISHABLE_KEY`: Stripe publishable key

## API Endpoints

### Authentication
- `POST /api/auth/guest` - Login as guest
- `GET /api/auth/google` - Get Google OAuth2 URL
- `POST /api/auth/google/callback` - Handle Google OAuth2 callback
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token

### Users
- `GET /api/users/me` - Get current user info
- `PUT /api/users/me` - Update current user
- `DELETE /api/users/me` - Delete current user

### Items
- `GET /api/items/` - Get user's items
- `GET /api/items/{item_id}` - Get specific item
- `POST /api/items/` - Create new item
- `PUT /api/items/{item_id}` - Update item
- `DELETE /api/items/{item_id}` - Delete item
- `POST /api/items/upload-image` - Upload item image

### Cart
- `GET /api/cart/` - Get user's cart
- `POST /api/cart/items/{item_id}` - Add item to cart
- `PUT /api/cart/items/{item_id}` - Update cart item quantity
- `DELETE /api/cart/items/{item_id}` - Remove item from cart
- `DELETE /api/cart/` - Clear cart

### Payments
- `POST /api/payments/create-payment-intent` - Create Stripe payment
- `GET /api/payments/{payment_id}` - Get payment status
- `GET /api/payments/` - Get payment history
- `POST /api/payments/webhook` - Stripe webhook handler

### System
- `GET /` - API status
- `GET /health` - Health check
- `GET /api/config` - Get public configuration

## API Documentation

When running in debug mode, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Development

### Project Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py          # FastAPI application
│   ├── config.py        # Configuration settings
│   ├── database.py      # Redis database connection
│   ├── auth.py          # Authentication utilities
│   ├── models.py        # Pydantic models
│   └── routers/         # API route handlers
│       ├── __init__.py
│       ├── auth.py      # Authentication routes
│       ├── users.py     # User management routes
│       ├── items.py     # Item management routes
│       ├── cart.py      # Shopping cart routes
│       └── payments.py  # Payment processing routes
├── uploads/             # File upload directory
├── requirements.txt     # Python dependencies
├── .env.example        # Environment variables template
├── run.py              # Application runner
└── README.md           # This file
```

### Running Tests
```bash
pytest  # Add tests in tests/ directory
```

### Database Schema

The application uses Redis with the following key patterns:
- `user:{user_id}` - User data
- `item:{user_id}:{item_id}` - User's items
- `cart:{user_id}` - User's shopping cart
- `payment:{payment_id}` - Payment records

## Deployment

### Production Setup

1. **Set production environment variables:**
```bash
DEBUG=False
SECRET_KEY=your-production-secret-key
JWT_SECRET_KEY=your-production-jwt-key
```

2. **Use a production WSGI server:**
```bash
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

3. **Set up reverse proxy (Nginx):**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Security

- JWT tokens for authentication
- CORS protection
- File upload validation
- Environment variable configuration
- Secure password hashing (for future user accounts)

## Support

For issues and questions, please check the API documentation or create an issue in the project repository.