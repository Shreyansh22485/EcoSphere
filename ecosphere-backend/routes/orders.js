const express = require('express');
const router = express.Router();
const { createOrder, getUserOrders, getOrderDetails, updateOrderStatus } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

// Apply authentication to all order routes
router.use(protect);

// Create new order
router.post('/', createOrder);

// Get user orders
router.get('/', getUserOrders);

// Get specific order details
router.get('/:id', getOrderDetails);

// Update order status (admin only)
router.put('/:id/status', updateOrderStatus);

// Group buying
router.post('/group-buy', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Join group buying endpoint - Coming Soon',
    data: req.body
  });
});

router.get('/group-buy/:productId', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Get group buying status endpoint - Coming Soon',
    productId: req.params.productId
  });
});

module.exports = router;
