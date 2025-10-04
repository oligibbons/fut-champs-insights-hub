import { Toaster } from "@/components/ui/toaster";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
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
import "./App.css";

function App() {
  return (
    <Router basename="/">
      <AuthProvider>
        <MainContent />
      </AuthProvider>
    </Router>
  );
}

const MainContent = () => {
  const { currentTheme } = useTheme();
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: currentTheme.colors.background }}>
        <p style={{ color: currentTheme.colors.text }}>Loading...</p>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen transition-all duration-500 relative"
      style={{
        background: currentTheme.colors.background,
        color: currentTheme.colors.text
      }}
    >
      {user && (
        <header className="fixed top-0 left-0 right-0 z-20 backdrop-blur-md border-b h-16" 
               style={{ 
                 borderColor: currentTheme.colors.border, 
                 backgroundColor: `${currentTheme.colors.cardBg}80` 
               }}>
          <div className="px-4 py-2 flex items-center justify-between h-full">
            <div className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/6b6465f4-e466-4f-3b-9761-8a829fbe395c.png" 
                alt="FUTALYST Logo" 
                className="w-10 h-10 object-contain"
              />
            </div>
          </div>
        </header>
      )}
      
      <Navigation />
      
      <main className={`transition-all duration-300 ${user ? 'pt-16 lg:pl-[5.5rem]' : ''}`}>
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
            <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
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
