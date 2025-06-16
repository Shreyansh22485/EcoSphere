import React, { useEffect, useState } from "react";
import "../Css/Productgreen.css";
import { useStateValue } from "../StateProvider";

function Product({ title, image, id, price, rating, carbon_red, ecoscore }) {
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
  };
  // EcoScore badge logic - higher score = better sustainability
  let ecoscore_color = "";
  let ecoscore_text = "";
  
  if (ecoscore >= 800) {
    ecoscore_color = "#006400"; // Dark green for excellent
    ecoscore_text = "Excellent";
  } else if (ecoscore >= 600) {
    ecoscore_color = "#32CD32"; // Lime green for good
    ecoscore_text = "Good";
  } else if (ecoscore >= 400) {
    ecoscore_color = "#FFD700"; // Gold for fair
    ecoscore_text = "Fair";
  } else if (ecoscore >= 200) {
    ecoscore_color = "#FF8C00"; // Orange for poor
    ecoscore_text = "Poor";
  } else {
    ecoscore_color = "#FF0000"; // Red for very poor
    ecoscore_text = "Very Poor";
  }
  const [isEcoScorePopoverVisible, setEcoScorePopoverVisible] = useState(false);
  const [showInfoPopover, setInfoShowPopover] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const showEcoScorePopover = () => {
    setDontShowAgain(true);
    setEcoScorePopoverVisible(true);
  };

  const hideEcoScorePopover = () => {
    setEcoScorePopoverVisible(false);
  };

  const closeInfoPopover = () => {
    setDontShowAgain(true);
    setInfoShowPopover(false);
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
      <div className="product__bestseller">BESTSELLER</div>
      <div className="product__info">
        <p>{title}</p>
        <div className="product__price">
          <small>$</small>
          <strong>{price}</strong>
        </div>
        <div className="product__rating">
          {Array(rating)
            .fill()
            .map((rate) => (
              <p>⭐</p>
            ))}
        </div>
      </div>
      <img src={image} alt="" />
      <div className="eco_details">
        <div className="carbon_details">
          <img src="../images/co2badge.png" alt="" className="eco_image"></img>
          <p className="eco_text">{carbon_red}% Less Carbon Emission</p>
        </div>        <div className="badge_details">
          <div className="popover_trigger">
            <div
              id="ecoscoreToTrack"
              className="ecoscore_display"
              style={{
                backgroundColor: ecoscore_color,
                color: "white",
                padding: "8px 12px",
                borderRadius: "20px",
                fontWeight: "bold",
                fontSize: "14px",
                cursor: "pointer",
                display: "inline-block"
              }}
              onMouseEnter={showEcoScorePopover}
              onMouseLeave={hideEcoScorePopover}
            >
              {ecoscore}/1000
            </div>
            {isEcoScorePopoverVisible && (
              <div className="popover_content">
                <div className="content">
                  <div 
                    style={{
                      padding: "15px",
                      backgroundColor: "white",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      minWidth: "200px"
                    }}
                  >
                    <h4 style={{margin: "0 0 10px 0", color: ecoscore_color}}>
                      EcoScore: {ecoscore_text}
                    </h4>
                    <p style={{margin: "0", fontSize: "12px", color: "#666"}}>
                      This product scores {ecoscore} out of 1000 on our sustainability metrics, 
                      including materials, manufacturing, packaging, and carbon footprint.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {showInfoPopover && id === "875615" && !dontShowAgain && (
              <div className="badge_info_popover_content_nav">
                <div className="badge_info_triangle"></div>
                <p>Hover over the EcoScore to see sustainability details.</p>
                <button onClick={closeInfoPopover} className="got_it">
                  Got It
                </button>
              </div>
            )}
          </div>
          <p className="eco_text">EcoScore Rating</p>
        </div>
      </div>
      <button onClick={addToBasket}>Add to Cart</button>
    </div>
  );
}

export default Product;
