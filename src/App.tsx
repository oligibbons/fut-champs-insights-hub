import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import Index from './pages/Index';
import CurrentRun from './pages/CurrentRun';
import History from './pages/History';
import Analytics from './pages/Analytics';
import Players from './pages/Players';
import Settings from './pages/Settings';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './hooks/useTheme';
import { Toaster } from "@/components/ui/sonner";
import { DataSyncProvider } from './hooks/useDataSync.tsx';
import { GameVersionProvider } from './contexts/GameVersionContext';
import AIInsights from './pages/AIInsights';
import Achievements from './pages/Achievements';
import Admin from './pages/Admin';
import Squads from './pages/Squads';

function App() {
  // State to manage the navigation's expanded/collapsed state
  const [isNavExpanded, setIsNavExpanded] = useState(false);

  const Layout = ({ children }: { children: React.ReactNode }) => (
    <div className="flex min-h-screen">
      <Navigation isExpanded={isNavExpanded} setIsExpanded={setIsNavExpanded} />
      <main 
        className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 transition-all duration-300 ease-in-out`}
        style={{ paddingLeft: isNavExpanded ? '16rem' : '5.5rem' }}
      >
        {children}
      </main>
    </div>
  );
  
  // New, detailed background component
  const TacticalBackground = () => (
    <div className="fixed inset-0 -z-10 h-full w-full bg-background overflow-hidden">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsla(var(--primary), 0.05)" strokeWidth="0.5"/>
          </pattern>
          <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="url(#smallGrid)"/>
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="hsla(var(--primary), 0.08)" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        {/* Center Circle */}
        <circle cx="50%" cy="50%" r="10%" fill="none" stroke="hsla(var(--accent), 0.1)" strokeWidth="2" />
        {/* Center Line */}
        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="hsla(var(--accent), 0.1)" strokeWidth="2" />
        {/* Penalty Boxes */}
        <rect x="10%" y="30%" width="15%" height="40%" fill="none" stroke="hsla(var(--accent), 0.1)" strokeWidth="2" />
        <rect x="75%" y="30%" width="15%" height="40%" fill="none" stroke="hsla(var(--accent), 0.1)" strokeWidth="2" />
      </svg>
    </div>
  );

  return (
    <ThemeProvider>
      <TacticalBackground />
      <AuthProvider>
        <GameVersionProvider>
          <DataSyncProvider>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={<ProtectedRoute><Layout><Index /></Layout></ProtectedRoute>} />
                <Route path="/current-run" element={<ProtectedRoute><Layout><CurrentRun /></Layout></ProtectedRoute>} />
                <Route path="/history" element={<ProtectedRoute><Layout><History /></Layout></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><Layout><Analytics /></Layout></ProtectedRoute>} />
                <Route path="/players" element={<ProtectedRoute><Layout><Players /></Layout></ProtectedRoute>} />
                <Route path="/squads" element={<ProtectedRoute><Layout><Squads /></Layout></ProtectedRoute>} />
                <Route path="/ai-insights" element={<ProtectedRoute><Layout><AIInsights /></Layout></ProtectedRoute>} />
                <Route path="/achievements" element={<ProtectedRoute><Layout><Achievements /></Layout></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute><Layout><Admin /></Layout></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            <Toaster />
          </DataSyncProvider>
        </GameVersionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
