import { useState } from 'react';
// --- FIX: Import Outlet ---
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
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './hooks/useTheme';
import { Toaster } from "@/components/ui/sonner";
import { DataSyncProvider } from './hooks/useDataSync.tsx';
import { GameVersionProvider } from './contexts/GameVersionContext';
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

// **NEW: Import the Notifications page**
import Notifications from './pages/Notifications';

const Header = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isMobile = useMobile(); 

  if (!user || location.pathname === '/auth') {
    return null;
  }

  return (
    // Only apply w-full on mobile, let desktop be auto
    <header className={cn(
      "fixed top-0 right-0 h-20 flex items-center justify-end px-4 sm:px-8 z-30",
      isMobile ? "w-full" : "w-auto"
    )}>
      <div className="flex items-center gap-4">
        <Button asChild>
          <Link to="/current-run">
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

// This component now defines its own state and renders an <Outlet />
// for the child routes (the pages).
const MainLayout = () => {
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const isMobile = useMobile();

  return (
    <div className="flex min-h-screen bg-background">

      {/* --- Conditional Navigation --- */}
      {isMobile ? (
        <MobileBottomNav />
      ) : (
        <Navigation isExpanded={isNavExpanded} setIsExpanded={setIsNavExpanded} />
      )}
      {/* --- END Conditional Navigation --- */}

      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300 ease-in-out",
        // Only apply padding on desktop
        !isMobile && (isNavExpanded ? "lg:pl-[16rem]" : "lg:pl-[5.5rem]")
      )}>
        <Header />
        <main className={cn(
          "flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pt-24", // FIX: Reduced padding on mobile
          isMobile && "pb-24" // Add bottom padding on mobile for the nav dock
        )}>
          <div className="w-full max-w-7xl mx-auto">
            {/* Child routes (Index, CurrentRun, etc.) will render here */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};


function App() {
  return (
    <ThemeProvider>
      <AnimatedBackground />
      <AuthProvider>
        <GameVersionProvider>
          <DataSyncProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              
              {/* All protected routes are now children of the MainLayout route. */}
              <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                <Route path="/" element={<Index />} />
                <Route path="/current-run" element={<CurrentRun />} />
                <Route path="/history" element={<History />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/players" element={<Players />} />
                <Route path="/squads" element={<Squads />} />
                <Route path="/ai-insights" element={<AIInsights />} />
                <Route path="/achievements" element={<Achievements />} />
                
                {/* **NEW: Added the Notifications route** */}
                <Route path="/notifications" element={<Notifications />} />
                
                <Route path="/settings" element={<Settings />} />
                <Route path="/admin" element={<Admin />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
            {/* This is your 'sonner' toast component */}
            <Toaster />
          </DataSyncProvider>
        </GameVersionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;