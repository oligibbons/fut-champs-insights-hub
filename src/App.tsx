
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
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
