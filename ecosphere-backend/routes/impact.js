const express = require('express');
const router = express.Router();

// Collective impact data (should come before /user/:userId)
router.get('/collective', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Get collective impact data endpoint - Coming Soon'
  });
});

// Leaderboards (specific routes first)
router.get('/leaderboard', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Get impact leaderboard endpoint - Coming Soon',
    type: req.query.type || 'overall'
  });
});

router.get('/leaderboard/:tier', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Get tier-specific leaderboard endpoint - Coming Soon',
    tier: req.params.tier
  });
});

// AI-powered impact forecasting
router.get('/forecast', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Get AI impact forecast endpoint - Coming Soon'
  });
});

router.post('/forecast/calculate', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Calculate custom impact forecast endpoint - Coming Soon',
    data: req.body
  });
});

// User impact tracking (specific route first)
router.get('/user', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Get user impact metrics endpoint - Coming Soon'
  });
});

// Generic user route with parameter (should come after specific routes)
router.get('/user/:userId', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Get specific user impact metrics endpoint - Coming Soon',
    userId: req.params.userId
  });
});

// Impact comparison
router.post('/compare', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Compare environmental impact endpoint - Coming Soon',
    data: req.body
  });
});

module.exports = router;
