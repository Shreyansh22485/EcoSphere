const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const CartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [CartItemSchema],
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updatedAt field before saving
CartSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for cart totals
CartSchema.virtual('totals').get(function() {
  const totals = this.items.reduce(
    (acc, item) => {
      const itemTotal = item.price * item.quantity;
      return {
        subtotal: acc.subtotal + itemTotal,
        totalItems: acc.totalItems + item.quantity
      };
    },
    { subtotal: 0, totalItems: 0 }
  );

  const tax = totals.subtotal * 0.08; // 8% tax
  const shipping = totals.subtotal > 50 ? 0 : 5.99; // Free shipping over $50
  const total = totals.subtotal + tax + shipping;

  return {
    ...totals,
    tax,
    shipping,
    total
  };
});

// Method to add item to cart
CartSchema.methods.addItem = function(productId, quantity, price) {
  const existingItemIndex = this.items.findIndex(
    item => item.product.toString() === productId.toString()
  );

  if (existingItemIndex > -1) {
    // Update existing item
    this.items[existingItemIndex].quantity += quantity;
  } else {
    // Add new item
    this.items.push({
      product: productId,
      quantity,
      price
    });
  }

  return this.save();
};

// Method to update item quantity
CartSchema.methods.updateItem = function(productId, quantity) {
  const itemIndex = this.items.findIndex(
    item => item.product.toString() === productId.toString()
  );

  if (itemIndex > -1) {
    if (quantity <= 0) {
      this.items.splice(itemIndex, 1);
    } else {
      this.items[itemIndex].quantity = quantity;
    }
  }

  return this.save();
};

// Method to remove item
CartSchema.methods.removeItem = function(productId) {
  this.items = this.items.filter(
    item => item.product.toString() !== productId.toString()
  );

  return this.save();
};

// Method to clear cart
CartSchema.methods.clear = function() {
  this.items = [];
  return this.save();
};

// Index for performance
CartSchema.index({ user: 1 });
CartSchema.index({ 'items.product': 1 });

module.exports = mongoose.model('Cart', CartSchema);
