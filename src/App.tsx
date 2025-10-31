// src/App.tsx
import { useState } from 'react';
import { Route, Routes, Link, useLocation, Outlet } from 'react-router-dom';
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
import PublicRoute from './components/PublicRoute'; 

import { useAuth } from './contexts/AuthContext';
// --- FIX: Redundant providers are removed ---
// import { ThemeProvider } from './hooks/useTheme'; 
// import { DataSyncProvider } from './hooks/useDataSync.tsx';
// import { GameVersionProvider } from './contexts/GameVersionContext';

// --- FIX: Toaster is moved to main.tsx ---
// import { Toaster } from "@/components/ui/sonner"; 
import AIInsights from './pages/AIInsights';
import Achievements from './pages/Achievements';
import Admin from './pages/Admin';
import Squads from './pages/Squads';
import { Button } from './components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { ArrowRight } from 'lucide-react';
import { cn } from './lib/utils';
import AnimatedBackground from './components/ui/AnimatedBackground';
import { useMobile } from './hooks/use-mobile'; 
import { MobileBottomNav } from './components/MobileBottomNav'; 

import Notifications from './pages/Notifications';
import Friends from './pages/Friends';
import ChallengeMode from './pages/ChallengeMode';
import LeagueDetailsPage from './pages/LeagueDetailsPage';
import JoinLeaguePage from './pages/JoinLeaguePage';

import Home from './pages/Home';

const Header = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isMobile = useMobile(); 

  // --- FIX: Use /dashboard as the base for protected routes ---
  if (!user || location.pathname === '/auth' || location.pathname === '/') {
    return null;
  }

  return (
    <header className={cn(
      "fixed top-0 right-0 h-20 flex items-center justify-end px-4 sm:px-8 z-30",
      isMobile ? "w-full" : "w-auto"
    )}>
      <div className="flex items-center gap-4">
        <Button asChild>
          <Link to="/dashboard/current-run"> {/* <-- FIX: Point to dashboard child */}
            New Run <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.user_metadata?.avatar_url} />
          <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

const MainLayout = () => {
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const isMobile = useMobile();

  return (
    <div className="flex min-h-screen bg-background">
      {isMobile ? (
        <MobileBottomNav />
      ) : (
        <Navigation isExpanded={isNavExpanded} setIsExpanded={setIsNavExpanded} />
      )}
      
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300 ease-in-out",
        !isMobile && (isNavExpanded ? "lg:pl-[16rem]" : "lg:pl-[5.5rem]")
      )}>
        <Header />
        <main className={cn(
          "flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pt-24",
          isMobile && "pb-24"
        )}>
          <div className="w-full max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};


function App() {
  return (
    // --- FIX: All Providers are removed. They are now in main.tsx ---
    <>
      <AnimatedBackground />
      <Routes>
        {/* --- Public routes --- */}
        <Route 
          path="/" 
          element={<PublicRoute><Home /></PublicRoute>} 
        />
        <Route 
          path="/auth" 
          element={<PublicRoute><Auth /></PublicRoute>} 
        />

        {/* --- Special protected route outside main layout --- */}
        <Route path="/join/:token" element={<ProtectedRoute><JoinLeaguePage /></ProtectedRoute>} />
        
        {/* --- Protected routes with main layout --- */}
        {/* --- FIX: Protected routes are now under /dashboard --- */}
        <Route path="/dashboard" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route index element={<Index />} />
          <Route path="current-run" element={<CurrentRun />} />
          <Route path="history" element={<History />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="players" element={<Players />} />
          <Route path="squads" element={<Squads />} />
          <Route path="ai-insights" element={<AIInsights />} />
          <Route path="achievements" element={<Achievements />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="friends" element={<Friends />} />
          <Route path="challenge" element={<ChallengeMode />} />
          <Route path="challenge/:leagueId" element={<LeagueDetailsPage />} />
          <Route path="settings" element={<Settings />} />
          
          <Route 
            path="admin" 
            element={
              <ProtectedRoute adminOnly={true}>
                <Admin />
              </ProtectedRoute>
            } 
          />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      {/* --- Toaster is now in main.tsx --- */}
    </>
  );
}

export default App;