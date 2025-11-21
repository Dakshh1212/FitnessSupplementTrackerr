import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft,
  Calendar,
  Ruler,
  Weight,
  Target,
  Activity,
  Clock,
  MapPin,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser, completeOnboarding } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
    clearErrors,
    trigger,
    getValues
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      // Step 1: Basic Registration
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
      
      // Step 2: Personal Information
      age: '',
      gender: '',
      height: '',
      weight: '',
      location: '',
      
      // Step 3: Body Measurements
      bodyFat: '',
      muscleMass: '',
      targetWeight: '',
      
      // Step 4: Fitness Goals
      primaryGoal: '',
      fitnessExperience: '',
      workoutFrequency: '',
      preferredWorkoutTime: '',
      dietaryPreferences: []
    }
  });

  const password = watch('password');

  const stepTitles = [
    'Create Account',
    'Personal Information', 
    'Body Measurements',
    'Fitness Goals'
  ];

  const stepDescriptions = [
    'Set up your account credentials',
    'Tell us about yourself',
    'Help us understand your body composition',
    'Define your fitness objectives'
  ];

  const nextStep = async () => {
    let fieldsToValidate = [];
    
    switch (currentStep) {
      case 1:
        fieldsToValidate = ['name', 'email', 'password', 'confirmPassword', 'terms'];
        break;
      case 2:
        fieldsToValidate = ['age', 'gender', 'height', 'weight', 'location'];
        break;
      case 3:
        fieldsToValidate = ['bodyFat', 'muscleMass', 'targetWeight'];
        break;
      case 4:
        fieldsToValidate = ['primaryGoal', 'fitnessExperience', 'workoutFrequency', 'preferredWorkoutTime'];
        break;
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      clearErrors();

      // First, register the user with basic information
      const basicRegistrationData = {
        name: data.name,
        email: data.email,
        password: data.password
      };

      const registerResult = await registerUser(basicRegistrationData);
      
      if (registerResult.success) {
        // Then complete onboarding with additional data
        const onboardingData = {
          gender: data.gender,
          age: parseInt(data.age),
          height: parseFloat(data.height),
          weight: parseFloat(data.weight),
          fitnessGoals: [data.primaryGoal],
          activityLevel: data.fitnessExperience,
          targetWeight: parseFloat(data.targetWeight),
          weeklyWeightGoal: 0.5, // Default value
          dietaryPreferences: data.dietaryPreferences || [],
          healthConditions: [],
          allergies: []
        };

        const onboardingResult = await completeOnboarding(onboardingData);
        
        if (onboardingResult.success) {
          navigate('/dashboard');
        } else {
          throw new Error(onboardingResult.error || 'Onboarding completion failed');
        }
      } else {
        throw new Error(registerResult.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('root', {
        type: 'manual',
        message: error.message || 'Registration failed. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDietaryPreferenceChange = (preference) => {
    const currentPreferences = getValues('dietaryPreferences') || [];
    const updatedPreferences = currentPreferences.includes(preference)
      ? currentPreferences.filter(p => p !== preference)
      : [...currentPreferences, preference];
    
    // Update the form value
    register('dietaryPreferences').onChange({
      target: { value: updatedPreferences }
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Name Field */}
            <div className="transform transition-all duration-300 hover:scale-105">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 transition-colors duration-300" />
                </div>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-300 transform focus:scale-105 ${
                    errors.name 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="Enter your full name"
                  {...register('name', {
                    required: 'Full name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters',
                    },
                  })}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 animate-shake">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="transform transition-all duration-300 hover:scale-105">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 transition-colors duration-300" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-300 transform focus:scale-105 ${
                    errors.email 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="Enter your email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 animate-shake">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="transform transition-all duration-300 hover:scale-105">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 transition-colors duration-300" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`block w-full pl-10 pr-10 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-300 transform focus:scale-105 ${
                    errors.password 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="Create a password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
                    },
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center transition-all duration-300 hover:scale-110"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 animate-shake">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="transform transition-all duration-300 hover:scale-105">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 transition-colors duration-300" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`block w-full pl-10 pr-10 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-300 transform focus:scale-105 ${
                    errors.confirmPassword 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="Confirm your password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === password || 'Passwords do not match',
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center transition-all duration-300 hover:scale-110"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 animate-shake">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="animate-fade-in-up animation-delay-600">
              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded transition-all duration-300 transform hover:scale-110"
                  {...register('terms', {
                    required: 'You must accept the terms and conditions',
                  })}
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                  I agree to the{' '}
                  <Link
                    to="/terms"
                    className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-all duration-300 hover:underline"
                  >
                    Terms and Conditions
                  </Link>{' '}
                  and{' '}
                  <Link
                    to="/privacy"
                    className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-all duration-300 hover:underline"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.terms && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 animate-shake">
                  {errors.terms.message}
                </p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Age */}
            <div className="transform transition-all duration-300 hover:scale-105">
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Age
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="age"
                  type="number"
                  min="13"
                  max="120"
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-300 transform focus:scale-105 ${
                    errors.age ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="Enter your age"
                  {...register('age', {
                    required: 'Age is required',
                    min: { value: 13, message: 'You must be at least 13 years old' },
                    max: { value: 120, message: 'Please enter a valid age' }
                  })}
                />
              </div>
              {errors.age && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 animate-shake">
                  {errors.age.message}
                </p>
              )}
            </div>

            {/* Gender */}
            <div className="transform transition-all duration-300 hover:scale-105">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gender
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['male', 'female', 'other'].map((gender) => (
                  <label key={gender} className="relative">
                    <input
                      type="radio"
                      value={gender}
                      className="sr-only"
                      {...register('gender', { required: 'Please select your gender' })}
                    />
                    <div className="flex items-center justify-center px-4 py-3 border rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-md peer-checked:bg-primary-50 peer-checked:border-primary-500 peer-checked:text-primary-700 dark:peer-checked:bg-primary-900/20 dark:peer-checked:border-primary-400 dark:peer-checked:text-primary-300">
                      <span className="text-sm font-medium capitalize">{gender}</span>
                    </div>
                  </label>
                ))}
              </div>
              {errors.gender && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 animate-shake">
                  {errors.gender.message}
                </p>
              )}
            </div>

            {/* Height */}
            <div className="transform transition-all duration-300 hover:scale-105">
              <label htmlFor="height" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Height (cm)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Ruler className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="height"
                  type="number"
                  min="100"
                  max="250"
                  step="0.1"
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-300 transform focus:scale-105 ${
                    errors.height ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="Enter your height in cm"
                  {...register('height', {
                    required: 'Height is required',
                    min: { value: 100, message: 'Height must be at least 100 cm' },
                    max: { value: 250, message: 'Height must be less than 250 cm' }
                  })}
                />
              </div>
              {errors.height && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 animate-shake">
                  {errors.height.message}
                </p>
              )}
            </div>

            {/* Weight */}
            <div className="transform transition-all duration-300 hover:scale-105">
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Weight (kg)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Weight className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="weight"
                  type="number"
                  min="30"
                  max="300"
                  step="0.1"
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-300 transform focus:scale-105 ${
                    errors.weight ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="Enter your current weight in kg"
                  {...register('weight', {
                    required: 'Weight is required',
                    min: { value: 30, message: 'Weight must be at least 30 kg' },
                    max: { value: 300, message: 'Weight must be less than 300 kg' }
                  })}
                />
              </div>
              {errors.weight && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 animate-shake">
                  {errors.weight.message}
                </p>
              )}
            </div>

            {/* Location */}
            <div className="transform transition-all duration-300 hover:scale-105">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="location"
                  type="text"
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-300 transform focus:scale-105 ${
                    errors.location ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="Enter your city or location"
                  {...register('location', {
                    required: 'Location is required',
                    minLength: { value: 2, message: 'Location must be at least 2 characters' }
                  })}
                />
              </div>
              {errors.location && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 animate-shake">
                  {errors.location.message}
                </p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Body Fat Percentage */}
            <div className="transform transition-all duration-300 hover:scale-105">
              <label htmlFor="bodyFat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Body Fat Percentage (%)
              </label>
              <input
                id="bodyFat"
                type="number"
                min="5"
                max="50"
                step="0.1"
                className={`block w-full px-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-300 transform focus:scale-105 ${
                  errors.bodyFat ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 hover:border-gray-400'
                }`}
                placeholder="Enter your body fat percentage (optional)"
                {...register('bodyFat', {
                  min: { value: 5, message: 'Body fat percentage must be at least 5%' },
                  max: { value: 50, message: 'Body fat percentage must be less than 50%' }
                })}
              />
              {errors.bodyFat && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 animate-shake">
                  {errors.bodyFat.message}
                </p>
              )}
            </div>

            {/* Muscle Mass */}
            <div className="transform transition-all duration-300 hover:scale-105">
              <label htmlFor="muscleMass" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Muscle Mass (kg)
              </label>
              <input
                id="muscleMass"
                type="number"
                min="10"
                max="100"
                step="0.1"
                className={`block w-full px-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-300 transform focus:scale-105 ${
                  errors.muscleMass ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 hover:border-gray-400'
                }`}
                placeholder="Enter your muscle mass in kg (optional)"
                {...register('muscleMass', {
                  min: { value: 10, message: 'Muscle mass must be at least 10 kg' },
                  max: { value: 100, message: 'Muscle mass must be less than 100 kg' }
                })}
              />
              {errors.muscleMass && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 animate-shake">
                  {errors.muscleMass.message}
                </p>
              )}
            </div>

            {/* Target Weight */}
            <div className="transform transition-all duration-300 hover:scale-105">
              <label htmlFor="targetWeight" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Weight (kg)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Target className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="targetWeight"
                  type="number"
                  min="30"
                  max="300"
                  step="0.1"
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-300 transform focus:scale-105 ${
                    errors.targetWeight ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="Enter your target weight in kg"
                  {...register('targetWeight', {
                    required: 'Target weight is required',
                    min: { value: 30, message: 'Target weight must be at least 30 kg' },
                    max: { value: 300, message: 'Target weight must be less than 300 kg' }
                  })}
                />
              </div>
              {errors.targetWeight && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 animate-shake">
                  {errors.targetWeight.message}
                </p>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {/* Primary Goal */}
            <div className="transform transition-all duration-300 hover:scale-105">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Primary Fitness Goal
              </label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { value: 'weight_loss', label: 'Weight Loss', icon: '🔥' },
                  { value: 'muscle_gain', label: 'Muscle Gain', icon: '💪' },
                  { value: 'endurance', label: 'Endurance', icon: '🏃' },
                  { value: 'strength', label: 'Strength', icon: '🏋️' },
                  { value: 'general_fitness', label: 'General Fitness', icon: '⚡' }
                ].map((goal) => (
                  <label key={goal.value} className="relative">
                    <input
                      type="radio"
                      value={goal.value}
                      className="sr-only"
                      {...register('primaryGoal', { required: 'Please select your primary goal' })}
                    />
                    <div className="flex items-center px-4 py-3 border rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-md peer-checked:bg-primary-50 peer-checked:border-primary-500 peer-checked:text-primary-700 dark:peer-checked:bg-primary-900/20 dark:peer-checked:border-primary-400 dark:peer-checked:text-primary-300">
                      <span className="text-lg mr-3">{goal.icon}</span>
                      <span className="text-sm font-medium">{goal.label}</span>
                    </div>
                  </label>
                ))}
              </div>
              {errors.primaryGoal && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 animate-shake">
                  {errors.primaryGoal.message}
                </p>
              )}
            </div>

            {/* Fitness Experience */}
            <div className="transform transition-all duration-300 hover:scale-105">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fitness Experience Level
              </label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { value: 'beginner', label: 'Beginner (0-6 months)', icon: '🌱' },
                  { value: 'intermediate', label: 'Intermediate (6 months - 2 years)', icon: '🌿' },
                  { value: 'advanced', label: 'Advanced (2+ years)', icon: '🌳' }
                ].map((level) => (
                  <label key={level.value} className="relative">
                    <input
                      type="radio"
                      value={level.value}
                      className="sr-only"
                      {...register('fitnessExperience', { required: 'Please select your experience level' })}
                    />
                    <div className="flex items-center px-4 py-3 border rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-md peer-checked:bg-primary-50 peer-checked:border-primary-500 peer-checked:text-primary-700 dark:peer-checked:bg-primary-900/20 dark:peer-checked:border-primary-400 dark:peer-checked:text-primary-300">
                      <span className="text-lg mr-3">{level.icon}</span>
                      <span className="text-sm font-medium">{level.label}</span>
                    </div>
                  </label>
                ))}
              </div>
              {errors.fitnessExperience && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 animate-shake">
                  {errors.fitnessExperience.message}
                </p>
              )}
            </div>

            {/* Workout Frequency */}
            <div className="transform transition-all duration-300 hover:scale-105">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preferred Workout Frequency
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: '2-3', label: '2-3 times/week' },
                  { value: '4-5', label: '4-5 times/week' },
                  { value: '6-7', label: '6-7 times/week' },
                  { value: 'daily', label: 'Daily' }
                ].map((freq) => (
                  <label key={freq.value} className="relative">
                    <input
                      type="radio"
                      value={freq.value}
                      className="sr-only"
                      {...register('workoutFrequency', { required: 'Please select workout frequency' })}
                    />
                    <div className="flex items-center justify-center px-4 py-3 border rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-md peer-checked:bg-primary-50 peer-checked:border-primary-500 peer-checked:text-primary-700 dark:peer-checked:bg-primary-900/20 dark:peer-checked:border-primary-400 dark:peer-checked:text-primary-300">
                      <span className="text-sm font-medium">{freq.label}</span>
                    </div>
                  </label>
                ))}
              </div>
              {errors.workoutFrequency && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 animate-shake">
                  {errors.workoutFrequency.message}
                </p>
              )}
            </div>

            {/* Preferred Workout Time */}
            <div className="transform transition-all duration-300 hover:scale-105">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preferred Workout Time
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'morning', label: 'Morning', icon: '🌅' },
                  { value: 'afternoon', label: 'Afternoon', icon: '☀️' },
                  { value: 'evening', label: 'Evening', icon: '🌆' },
                  { value: 'night', label: 'Night', icon: '🌙' }
                ].map((time) => (
                  <label key={time.value} className="relative">
                    <input
                      type="radio"
                      value={time.value}
                      className="sr-only"
                      {...register('preferredWorkoutTime', { required: 'Please select preferred workout time' })}
                    />
                    <div className="flex items-center justify-center px-4 py-3 border rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-md peer-checked:bg-primary-50 peer-checked:border-primary-500 peer-checked:text-primary-700 dark:peer-checked:bg-primary-900/20 dark:peer-checked:border-primary-400 dark:peer-checked:text-primary-300">
                      <span className="text-lg mr-2">{time.icon}</span>
                      <span className="text-sm font-medium">{time.label}</span>
                    </div>
                  </label>
                ))}
              </div>
              {errors.preferredWorkoutTime && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 animate-shake">
                  {errors.preferredWorkoutTime.message}
                </p>
              )}
            </div>

            {/* Dietary Preferences */}
            <div className="transform transition-all duration-300 hover:scale-105">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dietary Preferences (Optional)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'vegetarian', label: 'Vegetarian' },
                  { value: 'vegan', label: 'Vegan' },
                  { value: 'keto', label: 'Keto' },
                  { value: 'paleo', label: 'Paleo' },
                  { value: 'mediterranean', label: 'Mediterranean' },
                  { value: 'none', label: 'No Restrictions' }
                ].map((diet) => (
                  <label key={diet.value} className="relative flex items-center">
                    <input
                      type="checkbox"
                      value={diet.value}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded transition-all duration-300 transform hover:scale-110"
                      onChange={() => handleDietaryPreferenceChange(diet.value)}
                    />
                    <span className="ml-2 text-sm text-gray-900 dark:text-gray-300">{diet.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 animate-fade-in-up">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center animate-fade-in-up animation-delay-200">
            <User className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white animate-fade-in-up animation-delay-400">
            {stepTitles[currentStep - 1]}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 animate-fade-in-up animation-delay-600">
            {stepDescriptions[currentStep - 1]}
          </p>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {renderStepContent()}

          {/* Error Message */}
          {errors.root && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 animate-shake">
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.root.message}
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between space-x-4">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 transform hover:scale-105"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </button>
            )}
            
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 transform hover:scale-105 ml-auto"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 ml-auto"
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Registration
                  </>
                )}
              </button>
            )}
          </div>

          {/* Sign in link - only show on first step */}
          {currentStep === 1 && (
            <div className="text-center animate-fade-in-up animation-delay-1000">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-all duration-300 hover:underline transform hover:scale-105 inline-block"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          )}
        </form>
      </div>
      
      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        
        .animation-delay-400 {
          animation-delay: 400ms;
        }
        
        .animation-delay-600 {
          animation-delay: 600ms;
        }
        
        .animation-delay-800 {
          animation-delay: 800ms;
        }
        
        .animation-delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  );
};

export default Register;