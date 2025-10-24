import { useMemo } from 'react';
import { WeeklyPerformance, PlayerPerformance } from '@/types/futChampions';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingDown, Star } from 'lucide-react';
import { useAccountData } from '@/hooks/useAccountData';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/hooks/useTheme';

const LowestRatedPlayers = ({ weeklyData: propWeeklyData }: { weeklyData?: WeeklyPerformance[] }) => {
  // --- FIX: Add guards for undefined hook and default context data ---
  const { weeklyData: contextWeeklyData = [], loading } = useAccountData() || {};
  // --- END FIX
  const { currentTheme } = useTheme();

  // This logic is now safe
  const weeklyData = propWeeklyData || contextWeeklyData;

  const lowestPlayers = useMemo(() => {
    // Check if weeklyData is available and not empty
    if (!weeklyData || weeklyData.length === 0) {
      return [];
    }
    
    const allPlayerStats = weeklyData.flatMap(week =>
      (week.games || []).flatMap(game => game.playerStats || [])
    );

    const playerMap = new Map<string, { name: string, position: string, totalRating: number, games: number, goals: number, assists: number }>();

    allPlayerStats.forEach(player => {
      if (!player || player.minutesPlayed === 0) return;

      const key = `${player.name}-${player.position}`;
      if (!playerMap.has(key)) {
        playerMap.set(key, {
          name: player.name,
          position: player.position,
          totalRating: 0,
          games: 0,
          goals: 0,
          assists: 0,
        });
      }

      const stats = playerMap.get(key)!;
      stats.totalRating += player.rating;
      stats.games += 1;
      stats.goals += player.goals;
      stats.assists += player.assists;
    });

    return Array.from(playerMap.values())
      .filter(p => p.games >= 5) // Only show players with 5+ games
      .map(p => ({
        ...p,
        averageRating: p.totalRating / p.games,
        goalInvolvements: p.goals + p.assists
      }))
      .sort((a, b) => a.averageRating - b.averageRating) // Sort by rating ascending
      .slice(0, 3); // Get lowest 3
  }, [weeklyData]);

  // --- FIX: This loading check is now safe ---
  if (loading && !propWeeklyData) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-14 w-full rounded-lg" />
        <Skeleton className="h-14 w-full rounded-lg" />
        <Skeleton className="h-14 w-full rounded-lg" />
      </div>
    );
  }
  
  if (lowestPlayers.length === 0) {
    return (
      <div className="text-center py-4 text-sm" style={{ color: currentTheme.colors.muted }}>
        Play at least 5 games with a player to see them here.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {lowestPlayers.map((player, index) => (
        <Card 
          key={index} 
          className="p-3 bg-transparent border-0 shadow-none"
          style={{ 
            backgroundColor: currentTheme.colors.surface,
            borderColor: currentTheme.colors.border
          }}
        >
          <div className="flex items-center justify-between space-x-3">
            <div className="flex items-center space-x-3">
              <span 
                className="flex items-center justify-center h-8 w-8 rounded-full font-bold"
                style={{ 
                  backgroundColor: currentTheme.colors.cardBg, 
                  color: currentTheme.colors.text 
                }}
              >
                {index + 1}
              </span>
              <div>
                <p className="font-semibold" style={{ color: currentTheme.colors.text }}>{player.name}</p>
                <p className="text-xs" style={{ color: currentTheme.colors.muted }}>{player.position} • {player.games} Games</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge 
                variant="outline" 
                className="text-xs border-0"
                style={{
                  backgroundColor: currentTheme.colors.danger,
                  color: currentTheme.colors.accentText
                }}
              >
                <Star className="h-3 w-3 mr-1" />
                {player.averageRating.toFixed(1)}
              </Badge>
              <Badge 
                variant="outline" 
                className="text-xs hidden sm:flex"
                style={{
                  backgroundColor: currentTheme.colors.cardBg,
                  color: currentTheme.colors.text,
                  borderColor: currentTheme.colors.border
                }}
              >
                {player.goalInvolvements} G+A
              </Badge>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default LowestRatedPlayers;
