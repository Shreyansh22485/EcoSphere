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

/**
 * @desc    Apply eco discount to cart
 * @route   POST /api/cart/apply-eco-discount
 * @access  Private (Users only)
 */
const applyEcoDiscount = asyncHandler(async (req, res) => {
  const User = require('../models/User');
  
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const availableDiscount = user.availableEcoDiscount;
  if (availableDiscount === 0) {
    return res.status(400).json({
      success: false,
      message: 'No eco discount available for your tier'
    });
  }

  const cart = await Cart.findOne({ user: req.user._id })
    .populate('items.product', 'name price');

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Cart is empty'
    });
  }

  // Apply discount flag to cart (could be stored in cart model)
  // For now, we'll return the discount percentage to be applied on frontend
  res.status(200).json({
    success: true,
    message: `${availableDiscount}% eco discount applied successfully!`,
    data: {
      discountPercent: availableDiscount,
      userTier: user.userTier
    }
  });
});

/**
 * @desc    Process package return
 * @route   POST /api/cart/return-package
 * @access  Private (Users only)
 */
const returnPackage = asyncHandler(async (req, res) => {
  const { orderId, productId, reason } = req.body;
  const User = require('../models/User');
  const Order = require('../models/Order');

  // Validate the order belongs to the user
  const order = await Order.findOne({ 
    _id: orderId, 
    customer: req.user._id 
  }).populate('orderItems.product', 'name');

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Check if product is in the order
  const orderItem = order.orderItems.find(item => 
    item.product._id.toString() === productId
  );

  if (!orderItem) {
    return res.status(400).json({
      success: false,
      message: 'Product not found in this order'
    });
  }

  // Award return bonus points (10 points per return)
  const bonusPoints = 10;
  
  await User.findByIdAndUpdate(req.user._id, {
    $inc: { 
      'impactPoints': bonusPoints,
      'ecoRewards.packageReturns': 1,
      'ecoRewards.returnBonusEarned': bonusPoints
    }
  });

  res.status(200).json({
    success: true,
    message: `Package return processed successfully! You earned ${bonusPoints} bonus impact points.`,
    data: {
      bonusPoints,
      productName: orderItem.product.name,
      returnDate: new Date()
    }
  });
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyEcoDiscount,
  returnPackage
};
