import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

// Helper to convert HSL string to Tailwind-compatible HSL values
const parseHsl = (hsl: string | undefined): string => {
  if (!hsl) return '';
  const match = hsl.match(/hsl\(([\d.]+),\s*([\d.]+)%,\s*([\d.]+)%\)/);
  if (match) {
    return `${match[1]} ${match[2]}% ${match[3]}%`;
  }
  return hsl; // Fallback for other formats if any
};

// Define your beautiful custom themes
const themes = {
  champsElite: {
    name: 'Champs Elite',
    mode: 'dark',
    colors: {
      primary: 'hsl(350, 70%, 55%)',
      secondary: 'hsl(210, 30%, 25%)',
      accent: 'hsl(45, 100%, 50%)',
      background: 'hsl(220, 15%, 10%)',
      foreground: 'hsl(0, 0%, 100%)',
      card: 'hsl(220, 15%, 15%)',
      cardForeground: 'hsl(0, 0%, 100%)',
      popover: 'hsl(220, 15%, 15%)',
      popoverForeground: 'hsl(0, 0%, 100%)',
      muted: 'hsl(220, 10%, 70%)',
      mutedForeground: 'hsl(220, 10%, 40%)',
      destructive: 'hsl(0, 80%, 60%)',
      border: 'hsla(350, 70%, 55%, 0.4)',
      input: 'hsl(210, 30%, 25%)',
      ring: 'hsl(350, 70%, 55%)',
      cardRgb: '34, 38, 46', // RGB for hsl(220, 15%, 15%)
    }
  },
  midnightPitch: {
    name: 'Midnight Pitch',
    mode: 'dark',
    colors: {
      primary: 'hsl(130, 80%, 50%)',
      secondary: 'hsl(210, 50%, 60%)',
      accent: 'hsl(130, 80%, 50%)',
      background: 'hsl(220, 15%, 5%)',
      foreground: 'hsl(220, 10%, 90%)',
      card: 'hsl(220, 15%, 8%)',
      cardForeground: 'hsl(220, 10%, 90%)',
      popover: 'hsl(220, 15%, 8%)',
      popoverForeground: 'hsl(220, 10%, 90%)',
      muted: 'hsl(220, 10%, 60%)',
      mutedForeground: 'hsl(220, 10%, 40%)',
      destructive: 'hsl(0, 80%, 60%)',
      border: 'hsla(130, 80%, 50%, 0.2)',
      input: 'hsl(220, 15%, 15%)',
      ring: 'hsl(130, 80%, 50%)',
      cardRgb: '19, 21, 23',
    }
  },
  goldenGoal: {
    name: 'Golden Goal',
    mode: 'dark',
    colors: {
      primary: 'hsl(45, 80%, 60%)',
      secondary: 'hsl(215, 30%, 30%)',
      accent: 'hsl(45, 80%, 60%)',
      background: 'hsl(215, 60%, 10%)',
      foreground: 'hsl(45, 20%, 95%)',
      card: 'hsl(215, 60%, 13%)',
      cardForeground: 'hsl(45, 20%, 95%)',
      popover: 'hsl(215, 60%, 13%)',
      popoverForeground: 'hsl(45, 20%, 95%)',
      muted: 'hsl(215, 20%, 65%)',
      mutedForeground: 'hsl(215, 20%, 45%)',
      destructive: 'hsl(0, 80%, 60%)',
      border: 'hsla(45, 80%, 60%, 0.2)',
      input: 'hsl(215, 30%, 30%)',
      ring: 'hsl(45, 80%, 60%)',
      cardRgb: '23, 30, 43',
    }
  },
  hyperMotion: {
    name: 'Hyper Motion',
    mode: 'dark',
    colors: {
      primary: 'hsl(200, 100%, 50%)',
      secondary: 'hsl(320, 100%, 60%)',
      accent: 'hsl(320, 100%, 60%)',
      background: 'hsl(230, 10%, 10%)',
      foreground: 'hsl(230, 10%, 85%)',
      card: 'hsl(230, 10%, 14%)',
      cardForeground: 'hsl(230, 10%, 85%)',
      popover: 'hsl(230, 10%, 14%)',
      popoverForeground: 'hsl(230, 10%, 85%)',
      muted: 'hsl(230, 10%, 50%)',
      mutedForeground: 'hsl(230, 10%, 40%)',
      destructive: 'hsl(320, 90%, 60%)',
      border: 'hsla(200, 100%, 50%, 0.2)',
      input: 'hsl(230, 10%, 20%)',
      ring: 'hsl(200, 100%, 50%)',
      cardRgb: '33, 34, 38',
    }
  },
  tacticsBoard: {
    name: 'Tactics Board',
    mode: 'light',
    colors: {
      primary: 'hsl(210, 90%, 50%)',
      secondary: 'hsl(210, 15%, 90%)',
      accent: 'hsl(0, 80%, 60%)',
      background: 'hsl(210, 20%, 98%)',
      foreground: 'hsl(210, 20%, 15%)',
      card: 'hsl(0, 0%, 100%)',
      cardForeground: 'hsl(210, 20%, 15%)',
      popover: 'hsl(0, 0%, 100%)',
      popoverForeground: 'hsl(210, 20%, 15%)',
      muted: 'hsl(210, 15%, 85%)',
      mutedForeground: 'hsl(210, 15%, 45%)',
      destructive: 'hsl(0, 80%, 60%)',
      border: 'hsla(210, 90%, 50%, 0.2)',
      input: 'hsl(210, 15%, 95%)',
      ring: 'hsl(210, 90%, 50%)',
      cardRgb: '255, 255, 255',
    }
  },
};

