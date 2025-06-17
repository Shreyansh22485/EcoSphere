import React, { useState, useEffect } from "react";
import "../Css/Checkout.css";
import Subtotal from "./Subtotal";
import CheckoutProduct from "./CheckoutProduct";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import cartService from "../services/cartService";

function Checkout() {
  const { isAuthenticated, user } = useAuth();
  const { cartItems, loading, loadCart } = useCart();
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const [ecoDiscountApplied, setEcoDiscountApplied] = useState(false);

  // Show message if not authenticated
  if (!isAuthenticated) {
    return (
      <div style={{textAlign: 'center', padding: '100px', fontSize: '18px', color: '#4CAF50'}}>
        🔒 Please <Link to="/login" style={{color: '#4CAF50', textDecoration: 'underline'}}>sign in</Link> to view your cart
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div style={{textAlign: 'center', padding: '100px', fontSize: '18px', color: '#4CAF50'}}>
        🛒 Loading your cart...
      </div>
    );
  }
  // Get cart items - use cartItems directly from useCart hook
  const userTier = user?.userTier || 'Seedling';
  const availableDiscount = user?.availableEcoDiscount || 0;

  // Debug logging
  console.log('Checkout - cartItems:', cartItems);
  console.log('Checkout - cartItems length:', cartItems?.length);
  console.log('Checkout - loading:', loading);

  const handleQuantityChange = (productId, newQuantity) => {
    // Refresh cart to get updated data
    loadCart();
  };

  const handleRemoveItem = (productId) => {
    // Refresh cart to get updated data
    loadCart();
  };

  const handleApplyEcoDiscount = async () => {
    if (availableDiscount === 0) return;
    
    setApplyingDiscount(true);    try {
      await cartService.applyEcoDiscount();
      setEcoDiscountApplied(true);
      loadCart();
    } catch (error) {
      console.error('Error applying eco discount:', error);
    } finally {
      setApplyingDiscount(false);
    }
  };

  return (
    <div className="checkout">
      <div className="checkout__left">
        <Link to="/green">
          <img className="checkout__ad" src="../images/greenad.png" alt="Eco Promotion" />
        </Link>
        
        <div>
          <h2 className="checkout__title">Your Shopping Cart</h2>
          
          {cartItems && cartItems.length === 0 ? (
            <div className="empty-cart">
              <h3>Your cart is empty</h3>
              <p>Add some eco-friendly products to get started!</p>
              <Link to="/green" className="shop-now-btn">
                🌱 Shop Eco Products
              </Link>
            </div>
          ) : (
            <>
              {/* Eco Rewards Section */}
              {availableDiscount > 0 && (
                <div className="eco-rewards-section">
                  <div className="eco-rewards-header">
                    <h3>🎁 Your Eco Rewards</h3>
                    <span className="tier-badge tier-{userTier.toLowerCase()}">
                      {userTier} Member
                    </span>
                  </div>
                  <div className="eco-discount-offer">
                    <p>
                      🌟 Congratulations! As a <strong>{userTier}</strong> member, 
                      you've earned a <strong>{availableDiscount}%</strong> eco discount!
                    </p>
                    {!ecoDiscountApplied ? (
                      <button 
                        className="apply-discount-btn"
                        onClick={handleApplyEcoDiscount}
                        disabled={applyingDiscount}
                      >
                        {applyingDiscount ? 'Applying...' : `Apply ${availableDiscount}% Eco Discount`}
                      </button>
                    ) : (
                      <div className="discount-applied">
                        ✅ Eco discount applied! You're saving {availableDiscount}% on your order.
                      </div>
                    )}
                  </div>
                </div>
              )}              {/* Cart Items */}
              <div className="cart-items">
                {cartItems && cartItems.map((item) => (
                  <CheckoutProduct
                    key={item.product._id}
                    id={item.product._id}
                    image={item.product.images?.[0] || '../images/default-product.jpg'}
                    title={item.product.name}
                    price={item.product.price}
                    rating={item.product.rating || 4}
                    quantity={item.quantity}
                    ecoScore={item.product.ecoScore?.overall || 0}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemoveItem}
                  />
                ))}
              </div>

              {/* Package Return Option */}
              <div className="return-package-section">
                <h3>♻️ Eco Return Program</h3>
                <p>
                  Return your package after use and earn <strong>10 bonus impact points</strong>! 
                  Help us reduce waste and support the circular economy.
                </p>
                <div className="return-info">
                  <span>📦 Free return shipping</span>
                  <span>🌱 +10 Impact Points</span>
                  <span>🔄 Supporting circular economy</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
        <div className="checkout__right">
        <Subtotal 
          cartItems={cartItems || []}
          ecoDiscountPercent={ecoDiscountApplied ? availableDiscount : 0}
        />
      </div>
    </div>
  );
}

export default Checkout;
