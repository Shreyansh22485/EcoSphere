import { apiService } from './apiService';

class OrderService {
  // Create order and process payment
  async createOrder(orderData) {
    try {
      const response = await apiService.post('/orders', orderData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create order');
    }
  }

  // Get user's orders
  async getUserOrders() {
    try {
      const response = await apiService.get('/orders/user');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch orders');
    }
  }

  // Get specific order
  async getOrder(orderId) {
    try {
      const response = await apiService.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch order');
    }
  }

  // Process payment and award impact points
  async processPayment(cartItems, paymentMethod, shippingAddress) {
    try {
      // Calculate totals and impact
      const totals = this.calculateOrderTotals(cartItems);
      
      const orderData = {
        items: cartItems.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.price,
          impactPoints: item.product.impactPerPurchase?.impactPoints || 0
        })),
        totals,
        paymentMethod,
        shippingAddress,
        impactMetrics: {
          carbonSaved: totals.totalCarbonSaved,
          waterSaved: totals.totalWaterSaved,
          wastePrevented: totals.totalWastePrevented,
          impactPointsEarned: totals.totalImpactPoints
        }
      };

      const response = await this.createOrder(orderData);
      
      // Clear cart after successful order
      if (response.success) {
        await this.clearUserCart();
      }
      
      return response;
    } catch (error) {
      throw new Error(error.message || 'Payment processing failed');
    }
  }

  // Calculate order totals with impact metrics
  calculateOrderTotals(cartItems) {
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
    const total = totals.subtotal + tax + shipping;

    return {
      ...totals,
      tax,
      shipping,
      total
    };
  }

  // Clear user's cart (used after successful order)
  async clearUserCart() {
    try {
      await apiService.delete('/cart/clear');
    } catch (error) {
      console.warn('Failed to clear cart after order:', error);
    }
  }

  // Generate order summary for display
  generateOrderSummary(order) {
    return {
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: order.totals.total,
      itemCount: order.items.length,
      impactSummary: {
        carbonSaved: order.impactMetrics.carbonSaved,
        waterSaved: order.impactMetrics.waterSaved,
        wastePrevented: order.impactMetrics.wastePrevented,
        impactPointsEarned: order.impactMetrics.impactPointsEarned
      },
      createdAt: order.createdAt
    };
  }
}

export const orderService = new OrderService();
export default orderService;
