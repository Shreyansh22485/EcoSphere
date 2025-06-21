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
   * Generate comprehensive AI impact forecast with insights and recommendations
   */
  async generateImpactForecast(userProfile, recentActivity, timeframe = '12months') {
    try {
      const currentPoints = userProfile.impactPoints || 0;
      const carbonSaved = userProfile.totalCarbonSaved || 0;
      const waterSaved = userProfile.totalWaterSaved || 0;
      const wastePrevented = userProfile.totalWastePrevented || 0;
      const currentTier = userProfile.userTier || 'Seedling';
      const orderCount = recentActivity.orderCount || 0;
      
      const prompt = `
        As an AI environmental impact analyst for EcoSphere, generate a comprehensive forecast for a user with these current stats:
        
        Current Impact:
        - Impact Points: ${currentPoints}
        - Current Tier: ${currentTier}
        - Total CO2 Saved: ${carbonSaved} kg
        - Total Water Saved: ${waterSaved} liters
        - Total Waste Prevented: ${wastePrevented} kg
        
        Recent Activity (30 days):
        - Orders: ${orderCount}
        - Average EcoScore: ${recentActivity.avgEcoScore || 0}
        - Total Spent: $${recentActivity.totalSpent || 0}
        - Points Growth: ${recentActivity.recentPointsGrowth || 0}
        
        Tier System: Seedling (0+), Sprout (100+), Tree (500+), Forest (1500+), Planet Guardian (5000+)
        
        Generate a detailed forecast with insights and recommendations. Return ONLY valid JSON:
        
        {
          "forecast": {
            "next30Days": {
              "expectedPoints": number,
              "expectedCarbon": number,
              "expectedWater": number,
              "expectedWaste": number,
              "confidence": number
            },
            "next12Months": {
              "expectedPoints": number,
              "expectedCarbon": number,
              "expectedWater": number,
              "expectedWaste": number,
              "expectedTier": "string",
              "confidence": number
            },
            "nextMilestone": {
              "tierName": "string",
              "pointsNeeded": number,
              "estimatedDays": number,
              "rewards": ["array of reward strings"]
            }
          },
          "insights": {
            "currentTrend": "improving/stable/declining",
            "strongestArea": "carbon/water/waste",
            "improvementArea": "carbon/water/waste",
            "personalizedTip": "specific actionable advice",
            "impactComparison": "comparison to average user",
            "motivationalMessage": "encouraging message"
          },
          "recommendations": [
            {
              "type": "product/habit/goal",
              "title": "recommendation title",
              "description": "detailed description",
              "expectedImpact": "impact description",
              "priority": "high/medium/low"
            }
          ],
          "achievements": {
            "nearbyBadges": [
              {
                "name": "badge name",
                "description": "badge description",
                "requirement": "requirement text",
                "progress": number (0-100)
              }
            ]
          }
        }
        
        Make realistic projections based on current patterns. Be motivational but accurate.
        Consider seasonal trends and user engagement level for predictions.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        // Clean and parse AI response
        const cleanedText = text.replace(/```json\s*|\s*```/g, '').trim();
        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          const forecastData = JSON.parse(jsonMatch[0]);
          
          // Add metadata
          forecastData.metadata = {
            generatedAt: new Date(),
            userId: userProfile._id,
            basedOnOrders: orderCount,
            currentTier: currentTier,
            forecastMethod: 'gemini_ai'
          };
          
          return forecastData;
        }
      } catch (parseError) {
        console.warn('Could not parse AI forecast, using fallback calculations');
      }
      
      // Fallback calculation if AI parsing fails
      return this.generateFallbackForecast(userProfile, recentActivity);
      
    } catch (error) {
      console.error('Error generating AI impact forecast:', error);
      return this.generateFallbackForecast(userProfile, recentActivity);
    }
  }

  /**
   * Generate fallback forecast when AI fails
   */
  generateFallbackForecast(userProfile, recentActivity) {
    const currentPoints = userProfile.impactPoints || 0;
    const carbonSaved = userProfile.totalCarbonSaved || 0;
    const waterSaved = userProfile.totalWaterSaved || 0;
    const wastePrevented = userProfile.totalWastePrevented || 0;
    const currentTier = userProfile.userTier || 'Seedling';
    const orderCount = recentActivity?.orderCount || 0;
    
    // Calculate growth projections
    const monthlyGrowth = Math.max(currentPoints * 0.15, orderCount > 0 ? 75 : 25);
    const next30DaysPoints = Math.round(monthlyGrowth);
    const next12MonthsPoints = Math.round(monthlyGrowth * 12);
    
    // Determine next tier and points needed
    const tierThresholds = { 
      'Seedling': 100, 
      'Sprout': 500, 
      'Tree': 1500, 
      'Forest': 5000 
    };
    
    let nextTier = 'Planet Guardian';
    let pointsNeeded = 0;
    
    for (const [tier, threshold] of Object.entries(tierThresholds)) {
      if (currentPoints < threshold) {
        nextTier = tier;
        pointsNeeded = threshold - currentPoints;
        break;
      }
    }
    
    const estimatedDays = pointsNeeded > 0 ? Math.round(pointsNeeded / (monthlyGrowth / 30)) : 0;
    
    return {
      forecast: {
        next30Days: {
          expectedPoints: next30DaysPoints,
          expectedCarbon: Math.round(carbonSaved * 0.2 + 2),
          expectedWater: Math.round(waterSaved * 0.15 + 10),
          expectedWaste: Math.round(wastePrevented * 0.25 + 1),
          confidence: orderCount > 2 ? 75 : 60
        },
        next12Months: {
          expectedPoints: next12MonthsPoints,
          expectedCarbon: Math.round(carbonSaved * 2.5 + 25),
          expectedWater: Math.round(waterSaved * 2.0 + 120),
          expectedWaste: Math.round(wastePrevented * 3.0 + 15),
          expectedTier: currentPoints + next12MonthsPoints >= 5000 ? 'Planet Guardian' : nextTier,
          confidence: orderCount > 2 ? 80 : 65
        },
        nextMilestone: {
          tierName: nextTier,
          pointsNeeded: pointsNeeded,
          estimatedDays: estimatedDays,
          rewards: this.getTierRewards(nextTier)
        }
      },
      insights: {
        currentTrend: orderCount > 1 ? 'improving' : currentPoints > 50 ? 'stable' : 'starting',
        strongestArea: carbonSaved > waterSaved ? 'carbon' : waterSaved > wastePrevented ? 'water' : 'waste',
        improvementArea: carbonSaved < 5 ? 'carbon' : waterSaved < 50 ? 'water' : 'waste',
        personalizedTip: this.getPersonalizedTip(userProfile, recentActivity),
        impactComparison: this.getImpactComparison(currentPoints),
        motivationalMessage: this.getMotivationalMessage(currentTier, orderCount)
      },
      recommendations: this.getRecommendations(userProfile, recentActivity),
      achievements: {
        nearbyBadges: this.getNearbyBadges(userProfile)
      },
      metadata: {
        generatedAt: new Date(),
        userId: userProfile._id,
        basedOnOrders: orderCount,
        currentTier: currentTier,
        forecastMethod: 'fallback'
      }
    };
  }

  getTierRewards(tierName) {
    const rewards = {
      'Sprout': ['5% Eco Discount', 'First Steps Badge', 'Beta Feature Access'],
      'Tree': ['10% Eco Discount', 'Carbon Saver Badge', 'Premium Product Preview'],
      'Forest': ['15% Eco Discount', 'Eco Expert Network', 'Green Conference Invite'],
      'Planet Guardian': ['20% Eco Discount', 'Guardian Status', 'Exclusive Events']
    };
    return rewards[tierName] || ['Achievement Unlocked'];
  }

  getPersonalizedTip(userProfile, recentActivity) {
    const tips = [
      'Try water-saving products to boost your environmental impact!',
      'Consider carbon-reducing products for your next purchase.',
      'Explore waste-prevention items to maximize your eco-score.',
      'Join group buys for extra impact points and better prices!',
      'Regular eco-friendly purchases build consistent impact over time.'
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  }

  getImpactComparison(currentPoints) {
    if (currentPoints >= 1000) return 'You\'re in the top 10% of eco-conscious users!';
    if (currentPoints >= 500) return 'You\'re above average in environmental impact!';
    if (currentPoints >= 100) return 'You\'re making solid progress on your eco journey!';
    return 'Great start! Every sustainable choice makes a difference.';
  }

  getMotivationalMessage(currentTier, orderCount) {
    if (orderCount === 0) return 'Ready to start your sustainability journey? Your first eco-purchase awaits!';
    if (currentTier === 'Planet Guardian') return 'Amazing work! You\'re a true environmental champion!';
    return 'Keep up the fantastic work! Every purchase brings positive change.';
  }

  getRecommendations(userProfile, recentActivity) {
    const recs = [];
    
    if ((userProfile.totalWaterSaved || 0) < 50) {
      recs.push({
        type: 'product',
        title: 'Water-Saving Products',
        description: 'Explore products that help conserve water resources',
        expectedImpact: '+30 impact points, 25L water saved',
        priority: 'high'
      });
    }
    
    if ((recentActivity?.orderCount || 0) === 0) {
      recs.push({
        type: 'habit',
        title: 'Start Your Eco Journey',
        description: 'Make your first sustainable purchase this week',
        expectedImpact: '+50 impact points, tier progress',
        priority: 'high'
      });
    }
    
    recs.push({
      type: 'goal',
      title: 'Monthly Impact Goal',
      description: 'Aim for 100 additional impact points this month',
      expectedImpact: 'Tier advancement, new rewards',
      priority: 'medium'
    });
    
    return recs;
  }

  getNearbyBadges(userProfile) {
    const badges = [];
    
    const waterSaved = userProfile.totalWaterSaved || 0;
    if (waterSaved < 100) {
      badges.push({
        name: 'Water Guardian',
        description: 'Save 100 liters of water',
        requirement: '100L water saved',
        progress: Math.min(waterSaved, 100)
      });
    }
    
    const carbonSaved = userProfile.totalCarbonSaved || 0;
    if (carbonSaved < 10) {
      badges.push({
        name: 'Carbon Saver',
        description: 'Prevent 10kg of CO2 emissions',
        requirement: '10kg CO2 saved',
        progress: Math.min(carbonSaved * 10, 100)
      });
    }
    
    return badges;
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
        
        IMPORTANT: Analyze the product description carefully for sustainability keywords and claims:
        - Look for materials mentioned (bamboo, organic, recycled, etc.)
        - Identify sustainability certifications mentioned
        - Note any environmental benefits claimed
        - Consider durability and lifecycle claims
        - Evaluate any eco-friendly manufacturing processes mentioned
        - Account for sustainability mission statements or values
        
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
        ${productData.certifications?.map(cert => `- ${cert}`).join('\n') || 'None provided'}        Please provide:
        1. Overall EcoScore (0-1000 scale) with detailed breakdown:
           - Carbon Impact (0-300 points) - Based on carbon footprint reduction, renewable energy use
           - Materials Impact (0-250 points) - Recycled content, bio-based materials, sustainable sourcing
           - Packaging Impact (0-200 points) - Plastic-free, recyclable, minimal packaging
           - Lifecycle Impact (0-200 points) - Durability, repairability, end-of-life management
           - Certifications Bonus (0-50 points) - Third-party sustainability certifications
        
        SCORING GUIDELINES - Be precise and differentiate clearly:
        
        Carbon Impact (0-300):
        - 250-300: 80%+ renewable energy, carbon negative/neutral, Scope 1+2+3 all tracked
        - 200-249: 60-79% renewable energy, significant emission reductions
        - 150-199: 40-59% renewable energy, moderate improvements
        - 100-149: 20-39% renewable energy, basic improvements
        - 50-99: <20% renewable energy, minimal improvements
        - 0-49: No renewable energy data, conventional carbon footprint
        
        Materials Impact (0-250):
        - 200-250: 80%+ recycled/bio-based content, zero toxic substances
        - 150-199: 60-79% sustainable content, minimal toxics
        - 100-149: 40-59% sustainable content, low toxics
        - 50-99: 20-39% sustainable content, moderate toxics
        - 0-49: <20% sustainable content, high/unknown toxics
        
        Packaging Impact (0-200):
        - 180-200: 100% plastic-free, minimal weight, fully recyclable/compostable
        - 140-179: Mostly plastic-free, low weight, mostly recyclable
        - 100-139: Some plastic reduction, moderate weight
        - 60-99: Limited improvements, some recyclability
        - 0-59: Conventional packaging, high waste
        
        Lifecycle Impact (0-200):
        - 180-200: 10+ year lifespan, excellent repairability, take-back program
        - 140-179: 5-10 year lifespan, good repairability, some end-of-life support
        - 100-139: 3-5 year lifespan, fair repairability
        - 60-99: 1-3 year lifespan, limited repairability
        - 0-59: <1 year lifespan, not repairable, no disposal guidance
        
        Certifications (0-50):
        - 40-50: 3+ verified major certifications (Energy Star, FSC, Cradle2Cradle, etc.)
        - 30-39: 2 verified certifications
        - 20-29: 1 verified certification
        - 10-19: Pending/unverified certifications
        - 0-9: No certifications
        
        2. Environmental Impact Insights (provide realistic estimates even with limited data):
           - CO2 Reduced: kg CO2 saved vs conventional alternative (estimate based on category averages if specific data unavailable)
           - Water Saved: liters saved in production/use (use industry benchmarks for estimates)
           - Waste Prevented: kg waste prevented from landfill (calculate from recyclable content and packaging)
           - Ocean Plastic Diverted: equivalent bottles diverted (if applicable to product category)
           - Tree Equivalent: trees saved equivalent (based on renewable/recycled materials)          FEW-SHOT EXAMPLES FOR REFERENCE:
        
        Example 1 - Premium Eco Product (High Score):
        Bamboo Laptop Stand: Description mentions "100% sustainable bamboo, carbon-neutral production, plastic-free packaging, lifetime warranty"
        Data: 90% renewable energy, 95% bamboo content, plastic-free packaging, 15-year lifespan, FSC certified
        Score: 850 (Carbon: 270, Materials: 240, Packaging: 190, Lifecycle: 180, Certifications: 40)
        
        Example 2 - Good Eco Product (Medium-High Score):
        Recycled Steel Water Bottle: Description: "Made from 80% recycled steel, BPA-free, designed to last 10+ years, eliminates single-use bottles"
        Data: 60% renewable energy, 80% recycled steel, recyclable packaging, 10-year lifespan, 1 certification
        Score: 620 (Carbon: 180, Materials: 200, Packaging: 120, Lifecycle: 160, Certifications: 20)
        
        Example 3 - Basic Eco Product (Medium Score):
        Organic Cotton T-shirt: Description: "GOTS certified organic cotton, ethically made, natural dyes, biodegradable"
        Data: 30% renewable energy, 70% organic cotton, minimal packaging improvements, 3-year lifespan, GOTS certified
        Score: 450 (Carbon: 90, Materials: 175, Packaging: 80, Lifecycle: 100, Certifications: 25)
        
        Example 4 - Entry-Level Eco Product (Low-Medium Score):
        Recycled Paper Notebook: Description: "Made from 50% recycled paper, supporting forest conservation"
        Data: 20% renewable energy, 50% recycled paper, conventional packaging, 1-year use, no certifications
        Score: 280 (Carbon: 60, Materials: 125, Packaging: 40, Lifecycle: 50, Certifications: 0)
        
        Example 5 - Greenwashing Product (Low Score):
        "Eco-Friendly" Plastic Container: Description: "Eco-friendly design, green packaging" (vague claims, no specifics)
        Data: No renewable energy data, virgin plastic, non-recyclable packaging, 6-month lifespan, no certifications
        Score: 120 (Carbon: 20, Materials: 25, Packaging: 15, Lifecycle: 30, Certifications: 0)
        
        ANALYZE THE PROVIDED PRODUCT DATA and score accordingly. Don't default to ~700 - use the full range!
          CRITICAL SCORING INSTRUCTIONS:
        - PRIORITIZE DESCRIPTION ANALYSIS: Use the product description to infer missing data points
        - If description mentions "bamboo/organic/recycled" materials, score materials component higher
        - If description claims "carbon neutral/eco-friendly/sustainable", adjust carbon scoring
        - If description mentions durability/longevity, increase lifecycle scoring
        - If description includes certification names, factor into certifications component
        - If data is missing or unclear, score conservatively (lean towards lower scores)
        - Only give high scores (800+) for truly exceptional sustainability features
        - Medium scores (400-600) for products with some good sustainability features
        - Low scores (100-300) for conventional products with minimal eco features
        - Consider the product category - a reusable product should score higher than single-use
        
        DESCRIPTION-BASED SCORING ADJUSTMENTS:
        - Keywords like "sustainable", "eco-friendly", "green": +50-100 points if backed by data
        - Material keywords like "bamboo", "organic", "recycled": +50-150 points in materials
        - Durability claims like "lifetime", "durable", "long-lasting": +50-100 points in lifecycle
        - Certifications mentioned in description: +20-40 points in certifications
        - Packaging claims like "plastic-free", "minimal packaging": +50-100 points in packaging
        - Be skeptical of vague claims without supporting data - don't overscore greenwashing
        
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
  }  /**
   * Fallback EcoScore calculation if AI fails
   */
  calculateFallbackEcoScore(productData) {
    let score = 0;
    
    // Analyze product description for sustainability keywords
    const description = (productData.productDescription || '').toLowerCase();
    const sustainabilityKeywords = {
      materials: ['bamboo', 'organic', 'recycled', 'biodegradable', 'sustainable', 'natural', 'eco-friendly', 'renewable'],
      carbon: ['carbon neutral', 'carbon negative', 'low carbon', 'renewable energy', 'solar powered', 'clean energy'],
      packaging: ['plastic-free', 'minimal packaging', 'recyclable', 'compostable', 'zero waste'],
      lifecycle: ['durable', 'long-lasting', 'lifetime', 'repairable', 'warranty', 'take-back'],
      certifications: ['certified', 'fsc', 'gots', 'energy star', 'cradle to cradle', 'fair trade']
    };
    
    // Carbon Impact (0-300) - More granular scoring
    const renewablePercent = parseInt(productData.renewableEnergyPercent) || 0;
    let carbonScore = 0;
    if (renewablePercent >= 80) carbonScore = 270;
    else if (renewablePercent >= 60) carbonScore = 200;
    else if (renewablePercent >= 40) carbonScore = 150;
    else if (renewablePercent >= 20) carbonScore = 100;
    else if (renewablePercent > 0) carbonScore = 50;
    else carbonScore = 20;
    
    // Boost carbon score based on description
    if (sustainabilityKeywords.carbon.some(keyword => description.includes(keyword))) {
      carbonScore += 50;
    }
    score += Math.min(300, carbonScore);
    
    // Materials (0-250) - More differentiated
    const recycledPercent = parseInt(productData.recycledContentPercent) || 0;
    const bioBasedPercent = parseInt(productData.bioBasedContentPercent) || 0;
    const totalSustainableContent = recycledPercent + bioBasedPercent;
    
    let materialsScore = 0;
    if (totalSustainableContent >= 80) materialsScore = 200;
    else if (totalSustainableContent >= 60) materialsScore = 150;
    else if (totalSustainableContent >= 40) materialsScore = 100;
    else if (totalSustainableContent >= 20) materialsScore = 50;
    else materialsScore = 20;
    
    // Adjust for toxic substances
    if (productData.toxicSubstances === 'none') materialsScore += 50;
    else if (productData.toxicSubstances === 'minimal') materialsScore += 25;
    
    // Boost materials score based on description
    const materialKeywordCount = sustainabilityKeywords.materials.filter(keyword => description.includes(keyword)).length;
    materialsScore += materialKeywordCount * 15;
    
    score += Math.min(250, materialsScore);
    
    // Packaging (0-200) - More precise
    let packagingScore = 0;
    if (productData.plasticFreePackaging) packagingScore += 100;
    if (productData.packagingRecyclable === 'yes') packagingScore += 50;
    else if (productData.packagingRecyclable === 'partial') packagingScore += 25;
    
    // Penalize heavy packaging
    const weight = parseFloat(productData.packagingWeight) || 0;
    if (weight > 0 && weight < 50) packagingScore += 50;
    else if (weight >= 50 && weight < 200) packagingScore += 25;
    
    // Boost packaging score based on description
    if (sustainabilityKeywords.packaging.some(keyword => description.includes(keyword))) {
      packagingScore += 40;
    }
    
    score += Math.min(200, packagingScore);
    
    // Lifecycle (0-200) - More nuanced
    let lifecycleScore = 0;
    const lifespan = parseInt(productData.expectedLifespan) || 0;
    if (lifespan >= 10) lifecycleScore += 100;
    else if (lifespan >= 5) lifecycleScore += 75;
    else if (lifespan >= 3) lifecycleScore += 50;
    else if (lifespan >= 1) lifecycleScore += 25;
    
    if (productData.takeBackProgram) lifecycleScore += 50;
    if (productData.repairability === 'excellent') lifecycleScore += 50;
    else if (productData.repairability === 'good') lifecycleScore += 25;
    
    // Boost lifecycle score based on description
    if (sustainabilityKeywords.lifecycle.some(keyword => description.includes(keyword))) {
      lifecycleScore += 30;
    }
    
    score += Math.min(200, lifecycleScore);
    
    // Certifications (0-50) - More conservative
    const certCount = productData.certifications?.length || 0;
    let certScore = 0;
    if (certCount >= 3) certScore = 40;
    else if (certCount >= 2) certScore = 30;
    else if (certCount >= 1) certScore = 20;
    
    // Boost certification score based on description
    if (sustainabilityKeywords.certifications.some(keyword => description.includes(keyword))) {
      certScore += 10;
    }
    
    score += Math.min(50, certScore);
    
    // Ensure we don't exceed 1000 or fall below reasonable minimums
    score = Math.min(1000, Math.max(50, score));
    
    const finalCarbonScore = Math.min(300, carbonScore);
    const finalMaterialsScore = Math.min(250, materialsScore);
    const finalPackagingScore = Math.min(200, packagingScore);
    const finalLifecycleScore = Math.min(200, lifecycleScore);
    const finalCertScore = Math.min(50, certScore);
    
    return {
      overallScore: Math.round(score),
      components: {
        carbon: finalCarbonScore,
        materials: finalMaterialsScore,
        packaging: finalPackagingScore,
        lifecycle: finalLifecycleScore,
        certifications: finalCertScore
      },
      insights: {
        carbonReduced: { value: Math.round(score * 0.015), description: "Estimated CO2 reduction vs conventional product based on sustainability features and description analysis" },
        waterSaved: { value: Math.round(score * 0.4), description: "Estimated water savings through sustainable production methods" },
        wastePrevented: { value: Math.round(score * 0.005), description: "Estimated waste prevented through recyclable materials and packaging" },
        oceanPlasticDiverted: { value: Math.round(score * 0.03), description: "Equivalent bottles diverted through sustainable packaging choices" },
        treeEquivalent: { value: Math.round(score * 0.001 * 10) / 10, description: "Tree equivalent saved through renewable and recycled materials" },
        summary: `Environmental benefits estimated from product features and description analysis (Score: ${Math.round(score)}/1000)`,
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

  /**
   * Generate interactive quiz about sustainability topics with impact points
   */
  async generateSustainabilityQuiz(topic, difficulty = 'medium', questionCount = 5) {
    try {
      const prompt = `
        As a sustainability education expert for EcoSphere, create an interactive quiz about: ${topic}
        
        Quiz Parameters:
        - Difficulty: ${difficulty}
        - Number of questions: ${questionCount}
        - Platform: EcoSphere marketplace
        
        Create a quiz that includes:
        1. ${questionCount} multiple choice questions (4 options each)
        2. Questions should test understanding of ${topic}
        3. Include explanations for correct answers
        4. Mix of factual and application-based questions
        5. Impact points for correct answers (5-15 points based on difficulty)
        
        Format as JSON with:
        {
          "title": "Quiz title",
          "description": "Brief description",
          "totalPossiblePoints": number,
          "questions": [
            {
              "id": 1,
              "question": "Question text",
              "options": ["A", "B", "C", "D"],
              "correctAnswer": 0,
              "explanation": "Why this is correct",
              "points": number,
              "difficulty": "easy/medium/hard"
            }
          ],
          "completionBonus": number
        }
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
        console.warn('Could not parse quiz as JSON, returning fallback quiz');
        return this.generateFallbackQuiz(topic, difficulty, questionCount);
      }
      
      return this.generateFallbackQuiz(topic, difficulty, questionCount);
    } catch (error) {
      console.error('Error generating quiz:', error);
      return this.generateFallbackQuiz(topic, difficulty, questionCount);
    }
  }

  /**
   * Generate fallback quiz when AI fails
   */
  generateFallbackQuiz(topic, difficulty = 'medium', questionCount = 5) {
    const questions = [
      {
        id: 1,
        question: "What is the main goal of sustainable living?",
        options: [
          "To reduce environmental impact while meeting current needs",
          "To eliminate all modern conveniences",
          "To live completely off-grid",
          "To only buy expensive products"
        ],
        correctAnswer: 0,
        explanation: "Sustainable living aims to reduce environmental impact while still meeting our current needs without compromising future generations.",
        points: 10,
        difficulty: "easy"
      },
      {
        id: 2,
        question: "Which of these materials has the lowest environmental impact?",
        options: [
          "Virgin plastic",
          "Recycled aluminum",
          "New steel",
          "Virgin paper"
        ],
        correctAnswer: 1,
        explanation: "Recycled aluminum requires 95% less energy to produce compared to virgin aluminum, making it extremely eco-friendly.",
        points: 15,
        difficulty: "medium"
      },
      {
        id: 3,
        question: "What does 'circular economy' mean?",
        options: [
          "Making round products only",
          "Recycling everything",
          "Designing out waste and keeping materials in use",
          "Using only renewable energy"
        ],
        correctAnswer: 2,
        explanation: "A circular economy aims to eliminate waste by designing products for reuse, recycling, and regeneration.",
        points: 20,
        difficulty: "hard"
      },
      {
        id: 4,
        question: "Which action saves the most water in daily life?",
        options: [
          "Taking shorter showers",
          "Fixing leaky faucets",
          "Using a dishwasher efficiently",
          "All of the above"
        ],
        correctAnswer: 3,
        explanation: "All these actions contribute significantly to water conservation, with combined impact being greater than individual actions.",
        points: 10,
        difficulty: "easy"
      },
      {
        id: 5,
        question: "What is carbon footprint?",
        options: [
          "The size of your feet",
          "Total greenhouse gas emissions from activities",
          "Only CO2 emissions from cars",
          "Emissions from factories only"
        ],
        correctAnswer: 1,
        explanation: "Carbon footprint refers to the total amount of greenhouse gases produced directly and indirectly by human activities.",
        points: 15,
        difficulty: "medium"
      }
    ];

    const selectedQuestions = questions.slice(0, questionCount);
    const totalPoints = selectedQuestions.reduce((sum, q) => sum + q.points, 0);

    return {
      title: `${topic} Sustainability Quiz`,
      description: `Test your knowledge about ${topic} and earn impact points!`,
      totalPossiblePoints: totalPoints + 25,
      questions: selectedQuestions,
      completionBonus: 25
    };
  }
}

module.exports = new GeminiAIService();
