
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
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      surface: 'rgba(255, 255, 255, 0.1)',
      text: '#ffffff'
    }
  },
  {
    id: 'light',
    name: 'Clean White',
    description: 'Minimalist light theme',
    colors: {
      primary: '#2563eb',
      secondary: '#dc2626',
      accent: '#059669',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      surface: 'rgba(255, 255, 255, 0.9)',
      text: '#1e293b'
    }
  },
  {
    id: 'dark',
    name: 'Midnight Black',
    description: 'Pure dark mode',
    colors: {
      primary: '#3b82f6',
      secondary: '#ef4444',
      accent: '#10b981',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      surface: 'rgba(15, 23, 42, 0.8)',
      text: '#f1f5f9'
    }
  },
  {
    id: 'neon',
    name: 'Neon Gaming',
    description: 'Cyberpunk vibes',
    colors: {
      primary: '#00ff88',
      secondary: '#ff0080',
      accent: '#ffff00',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 50%, #0a1a0a 100%)',
      surface: 'rgba(0, 255, 136, 0.1)',
      text: '#00ff88'
    }
  },
  {
    id: 'sunset',
    name: 'Sunset Vibes',
    description: 'Warm and inviting',
    colors: {
      primary: '#f97316',
      secondary: '#dc2626',
      accent: '#fbbf24',
      background: 'linear-gradient(135deg, #7c2d12 0%, #dc2626 50%, #f97316 100%)',
      surface: 'rgba(249, 115, 22, 0.2)',
      text: '#fef3c7'
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
    
    // Apply CSS custom properties
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', theme.colors.primary);
    root.style.setProperty('--theme-secondary', theme.colors.secondary);
    root.style.setProperty('--theme-accent', theme.colors.accent);
    root.style.setProperty('--theme-background', theme.colors.background);
    root.style.setProperty('--theme-surface', theme.colors.surface);
    root.style.setProperty('--theme-text', theme.colors.text);
  };
  
  return {
    themes,
    currentTheme,
    activeTheme,
    applyTheme
  };
}
