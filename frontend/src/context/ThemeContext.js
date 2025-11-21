import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state
const initialState = {
  theme: 'light', // 'light' or 'dark'
  primaryColor: 'blue', // 'blue', 'green', 'purple', 'orange'
  sidebarCollapsed: false,
};

// Action types
const THEME_ACTIONS = {
  SET_THEME: 'SET_THEME',
  SET_PRIMARY_COLOR: 'SET_PRIMARY_COLOR',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_SIDEBAR_COLLAPSED: 'SET_SIDEBAR_COLLAPSED',
  RESET_THEME: 'RESET_THEME',
};

// Reducer
const themeReducer = (state, action) => {
  switch (action.type) {
    case THEME_ACTIONS.SET_THEME:
      return {
        ...state,
        theme: action.payload,
      };
    case THEME_ACTIONS.SET_PRIMARY_COLOR:
      return {
        ...state,
        primaryColor: action.payload,
      };
    case THEME_ACTIONS.TOGGLE_SIDEBAR:
      return {
        ...state,
        sidebarCollapsed: !state.sidebarCollapsed,
      };
    case THEME_ACTIONS.SET_SIDEBAR_COLLAPSED:
      return {
        ...state,
        sidebarCollapsed: action.payload,
      };
    case THEME_ACTIONS.RESET_THEME:
      return initialState;
    default:
      return state;
  }
};

// Create context
const ThemeContext = createContext();

// Provider component
export const ThemeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const savedPrimaryColor = localStorage.getItem('primaryColor');
    const savedSidebarState = localStorage.getItem('sidebarCollapsed');

    if (savedTheme) {
      dispatch({ type: THEME_ACTIONS.SET_THEME, payload: savedTheme });
    }
    if (savedPrimaryColor) {
      dispatch({ type: THEME_ACTIONS.SET_PRIMARY_COLOR, payload: savedPrimaryColor });
    }
    if (savedSidebarState !== null) {
      dispatch({ 
        type: THEME_ACTIONS.SET_SIDEBAR_COLLAPSED, 
        payload: JSON.parse(savedSidebarState) 
      });
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    if (state.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Set CSS custom properties for primary color
    const colorMap = {
      blue: {
        50: '#eff6ff',
        100: '#dbeafe',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        900: '#1e3a8a',
      },
      green: {
        50: '#f0fdf4',
        100: '#dcfce7',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
        900: '#14532d',
      },
      purple: {
        50: '#faf5ff',
        100: '#f3e8ff',
        500: '#a855f7',
        600: '#9333ea',
        700: '#7c3aed',
        900: '#581c87',
      },
      orange: {
        50: '#fff7ed',
        100: '#ffedd5',
        500: '#f97316',
        600: '#ea580c',
        700: '#c2410c',
        900: '#9a3412',
      },
    };

    const colors = colorMap[state.primaryColor] || colorMap.blue;
    
    Object.entries(colors).forEach(([shade, color]) => {
      root.style.setProperty(`--color-primary-${shade}`, color);
    });

    localStorage.setItem('theme', state.theme);
    localStorage.setItem('primaryColor', state.primaryColor);
  }, [state.theme, state.primaryColor]);

  // Save sidebar state
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(state.sidebarCollapsed));
  }, [state.sidebarCollapsed]);

  const setTheme = (theme) => {
    dispatch({ type: THEME_ACTIONS.SET_THEME, payload: theme });
  };

  const setPrimaryColor = (color) => {
    dispatch({ type: THEME_ACTIONS.SET_PRIMARY_COLOR, payload: color });
  };

  const toggleSidebar = () => {
    dispatch({ type: THEME_ACTIONS.TOGGLE_SIDEBAR });
  };

  const setSidebarCollapsed = (collapsed) => {
    dispatch({ type: THEME_ACTIONS.SET_SIDEBAR_COLLAPSED, payload: collapsed });
  };

  const resetTheme = () => {
    dispatch({ type: THEME_ACTIONS.RESET_THEME });
    localStorage.removeItem('theme');
    localStorage.removeItem('primaryColor');
    localStorage.removeItem('sidebarCollapsed');
  };

  const value = {
    ...state,
    setTheme,
    setPrimaryColor,
    toggleSidebar,
    setSidebarCollapsed,
    resetTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};