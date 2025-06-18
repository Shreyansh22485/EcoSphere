import React, { useState } from "react";
import "../Css/CheckoutProduct.css";
import { useAuth } from "../hooks/useAuth";
import cartService from "../services/cartService";

function CheckoutProduct({ 
  id, 
  image, 
  title, 
  price, 
  rating, 
  badge_id, 
  quantity = 1, 
  ecoScore,
  onQuantityChange,
  onRemove 
}) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentQuantity, setCurrentQuantity] = useState(quantity);

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 0) return;
    
    setLoading(true);
    try {
      if (newQuantity === 0) {
        // Remove item completely
        await cartService.removeFromCart(id);
        onRemove(id);
      } else {
        // Update quantity
        await cartService.updateCartItem(id, newQuantity);
        setCurrentQuantity(newQuantity);
        onQuantityChange(id, newQuantity);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    try {
      await cartService.removeFromCart(id);
      onRemove(id);
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setLoading(false);
    }
  };
  const getEcoTier = (score) => {
    if (score >= 900) return { tier: 'EcoChampion', color: '#006400' };
    if (score >= 750) return { tier: 'EcoPioneer', color: '#228B22' };
    if (score >= 600) return { tier: 'EcoSelect', color: '#32CD32' };
    if (score >= 450) return { tier: 'EcoAware', color: '#FFD700' };
    if (score >= 300) return { tier: 'EcoEntry', color: '#FF8C00' };
    return { tier: 'Standard', color: '#666' };
  };

  const ecoTier = getEcoTier(ecoScore || 0);
  const itemTotal = (price * currentQuantity).toFixed(2);

  return (
    <div className="checkoutProduct">
      <img src={image.url} alt={title} className="checkoutProduct__image" />
      
      <div className="checkoutProduct__info">
        <p className="checkoutProduct__title">{title}</p>
        
        <div className="checkoutProduct__price">
          <small>$</small>
          <strong>{price}</strong>
          <span className="price__each"> each</span>
        </div>
        
        <div className="checkoutProduct__rating">
          {Array(rating)
            .fill()
            .map((_, index) => (
              <span key={index}>⭐</span>
            ))}
        </div>

        {ecoScore > 0 && (
          <div className="checkoutProduct__eco">
            <span 
              className="eco-badge" 
              style={{ 
                backgroundColor: ecoTier.color,
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            >
              🌱 {ecoTier.tier}
            </span>
            <span className="eco-score">Eco Score: {ecoScore}/100</span>
          </div>
        )}

        <div className="checkoutProduct__quantity">
          <button 
            className="quantity-btn minus" 
            onClick={() => handleQuantityChange(currentQuantity - 1)}
            disabled={loading}
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span className="quantity-display">{currentQuantity}</span>
          <button 
            className="quantity-btn plus" 
            onClick={() => handleQuantityChange(currentQuantity + 1)}
            disabled={loading}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        <div className="checkoutProduct__total">
          <strong>Total: ${itemTotal}</strong>
        </div>

        <div className="checkoutProduct__actions">
          <button 
            className="remove-btn" 
            onClick={handleRemove}
            disabled={loading}
          >
            {loading ? 'Removing...' : 'Remove from Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CheckoutProduct;