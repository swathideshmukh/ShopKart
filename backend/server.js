const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// ======================
// Load environment variables
// ======================
dotenv.config();

const app = express();

// ======================
// Middleware
// ======================
app.use(express.json());

// ======================
// CORS Configuration
// ======================
const defaultOrigins = [
  'https://shop-kart-git-main-swathideshmukhs-projects.vercel.app',
  'https://shop-kart-ten.vercel.app', // ✅ Added your Vercel deployment
  'https://shopkart-tpug.onrender.com', // frontend if hosted on Render
  'http://localhost:3000',
  'http://localhost:5500'
];

const envOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
  : [];

const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Allow Postman / server-to-server
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.error(`❌ CORS blocked for origin: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// ======================
// Routes
// ======================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'API is running' });
});

// ======================
// MongoDB Connection
// ======================
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env');
    }
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// ======================
// Error Handling
// ======================
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// ======================
// Start Server
// ======================
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
  });
});

module.exports = app;
