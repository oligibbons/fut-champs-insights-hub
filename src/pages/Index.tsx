import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart2, Calendar, Users, Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useFutChampsData } from "@/hooks/useFutChampsData";
import { Link } from "react-router-dom";
import DashboardOverview from "@/components/DashboardOverview";
import TopPerformers from "@/components/TopPerformers";
import WeeklyOverview from "@/components/WeeklyOverview";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { user } = useAuth();
  const { games, wins, losses, winRate, currentStreak, loading } = useFutChampsData();

  const StatCard = ({ title, value, icon: Icon, change, changeType }: { title: string, value: string | number, icon: React.ElementType, change?: string, changeType?: 'increase' | 'decrease' }) => (
    <Card className="bg-secondary/50 border-border/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24 mt-1" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {change && (
              <p className={`text-xs ${changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
                {change}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );

  const formatWinStreak = () => {
    if (!currentStreak) return "N/A";
    const streakType = currentStreak.type === 'win' ? 'W' : 'L';
    return `${streakType}${currentStreak.count}`;
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.user_metadata?.username || 'Player'}!</h1>
          <p className="text-muted-foreground">Here's your performance snapshot.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link to="/current-week">
              Log a Game
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/analytics">
              Deep Dive
              <BarChart2 className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Wins" value={wins} icon={Trophy} />
        <StatCard title="Win Rate" value={`${winRate}%`} icon={BarChart2} />
        <StatCard title="Total Games" value={games.length} icon={Users} />
        <StatCard title="Current Streak" value={formatWinStreak()} icon={Calendar} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardOverview games={games} />
        </div>
        <div>
          <TopPerformers games={games} />
        </div>
      </div>
      
      <div>
        <WeeklyOverview />
      </div>
    </div>
  );
};

export default Index;
