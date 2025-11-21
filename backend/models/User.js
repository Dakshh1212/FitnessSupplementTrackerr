const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },

    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: true, // include password when needed
    },

    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },

    age: {
      type: Number,
      min: 13,
      max: 120,
    },

    height: {
      type: Number, // in cm
      min: 100,
      max: 250,
    },

    weight: {
      type: Number, // in kg
      min: 30,
      max: 300,
    },

    fitnessGoals: {
      type: [String],
      default: [],
    },

    activityLevel: {
      type: String,
      enum: [
        'sedentary',
        'lightly_active',
        'moderately_active',
        'very_active',
        'extremely_active',
      ],
    },

    onboarded: {
      type: Boolean,
      default: false,
    },

    // Example fields for stats (optional)
    workoutsCompleted: {
      type: Number,
      default: 0,
    },
    caloriesBurned: {
      type: Number,
      default: 0,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// ============================
// Password Hashing Middleware
// ============================
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ============================
// Compare Password Method
// ============================
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
