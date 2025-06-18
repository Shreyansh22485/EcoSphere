import React from 'react';
import '../Css/navbargreen.css';
import { Link } from 'react-router-dom';
//import Popover from './Popover';

const AmazonNavigationBarg = () => {
  return (
    <div className="amazon-nav">
      <div className="amazon-nav-section">        <ul className="amazon-nav-list">
          <Link style={{textDecoration: 'none'}} to = "/ecosphere">
            <li><a href="#" style={{ color: '#146eb4' }}>EcoSphere</a></li>
          </Link>          <li><a href="#">EcoSphere Select</a></li>
          <Link style={{textDecoration: 'none'}} to="/groups">
            <li><a href="#" style={{ color: '#146eb4' }}>EcoSphere Groups</a></li>
          </Link>
          <li><a href="#">EcoSphere Rewards</a></li>
          <li><a href="#">Categories</a></li>
          <li><a href="#">Top Rated</a></li>
          <Link style={{textDecoration: 'none'}} to = "/ecosphere-partner-hub">
          <li><a href="#" style={{ color: '#146eb4' }}>Partner Hub</a></li>
          </Link>
          <Link style={{textDecoration: 'none'}} to = "/ecosphere-learn">
          <li><a href="#" style={{ color: '#146eb4' }}>EcoSphere Learn</a></li>
          </Link>
          <Link style={{textDecoration: 'none'}} to = "/ecosphere-impact">
          <li><a href="#" style={{ color: '#146eb4' }}>EcoSphere Impact</a></li>
          </Link>
          <li><a href="#">More</a></li>

          {/* <Link style={{textDecoration: 'none'}} to = "/green">
            <button className="button">Greenovation Zone</button>
          </Link> */}
          </ul>
      </div>
    </div>
  );
};

export default AmazonNavigationBarg;
