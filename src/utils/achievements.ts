
import { Achievement, WeeklyPerformance, GameResult } from '@/types/futChampions';

export const ACHIEVEMENTS: Achievement[] = [
  // Win-based achievements
  { id: 'first_win', title: 'First Victory', description: 'Win your first game', icon: '🏆', category: 'wins', target: 1, rarity: 'common' },
  { id: 'win_streak_3', title: 'Hat-trick of Wins', description: 'Win 3 games in a row', icon: '🔥', category: 'streaks', target: 3, rarity: 'common' },
  { id: 'win_streak_5', title: 'Unstoppable', description: 'Win 5 games in a row', icon: '⚡', category: 'streaks', target: 5, rarity: 'rare' },
  { id: 'win_streak_10', title: 'Legend Mode', description: 'Win 10 games in a row', icon: '👑', category: 'streaks', target: 10, rarity: 'legendary' },
  { id: 'perfect_week', title: 'Perfect Weekend', description: 'Win all 15 games in a week', icon: '💎', category: 'wins', target: 15, rarity: 'mythic' },
  { id: 'rank_1', title: 'Elite Champion', description: 'Achieve Rank I', icon: '🥇', category: 'wins', target: 15, rarity: 'legendary' },
  
  // Goal-based achievements
  { id: 'first_goal', title: 'Off the Mark', description: 'Score your first goal', icon: '⚽', category: 'goals', target: 1, rarity: 'common' },
  { id: 'hat_trick', title: 'Hat-trick Hero', description: 'Score 3 goals in one game', icon: '🎩', category: 'goals', target: 3, rarity: 'rare' },
  { id: 'goal_machine_10', title: 'Goal Machine', description: 'Score 10 goals in one week', icon: '🚀', category: 'goals', target: 10, rarity: 'rare' },
  { id: 'goal_machine_25', title: 'Scoring Sensation', description: 'Score 25 goals in one week', icon: '💥', category: 'goals', target: 25, rarity: 'epic' },
  { id: 'century_goals', title: 'Century Maker', description: 'Score 100 career goals', icon: '💯', category: 'milestone', target: 100, rarity: 'epic' },
  
  // Performance achievements
  { id: 'clean_sheet_master', title: 'Defensive Wall', description: 'Keep 5 clean sheets in a week', icon: '🛡️', category: 'performance', target: 5, rarity: 'rare' },
  { id: 'assist_king', title: 'Playmaker', description: 'Get 10 assists in one week', icon: '🎯', category: 'performance', target: 10, rarity: 'rare' },
  { id: 'high_scorer', title: 'Perfectionist', description: 'Get a 9.0+ average rating in a week', icon: '⭐', category: 'performance', target: 9, rarity: 'epic' },
  
  // Special achievements
  { id: 'comeback_king', title: 'Comeback King', description: 'Win after being 2+ goals down', icon: '🔄', category: 'special', target: 1, rarity: 'rare' },
  { id: 'penalty_specialist', title: 'Penalty Specialist', description: 'Win 3 penalty shootouts', icon: '🥅', category: 'special', target: 3, rarity: 'rare' },
  { id: 'ragequit_victim', title: 'Rage Inducer', description: 'Make 5 opponents rage quit', icon: '😤', category: 'special', target: 5, rarity: 'rare' },
  { id: 'stress_master', title: 'Ice Cool', description: 'Maintain stress level below 3 for a full week', icon: '🧊', category: 'performance', target: 1, rarity: 'epic' },
  
  // Consistency achievements
  { id: 'consistent_performer', title: 'Mr. Reliable', description: 'Score in 10 consecutive games', icon: '📈', category: 'consistency', target: 10, rarity: 'epic' },
  { id: 'rating_consistency', title: 'Steady Eddie', description: 'Get 7.0+ rating in 15 consecutive games', icon: '🎖️', category: 'consistency', target: 15, rarity: 'legendary' },
  
  // Milestone achievements
  { id: 'games_50', title: 'Veteran', description: 'Play 50 games', icon: '🎮', category: 'milestone', target: 50, rarity: 'common' },
  { id: 'games_100', title: 'Centurion', description: 'Play 100 games', icon: '🏅', category: 'milestone', target: 100, rarity: 'rare' },
  { id: 'games_500', title: 'Legend', description: 'Play 500 games', icon: '👑', category: 'milestone', target: 500, rarity: 'legendary' },
  { id: 'weeks_10', title: 'Dedicated', description: 'Complete 10 weeks', icon: '📅', category: 'milestone', target: 10, rarity: 'rare' },
  { id: 'weeks_50', title: 'Addicted', description: 'Complete 50 weeks', icon: '🗓️', category: 'milestone', target: 50, rarity: 'epic' },
  
  // Advanced achievements
  { id: 'xg_overperformer', title: 'Clinical Finisher', description: 'Outperform XG by 50% in a week', icon: '🎯', category: 'performance', target: 1, rarity: 'epic' },
  { id: 'possession_master', title: 'Ball Hog', description: 'Average 70%+ possession for a week', icon: '⚽', category: 'performance', target: 1, rarity: 'rare' },
  { id: 'high_intensity', title: 'High Octane', description: 'Average 20+ shots per game for a week', icon: '💨', category: 'performance', target: 1, rarity: 'rare' }
];

export function checkAchievements(weeklyData: WeeklyPerformance[], currentWeek: WeeklyPerformance | null): Achievement[] {
  const unlockedAchievements: Achievement[] = [];
  
  // Calculate stats
  const totalGames = weeklyData.reduce((sum, week) => sum + week.games.length, 0);
  const totalWins = weeklyData.reduce((sum, week) => sum + week.totalWins, 0);
  const totalGoals = weeklyData.reduce((sum, week) => sum + week.totalGoals, 0);
  
  // Check each achievement
  ACHIEVEMENTS.forEach(achievement => {
    const progress = calculateAchievementProgress(achievement, weeklyData, currentWeek);
    if (progress >= achievement.target! && !achievement.unlockedAt) {
      unlockedAchievements.push({
        ...achievement,
        unlockedAt: new Date().toISOString(),
        progress: achievement.target
      });
    }
  });
  
  return unlockedAchievements;
}

export function calculateAchievementProgress(achievement: Achievement, weeklyData: WeeklyPerformance[], currentWeek: WeeklyPerformance | null): number {
  const allGames = weeklyData.flatMap(week => week.games);
  
  switch (achievement.id) {
    case 'first_win':
      return weeklyData.reduce((sum, week) => sum + week.totalWins, 0) > 0 ? 1 : 0;
    
    case 'perfect_week':
      return weeklyData.some(week => week.totalWins === 15 && week.isCompleted) ? 1 : 0;
    
    case 'century_goals':
      return weeklyData.reduce((sum, week) => sum + week.totalGoals, 0);
    
    case 'games_50':
    case 'games_100':
    case 'games_500':
      return allGames.length;
    
    case 'weeks_10':
    case 'weeks_50':
      return weeklyData.filter(week => week.isCompleted).length;
    
    case 'win_streak_3':
    case 'win_streak_5':
    case 'win_streak_10':
      return calculateWinStreak(allGames);
    
    default:
      return 0;
  }
}

function calculateWinStreak(games: GameResult[]): number {
  let maxStreak = 0;
  let currentStreak = 0;
  
  games.forEach(game => {
    if (game.result === 'win') {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  });
  
  return maxStreak;
}
