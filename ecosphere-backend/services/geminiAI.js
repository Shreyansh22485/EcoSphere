const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiAIService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is required in environment variables');
    }
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash' 
    });
  }

  /**
   * Generate personalized product recommendations based on user preferences and sustainability goals
   */
  async generateProductRecommendations(userProfile, availableProducts, context = {}) {
    try {
      const prompt = `
        As an AI sustainability expert for EcoSphere, provide personalized eco-friendly product recommendations.
        
        User Profile:
        - Impact Points: ${userProfile.impactPoints || 0}
        - Eco Tier: ${userProfile.ecoTier || 'EcoEntry'}
        - Total Carbon Saved: ${userProfile.totalCarbonSaved || 0} kg CO2
        - Total Water Saved: ${userProfile.totalWaterSaved || 0} liters
        - Sustainability Goals: ${JSON.stringify(userProfile.preferences?.sustainabilityGoals || {})}
        - Previous Purchase Categories: ${context.previousCategories || 'None'}
        
        Available Products (top 10):
        ${availableProducts.map(product => `
        - ${product.name} (EcoScore: ${product.ecoScore.overall}/100, Price: $${product.price}, Category: ${product.category})
          Impact: ${product.impactPerPurchase.carbonSaved}kg CO2 saved, ${product.impactPerPurchase.waterSaved}L water saved
        `).join('')}
        
        Please recommend 3-5 products that best match the user's sustainability goals and tier level.
        Format as JSON array with: {productName, reason, sustainabilityBenefit, priorityScore}.
        Focus on products that will help them progress to the next eco tier.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Try to parse JSON from the response
      try {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.warn('Could not parse AI response as JSON, returning formatted text');
      }
      
      return { recommendations: text };
    } catch (error) {
      console.error('Error generating product recommendations:', error);
      throw new Error('Failed to generate recommendations');
    }
  }

  /**
   * Generate impact forecast based on user's current trends and potential purchases
   */
  async generateImpactForecast(userProfile, recentActivity, timeframe = '6months') {
    try {
      const prompt = `
        As an AI environmental analyst for EcoSphere, create an impact forecast for the user.
        
        User Current Impact:
        - Impact Points: ${userProfile.impactPoints || 0}
        - Carbon Saved: ${userProfile.totalCarbonSaved || 0} kg CO2
        - Water Saved: ${userProfile.totalWaterSaved || 0} liters
        - Waste Prevented: ${userProfile.totalWastePrevented || 0} kg
        - Current Tier: ${userProfile.ecoTier || 'EcoEntry'}
        
        Recent Activity (last 30 days):
        - Orders: ${recentActivity.orderCount || 0}
        - Average EcoScore: ${recentActivity.avgEcoScore || 0}
        - Spending: $${recentActivity.totalSpent || 0}
        
        Generate a ${timeframe} forecast including:
        1. Projected environmental impact if current trends continue
        2. Potential tier advancement timeline
        3. Suggested monthly targets for carbon, water, and waste reduction
        4. Key recommendations to accelerate impact
        
        Format as JSON with sections: projection, milestones, recommendations, insights.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.warn('Could not parse forecast as JSON, returning formatted text');
      }
      
      return { forecast: text };
    } catch (error) {
      console.error('Error generating impact forecast:', error);
      throw new Error('Failed to generate impact forecast');
    }
  }

  /**
   * Generate sustainability insights and tips based on user behavior
   */
  async generateSustainabilityInsights(userProfile, orderHistory, context = {}) {
    try {
      const prompt = `
        As a sustainability coach for EcoSphere, provide personalized insights and actionable tips.
        
        User Profile:
        - Tier: ${userProfile.ecoTier || 'EcoEntry'}
        - Total Impact Points: ${userProfile.impactPoints || 0}
        - Join Date: ${userProfile.createdAt || 'Recent'}
        
        Purchase Patterns:
        - Total Orders: ${orderHistory.length || 0}
        - Favorite Categories: ${context.topCategories || 'Various'}
        - Average Order EcoScore: ${context.avgEcoScore || 0}
        - Consistency: ${context.purchaseFrequency || 'Irregular'}
        
        Environmental Impact:
        - Carbon Footprint Reduction: ${userProfile.totalCarbonSaved || 0} kg CO2
        - Water Conservation: ${userProfile.totalWaterSaved || 0} liters
        - Waste Prevention: ${userProfile.totalWastePrevented || 0} kg
        
        Provide:
        1. Personalized sustainability tips (3-4 actionable items)
        2. Lifestyle improvement suggestions
        3. Next milestone targets
        4. Encouragement based on their progress
        
        Keep tone encouraging and practical. Format as JSON with: tips, nextMilestone, encouragement.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.warn('Could not parse insights as JSON, returning formatted text');
      }
      
      return { insights: text };
    } catch (error) {
      console.error('Error generating sustainability insights:', error);
      throw new Error('Failed to generate insights');
    }
  }

  /**
   * Analyze and score partner sustainability credentials
   */
  async analyzePartnerSustainability(partnerData) {
    try {
      const prompt = `
        As an AI sustainability auditor for EcoSphere, analyze this partner's sustainability profile and provide a detailed assessment.
        
        Partner: ${partnerData.companyName}
        Business Type: ${partnerData.businessInfo?.businessType || 'Unknown'}
        
        Environmental Profile:
        - Renewable Energy: ${partnerData.sustainabilityProfile?.environmental?.renewableEnergyPercent || 0}%
        - Waste Reduction: ${partnerData.sustainabilityProfile?.environmental?.wasteReductionPercent || 0}%
        - Carbon Scope 1: ${partnerData.sustainabilityProfile?.environmental?.carbonScope1 || 'Not provided'}
        - Carbon Scope 2: ${partnerData.sustainabilityProfile?.environmental?.carbonScope2 || 'Not provided'}
        - Carbon Scope 3: ${partnerData.sustainabilityProfile?.environmental?.carbonScope3 || 'Not provided'}
          Supply Chain & Operations:
        - Supply Chain Transparency: ${partnerData.sustainabilityProfile?.social?.supplyChainTransparency || 'None'}
        - Local Sourcing: ${partnerData.sustainabilityProfile?.operations?.localSourcing || 'Unknown'}
        - Transportation Efficiency: ${partnerData.sustainabilityProfile?.operations?.transportationEfficiency || 'Unknown'}
        
        Certifications: ${partnerData.certifications?.length || 0} certifications
        ${partnerData.certifications?.map(cert => `- ${cert.name}`).join('\n') || 'None listed'}
        
        Provide:
        1. Overall sustainability score (0-100)
        2. Strengths and improvement areas
        3. Verification recommendations
        4. Risk assessment
        5. Suggested tier placement
        
        Format as JSON with: score, strengths, improvements, recommendations, suggestedTier.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.warn('Could not parse partner analysis as JSON, returning formatted text');
      }
      
      return { analysis: text };
    } catch (error) {
      console.error('Error analyzing partner sustainability:', error);
      throw new Error('Failed to analyze partner sustainability');
    }
  }

  /**
   * Generate educational content about sustainability topics
   */
  async generateEducationalContent(topic, userLevel = 'beginner') {
    try {
      const prompt = `
        As an environmental education expert for EcoSphere, create engaging educational content about: ${topic}
        
        Target Audience Level: ${userLevel}
        Platform: EcoSphere marketplace
        
        Create content that includes:
        1. Clear explanation of the topic (appropriate for ${userLevel} level)
        2. Why it matters for environmental sustainability
        3. Practical actions users can take
        4. Connection to eco-friendly products
        5. Fun facts or statistics
        
        Keep it engaging, actionable, and under 500 words.
        Format as JSON with: title, content, actionItems, funFacts.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.warn('Could not parse educational content as JSON, returning formatted text');
      }
      
      return { content: text };
    } catch (error) {
      console.error('Error generating educational content:', error);
      throw new Error('Failed to generate educational content');
    }
  }

  /**
   * Generate comparison between eco-friendly and traditional product alternatives
   */
  async generateProductComparison(ecoProduct, traditionalAlternative = null) {
    try {
      const prompt = `
        As an AI product analyst for EcoSphere, create a detailed comparison highlighting the environmental benefits of eco-friendly products.
        
        Eco-Friendly Product:
        - Name: ${ecoProduct.name}
        - EcoScore: ${ecoProduct.ecoScore?.overall || 0}/100
        - Price: $${ecoProduct.price}
        - Carbon Impact: ${ecoProduct.impactPerPurchase?.carbonSaved || 0} kg CO2 saved
        - Water Impact: ${ecoProduct.impactPerPurchase?.waterSaved || 0} liters saved
        - Materials: ${ecoProduct.sustainability?.materials?.recycledContent || 0}% recycled content
        - Packaging: ${ecoProduct.sustainability?.packaging?.recyclable || 'Unknown'} recyclability
        
        ${traditionalAlternative ? `
        Traditional Alternative:
        - Name: ${traditionalAlternative.name}
        - Estimated Carbon Footprint: ${traditionalAlternative.estimatedCarbon || 'Higher'}
        - Price: $${traditionalAlternative.price || 'Unknown'}
        ` : 'Compare with typical conventional alternatives in the same category.'}
        
        Provide:
        1. Environmental impact comparison
        2. Long-term cost analysis
        3. Quality and durability comparison
        4. Health and safety benefits
        5. Overall recommendation score
        
        Format as JSON with: environmentalImpact, costAnalysis, qualityComparison, healthBenefits, recommendationScore.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.warn('Could not parse product comparison as JSON, returning formatted text');
      }
      
      return { comparison: text };
    } catch (error) {
      console.error('Error generating product comparison:', error);
      throw new Error('Failed to generate product comparison');
    }
  }

  /**
   * Generate collective impact messages for the community
   */
  async generateCollectiveImpactMessage(communityStats) {
    try {
      const prompt = `
        As the voice of EcoSphere's AI community assistant, create an inspiring message about the collective environmental impact.
        
        Community Statistics:
        - Total Users: ${communityStats.totalUsers || 0}
        - Total Carbon Saved: ${communityStats.totalCarbonSaved || 0} kg CO2
        - Total Water Saved: ${communityStats.totalWaterSaved || 0} liters
        - Total Waste Prevented: ${communityStats.totalWastePrevented || 0} kg
        - Total Orders: ${communityStats.totalOrders || 0}
        - Average EcoScore: ${communityStats.avgEcoScore || 0}
        - This Month's Growth: ${communityStats.monthlyGrowth || 0}% new users
        
        Create an inspiring, motivational message that:
        1. Celebrates the community's achievements
        2. Puts the impact in relatable terms (e.g., equivalent to X trees planted)
        3. Encourages continued participation
        4. Highlights growing momentum
        
        Keep it under 200 words, upbeat, and community-focused.
        Include relevant analogies (trees saved, cars off road, etc.).
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return { message: text.trim() };
    } catch (error) {      console.error('Error generating collective impact message:', error);
      throw new Error('Failed to generate collective impact message');
    }  }

  /**
   * Calculate EcoScore and generate environmental insights for a product
   */
  async calculateProductEcoScore(productData) {
    try {
      const prompt = `
        As an AI sustainability expert for EcoSphere, analyze this product and provide a comprehensive EcoScore and environmental impact assessment.
        
        Product Information:
        - Name: ${productData.companyName} - ${productData.productName}
        - Category: ${productData.productCategory}
        - Description: ${productData.productDescription}
        
        Environmental Data:
        - Carbon Scope 1: ${productData.carbonScope1 || 'Not provided'} kg CO2
        - Carbon Scope 2: ${productData.carbonScope2 || 'Not provided'} kg CO2  
        - Carbon Scope 3: ${productData.carbonScope3 || 'Not provided'} kg CO2
        - Renewable Energy: ${productData.renewableEnergyPercent || 0}%
        - Water Usage: ${productData.waterUsagePerUnit || 'Not provided'} L/unit
        - Waste Reduction: ${productData.wasteReductionPercent || 0}%
        
        Materials & Packaging:
        - Recycled Content: ${productData.recycledContentPercent || 0}%
        - Bio-based Content: ${productData.bioBasedContentPercent || 0}%
        - Toxic Substances: ${productData.toxicSubstances || 'unknown'}
        - Packaging Weight: ${productData.packagingWeight || 'Not provided'}g
        - Packaging Recyclable: ${productData.packagingRecyclable || 'unknown'}
        - Plastic-free Packaging: ${productData.plasticFreePackaging || false}
          Supply Chain:
        - Supply Chain Transparency: ${productData.supplyChainTransparency || 'unknown'}
        - Local Sourcing: ${productData.localSourcing || 'unknown'}
        - Transportation Method: ${productData.transportationMethod || 'unknown'}
        
        Product Lifecycle:
        - Expected Lifespan: ${productData.expectedLifespan || 'Not provided'} years
        - Repairability: ${productData.repairability || 'unknown'}
        - Take-back Program: ${productData.takeBackProgram || false}
        - Disposal Guidance: ${productData.disposalGuidance || 'Not provided'}
        
        Certifications: ${productData.certifications?.length || 0} certifications
        ${productData.certifications?.map(cert => `- ${cert}`).join('\n') || 'None provided'}
          Please provide:
        1. Overall EcoScore (0-1000 scale) with detailed breakdown:
           - Carbon Impact (0-300 points) - Based on carbon footprint reduction, renewable energy use
           - Materials Impact (0-250 points) - Recycled content, bio-based materials, sustainable sourcing
           - Packaging Impact (0-200 points) - Plastic-free, recyclable, minimal packaging
           - Lifecycle Impact (0-200 points) - Durability, repairability, end-of-life management
           - Certifications Bonus (0-50 points) - Third-party sustainability certifications
        
        2. Environmental Impact Insights (provide realistic estimates even with limited data):
           - CO2 Reduced: kg CO2 saved vs conventional alternative (estimate based on category averages if specific data unavailable)
           - Water Saved: liters saved in production/use (use industry benchmarks for estimates)
           - Waste Prevented: kg waste prevented from landfill (calculate from recyclable content and packaging)
           - Ocean Plastic Diverted: equivalent bottles diverted (if applicable to product category)
           - Tree Equivalent: trees saved equivalent (based on renewable/recycled materials)
        
        CRITICAL INSTRUCTION: Always provide realistic environmental impact estimates, even with limited data:
        
        FOR CARBON REDUCTION:
        - Estimate based on renewable energy use, efficient manufacturing, sustainable materials
        - Typical eco-friendly products save 2-15kg CO2 vs conventional alternatives
        - Use category-specific benchmarks (e.g., reusable products save more than single-use)
        
        FOR WATER SAVINGS:
        - Consider production efficiency, sustainable materials, product lifecycle
        - Eco-friendly products typically save 50-500 liters vs conventional alternatives
        - Factor in water-efficient manufacturing processes
        
        FOR WASTE PREVENTION:
        - Calculate from packaging reduction, durability improvements, recyclability
        - Sustainable products prevent 0.5-5kg waste typically
        - Consider end-of-life impact and circular economy benefits
        
        Never respond with "insufficient data" - always provide educated estimates based on industry standards and the sustainability features mentioned.
        
        3. Confidence score (0-1) based on data completeness
        4. One-liner describing the positive ecosystem impact when a user buys this product        Format response as JSON:
        {
          "overallScore": 750,
          "components": {
            "carbon": 220,
            "materials": 180,
            "packaging": 160,
            "lifecycle": 140,
            "certifications": 50
          },
          "insights": {
            "carbonReduced": {
              "value": 8.4,
              "description": "8.4kg CO2 saved vs conventional alternative through 60% renewable energy and efficient production methods"
            },
            "waterSaved": {
              "value": 234,
              "description": "234 liters saved through water-efficient manufacturing and sustainable material processing"
            },
            "wastePrevented": {
              "value": 2.1,
              "description": "2.1kg waste prevented through biodegradable materials, minimal packaging, and circular design"
            },
            "oceanPlasticDiverted": {
              "value": 12,
              "description": "Equivalent to 12 plastic bottles diverted through plastic-free packaging and sustainable alternatives"
            },
            "treeEquivalent": {
              "value": 0.3,
              "description": "0.3 tree equivalent saved through recycled materials and sustainable sourcing practices"
            },
            "summary": "Every purchase saves 8.4kg CO2, 234L water, and prevents 2.1kg waste - contributing to a healthier planet through sustainable choices",
            "confidence": 0.85
          }
        }
        
        EXAMPLE CALCULATIONS FOR GUIDANCE:
        - A reusable water bottle (vs single-use): ~15kg CO2, 300L water, 3kg waste saved annually
        - Bamboo utensils (vs plastic): ~5kg CO2, 100L water, 1kg waste saved
        - Organic cotton bag (vs plastic bags): ~10kg CO2, 200L water, 2kg waste saved annually
        - LED bulb (vs incandescent): ~25kg CO2, 50L water, 0.5kg waste saved over lifetime
        
        Scale your estimates appropriately based on the product category and sustainability features provided.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsedResponse = JSON.parse(jsonMatch[0]);
          return {
            success: true,
            data: parsedResponse
          };
        } else {
          throw new Error('No valid JSON found in response');
        }
      } catch (parseError) {
        console.error('Failed to parse EcoScore response:', parseError);
        // Return fallback calculation if AI parsing fails
        return {
          success: false,
          fallback: this.calculateFallbackEcoScore(productData),
          error: 'AI response parsing failed, using fallback calculation'
        };
      }
      
    } catch (error) {
      console.error('Error calculating EcoScore:', error);
      return {
        success: false,
        fallback: this.calculateFallbackEcoScore(productData),
        error: error.message
      };
    }
  }
  /**
   * Fallback EcoScore calculation if AI fails
   */
  calculateFallbackEcoScore(productData) {
    let score = 0;
    
    // Carbon Impact (0-300)
    const renewablePercent = parseInt(productData.renewableEnergyPercent) || 0;
    score += Math.min(300, (renewablePercent / 100) * 300);
    
    // Materials (0-250)
    const recycledPercent = parseInt(productData.recycledContentPercent) || 0;
    const bioBasedPercent = parseInt(productData.bioBasedContentPercent) || 0;
    score += Math.min(200, (recycledPercent / 100) * 200);
    score += Math.min(50, (bioBasedPercent / 100) * 50);
    
    // Packaging (0-200)
    if (productData.plasticFreePackaging) score += 150;
    if (productData.packagingRecyclable === 'yes') score += 50;
    
    // Lifecycle (0-200)
    if (productData.takeBackProgram) score += 100;
    const lifespan = parseInt(productData.expectedLifespan) || 0;
    if (lifespan > 5) score += 100;
    
    // Certifications (0-50)
    const certCount = productData.certifications?.length || 0;
    score += Math.min(50, certCount * 10);
    
    return {
      overallScore: Math.round(score),
      components: {
        carbon: Math.min(300, (renewablePercent / 100) * 300),
        materials: Math.min(250, (recycledPercent / 100) * 200 + (bioBasedPercent / 100) * 50),
        packaging: (productData.plasticFreePackaging ? 150 : 0) + (productData.packagingRecyclable === 'yes' ? 50 : 0),
        lifecycle: (productData.takeBackProgram ? 100 : 0) + (lifespan > 5 ? 100 : 0),
        certifications: Math.min(50, certCount * 10)
      },
      insights: {
        carbonReduced: { value: Math.round(score * 0.015), description: "Estimated CO2 reduction vs conventional product based on sustainability features" },
        waterSaved: { value: Math.round(score * 0.4), description: "Estimated water savings through sustainable production methods" },
        wastePrevented: { value: Math.round(score * 0.005), description: "Estimated waste prevented through recyclable materials and packaging" },
        oceanPlasticDiverted: { value: Math.round(score * 0.03), description: "Equivalent bottles diverted through sustainable packaging choices" },
        treeEquivalent: { value: Math.round(score * 0.001 * 10) / 10, description: "Tree equivalent saved through renewable and recycled materials" },
        summary: "Estimated environmental benefits based on sustainable product features",
        confidence: 0.7
      }
    };
  }

  /**
   * Debug method to test Gemini AI connection
   */
  async testConnection() {
    try {
      const startTime = Date.now();
      
      const prompt = `Hello! This is a test message to check if the Gemini AI connection is working properly. 
      Please respond with a JSON object containing:
      - status: "connected"
      - message: "Gemini AI is working correctly for EcoSphere!"
      - timestamp: current timestamp
      - model: the model name you are using
      
      Format your response as valid JSON only.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Try to parse JSON response
      let parsedResponse;
      try {
        // Extract JSON from response if it's wrapped in other text
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } else {
          // If no JSON found, create a response object
          parsedResponse = {
            status: "connected",
            message: "Raw response received",
            rawResponse: text.trim()
          };
        }
      } catch (parseError) {
        parsedResponse = {
          status: "connected",
          message: "Connection successful but response format unexpected",
          rawResponse: text.trim()
        };
      }

      return {
        success: true,
        connectionStatus: "active",
        responseTime: `${responseTime}ms`,
        apiKey: process.env.GEMINI_API_KEY ? "configured" : "missing",
        model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
        timestamp: new Date().toISOString(),
        geminiResponse: parsedResponse
      };
      
    } catch (error) {
      console.error('Gemini AI connection test failed:', error);
      return {
        success: false,
        connectionStatus: "failed",
        error: error.message,
        apiKey: process.env.GEMINI_API_KEY ? "configured" : "missing",
        model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
        timestamp: new Date().toISOString(),
        troubleshooting: {
          checkApiKey: "Verify GEMINI_API_KEY is set in .env file",
          checkModel: "Verify GEMINI_MODEL is correct",
          checkNetwork: "Ensure internet connection is available",
          checkQuota: "Verify Gemini API quota is not exceeded"
        }
      };
    }
  }
}

module.exports = new GeminiAIService();
