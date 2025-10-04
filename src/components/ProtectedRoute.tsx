import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // This effect runs whenever the loading or user state changes.
    if (!loading) {
      if (!user) {
        // If loading is finished and there's no user, redirect to auth.
        navigate('/auth');
      }
    }
  }, [user, loading, navigate]); // Dependencies for the effect

  // While the initial auth check is running, show a full-screen loader.
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If loading is done and there IS a user, render the children.
  // The useEffect above handles the redirect case for non-users.
  return user ? <>{children}</> : null;
};

export default ProtectedRoute;
