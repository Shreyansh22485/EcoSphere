import React, { useState } from "react";
import "../Css/ProductDetails.css";
import { FaTruck } from "react-icons/fa";
import { FaAmazonPay } from "react-icons/fa";
import { GiCheckedShield, GiLaurelsTrophy } from "react-icons/gi";
import { useStateValue } from "../StateProvider";

function ProductDetails() {
  const [selectedImage, setSelectedImage] = useState("../images/Straw2.png");
  const [{ basket }, dispatch] = useStateValue();

  const addToBasket = (id, title, image, price, rating, ecoscore) => {
    dispatch({
      type: "ADD_TO_BASKET",
      item: {
        id,
        title,
        image,
        price,
        rating,
        ecoscore,
      },
    });
  };

  const imageArray = [
    "../images/Straw1.png",
    "../images/Straw2.png",
    "../images/Straw3.png",
    "../images/Straw4.png",
  ];

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  return (
    <div className="whole">
      <div className="img">
        <div className="image-slider">
          <div className="image-thumbnails">
            {imageArray.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Image ${index}`}
                className={`thumbnail ${
                  selectedImage === image ? "selected" : ""
                }`}
                onClick={() => handleImageClick(image)}
              />
            ))}
          </div>
        </div>
        <div className="large-image">
          {selectedImage && <img src={selectedImage} alt="Selected Image" />}
        </div>
      </div>

      <div className="img-desc">
        <h2>
          Qudrat Natural Straw | Coconut Leaf | Biodegradable, Eco-Friendly &
          Sustainable Drinking Straws (Pack of 100)
        </h2>
        <p>⭐⭐⭐⭐ (23 reviews)</p>
        <br></br>
        <p className="price">
          <span className="discounted-price">$15.35</span>
          <span className="original-price">$18.99</span>
        </p>
        <br></br>        <div className="eco_details">
          <div className="impact_points_section" style={{
            backgroundColor: "#e8f5e8",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "20px",
            border: "2px solid #4CAF50"
          }}>
            <div style={{fontSize: "18px", fontWeight: "bold", color: "#2e7d32", marginBottom: "15px"}}>
              💎 Earn 85 Impact Points with this purchase
            </div>
            
            <div style={{fontSize: "16px", fontWeight: "bold", color: "#1b5e20", marginBottom: "10px"}}>
              🌍 Your Environmental Impact:
            </div>
            <div style={{paddingLeft: "20px", lineHeight: "1.8", color: "#2e7d32"}}>
              <div>├── 🌱 CO2 Reduced: 8.4kg vs conventional product</div>
              <div>├── 💧 Water Saved: 234 liters in production</div>
              <div>├── ♻️ Waste Prevented: 2.1kg from landfill</div>
              <div>├── 🌊 Ocean Plastic: 12 bottles diverted</div>
              <div>└── 🌳 Tree Equivalent: 0.3 trees saved</div>
            </div>

            <div style={{fontSize: "16px", fontWeight: "bold", color: "#1b5e20", marginTop: "15px", marginBottom: "10px"}}>
              👥 Group Buy Impact Multiplier:
            </div>
            <div style={{paddingLeft: "20px", lineHeight: "1.8", color: "#2e7d32"}}>
              <div>├── Individual Impact: 8.4kg CO2 saved</div>
              <div>├── Group Impact: 168kg CO2 saved (20 people)</div>
              <div>├── Shipping Reduction: Additional 15kg CO2 saved</div>
              <div>└── Total Group Benefit: 183kg CO2 prevented</div>
            </div>            <div style={{
              backgroundColor: "#4CAF50",
              color: "white",
              padding: "10px",
              borderRadius: "8px",
              textAlign: "center",
              marginTop: "15px",
              fontSize: "14px",
              fontWeight: "bold"
            }}>
              🌿 EcoPioneer: 875/1000 - Excellent Sustainability Rating
            </div>
          </div>
        </div>
        <br></br>
        <p>
          Our innovative Quadrat straws offer an exceptional eco-friendly
          solution for all your beverage needs. Made from fallen coconut leaves,
          these straws are not only biodegradable but also act as a natural
          fertilizer when buried in garden soil, enhancing its quality in just
          30 days. They are not only kind to the environment but also
          long-lasting, capable of withstanding both hot and cold beverages
          without breaking or getting soggy. Their temperature range spans from
          a minimum of 32°F / 0°C to a maximum of 302°F / 150°C. Quadrat straws
          are a sustainable alternative to paper or plastic straws, working like
          plastic but feeling entirely natural.
        </p>
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
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            padding: "15px 30px",
            fontSize: "16px",
            fontWeight: "bold",
            borderRadius: "8px",
            cursor: "pointer",
            width: "100%",
            marginBottom: "10px"
          }}
          onClick={() =>
            addToBasket(
              "875617",
              "Qudrat Natural Straw | Coconut Leaf | Biodegradable, Eco-Friendly & Sustainable Drinking Straws (Pack of 100)",
              "../images/straw_eco.jpg",
              8.99,
              4,
              875
            )
          }        >
          Buy with IMPACT (+85 Impact Points)
        </button>
        
        <div style={{
          backgroundColor: "#f3e5f5",
          padding: "15px",
          borderRadius: "8px",
          marginTop: "10px",
          fontSize: "14px",
          color: "#6a1b9a",
          textAlign: "center"
        }}>
          🎯 Join Group Buy for 2x Impact Points & Better Pricing!
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
