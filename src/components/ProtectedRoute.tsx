import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const { user, loading, isAdmin } = useAuth();

  // The main loading screen is now handled by App.tsx, so we just wait here.
  // If we are still in the initial loading state, render nothing to prevent a flicker.
  if (loading) {
    return null;
  }

  // If loading is complete and there's no user, redirect to the login page.
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  // If this is an admin-only route and the user is not an admin, redirect to the homepage.
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // If all checks pass, render the protected component.
  return <>{children}</>;
};

export default ProtectedRoute;
