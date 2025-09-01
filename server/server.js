const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const redis = require('redis');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// Redis client
const redisClient = redis.createClient({
  url: process.env.REDIS_URL
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

// Connect to Redis
async function connectRedis() {
  try {
    await redisClient.connect();
    console.log('Connected to Redis successfully');
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
  }
}

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Test endpoint
app.get('/test-cors', (req, res) => {
  res.json({ message: 'CORS is working!', timestamp: new Date().toISOString() });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    redis: redisClient.isReady ? 'connected' : 'disconnected'
  });
});

// Google OAuth endpoints
app.get('/api/auth/google', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${process.env.CORS_ORIGIN}/auth/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    include_granted_scopes: 'true',
    state: 'google_oauth'
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  
  res.json({ auth_url: authUrl });
});

app.post('/api/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.body;
    
    // Exchange code for tokens
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: `${process.env.CORS_ORIGIN}/auth/callback`
    });

    const { access_token } = tokenResponse.data;

    // Get user info from Google
    const userResponse = await axios.get(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${access_token}`);
    const googleUser = userResponse.data;

    // Create or get user from Redis
    const userId = `google_${googleUser.id}`;
    let user = await redisClient.hGetAll(`user:${userId}`);
    
    if (!Object.keys(user).length) {
      user = {
        id: userId,
        name: googleUser.name,
        email: googleUser.email,
        avatar: googleUser.picture,
        type: 'google',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      await redisClient.hSet(`user:${userId}`, user);
    } else {
      // Update last login
      user.updated_at = new Date().toISOString();
      await redisClient.hSet(`user:${userId}`, 'updated_at', user.updated_at);
    }

    // Create JWT token
    const jwtToken = jwt.sign(
      { sub: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      user: user,
      token: {
        access_token: jwtToken,
        token_type: 'Bearer',
        expires_in: 86400
      }
    });

  } catch (error) {
    console.error('Google callback error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Guest login
app.post('/api/auth/guest', async (req, res) => {
  try {
    const { name } = req.body;
    const userId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const user = {
      id: userId,
      name: name || 'אורח',
      type: 'guest',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await redisClient.hSet(`user:${userId}`, user);

    const jwtToken = jwt.sign(
      { sub: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      user: user,
      token: {
        access_token: jwtToken,
        token_type: 'Bearer',
        expires_in: 86400
      }
    });

  } catch (error) {
    console.error('Guest login error:', error);
    res.status(500).json({ error: 'Guest login failed' });
  }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  // For stateless JWT, logout is handled client-side
  res.json({ success: true, message: 'Logged out successfully' });
});

// Token refresh endpoint
app.post('/api/auth/refresh', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    
    // Check if user still exists
    const user = await redisClient.hGetAll(`user:${userId}`);
    if (!Object.keys(user).length) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Generate new token
    const jwtToken = jwt.sign(
      { sub: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      access_token: jwtToken,
      token_type: 'Bearer',
      expires_in: 86400
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

// JWT authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// User management endpoints
app.get('/api/users/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    const user = await redisClient.hGetAll(`user:${userId}`);
    
    if (!Object.keys(user).length) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

app.put('/api/users/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    const updates = req.body;
    
    // Get current user
    const user = await redisClient.hGetAll(`user:${userId}`);
    if (!Object.keys(user).length) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update allowed fields
    const allowedFields = ['name', 'email'];
    const updatedUser = { ...user };
    
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        updatedUser[field] = updates[field];
      }
    });
    
    updatedUser.updated_at = new Date().toISOString();
    
    await redisClient.hSet(`user:${userId}`, updatedUser);
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/api/users/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    
    // Delete user data
    await redisClient.del(`user:${userId}`);
    
    // Delete user's items
    const itemKeys = await redisClient.keys(`items:${userId}:*`);
    if (itemKeys.length > 0) {
      await redisClient.del(itemKeys);
    }
    
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Config endpoint
app.get('/api/config', (req, res) => {
  res.json({
    app_name: 'Checkout App',
    version: '1.0.0',
    features: ['google_auth', 'guest_mode', 'items_management']
  });
});

// Items management endpoints
app.get('/api/items', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    
    // Get all item keys for this user
    const itemKeys = await redisClient.keys(`items:${userId}:*`);
    
    if (itemKeys.length === 0) {
      return res.json([]);
    }
    
    // Get all items
    const items = [];
    for (const key of itemKeys) {
      const itemData = await redisClient.hGetAll(key);
      if (Object.keys(itemData).length > 0) {
        // Parse JSON fields
        itemData.prices = JSON.parse(itemData.prices || '[]');
        itemData.currentPrice = parseFloat(itemData.currentPrice || '0');
        items.push(itemData);
      }
    }
    
    // Sort by creation date
    items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    res.json(items);
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ error: 'Failed to get items' });
  }
});

app.post('/api/items', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { name, prices, currentPrice, description } = req.body;
    
    // Validate required fields
    if (!name || !prices || !Array.isArray(prices) || prices.length === 0) {
      return res.status(400).json({ error: 'Name and prices are required' });
    }
    
    // Generate item ID
    const itemId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const item = {
      id: itemId,
      name: name.trim(),
      prices: JSON.stringify(prices),
      currentPrice: currentPrice || 0,
      description: description?.trim() || '',
      createdAt: now,
      updatedAt: now
    };
    
    // Store in Redis
    await redisClient.hSet(`items:${userId}:${itemId}`, item);
    
    // Return item with parsed prices
    const responseItem = {
      ...item,
      prices: JSON.parse(item.prices),
      currentPrice: parseFloat(item.currentPrice)
    };
    
    res.status(201).json(responseItem);
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

app.put('/api/items/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    const itemId = req.params.id;
    const updates = req.body;
    
    // Get existing item
    const existingItem = await redisClient.hGetAll(`items:${userId}:${itemId}`);
    if (!Object.keys(existingItem).length) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Update allowed fields
    const allowedFields = ['name', 'prices', 'currentPrice', 'description'];
    const updatedItem = { ...existingItem };
    
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        if (field === 'prices') {
          updatedItem[field] = JSON.stringify(updates[field]);
        } else {
          updatedItem[field] = updates[field];
        }
      }
    });
    
    updatedItem.updatedAt = new Date().toISOString();
    
    // Store updated item
    await redisClient.hSet(`items:${userId}:${itemId}`, updatedItem);
    
    // Return item with parsed prices
    const responseItem = {
      ...updatedItem,
      prices: JSON.parse(updatedItem.prices),
      currentPrice: parseFloat(updatedItem.currentPrice)
    };
    
    res.json(responseItem);
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

app.delete('/api/items/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    const itemId = req.params.id;
    
    // Check if item exists
    const exists = await redisClient.exists(`items:${userId}:${itemId}`);
    if (!exists) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Delete item
    await redisClient.del(`items:${userId}:${itemId}`);
    
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

app.put('/api/items/reorder', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { items } = req.body;
    
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Items array is required' });
    }
    
    // Update order for each item
    for (const itemOrder of items) {
      const { id, order } = itemOrder;
      const itemKey = `items:${userId}:${id}`;
      
      // Check if item exists
      const exists = await redisClient.exists(itemKey);
      if (exists) {
        await redisClient.hSet(itemKey, 'order', order);
        await redisClient.hSet(itemKey, 'updatedAt', new Date().toISOString());
      }
    }
    
    res.json({ success: true, message: 'Items reordered successfully' });
  } catch (error) {
    console.error('Reorder items error:', error);
    res.status(500).json({ error: 'Failed to reorder items' });
  }
});

// Start server
async function startServer() {
  await connectRedis();
  
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`CORS enabled for: ${corsOptions.origin.join(', ')}`);
  });
}

startServer();