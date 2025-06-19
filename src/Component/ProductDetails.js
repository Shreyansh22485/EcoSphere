import React, { useState, useEffect } from "react";
import "../Css/ProductDetails.css";
import { FaTruck } from "react-icons/fa";
import { FaAmazonPay } from "react-icons/fa";
import { GiCheckedShield, GiLaurelsTrophy } from "react-icons/gi";
import { useStateValue } from "../StateProvider";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import GroupBuyModal from "./GroupBuyModal";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addToCart, loading: cartLoading } = useCart();
  const [product, setProduct] = useState(null);  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [showGroupBuyModal, setShowGroupBuyModal] = useState(false);
  const [{ basket }, dispatch] = useStateValue();

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/products/${id}`);
      
      if (!response.ok) {
        throw new Error('Product not found');
      }
      
      const data = await response.json();
      setProduct(data.data);
      setSelectedImage(data.data.images?.[0]?.url || "../images/eco-placeholder.jpg");
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };  const addToBasket = async () => {
    if (!product) return;

    // Check if user is authenticated
    if (!isAuthenticated) {
      // Store the intended action in localStorage
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      localStorage.setItem('pendingCartAction', JSON.stringify({
        type: 'ADD_TO_CART',
        productId: product._id,
        quantity: 1
      }));
      // Redirect to login
      navigate('/login');
      return;
    }

    try {
      // Add to backend cart
      await addToCart(product._id, 1);
      
      // Also add to local state for immediate UI feedback
      dispatch({
        type: "ADD_TO_BASKET",
        item: {
          id: product._id,
          title: product.name,
          image: product.images?.[0]?.url || "../images/eco-placeholder.jpg",
          price: product.price,
          rating: Math.round(product.metrics?.averageRating || 4),
          ecoscore: product.ecoScore?.overall || 0,
        },
      });

      // Show success message
      alert('🌱 Product added to cart successfully!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('❌ Failed to add product to cart. Please try again.');
    }
  };

  const handleGroupBuyJoin = (groupBuyData) => {
    // Add the product to cart with group buy information
    console.log('Joined group buy:', groupBuyData);
    // You can add logic here to add the product to cart with group buy pricing
    alert('🎉 Successfully joined group buy! Check your groups for updates.');
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };
  if (loading) {
    return (
      <div style={{
        textAlign: 'center', 
        padding: '100px', 
        fontSize: '18px', 
        color: '#4CAF50',
        background: 'linear-gradient(135deg, #f8fffe 0%, #e8f5e8 100%)',
        borderRadius: '20px',
        margin: '50px',
        boxShadow: '0 10px 30px rgba(76, 175, 80, 0.1)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px', animation: 'pulse 2s infinite' }}>🌱</div>
        <div>Loading your eco-friendly product details...</div>
        <div style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
          Calculating environmental impact...
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{
        textAlign: 'center', 
        padding: '100px', 
        fontSize: '16px', 
        color: '#d32f2f',
        background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
        borderRadius: '20px',
        margin: '50px',
        boxShadow: '0 10px 30px rgba(211, 47, 47, 0.1)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🌿❌</div>
        <div>Oops! We couldn't find this eco-product</div>
        <div style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
          {error || 'Product not found in our sustainable marketplace'}
        </div>
        <button 
          onClick={() => window.history.back()} 
          style={{
            marginTop: '20px', 
            padding: '15px 25px', 
            background: 'linear-gradient(135deg, #4CAF50, #45a049)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '25px', 
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 8px 20px rgba(76, 175, 80, 0.3)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          🌱 Back to Eco Shopping
        </button>
      </div>
    );
  }

  // Calculate impact points based on EcoScore
  const impactPoints = Math.floor((product.ecoScore?.overall || 0) / 10) + (product.certifications?.length || 0) * 5;
  return (
    <div className="whole">
      {/* LEFT SECTION - Product Images and Basic Details */}
      <div className="left-section">
        <div className="img">
          <div className="image-slider">
            <div className="image-thumbnails">
              {product.images && product.images.map((imageObj, index) => (
                <img
                  key={index}
                  src={imageObj.url}
                  alt={imageObj.alt || `Image ${index + 1}`}
                  className={`thumbnail ${
                    selectedImage === imageObj.url ? "selected" : ""
                  }`}
                  onClick={() => handleImageClick(imageObj.url)}
                />
              ))}
              {(!product.images || product.images.length === 0) && (
                <img
                  src="../images/eco-placeholder.jpg"
                  alt="Product placeholder"
                  className="thumbnail selected"
                />
              )}
            </div>
          </div>
          <div className="large-image">
            <img src={selectedImage} alt="Selected Product Image" />
          </div>
        </div>

        <div className="product-basic-details">
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '15px', 
            marginBottom: '20px',
            padding: '15px',
            background: 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)',
            borderRadius: '15px',
            border: '2px solid #4CAF50'
          }}>
            <div style={{ fontSize: '32px' }}>🌿</div>
            <div>
              <h2 style={{ margin: '0', color: '#2e7d32' }}>{product.name}</h2>
              <div style={{ 
                fontSize: '14px', 
                color: '#4CAF50', 
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                ✨ Eco-Certified Sustainable Product
              </div>
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            marginBottom: '15px'
          }}>
            <div style={{ fontSize: '18px' }}>
              {'⭐'.repeat(Math.round(product.metrics?.averageRating || 4))}
            </div>
            <span style={{ color: '#666', fontSize: '14px' }}>
              ({product.metrics?.reviewCount || 0} eco-conscious reviews)
            </span>
            <div style={{
              background: 'linear-gradient(135deg, #4CAF50, #45a049)',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '15px',
              fontSize: '12px',
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}>
              🌱 Verified Green
            </div>
          </div>
          
          <div className="price" style={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: '15px',
            padding: '15px',
            background: 'linear-gradient(135deg, #f1f8e9 0%, #e8f5e8 100%)',
            borderRadius: '15px',
            margin: '20px 0'
          }}>
            <div style={{ fontSize: '28px' }}>💎</div>
            <div>
              <span className="discounted-price" style={{ fontSize: '32px', fontWeight: '800' }}>
                ${product.price}
              </span>
              <div style={{ 
                fontSize: '14px', 
                color: '#4CAF50', 
                fontWeight: 'bold',
                marginTop: '5px'
              }}>
                🌍 Includes carbon offset & sustainable packaging
              </div>
            </div>
          </div>

          <div style={{ 
            padding: '20px',
            background: 'linear-gradient(135deg, #f8fffe 0%, #e8f5e8 100%)',
            borderRadius: '15px',
            margin: '25px 0',
            border: '2px solid #c8e6c9'
          }}>
            <div style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              color: '#2e7d32',
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ fontSize: '24px' }}>🌍</span>
              Product Description
            </div>
            <p style={{ 
              lineHeight: '1.8', 
              color: '#4a4a4a',
              fontSize: '16px',
              margin: '0'
            }}>
              {product.description}
            </p>
          </div>
          
          <div className="icons">
            <div className="icon">
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>🚚</div>
              <p>🌱 Carbon-Neutral Delivery</p>
            </div>

            <div className="icon">
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>💳</div>
              <p>💚 Eco-Friendly Payment</p>
            </div>

            <div className="icon">
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>🛡️</div>
              <p>🌿 2-Year Green Warranty</p>
            </div>

            <div className="icon">
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>🏆</div>
              <p>⭐ Certified Eco Brand</p>
            </div>
          </div>

          <div className="product-data-info" style={{
            background: 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)',
            padding: '20px',
            borderRadius: '15px',
            margin: '25px 0',
            border: '2px solid #4CAF50',
            textAlign: 'center',
            boxShadow: '0 6px 20px rgba(76, 175, 80, 0.1)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '10px',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              <span style={{ fontSize: '24px' }}>✅</span>
              Availability: 
              <span style={{ color: '#4CAF50', marginLeft: '8px' }}>🌱 In Stock & Ready to Ship</span>
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: '#666', 
              marginTop: '8px',
              fontStyle: 'italic'
            }}>
              🚚 Ships with eco-friendly packaging within 24 hours
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION - Impact Details and Buy Buttons */}
      <div className="right-section">
        <div className="eco_details">
          <div className="impact_points_section" style={{
            backgroundColor: "#e8f5e8",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "20px",
            border: "2px solid #4CAF50"
          }}>
            <div style={{fontSize: "18px", fontWeight: "bold", color: "#2e7d32", marginBottom: "15px"}}>
              💎 Earn {impactPoints} Impact Points with this purchase
            </div>
            
            <div style={{fontSize: "16px", fontWeight: "bold", color: "#1b5e20", marginBottom: "10px"}}>
              🌍 Your Environmental Impact:
            </div>
            
            <div style={{paddingLeft: "20px", lineHeight: "1.8", color: "#2e7d32"}}>
              <div 
                className="impact-metric"
                title={product.ecoScore?.aiInsights?.carbonReduced?.description || "CO2 reduction compared to conventional alternatives"}
              >
                ├── 🌱 CO2 Reduced: {product.ecoScore?.aiInsights?.carbonReduced?.value || 0}kg vs conventional product
              </div>
              <div 
                className="impact-metric"
                title={product.ecoScore?.aiInsights?.waterSaved?.description || "Water saved in production process"}
              >
                ├── 💧 Water Saved: {product.ecoScore?.aiInsights?.waterSaved?.value || 0} liters in production
              </div>
              <div 
                className="impact-metric"
                title={product.ecoScore?.aiInsights?.wastePrevented?.description || "Waste prevented from reaching landfill"}
              >
                ├── ♻️ Waste Prevented: {product.ecoScore?.aiInsights?.wastePrevented?.value || 0}kg from landfill
              </div>
              <div 
                className="impact-metric"
                title={product.ecoScore?.aiInsights?.oceanPlasticDiverted?.description || "Ocean plastic bottles diverted"}
              >
                ├── 🌊 Ocean Plastic: {product.ecoScore?.aiInsights?.oceanPlasticDiverted?.value || 0} bottles diverted
              </div>
              <div 
                className="impact-metric"
                title={product.ecoScore?.aiInsights?.treeEquivalent?.description || "Tree equivalent saved through sustainable practices"}
              >
                └── 🌳 Tree Equivalent: {product.ecoScore?.aiInsights?.treeEquivalent?.value || 0} trees saved
              </div>
            </div>

            {/* AI Insights Summary */}
            {product.ecoScore?.aiInsights?.summary && (
              <div className="ai-insights-summary">
                <div className="ai-insights-title">
                  AI Impact Analysis:
                </div>
                <div className="ai-insights-text">
                  "{product.ecoScore?.aiInsights?.summary}"
                </div>
              </div>
            )}

            {product.groupBuying?.enabled && (
              <>
                <div style={{fontSize: "16px", fontWeight: "bold", color: "#1b5e20", marginTop: "15px", marginBottom: "10px"}}>
                  👥 Group Buy Impact Multiplier:
                </div>
                <div style={{paddingLeft: "20px", lineHeight: "1.8", color: "#2e7d32"}}>
                  <div>├── Individual Impact: {product.ecoScore?.aiInsights?.carbonReduced?.value || 0}kg CO2 saved</div>
                  <div>└── Group Impact: {((product.ecoScore?.aiInsights?.carbonReduced?.value || 0) * (product.groupBuying?.minQuantity || 1)).toFixed(1)}kg CO2 saved ({product.groupBuying?.minQuantity || 1} people)</div>
                </div>
              </>
            )}

            <div style={{
              backgroundColor: product.ecoScore?.tier?.includes('Champion') ? "#006400" : 
                            product.ecoScore?.tier?.includes('Pioneer') ? "#228B22" :
                            product.ecoScore?.tier?.includes('Select') ? "#32CD32" :
                            product.ecoScore?.tier?.includes('Aware') ? "#FFD700" :
                            product.ecoScore?.tier?.includes('Entry') ? "#FF8C00" : "#FF0000",
              color: "white",
              padding: "10px",
              borderRadius: "8px",
              textAlign: "center",
              marginTop: "15px",
              fontSize: "14px",
              fontWeight: "bold"
            }}>
              {product.ecoScore?.tier || '⚠️ Standard'}: {product.ecoScore?.overall || 0}/1000 - {
                (product.ecoScore?.overall || 0) >= 900 ? 'Outstanding' :
                (product.ecoScore?.overall || 0) >= 750 ? 'Excellent' :
                (product.ecoScore?.overall || 0) >= 600 ? 'Very Good' :
                (product.ecoScore?.overall || 0) >= 450 ? 'Good' :
                (product.ecoScore?.overall || 0) >= 300 ? 'Fair' : 'Needs Improvement'
              } Sustainability Rating
            </div>
          </div>
        </div>        <div className="buy-buttons-section">
          <button
            className="addtocart"
          style={{
            background: cartLoading ? 'linear-gradient(135deg, #cccccc, #999999)' : 
                       !isAuthenticated ? 'linear-gradient(135deg, #ff9800, #f57c00)' :
                       'linear-gradient(135deg, #4CAF50, #45a049)',
            color: "white",
            border: "none",
            padding: "18px 35px",
            fontSize: "16px",
            fontWeight: "bold",
            borderRadius: "25px",
            cursor: cartLoading ? "not-allowed" : "pointer",
            width: "100%",
            marginBottom: "15px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            boxShadow: cartLoading ? "0 4px 15px rgba(0, 0, 0, 0.1)" :
                      !isAuthenticated ? "0 8px 25px rgba(255, 152, 0, 0.3)" :
                      "0 8px 25px rgba(76, 175, 80, 0.3)",
            transition: "all 0.3s ease",
            position: "relative",
            overflow: "hidden"
          }}
          onClick={addToBasket}
          disabled={cartLoading}
          onMouseOver={(e) => {
            if (!cartLoading) {
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = !isAuthenticated ? 
                '0 12px 35px rgba(255, 152, 0, 0.4)' : 
                '0 12px 35px rgba(76, 175, 80, 0.4)';
            }
          }}
          onMouseOut={(e) => {
            if (!cartLoading) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = !isAuthenticated ? 
                '0 8px 25px rgba(255, 152, 0, 0.3)' : 
                '0 8px 25px rgba(76, 175, 80, 0.3)';
            }
          }}
        >
          {cartLoading ? "🌱 Adding to Your Eco Cart..." : 
           !isAuthenticated ? "🔐 Sign In to Buy with IMPACT" :
           `🌱 Buy with IMPACT 💎 (+${impactPoints} Impact Points)`}
        </button>
          {product.groupBuying?.enabled && (
          <button 
            className="productDetails__groupBuyButton"
            onClick={() => setShowGroupBuyModal(true)}
            style={{
              background: "linear-gradient(135deg, #6a1b9a, #4a148c)",
              color: "white",
              border: "none",
              padding: "18px 35px",
              borderRadius: "25px",
              marginTop: "15px",
              fontSize: "16px",
              fontWeight: "bold",
              width: "100%",
              cursor: "pointer",
              transition: "all 0.3s ease",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              boxShadow: "0 8px 25px rgba(106, 27, 154, 0.3)",
              position: "relative",
              overflow: "hidden"
            }}
            onMouseOver={(e) => {
              e.target.style.background = "linear-gradient(135deg, #4a148c, #3c0d6f)";
              e.target.style.transform = "translateY(-3px)";
              e.target.style.boxShadow = "0 12px 35px rgba(106, 27, 154, 0.4)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "linear-gradient(135deg, #6a1b9a, #4a148c)";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 8px 25px rgba(106, 27, 154, 0.3)";
            }}
          >
            🎯 Join Group Buy - 2x Impact Points & Better Pricing! 
            <div style={{ fontSize: '12px', marginTop: '5px', opacity: '0.9' }}>
              (Min: {product.groupBuying.minQuantity} eco-warriors needed)
            </div>
          </button>
        )}
        
        <GroupBuyModal 
          product={product}
          isOpen={showGroupBuyModal}
          onClose={() => setShowGroupBuyModal(false)}
          onJoinGroupBuy={handleGroupBuyJoin}
        />
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;