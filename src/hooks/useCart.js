import { useState, useEffect, createContext, useContext } from 'react';
import { cartService } from '../services/cartService';
import { useAuth } from './useAuth';

// Create Cart Context
const CartContext = createContext();

// Cart Provider Component
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);  const [cartTotals, setCartTotals] = useState({
    subtotal: 0,
    total: 0,
    itemCount: 0,
    tax: 0,
    shipping: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  // Load cart on mount and when user auth changes
  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    } else {      // Clear cart if user logs out
      setCartItems([]);
      setCartTotals({ subtotal: 0, total: 0, itemCount: 0, tax: 0, shipping: 0 });
    }
  }, [isAuthenticated]);  const loadCart = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      console.log('useCart - Loading cart...'); // Debug log
      const result = await cartService.getCart();
      console.log('useCart - Cart result:', result); // Debug log
      if (result.success) {
        console.log('useCart - Cart items:', result.data.items); // Debug log
        setCartItems(result.data.items || []);
        setCartTotals({
          subtotal: result.data.totals?.subtotal || 0,
          total: result.data.totals?.total || 0,
          itemCount: result.data.totals?.totalItems || 0,
          tax: result.data.totals?.tax || 0,
          shipping: result.data.totals?.shipping || 0
        });
        setError(null);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      throw new Error('Please log in to add items to cart');
    }

    try {
      setLoading(true);      const result = await cartService.addToCart(productId, quantity);
      if (result.success) {
        setCartItems(result.data.items);
        setCartTotals({
          subtotal: result.data.totals?.subtotal || 0,
          total: result.data.totals?.total || 0,
          itemCount: result.data.totals?.totalItems || 0,
          tax: result.data.totals?.tax || 0,
          shipping: result.data.totals?.shipping || 0
        });
      }
      return result;
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (productId, quantity) => {
    try {
      setLoading(true);      const result = await cartService.updateCartItem(productId, quantity);
      if (result.success) {
        setCartItems(result.data.items);
        setCartTotals({
          subtotal: result.data.totals?.subtotal || 0,
          total: result.data.totals?.total || 0,
          itemCount: result.data.totals?.totalItems || 0,
          tax: result.data.totals?.tax || 0,
          shipping: result.data.totals?.shipping || 0
        });
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      setLoading(true);      const result = await cartService.removeFromCart(productId);
      if (result.success) {
        setCartItems(result.data.items);
        setCartTotals({
          subtotal: result.data.totals?.subtotal || 0,
          total: result.data.totals?.total || 0,
          itemCount: result.data.totals?.totalItems || 0,
          tax: result.data.totals?.tax || 0,
          shipping: result.data.totals?.shipping || 0
        });
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      const result = await cartService.clearCart();
      if (result.success) {        setCartItems([]);
        setCartTotals({
          subtotal: 0,
          total: 0,
          itemCount: 0,
          tax: 0,
          shipping: 0
        });
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getCartItemCount = () => {
    return cartTotals.itemCount || 0;
  };

  const isInCart = (productId) => {
    return cartItems.some(item => item.product._id === productId);
  };

  const getCartItem = (productId) => {
    return cartItems.find(item => item.product._id === productId);
  };

  const contextValue = {
    cartItems,
    cartTotals,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    loadCart,
    getCartItemCount,
    isInCart,
    getCartItem
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
