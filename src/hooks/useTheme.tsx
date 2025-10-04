import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

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

// Your existing theme definitions are perfect, no changes needed here.
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
  light: {
    name: 'Clean White',
    colors: {
      primary: '#2563eb',
      secondary: '#7c3aed',
      accent: '#dc2626',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
      surface: 'rgba(248, 250, 252, 0.9)',
      cardBg: 'rgba(255, 255, 255, 0.9)',
      text: '#1e293b',
      muted: '#64748b',
      border: 'rgba(37, 99, 235, 0.2)',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      fifa: { blue: '#2563eb', green: '#059669', gold: '#d97706', red: '#dc2626', purple: '#7c3aed' }
    }
  },
  champions: {
    name: 'Champions League',
    colors: {
      primary: '#1e40af',
      secondary: '#7c2d12',
      accent: '#eab308',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 50%, #5b21b6 100%)',
      surface: 'rgba(30, 58, 138, 0.8)',
      cardBg: 'rgba(30, 64, 175, 0.9)',
      text: '#ffffff',
      muted: '#cbd5e1',
      border: 'rgba(234, 179, 8, 0.4)',
      success: '#16a34a',
      warning: '#eab308',
      error: '#dc2626',
      fifa: { blue: '#1e40af', green: '#16a34a', gold: '#eab308', red: '#dc2626', purple: '#7c2d12' }
    }
  },
  neon: {
    name: 'Neon Gaming',
    colors: {
      primary: '#06ffa5',
      secondary: '#ff006e',
      accent: '#ffbe0b',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0033 50%, #330066 100%)',
      surface: 'rgba(26, 0, 51, 0.8)',
      cardBg: 'rgba(10, 10, 10, 0.9)',
      text: '#ffffff',
      muted: '#a855f7',
      border: 'rgba(6, 255, 165, 0.4)',
      success: '#06ffa5',
      warning: '#ffbe0b',
      error: '#ff006e',
      fifa: { blue: '#3b82f6', green: '#06ffa5', gold: '#ffbe0b', red: '#ff006e', purple: '#a855f7' }
    }
  }
};

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

  // THIS IS THE CORRECTED SECTION
  useEffect(() => {
    localStorage.setItem('futalyst-theme', currentThemeName);
    
    const theme = themes[currentThemeName];
    const root = document.documentElement; // Get the root element (<html>)

    // Apply the theme by setting the CSS custom properties
    root.style.setProperty('--theme-primary', theme.colors.primary);
    root.style.setProperty('--theme-secondary', theme.colors.secondary);
    root.style.setProperty('--theme-accent', theme.colors.accent);
    root.style.setProperty('--theme-background', theme.colors.background);
    root.style.setProperty('--theme-surface', theme.colors.surface);
    root.style.setProperty('--theme-card-bg', theme.colors.cardBg);
    root.style.setProperty('--theme-text', theme.colors.text);
    root.style.setProperty('--theme-muted', theme.colors.muted);
    root.style.setProperty('--theme-border', theme.colors.border);
    
    // Also set the body background for the gradient to work correctly
    document.body.style.background = theme.colors.background;

  }, [currentThemeName]);

  const setTheme = (themeName: string) => {
    if (themes[themeName]) {
      setCurrentThemeName(themeName);
    }
  };

  const currentTheme = themes[currentThemeName];

  const value = {
    currentTheme,
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
