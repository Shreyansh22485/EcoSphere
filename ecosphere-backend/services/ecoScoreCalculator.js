const geminiAI = require('./geminiAI');

class EcoScoreCalculator {
  /**
   * Calculate EcoScore for a product based on sustainability data
   */
  static calculateProductEcoScore(sustainabilityData) {
    let score = 0;
    
    // Carbon Impact (25 points max)
    if (sustainabilityData.carbonFootprint) {
      const totalCarbon = sustainabilityData.carbonFootprint.total || 0;
      // Lower carbon footprint = higher score
      if (totalCarbon <= 1) score += 25;
      else if (totalCarbon <= 5) score += 20;
      else if (totalCarbon <= 10) score += 15;
      else if (totalCarbon <= 20) score += 10;
      else score += 5;
    }
    
    // Materials (20 points max)
    if (sustainabilityData.materials) {
      const { recycledContent, bioBasedContent, renewableContent } = sustainabilityData.materials;
      score += Math.min(8, (recycledContent || 0) / 100 * 8);
      score += Math.min(6, (bioBasedContent || 0) / 100 * 6);
      score += Math.min(6, (renewableContent || 0) / 100 * 6);
      
      // Toxic substances penalty
      if (sustainabilityData.materials.toxicSubstances === 'none') score += 2;
      else if (sustainabilityData.materials.toxicSubstances === 'minimal') score += 1;
    }
    
    // Packaging (15 points max)
    if (sustainabilityData.packaging) {
      if (sustainabilityData.packaging.plasticFree) score += 6;
      if (sustainabilityData.packaging.biodegradable) score += 4;
      if (sustainabilityData.packaging.reusable) score += 3;
      if (sustainabilityData.packaging.recyclable === 'yes') score += 2;
    }
    
    // Social Responsibility (15 points max)
    if (sustainabilityData.social) {
      if (sustainabilityData.social.fairLabor) score += 5;
      if (sustainabilityData.social.workerSafety) score += 4;
      
      const transparency = sustainabilityData.social.supplyChainTransparency;
      if (transparency === 'full') score += 6;
      else if (transparency === 'partial') score += 3;
      else if (transparency === 'limited') score += 1;
    }
    
    // Lifecycle (15 points max)
    if (sustainabilityData.lifecycle) {
      const lifespan = sustainabilityData.lifecycle.expectedLifespan || 0;
      if (lifespan >= 10) score += 6;
      else if (lifespan >= 5) score += 4;
      else if (lifespan >= 2) score += 2;
      
      const repairability = sustainabilityData.lifecycle.repairability;
      if (repairability === 'excellent') score += 4;
      else if (repairability === 'good') score += 3;
      else if (repairability === 'fair') score += 1;
      
      if (sustainabilityData.lifecycle.takeBackProgram) score += 5;
    }
    
    // Certifications (10 points max)
    if (sustainabilityData.certifications) {
      const verifiedCerts = sustainabilityData.certifications.filter(
        cert => cert.verificationStatus === 'verified'
      ).length;
      score += Math.min(10, verifiedCerts * 2);
    }
    
    return Math.min(100, Math.round(score));
  }

  /**
   * Calculate Impact Points based on EcoScore and purchase amount
   */
  static calculateImpactPoints(ecoScore, purchaseAmount) {
    // Base points: 1 point per dollar spent
    let points = Math.round(purchaseAmount);
    
    // EcoScore multiplier (1.0 to 2.0)
    const ecoMultiplier = 1 + (ecoScore / 100);
    points = Math.round(points * ecoMultiplier);
    
    // Tier bonuses
    if (ecoScore >= 90) points = Math.round(points * 1.5); // EcoChampion
    else if (ecoScore >= 75) points = Math.round(points * 1.3); // EcoPioneer
    else if (ecoScore >= 60) points = Math.round(points * 1.2); // EcoSelect
    else if (ecoScore >= 45) points = Math.round(points * 1.1); // EcoAware
    
    return points;
  }

  /**
   * Calculate environmental impact savings compared to conventional alternatives
   */
  static calculateImpactSavings(ecoScore, category, productData = {}) {
    // Base impact factors by category (conventional alternatives)
    const conventionalImpact = {
      'home-kitchen': { carbon: 15, water: 200, waste: 2 },
      'electronics': { carbon: 50, water: 150, waste: 5 },
      'clothing': { carbon: 25, water: 2000, waste: 1 },
      'health-beauty': { carbon: 8, water: 100, waste: 0.5 },
      'sports-outdoors': { carbon: 20, water: 180, waste: 1.5 },
      'toys-games': { carbon: 12, water: 80, waste: 1 },
      'default': { carbon: 20, water: 200, waste: 1.5 }
    };

    const baseline = conventionalImpact[category] || conventionalImpact.default;
    
    // Calculate savings based on EcoScore (higher score = more savings)
    const savingsMultiplier = ecoScore / 100;
    
    return {
      carbonSaved: Math.round(baseline.carbon * savingsMultiplier * 100) / 100,
      waterSaved: Math.round(baseline.water * savingsMultiplier),
      wastePrevented: Math.round(baseline.waste * savingsMultiplier * 100) / 100
    };
  }

