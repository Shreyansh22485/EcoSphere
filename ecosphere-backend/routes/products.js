const express = require('express');
const router = express.Router();

// Placeholder routes for products
router.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Get all products endpoint - Coming Soon',
    filters: req.query
  });
});

// Specific routes should come before generic /:id route
router.get('/category/:category', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Get products by category endpoint - Coming Soon',
    category: req.params.category
  });
});

router.get('/eco-tier/:tier', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Get products by EcoScore tier endpoint - Coming Soon',
    tier: req.params.tier
  });
});

router.post('/search', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Advanced product search endpoint - Coming Soon',
    searchCriteria: req.body
  });
});

// Generic /:id route should come last
router.get('/:id', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Get single product endpoint - Coming Soon',
    productId: req.params.id
  });
});

module.exports = router;
