import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Dumbbell, 
  Apple, 
  Pill, 
  Settings, 
  User, 
  Activity,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { clsx } from 'clsx';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { sidebarCollapsed, toggleSidebar } = useTheme();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Workout', href: '/workout', icon: Dumbbell },
    { name: 'Diet', href: '/diet', icon: Apple },
    { name: 'Supplements', href: '/supplements', icon: Pill },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Mobile backdrop */}
      <div className="lg:hidden fixed inset-0 z-40 bg-gray-600 bg-opacity-75" />
      
      {/* Sidebar */}
      <div className={clsx(
        'fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-primary-600 rounded-xl">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                mDMA
              </span>
            </div>
          )}
          
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={clsx(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                )}
                title={sidebarCollapsed ? item.name : undefined}
              >
                <Icon className={clsx(
                  'flex-shrink-0 h-5 w-5',
                  isActive 
                    ? 'text-primary-600 dark:text-primary-400' 
                    : 'text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300'
                )} />
                {!sidebarCollapsed && (
                  <span className="ml-3">{item.name}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-3">
          {!sidebarCollapsed && user && (
            <div className="mb-3 px-3 py-2">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className={clsx(
              'group flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white transition-colors',
              sidebarCollapsed && 'justify-center'
            )}
            title={sidebarCollapsed ? 'Logout' : undefined}
          >
            <LogOut className="flex-shrink-0 h-5 w-5 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300" />
            {!sidebarCollapsed && (
              <span className="ml-3">Logout</span>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;