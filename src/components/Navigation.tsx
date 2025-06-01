
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  Award
} from 'lucide-react';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  const { currentTheme } = useTheme();
  const { signOut, user } = useAuth();

  const navigationItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Current Week', path: '/current-week', icon: Calendar },
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
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Auto-hide navigation after 3 seconds of no hover
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (!isHovered && !isOpen) {
      timeout = setTimeout(() => {
        // Navigation will be hidden via CSS transform
      }, 3000);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isHovered, isOpen]);

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-20 left-4 z-50">
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

      {/* Navigation Sidebar */}
      <nav 
        className={`
          fixed left-0 top-16 h-full w-64 border-r z-40
          transform transition-all duration-500 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          ${!isHovered && !isOpen ? 'lg:-translate-x-56' : 'lg:translate-x-0'}
          hover:translate-x-0
        `}
        style={{
          backgroundColor: currentTheme.colors.surface,
          borderColor: currentTheme.colors.border,
          backdropFilter: 'blur(12px)'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Hover trigger area - invisible but extends beyond sidebar */}
        <div 
          className="absolute -right-4 top-0 w-8 h-full bg-transparent hidden lg:block"
          onMouseEnter={() => setIsHovered(true)}
        />
        
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center space-x-2 mb-8">
            <img 
              src="/lovable-uploads/6b6465f4-e466-4f3b-9761-8a829fbe395c.png" 
              alt="FUTALYST Logo" 
              className="w-10 h-10 object-contain"
            />
            <div className={`transition-opacity duration-300 ${!isHovered && !isOpen ? 'lg:opacity-0' : 'lg:opacity-100'}`}>
              <h1 
                className="text-xl font-bold"
                style={{ color: currentTheme.colors.text }}
              >
                FUTALYST
              </h1>
              <p className="text-xs" style={{ color: currentTheme.colors.muted }}>
                AI-Powered FUT Analytics
              </p>
            </div>
          </div>

          <div className="space-y-2 flex-1">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
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
                  <span className={`font-medium transition-opacity duration-300 ${!isHovered && !isOpen ? 'lg:opacity-0 lg:w-0' : 'lg:opacity-100'}`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* User Section */}
          {user && (
            <div className="mt-auto pt-4 border-t" style={{ borderColor: currentTheme.colors.border }}>
              <div className={`mb-4 p-3 rounded-lg transition-opacity duration-300 ${!isHovered && !isOpen ? 'lg:opacity-0' : 'lg:opacity-100'}`} 
                   style={{ backgroundColor: currentTheme.colors.cardBg }}>
                <p className="text-sm font-medium text-white">{user.email}</p>
                <p className="text-xs" style={{ color: currentTheme.colors.muted }}>
                  Signed in
                </p>
              </div>
              <Button
                onClick={handleSignOut}
                variant="outline"
                className={`w-full flex items-center gap-2 rounded-lg transition-all duration-300 ${!isHovered && !isOpen ? 'lg:w-12 lg:justify-center' : ''}`}
                style={{
                  backgroundColor: 'transparent',
                  borderColor: currentTheme.colors.border,
                  color: currentTheme.colors.text
                }}
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
                <span className={`transition-opacity duration-300 ${!isHovered && !isOpen ? 'lg:opacity-0 lg:w-0' : 'lg:opacity-100'}`}>
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
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Navigation;
