import React from "react";
import "./App.css";
import Header from "./Component/Header";
import Home from "./Component/Home";
import NavBar from "./Component/navbar";
import Checkout from "./Component/Checkout"
import Login from "./Component/Login";
import Headergreen from "./Component/Headergreen";
import Homegreen from "./Component/Homegreen";
import NavBarg from "./Component/navbargreen";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import EducationSection from "./Component/Educationsection";
import SustainabilityReportsSection from "./Component/Sustainability";
import EcoSphereImpact from "./Component/EcoSphereImpact";
import Footer from "./Component/Footer";
import Orders from "./Component/Orders";
import Thanks from "./Component/thanks";
import SellerSection from "./Component/SellerSection";
import Submitted from "./Component/Submitted";
import Dashboard from "./Component/Dashboard";
import Feedback from "./Component/feedback";
import ProductDetails from "./Component/ProductDetails";
import ProductDetails1 from "./Component/ProductDetails1";
import FSubmitted from "./Component/Feedbacksubmitted";

function App() {
  return (
    // BEM
    <Router>
      <div className="app">
        <Routes>
          {/* <Route path="/greenovation" element={<Homegreen/>}/> */}
          <Route path="/feedbacksubmitted" element={[<Headergreen/>, <NavBarg/>, <FSubmitted/>]}/>
          <Route path="/feedback" element={[<Headergreen/>, <NavBarg/>, <Feedback/>, <Footer/>]}/> 
          <Route path="/submitted" element={[<Headergreen/>, <Submitted/>]}/> 
          <Route path="/ecosphere-partner-hub" element={[<Headergreen/>, <NavBarg/>, <SellerSection/>, <Footer/>]}/> 
          <Route path="/thanks" element={[<Header />, <Thanks/>]}/> 
          <Route path="/orders" element={[<Header />, <Orders/>, <Footer/>]}/>
          <Route path="/ecosphere-impact" element={[<Headergreen/>,<NavBarg/>, <EcoSphereImpact/>, <Footer/>  ]}/>
          <Route path="/ecosphere-learn" element={[<Headergreen/>,<NavBarg/>, <EducationSection/>, <Footer/>  ]}/>
          <Route path="/ecosphere" element={[<Headergreen/>,<NavBarg/>, <Homegreen/>, <Footer/>  ]}/>
          <Route path="/login" element={<Login/>}/> 
          <Route path="/checkout" element={[<Header />, <Checkout/>, <Footer/>  ]}/>
          <Route path="/" element={[<Header />, <NavBar/>, <Home />, <Footer/>  ]}/>
          <Route path="/dashboard" element={[<Header />, <NavBarg/>, <Dashboard/>]} />
          <Route path="/product" element={[<Headergreen />, <NavBarg />, <ProductDetails />, <Footer />]}/>
          <Route path="/product1" element={[<Headergreen />, <NavBarg />, <ProductDetails1 />, <Footer />]}/>

        </Routes>
      </div>
    </Router>
  );
}

export default App;

