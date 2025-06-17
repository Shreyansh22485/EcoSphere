import React, { useState, useEffect } from "react";
import "../Css/ProductDetails.css";
import { FaTruck } from "react-icons/fa";
import { FaAmazonPay } from "react-icons/fa";
import { GiCheckedShield, GiLaurelsTrophy } from "react-icons/gi";
import { useStateValue } from "../StateProvider";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addToCart, loading: cartLoading } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
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

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  if (loading) {
    return (
      <div style={{textAlign: 'center', padding: '100px', fontSize: '18px', color: '#4CAF50'}}>
        🌱 Loading product details...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{textAlign: 'center', padding: '100px', fontSize: '16px', color: '#ff0000'}}>
        ❌ Error: {error || 'Product not found'}
        <br />
        <button onClick={() => window.history.back()} style={{marginTop: '20px', padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
          Go Back
        </button>
      </div>
    );
  }

  // Calculate impact points based on EcoScore
  const impactPoints = Math.floor((product.ecoScore?.overall || 0) / 10) + (product.certifications?.length || 0) * 5;

  return (
    <div className="whole">      <div className="img">
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
      </div>      <div className="img-desc">
        <h2>{product.name}</h2>
        <p>{'⭐'.repeat(Math.round(product.metrics?.averageRating || 4))} ({product.metrics?.reviewCount || 0} reviews)</p>
        <br></br>
        <p className="price">
          <span className="discounted-price">${product.price}</span>
          {/* Add original price logic if needed */}
        </p>
        <br></br>
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
            </div>            <div style={{paddingLeft: "20px", lineHeight: "1.8", color: "#2e7d32"}}>
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
        </div>
        <br></br>
        <p>{product.description}</p>
        <br></br>
        <div className="icons">
          <div className="icon">
            <img src="../images/8.png" className="i" />
            <p>Free Delivery</p>
          </div>

          <div className="icon">
            <img src="../images/9.png" className="i" />
            <p>Accept Amazon Pay</p>
          </div>

          <div className="icon">
            <img src="../images/10.png" className="i" />
            <p>2-year warranty</p>
          </div>

          <div className="icon">
            <img src="../images/11.png" className="i" />
            <p>Top Brand</p>
          </div>
        </div>

        <div className="product-data-info">
          <p>
            Available: <span style={{ color: "green" }}>In Stock</span>
          </p>
        </div>        <button
          className="addtocart"
          style={{
            backgroundColor: cartLoading ? "#cccccc" : "#4CAF50",
            color: "white",
            border: "none",
            padding: "15px 30px",
            fontSize: "16px",
            fontWeight: "bold",
            borderRadius: "8px",
            cursor: cartLoading ? "not-allowed" : "pointer",
            width: "100%",
            marginBottom: "10px"
          }}
          onClick={addToBasket}
          disabled={cartLoading}
        >
          {cartLoading ? "Adding to Cart..." : 
           !isAuthenticated ? "Sign In to Buy with IMPACT" :
           `Buy with IMPACT (+${impactPoints} Impact Points)`}
        </button>
        
        {product.groupBuying?.enabled && (
          <div style={{
            backgroundColor: "#f3e5f5",
            padding: "15px",
            borderRadius: "8px",
            marginTop: "10px",
            fontSize: "14px",
            color: "#6a1b9a",
            textAlign: "center"
          }}>
            🎯 Join Group Buy for 2x Impact Points & Better Pricing! (Min: {product.groupBuying.minQuantity} items)
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetails;