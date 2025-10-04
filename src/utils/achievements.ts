import { supabase } from "@/integrations/supabase/client";
import type { GameResult, WeeklyPerformance } from "@/types/futChampions";

// --- METRIC CALCULATION ---
// Calculates various statistics from all of the user's game data.
const calculateMetrics = (allGames: GameResult[]) => {
  let totalWins = 0;
  let totalGoals = 0;
  let totalCleanSheets = 0;
  let currentStreak = 0;
  let longestWinStreak = 0;
  let tempStreak = 0;

  allGames.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  allGames.forEach(game => {
    const [userScore, oppScore] = game.scoreLine.split('-').map(Number);

    if (game.result === 'win') {
      totalWins++;
      tempStreak++;
    } else {
      if (tempStreak > longestWinStreak) {
        longestWinStreak = tempStreak;
      }
      tempStreak = 0;
    }

    totalGoals += userScore;
    if (oppScore === 0) {
      totalCleanSheets++;
    }
  });

  if (tempStreak > longestWinStreak) {
    longestWinStreak = tempStreak;
  }
  currentStreak = tempStreak;

  return {
    total_games: allGames.length,
    total_wins: totalWins,
    total_goals: totalGoals,
    total_clean_sheets: totalCleanSheets,
    longest_win_streak: longestWinStreak,
    current_win_streak: currentStreak,
  };
};

// --- ACHIEVEMENT PROCESSING ---
export const processAchievements = async (userId: string, gameVersion: string) => {
  // 1. Fetch all necessary data in parallel
  const [definitionsRes, userAchievementsRes, performancesRes] = await Promise.all([
    supabase.from('achievement_definitions').select('*').eq('game_version', gameVersion),
    supabase.from('user_achievements').select('*').eq('user_id', userId),
    supabase.from('weekly_performances').select('games').eq('user_id', userId).eq('game_version', gameVersion)
  ]);

  const { data: definitions, error: defError } = definitionsRes;
  const { data: userAchievements, error: userAchError } = userAchievementsRes;
  const { data: performances, error: perfError } = performancesRes;

  if (defError || userAchError || perfError || !definitions || !userAchievements || !performances) {
    console.error("Error fetching data for achievement processing:", defError || userAchError || perfError);
    return;
  }

  // 2. Aggregate all games and calculate metrics
  const allGames: GameResult[] = performances.flatMap(p => p.games || []);
  if (allGames.length === 0) return; // No games to process

  const metrics = calculateMetrics(allGames);
  const userAchievementsMap = new Map(userAchievements.map(a => [a.achievement_id, a]));
  const achievementsToUpdate = [];
  const newAchievementsToInsert = [];

  // 3. Iterate through each achievement definition to check progress
  for (const definition of definitions) {
    const userAchievement = userAchievementsMap.get(definition.id);

    // Skip if already unlocked
    if (userAchievement?.unlocked_at) {
      continue;
    }

    const metric = definition.conditions.metric as keyof typeof metrics;
    const target = definition.conditions.target;
    const currentProgress = metrics[metric] || 0;

    if (currentProgress >= target) {
      // Achievement unlocked!
      const achievementRecord = {
        user_id: userId,
        achievement_id: definition.id,
        progress: { current: target, target: target },
        unlocked_at: new Date().toISOString(),
      };
      if (userAchievement) {
        achievementsToUpdate.push(achievementRecord);
      } else {
        newAchievementsToInsert.push(achievementRecord);
      }
    } else {
      // Update progress if not yet unlocked
      const achievementRecord = {
        user_id: userId,
        achievement_id: definition.id,
        progress: { current: currentProgress, target: target },
        unlocked_at: null,
      };
      if (userAchievement) {
        // Only update if progress has changed
        if (userAchievement.progress?.current !== currentProgress) {
            achievementsToUpdate.push(achievementRecord);
        }
      } else {
        newAchievementsToInsert.push(achievementRecord);
      }
    }
  }

  // 4. Batch update/insert records in the database
  if (achievementsToUpdate.length > 0) {
    await supabase.from('user_achievements').upsert(achievementsToUpdate, { onConflict: 'user_id,achievement_id' });
  }
  if (newAchievementsToInsert.length > 0) {
    await supabase.from('user_achievements').insert(newAchievementsToInsert);
  }
};
