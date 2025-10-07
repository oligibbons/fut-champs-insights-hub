import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system"

// Define your custom themes here using HSL values without the hsl() wrapper
const themes = {
  default: {
    name: 'Default',
    colors: {
      background: '0 0% 3.9%',
      foreground: '0 0% 98%',
      card: '0 0% 3.9%',
      cardForeground: '0 0% 98%',
      popover: '0 0% 3.9%',
      popoverForeground: '0 0% 98%',
      primary: '0 0% 98%',
      primaryForeground: '0 0% 9%',
      secondary: '0 0% 14.9%',
      secondaryForeground: '0 0% 98%',
      muted: '0 0% 14.9%',
      mutedForeground: '0 0% 63.9%',
      accent: '0 0% 14.9%',
      accentForeground: '0 0% 98%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '0 0% 98%',
      border: '0 0% 14.9%',
      input: '0 0% 14.9%',
      ring: '0 0% 83.1%',
      cardRgb: '10, 10, 10',
      surface: 'rgba(42, 58, 82, 0.5)'
    }
  },
  futvisionary: {
    name: 'Futvisionary',
    colors: {
      background: '215 39% 11%',    // #0D1B2A
      foreground: '80 13% 94%',    // #E0E1DD
      card: '215 39% 17%',        // #1B263B
      cardForeground: '80 13% 94%',    // #E0E1DD
      popover: '215 39% 11%',        // #0D1B2A
      popoverForeground: '80 13% 94%',    // #E0E1DD
      primary: '212 18% 64%',      // #778DA9
      primaryForeground: '215 39% 11%',    // #0D1B2A
      secondary: '211 25% 36%',    // #415A77
      secondaryForeground: '80 13% 94%',    // #E0E1DD
      muted: '212 16% 50%',        // #6b7b90
      mutedForeground: '212 18% 64%',      // #778DA9
      accent: '210 100% 85%',     // #B4D2FF
      accentForeground: '215 39% 11%',    // #0D1B2A
      destructive: '0 63% 31%',
      destructiveForeground: '80 13% 94%',
      border: '212 18% 64% / 0.2',
      input: '214 27% 25%',        // #2a3a52
      ring: '212 18% 64%',
      cardRgb: '27, 38, 59',
      surface: 'rgba(42, 58, 82, 0.5)'
    }
  },
};


type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  currentTheme: typeof themes.default,
  setCurrentTheme: (themeName: keyof typeof themes) => void
  themes: typeof themes
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  currentTheme: themes.default,
  setCurrentTheme: () => null,
  themes: themes,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )
  const [currentThemeKey, setCurrentThemeKey] = useState<keyof typeof themes>(() => {
    return (localStorage.getItem('futalyst-theme') as keyof typeof themes) || 'futvisionary';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    const selectedTheme = themes[currentThemeKey] || themes.futvisionary;
    const root = window.document.documentElement.style;
    
    // Apply colors to CSS variables
    Object.entries(selectedTheme.colors).forEach(([key, value]) => {
      const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.setProperty(cssVar, value);
    });

    localStorage.setItem('futalyst-theme', currentThemeKey);
  }, [currentThemeKey]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
    currentTheme: themes[currentThemeKey] || themes.default,
    setCurrentTheme: setCurrentThemeKey,
    themes: themes,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
```

**File to Update:** `src/App.tsx` (This removes the redundant `useEffect` and the faulty import)

```typescript
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navigation from "@/components/Navigation";
import Index from "./pages/Index";
import CurrentWeek from "./pages/CurrentWeek";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Squads from "./pages/Squads";
import Players from "./pages/Players";
import Insights from "./pages/Insights";
import History from "./pages/History";
import Auth from "./pages/Auth";
import Friends from "./pages/Friends";
import Leaderboards from "./pages/Leaderboards";
import Achievements from "./pages/Achievements";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";

function App() {
  const { loading, user } = useAuth();

  // The useEffect to set theme has been removed from here as it's now correctly handled in the ThemeProvider

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary"/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {user && <Navigation />}
      <main className={`transition-all duration-300 ${user ? 'lg:pl-[5.5rem]' : ''}`}>
        <div className="p-4 md:p-8">
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/current-week" element={<ProtectedRoute><CurrentWeek /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/squads" element={<ProtectedRoute><Squads /></ProtectedRoute>} />
            <Route path="/players" element={<ProtectedRoute><Players /></ProtectedRoute>} />
            <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
            <Route path="/leaderboards" element={<ProtectedRoute><Leaderboards /></ProtectedRoute>} />
            <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute adminOnly={true}><Admin /></ProtectedRoute>} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </div>
      </main>
      <Toaster />
    </div>
  );
}

export default App;
