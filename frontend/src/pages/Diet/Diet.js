import React, { useState, useEffect } from 'react';
import { 
  User, 
  Scale, 
  Target, 
  Plus, 
  Clock, 
  Droplets, 
  Apple, 
  Coffee, 
  Utensils, 
  Moon,
  Bell,
  AlertCircle,
  CheckCircle,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  Heart,
  Zap,
  Activity,
  Pill,
  ChevronRight,
  X,
  Edit3,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { dietAPI } from '../../services/api';

const Diet = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddFood, setShowAddFood] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('breakfast');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(1);
  
  const [dietData, setDietData] = useState({
    personalInfo: {
      weight: 0,
      height: 0,
      bmi: 0,
      bmiCategory: '',
      dailyCalorieGoal: 2000,
      dailyProteinGoal: 120,
      dailyCarbGoal: 200,
      dailyFatGoal: 70,
      waterGoal: 8
    },
    todayIntake: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      water: 0
    },
    meals: {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: []
    },
    reminders: [
      { id: 1, type: 'water', message: 'Time to drink water! Stay hydrated.', completed: false, time: '10:00 AM' },
      { id: 2, type: 'fruit', message: 'Add some fruits to your diet today.', completed: false, time: '2:00 PM' },
      { id: 3, type: 'protein', message: 'Include protein in your next meal.', completed: true, time: '6:00 PM' },
      { id: 4, type: 'vegetables', message: 'Don\'t forget your daily vegetables!', completed: false, time: '7:00 PM' }
    ],
    weeklyProgress: {
      calories: [1800, 2100, 1950, 2200, 1850, 2000, 1900],
      weight: [70.5, 70.3, 70.1, 70.0, 69.8, 69.7, 69.5]
    }
  });

  const foodDatabase = [
    // Breakfast items
    { id: 1, name: 'Oatmeal (1 cup)', category: 'breakfast', calories: 150, protein: 5, carbs: 27, fat: 3, fiber: 4 },
    { id: 2, name: 'Greek Yogurt (1 cup)', category: 'breakfast', calories: 130, protein: 23, carbs: 9, fat: 0, fiber: 0 },
    { id: 3, name: 'Banana (1 medium)', category: 'breakfast', calories: 105, protein: 1, carbs: 27, fat: 0, fiber: 3 },
    { id: 4, name: 'Eggs (2 large)', category: 'breakfast', calories: 140, protein: 12, carbs: 1, fat: 10, fiber: 0 },
    { id: 5, name: 'Whole Wheat Toast (2 slices)', category: 'breakfast', calories: 160, protein: 8, carbs: 28, fat: 2, fiber: 6 },
    
    // Lunch items
    { id: 6, name: 'Grilled Chicken Breast (150g)', category: 'lunch', calories: 231, protein: 43, carbs: 0, fat: 5, fiber: 0 },
    { id: 7, name: 'Brown Rice (1 cup)', category: 'lunch', calories: 216, protein: 5, carbs: 45, fat: 2, fiber: 4 },
    { id: 8, name: 'Mixed Vegetables (1 cup)', category: 'lunch', calories: 50, protein: 2, carbs: 10, fat: 0, fiber: 4 },
    { id: 9, name: 'Quinoa (1 cup)', category: 'lunch', calories: 222, protein: 8, carbs: 39, fat: 4, fiber: 5 },
    { id: 10, name: 'Salmon Fillet (150g)', category: 'lunch', calories: 280, protein: 39, carbs: 0, fat: 12, fiber: 0 },
    
    // Dinner items
    { id: 11, name: 'Lean Beef (150g)', category: 'dinner', calories: 250, protein: 35, carbs: 0, fat: 11, fiber: 0 },
    { id: 12, name: 'Sweet Potato (1 medium)', category: 'dinner', calories: 112, protein: 2, carbs: 26, fat: 0, fiber: 4 },
    { id: 13, name: 'Broccoli (1 cup)', category: 'dinner', calories: 25, protein: 3, carbs: 5, fat: 0, fiber: 3 },
    { id: 14, name: 'Pasta (1 cup)', category: 'dinner', calories: 200, protein: 7, carbs: 40, fat: 1, fiber: 2 },
    { id: 15, name: 'Turkey Breast (150g)', category: 'dinner', calories: 189, protein: 35, carbs: 0, fat: 4, fiber: 0 },
    
    // Snacks
    { id: 16, name: 'Almonds (30g)', category: 'snacks', calories: 174, protein: 6, carbs: 6, fat: 15, fiber: 4 },
    { id: 17, name: 'Apple (1 medium)', category: 'snacks', calories: 95, protein: 0, carbs: 25, fat: 0, fiber: 4 },
    { id: 18, name: 'Protein Bar', category: 'snacks', calories: 200, protein: 20, carbs: 15, fat: 8, fiber: 3 },
    { id: 19, name: 'Greek Yogurt (small)', category: 'snacks', calories: 80, protein: 15, carbs: 6, fat: 0, fiber: 0 },
    { id: 20, name: 'Mixed Nuts (30g)', category: 'snacks', calories: 180, protein: 5, carbs: 6, fat: 16, fiber: 3 }
  ];

  useEffect(() => {
    const loadDietData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch diet entries for the selected date
        const dietEntries = await dietAPI.getDietEntries({ date: selectedDate });
        
        // Fetch food database
        const foodsResponse = await dietAPI.getFoods();
        
        // Calculate BMI and personal info
        let personalInfo = {
          weight: user?.weight || 70,
          height: user?.height || 175,
          bmi: 0,
          bmiCategory: '',
          dailyCalorieGoal: user?.dailyCalorieGoal || 2000,
          dailyProteinGoal: user?.dailyProteinGoal || 120,
          dailyCarbGoal: user?.dailyCarbGoal || 200,
          dailyFatGoal: user?.dailyFatGoal || 70,
          waterGoal: user?.waterGoal || 8
        };

        if (personalInfo.height && personalInfo.weight) {
          const heightInM = personalInfo.height / 100;
          const bmi = (personalInfo.weight / (heightInM * heightInM)).toFixed(1);
          let category = 'Normal';
          
          if (bmi < 18.5) category = 'Underweight';
          else if (bmi >= 25 && bmi < 30) category = 'Overweight';
          else if (bmi >= 30) category = 'Obese';
          
          personalInfo.bmi = parseFloat(bmi);
          personalInfo.bmiCategory = category;
        }

        // Process diet entries to calculate today's intake and organize meals
        let todayIntake = { calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 };
        let meals = { breakfast: [], lunch: [], dinner: [], snacks: [] };

        if (dietEntries && dietEntries.length > 0) {
          dietEntries.forEach(entry => {
            // Calculate totals
            todayIntake.calories += entry.totalCalories || 0;
            todayIntake.protein += entry.totalProtein || 0;
            todayIntake.carbs += entry.totalCarbs || 0;
            todayIntake.fat += entry.totalFat || 0;
            todayIntake.water += entry.water || 0;

            // Organize by meal type
            entry.meals.forEach(meal => {
              meal.foods.forEach(food => {
                const mealItem = {
                  id: food._id || food.id,
                  name: food.name,
                  calories: (food.calories * food.quantity) || 0,
                  protein: (food.protein * food.quantity) || 0,
                  carbs: (food.carbs * food.quantity) || 0,
                  fat: (food.fat * food.quantity) || 0,
                  time: meal.time || '12:00 PM',
                  quantity: food.quantity || 1
                };
                
                if (meals[meal.type]) {
                  meals[meal.type].push(mealItem);
                }
              });
            });
          });
        }

        setDietData(prev => ({
          ...prev,
          personalInfo,
          todayIntake,
          meals
        }));

      } catch (error) {
        console.error('Error loading diet data:', error);
        
        // Fallback to mock data if API fails
        let personalInfo = {
          weight: user?.weight || 70,
          height: user?.height || 175,
          bmi: 0,
          bmiCategory: '',
          dailyCalorieGoal: 2000,
          dailyProteinGoal: 120,
          dailyCarbGoal: 200,
          dailyFatGoal: 70,
          waterGoal: 8
        };

        if (personalInfo.height && personalInfo.weight) {
          const heightInM = personalInfo.height / 100;
          const bmi = (personalInfo.weight / (heightInM * heightInM)).toFixed(1);
          let category = 'Normal';
          
          if (bmi < 18.5) category = 'Underweight';
          else if (bmi >= 25 && bmi < 30) category = 'Overweight';
          else if (bmi >= 30) category = 'Obese';
          
          personalInfo.bmi = parseFloat(bmi);
          personalInfo.bmiCategory = category;
        }

        // Mock today's intake data
        const mockTodayIntake = {
          calories: 1450,
          protein: 85,
          carbs: 180,
          fat: 55,
          water: 6
        };

        // Mock meals data
        const mockMeals = {
          breakfast: [
            { id: 1, name: 'Oatmeal with Banana', calories: 255, protein: 6, carbs: 54, fat: 3, time: '8:00 AM', quantity: 1 },
            { id: 2, name: 'Greek Yogurt', calories: 130, protein: 23, carbs: 9, fat: 0, time: '8:15 AM', quantity: 1 }
          ],
          lunch: [
            { id: 3, name: 'Grilled Chicken Salad', calories: 350, protein: 35, carbs: 15, fat: 18, time: '1:00 PM', quantity: 1 },
            { id: 4, name: 'Brown Rice', calories: 216, protein: 5, carbs: 45, fat: 2, time: '1:00 PM', quantity: 1 }
          ],
          dinner: [
            { id: 5, name: 'Salmon with Vegetables', calories: 330, protein: 41, carbs: 15, fat: 12, time: '7:30 PM', quantity: 1 }
          ],
          snacks: [
            { id: 6, name: 'Almonds', calories: 174, protein: 6, carbs: 6, fat: 15, time: '3:30 PM', quantity: 1 }
          ]
        };

        setDietData(prev => ({
          ...prev,
          personalInfo,
          todayIntake: mockTodayIntake,
          meals: mockMeals
        }));
      }
      
      setIsLoading(false);
    };

    loadDietData();
  }, [user, selectedDate]);

  const getBMIColor = (category) => {
    switch (category) {
      case 'Underweight': return 'text-blue-600';
      case 'Normal': return 'text-green-600';
      case 'Overweight': return 'text-yellow-600';
      case 'Obese': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getMealIcon = (mealType) => {
    switch (mealType) {
      case 'breakfast': return <Coffee className="w-5 h-5" />;
      case 'lunch': return <Utensils className="w-5 h-5" />;
      case 'dinner': return <Moon className="w-5 h-5" />;
      case 'snacks': return <Apple className="w-5 h-5" />;
      default: return <Utensils className="w-5 h-5" />;
    }
  };

  const getReminderIcon = (type) => {
    switch (type) {
      case 'water': return <Droplets className="w-5 h-5 text-blue-600" />;
      case 'fruit': return <Apple className="w-5 h-5 text-green-600" />;
      case 'protein': return <Heart className="w-5 h-5 text-red-600" />;
      case 'vegetables': return <Activity className="w-5 h-5 text-green-600" />;
      default: return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const addFoodToMeal = async (food, mealType, quantity) => {
    try {
      const newMealItem = {
        id: Date.now(),
        name: food.name,
        calories: Math.round(food.calories * quantity),
        protein: Math.round(food.protein * quantity),
        carbs: Math.round(food.carbs * quantity),
        fat: Math.round(food.fat * quantity),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        quantity
      };

      // Create diet entry for backend
      const dietEntryData = {
        date: selectedDate,
        meals: [{
          type: mealType,
          time: newMealItem.time,
          foods: [{
            foodId: food.id || food._id,
            name: food.name,
            quantity: quantity,
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbs,
            fat: food.fat
          }]
        }],
        totalCalories: newMealItem.calories,
        totalProtein: newMealItem.protein,
        totalCarbs: newMealItem.carbs,
        totalFat: newMealItem.fat
      };

      // Save to backend
      await dietAPI.createDietEntry(dietEntryData);

      // Update local state
      setDietData(prev => ({
        ...prev,
        meals: {
          ...prev.meals,
          [mealType]: [...prev.meals[mealType], newMealItem]
        },
        todayIntake: {
          calories: prev.todayIntake.calories + newMealItem.calories,
          protein: prev.todayIntake.protein + newMealItem.protein,
          carbs: prev.todayIntake.carbs + newMealItem.carbs,
          fat: prev.todayIntake.fat + newMealItem.fat,
          water: prev.todayIntake.water
        }
      }));

      setShowAddFood(false);
      setSelectedFood(null);
      setQuantity(1);
      setSearchTerm('');
    } catch (error) {
      console.error('Error adding food to meal:', error);
      // Still update local state as fallback
      const newMealItem = {
        id: Date.now(),
        name: food.name,
        calories: Math.round(food.calories * quantity),
        protein: Math.round(food.protein * quantity),
        carbs: Math.round(food.carbs * quantity),
        fat: Math.round(food.fat * quantity),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        quantity
      };

      setDietData(prev => ({
        ...prev,
        meals: {
          ...prev.meals,
          [mealType]: [...prev.meals[mealType], newMealItem]
        },
        todayIntake: {
          calories: prev.todayIntake.calories + newMealItem.calories,
          protein: prev.todayIntake.protein + newMealItem.protein,
          carbs: prev.todayIntake.carbs + newMealItem.carbs,
          fat: prev.todayIntake.fat + newMealItem.fat,
          water: prev.todayIntake.water
        }
      }));

      setShowAddFood(false);
      setSelectedFood(null);
      setQuantity(1);
      setSearchTerm('');
    }
  };

  const removeFoodFromMeal = async (mealType, foodId) => {
    const foodItem = dietData.meals[mealType].find(item => item.id === foodId);
    if (!foodItem) return;

    try {
      // Note: This would require a more complex backend implementation
      // For now, we'll just update the local state
      // In a full implementation, you'd need to identify and update the specific diet entry
      
      setDietData(prev => ({
        ...prev,
        meals: {
          ...prev.meals,
          [mealType]: prev.meals[mealType].filter(item => item.id !== foodId)
        },
        todayIntake: {
          calories: Math.max(0, prev.todayIntake.calories - foodItem.calories),
          protein: Math.max(0, prev.todayIntake.protein - foodItem.protein),
          carbs: Math.max(0, prev.todayIntake.carbs - foodItem.carbs),
          fat: Math.max(0, prev.todayIntake.fat - foodItem.fat),
          water: prev.todayIntake.water
        }
      }));
    } catch (error) {
      console.error('Error removing food from meal:', error);
    }
  };

  const toggleReminder = (reminderId) => {
    setDietData(prev => ({
      ...prev,
      reminders: prev.reminders.map(reminder =>
        reminder.id === reminderId
          ? { ...reminder, completed: !reminder.completed }
          : reminder
      )
    }));
  };

  const addWater = () => {
    setDietData(prev => ({
      ...prev,
      todayIntake: {
        ...prev.todayIntake,
        water: Math.min(prev.personalInfo.waterGoal, prev.todayIntake.water + 1)
      }
    }));
  };

  const filteredFoods = foodDatabase.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    food.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const NutritionCard = ({ title, current, goal, unit, color, icon: Icon }) => {
    const percentage = Math.min(100, (current / goal) * 100);
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900/20`}>
              <Icon className={`w-4 h-4 text-${color}-600 dark:text-${color}-400`} />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{title}</span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {current}/{goal} {unit}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
          <div 
            className={`bg-${color}-600 h-2 rounded-full transition-all duration-500 ease-out`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {percentage.toFixed(0)}% of daily goal
        </p>
      </div>
    );
  };

  const MealSection = ({ mealType, meals, title }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 transform transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
            {getMealIcon(mealType)}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">{title}</h3>
        </div>
        <button
          onClick={() => {
            setSelectedMealType(mealType);
            setShowAddFood(true);
          }}
          className="flex items-center space-x-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-300 transform hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">Add</span>
        </button>
      </div>
      
      {meals.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Utensils className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No items added yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {meals.map((meal, index) => (
            <div key={meal.id} className={`flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg animate-fade-in-up animation-delay-${200 + (index * 100)}`}>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 dark:text-white">{meal.name}</h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{meal.time}</span>
                </div>
                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-600 dark:text-gray-400">
                  <span>{meal.calories} cal</span>
                  <span>P: {meal.protein}g</span>
                  <span>C: {meal.carbs}g</span>
                  <span>F: {meal.fat}g</span>
                  {meal.quantity > 1 && <span>Qty: {meal.quantity}</span>}
                </div>
              </div>
              <button
                onClick={() => removeFoodFromMeal(mealType, meal.id)}
                className="ml-3 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all duration-300 transform hover:scale-110"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {meals.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-900 dark:text-white">Total:</span>
            <div className="flex space-x-4 text-gray-600 dark:text-gray-400">
              <span>{meals.reduce((sum, meal) => sum + meal.calories, 0)} cal</span>
              <span>P: {meals.reduce((sum, meal) => sum + meal.protein, 0)}g</span>
              <span>C: {meals.reduce((sum, meal) => sum + meal.carbs, 0)}g</span>
              <span>F: {meals.reduce((sum, meal) => sum + meal.fat, 0)}g</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading your nutrition data..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-6 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl animate-fade-in-up animation-delay-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2 animate-fade-in-up animation-delay-400">
              Nutrition & Diet 🥗
            </h1>
            <p className="text-green-100 animate-fade-in-up animation-delay-600">
              Track your meals and reach your nutrition goals
            </p>
          </div>
          <div className="text-right animate-fade-in-up animation-delay-800">
            <div className="text-sm text-green-100">Today</div>
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

      {/* Personal Body Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up animation-delay-400">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Info</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Weight</span>
              <span className="font-medium text-gray-900 dark:text-white">{dietData.personalInfo.weight} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Height</span>
              <span className="font-medium text-gray-900 dark:text-white">{dietData.personalInfo.height} cm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">BMI</span>
              <span className={`font-medium ${getBMIColor(dietData.personalInfo.bmiCategory)}`}>
                {dietData.personalInfo.bmi} ({dietData.personalInfo.bmiCategory})
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/20">
              <Target className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Intake</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Calories</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {dietData.todayIntake.calories} / {dietData.personalInfo.dailyCalorieGoal}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Protein</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {dietData.todayIntake.protein}g / {dietData.personalInfo.dailyProteinGoal}g
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Water</span>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {dietData.todayIntake.water} / {dietData.personalInfo.waterGoal} glasses
                </span>
                <button
                  onClick={addWater}
                  className="p-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-300 transform hover:scale-110"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                <Pill className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Supplements</h3>
            </div>
            <button
              onClick={() => navigate('/supplements')}
              className="flex items-center space-x-1 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-all duration-300 transform hover:scale-105"
            >
              <span className="text-sm">View All</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <span className="text-sm text-gray-900 dark:text-white">Whey Protein</span>
              <span className="text-xs text-purple-600 dark:text-purple-400">25g</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <span className="text-sm text-gray-900 dark:text-white">Multivitamin</span>
              <span className="text-xs text-purple-600 dark:text-purple-400">1 tablet</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <span className="text-sm text-gray-900 dark:text-white">Omega-3</span>
              <span className="text-xs text-purple-600 dark:text-purple-400">1000mg</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nutrition Progress */}
      <div className="animate-fade-in-up animation-delay-600">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Daily Nutrition Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="animate-fade-in-up animation-delay-700">
            <NutritionCard
              title="Calories"
              current={dietData.todayIntake.calories}
              goal={dietData.personalInfo.dailyCalorieGoal}
              unit="cal"
              color="red"
              icon={Activity}
            />
          </div>
          <div className="animate-fade-in-up animation-delay-800">
            <NutritionCard
              title="Protein"
              current={dietData.todayIntake.protein}
              goal={dietData.personalInfo.dailyProteinGoal}
              unit="g"
              color="blue"
              icon={Heart}
            />
          </div>
          <div className="animate-fade-in-up animation-delay-900">
            <NutritionCard
              title="Carbs"
              current={dietData.todayIntake.carbs}
              goal={dietData.personalInfo.dailyCarbGoal}
              unit="g"
              color="yellow"
              icon={Zap}
            />
          </div>
          <div className="animate-fade-in-up animation-delay-1000">
            <NutritionCard
              title="Water"
              current={dietData.todayIntake.water}
              goal={dietData.personalInfo.waterGoal}
              unit="glasses"
              color="blue"
              icon={Droplets}
            />
          </div>
        </div>
      </div>

      {/* Today's Diet History */}
      <div className="animate-fade-in-up animation-delay-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Today's Meals</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="animate-fade-in-up animation-delay-900">
            <MealSection mealType="breakfast" meals={dietData.meals.breakfast} title="Breakfast" />
          </div>
          <div className="animate-fade-in-up animation-delay-1000">
            <MealSection mealType="lunch" meals={dietData.meals.lunch} title="Lunch" />
          </div>
          <div className="animate-fade-in-up animation-delay-1100">
            <MealSection mealType="dinner" meals={dietData.meals.dinner} title="Dinner" />
          </div>
          <div className="animate-fade-in-up animation-delay-1200">
            <MealSection mealType="snacks" meals={dietData.meals.snacks} title="Snacks" />
          </div>
        </div>
      </div>

      {/* Reminders Section */}
      <div className="animate-fade-in-up animation-delay-1000">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Health Reminders</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 transform transition-all duration-300 hover:shadow-lg">
          <div className="space-y-3">
            {dietData.reminders.map((reminder, index) => (
              <div key={reminder.id} className={`flex items-center justify-between p-4 rounded-lg transition-all duration-300 transform hover:scale-102 animate-fade-in-up animation-delay-${1100 + (index * 100)} ${
                reminder.completed 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                  : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {getReminderIcon(reminder.type)}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      reminder.completed 
                        ? 'text-green-800 dark:text-green-200 line-through' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {reminder.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{reminder.time}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleReminder(reminder.id)}
                  className={`p-2 rounded-lg transition-all duration-300 transform hover:scale-110 ${
                    reminder.completed
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
                  }`}
                >
                  {reminder.completed ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Food Modal */}
      {showAddFood && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Add Food to {selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)}
              </h3>
              <button
                onClick={() => {
                  setShowAddFood(false);
                  setSelectedFood(null);
                  setSearchTerm('');
                  setQuantity(1);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-300 transform hover:scale-110"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for food items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
              />
            </div>

            {/* Food Selection */}
            {!selectedFood ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredFoods.map((food) => (
                  <div
                    key={food.id}
                    onClick={() => setSelectedFood(food)}
                    className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-all duration-300 transform hover:scale-102"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{food.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{food.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">{food.calories} cal</p>
                        <div className="text-xs text-gray-500 dark:text-gray-400 space-x-2">
                          <span>P: {food.protein}g</span>
                          <span>C: {food.carbs}g</span>
                          <span>F: {food.fat}g</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">{selectedFood.name}</h4>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Calories</span>
                      <p className="font-medium text-gray-900 dark:text-white">{Math.round(selectedFood.calories * quantity)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Protein</span>
                      <p className="font-medium text-gray-900 dark:text-white">{Math.round(selectedFood.protein * quantity)}g</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Carbs</span>
                      <p className="font-medium text-gray-900 dark:text-white">{Math.round(selectedFood.carbs * quantity)}g</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Fat</span>
                      <p className="font-medium text-gray-900 dark:text-white">{Math.round(selectedFood.fat * quantity)}g</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setSelectedFood(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-105"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => addFoodToMeal(selectedFood, selectedMealType, quantity)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
                  >
                    Add to {selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)}
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
        .animation-delay-400 { animation-delay: 400ms; }
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

export default Diet;