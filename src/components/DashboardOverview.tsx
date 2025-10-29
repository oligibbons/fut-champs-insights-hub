import { useAccountData } from '@/hooks/useAccountData';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { Skeleton } from '@/components/ui/skeleton';
import CompactStatCard from './CompactStatCard'; // Import our new component
import WeeklyWinsChart from '@/components/WeeklyWinsChart'; // Import our new hero using the @ alias
// Import icons directly for clarity
import { Trophy, TrendingUp, HeartPulse, BarChart2 } from 'lucide-react'; 
import { useTheme } from '@/hooks/useTheme'; // Assuming you have useTheme hook

const DashboardOverview = () => {
  const { weeklyData = [], loading } = useAccountData() || {};
  const { currentTheme } = useTheme(); // Use theme hook
  const stats = useDashboardStats(weeklyData);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skeleton for the chart */}
        <Skeleton 
          className="h-64 rounded-2xl" 
          style={{ backgroundColor: currentTheme.colors.surface }} // Use theme color for skeleton
        />
        {/* Skeleton for the compact stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-24 rounded-xl" style={{ backgroundColor: currentTheme.colors.surface }} />
          <Skeleton className="h-24 rounded-xl" style={{ backgroundColor: currentTheme.colors.surface }} />
          <Skeleton className="h-24 rounded-xl" style={{ backgroundColor: currentTheme.colors.surface }} />
          <Skeleton className="h-24 rounded-xl" style={{ backgroundColor: currentTheme.colors.surface }} />
        </div>
      </div>
    );
  }

  // No-data state is handled by the child components (WeeklyWinsChart, etc.)
  // ...

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* --- COLUMN 1: THE "HERO" CHART --- */}
      <div>
          {/* Title moved inside DashboardSection now */}
          {/* <h3 className="text-lg font-semibold text-white mb-3">Recent Win Trend</h3> */}
        <WeeklyWinsChart />
      </div>

      {/* --- COLUMN 2: SUPPORTING STATS --- */}
      <div>
          {/* Title moved inside DashboardSection now */}
          {/* <h3 className="text-lg font-semibold text-white mb-3">Key Stats</h3> */}
          
          {/* --- THIS IS THE FIX --- */}
          {/* Changed sm:grid-cols-2 to lg:grid-cols-2. */}
          {/* This stops the stats from squashing on tablets. */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CompactStatCard
            title="Best Record"
            value={`${stats.bestRecord} Wins`}
            icon={<Trophy />} // Pass only the icon component
            iconColorClass="text-fifa-gold" // Pass the color class
          />
          <CompactStatCard
            title="Average Wins"
            value={stats.averageWins.toFixed(1)}
            icon={<TrendingUp />}
            iconColorClass="text-fifa-blue"
          />
          <CompactStatCard
            title="Club MVP"
            // Ensure MVP value doesn't overflow easily, might need truncation/tooltip later
            value={stats.mvp && stats.mvp.length > 15 ? stats.mvp.substring(0, 12) + '...' : stats.mvp} 
            icon={<HeartPulse />}
            iconColorClass="text-pink-500" // Example color
          />
          <CompactStatCard
            title="Goal Difference"
            value={stats.overallGoalDifference > 0 ? `+${stats.overallGoalDifference}` : stats.overallGoalDifference}
            icon={<BarChart2 />}
            iconColorClass="text-fifa-purple"
          />
        </div>
      </div>
      
    </div>
  );
};

export default DashboardOverview;