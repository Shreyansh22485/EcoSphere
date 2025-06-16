import React, { useState, useEffect } from "react";
import "../Css/Headergreen.css";
import { Link, useNavigate } from "react-router-dom";
import { useStateValue } from "../StateProvider";

function Header() {
  const [{ basket }, dispatch] = useStateValue();
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for authentication data in localStorage
    const token = localStorage.getItem('ecoSphereToken');
    const storedUserType = localStorage.getItem('ecoSphereUserType');
    
    if (token && storedUserType) {
      setUserType(storedUserType);
      
      if (storedUserType === 'user') {
        const userData = JSON.parse(localStorage.getItem('ecoSphereUser') || '{}');
        setUser(userData);
      } else if (storedUserType === 'partner') {
        const partnerData = JSON.parse(localStorage.getItem('ecoSpherePartner') || '{}');
        setUser(partnerData);
      }
    }
  }, []);

  const handleSignOut = () => {
    // Clear all authentication data
    localStorage.removeItem('ecoSphereToken');
    localStorage.removeItem('ecoSphereUserType');
    localStorage.removeItem('ecoSphereUser');
    localStorage.removeItem('ecoSpherePartner');
    
    // Reset state
    setUser(null);
    setUserType(null);
    
    // Navigate to home page
    navigate('/');
    
    alert('You have been signed out successfully! 👋');
  };

  const handleLinkClick = () => {
    // Scroll to the top of the page when the link is clicked
    window.scrollTo(0, 0, { behavior: "instant" });
  };

  return (
    <div className="headerg">
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
              Hello {userType === 'user' ? user.name : user.companyName}
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
              className="header__cartIcong"
              alt="cart"
            />
            <span className="header__optionLineTwo header__basketCount">
              {basket?.length}
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default Header;
