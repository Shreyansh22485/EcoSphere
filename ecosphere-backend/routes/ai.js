const express = require('express');
const router = express.Router();
const {
  getProductRecommendations,
  getImpactForecast,
  getSustainabilityInsights,
  getProductComparison,
  getEducationalContent,
  getCollectiveImpactMessage,
  debugGeminiConnection
} = require('../controllers/aiController');

// Debug/Testing routes
router.get('/debug', debugGeminiConnection);

// Public routes (no authentication required)
router.get('/collective-impact', getCollectiveImpactMessage);
router.get('/education/:topic', getEducationalContent);
router.get('/product-comparison/:productId', getProductComparison);

// User-specific routes (support both authenticated and query-based access for testing)
router.get('/recommendations', getProductRecommendations);
router.get('/impact-forecast', getImpactForecast);
router.get('/insights', getSustainabilityInsights);

// Test endpoint to verify AI service is working
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'EcoSphere AI service is operational',
    endpoints: {
      debug: '/api/ai/debug (Test Gemini connection)',
      recommendations: '/api/ai/recommendations?userId=USER_ID',
      impactForecast: '/api/ai/impact-forecast?userId=USER_ID',
      insights: '/api/ai/insights?userId=USER_ID',
      productComparison: '/api/ai/product-comparison/PRODUCT_ID',
      education: '/api/ai/education/TOPIC?level=beginner|intermediate|advanced',
      collectiveImpact: '/api/ai/collective-impact'
    },
    geminiModel: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    geminiConfigured: process.env.GEMINI_API_KEY ? true : false,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
