// src/components/ProtectedRoute.tsx
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const { user, loading, isAdmin } = useAuth();
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

  // If loading is complete and there's no user, redirect to the login page.
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  // --- THIS IS THE FIX ---
  // If this is an admin-only route and the user is not an admin, redirect to the main page.
  // Redirecting to '/' is safer as it resolves to the protected layout's index route.
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // If all checks pass, render the protected component.
  return <>{children}</>;
};

export default ProtectedRoute;