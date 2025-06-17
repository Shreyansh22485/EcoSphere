import React, { useState } from "react";
import "./EcoSpherePartnerHub.css";

function EcoSpherePartnerHub() {
  const [currentStep, setCurrentStep] = useState(1);
  const [mode, setMode] = useState('simplified'); // 'simplified' or 'advanced'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null

  const [formData, setFormData] = useState({
    // Basic Information
    companyName: "",
    productName: "",
    productCategory: "",
    productDescription: "",
    price: "", // Add price field
    
    // Environmental Impact
    carbonScope1: "",
    carbonScope2: "",
    carbonScope3: "",
    renewableEnergyPercent: "",
    waterUsagePerUnit: "",
    wasteReductionPercent: "",
    
    // Materials & Packaging
    recycledContentPercent: "",
    bioBasedContentPercent: "",
    toxicSubstances: "none",
    packagingWeight: "",
    packagingRecyclable: "",
    plasticFreePackaging: false,
    
    // Supply Chain & Operations
    supplyChainTransparency: "",
    localSourcing: false,
    transportationEfficiency: "",
    
    // Product Lifecycle
    expectedLifespan: "",
    repairability: "",
    takeBackProgram: false,
    disposalGuidance: "",
    
    // Certifications
    certifications: [],
    certificationFiles: [],
    
    // Group Buying Options
    groupBuyingEnabled: false,
    groupBuyingMinQuantity: "",
    groupBuyingDiscountTiers: []
  });

  // Add state for image uploads
  const [productImages, setProductImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);

  const totalSteps = mode === 'simplified' ? 4 : 6;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCertificationChange = (cert, isChecked) => {
    setFormData(prev => ({
      ...prev,
      certifications: isChecked 
        ? [...prev.certifications, cert]
        : prev.certifications.filter(c => c !== cert)
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 10) {
      alert('Maximum 10 images allowed');
      return;
    }
    
    setProductImages(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreview(previews);
  };

  const removeImage = (index) => {
    const newImages = productImages.filter((_, i) => i !== index);
    const newPreviews = imagePreview.filter((_, i) => i !== index);
    
    setProductImages(newImages);
    setImagePreview(newPreviews);
  };

  const nextStep = (e) => {
    e.preventDefault();
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = (e) => {
    e.preventDefault();
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitProduct = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (Array.isArray(formData[key])) {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add product images
      productImages.forEach((image, index) => {
        formDataToSend.append(`productImages`, image);
      });

      console.log('📤 Submitting product with AI EcoScore calculation...');
      setSubmitStatus('submitting');

      const response = await fetch('/api/products/submit', {
        method: 'POST',
        body: formDataToSend,
        credentials: 'include'
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Product submitted successfully:', result);
        setSubmitStatus('success');
        
        setTimeout(() => {
          alert(`🎉 Success! Your product has been submitted for review.\n\nAI-Generated EcoScore: ${result.data.aiAnalysis.insights.confidence ? Math.round(result.data.product.ecoScore) : 'Calculating...'}/1000\nTier: ${result.data.product.tier}\nImpact Points: ${result.data.product.impactPoints}\n\nYou'll receive an email when approved!`);
          window.location.href = "/submitted";
        }, 1000);
      } else {
        console.error('❌ Submission failed:', result);
        setSubmitStatus('error');
        alert(`❌ Submission failed: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      setSubmitStatus('error');
      alert('❌ Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEcoTier = () => {
    const completionScore = calculateFormCompletion();
    if (completionScore >= 90) return { tier: "🌟 EcoChampion (Estimated)", color: "#006400" };
    if (completionScore >= 75) return { tier: "🌿 EcoPioneer (Estimated)", color: "#228B22" };
    if (completionScore >= 60) return { tier: "🌱 EcoSelect (Estimated)", color: "#32CD32" };
    if (completionScore >= 45) return { tier: "♻️ EcoAware (Estimated)", color: "#FFD700" };
    if (completionScore >= 30) return { tier: "🌍 EcoEntry (Estimated)", color: "#FF8C00" };
    return { tier: "⚠️ Complete form for estimate", color: "#FF0000" };
  };

  const calculateFormCompletion = () => {
    const totalFields = Object.keys(formData).length;
    const filledFields = Object.values(formData).filter(value => {
      if (typeof value === 'string') return value.trim() !== '';
      if (typeof value === 'boolean') return true;
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined;
    }).length;
    
    return Math.round((filledFields / totalFields) * 100);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h3>📝 Basic Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Company Name *</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  required
                  placeholder="Your company name"
                />
              </div>
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleInputChange}
                  required
                  placeholder="Your eco-friendly product name"
                />
              </div>
              <div className="form-group">
                <label>Product Category *</label>
                <select
                  name="productCategory"
                  value={formData.productCategory}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Home & Kitchen">Home & Kitchen</option>
                  <option value="Fashion & Accessories">Fashion & Accessories</option>
                  <option value="Health & Beauty">Health & Beauty</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Food & Beverages">Food & Beverages</option>
                  <option value="Garden & Outdoor">Garden & Outdoor</option>
                  <option value="Baby & Kids">Baby & Kids</option>
                  <option value="Office & School">Office & School</option>
                  <option value="Sports & Recreation">Sports & Recreation</option>
                  <option value="Cleaning & Household">Cleaning & Household</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Price (USD) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="19.99"
                />
              </div>
              <div className="form-group full-width">
                <label>Product Description *</label>
                <textarea
                  name="productDescription"
                  value={formData.productDescription}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  placeholder="Describe your eco-friendly product, its benefits, and sustainability features..."
                />
              </div>
              <div className="form-group full-width">
                <label>Product Images (Max 10)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="file-input"
                />
                <div className="image-preview-grid">
                  {imagePreview.map((preview, index) => (
                    <div key={index} className="image-preview-item">
                      <img src={preview} alt={`Preview ${index + 1}`} />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="remove-image-btn"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <h3>🌍 Environmental Impact</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Carbon Scope 1 (kg CO2) *</label>
                <input
                  type="number"
                  name="carbonScope1"
                  value={formData.carbonScope1}
                  onChange={handleInputChange}
                  placeholder="Direct emissions"
                />
              </div>
              <div className="form-group">
                <label>Carbon Scope 2 (kg CO2) *</label>
                <input
                  type="number"
                  name="carbonScope2"
                  value={formData.carbonScope2}
                  onChange={handleInputChange}
                  placeholder="Indirect emissions from energy"
                />
              </div>
              <div className="form-group">
                <label>Carbon Scope 3 (kg CO2)</label>
                <input
                  type="number"
                  name="carbonScope3"
                  value={formData.carbonScope3}
                  onChange={handleInputChange}
                  placeholder="Value chain emissions"
                />
              </div>
              <div className="form-group">
                <label>Renewable Energy Use (%)</label>
                <input
                  type="number"
                  name="renewableEnergyPercent"
                  value={formData.renewableEnergyPercent}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  placeholder="0-100"
                />
              </div>
              <div className="form-group">
                <label>Water Usage per Unit (Liters)</label>
                <input
                  type="number"
                  name="waterUsagePerUnit"
                  value={formData.waterUsagePerUnit}
                  onChange={handleInputChange}
                  placeholder="Liters used in production"
                />
              </div>
              <div className="form-group">
                <label>Waste Reduction (%)</label>
                <input
                  type="number"
                  name="wasteReductionPercent"
                  value={formData.wasteReductionPercent}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  placeholder="0-100"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <h3>📦 Materials & Packaging</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Recycled Content (%)</label>
                <input
                  type="number"
                  name="recycledContentPercent"
                  value={formData.recycledContentPercent}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  placeholder="0-100"
                />
              </div>
              <div className="form-group">
                <label>Bio-based Content (%)</label>
                <input
                  type="number"
                  name="bioBasedContentPercent"
                  value={formData.bioBasedContentPercent}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  placeholder="0-100"
                />
              </div>
              <div className="form-group">
                <label>Toxic Substances</label>
                <select
                  name="toxicSubstances"
                  value={formData.toxicSubstances}
                  onChange={handleInputChange}
                >
                  <option value="none">None</option>
                  <option value="minimal">Minimal (&lt; 1%)</option>
                  <option value="low">Low (1-5%)</option>
                  <option value="moderate">Moderate (5-10%)</option>
                  <option value="high">High (&gt; 10%)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Packaging Weight (grams)</label>
                <input
                  type="number"
                  name="packagingWeight"
                  value={formData.packagingWeight}
                  onChange={handleInputChange}
                  placeholder="Total packaging weight"
                />
              </div>
              <div className="form-group">
                <label>Packaging Recyclable</label>
                <select
                  name="packagingRecyclable"
                  value={formData.packagingRecyclable}
                  onChange={handleInputChange}
                >
                  <option value="">Select Option</option>
                  <option value="yes">Yes, fully recyclable</option>
                  <option value="partial">Partially recyclable</option>
                  <option value="no">Not recyclable</option>
                </select>
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="plasticFreePackaging"
                    checked={formData.plasticFreePackaging}
                    onChange={handleInputChange}
                  />
                  Plastic-Free Packaging
                </label>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <h3>🚚 Supply Chain & Operations</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Supply Chain Transparency</label>
                <select
                  name="supplyChainTransparency"
                  value={formData.supplyChainTransparency}
                  onChange={handleInputChange}
                >
                  <option value="">Select Level</option>
                  <option value="full">Full transparency</option>
                  <option value="partial">Partial transparency</option>
                  <option value="limited">Limited transparency</option>
                  <option value="none">No transparency</option>
                </select>
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="localSourcing"
                    checked={formData.localSourcing}
                    onChange={handleInputChange}
                  />
                  Local Sourcing (within 500 miles)
                </label>
              </div>
              <div className="form-group">
                <label>Transportation Efficiency</label>
                <select
                  name="transportationEfficiency"
                  value={formData.transportationEfficiency}
                  onChange={handleInputChange}
                >
                  <option value="">Select Level</option>
                  <option value="excellent">Excellent (electric/hybrid fleet)</option>
                  <option value="good">Good (optimized routes)</option>
                  <option value="standard">Standard</option>
                  <option value="poor">Needs improvement</option>
                </select>
              </div>
              
              {/* Group Buying Options */}
              <div className="form-group full-width">
                <h4>📊 Group Buying Options (Optional)</h4>
                <div className="checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="groupBuyingEnabled"
                      checked={formData.groupBuyingEnabled}
                      onChange={handleInputChange}
                    />
                    Enable Group Buying for this product
                  </label>
                  <small>Allow customers to get discounts by buying in groups</small>
                </div>
              </div>
              
              {formData.groupBuyingEnabled && (
                <div className="form-group">
                  <label>Minimum Quantity for Group Buying</label>
                  <input
                    type="number"
                    name="groupBuyingMinQuantity"
                    value={formData.groupBuyingMinQuantity}
                    onChange={handleInputChange}
                    min="2"
                    placeholder="e.g., 5"
                  />
                  <small>Minimum number of items needed to start a group buy</small>
                </div>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="step-content">
            <h3>🔄 Product Lifecycle</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Expected Lifespan (years) *</label>
                <input
                  type="number"
                  name="expectedLifespan"
                  value={formData.expectedLifespan}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="Expected product lifespan"
                />
              </div>
              <div className="form-group">
                <label>Repairability</label>
                <select
                  name="repairability"
                  value={formData.repairability}
                  onChange={handleInputChange}
                >
                  <option value="">Select Option</option>
                  <option value="excellent">Excellent - User repairable</option>
                  <option value="good">Good - Professional repair available</option>
                  <option value="fair">Fair - Limited repair options</option>
                  <option value="poor">Poor - Not repairable</option>
                </select>
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="takeBackProgram"
                    checked={formData.takeBackProgram}
                    onChange={handleInputChange}
                  />
                  Take-back Program Available
                </label>
              </div>
              <div className="form-group full-width">
                <label>Disposal Guidance</label>
                <textarea
                  name="disposalGuidance"
                  value={formData.disposalGuidance}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Provide instructions for proper disposal or recycling..."
                />
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="step-content">
            <h3>🏆 Certifications</h3>
            <div className="certifications-grid">
              {[
                'Energy Star', 'EPEAT Gold', 'Cradle to Cradle', 'Forest Stewardship Council (FSC)',
                'Fair Trade Certified', 'USDA Organic', 'Green Seal', 'UL Environment',
                'Carbon Trust', 'B Corporation', 'ISO 14001', 'LEED Certified',
                'Rainforest Alliance', 'EcoLogo', 'GREENGUARD', 'Other'
              ].map((cert, index) => (
                <div key={index} className="certification-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.certifications.includes(cert)}
                      onChange={(e) => handleCertificationChange(cert, e.target.checked)}
                    />
                    {cert}
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return <div>Invalid step</div>;
    }
  };

  const ecoTier = getEcoTier();

  return (
    <div className="ecosphere-partner-hub">
      {/* Header */}
      <div className="partner-header">
        <h1>🌿 EcoSphere Partner Hub</h1>
        <p>Join our mission to revolutionize sustainable commerce</p>
        
        {/* Mode Toggle */}
        <div className="mode-toggle">
          <button 
            className={mode === 'simplified' ? 'active' : ''}
            onClick={() => setMode('simplified')}
          >
            📋 Simplified Form ({4} steps)
          </button>
          <button 
            className={mode === 'advanced' ? 'active' : ''}
            onClick={() => setMode('advanced')}
          >
            🔬 Advanced Form ({6} steps)
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
        <span className="progress-text">Step {currentStep} of {totalSteps}</span>
      </div>

      {/* EcoScore Estimator */}
      <div className="eco-score-estimator">
        <div className="score-display">
          <span className="tier-badge" style={{ backgroundColor: ecoTier.color }}>
            {ecoTier.tier}
          </span>
          <span className="completion-rate">
            Form Completion: {calculateFormCompletion()}%
          </span>
        </div>
      </div>

      {/* Form Content */}
      <form className="partner-form" onSubmit={currentStep === totalSteps ? submitProduct : nextStep}>
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="form-navigation">
          {currentStep > 1 && (
            <button type="button" onClick={prevStep} className="btn-secondary">
              ← Previous
            </button>
          )}
          
          {currentStep < totalSteps ? (
            <button type="submit" className="btn-primary">
              Next →
            </button>
          ) : (
            <button 
              type="submit" 
              className={`btn-submit ${isSubmitting ? 'submitting' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? '🔄 Submitting...' : '🚀 Submit for AI Analysis & Review'}
            </button>
          )}
        </div>
      </form>

      {/* Submission Status */}
      {submitStatus && (
        <div className={`submission-status ${submitStatus}`}>
          {submitStatus === 'submitting' && '🔄 Analyzing your product with AI...'}
          {submitStatus === 'success' && '✅ Product submitted successfully!'}
          {submitStatus === 'error' && '❌ Submission failed. Please try again.'}
        </div>
      )}

      {/* Footer Info */}
      <div className="partner-footer">
        <h3>🎯 What happens next?</h3>
        <div className="process-steps">
          <div className="process-step">
            <span className="step-number">1</span>
            <div>
              <h4>AI Analysis</h4>
              <p>Our advanced AI calculates your product's EcoScore and environmental impact</p>
            </div>
          </div>
          <div className="process-step">
            <span className="step-number">2</span>
            <div>
              <h4>Expert Review</h4>
              <p>Sustainability experts verify AI calculations and product claims</p>
            </div>
          </div>
          <div className="process-step">
            <span className="step-number">3</span>
            <div>
              <h4>Launch</h4>
              <p>Your product goes live on EcoSphere with verified impact metrics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EcoSpherePartnerHub;
