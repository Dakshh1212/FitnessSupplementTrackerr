import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { ChevronLeft, ChevronRight, User, Target, Activity, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { completeOnboarding } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues
  } = useForm({
    defaultValues: {
      // Personal Info
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      
      // Body Measurements
      height: '',
      weight: '',
      activityLevel: '',
      
      // Fitness Goals
      primaryGoal: '',
      targetWeight: '',
      fitnessExperience: '',
      workoutFrequency: '',
      dietaryPreferences: []
    }
  });

  const totalSteps = 3;

  const steps = [
    {
      id: 1,
      title: 'Personal Information',
      icon: User,
      description: 'Tell us about yourself'
    },
    {
      id: 2,
      title: 'Body Measurements',
      icon: Activity,
      description: 'Your current physical stats'
    },
    {
      id: 3,
      title: 'Fitness Goals',
      icon: Target,
      description: 'What do you want to achieve?'
    }
  ];

  const activityLevels = [
    { value: 'sedentary', label: 'Sedentary', description: 'Little to no exercise' },
    { value: 'lightly_active', label: 'Lightly Active', description: 'Light exercise 1-3 days/week' },
    { value: 'moderately_active', label: 'Moderately Active', description: 'Moderate exercise 3-5 days/week' },
    { value: 'very_active', label: 'Very Active', description: 'Hard exercise 6-7 days/week' },
    { value: 'extremely_active', label: 'Extremely Active', description: 'Very hard exercise, physical job' }
  ];

  const fitnessGoals = [
    { value: 'lose_weight', label: 'Lose Weight', description: 'Burn fat and get leaner' },
    { value: 'gain_muscle', label: 'Gain Muscle', description: 'Build strength and muscle mass' },
    { value: 'maintain_weight', label: 'Maintain Weight', description: 'Stay healthy and fit' },
    { value: 'improve_endurance', label: 'Improve Endurance', description: 'Boost cardiovascular fitness' },
    { value: 'general_fitness', label: 'General Fitness', description: 'Overall health and wellness' }
  ];

  const experienceLevels = [
    { value: 'beginner', label: 'Beginner', description: 'New to fitness' },
    { value: 'intermediate', label: 'Intermediate', description: '6 months - 2 years' },
    { value: 'advanced', label: 'Advanced', description: '2+ years of experience' }
  ];

  const workoutFrequencies = [
    { value: '1-2', label: '1-2 times per week' },
    { value: '3-4', label: '3-4 times per week' },
    { value: '5-6', label: '5-6 times per week' },
    { value: '7', label: 'Daily' }
  ];

  const dietaryOptions = [
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'keto', label: 'Keto' },
    { value: 'paleo', label: 'Paleo' },
    { value: 'mediterranean', label: 'Mediterranean' },
    { value: 'none', label: 'No specific diet' }
  ];

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDietaryChange = (value) => {
    const currentPreferences = getValues('dietaryPreferences') || [];
    if (currentPreferences.includes(value)) {
      setValue('dietaryPreferences', currentPreferences.filter(pref => pref !== value));
    } else {
      setValue('dietaryPreferences', [...currentPreferences, value]);
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Transform frontend data to match backend API expectations
      const transformedData = {
        // Calculate age from dateOfBirth
        age: data.dateOfBirth ? new Date().getFullYear() - new Date(data.dateOfBirth).getFullYear() : null,
        gender: data.gender,
        height: parseFloat(data.height),
        weight: parseFloat(data.weight),
        activityLevel: data.activityLevel,
        fitnessGoals: data.primaryGoal, // Map primaryGoal to fitnessGoals
        targetWeight: data.targetWeight ? parseFloat(data.targetWeight) : null,
        dietaryPreferences: data.dietaryPreferences || [],
        // Additional fields that might be expected by backend
        weeklyWeightGoal: null, // Can be set later
        healthConditions: [],
        allergies: []
      };

      await completeOnboarding(transformedData);
      toast.success('Welcome to mDMA! Your profile has been set up successfully.');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Failed to complete onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  {...register('firstName', { required: 'First name is required' })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your first name"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  {...register('lastName', { required: 'Last name is required' })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your last name"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date of Birth *
              </label>
              <input
                type="date"
                {...register('dateOfBirth', { required: 'Date of birth is required' })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              {errors.dateOfBirth && (
                <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gender *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['male', 'female', 'other'].map((gender) => (
                  <label key={gender} className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      type="radio"
                      value={gender}
                      {...register('gender', { required: 'Gender is required' })}
                      className="mr-3 text-blue-600"
                    />
                    <span className="capitalize text-gray-700 dark:text-gray-300">{gender}</span>
                  </label>
                ))}
              </div>
              {errors.gender && (
                <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Height (cm) *
                </label>
                <input
                  type="number"
                  {...register('height', { 
                    required: 'Height is required',
                    min: { value: 100, message: 'Height must be at least 100cm' },
                    max: { value: 250, message: 'Height must be less than 250cm' }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="170"
                />
                {errors.height && (
                  <p className="mt-1 text-sm text-red-600">{errors.height.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Weight (kg) *
                </label>
                <input
                  type="number"
                  {...register('weight', { 
                    required: 'Weight is required',
                    min: { value: 30, message: 'Weight must be at least 30kg' },
                    max: { value: 300, message: 'Weight must be less than 300kg' }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="70"
                />
                {errors.weight && (
                  <p className="mt-1 text-sm text-red-600">{errors.weight.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Activity Level *
              </label>
              <div className="space-y-3">
                {activityLevels.map((level) => (
                  <label key={level.value} className="flex items-start p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      type="radio"
                      value={level.value}
                      {...register('activityLevel', { required: 'Activity level is required' })}
                      className="mt-1 mr-3 text-blue-600"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{level.label}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{level.description}</div>
                    </div>
                  </label>
                ))}
              </div>
              {errors.activityLevel && (
                <p className="mt-1 text-sm text-red-600">{errors.activityLevel.message}</p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Primary Fitness Goal *
              </label>
              <div className="space-y-3">
                {fitnessGoals.map((goal) => (
                  <label key={goal.value} className="flex items-start p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      type="radio"
                      value={goal.value}
                      {...register('primaryGoal', { required: 'Primary goal is required' })}
                      className="mt-1 mr-3 text-blue-600"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{goal.label}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{goal.description}</div>
                    </div>
                  </label>
                ))}
              </div>
              {errors.primaryGoal && (
                <p className="mt-1 text-sm text-red-600">{errors.primaryGoal.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Weight (kg)
                </label>
                <input
                  type="number"
                  {...register('targetWeight', {
                    min: { value: 30, message: 'Target weight must be at least 30kg' },
                    max: { value: 300, message: 'Target weight must be less than 300kg' }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="65"
                />
                {errors.targetWeight && (
                  <p className="mt-1 text-sm text-red-600">{errors.targetWeight.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fitness Experience *
                </label>
                <select
                  {...register('fitnessExperience', { required: 'Fitness experience is required' })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select experience level</option>
                  {experienceLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
                {errors.fitnessExperience && (
                  <p className="mt-1 text-sm text-red-600">{errors.fitnessExperience.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preferred Workout Frequency *
              </label>
              <select
                {...register('workoutFrequency', { required: 'Workout frequency is required' })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select frequency</option>
                {workoutFrequencies.map((freq) => (
                  <option key={freq.value} value={freq.value}>
                    {freq.label}
                  </option>
                ))}
              </select>
              {errors.workoutFrequency && (
                <p className="mt-1 text-sm text-red-600">{errors.workoutFrequency.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Dietary Preferences (Optional)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {dietaryOptions.map((option) => (
                  <label key={option.value} className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      type="checkbox"
                      checked={watch('dietaryPreferences')?.includes(option.value) || false}
                      onChange={() => handleDietaryChange(option.value)}
                      className="mr-3 text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                    isCompleted 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : isActive 
                        ? 'bg-blue-500 border-blue-500 text-white' 
                        : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <StepIcon className="w-6 h-6" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-1 mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {steps[currentStep - 1].title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {steps[currentStep - 1].description}
            </p>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                  currentStep === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Previous
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Next
                  <ChevronRight className="w-5 h-5 ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Completing Setup...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <CheckCircle className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Step Indicator */}
        <div className="text-center mt-6">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Step {currentStep} of {totalSteps}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;