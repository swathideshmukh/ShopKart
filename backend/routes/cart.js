const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, optionalAuth } = require('../middleware/auth');

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private (or optional for demo)
router.get('/', protect, async (req, res) => {
  try {
    const user = await req.user.populate('cart.product');
    
    res.status(200).json({
      success: true,
      cart: user.cart || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/cart
// @desc    Add item to cart
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check stock
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`
      });
    }

    // Find user and check if product already in cart
    const user = await req.user.populate('cart.product');
    const existingItemIndex = user.cart.findIndex(
      item => item.product._id.toString() === productId
    );

    let cart = [...user.cart];

    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = cart[existingItemIndex].quantity + quantity;
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Only ${product.stock} items available`
        });
      }
      cart[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      cart.push({
        product: product._id,
        quantity,
        price: product.price
      });
    }

    // Save cart
    user.cart = cart;
    await user.save();

    // Populate product details
    await user.populate('cart.product');

    res.status(200).json({
      success: true,
      cart: user.cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/cart/:productId
// @desc    Update cart item quantity
// @access  Private
router.put('/:productId', protect, async (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    const user = await req.user.populate('cart.product');
    const itemIndex = user.cart.findIndex(
      item => item.product._id.toString() === req.params.productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    // Check stock
    const product = await Product.findById(req.params.productId);
    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`
      });
    }

    user.cart[itemIndex].quantity = quantity;
    await user.save();
    await user.populate('cart.product');

    res.status(200).json({
      success: true,
      cart: user.cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/cart/:productId
// @desc    Remove item from cart
// @access  Private
router.delete('/:productId', protect, async (req, res) => {
  try {
    const user = await req.user.populate('cart.product');
    
    user.cart = user.cart.filter(
      item => item.product._id.toString() !== req.params.productId
    );
    
    await user.save();
    await user.populate('cart.product');

    res.status(200).json({
      success: true,
      cart: user.cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/cart
// @desc    Clear cart
// @access  Private
router.delete('/', protect, async (req, res) => {
  try {
    req.user.cart = [];
    await req.user.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      cart: []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;

