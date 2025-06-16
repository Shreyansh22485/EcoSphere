const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  registerPartner, 
  loginPartner, 
  getPartnerMe 
} = require('../controllers/authController');
// const { protect } = require('../middleware/auth');

// User auth routes
router.post('/register', register);
router.post('/login', login);
router.get('/me', getMe); // Will need auth middleware later

// Partner auth routes
router.post('/partner/register', registerPartner);
router.post('/partner/login', loginPartner);
router.get('/partner/me', getPartnerMe); // Will need auth middleware later

router.post('/logout', (req, res) => {
  res.json({ 
    success: true, 
    message: 'User logout endpoint - Coming Soon'
  });
});

router.get('/me', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Get current user endpoint - Coming Soon'
  });
});

router.put('/profile', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Update profile endpoint - Coming Soon',
    data: req.body 
  });
});

module.exports = router;
