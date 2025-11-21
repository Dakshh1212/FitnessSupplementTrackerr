const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Exercise name is required'],
    trim: true,
    unique: true
  },
  category: {
    type: String,
    required: [true, 'Exercise category is required'],
    enum: [
      'chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'glutes', 
      'abs', 'cardio', 'full_body', 'core', 'calves', 'forearms'
    ]
  },
  muscleGroups: [{
    type: String,
    enum: [
      'chest', 'back', 'shoulders', 'biceps', 'triceps', 'quadriceps', 
      'hamstrings', 'glutes', 'calves', 'abs', 'obliques', 'forearms', 'traps'
    ]
  }],
  equipment: {
    type: String,
    enum: [
      'bodyweight', 'dumbbells', 'barbell', 'machine', 'cable', 'kettlebell', 
      'resistance_band', 'medicine_ball', 'pull_up_bar', 'bench'
    ],
    default: 'bodyweight'
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  instructions: [{
    type: String,
    required: true
  }],
  tips: [String],
  caloriesPerMinute: {
    type: Number,
    default: 5 // average calories burned per minute
  },
  imageUrl: {
    type: String,
    default: ''
  },
  videoUrl: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Workout Session Schema
const workoutSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  exercises: [{
    exerciseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
      required: true
    },
    sets: [{
      reps: {
        type: Number,
        required: true,
        min: 1
      },
      weight: {
        type: Number,
        default: 0 // for bodyweight exercises
      },
      duration: {
        type: Number, // in seconds, for time-based exercises
        default: 0
      },
      restTime: {
        type: Number, // in seconds
        default: 60
      }
    }],
    notes: String,
    totalCaloriesBurned: {
      type: Number,
      default: 0
    }
  }],
  totalDuration: {
    type: Number, // in minutes
    default: 0
  },
  totalCaloriesBurned: {
    type: Number,
    default: 0
  },
  workoutType: {
    type: String,
    enum: ['strength', 'cardio', 'flexibility', 'mixed'],
    default: 'mixed'
  },
  notes: String,
  rating: {
    type: Number,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

// Pre-save middleware to calculate total calories burned
workoutSessionSchema.pre('save', function(next) {
  let totalCalories = 0;
  let totalDuration = 0;
  
  this.exercises.forEach(exercise => {
    // Calculate duration for this exercise (sum of all sets)
    const exerciseDuration = exercise.sets.reduce((sum, set) => {
      return sum + (set.duration || 0) + (set.restTime || 0);
    }, 0);
    
    totalDuration += exerciseDuration;
    
    // Calculate calories (this would need to be populated with actual exercise data)
    exercise.totalCaloriesBurned = Math.round((exerciseDuration / 60) * 5); // 5 calories per minute average
    totalCalories += exercise.totalCaloriesBurned;
  });
  
  this.totalDuration = Math.round(totalDuration / 60); // convert to minutes
  this.totalCaloriesBurned = totalCalories;
  
  next();
});

// Workout Plan Schema
const workoutPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Workout plan name is required'],
    trim: true
  },
  description: String,
  goal: {
    type: String,
    enum: ['muscle_gain', 'weight_loss', 'strength', 'endurance', 'flexibility'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  duration: {
    type: Number, // in weeks
    required: true,
    min: 1,
    max: 52
  },
  daysPerWeek: {
    type: Number,
    required: true,
    min: 1,
    max: 7
  },
  workouts: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true
    },
    name: String,
    exercises: [{
      exerciseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exercise',
        required: true
      },
      sets: {
        type: Number,
        required: true,
        min: 1
      },
      reps: {
        type: String, // e.g., "8-12", "10", "AMRAP"
        required: true
      },
      weight: String, // e.g., "bodyweight", "50kg", "progressive"
      restTime: {
        type: Number, // in seconds
        default: 60
      },
      notes: String
    }]
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    enum: ['user', 'system', 'trainer'],
    default: 'user'
  }
}, {
  timestamps: true
});

const Exercise = mongoose.model('Exercise', exerciseSchema);
const WorkoutSession = mongoose.model('WorkoutSession', workoutSessionSchema);
const WorkoutPlan = mongoose.model('WorkoutPlan', workoutPlanSchema);

module.exports = {
  Exercise,
  WorkoutSession,
  WorkoutPlan
};