const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  searchProducts
} = require('../controllers/productsController');

// Product routes
router.get('/', getProducts);
router.post('/', createProduct);
router.post('/search', searchProducts);

// Specific routes should come before generic /:id route
router.get('/category/:category', getProducts); // Will use category filter
router.get('/eco-tier/:tier', (req, res) => {
  // Convert tier to score range and redirect to main products endpoint
  const tierRanges = {
    'champion': { min: 900, max: 1000 },
    'pioneer': { min: 750, max: 899 },
    'select': { min: 600, max: 749 },
    'aware': { min: 450, max: 599 },
    'entry': { min: 300, max: 449 },
    'standard': { min: 0, max: 299 }
  };
  
  const range = tierRanges[req.params.tier.toLowerCase()];
  if (range) {
    req.query.minEcoScore = range.min;
    req.query.maxEcoScore = range.max;
    return getProducts(req, res);
  }
  
  res.status(400).json({
    success: false,
    message: 'Invalid eco tier. Use: champion, pioneer, select, aware, entry, standard'
  });
});

router.get('/:id', getProduct);

module.exports = router;
