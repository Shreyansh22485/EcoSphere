import React, { useState } from "react";
import "../Css/Subtotal.css";
import CurrencyFormat from "react-currency-format";
import { useStateValue } from "../StateProvider";
import { getBasketTotal } from "./reducer";
import { Link, useNavigate } from "react-router-dom";
import Orders from "./Orders";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { orderService } from "../services/orderService";

const Subtotal = () => {
  const [{ basket, history }, dispatch] = useStateValue();
  const { isAuthenticated } = useAuth();
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProceed = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (basket.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare order items from basket
      const orderItems = basket.map(item => ({
        productId: item.id,
        quantity: 1,
        price: item.price
      }));

      // Create order and process payment
      const orderResult = await orderService.createOrder({
        items: orderItems,
        shippingAddress: {
          street: "123 Eco Street", // In real app, get from user input
          city: "Green City",
          state: "EcoState",
          zipCode: "12345",
          country: "USA"
        }
      });

      if (orderResult.success) {
        // Clear cart after successful order
        await clearCart();
        
        // Add to history
        dispatch({
          type: "ADD_TO_HISTORY",
          items: basket,
        });

        // Clear basket in local state
        dispatch({
          type: "CLEAR_BASKET",
        });

        // Show success message with impact points
        const totalImpactPoints = orderResult.data.totalImpact?.impactPoints || 0;
        alert(`🎉 Order placed successfully! You earned ${totalImpactPoints} Impact Points for choosing eco-friendly products!`);
        
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
      <CurrencyFormat
        renderText={(value) => (
          <>
            <p>
              Subtotal ({basket?.length} items): <strong>{value}</strong>
            </p>
            <small className="subtotal__gift">
              <input type="checkbox" className="checkbox" /> This order contains
              a gift
            </small>
          </>
        )}
        decimalScale={2}
        value={getBasketTotal(basket)}
        displayType="text"
        thousandSeparator={true}
        prefix={"$"}
      />      {basket.length > 0 ? (
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
        <button className="proceed" disabled={true}>
          Proceed to Buy
        </button>
      )}
    </div>
  );
};

export default Subtotal;
