import React, { useEffect, useState } from "react";
import "../Css/SellerShowcase.css";
import { Link } from "react-router-dom";

const mockTopProducts = [
  {
    name: "Bamboo Toothbrush",
    image: "/images/BambooToothbrush.webp",
    ecoRating: 4.8,
    benefits: [
      "100% biodegradable handle",
      "Minimal plastic packaging",
      "Sustainably harvested bamboo"
    ],
    description:
      "A compostable bamboo toothbrush that replaces plastic alternatives.",
    link: "/product/bamboo-toothbrush"
  },
  {
    name: "Reusable Cotton Bags",
    image: "/images/CottonBags.avif",
    ecoRating: 4.7,
    benefits: [
      "Reduces single-use plastic",
      "Made from organic cotton",
      "Durable and washable"
    ],
    description:
      "Eco-friendly cotton bags for grocery and daily use with zero plastic.",
    link: "/product/cotton-bag"
  },
  {
    name: "Solar Powered Light",
    image: "/images/SolarLight.jpg",
    ecoRating: 4.9,
    benefits: [
      "Powered by renewable energy",
      "Reduces carbon emissions",
      "Long battery life"
    ],
    description:
      "A clean energy solar lamp perfect for homes, camping, or emergencies.",
    link: "/product/solar-light"
  }
];

function SellerShowcase() {
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    setTopProducts(mockTopProducts);
  }, []);

  return (
    <div className="seller-showcase-container">
      <div className="showcase-header">
        <h1>🌿 Seller Eco Showcase</h1>
        <p>Highlighting the top eco-rated products with meaningful impact</p>
      </div>

      <div className="products-grid">
        {topProducts.map((product, index) => (
          <div key={index} className="product-card">
            <img src={product.image} alt={product.name} className="product-image" />
            <div className="product-info">
              <h2 className="product-title">{product.name}</h2>
              <p className="product-description">{product.description}</p>
              <p className="eco-rating">Eco Rating: 🌱 {product.ecoRating}/5</p>
              <ul className="benefits-list">
                {product.benefits.map((benefit, bIndex) => (
                  <li key={bIndex} className="benefit-item">✅ {benefit}</li>
                ))}
              </ul>
              <Link to={product.link} className="product-link">
                View Product
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SellerShowcase;
