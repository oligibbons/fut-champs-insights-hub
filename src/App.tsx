import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import Index from './pages/Index';
import CurrentWeek from './pages/CurrentWeek';
import History from './pages/History';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';
import Squads from './pages/Squads';
import Players from './pages/Players';
import { Toaster } from "@/components/ui/toaster"

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex h-screen bg-gray-900 text-white font-sans">
          <Navigation />
          <main className="flex-1 overflow-y-auto md:ml-64 pt-16 md:pt-0 bg-dots">
            <div className="p-4 md:p-8">
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/current-week" element={<ProtectedRoute><CurrentWeek /></ProtectedRoute>} />
                <Route path="/squads" element={<ProtectedRoute><Squads /></ProtectedRoute>} />
                <Route path="/players" element={<ProtectedRoute><Players /></ProtectedRoute>} />
                <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </main>
        </div>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
