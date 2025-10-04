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
  const { signOut, user, isAdmin } = useAuth(); // Correctly get isAdmin from context
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024); // Use lg breakpoint
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleNavClick = () => {
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Don't render anything if there's no user (except on the auth page)
  if (!user && location.pathname !== '/auth') {
    return null;
  }
  // Don't render on the auth page
  if (location.pathname === '/auth') {
    return null;
  }

  return (
    <>
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
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-20 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <nav 
        className={`
          fixed left-0 top-16 h-[calc(100vh-4rem)] border-r z-30
          transform transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          overflow-y-auto
        `}
        style={{
          backgroundColor: currentTheme.colors.surface,
          borderColor: currentTheme.colors.border,
          width: isMobile ? '80%' : (!isHovered ? '5.5rem' : '16rem'),
          maxWidth: isMobile ? '300px' : 'none'
        }}
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
      >
        <div className={`p-6 h-full flex flex-col ${!isHovered && !isMobile ? 'lg:items-center' : ''}`}>
          <div className="flex-1 space-y-2 overflow-y-auto pb-32">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  className={`
                    flex items-center px-4 py-3 rounded-lg transition-all duration-200
                    ${!isHovered && !isMobile ? 'lg:justify-center lg:px-3' : 'space-x-3'}
                    ${isActive ? 'shadow-lg' : 'hover:opacity-80'}
                  `}
                  style={{
                    backgroundColor: isActive ? currentTheme.colors.primary : 'transparent',
                    color: isActive ? '#ffffff' : currentTheme.colors.text
                  }}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className={`font-medium transition-all duration-300 overflow-hidden whitespace-nowrap ${!isHovered && !isMobile ? 'lg:w-0 lg:opacity-0' : 'lg:w-auto lg:opacity-100'}`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
            
            {isAdmin && (
              <Link
                to="/admin"
                onClick={handleNavClick}
                className={`
                  flex items-center px-4 py-3 rounded-lg transition-all duration-200
                  ${!isHovered && !isMobile ? 'lg:justify-center lg:px-3' : 'space-x-3'}
                  ${location.pathname === '/admin' ? 'shadow-lg' : 'hover:opacity-80'}
                `}
                style={{
                  backgroundColor: location.pathname === '/admin' ? currentTheme.colors.primary : 'transparent',
                  color: location.pathname === '/admin' ? '#ffffff' : currentTheme.colors.text
                }}
              >
                <Shield className="h-5 w-5 flex-shrink-0" />
                <span className={`font-medium transition-all duration-300 overflow-hidden whitespace-nowrap ${!isHovered && !isMobile ? 'lg:w-0 lg:opacity-0' : 'lg:w-auto lg:opacity-100'}`}>
                  Admin
                </span>
              </Link>
            )}
          </div>

          <div className="mt-auto pt-4 border-t" style={{ borderColor: currentTheme.colors.border }}>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className={`w-full flex items-center gap-2 rounded-lg transition-all duration-300 ${!isHovered && !isMobile ? 'lg:w-12 lg:justify-center lg:px-2' : ''}`}
              style={{
                backgroundColor: 'transparent',
                borderColor: currentTheme.colors.border,
                color: currentTheme.colors.text
              }}
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${!isHovered && !isMobile ? 'lg:w-0 lg:opacity-0' : 'lg:w-auto lg:opacity-100'}`}>
                Sign Out
              </span>
            </Button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
