import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import {
  Home,
  Calendar,
  Users,
  TrendingUp,
  Settings,
  Menu,
  X,
  Trophy,
  History,
  UserPlus,
  Crown,
  LogOut,
  Award,
  Shield
} from 'lucide-react';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const { signOut, user } = useAuth();

  const navigationItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Current Run', path: '/current-week', icon: Calendar },
    { name: 'History', path: '/history', icon: History },
    { name: 'Squads', path: '/squads', icon: Users },
    { name: 'Players', path: '/players', icon: TrendingUp },
    { name: 'Analytics', path: '/analytics', icon: TrendingUp },
    { name: 'AI Insights', path: '/insights', icon: Trophy },
    { name: 'Achievements', path: '/achievements', icon: Award },
    { name: 'Friends', path: '/friends', icon: UserPlus },
    { name: 'Leaderboards', path: '/leaderboards', icon: Crown },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  // Check if user is admin
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const checkAdmin = async () => {
      if (user && user.email === 'olipg@hotmail.co.uk') {
        setIsAdmin(true);
      }
    };
    
    checkAdmin();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleNavClick = () => {
    setIsOpen(false);
    // Scroll to top when navigating
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-20 left-4 z-40">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            backgroundColor: currentTheme.colors.surface,
            borderColor: currentTheme.colors.border,
            color: currentTheme.colors.text
          }}
          className="static-element"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation Sidebar - Dock Style */}
      <nav 
        className={`
          fixed left-0 top-16 h-[calc(100vh-4rem)] border-r z-30
          transform transition-all duration-500 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          overflow-y-auto
          static-element
        `}
        style={{
          backgroundColor: currentTheme.colors.surface,
          borderColor: currentTheme.colors.border,
          backdropFilter: 'blur(12px)',
          width: !isHovered && !isOpen ? '5.5rem' : '16rem'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Hover trigger area - invisible but extends beyond sidebar */}
        <div 
          className="absolute -right-4 top-0 w-8 h-full bg-transparent hidden lg:block"
          onMouseEnter={() => setIsHovered(true)}
        />
        
        <div className={`p-6 h-full flex flex-col ${!isHovered && !isOpen ? 'lg:items-center' : ''}`}>
          <div className={`flex items-center mb-8 ${!isHovered && !isOpen ? 'lg:justify-center' : 'space-x-2'}`}>
            <img 
              src="/lovable-uploads/6b6465f4-e466-4f3b-9761-8a829fbe395c.png" 
              alt="FUTALYST Logo" 
              className="w-10 h-10 object-contain flex-shrink-0"
            />
            <div className={`transition-all duration-300 overflow-hidden ${!isHovered && !isOpen ? 'lg:w-0 lg:opacity-0' : 'lg:w-auto lg:opacity-100'}`}>
              <h1 
                className="text-xl font-bold whitespace-nowrap"
                style={{ color: currentTheme.colors.text }}
              >
                FUTALYST
              </h1>
              <p className="text-xs whitespace-nowrap" style={{ color: currentTheme.colors.muted }}>
                AI-Powered FUT Analytics
              </p>
            </div>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto pb-32">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  className={`
                    flex items-center px-4 py-3 rounded-lg transition-all duration-200 nav-element
                    ${!isHovered && !isOpen ? 'lg:justify-center lg:px-3' : 'space-x-3'}
                    ${isActive 
                      ? 'shadow-lg' 
                      : 'hover:opacity-80'
                    }
                  `}
                  style={{
                    backgroundColor: isActive ? currentTheme.colors.primary : 'transparent',
                    color: isActive ? '#ffffff' : currentTheme.colors.text
                  }}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className={`font-medium transition-all duration-300 overflow-hidden whitespace-nowrap ${!isHovered && !isOpen ? 'lg:w-0 lg:opacity-0' : 'lg:w-auto lg:opacity-100'}`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
            
            {/* Admin link - only visible for admin users */}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={handleNavClick}
                className={`
                  flex items-center px-4 py-3 rounded-lg transition-all duration-200 nav-element
                  ${!isHovered && !isOpen ? 'lg:justify-center lg:px-3' : 'space-x-3'}
                  ${location.pathname === '/admin' ? 'shadow-lg' : 'hover:opacity-80'}
                `}
                style={{
                  backgroundColor: location.pathname === '/admin' ? currentTheme.colors.primary : 'transparent',
                  color: location.pathname === '/admin' ? '#ffffff' : currentTheme.colors.text
                }}
              >
                <Shield className="h-5 w-5 flex-shrink-0" />
                <span className={`font-medium transition-all duration-300 overflow-hidden whitespace-nowrap ${!isHovered && !isOpen ? 'lg:w-0 lg:opacity-0' : 'lg:w-auto lg:opacity-100'}`}>
                  Admin
                </span>
              </Link>
            )}
          </div>

          {/* User Section */}
          {user && (
            <div className="mt-auto pt-4 border-t absolute bottom-0 left-0 right-0 bg-inherit px-6 pb-6" style={{ borderColor: currentTheme.colors.border }}>
              <div className={`mb-4 p-3 rounded-lg transition-all duration-300 overflow-hidden ${!isHovered && !isOpen ? 'lg:w-0 lg:opacity-0 lg:hidden' : 'lg:w-auto lg:opacity-100 lg:block'}`} 
                   style={{ backgroundColor: currentTheme.colors.cardBg }}>
                <p className="text-sm font-medium text-white whitespace-nowrap">{user.email}</p>
                <p className="text-xs whitespace-nowrap" style={{ color: currentTheme.colors.muted }}>
                  Signed in
                </p>
              </div>
              <Button
                onClick={handleSignOut}
                variant="outline"
                className={`w-full flex items-center gap-2 rounded-lg transition-all duration-300 nav-element ${!isHovered && !isOpen ? 'lg:w-12 lg:justify-center lg:px-2' : ''}`}
                style={{
                  backgroundColor: 'transparent',
                  borderColor: currentTheme.colors.border,
                  color: currentTheme.colors.text
                }}
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
                <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${!isHovered && !isOpen ? 'lg:w-0 lg:opacity-0' : 'lg:w-auto lg:opacity-100'}`}>
                  Sign Out
                </span>
              </Button>
            </div>
          )}
        </div>

        {/* Dock indicator */}
        <div className={`absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-12 bg-gradient-to-b from-transparent via-white/30 to-transparent rounded-l-full transition-opacity duration-300 ${!isHovered && !isOpen ? 'lg:opacity-100' : 'lg:opacity-0'}`} />
      </nav>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-20"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Navigation;