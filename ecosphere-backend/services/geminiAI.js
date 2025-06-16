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
        
        Social Responsibility:
        - Fair Labor Certified: ${partnerData.sustainabilityProfile?.social?.fairLaborCertified || false}
        - Worker Safety Programs: ${partnerData.sustainabilityProfile?.social?.workerSafetyPrograms || false}
        - Supply Chain Transparency: ${partnerData.sustainabilityProfile?.social?.supplyChainTransparency || 'None'}
        
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
    }
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
