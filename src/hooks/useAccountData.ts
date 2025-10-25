// src/hooks/useAccountData.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useGameVersion } from '@/contexts/GameVersionContext';
// ** Use reconciled types **
import { WeeklyPerformance, Game, PlayerPerformance, TeamStatistics } from '@/types/futChampions';
import { PlayerCard, CardType } from '@/types/squads';

// Interface combining DB performance data with PlayerCard details
export interface PlayerPerformanceWithDetails extends PlayerPerformance {
    playerDetails?: PlayerCard; // Include full player details fetched separately
}

export interface ProcessedGame extends Game {
  playerStats: PlayerPerformanceWithDetails[]; // Use the combined type
  teamStats: TeamStatistics | null; // Correct type based on reconciliation
}

export interface ProcessedWeeklyPerformance extends WeeklyPerformance {
  games: ProcessedGame[];
  averagePossession?: number;
  averagePassAccuracy?: number;
  averageShots?: number;
  averageShotsOnTarget?: number;
  averageCorners?: number;
  averageFouls?: number;
  totalYellowCards?: number;
  totalRedCards?: number;
  winRate?: number;
  averageDribbleSuccess?: number; // Added
  squadQualityCounts?: { // Added simple processing example
      even: number;
      mine_better: number;
      opponent_better: number;
  };
  // Add other calculated fields if needed
}


