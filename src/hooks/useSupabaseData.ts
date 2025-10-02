import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { WeeklyPerformance, GameResult, PlayerPerformance, TeamStats } from '@/types/futChampions';
import { useLocalStorage } from './useLocalStorage';

export function useSupabaseData() {
  const { user } = useAuth();
  const [weeklyData, setWeeklyData] = useState<WeeklyPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameVersion] = useLocalStorage('gameVersion', 'FC26');

  // Fetch all data from Supabase in a more optimized way
  const fetchWeeklyData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data: weeks, error } = await supabase
        .from('weekly_performances')
        .select(`
          *,
          game_results (
            *,
            player_performances (*),
            team_statistics (*)
          )
        `)
        .eq('user_id', user.id)
        .eq('game_version', gameVersion) // Filter by the selected game version
        .order('week_number', { ascending: false });

      if (error) throw error;

      // Transform the fetched data into the shape your application expects
      const transformedData = weeks.map((week): WeeklyPerformance => {
        const games = (week.game_results || []).map((game): GameResult => {
          const playerStats: PlayerPerformance[] = (game.player_performances || []).map(p => ({
            id: p.id,
            name: p.player_name,
            position: p.position,
            rating: Number(p.rating),
            goals: p.goals || 0,
            assists: p.assists || 0,
            yellowCards: p.yellow_cards || 0,
            redCards: p.red_cards || 0,
            ownGoals: 0,
            minutesPlayed: p.minutes_played || 90,
            wasSubstituted: false,
          }));

          const teamStatsData = Array.isArray(game.team_statistics) ? game.team_statistics[0] : game.team_statistics;

          const teamStats: TeamStats = teamStatsData ? {
            shots: teamStatsData.shots || 0,
            shotsOnTarget: teamStatsData.shots_on_target || 0,
            possession: teamStatsData.possession || 50,
            expectedGoals: Number(teamStatsData.expected_goals) || 0,
            actualGoals: game.user_goals || 0,
            expectedGoalsAgainst: Number(teamStatsData.expected_goals_against) || 0,
            actualGoalsAgainst: game.opponent_goals || 0,
            passes: teamStatsData.passes || 0,
            passAccuracy: teamStatsData.pass_accuracy || 0,
            corners: teamStatsData.corners || 0,
            fouls: teamStatsData.fouls || 0,
            yellowCards: teamStatsData.yellow_cards || 0,
            redCards: teamStatsData.red_cards || 0,
            distanceCovered: 0
          } : {
             shots: 0, shotsOnTarget: 0, possession: 50, expectedGoals: 0, actualGoals: game.user_goals || 0,
             expectedGoalsAgainst: 0, actualGoalsAgainst: game.opponent_goals || 0, passes: 0, passAccuracy: 0,
             corners: 0, fouls: 0, yellowCards: 0, redCards: 0, distanceCovered: 0
          };
          
          return {
            id: game.id,
            gameNumber: game.game_number,
            result: game.result as 'win' | 'loss',
            scoreLine: game.score_line,
            date: game.date_played,
            opponentSkill: game.opponent_skill,
            duration: game.duration,
            gameContext: game.game_context as any,
            comments: game.comments,
            crossPlayEnabled: game.cross_play_enabled || false,
            teamStats,
            playerStats,
            time: game.time_played,
            stressLevel: game.stress_level,
            serverQuality: game.server_quality,
            gameRating: game.game_rating,
            gameScore: game.game_score,
            tags: game.tags || []
          };
        }).sort((a, b) => a.gameNumber - b.gameNumber);

        return {
          id: week.id,
          weekNumber: week.week_number,
          customName: week.custom_name,
          startDate: week.start_date,
          endDate: week.end_date || '',
          games: games,
          totalWins: week.total_wins || 0,
          totalLosses: week.total_losses || 0,
          totalGoals: week.total_goals || 0,
          totalConceded: week.total_conceded || 0,
          totalExpectedGoals: Number(week.total_expected_goals) || 0,
          totalExpectedGoalsAgainst: Number(week.total_expected_goals_against) || 0,
          averageOpponentSkill: Number(week.average_opponent_skill) || 0,
          squadUsed: week.squad_used || '',
          weeklyRating: Number(week.weekly_rating) || 0,
          isCompleted: week.is_completed || false,
          bestStreak: week.best_streak || 0,
          worstStreak: week.worst_streak || 0,
          currentStreak: week.current_streak || 0,
          gamesPlayed: games.length,
          weekScore: week.week_score || 0,
          totalPlayTime: week.total_play_time || 0,
          averageGameDuration: Number(week.average_game_duration) || 0,
          winTarget: {
            wins: week.target_wins || 10,
            goalsScored: week.target_goals,
            cleanSheets: week.target_clean_sheets,
            minimumRank: week.minimum_rank
          }
        };
      });
      
      setWeeklyData(transformedData);

    } catch (error) {
      console.error('Error fetching weekly data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, gameVersion]);


  const saveGame = async (weekId: string, gameData: Omit<GameResult, 'id'>) => {
    if (!user) return;

    try {
      const { data: game, error } = await supabase
        .from('game_results')
        .insert({
          user_id: user.id,
          week_id: weekId,
          game_number: gameData.gameNumber,
          result: gameData.result,
          score_line: gameData.scoreLine,
          opponent_skill: gameData.opponentSkill,
          duration: gameData.duration,
          game_context: gameData.gameContext,
          comments: gameData.comments,
          cross_play_enabled: gameData.crossPlayEnabled,
          user_goals: parseInt(gameData.scoreLine.split('-')[0]),
          opponent_goals: parseInt(gameData.scoreLine.split('-')[1]),
          opponent_xg: gameData.teamStats?.expectedGoalsAgainst || 1.0,
          date_played: gameData.date,
          time_played: gameData.time,
          stress_level: gameData.stressLevel,
          server_quality: gameData.serverQuality,
          tags: gameData.tags || [],
          game_version: gameVersion // Add game version on save
        })
        .select()
        .single();

      if (error) throw error;

      // Save related stats...
      if (gameData.teamStats) {
        await supabase.from('team_statistics').insert({ ...gameData.teamStats, user_id: user.id, game_id: game.id });
      }
      if (gameData.playerStats && gameData.playerStats.length > 0) {
        const perfs = gameData.playerStats.map(p => ({ ...p, user_id: user.id, game_id: game.id, player_name: p.name, rating: p.rating }));
        await supabase.from('player_performances').insert(perfs);
      }

      await fetchWeeklyData(); // Refresh all data
    } catch (error) {
      console.error('Error saving game:', error);
      throw error;
    }
  };

  const createWeek = async (weekData: Partial<WeeklyPerformance>) => {
    if (!user) return null;
    try {
      const { data: week, error } = await supabase
        .from('weekly_performances')
        .insert({
          user_id: user.id,
          week_number: weekData.weekNumber || 1,
          custom_name: weekData.customName,
          start_date: weekData.startDate || new Date().toISOString(),
          target_wins: weekData.winTarget?.wins || 10,
          game_version: gameVersion // Add game version on create
        })
        .select()
        .single();
      if (error) throw error;
      await fetchWeeklyData();
      return week;
    } catch (error) {
      console.error('Error creating week:', error);
      throw error;
    }
  };

  const updateWeek = async (weekId: string, updates: Partial<WeeklyPerformance>) => {
     if (!user) return;
    try {
        await supabase
        .from('weekly_performances')
        .update({
          custom_name: updates.customName,
          target_wins: updates.winTarget?.wins,
          is_completed: updates.isCompleted,
          end_date: updates.isCompleted ? new Date().toISOString() : null,
        })
        .eq('id', weekId);
        await fetchWeeklyData();
    } catch(error) {
        console.error('Error updating week', error)
    }
  };
  
  const updateGame = async (gameId: string, gameData: Partial<GameResult>) => {
    if (!user) return;
    try {
        const { error } = await supabase
        .from('game_results')
        .update({
            result: gameData.result,
            score_line: gameData.scoreLine,
            opponent_skill: gameData.opponentSkill,
        })
        .eq('id', gameId);
        if (error) throw error;
        await fetchWeeklyData();
    } catch (error) {
        console.error('Error updating game', error);
    }
  };

  const deleteWeek = async (weekId: string) => {
    if (!user) return;
    try {
      // Supabase cascade delete should handle related games, etc.
      await supabase.from('weekly_performances').delete().eq('id', weekId);
      await fetchWeeklyData();
    } catch (error) {
      console.error('Error deleting week', error);
    }
  };

  const endWeek = async (weekId: string) => {
    await updateWeek(weekId, { isCompleted: true });
  };
  
  useEffect(() => {
    fetchWeeklyData();
  }, [user, gameVersion, fetchWeeklyData]);

  const getCurrentWeek = (): WeeklyPerformance | null => {
    return weeklyData.find(week => !week.isCompleted) || null;
  };

  return {
    weeklyData,
    loading,
    saveGame,
    createWeek,
    updateWeek,
    updateGame,
    deleteWeek,
    endWeek,
    getCurrentWeek,
    refreshData: fetchWeeklyData
  };
}

