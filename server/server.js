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

// Start server
async function startServer() {
  await connectRedis();
  
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`CORS enabled for: ${corsOptions.origin.join(', ')}`);
  });
}

startServer();