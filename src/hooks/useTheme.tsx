import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

// Color conversion utility to bridge your theme and the ShadCN theme
const hexToHSL = (hex: string): string => {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${(h * 360).toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%`;
};


export interface Theme {
  name: string;
  isDark: boolean; // Add a property to know if it's a dark or light theme
  colors: {
    primary: string; // hex
    background: string; // Can be a gradient or solid color
    card: string; // hex for card background
    text: string; // hex
    border: string; // hex for borders
    // Add other colors if they map to ShadCN variables
  };
}

// Updated themes with HSL values for ShadCN compatibility
const themes: Record<string, Theme> = {
  futvisionary: {
    name: 'FUT Visionary',
    isDark: true,
    colors: {
      primary: '#3b82f6',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      card: '#0f172a',
      text: '#ffffff',
      border: '#2c3e50',
    }
  },
  light: {
    name: 'Clean White',
    isDark: false,
    colors: {
      primary: '#2563eb',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
      card: '#ffffff',
      text: '#1e293b',
      border: '#e2e8f0',
    }
  },
  // Add other themes here in the same format
};

interface ThemeContextType {
  setTheme: (themeName: string) => void;
  theme: string;
  themeData: Theme | null;
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
    const theme = themes[currentThemeName];
    if (!theme) return;

    localStorage.setItem('futalyst-theme', currentThemeName);
    const root = document.documentElement;

    // Remove old theme class and add the new one
    root.classList.remove('dark', 'light');
    root.classList.add(theme.isDark ? 'dark' : 'light');

    // Set the body background for gradients
    document.body.style.background = theme.colors.background;

    // CRITICAL: Update ShadCN variables
    root.style.setProperty('--background', hexToHSL(theme.isDark ? '#0f172a' : '#f8fafc'));
    root.style.setProperty('--foreground', hexToHSL(theme.colors.text));
    root.style.setProperty('--card', hexToHSL(theme.colors.card));
    root.style.setProperty('--card-foreground', hexToHSL(theme.colors.text));
    root.style.setProperty('--primary', hexToHSL(theme.colors.primary));
    root.style.setProperty('--primary-foreground', hexToHSL(theme.colors.text));
    root.style.setProperty('--border', hexToHSL(theme.colors.border));
    root.style.setProperty('--input', hexToHSL(theme.colors.border));
    root.style.setProperty('--ring', hexToHSL(theme.colors.primary));

  }, [currentThemeName]);

  const setTheme = (themeName: string) => {
    if (themes[themeName]) {
      setCurrentThemeName(themeName);
    }
  };

  const value = {
    theme: currentThemeName,
    setTheme,
    themeData: themes[currentThemeName] || null
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
