import { NavLink, useLocation } from 'react-router-dom';
import { Home, BarChart2, Calendar, Trophy, Users, Settings, LogOut, Menu, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { Button } from './ui/button';

const Navigation = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const isMobile = useMobile();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "You have been successfully logged out."
      });
    }
  };

  const navItems = user ? [
    { to: '/', icon: <Home />, text: 'Dashboard' },
    { to: '/current-week', icon: <Calendar />, text: 'Current Week' },
    { to: '/squads', icon: <Users />, text: 'Squads' },
    { to: '/players', icon: <Trophy />, text: 'Players' },
    { to: '/analytics', icon: <BarChart2 />, text: 'Analytics' },
    { to: '/settings', icon: <Settings />, text: 'Settings' },
  ] : [
    { to: '/auth', icon: <LogIn />, text: 'Login' },
  ];

  if (loading && !isMobile) {
    return (
      <aside className="hidden md:flex w-16 md:w-64 bg-gray-900 text-white p-4 flex-col transition-all duration-300">
        <div className="mb-10 flex items-center gap-2">
            <img src="/lovable-uploads/6b6465f4-e466-4f3b-9761-8a829fbe395c.png" alt="FUTALYST Logo" className="h-10 w-10" />
            <h1 className="text-2xl font-bold hidden md:block">FUTALYST</h1>
        </div>
        <nav className="flex-1 space-y-2">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-12 bg-gray-800 rounded animate-pulse" />
          ))}
        </nav>
      </aside>
    );
  }

  const isActive = (path: string) => location.pathname === path;
  
  const navLinkClasses = (path: string) => `flex items-center p-3 rounded-lg transition-colors ${
      isActive(path)
        ? 'bg-fifa-blue text-white'
        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
  }`;

  const MobileNav = () => (
    <header className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-4 bg-gray-900/80 backdrop-blur-lg border-b border-white/10">
         <div className="flex items-center gap-2">
            <img src="/lovable-uploads/6b6465f4-e466-4f3b-9761-8a829fbe395c.png" alt="FUTALYST Logo" className="h-8 w-8" />
            <h1 className="text-xl font-bold">FUTALYST</h1>
         </div>
         <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-gray-900 border-l-gray-800 text-white w-72 p-4 flex flex-col">
                 <div className="mb-10 flex items-center gap-2 border-b border-white/10 pb-4">
                    <img src="/lovable-uploads/6b6465f4-e466-4f3b-9761-8a829fbe395c.png" alt="FUTALYST Logo" className="h-10 w-10" />
                    <h1 className="text-2xl font-bold">FUTALYST</h1>
                </div>
                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => (
                        <SheetClose asChild key={item.to}>
                            <NavLink
                                to={item.to}
                                className={navLinkClasses(item.to)}
                            >
                                <div className="w-6 h-6">{item.icon}</div>
                                <span className="ml-4 text-base font-medium">{item.text}</span>
                            </NavLink>
                        </SheetClose>
                    ))}
                </nav>
                {user && (
                    <div className="mt-auto">
                        <SheetClose asChild>
                            <button
                                onClick={handleLogout}
                                className="flex items-center p-3 rounded-lg text-gray-400 hover:bg-red-500/20 hover:text-red-400 w-full transition-colors"
                            >
                                <LogOut />
                                <span className="ml-4 text-base font-medium">Logout</span>
                            </button>
                        </SheetClose>
                    </div>
                )}
            </SheetContent>
         </Sheet>
    </header>
  );

  const DesktopNav = () => (
    <TooltipProvider>
        <aside className="hidden md:flex w-16 md:w-64 bg-gray-900/50 backdrop-blur-lg border-r border-white/10 text-white p-4 flex-col transition-all duration-300 fixed h-full z-40">
          <div className="mb-10 flex items-center gap-2">
            <img src="/lovable-uploads/6b6465f4-e466-4f3b-9761-8a829fbe395c.png" alt="FUTALYST Logo" className="h-10 w-10" />
            <h1 className="text-2xl font-bold hidden md:block">FUTALYST</h1>
          </div>
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <Tooltip key={item.to}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.to}
                    className={navLinkClasses(item.to)}
                  >
                    <div className="w-6 h-6">{item.icon}</div>
                    <span className="ml-4 hidden md:block">{item.text}</span>
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right" className="block md:hidden bg-gray-800 border-none text-white">
                  <p>{item.text}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </nav>
          {user && (
            <div className="mt-auto">
               <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        onClick={handleLogout}
                        className="flex items-center p-3 rounded-lg text-gray-400 hover:bg-red-500/20 hover:text-red-400 w-full transition-colors"
                    >
                        <LogOut />
                        <span className="ml-4 hidden md:block">Logout</span>
                    </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="block md:hidden bg-gray-800 border-none text-white">
                  <p>Logout</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </aside>
    </TooltipProvider>
  );

  return (
    <>
      <MobileNav />
      <DesktopNav />
    </>
  );
};

export default Navigation;
