import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  // While the initial authentication check is running, show a full-screen loader.
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // After loading, if there is no user, redirect to the /auth page immediately.
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If loading is complete and a user exists, render the requested component.
  return <>{children}</>;
};

export default ProtectedRoute;
