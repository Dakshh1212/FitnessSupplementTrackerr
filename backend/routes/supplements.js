const express = require('express');
const { Supplement, SupplementIntake, SupplementPlan, SupplementReview } = require('../models/Supplement');
const { protect, requireOnboarding } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all supplements
// @route   GET /api/supplements
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { 
      category, 
      brand, 
      priceRange, 
      targetGoals, 
      suitableFor, 
      search, 
      sortBy = 'rating',
      order = 'desc',
      page = 1, 
      limit = 20 
    } = req.query;
    
    let query = { isActive: true };
    
    // Filter by category
    if (category) {
      query.category = { $in: category.split(',') };
    }
    
    // Filter by brand
    if (brand) {
      query.brand = { $regex: brand, $options: 'i' };
    }
    
    // Filter by price range
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number);
      query.price = { $gte: min, $lte: max };
    }
    
    // Filter by target goals
    if (targetGoals) {
      query.targetGoals = { $in: targetGoals.split(',') };
    }
    
    // Filter by suitable for
    if (suitableFor) {
      query.suitableFor = { $in: suitableFor.split(',') };
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { benefits: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    let sortOptions = {};
    if (sortBy === 'price') {
      sortOptions.price = order === 'desc' ? -1 : 1;
    } else if (sortBy === 'rating') {
      sortOptions.rating = order === 'desc' ? -1 : 1;
    } else if (sortBy === 'name') {
      sortOptions.name = order === 'desc' ? -1 : 1;
    } else {
      sortOptions.createdAt = -1;
    }

    const supplements = await Supplement.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Supplement.countDocuments(query);

    // Get categories for filtering
    const categories = await Supplement.distinct('category', { isActive: true });
    const brands = await Supplement.distinct('brand', { isActive: true });

    res.status(200).json({
      success: true,
      count: supplements.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      filters: {
        categories,
        brands
      },
      data: supplements
    });
  } catch (error) {
    console.error('Get supplements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching supplements'
    });
  }
});

// @desc    Get supplement by ID
// @route   GET /api/supplements/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const supplement = await Supplement.findById(req.params.id);

    if (!supplement || !supplement.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Supplement not found'
      });
    }

    // Get reviews for this supplement
    const reviews = await SupplementReview.find({ 
      supplementId: req.params.id 
    })
    .populate('userId', 'name')
    .sort({ createdAt: -1 })
    .limit(10);

    // Get average rating
    const ratingStats = await SupplementReview.aggregate([
      { $match: { supplementId: supplement._id } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    let ratingData = {
      avgRating: 0,
      totalReviews: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };

    if (ratingStats.length > 0) {
      const stats = ratingStats[0];
      ratingData.avgRating = Math.round(stats.avgRating * 10) / 10;
      ratingData.totalReviews = stats.totalReviews;
      
      // Calculate rating distribution
      stats.ratingDistribution.forEach(rating => {
        ratingData.distribution[rating]++;
      });
    }

    res.status(200).json({
      success: true,
      data: {
        supplement,
        reviews,
        ratingData
      }
    });
  } catch (error) {
    console.error('Get supplement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching supplement'
    });
  }
});

// @desc    Get recommended supplements
// @route   GET /api/supplements/recommendations
// @access  Private
router.get('/recommendations/for-user', protect, requireOnboarding, async (req, res) => {
  try {
    const user = req.user;
    const { limit = 10 } = req.query;

    // Build recommendation query based on user profile
    let recommendationQuery = { isActive: true };
    
    // Filter by user's fitness goals
    if (user.fitnessGoals && user.fitnessGoals.length > 0) {
      recommendationQuery.targetGoals = { $in: user.fitnessGoals };
    }
    
    // Filter by user's gender and age
    let suitableFor = [];
    if (user.gender) suitableFor.push(user.gender.toLowerCase());
    if (user.age) {
      if (user.age < 25) suitableFor.push('young adults');
      else if (user.age < 40) suitableFor.push('adults');
      else suitableFor.push('mature adults');
    }
    
    if (suitableFor.length > 0) {
      recommendationQuery.suitableFor = { $in: suitableFor };
    }

    // Get user's current supplement intake to avoid duplicates
    const currentIntakes = await SupplementIntake.find({
      userId: user._id,
      date: {
        $gte: new Date(new Date().setDate(new Date().getDate() - 30))
      }
    }).distinct('supplementId');

    if (currentIntakes.length > 0) {
      recommendationQuery._id = { $nin: currentIntakes };
    }

    const recommendations = await Supplement.find(recommendationQuery)
      .sort({ rating: -1, price: 1 })
      .limit(parseInt(limit));

    // Get popular supplements as fallback
    const popular = await Supplement.find({ isActive: true })
      .sort({ rating: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        personalized: recommendations,
        popular: popular,
        criteria: {
          fitnessGoals: user.fitnessGoals,
          suitableFor: suitableFor
        }
      }
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching recommendations'
    });
  }
});

