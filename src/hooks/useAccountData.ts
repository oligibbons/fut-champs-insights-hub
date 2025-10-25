// src/hooks/useAccountData.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useGameVersion } from '@/contexts/GameVersionContext';
import { WeeklyPerformance, Game, PlayerPerformance, TeamStatistics } from '@/types/futChampions';
import { PlayerCard, CardType } from '@/types/squads'; // Import PlayerCard and CardType

export interface ProcessedGame extends Game {
  playerStats: PlayerPerformance[];
  teamStats: TeamStatistics | null;
}

export interface ProcessedWeeklyPerformance extends WeeklyPerformance {
  games: ProcessedGame[];
  averagePossession: number;
  averagePassAccuracy: number;
  averageShots: number;
  averageShotsOnTarget: number;
  averageCorners: number;
  averageFouls: number;
  totalYellowCards: number;
  totalRedCards: number;
  winRate: number;
  averageDribbleSuccess?: number; // Added
  averageSquadQualityComp?: { // Added simple processing example
      even: number;
      mine_better: number;
      opponent_better: number;
  };
}

// Combine PlayerPerformance with PlayerCard details
export interface PlayerPerformanceWithDetails extends PlayerPerformance {
    playerDetails?: PlayerCard; // Include full player details
}

export const useAccountData = () => {
  const { user } = useAuth();
  const { gameVersion } = useGameVersion();
  const [weeklyData, setWeeklyData] = useState<ProcessedWeeklyPerformance[]>([]);
  const [allPlayers, setAllPlayers] = useState<PlayerCard[]>([]); // Store all player cards
  const [allCardTypes, setAllCardTypes] = useState<CardType[]>([]); // Store all card types
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user || !gameVersion) {
      setWeeklyData([]);
      setAllPlayers([]); // Clear players
      setAllCardTypes([]); // Clear card types
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
        playersRes, // Fetch players
        cardTypesRes // Fetch card types
      ] = await Promise.all([
        supabase.from('weekly_performances').select('*').eq('user_id', user.id).eq('game_version', gameVersion).order('week_number', { ascending: false }),
        supabase.from('game_results').select('*').eq('user_id', user.id).eq('game_version', gameVersion),
        supabase.from('player_performances').select('*').eq('user_id', user.id), // Ideally filter by game_version if possible via joins or RLS
        supabase.from('team_statistics').select('*').eq('user_id', user.id), // Ideally filter by game_version if possible via joins or RLS
        supabase.from('players').select('*').eq('user_id', user.id).eq('game_version', gameVersion), // Fetch players for this version
        supabase.from('card_types').select('*').eq('user_id', user.id).eq('game_version', gameVersion) // Fetch card types for this version
      ]);

      if (weeklyRes.error) throw weeklyRes.error;
      if (gamesRes.error) throw gamesRes.error;
      if (perfRes.error) throw perfRes.error;
      if (statsRes.error) throw statsRes.error;
      if (playersRes.error) throw playersRes.error; // Handle player fetch error
      if (cardTypesRes.error) throw cardTypesRes.error; // Handle card type fetch error

      const weeks = weeklyRes.data || [];
      const games = gamesRes.data || [];
      const performances = perfRes.data || [];
      const teamStatsList = statsRes.data || [];
      const players = playersRes.data || []; // Store fetched players
      const cardTypes = cardTypesRes.data || []; // Store fetched card types

      setAllPlayers(players); // Update state
      setAllCardTypes(cardTypes); // Update state

      const playerMap = new Map(players.map(p => [p.id, p])); // Map players by ID for quick lookup

      // Process data
      const processedData = weeks.map((week): ProcessedWeeklyPerformance => {
        const weekGames = games.filter((game) => game.week_id === week.id).sort((a, b) => a.game_number - b.game_number);
        let totalPossession = 0, totalPassAcc = 0, totalShots = 0, totalSOT = 0;
        let totalCorners = 0, totalFouls = 0, totalYellow = 0, totalRed = 0;
        let totalDribbleSuccess = 0, dribbleCount = 0; // Added
        const squadQualityCounts = { even: 0, mine_better: 0, opponent_better: 0 }; // Added

        const processedGames = weekGames.map((game): ProcessedGame => {
          const gamePerformances = performances.filter((p) => p.game_id === game.id);
          // --- Attach player details to performances ---
          const performancesWithDetails: PlayerPerformanceWithDetails[] = gamePerformances.map(perf => ({
            ...perf,
            playerDetails: perf.player_id ? playerMap.get(perf.player_id) : undefined
          }));
          // --- End Attach ---
          const teamStats = teamStatsList.find((ts) => ts.game_id === game.id) || null;

          if (teamStats) {
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
           // Added squad quality aggregation
           if (game.squad_quality_comparison) {
             squadQualityCounts[game.squad_quality_comparison]++;
           }

          return {
            ...game,
            playerStats: performancesWithDetails, // Use performances with details
            teamStats,
          };
        });

        const gameCount = processedGames.length;
        const statsCount = processedGames.filter(g => g.teamStats).length; // Count games with stats

        return {
          ...week,
          games: processedGames,
          averagePossession: statsCount > 0 ? totalPossession / statsCount : 0,
          averagePassAccuracy: statsCount > 0 ? totalPassAcc / statsCount : 0,
          averageShots: gameCount > 0 ? totalShots / gameCount : 0, // Use gameCount if stat isn't always present
          averageShotsOnTarget: gameCount > 0 ? totalSOT / gameCount : 0, // Use gameCount
          averageCorners: gameCount > 0 ? totalCorners / gameCount : 0, // Use gameCount
          averageFouls: gameCount > 0 ? totalFouls / gameCount : 0, // Use gameCount
          totalYellowCards: totalYellow,
          totalRedCards: totalRed,
          winRate: gameCount > 0 ? (week.total_wins / gameCount) * 100 : 0,
          averageDribbleSuccess: dribbleCount > 0 ? totalDribbleSuccess / dribbleCount : undefined, // Added calculation
          averageSquadQualityComp: squadQualityCounts, // Added
        };
      });

      setWeeklyData(processedData);
    } catch (err: any) {
      console.error("Error fetching account data:", err);
      setError(`Failed to load data: ${err.message}`);
      setWeeklyData([]);
      setAllPlayers([]); // Clear on error
      setAllCardTypes([]); // Clear on error
    } finally {
      setLoading(false);
    }
  }, [user, gameVersion]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { weeklyData, allPlayers, allCardTypes, loading, error, refetchData: fetchData };
};
