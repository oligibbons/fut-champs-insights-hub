import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

// The original Theme interface your components expect
export interface Theme {
  name: string;
  colors: {
    primary: string; secondary: string; accent: string; background: string;
    surface: string; cardBg: string; text: string; muted: string; border: string;
    success: string; warning: string; error: string;
    fifa: { blue: string; green: string; gold: string; red: string; purple: string; };
  };
}

// Your beautiful custom themes
const themes: Record<string, Theme> = {
  futvisionary: {
    name: 'FUT Visionary',
    colors: {
      primary: 'hsl(191, 100%, 50%)',
      secondary: 'hsl(247, 78%, 69%)',
      accent: 'hsl(149, 100%, 50%)',
      background: 'hsl(210, 15%, 8%)',
      surface: 'rgba(22, 27, 34, 0.8)',
      cardBg: 'hsl(210, 22%, 7%)',
      text: 'hsl(0, 0%, 92%)',
      muted: 'hsl(220, 13%, 60%)',
      border: 'hsla(191, 100%, 50%, 0.2)',
      success: '#28A745', warning: '#FFC107', error: '#DC3545',
      fifa: { blue: '#00D4FF', green: '#00FF88', gold: '#FFC107', red: '#DC3545', purple: '#6C5CE7' }
    }
  },
  light: {
    name: 'Day Mode',
    colors: {
      primary: 'hsl(221, 100%, 40%)',
      secondary: 'hsl(248, 44%, 56%)',
      accent: 'hsl(14, 86%, 47%)',
      background: 'hsl(220, 16%, 96%)',
      surface: 'rgba(255, 255, 255, 0.9)',
      cardBg: 'hsl(0, 0%, 100%)',
      text: 'hsl(211, 39%, 23%)',
      muted: 'hsl(214, 12%, 47%)',
      border: 'hsla(221, 100%, 40%, 0.2)',
      success: '#00875A', warning: '#FFAB00', error: '#DE350B',
      fifa: { blue: '#0052CC', green: '#00875A', gold: '#FFAB00', red: '#DE350B', purple: '#5E4DB2' }
    }
  },
  // You can add your "Champions" and "Volt" themes back here
};

interface ThemeContextType {
  currentThemeName: string;
  setTheme: (themeName: string) => void;
  themes: string[];
  themeData: Record<string, Theme>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Default to 'futvisionary' to ensure a dark theme on first load
  const [currentThemeName, setCurrentThemeName] = useState<string>(() => {
    return localStorage.getItem('futalyst-theme') || 'futvisionary';
  });

  // This useEffect is the heart of the fix. It runs whenever the theme name changes.
  useEffect(() => {
    const root = window.document.documentElement;

    // 1. Remove any existing theme class
    root.classList.remove('light', 'dark');

    // 2. Add the correct theme class. All non-light themes are considered dark.
    const newThemeClass = currentThemeName === 'light' ? 'light' : 'dark';
    root.classList.add(newThemeClass);

    // 3. Save the new theme choice to local storage so it persists
    localStorage.setItem('futalyst-theme', currentThemeName);

  }, [currentThemeName]); // Re-run this effect when currentThemeName changes

  const setTheme = (themeName: string) => {
    if (themes[themeName]) {
      setCurrentThemeName(themeName);
    }
  };

  const value = {
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
