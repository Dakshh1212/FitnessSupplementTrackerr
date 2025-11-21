import React from 'react';
import { Link } from 'react-router-dom';
import { Link as ScrollLink } from 'react-scroll';
import { useAuth } from '../../context/AuthContext';
import Footer from '../../components/Footer/Footer';

const Landing = () => {
  const { user, logout } = useAuth();

  const features = [
    {
      icon: '🏋️‍♂️',
      title: 'Workout Tracking',
      description: 'Track your exercises, sets, reps, and progress with our comprehensive workout logging system.'
    },
    {
      icon: '🥗',
      title: 'Nutrition Management',
      description: 'Monitor your daily nutrition intake, calories, and macros to achieve your fitness goals.'
    },
    {
      icon: '💊',
      title: 'Supplement Tracking',
      description: 'Keep track of your supplements, dosages, and timing for optimal health benefits.'
    },
    {
      icon: '📊',
      title: 'Progress Analytics',
      description: 'Visualize your fitness journey with detailed charts and progress tracking.'
    },
    {
      icon: '🎯',
      title: 'Goal Setting',
      description: 'Set personalized fitness goals and track your progress towards achieving them.'
    },
    {
      icon: '📱',
      title: 'Mobile Friendly',
      description: 'Access your fitness data anywhere with our responsive, mobile-optimized design.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 animate-gradient-x">
      {/* Navigation */}
      <nav className="bg-white shadow-sm backdrop-blur-sm bg-opacity-95 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors duration-300 cursor-pointer transform hover:scale-105">
                  mDMA Fitness
                </h1>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              {/* Smooth scroll links */}
              <ScrollLink
                to="features"
                smooth={true}
                duration={500}
                offset={-70}
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-all duration-300 hover:bg-indigo-50 transform hover:scale-105"
              >
                Features
              </ScrollLink>
              <ScrollLink
                to="about"
                smooth={true}
                duration={500}
                offset={-70}
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-all duration-300 hover:bg-indigo-50 transform hover:scale-105"
              >
                About
              </ScrollLink>
              <ScrollLink
                to="contact"
                smooth={true}
                duration={500}
                offset={-70}
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-all duration-300 hover:bg-indigo-50 transform hover:scale-105"
              >
                Contact
              </ScrollLink>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:bg-indigo-50 transform hover:scale-105"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/workout"
                    className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:bg-indigo-50 transform hover:scale-105"
                  >
                    Workout
                  </Link>
                  <Link
                    to="/diet"
                    className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:bg-indigo-50 transform hover:scale-105"
                  >
                    Diet
                  </Link>
                  <button
                    onClick={logout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:bg-indigo-50 transform hover:scale-105"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <svg
              className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2"
              fill="currentColor"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <polygon points="50,0 100,0 50,100 0,100" />
            </svg>

            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl animate-fade-in-up">
                  <span className="block xl:inline">Transform Your</span>{' '}
                  <span className="block text-indigo-600 xl:inline animate-pulse">Fitness Journey</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0 animate-fade-in-up animation-delay-200">
                  Track workouts, monitor nutrition, manage supplements, and achieve your fitness goals with our comprehensive health and fitness platform.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start animate-fade-in-up animation-delay-400">
                  <div className="rounded-md shadow">
                    <Link
                      to="/register"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                    >
                      Get Started Free
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      to="/login"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                    >
                      Sign In
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="h-56 w-full bg-gradient-to-r from-indigo-500 to-purple-600 sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center animate-gradient-x">
            <div className="text-white text-center animate-bounce-slow">
              <div className="text-8xl mb-4 animate-pulse">💪</div>
              <h3 className="text-2xl font-bold animate-fade-in">Your Fitness Companion</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center animate-fade-in-up">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to succeed
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our comprehensive platform provides all the tools you need to track, monitor, and achieve your fitness goals.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="relative group hover:bg-gray-50 p-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white text-2xl group-hover:bg-indigo-600 transition-all duration-300 transform group-hover:scale-110">
                    {feature.icon}
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900 group-hover:text-indigo-600 transition-colors duration-300">{feature.title}</p>
                  <p className="mt-2 ml-16 text-base text-gray-500">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-700 animate-gradient-x">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl animate-fade-in-up">
            <span className="block">Ready to get started?</span>
            <span className="block animate-pulse">Start your fitness journey today.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-indigo-200 animate-fade-in-up animation-delay-200">
            Join thousands of users who have transformed their health with our platform.
          </p>
          <Link
            to="/register"
            className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 sm:w-auto transition-all duration-300 transform hover:scale-105 hover:shadow-xl animate-fade-in-up animation-delay-400"
          >
            Sign up for free
          </Link>
        </div>
      </div>

      {/* About Section */}
      <div id="about" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center animate-fade-in-up">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">About</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Your Complete Fitness Solution
            </p>
            <p className="mt-4 max-w-3xl text-xl text-gray-500 lg:mx-auto">
              mDMA Fitness is designed to be your comprehensive companion on your fitness journey. Whether you're just starting out or you're a seasoned athlete, our platform provides the tools and insights you need to reach your goals.
            </p>
          </div>
          
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center animate-fade-in-up animation-delay-200">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-medium text-gray-900">Goal-Oriented</h3>
              <p className="mt-2 text-base text-gray-500">
                Set personalized goals and track your progress with detailed analytics and insights.
              </p>
            </div>
            
            <div className="text-center animate-fade-in-up animation-delay-400">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900">Data-Driven</h3>
              <p className="mt-2 text-base text-gray-500">
                Make informed decisions with comprehensive tracking and detailed progress reports.
              </p>
            </div>
            
            <div className="text-center animate-fade-in-up animation-delay-600">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-lg font-medium text-gray-900">User-Friendly</h3>
              <p className="mt-2 text-base text-gray-500">
                Intuitive design and seamless experience across all your devices.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div id="contact" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center animate-fade-in-up">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Contact</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Get in Touch
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Have questions or need support? We're here to help you on your fitness journey.
            </p>
          </div>
          
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center animate-fade-in-up animation-delay-200">
              <div className="text-3xl mb-4">📧</div>
              <h3 className="text-lg font-medium text-gray-900">Email</h3>
              <p className="mt-2 text-base text-gray-500">support@mdmafitness.com</p>
            </div>
            
            <div className="text-center animate-fade-in-up animation-delay-400">
              <div className="text-3xl mb-4">💬</div>
              <h3 className="text-lg font-medium text-gray-900">Live Chat</h3>
              <p className="mt-2 text-base text-gray-500">Available 24/7 for instant support</p>
            </div>
            
            <div className="text-center animate-fade-in-up animation-delay-600">
              <div className="text-3xl mb-4">📱</div>
              <h3 className="text-lg font-medium text-gray-900">Social Media</h3>
              <p className="mt-2 text-base text-gray-500">Follow us for tips and updates</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
      
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
        
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
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
      `}</style>
    </div>
  );
};

export default Landing;
