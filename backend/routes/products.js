const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, optionalAuth } = require('../middleware/auth');

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      search, 
      minPrice, 
      maxPrice, 
      sort, 
      page = 1, 
      limit = 12 
    } = req.query;

    // Build query
    const query = {};

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Build sort object
    let sortOption = { createdAt: -1 }; // Default: newest first
    if (sort === 'price-asc') sortOption = { price: 1 };
    if (sort === 'price-desc') sortOption = { price: -1 };
    if (sort === 'name-asc') sortOption = { name: 1 };
    if (sort === 'name-desc') sortOption = { name: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };

    // Execute query with pagination
    const products = await Product.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Get total count
    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/products/categories
// @desc    Get all product categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.status(200).json({
      success: true,
      categories: ['All', ...categories]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/products/featured
// @desc    Get featured products
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ rating: { $gte: 4 } })
      .sort({ rating: -1, numReviews: -1 })
      .limit(8);
    
    res.status(200).json({
      success: true,
      products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/products
// @desc    Create a product
// @access  Private (Admin)
router.post('/', protect, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    
    res.status(201).json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private (Admin)
router.put('/:id', protect, async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private (Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/products/seed
// @desc    Seed sample products
// @access  Public (for demo purposes)
router.post('/seed', async (req, res) => {
  try {
    // Sample products data - 30 products across all categories
    const sampleProducts = [
      // Electronics (10 products)
      {
        name: 'Wireless Bluetooth Headphones',
        description: 'High-quality wireless headphones with noise cancellation, 30-hour battery life, and premium sound quality.',
        price: 149.99,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
        category: 'Electronics',
        stock: 50,
        rating: 4.5,
        numReviews: 128
      },
      {
        name: 'Smart Watch Pro',
        description: 'Feature-rich smartwatch with health monitoring, GPS tracking, and seamless smartphone integration.',
        price: 299.99,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
        category: 'Electronics',
        stock: 35,
        rating: 4.8,
        numReviews: 256
      },
      {
        name: 'Portable Power Bank 20000mAh',
        description: 'High-capacity power bank with fast charging support for all your devices.',
        price: 59.99,
        image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400',
        category: 'Electronics',
        stock: 80,
        rating: 4.3,
        numReviews: 198
      },
      {
        name: 'Wireless Gaming Mouse',
        description: 'High-precision gaming mouse with customizable RGB lighting and programmable buttons.',
        price: 69.99,
        image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400',
        category: 'Electronics',
        stock: 55,
        rating: 4.7,
        numReviews: 287
      },
      {
        name: 'Mechanical Keyboard RGB',
        description: 'Full-size mechanical keyboard with RGB backlighting and Cherry MX switches.',
        price: 129.99,
        image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400',
        category: 'Electronics',
        stock: 40,
        rating: 4.6,
        numReviews: 156
      },
      {
        name: 'Wireless Earbuds Pro',
        description: 'Premium wireless earbuds with active noise cancellation and spatial audio.',
        price: 199.99,
        image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
        category: 'Electronics',
        stock: 65,
        rating: 4.4,
        numReviews: 203
      },
      {
        name: 'Tablet Stand Aluminum',
        description: 'Adjustable aluminum tablet and laptop stand with ergonomic viewing angle.',
        price: 44.99,
        image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',
        category: 'Electronics',
        stock: 120,
        rating: 4.2,
        numReviews: 89
      },
      {
        name: 'USB-C Hub 7-in-1',
        description: 'Multi-port USB-C hub with HDMI, USB 3.0, SD card reader, and power delivery.',
        price: 54.99,
        image: 'https://images.unsplash.com/photo-1623126908029-58cb08a2b272?w=400',
        category: 'Electronics',
        stock: 75,
        rating: 4.5,
        numReviews: 167
      },
      {
        name: 'Webcam HD 1080p',
        description: 'Full HD webcam with built-in microphone and automatic low-light correction.',
        price: 79.99,
        image: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=400',
        category: 'Electronics',
        stock: 45,
        rating: 4.3,
        numReviews: 112
      },
      {
        name: 'Bluetooth Speaker Waterproof',
        description: 'Portable waterproof Bluetooth speaker with 360-degree sound and 20-hour battery.',
        price: 89.99,
        image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
        category: 'Electronics',
        stock: 60,
        rating: 4.6,
        numReviews: 234
      },
      // Clothing (5 products)
      {
        name: 'Organic Cotton T-Shirt',
        description: 'Eco-friendly cotton t-shirt with a comfortable fit and modern design.',
        price: 34.99,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
        category: 'Clothing',
        stock: 200,
        rating: 4.2,
        numReviews: 45
      },
      {
        name: 'Leather Wallet',
        description: 'Genuine leather wallet with RFID protection and multiple card slots.',
        price: 79.99,
        image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400',
        category: 'Clothing',
        stock: 45,
        rating: 4.6,
        numReviews: 134
      },
      {
        name: 'Denim Jacket Classic',
        description: 'Timeless denim jacket with modern fit and premium quality denim.',
        price: 119.99,
        image: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400',
        category: 'Clothing',
        stock: 30,
        rating: 4.5,
        numReviews: 78
      },
      {
        name: 'Running Shorts Performance',
        description: 'Lightweight running shorts with moisture-wicking fabric and built-in liner.',
        price: 44.99,
        image: 'https://images.unsplash.com/photo-1518458028785-8fbcd101ebb9?w=400',
        category: 'Clothing',
        stock: 85,
        rating: 4.4,
        numReviews: 92
      },
      {
        name: 'Casual Sneakers White',
        description: 'Classic white sneakers with comfortable cushioned sole and breathable upper.',
        price: 89.99,
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
        category: 'Clothing',
        stock: 55,
        rating: 4.3,
        numReviews: 187
      },
      // Sports (5 products)
      {
        name: 'Running Shoes Ultra',
        description: 'Lightweight and comfortable running shoes with advanced cushioning technology.',
        price: 129.99,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
        category: 'Sports',
        stock: 100,
        rating: 4.6,
        numReviews: 89
      },
      {
        name: 'Yoga Mat Premium',
        description: 'Non-slip yoga mat with extra cushioning for comfortable practice.',
        price: 44.99,
        image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400',
        category: 'Sports',
        stock: 60,
        rating: 4.5,
        numReviews: 76
      },
      {
        name: 'Resistance Bands Set',
        description: 'Set of 5 resistance bands with different resistance levels and carrying case.',
        price: 24.99,
        image: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400',
        category: 'Sports',
        stock: 150,
        rating: 4.4,
        numReviews: 234
      },
      {
        name: 'Adjustable Dumbbells Set',
        description: 'Space-saving adjustable dumbbells from 5-25 lbs with quick-change system.',
        price: 249.99,
        image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=400',
        category: 'Sports',
        stock: 20,
        rating: 4.8,
        numReviews: 145
      },
      {
        name: 'Fitness Tracker Band',
        description: 'Slim fitness tracker with heart rate monitoring, sleep tracking, and GPS.',
        price: 79.99,
        image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400',
        category: 'Sports',
        stock: 70,
        rating: 4.2,
        numReviews: 98
      },
      // Home (5 products)
      {
        name: 'Modern Desk Lamp',
        description: 'Sleek LED desk lamp with adjustable brightness and color temperature.',
        price: 49.99,
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400',
        category: 'Home',
        stock: 75,
        rating: 4.4,
        numReviews: 67
      },
      {
        name: 'Indoor Plant Pot Set',
        description: 'Set of 3 ceramic plant pots with drainage holes and bamboo trays.',
        price: 39.99,
        image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400',
        category: 'Home',
        stock: 90,
        rating: 4.4,
        numReviews: 52
      },
      {
        name: 'Throw Pillow Set',
        description: 'Set of 2 decorative throw pillows with premium cotton cover.',
        price: 34.99,
        image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?w=400',
        category: 'Home',
        stock: 110,
        rating: 4.3,
        numReviews: 41
      },
      {
        name: 'Scented Candle Collection',
        description: 'Set of 3 scented candles with natural soy wax and essential oils.',
        price: 44.99,
        image: 'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=400',
        category: 'Home',
        stock: 80,
        rating: 4.6,
        numReviews: 156
      },
      {
        name: 'Cozy Throw Blanket',
        description: 'Ultra-soft microfiber throw blanket perfect for couch or bed.',
        price: 59.99,
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
        category: 'Home',
        stock: 50,
        rating: 4.7,
        numReviews: 203
      },
      // Books (5 products)
      {
        name: 'JavaScript: The Good Parts',
        description: 'Essential reading for JavaScript developers looking to master the language.',
        price: 29.99,
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
        category: 'Books',
        stock: 150,
        rating: 4.7,
        numReviews: 312
      },
      {
        name: 'Python Crash Course',
        description: 'A hands-on, project-based introduction to Python programming.',
        price: 39.99,
        image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
        category: 'Books',
        stock: 120,
        rating: 4.8,
        numReviews: 445
      },
      {
        name: 'Clean Code',
        description: 'A Handbook of Agile Software Craftsmanship by Robert C. Martin.',
        price: 49.99,
        image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400',
        category: 'Books',
        stock: 85,
        rating: 4.9,
        numReviews: 567
      },
      {
        name: 'The Pragmatic Programmer',
        description: 'From journeyman to master - essential wisdom for programmers.',
        price: 54.99,
        image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
        category: 'Books',
        stock: 70,
        rating: 4.8,
        numReviews: 389
      },
      {
        name: 'Design Patterns',
        description: 'Elements of Reusable Object-Oriented Software by the Gang of Four.',
        price: 54.99,
        image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400',
        category: 'Books',
        stock: 60,
        rating: 4.7,
        numReviews: 423
      }
    ];

    // Clear existing products and insert new ones
    await Product.deleteMany({});
    const products = await Product.insertMany(sampleProducts);

    res.status(201).json({
      success: true,
      message: `Successfully seeded ${products.length} products`,
      count: products.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;