// @desc    Create supplement intake entry
// @route   POST /api/supplements/intake
// @access  Private
router.post('/intake', protect, requireOnboarding, async (req, res) => {
  try {
    const { supplementId, dosage, time, notes } = req.body;

    // Verify supplement exists
    const supplement = await Supplement.findById(supplementId);
    if (!supplement) {
      return res.status(404).json({
        success: false,
        message: 'Supplement not found'
      });
    }

    const intake = await SupplementIntake.create({
      userId: req.user.id,
      supplementId,
      dosage,
      time: new Date(time),
      notes
    });

    await intake.populate('supplementId', 'name category dosage');

    res.status(201).json({
      success: true,
      message: 'Supplement intake recorded successfully',
      data: intake
    });
  } catch (error) {
    console.error('Create supplement intake error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while recording supplement intake'
    });
  }
});

// @desc    Get user's supplement intake history
// @route   GET /api/supplements/intake
// @access  Private
router.get('/intake/history', protect, requireOnboarding, async (req, res) => {
  try {
    const { startDate, endDate, supplementId, page = 1, limit = 20 } = req.query;
    
    let query = { userId: req.user.id };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    if (supplementId) {
      query.supplementId = supplementId;
    }

    const intakes = await SupplementIntake.find(query)
      .populate('supplementId', 'name category brand dosage')
      .sort({ date: -1, time: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await SupplementIntake.countDocuments(query);

    // Get intake summary
    const summary = await SupplementIntake.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$supplementId',
          totalIntakes: { $sum: 1 },
          lastTaken: { $max: '$date' },
          avgDosage: { $avg: '$dosage' }
        }
      },
      {
        $lookup: {
          from: 'supplements',
          localField: '_id',
          foreignField: '_id',
          as: 'supplement'
        }
      },
      { $unwind: '$supplement' },
      {
        $project: {
          name: '$supplement.name',
          category: '$supplement.category',
          totalIntakes: 1,
          lastTaken: 1,
          avgDosage: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: intakes.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: intakes,
      summary
    });
  } catch (error) {
    console.error('Get supplement intake error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching supplement intake'
    });
  }
});

// @desc    Create supplement plan
// @route   POST /api/supplements/plans
// @access  Private
router.post('/plans', protect, requireOnboarding, async (req, res) => {
  try {
    const plan = await SupplementPlan.create({
      ...req.body,
      userId: req.user.id
    });

    await plan.populate('supplements.supplementId', 'name category dosage');

    res.status(201).json({
      success: true,
      message: 'Supplement plan created successfully',
      data: plan
    });
  } catch (error) {
    console.error('Create supplement plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating supplement plan'
    });
  }
});

// @desc    Get user's supplement plans
// @route   GET /api/supplements/plans
// @access  Private
router.get('/plans/user', protect, requireOnboarding, async (req, res) => {
  try {
    const plans = await SupplementPlan.find({ userId: req.user.id })
      .populate('supplements.supplementId', 'name category brand dosage price')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans
    });
  } catch (error) {
    console.error('Get supplement plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching supplement plans'
    });
  }
});

// @desc    Create supplement review
// @route   POST /api/supplements/:id/reviews
// @access  Private
router.post('/:id/reviews', protect, requireOnboarding, async (req, res) => {
  try {
    const { rating, review, pros, cons } = req.body;
    const supplementId = req.params.id;

    // Check if supplement exists
    const supplement = await Supplement.findById(supplementId);
    if (!supplement) {
      return res.status(404).json({
        success: false,
        message: 'Supplement not found'
      });
    }

    // Check if user already reviewed this supplement
    const existingReview = await SupplementReview.findOne({
      userId: req.user.id,
      supplementId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this supplement'
      });
    }

    const supplementReview = await SupplementReview.create({
      userId: req.user.id,
      supplementId,
      rating,
      review,
      pros: pros || [],
      cons: cons || []
    });

    await supplementReview.populate('userId', 'name');

    // Update supplement's average rating
    const ratingStats = await SupplementReview.aggregate([
      { $match: { supplementId: supplement._id } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    if (ratingStats.length > 0) {
      await Supplement.findByIdAndUpdate(supplementId, {
        rating: Math.round(ratingStats[0].avgRating * 10) / 10,
        reviewCount: ratingStats[0].totalReviews
      });
    }

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: supplementReview
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating review'
    });
  }
});

// @desc    Get supplement categories
// @route   GET /api/supplements/categories/list
// @access  Private
router.get('/categories/list', protect, async (req, res) => {
  try {
    const categories = await Supplement.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          avgRating: { $avg: '$rating' }
        }
      },
      {
        $project: {
          category: '$_id',
          count: 1,
          avgPrice: { $round: ['$avgPrice', 2] },
          avgRating: { $round: ['$avgRating', 1] }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories'
    });
  }
});

module.exports = router;