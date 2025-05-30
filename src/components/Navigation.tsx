
import { useState } from 'react';
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

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-20 left-4 z-10">
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
      <nav className={`
        fixed left-0 top-16 h-full w-64 border-r z-10
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}
      style={{
        backgroundColor: currentTheme.colors.surface,
        borderColor: currentTheme.colors.border,
        backdropFilter: 'blur(12px)'
      }}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center space-x-2 mb-8">
            <img 
              src="/lovable-uploads/6b6465f4-e466-4f3b-9761-8a829fbe395c.png" 
              alt="FUTALYST Logo" 
              className="w-10 h-10 object-contain"
            />
            <div>
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
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Section */}
          {user && (
            <div className="mt-auto pt-4 border-t" style={{ borderColor: currentTheme.colors.border }}>
              <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: currentTheme.colors.cardBg }}>
                <p className="text-sm font-medium text-white">{user.email}</p>
                <p className="text-xs" style={{ color: currentTheme.colors.muted }}>
                  Signed in
                </p>
              </div>
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="w-full flex items-center gap-2 rounded-lg"
                style={{
                  backgroundColor: 'transparent',
                  borderColor: currentTheme.colors.border,
                  color: currentTheme.colors.text
                }}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-5"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Navigation;
