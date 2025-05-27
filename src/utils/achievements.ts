
import { Achievement, WeeklyPerformance, GameResult } from '@/types/futChampions';

export const ACHIEVEMENTS: Achievement[] = [
  // Basic Win Achievements
  { id: 'first_win', title: 'First Victory', description: 'Win your first game', icon: '🏆', category: 'wins', target: 1, rarity: 'common' },
  { id: 'wins_5', title: 'Getting Started', description: 'Win 5 games', icon: '🎯', category: 'wins', target: 5, rarity: 'common' },
  { id: 'wins_10', title: 'Double Digits', description: 'Win 10 games', icon: '🔟', category: 'wins', target: 10, rarity: 'common' },
  { id: 'wins_25', title: 'Quarter Century', description: 'Win 25 games', icon: '🥈', category: 'wins', target: 25, rarity: 'rare' },
  { id: 'wins_50', title: 'Half Century', description: 'Win 50 games', icon: '🥇', category: 'wins', target: 50, rarity: 'rare' },
  { id: 'wins_100', title: 'Centurion', description: 'Win 100 games', icon: '💯', category: 'wins', target: 100, rarity: 'epic' },
  { id: 'wins_250', title: 'Elite Status', description: 'Win 250 games', icon: '👑', category: 'wins', target: 250, rarity: 'legendary' },
  { id: 'wins_500', title: 'Legend', description: 'Win 500 games', icon: '🌟', category: 'wins', target: 500, rarity: 'mythic' },

  // Win Streak Achievements
  { id: 'win_streak_3', title: 'Hat-trick of Wins', description: 'Win 3 games in a row', icon: '🔥', category: 'streaks', target: 3, rarity: 'common' },
  { id: 'win_streak_5', title: 'Hot Streak', description: 'Win 5 games in a row', icon: '⚡', category: 'streaks', target: 5, rarity: 'rare' },
  { id: 'win_streak_7', title: 'Magnificent Seven', description: 'Win 7 games in a row', icon: '🌟', category: 'streaks', target: 7, rarity: 'rare' },
  { id: 'win_streak_10', title: 'Perfect Ten', description: 'Win 10 games in a row', icon: '💎', category: 'streaks', target: 10, rarity: 'epic' },
  { id: 'win_streak_15', title: 'Unstoppable Force', description: 'Win 15 games in a row', icon: '🚀', category: 'streaks', target: 15, rarity: 'legendary' },
  { id: 'win_streak_20', title: 'Godlike', description: 'Win 20 games in a row', icon: '👑', category: 'streaks', target: 20, rarity: 'mythic' },

  // Weekly Achievements
  { id: 'perfect_week', title: 'Perfect Weekend', description: 'Win all 15 games in a week', icon: '💎', category: 'wins', target: 15, rarity: 'mythic' },
  { id: 'rank_1_week', title: 'Elite Champion', description: 'Achieve Rank I (15 wins)', icon: '🥇', category: 'wins', target: 15, rarity: 'legendary' },
  { id: 'rank_2_week', title: 'Almost Elite', description: 'Achieve Rank II (13 wins)', icon: '🥈', category: 'wins', target: 13, rarity: 'epic' },
  { id: 'rank_3_week', title: 'Bronze Elite', description: 'Achieve Rank III (11 wins)', icon: '🥉', category: 'wins', target: 11, rarity: 'rare' },
  { id: 'comeback_week', title: 'Comeback King', description: 'Win 11+ games after starting 0-5', icon: '🔄', category: 'special', target: 1, rarity: 'legendary' },

  // Goal Achievements
  { id: 'first_goal', title: 'Off the Mark', description: 'Score your first goal', icon: '⚽', category: 'goals', target: 1, rarity: 'common' },
  { id: 'goals_10', title: 'Into Double Digits', description: 'Score 10 goals', icon: '🔟', category: 'goals', target: 10, rarity: 'common' },
  { id: 'goals_50', title: 'Sharpshooter', description: 'Score 50 goals', icon: '🎯', category: 'goals', target: 50, rarity: 'rare' },
  { id: 'goals_100', title: 'Century Maker', description: 'Score 100 goals', icon: '💯', category: 'goals', target: 100, rarity: 'epic' },
  { id: 'goals_250', title: 'Goal Machine', description: 'Score 250 goals', icon: '🚀', category: 'goals', target: 250, rarity: 'legendary' },
  { id: 'goals_500', title: 'Legendary Scorer', description: 'Score 500 goals', icon: '👑', category: 'goals', target: 500, rarity: 'mythic' },
  { id: 'hat_trick', title: 'Hat-trick Hero', description: 'Score 3+ goals in one game', icon: '🎩', category: 'goals', target: 3, rarity: 'rare' },
  { id: 'super_hat_trick', title: 'Super Hat-trick', description: 'Score 4+ goals in one game', icon: '⚡', category: 'goals', target: 4, rarity: 'epic' },
  { id: 'perfect_hat_trick', title: 'Perfect Hat-trick', description: 'Score 5+ goals in one game', icon: '💎', category: 'goals', target: 5, rarity: 'legendary' },
  { id: 'goal_fest_week', title: 'Goal Festival', description: 'Score 30+ goals in one week', icon: '🎊', category: 'goals', target: 30, rarity: 'epic' },
  { id: 'goal_machine_week', title: 'Scoring Machine', description: 'Score 40+ goals in one week', icon: '🚀', category: 'goals', target: 40, rarity: 'legendary' },

  // Performance Achievements
  { id: 'clean_sheet', title: 'Solid Defense', description: 'Keep your first clean sheet', icon: '🛡️', category: 'performance', target: 1, rarity: 'common' },
  { id: 'clean_sheets_5', title: 'Defensive Wall', description: 'Keep 5 clean sheets', icon: '🏰', category: 'performance', target: 5, rarity: 'rare' },
  { id: 'clean_sheets_10', title: 'Fortress', description: 'Keep 10 clean sheets', icon: '🛡️', category: 'performance', target: 10, rarity: 'epic' },
  { id: 'clean_sheet_week', title: 'Weekly Fortress', description: 'Keep 5+ clean sheets in one week', icon: '🏰', category: 'performance', target: 5, rarity: 'rare' },
  { id: 'assist_master', title: 'Playmaker', description: 'Get 10 assists in one week', icon: '🎯', category: 'performance', target: 10, rarity: 'rare' },
  { id: 'assist_king', title: 'Assist King', description: 'Get 15+ assists in one week', icon: '👑', category: 'performance', target: 15, rarity: 'epic' },
  { id: 'high_scorer_game', title: 'Man of the Match', description: 'Get a 9.0+ rating in a game', icon: '⭐', category: 'performance', target: 1, rarity: 'rare' },
  { id: 'perfect_game', title: 'Perfect Performance', description: 'Get a 10.0 rating in a game', icon: '💎', category: 'performance', target: 1, rarity: 'legendary' },
  { id: 'consistent_week', title: 'Mr. Consistent', description: 'Average 8.0+ rating for a week', icon: '📊', category: 'performance', target: 1, rarity: 'epic' },

  // Special Game Context Achievements
  { id: 'comeback_master', title: 'Comeback Master', description: 'Win after being 2+ goals down', icon: '🔄', category: 'special', target: 1, rarity: 'rare' },
  { id: 'great_escape', title: 'The Great Escape', description: 'Win after being 3+ goals down', icon: '🎭', category: 'special', target: 1, rarity: 'legendary' },
  { id: 'penalty_hero', title: 'Penalty Hero', description: 'Win your first penalty shootout', icon: '🥅', category: 'special', target: 1, rarity: 'rare' },
  { id: 'penalty_specialist', title: 'Penalty Specialist', description: 'Win 5 penalty shootouts', icon: '🎯', category: 'special', target: 5, rarity: 'epic' },
  { id: 'penalty_master', title: 'Penalty Master', description: 'Win 10 penalty shootouts', icon: '👑', category: 'special', target: 10, rarity: 'legendary' },
  { id: 'extra_time_warrior', title: 'Extra Time Warrior', description: 'Win 5 games in extra time', icon: '⏰', category: 'special', target: 5, rarity: 'rare' },
  { id: 'ragequit_victim', title: 'Rage Inducer', description: 'Make 5 opponents rage quit', icon: '😤', category: 'special', target: 5, rarity: 'rare' },
  { id: 'ragequit_master', title: 'Tilt Master', description: 'Make 15 opponents rage quit', icon: '🎭', category: 'special', target: 15, rarity: 'epic' },

  // Milestone Achievements
  { id: 'games_10', title: 'Getting Experience', description: 'Play 10 games', icon: '🎮', category: 'milestone', target: 10, rarity: 'common' },
  { id: 'games_50', title: 'Veteran', description: 'Play 50 games', icon: '🏅', category: 'milestone', target: 50, rarity: 'common' },
  { id: 'games_100', title: 'Experienced', description: 'Play 100 games', icon: '🎖️', category: 'milestone', target: 100, rarity: 'rare' },
  { id: 'games_250', title: 'Seasoned Pro', description: 'Play 250 games', icon: '🏆', category: 'milestone', target: 250, rarity: 'epic' },
  { id: 'games_500', title: 'Living Legend', description: 'Play 500 games', icon: '👑', category: 'milestone', target: 500, rarity: 'legendary' },
  { id: 'games_1000', title: 'Immortal', description: 'Play 1000 games', icon: '🌟', category: 'milestone', target: 1000, rarity: 'mythic' },
  { id: 'weeks_5', title: 'Regular Player', description: 'Complete 5 weeks', icon: '📅', category: 'milestone', target: 5, rarity: 'common' },
  { id: 'weeks_10', title: 'Dedicated', description: 'Complete 10 weeks', icon: '🗓️', category: 'milestone', target: 10, rarity: 'rare' },
  { id: 'weeks_25', title: 'Long Term Commitment', description: 'Complete 25 weeks', icon: '📆', category: 'milestone', target: 25, rarity: 'epic' },
  { id: 'weeks_50', title: 'Addicted', description: 'Complete 50 weeks', icon: '🗓️', category: 'milestone', target: 50, rarity: 'legendary' },

  // Advanced Performance Achievements
  { id: 'xg_overperformer', title: 'Clinical Finisher', description: 'Outperform XG by 50% in a week', icon: '🎯', category: 'performance', target: 1, rarity: 'epic' },
  { id: 'xg_underperformer', title: 'Wasteful', description: 'Underperform XG by 50% in a week', icon: '😬', category: 'performance', target: 1, rarity: 'rare' },
  { id: 'possession_master', title: 'Ball Hog', description: 'Average 70%+ possession for a week', icon: '⚽', category: 'performance', target: 1, rarity: 'rare' },
  { id: 'shot_master', title: 'Shot Happy', description: 'Average 20+ shots per game for a week', icon: '💨', category: 'performance', target: 1, rarity: 'rare' },
  { id: 'efficient_scorer', title: 'Efficient Striker', description: 'Score with 50%+ of shots on target in a week', icon: '🎯', category: 'performance', target: 1, rarity: 'epic' },
  { id: 'defensive_rock', title: 'Defensive Rock', description: 'Concede <1 goal per game for a week', icon: '🗿', category: 'performance', target: 1, rarity: 'rare' },

  // Consistency Achievements
  { id: 'consistent_scorer', title: 'Consistent Scorer', description: 'Score in 10 consecutive games', icon: '📈', category: 'consistency', target: 10, rarity: 'epic' },
  { id: 'goal_every_game', title: 'Every Game Counts', description: 'Score in 15 consecutive games', icon: '🎯', category: 'consistency', target: 15, rarity: 'legendary' },
  { id: 'rating_consistency', title: 'Steady Eddie', description: 'Get 7.0+ rating in 15 consecutive games', icon: '🎖️', category: 'consistency', target: 15, rarity: 'legendary' },
  { id: 'week_consistency', title: 'Model of Consistency', description: 'Get 10+ wins for 5 consecutive weeks', icon: '📊', category: 'consistency', target: 5, rarity: 'legendary' },
  { id: 'no_bad_games', title: 'Never Off Form', description: 'No sub-6.0 ratings for 20 games', icon: '⭐', category: 'consistency', target: 20, rarity: 'epic' },

  // Opposition-based Achievements
  { id: 'giant_killer', title: 'Giant Killer', description: 'Beat 10 opponents rated 9+ skill', icon: '⚔️', category: 'special', target: 10, rarity: 'epic' },
  { id: 'elite_slayer', title: 'Elite Slayer', description: 'Beat 25 opponents rated 9+ skill', icon: '👑', category: 'special', target: 25, rarity: 'legendary' },
  { id: 'skill_climber', title: 'Rising Star', description: 'Face increasingly difficult opponents', icon: '📈', category: 'special', target: 1, rarity: 'rare' },
  { id: 'versatile_winner', title: 'Tactical Master', description: 'Beat opponents using all play styles', icon: '🧠', category: 'special', target: 5, rarity: 'epic' },

  // Time-based Achievements
  { id: 'early_bird', title: 'Early Bird', description: 'Win 10 games before 12 PM', icon: '🐦', category: 'special', target: 10, rarity: 'rare' },
  { id: 'night_owl', title: 'Night Owl', description: 'Win 10 games after 10 PM', icon: '🦉', category: 'special', target: 10, rarity: 'rare' },
  { id: 'weekend_warrior', title: 'Weekend Warrior', description: 'Complete 10 weekend leagues', icon: '🗡️', category: 'milestone', target: 10, rarity: 'rare' },
  { id: 'marathon_session', title: 'Marathon Runner', description: 'Play 15 games in one day', icon: '🏃', category: 'special', target: 1, rarity: 'epic' },

  // Server/Connection Achievements
  { id: 'connection_warrior', title: 'Lag Warrior', description: 'Win despite poor server quality (3/10 or lower)', icon: '📶', category: 'special', target: 5, rarity: 'rare' },
  { id: 'perfect_connection', title: 'Smooth Operator', description: 'Play 15 games with 9+ server quality', icon: '💫', category: 'special', target: 15, rarity: 'rare' },

  // Stress Management Achievements
  { id: 'zen_master', title: 'Zen Master', description: 'Keep stress level ≤3 for entire week', icon: '🧘', category: 'performance', target: 1, rarity: 'epic' },
  { id: 'pressure_cooker', title: 'Pressure Cooker', description: 'Win with stress level 9+ five times', icon: '💪', category: 'special', target: 5, rarity: 'rare' },
  { id: 'cool_under_pressure', title: 'Cool Under Pressure', description: 'Win crucial games with low stress', icon: '🧊', category: 'performance', target: 10, rarity: 'epic' }
];

