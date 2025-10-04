import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart2, Calendar, Users, Trophy, GaugeCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { Link } from "react-router-dom";
import DashboardOverview from "@/components/DashboardOverview";
import TopPerformers from "@/components/TopPerformers";
import WeeklyOverview from "@/components/WeeklyOverview";
import { Skeleton } from "@/components/ui/skeleton";
import CPSGauge from "@/components/CPSGauge";

const Index = () => {
  const { user } = useAuth();
  const { weeklyData, loading } = useSupabaseData();

  const allGames = weeklyData.flatMap(w => w.games);
  const totalWins = weeklyData.reduce((acc, week) => acc + week.totalWins, 0);
  const totalGames = weeklyData.reduce((acc, week) => acc + week.gamesPlayed, 0);
  const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;
  const currentWeek = weeklyData.find(week => !week.isCompleted);
  const currentStreak = currentWeek?.currentStreak || 0;

  const StatCard = ({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ElementType }) => (
    <Card className="bg-secondary/50 border-border/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24 mt-1" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  );
  
  const formatWinStreak = () => {
    if (currentStreak > 0) return `W${currentStreak}`;
    if (currentStreak < 0) return `L${Math.abs(currentStreak)}`;
    return "N/A";
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.user_metadata?.username || 'Player'}!</h1>
          <p className="text-muted-foreground">Here's your performance snapshot for the season.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild><Link to="/current-week">Start New Run<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
          <Button variant="outline" asChild><Link to="/analytics">Deep Dive<BarChart2 className="ml-2 h-4 w-4" /></Link></Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Overall Wins" value={totalWins} icon={Trophy} />
        <StatCard title="Win Rate" value={`${winRate}%`} icon={BarChart2} />
        <StatCard title="Total Games" value={totalGames} icon={Users} />
        <StatCard title="Current Streak" value={formatWinStreak()} icon={Calendar} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardOverview games={allGames} />
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center"><GaugeCircle className="h-5 w-5 mr-2 text-primary" />Champs Player Score</CardTitle></CardHeader>
            <CardContent className="flex items-center justify-center">
              {loading ? <Skeleton className="h-[150px] w-[150px] rounded-full" /> : <CPSGauge games={allGames} size={150}/>}
            </CardContent>
          </Card>
          <TopPerformers />
        </div>
      </div>
      
      <div>
        <WeeklyOverview />
      </div>
    </div>
  );
};

export default Index;
