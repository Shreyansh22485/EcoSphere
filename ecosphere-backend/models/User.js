const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
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
    select: false // Don't include password in queries by default
  },
    // EcoSphere specific fields
  impactPoints: { 
    type: Number, 
    default: 0,
    min: 0
  },
  // User eco tier based on impact points (different from product tiers)
  userTier: { 
    type: String, 
    enum: ['Seedling', 'Sprout', 'Tree', 'Forest', 'Planet Guardian'],
    default: 'Seedling'
  },
  
  // Impact tracking (cumulative)
  totalCarbonSaved: { 
    type: Number, 
    default: 0,
    min: 0
  }, // kg CO2
  totalWaterSaved: { 
    type: Number, 
    default: 0,
    min: 0
  },  // liters
  totalWastePrevented: { 
    type: Number, 
    default: 0,
    min: 0
  }, // kg
  
  // Gamification
  badges: [{
    name: {
      type: String,
      required: true
    },
    tier: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold', 'Platinum']
    },
    earnedAt: { 
      type: Date, 
      default: Date.now 
    },
    points: {
      type: Number,
      default: 0
    }
  }],
  
  // Milestones
  milestonesReached: [{
    milestone: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['Carbon', 'Water', 'Waste', 'Points', 'Orders', 'Social']
    },
    reachedAt: { 
      type: Date, 
      default: Date.now 
    },
    pointsEarned: {
      type: Number,
      default: 0
    },
    targetValue: Number,
    actualValue: Number
  }],
    // Purchase history reference
  orders: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order' 
  }],
  
  // Eco tier purchase distribution tracking for dashboard analytics
  ecoTierPurchases: {
    ecoEntryCount: { type: Number, default: 0 },
    ecoAwareCount: { type: Number, default: 0 },
    ecoSelectCount: { type: Number, default: 0 },
    ecoPioneerCount: { type: Number, default: 0 },
    ecoChampionCount: { type: Number, default: 0 },
    standardCount: { type: Number, default: 0 }
  },
    // Streak tracking
  sustainabilityStreak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastPurchaseDate: { type: Date }
  },
  
  // Monthly impact points tracking for dashboard trends
  monthlyImpactPoints: {
    type: Map,
    of: Number,
    default: new Map()
  },
  
  // Eco Rewards System - Tier-based discounts
  ecoRewards: {
    availableDiscount: { type: Number, default: 0 }, // Current available discount %
    totalDiscountUsed: { type: Number, default: 0 }, // Lifetime discount used in $
    packageReturns: { type: Number, default: 0 }, // Number of packages returned
    returnBonusEarned: { type: Number, default: 0 } // Total bonus points from returns
  },
  
  // User preferences
  preferences: {
    notifications: { 
      type: Boolean, 
      default: true 
    },
    emailUpdates: {
      type: Boolean,
      default: true
    },
    sustainabilityGoals: {
      carbonReduction: { 
        type: Number, 
        default: 0 
      }, // kg CO2 per year goal
      wasteReduction: { 
        type: Number, 
        default: 0 
      }, // kg per year goal
      waterSaving: {
        type: Number,
        default: 0
      } // liters per year goal
    },
    privacySettings: {
      showInLeaderboard: {
        type: Boolean,
        default: true
      },
      shareImpactData: {
        type: Boolean,
        default: true
      }
    }
  },

  // Profile information
  profile: {
    avatar: String,
    bio: String,
    location: {
      city: String,
      country: String
    },
    joinedChallenges: [{
      challengeId: String,
      joinedAt: Date,
      status: {
        type: String,
        enum: ['active', 'completed', 'failed'],
        default: 'active'
      }
    }]
  },

  // Account status
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
  
  // Timestamps for tier calculations
  lastTierUpdate: {
    type: Date,
    default: Date.now
  },
    // Achievement tracking
  achievements: {
    firstPurchase: { type: Date },
    firstEcoProduct: { type: Date },
    firstBadge: { type: Date },
    referralCount: { type: Number, default: 0 },
    streakDays: { type: Number, default: 0 },
    lastActivityDate: { type: Date, default: Date.now }
  },
  
  // EcoSphere Groups - User group memberships and stats
  groups: {
    memberships: [{
      group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
      },
      joinedAt: {
        type: Date,
        default: Date.now
      },
      role: {
        type: String,
        enum: ['leader', 'moderator', 'member'],
        default: 'member'
      },
      contributionPoints: {
        type: Number,
        default: 0
      },
      isActive: {
        type: Boolean,
        default: true
      }
    }],
    totalGroupPoints: {
      type: Number,
      default: 0
    },
    groupsLeading: {
      type: Number,
      default: 0
    },
    groupAchievements: [{
      groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
      },
      achievementType: {
        type: String,
        enum: ['challenge_completed', 'top_contributor', 'group_milestone', 'leadership_award']
      },
      title: String,
      description: String,
      pointsEarned: {
        type: Number,
        default: 0
      },
      earnedAt: {
        type: Date,
        default: Date.now
      }
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for user's current level based on impact points
UserSchema.virtual('level').get(function() {
  if (this.impactPoints >= 50000) return 'Planet Guardian';
  if (this.impactPoints >= 10000) return 'Forest';
  if (this.impactPoints >= 2000) return 'Tree';
  if (this.impactPoints >= 500) return 'Sprout';
  return 'Seedling';
});

// Virtual for progress to next tier
UserSchema.virtual('tierProgress').get(function() {
  const thresholds = {
    'Seedling': 0,
    'Sprout': 500,
    'Tree': 2000,
    'Forest': 10000,
    'Planet Guardian': 50000
  };
  
  const tiers = Object.keys(thresholds);
  const currentTierIndex = tiers.indexOf(this.userTier);
  
  if (currentTierIndex === tiers.length - 1) {
    return { progress: 100, nextTier: null, pointsToNext: 0 };
  }
  
  const nextTier = tiers[currentTierIndex + 1];
  const currentThreshold = thresholds[this.userTier];
  const nextThreshold = thresholds[nextTier];
  
  const progress = Math.min(100, 
    ((this.impactPoints - currentThreshold) / (nextThreshold - currentThreshold)) * 100
  );
  
  return {
    progress: Math.round(progress),
    nextTier,
    pointsToNext: Math.max(0, nextThreshold - this.impactPoints)
  };
});

// Virtual for available eco discount based on user tier
UserSchema.virtual('availableEcoDiscount').get(function() {
  const tierDiscounts = {
    'Seedling': 0,      // 0% discount
    'Sprout': 5,        // 5% discount
    'Tree': 10,         // 10% discount
    'Forest': 15,       // 15% discount
    'Planet Guardian': 20 // 20% discount
  };
  
  return tierDiscounts[this.userTier] || 0;
});

// Index for performance
UserSchema.index({ email: 1 });
UserSchema.index({ impactPoints: -1 });
UserSchema.index({ userTier: 1 });
UserSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to update tier based on impact points
UserSchema.pre('save', function(next) {
  if (this.isModified('impactPoints')) {
    const newTier = this.level;
    if (newTier !== this.userTier) {
      this.userTier = newTier;
      this.lastTierUpdate = new Date();
    }
  }
  next();
});

// Method to check password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to calculate total environmental impact
UserSchema.methods.getTotalImpact = function() {
  return {
    carbon: this.totalCarbonSaved,
    water: this.totalWaterSaved,
    waste: this.totalWastePrevented,
    points: this.impactPoints,
    tierInfo: {
      current: this.userTier,
      progress: this.tierProgress
    }
  };
};

// Method to add impact points and update metrics
UserSchema.methods.addImpact = function(impact) {
  this.impactPoints += impact.points || 0;
  this.totalCarbonSaved += impact.carbon || 0;
  this.totalWaterSaved += impact.water || 0;
  this.totalWastePrevented += impact.waste || 0;
  this.achievements.lastActivityDate = new Date();
  
  return this.save();
};

// Method to earn a badge
UserSchema.methods.earnBadge = function(badgeData) {
  const existingBadge = this.badges.find(b => 
    b.name === badgeData.name && b.tier === badgeData.tier
  );
  
  if (!existingBadge) {
    this.badges.push({
      name: badgeData.name,
      tier: badgeData.tier,
      points: badgeData.points || 0,
      earnedAt: new Date()
    });
    
    if (badgeData.points) {
      this.impactPoints += badgeData.points;
    }
    
    if (!this.achievements.firstBadge) {
      this.achievements.firstBadge = new Date();
    }
    
    return this.save();
  }
  
  return Promise.resolve(this);
};

module.exports = mongoose.model('User', UserSchema);
