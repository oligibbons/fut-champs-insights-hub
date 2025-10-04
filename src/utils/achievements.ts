import { supabase } from "@/integrations/supabase/client";
import type { GameResult } from "@/types/futChampions";

// --- METRIC CALCULATION ---
// Calculates a comprehensive set of statistics from all of the user's game data.
const calculateMetrics = (allGames: GameResult[]) => {
  let totalWins = 0;
  let totalGoals = 0;
  let totalCleanSheets = 0;
  let longestWinStreak = 0;
  let tempStreak = 0;

  // Ensure games are processed in chronological order
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
      tempStreak = 0; // Reset streak on loss
    }

    totalGoals += userScore;
    if (oppScore === 0) {
      totalCleanSheets++;
    }
  });

  // Final check in case the streak is ongoing
  if (tempStreak > longestWinStreak) {
    longestWinStreak = tempStreak;
  }

  return {
    total_games: allGames.length,
    total_wins: totalWins,
    total_goals: totalGoals,
    total_clean_sheets: totalCleanSheets,
    longest_win_streak: longestWinStreak,
    current_win_streak: tempStreak, // The current ongoing streak
  };
};

// --- ACHIEVEMENT PROCESSING ---
export const processAchievements = async (userId: string, gameVersion: string) => {
  // 1. Fetch all necessary data in parallel for efficiency
  const [definitionsRes, userAchievementsRes, performancesRes] = await Promise.all([
    supabase.from('achievement_definitions').select('*').eq('game_version', gameVersion),
    supabase.from('user_achievements').select('achievement_id, progress, unlocked_at').eq('user_id', userId),
    supabase.from('weekly_performances').select('games').eq('user_id', userId).eq('game_version', gameVersion)
  ]);

  const { data: definitions, error: defError } = definitionsRes;
  const { data: userAchievements, error: userAchError } = userAchievementsRes;
  const { data: performances, error: perfError } = performancesRes;

  if (defError || userAchError || perfError || !definitions) {
    console.error("Error fetching data for achievement processing:", defError || userAchError || perfError);
    return [];
  }

  // 2. Aggregate all games from all weeks and calculate metrics
  const allGames: GameResult[] = performances?.flatMap(p => p.games || []) || [];
  if (allGames.length === 0) return []; // No games to process

  const metrics = calculateMetrics(allGames);
  const userAchievementsMap = new Map(userAchievements?.map(a => [a.achievement_id, a]));
  const achievementsToUpdate = [];
  const newAchievementsToInsert = [];
  const newlyUnlocked: string[] = [];

  // 3. Iterate through each achievement definition to check progress
  for (const definition of definitions) {
    const userAchievement = userAchievementsMap.get(definition.id);
    const isAlreadyUnlocked = !!userAchievement?.unlocked_at;

    // Skip if already unlocked
    if (isAlreadyUnlocked) {
      continue;
    }

    const metric = definition.conditions.metric as keyof typeof metrics;
    const target = definition.conditions.target;
    const currentProgress = metrics[metric] || 0;

    const achievementRecord = {
      user_id: userId,
      achievement_id: definition.id,
      progress: { current: currentProgress, target: target },
      unlocked_at: null as string | null,
    };

    if (currentProgress >= target) {
      // Achievement is now unlocked!
      achievementRecord.unlocked_at = new Date().toISOString();
      newlyUnlocked.push(definition.title); // Track for notification
    }

    if (userAchievement) {
      // Only update if progress has changed or it's newly unlocked
      if (userAchievement.progress?.current !== currentProgress || achievementRecord.unlocked_at) {
        achievementsToUpdate.push(achievementRecord);
      }
    } else {
      // This is a new achievement for the user, so insert it
      newAchievementsToInsert.push(achievementRecord);
    }
  }

  // 4. Batch update/insert records in the database
  if (achievementsToUpdate.length > 0) {
    await supabase.from('user_achievements').upsert(achievementsToUpdate, { onConflict: 'user_id,achievement_id' });
  }
  if (newAchievementsToInsert.length > 0) {
    await supabase.from('user_achievements').insert(newAchievementsToInsert);
  }
  
  return newlyUnlocked;
};
