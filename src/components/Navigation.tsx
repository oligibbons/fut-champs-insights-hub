import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
// **MODIFIED: Imported 'Play'**
import { Home, Users, TrendingUp, Settings, Trophy, History, LogOut, Award, Shield, BarChart3, Brain, Bell, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import logo from '/fut-trackr-logo.jpg';

interface NavigationProps {
  isExpanded: boolean;
  setIsExpanded: (isExpanded: boolean) => void;
}

const Navigation = ({ isExpanded, setIsExpanded }: NavigationProps) => {
  const { signOut, user, isAdmin } = useAuth();
  
  const navigationItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    // **MODIFIED: Changed icon from Trophy to Play**
    { name: 'Current Run', path: '/current-run', icon: Play }, 
    { name: 'History', path: '/history', icon: History },
    { name: 'Squads', path: '/squads', icon: Users },
    { name: 'Players', path: '/players', icon: TrendingUp },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'AI Insights', path: '/ai-insights', icon: Brain },
    { name: 'Achievements', path: '/achievements', icon: Award },
    // --- ADDED LINKS ---
    { name: 'Friends', path: '/friends', icon: Users },
    { name: 'Challenge Mode', path: '/challenge', icon: Trophy },
  ];
  
  const bottomNavItems = [
      // **NEW: Added Notifications link**
      { name: 'Notifications', path: '/notifications', icon: Bell },
      { name: 'Settings', path: '/settings', icon: Settings },
  ];

  if (!user) return null;

  const navWidth = isExpanded ? '16rem' : '5.5rem';

  return (
    <nav 
      className={cn(
        `fixed left-0 top-0 h-full border-r z-40 transform transition-all duration-300 ease-in-out flex-col bg-black/30 backdrop-blur-xl border-white/10`,
        'hidden lg:flex' // Hide on mobile, flex on large screens
      )}
      style={{ width: navWidth }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex flex-col h-full p-4">
        <div className="flex items-center gap-2 h-16 flex-shrink-0 px-2 mb-4">
          <img src={logo} alt="FUTTrackr Logo" className="w-8 h-8 object-contain flex-shrink-0" />
          <div className={cn('transition-all duration-200 overflow-hidden', !isExpanded ? 'lg:w-0 lg:opacity-0' : 'lg:w-auto lg:opacity-100')}>
            <h1 className="text-xl font-bold whitespace-nowrap">FUTTrackr</h1>
          </div>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => <NavItem key={item.path} item={item} isExpanded={isExpanded} />)}
          {isAdmin && <NavItem item={{ name: 'Admin', path: '/admin', icon: Shield }} isExpanded={isExpanded} />}
        </div>

        <div className="mt-auto pt-4 border-t border-white/10 space-y-2">
            {bottomNavItems.map((item) => <NavItem key={item.path} item={item} isExpanded={isExpanded} />)}
          <Button onClick={() => signOut()} variant="ghost" className="w-full flex items-center gap-3 rounded-lg transition-all duration-300 justify-start px-4 py-3 text-muted-foreground hover:bg-destructive/20 hover:text-red-400">
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span className={cn('font-medium transition-opacity duration-200 whitespace-nowrap', !isExpanded ? 'lg:opacity-0 lg:hidden' : 'lg:opacity-100')}>
              Sign Out
            </span>
          </Button>
        </div>
      </div>
    </nav>
  );
};

const NavItem = ({ item, isExpanded }: { item: { name: string; path: string; icon: React.ElementType }, isExpanded: boolean }) => {
    const location = useLocation();
    const isActive = location.pathname === item.path;
    return (
        <Link
            to={item.path}
            className={cn(`flex items-center px-4 py-3 rounded-lg transition-all duration-200 group text-foreground hover:text-primary`,
                isActive ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-primary/10',
                !isExpanded ? 'justify-center' : 'space-x-3'
            )}
        >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            <span className={cn(`font-semibold transition-all duration-200 whitespace-nowrap`, !isExpanded ? 'lg:opacity-0 lg:hidden' : 'lg:opacity-100')}>
                {item.name}
            </span>
        </Link>
    )
}

export default Navigation;