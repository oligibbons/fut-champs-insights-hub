import { useMemo } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDataSync } from '@/hooks/useDataSync';
import { Trophy, Target, TrendingUp, Star, Users, Award, Clock, BarChart3 } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

const Players = () => {
  const { currentTheme } = useTheme();
  const { weeklyData } = useDataSync();

  const playerStats = useMemo(() => {
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
                averageRating: 0,
                wins: 0,
                losses: 0,
                winRate: 0,
                totalMinutes: 0,
                goalsPer90: 0,
                assistsPer90: 0,
                lastUsed: ''
              });
            }
            
            const playerData = allPlayers.get(playerId);
            playerData.totalGames += 1;
            playerData.totalGoals += player.goals || 0;
            playerData.totalAssists += player.assists || 0;
            playerData.totalRating += player.rating || 7.0;
            playerData.totalMinutes += player.minutesPlayed || 0;
            playerData.averageRating = playerData.totalRating / playerData.totalGames;
            playerData.lastUsed = game.date;
            
            // Track wins/losses for this player
            if (game.result === 'win') {
              playerData.wins += 1;
            } else {
              playerData.losses += 1;
            }
            playerData.winRate = (playerData.wins / playerData.totalGames) * 100;
            
            // Calculate per 90 minutes stats
            if (playerData.totalMinutes > 0) {
              playerData.goalsPer90 = (playerData.totalGoals / playerData.totalMinutes) * 90;
              playerData.assistsPer90 = (playerData.totalAssists / playerData.totalMinutes) * 90;
            }
          });
        }
      });
    });

    return Array.from(allPlayers.values())
      .filter(p => p.totalGames > 0)
      .sort((a, b) => b.averageRating - a.averageRating);
  }, [weeklyData]);

  const topStats = useMemo(() => {
    if (playerStats.length === 0) return null;

    return {
      topRated: playerStats.slice().sort((a, b) => b.averageRating - a.averageRating)[0],
      topScorer: playerStats.slice().sort((a, b) => b.goalsPer90 - a.goalsPer90)[0],
      mostUsed: playerStats.slice().sort((a, b) => b.totalGames - a.totalGames)[0],
      bestWinRate: playerStats.slice().sort((a, b) => b.winRate - a.winRate)[0]
    };
  }, [playerStats]);

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="lg:ml-64 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
          {/* Header */}
          <div className="page-header">
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
              Player Analytics
            </h1>
            <p className="text-lg" style={{ color: currentTheme.colors.muted }}>
              Comprehensive statistics and performance analysis for all your players
            </p>
          </div>

          {/* Top Stats Grid */}
          {topStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <Card className="metric-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-fifa-gold text-sm">
                    <Star className="h-4 w-4" />
                    Highest Rated
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white font-bold text-lg">{topStats.topRated.name}</p>
                  <p className="text-fifa-gold font-bold text-xl">{topStats.topRated.averageRating.toFixed(1)}</p>
                  <p className="text-xs text-gray-400">{topStats.topRated.totalGames} games</p>
                </CardContent>
              </Card>

              <Card className="metric-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-fifa-green text-sm">
                    <Target className="h-4 w-4" />
                    Top Scorer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white font-bold text-lg">{topStats.topScorer.name}</p>
                  <p className="text-fifa-green font-bold text-xl">{topStats.topScorer.goalsPer90.toFixed(2)}</p>
                  <p className="text-xs text-gray-400">goals per 90</p>
                </CardContent>
              </Card>

              <Card className="metric-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-fifa-blue text-sm">
                    <Clock className="h-4 w-4" />
                    Most Used
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white font-bold text-lg">{topStats.mostUsed.name}</p>
                  <p className="text-fifa-blue font-bold text-xl">{topStats.mostUsed.totalGames}</p>
                  <p className="text-xs text-gray-400">games played</p>
                </CardContent>
              </Card>

              <Card className="metric-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-fifa-purple text-sm">
                    <Trophy className="h-4 w-4" />
                    Best Win Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white font-bold text-lg">{topStats.bestWinRate.name}</p>
                  <p className="text-fifa-purple font-bold text-xl">{topStats.bestWinRate.winRate.toFixed(0)}%</p>
                  <p className="text-xs text-gray-400">{topStats.bestWinRate.wins}W-{topStats.bestWinRate.losses}L</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Player List */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                All Players ({playerStats.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {playerStats.length > 0 ? (
                <div className="space-y-4">
                  {playerStats.map((player, index) => (
                    <div key={`${player.name}-${index}`} className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-fifa-gold/20 text-fifa-gold border-fifa-gold/30">
                            #{index + 1}
                          </Badge>
                          <div>
                            <p className="font-medium text-white">{player.name}</p>
                            <p className="text-gray-400 text-sm">{player.position}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-fifa-gold font-bold text-xl">{player.averageRating.toFixed(1)}</p>
                          <p className="text-xs text-gray-400">Avg Rating</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        <div className="text-center p-2 bg-white/5 rounded-lg">
                          <p className="text-white font-bold">{player.totalGames}</p>
                          <p className="text-xs text-gray-400">Games</p>
                        </div>
                        <div className="text-center p-2 bg-white/5 rounded-lg">
                          <p className="text-fifa-green font-bold">{player.goalsPer90.toFixed(2)}</p>
                          <p className="text-xs text-gray-400">G/90</p>
                        </div>
                        <div className="text-center p-2 bg-white/5 rounded-lg">
                          <p className="text-fifa-blue font-bold">{player.assistsPer90.toFixed(2)}</p>
                          <p className="text-xs text-gray-400">A/90</p>
                        </div>
                        <div className="text-center p-2 bg-white/5 rounded-lg">
                          <p className="text-fifa-purple font-bold">{player.winRate.toFixed(0)}%</p>
                          <p className="text-xs text-gray-400">Win Rate</p>
                        </div>
                        <div className="text-center p-2 bg-white/5 rounded-lg">
                          <p className="text-fifa-gold font-bold">{Math.round(player.totalMinutes / 90)}</p>
                          <p className="text-xs text-gray-400">90s Played</p>
                        </div>
                        <div className="text-center p-2 bg-white/5 rounded-lg">
                          <p className="text-fifa-green font-bold">{(player.goalsPer90 + player.assistsPer90).toFixed(2)}</p>
                          <p className="text-xs text-gray-400">G+A/90</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 mx-auto mb-4 text-gray-400 opacity-50" />
                  <h3 className="text-xl font-medium text-white mb-2">No Player Data</h3>
                  <p className="text-gray-400 mb-6">Start recording games with player stats to see detailed analytics here.</p>
                  <Badge variant="outline" className="text-fifa-blue border-fifa-blue/30">
                    Add player stats when recording games
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Players;