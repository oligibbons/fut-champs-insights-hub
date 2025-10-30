// src/components/PublicRoute.tsx
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
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

  // If user is logged in, redirect them away from public pages
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // If no user, show the public page (Home or Auth)
  return <>{children}</>;
};

export default PublicRoute;