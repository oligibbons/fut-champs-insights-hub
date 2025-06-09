import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { WeeklyPerformance, GameResult, PlayerPerformance, TeamStats } from '@/types/futChampions';

export function useSupabaseData() {
  const { user } = useAuth();
  const [weeklyData, setWeeklyData] = useState<WeeklyPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch weekly performances from Supabase
  const fetchWeeklyData = async () => {
    if (!user) {
      setWeeklyData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data: weeks, error } = await supabase
        .from('weekly_performances')
        .select('*')
        .eq('user_id', user.id)
        .order('week_number', { ascending: true });

      if (error) throw error;

      // Fetch games for each week
      const weeklyDataWithGames = await Promise.all(
        (weeks || []).map(async (week) => {
          const { data: games, error: gamesError } = await supabase
            .from('game_results')
            .select('*')
            .eq('week_id', week.id)
            .order('game_number', { ascending: true });

          if (gamesError) throw gamesError;

          // Fetch player performances for each game
          const transformedGames: GameResult[] = await Promise.all(
            (games || []).map(async (game) => {
              const { data: playerPerfs, error: playerError } = await supabase
                .from('player_performances')
                .select('*')
                .eq('game_id', game.id);

              if (playerError) console.error('Error fetching player performances:', playerError);

              const { data: teamStatsData, error: teamError } = await supabase
                .from('team_statistics')
                .select('*')
                .eq('game_id', game.id)
                .single();

              if (teamError && teamError.code !== 'PGRST116') {
                console.error('Error fetching team stats:', teamError);
              }

              const playerStats: PlayerPerformance[] = (playerPerfs || []).map(perf => ({
                id: perf.id,
                name: perf.player_name,
                position: perf.position,
                rating: Number(perf.rating),
                goals: perf.goals || 0,
                assists: perf.assists || 0,
                yellowCards: perf.yellow_cards || 0,
                redCards: perf.red_cards || 0,
                ownGoals: 0,
                minutesPlayed: perf.minutes_played || 90,
                wasSubstituted: false
              }));

              const teamStats: TeamStats = teamStatsData ? {
                shots: teamStatsData.shots || 10,
                shotsOnTarget: teamStatsData.shots_on_target || 5,
                possession: teamStatsData.possession || 50,
                expectedGoals: Number(teamStatsData.expected_goals) || 1.5,
                actualGoals: game.user_goals || 0,
                expectedGoalsAgainst: Number(teamStatsData.expected_goals_against) || 1.0,
                actualGoalsAgainst: game.opponent_goals || 0,
                passes: teamStatsData.passes || 100,
                passAccuracy: teamStatsData.pass_accuracy || 75,
                corners: teamStatsData.corners || 3,
                fouls: teamStatsData.fouls || 8,
                yellowCards: teamStatsData.yellow_cards || 1,
                redCards: teamStatsData.red_cards || 0,
                distanceCovered: 0
              } : {
                shots: 10,
                shotsOnTarget: 5,
                possession: 50,
                expectedGoals: 1.5,
                actualGoals: game.user_goals || 0,
                expectedGoalsAgainst: 1.0,
                actualGoalsAgainst: game.opponent_goals || 0,
                passes: 100,
                passAccuracy: 75,
                corners: 3,
                fouls: 8,
                yellowCards: 1,
                redCards: 0,
                distanceCovered: 0
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
                gameScore: game.game_score
              } as GameResult;
            })
          );

          // Calculate week statistics from games
          const totalWins = transformedGames.filter(g => g.result === 'win').length;
          const totalLosses = transformedGames.filter(g => g.result === 'loss').length;
          const totalGoals = transformedGames.reduce((sum, g) => {
            const [goals] = g.scoreLine.split('-').map(Number);
            return sum + goals;
          }, 0);
          const totalConceded = transformedGames.reduce((sum, g) => {
            const [, goals] = g.scoreLine.split('-').map(Number);
            return sum + goals;
          }, 0);
          const totalExpectedGoals = transformedGames.reduce((sum, g) => sum + (g.teamStats?.expectedGoals || 0), 0);
          const totalExpectedGoalsAgainst = transformedGames.reduce((sum, g) => sum + (g.teamStats?.expectedGoalsAgainst || 0), 0);
          const averageOpponentSkill = transformedGames.length > 0 ? 
            transformedGames.reduce((sum, g) => sum + g.opponentSkill, 0) / transformedGames.length : 0;

          // Calculate streaks
          let currentStreak = 0;
          let bestStreak = 0;
          let worstStreak = 0;
          let tempWinStreak = 0;
          let tempLossStreak = 0;

          for (const game of transformedGames) {
            if (game.result === 'win') {
              tempWinStreak++;
              tempLossStreak = 0;
              bestStreak = Math.max(bestStreak, tempWinStreak);
            } else {
              tempLossStreak++;
              tempWinStreak = 0;
              worstStreak = Math.max(worstStreak, tempLossStreak);
            }
          }

          // Current streak is based on the last few games
          if (transformedGames.length > 0) {
            const lastGame = transformedGames[transformedGames.length - 1];
            if (lastGame.result === 'win') {
              for (let i = transformedGames.length - 1; i >= 0; i--) {
                if (transformedGames[i].result === 'win') {
                  currentStreak++;
                } else {
                  break;
                }
              }
            } else {
              for (let i = transformedGames.length - 1; i >= 0; i--) {
                if (transformedGames[i].result === 'loss') {
                  currentStreak--;
                } else {
                  break;
                }
              }
            }
          }

          // Update week totals in database
          await supabase
            .from('weekly_performances')
            .update({
              total_wins: totalWins,
              total_losses: totalLosses,
              total_goals: totalGoals,
              total_conceded: totalConceded,
              total_expected_goals: totalExpectedGoals,
              total_expected_goals_against: totalExpectedGoalsAgainst,
              average_opponent_skill: averageOpponentSkill,
              best_streak: bestStreak,
              worst_streak: worstStreak,
              current_streak: currentStreak
            })
            .eq('id', week.id);

          // Auto-complete week if 15 games are played
          if (transformedGames.length >= 15 && !week.is_completed) {
            await supabase
              .from('weekly_performances')
              .update({
                is_completed: true,
                end_date: new Date().toISOString()
              })
              .eq('id', week.id);
          }

          return {
            id: week.id,
            weekNumber: week.week_number,
            customName: week.custom_name,
            startDate: week.start_date,
            endDate: week.end_date || '',
            games: transformedGames,
            totalWins,
            totalLosses,
            totalGoals,
            totalConceded,
            totalExpectedGoals,
            totalExpectedGoalsAgainst,
            averageOpponentSkill,
            squadUsed: week.squad_used || '',
            weeklyRating: Number(week.weekly_rating) || 0,
            isCompleted: week.is_completed || transformedGames.length >= 15,
            bestStreak,
            worstStreak,
            currentStreak,
            gamesPlayed: transformedGames.length,
            weekScore: week.week_score || 0,
            totalPlayTime: week.total_play_time || 0,
            averageGameDuration: transformedGames.length > 0 ? 
              transformedGames.reduce((sum, g) => sum + g.duration, 0) / transformedGames.length : 0,
            winTarget: {
              wins: week.target_wins || 10,
              goalsScored: week.target_goals,
              cleanSheets: week.target_clean_sheets,
              minimumRank: week.minimum_rank
            }
          } as WeeklyPerformance;
        })
      );

      setWeeklyData(weeklyDataWithGames);
    } catch (error) {
      console.error('Error fetching weekly data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save new game to Supabase
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
          server_quality: gameData.serverQuality
        })
        .select()
        .single();

      if (error) throw error;

      // Save team statistics
      if (gameData.teamStats) {
        await supabase
          .from('team_statistics')
          .insert({
            user_id: user.id,
            game_id: game.id,
            possession: gameData.teamStats.possession,
            passes: gameData.teamStats.passes,
            pass_accuracy: gameData.teamStats.passAccuracy,
            shots: gameData.teamStats.shots,
            shots_on_target: gameData.teamStats.shotsOnTarget,
            corners: gameData.teamStats.corners,
            fouls: gameData.teamStats.fouls,
            yellow_cards: gameData.teamStats.yellowCards,
            red_cards: gameData.teamStats.redCards,
            expected_goals: gameData.teamStats.expectedGoals,
            expected_goals_against: gameData.teamStats.expectedGoalsAgainst
          });
      }

      // Save player performances
      if (gameData.playerStats && gameData.playerStats.length > 0) {
        const playerPerformances = gameData.playerStats.map(player => ({
          user_id: user.id,
          game_id: game.id,
          player_name: player.name,
          position: player.position,
          minutes_played: player.minutesPlayed,
          goals: player.goals,
          assists: player.assists,
          rating: player.rating,
          yellow_cards: player.yellowCards,
          red_cards: player.redCards
        }));

        await supabase
          .from('player_performances')
          .insert(playerPerformances);
      }

      // Refresh data to ensure consistency
      await fetchWeeklyData();
    } catch (error) {
      console.error('Error saving game:', error);
      throw error;
    }
  };

  // Create new week
  const createWeek = async (weekData: Partial<WeeklyPerformance>) => {
    if (!user) return;

    try {
      const { data: week, error } = await supabase
        .from('weekly_performances')
        .insert({
          user_id: user.id,
          week_number: weekData.weekNumber || 1,
          custom_name: weekData.customName,
          start_date: weekData.startDate || new Date().toISOString(),
          target_wins: weekData.winTarget?.wins || 10,
          target_goals: weekData.winTarget?.goalsScored,
          target_clean_sheets: weekData.winTarget?.cleanSheets,
          minimum_rank: weekData.winTarget?.minimumRank
        })
        .select()
        .single();

      if (error) throw error;

      await fetchWeeklyData(); // Refresh data
      return week;
    } catch (error) {
      console.error('Error creating week:', error);
      throw error;
    }
  };

  // Update week
  const updateWeek = async (weekId: string, updates: Partial<WeeklyPerformance>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('weekly_performances')
        .update({
          custom_name: updates.customName,
          target_wins: updates.winTarget?.wins,
          target_goals: updates.winTarget?.goalsScored,
          target_clean_sheets: updates.winTarget?.cleanSheets,
          minimum_rank: updates.winTarget?.minimumRank,
          is_completed: updates.isCompleted,
          end_date: updates.isCompleted ? new Date().toISOString() : null,
          total_wins: updates.totalWins,
          total_losses: updates.totalLosses,
          total_goals: updates.totalGoals,
          total_conceded: updates.totalConceded
        })
        .eq('id', weekId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchWeeklyData(); // Refresh data
    } catch (error) {
      console.error('Error updating week:', error);
      throw error;
    }
  };

  // Update game
  const updateGame = async (gameId: string, gameData: Partial<GameResult>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('game_results')
        .update({
          result: gameData.result,
          score_line: gameData.scoreLine,
          opponent_skill: gameData.opponentSkill,
          duration: gameData.duration,
          user_goals: gameData.scoreLine ? parseInt(gameData.scoreLine.split('-')[0]) : undefined,
          opponent_goals: gameData.scoreLine ? parseInt(gameData.scoreLine.split('-')[1]) : undefined,
          opponent_xg: gameData.teamStats?.expectedGoalsAgainst,
          stress_level: gameData.stressLevel,
          server_quality: gameData.serverQuality,
          time_played: gameData.time
        })
        .eq('id', gameId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update team stats if provided
      if (gameData.teamStats) {
        await supabase
          .from('team_statistics')
          .update({
            possession: gameData.teamStats.possession,
            passes: gameData.teamStats.passes,
            pass_accuracy: gameData.teamStats.passAccuracy,
            shots: gameData.teamStats.shots,
            shots_on_target: gameData.teamStats.shotsOnTarget,
            corners: gameData.teamStats.corners,
            fouls: gameData.teamStats.fouls,
            yellow_cards: gameData.teamStats.yellowCards,
            red_cards: gameData.teamStats.redCards,
            expected_goals: gameData.teamStats.expectedGoals,
            expected_goals_against: gameData.teamStats.expectedGoalsAgainst
          })
          .eq('game_id', gameId);
      }

      // Update player stats if provided
      if (gameData.playerStats && gameData.playerStats.length > 0) {
        // First delete existing player stats
        await supabase
          .from('player_performances')
          .delete()
          .eq('game_id', gameId);

        // Then insert new ones
        const playerPerformances = gameData.playerStats.map(player => ({
          user_id: user.id,
          game_id: gameId,
          player_name: player.name,
          position: player.position,
          minutes_played: player.minutesPlayed,
          goals: player.goals,
          assists: player.assists,
          rating: player.rating,
          yellow_cards: player.yellowCards,
          red_cards: player.redCards
        }));

        await supabase
          .from('player_performances')
          .insert(playerPerformances);
      }

      await fetchWeeklyData(); // Refresh data
    } catch (error) {
      console.error('Error updating game:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchWeeklyData();
  }, [user]);

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
    getCurrentWeek,
    refreshData: fetchWeeklyData
  };
}