import React from 'react';
import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <Link to="/" className="flex justify-center">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary-600 rounded-xl">
              <Activity className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              mDMA
            </span>
          </div>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-gray-200 dark:border-gray-700">
          {children}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          © 2024 mDMA. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;