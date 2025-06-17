const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const PartnerSchema = new mongoose.Schema({
  // Basic required information
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

  // Optional business information
  businessInfo: {
    businessType: {
      type: String,
      enum: ['manufacturer', 'retailer', 'distributor', 'service_provider', 'other'],
      default: 'other'
    },
    description: String,
    website: String,
    foundedYear: Number,
    employeeCount: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-1000', '1000+']
    }
  },

  // Contact information
  contactInfo: {
    phone: String,
    primaryContact: {
      name: String,
      role: String,
      email: String,
      phone: String
    }
  },

  // Business address
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },

  // Sustainability profile (optional)
  sustainabilityProfile: {
    environmental: {
      carbonScope1: { type: Number, min: 0 },
      carbonScope2: { type: Number, min: 0 },
      carbonScope3: { type: Number, min: 0 },
      renewableEnergyPercent: { type: Number, min: 0, max: 100, default: 0 },
      wasteReductionPercent: { type: Number, min: 0, max: 100, default: 0 },
      waterConservationPercent: { type: Number, min: 0, max: 100, default: 0 }
    },
    social: {
      fairLaborCertified: { type: Boolean, default: false },
      workerSafetyPrograms: { type: Boolean, default: false },
      communityInvestmentPercent: { type: Number, min: 0, max: 100, default: 0 },
      diversityInclusionPrograms: { type: Boolean, default: false },
      supplyChainTransparency: { 
        type: String, 
        enum: ['full', 'partial', 'limited', 'none'], 
        default: 'none' 
      }
    }
  },

  // Certifications
  certifications: [{
    name: {
      type: String,
      required: true
    },
    issuedBy: String,
    validFrom: Date,
    validUntil: Date,
    verificationStatus: { 
      type: String, 
      enum: ['verified', 'pending', 'expired', 'invalid'], 
      default: 'pending' 
    }
  }],

  // Partner status and tier
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'suspended', 'rejected'], 
    default: 'pending' 
  },
  
  // Performance metrics
  metrics: {
    totalProducts: { type: Number, default: 0 },
    activeProducts: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    averageProductEcoScore: { type: Number, default: 0 },
    customerRating: { type: Number, min: 0, max: 5, default: 0 },
    reviewCount: { type: Number, default: 0 }
  },

  // Total environmental impact generated through all products
  totalImpactGenerated: {
    carbonSaved: { type: Number, default: 0 }, // kg CO2 saved through all products
    waterSaved: { type: Number, default: 0 }, // liters saved
    wastePrevented: { type: Number, default: 0 }, // kg waste prevented
    pointsAwarded: { type: Number, default: 0 }, // total impact points awarded to users
    productsEnabled: { type: Number, default: 0 } // number of eco-products enabled
  },

  // Account settings
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,

  // Preferences
  preferences: {
    notifications: { type: Boolean, default: true },
    emailUpdates: { type: Boolean, default: true },
    marketingEmails: { type: Boolean, default: false }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for partner tier based on total impact
PartnerSchema.virtual('impactTier').get(function() {
  const impact = this.totalImpactGenerated.pointsAwarded;
  if (impact >= 50000) return 'Impact Champion';
  if (impact >= 25000) return 'Impact Leader';
  if (impact >= 10000) return 'Impact Creator';
  if (impact >= 5000) return 'Impact Builder';
  if (impact >= 1000) return 'Impact Starter';
  return 'New Partner';
});

// Virtual for sustainability score
PartnerSchema.virtual('sustainabilityScore').get(function() {
  const env = this.sustainabilityProfile?.environmental || {};
  const social = this.sustainabilityProfile?.social || {};
  
  let score = 0;
  score += (env.renewableEnergyPercent || 0) * 0.3;
  score += (env.wasteReductionPercent || 0) * 0.2;  score += (env.waterConservationPercent || 0) * 0.2;
  score += (social.fairLaborCertified ? 15 : 0);
  score += (social.workerSafetyPrograms ? 15 : 0);
  score += (this.certifications || []).filter(c => c.verificationStatus === 'verified').length * 5;
  
  return Math.min(100, Math.round(score));
});

// Index for performance
PartnerSchema.index({ email: 1 });
PartnerSchema.index({ companyName: 1 });
PartnerSchema.index({ status: 1 });
PartnerSchema.index({ 'totalImpactGenerated.pointsAwarded': -1 });

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

// Method to check password
PartnerSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to update impact metrics
PartnerSchema.methods.addImpact = function(impact) {
  this.totalImpactGenerated.carbonSaved += impact.carbon || 0;
  this.totalImpactGenerated.waterSaved += impact.water || 0;
  this.totalImpactGenerated.wastePrevented += impact.waste || 0;
  this.totalImpactGenerated.pointsAwarded += impact.points || 0;
  
  return this.save();
};

module.exports = mongoose.model('Partner', PartnerSchema);