  /**
   * Get EcoTier based on score
   */
  static getEcoTier(score) {
    if (score >= 90) return { tier: 'EcoChampion', color: '#006400', icon: '🌟' };
    if (score >= 75) return { tier: 'EcoPioneer', color: '#228B22', icon: '🌿' };
    if (score >= 60) return { tier: 'EcoSelect', color: '#32CD32', icon: '🌱' };
    if (score >= 45) return { tier: 'EcoAware', color: '#FFD700', icon: '♻️' };
    if (score >= 30) return { tier: 'EcoEntry', color: '#FF8C00', icon: '🌍' };
    return { tier: 'Standard', color: '#FF0000', icon: '⚠️' };
  }

  /**
   * Use AI to validate and enhance EcoScore calculation
   */
  static async aiEnhancedEcoScore(productData, sustainabilityData) {
    try {
      // First calculate base score
      const baseScore = this.calculateProductEcoScore(sustainabilityData);
      
      // Use AI to analyze and potentially adjust the score
      const aiAnalysis = await geminiAI.analyzePartnerSustainability({
        companyName: productData.name,
        sustainabilityProfile: {
          environmental: sustainabilityData.carbonFootprint ? {
            renewableEnergyPercent: 50, // default assumption
            ...sustainabilityData
          } : {},
          social: sustainabilityData.social || {},
          materials: sustainabilityData.materials || {}
        },
        certifications: sustainabilityData.certifications || []
      });

      // Extract AI-suggested score if available
      let aiScore = baseScore;
      if (aiAnalysis.score && typeof aiAnalysis.score === 'number') {
        aiScore = Math.min(100, Math.max(0, aiAnalysis.score));
      }

      // Use weighted average: 70% calculated score, 30% AI score
      const finalScore = Math.round(baseScore * 0.7 + aiScore * 0.3);

      return {
        finalScore,
        baseScore,
        aiScore,
        aiInsights: aiAnalysis.analysis || aiAnalysis,
        tier: this.getEcoTier(finalScore),
        breakdown: {
          carbon: Math.min(25, baseScore * 0.25),
          materials: Math.min(20, baseScore * 0.20),
          packaging: Math.min(15, baseScore * 0.15),
          social: Math.min(15, baseScore * 0.15),
          lifecycle: Math.min(15, baseScore * 0.15),
          certifications: Math.min(10, baseScore * 0.10)
        }
      };
    } catch (error) {
      console.warn('AI enhancement failed, using base calculation:', error.message);
      return {
        finalScore: baseScore,
        baseScore,
        tier: this.getEcoTier(baseScore),
        aiInsights: null
      };
    }
  }

  /**
   * Calculate partner's overall sustainability score
   */
  static calculatePartnerEcoScore(partnerSustainabilityProfile) {
    let score = 0;
    const profile = partnerSustainabilityProfile;
    
    // Environmental factors (60% of total score)
    if (profile.environmental) {
      const env = profile.environmental;
      
      // Renewable energy (25 points)
      if (env.renewableEnergyPercent) {
        score += (env.renewableEnergyPercent / 100) * 25;
      }
      
      // Waste reduction (15 points)
      if (env.wasteReductionPercent) {
        score += (env.wasteReductionPercent / 100) * 15;
      }
      
      // Carbon management (10 points)
      if (env.carbonNeutralGoal?.hasGoal) {
        score += 5;
        if (env.carbonNeutralGoal.currentProgress) {
          score += (env.carbonNeutralGoal.currentProgress / 100) * 5;
        }
      }
      
      // Recycling program (5 points)
      if (env.recyclingProgram) score += 5;
    }
    
    // Social factors (25% of total score)
    if (profile.social) {
      const social = profile.social;
      
      if (social.fairLaborCertified) score += 6;
      if (social.workerSafetyPrograms) score += 5;
      
      switch (social.supplyChainTransparency) {
        case 'full': score += 6; break;
        case 'partial': score += 3; break;
        case 'limited': score += 1; break;
      }
      
      if (social.diversityAndInclusion?.hasProgram) score += 3;
      if (social.charitableGiving?.annualDonationPercent > 0) score += 2;
    }
    
    // Materials and packaging (15% of total score)
    if (profile.materials) {
      const materials = profile.materials;
      
      if (materials.recycledContentAvg) {
        score += (materials.recycledContentAvg / 100) * 8;
      }
      
      if (materials.sustainableSourcing) score += 4;
      
      if (materials.toxicSubstancePolicy === 'strict_avoidance') score += 3;
      else if (materials.toxicSubstancePolicy === 'limited_use') score += 1;
    }
    
    if (profile.packaging) {
      const packaging = profile.packaging;
      
      if (packaging.recyclablePackaging) {
        score += (packaging.recyclablePackaging / 100) * 3;
      }
      
      if (packaging.packagingReduction?.hasProgram) score += 2;
    }
    
    return Math.min(100, Math.round(score));
  }
}

module.exports = EcoScoreCalculator;
