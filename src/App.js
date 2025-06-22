import React from "react";
import "./App.css";
import Header from "./Component/Header";
import Home from "./Component/Home";
import NavBar from "./Component/navbar";
import Checkout from "./Component/Checkout"
import Login from "./Component/Login";
import UserRegister from "./Component/UserRegister";
import PartnerRegister from "./Component/PartnerRegister";
import Headergreen from "./Component/Headergreen";
import Homegreen from "./Component/Homegreen";
import NavBarg from "./Component/navbargreen";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import EducationSection from "./Component/Educationsection";
import SustainabilityReportsSection from "./Component/Sustainability";
import SellerSection from "./Component/SellerSection";
import EcoSphereImpact from "./Component/EcoSphereImpact";
import Footer from "./Component/Footer";
import Orders from "./Component/Orders";
import Thanks from "./Component/thanks";
import SellerShowcase from "./Component/SellerShowcase";
import EcoSpherePartnerHub from "./Component/EcoSpherePartnerHub";
import Submitted from "./Component/Submitted";
import Dashboard from "./Component/Dashboard";
import Feedback from "./Component/feedback";
import ProductDetails from "./Component/ProductDetails";
import ProductDetails1 from "./Component/ProductDetails1";
import FSubmitted from "./Component/Feedbacksubmitted";
import EcoSphereGroups from "./Component/EcoSphereGroups";
import GroupDetail from "./Component/GroupDetail";
import CreateGroup from "./Component/CreateGroup";
import EcoSphereRewards from "./Component/EcoSphereRewards";
import { AuthProvider } from "./hooks/useAuth";
import { CartProvider } from "./hooks/useCart";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="app">
            <Routes>
              {/* Authentication Routes */}
              <Route path="/login" element={<Login/>}/> 
              <Route path="/register-user" element={<UserRegister/>}/> 
              <Route path="/register-partner" element={<PartnerRegister/>}/> 
              
              {/* Partner Routes */}
              <Route path="/partner-hub" element={[<Headergreen/>, <NavBarg/>, <EcoSpherePartnerHub/>, <Footer/>]}/> 
              
              {/* Main Routes */}
              {/* <Route path="/greenovation" element={<Homegreen/>}/> */}
              <Route path="/feedbacksubmitted" element={[<Headergreen/>, <NavBarg/>, <FSubmitted/>]}/>
              <Route path="/feedback" element={[<Headergreen/>, <NavBarg/>, <Feedback/>, <Footer/>]}/> 
              <Route path="/submitted" element={[<Headergreen/>, <Submitted/>]}/> 
              <Route path="/ecosphere-partner-hub" element={[<Headergreen/>, <NavBarg/>, <EcoSpherePartnerHub/>, <Footer/>]}/> 
              <Route path="/thanks" element={[<Header />, <Thanks/>]}/> 
              <Route path="/orders" element={[<Header />, <Orders/>, <Footer/>]}/>
              <Route path="/ecosphere-impact" element={[<Headergreen/>,<NavBarg/>, <EcoSphereImpact/>, <Footer/>  ]}/>
              <Route path="/ecosphere-learn" element={[<Headergreen/>,<NavBarg/>, <EducationSection/>, <Footer/>  ]}/>
              <Route path="/select" element={[<Headergreen/>,<NavBarg/>, <SellerShowcase/>, <Footer/>  ]}/>
              <Route path="/ecosphere" element={[<Headergreen/>,<NavBarg/>, <Homegreen/>, <Footer/>  ]}/>
              <Route path="/checkout" element={[<Header />, <Checkout/>, <Footer/>  ]}/>
              <Route path="/" element={[<Header />, <NavBar/>, <Home />, <Footer/>  ]}/>
              <Route path="/dashboard" element={[<Header />, <NavBarg/>, <Dashboard/>]} />
              <Route path="/product/:id" element={[<Headergreen />, <NavBarg />, <ProductDetails />, <Footer />]}/>
              <Route path="/product" element={[<Headergreen />, <NavBarg />, <ProductDetails />, <Footer />]}/>
              <Route path="/product1" element={[<Headergreen />, <NavBarg />, <ProductDetails1 />, <Footer />]}/>
              
              {/* EcoSphere Groups Routes */}
              <Route path="/groups" element={[<Headergreen />, <NavBarg />, <EcoSphereGroups />, <Footer />]}/>
              <Route path="/groups/create" element={[<Headergreen />, <NavBarg />, <CreateGroup />, <Footer />]}/>
              <Route path="/groups/:groupId" element={[<Headergreen />, <NavBarg />, <GroupDetail />, <Footer />]}/>
              
              {/* EcoSphere Rewards Route */}
              <Route path="/rewards" element={[<Headergreen />, <NavBarg />, <EcoSphereRewards />, <Footer />]}/>

            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

