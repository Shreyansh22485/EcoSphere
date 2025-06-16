import React, { useState, useEffect } from "react";
import "../Css/Homegreen.css";
import Product from "./Productgreen";
import ImageSliderGreen from "./Imageslidegreen";
import { Link } from "react-router-dom";

function Homegreen() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/products?limit=10&sortBy=ecoScore.overall&sortOrder=desc`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      setProducts(data.data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };  return (
    <>
    <div className="homeg">
      <div className="home__containerg">
        <ImageSliderGreen/>
        </div>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
    </div>
    
    {loading && (
      <div style={{textAlign: 'center', padding: '50px', fontSize: '18px', color: '#4CAF50'}}>
        🌱 Loading eco-friendly products...
      </div>
    )}
    
    {error && (
      <div style={{textAlign: 'center', padding: '50px', fontSize: '16px', color: '#ff0000'}}>
        ❌ Error loading products: {error}
        <br />
        <button onClick={fetchProducts} style={{marginTop: '10px', padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
          Retry
        </button>
      </div>
    )}
    
    {!loading && !error && products.length === 0 && (
      <div style={{textAlign: 'center', padding: '50px', fontSize: '16px', color: '#666'}}>
        No eco-friendly products found. Be the first to add one!
      </div>
    )}
    
    {!loading && !error && products.length > 0 && (
      <>
        <div className="home__rowg">
          {products.slice(0, 4).map((product) => (
            <Product
              key={product._id}
              id={product._id}
              title={product.name}
              price={product.price}
              carbon_red={Math.round((product.ecoScore?.aiInsights?.carbonReduced?.value || 0) * 10)} // Convert to percentage
              rating={Math.round(product.metrics?.averageRating || 4)}
              image={product.images?.[0]?.url || "../images/eco-placeholder.jpg"}
              ecoscore={product.ecoScore?.overall || 0}
              aiInsights={product.ecoScore?.aiInsights}
            />
          ))}
        </div>

        <img src="../images/badgebanner.png" alt="" width="100%" />

        <div className="home__rowg">
          {products.slice(4, 7).map((product) => (
            <Product
              key={product._id}
              id={product._id}
              title={product.name}
              price={product.price}
              carbon_red={Math.round((product.ecoScore?.aiInsights?.carbonReduced?.value || 0) * 10)}
              rating={Math.round(product.metrics?.averageRating || 4)}
              image={product.images?.[0]?.url || "../images/eco-placeholder.jpg"}
              ecoscore={product.ecoScore?.overall || 0}
              aiInsights={product.ecoScore?.aiInsights}
            />
          ))}
        </div>

        <div className="home__rowg">
          {products.slice(7, 9).map((product) => (
            <Product
              key={product._id}
              id={product._id}
              title={product.name}
              price={product.price}
              carbon_red={Math.round((product.ecoScore?.aiInsights?.carbonReduced?.value || 0) * 10)}
              rating={Math.round(product.metrics?.averageRating || 4)}
              image={product.images?.[0]?.url || "../images/eco-placeholder.jpg"}
              ecoscore={product.ecoScore?.overall || 0}
              aiInsights={product.ecoScore?.aiInsights}
            />
          ))}
        </div>
      </>
    )}



</>
  );
}

export default Homegreen;