const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  // Order identification
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  
  // Customer information
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Order must belong to a customer']
  },
  
  // Order items
  orderItems: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partner',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },    ecoScore: {
      type: Number,
      min: 0,
      max: 1000  // Allow higher values for some products
    },
    // Impact for this specific item
    impact: {
      carbonSaved: { type: Number, default: 0 },
      waterSaved: { type: Number, default: 0 },
      wastePrevented: { type: Number, default: 0 },
      impactPoints: { type: Number, default: 0 }
    },    // Group buying information
    groupBuying: {
      isGroupBuy: { type: Boolean, default: false },
      groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
      },
      discount: { type: Number, default: 0 }, // Percentage
      originalPrice: Number,
      groupContributionPoints: { type: Number, default: 0 } // Points earned for group
    }
  }],
    // Order totals
  orderSummary: {
    subtotal: {
      type: Number,
      required: false,
      min: 0,
      default: 0
    },
    tax: {
      type: Number,
      default: 0,
      min: 0
    },
    shipping: {
      type: Number,
      default: 0,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      required: false,
      min: 0,
      default: 0
    }
  },
  
  // Total environmental impact of the order
  totalImpact: {
    carbonSaved: { type: Number, default: 0 }, // kg CO2
    waterSaved: { type: Number, default: 0 },  // liters
    wastePrevented: { type: Number, default: 0 }, // kg
    impactPoints: { type: Number, default: 0 }
  },
    // Shipping information
  shippingAddress: {
    name: { type: String, required: false },
    street: { type: String, required: false },
    city: { type: String, required: false },
    state: { type: String, required: false },
    country: { type: String, required: false },
    zipCode: { type: String, required: false },
    phone: String
  },
  
  billingAddress: {
    name: { type: String, required: false },
    street: { type: String, required: false },
    city: { type: String, required: false },
    state: { type: String, required: false },
    country: { type: String, required: false },
    zipCode: { type: String, required: false },
    phone: String,
    sameAsShipping: { type: Boolean, default: true }
  },
    // Payment information
  payment: {    method: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal', 'apple_pay', 'google_pay', 'bank_transfer', 'group_buy_auto'],
      required: false,
      default: 'credit_card'
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded'],
      default: 'pending'
    },
    transactionId: String,
    paymentGateway: String,
    paidAt: Date,
    refundAmount: { type: Number, default: 0 },
    refundReason: String
  },
  
  // Order status and tracking
  status: {
    type: String,
    enum: [
      'pending',           // Order placed, awaiting payment
      'confirmed',         // Payment confirmed
      'processing',        // Order being prepared
      'shipped',          // Order shipped
      'in_transit',       // Order in transit
      'out_for_delivery', // Out for delivery
      'delivered',        // Successfully delivered
      'cancelled',        // Order cancelled
      'returned',         // Order returned
      'refunded'          // Order refunded
    ],
    default: 'pending'
  },
  
  // Status history for tracking
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String,
    updatedBy: {
      type: String,
      enum: ['system', 'customer', 'partner', 'admin'],
      default: 'system'
    }
  }],
  
  // Shipping and delivery tracking
  shipping: {
    carrier: String,
    trackingNumber: String,
    shippingMethod: {
      type: String,
      enum: ['standard', 'express', 'overnight', 'eco_friendly'],
      default: 'standard'
    },
    estimatedDelivery: Date,
    actualDelivery: Date,
    shippedAt: Date,
    deliveredAt: Date,
    shippingCost: { type: Number, default: 0 },
    // Carbon footprint of shipping
    shippingImpact: {
      carbonEmissions: { type: Number, default: 0 }, // kg CO2
      ecoFriendlyShipping: { type: Boolean, default: false }
    }
  },
  
  // EcoSphere specific features
  ecoSphereFeatures: {
    isEcoOrder: { type: Boolean, default: false }, // All items are eco-friendly
    sustainabilityGoal: String, // Customer's sustainability goal for this order
    impactComparison: {
      traditionalAlternativeImpact: {
        carbon: Number,
        water: Number,
        waste: Number
      },
      actualImpact: {
        carbon: Number,
        water: Number,
        waste: Number
      },
      netSavings: {
        carbon: Number,
        water: Number,
        waste: Number
      }
    }
  },
    // Group buying details
  groupBuying: {
    hasGroupItems: { type: Boolean, default: false },
    totalGroupDiscount: { type: Number, default: 0 },
    groupOrders: [{
      groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
      },
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      participantCount: Number,
      discountApplied: Number,
      groupPointsEarned: { type: Number, default: 0 }
    }],
    // Overall group context for this order
    primaryGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group'
    },
    groupPointsEarned: { type: Number, default: 0 } // Total points earned for group memberships
  },
  
  // Customer feedback and reviews
  feedback: {
    deliveryRating: { type: Number, min: 1, max: 5 },
    packagingRating: { type: Number, min: 1, max: 5 },
    sustainabilityRating: { type: Number, min: 1, max: 5 },
    overallRating: { type: Number, min: 1, max: 5 },
    comment: String,
    wouldRecommend: Boolean,
    submittedAt: Date
  },
  
  // Special notes and instructions
  notes: {
    customerNotes: String,
    internalNotes: String,
    deliveryInstructions: String,
    giftMessage: String,
    isGift: { type: Boolean, default: false }
  },
  
  // Order analytics and tracking
  analytics: {
    source: {
      type: String,
      enum: ['web', 'mobile_app', 'social_media', 'email_campaign', 'referral', 'other'],
      default: 'web'
    },
    campaignId: String,
    referralCode: String,
    deviceType: String,
    browserInfo: String,
    orderDuration: Number, // Time from cart to order completion (seconds)
  },
  
  // Fulfillment information
  fulfillment: {
    fulfillmentCenter: String,
    pickedAt: Date,
    packedAt: Date,
    shippedAt: Date,
    handledBy: String,
    packagingType: {
      type: String,
      enum: ['standard', 'eco_friendly', 'minimal', 'gift_wrap'],
      default: 'standard'
    },
    specialHandling: [String] // ['fragile', 'hazardous', 'refrigerated', etc.]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for order age in days
OrderSchema.virtual('orderAge').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for total items count
OrderSchema.virtual('totalItems').get(function() {
  return this.orderItems.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for delivery status
OrderSchema.virtual('deliveryStatus').get(function() {
  if (this.status === 'delivered') return 'delivered';
  if (this.status === 'out_for_delivery') return 'out_for_delivery';
  if (this.status === 'in_transit') return 'in_transit';
  if (this.status === 'shipped') return 'shipped';
  if (['processing', 'confirmed'].includes(this.status)) return 'preparing';
  return 'pending';
});

// Virtual for estimated total impact vs traditional alternatives
OrderSchema.virtual('impactSavings').get(function() {
  if (!this.ecoSphereFeatures.impactComparison.netSavings) return null;
  
  const savings = this.ecoSphereFeatures.impactComparison.netSavings;
  return {
    carbon: `${savings.carbon} kg CO2 saved`,
    water: `${savings.water} liters saved`,
    waste: `${savings.waste} kg waste prevented`
  };
});

// Indexes for performance
OrderSchema.index({ customer: 1 });
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ 'payment.status': 1 });
OrderSchema.index({ 'orderItems.partner': 1 });

// Pre-save middleware to generate order number
OrderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.orderNumber = `ECO${year}${month}${randomNum}`;
  }
  next();
});

