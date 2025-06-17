const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { asyncHandler } = require('../middleware/error');

/**
 * @desc    Get user's cart
 * @route   GET /api/cart
 * @access  Private (Users only)
 */
const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id })
    .populate({
      path: 'items.product',
      select: 'name price images ecoScore impactPerPurchase status',
      populate: {
        path: 'partner',
        select: 'companyName'
      }
    });

  // Create empty cart if doesn't exist
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  // Filter out items with inactive products
  const activeItems = cart.items.filter(item => 
    item.product && item.product.status === 'active'
  );

  if (activeItems.length !== cart.items.length) {
    cart.items = activeItems;
    await cart.save();
  }

  res.status(200).json({
    success: true,
    data: {
      items: cart.items,
      totals: cart.totals
    }
  });
});

/**
 * @desc    Add product to cart
 * @route   POST /api/cart/add
 * @access  Private (Users only)
 */
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  // Validate product exists and is active
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  if (product.status !== 'active') {
    return res.status(400).json({
      success: false,
      message: 'Product is not available for purchase'
    });
  }

  // Check stock availability
  if (!product.checkStock(quantity)) {
    return res.status(400).json({
      success: false,
      message: 'Insufficient stock available'
    });
  }

  // Get or create cart
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  // Add item to cart
  await cart.addItem(productId, quantity, product.price);

  // Populate cart items for response
  await cart.populate({
    path: 'items.product',
    select: 'name price images ecoScore impactPerPurchase',
    populate: {
      path: 'partner',
      select: 'companyName'
    }
  });

  res.status(200).json({
    success: true,
    message: 'Product added to cart successfully',
    data: {
      items: cart.items,
      totals: cart.totals
    }
  });
});

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/cart/update
 * @access  Private (Users only)
 */
const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  if (quantity < 0) {
    return res.status(400).json({
      success: false,
      message: 'Quantity must be greater than or equal to 0'
    });
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({
      success: false,
      message: 'Cart not found'
    });
  }

  // If quantity > 0, check stock
  if (quantity > 0) {
    const product = await Product.findById(productId);
    if (!product || !product.checkStock(quantity)) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock available'
      });
    }
  }

  await cart.updateItem(productId, quantity);

  // Populate cart items for response
  await cart.populate({
    path: 'items.product',
    select: 'name price images ecoScore impactPerPurchase',
    populate: {
      path: 'partner',
      select: 'companyName'
    }
  });

  res.status(200).json({
    success: true,
    message: 'Cart updated successfully',
    data: {
      items: cart.items,
      totals: cart.totals
    }
  });
});

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/remove/:productId
 * @access  Private (Users only)
 */
const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({
      success: false,
      message: 'Cart not found'
    });
  }

  await cart.removeItem(productId);

  // Populate cart items for response
  await cart.populate({
    path: 'items.product',
    select: 'name price images ecoScore impactPerPurchase',
    populate: {
      path: 'partner',
      select: 'companyName'
    }
  });

  res.status(200).json({
    success: true,
    message: 'Item removed from cart',
    data: {
      items: cart.items,
      totals: cart.totals
    }
  });
});

/**
 * @desc    Clear entire cart
 * @route   DELETE /api/cart/clear
 * @access  Private (Users only)
 */
const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({
      success: false,
      message: 'Cart not found'
    });
  }

  await cart.clear();

  res.status(200).json({
    success: true,
    message: 'Cart cleared successfully',
    data: {
      items: [],
      totals: {
        subtotal: 0,
        totalItems: 0,
        tax: 0,
        shipping: 0,
        total: 0
      }
    }
  });
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
