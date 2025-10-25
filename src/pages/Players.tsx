import { useMemo } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAccountData, PlayerPerformanceWithDetails } from '@/hooks/useAccountData'; // Import updated type
import { Trophy, Target, TrendingUp, Star, Users, Award, Clock, BarChart3 } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { Skeleton } from '@/components/ui/skeleton';
import { CardType, PlayerCard } from '@/types/squads'; // Import types
import { cn } from '@/lib/utils'; // Import cn

// Helper to get card style (similar to SquadVisual)
const getCardStyle = (player: PlayerCard | undefined, cardTypes: CardType[], themeColors: any) => {
    if (!player) return { background: themeColors.surface, color: themeColors.foreground, borderColor: themeColors.border };
    const cardType = cardTypes.find(ct => ct.id === player.card_type);
    if (cardType) {
        return {
            background: `linear-gradient(135deg, ${cardType.primary_color}, ${cardType.secondary_color || cardType.primary_color})`,
            color: cardType.highlight_color || themeColors.primaryForeground, // Fallback color
            borderColor: cardType.secondary_color || 'transparent',
        };
    }
    // Fallback style using theme surface color
    return { background: themeColors.surface, color: themeColors.foreground, borderColor: themeColors.border };
};


const Players = () => {
  const { currentTheme } = useTheme();
  // Fetch allPlayers and allCardTypes from the hook
  const { weeklyData = [], allPlayers = [], allCardTypes = [], loading } = useAccountData() || {};

  const playerStats = useMemo(() => {
    const aggregatedStats = new Map<string, any>(); // Use player_id as key if available

    weeklyData.forEach(week => {
      week.games.forEach(game => {
        // Ensure playerStats is an array before iterating
        if (Array.isArray(game.playerStats)) {
            game.playerStats.forEach((playerPerf: PlayerPerformanceWithDetails) => {
                // Prioritize player_id if available, fallback to name for older data?
                const playerId = playerPerf.player_id || playerPerf.player_name.toLowerCase();
                const playerDetails = playerPerf.playerDetails; // Details are now attached

                if (!aggregatedStats.has(playerId)) {
                    aggregatedStats.set(playerId, {
                    id: playerId, // Store the key used
                    name: playerDetails?.name || playerPerf.player_name, // Use name from details if possible
                    position: playerDetails?.position || playerPerf.position, // Use position from details if possible
                    playerDetails: playerDetails, // Store full details for card visual
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
                    // lastUsed: '' // Could track lastUsed if needed
                    });
                }

                const playerData = aggregatedStats.get(playerId)!; // Assert non-null
                playerData.totalGames += 1;
                playerData.totalGoals += playerPerf.goals || 0;
                playerData.totalAssists += playerPerf.assists || 0;
                playerData.totalRating += playerPerf.rating || 7.0; // Ensure rating is treated as number
                // Update player details if a more complete record is found (e.g., if first seen was fallback name)
                if (!playerData.playerDetails && playerDetails) {
                    playerData.playerDetails = playerDetails;
                    playerData.name = playerDetails.name;
                    playerData.position = playerDetails.position;
                }

                if (game.result === 'win') {
                    playerData.wins += 1;
                } else if (game.result === 'loss') { // Only count losses for win rate
                    playerData.losses += 1;
                }
                // Recalculate averages/rates each time
                playerData.averageRating = playerData.totalRating / playerData.totalGames;
                playerData.goalsPerGame = playerData.totalGoals / playerData.totalGames;
                playerData.assistsPerGame = playerData.totalAssists / playerData.totalGames;
                const totalOutcomes = playerData.wins + playerData.losses;
                playerData.winRate = totalOutcomes > 0 ? (playerData.wins / totalOutcomes) * 100 : 0; // Use wins+losses for rate
            });
        }
      });
    });

    return Array.from(aggregatedStats.values())
      .filter(p => p.totalGames > 0)
      .sort((a, b) => b.averageRating - a.averageRating);
  }, [weeklyData]); // Depend only on weeklyData as playerDetails are now included


  const topStats = useMemo(() => {
    if (playerStats.length === 0) return null;
    // Ensure slice creates a copy before sorting
    const sortedByRating = [...playerStats].sort((a, b) => b.averageRating - a.averageRating);
    const sortedByGoals = [...playerStats].sort((a, b) => b.totalGoals - a.totalGoals);
    const sortedByGames = [...playerStats].sort((a, b) => b.totalGames - a.totalGames);
    const sortedByWinRate = [...playerStats].sort((a, b) => b.winRate - a.winRate);

    return {
      topRated: sortedByRating[0],
      topScorer: sortedByGoals[0],
      mostUsed: sortedByGames[0],
      bestWinRate: sortedByWinRate[0]
    };
  }, [playerStats]);


  // Loading state remains the same
  if (loading && weeklyData.length === 0) { // Check weeklyData length for initial load
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="lg:ml-64 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
            <div className="page-header"><Skeleton className="h-10 w-3/5 mb-2" /><Skeleton className="h-6 w-4/5" /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"><Skeleton className="h-32 rounded-xl" /><Skeleton className="h-32 rounded-xl" /><Skeleton className="h-32 rounded-xl" /><Skeleton className="h-32 rounded-xl" /></div>
            <Card className="glass-card"><CardHeader><Skeleton className="h-6 w-40" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-40 rounded-xl" /><Skeleton className="h-40 rounded-xl" /><Skeleton className="h-40 rounded-xl" /></CardContent></Card>
          </div>
        </main>
      </div>
    );
  }

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

          {/* Top Stats Grid (logic remains the same) */}
          {topStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {/* ... Stat Cards remain the same ... */}
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
                    <div key={player.id || index} className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Player Card Visual */}
                          <div className="w-10 sm:w-12 flex-shrink-0">
                            {player.playerDetails ? (
                                <div
                                    className={cn(
                                        "aspect-[3/4] w-full rounded flex flex-col items-center justify-center text-xs font-bold shadow border text-center",
                                        player.playerDetails.is_evolution && "border-teal-400 border"
                                    )}
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
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
                        <div className="text-center p-2 bg-white/5 rounded-lg"> <p className="text-white font-bold text-sm sm:text-base">{player.totalGames}</p> <p className="text-xs text-gray-400">Games</p> </div>
                        <div className="text-center p-2 bg-white/5 rounded-lg"> <p className="text-fifa-green font-bold text-sm sm:text-base">{player.totalGoals}</p> <p className="text-xs text-gray-400">Goals</p> </div>
                        <div className="text-center p-2 bg-white/5 rounded-lg"> <p className="text-fifa-blue font-bold text-sm sm:text-base">{player.totalAssists}</p> <p className="text-xs text-gray-400">Assists</p> </div>
                        <div className="text-center p-2 bg-white/5 rounded-lg"> <p className="text-fifa-purple font-bold text-sm sm:text-base">{player.winRate.toFixed(0)}%</p> <p className="text-xs text-gray-400">Win Rate</p> </div>
                        <div className="text-center p-2 bg-white/5 rounded-lg"> <p className="text-fifa-gold font-bold text-sm sm:text-base">{player.goalsPerGame.toFixed(1)}</p> <p className="text-xs text-gray-400">G/Game</p> </div>
                        <div className="text-center p-2 bg-white/5 rounded-lg"> <p className="text-fifa-green font-bold text-sm sm:text-base">{player.assistsPerGame.toFixed(1)}</p> <p className="text-xs text-gray-400">A/Game</p> </div>
                      </div>
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
