import React from "react";
import "../Css/Productbutton.css";
import { useStateValue } from "../StateProvider";
//import Popover from "./Popover";
import { Link } from "react-router-dom";

function Productbutton({ title, image, id, price, rating, ecoscore }) {
  const [{ basket }, dispatch] = useStateValue();

  const handleLinkClick = () => {
    // Scroll to the top of the page when the link is clicked
    window.scrollTo(0, 0, { behavior: "instant" });
  };

  const addToBasket = () => {
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

  return (
    <div className="productb">
      {/* <div className="product__bestsellerb">BESTSELLER</div> */}
      <div className="product__infob">
        <p>{title}</p>
        <div className="product__priceb">
          <small>$</small>
          <strong>{price}</strong>
        </div>
        <div className="product__ratingb">
          {Array(rating)
            .fill()
            .map((rate) => (
              <p>⭐</p>
            ))}
        </div>
      </div>
      <img src={image} alt="" />      <Link to="/product1">
        <button className="normal" onClick={handleLinkClick}>
          Add to Cart
        </button>
      </Link>
      <Link to="/product">
        <button onClick={handleLinkClick} className="ecosphere">
          Buy with IMPACT
        </button>
      </Link>{" "}
    </div>
  );
}

export default Productbutton;
