const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// Get user dashboard data
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get current user with all data
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }    // Calculate monthly impact points trend from user's monthly tracking
    const monthlyData = {};
    const now = new Date();
    
    // Initialize last 6 months with 0 values
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
      const trackingKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      // Get points from user's monthly tracking
      const monthlyPoints = user.monthlyImpactPoints?.get(trackingKey) || 0;
      monthlyData[monthKey] = monthlyPoints;
    }

    // Convert to array format for chart
    const monthlyTrend = Object.entries(monthlyData).map(([month, points]) => ({
      month,
      points
    }));

    // Get user ranking (simplified - in production would use aggregation pipeline)
    const usersWithHigherPoints = await User.countDocuments({
      impactPoints: { $gt: user.impactPoints }
    });
    const totalUsers = await User.countDocuments();
    const globalRank = usersWithHigherPoints + 1;

    // Get monthly ranking
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    
    const monthlyOrders = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: '$customer',
          monthlyPoints: { $sum: '$totalImpact.impactPoints' }
        }
      },
      {
        $sort: { monthlyPoints: -1 }
      }
    ]);

    const userMonthlyPoints = monthlyOrders.find(o => 
      o._id.toString() === userId.toString()
    )?.monthlyPoints || 0;
    
    const monthlyRank = monthlyOrders.findIndex(o => 
      o._id.toString() === userId.toString()
    ) + 1 || monthlyOrders.length + 1;

    // Prepare eco tier purchase data for pie chart
    const tierData = [
      { 
        name: "🌍 EcoEntry", 
        value: user.ecoTierPurchases?.ecoEntryCount || 0, 
        color: "#FF8C00" 
      },
      { 
        name: "♻️ EcoAware", 
        value: user.ecoTierPurchases?.ecoAwareCount || 0, 
        color: "#FFD700" 
      },
      { 
        name: "🌱 EcoSelect", 
        value: user.ecoTierPurchases?.ecoSelectCount || 0, 
        color: "#32CD32" 
      },
      { 
        name: "🌿 EcoPioneer", 
        value: user.ecoTierPurchases?.ecoPioneerCount || 0, 
        color: "#228B22" 
      },
      { 
        name: "🌟 EcoChampion", 
        value: user.ecoTierPurchases?.ecoChampionCount || 0, 
        color: "#006400" 
      }
    ].filter(tier => tier.value > 0); // Only show tiers with purchases    // Achievement badges with real data
    const achievementBadges = [
      { 
        id: 1, 
        name: "🌱 Seedling", 
        description: "First 100 Impact Points", 
        earned: user.impactPoints >= 100,
        date: user.impactPoints >= 100 && user.achievements?.firstPurchase ? 
              user.achievements.firstPurchase.toLocaleDateString() : null
      },
      { 
        id: 2, 
        name: "🌿 Sprout", 
        description: "500 Impact Points", 
        earned: user.impactPoints >= 500,
        date: user.impactPoints >= 500 && user.achievements?.firstEcoProduct ? 
              user.achievements.firstEcoProduct.toLocaleDateString() : null
      },
      { 
        id: 3, 
        name: "🌳 Tree", 
        description: "2,000 Impact Points", 
        earned: user.impactPoints >= 2000,
        date: user.impactPoints >= 2000 && user.achievements?.firstBadge ? 
              user.achievements.firstBadge.toLocaleDateString() : null
      },
      { 
        id: 4, 
        name: "🌲 Forest", 
        description: "10,000 Impact Points", 
        earned: user.impactPoints >= 10000,
        date: user.impactPoints >= 10000 ? new Date().toLocaleDateString() : null
      },
      { 
        id: 5, 
        name: "🌍 Planet Guardian", 
        description: "50,000 Impact Points", 
        earned: user.impactPoints >= 50000,
        date: user.impactPoints >= 50000 ? new Date().toLocaleDateString() : null
      },
      { 
        id: 6, 
        name: "🔥 Streak Master", 
        description: "30-day sustainable shopping streak", 
        earned: (user.sustainabilityStreak?.longest || 0) >= 30,
        date: (user.sustainabilityStreak?.longest || 0) >= 30 ? new Date().toLocaleDateString() : null
      },
      { 
        id: 7, 
        name: "👥 Group Leader", 
        description: "Organized 10 successful group buys", 
        earned: false,
        date: null
      },
      { 
        id: 8, 
        name: "♻️ Circle Champion", 
        description: "Returned 50+ packages", 
        earned: false,
        date: null
      },
      { 
        id: 9, 
        name: "🏆 Leaderboard Legend", 
        description: "Top 10 for 3 consecutive months", 
        earned: globalRank <= 10,
        date: globalRank <= 10 ? new Date().toLocaleDateString() : null
      },
      { 
        id: 10, 
        name: "💡 Influence Icon", 
        description: "Referred 25+ new EcoSphere users", 
        earned: (user.achievements?.referralCount || 0) >= 25,
        date: (user.achievements?.referralCount || 0) >= 25 ? new Date().toLocaleDateString() : null
      }
    ];

    res.json({
      success: true,
      data: {        userData: {
          impactPoints: user.impactPoints,
          rank: globalRank,
          totalUsers,
          currentStreak: user.sustainabilityStreak?.current || 0,
          monthlyRank,
          userTier: user.userTier,
          totalCarbonSaved: user.totalCarbonSaved,
          totalWaterSaved: user.totalWaterSaved,
          totalWastePrevented: user.totalWastePrevented,
          availableEcoDiscount: user.availableEcoDiscount,
          packageReturns: user.ecoRewards?.packageReturns || 0,
          returnBonusEarned: user.ecoRewards?.returnBonusEarned || 0
        },
        tierData,
        monthlyData: monthlyTrend,
        achievementBadges,
        projectedImpact: {
          annualCO2: Math.round(user.totalCarbonSaved * 12), // Rough projection
          annualWater: Math.round(user.totalWaterSaved * 12),
          annualWaste: Math.round(user.totalWastePrevented * 12),
          annualPoints: Math.round(user.impactPoints * 2) // Projected growth
        }
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
});

module.exports = router;
