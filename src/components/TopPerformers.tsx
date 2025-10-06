import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Game } from '@/types/futChampions';
import { Trophy, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const TopPerformers = ({ games }: { games: Game[] }) => {
  const playerStats = useMemo(() => {
    // A robust check to ensure games data is valid
    if (!games || !Array.isArray(games) || games.length === 0) {
      return [];
    }

    const playerMap = new Map();
    
    // 1. Flatten all player performances from all games into a single array
    const allPerformances = games.flatMap(game => game.player_performances || []).filter(Boolean);

    // 2. Aggregate the stats for each player
    allPerformances.forEach(player => {
      const existing = playerMap.get(player.player_name) || {
        name: player.player_name,
        position: player.position,
        gamesPlayed: 0,
        goals: 0,
        assists: 0,
        totalRating: 0,
      };
      
      existing.gamesPlayed += 1;
      existing.goals += player.goals || 0;
      existing.assists += player.assists || 0;
      existing.totalRating += player.rating || 0;
      
      playerMap.set(player.player_name, existing);
    });
    
    // 3. Calculate final stats and sort the players
    return Array.from(playerMap.values())
      .map(player => ({
        ...player,
        averageRating: player.gamesPlayed > 0 ? (player.totalRating / player.gamesPlayed) : 0,
        goalInvolvements: player.goals + player.assists,
      }))
      .sort((a, b) => b.goalInvolvements - a.goalInvolvements || b.averageRating - a.averageRating);
  }, [games]);

  if (playerStats.length === 0) {
    return (
        <Card>
            <CardContent className="text-center py-12">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-500" />
                <p className="text-muted-foreground">Play a game to see your top performers.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-primary" />
          Top Performers This Run
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {playerStats.slice(0, 5).map((player, index) => (
            <div key={`${player.name}-${index}`} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Badge variant="outline">#{index + 1}</Badge>
                <div>
                  <p className="font-semibold text-white">{player.name}</p>
                  <p className="text-xs text-muted-foreground">{player.position} • {player.gamesPlayed} games</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="font-bold">{player.averageRating.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">Rating</p>
                </div>
                <div className="text-right">
                    <p className="font-bold">{player.goalInvolvements}</p>
                    <p className="text-xs text-muted-foreground">G+A</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopPerformers;
