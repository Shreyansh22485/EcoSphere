const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

// Create a new order
const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod = 'card' } = req.body;
    const userId = req.user.id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order items are required'
      });
    }

    // Generate order number
    const orderNumber = `ECO-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;    // Process order items and calculate totals
    let totalAmount = 0;
    let totalImpactPoints = 0;
    let totalCarbonSaved = 0;
    let totalWaterSaved = 0;
    let totalWastePrevented = 0;

    const processedItems = [];
    const ecoTierCounts = {
      ecoEntryCount: 0,
      ecoAwareCount: 0,
      ecoSelectCount: 0,
      ecoPioneerCount: 0,
      ecoChampionCount: 0,
      standardCount: 0
    };

    for (const item of items) {
      const product = await Product.findById(item.productId).populate('partner', 'companyName');
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.productId} not found`
        });
      }

      const quantity = item.quantity || 1;
      const price = item.price || product.price;
      const itemTotal = price * quantity;      // Calculate impact for this item using ecoScore and AI insights
      const ecoScore = product.ecoScore?.overall || 0;
      const itemImpactPoints = Math.floor(ecoScore / 10);
      
      // Use AI insights for real impact data
      const aiInsights = product.ecoScore?.aiInsights || {};
      const itemCarbonSaved = (aiInsights.carbonReduced?.value || 0) * quantity;
      const itemWaterSaved = (aiInsights.waterSaved?.value || 0) * quantity;
      const itemWastePrevented = (aiInsights.wastePrevented?.value || 0) * quantity;

      // Determine eco tier based on ecoScore.overall value
      let productEcoTier = 'Standard';
      if (ecoScore >= 900) productEcoTier = 'EcoChampion';
      else if (ecoScore >= 750) productEcoTier = 'EcoPioneer';
      else if (ecoScore >= 600) productEcoTier = 'EcoSelect';
      else if (ecoScore >= 450) productEcoTier = 'EcoAware';
      else if (ecoScore >= 300) productEcoTier = 'EcoEntry';

      // Track eco tier purchases
      switch (productEcoTier) {
        case 'EcoEntry':
          ecoTierCounts.ecoEntryCount += quantity;
          break;
        case 'EcoAware':
          ecoTierCounts.ecoAwareCount += quantity;
          break;
        case 'EcoSelect':
          ecoTierCounts.ecoSelectCount += quantity;
          break;
        case 'EcoPioneer':
          ecoTierCounts.ecoPioneerCount += quantity;
          break;
        case 'EcoChampion':
          ecoTierCounts.ecoChampionCount += quantity;
          break;
        default:
          ecoTierCounts.standardCount += quantity;
          break;
      }

      totalAmount += itemTotal;
      totalImpactPoints += itemImpactPoints * quantity;
      totalCarbonSaved += itemCarbonSaved;
      totalWaterSaved += itemWaterSaved;
      totalWastePrevented += itemWastePrevented;      processedItems.push({
        product: product._id,
        partner: product.partner._id,
        quantity,
        price,
        ecoScore,
        ecoTier: productEcoTier,
        aiInsights: {
          carbonReduced: aiInsights.carbonReduced || { value: 0, description: '' },
          waterSaved: aiInsights.waterSaved || { value: 0, description: '' },
          wastePrevented: aiInsights.wastePrevented || { value: 0, description: '' },
          summary: aiInsights.summary || '',
          confidence: aiInsights.confidence || 0
        },
        impact: {
          carbonSaved: itemCarbonSaved,
          waterSaved: itemWaterSaved,
          wastePrevented: itemWastePrevented,
          impactPoints: itemImpactPoints * quantity
        }
      });
    }

    // Calculate order totals
    const tax = totalAmount * 0.08; // 8% tax
    const shipping = totalAmount > 50 ? 0 : 9.99; // Free shipping over $50
    const finalTotal = totalAmount + tax + shipping;

    // Create the order with minimal required fields
    const order = new Order({
      orderNumber,
      customer: userId,
      orderItems: processedItems,
      orderSummary: {
        subtotal: totalAmount,
        tax: tax,
        shipping: shipping,
        discount: 0,
        total: finalTotal
      },
      shippingAddress: shippingAddress || {
        name: "Default Name",
        street: "Default Street",
        city: "Default City",
        state: "Default State",
        country: "USA",
        zipCode: "12345"
      },
      billingAddress: shippingAddress || {
        name: "Default Name",
        street: "Default Street",
        city: "Default City",
        state: "Default State",
        country: "USA",
        zipCode: "12345",
        sameAsShipping: true
      },
      payment: {
        method: paymentMethod === 'card' ? 'credit_card' : paymentMethod,
        status: 'completed'
      },
      totalImpact: {
        carbonSaved: totalCarbonSaved,
        waterSaved: totalWaterSaved,
        wastePrevented: totalWastePrevented,
        impactPoints: totalImpactPoints
      },
      status: 'confirmed',
      orderDate: new Date()
    });    await order.save();    // Get user for streak calculation and first purchase tracking
    const user = await User.findById(userId);
    const lastPurchaseDate = user.sustainabilityStreak?.lastPurchaseDate;
    const today = new Date();
    const currentStreak = user.sustainabilityStreak?.current || 0;
    
    // Check if this is the first purchase
    const isFirstPurchase = !user.achievements?.firstPurchase;
    const isFirstEcoProduct = !user.achievements?.firstEcoProduct;
    
    let newStreak = currentStreak;
    if (lastPurchaseDate) {
      const diffTime = Math.abs(today - lastPurchaseDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // Consecutive day purchase
        newStreak = currentStreak + 1;
      } else if (diffDays > 1) {
        // Streak broken, start over
        newStreak = 1;
      }
      // Same day purchase doesn't change streak
    } else {
      // First purchase
      newStreak = 1;
    }

    // Update longest streak if needed
    const longestStreak = Math.max(user.sustainabilityStreak?.longest || 0, newStreak);

    // Prepare achievement updates
    const achievementUpdates = {
      'achievements.lastActivityDate': today,
      'sustainabilityStreak.current': newStreak,
      'sustainabilityStreak.longest': longestStreak,
      'sustainabilityStreak.lastPurchaseDate': today
    };

    if (isFirstPurchase) {
      achievementUpdates['achievements.firstPurchase'] = today;
    }    if (isFirstEcoProduct && processedItems.some(item => item.ecoScore >= 300)) {
      achievementUpdates['achievements.firstEcoProduct'] = today;
    }

    // Generate current month key for tracking (YYYY-MM format)
    const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    
    // Award impact points to the user and update eco tier purchase counts
    const userUpdate = await User.findByIdAndUpdate(userId, {
      $inc: { 
        'impactPoints': totalImpactPoints,
        'totalCarbonSaved': totalCarbonSaved,
        'totalWaterSaved': totalWaterSaved,
        'totalWastePrevented': totalWastePrevented,
        'ecoTierPurchases.ecoEntryCount': ecoTierCounts.ecoEntryCount,
        'ecoTierPurchases.ecoAwareCount': ecoTierCounts.ecoAwareCount,
        'ecoTierPurchases.ecoSelectCount': ecoTierCounts.ecoSelectCount,
        'ecoTierPurchases.ecoPioneerCount': ecoTierCounts.ecoPioneerCount,
        'ecoTierPurchases.ecoChampionCount': ecoTierCounts.ecoChampionCount,
        'ecoTierPurchases.standardCount': ecoTierCounts.standardCount,
        [`monthlyImpactPoints.${currentMonthKey}`]: totalImpactPoints
      },
      $push: {
        'orders': order._id
      },
      $set: achievementUpdates
    }, { new: true });

    // Clear the user's cart
    await Cart.findOneAndUpdate(
      { user: userId },
      { $set: { items: [] } }
    );

    // Populate the order for response
    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email')
      .populate('orderItems.product', 'name images price')
      .populate('orderItems.partner', 'companyName');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: populatedOrder
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

// Get user's orders
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;    const orders = await Order.find({ customer: userId })
      .populate('orderItems.product', 'name images price ecoScore')
      .populate('orderItems.partner', 'companyName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments({ customer: userId });

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalOrders / limit),
          totalOrders,
          hasNextPage: page < Math.ceil(totalOrders / limit),
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// Get specific order details
const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ _id: id, customer: userId })
      .populate('customer', 'name email')
      .populate('orderItems.product', 'name images price description')
      .populate('orderItems.partner', 'companyName');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order details',
      error: error.message
    });
  }
};

// Update order status (admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status'
      });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    ).populate('customer', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderDetails,
  updateOrderStatus
};
