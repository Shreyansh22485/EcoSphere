import React, { useState } from "react";
import "../Css/ProductDetails1.css";
import { TbTruckDelivery } from "react-icons/tb";
import { FaAmazonPay } from "react-icons/fa";
import { GiCheckedShield, GiLaurelsTrophy } from "react-icons/gi";
import { useStateValue } from "../StateProvider";
import { Link } from "react-router-dom";

function ProductDetails1() {
  const [selectedImage, setSelectedImage] = useState("../images/leatherbag.jpg");

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
    "../images/leatherbag.jpg",
  ];

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };
  return (
    <div className="std-details-whole">
      <div className="std-details-img">
        <div className="std-details-image-slider">
          <div className="std-details-image-thumbnails">
            {imageArray.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Image ${index}`}
                className={`std-details-thumbnail ${
                  selectedImage === image ? "std-details-selected" : ""
                }`}
                onClick={() => handleImageClick(image)}
              />
            ))}
          </div>
        </div>
        <div className="std-details-large-image">
          {selectedImage && <img src={selectedImage} alt="Selected Image" />}
        </div>
      </div>

      <div className="std-details-img-desc">
        <h2>
          Woven Bag for Women, Leather Tote Bag Large Summer Beach Travel Handbag and Purse Retro Handmade Shoulder Bag
        </h2>        <p>⭐⭐⭐⭐ ( 63 reviews )</p>
        <br></br>
        <p className="std-details-price">
          <span className="std-details-discounted-price">$13.96</span>
          <span className="std-details-original-price">$19.95</span>
        </p>
        <br></br>        <div className="std-details-eco_details">
          <div style={{
            backgroundColor: "#fff3e0",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "20px",
            border: "2px solid #ff9800"
          }}>
            <div style={{fontSize: "18px", fontWeight: "bold", color: "#e65100", marginBottom: "15px"}}>
              ⚠️ EcoSphere Alternative Available
            </div>
            
            <div style={{
              backgroundColor: "#ffebee",
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "15px",
              border: "1px solid #f44336"
            }}>
              <div style={{fontSize: "16px", fontWeight: "bold", color: "#c62828", marginBottom: "10px"}}>
                🔻 Impact Point Deductions:
              </div>
              <div style={{paddingLeft: "20px", lineHeight: "1.8", color: "#d32f2f"}}>
                <div>├── First Alternative Ignored: -10 points + warning</div>
                <div>├── Second Alternative Ignored: -20 points + education</div>
                <div>└── Pattern of Ignoring: -50 points + intervention</div>
              </div>
            </div>

            <div style={{
              backgroundColor: "#e8f5e8",
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "15px",
              border: "1px solid #4CAF50"
            }}>
              <div style={{fontSize: "16px", fontWeight: "bold", color: "#2e7d32", marginBottom: "10px"}}>
                🌍 Missed Environmental Benefits:
              </div>
              <div style={{paddingLeft: "20px", lineHeight: "1.8", color: "#388e3c"}}>
                <div>├── 🌱 CO2 Not Reduced: 8.4kg extra emissions</div>
                <div>├── 💧 Water Wasted: 234 liters unnecessarily used</div>
                <div>├── ♻️ Waste Created: 2.1kg to landfill</div>
                <div>├── 🌊 Ocean Impact: 12 bottles not diverted</div>
                <div>└── 🌳 Trees: 0.3 tree equivalent not saved</div>
              </div>
            </div>            <div style={{
              backgroundColor: "#fff8e1",
              padding: "15px",
              borderRadius: "8px",
              textAlign: "center",
              fontSize: "14px",
              color: "#f57c00",
              fontWeight: "bold"
            }}>
              💡 Switch to Buy with IMPACT to earn +85 Impact Points instead!
            </div>
          </div>
        </div>
        <br></br>

        <p>
          Jutify offers versatile cotton tote bags that are perfect for various
          purposes, such as shopping, work, travel, and more. These spacious and
          sturdy bags are made in India, promoting local employment. They are
          made of thick cotton fabric and come with an inner zip pocket for
          small essentials. Regular cleaning is recommended to maintain their
          quality. Jutify is dedicated to producing high-quality jute and cotton
          bags, setting the standard for quality in the industry.
        </p>        <br></br>
        <div className="std-details-icons">
          <div className="std-details-icon">
            <img src="../images/8.png" className="std-details-i" />
            <p>Free Delivery</p>
          </div>

          <div className="std-details-icon">
            <img src="../images/9.png" className="std-details-i" />
            <p>Accept Amazon Pay</p>
          </div>

          <div className="std-details-icon">
            <img src="../images/10.png" className="std-details-i" />
            <p>2-year warranty</p>
          </div>

          <div className="std-details-icon">
            <img src="../images/11.png" className="std-details-i" />
            <p>Top Brand</p>
          </div>
        </div>

        <div className="std-details-product-data-info">
          <p>
            Available: <span style={{ color: "green" }}> In Stock</span>
          </p>
        </div>
        <br />
        <br />        <button
          className="std-details-addtocart"
          style={{
            backgroundColor: "#ff5722",
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
              "875615",
              "Jutify Eco-Friendly Printed Unisex Canvas Shopping Bag, Women's Tote Bag | Spacious, Stylish, Sturdy Handbag",
              "../images/bag_eco.jpg",
              15.35,
              4,
              720
            )
          }        >
          Add to Cart (-10 Impact Points)
        </button>
          <Link to="/product/6851a92ff93862aaf78a9a7d" style={{textDecoration: "none"}}>
          <button
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
              marginTop: "10px"
            }}
          >
            🌱 Buy with IMPACT (+85 Points)
          </button>
        </Link>
          <div style={{
          backgroundColor: "#f3e5f5",
          padding: "15px",
          borderRadius: "8px",
          marginTop: "15px",
          fontSize: "14px",
          color: "#6a1b9a",
          textAlign: "center"
        }}>
          📊 Your current Impact Points : 100 - Consider more sustainable choices!
        </div>
      </div>
    </div>
  );
}

export default ProductDetails1;
