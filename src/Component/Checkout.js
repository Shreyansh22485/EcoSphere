import React from "react";
import "../Css/Checkout.css";
import Subtotal from "./Subtotal";
import CheckoutProduct from "./CheckoutProduct";
import { useStateValue } from "../StateProvider";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";

function Checkout() {
  const [{ basket }, dispatch] = useStateValue();
  const { isAuthenticated } = useAuth();
  const { cart, loading } = useCart();

  // Show message if not authenticated
  if (!isAuthenticated) {
    return (
      <div style={{textAlign: 'center', padding: '100px', fontSize: '18px', color: '#4CAF50'}}>
        🔒 Please <Link to="/login" style={{color: '#4CAF50', textDecoration: 'underline'}}>sign in</Link> to view your cart
      </div>
    );
  }

  return (
    <div className="checkout">
      <div className="checkout__left">
        <Link to="/green">
          <img className=" checkout__ad" src="../images/greenad.png" alt="" />
        </Link>
        <div>
          <h2 className="checkout__title">Your shopping Cart</h2>
          {basket.map((item) => (
            <CheckoutProduct
              id={item.id}
              price={item.price}
              rating={item.rating}
              image={item.image}
              title={item.title}
              badge_id={item.badge_id}
            />
          ))}
        </div>
      </div>
      <div className="checkout__right">
        <Subtotal />
      </div>
    </div>
  );
}

export default Checkout;
