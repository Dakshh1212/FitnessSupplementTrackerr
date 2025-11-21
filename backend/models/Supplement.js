const mongoose = require('mongoose');

// Supplement Schema
const supplementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Supplement name is required'],
    trim: true,
    unique: true
  },
  category: {
    type: String,
    required: [true, 'Supplement category is required'],
    enum: [
      'protein', 'creatine', 'vitamins', 'minerals', 'amino_acids', 
      'pre_workout', 'post_workout', 'fat_burner', 'mass_gainer', 
      'omega_3', 'probiotics', 'herbal', 'other'
    ]
  },
  type: {
    type: String,
    enum: ['powder', 'capsule', 'tablet', 'liquid', 'gummy', 'bar'],
    required: true
  },
  brand: {
    type: String,
    required: [true, 'Brand name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  benefits: [{
    type: String,
    required: true
  }],
  ingredients: [{
    name: {
      type: String,
      required: true
    },
    amount: {
      type: String, // e.g., "25g", "500mg"
      required: true
    },
    unit: {
      type: String,
      enum: ['g', 'mg', 'mcg', 'iu', 'ml'],
      required: true
    }
  }],
  servingSize: {
    amount: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      enum: ['scoop', 'capsule', 'tablet', 'ml', 'g'],
      required: true
    }
  },
  servingsPerContainer: {
    type: Number,
    required: true,
    min: 1
  },
  recommendedDosage: {
    amount: {
      type: Number,
      required: true
    },
    frequency: {
      type: String,
      enum: ['once_daily', 'twice_daily', 'three_times_daily', 'pre_workout', 'post_workout', 'with_meals'],
      required: true
    },
    timing: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'pre_workout', 'post_workout', 'with_meal', 'empty_stomach']
    }
  },
  priceRange: {
    min: {
      type: Number,
      required: true,
      min: 0
    },
    max: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  isBudgetFriendly: {
    type: Boolean,
    default: false
  },
  safetyRating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  sideEffects: [{
    type: String
  }],
  contraindications: [{
    type: String
  }],
  targetGoals: [{
    type: String,
    enum: [
      'muscle_gain', 'weight_loss', 'strength', 'endurance', 'recovery', 
      'energy', 'focus', 'immune_support', 'joint_health', 'general_health'
    ]
  }],
  suitableFor: [{
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'male', 'female', 'vegetarian', 'vegan']
  }],
  imageUrl: {
    type: String,
    default: ''
  },
  affiliateLinks: [{
    store: String,
    url: String,
    price: Number
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// User Supplement Intake Schema
const supplementIntakeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  supplementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplement',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  dosage: {
    amount: {
      type: Number,
      required: true,
      min: 0.1
    },
    unit: {
      type: String,
      enum: ['scoop', 'capsule', 'tablet', 'ml', 'g'],
      required: true
    }
  },
  time: {
    type: Date,
    required: true
  },
  timing: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'pre_workout', 'post_workout', 'with_meal', 'empty_stomach'],
    required: true
  },
  notes: String,
  effectiveness: {
    type: Number,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

// User Supplement Plan Schema
const supplementPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Plan name is required'],
    trim: true
  },
  goal: {
    type: String,
    enum: [
      'muscle_gain', 'weight_loss', 'strength', 'endurance', 'recovery', 
      'energy', 'focus', 'immune_support', 'joint_health', 'general_health'
    ],
    required: true
  },
  duration: {
    type: Number, // in days
    required: true,
    min: 7,
    max: 365
  },
  supplements: [{
    supplementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplement',
      required: true
    },
    dosage: {
      amount: {
        type: Number,
        required: true,
        min: 0.1
      },
      unit: {
        type: String,
        enum: ['scoop', 'capsule', 'tablet', 'ml', 'g'],
        required: true
      }
    },
    frequency: {
      type: String,
      enum: ['once_daily', 'twice_daily', 'three_times_daily', 'pre_workout', 'post_workout', 'with_meals'],
      required: true
    },
    timing: [{
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'pre_workout', 'post_workout', 'with_meal', 'empty_stomach']
    }],
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: Date,
    isActive: {
      type: Boolean,
      default: true
    },
    notes: String
  }],
  totalCost: {
    type: Number,
    default: 0
  },
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

// Pre-save middleware to calculate total cost
supplementPlanSchema.pre('save', function(next) {
  // This would need to be populated with actual supplement prices
  // For now, we'll set a placeholder calculation
  this.totalCost = this.supplements.length * 50; // $50 average per supplement
  next();
});

// Supplement Review Schema
const supplementReviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  supplementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplement',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  review: {
    type: String,
    required: true,
    maxlength: 1000
  },
  pros: [String],
  cons: [String],
  usageDuration: {
    type: Number, // in days
    required: true,
    min: 1
  },
  wouldRecommend: {
    type: Boolean,
    required: true
  },
  verifiedPurchase: {
    type: Boolean,
    default: false
  },
  helpfulVotes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate reviews from same user for same supplement
supplementReviewSchema.index({ userId: 1, supplementId: 1 }, { unique: true });

const Supplement = mongoose.model('Supplement', supplementSchema);
const SupplementIntake = mongoose.model('SupplementIntake', supplementIntakeSchema);
const SupplementPlan = mongoose.model('SupplementPlan', supplementPlanSchema);
const SupplementReview = mongoose.model('SupplementReview', supplementReviewSchema);

module.exports = {
  Supplement,
  SupplementIntake,
  SupplementPlan,
  SupplementReview
};