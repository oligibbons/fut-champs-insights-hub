
import { Achievement } from '@/types/futChampions';

export const achievements: Achievement[] = [
  // Beginner Achievements
  { id: 'first-game', title: 'First Steps', description: 'Play your first FUT Champions game', category: 'games', threshold: 1, rarity: 'common', icon: '🎮', unlocked: false },
  { id: 'early-bird', title: 'Early Bird', description: 'Win your first game', category: 'wins', threshold: 1, rarity: 'common', icon: '🏆', unlocked: false },
  { id: 'hat-trick-hero', title: 'Hat-trick Hero', description: 'Score 3 goals in a single game', category: 'goals', threshold: 3, rarity: 'rare', icon: '⚽', unlocked: false },
  { id: 'clean-sheet', title: 'Clean Sheet', description: 'Keep a clean sheet', category: 'cleanSheets', threshold: 1, rarity: 'common', icon: '🛡️', unlocked: false },
  { id: 'assist-master', title: 'Assist Master', description: 'Get 5 assists in a game', category: 'assists', threshold: 5, rarity: 'epic', icon: '🎯', unlocked: false },

  // Win Streaks
  { id: 'win-streak-3', title: 'Hot Streak', description: 'Win 3 games in a row', category: 'streaks', threshold: 3, rarity: 'rare', icon: '🔥', unlocked: false },
  { id: 'win-streak-5', title: 'Unstoppable', description: 'Win 5 games in a row', category: 'streaks', threshold: 5, rarity: 'epic', icon: '⚡', unlocked: false },
  { id: 'win-streak-10', title: 'Legendary', description: 'Win 10 games in a row', category: 'streaks', threshold: 10, rarity: 'legendary', icon: '👑', unlocked: false },
  { id: 'win-streak-15', title: 'Mythical', description: 'Win 15 games in a row', category: 'streaks', threshold: 15, rarity: 'mythic', icon: '🌟', unlocked: false },

  // Game Milestones
  { id: 'veteran', title: 'Veteran', description: 'Play 50 games', category: 'games', threshold: 50, rarity: 'rare', icon: '🎖️', unlocked: false },
  { id: 'centurion', title: 'Centurion', description: 'Play 100 games', category: 'games', threshold: 100, rarity: 'epic', icon: '💯', unlocked: false },
  { id: 'marathon-runner', title: 'Marathon Runner', description: 'Play 250 games', category: 'games', threshold: 250, rarity: 'legendary', icon: '🏃', unlocked: false },
  { id: 'elite-competitor', title: 'Elite Competitor', description: 'Play 500 games', category: 'games', threshold: 500, rarity: 'mythic', icon: '🏅', unlocked: false },

  // Goal Achievements
  { id: 'goal-machine', title: 'Goal Machine', description: 'Score 100 goals', category: 'goals', threshold: 100, rarity: 'epic', icon: '⚽', unlocked: false },
  { id: 'prolific-scorer', title: 'Prolific Scorer', description: 'Score 250 goals', category: 'goals', threshold: 250, rarity: 'legendary', icon: '🎯', unlocked: false },
  { id: 'goal-legend', title: 'Goal Legend', description: 'Score 500 goals', category: 'goals', threshold: 500, rarity: 'mythic', icon: '👑', unlocked: false },

  // Win Achievements
  { id: 'winner', title: 'Winner', description: 'Win 25 games', category: 'wins', threshold: 25, rarity: 'rare', icon: '🏆', unlocked: false },
  { id: 'champion', title: 'Champion', description: 'Win 50 games', category: 'wins', threshold: 50, rarity: 'epic', icon: '🥇', unlocked: false },
  { id: 'elite-champion', title: 'Elite Champion', description: 'Win 100 games', category: 'wins', threshold: 100, rarity: 'legendary', icon: '👑', unlocked: false },
  { id: 'fut-legend', title: 'FUT Legend', description: 'Win 200 games', category: 'wins', threshold: 200, rarity: 'mythic', icon: '🌟', unlocked: false },

  // Weekly Achievements
  { id: 'perfect-week', title: 'Perfect Week', description: 'Win all 15 games in a week', category: 'weekly', threshold: 15, rarity: 'legendary', icon: '💎', unlocked: false },
  { id: 'week-warrior', title: 'Week Warrior', description: 'Complete 10 weeks', category: 'weekly', threshold: 10, rarity: 'epic', icon: '⚔️', unlocked: false },
  { id: 'consistency-king', title: 'Consistency King', description: 'Complete 25 weeks', category: 'weekly', threshold: 25, rarity: 'legendary', icon: '👑', unlocked: false },

  // Skill-based Achievements
  { id: 'defensive-wall', title: 'Defensive Wall', description: 'Keep 10 clean sheets', category: 'cleanSheets', threshold: 10, rarity: 'rare', icon: '🛡️', unlocked: false },
  { id: 'fortress', title: 'Fortress', description: 'Keep 25 clean sheets', category: 'cleanSheets', threshold: 25, rarity: 'epic', icon: '🏰', unlocked: false },
  { id: 'impenetrable', title: 'Impenetrable', description: 'Keep 50 clean sheets', category: 'cleanSheets', threshold: 50, rarity: 'legendary', icon: '⛩️', unlocked: false },

  // Creative Achievements
  { id: 'comeback-king', title: 'Comeback King', description: 'Win after being 2 goals down', category: 'special', threshold: 1, rarity: 'epic', icon: '🔄', unlocked: false },
  { id: 'giant-killer', title: 'Giant Killer', description: 'Beat an opponent rated 9+ when you\'re rated 7 or below', category: 'special', threshold: 1, rarity: 'rare', icon: '🗡️', unlocked: false },
  { id: 'david-vs-goliath', title: 'David vs Goliath', description: 'Beat 5 opponents rated 9+ when you\'re rated 7 or below', category: 'special', threshold: 5, rarity: 'legendary', icon: '🏹', unlocked: false },
  
  // Time-based Achievements
  { id: 'lightning-fast', title: 'Lightning Fast', description: 'Win a game in under 10 minutes', category: 'time', threshold: 1, rarity: 'rare', icon: '⚡', unlocked: false },
  { id: 'marathon-match', title: 'Marathon Match', description: 'Play a game longer than 30 minutes', category: 'time', threshold: 1, rarity: 'rare', icon: '⏰', unlocked: false },
  { id: 'speed-demon', title: 'Speed Demon', description: 'Win 10 games in under 15 minutes each', category: 'time', threshold: 10, rarity: 'epic', icon: '🏃‍♂️', unlocked: false },

  // Scoring Achievements
  { id: 'sharpshooter', title: 'Sharpshooter', description: 'Score 5+ goals in 10 different games', category: 'goals', threshold: 10, rarity: 'epic', icon: '🎯', unlocked: false },
  { id: 'goal-rush', title: 'Goal Rush', description: 'Score 7+ goals in a single game', category: 'goals', threshold: 7, rarity: 'legendary', icon: '🌪️', unlocked: false },
  { id: 'record-breaker', title: 'Record Breaker', description: 'Score 10+ goals in a single game', category: 'goals', threshold: 10, rarity: 'mythic', icon: '📈', unlocked: false },

  // Defensive Achievements
  { id: 'brick-wall', title: 'Brick Wall', description: 'Concede 0 goals in 5 consecutive games', category: 'defense', threshold: 5, rarity: 'epic', icon: '🧱', unlocked: false },
  { id: 'shut-out-specialist', title: 'Shut-out Specialist', description: 'Keep clean sheets in 75% of games over 20 games', category: 'defense', threshold: 15, rarity: 'legendary', icon: '🔒', unlocked: false },

  // Squad Achievements
  { id: 'squad-builder', title: 'Squad Builder', description: 'Create your first squad', category: 'squads', threshold: 1, rarity: 'common', icon: '👥', unlocked: false },
  { id: 'tactical-genius', title: 'Tactical Genius', description: 'Create 5 different squads', category: 'squads', threshold: 5, rarity: 'rare', icon: '🧠', unlocked: false },
  { id: 'formation-master', title: 'Formation Master', description: 'Try 10 different formations', category: 'formations', threshold: 10, rarity: 'epic', icon: '📐', unlocked: false },

  // Streaks and Consistency
  { id: 'consistent-performer', title: 'Consistent Performer', description: 'Play at least 1 game every day for 7 days', category: 'consistency', threshold: 7, rarity: 'rare', icon: '📅', unlocked: false },
  { id: 'daily-grinder', title: 'Daily Grinder', description: 'Play at least 1 game every day for 30 days', category: 'consistency', threshold: 30, rarity: 'legendary', icon: '⚙️', unlocked: false },
  { id: 'scoring-streak', title: 'Scoring Streak', description: 'Score in 10 consecutive games', category: 'streaks', threshold: 10, rarity: 'epic', icon: '🔥', unlocked: false },

  // Special Moments
  { id: 'last-minute-hero', title: 'Last Minute Hero', description: 'Score a winning goal in the 90th minute or later', category: 'special', threshold: 1, rarity: 'rare', icon: '⏱️', unlocked: false },
  { id: 'penalty-specialist', title: 'Penalty Specialist', description: 'Score 10 penalties without missing', category: 'special', threshold: 10, rarity: 'epic', icon: '🎯', unlocked: false },
  { id: 'free-kick-master', title: 'Free Kick Master', description: 'Score 5 free kicks', category: 'special', threshold: 5, rarity: 'rare', icon: '⚽', unlocked: false },

  // Advanced Stats
  { id: 'efficiency-expert', title: 'Efficiency Expert', description: 'Maintain 80%+ win rate over 25 games', category: 'efficiency', threshold: 20, rarity: 'legendary', icon: '📊', unlocked: false },
  { id: 'possession-master', title: 'Possession Master', description: 'Have 70%+ possession in 10 games', category: 'stats', threshold: 10, rarity: 'rare', icon: '⚽', unlocked: false },
  { id: 'clinical-finisher', title: 'Clinical Finisher', description: 'Score with 50%+ shot accuracy over 20 games', category: 'efficiency', threshold: 20, rarity: 'epic', icon: '🎯', unlocked: false },

  // Opponent-based
  { id: 'elite-slayer', title: 'Elite Slayer', description: 'Beat 10 opponents rated 8 or higher', category: 'opponents', threshold: 10, rarity: 'epic', icon: '⚔️', unlocked: false },
  { id: 'underdog-king', title: 'Underdog King', description: 'Win 20 games against higher-rated opponents', category: 'opponents', threshold: 20, rarity: 'legendary', icon: '👑', unlocked: false },

  // Team Performance
  { id: 'team-player', title: 'Team Player', description: 'Get 50 assists total', category: 'assists', threshold: 50, rarity: 'rare', icon: '🤝', unlocked: false },
  { id: 'playmaker', title: 'Playmaker', description: 'Get 100 assists total', category: 'assists', threshold: 100, rarity: 'epic', icon: '🎭', unlocked: false },
  { id: 'assist-legend', title: 'Assist Legend', description: 'Get 200 assists total', category: 'assists', threshold: 200, rarity: 'legendary', icon: '🌟', unlocked: false },

  // Milestone Celebrations
  { id: 'first-week-complete', title: 'First Week Complete', description: 'Complete your first FUT Champions week', category: 'weekly', threshold: 1, rarity: 'common', icon: '🎉', unlocked: false },
  { id: 'month-veteran', title: 'Month Veteran', description: 'Play for 30 consecutive days', category: 'time', threshold: 30, rarity: 'epic', icon: '📅', unlocked: false },
  { id: 'season-warrior', title: 'Season Warrior', description: 'Complete 50 weeks', category: 'weekly', threshold: 50, rarity: 'mythic', icon: '⚔️', unlocked: false },

  // Fun Achievements
  { id: 'lucky-seven', title: 'Lucky Seven', description: 'Score exactly 7 goals in a game', category: 'special', threshold: 1, rarity: 'rare', icon: '🍀', unlocked: false },
  { id: 'perfectionist', title: 'Perfectionist', description: 'Win a game 5-0', category: 'special', threshold: 1, rarity: 'rare', icon: '💎', unlocked: false },
  { id: 'thriller', title: 'Thriller', description: 'Win a game 6-5', category: 'special', threshold: 1, rarity: 'epic', icon: '🎢', unlocked: false },
  { id: 'demolition', title: 'Demolition', description: 'Win a game by 5+ goals', category: 'special', threshold: 1, rarity: 'epic', icon: '💥', unlocked: false },

  // Analytics Achievements
  { id: 'data-driven', title: 'Data Driven', description: 'View analytics page 10 times', category: 'engagement', threshold: 10, rarity: 'common', icon: '📈', unlocked: false },
  { id: 'insights-seeker', title: 'Insights Seeker', description: 'Check AI insights 25 times', category: 'engagement', threshold: 25, rarity: 'rare', icon: '🔍', unlocked: false },
  { id: 'strategy-master', title: 'Strategy Master', description: 'Use formation analysis 50 times', category: 'engagement', threshold: 50, rarity: 'epic', icon: '🎯', unlocked: false },

  // Social & Competitive
  { id: 'friendly-competitor', title: 'Friendly Competitor', description: 'Add 5 friends', category: 'social', threshold: 5, rarity: 'rare', icon: '👫', unlocked: false },
  { id: 'leaderboard-climber', title: 'Leaderboard Climber', description: 'Reach top 10 in any leaderboard', category: 'competitive', threshold: 1, rarity: 'epic', icon: '🏆', unlocked: false },
  { id: 'community-champion', title: 'Community Champion', description: 'Be #1 in any leaderboard', category: 'competitive', threshold: 1, rarity: 'legendary', icon: '👑', unlocked: false },

  // Ultimate Achievements
  { id: 'fut-master', title: 'FUT Master', description: 'Unlock 50 other achievements', category: 'meta', threshold: 50, rarity: 'mythic', icon: '🏆', unlocked: false },
  { id: 'completionist', title: 'Completionist', description: 'Unlock all achievements', category: 'meta', threshold: 79, rarity: 'mythic', icon: '💎', unlocked: false },
  { id: 'legend-status', title: 'Legend Status', description: 'Reach 1000 total games with 70%+ win rate', category: 'ultimate', threshold: 1, rarity: 'mythic', icon: '⭐', unlocked: false },

  // Hidden Achievements
  { id: 'easter-egg', title: 'Easter Egg Hunter', description: 'Find the hidden feature in settings', category: 'hidden', threshold: 1, rarity: 'epic', icon: '🥚', unlocked: false },
  { id: 'night-owl', title: 'Night Owl', description: 'Play a game between 2-4 AM', category: 'time', threshold: 1, rarity: 'rare', icon: '🦉', unlocked: false },
  { id: 'early-bird-special', title: 'Early Bird Special', description: 'Play a game between 5-7 AM', category: 'time', threshold: 1, rarity: 'rare', icon: '🐦', unlocked: false },

  // Performance Milestones
  { id: 'rating-climber', title: 'Rating Climber', description: 'Improve your average rating by 1.0 over 20 games', category: 'improvement', threshold: 1, rarity: 'epic', icon: '📈', unlocked: false },
  { id: 'comeback-specialist', title: 'Comeback Specialist', description: 'Win 5 games after being behind', category: 'special', threshold: 5, rarity: 'epic', icon: '🔄', unlocked: false },
  { id: 'clutch-performer', title: 'Clutch Performer', description: 'Score 10 goals in the 80th minute or later', category: 'special', threshold: 10, rarity: 'legendary', icon: '⏰', unlocked: false },

  // Skill Variety
  { id: 'versatile-scorer', title: 'Versatile Scorer', description: 'Score with 5 different players in one game', category: 'variety', threshold: 1, rarity: 'rare', icon: '🎭', unlocked: false },
  { id: 'formation-experimenter', title: 'Formation Experimenter', description: 'Win with 15 different formations', category: 'variety', threshold: 15, rarity: 'legendary', icon: '🔬', unlocked: false },
  { id: 'tactical-chameleon', title: 'Tactical Chameleon', description: 'Use every formation at least once', category: 'variety', threshold: 29, rarity: 'mythic', icon: '🦎', unlocked: false }
];

export const checkAchievements = (weeklyData: any[], currentWeek: any) => {
  // This would contain the logic to check which achievements are unlocked
  return achievements;
};

export const calculateAchievementProgress = (achievement: Achievement, weeklyData: any[]) => {
  // This would calculate progress towards an achievement
  return 0;
};

export const ACHIEVEMENTS = achievements;
