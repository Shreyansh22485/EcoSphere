const Product = require('../models/Product');
const Partner = require('../models/Partner');
const geminiAI = require('../services/geminiAI');
const { asyncHandler } = require('../middleware/error');

/**
 * @desc    Get all products with filtering and sorting
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = asyncHandler(async (req, res) => {
  const {
    category,
    minEcoScore,
    maxEcoScore,
    minPrice,
    maxPrice,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 20
  } = req.query;

  // Build query
  let query = { status: 'active' };
  
  if (category) query.category = category;
  if (minEcoScore) query['ecoScore.overall'] = { ...query['ecoScore.overall'], $gte: parseInt(minEcoScore) };
  if (maxEcoScore) query['ecoScore.overall'] = { ...query['ecoScore.overall'], $lte: parseInt(maxEcoScore) };
  if (minPrice) query.price = { ...query.price, $gte: parseFloat(minPrice) };
  if (maxPrice) query.price = { ...query.price, $lte: parseFloat(maxPrice) };

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const products = await Product.find(query)
    .populate('partner', 'businessName sustainabilityRating')
    .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Product.countDocuments(query);

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: products
  });
});

/**
 * @desc    Get single product
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('partner', 'businessName sustainabilityRating location');

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  // Increment view count
  product.metrics.views += 1;
  await product.save();

  res.status(200).json({
    success: true,
    data: product
  });
});

/**
 * @desc    Create new product (Partner Hub submission)
 * @route   POST /api/products
 * @access  Public (for testing - should be protected later)
 */
