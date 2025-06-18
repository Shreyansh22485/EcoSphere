import React, { useState } from "react";
import "../Css/Subtotal.css";
import CurrencyFormat from "react-currency-format";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { orderService } from "../services/orderService";
import cartService from "../services/cartService";

const Subtotal = ({ cartItems = [], ecoDiscountPercent = 0, ecoReturnSelected = false }) => {
  const { isAuthenticated } = useAuth();
  const { clearCart, cartTotals } = useCart();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate impact metrics from cart items
  const calculateImpactMetrics = () => {
    return cartItems.reduce((acc, item) => {
      const impact = item.product.impactPerPurchase || {};
      const quantity = item.quantity;
        return {
        totalImpactPoints: acc.totalImpactPoints + ((impact.impactPoints || 0) * quantity),
        totalCarbonSaved: acc.totalCarbonSaved + ((impact.carbonSaved || 0) * quantity),
        totalWaterSaved: acc.totalWaterSaved + ((impact.waterSaved || 0) * quantity),
        totalWastePrevented: acc.totalWastePrevented + ((impact.wastePrevented || 0) * quantity)
      };
    }, {
      totalImpactPoints: 0,
      totalCarbonSaved: 0,
      totalWaterSaved: 0,
      totalWastePrevented: 0
    });
  };

  const impactMetrics = calculateImpactMetrics();
  
  // Add bonus points for eco return program
  const bonusImpactPoints = ecoReturnSelected ? 10 : 0;
  const totalImpactPoints = impactMetrics.totalImpactPoints + bonusImpactPoints;
  
  // Calculate eco discount amount
  const discountAmount = ecoDiscountPercent > 0 
    ? (cartTotals.subtotal * ecoDiscountPercent / 100) 
    : 0;
  
  // Calculate final total with discount
  const finalTotal = cartTotals.total - discountAmount;

  const handleProceed = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare order items from cart
      const orderItems = cartItems.map(item => ({
        productId: item.product._id,
        quantity: item.quantity,
        price: item.product.price
      }));      // Create order and process payment
      const orderResult = await orderService.createOrder({
        items: orderItems,
        ecoReturnSelected: ecoReturnSelected, // Pass eco return selection to backend
        shippingAddress: {
          street: "123 Eco Street", // In real app, get from user input
          city: "Green City",
          state: "EcoState",
          zipCode: "12345",
          country: "USA"
        }
      });if (orderResult.success) {
        // Clear cart after successful order
        await clearCart();        // Show success message with impact points
        const orderImpactPoints = orderResult.data.totalImpact?.impactPoints || 0;
        const returnBonusMessage = ecoReturnSelected ? " You'll receive return instructions via email!" : "";
        alert(`🎉 Order placed successfully! You earned ${orderImpactPoints} Impact Points for choosing eco-friendly products!${returnBonusMessage}`);
        
        // Navigate to thanks page
        navigate('/thanks');
      } else {
        throw new Error(orderResult.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error processing order:', error);
      alert('❌ Failed to process your order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="subtotal">
      {/* Impact Summary */}
      <div className="impact-summary">
        <h3>🌱 Your Environmental Impact</h3>        <div className="impact-metrics">
          <div className="impact-item">
            <span>💎 Impact Points:</span>
            <strong>+{totalImpactPoints}</strong>
            {bonusImpactPoints > 0 && (
              <span className="bonus-points"> (includes +{bonusImpactPoints} bonus from Eco Return)</span>
            )}
          </div>
          <div className="impact-item">
            <span>🌍 CO₂ Saved:</span>
            <strong>{impactMetrics.totalCarbonSaved.toFixed(1)} kg</strong>
          </div>
          <div className="impact-item">
            <span>💧 Water Saved:</span>
            <strong>{impactMetrics.totalWaterSaved.toFixed(0)} L</strong>
          </div>
          <div className="impact-item">
            <span>♻️ Waste Prevented:</span>
            <strong>{impactMetrics.totalWastePrevented.toFixed(1)} kg</strong>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <CurrencyFormat
        renderText={(value) => (          <div className="order-summary">
            <div className="summary-line">
              <span>Subtotal ({cartTotals.itemCount} items):</span>
              <strong>${cartTotals.subtotal?.toFixed(2) || '0.00'}</strong>
            </div>
            
            {ecoDiscountPercent > 0 && (
              <div className="summary-line eco-discount">
                <span>🌟 Eco Reward ({ecoDiscountPercent}% off):</span>
                <strong>-${discountAmount.toFixed(2)}</strong>
              </div>
            )}
            
            <div className="summary-line">
              <span>Tax:</span>
              <strong>${cartTotals.tax?.toFixed(2) || '0.00'}</strong>
            </div>
            
            <div className="summary-line">
              <span>Shipping:</span>
              <strong>{cartTotals.shipping === 0 ? 'FREE' : `$${cartTotals.shipping?.toFixed(2) || '0.00'}`}</strong>
            </div>
            
            <hr />
            
            <div className="summary-line total">
              <span>Order Total:</span>
              <strong>${finalTotal.toFixed(2)}</strong>
            </div>

            {cartTotals.shipping === 0 && (
              <div className="free-shipping-note">
                🚚 You qualified for free shipping!
              </div>
            )}
          </div>        )}
        decimalScale={2}
        value={finalTotal}
        displayType="text"
        thousandSeparator={true}
        prefix={"$"}
      />

      {cartItems.length > 0 ? (
        <button 
          className="proceed" 
          onClick={handleProceed}
          disabled={isProcessing || !isAuthenticated}
          style={{
            backgroundColor: isProcessing ? '#ccc' : '#ff9f00',
            cursor: isProcessing ? 'not-allowed' : 'pointer'
          }}
        >
          {isProcessing ? 'Processing...' : 
           !isAuthenticated ? 'Sign In to Buy' : 
           'Proceed to Buy & Earn Impact Points'}
        </button>
      ) : (
        <Link to="/green" className="proceed">
          Start Shopping Eco Products
        </Link>
      )}      {/* Package Return Information */}
      {ecoReturnSelected && (
        <div className="return-program-selected">
          <h4>✅ Eco Return Program Selected</h4>
          <p>Great choice! You'll receive return instructions after delivery.</p>
          <div className="return-benefits">
            <span>🎁 +10 Impact Points per return</span>
            <span>🚚 Free return shipping</span>
            <span>🌍 Reduce environmental impact</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subtotal;
