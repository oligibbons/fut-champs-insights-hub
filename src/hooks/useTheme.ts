
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
    id: 'futvisionary',
    name: 'FUT Visionary',
    description: 'The signature dark mode experience',
    colors: {
      primary: '#00D4FF',
      secondary: '#6C5CE7',
      accent: '#00FF88',
      background: 'linear-gradient(135deg, #1B1F3B 0%, #0F1419 50%, #000000 100%)',
      surface: 'rgba(0, 212, 255, 0.08)',
      text: '#EAEAEA',
      cardBg: 'rgba(27, 31, 59, 0.6)',
      border: 'rgba(0, 212, 255, 0.2)',
      muted: '#8892B0'
    }
  },
  {
    id: 'light',
    name: 'Clean Light',
    description: 'Minimalistic light mode',
    colors: {
      primary: '#6C5CE7',
      secondary: '#00D4FF',
      accent: '#00FF88',
      background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 50%, #F1F5F9 100%)',
      surface: 'rgba(108, 92, 231, 0.05)',
      text: '#1E293B',
      cardBg: 'rgba(255, 255, 255, 0.8)',
      border: 'rgba(108, 92, 231, 0.15)',
      muted: '#64748B'
    }
  },
  {
    id: 'midnight',
    name: 'Midnight Pro',
    description: 'Deep professional theme',
    colors: {
      primary: '#00FF88',
      secondary: '#1B1F3B',
      accent: '#00D4FF',
      background: 'linear-gradient(135deg, #000000 0%, #1B1F3B 50%, #2D3748 100%)',
      surface: 'rgba(0, 255, 136, 0.1)',
      text: '#F7FAFC',
      cardBg: 'rgba(27, 31, 59, 0.7)',
      border: 'rgba(0, 255, 136, 0.2)',
      muted: '#A0AEC0'
    }
  },
  {
    id: 'neon',
    name: 'Neon Gaming',
    description: 'High-contrast gaming experience',
    colors: {
      primary: '#FF0080',
      secondary: '#00FFFF',
      accent: '#FFFF00',
      background: 'linear-gradient(135deg, #0A0A0A 0%, #1A0B2E 50%, #16213E 100%)',
      surface: 'rgba(255, 0, 128, 0.1)',
      text: '#FFFFFF',
      cardBg: 'rgba(26, 11, 46, 0.8)',
      border: 'rgba(255, 0, 128, 0.3)',
      muted: '#B794F6'
    }
  },
  {
    id: 'forest',
    name: 'Elite Green',
    description: 'Focused and calm',
    colors: {
      primary: '#10B981',
      secondary: '#047857',
      accent: '#34D399',
      background: 'linear-gradient(135deg, #064E3B 0%, #065F46 50%, #047857 100%)',
      surface: 'rgba(16, 185, 129, 0.1)',
      text: '#ECFDF5',
      cardBg: 'rgba(6, 78, 59, 0.7)',
      border: 'rgba(16, 185, 129, 0.2)',
      muted: '#6EE7B7'
    }
  },
  {
    id: 'sunset',
    name: 'Champion Gold',
    description: 'Victory and achievement theme',
    colors: {
      primary: '#F59E0B',
      secondary: '#EA580C',
      accent: '#FBB040',
      background: 'linear-gradient(135deg, #7C2D12 0%, #9A3412 50%, #C2410C 100%)',
      surface: 'rgba(245, 158, 11, 0.1)',
      text: '#FED7AA',
      cardBg: 'rgba(124, 45, 18, 0.7)',
      border: 'rgba(245, 158, 11, 0.2)',
      muted: '#FDBA74'
    }
  }
];

export function useTheme() {
  const [activeTheme, setActiveTheme] = useLocalStorage<string>('futvisionary-theme', 'futvisionary');
  
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
    
    // Add theme class to body for conditional styling
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${themeId}`);
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
