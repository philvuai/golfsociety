import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Theme {
  colors: {
    background: string;
    backgroundPattern: string;
    surface: string;
    surfaceElevated: string;
    glass: {
      background: string;
      border: string;
    };
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      accent: string;
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
      accent: string;
      rainbow: string;
      mesh: string;
    };
    accent: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
  };
  shadows: {
    small: string;
    medium: string;
    large: string;
    xl: string;
    glow: string;
    inner: string;
  };
  blur: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  animations: {
    fast: string;
    normal: string;
    slow: string;
  };
}

export const lightTheme: Theme = {
  colors: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundPattern: 'radial-gradient(circle at 25% 25%, #fbbf24 0%, transparent 50%), radial-gradient(circle at 75% 75%, #10b981 0%, transparent 50%)',
    surface: 'rgba(255, 255, 255, 0.85)',
    surfaceElevated: 'rgba(255, 255, 255, 0.95)',
    glass: {
      background: 'rgba(255, 255, 255, 0.1)',
      border: 'rgba(255, 255, 255, 0.2)',
    },
    text: {
      primary: '#111827',
      secondary: '#6b7280',
      tertiary: '#9ca3af',
      accent: '#6366f1',
    },
    border: {
      light: 'rgba(255, 255, 255, 0.1)',
      medium: 'rgba(255, 255, 255, 0.2)',
      strong: 'rgba(255, 255, 255, 0.3)',
    },
    sidebar: {
      background: 'rgba(31, 41, 55, 0.95)',
      text: '#f9fafb',
      textSecondary: '#d1d5db',
      buttonActive: 'rgba(75, 85, 99, 0.8)',
      buttonHover: 'rgba(75, 85, 99, 0.6)',
      border: 'rgba(55, 65, 81, 0.5)',
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
      accent: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      rainbow: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
      mesh: 'conic-gradient(from 180deg at 50% 50%, #6366f1 0deg, #8b5cf6 72deg, #06b6d4 144deg, #10b981 216deg, #f59e0b 288deg, #6366f1 360deg)',
    },
    accent: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      tertiary: '#06b6d4',
    },
  },
  shadows: {
    small: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    large: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    glow: '0 0 20px rgba(99, 102, 241, 0.3), 0 0 40px rgba(99, 102, 241, 0.1)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },
  blur: {
    sm: 'blur(4px)',
    md: 'blur(8px)',
    lg: 'blur(16px)',
    xl: 'blur(24px)',
  },
  animations: {
    fast: '0.15s ease-out',
    normal: '0.3s ease-out',
    slow: '0.5s ease-out',
  },
};

export const darkTheme: Theme = {
  colors: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
    backgroundPattern: 'radial-gradient(circle at 20% 80%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 20%, #8b5cf6 0%, transparent 50%), radial-gradient(circle at 40% 40%, #06b6d4 0%, transparent 50%)',
    surface: 'rgba(30, 41, 59, 0.85)',
    surfaceElevated: 'rgba(51, 65, 85, 0.95)',
    glass: {
      background: 'rgba(0, 0, 0, 0.1)',
      border: 'rgba(255, 255, 255, 0.1)',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
      tertiary: '#94a3b8',
      accent: '#6366f1',
    },
    border: {
      light: 'rgba(255, 255, 255, 0.05)',
      medium: 'rgba(255, 255, 255, 0.1)',
      strong: 'rgba(255, 255, 255, 0.2)',
    },
    sidebar: {
      background: 'rgba(2, 6, 23, 0.95)',
      text: '#f8fafc',
      textSecondary: '#cbd5e1',
      buttonActive: 'rgba(51, 65, 85, 0.8)',
      buttonHover: 'rgba(51, 65, 85, 0.6)',
      border: 'rgba(30, 41, 59, 0.5)',
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
      accent: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      rainbow: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 25%, #06b6d4 50%, #10b981 75%, #f59e0b 100%)',
      mesh: 'conic-gradient(from 180deg at 50% 50%, #3b82f6 0deg, #8b5cf6 72deg, #06b6d4 144deg, #10b981 216deg, #f59e0b 288deg, #3b82f6 360deg)',
    },
    accent: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      tertiary: '#06b6d4',
    },
  },
  shadows: {
    small: '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    medium: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    large: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
    glow: '0 0 20px rgba(99, 102, 241, 0.4), 0 0 40px rgba(99, 102, 241, 0.2)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)',
  },
  blur: {
    sm: 'blur(4px)',
    md: 'blur(8px)',
    lg: 'blur(16px)',
    xl: 'blur(24px)',
  },
  animations: {
    fast: '0.15s ease-out',
    normal: '0.3s ease-out',
    slow: '0.5s ease-out',
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
