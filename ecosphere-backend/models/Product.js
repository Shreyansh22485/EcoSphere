const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Please provide a product name'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: { 
    type: String, 
    required: [true, 'Please provide a product description'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  price: { 
    type: Number, 
    required: [true, 'Please provide a price'],
    min: [0, 'Price cannot be negative']
  },
  category: { 
    type: String, 
    required: [true, 'Please provide a category'],
    enum: [
      'home-kitchen',
      'electronics', 
      'clothing',
      'health-beauty',
      'sports-outdoors',
      'toys-games',
      'books-media',
      'automotive',
      'garden-outdoor',
      'office-supplies',
      'other'
    ]
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  
  // Partner reference
  partner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Partner',
    required: [true, 'Product must belong to a partner']
  },
  
  // EcoScore components (0-100 scale)
  ecoScore: {
    overall: { 
      type: Number, 
      required: [true, 'Overall EcoScore is required'],
      min: 0, 
      max: 100 
    },
    components: {
      carbon: { 
        type: Number, 
        min: 0, 
        max: 25,
        default: 0
      },
      materials: { 
        type: Number, 
        min: 0, 
        max: 20,
        default: 0
      },
      packaging: { 
        type: Number, 
        min: 0, 
        max: 15,
        default: 0
      },
      social: { 
        type: Number, 
        min: 0, 
        max: 15,
        default: 0
      },
      lifecycle: { 
        type: Number, 
        min: 0, 
        max: 15,
        default: 0
      },
      certifications: { 
        type: Number, 
        min: 0, 
        max: 10,
        default: 0
      }
    }
  },
  
  // Detailed sustainability metrics
  sustainability: {
    carbonFootprint: {
      scope1: { type: Number, min: 0 }, // Direct emissions (kg CO2)
      scope2: { type: Number, min: 0 }, // Electricity (kg CO2)
      scope3: { type: Number, min: 0 }, // Supply chain (kg CO2)
      total: { type: Number, min: 0 }   // Total kg CO2 per unit
    },
    
    waterUsage: { 
      type: Number, 
      min: 0
    }, // liters per unit
    wasteGeneration: { 
      type: Number, 
      min: 0 
    }, // kg per unit
    
    materials: {
      recycledContent: { 
        type: Number, 
        min: 0, 
        max: 100,
        default: 0
      }, // percentage
      bioBasedContent: { 
        type: Number, 
        min: 0, 
        max: 100,
        default: 0
      },
      renewableContent: { 
        type: Number, 
        min: 0, 
        max: 100,
        default: 0
      },
      toxicSubstances: { 
        type: String, 
        enum: ['none', 'minimal', 'disclosed', 'unknown'],
        default: 'unknown'
      }
    },
    
    packaging: {
      weight: { 
        type: Number, 
        min: 0 
      }, // grams
      recyclable: { 
        type: String, 
        enum: ['yes', 'partially', 'no'],
        default: 'no'
      },
      plasticFree: { 
        type: Boolean, 
        default: false 
      },
      biodegradable: { 
        type: Boolean, 
        default: false 
      },
      reusable: {
        type: Boolean,
        default: false
      }
    },
    
    lifecycle: {
      expectedLifespan: { 
        type: Number, 
        min: 0 
      }, // years
      repairability: { 
        type: String, 
        enum: ['excellent', 'good', 'fair', 'poor'],
        default: 'fair'
      },
      takeBackProgram: { 
        type: Boolean, 
        default: false 
      },
      disposalGuidance: {
        type: String,
        maxlength: [500, 'Disposal guidance cannot exceed 500 characters']
      }
    },
    
    social: {
      fairLabor: { 
        type: Boolean, 
        default: false 
      },
      workerSafety: { 
        type: Boolean, 
        default: false 
      },
      communityImpact: {
        type: String,
        maxlength: [500, 'Community impact description cannot exceed 500 characters']
      },
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
    certificateNumber: String,
    verificationStatus: { 
      type: String, 
      enum: ['verified', 'pending', 'expired', 'invalid'], 
      default: 'pending' 
    },
    documentUrl: String
  }],
  
  // Impact per purchase (calculated automatically)
  impactPerPurchase: {
    carbonSaved: { 
      type: Number,
      default: 0
    }, // kg CO2 saved vs conventional alternative
    waterSaved: { 
      type: Number,
      default: 0
    },  // liters saved
    wastePrevented: { 
      type: Number,
      default: 0
    }, // kg waste prevented
    impactPoints: { 
      type: Number,
      default: 0
    } // points earned per purchase
  },
  
  // Product status and inventory
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'pending_review', 'rejected'], 
    default: 'pending_review' 
  },
  inventory: {
    stock: { 
      type: Number, 
      default: 0,
      min: 0
    },
    lowStockThreshold: { 
      type: Number, 
      default: 10,
      min: 0
    },
    reserved: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  
  // Group buying functionality
  groupBuying: {
    enabled: { 
      type: Boolean, 
      default: false 
    },
    minQuantity: { 
      type: Number, 
      default: 1,
      min: 1
    },
    discountTiers: [{
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      discountPercent: {
        type: Number,
        required: true,
        min: 0,
        max: 100
      }
    }],
    currentGroupSize: { 
      type: Number, 
      default: 0,
      min: 0
    },
    groupDeadline: Date,
    activeGroups: [{
      groupId: String,
      participants: Number,
      targetQuantity: Number,
      currentProgress: Number,
      deadline: Date,
      status: {
        type: String,
        enum: ['active', 'completed', 'cancelled'],
        default: 'active'
      }
    }]
  },

  // Product performance metrics
  metrics: {
    totalSales: { 
      type: Number, 
      default: 0,
      min: 0
    },
    totalRevenue: {
      type: Number,
      default: 0,
      min: 0
    },
    averageRating: { 
      type: Number, 
      min: 0, 
      max: 5, 
      default: 0 
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0
    },
    totalImpactGenerated: {
      carbonSaved: { type: Number, default: 0 },
      waterSaved: { type: Number, default: 0 },
      wastePrevented: { type: Number, default: 0 },
      pointsAwarded: { type: Number, default: 0 }
    },
    views: {
      type: Number,
      default: 0,
      min: 0
    },
    wishlisted: {
      type: Number,
      default: 0,
      min: 0
    }
  },

  // SEO and marketing
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    slug: {
      type: String,
      unique: true,
      sparse: true
    }
  },

  // Product specifications
  specifications: [{
    name: String,
    value: String,
    unit: String
  }],

  // Shipping information
  shipping: {
    weight: { type: Number, min: 0 }, // kg
    dimensions: {
      length: { type: Number, min: 0 }, // cm
      width: { type: Number, min: 0 },  // cm
      height: { type: Number, min: 0 }  // cm
    },
    shippingClass: {
      type: String,
      enum: ['standard', 'fragile', 'hazardous', 'oversized'],
      default: 'standard'
    },
    freeShipping: {
      type: Boolean,
      default: false
    },
    shippingCost: {
      type: Number,
      min: 0,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for EcoScore tier
ProductSchema.virtual('ecoTier').get(function() {
  const score = this.ecoScore.overall;
  if (score >= 90) return 'EcoChampion';
  if (score >= 75) return 'EcoPioneer';
  if (score >= 60) return 'EcoSelect';
  if (score >= 45) return 'EcoAware';
  if (score >= 30) return 'EcoEntry';
  return 'Standard';
});

// Virtual for availability status
ProductSchema.virtual('isAvailable').get(function() {
  return this.status === 'active' && this.inventory.stock > 0;
});

// Virtual for total carbon footprint
ProductSchema.virtual('totalCarbonFootprint').get(function() {
  const carbon = this.sustainability.carbonFootprint;
  return (carbon.scope1 || 0) + (carbon.scope2 || 0) + (carbon.scope3 || 0);
});

// Indexes for performance
ProductSchema.index({ partner: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ 'ecoScore.overall': -1 });
ProductSchema.index({ status: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ name: 'text', description: 'text' });

// Pre-save middleware to calculate overall EcoScore
ProductSchema.pre('save', function(next) {
  if (this.isModified('ecoScore.components')) {
    const components = this.ecoScore.components;
    this.ecoScore.overall = 
      (components.carbon || 0) +
      (components.materials || 0) +
      (components.packaging || 0) +
      (components.social || 0) +
      (components.lifecycle || 0) +
      (components.certifications || 0);
  }
  next();
});

// Pre-save middleware to calculate impact per purchase
ProductSchema.pre('save', function(next) {
  if (this.isModified('ecoScore') || this.isModified('price')) {
    const ecoScore = this.ecoScore.overall;
    const price = this.price;
    
    // Calculate impact based on EcoScore and price
    this.impactPerPurchase.carbonSaved = Math.round(ecoScore * 0.8); // kg CO2
    this.impactPerPurchase.waterSaved = Math.round(ecoScore * 12); // liters
    this.impactPerPurchase.wastePrevented = Math.round(ecoScore * 0.3); // kg
    
    // Calculate impact points: base points + EcoScore bonus
    let basePoints = Math.round(price);
    let ecoBonus = Math.round((ecoScore / 100) * basePoints);
    this.impactPerPurchase.impactPoints = basePoints + ecoBonus;
  }
  next();
});

// Pre-save middleware to update carbon footprint total
ProductSchema.pre('save', function(next) {
  if (this.isModified('sustainability.carbonFootprint')) {
    const carbon = this.sustainability.carbonFootprint;
    carbon.total = (carbon.scope1 || 0) + (carbon.scope2 || 0) + (carbon.scope3 || 0);
  }
  next();
});

// Pre-save middleware to generate slug
ProductSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.seo.slug) {
    this.seo.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Method to check if product is in stock
ProductSchema.methods.checkStock = function(quantity = 1) {
  return this.inventory.stock >= quantity;
};

// Method to reserve stock
ProductSchema.methods.reserveStock = function(quantity) {
  if (this.checkStock(quantity)) {
    this.inventory.reserved += quantity;
    this.inventory.stock -= quantity;
    return true;
  }
  return false;
};

// Method to release reserved stock
ProductSchema.methods.releaseStock = function(quantity) {
  this.inventory.reserved = Math.max(0, this.inventory.reserved - quantity);
  this.inventory.stock += quantity;
};

// Method to complete sale (remove from reserved)
ProductSchema.methods.completeSale = function(quantity) {
  this.inventory.reserved = Math.max(0, this.inventory.reserved - quantity);
  this.metrics.totalSales += quantity;
  this.metrics.totalRevenue += (this.price * quantity);
  
  // Update impact metrics
  this.metrics.totalImpactGenerated.carbonSaved += 
    (this.impactPerPurchase.carbonSaved * quantity);
  this.metrics.totalImpactGenerated.waterSaved += 
    (this.impactPerPurchase.waterSaved * quantity);
  this.metrics.totalImpactGenerated.wastePrevented += 
    (this.impactPerPurchase.wastePrevented * quantity);
  this.metrics.totalImpactGenerated.pointsAwarded += 
    (this.impactPerPurchase.impactPoints * quantity);
};

// Method to get current group buying discount
ProductSchema.methods.getGroupBuyingDiscount = function(quantity) {
  if (!this.groupBuying.enabled || !this.groupBuying.discountTiers.length) {
    return 0;
  }
  
  // Find the highest applicable discount tier
  let applicableDiscount = 0;
  
  for (const tier of this.groupBuying.discountTiers) {
    if (quantity >= tier.quantity && tier.discountPercent > applicableDiscount) {
      applicableDiscount = tier.discountPercent;
    }
  }
  
  return applicableDiscount;
};

module.exports = mongoose.model('Product', ProductSchema);
