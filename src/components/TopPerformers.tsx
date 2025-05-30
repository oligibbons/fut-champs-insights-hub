
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSquadData } from '@/hooks/useSquadData';
import { Trophy, Target, TrendingUp, Star } from 'lucide-react';

const TopPerformers = () => {
  const { players } = useSquadData();

  const topPerformers = useMemo(() => {
    const playersWithGames = players.filter(p => p.gamesPlayed >= 1);
    
    return {
      topRated: playersWithGames
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, 3),
      topScorers: playersWithGames
        .sort((a, b) => b.goals - a.goals)
        .slice(0, 3),
      mostUsed: playersWithGames
        .sort((a, b) => b.gamesPlayed - a.gamesPlayed)
        .slice(0, 3)
    };
  }, [players]);

  if (players.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Top Performers</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-center py-4">
            No player data available. Create some squads to see top performers.
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
        <div>
          <h4 className="text-sm font-medium text-fifa-blue mb-3 flex items-center gap-2">
            <Star className="h-4 w-4" />
            Highest Rated
          </h4>
          <div className="space-y-2">
            {topPerformers.topRated.map((player, index) => (
              <div key={`rated-${player.id}`} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                  <span className="text-white text-sm">{player.name}</span>
                </div>
                <span className="text-fifa-gold font-bold text-sm">{player.averageRating.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Scorers */}
        <div>
          <h4 className="text-sm font-medium text-fifa-green mb-3 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Top Scorers
          </h4>
          <div className="space-y-2">
            {topPerformers.topScorers.map((player, index) => (
              <div key={`scorer-${player.id}`} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                  <span className="text-white text-sm">{player.name}</span>
                </div>
                <span className="text-fifa-green font-bold text-sm">{player.goals}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Most Used */}
        <div>
          <h4 className="text-sm font-medium text-fifa-purple mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Most Used
          </h4>
          <div className="space-y-2">
            {topPerformers.mostUsed.map((player, index) => (
              <div key={`used-${player.id}`} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                  <span className="text-white text-sm">{player.name}</span>
                </div>
                <span className="text-fifa-purple font-bold text-sm">{player.gamesPlayed} games</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopPerformers;