export const useAccountData = () => {
  const { user } = useAuth();
  const { gameVersion } = useGameVersion();
  const [weeklyData, setWeeklyData] = useState<ProcessedWeeklyPerformance[]>([]);
  const [allPlayers, setAllPlayers] = useState<PlayerCard[]>([]);
  const [allCardTypes, setAllCardTypes] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user || !gameVersion) {
      setWeeklyData([]);
      setAllPlayers([]);
      setAllCardTypes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch all necessary data in parallel
      const [
        weeklyRes,
        gamesRes,
        perfRes,
        statsRes,
        playersRes,
        cardTypesRes
      ] = await Promise.all([
        supabase.from('weekly_performances').select('*').eq('user_id', user.id).eq('game_version', gameVersion).order('week_number', { ascending: false }),
        supabase.from('game_results').select('*').eq('user_id', user.id).eq('game_version', gameVersion),
        supabase.from('player_performances').select('*').eq('user_id', user.id), // Ideally filter by game_version if possible via joins or RLS
        supabase.from('team_statistics').select('*').eq('user_id', user.id), // Ideally filter by game_version if possible via joins or RLS
        supabase.from('players').select('*').eq('user_id', user.id).eq('game_version', gameVersion),
        supabase.from('card_types').select('*').eq('user_id', user.id).eq('game_version', gameVersion)
      ]);

      // Error Handling for all fetches
      if (weeklyRes.error) throw new Error(`Weekly Perf Error: ${weeklyRes.error.message}`);
      if (gamesRes.error) throw new Error(`Games Error: ${gamesRes.error.message}`);
      if (perfRes.error) throw new Error(`Player Perf Error: ${perfRes.error.message}`);
      if (statsRes.error) throw new Error(`Team Stats Error: ${statsRes.error.message}`);
      if (playersRes.error) throw new Error(`Players Error: ${playersRes.error.message}`);
      if (cardTypesRes.error) throw new Error(`Card Types Error: ${cardTypesRes.error.message}`);


      const weeks: WeeklyPerformance[] = weeklyRes.data || [];
      const games: Game[] = gamesRes.data || [];
      const performances: PlayerPerformance[] = perfRes.data || [];
      const teamStatsList: TeamStatistics[] = statsRes.data || [];
      const players: PlayerCard[] = playersRes.data || [];
      const cardTypes: CardType[] = cardTypesRes.data || [];

      setAllPlayers(players); // Update state
      setAllCardTypes(cardTypes); // Update state

      const playerMap = new Map(players.map(p => [p.id, p])); // Map players by ID

      // Process data
      const processedData = weeks.map((week): ProcessedWeeklyPerformance => {
        const weekGames = games
            .filter((game) => game.week_id === week.id)
            .sort((a, b) => a.game_number - b.game_number); // Use game_number

        let totalPossession = 0, totalPassAcc = 0, totalShots = 0, totalSOT = 0;
        let totalCorners = 0, totalFouls = 0, totalYellow = 0, totalRed = 0;
        let totalDribbleSuccess = 0, dribbleCount = 0;
        const squadQualityCounts = { even: 0, mine_better: 0, opponent_better: 0 };
        let gamesWithStatsCount = 0;

        const processedGames = weekGames.map((game): ProcessedGame => {
          const gamePerformances = performances.filter((p) => p.game_id === game.id);

          // Attach player details
          const performancesWithDetails: PlayerPerformanceWithDetails[] = gamePerformances.map(perf => ({
            ...perf,
            playerDetails: perf.player_id ? playerMap.get(perf.player_id) : undefined
          }));

          const teamStats = teamStatsList.find((ts) => ts.game_id === game.id) || null;

          if (teamStats) {
            gamesWithStatsCount++;
            totalPossession += teamStats.possession || 0;
            totalPassAcc += teamStats.pass_accuracy || 0;
            totalShots += teamStats.shots || 0;
            totalSOT += teamStats.shots_on_target || 0;
            totalCorners += teamStats.corners || 0;
            totalFouls += teamStats.fouls || 0;
            totalYellow += teamStats.yellow_cards || 0;
            totalRed += teamStats.red_cards || 0;
            if (teamStats.dribble_success_rate !== null && teamStats.dribble_success_rate !== undefined) {
                totalDribbleSuccess += teamStats.dribble_success_rate;
                dribbleCount++;
            }
          }
           if (game.squad_quality_comparison) {
             squadQualityCounts[game.squad_quality_comparison]++;
           }

          return {
            ...game,
            playerStats: performancesWithDetails, // Use performances with details
            teamStats: teamStats, // Assign the single found object or null
          };
        });

        const gameCount = processedGames.length;
        const actualTotalWins = week.total_wins ?? 0; // Use DB value directly
        const actualTotalLosses = week.total_losses ?? 0; // Use DB value directly

        return {
          ...week,
          games: processedGames,
          // Calculate averages safely
          averagePossession: gamesWithStatsCount > 0 ? totalPossession / gamesWithStatsCount : undefined,
          averagePassAccuracy: gamesWithStatsCount > 0 ? totalPassAcc / gamesWithStatsCount : undefined,
          averageShots: gamesWithStatsCount > 0 ? totalShots / gamesWithStatsCount : undefined, // Avg based on games with stats
          averageShotsOnTarget: gamesWithStatsCount > 0 ? totalSOT / gamesWithStatsCount : undefined, // Avg based on games with stats
          averageCorners: gamesWithStatsCount > 0 ? totalCorners / gamesWithStatsCount : undefined, // Avg based on games with stats
          averageFouls: gamesWithStatsCount > 0 ? totalFouls / gamesWithStatsCount : undefined, // Avg based on games with stats
          totalYellowCards: totalYellow,
          totalRedCards: totalRed,
          winRate: gameCount > 0 ? (actualTotalWins / gameCount) * 100 : 0,
          averageDribbleSuccess: dribbleCount > 0 ? totalDribbleSuccess / dribbleCount : undefined,
          squadQualityCounts: squadQualityCounts,
        };
      });

      setWeeklyData(processedData);
    } catch (err: any) {
      console.error("Error fetching account data:", err);
      setError(`Failed to load data: ${err.message}`);
      setWeeklyData([]);
      setAllPlayers([]);
      setAllCardTypes([]);
    } finally {
      setLoading(false);
    }
  }, [user, gameVersion]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { weeklyData, allPlayers, allCardTypes, loading, error, refetchData: fetchData };
};
