import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
  LogOut,
  Award,
  Shield,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationProps {
  isExpanded: boolean;
  setIsExpanded: (isExpanded: boolean) => void;
}

const Navigation = ({ isExpanded, setIsExpanded }: NavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
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
    { name: 'Current Run', path: '/current-run', icon: Trophy },
    { name: 'History', path: '/history', icon: History },
    { name: 'Squads', path: '/squads', icon: Users },
    { name: 'Players', path: '/players', icon: TrendingUp },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'AI Insights', path: '/ai-insights', icon: Brain },
    { name: 'Achievements', path: '/achievements', icon: Award },
  ];
  
  const bottomNavItems = [
      { name: 'Settings', path: '/settings', icon: Settings },
  ];

  if (!user) return null;

  const navWidth = isExpanded ? '16rem' : '5.5rem';

  return (
    <>
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-background/50 backdrop-blur-md"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      <nav 
        className={cn(`
          fixed left-0 top-0 h-full border-r z-40
          transform transition-all duration-300 ease-in-out flex flex-col
          bg-background/30 backdrop-blur-xl border-white/10`,
          isMobile ? (isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'
        )}
        style={{ width: isMobile ? '280px' : navWidth }}
        onMouseEnter={() => !isMobile && setIsExpanded(true)}
        onMouseLeave={() => !isMobile && setIsExpanded(false)}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center gap-2 h-16 flex-shrink-0 px-2 mb-4">
            <img 
              src="/lovable-uploads/6b6465f4-e466-4f3b-9761-8a829fbe395c.png" 
              alt="FUTTrackr Logo" 
              className="w-8 h-8 object-contain flex-shrink-0"
            />
            <div className={`transition-all duration-200 overflow-hidden ${!isExpanded && !isMobile ? 'lg:w-0 lg:opacity-0' : 'lg:w-auto lg:opacity-100'}`}>
              <h1 className="text-xl font-bold whitespace-nowrap">FUTTrackr</h1>
            </div>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => (
              <NavItem key={item.path} item={item} isExpanded={isExpanded || isMobile} />
            ))}
            {isAdmin && <NavItem item={{ name: 'Admin', path: '/admin', icon: Shield }} isExpanded={isExpanded || isMobile} />}
          </div>

          <div className="mt-auto pt-4 border-t border-white/10 space-y-2">
             {bottomNavItems.map((item) => (
              <NavItem key={item.path} item={item} isExpanded={isExpanded || isMobile} />
            ))}
            <Button
              onClick={() => signOut()}
              variant="ghost"
              className="w-full flex items-center gap-3 rounded-lg transition-all duration-300 justify-start px-4 py-3 text-muted-foreground hover:bg-destructive/20 hover:text-red-400"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              <span className={`font-medium transition-opacity duration-200 whitespace-nowrap ${!isExpanded && !isMobile ? 'lg:opacity-0 lg:hidden' : 'lg:opacity-100'}`}>
                Sign Out
              </span>
            </Button>
          </div>
        </div>
      </nav>
    </>
  );
};

const NavItem = ({ item, isExpanded }: { item: { name: string; path: string; icon: React.ElementType }, isExpanded: boolean }) => {
    const location = useLocation();
    const isActive = location.pathname === item.path;
    return (
        <Link
            to={item.path}
            className={cn(`
                flex items-center px-4 py-3 rounded-lg transition-all duration-200 group
                hover:bg-primary/10`,
                isActive ? 'bg-primary text-primary-foreground shadow-lg' : 'text-foreground hover:text-primary',
                !isExpanded ? 'justify-center' : 'space-x-3'
            )}
        >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            <span className={cn(
                `font-semibold transition-all duration-200 whitespace-nowrap`,
                !isExpanded ? 'lg:opacity-0 lg:hidden' : 'lg:opacity-100'
            )}>
                {item.name}
            </span>
        </Link>
    )
}

export default Navigation;
