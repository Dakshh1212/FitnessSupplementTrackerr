import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5002/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  completeOnboarding: (onboardingData) => api.post('/auth/onboarding', onboardingData),
  changePassword: (passwordData) => api.put('/auth/password', passwordData),
  deleteAccount: () => api.delete('/auth/account'),
  getStats: () => api.get('/auth/stats'),
};

// Users API
export const usersAPI = {
  getDashboard: () => api.get('/users/dashboard'),
  getProgress: (params) => api.get('/users/progress', { params }),
  addWeight: (weightData) => api.post('/users/weight', weightData),
  getStats: () => api.get('/users/stats'),
};

// Workouts API
export const workoutsAPI = {
  // Exercises
  getExercises: (params) => api.get('/workouts/exercises', { params }),
  getExercise: (id) => api.get(`/workouts/exercises/${id}`),
  
  // Workout Sessions
  createSession: (sessionData) => api.post('/workouts/sessions', sessionData),
  getSessions: (params) => api.get('/workouts/sessions', { params }),
  getSession: (id) => api.get(`/workouts/sessions/${id}`),
  updateSession: (id, sessionData) => api.put(`/workouts/sessions/${id}`, sessionData),
  deleteSession: (id) => api.delete(`/workouts/sessions/${id}`),
  
  // Statistics
  getStats: (params) => api.get('/workouts/stats', { params }),
  getFrequentExercises: () => api.get('/workouts/stats/frequent'),
  getDailyStats: (params) => api.get('/workouts/stats/daily', { params }),
  
  // Recommendations
  getRecommendations: () => api.get('/workouts/recommendations'),
  
  // Workout Plans
  createPlan: (planData) => api.post('/workouts/plans', planData),
  getPlans: () => api.get('/workouts/plans'),
};

// Diet API
export const dietAPI = {
  // Food Items
  getFoodItems: (params) => api.get('/diet/foods', { params }),
  getFoodItem: (id) => api.get(`/diet/foods/${id}`),
  
  // Diet Entries
  createEntry: (entryData) => api.post('/diet/entries', entryData),
  getEntries: (params) => api.get('/diet/entries', { params }),
  getEntryByDate: (date) => api.get(`/diet/entries/date/${date}`),
  updateEntry: (id, entryData) => api.put(`/diet/entries/${id}`, entryData),
  addMeal: (mealData) => api.post('/diet/entries/today/meals', mealData),
  
  // Nutrition Analysis
  getNutritionSummary: (params) => api.get('/diet/nutrition/summary', { params }),
  getDailyBreakdown: (params) => api.get('/diet/nutrition/daily', { params }),
  getTopFoods: (params) => api.get('/diet/nutrition/top-foods', { params }),
  
  // Reminders
  getReminders: () => api.get('/diet/reminders'),
  createReminder: (reminderData) => api.post('/diet/reminders', reminderData),
  updateReminder: (id, reminderData) => api.put(`/diet/reminders/${id}`, reminderData),
  deleteReminder: (id) => api.delete(`/diet/reminders/${id}`),
};

// Supplements API
export const supplementsAPI = {
  // Supplements
  getSupplements: (params) => api.get('/supplements', { params }),
  getSupplement: (id) => api.get(`/supplements/${id}`),
  getRecommendations: () => api.get('/supplements/recommendations'),
  getCategories: () => api.get('/supplements/categories'),
  
  // Supplement Intake
  getIntake: (params) => api.get('/supplements/intake', { params }),
  recordIntake: (intakeData) => api.post('/supplements/intake', intakeData),
  getIntakeSummary: (params) => api.get('/supplements/intake/summary', { params }),
  
  // Supplement Plans
  getPlans: () => api.get('/supplements/plans'),
  createPlan: (planData) => api.post('/supplements/plans', planData),
  
  // Reviews
  getReviews: (supplementId, params) => api.get(`/supplements/${supplementId}/reviews`, { params }),
  createReview: (supplementId, reviewData) => api.post(`/supplements/${supplementId}/reviews`, reviewData),
  updateReview: (supplementId, reviewId, reviewData) => 
    api.put(`/supplements/${supplementId}/reviews/${reviewId}`, reviewData),
  deleteReview: (supplementId, reviewId) => 
    api.delete(`/supplements/${supplementId}/reviews/${reviewId}`),
};

export default api;