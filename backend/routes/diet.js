const express = require('express');
const { FoodItem, DietEntry, MealPlan, Reminder } = require('../models/Food');
const { protect, requireOnboarding } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all food items
// @route   GET /api/diet/foods
// @access  Private
router.get('/foods', protect, async (req, res) => {
  try {
    const { category, search, tags, page = 1, limit = 50 } = req.query;
    
    let query = {};
    
    if (category) query.category = category;
    if (tags) query.tags = { $in: tags.split(',') };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const foods = await FoodItem.find(query)
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await FoodItem.countDocuments(query);

    res.status(200).json({
      success: true,
      count: foods.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: foods
    });
  } catch (error) {
    console.error('Get foods error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching food items'
    });
  }
});

// @desc    Get food item by ID
// @route   GET /api/diet/foods/:id
// @access  Private
router.get('/foods/:id', protect, async (req, res) => {
  try {
    const food = await FoodItem.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: food
    });
  } catch (error) {
    console.error('Get food error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching food item'
    });
  }
});

// @desc    Create diet entry
// @route   POST /api/diet/entries
// @access  Private
router.post('/entries', protect, requireOnboarding, async (req, res) => {
  try {
    const { date, meals, waterIntake, notes } = req.body;

    // Check if entry already exists for this date
    const existingEntry = await DietEntry.findOne({
      userId: req.user.id,
      date: {
        $gte: new Date(date).setHours(0, 0, 0, 0),
        $lt: new Date(date).setHours(23, 59, 59, 999)
      }
    });

    if (existingEntry) {
      return res.status(400).json({
        success: false,
        message: 'Diet entry already exists for this date. Use PUT to update.'
      });
    }

    // Populate food nutrition data for calculations
    const populatedMeals = await Promise.all(
      meals.map(async (meal) => {
        const populatedFoods = await Promise.all(
          meal.foods.map(async (food) => {
            const foodItem = await FoodItem.findById(food.foodId);
            if (!foodItem) {
              throw new Error(`Food item not found: ${food.foodId}`);
            }
            
            // Calculate nutrition based on quantity
            const multiplier = food.quantity / 100; // assuming nutrition is per 100g
            
            return {
              ...food,
              calories: Math.round(foodItem.nutrition.calories * multiplier),
              protein: Math.round(foodItem.nutrition.protein * multiplier * 10) / 10,
              carbs: Math.round(foodItem.nutrition.carbs * multiplier * 10) / 10,
              fat: Math.round(foodItem.nutrition.fat * multiplier * 10) / 10
            };
          })
        );
        
        return {
          ...meal,
          foods: populatedFoods
        };
      })
    );

    const dietEntry = await DietEntry.create({
      userId: req.user.id,
      date: new Date(date),
      meals: populatedMeals,
      waterIntake: waterIntake || 0,
      notes
    });

    await dietEntry.populate('meals.foods.foodId');

    res.status(201).json({
      success: true,
      message: 'Diet entry created successfully',
      data: dietEntry
    });
  } catch (error) {
    console.error('Create diet entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating diet entry'
    });
  }
});

// @desc    Get user's diet entries
// @route   GET /api/diet/entries
// @access  Private
router.get('/entries', protect, requireOnboarding, async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 10 } = req.query;
    
    let query = { userId: req.user.id };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const entries = await DietEntry.find(query)
      .populate('meals.foods.foodId')
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await DietEntry.countDocuments(query);

    res.status(200).json({
      success: true,
      count: entries.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: entries
    });
  } catch (error) {
    console.error('Get diet entries error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching diet entries'
    });
  }
});

// @desc    Get diet entry by date
// @route   GET /api/diet/entries/:date
// @access  Private
router.get('/entries/:date', protect, requireOnboarding, async (req, res) => {
  try {
    const date = new Date(req.params.date);
    
    const entry = await DietEntry.findOne({
      userId: req.user.id,
      date: {
        $gte: new Date(date).setHours(0, 0, 0, 0),
        $lt: new Date(date).setHours(23, 59, 59, 999)
      }
    }).populate('meals.foods.foodId');

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'No diet entry found for this date'
      });
    }

    res.status(200).json({
      success: true,
      data: entry
    });
  } catch (error) {
    console.error('Get diet entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching diet entry'
    });
  }
});

// @desc    Update diet entry
// @route   PUT /api/diet/entries/:id
// @access  Private
router.put('/entries/:id', protect, requireOnboarding, async (req, res) => {
  try {
    const { meals, waterIntake, notes } = req.body;

    // Populate food nutrition data for calculations if meals are being updated
    let updateData = { waterIntake, notes };
    
    if (meals) {
      const populatedMeals = await Promise.all(
        meals.map(async (meal) => {
          const populatedFoods = await Promise.all(
            meal.foods.map(async (food) => {
              const foodItem = await FoodItem.findById(food.foodId);
              if (!foodItem) {
                throw new Error(`Food item not found: ${food.foodId}`);
              }
              
              const multiplier = food.quantity / 100;
              
              return {
                ...food,
                calories: Math.round(foodItem.nutrition.calories * multiplier),
                protein: Math.round(foodItem.nutrition.protein * multiplier * 10) / 10,
                carbs: Math.round(foodItem.nutrition.carbs * multiplier * 10) / 10,
                fat: Math.round(foodItem.nutrition.fat * multiplier * 10) / 10
              };
            })
          );
          
          return {
            ...meal,
            foods: populatedFoods
          };
        })
      );
      
      updateData.meals = populatedMeals;
    }

    const entry = await DietEntry.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updateData,
      { new: true, runValidators: true }
    ).populate('meals.foods.foodId');

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Diet entry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Diet entry updated successfully',
      data: entry
    });
  } catch (error) {
    console.error('Update diet entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating diet entry'
    });
  }
});

