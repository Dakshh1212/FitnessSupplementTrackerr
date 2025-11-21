import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout Components
import Layout from './components/Layout/Layout';
import AuthLayout from './components/Layout/AuthLayout';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Landing Page
import Landing from './pages/Landing/Landing';

// Main Pages
import Dashboard from './pages/Dashboard/Dashboard';
import Workout from './pages/Workout/Workout';
import Diet from './pages/Diet/Diet';
import Supplements from './pages/Supplements/Supplements';
import Settings from './pages/Settings/Settings';
import Profile from './pages/Profile/Profile';

// Loading Component
import LoadingSpinner from './components/UI/LoadingSpinner';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Onboarding Route Component - Now checks if user has completed onboarding
const OnboardingRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // For now, let's allow access to all pages regardless of onboarding status
  // Users can complete their profile when they want to
  return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          <PublicRoute>
            <AuthLayout>
              <Login />
            </AuthLayout>
          </PublicRoute>
        } />
        
        <Route path="/register" element={
          <PublicRoute>
            <AuthLayout>
              <Register />
            </AuthLayout>
          </PublicRoute>
        } />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <OnboardingRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </OnboardingRoute>
        } />
        
        <Route path="/workout" element={
          <OnboardingRoute>
            <Layout>
              <Workout />
            </Layout>
          </OnboardingRoute>
        } />
        
        <Route path="/diet" element={
          <OnboardingRoute>
            <Layout>
              <Diet />
            </Layout>
          </OnboardingRoute>
        } />
        
        <Route path="/supplements" element={
          <OnboardingRoute>
            <Layout>
              <Supplements />
            </Layout>
          </OnboardingRoute>
        } />
        
        <Route path="/settings" element={
          <OnboardingRoute>
            <Layout>
              <Settings />
            </Layout>
          </OnboardingRoute>
        } />
        
        <Route path="/profile" element={
          <OnboardingRoute>
            <Layout>
              <Profile />
            </Layout>
          </OnboardingRoute>
        } />
        
        {/* Default Route - Landing Page */}
        <Route path="/" element={<Landing />} />
        
        {/* 404 Route */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-gray-600 mb-8">Page not found</p>
              <button 
                onClick={() => window.history.back()}
                className="btn btn-primary"
              >
                Go Back
              </button>
            </div>
          </div>
        } />
      </Routes>
    </div>
  );
}

export default App;