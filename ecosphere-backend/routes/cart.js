const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyEcoDiscount,
  returnPackage
} = require('../controllers/cartController');
const { protect, authorize } = require('../middleware/auth');

// All cart routes require authentication and customer role
router.use(protect);
router.use(authorize('customer'));

// Cart routes
router.get('/', getCart);
router.post('/add', addToCart);
router.put('/update', updateCartItem);
router.delete('/remove/:productId', removeFromCart);
router.delete('/clear', clearCart);

// Eco rewards routes
router.post('/apply-eco-discount', applyEcoDiscount);
router.post('/return-package', returnPackage);

module.exports = router;
