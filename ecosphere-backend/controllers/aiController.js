const geminiAI = require('../services/geminiAI');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { asyncHandler } = require('../middleware/error');

/**
 * @desc    Get AI-powered product recommendations for a user
 * @route   GET /api/ai/recommendations
 * @access  Private
 */
const getProductRecommendations = asyncHandler(async (req, res) => {
  const userId = req.user?.id || req.query.userId; // Support both authenticated and query-based requests
  
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required'
    });
  }

  // Get user profile
  const user = await User.findById(userId).select('-password');
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Get recent orders for context
  const recentOrders = await Order.find({ customer: userId })
    .populate('orderItems.product')
    .sort({ createdAt: -1 })
    .limit(10);

  // Get available products (top rated, in stock)
  const availableProducts = await Product.find({ 
    status: 'active',
    'inventory.stock': { $gt: 0 }
  })
    .populate('partner', 'companyName tier')
    .sort({ 'ecoScore.overall': -1 })
    .limit(20);

  // Prepare context from recent orders
  const context = {
    previousCategories: [...new Set(recentOrders.flatMap(order => 
      order.orderItems.map(item => item.product?.category).filter(Boolean)
    ))].join(', '),
    recentEcoScores: recentOrders.flatMap(order => 
      order.orderItems.map(item => item.ecoScore).filter(Boolean)
    )
  };

  try {
    const recommendations = await geminiAI.generateProductRecommendations(
      user.toObject(),
      availableProducts.map(p => p.toObject()),
      context
    );

    res.status(200).json({
      success: true,
      data: {
        recommendations,
        userProfile: {
          tier: user.ecoTier,
          impactPoints: user.impactPoints,
          nextTierProgress: user.tierProgress
        },
        context: {
          totalProducts: availableProducts.length,
          recentOrderCount: recentOrders.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate recommendations',
      error: error.message
    });
  }
});

/**
 * @desc    Get AI-powered impact forecast
 * @route   GET /api/ai/impact-forecast
 * @access  Private
 */
const getImpactForecast = asyncHandler(async (req, res) => {
  const userId = req.user?.id || req.query.userId;
  const timeframe = req.query.timeframe || '6months';
  
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required'
    });
  }

  const user = await User.findById(userId).select('-password');
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Get recent activity (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentOrders = await Order.find({ 
    customer: userId,
    createdAt: { $gte: thirtyDaysAgo }
  });

  const recentActivity = {
    orderCount: recentOrders.length,
    totalSpent: recentOrders.reduce((sum, order) => sum + order.orderSummary.total, 0),
    avgEcoScore: recentOrders.length > 0 
      ? recentOrders.reduce((sum, order) => {
          const orderAvg = order.orderItems.reduce((itemSum, item) => 
            itemSum + (item.ecoScore || 0), 0) / order.orderItems.length;
          return sum + orderAvg;
        }, 0) / recentOrders.length
      : 0
  };

  try {
    const forecast = await geminiAI.generateImpactForecast(
      user.toObject(),
      recentActivity,
      timeframe
    );

    res.status(200).json({
      success: true,
      data: {
        forecast,
        currentImpact: user.getTotalImpact(),
        recentActivity,
        timeframe
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate impact forecast',
      error: error.message
    });
  }
});

/**
 * @desc    Get AI-powered sustainability insights
 * @route   GET /api/ai/insights
 * @access  Private
 */
const getSustainabilityInsights = asyncHandler(async (req, res) => {
  const userId = req.user?.id || req.query.userId;
  
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required'
    });
  }

  const user = await User.findById(userId).select('-password');
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Get order history
  const orders = await Order.find({ customer: userId })
    .populate('orderItems.product')
    .sort({ createdAt: -1 });

  // Analyze purchase patterns
  const categoryCount = {};
  let totalEcoScore = 0;
  let ecoScoreCount = 0;

  orders.forEach(order => {
    order.orderItems.forEach(item => {
      if (item.product?.category) {
        categoryCount[item.product.category] = (categoryCount[item.product.category] || 0) + 1;
      }
      if (item.ecoScore) {
        totalEcoScore += item.ecoScore;
        ecoScoreCount++;
      }
    });
  });

  const topCategories = Object.entries(categoryCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([category]) => category)
    .join(', ');

  const context = {
    topCategories,
    avgEcoScore: ecoScoreCount > 0 ? totalEcoScore / ecoScoreCount : 0,
    purchaseFrequency: orders.length > 0 ? 'Regular' : 'New'
  };

  try {
    const insights = await geminiAI.generateSustainabilityInsights(
      user.toObject(),
      orders,
      context
    );

    res.status(200).json({
      success: true,
      data: {
        insights,
        stats: {
          totalOrders: orders.length,
          averageEcoScore: context.avgEcoScore,
          favoriteCategories: topCategories,
          memberSince: user.createdAt
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate insights',
      error: error.message
    });
  }
});

