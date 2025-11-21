const mongoose = require('mongoose');

// Food Item Schema
const foodItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Food name is required'],
    trim: true,
    unique: true
  },
  category: {
    type: String,
    required: [true, 'Food category is required'],
    enum: [
      'fruits', 'vegetables', 'grains', 'protein', 'dairy', 'nuts_seeds', 
      'beverages', 'snacks', 'fast_food', 'desserts', 'oils_fats', 'spices'
    ]
  },
  // Nutritional information per 100g
  nutrition: {
    calories: {
      type: Number,
      required: [true, 'Calories information is required'],
      min: 0
    },
    protein: {
      type: Number,
      required: [true, 'Protein information is required'],
      min: 0
    },
    carbs: {
      type: Number,
      required: [true, 'Carbohydrates information is required'],
      min: 0
    },
    fat: {
      type: Number,
      required: [true, 'Fat information is required'],
      min: 0
    },
    fiber: {
      type: Number,
      default: 0,
      min: 0
    },
    sugar: {
      type: Number,
      default: 0,
      min: 0
    },
    sodium: {
      type: Number,
      default: 0,
      min: 0
    },
    potassium: {
      type: Number,
      default: 0,
      min: 0
    },
    calcium: {
      type: Number,
      default: 0,
      min: 0
    },
    iron: {
      type: Number,
      default: 0,
      min: 0
    },
    vitaminC: {
      type: Number,
      default: 0,
      min: 0
    },
    vitaminA: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  servingSize: {
    amount: {
      type: Number,
      default: 100
    },
    unit: {
      type: String,
      enum: ['g', 'ml', 'cup', 'piece', 'slice', 'tbsp', 'tsp'],
      default: 'g'
    }
  },
  tags: [{
    type: String,
    enum: [
      'vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'nut_free', 
      'low_carb', 'high_protein', 'low_fat', 'high_fiber', 'organic'
    ]
  }],
  imageUrl: {
    type: String,
    default: ''
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

// Diet Entry Schema
const dietEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  meals: [{
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      required: true
    },
    time: {
      type: Date,
      required: true
    },
    foods: [{
      foodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FoodItem',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 0.1
      },
      unit: {
        type: String,
        enum: ['g', 'ml', 'cup', 'piece', 'slice', 'tbsp', 'tsp'],
        default: 'g'
      },
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number
    }],
    totalCalories: {
      type: Number,
      default: 0
    },
    totalProtein: {
      type: Number,
      default: 0
    },
    totalCarbs: {
      type: Number,
      default: 0
    },
    totalFat: {
      type: Number,
      default: 0
    },
    notes: String
  }],
  waterIntake: {
    type: Number,
    default: 0, // in glasses
    min: 0,
    max: 20
  },
  totalCalories: {
    type: Number,
    default: 0
  },
  totalProtein: {
    type: Number,
    default: 0
  },
  totalCarbs: {
    type: Number,
    default: 0
  },
  totalFat: {
    type: Number,
    default: 0
  },
  notes: String
}, {
  timestamps: true
});

// Pre-save middleware to calculate meal and daily totals
dietEntrySchema.pre('save', function(next) {
  let dailyCalories = 0;
  let dailyProtein = 0;
  let dailyCarbs = 0;
  let dailyFat = 0;
  
  this.meals.forEach(meal => {
    let mealCalories = 0;
    let mealProtein = 0;
    let mealCarbs = 0;
    let mealFat = 0;
    
    meal.foods.forEach(food => {
      // Calculate nutrition based on quantity (assuming nutrition is per 100g)
      const multiplier = food.quantity / 100;
      
      mealCalories += (food.calories || 0) * multiplier;
      mealProtein += (food.protein || 0) * multiplier;
      mealCarbs += (food.carbs || 0) * multiplier;
      mealFat += (food.fat || 0) * multiplier;
    });
    
    meal.totalCalories = Math.round(mealCalories);
    meal.totalProtein = Math.round(mealProtein * 10) / 10;
    meal.totalCarbs = Math.round(mealCarbs * 10) / 10;
    meal.totalFat = Math.round(mealFat * 10) / 10;
    
    dailyCalories += mealCalories;
    dailyProtein += mealProtein;
    dailyCarbs += mealCarbs;
    dailyFat += mealFat;
  });
  
  this.totalCalories = Math.round(dailyCalories);
  this.totalProtein = Math.round(dailyProtein * 10) / 10;
  this.totalCarbs = Math.round(dailyCarbs * 10) / 10;
  this.totalFat = Math.round(dailyFat * 10) / 10;
  
  next();
});

// Meal Plan Schema
const mealPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Meal plan name is required'],
    trim: true
  },
  description: String,
  goal: {
    type: String,
    enum: ['weight_loss', 'weight_gain', 'muscle_gain', 'maintenance', 'cutting', 'bulking'],
    required: true
  },
  duration: {
    type: Number, // in days
    required: true,
    min: 1,
    max: 365
  },
  targetCalories: {
    type: Number,
    required: true,
    min: 1000,
    max: 5000
  },
  macroTargets: {
    protein: {
      type: Number, // percentage
      required: true,
      min: 10,
      max: 50
    },
    carbs: {
      type: Number, // percentage
      required: true,
      min: 20,
      max: 70
    },
    fat: {
      type: Number, // percentage
      required: true,
      min: 15,
      max: 50
    }
  },
  meals: [{
    day: {
      type: Number,
      required: true,
      min: 1
    },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      required: true
    },
    foods: [{
      foodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FoodItem',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 0.1
      },
      unit: {
        type: String,
        enum: ['g', 'ml', 'cup', 'piece', 'slice', 'tbsp', 'tsp'],
        default: 'g'
      }
    }],
    instructions: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    enum: ['user', 'system', 'nutritionist'],
    default: 'user'
  }
}, {
  timestamps: true
});

// Reminder Schema
const reminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['water', 'meal', 'supplement', 'fruit', 'vegetable', 'custom'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'custom'],
    default: 'daily'
  },
  time: {
    type: String, // HH:MM format
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastTriggered: {
    type: Date
  }
}, {
  timestamps: true
});

const FoodItem = mongoose.model('FoodItem', foodItemSchema);
const DietEntry = mongoose.model('DietEntry', dietEntrySchema);
const MealPlan = mongoose.model('MealPlan', mealPlanSchema);
const Reminder = mongoose.model('Reminder', reminderSchema);

module.exports = {
  FoodItem,
  DietEntry,
  MealPlan,
  Reminder
};