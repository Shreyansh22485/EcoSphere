import React, { useState } from "react";
import "../Css/Login.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAccountTypeChoice, setShowAccountTypeChoice] = useState(false);
  const [showLoginTypeChoice, setShowLoginTypeChoice] = useState(false);
  const [loginType, setLoginType] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToCart } = useCart();  const handleSignIn = async (e, userType) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password, userType);
      
      if (success) {
        // Handle pending cart action after successful login
        const pendingCartAction = localStorage.getItem('pendingCartAction');
        const redirectPath = localStorage.getItem('redirectAfterLogin');
        
        if (pendingCartAction) {
          try {
            const action = JSON.parse(pendingCartAction);
            if (action.type === 'ADD_TO_CART') {
              await addToCart(action.productId, action.quantity);
              alert('🌱 Product added to cart successfully!');
            }
          } catch (error) {
            console.error('Error handling pending cart action:', error);
          }
          // Clear pending action
          localStorage.removeItem('pendingCartAction');
        }
        
        // Clear redirect path
        localStorage.removeItem('redirectAfterLogin');
        
        // Navigate to redirect path or default
        if (redirectPath) {
          navigate(redirectPath);
        } else if (userType === 'customer') {
          navigate('/');
        } else if (userType === 'partner') {
          navigate('/partner-hub');
        }
      }
      
    } catch (error) {
      console.error('Login error:', error);
      alert('❌ Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = () => {
    setShowAccountTypeChoice(true);
  };
  const handleAccountTypeChoice = (type) => {
    if (type === 'user') {
      navigate('/register-user');
    } else if (type === 'partner') {
      navigate('/register-partner');
    }
  };

  const handleLoginTypeChoice = (type) => {
    setLoginType(type);
    setShowLoginTypeChoice(false);
  };
  const handleShowLoginOptions = () => {
    setShowLoginTypeChoice(true);
  };

  // Show login type choice first
  if (showLoginTypeChoice) {
    return (
      <div className="login">
        <Link to="/">
          <img className="login__logo" src="../images/AmazonLogo.png" alt="EcoSphere" />
        </Link>
        <div className="login__container">
          <h1>Choose Login Type</h1>
          <div className="account-type-choice">
            <div className="account-type-card" onClick={() => handleLoginTypeChoice('customer')}>
              <div className="account-type-icon">👤</div>
              <h3>Customer Login</h3>
              <p>Sign in to shop eco-friendly products and track your environmental impact</p>
              <button className="account-type-btn user-btn">Sign In as Customer</button>
            </div>
            
            <div className="account-type-card" onClick={() => handleLoginTypeChoice('partner')}>
              <div className="account-type-icon">🏢</div>
              <h3>Partner Login</h3>
              <p>Sign in to access Partner Hub and manage your sustainable products</p>
              <button className="account-type-btn partner-btn">Sign In as Partner</button>
            </div>
          </div>
          
          <button 
            className="back-btn" 
            onClick={() => setShowLoginTypeChoice(false)}
          >
            ← Back to Main Options
          </button>
        </div>
      </div>
    );
  }

  if (showAccountTypeChoice) {
    return (
      <div className="login">
        <Link to="/">
          <img className="login__logo" src="../images/AmazonLogo.png" alt="EcoSphere" />
        </Link>
        <div className="login__container">
          <h1>Choose Account Type</h1>
          <div className="account-type-choice">
            <div className="account-type-card" onClick={() => handleAccountTypeChoice('user')}>
              <div className="account-type-icon">👤</div>
              <h3>Customer Account</h3>
              <p>Shop eco-friendly products, earn impact points, and track your environmental impact</p>
              <ul>
                <li>🌱 Discover sustainable products</li>
                <li>💎 Earn Impact Points</li>
                <li>📊 Track environmental impact</li>
                <li>🏆 Join leaderboards</li>
                <li>🎯 Set sustainability goals</li>
              </ul>
              <button className="account-type-btn user-btn">Create Customer Account</button>
            </div>
            
            <div className="account-type-card" onClick={() => handleAccountTypeChoice('partner')}>
              <div className="account-type-icon">🏢</div>
              <h3>Partner Account</h3>
              <p>Sell eco-friendly products, access Partner Hub, and track your sustainability impact</p>
              <ul>
                <li>🤝 Join EcoSphere marketplace</li>
                <li>📈 Access Partner Hub</li>
                <li>🌍 AI-powered EcoScore</li>
                <li>📊 Impact analytics</li>
                <li>🏆 Partner leaderboards</li>
              </ul>
              <button className="account-type-btn partner-btn">Create Partner Account</button>
            </div>
          </div>
          
          <button 
            className="back-btn" 
            onClick={() => setShowAccountTypeChoice(false)}
          >
            ← Back to Sign In
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="login">
      <Link to="/">
        <img className="login__logo" src="../images/AmazonLogo.png" alt="EcoSphere" />
      </Link>
      <div className="login__container">
        {loginType ? (
          // Show login form when login type is selected
          <>
            <h1>Sign-In as {loginType === 'customer' ? 'Customer' : 'Partner'}</h1>
            <form onSubmit={(e) => handleSignIn(e, loginType)}>
              <h5>Email</h5>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-required
              />

              <h5>Password</h5>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-required
              />
              
              <button
                className="login__signInButton"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? '🔄 Signing In...' : `Sign In as ${loginType === 'customer' ? 'Customer' : 'Partner'}`}
              </button>

              <p>
                By signing in you agree to the Terms and Conditions of EcoSphere.
                Please see our privacy notice and cookies policy.
              </p>
              
              <button 
                type="button"
                className="back-btn"
                onClick={() => setLoginType('')}
              >
                ← Change Login Type
              </button>
            </form>
          </>
        ) : (
          // Show initial options when no login type is selected
          <>
            <h1>Welcome to EcoSphere</h1>
            <div className="main-options">
              <button 
                type="button"
                className="login__signInButton"
                onClick={handleShowLoginOptions}
              >
                Sign In
              </button>
              
              <button 
                type="button"
                className="login__registerButton"
                onClick={handleCreateAccount}
              >
                Create Account
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;