/**
 * @desc    Get AI-powered product comparison
 * @route   GET /api/ai/product-comparison/:productId
 * @access  Public
 */
const getProductComparison = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { compareWith } = req.query; // Optional traditional product ID

  const ecoProduct = await Product.findById(productId).populate('partner');
  if (!ecoProduct) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  let traditionalAlternative = null;
  if (compareWith) {
    traditionalAlternative = await Product.findById(compareWith);
  }

  try {
    const comparison = await geminiAI.generateProductComparison(
      ecoProduct.toObject(),
      traditionalAlternative?.toObject()
    );

    res.status(200).json({
      success: true,
      data: {
        comparison,
        ecoProduct: {
          id: ecoProduct._id,
          name: ecoProduct.name,
          ecoScore: ecoProduct.ecoScore.overall,
          price: ecoProduct.price,
          impact: ecoProduct.impactPerPurchase
        },
        traditionalAlternative: traditionalAlternative ? {
          id: traditionalAlternative._id,
          name: traditionalAlternative.name,
          price: traditionalAlternative.price
        } : null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate product comparison',
      error: error.message
    });
  }
});

/**
 * @desc    Get AI-generated educational content
 * @route   GET /api/ai/education/:topic
 * @access  Public
 */
const getEducationalContent = asyncHandler(async (req, res) => {
  const { topic } = req.params;
  const { level = 'beginner' } = req.query;

  try {
    const content = await geminiAI.generateEducationalContent(topic, level);

    res.status(200).json({
      success: true,
      data: {
        topic,
        level,
        content,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate educational content',
      error: error.message
    });
  }
});

/**
 * @desc    Get AI-generated collective impact message
 * @route   GET /api/ai/collective-impact
 * @access  Public
 */
const getCollectiveImpactMessage = asyncHandler(async (req, res) => {
  try {
    // Aggregate community statistics
    const totalUsers = await User.countDocuments();
    const userStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalCarbonSaved: { $sum: '$totalCarbonSaved' },
          totalWaterSaved: { $sum: '$totalWaterSaved' },
          totalWastePrevented: { $sum: '$totalWastePrevented' },
          totalImpactPoints: { $sum: '$impactPoints' }
        }
      }
    ]);

    const totalOrders = await Order.countDocuments();
    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: null,
          avgEcoScore: { $avg: '$totalImpact.impactPoints' }
        }
      }
    ]);

    // Calculate monthly growth
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsersThisMonth = await User.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });
    const monthlyGrowth = totalUsers > 0 ? (newUsersThisMonth / totalUsers) * 100 : 0;

    const communityStats = {
      totalUsers,
      totalCarbonSaved: userStats[0]?.totalCarbonSaved || 0,
      totalWaterSaved: userStats[0]?.totalWaterSaved || 0,
      totalWastePrevented: userStats[0]?.totalWastePrevented || 0,
      totalOrders,
      avgEcoScore: orderStats[0]?.avgEcoScore || 0,
      monthlyGrowth: Math.round(monthlyGrowth * 100) / 100
    };

    const impactMessage = await geminiAI.generateCollectiveImpactMessage(communityStats);

    res.status(200).json({
      success: true,
      data: {
        message: impactMessage.message,
        stats: communityStats,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate collective impact message',      error: error.message
    });
  }
});

/**
 * @desc    Test Gemini AI connection and configuration
 * @route   GET /api/ai/debug
 * @access  Public (for testing purposes)
 */
const debugGeminiConnection = asyncHandler(async (req, res) => {
  console.log('🔍 Testing Gemini AI connection...');
  
  try {
    const debugResult = await geminiAI.testConnection();
    
    if (debugResult.success) {
      console.log('✅ Gemini AI connection test successful');
      res.status(200).json({
        success: true,
        message: 'Gemini AI connection test completed successfully',
        debug: debugResult
      });
    } else {
      console.log('❌ Gemini AI connection test failed');
      res.status(500).json({
        success: false,
        message: 'Gemini AI connection test failed',
        debug: debugResult
      });
    }
  } catch (error) {
    console.error('❌ Debug test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test Gemini AI connection',
      error: error.message,
      debug: {
        success: false,
        connectionStatus: "error",
        error: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
});

module.exports = {
  getProductRecommendations,
  getImpactForecast,
  getSustainabilityInsights,
  getProductComparison,
  getEducationalContent,
  getCollectiveImpactMessage,
  debugGeminiConnection
};
