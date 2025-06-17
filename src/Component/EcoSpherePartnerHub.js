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

  // Remove the real-time EcoScore calculation
  // EcoScore will now be calculated by AI on the backend

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
    
    // Update the productImages state
    setProductImages(files);
    
    // Create preview URLs
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
    e.preventDefault(); // Prevent form submission
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = (e) => {
    e.preventDefault(); // Prevent form submission
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      console.log('🚀 Submitting product to EcoSphere API...');
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'certifications' && Array.isArray(formData[key])) {
          formData[key].forEach(cert => {
            formDataToSend.append('certifications[]', cert);
          });
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Add product images
      productImages.forEach((image, index) => {
        formDataToSend.append('productImages', image);
      });
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/products`, {
        method: 'POST',
        body: formDataToSend // Don't set Content-Type header - let browser set it for FormData
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Product submitted successfully:', result);
        setSubmitStatus('success');
        
        // Show success message with AI-generated EcoScore
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
    // Show estimated tier based on form completion
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
      if (typeof value === 'boolean') return true; // Booleans always count as filled
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
                  <option value="home-kitchen">Home & Kitchen</option>
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing & Accessories</option>
                  <option value="health-beauty">Health & Beauty</option>
                  <option value="sports-outdoors">Sports & Outdoors</option>
                  <option value="toys-games">Toys & Games</option>
                  <option value="other">Other</option>
                </select>
              </div>              <div className="form-group full-width">
                <label>Product Description *</label>
                <textarea
                  name="productDescription"
                  value={formData.productDescription}
                  onChange={handleInputChange}
                  rows="3"
                  required
                />
              </div>
              <div className="form-group">
                <label>Price ($) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="form-group full-width">
                <label>Product Images (Max 10)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="file-input"
                />
                <div className="image-preview-container">
                  {imagePreview.map((preview, index) => (
                    <div key={index} className="image-preview">
                      <img src={preview} alt={`Preview ${index + 1}`} />
                      <button 
                        type="button" 
                        className="remove-image"
                        onClick={() => removeImage(index)}
                      >
                        ×
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
            <h3>🌱 Environmental Impact</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Renewable Energy Usage (%) *</label>
                <input
                  type="number"
                  name="renewableEnergyPercent"
                  value={formData.renewableEnergyPercent}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  required
                />
                <small>Percentage of renewable energy used in production</small>
              </div>
              <div className="form-group">
                <label>Water Usage (Liters per unit)</label>
                <input
                  type="number"
                  name="waterUsagePerUnit"
                  value={formData.waterUsagePerUnit}
                  onChange={handleInputChange}
                  min="0"
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
                />
                <small>Compared to industry standard</small>
              </div>
              {mode === 'advanced' && (
                <>
                  <div className="form-group">
                    <label>Carbon Scope 1 (Direct Emissions - kg CO2e)</label>
                    <input
                      type="number"
                      name="carbonScope1"
                      value={formData.carbonScope1}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Carbon Scope 2 (Electricity - kg CO2e)</label>
                    <input
                      type="number"
                      name="carbonScope2"
                      value={formData.carbonScope2}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Carbon Scope 3 (Value Chain - kg CO2e)</label>
                    <input
                      type="number"
                      name="carbonScope3"
                      value={formData.carbonScope3}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <h3>📦 Materials & Packaging</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Recycled Content (%) *</label>
                <input
                  type="number"
                  name="recycledContentPercent"
                  value={formData.recycledContentPercent}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  required
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
                />
              </div>
              <div className="form-group">
                <label>Packaging Weight (grams)</label>
                <input
                  type="number"
                  name="packagingWeight"
                  value={formData.packagingWeight}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Packaging Recyclable? *</label>
                <select
                  name="packagingRecyclable"
                  value={formData.packagingRecyclable}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Option</option>
                  <option value="yes">Yes, 100% recyclable</option>
                  <option value="partially">Partially recyclable</option>
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
                  Plastic-free packaging
                </label>
              </div>
              <div className="form-group">
                <label>Toxic Substances</label>
                <select
                  name="toxicSubstances"
                  value={formData.toxicSubstances}
                  onChange={handleInputChange}
                >
                  <option value="none">None detected</option>
                  <option value="minimal">Minimal, within safe limits</option>
                  <option value="disclosed">Present but disclosed</option>
                  <option value="unknown">Unknown/Not tested</option>
                </select>
              </div>
            </div>
          </div>
        );      case 4:
        return (
          <div className="step-content">
            <h3>� Supply Chain & Operations</h3>
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
                  required
                />
              </div>
              <div className="form-group">
                <label>Repairability Score</label>
                <select
                  name="repairability"
                  value={formData.repairability}
                  onChange={handleInputChange}
                >
                  <option value="">Select Score</option>
                  <option value="excellent">Excellent (Easy to repair)</option>
                  <option value="good">Good (Moderately repairable)</option>
                  <option value="fair">Fair (Some repair possible)</option>
                  <option value="poor">Poor (Difficult to repair)</option>
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
                  Take-back/Return Program Available
                </label>
              </div>
              <div className="form-group full-width">
                <label>End-of-Life Disposal Guidance</label>
                <textarea
                  name="disposalGuidance"
                  value={formData.disposalGuidance}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Provide instructions for proper disposal/recycling..."
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
                'ISO 14001 (Environmental Management)',
                'Cradle to Cradle Certified',
                'Energy Star',
                'GREENGUARD Certified',
                'Forest Stewardship Council (FSC)',
                'EPEAT Registered',
                'B-Corp Certified',
                'Fair Trade Certified',
                'Organic Certification',
                'LEED Certified',
                'Carbon Neutral Certified',
                'Biodegradable Products Institute (BPI)'
              ].map(cert => (
                <label key={cert} className="certification-item">
                  <input
                    type="checkbox"
                    checked={formData.certifications.includes(cert)}
                    onChange={(e) => handleCertificationChange(cert, e.target.checked)}
                  />
                  {cert}
                </label>
              ))}
            </div>
            <div className="file-upload-section">
              <label>Upload Certification Documents</label>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.png,.doc,.docx"
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  certificationFiles: Array.from(e.target.files)
                }))}
              />
              <small>Accepted formats: PDF, JPG, PNG, DOC, DOCX</small>
            </div>
          </div>
        );

      default:
        return null;
    }
  };
  const { tier, color } = getEcoTier();
  const formCompletion = calculateFormCompletion();

  return (
    <div className="partner-hub">
      {/* Header */}
      <div className="hub-header">
        <div className="header-content">
          <h1>🤝 EcoSphere Partner Hub</h1>
          <p>Join the sustainable commerce revolution</p>
          
          {/* Mode Toggle */}
          <div className="mode-toggle">
            <button 
              className={mode === 'simplified' ? 'active' : ''}
              onClick={() => setMode('simplified')}
            >
              Simplified Mode
            </button>
            <button 
              className={mode === 'advanced' ? 'active' : ''}
              onClick={() => setMode('advanced')}
            >
              Advanced Mode
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
        <div className="progress-text">
          Step {currentStep} of {totalSteps}
        </div>
      </div>

      {/* Form Completion and EcoScore Preview */}
      <div className="ecoscore-display">
        <div className="ecoscore-card">
          <div className="ecoscore-value" style={{ color }}>
            {formCompletion}%
          </div>
          <div className="ecoscore-tier" style={{ color }}>
            {tier}
          </div>
          <div className="ecoscore-label">Form Completion</div>
          <div className="ecoscore-note">
            🤖 AI will calculate final EcoScore (0-1000) after submission
          </div>
        </div>
        
        {/* Impact Preview */}
        <div className="impact-preview">
          <h4>Expected AI Analysis:</h4>
          <div className="benefits-grid">
            <div className="benefit-item">
              <span className="benefit-icon">🌱</span>
              <span>CO2 Reduction Analysis</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">💧</span>
              <span>Water Savings Calculation</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">♻️</span>
              <span>Waste Prevention Assessment</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">🌊</span>
              <span>Ocean Impact Evaluation</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">🌳</span>
              <span>Tree Equivalent Calculation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          {renderStepContent()}
          
          {/* Navigation Buttons */}
          <div className="form-navigation">
            {currentStep > 1 && (
              <button type="button" onClick={prevStep} className="btn-secondary">
                ← Previous
              </button>
            )}
              {currentStep < totalSteps ? (
              <button type="button" onClick={nextStep} className="btn-primary">
                Next →
              </button>
            ) : (
              <button 
                type="submit" 
                className={`btn-submit ${isSubmitting ? 'submitting' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? '🤖 AI Analyzing...' : 'Submit for AI Analysis 🚀'}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Benefits Section */}
      <div className="benefits-section">
        <h3>🎯 EcoSphere Partner Benefits</h3>
        <div className="benefits-grid-large">
          <div className="benefit-card">
            <div className="benefit-icon-large">🌟</div>
            <h4>Premium Visibility</h4>
            <p>Featured placement in EcoSphere marketplace with sustainability badges</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon-large">📊</div>
            <h4>Impact Analytics</h4>
            <p>Detailed reports on your environmental impact and customer engagement</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon-large">👥</div>
            <h4>Community Access</h4>
            <p>Connect with eco-conscious customers and group buying opportunities</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon-large">🏆</div>
            <h4>Recognition Program</h4>
            <p>Earn sustainability awards and feature in our success stories</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EcoSpherePartnerHub;