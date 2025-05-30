
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Trophy, Target, TrendingUp, Star } from 'lucide-react';
import { WeeklyPerformance } from '@/types/futChampions';

const TopPerformers = () => {
  const [weeklyData] = useLocalStorage<WeeklyPerformance[]>('futChampions_weeks', []);

  const topPerformers = useMemo(() => {
    // Extract all players from all games across all weeks
    const allPlayers = new Map();
    
    weeklyData.forEach(week => {
      week.games.forEach(game => {
        if (game.playerStats && game.playerStats.length > 0) {
          game.playerStats.forEach(player => {
            const playerId = player.name.toLowerCase();
            if (!allPlayers.has(playerId)) {
              allPlayers.set(playerId, {
                name: player.name,
                position: player.position,
                totalGames: 0,
                totalGoals: 0,
                totalAssists: 0,
                totalRating: 0,
                averageRating: 0
              });
            }
            
            const playerData = allPlayers.get(playerId);
            playerData.totalGames += 1;
            playerData.totalGoals += player.goals || 0;
            playerData.totalAssists += player.assists || 0;
            playerData.totalRating += player.rating || 7.0;
            playerData.averageRating = playerData.totalRating / playerData.totalGames;
          });
        }
      });
    });

    const playersArray = Array.from(allPlayers.values()).filter(p => p.totalGames >= 1);
    
    return {
      topRated: playersArray
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, 3),
      topScorers: playersArray
        .sort((a, b) => b.totalGoals - a.totalGoals)
        .slice(0, 3),
      mostUsed: playersArray
        .sort((a, b) => b.totalGames - a.totalGames)
        .slice(0, 3)
    };
  }, [weeklyData]);

  if (weeklyData.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Top Performers</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-center py-4">
            No player data available. Record some games to see top performers.
          </p>
        </CardContent>
      </Card>
    );
  }

  const hasPlayers = topPerformers.topRated.length > 0 || topPerformers.topScorers.length > 0 || topPerformers.mostUsed.length > 0;

  if (!hasPlayers) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Top Performers</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-center py-4">
            No detailed player stats available. Add player performance data to games to see top performers.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Trophy className="h-5 w-5 text-fifa-gold" />
          Top Performers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Top Rated */}
        {topPerformers.topRated.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-fifa-blue mb-3 flex items-center gap-2">
              <Star className="h-4 w-4" />
              Highest Rated
            </h4>
            <div className="space-y-2">
              {topPerformers.topRated.map((player, index) => (
                <div key={`rated-${player.name}-${index}`} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                    <span className="text-white text-sm">{player.name}</span>
                  </div>
                  <span className="text-fifa-gold font-bold text-sm">{player.averageRating.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Scorers */}
        {topPerformers.topScorers.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-fifa-green mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Top Scorers
            </h4>
            <div className="space-y-2">
              {topPerformers.topScorers.map((player, index) => (
                <div key={`scorer-${player.name}-${index}`} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                    <span className="text-white text-sm">{player.name}</span>
                  </div>
                  <span className="text-fifa-green font-bold text-sm">{player.totalGoals}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Most Used */}
        {topPerformers.mostUsed.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-fifa-purple mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Most Used
            </h4>
            <div className="space-y-2">
              {topPerformers.mostUsed.map((player, index) => (
                <div key={`used-${player.name}-${index}`} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                    <span className="text-white text-sm">{player.name}</span>
                  </div>
                  <span className="text-fifa-purple font-bold text-sm">{player.totalGames} games</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopPerformers;
