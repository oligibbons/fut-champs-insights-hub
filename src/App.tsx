import { useState } from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import { AuthPage } from '@/pages/Auth';
import Dashboard from '@/pages/Index';
import CurrentRun from '@/pages/CurrentRun';
import History from '@/pages/History';
import Squads from '@/pages/Squads';
import Players from '@/pages/Players';
import Analytics from '@/pages/Analytics';
import AIInsights from '@/pages/AIInsights';
import Achievements from '@/pages/Achievements';
import Settings from '@/pages/Settings';
import Admin from '@/pages/Admin';
import NotFound from '@/pages/NotFound';
import { cn } from './lib/utils';
import { useTheme } from './hooks/useTheme';
import { useDataSync } from './hooks/useDataSync';
import { useAchievementNotifications } from './hooks/useAchievementNotifications';
import { useMobile } from './hooks/use-mobile'; // <-- ADD THIS
import { MobileBottomNav } from './components/MobileBottomNav'; // <-- ADD THIS

const App = () => {
  const { session } = useAuth();
  const { currentTheme } = useTheme();

  return (
    <div className="flex min-h-screen w-full" style={{ 
      backgroundColor: currentTheme.colors.background, 
      color: currentTheme.colors.text 
    }}>
      <Routes>
        <Route path="/auth" element={session ? <Navigate to="/" /> : <AuthPage />} />
        <Route 
          path="/*"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="current-run" element={<CurrentRun />} />
          <Route path="history" element={<History />} />
          <Route path="squads" element={<Squads />} />
          <Route path="players" element={<Players />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="ai-insights" element={<AIInsights />} />
          <Route path="achievements" element={<Achievements />} />
          <Route path="settings" element={<Settings />} />
          <Route path="admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Toaster />
    </div>
  );
};

const Layout = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isMobile } = useMobile(); // <-- ADD THIS
  
  // Data hooks
  useDataSync();
  useAchievementNotifications();

  // This logic is now controlled by !isMobile
  const navWidth = isExpanded ? 'lg:w-64' : 'lg:w-[5.5rem]';

  return (
    <div className={cn(
      "flex min-h-screen w-full",
      !isMobile && `lg:pl-[5.5rem]`, // <-- MODIFIED: Only add padding on desktop
      isExpanded && !isMobile && `lg:pl-64` // <-- MODIFIED: Only add padding on desktop
    )}>
      
      {/* --- MODIFIED: Conditional Navigation --- */}
      {isMobile ? (
        <MobileBottomNav /> 
      ) : (
        <Navigation isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      )}
      {/* --- END MODIFICATION --- */}
      
      <main className={cn(
        "flex-1 flex flex-col overflow-x-hidden",
        isMobile ? "p-4 pb-24" : "p-6" // <-- MODIFIED: Add bottom padding on mobile
      )}>
        <Outlet />
      </main>
    </div>
  );
};

export default App;
