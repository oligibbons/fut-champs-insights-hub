
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDataSync } from '@/hooks/useDataSync';
import { Trophy, Target, TrendingUp, Users, BarChart3, Clock, Zap, Shield } from 'lucide-react';

const CurrentRunStats = () => {
  const { getCurrentWeek } = useDataSync();
  const currentWeek = getCurrentWeek();

  const runStats = useMemo(() => {
    if (!currentWeek || !currentWeek.games.length) return null;

    const games = currentWeek.games;
    const totalGames = games.length;
    
    // Team stats aggregation
    const totalPossession = games.reduce((sum, game) => sum + (game.teamStats?.possession || 50), 0);
    const totalPasses = games.reduce((sum, game) => sum + (game.teamStats?.passes || 0), 0);
    const totalPassAccuracy = games.reduce((sum, game) => sum + (game.teamStats?.passAccuracy || 75), 0);
    const totalShots = games.reduce((sum, game) => sum + (game.teamStats?.shots || 0), 0);
    const totalShotsOnTarget = games.reduce((sum, game) => sum + (game.teamStats?.shotsOnTarget || 0), 0);
    const totalCorners = games.reduce((sum, game) => sum + (game.teamStats?.corners || 0), 0);
    const totalFouls = games.reduce((sum, game) => sum + (game.teamStats?.fouls || 0), 0);
    const totalYellowCards = games.reduce((sum, game) => sum + (game.teamStats?.yellowCards || 0), 0);
    const totalRedCards = games.reduce((sum, game) => sum + (game.teamStats?.redCards || 0), 0);

    // Performance metrics
    const avgOpponentSkill = games.reduce((sum, game) => sum + game.opponentSkill, 0) / totalGames;
    const winRate = (currentWeek.totalWins / totalGames) * 100;
    const goalRatio = currentWeek.totalConceded > 0 ? currentWeek.totalGoals / currentWeek.totalConceded : currentWeek.totalGoals;
    
    return {
      totalGames,
      wins: currentWeek.totalWins,
      losses: currentWeek.totalLosses,
      goals: currentWeek.totalGoals,
      conceded: currentWeek.totalConceded,
      winRate,
      goalRatio: goalRatio.toFixed(2),
      avgOpponentSkill: avgOpponentSkill.toFixed(1),
      currentStreak: currentWeek.currentStreak || 0,
      avgPossession: (totalPossession / totalGames).toFixed(1),
      avgPasses: Math.round(totalPasses / totalGames),
      avgPassAccuracy: (totalPassAccuracy / totalGames).toFixed(1),
      avgShots: (totalShots / totalGames).toFixed(1),
      avgShotsOnTarget: (totalShotsOnTarget / totalGames).toFixed(1),
      shotAccuracy: totalShots > 0 ? ((totalShotsOnTarget / totalShots) * 100).toFixed(1) : '0',
      avgCorners: (totalCorners / totalGames).toFixed(1),
      avgFouls: (totalFouls / totalGames).toFixed(1),
      totalYellowCards,
      totalRedCards,
      disciplineRating: Math.max(0, 10 - (totalYellowCards * 0.5) - (totalRedCards * 2)).toFixed(1)
    };
  }, [currentWeek]);

  const playerStats = useMemo(() => {
    if (!currentWeek || !currentWeek.games.length) return [];

    const playerMap = new Map();
    
    currentWeek.games.forEach(game => {
      game.playerStats?.forEach(player => {
        const existing = playerMap.get(player.name) || {
          name: player.name,
          position: player.position,
          gamesPlayed: 0,
          goals: 0,
          assists: 0,
          totalRating: 0,
          totalMinutes: 0,
          yellowCards: 0,
          redCards: 0
        };
        
        existing.gamesPlayed += 1;
        existing.goals += player.goals;
        existing.assists += player.assists;
        existing.totalRating += player.rating;
        existing.totalMinutes += player.minutesPlayed;
        existing.yellowCards += player.yellowCards;
        existing.redCards += player.redCards;
        
        playerMap.set(player.name, existing);
      });
    });
    
    return Array.from(playerMap.values())
      .map(player => ({
        ...player,
        averageRating: player.gamesPlayed > 0 ? (player.totalRating / player.gamesPlayed) : 0,
        goalsPer90: player.totalMinutes > 0 ? (player.goals * 90) / player.totalMinutes : 0,
        assistsPer90: player.totalMinutes > 0 ? (player.assists * 90) / player.totalMinutes : 0,
        goalInvolvements: player.goals + player.assists,
        goalInvolvementsPer90: player.totalMinutes > 0 ? ((player.goals + player.assists) * 90) / player.totalMinutes : 0
      }))
      .sort((a, b) => b.goalInvolvementsPer90 - a.goalInvolvementsPer90);
  }, [currentWeek]);

  if (!runStats) {
    return (
      <div className="space-y-6">
        <Card className="glass-card">
          <CardContent className="text-center py-12">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-400 opacity-50" />
            <h3 className="text-xl font-medium text-white mb-2">No Active Run</h3>
            <p className="text-gray-400">Start playing games to see your current run statistics.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="metric-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-fifa-green text-sm">
              <Trophy className="h-4 w-4" />
              Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-fifa-green font-bold text-2xl">{runStats.winRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-400">{runStats.wins}W - {runStats.losses}L</p>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-fifa-blue text-sm">
              <Target className="h-4 w-4" />
              Goal Ratio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-fifa-blue font-bold text-2xl">{runStats.goalRatio}</p>
            <p className="text-xs text-gray-400">{runStats.goals} scored, {runStats.conceded} conceded</p>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-fifa-purple text-sm">
              <TrendingUp className="h-4 w-4" />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-fifa-purple font-bold text-2xl">{runStats.currentStreak}</p>
            <p className="text-xs text-gray-400">games</p>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-fifa-gold text-sm">
              <BarChart3 className="h-4 w-4" />
              Avg Opponent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-fifa-gold font-bold text-2xl">{runStats.avgOpponentSkill}/10</p>
            <p className="text-xs text-gray-400">skill level</p>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Team Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <p className="text-fifa-blue font-bold text-lg">{runStats.avgPossession}%</p>
              <p className="text-xs text-gray-400">Avg Possession</p>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <p className="text-fifa-green font-bold text-lg">{runStats.avgPasses}</p>
              <p className="text-xs text-gray-400">Avg Passes</p>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <p className="text-fifa-purple font-bold text-lg">{runStats.avgPassAccuracy}%</p>
              <p className="text-xs text-gray-400">Pass Accuracy</p>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <p className="text-fifa-gold font-bold text-lg">{runStats.shotAccuracy}%</p>
              <p className="text-xs text-gray-400">Shot Accuracy</p>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <p className="text-fifa-blue font-bold text-lg">{runStats.avgShots}</p>
              <p className="text-xs text-gray-400">Avg Shots</p>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <p className="text-fifa-green font-bold text-lg">{runStats.avgShotsOnTarget}</p>
              <p className="text-xs text-gray-400">Shots on Target</p>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <p className="text-fifa-purple font-bold text-lg">{runStats.avgCorners}</p>
              <p className="text-xs text-gray-400">Avg Corners</p>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <p className="text-fifa-gold font-bold text-lg">{runStats.disciplineRating}/10</p>
              <p className="text-xs text-gray-400">Discipline</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            Top Performers This Run
          </CardTitle>
        </CardHeader>
        <CardContent>
          {playerStats.length > 0 ? (
            <div className="space-y-3">
              {playerStats.slice(0, 5).map((player, index) => (
                <div key={`${player.name}-${index}`} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-fifa-gold/20 text-fifa-gold border-fifa-gold/30">
                      #{index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium text-white">{player.name}</p>
                      <p className="text-xs text-gray-400">{player.position} • {player.gamesPlayed} games</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-fifa-gold">{player.averageRating.toFixed(1)}</p>
                    <p className="text-xs text-gray-400">Rating</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-fifa-green">{player.goalInvolvementsPer90.toFixed(1)}</p>
                    <p className="text-xs text-gray-400">G+A/90</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-fifa-blue">{player.goals}G {player.assists}A</p>
                    <p className="text-xs text-gray-400">Total</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-500" />
              <p className="text-gray-400">No player stats recorded yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CurrentRunStats;
