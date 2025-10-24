import { useAccountData } from '@/hooks/useAccountData';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import StatCard from './StatCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, TrendingUp, BarChart2, Zap, Trophy, Goal, HeartPulse, ShieldCheck } from 'lucide-react';

const DashboardOverview = () => {
  // --- FIX:
  // 1. Default 'weeklyData' to '[]' to prevent 'useDashboardStats' from receiving undefined.
  // 2. Add '|| {}' as a guard in case the hook itself returns undefined before auth context is ready.
  const { weeklyData = [], loading } = useAccountData() || {};
  // --- END FIX
  
  const stats = useDashboardStats(weeklyData); // This is now safe

  // This loading state is correct
  if (loading) {
    // Display skeletons while loading
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
      </div>
    );
  }

  // This check is also correct
  if (!weeklyData || weeklyData.length === 0) {
      return (
          <div className="text-center py-8 text-muted-foreground">
              No data available yet. Complete a week to see your stats!
          </div>
      );
  }


  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Best FUT Champs Record */}
      <StatCard
        title="Best Record"
        value={`${stats.bestRecord} Wins`}
        icon={<Trophy className="text-yellow-500" />}
        tooltip="Your highest number of wins achieved in a single FUT Champions run."
      />

      {/* Average Wins Per Run */}
      <StatCard
        title="Average Wins"
        value={stats.averageWins.toFixed(1)}
        icon={<TrendingUp className="text-blue-500" />}
        tooltip="The average number of wins across all your completed FUT Champions runs."
      This 'forEach' is now safe
      {/* Most Goals in a Run */}
      <StatCard
        title="Most Goals (Run)"
        value={stats.mostGoalsInRun.toString()}
        icon={<Goal className="text-green-500" />}
        tooltip="The highest number of goals scored in a single FUT Champions run."
      />

      {/* Longest Win Streak */}
      <StatCard
        title="Longest Win Streak"
        value={stats.longestWinStreak.toString()}
        icon={<Zap className="text-orange-500" />}
        tooltip="The highest consecutive number of wins you've achieved across all runs."
      />

      {/* Overall Goal Difference */}
      <StatCard
        title="Goal Difference"
        value={stats.overallGoalDifference.toString()}
        icon={<BarChart2 className="text-purple-500" />}
        tooltip="Total goals scored minus total goals conceded across all recorded games."
      />

      {/* Average Player Rating */}
      <StatCard
        title="Avg Player Rating"
        value={stats.averagePlayerRating.toFixed(2)}
        icon={<Award className="text-red-500" />}
        tooltip="The average match rating of all players across all recorded games."
      />

       {/* Club MVP */}
      <StatCard
        title="Club MVP"
        value={stats.mvp} // Assumes mvp is a string (player name or "N/A")
        icon={<HeartPulse className="text-pink-500" />} // Example icon
        tooltip="Player with the highest average rating (min. 10 games), prioritizing goal involvements as tie-breaker."
      />

      {/* Discipline Index */}
      <StatCard
        title="Discipline Index"
        value={stats.disciplineIndex} // Assumes disciplineIndex is a string like "A+", "B", etc.
        icon={<ShieldCheck className="text-teal-500" />} // Example icon
        tooltip="Overall team discipline rating based on fouls and cards per game (A+ is best)."
      />
    </div>
  );
};

export default DashboardOverview;
