import { supabase } from "@/integrations/supabase/client";
import type { GameResult } from "@/types/futChampions";

// --- METRIC CALCULATION ---
const calculateMetrics = (allGames: GameResult[]) => {
  let totalWins = 0;
  let totalGoals = 0;
  let totalCleanSheets = 0;
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

  return {
    total_games: allGames.length,
    total_wins: totalWins,
    total_goals: totalGoals,
    total_clean_sheets: totalCleanSheets,
    longest_win_streak: longestWinStreak,
    current_win_streak: tempStreak,
  };
};

// --- ACHIEVEMENT PROCESSING ---
export const processAchievements = async (userId: string, gameVersion: string) => {
  const [definitionsRes, userAchievementsRes, performancesRes] = await Promise.all([
    supabase.from('achievement_definitions').select('*').eq('game_version', gameVersion),
    // FIX: Corrected table name from 'user_achievements' to 'achievements'
    supabase.from('achievements').select('achievement_id, progress, unlocked_at').eq('user_id', userId),
    supabase.from('weekly_performances').select('games').eq('user_id', userId).eq('game_version', gameVersion)
  ]);

  const { data: definitions, error: defError } = definitionsRes;
  const { data: userAchievements, error: userAchError } = userAchievementsRes;
  const { data: performances, error: perfError } = performancesRes;

  if (defError || userAchError || perfError || !definitions) {
    console.error("Error fetching data for achievement processing:", defError || userAchError || perfError);
    return [];
  }

  const allGames: GameResult[] = performances?.flatMap(p => p.games || []) || [];
  if (allGames.length === 0) return [];

  const metrics = calculateMetrics(allGames);
  const userAchievementsMap = new Map(userAchievements?.map(a => [a.achievement_id, a]));
  const achievementsToUpdate = [];
  const newAchievementsToInsert = [];
  const newlyUnlocked: string[] = [];

  for (const definition of definitions) {
    const userAchievement = userAchievementsMap.get(definition.id);
    const isAlreadyUnlocked = !!userAchievement?.unlocked_at;

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
      // Add other required fields from your 'achievements' table schema
      title: definition.title,
      description: definition.description,
      category: definition.category,
      rarity: definition.rarity,
      target: target,
    };

    if (currentProgress >= target) {
      achievementRecord.unlocked_at = new Date().toISOString();
      newlyUnlocked.push(definition.title);
    }

    if (userAchievement) {
      if (userAchievement.progress?.current !== currentProgress || achievementRecord.unlocked_at) {
        achievementsToUpdate.push(achievementRecord);
      }
    } else {
      newAchievementsToInsert.push(achievementRecord);
    }
  }

  if (achievementsToUpdate.length > 0) {
    // FIX: Corrected table name from 'user_achievements' to 'achievements'
    await supabase.from('achievements').upsert(achievementsToUpdate, { onConflict: 'user_id,achievement_id' });
  }
  if (newAchievementsToInsert.length > 0) {
    // FIX: Corrected table name from 'user_achievements' to 'achievements'
    await supabase.from('achievements').insert(newAchievementsToInsert);
  }
  
  return newlyUnlocked;
};
