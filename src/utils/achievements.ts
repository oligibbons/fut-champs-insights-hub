
import { Achievement } from '@/types/futChampions';

export const achievements: Achievement[] = [
  // Beginner Achievements
  { id: 'first-game', name: 'First Steps', description: 'Play your first FUT Champions game', category: 'games', threshold: 1, rarity: 'common', icon: '🎮', unlocked: false },
  { id: 'early-bird', name: 'Early Bird', description: 'Win your first game', category: 'wins', threshold: 1, rarity: 'common', icon: '🏆', unlocked: false },
  { id: 'hat-trick-hero', name: 'Hat-trick Hero', description: 'Score 3 goals in a single game', category: 'goals', threshold: 3, rarity: 'rare', icon: '⚽', unlocked: false },
  { id: 'clean-sheet', name: 'Clean Sheet', description: 'Keep a clean sheet', category: 'cleanSheets', threshold: 1, rarity: 'common', icon: '🛡️', unlocked: false },
  { id: 'assist-master', name: 'Assist Master', description: 'Get 5 assists in a game', category: 'assists', threshold: 5, rarity: 'epic', icon: '🎯', unlocked: false },

  // Win Streaks
  { id: 'win-streak-3', name: 'Hot Streak', description: 'Win 3 games in a row', category: 'streaks', threshold: 3, rarity: 'rare', icon: '🔥', unlocked: false },
  { id: 'win-streak-5', name: 'Unstoppable', description: 'Win 5 games in a row', category: 'streaks', threshold: 5, rarity: 'epic', icon: '⚡', unlocked: false },
  { id: 'win-streak-10', name: 'Legendary', description: 'Win 10 games in a row', category: 'streaks', threshold: 10, rarity: 'legendary', icon: '👑', unlocked: false },
  { id: 'win-streak-15', name: 'Mythical', description: 'Win 15 games in a row', category: 'streaks', threshold: 15, rarity: 'mythic', icon: '🌟', unlocked: false },

  // Game Milestones
  { id: 'veteran', name: 'Veteran', description: 'Play 50 games', category: 'games', threshold: 50, rarity: 'rare', icon: '🎖️', unlocked: false },
  { id: 'centurion', name: 'Centurion', description: 'Play 100 games', category: 'games', threshold: 100, rarity: 'epic', icon: '💯', unlocked: false },
  { id: 'marathon-runner', name: 'Marathon Runner', description: 'Play 250 games', category: 'games', threshold: 250, rarity: 'legendary', icon: '🏃', unlocked: false },
  { id: 'elite-competitor', name: 'Elite Competitor', description: 'Play 500 games', category: 'games', threshold: 500, rarity: 'mythic', icon: '🏅', unlocked: false },

  // Goal Achievements
  { id: 'goal-machine', name: 'Goal Machine', description: 'Score 100 goals', category: 'goals', threshold: 100, rarity: 'epic', icon: '⚽', unlocked: false },
  { id: 'prolific-scorer', name: 'Prolific Scorer', description: 'Score 250 goals', category: 'goals', threshold: 250, rarity: 'legendary', icon: '🎯', unlocked: false },
  { id: 'goal-legend', name: 'Goal Legend', description: 'Score 500 goals', category: 'goals', threshold: 500, rarity: 'mythic', icon: '👑', unlocked: false },

  // Win Achievements
  { id: 'winner', name: 'Winner', description: 'Win 25 games', category: 'wins', threshold: 25, rarity: 'rare', icon: '🏆', unlocked: false },
  { id: 'champion', name: 'Champion', description: 'Win 50 games', category: 'wins', threshold: 50, rarity: 'epic', icon: '🥇', unlocked: false },
  { id: 'elite-champion', name: 'Elite Champion', description: 'Win 100 games', category: 'wins', threshold: 100, rarity: 'legendary', icon: '👑', unlocked: false },
  { id: 'fut-legend', name: 'FUT Legend', description: 'Win 200 games', category: 'wins', threshold: 200, rarity: 'mythic', icon: '🌟', unlocked: false },

  // Weekly Achievements
  { id: 'perfect-week', name: 'Perfect Week', description: 'Win all 15 games in a week', category: 'weekly', threshold: 15, rarity: 'legendary', icon: '💎', unlocked: false },
  { id: 'week-warrior', name: 'Week Warrior', description: 'Complete 10 weeks', category: 'weekly', threshold: 10, rarity: 'epic', icon: '⚔️', unlocked: false },
  { id: 'consistency-king', name: 'Consistency King', description: 'Complete 25 weeks', category: 'weekly', threshold: 25, rarity: 'legendary', icon: '👑', unlocked: false },

  // Skill-based Achievements
  { id: 'defensive-wall', name: 'Defensive Wall', description: 'Keep 10 clean sheets', category: 'cleanSheets', threshold: 10, rarity: 'rare', icon: '🛡️', unlocked: false },
  { id: 'fortress', name: 'Fortress', description: 'Keep 25 clean sheets', category: 'cleanSheets', threshold: 25, rarity: 'epic', icon: '🏰', unlocked: false },
  { id: 'impenetrable', name: 'Impenetrable', description: 'Keep 50 clean sheets', category: 'cleanSheets', threshold: 50, rarity: 'legendary', icon: '⛩️', unlocked: false },

  // Creative Achievements
  { id: 'comeback-king', name: 'Comeback King', description: 'Win after being 2 goals down', category: 'special', threshold: 1, rarity: 'epic', icon: '🔄', unlocked: false },
  { id: 'giant-killer', name: 'Giant Killer', description: 'Beat an opponent rated 9+ when you\'re rated 7 or below', category: 'special', threshold: 1, rarity: 'rare', icon: '🗡️', unlocked: false },
  { id: 'david-vs-goliath', name: 'David vs Goliath', description: 'Beat 5 opponents rated 9+ when you\'re rated 7 or below', category: 'special', threshold: 5, rarity: 'legendary', icon: '🏹', unlocked: false },
  
  // Time-based Achievements
  { id: 'lightning-fast', name: 'Lightning Fast', description: 'Win a game in under 10 minutes', category: 'time', threshold: 1, rarity: 'rare', icon: '⚡', unlocked: false },
  { id: 'marathon-match', name: 'Marathon Match', description: 'Play a game longer than 30 minutes', category: 'time', threshold: 1, rarity: 'rare', icon: '⏰', unlocked: false },
  { id: 'speed-demon', name: 'Speed Demon', description: 'Win 10 games in under 15 minutes each', category: 'time', threshold: 10, rarity: 'epic', icon: '🏃‍♂️', unlocked: false },

  // Scoring Achievements
  { id: 'sharpshooter', name: 'Sharpshooter', description: 'Score 5+ goals in 10 different games', category: 'goals', threshold: 10, rarity: 'epic', icon: '🎯', unlocked: false },
  { id: 'goal-rush', name: 'Goal Rush', description: 'Score 7+ goals in a single game', category: 'goals', threshold: 7, rarity: 'legendary', icon: '🌪️', unlocked: false },
  { id: 'record-breaker', name: 'Record Breaker', description: 'Score 10+ goals in a single game', category: 'goals', threshold: 10, rarity: 'mythic', icon: '📈', unlocked: false },

  // Defensive Achievements
  { id: 'brick-wall', name: 'Brick Wall', description: 'Concede 0 goals in 5 consecutive games', category: 'defense', threshold: 5, rarity: 'epic', icon: '🧱', unlocked: false },
  { id: 'shut-out-specialist', name: 'Shut-out Specialist', description: 'Keep clean sheets in 75% of games over 20 games', category: 'defense', threshold: 15, rarity: 'legendary', icon: '🔒', unlocked: false },

  // Squad Achievements
  { id: 'squad-builder', name: 'Squad Builder', description: 'Create your first squad', category: 'squads', threshold: 1, rarity: 'common', icon: '👥', unlocked: false },
  { id: 'tactical-genius', name: 'Tactical Genius', description: 'Create 5 different squads', category: 'squads', threshold: 5, rarity: 'rare', icon: '🧠', unlocked: false },
  { id: 'formation-master', name: 'Formation Master', description: 'Try 10 different formations', category: 'formations', threshold: 10, rarity: 'epic', icon: '📐', unlocked: false },

  // Streaks and Consistency
  { id: 'consistent-performer', name: 'Consistent Performer', description: 'Play at least 1 game every day for 7 days', category: 'consistency', threshold: 7, rarity: 'rare', icon: '📅', unlocked: false },
  { id: 'daily-grinder', name: 'Daily Grinder', description: 'Play at least 1 game every day for 30 days', category: 'consistency', threshold: 30, rarity: 'legendary', icon: '⚙️', unlocked: false },
  { id: 'scoring-streak', name: 'Scoring Streak', description: 'Score in 10 consecutive games', category: 'streaks', threshold: 10, rarity: 'epic', icon: '🔥', unlocked: false },

  // Special Moments
  { id: 'last-minute-hero', name: 'Last Minute Hero', description: 'Score a winning goal in the 90th minute or later', category: 'special', threshold: 1, rarity: 'rare', icon: '⏱️', unlocked: false },
  { id: 'penalty-specialist', name: 'Penalty Specialist', description: 'Score 10 penalties without missing', category: 'special', threshold: 10, rarity: 'epic', icon: '🎯', unlocked: false },
  { id: 'free-kick-master', name: 'Free Kick Master', description: 'Score 5 free kicks', category: 'special', threshold: 5, rarity: 'rare', icon: '⚽', unlocked: false },

  // Advanced Stats
  { id: 'efficiency-expert', name: 'Efficiency Expert', description: 'Maintain 80%+ win rate over 25 games', category: 'efficiency', threshold: 20, rarity: 'legendary', icon: '📊', unlocked: false },
  { id: 'possession-master', name: 'Possession Master', description: 'Have 70%+ possession in 10 games', category: 'stats', threshold: 10, rarity: 'rare', icon: '⚽', unlocked: false },
  { id: 'clinical-finisher', name: 'Clinical Finisher', description: 'Score with 50%+ shot accuracy over 20 games', category: 'efficiency', threshold: 20, rarity: 'epic', icon: '🎯', unlocked: false },

  // Opponent-based
  { id: 'elite-slayer', name: 'Elite Slayer', description: 'Beat 10 opponents rated 8 or higher', category: 'opponents', threshold: 10, rarity: 'epic', icon: '⚔️', unlocked: false },
  { id: 'underdog-king', name: 'Underdog King', description: 'Win 20 games against higher-rated opponents', category: 'opponents', threshold: 20, rarity: 'legendary', icon: '👑', unlocked: false },

  // Team Performance
  { id: 'team-player', name: 'Team Player', description: 'Get 50 assists total', category: 'assists', threshold: 50, rarity: 'rare', icon: '🤝', unlocked: false },
  { id: 'playmaker', name: 'Playmaker', description: 'Get 100 assists total', category: 'assists', threshold: 100, rarity: 'epic', icon: '🎭', unlocked: false },
  { id: 'assist-legend', name: 'Assist Legend', description: 'Get 200 assists total', category: 'assists', threshold: 200, rarity: 'legendary', icon: '🌟', unlocked: false },

  // Milestone Celebrations
  { id: 'first-week-complete', name: 'First Week Complete', description: 'Complete your first FUT Champions week', category: 'weekly', threshold: 1, rarity: 'common', icon: '🎉', unlocked: false },
  { id: 'month-veteran', name: 'Month Veteran', description: 'Play for 30 consecutive days', category: 'time', threshold: 30, rarity: 'epic', icon: '📅', unlocked: false },
  { id: 'season-warrior', name: 'Season Warrior', description: 'Complete 50 weeks', category: 'weekly', threshold: 50, rarity: 'mythic', icon: '⚔️', unlocked: false },

  // Fun Achievements
  { id: 'lucky-seven', name: 'Lucky Seven', description: 'Score exactly 7 goals in a game', category: 'special', threshold: 1, rarity: 'rare', icon: '🍀', unlocked: false },
  { id: 'perfectionist', name: 'Perfectionist', description: 'Win a game 5-0', category: 'special', threshold: 1, rarity: 'rare', icon: '💎', unlocked: false },
  { id: 'thriller', name: 'Thriller', description: 'Win a game 6-5', category: 'special', threshold: 1, rarity: 'epic', icon: '🎢', unlocked: false },
  { id: 'demolition', name: 'Demolition', description: 'Win a game by 5+ goals', category: 'special', threshold: 1, rarity: 'epic', icon: '💥', unlocked: false },

  // Analytics Achievements
  { id: 'data-driven', name: 'Data Driven', description: 'View analytics page 10 times', category: 'engagement', threshold: 10, rarity: 'common', icon: '📈', unlocked: false },
  { id: 'insights-seeker', name: 'Insights Seeker', description: 'Check AI insights 25 times', category: 'engagement', threshold: 25, rarity: 'rare', icon: '🔍', unlocked: false },
  { id: 'strategy-master', name: 'Strategy Master', description: 'Use formation analysis 50 times', category: 'engagement', threshold: 50, rarity: 'epic', icon: '🎯', unlocked: false },

  // Social & Competitive
  { id: 'friendly-competitor', name: 'Friendly Competitor', description: 'Add 5 friends', category: 'social', threshold: 5, rarity: 'rare', icon: '👫', unlocked: false },
  { id: 'leaderboard-climber', name: 'Leaderboard Climber', description: 'Reach top 10 in any leaderboard', category: 'competitive', threshold: 1, rarity: 'epic', icon: '🏆', unlocked: false },
  { id: 'community-champion', name: 'Community Champion', description: 'Be #1 in any leaderboard', category: 'competitive', threshold: 1, rarity: 'legendary', icon: '👑', unlocked: false },

  // Ultimate Achievements
  { id: 'fut-master', name: 'FUT Master', description: 'Unlock 50 other achievements', category: 'meta', threshold: 50, rarity: 'mythic', icon: '🏆', unlocked: false },
  { id: 'completionist', name: 'Completionist', description: 'Unlock all achievements', category: 'meta', threshold: 79, rarity: 'mythic', icon: '💎', unlocked: false },
  { id: 'legend-status', name: 'Legend Status', description: 'Reach 1000 total games with 70%+ win rate', category: 'ultimate', threshold: 1, rarity: 'mythic', icon: '⭐', unlocked: false },

  // Hidden Achievements
  { id: 'easter-egg', name: 'Easter Egg Hunter', description: 'Find the hidden feature in settings', category: 'hidden', threshold: 1, rarity: 'epic', icon: '🥚', unlocked: false },
  { id: 'night-owl', name: 'Night Owl', description: 'Play a game between 2-4 AM', category: 'time', threshold: 1, rarity: 'rare', icon: '🦉', unlocked: false },
  { id: 'early-bird-special', name: 'Early Bird Special', description: 'Play a game between 5-7 AM', category: 'time', threshold: 1, rarity: 'rare', icon: '🐦', unlocked: false },

  // Performance Milestones
  { id: 'rating-climber', name: 'Rating Climber', description: 'Improve your average rating by 1.0 over 20 games', category: 'improvement', threshold: 1, rarity: 'epic', icon: '📈', unlocked: false },
  { id: 'comeback-specialist', name: 'Comeback Specialist', description: 'Win 5 games after being behind', category: 'special', threshold: 5, rarity: 'epic', icon: '🔄', unlocked: false },
  { id: 'clutch-performer', name: 'Clutch Performer', description: 'Score 10 goals in the 80th minute or later', category: 'special', threshold: 10, rarity: 'legendary', icon: '⏰', unlocked: false },

  // Skill Variety
  { id: 'versatile-scorer', name: 'Versatile Scorer', description: 'Score with 5 different players in one game', category: 'variety', threshold: 1, rarity: 'rare', icon: '🎭', unlocked: false },
  { id: 'formation-experimenter', name: 'Formation Experimenter', description: 'Win with 15 different formations', category: 'variety', threshold: 15, rarity: 'legendary', icon: '🔬', unlocked: false },
  { id: 'tactical-chameleon', name: 'Tactical Chameleon', description: 'Use every formation at least once', category: 'variety', threshold: 29, rarity: 'mythic', icon: '🦎', unlocked: false }
];
