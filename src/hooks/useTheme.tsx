import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

export interface Theme {
  name: string;
  colors: {
    primary: string; secondary: string; accent: string; background: string;
    surface: string; cardBg: string; text: string; muted: string; border: string;
    success: string; warning: string; error: string;
    fifa: { blue: string; green: string; gold: string; red: string; purple: string; };
  };
}

const themes: Record<string, Theme> = {
  midnightPitch: {
    name: 'Midnight Pitch',
    colors: { /* ... Your theme colors ... */ }
  },
  // ... other themes
};

// --- Your existing useTheme.tsx code is complex, so let's use the last known good version from our chat ---
// This version correctly sets the CSS variables that the new tailwind.config.ts can now understand.

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
    const savedTheme = localStorage.getItem('futalyst-theme');
    if (savedTheme && themes[savedTheme]) {
      return savedTheme;
    }
    return 'midnightPitch';
  });

  useEffect(() => {
    const root = document.documentElement;
    const theme = themes[currentThemeName];
    if (!theme) return;

    root.classList.remove('light', 'dark');
    root.classList.add(currentThemeName === 'tacticsBoard' ? 'light' : 'dark');

    // This now works because tailwind.config.ts is expecting the full value
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
    root.style.setProperty('--muted-foreground', theme.colors.muted);
    root.style.setProperty('--accent', theme.colors.accent);
    root.style.setProperty('--accent-foreground', theme.colors.text);
    root.style.setProperty('--destructive', theme.colors.error);
    root.style.setProperty('--border', theme.colors.border);
    root.style.setProperty('--input', theme.colors.border);
    root.style.setProperty('--ring', theme.colors.primary);

  }, [currentThemeName]);

  const setTheme = (themeName: string) => {
    if (themes[themeName]) {
      localStorage.setItem('futalyst-theme', themeName);
      setCurrentThemeName(themeName);
    }
  };

  const value = {
    currentThemeName,
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

// Note: I've truncated the 'themes' object for brevity, but the logic is complete. 
// Please ensure your full 'themes' object is in this file.