const createProduct = asyncHandler(async (req, res) => {
  console.log('🔄 Processing new product submission...');
  
  const productFormData = req.body;
  
  try {
    // Step 1: Calculate EcoScore and generate AI insights
    console.log('🤖 Generating AI EcoScore and insights...');
    const aiAnalysis = await geminiAI.calculateProductEcoScore(productFormData);
    
    let ecoScoreData;
    if (aiAnalysis.success) {
      console.log('✅ AI analysis successful');
      ecoScoreData = aiAnalysis.data;
    } else {
      console.log('⚠️ AI analysis failed, using fallback:', aiAnalysis.error);
      ecoScoreData = aiAnalysis.fallback;
    }    // Step 2: Create partner if doesn't exist (simplified for now)
    let partner = await Partner.findOne({ 
      $or: [
        { companyName: productFormData.companyName },
        { email: productFormData.email }
      ]
    });

    if (!partner) {
      console.log('👥 Creating new partner...');
      partner = await Partner.create({
        companyName: productFormData.companyName,
        email: productFormData.email || `${productFormData.companyName.toLowerCase().replace(/\s+/g, '')}@example.com`,
        password: 'temppassword123', // Temporary password - partner should register properly
        businessInfo: {
          businessType: 'manufacturer',
          description: `Supplier of ${productFormData.productName}`,
          website: productFormData.website || ''
        },
        contactInfo: {
          phone: productFormData.phone || ''
        },
        sustainabilityProfile: {
          environmental: {
            carbonScope1: parseFloat(productFormData.carbonScope1) || 0,
            carbonScope2: parseFloat(productFormData.carbonScope2) || 0,
            carbonScope3: parseFloat(productFormData.carbonScope3) || 0,
            renewableEnergyPercent: parseInt(productFormData.renewableEnergyPercent) || 0,
            wasteReductionPercent: parseInt(productFormData.wasteReductionPercent) || 0
          },
          social: {
            fairLaborCertified: productFormData.fairLaborCertified || false,
            workerSafetyPrograms: productFormData.workerSafetyPrograms || false,
            supplyChainTransparency: productFormData.supplyChainTransparency || 'limited'
          }
        },
        certifications: (productFormData.certifications || []).map(cert => ({
          name: cert,
          issuedBy: 'Various',
          verificationStatus: 'pending'
        })),
        status: 'pending'
      });
    }

    // Step 3: Create product with AI-generated data
    console.log('📦 Creating product in database...');
    const product = await Product.create({
      name: productFormData.productName,
      description: productFormData.productDescription,
      price: parseFloat(productFormData.price) || 0,
      category: productFormData.productCategory,
      partner: partner._id,
      
      // AI-generated EcoScore data
      ecoScore: {
        overall: ecoScoreData.overallScore,
        tier: getEcoTier(ecoScoreData.overallScore),
        components: ecoScoreData.components,
        aiInsights: ecoScoreData.insights
      },
      
      // Sustainability data from form
      sustainability: {
        carbonFootprint: {
          scope1: parseFloat(productFormData.carbonScope1) || 0,
          scope2: parseFloat(productFormData.carbonScope2) || 0,
          scope3: parseFloat(productFormData.carbonScope3) || 0
        },
        waterUsage: parseFloat(productFormData.waterUsagePerUnit) || 0,
        materials: {
          recycledContent: parseInt(productFormData.recycledContentPercent) || 0,
          bioBasedContent: parseInt(productFormData.bioBasedContentPercent) || 0,
          toxicSubstances: productFormData.toxicSubstances || 'unknown'
        },
        packaging: {
          weight: parseFloat(productFormData.packagingWeight) || 0,
          recyclable: productFormData.packagingRecyclable || 'unknown',
          plasticFree: productFormData.plasticFreePackaging || false
        },
        lifecycle: {
          expectedLifespan: parseInt(productFormData.expectedLifespan) || 0,
          repairability: productFormData.repairability || 'fair',
          takeBackProgram: productFormData.takeBackProgram || false,
          disposalGuidance: productFormData.disposalGuidance || ''
        },
        social: {
          fairLabor: productFormData.fairLaborCertified || false,
          workerSafety: productFormData.workerSafetyPrograms || false,
          communityImpact: productFormData.communityImpact || '',
          supplyChainTransparency: productFormData.supplyChainTransparency || 'limited'
        }
      },
      
      // Certifications
      certifications: (productFormData.certifications || []).map(cert => ({
        name: cert,
        issuedBy: 'Various',
        verificationStatus: 'pending'
      })),
      
      status: 'pending_review',
      inventory: {
        stock: 0, // Will be updated when approved
        lowStockThreshold: 10
      }
    });

    console.log('✅ Product created successfully with EcoScore:', ecoScoreData.overallScore);

    res.status(201).json({
      success: true,
      message: 'Product submitted successfully for review',
      data: {
        product: {
          id: product._id,
          name: product.name,
          ecoScore: product.ecoScore.overall,
          tier: product.ecoScore.tier,
          impactPoints: product.impactPerPurchase.impactPoints,
          status: product.status
        },
        partner: {
          id: partner._id,
          name: partner.businessName
        },
        aiAnalysis: {
          success: aiAnalysis.success,
          confidence: ecoScoreData.insights.confidence,
          insights: ecoScoreData.insights
        }
      }
    });

  } catch (error) {
    console.error('❌ Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
});

/**
 * Helper function to determine EcoScore tier
 */
function getEcoTier(score) {
  if (score >= 900) return '🌟 EcoChampion';
  if (score >= 750) return '🌿 EcoPioneer';
  if (score >= 600) return '🌱 EcoSelect';
  if (score >= 450) return '♻️ EcoAware';
  if (score >= 300) return '🌍 EcoEntry';
  return '⚠️ Standard';
}

/**
 * @desc    Search products
 * @route   POST /api/products/search
 * @access  Public
 */
const searchProducts = asyncHandler(async (req, res) => {
  const { query, category, minEcoScore, maxPrice, limit = 20 } = req.body;

  let searchQuery = { status: 'active' };
  
  // Text search
  if (query) {
    searchQuery.$text = { $search: query };
  }
  
  // Filters
  if (category) searchQuery.category = category;
  if (minEcoScore) searchQuery['ecoScore.overall'] = { $gte: parseInt(minEcoScore) };
  if (maxPrice) searchQuery.price = { $lte: parseFloat(maxPrice) };

  const products = await Product.find(searchQuery)
    .populate('partner', 'businessName')
    .limit(parseInt(limit))
    .sort(query ? { score: { $meta: 'textScore' } } : { 'ecoScore.overall': -1 });

  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  searchProducts
};
