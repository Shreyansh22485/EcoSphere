const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Partner = require('../models/Partner');
const { asyncHandler } = require('./error');

/**
 * Protect routes - requires valid JWT token
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);    // Get user or partner from token
    if (decoded.type === 'user') {
      req.user = await User.findById(decoded.id);
      req.userType = 'customer';
      console.log('🔐 BACKEND AUTH - Customer authenticated:', req.user.name, 'ID:', req.user._id);
    } else if (decoded.type === 'partner') {
      req.user = await Partner.findById(decoded.id);
      req.userType = 'partner';
      console.log('🔐 BACKEND AUTH - Partner authenticated:', req.user.companyName, 'ID:', req.user._id);
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
});

/**
 * Grant access to specific user types
 */
const authorize = (...userTypes) => {
  return (req, res, next) => {
    if (!userTypes.includes(req.userType)) {
      return res.status(403).json({
        success: false,
        message: `User type ${req.userType} is not authorized to access this route`
      });
    }
    next();
  };
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);      if (decoded.type === 'user') {
        req.user = await User.findById(decoded.id);
        req.userType = 'customer';
        console.log('🔐 BACKEND OPTIONAL AUTH - Customer authenticated:', req.user.name, 'ID:', req.user._id);
      } else if (decoded.type === 'partner') {
        req.user = await Partner.findById(decoded.id);
        req.userType = 'partner';
        console.log('🔐 BACKEND OPTIONAL AUTH - Partner authenticated:', req.user.companyName, 'ID:', req.user._id);
      }
    } catch (error) {
      // Token invalid, but continue anyway
      req.user = null;
      req.userType = null;
    }
  }

  next();
});

module.exports = {
  protect,
  authorize,
  optionalAuth
};
