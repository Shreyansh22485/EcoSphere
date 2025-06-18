const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  // Basic Group Information
  name: {
    type: String,
    required: [true, 'Group name is required'],
    trim: true,
    maxlength: [100, 'Group name cannot exceed 100 characters'],
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Group description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Zero Waste',
      'Sustainable Living', 
      'Renewable Energy',
      'Eco Fashion',
      'Green Transportation',
      'Organic Food',
      'Conservation',
      'Climate Action',
      'Circular Economy',
      'Clean Tech',
      'General Sustainability'
    ]
  },
  image: {
    type: String,
    default: '../images/default-group.jpg'
  },
  
  // Group Leadership and Membership
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
  memberCount: {
    type: Number,
    default: 1 // Leader counts as initial member
  },
  maxMembers: {
    type: Number,
    default: 100,
    min: 5,
    max: 1000
  },
  
  // Group Settings
  settings: {
    isPublic: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    allowInvites: {
      type: Boolean,
      default: true
    },
    groupBuyingEnabled: {
      type: Boolean,
      default: true
    }
  },
  
  // Group Goals and Challenges
  goals: {
    currentChallenge: {
      name: String,
      description: String,
      target: {
        type: String,
        enum: ['carbon_reduction', 'waste_reduction', 'water_conservation', 'impact_points', 'group_purchases']
      },
      targetValue: Number, // e.g., 1000 kg CO2, 500 impact points
      currentProgress: {
        type: Number,
        default: 0
      },
      deadline: Date,
      reward: {
        type: String,
        enum: ['bonus_points', 'badge', 'discount', 'recognition']
      },
      rewardValue: Number, // e.g., 50 bonus points per member
      isActive: {
        type: Boolean,
        default: false
      }
    },
    monthlyTargets: {
      impactPoints: {
        target: { type: Number, default: 0 },
        achieved: { type: Number, default: 0 }
      },
      carbonSaved: {
        target: { type: Number, default: 0 },
        achieved: { type: Number, default: 0 }
      },
      groupPurchases: {
        target: { type: Number, default: 0 },
        achieved: { type: Number, default: 0 }
      }
    }
  },
  
  // Group Impact Metrics
  totalImpact: {
    impactPoints: {
      type: Number,
      default: 0
    },
    carbonSaved: {
      type: Number,
      default: 0
    }, // kg CO2
    waterSaved: {
      type: Number,
      default: 0
    }, // liters
    wastePrevented: {
      type: Number,
      default: 0
    }, // kg
    totalOrders: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    }
  },
  
  // Group Achievements and Badges
  achievements: [{
    badgeName: {
      type: String,
      required: true
    },
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now
    },
    category: {
      type: String,
      enum: ['impact', 'collaboration', 'growth', 'leadership', 'innovation']
    },
    icon: String,
    pointsAwarded: {
      type: Number,
      default: 0
    }
  }],
  
  // Group Buying Activities
  groupBuying: {
    activeOrders: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      targetQuantity: Number,
      currentQuantity: Number,
      participants: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        quantity: Number,
        joinedAt: Date
      }],
      deadline: Date,
      discountPercent: Number,
      status: {
        type: String,
        enum: ['active', 'completed', 'expired', 'cancelled'],
        default: 'active'
      }
    }],
    completedOrders: {
      type: Number,
      default: 0
    },
    totalSavings: {
      type: Number,
      default: 0
    } // Total money saved through group buying
  },
    // Activity and Engagement
  activity: {
    lastActivity: {
      type: Date,
      default: Date.now
    },
    weeklyActiveMembers: {
      type: Number,
      default: 0
    },
    monthlyActiveMembers: {
      type: Number,
      default: 0
    },
    averageEngagement: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    } // Percentage based on member activity
  },
  
  // Activity Log for group feed
  activityLog: [{    type: {
      type: String,
      enum: [
        'member_joined', 
        'member_left', 
        'member_removed', 
        'challenge_created', 
        'challenge_completed', 
        'purchase_made', 
        'goal_reached', 
        'badge_earned',
        'group_buy_started',
        'group_buy_joined',
        'group_buy_left',
        'group_buy_completed',
        'group_buy_cancelled'
      ],
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    description: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed
    }
  }],
  
  // Group Statistics
  stats: {
    growthRate: {
      type: Number,
      default: 0
    }, // Monthly % growth
    retentionRate: {
      type: Number,
      default: 100
    }, // % of members still active after 30 days
    averageOrderValue: {
      type: Number,
      default: 0
    },
    topPerformers: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      metric: String, // 'impact_points', 'orders', 'invites'
      value: Number,
      rank: Number
    }]
  },
  
  // Group Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'archived'],
    default: 'active'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Trending and Recommendations
  trending: {
    score: {
      type: Number,
      default: 0
    }, // Calculated based on recent activity, growth, impact
    weeklyRank: Number,
    monthlyRank: Number
  },
  
  // Group Tags for Discovery
  tags: [{
    type: String,
    trim: true
  }],
  
  // Location (optional for local groups)
  location: {
    city: String,
    state: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for group completion rate
GroupSchema.virtual('challengeCompletionRate').get(function() {
  if (!this.goals.currentChallenge.isActive || !this.goals.currentChallenge.targetValue) {
    return 0;
  }
  return Math.min(100, (this.goals.currentChallenge.currentProgress / this.goals.currentChallenge.targetValue) * 100);
});

// Virtual for average impact per member
GroupSchema.virtual('averageImpactPerMember').get(function() {
  if (this.memberCount === 0) return 0;
  return {
    impactPoints: Math.round(this.totalImpact.impactPoints / this.memberCount),
    carbonSaved: (this.totalImpact.carbonSaved / this.memberCount).toFixed(1),
    waterSaved: Math.round(this.totalImpact.waterSaved / this.memberCount),
    wastePrevented: (this.totalImpact.wastePrevented / this.memberCount).toFixed(1)
  };
});

// Virtual for group health score (0-100)
GroupSchema.virtual('healthScore').get(function() {
  let score = 0;
  
  // Activity score (30%)
  const daysSinceActivity = Math.floor((Date.now() - this.activity.lastActivity) / (1000 * 60 * 60 * 24));
  const activityScore = Math.max(0, 30 - daysSinceActivity);
  score += activityScore;
  
  // Engagement score (30%)
  score += this.activity.averageEngagement * 0.3;
  
  // Growth score (20%)
  const growthScore = Math.min(20, this.stats.growthRate * 2);
  score += growthScore;
  
  // Impact score (20%)
  const impactScore = Math.min(20, this.totalImpact.impactPoints / 100);
  score += impactScore;
  
  return Math.round(Math.min(100, score));
});

// Indexes for performance
GroupSchema.index({ category: 1 });
GroupSchema.index({ leader: 1 });
GroupSchema.index({ 'members.user': 1 });
GroupSchema.index({ status: 1 });
GroupSchema.index({ createdAt: -1 });
GroupSchema.index({ 'trending.score': -1 });
GroupSchema.index({ memberCount: -1 });
GroupSchema.index({ 'totalImpact.impactPoints': -1 });
GroupSchema.index({ 'settings.isPublic': 1 });

// Text index for search
GroupSchema.index({
  name: 'text',
  description: 'text',
  tags: 'text'
});

// Pre-save middleware to update member count
GroupSchema.pre('save', function(next) {
  if (this.isModified('members')) {
    this.memberCount = this.members.filter(member => member.isActive).length;
  }
  next();
});

// Method to add member
GroupSchema.methods.addMember = function(userId, role = 'member') {
  // Check if user is already a member
  const existingMember = this.members.find(m => m.user.toString() === userId.toString());
  if (existingMember) {
    if (!existingMember.isActive) {
      existingMember.isActive = true;
      existingMember.joinedAt = new Date();
    }
    return this;
  }
  
  // Check if group is full
  if (this.memberCount >= this.maxMembers) {
    throw new Error('Group is full');
  }
  
  this.members.push({
    user: userId,
    role: role,
    joinedAt: new Date(),
    isActive: true,
    contributionPoints: 0
  });
  
  return this;
};

// Method to remove member
GroupSchema.methods.removeMember = function(userId) {
  const member = this.members.find(m => m.user.toString() === userId.toString());
  if (member) {
    member.isActive = false;
  }
  return this;
};

// Method to update group progress
GroupSchema.methods.updateProgress = function(impactData) {
  // Update total impact
  this.totalImpact.impactPoints += impactData.impactPoints || 0;
  this.totalImpact.carbonSaved += impactData.carbonSaved || 0;
  this.totalImpact.waterSaved += impactData.waterSaved || 0;
  this.totalImpact.wastePrevented += impactData.wastePrevented || 0;
  this.totalImpact.totalOrders += 1;
  this.totalImpact.totalSpent += impactData.orderValue || 0;
  
  // Update current challenge progress
  if (this.goals.currentChallenge.isActive) {
    const target = this.goals.currentChallenge.target;
    const progressValue = impactData[target] || 0;
    this.goals.currentChallenge.currentProgress += progressValue;
  }
  
  // Update monthly targets
  this.goals.monthlyTargets.impactPoints.achieved += impactData.impactPoints || 0;
  this.goals.monthlyTargets.carbonSaved.achieved += impactData.carbonSaved || 0;
  this.goals.monthlyTargets.groupPurchases.achieved += 1;
  
  // Update activity
  this.activity.lastActivity = new Date();
  
  return this.save();
};

// Method to award achievement
GroupSchema.methods.awardAchievement = function(achievementData) {
  const existingAchievement = this.achievements.find(a => a.badgeName === achievementData.badgeName);
  
  if (!existingAchievement) {
    this.achievements.push({
      badgeName: achievementData.badgeName,
      description: achievementData.description,
      category: achievementData.category,
      icon: achievementData.icon,
      pointsAwarded: achievementData.pointsAwarded || 0
    });
    
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Static method to find trending groups
GroupSchema.statics.getTrendingGroups = function(limit = 10) {
  return this.find({ status: 'active', 'settings.isPublic': true })
    .sort({ 'trending.score': -1 })
    .limit(limit)
    .populate('leader', 'name')
    .populate('members.user', 'name');
};

// Static method to find groups by category
GroupSchema.statics.getGroupsByCategory = function(category, limit = 20) {
  return this.find({ 
    category: category, 
    status: 'active', 
    'settings.isPublic': true 
  })
    .sort({ memberCount: -1 })
    .limit(limit)
    .populate('leader', 'name');
};

// Static method to search groups
GroupSchema.statics.searchGroups = function(searchTerm, limit = 20) {
  return this.find({
    $text: { $search: searchTerm },
    status: 'active',
    'settings.isPublic': true
  })
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit)
    .populate('leader', 'name');
};

module.exports = mongoose.model('Group', GroupSchema);
