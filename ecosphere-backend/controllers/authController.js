const User = require('../models/User');
const Partner = require('../models/Partner');
const jwt = require('jsonwebtoken');
const { asyncHandler } = require('../middleware/error');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, preferences } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email'
    });
  }

  // Create user (password will be hashed automatically by pre-save middleware)
  const user = await User.create({
    name,
    email,
    password, // Don't hash here - let the model's pre-save middleware do it
    preferences: preferences || {},
    impactPoints: 0,
    ecoTier: 'EcoEntry',
    totalCarbonSaved: 0,
    totalWaterSaved: 0,
    totalWastePrevented: 0
  });
  // Generate JWT token
  const token = jwt.sign(
    { id: user._id, type: 'user' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        ecoTier: user.ecoTier,
        impactPoints: user.impactPoints
      },
      token,
      userType: 'user'
    }
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password'
    });
  }

  // Check for user (explicitly select password for comparison)
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
  console.log('User found:', user.email);
  console.log('Password from DB exists:', !!user.password);
  console.log('Password provided:', password);

  // Check if password matches using the model's matchPassword method
  const isMatch = await user.matchPassword(password);
  console.log('Password match result:', isMatch);
  
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
  // Generate JWT token
  const token = jwt.sign(
    { id: user._id, type: 'user' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        ecoTier: user.ecoTier,
        impactPoints: user.impactPoints,
        totalCarbonSaved: user.totalCarbonSaved,
        joinedAt: user.createdAt
      },
      token,
      userType: 'user'
    }
  });
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        impactPoints: user.impactPoints,
        ecoTier: user.ecoTier,
        totalCarbonSaved: user.totalCarbonSaved,
        totalWaterSaved: user.totalWaterSaved,
        totalWastePrevented: user.totalWastePrevented,
        preferences: user.preferences,
        badges: user.badges,
        joinedAt: user.createdAt
      }
    }
  });
});

/**
 * @desc    Register a new partner
 * @route   POST /api/auth/partner/register
 * @access  Public
 */
const registerPartner = asyncHandler(async (req, res) => {
  const { companyName, email, password } = req.body;

  // Check if partner already exists
  const existingPartner = await Partner.findOne({ email });
  if (existingPartner) {
    return res.status(400).json({
      success: false,
      message: 'Partner already exists with this email'
    });
  }

  // Create partner (password will be hashed automatically by pre-save middleware)
  const partner = await Partner.create({
    companyName,
    email,
    password
  });

  // Generate JWT token
  const token = jwt.sign(
    { id: partner._id, type: 'partner' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );

  res.status(201).json({
    success: true,
    message: 'Partner registered successfully',
    data: {
      partner: {
        id: partner._id,
        companyName: partner.companyName,
        email: partner.email,
        status: partner.status,
        totalImpactGenerated: partner.totalImpactGenerated
      },
      token,
      userType: 'partner'
    }
  });
});

/**
 * @desc    Login partner
 * @route   POST /api/auth/partner/login
 * @access  Public
 */
const loginPartner = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password'
    });
  }

  // Check for partner (explicitly select password for comparison)
  const partner = await Partner.findOne({ email }).select('+password');
  if (!partner) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check if password matches using the model's matchPassword method
  const isMatch = await partner.matchPassword(password);
  
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: partner._id, type: 'partner' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );

  res.status(200).json({
    success: true,
    message: 'Partner login successful',
    data: {
      partner: {
        id: partner._id,
        companyName: partner.companyName,
        email: partner.email,
        status: partner.status,
        totalImpactGenerated: partner.totalImpactGenerated,
        joinedAt: partner.createdAt
      },
      token,
      userType: 'partner'
    }
  });
});

/**
 * @desc    Get current logged in partner
 * @route   GET /api/auth/partner/me
 * @access  Private
 */
const getPartnerMe = asyncHandler(async (req, res) => {
  const partner = await Partner.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: {
      partner: {
        id: partner._id,
        companyName: partner.companyName,
        email: partner.email,
        status: partner.status,
        totalImpactGenerated: partner.totalImpactGenerated,
        isActive: partner.isActive,
        joinedAt: partner.createdAt
      }
    }
  });
});

module.exports = {
  register,
  login,
  getMe,
  registerPartner,
  loginPartner,
  getPartnerMe
};
