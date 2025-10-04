import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  // While the auth state is being determined, show a full-screen loader.
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If loading is complete and there is no user, navigate to the auth page.
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If loading is complete and a user exists, render the protected content.
  return <>{children}</>;
};

export default ProtectedRoute;
