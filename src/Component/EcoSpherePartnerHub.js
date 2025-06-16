import React, { useState, useEffect } from "react";
import "./EcoSpherePartnerHub.css";
import { Link } from "react-router-dom";

function EcoSpherePartnerHub() {
  const [currentStep, setCurrentStep] = useState(1);
  const [mode, setMode] = useState('simplified'); // 'simplified' or 'advanced'
  const [ecoScore, setEcoScore] = useState(0);
  const [formData, setFormData] = useState({
    // Basic Information
    companyName: "",
    productName: "",
    productCategory: "",
    productDescription: "",
    
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
    
    // Social Responsibility
    fairLaborCertified: false,
    communityImpact: "",
    supplyChainTransparency: "",
    workerSafetyPrograms: false,
    
    // Product Lifecycle
    expectedLifespan: "",
    repairability: "",
    takeBackProgram: false,
    disposalGuidance: "",
    
    // Certifications
    certifications: [],
    certificationFiles: []
  });

  const totalSteps = mode === 'simplified' ? 4 : 6;

  // Calculate EcoScore in real-time
  useEffect(() => {
    calculateEcoScore();
  }, [formData]);

  const calculateEcoScore = () => {
    let score = 0;
    
    // Carbon Impact (25 points)
    if (formData.renewableEnergyPercent) {
      score += Math.min(25, (parseInt(formData.renewableEnergyPercent) / 100) * 25);
    }
    
    // Materials (20 points)
    if (formData.recycledContentPercent) {
      score += Math.min(15, (parseInt(formData.recycledContentPercent) / 100) * 15);
    }
    if (formData.bioBasedContentPercent) {
      score += Math.min(10, (parseInt(formData.bioBasedContentPercent) / 100) * 10);
    }
    
    // Packaging (15 points)
    if (formData.plasticFreePackaging) score += 10;
    if (formData.packagingRecyclable === 'yes') score += 5;
    
    // Social (15 points)
    if (formData.fairLaborCertified) score += 8;
    if (formData.workerSafetyPrograms) score += 7;
    
    // Lifecycle (15 points)
    if (formData.takeBackProgram) score += 8;
    if (formData.expectedLifespan && parseInt(formData.expectedLifespan) > 5) score += 7;
    
    // Certifications (10 points)
    score += Math.min(10, formData.certifications.length * 2);
    
    setEcoScore(Math.round(score));
  };

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
  };  const nextStep = (e) => {
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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    
    // Add a small delay to ensure user sees the submit button was clicked
    setTimeout(() => {
      window.location.href = "/submitted";
    }, 100);
  };

  const getEcoTier = (score) => {
    if (score >= 90) return { tier: "🌟 EcoChampion", color: "#006400" };
    if (score >= 75) return { tier: "🌿 EcoPioneer", color: "#228B22" };
    if (score >= 60) return { tier: "🌱 EcoSelect", color: "#32CD32" };
    if (score >= 45) return { tier: "♻️ EcoAware", color: "#FFD700" };
    if (score >= 30) return { tier: "🌍 EcoEntry", color: "#FF8C00" };
    return { tier: "⚠️ Standard", color: "#FF0000" };
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
              </div>
              <div className="form-group full-width">
                <label>Product Description *</label>
                <textarea
                  name="productDescription"
                  value={formData.productDescription}
                  onChange={handleInputChange}
                  rows="3"
                  required
                />
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
        );

      case 4:
        return (
          <div className="step-content">
            <h3>👥 Social Responsibility</h3>
            <div className="form-grid">
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="fairLaborCertified"
                    checked={formData.fairLaborCertified}
                    onChange={handleInputChange}
                  />
                  Fair Labor Certified
                </label>
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="workerSafetyPrograms"
                    checked={formData.workerSafetyPrograms}
                    onChange={handleInputChange}
                  />
                  Worker Safety Programs in Place
                </label>
              </div>
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
              <div className="form-group full-width">
                <label>Community Impact Description</label>
                <textarea
                  name="communityImpact"
                  value={formData.communityImpact}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Describe how your product/company benefits local communities..."
                />
              </div>
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

  const { tier, color } = getEcoTier(ecoScore);

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

      {/* Real-time EcoScore */}
      <div className="ecoscore-display">
        <div className="ecoscore-card">
          <div className="ecoscore-value" style={{ color }}>
            {ecoScore}/100
          </div>
          <div className="ecoscore-tier" style={{ color }}>
            {tier}
          </div>
          <div className="ecoscore-label">Real-time EcoScore</div>
        </div>
        
        {/* Impact Preview */}
        <div className="impact-preview">
          <h4>Projected Environmental Benefits:</h4>
          <div className="benefits-grid">
            <div className="benefit-item">
              <span className="benefit-icon">🌱</span>
              <span>CO2 Reduction: {Math.round(ecoScore * 0.8)}kg/year</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">💧</span>
              <span>Water Savings: {Math.round(ecoScore * 12)}L/year</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">♻️</span>
              <span>Waste Prevention: {Math.round(ecoScore * 0.3)}kg/year</span>
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
              <button type="submit" className="btn-submit">
                Submit for Review 🚀
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
