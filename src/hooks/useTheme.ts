
import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    cardBg: string;
    border: string;
    muted: string;
  };
}

export const themes: Theme[] = [
  {
    id: 'default',
    name: 'FC25 Pro',
    description: 'The classic FUT Champions look',
    colors: {
      primary: '#00d4ff',
      secondary: '#ff6b35',
      accent: '#ffd700',
      background: 'linear-gradient(135deg, #0a0f1c 0%, #1a1f2e 50%, #2a2f3e 100%)',
      surface: 'rgba(255, 255, 255, 0.08)',
      text: '#e2e8f0',
      cardBg: 'rgba(255, 255, 255, 0.05)',
      border: 'rgba(255, 255, 255, 0.1)',
      muted: '#94a3b8'
    }
  },
  {
    id: 'midnight',
    name: 'Midnight Blue',
    description: 'Deep blue professional theme',
    colors: {
      primary: '#3b82f6',
      secondary: '#1e40af',
      accent: '#60a5fa',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      surface: 'rgba(59, 130, 246, 0.1)',
      text: '#f1f5f9',
      cardBg: 'rgba(30, 41, 59, 0.6)',
      border: 'rgba(59, 130, 246, 0.2)',
      muted: '#64748b'
    }
  },
  {
    id: 'forest',
    name: 'Forest Green',
    description: 'Calm and natural theme',
    colors: {
      primary: '#10b981',
      secondary: '#047857',
      accent: '#34d399',
      background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
      surface: 'rgba(16, 185, 129, 0.1)',
      text: '#ecfdf5',
      cardBg: 'rgba(6, 78, 59, 0.7)',
      border: 'rgba(16, 185, 129, 0.2)',
      muted: '#6ee7b7'
    }
  },
  {
    id: 'sunset',
    name: 'Sunset Orange',
    description: 'Warm sunset vibes',
    colors: {
      primary: '#f97316',
      secondary: '#ea580c',
      accent: '#fb923c',
      background: 'linear-gradient(135deg, #7c2d12 0%, #9a3412 50%, #c2410c 100%)',
      surface: 'rgba(249, 115, 22, 0.1)',
      text: '#fed7aa',
      cardBg: 'rgba(124, 45, 18, 0.7)',
      border: 'rgba(249, 115, 22, 0.2)',
      muted: '#fdba74'
    }
  },
  {
    id: 'purple',
    name: 'Royal Purple',
    description: 'Elegant purple theme',
    colors: {
      primary: '#8b5cf6',
      secondary: '#7c3aed',
      accent: '#a78bfa',
      background: 'linear-gradient(135deg, #3730a3 0%, #4c1d95 50%, #5b21b6 100%)',
      surface: 'rgba(139, 92, 246, 0.1)',
      text: '#ede9fe',
      cardBg: 'rgba(55, 48, 163, 0.7)',
      border: 'rgba(139, 92, 246, 0.2)',
      muted: '#c4b5fd'
    }
  }
];

export function useTheme() {
  const [activeTheme, setActiveTheme] = useLocalStorage<string>('fc25-theme', 'default');
  
  const currentTheme = themes.find(t => t.id === activeTheme) || themes[0];
  
  const applyTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (!theme) return;
    
    setActiveTheme(themeId);
    
    // Apply CSS custom properties to the document
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', theme.colors.primary);
    root.style.setProperty('--theme-secondary', theme.colors.secondary);
    root.style.setProperty('--theme-accent', theme.colors.accent);
    root.style.setProperty('--theme-background', theme.colors.background);
    root.style.setProperty('--theme-surface', theme.colors.surface);
    root.style.setProperty('--theme-text', theme.colors.text);
    root.style.setProperty('--theme-card-bg', theme.colors.cardBg);
    root.style.setProperty('--theme-border', theme.colors.border);
    root.style.setProperty('--theme-muted', theme.colors.muted);
    
    // Apply the background to the body
    document.body.style.background = theme.colors.background;
    document.body.style.color = theme.colors.text;
    document.body.style.minHeight = '100vh';
  };
  
  // Apply theme on mount and when activeTheme changes
  useEffect(() => {
    applyTheme(activeTheme);
  }, [activeTheme]);
  
  return {
    themes,
    currentTheme,
    activeTheme,
    applyTheme
  };
}
