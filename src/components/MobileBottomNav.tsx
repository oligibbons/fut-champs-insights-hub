import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Users, Trophy, History, MoreHorizontal, TrendingUp, Brain, Award, Settings, BarChart3, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Button } from './ui/button';
import { useAuth } from '@/contexts/AuthContext';

// Your main nav items
const mainItems = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Run', path: '/current-run', icon: Trophy },
  { name: 'Squads', path: '/squads', icon: Users },
  { name: 'History', path: '/history', icon: History },
];

// The "More" items
const moreItems = [
  { name: 'Players', path: '/players', icon: TrendingUp },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'AI Insights', path: '/ai-insights', icon: Brain },
  { name: 'Achievements', path: '/achievements', icon: Award },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const MobileBottomNav = () => {
  const scrollDirection = useScrollDirection();
  const { isAdmin } = useAuth();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 h-20 border-t border-white/10 bg-black/30 backdrop-blur-xl transition-transform duration-300 ease-in-out lg:hidden',
        scrollDirection === 'down' ? 'translate-y-full' : 'translate-y-0'
      )}
    >
      <div className="grid h-full grid-cols-5 items-center">
        {mainItems.map((item) => (
          <MobileNavItem key={item.path} {...item} />
        ))}
        
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" className="flex h-full flex-col items-center justify-center rounded-none text-xs font-medium text-muted-foreground">
              <MoreHorizontal className="h-5 w-5" />
              More
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto rounded-t-2xl border-white/10 bg-black/50 backdrop-blur-xl">
            <SheetHeader>
              <SheetTitle className="text-center text-white">More Pages</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-1 gap-2 py-4">
              {moreItems.map((item) => (
                <SheetClose asChild key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-4 rounded-lg p-3 text-lg font-semibold transition-colors',
                        isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
                      )
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </NavLink>
                </SheetClose>
              ))}
              {isAdmin && (
                <SheetClose asChild>
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-4 rounded-lg p-3 text-lg font-semibold transition-colors',
                        isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
                      )
                    }
                  >
                    <Shield className="h-5 w-5" />
                    Admin
                  </NavLink>
                </SheetClose>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

const MobileNavItem = ({ path, icon: Icon, name }: { path: string; icon: React.ElementType; name: string }) => {
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <NavLink
      to={path}
      className={cn(
        'flex h-full flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
        // --- MODIFIED: Bolder active state using fifa-blue ---
        isActive ? 'text-fifa-blue font-bold' : 'text-muted-foreground hover:text-foreground'
        // --- END MODIFIED ---
      )}
    >
      <Icon className="h-5 w-5" />
      {name}
    </NavLink>
  );
};
