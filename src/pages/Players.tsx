import { useMemo } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// ** Use reconciled types/hook **
import { useAccountData, PlayerPerformanceWithDetails } from '@/hooks/useAccountData';
import { Trophy, Target, TrendingUp, Star, Users, Award, Clock, BarChart3 } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { Skeleton } from '@/components/ui/skeleton';
import { CardType, PlayerCard } from '@/types/squads';
import { cn } from '@/lib/utils';

// Helper to get card style (same as before)
const getCardStyle = (player: PlayerCard | undefined, cardTypes: CardType[], themeColors: any) => {
    if (!player) return { background: themeColors.surface, color: themeColors.foreground, borderColor: themeColors.border };
    const cardType = cardTypes.find(ct => ct.id === player.card_type);
    if (cardType) {
        return {
            background: `linear-gradient(135deg, ${cardType.primary_color}, ${cardType.secondary_color || cardType.primary_color})`,
            color: cardType.highlight_color || themeColors.primaryForeground,
            borderColor: cardType.secondary_color || 'transparent',
        };
    }
    return { background: themeColors.surface, color: themeColors.foreground, borderColor: themeColors.border };
};


const Players = () => {
  const { currentTheme } = useTheme();
  // ** Fetch all needed data from hook **
  const { weeklyData = [], allPlayers = [], allCardTypes = [], loading } = useAccountData() || {};

  const playerStats = useMemo(() => {
    const aggregatedStats = new Map<string, any>();

    weeklyData.forEach(week => {
      week.games.forEach(game => {
        // ** Use reconciled player_performances **
        if (Array.isArray(game.player_performances)) {
            game.player_performances.forEach((playerPerf: PlayerPerformanceWithDetails) => {
                const playerId = playerPerf.player_id || playerPerf.player_name.toLowerCase(); // Use player_id first
                const playerDetails = playerPerf.playerDetails; // Already attached in hook

                if (!aggregatedStats.has(playerId)) {
                    aggregatedStats.set(playerId, {
                      id: playerId,
                      name: playerDetails?.name || playerPerf.player_name,
                      position: playerDetails?.position || playerPerf.position,
                      playerDetails: playerDetails, // Keep details for card visual
                      totalGames: 0,
                      totalGoals: 0,
                      totalAssists: 0,
                      totalRating: 0,
                      averageRating: 0,
                      wins: 0,
                      losses: 0,
                      winRate: 0,
                      goalsPerGame: 0,
                      assistsPerGame: 0,
                    });
                }

                const playerData = aggregatedStats.get(playerId)!;
                playerData.totalGames += 1;
                playerData.totalGoals += playerPerf.goals || 0;
                playerData.totalAssists += playerPerf.assists || 0;
                playerData.totalRating += playerPerf.rating || 7.0;

                // Update player details if a more complete record is found
                if (!playerData.playerDetails && playerDetails) {
                    playerData.playerDetails = playerDetails;
                    playerData.name = playerDetails.name;
                    playerData.position = playerDetails.position;
                }

                if (game.result === 'win') playerData.wins += 1;
                else if (game.result === 'loss') playerData.losses += 1;

                // Recalculate
                playerData.averageRating = playerData.totalRating / playerData.totalGames;
                playerData.goalsPerGame = playerData.totalGoals / playerData.totalGames;
                playerData.assistsPerGame = playerData.totalAssists / playerData.totalGames;
                const totalOutcomes = playerData.wins + playerData.losses;
                playerData.winRate = totalOutcomes > 0 ? (playerData.wins / totalOutcomes) * 100 : 0;
            });
        }
      });
    });

    return Array.from(aggregatedStats.values())
      .filter(p => p.totalGames > 0)
      .sort((a, b) => b.averageRating - a.averageRating);
  }, [weeklyData]); // Only depends on weeklyData now


  // Top stats calculation remains the same
  const topStats = useMemo(() => { /* ... same code ... */ }, [playerStats]);

  // Loading state remains the same
  if (loading && weeklyData.length === 0) { /* ... same skeleton ... */ }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="lg:ml-64 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
          {/* Header remains the same */}
          <div className="page-header"> {/* ... */} </div>

          {/* Top Stats Grid remains the same */}
          {topStats && ( <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"> {/* ... */} </div> )}

          {/* Player List (Updated with Card Visual) */}
          <Card className="glass-card">
            <CardHeader> <CardTitle className="text-white flex items-center gap-2"> <Users className="h-5 w-5" /> All Players ({playerStats.length}) </CardTitle> </CardHeader>
            <CardContent>
              {playerStats.length > 0 ? (
                <div className="space-y-4">
                  {playerStats.map((player, index) => (
                    <div key={player.id || index} className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Player Card Visual */}
                          <div className="w-10 sm:w-12 flex-shrink-0">
                            {player.playerDetails ? (
                                <div
                                    className={cn( "aspect-[3/4] w-full rounded flex flex-col items-center justify-center text-[8px] font-bold shadow border text-center", player.playerDetails.is_evolution && "border-teal-400 border" )}
                                    style={getCardStyle(player.playerDetails, allCardTypes, currentTheme.colors)}
                                >
                                    <span className="text-[10px] sm:text-xs font-black leading-tight">{player.playerDetails.rating}</span>
                                    <span className="text-[7px] sm:text-[8px] leading-tight opacity-80">{player.position}</span>
                                </div>
                            ) : (
                                <div className="aspect-[3/4] w-full rounded bg-muted/30 border border-dashed border-border/50 flex items-center justify-center">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </div>
                            )}
                          </div>
                          {/* Player Info */}
                          <div className="min-w-0">
                            <h3 className="text-white font-bold text-base sm:text-lg truncate">{player.name}</h3>
                            <p className="text-gray-400 text-xs sm:text-sm">{player.position}</p>
                          </div>
                        </div>
                         {/* Rating */}
                        <div className="text-right flex-shrink-0">
                          <p className="text-fifa-gold font-bold text-lg sm:text-xl">{player.averageRating.toFixed(1)}</p>
                          <p className="text-xs text-gray-400">Avg Rating</p>
                        </div>
                      </div>

                      {/* Stats Grid (remains the same) */}
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4"> {/* ... */} </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Empty state remains the same
                <div className="text-center py-12"> {/* ... */} </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Players;
