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

// --- REVISED & ENHANCED THEMES ---
const themes: Record<string, Theme> = {
  futvisionary: {
    name: 'FUT Visionary',
    colors: {
      primary: '#00D4FF', // Brighter, more energetic cyan
      secondary: '#6C5CE7', // Deep violet
      accent: '#00FF88', // Sharp, data-vis green
      background: 'linear-gradient(145deg, #0D1117 0%, #161B22 100%)', // Deeper, more subtle space gradient
      surface: 'rgba(22, 27, 34, 0.8)',
      cardBg: 'rgba(13, 17, 23, 0.7)',
      text: '#EAEAEA',
      muted: '#8892B0',
      border: 'rgba(0, 212, 255, 0.2)',
      success: '#28A745',
      warning: '#FFC107',
      error: '#DC3545',
      fifa: { blue: '#00D4FF', green: '#00FF88', gold: '#FFC107', red: '#DC3545', purple: '#6C5CE7' }
    }
  },
  champions: {
    name: 'Champions',
    colors: {
      primary: '#FBC02D', // Iconic Champions League Gold
      secondary: '#0D47A1', // Deep Champions League Blue
      accent: '#FFFFFF',
      background: 'linear-gradient(135deg, #001f3f 0%, #000b1a 100%)', // Very dark navy
      surface: 'rgba(13, 71, 161, 0.5)',
      cardBg: 'rgba(0, 31, 63, 0.7)',
      text: '#FFFFFF',
      muted: '#B0BEC5',
      border: 'rgba(251, 192, 45, 0.3)',
      success: '#4CAF50',
      warning: '#FBC02D',
      error: '#F44336',
      fifa: { blue: '#0D47A1', green: '#4CAF50', gold: '#FBC02D', red: '#F44336', purple: '#5E35B1' }
    }
  },
  volt: {
    name: 'Volt',
    colors: {
      primary: '#DFFF00', // Electric "Volt" Green/Yellow
      secondary: '#FF00FF', // Hot Magenta
      accent: '#00FFFF', // Cyan accent
      background: 'linear-gradient(135deg, #050505 0%, #1C1C1C 100%)', // Near-black for max contrast
      surface: 'rgba(28, 28, 28, 0.8)',
      cardBg: 'rgba(10, 10, 10, 0.7)',
      text: '#FFFFFF',
      muted: '#A0A0A0',
      border: 'rgba(223, 255, 0, 0.3)',
      success: '#DFFF00',
      warning: '#FFBE0B',
      error: '#FF00FF',
      fifa: { blue: '#00FFFF', green: '#DFFF00', gold: '#FFBE0B', red: '#FF00FF', purple: '#7f00ff' }
    }
  },
  light: {
    name: 'Day Mode',
    colors: {
      primary: '#0052CC', // Professional, strong blue
      secondary: '#5E4DB2',
      accent: '#DE350B',
      background: '#F4F5F7', // Soft, off-white to reduce eye-strain
      surface: 'rgba(255, 255, 255, 0.9)',
      cardBg: 'rgba(255, 255, 255, 1)',
      text: '#172B4D', // Dark navy for crisp text
      muted: '#6B778C',
      border: 'rgba(0, 82, 204, 0.2)',
      success: '#00875A',
      warning: '#FFAB00',
      error: '#DE350B',
      fifa: { blue: '#0052CC', green: '#00875A', gold: '#FFAB00', red: '#DE350B', purple: '#5E4DB2' }
    }
  },
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
