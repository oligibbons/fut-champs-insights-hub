import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
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
import { useMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const { signOut, user, isAdmin } = useAuth();
  const isMobile = useMobile();
  const [isOpen, setIsOpen] = React.useState(false);

  const navigationItems = React.useMemo(() => {
    const items = [
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
    if (isAdmin) {
      items.push({ name: 'Admin', path: '/admin', icon: Shield });
    }
    return items;
  }, [isAdmin]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleNavClick = () => {
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinkClasses = (path: string) => `
    flex items-center px-4 py-3 rounded-lg transition-all duration-200
    ${location.pathname === path 
      ? 'shadow-lg' 
      : 'hover:opacity-80'
    }
  `;

  const MobileNav = () => (
    <>
      <div className="lg:hidden fixed top-20 left-4 z-40">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              style={{
                backgroundColor: currentTheme.colors.surface,
                borderColor: currentTheme.colors.border,
                color: currentTheme.colors.text
              }}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-gray-900 border-r-gray-800 text-white w-72 p-4 flex flex-col">
            <div className="mb-8 flex items-center gap-2">
              <img src="/lovable-uploads/6b6465f4-e466-4f3b-9761-8a829fbe395c.png" alt="FUTALYST Logo" className="w-10 h-10" />
              <h1 className="text-xl font-bold">FUTALYST</h1>
            </div>
            <nav className="flex-1 space-y-2">
              {navigationItems.map((item) => (
                <SheetClose asChild key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={handleNavClick}
                    className={navLinkClasses(item.path)}
                    style={{
                      backgroundColor: location.pathname === item.path ? currentTheme.colors.primary : 'transparent',
                      color: location.pathname === item.path ? '#ffffff' : currentTheme.colors.text
                    }}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    <span>{item.name}</span>
                  </NavLink>
                </SheetClose>
              ))}
            </nav>
            {user && (
              <div className="mt-auto">
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="w-full"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );

  const DesktopNav = () => {
    const [isHovered, setIsHovered] = React.useState(false);
    const isCompact = !isHovered;

    return (
      <nav 
        className="hidden lg:flex fixed left-0 top-16 h-[calc(100vh-4rem)] border-r z-30 transition-all duration-300 ease-in-out"
        style={{
          backgroundColor: currentTheme.colors.surface,
          borderColor: currentTheme.colors.border,
          width: isCompact ? '5.5rem' : '16rem',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`p-6 h-full flex flex-col ${isCompact ? 'items-center' : ''}`}>
          <div className={`flex items-center mb-8 ${isCompact ? 'justify-center' : 'space-x-2'}`}>
            <img 
              src="/lovable-uploads/6b6465f4-e466-4f3b-9761-8a829fbe395c.png" 
              alt="FUTALYST Logo" 
              className="w-10 h-10 object-contain flex-shrink-0"
            />
            <div className={`transition-all duration-300 overflow-hidden ${isCompact ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
              <h1 className="text-xl font-bold whitespace-nowrap" style={{ color: currentTheme.colors.text }}>
                FUTALYST
              </h1>
            </div>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto pb-32">
            {navigationItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={navLinkClasses(item.path) + ` ${isCompact ? 'justify-center px-3' : 'space-x-3'}`}
                style={{
                  backgroundColor: location.pathname === item.path ? currentTheme.colors.primary : 'transparent',
                  color: location.pathname === item.path ? '#ffffff' : currentTheme.colors.text
                }}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className={`font-medium transition-all duration-300 overflow-hidden whitespace-nowrap ${isCompact ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                  {item.name}
                </span>
              </NavLink>
            ))}
          </div>

          {user && (
            <div className="mt-auto pt-4 border-t" style={{ borderColor: currentTheme.colors.border }}>
              <Button
                onClick={handleSignOut}
                variant="outline"
                className={`w-full flex items-center gap-2 rounded-lg transition-all duration-300 ${isCompact ? 'w-12 justify-center px-2' : ''}`}
                style={{
                  backgroundColor: 'transparent',
                  borderColor: currentTheme.colors.border,
                  color: currentTheme.colors.text
                }}
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
                <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${isCompact ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                  Sign Out
                </span>
              </Button>
            </div>
          )}
        </div>
      </nav>
    );
  }

  if (isMobile === undefined) return null;

  return isMobile ? <MobileNav /> : <DesktopNav />;
};

export default Navigation;
