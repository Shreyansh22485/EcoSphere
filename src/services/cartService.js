import { apiService } from './apiService';

class CartService {
  // Add product to cart (authenticated users only)
  async addToCart(productId, quantity = 1) {
    try {
      const response = await apiService.post('/cart/add', {
        productId,
        quantity
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add product to cart');
    }
  }

  // Get user's cart
  async getCart() {
    try {
      const response = await apiService.get('/cart');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch cart');
    }
  }

  // Update cart item quantity
  async updateCartItem(productId, quantity) {
    try {
      const response = await apiService.put('/cart/update', {
        productId,
        quantity
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update cart item');
    }
  }

  // Remove item from cart
  async removeFromCart(productId) {
    try {
      const response = await apiService.delete(`/cart/remove/${productId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to remove item from cart');
    }
  }

  // Clear entire cart
  async clearCart() {
    try {
      const response = await apiService.delete('/cart/clear');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to clear cart');
    }
  }

  // Apply eco discount
  async applyEcoDiscount() {
    try {
      const response = await apiService.post('/cart/apply-eco-discount');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to apply eco discount');
    }
  }

  // Process package return
  async returnPackage(orderId, productId, reason = '') {
    try {
      const response = await apiService.post('/cart/return-package', {
        orderId,
        productId,
        reason
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to process return');
    }
  }

  // Calculate cart totals with impact metrics and eco discount
  calculateCartTotals(cartItems, ecoDiscountPercent = 0) {
    const totals = cartItems.reduce(
      (acc, item) => {
        const itemTotal = item.price * item.quantity;
        const itemImpact = item.product?.impactPerPurchase || {};
        
        return {
          subtotal: acc.subtotal + itemTotal,
          totalItems: acc.totalItems + item.quantity,
          totalCarbonSaved: acc.totalCarbonSaved + (itemImpact.carbonSaved || 0) * item.quantity,
          totalWaterSaved: acc.totalWaterSaved + (itemImpact.waterSaved || 0) * item.quantity,
          totalWastePrevented: acc.totalWastePrevented + (itemImpact.wastePrevented || 0) * item.quantity,
          totalImpactPoints: acc.totalImpactPoints + (itemImpact.impactPoints || 0) * item.quantity
        };
      },
      {
        subtotal: 0,
        totalItems: 0,
        totalCarbonSaved: 0,
        totalWaterSaved: 0,
        totalWastePrevented: 0,
        totalImpactPoints: 0
      }
    );

    // Calculate tax and shipping
    const tax = totals.subtotal * 0.08; // 8% tax
    const shipping = totals.subtotal > 50 ? 0 : 5.99; // Free shipping over $50
    const ecoDiscount = (totals.subtotal + tax + shipping) * (ecoDiscountPercent / 100);
    const total = totals.subtotal + tax + shipping - ecoDiscount;

    return {
      ...totals,
      tax,
      shipping,
      ecoDiscount,
      total
    };
  }
}

export const cartService = new CartService();
export default cartService;
