const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Body parser
app.use(express.json());

// --- CORS Setup ---
const allowedOrigins = [
  'https://shop-kart-m758ol95v-swathideshmukhs-projects.vercel.app', // Current Vercel frontend
  'https://shop-kart-git-main-swathideshmukhs-projects.vercel.app', // Vercel production
  'http://localhost:3000' // Local development
];

// Use env var if provided (comma-separated list)
if (process.env.CORS_ORIGINS) {
  allowedOrigins.push(...process.env.CORS_ORIGINS.split(','));
}

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like curl, mobile apps)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`CORS blocked for origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

// --- Routes ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

// --- MongoDB Connection ---
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// --- Error Handling ---
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
  });
});

module.exports = app;
