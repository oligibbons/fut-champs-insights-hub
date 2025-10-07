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

interface NavigationProps {
  isExpanded: boolean;
  setIsExpanded: (isExpanded: boolean) => void;
}

const Navigation = ({ isExpanded, setIsExpanded }: NavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const { signOut, user, isAdmin } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const navigationItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Current Run', path: '/current-run', icon: Calendar },
    { name: 'History', path: '/history', icon: History },
    { name: 'Squads', path: '/squads', icon: Users },
    { name: 'Players', path: '/players', icon: TrendingUp },
    { name: 'Analytics', path: '/analytics', icon: TrendingUp },
    { name: 'AI Insights', path: '/ai-insights', icon: Trophy },
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
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!user && location.pathname !== '/auth') {
    return null;
  }
  if (location.pathname === '/auth') {
    return null;
  }

  const navWidth = isExpanded ? '16rem' : '5.5rem';

  return (
    <>
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {isMobileMenuOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/60 z-30 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <nav 
        className={`
          fixed left-0 top-0 h-full border-r z-40
          transform transition-all duration-300 ease-in-out
          flex flex-col
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
        style={{
          width: isMobile ? '280px' : navWidth,
        }}
        onMouseEnter={() => !isMobile && setIsExpanded(true)}
        onMouseLeave={() => !isMobile && setIsExpanded(false)}
      >
        <div className="p-4 flex flex-col h-full bg-background/80 backdrop-blur-lg">
          <div className={`flex items-center mb-8 pt-2 pl-2 ${!isExpanded && !isMobile ? 'lg:justify-center' : ''}`}>
            <img 
              src="/lovable-uploads/6b6465f4-e466-4f3b-9761-8a829fbe395c.png" 
              alt="FUTTrackr Logo" 
              className="w-10 h-10 object-contain flex-shrink-0"
            />
            <div className={`transition-all duration-300 overflow-hidden ${!isExpanded && !isMobile ? 'lg:w-0 lg:opacity-0' : 'lg:w-auto lg:opacity-100 pl-2'}`}>
              <h1 className="text-xl font-bold whitespace-nowrap">FUTTrackr</h1>
            </div>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  className={`
                    flex items-center px-4 py-3 rounded-lg transition-all duration-200
                    ${!isExpanded && !isMobile ? 'lg:justify-center' : 'space-x-3'}
                    ${isActive ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-primary/10'}
                  `}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className={`font-medium transition-opacity duration-200 whitespace-nowrap ${!isExpanded && !isMobile ? 'lg:opacity-0 lg:hidden' : 'lg:opacity-100'}`}>
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
                  ${!isExpanded && !isMobile ? 'lg:justify-center' : 'space-x-3'}
                  ${location.pathname === '/admin' ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-primary/10'}
                `}
              >
                <Shield className="h-5 w-5 flex-shrink-0" />
                <span className={`font-medium transition-opacity duration-200 whitespace-nowrap ${!isExpanded && !isMobile ? 'lg:opacity-0 lg:hidden' : 'lg:opacity-100'}`}>
                  Admin
                </span>
              </Link>
            )}
          </div>

          <div className="mt-auto pt-4 border-t">
            <Button
              onClick={handleSignOut}
              variant="ghost"
              className={`w-full flex items-center gap-2 rounded-lg transition-all duration-300 justify-start ${!isExpanded && !isMobile ? 'lg:w-12 lg:justify-center' : 'px-4'}`}
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              <span className={`transition-opacity duration-200 whitespace-nowrap ${!isExpanded && !isMobile ? 'lg:opacity-0 lg:hidden' : 'lg:opacity-100'}`}>
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
