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
  // Build query - include both active and pending_review products for testing
  let query = { status: { $in: ['active', 'pending_review'] } };
  
  if (category) query.category = category;
  if (minEcoScore) query['ecoScore.overall'] = { ...query['ecoScore.overall'], $gte: parseInt(minEcoScore) };
  if (maxEcoScore) query['ecoScore.overall'] = { ...query['ecoScore.overall'], $lte: parseInt(maxEcoScore) };
  if (minPrice) query.price = { ...query.price, $gte: parseFloat(minPrice) };
  if (maxPrice) query.price = { ...query.price, $lte: parseFloat(maxPrice) };  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const products = await Product.find(query)
    .populate('partner', 'companyName') // Only populate companyName
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
    .populate('partner', 'companyName'); // Only populate companyName

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
  const uploadedFiles = req.files; // Multer uploaded files
  
  try {
    // Step 1: Process uploaded images
    console.log('📸 Processing uploaded images...');
    let images = [];
    if (uploadedFiles && uploadedFiles.length > 0) {
      images = uploadedFiles.map((file, index) => ({
        url: file.path, // Cloudinary URL
        alt: `${productFormData.productName} - Image ${index + 1}`,
        isPrimary: index === 0 // First image is primary
      }));
      console.log(`✅ Processed ${images.length} images`);
    }
    
    // Step 2: Calculate EcoScore and generate AI insights
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
    }    // Step 3: Create product with AI-generated data
    console.log('📦 Creating product in database...');
    const product = await Product.create({
      name: productFormData.productName,
      description: productFormData.productDescription,
      price: parseFloat(productFormData.price) || 0,
      category: productFormData.productCategory,
      images: images, // Add uploaded images
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
      
      // Group buying configuration
      groupBuying: {
        enabled: productFormData.groupBuyingEnabled === 'true' || 
                productFormData.groupBuyingEnabled === true,
        minQuantity: parseInt(productFormData.groupBuyingMinQuantity) || 1,
        discountTiers: productFormData.groupBuyingDiscountTiers || [],
        currentGroupSize: 0
      },
      
      status: 'pending_review',
      inventory: {
        stock: 0, // Will be updated when approved
        lowStockThreshold: 10
      }
    });// Step 4: Update Partner's total impact generated
    console.log('📊 Updating partner impact metrics...');
    const productImpact = ecoScoreData.insights;
    
    // Calculate impact points based on EcoScore (1 point per 10 EcoScore points)
    const impactPoints = Math.floor(ecoScoreData.overallScore / 10);
    
    // Check if group buying is enabled for this product
    const isGroupBuyingEnabled = productFormData.groupBuyingEnabled === 'true' || 
                                productFormData.groupBuyingEnabled === true;
    
    // Update partner metrics
    const partnerUpdate = {
      $inc: {
        'totalImpactGenerated.carbonSaved': productImpact.carbonReduced?.value || 0,
        'totalImpactGenerated.waterSaved': productImpact.waterSaved?.value || 0,
        'totalImpactGenerated.wastePrevented': productImpact.wastePrevented?.value || 0,
        'totalImpactGenerated.pointsAwarded': impactPoints,
        'metrics.totalProducts': 1
      }
    };
    
    // Only increment productsEnabled if group buying is enabled
    if (isGroupBuyingEnabled) {
      partnerUpdate.$inc['totalImpactGenerated.productsEnabled'] = 1;
    }
    
    await Partner.findByIdAndUpdate(partner._id, partnerUpdate);    console.log('✅ Product created successfully with EcoScore:', ecoScoreData.overallScore);
    console.log(`✅ Partner impact metrics updated - ${impactPoints} points awarded`);
    if (isGroupBuyingEnabled) {
      console.log('✅ Group buying enabled - productsEnabled count incremented');
    }

    res.status(201).json({
      success: true,
      message: 'Product submitted successfully for review',
      data: {
        product: {
          id: product._id,
          name: product.name,
          ecoScore: product.ecoScore.overall,
          tier: product.ecoScore.tier,
          impactPoints: impactPoints,
          status: product.status
        },
        partner: {
          id: partner._id,
          name: partner.companyName,
          totalImpact: {
            carbonSaved: (partner.totalImpactGenerated.carbonSaved || 0) + (productImpact.carbonReduced?.value || 0),
            waterSaved: (partner.totalImpactGenerated.waterSaved || 0) + (productImpact.waterSaved?.value || 0),
            wastePrevented: (partner.totalImpactGenerated.wastePrevented || 0) + (productImpact.wastePrevented?.value || 0),
            productsEnabled: (partner.totalImpactGenerated.productsEnabled || 0) + 1,
            pointsAwarded: (partner.totalImpactGenerated.pointsAwarded || 0) + impactPoints
          }
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

  let searchQuery = { status: { $in: ['active', 'pending_review'] } };
  
  // Text search
  if (query) {
    searchQuery.$text = { $search: query };
  }
  
  // Filters
  if (category) searchQuery.category = category;
  if (minEcoScore) searchQuery['ecoScore.overall'] = { $gte: parseInt(minEcoScore) };
  if (maxPrice) searchQuery.price = { $lte: parseFloat(maxPrice) };
  const products = await Product.find(searchQuery)
    .populate('partner', 'companyName')
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