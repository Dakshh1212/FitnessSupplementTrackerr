import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Clock, 
  Target, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  TrendingUp, 
  Zap, 
  Heart, 
  Dumbbell, 
  Timer, 
  BarChart3, 
  Trophy, 
  Play, 
  Pause, 
  Square, 
  CheckCircle, 
  X, 
  Edit3, 
  Trash2, 
  ChevronRight, 
  ChevronDown, 
  Star, 
  Flame, 
  Users, 
  MapPin,
  RotateCcw,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { workoutsAPI } from '../../services/api';

const Workout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(12);
  const [weight, setWeight] = useState(0);
  const [duration, setDuration] = useState(30);
  const [activeTimer, setActiveTimer] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [workoutData, setWorkoutData] = useState({
    overview: {
      caloriesBurnt: 0,
      hoursSpent: 0,
      exercisesCompleted: 0,
      weeklyGoal: 5,
      weeklyCompleted: 0
    },
    todayActivity: [],
    fitnessGoals: {
      currentGoal: 'Muscle Gain',
      targetWeight: 75,
      currentWeight: 70,
      weeklyWorkouts: 5,
      dailyCalorieBurn: 400
    },
    weeklyChart: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      calories: [320, 450, 380, 520, 290, 410, 350],
      duration: [45, 60, 50, 75, 40, 65, 55]
    },
    recommendations: []
  });

  const exerciseCategories = [
    { id: 'all', name: 'All Exercises', icon: Activity },
    { id: 'chest', name: 'Chest', icon: Heart },
    { id: 'back', name: 'Back', icon: Activity },
    { id: 'shoulders', name: 'Shoulders', icon: Dumbbell },
    { id: 'arms', name: 'Arms', icon: Zap },
    { id: 'legs', name: 'Legs', icon: Target },
    { id: 'core', name: 'Core', icon: Trophy },
    { id: 'cardio', name: 'Cardio', icon: Heart }
  ];

  const exerciseDatabase = [
    // Chest exercises
    { id: 1, name: 'Push-ups', category: 'chest', difficulty: 'Beginner', calories: 8, duration: 1, equipment: 'None', muscle: 'Chest, Triceps' },
    { id: 2, name: 'Bench Press', category: 'chest', difficulty: 'Intermediate', calories: 12, duration: 1, equipment: 'Barbell', muscle: 'Chest, Triceps, Shoulders' },
    { id: 3, name: 'Incline Dumbbell Press', category: 'chest', difficulty: 'Intermediate', calories: 10, duration: 1, equipment: 'Dumbbells', muscle: 'Upper Chest, Triceps' },
    { id: 4, name: 'Chest Flyes', category: 'chest', difficulty: 'Beginner', calories: 9, duration: 1, equipment: 'Dumbbells', muscle: 'Chest' },
    
    // Back exercises
    { id: 5, name: 'Pull-ups', category: 'back', difficulty: 'Advanced', calories: 10, duration: 1, equipment: 'Pull-up Bar', muscle: 'Lats, Biceps' },
    { id: 6, name: 'Bent-over Rows', category: 'back', difficulty: 'Intermediate', calories: 11, duration: 1, equipment: 'Barbell', muscle: 'Lats, Rhomboids' },
    { id: 7, name: 'Lat Pulldowns', category: 'back', difficulty: 'Beginner', calories: 9, duration: 1, equipment: 'Cable Machine', muscle: 'Lats, Biceps' },
    { id: 8, name: 'Deadlifts', category: 'back', difficulty: 'Advanced', calories: 15, duration: 1, equipment: 'Barbell', muscle: 'Back, Glutes, Hamstrings' },
    
    // Shoulders exercises
    { id: 9, name: 'Shoulder Press', category: 'shoulders', difficulty: 'Intermediate', calories: 10, duration: 1, equipment: 'Dumbbells', muscle: 'Shoulders, Triceps' },
    { id: 10, name: 'Lateral Raises', category: 'shoulders', difficulty: 'Beginner', calories: 7, duration: 1, equipment: 'Dumbbells', muscle: 'Side Delts' },
    { id: 11, name: 'Front Raises', category: 'shoulders', difficulty: 'Beginner', calories: 6, duration: 1, equipment: 'Dumbbells', muscle: 'Front Delts' },
    { id: 12, name: 'Rear Delt Flyes', category: 'shoulders', difficulty: 'Beginner', calories: 6, duration: 1, equipment: 'Dumbbells', muscle: 'Rear Delts' },
    
    // Arms exercises
    { id: 13, name: 'Bicep Curls', category: 'arms', difficulty: 'Beginner', calories: 6, duration: 1, equipment: 'Dumbbells', muscle: 'Biceps' },
    { id: 14, name: 'Tricep Dips', category: 'arms', difficulty: 'Intermediate', calories: 8, duration: 1, equipment: 'Bench', muscle: 'Triceps' },
    { id: 15, name: 'Hammer Curls', category: 'arms', difficulty: 'Beginner', calories: 6, duration: 1, equipment: 'Dumbbells', muscle: 'Biceps, Forearms' },
    { id: 16, name: 'Close-grip Push-ups', category: 'arms', difficulty: 'Intermediate', calories: 9, duration: 1, equipment: 'None', muscle: 'Triceps, Chest' },
    
    // Legs exercises
    { id: 17, name: 'Squats', category: 'legs', difficulty: 'Beginner', calories: 12, duration: 1, equipment: 'None', muscle: 'Quads, Glutes' },
    { id: 18, name: 'Lunges', category: 'legs', difficulty: 'Beginner', calories: 10, duration: 1, equipment: 'None', muscle: 'Quads, Glutes, Hamstrings' },
    { id: 19, name: 'Leg Press', category: 'legs', difficulty: 'Intermediate', calories: 13, duration: 1, equipment: 'Leg Press Machine', muscle: 'Quads, Glutes' },
    { id: 20, name: 'Calf Raises', category: 'legs', difficulty: 'Beginner', calories: 5, duration: 1, equipment: 'None', muscle: 'Calves' },
    
    // Core exercises
    { id: 21, name: 'Plank', category: 'core', difficulty: 'Beginner', calories: 5, duration: 1, equipment: 'None', muscle: 'Core, Shoulders' },
    { id: 22, name: 'Crunches', category: 'core', difficulty: 'Beginner', calories: 4, duration: 1, equipment: 'None', muscle: 'Abs' },
    { id: 23, name: 'Russian Twists', category: 'core', difficulty: 'Intermediate', calories: 6, duration: 1, equipment: 'None', muscle: 'Obliques, Core' },
    { id: 24, name: 'Mountain Climbers', category: 'core', difficulty: 'Intermediate', calories: 10, duration: 1, equipment: 'None', muscle: 'Core, Cardio' },
    
    // Cardio exercises
    { id: 25, name: 'Running', category: 'cardio', difficulty: 'Beginner', calories: 15, duration: 1, equipment: 'None', muscle: 'Full Body' },
    { id: 26, name: 'Jumping Jacks', category: 'cardio', difficulty: 'Beginner', calories: 12, duration: 1, equipment: 'None', muscle: 'Full Body' },
    { id: 27, name: 'Burpees', category: 'cardio', difficulty: 'Advanced', calories: 18, duration: 1, equipment: 'None', muscle: 'Full Body' },
    { id: 28, name: 'High Knees', category: 'cardio', difficulty: 'Beginner', calories: 10, duration: 1, equipment: 'None', muscle: 'Legs, Cardio' }
  ];

  useEffect(() => {
    const loadWorkoutData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch exercises from backend
        const exercisesResponse = await workoutsAPI.getExercises();
        const exercises = exercisesResponse.data;
        
        // Fetch workout sessions for today
        const sessionsResponse = await workoutsAPI.getSessions();
        const sessions = sessionsResponse.data;
        
        // Filter today's sessions
        const today = new Date().toISOString().split('T')[0];
        const todaySessions = sessions.filter(session => 
          session.date && session.date.startsWith(today)
        );
        
        // Calculate overview data from sessions
        const totalCalories = todaySessions.reduce((sum, session) => sum + (session.caloriesBurned || 0), 0);
        const totalDuration = todaySessions.reduce((sum, session) => sum + (session.duration || 0), 0);
        const completedExercises = todaySessions.filter(session => session.completed).length;
        
        // Transform sessions to activity format
        const todayActivity = todaySessions.map(session => ({
          id: session._id,
          name: session.exerciseName || 'Unknown Exercise',
          sets: session.sets?.length || 0,
          reps: session.sets?.[0]?.reps || 0,
          weight: session.sets?.[0]?.weight || 0,
          duration: session.duration || 0,
          calories: session.caloriesBurned || 0,
          completed: session.completed || false,
          time: new Date(session.date).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
          }),
          category: session.category || 'general'
        }));

        // Mock overview data with real calculations
        const overviewData = {
          caloriesBurnt: totalCalories,
          hoursSpent: Math.round((totalDuration / 60) * 10) / 10,
          exercisesCompleted: completedExercises,
          weeklyGoal: user?.workoutFrequency === '7' ? 7 : user?.workoutFrequency === '5-6' ? 5 : user?.workoutFrequency === '3-4' ? 4 : 3,
          weeklyCompleted: 3 // This would need weekly calculation
        };

        // Generate recommendations based on user data and activity
        const recommendations = generateWorkoutRecommendations(user, todayActivity, completedExercises);

        setWorkoutData(prev => ({
          ...prev,
          overview: overviewData,
          todayActivity: todayActivity,
          recommendations: recommendations
        }));
        
      } catch (error) {
        console.error('Error loading workout data:', error);
        
        // Fallback to mock data if API fails
        const mockTodayActivity = [
          { 
            id: 1, 
            name: 'Push-ups', 
            sets: 3, 
            reps: 15, 
            weight: 0, 
            duration: 10, 
            calories: 80, 
            completed: true, 
            time: '9:00 AM',
            category: 'chest'
          },
          { 
            id: 2, 
            name: 'Squats', 
            sets: 4, 
            reps: 12, 
            weight: 0, 
            duration: 12, 
            calories: 144, 
            completed: true, 
            time: '9:15 AM',
            category: 'legs'
          },
          { 
            id: 3, 
            name: 'Plank', 
            sets: 3, 
            reps: 1, 
            weight: 0, 
            duration: 60, 
            calories: 15, 
            completed: false, 
            time: '9:30 AM',
            category: 'core'
          }
        ];

        const mockOverview = {
          caloriesBurnt: 239,
          hoursSpent: 1.2,
          exercisesCompleted: 2,
          weeklyGoal: 5,
          weeklyCompleted: 3
        };

        const mockRecommendations = [
          {
            id: 1,
            title: 'Complete Your Core Workout',
            description: 'You have 1 core exercise remaining for today',
            type: 'reminder',
            priority: 'high'
          },
          {
            id: 2,
            title: 'Try Upper Body Focus',
            description: 'Based on your goals, add more chest and back exercises',
            type: 'suggestion',
            priority: 'medium'
          },
          {
            id: 3,
            title: 'Rest Day Tomorrow',
            description: 'Consider taking a rest day to allow muscle recovery',
            type: 'advice',
            priority: 'low'
          }
        ];

        setWorkoutData(prev => ({
          ...prev,
          overview: mockOverview,
          todayActivity: mockTodayActivity,
          recommendations: mockRecommendations
        }));
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkoutData();
  }, [user]);

  // Timer functionality
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(seconds => {
          if (seconds <= 1) {
            setIsTimerRunning(false);
            if (soundEnabled) {
              // Play completion sound (you can add actual sound here)
              console.log('Timer completed!');
            }
            return 0;
          }
          return seconds - 1;
        });
      }, 1000);
    } else if (!isTimerRunning) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds, soundEnabled]);

  const generateWorkoutRecommendations = (userData, todayActivity, completedExercises) => {
    const recommendations = [];
    
    if (userData?.primaryGoal === 'lose_weight') {
      recommendations.push({
        id: 1,
        title: 'Add Cardio Session',
        description: 'Include 20-30 minutes of cardio to boost fat burning',
        type: 'suggestion',
        priority: 'high'
      });
    } else if (userData?.primaryGoal === 'gain_muscle') {
      recommendations.push({
        id: 1,
        title: 'Focus on Strength Training',
        description: 'Prioritize compound movements and progressive overload',
        type: 'suggestion',
        priority: 'high'
      });
    }

    if (completedExercises < 3) {
      recommendations.push({
        id: 2,
        title: 'Complete Your Workout',
        description: `You have ${3 - completedExercises} exercises remaining for today`,
        type: 'reminder',
        priority: 'high'
      });
    }

    if (userData?.fitnessExperience === 'beginner') {
      recommendations.push({
        id: 3,
        title: 'Start with Bodyweight Exercises',
        description: 'Build foundation strength with basic movements',
        type: 'advice',
        priority: 'medium'
      });
    }

    return recommendations;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'Intermediate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'Advanced': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getCategoryIcon = (category) => {
    const categoryData = exerciseCategories.find(cat => cat.id === category);
    return categoryData ? categoryData.icon : Activity;
  };

  const addExerciseToWorkout = (exercise, sets, reps, weight, duration) => {
    const newExercise = {
      id: Date.now(),
      name: exercise.name,
      sets: parseInt(sets),
      reps: parseInt(reps),
      weight: parseFloat(weight),
      duration: parseInt(duration),
      calories: Math.round(exercise.calories * sets * (duration / exercise.duration)),
      completed: false,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      category: exercise.category
    };

    setWorkoutData(prev => ({
      ...prev,
      todayActivity: [...prev.todayActivity, newExercise]
    }));

    setShowAddExercise(false);
    setSelectedExercise(null);
    setSets(3);
    setReps(12);
    setWeight(0);
    setDuration(30);
    setSearchTerm('');
  };

  const toggleExerciseCompletion = (exerciseId) => {
    setWorkoutData(prev => ({
      ...prev,
      todayActivity: prev.todayActivity.map(exercise => {
        if (exercise.id === exerciseId) {
          const updatedExercise = { ...exercise, completed: !exercise.completed };
          
          // Update overview stats
          if (updatedExercise.completed) {
            prev.overview.caloriesBurnt += exercise.calories;
            prev.overview.exercisesCompleted += 1;
          } else {
            prev.overview.caloriesBurnt = Math.max(0, prev.overview.caloriesBurnt - exercise.calories);
            prev.overview.exercisesCompleted = Math.max(0, prev.overview.exercisesCompleted - 1);
          }
          
          return updatedExercise;
        }
        return exercise;
      })
    }));
  };

  const removeExercise = (exerciseId) => {
    const exercise = workoutData.todayActivity.find(ex => ex.id === exerciseId);
    if (!exercise) return;

    setWorkoutData(prev => ({
      ...prev,
      todayActivity: prev.todayActivity.filter(ex => ex.id !== exerciseId),
      overview: {
        ...prev.overview,
        caloriesBurnt: exercise.completed ? Math.max(0, prev.overview.caloriesBurnt - exercise.calories) : prev.overview.caloriesBurnt,
        exercisesCompleted: exercise.completed ? Math.max(0, prev.overview.exercisesCompleted - 1) : prev.overview.exercisesCompleted
      }
    }));
  };

  const startTimer = (seconds) => {
    setTimerSeconds(seconds);
    setIsTimerRunning(true);
    setActiveTimer(Date.now());
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
    setActiveTimer(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredExercises = exerciseDatabase.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.muscle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const OverviewCard = ({ title, value, unit, icon: Icon, color, change }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <div className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900/20`}>
              <Icon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} />
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</span>
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">{unit}</span>
          </div>
        </div>
        {change && (
          <div className={`flex items-center space-x-1 text-sm ${
            change > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className="w-4 h-4" />
            <span>{change > 0 ? '+' : ''}{change}%</span>
          </div>
        )}
      </div>
    </div>
  );

  const ExerciseCard = ({ exercise, onComplete, onRemove, onStartTimer }) => (
    <div className={`p-4 rounded-lg border transition-all duration-300 transform hover:scale-102 ${
      exercise.completed 
        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              {React.createElement(getCategoryIcon(exercise.category), { className: "w-4 h-4 text-blue-600 dark:text-blue-400" })}
            </div>
            <div>
              <h4 className={`font-medium ${exercise.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                {exercise.name}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">{exercise.time}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <span>{exercise.sets} sets</span>
            <span>{exercise.reps} reps</span>
            {exercise.weight > 0 && <span>{exercise.weight} kg</span>}
            <span>{exercise.duration} min</span>
            <span>{exercise.calories} cal</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {!exercise.completed && (
            <button
              onClick={() => onStartTimer(exercise.duration * 60)}
              className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-300 transform hover:scale-110"
              title="Start Timer"
            >
              <Timer className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onComplete(exercise.id)}
            className={`p-2 rounded-lg transition-all duration-300 transform hover:scale-110 ${
              exercise.completed
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-green-100 dark:hover:bg-green-900/30'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
          </button>
          <button
            onClick={() => onRemove(exercise.id)}
            className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-300 transform hover:scale-110"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const WeeklyChart = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Activity</h3>
      <div className="space-y-4">
        {workoutData.weeklyChart.labels.map((day, index) => (
          <div key={day} className="flex items-center space-x-4">
            <div className="w-12 text-sm font-medium text-gray-600 dark:text-gray-400">{day}</div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${(workoutData.weeklyChart.calories[index] / 600) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 w-16">
                  {workoutData.weeklyChart.calories[index]} cal
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${(workoutData.weeklyChart.duration[index] / 90) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 w-16">
                  {workoutData.weeklyChart.duration[index]} min
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center space-x-6 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Calories</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Duration</span>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading your workout data..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-6 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl animate-fade-in-up animation-delay-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2 animate-fade-in-up animation-delay-400">
              Workout Tracker 💪
            </h1>
            <p className="text-orange-100 animate-fade-in-up animation-delay-600">
              Track your exercises and achieve your fitness goals
            </p>
          </div>
          <div className="text-right animate-fade-in-up animation-delay-800">
            <div className="text-sm text-orange-100">Today</div>
            <div className="text-lg font-semibold">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Timer Widget */}
      {activeTimer && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-fade-in-up animation-delay-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <Timer className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Exercise Timer</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Stay focused on your workout</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatTime(timerSeconds)}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-300 transform hover:scale-110"
                >
                  {isTimerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <button
                  onClick={resetTimer}
                  className="p-2 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300 transform hover:scale-110"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-2 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300 transform hover:scale-110"
                >
                  {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overview */}
      <div className="animate-fade-in-up animation-delay-400">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Today's Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="animate-fade-in-up animation-delay-500">
            <OverviewCard
              title="Calories Burnt"
              value={workoutData.overview.caloriesBurnt}
              unit="cal"
              icon={Flame}
              color="red"
              change={12}
            />
          </div>
          <div className="animate-fade-in-up animation-delay-600">
            <OverviewCard
              title="Hours Spent"
              value={workoutData.overview.hoursSpent}
              unit="hrs"
              icon={Clock}
              color="blue"
              change={8}
            />
          </div>
          <div className="animate-fade-in-up animation-delay-700">
            <OverviewCard
              title="Exercises Done"
              value={workoutData.overview.exercisesCompleted}
              unit="exercises"
              icon={CheckCircle}
              color="green"
              change={-5}
            />
          </div>
          <div className="animate-fade-in-up animation-delay-800">
            <OverviewCard
              title="Weekly Progress"
              value={workoutData.overview.weeklyCompleted}
              unit={`/ ${workoutData.overview.weeklyGoal}`}
              icon={Trophy}
              color="purple"
              change={15}
            />
          </div>
        </div>
      </div>

      {/* Today's Activity & Weekly Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up animation-delay-600">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 transform transition-all duration-300 hover:shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Activity</h3>
              <button
                onClick={() => setShowAddExercise(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>Add Exercise</span>
              </button>
            </div>
            
            {workoutData.todayActivity.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Dumbbell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No exercises added yet</p>
                <p className="text-sm">Start your workout by adding some exercises!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {workoutData.todayActivity.map((exercise, index) => (
                  <div key={exercise.id} className={`animate-fade-in-up animation-delay-${700 + (index * 100)}`}>
                    <ExerciseCard
                      exercise={exercise}
                      onComplete={toggleExerciseCompletion}
                      onRemove={removeExercise}
                      onStartTimer={startTimer}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="animate-fade-in-up animation-delay-800">
          <WeeklyChart />
        </div>
      </div>

      {/* Fitness Goals */}
      <div className="animate-fade-in-up animation-delay-900">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Fitness Goals</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 transform transition-all duration-300 hover:shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="p-4 rounded-lg bg-blue-100 dark:bg-blue-900/20 inline-block mb-3">
                <Target className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Current Goal</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{workoutData.fitnessGoals.currentGoal}</p>
            </div>
            <div className="text-center">
              <div className="p-4 rounded-lg bg-green-100 dark:bg-green-900/20 inline-block mb-3">
                <Activity className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Target Weight</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {workoutData.fitnessGoals.currentWeight}kg → {workoutData.fitnessGoals.targetWeight}kg
              </p>
            </div>
            <div className="text-center">
              <div className="p-4 rounded-lg bg-purple-100 dark:bg-purple-900/20 inline-block mb-3">
                <Calendar className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Weekly Workouts</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{workoutData.fitnessGoals.weeklyWorkouts} sessions</p>
            </div>
            <div className="text-center">
              <div className="p-4 rounded-lg bg-red-100 dark:bg-red-900/20 inline-block mb-3">
                <Flame className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Daily Calorie Burn</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{workoutData.fitnessGoals.dailyCalorieBurn} cal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {workoutData.recommendations.length > 0 && (
        <div className="animate-fade-in-up animation-delay-1000">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {workoutData.recommendations.map((rec, index) => (
              <div key={rec.id} className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 transform transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in-up animation-delay-${1100 + (index * 100)}`}>
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    rec.priority === 'high' ? 'bg-red-100 dark:bg-red-900/20' :
                    rec.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                    'bg-blue-100 dark:bg-blue-900/20'
                  }`}>
                    <Star className={`w-4 h-4 ${
                      rec.priority === 'high' ? 'text-red-600 dark:text-red-400' :
                      rec.priority === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-blue-600 dark:text-blue-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">{rec.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{rec.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Exercise Modal */}
      {showAddExercise && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add Exercise</h3>
              <button
                onClick={() => {
                  setShowAddExercise(false);
                  setSelectedExercise(null);
                  setSearchTerm('');
                  setSets(3);
                  setReps(12);
                  setWeight(0);
                  setDuration(30);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-300 transform hover:scale-110"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search exercises..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
              >
                {exerciseCategories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            {/* Exercise Selection or Configuration */}
            {!selectedExercise ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {filteredExercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    onClick={() => setSelectedExercise(exercise)}
                    className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-all duration-300 transform hover:scale-102"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                          {React.createElement(getCategoryIcon(exercise.category), { className: "w-4 h-4 text-blue-600 dark:text-blue-400" })}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{exercise.name}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{exercise.muscle}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(exercise.difficulty)}`}>
                        {exercise.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>{exercise.calories} cal/min</span>
                      <span>{exercise.equipment}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                      {React.createElement(getCategoryIcon(selectedExercise.category), { className: "w-6 h-6 text-blue-600 dark:text-blue-400" })}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-lg">{selectedExercise.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{selectedExercise.muscle}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(selectedExercise.difficulty)}`}>
                      {selectedExercise.difficulty}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Equipment</span>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedExercise.equipment}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Calories/min</span>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedExercise.calories}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Total Calories</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {Math.round(selectedExercise.calories * sets * (duration / selectedExercise.duration))}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sets
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={sets}
                      onChange={(e) => setSets(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Reps
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={reps}
                      onChange={(e) => setReps(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={weight}
                      onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Duration (min)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setSelectedExercise(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-105"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => addExerciseToWorkout(selectedExercise, sets, reps, weight, duration)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
                  >
                    Add Exercise
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        
        .animation-delay-200 { animation-delay: 200ms; }
        .animation-delay-300 { animation-delay: 300ms; }
        .animation-delay-400 { animation-delay: 400ms; }
        .animation-delay-500 { animation-delay: 500ms; }
        .animation-delay-600 { animation-delay: 600ms; }
        .animation-delay-700 { animation-delay: 700ms; }
        .animation-delay-800 { animation-delay: 800ms; }
        .animation-delay-900 { animation-delay: 900ms; }
        .animation-delay-1000 { animation-delay: 1000ms; }
        .animation-delay-1100 { animation-delay: 1100ms; }
        .animation-delay-1200 { animation-delay: 1200ms; }
        .animation-delay-1300 { animation-delay: 1300ms; }
        .animation-delay-1400 { animation-delay: 1400ms; }
        .animation-delay-1500 { animation-delay: 1500ms; }
        
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default Workout;