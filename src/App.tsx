
import { Toaster } from "@/components/ui/toaster";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
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
import NotFound from "./pages/NotFound";
import "./App.css";

function App() {
  const { currentTheme } = useTheme();
  
  return (
    <AuthProvider>
      <Router>
        <div 
          className="min-h-screen transition-all duration-500 relative"
          style={{
            background: currentTheme.colors.background,
            color: currentTheme.colors.text
          }}
        >
          {/* Parallax Background */}
          <div className="parallax-bg"></div>
          
          {/* Brand Header - visible on all pages */}
          <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b animate-slide-in-from-top" 
               style={{ borderColor: currentTheme.colors.border, backgroundColor: `${currentTheme.colors.cardBg}80` }}>
            <div className="px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src="/lovable-uploads/bb8114bb-d9f2-40fe-8413-4232e31f0621.png" 
                  alt="FUT Visionary Logo" 
                  className="w-10 h-10 object-contain"
                />
                <div>
                  <h1 className="text-lg font-bold text-white">FUT Visionary</h1>
                  <p className="text-xs" style={{ color: currentTheme.colors.muted }}>AI Insights for FUT Greatness</p>
                </div>
              </div>
              <div className="text-xs font-mono text-white">
                Dominate with Data
              </div>
            </div>
          </div>

          <div className="pt-16">
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
