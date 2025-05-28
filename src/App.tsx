
import { Toaster } from "@/components/ui/toaster";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";
import Index from "./pages/Index";
import CurrentWeek from "./pages/CurrentWeek";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Squads from "./pages/Squads";
import Players from "./pages/Players";
import Insights from "./pages/Insights";
import History from "./pages/History";
import NotFound from "./pages/NotFound";
import "./App.css";

function App() {
  const { currentTheme } = useTheme();
  
  return (
    <Router>
      <div 
        className="min-h-screen transition-all duration-500"
        style={{
          background: currentTheme.colors.background,
          color: currentTheme.colors.text
        }}
      >
        {/* Brand Header - visible on all pages */}
        <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b" 
             style={{ borderColor: currentTheme.colors.border, backgroundColor: `${currentTheme.colors.cardBg}80` }}>
          <div className="px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-white font-bold text-sm">FV</span>
              </div>
              <div>
                <h1 className="text-lg font-bold gradient-text">FUT Visionary</h1>
                <p className="text-xs" style={{ color: currentTheme.colors.muted }}>AI Insights for FUT Greatness</p>
              </div>
            </div>
            <div className="text-xs" style={{ color: currentTheme.colors.muted }}>
              Dominate with Data
            </div>
          </div>
        </div>

        <div className="pt-16">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/current-week" element={<CurrentWeek />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/squads" element={<Squads />} />
            <Route path="/players" element={<Players />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/history" element={<History />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
