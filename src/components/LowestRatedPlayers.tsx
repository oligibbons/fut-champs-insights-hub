import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WeeklyPerformance, PlayerPerformance } from '@/types/futChampions';
import { TrendingDown, UserX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/hooks/useTheme';

interface LowestRatedPlayersProps {
  weeklyData: WeeklyPerformance[];
}

interface PlayerStats {
  name: string;
  position: string;
  totalGames: number;
  averageRating: number;
}

const LowestRatedPlayers = ({ weeklyData }: LowestRatedPlayersProps) => {
  const { currentTheme } = useTheme();

  const lowestRatedPlayers = useMemo(() => {
    const playerMap = new Map<string, { totalRating: number; totalGames: number; position: string }>();

    weeklyData.forEach(week => {
      week.games.forEach(game => {
        game.playerStats?.forEach((player: PlayerPerformance) => {
          if (player.position.toUpperCase() === 'GK') return; // Exclude Goalkeepers

          const key = player.name;
          if (!playerMap.has(key)) {
            playerMap.set(key, { totalRating: 0, totalGames: 0, position: player.position });
          }
          const stats = playerMap.get(key)!;
          stats.totalRating += player.rating;
          stats.totalGames += 1;
        });
      });
    });

    const playerStats: PlayerStats[] = [];
    playerMap.forEach((stats, name) => {
      if (stats.totalGames >= 5) { // Minimum 5 games played
        playerStats.push({
          name,
          position: stats.position,
          totalGames: stats.totalGames,
          averageRating: stats.totalRating / stats.totalGames,
        });
      }
    });

    // Sort by average rating ascending and take the bottom 5
    return playerStats.sort((a, b) => a.averageRating - b.averageRating).slice(0, 5);
  }, [weeklyData]);

  return (
    <Card style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
          <TrendingDown className="h-5 w-5 text-red-500" />
          Underperforming Players
        </CardTitle>
      </CardHeader>
      <CardContent>
        {lowestRatedPlayers.length > 0 ? (
          <ul className="space-y-4">
            {lowestRatedPlayers.map(player => (
              <li key={player.name} className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: currentTheme.colors.surface }}>
                <div>
                  <p className="font-semibold" style={{ color: currentTheme.colors.text }}>{player.name}</p>
                  <p className="text-xs" style={{ color: currentTheme.colors.muted }}>{player.totalGames} games played</p>
                </div>
                <div className="text-right">
                    <Badge variant="destructive" className="text-sm">
                        {player.averageRating.toFixed(2)}
                    </Badge>
                    <p className="text-xs" style={{ color: currentTheme.colors.muted }}>Avg. Rating</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8" style={{ color: currentTheme.colors.muted }}>
            <UserX className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Not enough player data to show underperforming players.</p>
            <p className="text-xs">(Requires at least 5 games played)</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LowestRatedPlayers;
