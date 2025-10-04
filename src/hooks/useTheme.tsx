import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

// The original Theme interface your components expect
export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string; // This will be a solid color fallback
    backgroundGradient: string; // Keep the gradient separate
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
      primary: '#00D4FF',
      secondary: '#6C5CE7',
      accent: '#00FF88',
      background: '#0D1117', // Solid background color
      backgroundGradient: 'linear-gradient(145deg, #0D1117 0%, #161B22 100%)',
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
  // ... other themes can be updated similarly
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

  useEffect(() => {
    localStorage.setItem('futalyst-theme', currentThemeName);
    
    const theme = themes[currentThemeName];
    if (!theme) return;

    const root = document.documentElement;

    // --- THIS IS THE CRITICAL FIX ---
    // Map your theme colors to the CSS variables that shadcn/ui uses.
    // NOTE: HSL conversion is removed for direct hex/rgba values.
    root.style.setProperty('--background', theme.colors.background);
    root.style.setProperty('--foreground', theme.colors.text);
    root.style.setProperty('--card', theme.colors.cardBg);
    root.style.setProperty('--card-foreground', theme.colors.text);
    root.style.setProperty('--popover', theme.colors.cardBg);
    root.style.setProperty('--popover-foreground', theme.colors.text);
    root.style.setProperty('--primary', theme.colors.primary);
    root.style.setProperty('--primary-foreground', theme.colors.text);
    root.style.setProperty('--secondary', theme.colors.secondary);
    root.style.setProperty('--secondary-foreground', theme.colors.text);
    root.style.setProperty('--muted', theme.colors.muted);
    root.style.setProperty('--muted-foreground', theme.colors.text); // Adjust if you have a different muted text color
    root.style.setProperty('--accent', theme.colors.accent);
    root.style.setProperty('--accent-foreground', theme.colors.text);
    root.style.setProperty('--destructive', theme.colors.error);
    root.style.setProperty('--border', theme.colors.border);
    root.style.setProperty('--input', theme.colors.border); // Often the same as border
    root.style.setProperty('--ring', theme.colors.primary); // Ring color on focus

    // Apply the gradient background to the body
    document.body.style.background = theme.colors.backgroundGradient;
    document.body.style.color = theme.colors.text;

  }, [currentThemeName]);

  const setTheme = (themeName: string) => {
    if (themes[themeName]) {
      setCurrentThemeName(themeName);
    }
  };

  const value = {
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