// @desc    Add meal to today's diet entry
// @route   POST /api/diet/meals
// @access  Private
router.post('/meals', protect, requireOnboarding, async (req, res) => {
  try {
    const { mealType, time, foods } = req.body;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Populate food nutrition data
    const populatedFoods = await Promise.all(
      foods.map(async (food) => {
        const foodItem = await FoodItem.findById(food.foodId);
        if (!foodItem) {
          throw new Error(`Food item not found: ${food.foodId}`);
        }
        
        const multiplier = food.quantity / 100;
        
        return {
          ...food,
          calories: Math.round(foodItem.nutrition.calories * multiplier),
          protein: Math.round(foodItem.nutrition.protein * multiplier * 10) / 10,
          carbs: Math.round(foodItem.nutrition.carbs * multiplier * 10) / 10,
          fat: Math.round(foodItem.nutrition.fat * multiplier * 10) / 10
        };
      })
    );

    const newMeal = {
      mealType,
      time: new Date(time),
      foods: populatedFoods
    };

    // Find or create today's diet entry
    let entry = await DietEntry.findOne({
      userId: req.user.id,
      date: { $gte: today, $lte: endOfDay }
    });

    if (!entry) {
      entry = await DietEntry.create({
        userId: req.user.id,
        date: today,
        meals: [newMeal],
        waterIntake: 0
      });
    } else {
      entry.meals.push(newMeal);
      await entry.save();
    }

    await entry.populate('meals.foods.foodId');

    res.status(200).json({
      success: true,
      message: 'Meal added successfully',
      data: entry
    });
  } catch (error) {
    console.error('Add meal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding meal'
    });
  }
});

// @desc    Get nutrition analysis
// @route   GET /api/diet/analysis
// @access  Private
router.get('/analysis', protect, requireOnboarding, async (req, res) => {
  try {
    const { period = '7' } = req.query; // days
    const userId = req.user.id;
    
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    const analysis = await DietEntry.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: null,
          avgCalories: { $avg: '$totalCalories' },
          avgProtein: { $avg: '$totalProtein' },
          avgCarbs: { $avg: '$totalCarbs' },
          avgFat: { $avg: '$totalFat' },
          avgWaterIntake: { $avg: '$waterIntake' },
          totalDays: { $sum: 1 },
          maxCalories: { $max: '$totalCalories' },
          minCalories: { $min: '$totalCalories' }
        }
      }
    ]);

    // Get daily breakdown
    const dailyBreakdown = await DietEntry.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' }
          },
          calories: { $sum: '$totalCalories' },
          protein: { $sum: '$totalProtein' },
          carbs: { $sum: '$totalCarbs' },
          fat: { $sum: '$totalFat' },
          waterIntake: { $sum: '$waterIntake' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    // Get most consumed foods
    const topFoods = await DietEntry.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: daysAgo }
        }
      },
      { $unwind: '$meals' },
      { $unwind: '$meals.foods' },
      {
        $group: {
          _id: '$meals.foods.foodId',
          totalQuantity: { $sum: '$meals.foods.quantity' },
          frequency: { $sum: 1 },
          totalCalories: { $sum: '$meals.foods.calories' }
        }
      },
      {
        $lookup: {
          from: 'fooditems',
          localField: '_id',
          foreignField: '_id',
          as: 'food'
        }
      },
      { $unwind: '$food' },
      {
        $project: {
          name: '$food.name',
          category: '$food.category',
          totalQuantity: 1,
          frequency: 1,
          totalCalories: 1
        }
      },
      { $sort: { frequency: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: analysis[0] || {
          avgCalories: 0,
          avgProtein: 0,
          avgCarbs: 0,
          avgFat: 0,
          avgWaterIntake: 0,
          totalDays: 0,
          maxCalories: 0,
          minCalories: 0
        },
        dailyBreakdown,
        topFoods,
        period: parseInt(period)
      }
    });
  } catch (error) {
    console.error('Get nutrition analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching nutrition analysis'
    });
  }
});

// @desc    Get reminders
// @route   GET /api/diet/reminders
// @access  Private
router.get('/reminders', protect, requireOnboarding, async (req, res) => {
  try {
    const reminders = await Reminder.find({
      userId: req.user.id,
      isActive: true
    }).sort({ time: 1 });

    res.status(200).json({
      success: true,
      count: reminders.length,
      data: reminders
    });
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reminders'
    });
  }
});

// @desc    Create reminder
// @route   POST /api/diet/reminders
// @access  Private
router.post('/reminders', protect, requireOnboarding, async (req, res) => {
  try {
    const reminder = await Reminder.create({
      ...req.body,
      userId: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Reminder created successfully',
      data: reminder
    });
  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating reminder'
    });
  }
});

// @desc    Update reminder
// @route   PUT /api/diet/reminders/:id
// @access  Private
router.put('/reminders/:id', protect, requireOnboarding, async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Reminder updated successfully',
      data: reminder
    });
  } catch (error) {
    console.error('Update reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating reminder'
    });
  }
});

// @desc    Delete reminder
// @route   DELETE /api/diet/reminders/:id
// @access  Private
router.delete('/reminders/:id', protect, requireOnboarding, async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Reminder deleted successfully'
    });
  } catch (error) {
    console.error('Delete reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting reminder'
    });
  }
});

module.exports = router;