import { useLocation, Link } from "react-router-dom"; // Import Link
import { useEffect } from "react";
import { useTheme } from "@/hooks/useTheme"; // Import useTheme
import { AlertTriangle } from "lucide-react"; // Import an icon

const NotFound = () => {
  const location = useLocation();
  const { currentTheme } = useTheme();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: currentTheme.colors.background }}>
      <div className="text-center">
        <AlertTriangle className="h-24 w-24 mx-auto mb-6 text-red-500/70" />
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-2xl text-gray-400 mb-8">Oops! Page not found</p>
        <Link 
          to="/" 
          className="text-lg font-semibold rounded-xl px-6 py-3 transition-colors"
          style={{ 
            color: currentTheme.colors.primaryText, 
            backgroundColor: currentTheme.colors.primary,
          }}
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
