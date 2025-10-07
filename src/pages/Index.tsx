import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { Skeleton } from "@/components/ui/skeleton";
import CPSGauge from "@/components/CPSGauge";
import PrimaryInsightCard from "@/components/PrimaryInsightCard";
import DashboardOverview from "@/components/DashboardOverview";
import TopPerformers from "@/components/TopPerformers";
import WeeklyOverview from "@/components/WeeklyOverview";
import { generateEnhancedAIInsights, Insight } from "@/utils/aiInsights";
import { BarChart2, Users, Trophy, GaugeCircle, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

const Index = () => {
  const { user } = useAuth();
  const { weeklyData, loading } = useSupabaseData();
  const [topInsight, setTopInsight] = useState<Insight | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(true);

  const stats = useMemo(() => {
    const allGames = weeklyData.flatMap(w => w.games);
    const totalWins = weeklyData.reduce((acc, week) => acc + week.totalWins, 0);
    const totalGames = allGames.length;
    const winRate = totalGames > 0 ? (totalWins / totalGames) * 100 : 0;
    const currentWeek = weeklyData.find(week => !week.isCompleted);
    const currentStreak = currentWeek?.currentStreak || 0;
    return { allGames, totalWins, totalGames, winRate, currentStreak };
  }, [weeklyData]);

  useEffect(() => {
    const fetchInsights = async () => {
      if (!loading && weeklyData && weeklyData.length > 0) {
        setInsightsLoading(true);
        try {
          const allInsights = await generateEnhancedAIInsights(weeklyData);
          const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
          const sortedInsights = [...allInsights].sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0));
          setTopInsight(sortedInsights[0] || null);
        } catch (error) {
          console.error("Failed to generate primary insight:", error);
          setTopInsight(null);
        } finally {
          setInsightsLoading(false);
        }
      } else if (!loading) {
        setInsightsLoading(false);
      }
    };
    fetchInsights();
  }, [weeklyData, loading]);

  const StatCard = ({ title, value, icon: Icon, color, className }: { title: string; value: string | number; icon: React.ElementType; color: string; className?: string }) => (
    <div className={cn("glass-card p-6 flex flex-col justify-between group animate-fade-in-down", className)}>
      <div className="flex justify-between items-start">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={cn("h-5 w-5 text-muted-foreground transition-transform group-hover:scale-110", color)} />
      </div>
      <div>
        {loading ? (
          <Skeleton className="h-10 w-3/4 mt-2 bg-white/10" />
        ) : (
          <p className="text-4xl font-bold text-foreground">{value}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="page-header">
        <h1>Welcome back, {user?.user_metadata?.username || 'Player'}!</h1>
        <p>This is your command center. Track your performance, gain insights, and conquer the weekend league.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Overall Wins" value={stats.totalWins} icon={Trophy} color="text-yellow-400" />
        <StatCard title="Win Rate" value={`${stats.winRate.toFixed(0)}%`} icon={BarChart2} color="text-blue-400" />
        <StatCard title="Total Games" value={stats.totalGames} icon={Users} color="text-purple-400" />
        <StatCard
          title="Current Streak"
          value={stats.currentStreak > 0 ? `W${stats.currentStreak}` : `L${Math.abs(stats.currentStreak)}`}
          icon={stats.currentStreak >= 0 ? TrendingUp : TrendingDown}
          color={stats.currentStreak >= 0 ? "text-green-400" : "text-red-400"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {loading || insightsLoading ? (
            <Skeleton className="h-full min-h-[200px] w-full rounded-2xl bg-white/10" />
          ) : (
            <PrimaryInsightCard insight={topInsight} />
          )}
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <GaugeCircle className="h-5 w-5 mr-2 text-primary" />
              Champs Player Score
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-6">
            {loading ? <Skeleton className="h-[150px] w-[150px] rounded-full bg-white/10" /> : <CPSGauge games={stats.allGames} size={150}/>}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardOverview games={stats.allGames} />
        </div>
        <div>
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