interface ThemeContextType {
  currentTheme: (typeof themes)[keyof typeof themes];
  setTheme: (themeName: keyof typeof themes) => void;
  themes: Record<string, {name: string}>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [currentThemeName, setCurrentThemeName] = useState<keyof typeof themes>(() => {
    const savedTheme = localStorage.getItem('futalyst-theme');
    if (savedTheme && themes[savedTheme as keyof typeof themes]) {
      return savedTheme as keyof typeof themes;
    }
    return 'champsElite'; // Default theme
  });

  useEffect(() => {
    const root = document.documentElement;
    const theme = themes[currentThemeName];
    if (!theme) return;

    // Apply .dark or .light class for Tailwind's darkMode selector
    root.classList.remove('light', 'dark');
    root.classList.add(theme.mode);
    
    // Set CSS variables for Tailwind to use
    root.style.setProperty('--background', parseHsl(theme.colors.background));
    root.style.setProperty('--foreground', parseHsl(theme.colors.foreground));
    root.style.setProperty('--card', parseHsl(theme.colors.card));
    root.style.setProperty('--card-foreground', parseHsl(theme.colors.cardForeground));
    root.style.setProperty('--popover', parseHsl(theme.colors.popover));
    root.style.setProperty('--popover-foreground', parseHsl(theme.colors.popoverForeground));
    root.style.setProperty('--primary', parseHsl(theme.colors.primary));
    root.style.setProperty('--primary-foreground', parseHsl(theme.colors.foreground)); // Use main text color on primary buttons
    root.style.setProperty('--secondary', parseHsl(theme.colors.secondary));
    root.style.setProperty('--secondary-foreground', parseHsl(theme.colors.foreground));
    root.style.setProperty('--muted', parseHsl(theme.colors.muted));
    root.style.setProperty('--muted-foreground', parseHsl(theme.colors.muted));
    root.style.setProperty('--accent', parseHsl(theme.colors.accent));
    root.style.setProperty('--accent-foreground', parseHsl(theme.colors.foreground));
    root.style.setProperty('--destructive', parseHsl(theme.colors.destructive));
    root.style.setProperty('--destructive-foreground', parseHsl(theme.colors.foreground));
    root.style.setProperty('--border', parseHsl(theme.colors.border));
    root.style.setProperty('--input', parseHsl(theme.colors.input));
    root.style.setProperty('--ring', parseHsl(theme.colors.ring));
    root.style.setProperty('--card-rgb', theme.colors.cardRgb);

  }, [currentThemeName]);

  const setTheme = (themeName: keyof typeof themes) => {
    if (themes[themeName]) {
      localStorage.setItem('futalyst-theme', themeName);
      setCurrentThemeName(themeName);
    }
  };

  const themeInfo = Object.keys(themes).reduce((acc, key) => {
    acc[key] = { name: themes[key as keyof typeof themes].name };
    return acc;
  }, {} as Record<string, {name: string}>);

  const value = {
    currentTheme: themes[currentThemeName],
    setTheme,
    themes: themeInfo,
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
