import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

const parseHsl = (hsl: string | undefined): string => {
  if (!hsl) return '';
  const match = hsl.match(/hsl\(([\d.]+),\s*([\d.]+)%,\s*([\d.]+)%\)/);
  if (match) {
    return `${match[1]} ${match[2]}% ${match[3]}%`;
  }
  return hsl;
};

const themes = {
  futuristicHud: {
    name: 'Futuristic HUD',
    mode: 'dark',
    colors: {
      primary: 'hsl(180, 100%, 50%)', // Vibrant Cyan
      secondary: 'hsl(240, 15%, 25%)', // Deep Blue-Gray
      accent: 'hsl(300, 100%, 70%)', // Electric Magenta
      background: 'hsl(240, 20%, 6%)', // Near Black with a hint of blue
      foreground: 'hsl(210, 50%, 95%)',
      card: 'hsl(240, 15%, 12%)',
      cardForeground: 'hsl(210, 50%, 95%)',
      popover: 'hsl(240, 20%, 10%)',
      popoverForeground: 'hsl(210, 50%, 95%)',
      muted: 'hsl(240, 10%, 40%)',
      mutedForeground: 'hsl(240, 5%, 65%)',
      destructive: 'hsl(0, 84%, 60%)',
      border: 'hsla(180, 100%, 50%, 0.2)',
      input: 'hsl(240, 15%, 18%)',
      ring: 'hsl(180, 100%, 60%)',
      cardRgb: '26, 30, 41',
    }
  },
  champsElite: {
    name: 'Champs Elite',
    mode: 'dark',
    colors: {
      primary: 'hsl(45, 100%, 51%)', // Gold
      secondary: 'hsl(0, 0%, 13%)', // Dark Charcoal
      accent: 'hsl(0, 0%, 98%)', // White
      background: 'hsl(0, 0%, 8%)', // True Black
      foreground: 'hsl(0, 0%, 90%)',
      card: 'hsl(0, 0%, 11%)',
      cardForeground: 'hsl(0, 0%, 90%)',
      popover: 'hsl(0, 0%, 10%)',
      popoverForeground: 'hsl(0, 0%, 90%)',
      muted: 'hsl(0, 0%, 40%)',
      mutedForeground: 'hsl(0, 0%, 60%)',
      destructive: 'hsl(0, 72%, 51%)',
      border: 'hsla(45, 100%, 51%, 0.25)',
      input: 'hsl(0, 0%, 15%)',
      ring: 'hsl(45, 100%, 51%)',
      cardRgb: '28, 28, 28',
    }
  },
  midnightPitch: {
    name: 'Midnight Pitch',
    mode: 'dark',
    colors: {
      primary: 'hsl(120, 70%, 45%)', // Pitch Green
      secondary: 'hsl(210, 15%, 20%)', // Chalk Line Gray
      accent: 'hsl(0, 0%, 100%)', // White
      background: 'hsl(120, 30%, 8%)', // Very Dark Green
      foreground: 'hsl(210, 20%, 90%)',
      card: 'hsl(120, 20%, 11%)',
      cardForeground: 'hsl(210, 20%, 90%)',
      popover: 'hsl(120, 30%, 9%)',
      popoverForeground: 'hsl(210, 20%, 90%)',
      muted: 'hsl(210, 10%, 40%)',
      mutedForeground: 'hsl(210, 10%, 60%)',
      destructive: 'hsl(0, 80%, 60%)',
      border: 'hsla(120, 70%, 45%, 0.2)',
      input: 'hsl(210, 15%, 15%)',
      ring: 'hsl(120, 70%, 45%)',
      cardRgb: '23, 29, 23',
    }
  },
  goldenGoal: {
    name: 'Golden Goal',
    mode: 'light',
    colors: {
      primary: 'hsl(35, 85%, 55%)', // Deep Gold
      secondary: 'hsl(20, 5%, 30%)', // Dark Gray
      accent: 'hsl(5, 75%, 55%)', // Fiery Red
      background: 'hsl(30, 50%, 98%)', // Off-white
      foreground: 'hsl(20, 15%, 20%)',
      card: 'hsl(0, 0%, 100%)',
      cardForeground: 'hsl(20, 15%, 20%)',
      popover: 'hsl(0, 0%, 100%)',
      popoverForeground: 'hsl(20, 15%, 20%)',
      muted: 'hsl(30, 20%, 85%)',
      mutedForeground: 'hsl(30, 10%, 45%)',
      destructive: 'hsl(0, 80%, 60%)',
      border: 'hsla(35, 85%, 55%, 0.3)',
      input: 'hsl(30, 30%, 95%)',
      ring: 'hsl(35, 85%, 55%)',
      cardRgb: '255, 255, 255',
    }
  },
  hyperMotion: {
    name: 'Hyper Motion',
    mode: 'dark',
    colors: {
      primary: 'hsl(260, 100%, 70%)', // Electric Violet
      secondary: 'hsl(180, 90%, 50%)', // Bright Cyan
      accent: 'hsl(330, 100%, 65%)', // Hot Pink
      background: 'hsl(235, 25%, 12%)', // Deep Indigo
      foreground: 'hsl(240, 20%, 92%)',
      card: 'hsl(235, 22%, 16%)',
      cardForeground: 'hsl(240, 20%, 92%)',
      popover: 'hsl(235, 25%, 14%)',
      popoverForeground: 'hsl(240, 20%, 92%)',
      muted: 'hsl(235, 10%, 50%)',
      mutedForeground: 'hsl(235, 5%, 65%)',
      destructive: 'hsl(330, 90%, 60%)',
      border: 'hsla(260, 100%, 70%, 0.25)',
      input: 'hsl(235, 20%, 20%)',
      ring: 'hsl(260, 100%, 70%)',
      cardRgb: '36, 38, 51',
    }
  },
  tacticsBoard: {
    name: 'Tactics Board',
    mode: 'light',
    colors: {
      primary: 'hsl(217, 91%, 60%)', // Classic Blue
      secondary: 'hsl(210, 40%, 96%)', // Light Gray
      accent: 'hsl(346, 77%, 58%)', // Strong Red
      background: 'hsl(0, 0%, 100%)', // White
      foreground: 'hsl(222, 47%, 11%)', // Dark Blue Text
      card: 'hsl(210, 40%, 98%)',
      cardForeground: 'hsl(222, 47%, 11%)',
      popover: 'hsl(0, 0%, 100%)',
      popoverForeground: 'hsl(222, 47%, 11%)',
      muted: 'hsl(210, 30%, 90%)',
      mutedForeground: 'hsl(215, 15%, 55%)',
      destructive: 'hsl(0, 84%, 60%)',
      border: 'hsla(217, 91%, 60%, 0.2)',
      input: 'hsl(210, 40%, 94%)',
      ring: 'hsl(217, 91%, 60%)',
      cardRgb: '250, 250, 250',
    }
  },
};

interface ThemeContextType {
  currentTheme: (typeof themes)[keyof typeof themes];
  currentThemeName: keyof typeof themes;
  setTheme: (themeName: keyof typeof themes) => void;
  themeData: Record<string, {name: string}>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [currentThemeName, setCurrentThemeName] = useState<keyof typeof themes>(() => {
    const savedTheme = localStorage.getItem('futalyst-theme');
    if (savedTheme && themes[savedTheme as keyof typeof themes]) {
      return savedTheme as keyof typeof themes;
    }
    return 'futuristicHud'; // Default theme
  });

  useEffect(() => {
    const root = document.documentElement;
    const theme = themes[currentThemeName];
    if (!theme) return;

    root.classList.remove('light', 'dark');
    root.classList.add(theme.mode);
    
    // THE FIX: We prevent the 'background' color from being applied to the root <html> element
    root.style.backgroundColor = ''; // Ensure no direct background color is set

    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      const parsedValue = key.endsWith('Rgb') ? value : parseHsl(value);
      root.style.setProperty(cssVarName, parsedValue);
    });

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
    currentThemeName,
    setTheme,
    themeData: themeInfo,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be be used within a ThemeProvider');
  }
  return context;
};
