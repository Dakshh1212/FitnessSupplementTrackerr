import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Target, 
  TrendingUp, 
  Calendar, 
  Award, 
  Heart, 
  Zap, 
  Scale,
  Clock,
  Flame,
  Droplets,
  Moon,
  Sun,
  ChevronRight,
  Plus,
  BarChart3,
  PieChart,
  Users,
  Dumbbell,
  Apple,
  Pill,
  Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { usersAPI } from '../../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week'); // week, month
  const [dashboardData, setDashboardData] = useState({
    todayStats: {
      calories: 0,
      water: 0,
      steps: 0,
      workoutMinutes: 0,
      sleep: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    },
    weeklyProgress: {
      workouts: 3,
      targetWorkouts: 5,
      caloriesBurned: 1250,
      targetCalories: 2000,
      weightChange: -0.5,
      fatLoss: 1.2
    },
    monthlyProgress: {
      workouts: 12,
      targetWorkouts: 20,
      caloriesBurned: 5200,
      targetCalories: 8000,
      weightChange: -2.1,
      fatLoss: 4.8
    },
    bmi: {
      current: 0,
      category: '',
      target: 0,
      progress: 0
    },
    recentActivities: [],
    recommendations: [],
    weeklyChart: [
      { day: 'Mon', calories: 320, workouts: 1 },
      { day: 'Tue', calories: 0, workouts: 0 },
      { day: 'Wed', calories: 450, workouts: 1 },
      { day: 'Thu', calories: 280, workouts: 0 },
      { day: 'Fri', calories: 380, workouts: 1 },
      { day: 'Sat', calories: 0, workouts: 0 },
      { day: 'Sun', calories: 420, workouts: 1 }
    ]
  });

  useEffect(() => {
    // Load dashboard data from backend API
    const loadDashboardData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch dashboard data from backend
        const response = await usersAPI.getDashboard();
        const apiData = response.data;
        
        // Calculate BMI if user data is available
        let bmiData = { current: 0, category: 'Unknown', target: 0, progress: 0 };
        if (user?.height && user?.weight) {
          const heightInM = user.height / 100;
          const currentBMI = (user.weight / (heightInM * heightInM)).toFixed(1);
          let category = 'Normal';
          
          if (currentBMI < 18.5) category = 'Underweight';
          else if (currentBMI >= 25 && currentBMI < 30) category = 'Overweight';
          else if (currentBMI >= 30) category = 'Obese';
          
          const targetBMI = user.targetWeight ? (user.targetWeight / (heightInM * heightInM)).toFixed(1) : currentBMI;
          const progress = user.targetWeight ? Math.min(100, ((user.weight - user.targetWeight) / (user.weight - user.targetWeight)) * 100) : 0;
          
          bmiData = {
            current: parseFloat(currentBMI),
            category,
            target: parseFloat(targetBMI),
            progress: Math.abs(progress)
          };
        }

        // Use API data with fallback to mock data for missing fields
        const dashboardInfo = {
          todayStats: {
            calories: apiData.todayDiet?.totalCalories || 0,
            water: apiData.todayDiet?.water || 0,
            steps: apiData.todayWorkout?.steps || 0,
            workoutMinutes: apiData.todayWorkout?.duration || 0,
            sleep: apiData.todayStats?.sleep || 0,
            protein: apiData.todayDiet?.totalProtein || 0,
            carbs: apiData.todayDiet?.totalCarbs || 0,
            fat: apiData.todayDiet?.totalFat || 0
          },
          weeklyProgress: {
            workouts: apiData.weeklyStats?.workouts || 0,
            targetWorkouts: user?.workoutFrequency === '7' ? 7 : user?.workoutFrequency === '5-6' ? 5 : user?.workoutFrequency === '3-4' ? 4 : 3,
            caloriesBurned: apiData.weeklyStats?.caloriesBurned || 0,
            targetCalories: 2000,
            weightChange: apiData.weightProgress?.weeklyChange || 0,
            fatLoss: apiData.weeklyStats?.fatLoss || 0
          },
          monthlyProgress: {
            workouts: apiData.monthlyStats?.workouts || 0,
            targetWorkouts: 20,
            caloriesBurned: apiData.monthlyStats?.caloriesBurned || 0,
            targetCalories: 8000,
            weightChange: apiData.weightProgress?.monthlyChange || 0,
            fatLoss: apiData.monthlyStats?.fatLoss || 0
          },
          bmi: bmiData,
          recentActivities: apiData.recentActivities || [],
          recommendations: generateRecommendations(user || {}),
          weeklyChart: apiData.weeklyChart || [
            { day: 'Mon', calories: 0, workouts: 0 },
            { day: 'Tue', calories: 0, workouts: 0 },
            { day: 'Wed', calories: 0, workouts: 0 },
            { day: 'Thu', calories: 0, workouts: 0 },
            { day: 'Fri', calories: 0, workouts: 0 },
            { day: 'Sat', calories: 0, workouts: 0 },
            { day: 'Sun', calories: 0, workouts: 0 }
          ]
        };

        setDashboardData(dashboardInfo);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        
        // Fallback to mock data if API fails
        const mockData = {
          todayStats: {
            calories: 1850,
            water: 6,
            steps: 8420,
            workoutMinutes: 45,
            sleep: 7.5,
            protein: 85,
            carbs: 180,
            fat: 65
          },
          weeklyProgress: {
            workouts: 3,
            targetWorkouts: user?.workoutFrequency === '7' ? 7 : user?.workoutFrequency === '5-6' ? 5 : user?.workoutFrequency === '3-4' ? 4 : 3,
            caloriesBurned: 1250,
            targetCalories: 2000,
            weightChange: -0.5,
            fatLoss: 1.2
          },
          monthlyProgress: {
            workouts: 12,
            targetWorkouts: 20,
            caloriesBurned: 5200,
            targetCalories: 8000,
            weightChange: -2.1,
            fatLoss: 4.8
          },
          bmi: { current: 0, category: 'Unknown', target: 0, progress: 0 },
          recentActivities: [
            { id: 1, type: 'workout', name: 'Morning Run', duration: '30 min', calories: 320, time: '2 hours ago' },
            { id: 2, type: 'meal', name: 'Protein Smoothie', calories: 280, time: '4 hours ago' },
            { id: 3, type: 'workout', name: 'Strength Training', duration: '45 min', calories: 450, time: '1 day ago' },
            { id: 4, type: 'supplement', name: 'Whey Protein', amount: '25g', time: '1 day ago' },
            { id: 5, type: 'meal', name: 'Grilled Chicken Salad', calories: 420, time: '2 days ago' }
          ],
          recommendations: generateRecommendations(user || {}),
          weeklyChart: [
            { day: 'Mon', calories: 320, workouts: 1 },
            { day: 'Tue', calories: 0, workouts: 0 },
            { day: 'Wed', calories: 450, workouts: 1 },
            { day: 'Thu', calories: 280, workouts: 0 },
            { day: 'Fri', calories: 380, workouts: 1 },
            { day: 'Sat', calories: 0, workouts: 0 },
            { day: 'Sun', calories: 420, workouts: 1 }
          ]
        };
        
        setDashboardData(mockData);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  const generateRecommendations = (userData = {}) => {
    const recommendations = [];
    
    if (userData?.primaryGoal === 'lose_weight') {
      recommendations.push({
        id: 1,
        type: 'workout',
        title: 'Add Cardio Session',
        description: 'Include 20-30 minutes of cardio to boost fat burning',
        priority: 'high'
      });
      recommendations.push({
        id: 2,
        type: 'diet',
        title: 'Track Your Calories',
        description: 'Log your meals to maintain a caloric deficit',
        priority: 'medium'
      });
    } else if (userData?.primaryGoal === 'gain_muscle') {
      recommendations.push({
        id: 1,
        type: 'workout',
        title: 'Focus on Strength Training',
        description: 'Prioritize compound movements and progressive overload',
        priority: 'high'
      });
      recommendations.push({
        id: 2,
        type: 'supplement',
        title: 'Consider Protein Supplement',
        description: 'Ensure adequate protein intake for muscle growth',
        priority: 'medium'
      });
    } else {
      // Default recommendations for new users
      recommendations.push({
        id: 1,
        type: 'general',
        title: 'Complete Your Profile',
        description: 'Add your fitness goals and preferences for personalized recommendations',
        priority: 'high'
      });
      recommendations.push({
        id: 2,
        type: 'workout',
        title: 'Start with Basic Exercises',
        description: 'Begin your fitness journey with simple bodyweight exercises',
        priority: 'medium'
      });
    }

    if (userData?.fitnessExperience === 'beginner') {
      recommendations.push({
        id: 3,
        type: 'general',
        title: 'Start with Bodyweight Exercises',
        description: 'Build foundation strength with basic movements',
        priority: 'high'
      });
    }

    return recommendations;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getBMIColor = (category) => {
    switch (category) {
      case 'Underweight': return 'text-blue-600';
      case 'Normal': return 'text-green-600';
      case 'Overweight': return 'text-yellow-600';
      case 'Obese': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getCurrentProgress = () => {
    return selectedPeriod === 'week' ? dashboardData.weeklyProgress : dashboardData.monthlyProgress;
  };

  const StatCard = ({ icon: Icon, title, value, unit, target, color = 'blue', onClick }) => (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 transform transition-all duration-300 hover:scale-105 hover:shadow-lg ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900/20 transition-all duration-300 hover:scale-110`}>
          <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400 transition-colors duration-300`} />
        </div>
        {target && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Target: {target}{unit}
          </span>
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">
        {value}<span className="text-lg text-gray-500 ml-1">{unit}</span>
      </p>
    </div>
  );

  const ProgressCard = ({ title, current, target, unit, color = 'blue' }) => {
    const percentage = Math.min(100, (current / target) * 100);
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {current}/{target} {unit}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
          <div 
            className={`bg-${color}-600 h-3 rounded-full transition-all duration-500 ease-out`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {percentage.toFixed(0)}% Complete
        </p>
      </div>
    );
  };

  const ActivityItem = ({ activity }) => {
    const getActivityIcon = (type) => {
      switch (type) {
        case 'workout': return <Activity className="w-5 h-5 text-blue-600 transition-colors duration-300" />;
        case 'meal': return <Droplets className="w-5 h-5 text-green-600 transition-colors duration-300" />;
        case 'supplement': return <Zap className="w-5 h-5 text-purple-600 transition-colors duration-300" />;
        default: return <Clock className="w-5 h-5 text-gray-600 transition-colors duration-300" />;
      }
    };

    return (
      <div className="flex items-center space-x-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-300 transform hover:scale-102 cursor-pointer">
        <div className="flex-shrink-0 transform transition-all duration-300 hover:scale-110">
          {getActivityIcon(activity.type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {activity.name}
          </p>
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            {activity.duration && <span>{activity.duration}</span>}
            {activity.calories && <span>• {activity.calories} cal</span>}
            {activity.amount && <span>• {activity.amount}</span>}
          </div>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {activity.time}
        </div>
      </div>
    );
  };

  const RecommendationCard = ({ recommendation }) => {
    const getRecommendationIcon = (type) => {
      switch (type) {
        case 'workout': return <Activity className="w-5 h-5 transition-colors duration-300" />;
        case 'diet': return <Droplets className="w-5 h-5 transition-colors duration-300" />;
        case 'supplement': return <Zap className="w-5 h-5 transition-colors duration-300" />;
        default: return <Target className="w-5 h-5 transition-colors duration-300" />;
      }
    };

    const getPriorityColor = (priority) => {
      switch (priority) {
        case 'high': return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 hover:border-red-300 hover:bg-red-100 dark:hover:border-red-700 dark:hover:bg-red-900/30';
        case 'medium': return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20 hover:border-yellow-300 hover:bg-yellow-100 dark:hover:border-yellow-700 dark:hover:bg-yellow-900/30';
        default: return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20 hover:border-blue-300 hover:bg-blue-100 dark:hover:border-blue-700 dark:hover:bg-blue-900/30';
      }
    };

    return (
      <div className={`p-4 rounded-lg border transition-all duration-300 transform hover:scale-105 cursor-pointer ${getPriorityColor(recommendation.priority)}`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-1 transform transition-all duration-300 hover:scale-110">
            {getRecommendationIcon(recommendation.type)}
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              {recommendation.title}
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {recommendation.description}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 transition-all duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    );
  };

  const WeeklyChart = () => {
    const maxCalories = Math.max(...dashboardData.weeklyChart.map(d => d.calories));
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 transform transition-all duration-300 hover:shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Activity</h3>
        <div className="flex items-end justify-between h-32 space-x-2">
          {dashboardData.weeklyChart.map((day, index) => (
            <div key={day.day} className="flex flex-col items-center flex-1">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-t-lg relative overflow-hidden">
                <div 
                  className="bg-blue-500 rounded-t-lg transition-all duration-500 ease-out"
                  style={{ 
                    height: `${(day.calories / maxCalories) * 100}px`,
                    minHeight: day.calories > 0 ? '4px' : '0px'
                  }}
                />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">{day.day}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">{day.calories}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    );
  }

  const currentProgress = getCurrentProgress();

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl animate-fade-in-up animation-delay-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2 animate-fade-in-up animation-delay-400">
              {getGreeting()}, {user?.firstName || 'User'}! 👋
            </h1>
            <p className="text-blue-100 animate-fade-in-up animation-delay-600">
              Ready to crush your fitness goals today?
            </p>
          </div>
          <div className="text-right animate-fade-in-up animation-delay-800">
            <div className="text-sm text-blue-100">Today</div>
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

      {/* Quick Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up animation-delay-400">
        <button 
          onClick={() => navigate('/workout')}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 transform transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center space-x-3"
        >
          <Dumbbell className="w-6 h-6 text-blue-600" />
          <span className="font-medium text-gray-900 dark:text-white">Workout</span>
        </button>
        <button 
          onClick={() => navigate('/diet')}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 transform transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center space-x-3"
        >
          <Apple className="w-6 h-6 text-green-600" />
          <span className="font-medium text-gray-900 dark:text-white">Nutrition</span>
        </button>
        <button 
          onClick={() => navigate('/supplements')}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 transform transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center space-x-3"
        >
          <Pill className="w-6 h-6 text-purple-600" />
          <span className="font-medium text-gray-900 dark:text-white">Supplements</span>
        </button>
        <button 
          onClick={() => navigate('/settings')}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 transform transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center space-x-3"
        >
          <Settings className="w-6 h-6 text-gray-600" />
          <span className="font-medium text-gray-900 dark:text-white">Settings</span>
        </button>
      </div>

      {/* Today's Stats */}
      <div className="animate-fade-in-up animation-delay-400">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Today's Activity</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="animate-fade-in-up animation-delay-600">
            <StatCard
              icon={Flame}
              title="Calories Burned"
              value={dashboardData.todayStats.calories}
              unit=""
              target={2000}
              color="red"
            />
          </div>
          <div className="animate-fade-in-up animation-delay-700">
            <StatCard
              icon={Droplets}
              title="Water Intake"
              value={dashboardData.todayStats.water}
              unit=" glasses"
              target={8}
              color="blue"
            />
          </div>
          <div className="animate-fade-in-up animation-delay-800">
            <StatCard
              icon={Activity}
              title="Steps"
              value={dashboardData.todayStats.steps.toLocaleString()}
              unit=""
              target="10,000"
              color="green"
            />
          </div>
          <div className="animate-fade-in-up animation-delay-900">
            <StatCard
              icon={Clock}
              title="Workout Time"
              value={dashboardData.todayStats.workoutMinutes}
              unit=" min"
              target={60}
              color="purple"
            />
          </div>
        </div>
        
        {/* Nutrition Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="animate-fade-in-up animation-delay-1000">
            <StatCard
              icon={Heart}
              title="Protein"
              value={dashboardData.todayStats.protein}
              unit="g"
              target={120}
              color="red"
            />
          </div>
          <div className="animate-fade-in-up animation-delay-1100">
            <StatCard
              icon={Zap}
              title="Carbs"
              value={dashboardData.todayStats.carbs}
              unit="g"
              target={200}
              color="yellow"
            />
          </div>
          <div className="animate-fade-in-up animation-delay-1200">
            <StatCard
              icon={Droplets}
              title="Fat"
              value={dashboardData.todayStats.fat}
              unit="g"
              target={70}
              color="orange"
            />
          </div>
        </div>
      </div>

      {/* Progress Overview with Period Toggle */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up animation-delay-600">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Progress Overview</h2>
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setSelectedPeriod('week')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-300 ${
                  selectedPeriod === 'week' 
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setSelectedPeriod('month')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-300 ${
                  selectedPeriod === 'month' 
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Month
              </button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="animate-fade-in-up animation-delay-800">
              <ProgressCard
                title="Workouts Completed"
                current={currentProgress.workouts}
                target={currentProgress.targetWorkouts}
                unit="workouts"
                color="blue"
              />
            </div>
            <div className="animate-fade-in-up animation-delay-900">
              <ProgressCard
                title="Calories Burned"
                current={currentProgress.caloriesBurned}
                target={currentProgress.targetCalories}
                unit="cal"
                color="red"
              />
            </div>
            
            {/* Progress Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 mb-2">
                  <Scale className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Weight Change</span>
                </div>
                <p className={`text-lg font-bold ${currentProgress.weightChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {currentProgress.weightChange > 0 ? '+' : ''}{currentProgress.weightChange} kg
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Fat Loss</span>
                </div>
                <p className="text-lg font-bold text-blue-600">
                  {currentProgress.fatLoss}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* BMI Tracking */}
        <div className="animate-fade-in-up animation-delay-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">BMI Tracking</h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20 transition-all duration-300 hover:scale-110">
                  <Scale className="w-6 h-6 text-green-600 dark:text-green-400 transition-colors duration-300" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Current BMI
                  </h3>
                  <p className={`text-sm font-medium ${getBMIColor(dashboardData.bmi.category)}`}>
                    {dashboardData.bmi.category}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {dashboardData.bmi.current}
                </div>
                {dashboardData.bmi.target !== dashboardData.bmi.current && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Target: {dashboardData.bmi.target}
                  </div>
                )}
              </div>
            </div>
            
            {user?.height && user?.weight && (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Height</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {user.height} cm
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Weight</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {user.weight} kg
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activities & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up animation-delay-800">
        {/* Recent Activities */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activities</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center transition-all duration-300 hover:scale-105">
              View All <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transform transition-all duration-300 hover:shadow-lg">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {dashboardData.recentActivities.map((activity, index) => (
                <div key={activity.id} className={`animate-fade-in-up animation-delay-${1000 + (index * 100)}`}>
                  <ActivityItem activity={activity} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recommendations</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-all duration-300 hover:scale-105">
              Customize
            </button>
          </div>
          <div className="space-y-3">
            {dashboardData.recommendations.map((recommendation, index) => (
              <div key={recommendation.id} className={`animate-fade-in-up animation-delay-${1000 + (index * 100)}`}>
                <RecommendationCard recommendation={recommendation} />
              </div>
            ))}
            
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 transform transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in-up animation-delay-1200">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => navigate('/workout')}
                  className="flex items-center justify-center p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-300 transform hover:scale-105"
                >
                  <Plus className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-90" />
                  Log Workout
                </button>
                <button 
                  onClick={() => navigate('/diet')}
                  className="flex items-center justify-center p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-all duration-300 transform hover:scale-105"
                >
                  <Plus className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-90" />
                  Add Meal
                </button>
              </div>
            </div>
          </div>
        </div>
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
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
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
        
        .animation-delay-700 {
          animation-delay: 700ms;
        }
        
        .animation-delay-800 {
          animation-delay: 800ms;
        }
        
        .animation-delay-900 {
          animation-delay: 900ms;
        }
        
        .animation-delay-1000 {
          animation-delay: 1000ms;
        }
        
        .animation-delay-1100 {
          animation-delay: 1100ms;
        }
        
        .animation-delay-1200 {
          animation-delay: 1200ms;
        }
        
        .animation-delay-1300 {
          animation-delay: 1300ms;
        }
        
        .animation-delay-1400 {
          animation-delay: 1400ms;
        }
        
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;