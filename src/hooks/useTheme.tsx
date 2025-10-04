import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

// The original Theme interface your components expect
export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    cardBg: string;
    text: string;
    muted: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    fifa: {
      blue: string;
      green: string;
      gold: string;
      red: string;
      purple: string;
    };
  };
}

// Your original, complete theme definitions
const themes: Record<string, Theme> = {
  futvisionary: {
    name: 'FUT Visionary',
    colors: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      accent: '#f59e0b',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      surface: 'rgba(30, 41, 59, 0.8)',
      cardBg: 'rgba(15, 23, 42, 0.9)',
      text: '#ffffff',
      muted: '#94a3b8',
      border: 'rgba(59, 130, 246, 0.3)',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      fifa: { blue: '#3b82f6', green: '#10b981', gold: '#f59e0b', red: '#ef4444', purple: '#8b5cf6' }
    }
  },
  dark: {
    name: 'Midnight',
    colors: {
        primary: '#6366f1',
        secondary: '#ec4899',
        accent: '#06b6d4',
        background: 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #374151 100%)',
        surface: 'rgba(31, 41, 55, 0.8)',
        cardBg: 'rgba(17, 24, 39, 0.9)',
        text: '#f9fafb',
        muted: '#9ca3af',
        border: 'rgba(99, 102, 241, 0.3)',
        success: '#34d399',
        warning: '#fbbf24',
        error: '#f87171',
        fifa: { blue: '#6366f1', green: '#34d399', gold: '#fbbf24', red: '#f87171', purple: '#ec4899' }
    }
  },
  // ... include all your other themes here (light, champions, neon)
};

// The original context type your components expect
interface ThemeContextType {
  currentTheme: Theme;
  currentThemeName: string;
  setTheme: (themeName: string) => void;
  themes: string[];
  themeData: Record<string, Theme>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [currentThemeName, setCurrentThemeName] = useState<string>('futvisionary');

  useEffect(() => {
    const savedTheme = localStorage.getItem('futalyst-theme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentThemeName(savedTheme);
    }
  }, []);

  // This useEffect now correctly applies the theme colors as CSS variables
  useEffect(() => {
    localStorage.setItem('futalyst-theme', currentThemeName);
    
    const theme = themes[currentThemeName];
    if (!theme) return;

    const root = document.documentElement;

    // Set CSS variables for App.css to use
    root.style.setProperty('--theme-primary', theme.colors.primary);
    root.style.setProperty('--theme-secondary', theme.colors.secondary);
    root.style.setProperty('--theme-accent', theme.colors.accent);
    root.style.setProperty('--theme-surface', theme.colors.surface);
    root.style.setProperty('--theme-card-bg', theme.colors.cardBg);
    root.style.setProperty('--theme-text', theme.colors.text);
    root.style.setProperty('--theme-muted', theme.colors.muted);
    root.style.setProperty('--theme-border', theme.colors.border);
    
    // Set body background for the gradient
    document.body.style.background = theme.colors.background;

  }, [currentThemeName]);

  const setTheme = (themeName: string) => {
    if (themes[themeName]) {
      setCurrentThemeName(themeName);
    }
  };

  const value = {
    // This provides the `currentTheme` object that App.tsx needs
    currentTheme: themes[currentThemeName], 
    currentThemeName,
    setTheme,
    themes: Object.keys(themes),
    themeData: themes,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
