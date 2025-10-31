// src/components/PublicRoute.tsx
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const { user, loading } = useAuth();
  const { currentTheme } = useTheme();

  if (loading) {
    // Show a full-page loader while checking auth state
    return (
      <div className="flex items-center justify-center h-screen">
        <RefreshCw
          className="h-8 w-8 animate-spin"
          style={{ color: currentTheme.colors.primary }}
        />
      </div>
    );
  }

  // --- THIS IS THE FIX ---
  // If loading is complete and there IS a user, redirect to the dashboard.
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // If no user, render the public component (e.g., Home or Auth page).
  return <>{children}</>;
};

export default PublicRoute;