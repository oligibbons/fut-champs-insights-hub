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

// --- NEW THEMES ---
const themes: Record<string, Theme> = {
  midnightPitch: {
    name: 'Midnight Pitch',
    colors: {
      primary: 'hsl(130, 80%, 50%)',
      secondary: 'hsl(210, 50%, 60%)',
      accent: 'hsl(130, 80%, 50%)',
      background: 'hsl(220, 15%, 5%)',
      surface: 'rgba(30, 41, 59, 0.5)',
      cardBg: 'hsl(220, 15%, 8%)',
      text: 'hsl(220, 10%, 90%)',
      muted: 'hsl(220, 10%, 60%)',
      border: 'hsla(130, 80%, 50%, 0.2)',
      success: 'hsl(140, 70%, 45%)',
      warning: 'hsl(45, 90%, 55%)',
      error: 'hsl(0, 80%, 60%)',
      fifa: { blue: 'hsl(210, 90%, 60%)', green: 'hsl(130, 80%, 50%)', gold: 'hsl(45, 90%, 55%)', red: 'hsl(0, 80%, 60%)', purple: 'hsl(260, 80%, 70%)' }
    }
  },
  goldenGoal: {
    name: 'Golden Goal',
    colors: {
      primary: 'hsl(45, 80%, 60%)',
      secondary: 'hsl(215, 30%, 30%)',
      accent: 'hsl(45, 80%, 60%)',
      background: 'hsl(215, 60%, 10%)',
      surface: 'rgba(23, 37, 84, 0.5)',
      cardBg: 'hsl(215, 60%, 13%)',
      text: 'hsl(45, 20%, 95%)',
      muted: 'hsl(215, 20%, 65%)',
      border: 'hsla(45, 80%, 60%, 0.2)',
      success: 'hsl(140, 70%, 45%)',
      warning: 'hsl(45, 90%, 55%)',
      error: 'hsl(0, 80%, 60%)',
      fifa: { blue: 'hsl(210, 90%, 60%)', green: 'hsl(130, 80%, 50%)', gold: 'hsl(45, 80%, 60%)', red: 'hsl(0, 80%, 60%)', purple: 'hsl(260, 80%, 70%)' }
    }
  },
  hyperMotion: {
    name: 'Hyper Motion',
    colors: {
      primary: 'hsl(200, 100%, 50%)',
      secondary: 'hsl(320, 100%, 60%)',
      accent: 'hsl(320, 100%, 60%)',
      background: 'hsl(230, 10%, 10%)',
      surface: 'rgba(31, 41, 55, 0.5)',
      cardBg: 'hsl(230, 10%, 14%)',
      text: 'hsl(230, 10%, 85%)',
      muted: 'hsl(230, 10%, 50%)',
      border: 'hsla(200, 100%, 50%, 0.2)',
      success: 'hsl(140, 70%, 45%)',
      warning: 'hsl(45, 90%, 55%)',
      error: 'hsl(320, 90%, 60%)',
      fifa: { blue: 'hsl(200, 100%, 50%)', green: 'hsl(130, 80%, 50%)', gold: 'hsl(45, 90%, 55%)', red: 'hsl(0, 80%, 60%)', purple: 'hsl(320, 100%, 60%)' }
    }
  },
  tacticsBoard: {
    name: 'Tactics Board',
    colors: {
      primary: 'hsl(210, 90%, 50%)',
      secondary: 'hsl(210, 15%, 50%)',
      accent: 'hsl(0, 80%, 60%)',
      background: 'hsl(210, 20%, 98%)',
      surface: 'rgba(255, 255, 255, 0.8)',
      cardBg: 'hsl(0, 0%, 100%)',
      text: 'hsl(210, 20%, 15%)',
      muted: 'hsl(210, 15%, 45%)',
      border: 'hsla(210, 90%, 50%, 0.2)',
      success: 'hsl(140, 70%, 40%)',
      warning: 'hsl(45, 90%, 55%)',
      error: 'hsl(0, 80%, 60%)',
      fifa: { blue: 'hsl(210, 90%, 50%)', green: 'hsl(140, 70%, 40%)', gold: 'hsl(45, 90%, 55%)', red: 'hsl(0, 80%, 60%)', purple: 'hsl(260, 80%, 70%)' }
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
    // THIS IS THE FIX: Check if the saved theme is valid before using it.
    const savedTheme = localStorage.getItem('futalyst-theme');
    if (savedTheme && themes[savedTheme]) {
      return savedTheme;
    }
    // If not, fall back to the new default theme.
    return 'midnightPitch';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(currentThemeName === 'tacticsBoard' ? 'light' : 'dark');
  }, [currentThemeName]);

  const setTheme = (themeName: string) => {
    if (themes[themeName]) {
      localStorage.setItem('futalyst-theme', themeName);
      setCurrentThemeName(themeName);
    }
  };

  const value = {
    currentThemeName,
    // This is now safe because currentThemeName is guaranteed to be a valid key
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

