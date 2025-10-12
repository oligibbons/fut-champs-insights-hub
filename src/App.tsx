import { useState, useEffect } from 'react';
import { Route, Routes, Link, useLocation } from 'react-router-dom';
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

const Header = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user || location.pathname === '/auth') {
    return null;
  }

  return (
    <header className="fixed top-0 right-0 h-20 flex items-center justify-end px-4 sm:px-8 z-30 w-full lg:w-auto">
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

function App() {
  const [isNavExpanded, setIsNavExpanded] = useState(false);

  const Layout = ({ children }: { children: React.ReactNode }) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth < 1024);
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
      // THE FIX: The theme's background is now applied here.
      // This div acts as the solid page background that sits on top of the animation.
      <div className="flex min-h-screen bg-background">
        <Navigation isExpanded={isNavExpanded} setIsExpanded={setIsNavExpanded} />
        <div className={cn(
          "flex-1 flex flex-col transition-all duration-300 ease-in-out",
          isNavExpanded ? "lg:pl-[16rem]" : "lg:pl-[5.5rem]"
        )}>
          <Header />
          <main className="flex-1 overflow-y-auto p-6 lg:p-8 pt-24">
            <div className="w-full max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    );
  };

  return (
    <ThemeProvider>
      <AnimatedBackground />
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
