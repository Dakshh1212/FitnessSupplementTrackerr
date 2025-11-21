import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from '../Footer/Footer';
import { useTheme } from '../../context/ThemeContext';

const Layout = ({ children }) => {
  const location = useLocation();
  const { sidebarCollapsed } = useTheme();

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case '/dashboard':
        return 'Dashboard';
      case '/workout':
        return 'Workout';
      case '/diet':
        return 'Diet & Nutrition';
      case '/supplements':
        return 'Supplements';
      case '/settings':
        return 'Settings';
      case '/profile':
        return 'Profile';
      default:
        return 'mDMA';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className={`flex flex-col flex-1 transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
        {/* Header */}
        <Header title={getPageTitle()} />
        
        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default Layout;