export function checkAchievements(weeklyData: WeeklyPerformance[], currentWeek: WeeklyPerformance | null): Achievement[] {
  const unlockedAchievements: Achievement[] = [];
  
  // Calculate comprehensive stats
  const allGames = weeklyData.flatMap(week => week.games);
  const totalGames = allGames.length;
  const totalWins = weeklyData.reduce((sum, week) => sum + week.totalWins, 0);
  const totalGoals = weeklyData.reduce((sum, week) => sum + week.totalGoals, 0);
  const completedWeeks = weeklyData.filter(week => week.isCompleted).length;
  
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
  const totalWins = weeklyData.reduce((sum, week) => sum + week.totalWins, 0);
  const totalGoals = weeklyData.reduce((sum, week) => sum + week.totalGoals, 0);
  const completedWeeks = weeklyData.filter(week => week.isCompleted).length;
  
  switch (achievement.id) {
    // Win-based achievements
    case 'first_win':
    case 'wins_5':
    case 'wins_10':
    case 'wins_25':
    case 'wins_50':
    case 'wins_100':
    case 'wins_250':
    case 'wins_500':
      return totalWins;
    
    // Goal achievements
    case 'first_goal':
    case 'goals_10':
    case 'goals_50':
    case 'goals_100':
    case 'goals_250':
    case 'goals_500':
      return totalGoals;
    
    // Game milestone achievements
    case 'games_10':
    case 'games_50':
    case 'games_100':
    case 'games_250':
    case 'games_500':
    case 'games_1000':
      return allGames.length;
    
    // Week milestone achievements
    case 'weeks_5':
    case 'weeks_10':
    case 'weeks_25':
    case 'weeks_50':
      return completedWeeks;
    
    // Win streak achievements
    case 'win_streak_3':
    case 'win_streak_5':
    case 'win_streak_7':
    case 'win_streak_10':
    case 'win_streak_15':
    case 'win_streak_20':
      return calculateWinStreak(allGames);
    
    // Weekly performance achievements
    case 'perfect_week':
      return weeklyData.some(week => week.totalWins === 15 && week.isCompleted) ? 15 : 0;
    
    case 'rank_1_week':
      return weeklyData.some(week => week.totalWins >= 15 && week.isCompleted) ? 15 : 0;
    
    case 'rank_2_week':
      return weeklyData.some(week => week.totalWins >= 13 && week.isCompleted) ? 13 : 0;
    
    case 'rank_3_week':
      return weeklyData.some(week => week.totalWins >= 11 && week.isCompleted) ? 11 : 0;
    
    // Special achievements
    case 'hat_trick':
      return allGames.some(game => {
        const [goalsFor] = game.scoreLine.split('-').map(Number);
        return goalsFor >= 3;
      }) ? 3 : 0;
    
    case 'penalty_hero':
      return allGames.filter(game => game.penaltyShootout?.userWon).length > 0 ? 1 : 0;
    
    case 'penalty_specialist':
      return allGames.filter(game => game.penaltyShootout?.userWon).length;
    
    case 'ragequit_victim':
      return allGames.filter(game => game.gameContext === 'rage_quit').length;
    
    case 'clean_sheet':
      return allGames.filter(game => {
        const [, goalsAgainst] = game.scoreLine.split('-').map(Number);
        return goalsAgainst === 0 && game.result === 'win';
      }).length > 0 ? 1 : 0;
    
    default:
      return 0;
  }
}

function calculateWinStreak(games: GameResult[]): number {
  let maxStreak = 0;
  let currentStreak = 0;
  
  // Sort games by date to get chronological order
  const sortedGames = [...games].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  sortedGames.forEach(game => {
    if (game.result === 'win') {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  });
  
  return maxStreak;
}
