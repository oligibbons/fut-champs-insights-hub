import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const { user, loading, isAdmin } = useAuth();

  // The loading screen is now handled by App.tsx, so we just wait here.
  if (loading) {
    return null; // Render nothing while waiting for auth state
  }

  // If not loading and no user, redirect to login
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  // If this is an admin-only route and the user is not an admin, redirect to home
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // If checks pass, render the protected component
  return <>{children}</>;
};

export default ProtectedRoute;
