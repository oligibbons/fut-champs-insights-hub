import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label } from 'recharts';
import { useTheme } from '@/hooks/useTheme';
// --- FIX: Import useAccountData and Skeleton ---
import { useAccountData } from '@/hooks/useAccountData';
import { Skeleton } from '@/components/ui/skeleton';
import { WeeklyPerformance, PlayerPerformance } from '@/types/futChampions';
import { Users } from 'lucide-react';

// --- FIX: Remove weeklyData prop ---
const PlayerConsistencyChart = ({ weeklyData: propWeeklyData }: { weeklyData?: WeeklyPerformance[] }) => {
  const { currentTheme } = useTheme();
  // --- FIX: Add data hook and loading state ---
  const { weeklyData: contextWeeklyData = [], loading } = useAccountData() || {};

  const weeklyData = propWeeklyData || contextWeeklyData;

  const playerData = useMemo(() => {
    // This logic is now safe
    const playerStats: { [name: string]: { ratings: number[], games: number, totalRating: number } } = {};

    weeklyData.forEach(week => {
      week.games.forEach(game => {
        game.playerStats?.forEach(player => {
          if (!playerStats[player.name]) {
            playerStats[player.name] = { ratings: [], games: 0, totalRating: 0 };
          }
          playerStats[player.name].ratings.push(player.rating);
          playerStats[player.name].games++;
          playerStats[player.name].totalRating += player.rating;
        });
      });
    });

    return Object.entries(playerStats)
      .filter(([, stats]) => stats.games >= 10) // Min 10 games to be included
      .map(([name, stats]) => {
        const avgRating = stats.totalRating / stats.games;
        const stdDev = Math.sqrt(
          stats.ratings.map(r => Math.pow(r - avgRating, 2)).reduce((a, b) => a + b) / stats.games
        );
        return {
          name,
          avgRating: parseFloat(avgRating.toFixed(2)),
          consistency: parseFloat(stdDev.toFixed(2)), // Lower is better
          games: stats.games,
        };
      });
  }, [weeklyData]);

  // --- FIX: Add loading state ---
  if (loading && !propWeeklyData) {
    return (
      <Card 
        style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}
        className="h-[400px]"
      >
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (playerData.length === 0) {
    return (
      <Card style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
            <Users className="h-5 w-5" style={{ color: currentTheme.colors.primary }} />
            Player Consistency
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12" style={{ color: currentTheme.colors.muted }}>
          <p>No player data available. (Min. 10 games per player required).</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
          <Users className="h-5 w-5" style={{ color: currentTheme.colors.primary }} />
          Player Consistency
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={currentTheme.colors.border} />
              <XAxis 
                type="number" 
                dataKey="avgRating" 
                name="Average Rating" 
                domain={['dataMin - 0.5', 'dataMax + 0.5']}
                stroke={currentTheme.colors.muted}
                fontSize={12}
              >
                <Label value="Average Rating" offset={-15} position="insideBottom" fill={currentTheme.colors.muted} />
              </XAxis>
              <YAxis 
                type="number" 
                dataKey="consistency" 
                name="Inconsistency (Std Dev)"
                stroke={currentTheme.colors.muted}
                fontSize={12}
              >
                 <Label value="Inconsistency (Lower is Better)" angle={-90} position="insideLeft" fill={currentTheme.colors.muted} style={{ textAnchor: 'middle' }} />
              </YAxis>
              <ZAxis type="number" dataKey="games" range={[60, 400]} name="Games Played" />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }} 
                contentStyle={{
                  backgroundColor: currentTheme.colors.surface,
                  borderColor: currentTheme.colors.border,
                  borderRadius: '0.75rem',
                  color: currentTheme.colors.text,
                }}
              />
              <Scatter 
                data={playerData} 
                fill={currentTheme.colors.primary}
                opacity={0.7}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerConsistencyChart;
