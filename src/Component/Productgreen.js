import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import "../Css/Productgreen.css";
import { useStateValue } from "../StateProvider";
import { Link } from "react-router-dom";

function Product({ title, image, id, price, rating, carbon_red, ecoscore, aiInsights }) {
  const [{ basket }, dispatch] = useStateValue();

  console.log("this is >>>>>", basket);

  const addToBasket = () => {
    dispatch({
      type: "ADD_TO_BASKET",      item: {
        id,
        title,
        image,
        price,
        rating,
        ecoscore,
      },
    });
  };  // EcoScore tier logic
  let ecoscore_tier = "";
  let ecoscore_color = "";
  let ecoscore_text = "";
  
  if (ecoscore >= 900) {
    ecoscore_tier = "🌟 EcoChampion";
    ecoscore_color = "#006400"; // Dark green
    ecoscore_text = "Outstanding";
  } else if (ecoscore >= 750) {
    ecoscore_tier = "🌿 EcoPioneer";
    ecoscore_color = "#228B22"; // Forest green
    ecoscore_text = "Excellent";
  } else if (ecoscore >= 600) {
    ecoscore_tier = "🌱 EcoSelect";
    ecoscore_color = "#32CD32"; // Lime green
    ecoscore_text = "Very Good";
  } else if (ecoscore >= 450) {
    ecoscore_tier = "♻️ EcoAware";
    ecoscore_color = "#FFD700"; // Gold
    ecoscore_text = "Good";
  } else if (ecoscore >= 300) {
    ecoscore_tier = "🌍 EcoEntry";
    ecoscore_color = "#FF8C00"; // Orange
    ecoscore_text = "Fair";
  } else {
    ecoscore_tier = "⚠️ Standard";
    ecoscore_color = "#FF0000"; // Red
    ecoscore_text = "Needs Improvement";
  }  const [isEcoScorePopoverVisible, setEcoScorePopoverVisible] = useState(false);
  const [showInfoPopover, setInfoShowPopover] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const ecoScoreRef = useRef(null);  const showEcoScorePopover = () => {
    if (ecoScoreRef.current) {
      const rect = ecoScoreRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top + window.scrollY - 10,
        left: rect.left + window.scrollX + rect.width / 2
      });
    }
    setDontShowAgain(true);
    setEcoScorePopoverVisible(true);
  };

  const hideEcoScorePopover = () => {
    setEcoScorePopoverVisible(false);
  };

  // Update tooltip position on scroll/resize
  useEffect(() => {
    const updateTooltipPosition = () => {
      if (isEcoScorePopoverVisible && ecoScoreRef.current) {
        const rect = ecoScoreRef.current.getBoundingClientRect();
        setTooltipPosition({
          top: rect.top + window.scrollY - 10,
          left: rect.left + window.scrollX + rect.width / 2
        });
      }
    };

    if (isEcoScorePopoverVisible) {
      window.addEventListener('scroll', updateTooltipPosition);
      window.addEventListener('resize', updateTooltipPosition);
      
      return () => {
        window.removeEventListener('scroll', updateTooltipPosition);
        window.removeEventListener('resize', updateTooltipPosition);
      };
    }
  }, [isEcoScorePopoverVisible]);
  const closeInfoPopover = () => {
    setDontShowAgain(true);
    setInfoShowPopover(false);
  };

  // Portal tooltip component
  const PortalTooltip = ({ isVisible, position, children }) => {
    if (!isVisible) return null;
    
    return createPortal(
      <div 
        className="portal-tooltip"
        style={{
          position: 'absolute',
          top: position.top,
          left: position.left,
          transform: 'translate(-50%, -100%)',
          zIndex: 999999,
          pointerEvents: 'none'
        }}
      >
        {children}
      </div>,
      document.body
    );
  };
  useEffect(() => {
    const item = document.getElementById("ecoscoreToTrack");

    const handleScroll = () => {
      const itemRect = item.getBoundingClientRect();

      if (itemRect.top < 650 && itemRect.bottom > 200) {
        setInfoShowPopover(true);
      } else {
        setInfoShowPopover(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <div className="productg">
      <div className="product__bestseller">🌿 ECO BESTSELLER</div>      <div className="product__info">
        <p>{title}</p>
        <div className="product__price">
          <div className="price-amount">
            <small>$</small>
            <strong>{price}</strong>
          </div>
          <div className="product__rating">
            {Array(rating)
              .fill()
              .map((_, index) => (
                <p key={index}>⭐</p>
              ))}
          </div>
        </div>
      </div>
      <img src={image} alt={title} />
      <div className="eco_details">
        <div className="carbon_details">
          <img src="../images/co2badge.png" alt="CO2 Badge" className="eco_image" />
          <p 
            className="eco_text"
            title={aiInsights?.carbonReduced?.description || "CO2 reduction compared to conventional alternatives"}
            style={{cursor: "help"}}
          >
            💨 {aiInsights?.carbonReduced?.value || carbon_red}kg CO2 Saved
          </p>
        </div>        <div className="badge_details">
          <div className="popover_trigger">
            <div
              ref={ecoScoreRef}
              id="ecoscoreToTrack"
              className="ecoscore_display"
              style={{
                backgroundColor: ecoscore_color,
                color: "white",
                padding: "10px 16px",
                borderRadius: "25px",
                fontWeight: "bold",
                fontSize: "14px",
                cursor: "pointer",
                display: "inline-block"
              }}
              onMouseEnter={showEcoScorePopover}
              onMouseLeave={hideEcoScorePopover}
            >
              🌱 {ecoscore}/1000
            </div>
            {showInfoPopover && id === "875615" && !dontShowAgain && (
              <div className="badge_info_popover_content_nav">
                <div className="badge_info_triangle"></div>
                <p>🌱 Hover over the EcoScore to see detailed sustainability information and environmental impact metrics.</p>
                <button onClick={closeInfoPopover} className="got_it">
                  Got It! 🌿
                </button>
              </div>
            )}
          </div>
          <p className="eco_text">🏆 EcoScore</p>
        </div>
      </div>      <Link to={`/product/${id}`} style={{ textDecoration: 'none', width: '100%' }}>
        <button className="buy-with-impact-btn">
          🌱 Buy with IMPACT 🌍
        </button>
      </Link>

      {/* Portal tooltip for EcoScore */}
      <PortalTooltip isVisible={isEcoScorePopoverVisible} position={tooltipPosition}>
        <div 
          className="portal-tooltip-content"
          style={{
            padding: "20px",
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.15), 0 0 0 3px #4CAF50",
            border: "3px solid #4CAF50",
            minWidth: "280px",
            maxWidth: "320px",
            background: "linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)"
          }}
        >
          <h4 style={{margin: "0 0 12px 0", color: ecoscore_color, fontSize: "16px", fontWeight: "700"}}>
            {ecoscore_tier}: {ecoscore_text}
          </h4>
          <p style={{margin: "0", fontSize: "13px", color: "#2e7d32", lineHeight: "1.5"}}>
            🌍 This product scores <strong>{ecoscore} out of 1000</strong> on our sustainability metrics, 
            including materials, manufacturing, packaging, and carbon footprint.
            {aiInsights?.summary && (
              <>
                <br /><br />
                <strong>🎯 Impact:</strong> {aiInsights.summary}
              </>
            )}
          </p>
        </div>
      </PortalTooltip>
    </div>
  );
}

export default Product;