// Pre-save middleware to calculate totals
OrderSchema.pre('save', function(next) {
  if (this.isModified('orderItems')) {
    // Calculate order totals
    let subtotal = 0;
    let totalImpact = {
      carbonSaved: 0,
      waterSaved: 0,
      wastePrevented: 0,
      impactPoints: 0
    };
    
    this.orderItems.forEach(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      
      // Aggregate impact
      totalImpact.carbonSaved += item.impact.carbonSaved || 0;
      totalImpact.waterSaved += item.impact.waterSaved || 0;
      totalImpact.wastePrevented += item.impact.wastePrevented || 0;
      totalImpact.impactPoints += item.impact.impactPoints || 0;
    });
    
    this.orderSummary.subtotal = subtotal;
    this.orderSummary.total = subtotal + this.orderSummary.tax + 
                             this.orderSummary.shipping - this.orderSummary.discount;
    
    this.totalImpact = totalImpact;
    
    // Check if it's an eco order (all items have EcoScore > 60)
    this.ecoSphereFeatures.isEcoOrder = this.orderItems.every(item => 
      item.ecoScore && item.ecoScore >= 60
    );
  }
  next();
});

// Pre-save middleware to update status history
OrderSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      note: `Status changed to ${this.status}`
    });
  }
  next();
});

// Method to calculate shipping cost
OrderSchema.methods.calculateShipping = function(shippingMethod = 'standard') {
  const weights = this.orderItems.reduce((total, item) => {
    // Assume average weight of 1kg per item if not specified
    return total + (item.quantity * 1);
  }, 0);
  
  const baseCost = {
    'standard': 5.99,
    'express': 12.99,
    'overnight': 24.99,
    'eco_friendly': 7.99
  };
  
  let cost = baseCost[shippingMethod] || baseCost.standard;
  
  // Add weight-based cost
  if (weights > 5) {
    cost += (weights - 5) * 1.5;
  }
  
  // Free shipping for orders over $50
  if (this.orderSummary.subtotal >= 50) {
    cost = 0;
  }
  
  return Math.round(cost * 100) / 100;
};

// Method to apply discount
OrderSchema.methods.applyDiscount = function(discountCode, discountAmount) {
  this.orderSummary.discount = discountAmount;
  this.orderSummary.total = this.orderSummary.subtotal + 
                           this.orderSummary.tax + 
                           this.orderSummary.shipping - 
                           this.orderSummary.discount;
  
  this.analytics.campaignId = discountCode;
  return this.save();
};

// Method to update order status
OrderSchema.methods.updateStatus = function(newStatus, note = '', updatedBy = 'system') {
  this.status = newStatus;
  
  // Update relevant timestamps
  const now = new Date();
  switch (newStatus) {
    case 'shipped':
      this.shipping.shippedAt = now;
      this.fulfillment.shippedAt = now;
      break;
    case 'delivered':
      this.shipping.deliveredAt = now;
      this.shipping.actualDelivery = now;
      break;
    case 'confirmed':
      this.payment.paidAt = now;
      this.payment.status = 'completed';
      break;
  }
  
  this.statusHistory.push({
    status: newStatus,
    timestamp: now,
    note: note || `Status updated to ${newStatus}`,
    updatedBy
  });
  
  return this.save();
};

// Method to calculate environmental impact comparison
OrderSchema.methods.calculateImpactComparison = function() {
  // Simulate traditional alternative impact (typically higher)
  const ecoImpact = this.totalImpact;
  const traditionalImpact = {
    carbon: ecoImpact.carbonSaved * 2.5, // Traditional products have 2.5x more carbon
    water: ecoImpact.waterSaved * 2.0,   // 2x more water usage
    waste: ecoImpact.wastePrevented * 3.0 // 3x more waste
  };
  
  const netSavings = {
    carbon: traditionalImpact.carbon - ecoImpact.carbonSaved,
    water: traditionalImpact.water - ecoImpact.waterSaved,
    waste: traditionalImpact.waste - ecoImpact.wastePrevented
  };
  
  this.ecoSphereFeatures.impactComparison = {
    traditionalAlternativeImpact: traditionalImpact,
    actualImpact: {
      carbon: ecoImpact.carbonSaved,
      water: ecoImpact.waterSaved,
      waste: ecoImpact.wastePrevented
    },
    netSavings: netSavings
  };
  
  return this.save();
};

// Method to add customer feedback
OrderSchema.methods.addFeedback = function(feedbackData) {
  this.feedback = {
    ...feedbackData,
    submittedAt: new Date()
  };
  
  return this.save();
};

// Static method to get orders by status
OrderSchema.statics.getOrdersByStatus = function(status) {
  return this.find({ status })
    .populate('customer', 'name email')
    .populate('orderItems.product', 'name images')
    .populate('orderItems.partner', 'companyName')
    .sort({ createdAt: -1 });
};

// Static method to get customer's order history
OrderSchema.statics.getCustomerOrders = function(customerId) {
  return this.find({ customer: customerId })
    .populate('orderItems.product', 'name images ecoScore')
    .populate('orderItems.partner', 'companyName tier')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Order', OrderSchema);
