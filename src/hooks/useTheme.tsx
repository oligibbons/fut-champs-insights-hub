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
  const [currentThemeName, setCurrentThemeName] = useState<string>(() => {
    return localStorage.getItem('futalyst-theme') || 'futvisionary';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(currentThemeName === 'light' ? 'light' : 'dark');
  }, [currentThemeName]);

  const setTheme = (themeName: string) => {
    if (themes[themeName]) {
      localStorage.setItem('futalyst-theme', themeName);
      setCurrentThemeName(themeName);
    }
  };

  const value = {
    currentThemeName,
    // THIS IS THE FIX: Restore the currentTheme object that App.tsx needs
    currentTheme: themes[currentThemeName],
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
