const express = require('express');
const { Exercise, WorkoutSession, WorkoutPlan } = require('../models/Exercise');
const { protect, requireOnboarding } = require('../middleware/auth');

const router = express.Router();

/* ---------------------------------------------
   ✅ GET all exercises
   @route   GET /api/workouts/exercises
   @access  Private
--------------------------------------------- */
router.get('/exercises', protect, async (req, res) => {
  try {
    const { category, difficulty, equipment, search } = req.query;
    let query = {};

    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (equipment) query.equipment = equipment;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { muscleGroups: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const exercises = await Exercise.find(query).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: exercises.length,
      data: exercises
    });
  } catch (error) {
    console.error('Get exercises error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching exercises' });
  }
});

/* ---------------------------------------------
   ✅ GET exercise by ID
--------------------------------------------- */
router.get('/exercises/:id', protect, async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) return res.status(404).json({ success: false, message: 'Exercise not found' });

    res.status(200).json({ success: true, data: exercise });
  } catch (error) {
    console.error('Get exercise error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching exercise' });
  }
});

/* ---------------------------------------------
   ✅ CREATE workout session
--------------------------------------------- */
router.post('/sessions', protect, requireOnboarding, async (req, res) => {
  try {
    const { exercises, workoutType, notes, rating } = req.body;

    if (!exercises || exercises.length === 0)
      return res.status(400).json({ success: false, message: 'At least one exercise is required' });

    const workoutSession = await WorkoutSession.create({
      userId: req.user.id,
      exercises,
      workoutType,
      notes,
      rating
    });

    await workoutSession.populate('exercises.exerciseId');

    res.status(201).json({
      success: true,
      message: 'Workout session created successfully',
      data: workoutSession
    });
  } catch (error) {
    console.error('Create workout session error:', error);
    res.status(500).json({ success: false, message: 'Server error while creating workout session' });
  }
});

/* ---------------------------------------------
   ✅ GET user’s workout sessions
--------------------------------------------- */
router.get('/sessions', protect, requireOnboarding, async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    let query = { userId: req.user.id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const sessions = await WorkoutSession.find(query)
      .populate('exercises.exerciseId')
      .sort({ date: -1 })
      .limit(Number(limit))
      .skip((page - 1) * limit);

    const total = await WorkoutSession.countDocuments(query);

    res.status(200).json({
      success: true,
      count: sessions.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: sessions
    });
  } catch (error) {
    console.error('Get workout sessions error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching sessions' });
  }
});

/* ---------------------------------------------
   ✅ GET workout session by ID
--------------------------------------------- */
router.get('/sessions/:id', protect, requireOnboarding, async (req, res) => {
  try {
    const session = await WorkoutSession.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate('exercises.exerciseId');

    if (!session) return res.status(404).json({ success: false, message: 'Workout session not found' });

    res.status(200).json({ success: true, data: session });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching session' });
  }
});

/* ---------------------------------------------
   ✅ UPDATE workout session
--------------------------------------------- */
router.put('/sessions/:id', protect, requireOnboarding, async (req, res) => {
  try {
    const session = await WorkoutSession.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    ).populate('exercises.exerciseId');

    if (!session) return res.status(404).json({ success: false, message: 'Workout session not found' });

    res.status(200).json({
      success: true,
      message: 'Workout session updated successfully',
      data: session
    });
  } catch (error) {
    console.error('Update workout session error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating session' });
  }
});

/* ---------------------------------------------
   ✅ DELETE workout session
--------------------------------------------- */
router.delete('/sessions/:id', protect, requireOnboarding, async (req, res) => {
  try {
    const session = await WorkoutSession.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!session) return res.status(404).json({ success: false, message: 'Workout session not found' });

    res.status(200).json({ success: true, message: 'Workout session deleted successfully' });
  } catch (error) {
    console.error('Delete workout session error:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting session' });
  }
});

/* ---------------------------------------------
   ✅ WORKOUT statistics
--------------------------------------------- */
router.get('/stats', protect, requireOnboarding, async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '7' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    const stats = await WorkoutSession.aggregate([
      { $match: { userId, date: { $gte: daysAgo } } },
      {
        $group: {
          _id: null,
          totalWorkouts: { $sum: 1 },
          totalCaloriesBurned: { $sum: '$totalCaloriesBurned' },
          totalDuration: { $sum: '$totalDuration' },
          avgRating: { $avg: '$rating' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats[0] || {
        totalWorkouts: 0,
        totalCaloriesBurned: 0,
        totalDuration: 0,
        avgRating: 0
      }
    });
  } catch (error) {
    console.error('Workout stats error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching stats' });
  }
});

/* ---------------------------------------------
   ✅ CREATE workout plan
--------------------------------------------- */
router.post('/plans', protect, requireOnboarding, async (req, res) => {
  try {
    const workoutPlan = await WorkoutPlan.create({
      ...req.body,
      userId: req.user.id
    });

    await workoutPlan.populate('workouts.exercises.exerciseId');

    res.status(201).json({
      success: true,
      message: 'Workout plan created successfully',
      data: workoutPlan
    });
  } catch (error) {
    console.error('Create workout plan error:', error);
    res.status(500).json({ success: false, message: 'Server error while creating plan' });
  }
});

/* ---------------------------------------------
   ✅ GET user’s workout plans
--------------------------------------------- */
router.get('/plans', protect, requireOnboarding, async (req, res) => {
  try {
    const plans = await WorkoutPlan.find({ userId: req.user.id })
      .populate('workouts.exercises.exerciseId')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: plans.length, data: plans });
  } catch (error) {
    console.error('Get workout plans error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching plans' });
  }
});

module.exports = router;
