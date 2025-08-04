import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Theme {
  colors: {
    background: string;
    surface: string;
    surfaceElevated: string;
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
    border: {
      light: string;
      medium: string;
      strong: string;
    };
    sidebar: {
      background: string;
      text: string;
      textSecondary: string;
      buttonActive: string;
      buttonHover: string;
      border: string;
    };
    status: {
      success: string;
      error: string;
      warning: string;
      info: string;
    };
    gradient: {
      primary: string;
      secondary: string;
    };
  };
  shadows: {
    small: string;
    medium: string;
    large: string;
  };
}

export const lightTheme: Theme = {
  colors: {
    background: '#f8fafc',
    surface: '#ffffff',
    surfaceElevated: '#ffffff',
    text: {
      primary: '#111827',
      secondary: '#6b7280',
      tertiary: '#9ca3af',
    },
    border: {
      light: '#f3f4f6',
      medium: '#e5e7eb',
      strong: '#d1d5db',
    },
    sidebar: {
      background: '#1f2937',
      text: '#f9fafb',
      textSecondary: '#d1d5db',
      buttonActive: '#4b5563',
      buttonHover: '#4b5563',
      border: '#374151',
    },
    status: {
      success: '#059669',
      error: '#b91c1c',
      warning: '#d97706',
      info: '#4f46e5',
    },
    gradient: {
      primary: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      secondary: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    },
  },
  shadows: {
    small: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    large: '0 10px 25px rgba(99, 102, 241, 0.3)',
  },
};

export const darkTheme: Theme = {
  colors: {
    background: '#0f172a',
    surface: '#1e293b',
    surfaceElevated: '#334155',
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
      tertiary: '#94a3b8',
    },
    border: {
      light: '#334155',
      medium: '#475569',
      strong: '#64748b',
    },
    sidebar: {
      background: '#020617',
      text: '#f8fafc',
      textSecondary: '#cbd5e1',
      buttonActive: '#334155',
      buttonHover: '#334155',
      border: '#1e293b',
    },
    status: {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#6366f1',
    },
    gradient: {
      primary: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      secondary: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    },
  },
  shadows: {
    small: '0 1px 3px 0 rgba(0, 0, 0, 0.3)',
    medium: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
    large: '0 10px 25px rgba(0, 0, 0, 0.5)',
  },
};

interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      return JSON.parse(savedTheme);
    }
    // Default to system preference
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const theme = isDarkMode ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const value = {
    theme,
    isDarkMode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
