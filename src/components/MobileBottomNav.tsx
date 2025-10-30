// src/components/MobileBottomNav.tsx
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  // --- FIX: Imported LayoutGrid ---
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
  // --- FIX: Imported UsersRound and Swords ---
  UsersRound, 
  Swords 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Button } from './ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme'; // Import useTheme

// --- FIX: Updated main items ---
// "Home" (path: "/") is now the public landing page.
// "Dashboard" (path: "/dashboard") is the new logged-in home.
const mainItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutGrid },
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
  // --- Uses correct icons ---
  { name: 'Friends', path: '/friends', icon: UsersRound },
  { name: 'Challenge', path: '/challenge', icon: Swords },
  { name: 'Notifications', path: '/notifications', icon: Bell },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const MobileBottomNav = () => {
  const scrollDirection = useScrollDirection();
  const { isAdmin } = useAuth();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { currentTheme } = useTheme(); // Get current theme

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 h-20 border-t backdrop-blur-xl transition-transform duration-300 ease-in-out lg:hidden',
        scrollDirection === 'down' ? 'translate-y-full' : 'translate-y-0'
      )}
      // --- Use theme colors for background and border ---
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
            // --- Use theme colors for sheet ---
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
                    // --- Use theme colors for active link ---
                    style={isActive ? { 
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
                    to="/admin"
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-4 rounded-lg p-3 text-lg font-semibold transition-colors',
                         isActive 
                          ? 'text-primary-foreground' 
                          : 'text-muted-foreground hover:bg-white/10'
                      )
                    }
                    // --- Use theme colors for active link ---
                    style={isActive ? { 
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
  const isActive = location.pathname === path;
  const { currentTheme } = useTheme(); // Get theme for active color

  return (
    <NavLink
      to={path}
      className={cn(
        'flex h-full flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
        // --- FIX: Use theme primary color instead of 'text-fifa-blue' ---
        isActive ? 'font-bold' : 'text-muted-foreground hover:text-foreground'
      )}
      // --- Apply active color using style tag ---
      style={isActive ? { color: currentTheme.colors.primary } : {}}
    >
      <Icon className="h-5 w-5" />
      {name}
    </NavLink>
  );
};