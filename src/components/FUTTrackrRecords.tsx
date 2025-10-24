import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useAccountData } from '@/hooks/useAccountData';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, TrendingUp, BarChart2, Zap, Trophy, Goal, HeartPulse, ShieldCheck, Flame, ShieldOff, Star, Repeat } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

// A small component for displaying a single record
const RecordItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => {
  const { currentTheme } = useTheme();
  return (
    <div 
      className="flex items-center p-3 rounded-lg"
      style={{ backgroundColor: currentTheme.colors.surface }}
    >
      <div 
        className="p-2 rounded-lg mr-3"
        style={{ backgroundColor: currentTheme.colors.cardBg }}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium" style={{ color: currentTheme.colors.text }}>{value}</p>
        <p className="text-xs" style={{ color: currentTheme.colors.muted }}>{label}</p>
      </div>
    </div>
  );
}

export const FUTTrackrRecords = () => {
  // --- FIX: Add guards for undefined hook and data ---
  const { weeklyData = [], loading } = useAccountData() || {};
  // --- END FIX

  // This is now safe, as weeklyData will be [] on first render, not undefined
  const stats = useDashboardStats(weeklyData); 

  // --- FIX: This loading check is now safe ---
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Skeleton className="h-16 rounded-lg" />
        <Skeleton className="h-16 rounded-lg" />
        <Skeleton className="h-16 rounded-lg" />
        <Skeleton className="h-16 rounded-lg" />
        <Skeleton className="h-16 rounded-lg" />
        <Skeleton className="h-16 rounded-lg" />
      </div>
    );
  }
  
  // This check is good for when data is loaded but empty
  if (weeklyData.length === 0) {
     return (
        <div className="text-center py-4 text-sm text-muted-foreground">
            Complete your first week to start tracking records.
        </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      <RecordItem
        icon={<Trophy className="h-5 w-5 text-yellow-500" />}
        label="Best Record"
        value={`${stats.bestRecord} Wins`}
      />
      <RecordItem
        icon={<TrendingUp className="h-5 w-5 text-blue-500" />}
        label="Average Wins"
        value={stats.averageWins.toFixed(1)}
      />
      <RecordItem
        icon={<Flame className="h-5 w-5 text-orange-500" />}
        label="Longest Win Streak"
        value={stats.longestWinStreak}
      />
      <RecordItem
        icon={<Goal className="h-5 w-5 text-green-500" />}
        label="Most Goals (Run)"
        value={stats.mostGoalsInRun}
      />
      <RecordItem
        icon={<BarChart2 className="h-5 w-5 text-purple-500" />}
        label="Goal Difference"
        value={stats.overallGoalDifference > 0 ? `+${stats.overallGoalDifference}` : stats.overallGoalDifference}
      />
      <RecordItem
        icon={<Star className="h-5 w-5 text-pink-500" />}
        label="Club MVP"
        value={stats.mvp}
      />
      <RecordItem
        icon={<ShieldCheck className="h-5 w-5 text-teal-500" />}
        label="Discipline"
        value={stats.disciplineIndex}
      />
      <RecordItem
        icon={<Repeat className="h-5 w-5 text-gray-500" />}
        label="Avg Possession"
        value={`${stats.averagePossession.toFixed(0)}%`}
      />
      <RecordItem
        icon={<ShieldOff className="h-5 w-5 text-green-600" />}
        label="Total Clean Sheets"
        value={stats.totalCleanSheets}
      />
    </div>
  );
};
