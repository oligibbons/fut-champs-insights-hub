import { Toaster } from "@/components/ui/toaster";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
import Achievements from "./pages/Achievements";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import "./App.css";

function App() {
  const { currentTheme } = useTheme();
  
  return (
    <Router basename="/">
      <AuthProvider>
        <div 
          className="min-h-screen transition-all duration-500 relative"
          style={{
            background: currentTheme.colors.background,
            color: currentTheme.colors.text
          }}
        >
          {/* Brand Header - visible on all pages */}
          <div className="fixed top-0 left-0 right-0 z-20 backdrop-blur-md border-b h-16" 
               style={{ 
                 borderColor: currentTheme.colors.border, 
                 backgroundColor: `${currentTheme.colors.cardBg}80` 
               }}>
            <div className="px-4 py-2 flex items-center justify-between h-full">
              <div className="flex items-center gap-3">
                <img 
                  src="/lovable-uploads/6b6465f4-e466-4f3b-9761-8a829fbe395c.png" 
                  alt="FUTALYST Logo" 
                  className="w-10 h-10 object-contain"
                />
                <div>
                  <h1 className="text-lg font-bold" style={{ color: currentTheme.colors.text }}>FUTALYST</h1>
                  <p className="text-xs" style={{ color: currentTheme.colors.muted }}>AI-Powered FUT Analytics</p>
                </div>
              </div>
              <div className="text-xs font-mono" style={{ color: currentTheme.colors.text }}>
                Data-Driven Excellence
              </div>
            </div>
          </div>

          {/* Add theme-aware CSS custom properties to root */}
          <style>
            {`
              :root {
                --color-primary: ${currentTheme.colors.primary};
                --color-secondary: ${currentTheme.colors.secondary};
                --color-accent: ${currentTheme.colors.accent};
                --color-surface: ${currentTheme.colors.surface};
                --color-card-bg: ${currentTheme.colors.cardBg};
                --color-text: ${currentTheme.colors.text};
                --color-muted: ${currentTheme.colors.muted};
                --color-border: ${currentTheme.colors.border};
                --color-success: ${currentTheme.colors.success};
                --color-warning: ${currentTheme.colors.warning};
                --color-error: ${currentTheme.colors.error};
                --fifa-blue: ${currentTheme.colors.fifa.blue};
                --fifa-green: ${currentTheme.colors.fifa.green};
                --fifa-gold: ${currentTheme.colors.fifa.gold};
                --fifa-red: ${currentTheme.colors.fifa.red};
                --fifa-purple: ${currentTheme.colors.fifa.purple};
              }
              
              .glass-card {
                background: ${currentTheme.colors.cardBg} !important;
                border: 1px solid ${currentTheme.colors.border} !important;
                color: ${currentTheme.colors.text} !important;
              }
              
              .static-element {
                background: ${currentTheme.colors.surface} !important;
                border-color: ${currentTheme.colors.border} !important;
              }
              
              .modern-button-primary {
                background: ${currentTheme.colors.fifa.blue} !important;
                color: white !important;
              }
              
              .modern-button-primary:hover {
                background: ${currentTheme.colors.fifa.blue}dd !important;
              }
              
              .page-header {
                color: ${currentTheme.colors.text} !important;
              }
            `}
          </style>

          <div className="pt-16">
            <Routes>
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/auth" element={<Auth />} />
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
              <Route path="*" element={<Navigate to="/404\" replace />} />
            </Routes>
          </div>
          <Toaster />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;