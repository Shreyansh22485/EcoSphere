const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const PartnerSchema = new mongoose.Schema({
  // Basic Information
  companyName: { 
    type: String, 
    required: [true, 'Please provide a company name'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  email: { 
    type: String, 
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: { 
    type: String, 
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  
  // Company details
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  website: {
    type: String,
    match: [
      /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
      'Please provide a valid website URL'
    ]
  },
  logo: String,
  
  // Contact information
  contactPerson: {
    name: {
      type: String,
      required: [true, 'Contact person name is required'],
      trim: true
    },
    email: {
      type: String,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid contact email'
      ]
    },
    phone: {
      type: String,
      match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please provide a valid phone number']
    },
    position: String
  },
  
  address: {
    street: String,
    city: String,
    state: String,
    country: {
      type: String,
      required: [true, 'Country is required']
    },
    zipCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Business Information
  businessInfo: {
    registrationNumber: String,
    taxId: String,
    businessType: {
      type: String,
      enum: ['manufacturer', 'distributor', 'retailer', 'service_provider', 'other'],
      required: [true, 'Business type is required']
    },
    foundedYear: {
      type: Number,
      min: 1800,
      max: new Date().getFullYear()
    },
    employeeCount: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '500+']
    },
    annualRevenue: {
      type: String,
      enum: ['<100k', '100k-1M', '1M-10M', '10M-100M', '100M+']
    }
  },
  
  // Sustainability Profile (from Partner Hub form)
  sustainabilityProfile: {
    overallEcoScore: { 
      type: Number, 
      min: 0, 
      max: 100,
      default: 0
    },
    
    // Environmental metrics
    environmental: {
      carbonScope1: { type: Number, min: 0 }, // Direct emissions
      carbonScope2: { type: Number, min: 0 }, // Electricity
      carbonScope3: { type: Number, min: 0 }, // Supply chain
      totalCarbonEmissions: { type: Number, min: 0 },
      renewableEnergyPercent: { 
        type: Number, 
        min: 0, 
        max: 100,
        default: 0
      },
      waterUsageEfficiency: { type: Number, min: 0 },
      wasteReductionPercent: { 
        type: Number, 
        min: 0, 
        max: 100,
        default: 0
      },
      recyclingProgram: { type: Boolean, default: false },
      carbonNeutralGoal: {
        hasGoal: { type: Boolean, default: false },
        targetYear: Number,
        currentProgress: { type: Number, min: 0, max: 100 }
      }
    },
    
    // Social responsibility
    social: {
      fairLaborCertified: { type: Boolean, default: false },
      workerSafetyPrograms: { type: Boolean, default: false },
      communityImpact: {
        type: String,
        maxlength: [1000, 'Community impact description cannot exceed 1000 characters']
      },
      supplyChainTransparency: { 
        type: String, 
        enum: ['full', 'partial', 'limited', 'none'],
        default: 'none'
      },
      diversityAndInclusion: {
        hasProgram: { type: Boolean, default: false },
        womenLeadership: { type: Number, min: 0, max: 100 },
        minorityRepresentation: { type: Number, min: 0, max: 100 }
      },
      charitableGiving: {
        annualDonationPercent: { type: Number, min: 0, max: 100 },
        supportedCauses: [String]
      }
    },

    // Materials and packaging
    materials: {
      recycledContentAvg: { type: Number, min: 0, max: 100 },
      bioBasedContentAvg: { type: Number, min: 0, max: 100 },
      sustainableSourcing: { type: Boolean, default: false },
      toxicSubstancePolicy: {
        type: String,
        enum: ['strict_avoidance', 'limited_use', 'disclosure_only', 'no_policy'],
        default: 'no_policy'
      }
    },

    packaging: {
      plasticFreePercent: { type: Number, min: 0, max: 100 },
      recyclablePackaging: { type: Number, min: 0, max: 100 },
      biodegradablePackaging: { type: Number, min: 0, max: 100 },
      packagingReduction: {
        hasProgram: { type: Boolean, default: false },
        reductionPercent: { type: Number, min: 0, max: 100 }
      }
    }
  },
  
  // Certifications (from Partner Hub)
  certifications: [{
    name: {
      type: String,
      required: true
    },
    issuer: String,
    category: {
      type: String,
      enum: ['environmental', 'social', 'quality', 'safety', 'organic', 'other']
    },
    validFrom: Date,
    validUntil: Date,
    certificateNumber: String,
    documentUrl: String,
    verificationStatus: { 
      type: String, 
      enum: ['verified', 'pending', 'rejected', 'expired'], 
      default: 'pending' 
    },
    verificationNotes: String,
    points: { type: Number, default: 0 } // Points contributed to EcoScore
  }],
  
  // Partner tier based on EcoScore
  tier: {
    type: String,
    enum: ['EcoEntry', 'EcoAware', 'EcoSelect', 'EcoPioneer', 'EcoChampion'],
    default: 'EcoEntry'
  },
  
  // Verification and approval process
  verificationStatus: {
    type: String,
    enum: ['pending', 'documents_requested', 'in_review', 'verified', 'rejected', 'suspended'],
    default: 'pending'
  },
  
  verificationData: {
    submittedAt: { type: Date, default: Date.now },
    reviewedAt: Date,
    verifiedAt: Date,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    rejectionReason: String,
    verificationNotes: String,
    documentsRequired: [String],
    documentsSubmitted: [{
      type: String,
      url: String,
      submittedAt: { type: Date, default: Date.now },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      }
    }]
  },
  
  // Products reference
  products: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product' 
  }],
  
  // Performance metrics
  metrics: {
    totalSales: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    totalImpactPoints: { type: Number, default: 0 },
    customerRating: { 
      type: Number, 
      min: 0, 
      max: 5, 
      default: 0 
    },
    totalOrders: { type: Number, default: 0 },
    totalProducts: { type: Number, default: 0 },
    averageEcoScore: { type: Number, min: 0, max: 100, default: 0 },
    
    // Impact generated by partner's products
    totalImpactGenerated: {
      carbonSaved: { type: Number, default: 0 }, // kg CO2
      waterSaved: { type: Number, default: 0 },  // liters
      wastePrevented: { type: Number, default: 0 }, // kg
      pointsAwarded: { type: Number, default: 0 }
    },

    // Customer engagement
    totalReviews: { type: Number, default: 0 },
    repeatCustomerRate: { type: Number, min: 0, max: 100, default: 0 },
    customerSatisfactionScore: { type: Number, min: 0, max: 100, default: 0 }
  },

  // Financial information
  financial: {
    commissionRate: { type: Number, min: 0, max: 100, default: 15 }, // Percentage
    paymentTerms: {
      type: String,
      enum: ['net_15', 'net_30', 'net_45', 'net_60'],
      default: 'net_30'
    },
    bankingDetails: {
      accountHolder: String,
      bankName: String,
      accountNumber: String,
      routingNumber: String,
      swiftCode: String
    },
    taxInformation: {
      taxExempt: { type: Boolean, default: false },
      vatNumber: String,
      taxId: String
    }
  },

  // Account settings and preferences
  settings: {
    notifications: {
      orderAlerts: { type: Boolean, default: true },
      reviewAlerts: { type: Boolean, default: true },
      marketingEmails: { type: Boolean, default: true },
      performanceReports: { type: Boolean, default: true }
    },
    dashboard: {
      defaultView: {
        type: String,
        enum: ['overview', 'products', 'orders', 'analytics'],
        default: 'overview'
      },
      showPublicProfile: { type: Boolean, default: true }
    },
    api: {
      enabled: { type: Boolean, default: false },
      apiKey: String,
      lastUsed: Date
    }
  },

  // Account status
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  
  // Security
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,

  // Timestamps for calculations
  lastTierUpdate: { type: Date, default: Date.now },
  lastScoreCalculation: { type: Date, default: Date.now }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for account lock status
PartnerSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Virtual for tier progress
PartnerSchema.virtual('tierProgress').get(function() {
  const thresholds = {
    'EcoEntry': 0,
    'EcoAware': 30,
    'EcoSelect': 45,
    'EcoPioneer': 60,
    'EcoChampion': 75
  };
  
  const tiers = Object.keys(thresholds);
  const currentTierIndex = tiers.indexOf(this.tier);
  
  if (currentTierIndex === tiers.length - 1) {
    return { progress: 100, nextTier: null, pointsToNext: 0 };
  }
  
  const nextTier = tiers[currentTierIndex + 1];
  const currentThreshold = thresholds[this.tier];
  const nextThreshold = thresholds[nextTier];
  
  const progress = Math.min(100, 
    ((this.sustainabilityProfile.overallEcoScore - currentThreshold) / 
     (nextThreshold - currentThreshold)) * 100
  );
  
  return {
    progress: Math.round(progress),
    nextTier,
    pointsToNext: Math.max(0, nextThreshold - this.sustainabilityProfile.overallEcoScore)
  };
});

// Indexes for performance
PartnerSchema.index({ email: 1 });
PartnerSchema.index({ verificationStatus: 1 });
PartnerSchema.index({ tier: 1 });
PartnerSchema.index({ 'sustainabilityProfile.overallEcoScore': -1 });
PartnerSchema.index({ isActive: 1 });
PartnerSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
PartnerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to calculate total carbon emissions
PartnerSchema.pre('save', function(next) {
  if (this.isModified('sustainabilityProfile.environmental')) {
    const env = this.sustainabilityProfile.environmental;
    env.totalCarbonEmissions = (env.carbonScope1 || 0) + 
                              (env.carbonScope2 || 0) + 
                              (env.carbonScope3 || 0);
  }
  next();
});

// Pre-save middleware to update tier based on EcoScore
PartnerSchema.pre('save', function(next) {
  if (this.isModified('sustainabilityProfile.overallEcoScore')) {
    const score = this.sustainabilityProfile.overallEcoScore;
    let newTier = 'EcoEntry';
    
    if (score >= 75) newTier = 'EcoChampion';
    else if (score >= 60) newTier = 'EcoPioneer';
    else if (score >= 45) newTier = 'EcoSelect';
    else if (score >= 30) newTier = 'EcoAware';
    
    if (newTier !== this.tier) {
      this.tier = newTier;
      this.lastTierUpdate = new Date();
    }
  }
  next();
});

// Pre-save middleware to increment login attempts
PartnerSchema.pre('save', function(next) {
  if (this.loginAttempts >= 5 && !this.isLocked) {
    this.lockUntil = Date.now() + 2 * 60 * 60 * 1000; // Lock for 2 hours
  }
  next();
});

// Method to check password
PartnerSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to calculate overall EcoScore
PartnerSchema.methods.calculateEcoScore = function() {
  let score = 0;
  const profile = this.sustainabilityProfile;
  
  // Environmental factors (60% of total score)
  if (profile.environmental.renewableEnergyPercent) {
    score += (profile.environmental.renewableEnergyPercent / 100) * 25;
  }
  
  if (profile.environmental.wasteReductionPercent) {
    score += (profile.environmental.wasteReductionPercent / 100) * 10;
  }
  
  if (profile.environmental.recyclingProgram) score += 5;
  if (profile.environmental.carbonNeutralGoal.hasGoal) score += 10;
  if (profile.environmental.carbonNeutralGoal.currentProgress) {
    score += (profile.environmental.carbonNeutralGoal.currentProgress / 100) * 10;
  }
  
  // Social factors (25% of total score)
  if (profile.social.fairLaborCertified) score += 8;
  if (profile.social.workerSafetyPrograms) score += 7;
  if (profile.social.supplyChainTransparency === 'full') score += 5;
  else if (profile.social.supplyChainTransparency === 'partial') score += 3;
  if (profile.social.diversityAndInclusion.hasProgram) score += 5;
  
  // Materials and packaging (15% of total score)
  if (profile.materials.recycledContentAvg) {
    score += (profile.materials.recycledContentAvg / 100) * 8;
  }
  if (profile.packaging.recyclablePackaging) {
    score += (profile.packaging.recyclablePackaging / 100) * 7;
  }
  
  // Certifications bonus (extra points)
  const verifiedCerts = this.certifications.filter(cert => 
    cert.verificationStatus === 'verified'
  ).length;
  score += Math.min(10, verifiedCerts * 2);
  
  this.sustainabilityProfile.overallEcoScore = Math.min(100, Math.round(score));
  this.lastScoreCalculation = new Date();
  
  return this.sustainabilityProfile.overallEcoScore;
};

// Method to handle failed login attempt
PartnerSchema.methods.incLoginAttempts = function() {
  // Reset attempts if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 attempts
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
PartnerSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Method to add a product
PartnerSchema.methods.addProduct = function(productId) {
  if (!this.products.includes(productId)) {
    this.products.push(productId);
    this.metrics.totalProducts += 1;
  }
  return this.save();
};

// Method to update metrics after a sale
PartnerSchema.methods.updateSaleMetrics = function(saleData) {
  this.metrics.totalSales += saleData.quantity || 1;
  this.metrics.totalRevenue += saleData.amount || 0;
  this.metrics.totalOrders += 1;
  
  if (saleData.impact) {
    this.metrics.totalImpactGenerated.carbonSaved += saleData.impact.carbon || 0;
    this.metrics.totalImpactGenerated.waterSaved += saleData.impact.water || 0;
    this.metrics.totalImpactGenerated.wastePrevented += saleData.impact.waste || 0;
    this.metrics.totalImpactGenerated.pointsAwarded += saleData.impact.points || 0;
  }
  
  return this.save();
};

module.exports = mongoose.model('Partner', PartnerSchema);
