// src/components/Navigation.tsx
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { LayoutGrid, Play, History, BarChart4, Users, Trophy, BrainCircuit, Settings, User, LogOut, ShieldCheck, ChevronLeft, ChevronRight, Bell, Star, UsersRound, Swords } from 'lucide-react';
import { useFriendRequests } from '@/hooks/useFriends';
import { Badge } from './ui/badge';

interface NavLink {
  to: string;
  icon: React.ElementType;
  label: string;
  adminOnly?: boolean;
  notificationCount?: number;
}

const NavLinkItem = ({ to, icon: Icon, label, isExpanded, adminOnly = false, notificationCount = 0 }: NavLink & { isExpanded: boolean }) => {
  const location = useLocation();
  const { currentTheme } = useTheme();
  const { isAdmin } = useAuth();
  const isActive = location.pathname === to;

  if (adminOnly && !isAdmin) {
    return null;
  }

  return (
    <Button
      asChild
      variant={isActive ? "default" : "ghost"}
      className={cn(
        "flex items-center justify-start h-12 rounded-2xl transition-all duration-300",
        isExpanded ? "w-full px-4" : "w-12 px-0",
        isActive && "shadow-lg"
      )}
      style={isActive ? { 
        backgroundColor: currentTheme.colors.primary, 
        color: currentTheme.colors.primaryText 
      } : {}}
    >
      <Link to={to} className="relative">
        <Icon className={cn("h-6 w-6 transition-all", isExpanded ? "mr-4" : "mx-auto")} />
        <span className={cn(
          "font-semibold tracking-wide whitespace-nowrap transition-all duration-300",
          isExpanded ? "opacity-100" : "opacity-0 absolute left-full ml-4"
        )}>
          {label}
        </span>
        {notificationCount > 0 && (
          <Badge 
            className={cn(
              "absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2",
              !isExpanded && "translate-x-1 -translate-y-1/4"
            )}
            variant="destructive"
          >
            {notificationCount}
          </Badge>
        )}
      </Link>
    </Button>
  );
};

const Navigation = ({ isExpanded, setIsExpanded }: { isExpanded: boolean, setIsExpanded: (isExpanded: boolean) => void }) => {
  const { signOut, user, isAdmin } = useAuth();
  const { currentTheme } = useTheme();
  const { data: requests } = useFriendRequests();
  const requestCount = requests?.length || 0;

  // --- FIX: All paths are now prefixed with /dashboard ---
  const navLinks: NavLink[] = [
    { to: "/dashboard", icon: LayoutGrid, label: "Dashboard" },
    { to: "/dashboard/current-run", icon: Play, label: "Current Run" },
    { to: "/dashboard/history", icon: History, label: "History" },
    { to: "/dashboard/analytics", icon: BarChart4, label: "Analytics" },
    { to: "/dashboard/players", icon: Users, label: "Players" },
    { to: "/dashboard/squads", icon: Trophy, label: "Squads" },
    { to: "/dashboard/ai-insights", icon: BrainCircuit, label: "AI Insights" },
    { to: "/dashboard/achievements", icon: Star, label: "Achievements" },
    { to: "/dashboard/friends", icon: UsersRound, label: "Friends", notificationCount: requestCount },
    { to: "/dashboard/challenge", icon: Swords, label: "Challenge" },
    { to: "/dashboard/notifications", icon: Bell, label: "Notifications" },
  ];

  const bottomLinks: NavLink[] = [
    { to: "/dashboard/settings", icon: Settings, label: "Settings" },
    { to: "/dashboard/admin", icon: ShieldCheck, label: "Admin", adminOnly: true },
  ];

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 bottom-0 z-40 h-screen flex flex-col items-center py-6 px-3 glass-card rounded-r-3xl shadow-depth-lg border-0 transition-all duration-300 ease-in-out",
        isExpanded ? "w-64" : "w-[5.5rem]"
      )}
      style={{
        backgroundColor: currentTheme.colors.cardBg,
        borderColor: currentTheme.colors.border,
      }}
    >
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "absolute -right-4 top-16 z-50 rounded-full shadow-lg border",
          "hover:bg-card-bg"
        )}
        style={{ 
          backgroundColor: currentTheme.colors.cardBg, 
          borderColor: currentTheme.colors.border 
        }}
      >
        {isExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>

      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 h-12 mb-8 transition-all duration-300",
        isExpanded ? "w-full px-3" : "w-12"
      )}>
        <img
          src={user?.user_metadata?.avatar_url || '/fut-trackr-logo.jpg'}
          alt="User"
          className={cn(
            "h-12 w-12 rounded-2xl object-cover transition-all",
            !isExpanded && "shadow-lg"
          )}
        />
        <div className={cn(
          "flex flex-col justify-center overflow-hidden transition-all duration-300",
          isExpanded ? "opacity-100" : "opacity-0"
        )}>
          <span className="font-semibold text-lg text-white whitespace-nowrap">
            {user?.user_metadata?.display_name || user?.email}
          </span>
          {isAdmin && (
            <span className="text-xs font-medium whitespace-nowrap" style={{ color: currentTheme.colors.primary }}>
              Admin
            </span>
          )}
        </div>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 flex flex-col gap-3 overflow-y-auto w-full">
        {navLinks.map((link) => (
          <NavLinkItem key={link.to} {...link} isExpanded={isExpanded} notificationCount={link.notificationCount} />
        ))}
      </nav>

      {/* Bottom Nav */}
      <nav className="flex flex-col gap-3 w-full mt-6">
        {bottomLinks.map((link) => (
          <NavLinkItem key={link.to} {...link} isExpanded={isExpanded} />
        ))}
        {/* Sign Out */}
        <Button
          variant="ghost"
          onClick={() => signOut()}
          className={cn(
            "flex items-center justify-start h-12 rounded-2xl text-red-500 hover:bg-red-500/10 hover:text-red-500 transition-all duration-300",
            isExpanded ? "w-full px-4" : "w-12 px-0"
          )}
        >
          <LogOut className={cn("h-6 w-6", isExpanded ? "mr-4" : "mx-auto")} />
          <span className={cn(
            "font-semibold tracking-wide whitespace-nowrap transition-all duration-300",
            isExpanded ? "opacity-100" : "opacity-0 absolute left-full ml-4"
          )}>
            Sign Out
          </span>
        </Button>
      </nav>
    </aside>
  );
};

export default Navigation;