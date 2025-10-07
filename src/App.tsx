import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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
import { DataSyncProvider } from './hooks/useDataSync';
import { GameVersionProvider } from './contexts/GameVersionContext';
import AIInsights from './pages/AIInsights';
import Achievements from './pages/Achievements';
import Admin from './pages/Admin';
import Squads from './pages/Squads';

function App() {
  const Layout = ({ children }: { children: React.ReactNode }) => (
    <div className="flex h-screen bg-transparent">
      <Navigation />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );

  return (
    <ThemeProvider>
      <div className="fixed inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(at_27%_37%,hsla(var(--primary),0.1)_0px,transparent_50%),radial-gradient(at_97%_21%,hsla(var(--accent),0.15)_0px,transparent_50%),radial-gradient(at_82%_99%,hsla(var(--secondary),0.15)_0px,transparent_50%)]" />
      <AuthProvider>
        <GameVersionProvider>
          <DataSyncProvider>
            <Router>
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
            </Router>
            <Toaster />
          </DataSyncProvider>
        </GameVersionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
