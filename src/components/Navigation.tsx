import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Bell,
  Home,
  LineChart,
  Package2,
  Trophy,
  User,
  Users,
  Settings,
  BarChart,
  Bot,
  Medal,
  Shield,
  GitMerge,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useGameVersion } from "@/contexts/GameVersionContext";
import { GameVersionSelector } from "./GameVersionSelector";
import { useMobile } from "@/hooks/use-mobile";
import AccountSelector from "./AccountSelector";
import { useAccountData } from "@/hooks/useAccountData";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/run", icon: LayoutDashboard, label: "Current Run" },
  { to: "/history", icon: BarChart, label: "Run History" },
  { to: "/players", icon: Users, label: "Players" },
  { to: "/squads", icon: Shield, label: "Squads" },
  { to: "/analytics", icon: LineChart, label: "Analytics" },
  { to: "/insights", icon: Bot, label: "AI Insights" },
  { to: "/leaderboards", icon: Trophy, label: "Leaderboards" },
  { to: "/achievements", icon: Medal, label: "Achievements" },
  { to: "/friends", icon: GitMerge, label: "Friends" },
  { to: "/targets", icon: Target, label: "Targets" },
];

export function Navigation() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { gameVersion, setGameVersion } = useGameVersion();
  const { isMobile } = useMobile();
  const { activeAccount } = useAccountData();

  const handleSignOut = async () => {
    const { error }_ = await signOut();
    if (!error) {
      toast.success("Signed out successfully");
      navigate("/auth");
    } else {
      toast.error("Failed to sign out: " + error.message);
    }
  };

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Sidebar />
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="ml-auto flex-1 sm:flex-initial">
          <GameVersionSelector
            value={gameVersion}
            onChange={setGameVersion}
          />
        </div>
        {activeAccount && !isMobile && (
          <AccountSelector />
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              {user ? user.email : "My Account"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function Sidebar() {
  const { isMobile } = useMobile();

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <SheetHeader>
            <SheetTitle>
              <Link to="/" className="flex items-center gap-2">
                <img
                  src="/fut-trackr-logo.jpg"
                  alt="FUTTrackr Logo"
                  className="h-8 w-8"
                />
                <span className="text-xl font-bold">FUTTrackr</span>
              </Link>
            </SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <AccountSelector />
          </div>
          <nav className="grid gap-2 text-lg font-medium">
            {navItems.map((item) => (
              <SheetClose asChild key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                      isActive
                        ? "bg-muted text-primary"
                        : "text-muted-foreground hover:text-primary"
                    }`
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              </SheetClose>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="hidden border-r bg-background md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-16 items-center px-6">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/fut-trackr-logo.jpg"
              alt="FUTTrackr Logo"
              className="h-8 w-8"
            />
            <span className="text-xl font-bold">FUTTrackr</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-4 text-sm font-medium">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                    isActive
                      ? "bg-muted text-primary"
                      : "text-muted-foreground hover:text-primary"
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
