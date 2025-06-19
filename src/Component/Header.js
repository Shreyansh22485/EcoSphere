import React, { useState, useEffect } from "react";
import "../Css/Header.css";
import { Link, useNavigate } from "react-router-dom";
import { useStateValue } from "../StateProvider";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";

function Header() {
  const [{ basket }, dispatch] = useStateValue();
  const { cartItems } = useCart();
  const { user, userType, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Calculate total cart item count from backend data
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const handleSignOut = () => {
    // Use the logout function from useAuth hook
    logout();
    
    // Clear any other state if needed
    dispatch({
      type: 'EMPTY_BASKET'
    });
    
    // Navigate to home page
    navigate('/');
    
    alert('You have been signed out successfully! 👋');
    
    // Force a page reload to ensure everything is cleared
    window.location.reload();
  };

  const handleLinkClick = () => {
    // Scroll to the top of the page when the link is clicked
    window.scrollTo(0, 0, { behavior: "instant" });
  };

  return (
    <div className="header">
      <Link to="/">
        <img
          className="header__logo"
          src="../images/amazon.png"
          alt="amazon logo"
        />
      </Link>

      <div className="header__search">
        <input className="header__searchInput" type="text" />
        <img
          src="../images/search_icon.png"
          className="header__searchIcon"
          alt="search"
        />
      </div>      <div className="header__nav">        {user && userType ? (
          // Show user info and sign out when authenticated
          <div className="header__option authenticated" onClick={handleSignOut} style={{ cursor: 'pointer' }}>
            <span className="header__optionLineOne">
              Hello {userType === 'customer' ? user.name : user.companyName}
            </span>
            <span className="header__optionLineTwo">Sign Out</span>
          </div>
        ) : (
          // Show guest message and sign in when not authenticated
          <Link style={{ textDecoration: "none" }} to="/login">
            <div className="header__option">
              <span className="header__optionLineOne">Hello Guest</span>
              <span className="header__optionLineTwo">Sign In</span>
            </div>
          </Link>
        )}

        <Link style={{ textDecoration: "none" }} to="/orders">
          <div className="header__option">
            <span className="header__optionLineOne">Returns</span>
            <span className="header__optionLineTwo">& Orders</span>
          </div>
        </Link><Link style={{ textDecoration: "none" }} to="/dashboard">
          <div className="header__option">
            <span className="header__optionLineOne">Your</span>
            <span className="header__optionLineTwo">EcoSphere</span>
          </div>
        </Link>

        <Link
          style={{ textDecoration: "none" }}
          to="/checkout"
          onClick={handleLinkClick}
        >
          <div className="header__optionBasket">
            <img
              src="../images/cart_icon.png"
              className="header__cartIcon"
              alt="cart"
            />            <span className="header__optionLineTwo header__basketCount">
              {cartItemCount}
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default Header;
