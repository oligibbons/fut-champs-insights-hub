// src/components/MobileBottomNav.tsx
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, 
  Users, 
  Trophy, 
  History, 
  MoreHorizontal, 
  TrendingUp, 
  Brain, 
  Award, 
  Settings, 
  BarChart3, 
  Shield, 
  Bell,
  UsersRound, 
  Swords 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Button } from './ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme'; 

// --- FIX: All paths are now prefixed with /dashboard ---
const mainItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutGrid },
  { name: 'Run', path: '/dashboard/current-run', icon: Trophy },
  { name: 'Squads', path: '/dashboard/squads', icon: Users },
  { name: 'History', path: '/dashboard/history', icon: History },
];

// --- FIX: All paths are now prefixed with /dashboard ---
const moreItems = [
  { name: 'Players', path: '/dashboard/players', icon: TrendingUp },
  { name: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
  { name: 'AI Insights', path: '/dashboard/ai-insights', icon: Brain },
  { name: 'Achievements', path: '/dashboard/achievements', icon: Award },
  { name: 'Friends', path: '/dashboard/friends', icon: UsersRound },
  { name: 'Challenge', path: '/dashboard/challenge', icon: Swords },
  { name: 'Notifications', path: '/dashboard/notifications', icon: Bell },
  { name: 'Settings', path: '/dashboard/settings', icon: Settings },
];

export const MobileBottomNav = () => {
  const scrollDirection = useScrollDirection();
  const { isAdmin } = useAuth();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { currentTheme } = useTheme(); 

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 h-20 border-t backdrop-blur-xl transition-transform duration-300 ease-in-out lg:hidden',
        scrollDirection === 'down' ? 'translate-y-full' : 'translate-y-0'
      )}
      style={{ 
        backgroundColor: `${currentTheme.colors.cardBg}b3`, // 70% opacity
        borderColor: currentTheme.colors.border 
      }}
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
          <SheetContent 
            side="bottom" 
            className="h-auto rounded-t-2xl border-white/10"
            style={{
              backgroundColor: `${currentTheme.colors.cardBg}e6`, // 90% opacity
              borderColor: currentTheme.colors.border 
            }}
          >
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
                        isActive 
                          ? 'text-primary-foreground' 
                          : 'text-muted-foreground hover:bg-white/10'
                      )
                    }
                    // --- THIS IS THE FIX ---
                    // The 'style' prop must also be a function to get 'isActive'
                    style={({ isActive }) => isActive ? { 
                      backgroundColor: currentTheme.colors.primary,
                      color: currentTheme.colors.primaryText
                    } : {}}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </NavLink>
                </SheetClose>
              ))}
              {isAdmin && (
                <SheetClose asChild>
                  <NavLink
                    // --- FIX: Admin path prefixed ---
                    to="/dashboard/admin"
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-4 rounded-lg p-3 text-lg font-semibold transition-colors',
                         isActive 
                          ? 'text-primary-foreground' 
                          : 'text-muted-foreground hover:bg-white/10'
                      )
                    }
                    // --- THIS IS THE FIX ---
                    // The 'style' prop must also be a function to get 'isActive'
                    style={({ isActive }) => isActive ? { 
                      backgroundColor: currentTheme.colors.primary,
                      color: currentTheme.colors.primaryText
                    } : {}}
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
  // This 'isActive' definition is correct because it's for the 'mainItems'
  const isActive = location.pathname === path;
  const { currentTheme } = useTheme(); 

  return (
    <NavLink
      to={path}
      className={cn(
        'flex h-full flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
        isActive ? 'font-bold' : 'text-muted-foreground hover:text-foreground'
      )}
      style={isActive ? { color: currentTheme.colors.primary } : {}}
    >
      <Icon className="h-5 w-5" />
      {name}
    </NavLink>
  );
};