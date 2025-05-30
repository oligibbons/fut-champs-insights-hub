
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
  { id: 'wins_1000', title: 'Immortal', description: 'Win 1000 games', icon: '⚡', category: 'wins', target: 1000, rarity: 'mythic' },

  // Win Streak Achievements
  { id: 'win_streak_3', title: 'Hat-trick of Wins', description: 'Win 3 games in a row', icon: '🔥', category: 'streaks', target: 3, rarity: 'common' },
  { id: 'win_streak_5', title: 'Hot Streak', description: 'Win 5 games in a row', icon: '⚡', category: 'streaks', target: 5, rarity: 'rare' },
  { id: 'win_streak_7', title: 'Magnificent Seven', description: 'Win 7 games in a row', icon: '🌟', category: 'streaks', target: 7, rarity: 'rare' },
  { id: 'win_streak_10', title: 'Perfect Ten', description: 'Win 10 games in a row', icon: '💎', category: 'streaks', target: 10, rarity: 'epic' },
  { id: 'win_streak_15', title: 'Unstoppable Force', description: 'Win 15 games in a row', icon: '🚀', category: 'streaks', target: 15, rarity: 'legendary' },
  { id: 'win_streak_20', title: 'Godlike', description: 'Win 20 games in a row', icon: '👑', category: 'streaks', target: 20, rarity: 'mythic' },
  { id: 'win_streak_25', title: 'Untouchable', description: 'Win 25 games in a row', icon: '💫', category: 'streaks', target: 25, rarity: 'mythic' },

  // Weekly Achievements
  { id: 'perfect_week', title: 'Perfect Weekend', description: 'Win all 15 games in a week', icon: '💎', category: 'wins', target: 15, rarity: 'mythic' },
  { id: 'rank_1_week', title: 'Elite Champion', description: 'Achieve Rank I (15 wins)', icon: '🥇', category: 'wins', target: 15, rarity: 'legendary' },
  { id: 'rank_2_week', title: 'Almost Elite', description: 'Achieve Rank II (13 wins)', icon: '🥈', category: 'wins', target: 13, rarity: 'epic' },
  { id: 'rank_3_week', title: 'Bronze Elite', description: 'Achieve Rank III (11 wins)', icon: '🥉', category: 'wins', target: 11, rarity: 'rare' },
  { id: 'comeback_week', title: 'Comeback King', description: 'Win 11+ games after starting 0-5', icon: '🔄', category: 'special', target: 1, rarity: 'legendary' },
  { id: 'clutch_week', title: 'Clutch Master', description: 'Reach Elite with exactly 15 wins in final game', icon: '🎯', category: 'special', target: 1, rarity: 'epic' },

  // Goal Achievements
  { id: 'first_goal', title: 'Off the Mark', description: 'Score your first goal', icon: '⚽', category: 'goals', target: 1, rarity: 'common' },
  { id: 'goals_10', title: 'Into Double Digits', description: 'Score 10 goals', icon: '🔟', category: 'goals', target: 10, rarity: 'common' },
  { id: 'goals_50', title: 'Sharpshooter', description: 'Score 50 goals', icon: '🎯', category: 'goals', target: 50, rarity: 'rare' },
  { id: 'goals_100', title: 'Century Maker', description: 'Score 100 goals', icon: '💯', category: 'goals', target: 100, rarity: 'epic' },
  { id: 'goals_250', title: 'Goal Machine', description: 'Score 250 goals', icon: '🚀', category: 'goals', target: 250, rarity: 'legendary' },
  { id: 'goals_500', title: 'Legendary Scorer', description: 'Score 500 goals', icon: '👑', category: 'goals', target: 500, rarity: 'mythic' },
  { id: 'goals_1000', title: 'Goal God', description: 'Score 1000 goals', icon: '⚡', category: 'goals', target: 1000, rarity: 'mythic' },
  { id: 'hat_trick', title: 'Hat-trick Hero', description: 'Score 3+ goals in one game', icon: '🎩', category: 'goals', target: 3, rarity: 'rare' },
  { id: 'super_hat_trick', title: 'Super Hat-trick', description: 'Score 4+ goals in one game', icon: '⚡', category: 'goals', target: 4, rarity: 'epic' },
  { id: 'perfect_hat_trick', title: 'Perfect Hat-trick', description: 'Score 5+ goals in one game', icon: '💎', category: 'goals', target: 5, rarity: 'legendary' },
  { id: 'double_hat_trick', title: 'Double Hat-trick', description: 'Score 6+ goals in one game', icon: '🔥', category: 'goals', target: 6, rarity: 'mythic' },
  { id: 'goal_fest_week', title: 'Goal Festival', description: 'Score 30+ goals in one week', icon: '🎊', category: 'goals', target: 30, rarity: 'epic' },
  { id: 'goal_machine_week', title: 'Scoring Machine', description: 'Score 40+ goals in one week', icon: '🚀', category: 'goals', target: 40, rarity: 'legendary' },
  { id: 'goal_tsunami', title: 'Goal Tsunami', description: 'Score 50+ goals in one week', icon: '🌊', category: 'goals', target: 50, rarity: 'mythic' },

  // Performance Achievements
  { id: 'clean_sheet', title: 'Solid Defense', description: 'Keep your first clean sheet', icon: '🛡️', category: 'strength', target: 1, rarity: 'common' },
  { id: 'clean_sheets_5', title: 'Defensive Wall', description: 'Keep 5 clean sheets', icon: '🏰', category: 'strength', target: 5, rarity: 'rare' },
  { id: 'clean_sheets_10', title: 'Fortress', description: 'Keep 10 clean sheets', icon: '🛡️', category: 'strength', target: 10, rarity: 'epic' },
  { id: 'clean_sheets_25', title: 'Impenetrable', description: 'Keep 25 clean sheets', icon: '⚔️', category: 'strength', target: 25, rarity: 'legendary' },
  { id: 'clean_sheet_week', title: 'Weekly Fortress', description: 'Keep 5+ clean sheets in one week', icon: '🏰', category: 'strength', target: 5, rarity: 'rare' },
  { id: 'shutout_master', title: 'Shutout Master', description: 'Keep 8+ clean sheets in one week', icon: '🔒', category: 'strength', target: 8, rarity: 'legendary' },
  { id: 'assist_master', title: 'Playmaker', description: 'Get 10 assists in one week', icon: '🎯', category: 'strength', target: 10, rarity: 'rare' },
  { id: 'assist_king', title: 'Assist King', description: 'Get 15+ assists in one week', icon: '👑', category: 'strength', target: 15, rarity: 'epic' },
  { id: 'assist_god', title: 'Assist God', description: 'Get 20+ assists in one week', icon: '⚡', category: 'strength', target: 20, rarity: 'legendary' },
  { id: 'high_scorer_game', title: 'Man of the Match', description: 'Get a 9.0+ rating in a game', icon: '⭐', category: 'strength', target: 1, rarity: 'rare' },
  { id: 'perfect_game', title: 'Perfect Performance', description: 'Get a 10.0 rating in a game', icon: '💎', category: 'strength', target: 1, rarity: 'legendary' },
  { id: 'consistent_week', title: 'Mr. Consistent', description: 'Average 8.0+ rating for a week', icon: '📊', category: 'strength', target: 1, rarity: 'epic' },

  // Special Game Context Achievements
  { id: 'comeback_master', title: 'Comeback Master', description: 'Win after being 2+ goals down', icon: '🔄', category: 'opportunity', target: 1, rarity: 'rare' },
  { id: 'great_escape', title: 'The Great Escape', description: 'Win after being 3+ goals down', icon: '🎭', category: 'opportunity', target: 1, rarity: 'legendary' },
  { id: 'impossible_comeback', title: 'Impossible Comeback', description: 'Win after being 4+ goals down', icon: '🌟', category: 'opportunity', target: 1, rarity: 'mythic' },
  { id: 'penalty_hero', title: 'Penalty Hero', description: 'Win your first penalty shootout', icon: '🥅', category: 'opportunity', target: 1, rarity: 'rare' },
  { id: 'penalty_specialist', title: 'Penalty Specialist', description: 'Win 5 penalty shootouts', icon: '🎯', category: 'opportunity', target: 5, rarity: 'epic' },
  { id: 'penalty_master', title: 'Penalty Master', description: 'Win 10 penalty shootouts', icon: '👑', category: 'opportunity', target: 10, rarity: 'legendary' },
  { id: 'penalty_god', title: 'Penalty God', description: 'Win 20 penalty shootouts', icon: '⚡', category: 'opportunity', target: 20, rarity: 'mythic' },
  { id: 'extra_time_warrior', title: 'Extra Time Warrior', description: 'Win 5 games in extra time', icon: '⏰', category: 'opportunity', target: 5, rarity: 'rare' },
  { id: 'overtime_king', title: 'Overtime King', description: 'Win 15 games in extra time', icon: '👑', category: 'opportunity', target: 15, rarity: 'legendary' },
  { id: 'ragequit_victim', title: 'Rage Inducer', description: 'Make 5 opponents rage quit', icon: '😤', category: 'opportunity', target: 5, rarity: 'rare' },
  { id: 'ragequit_master', title: 'Tilt Master', description: 'Make 15 opponents rage quit', icon: '🎭', category: 'opportunity', target: 15, rarity: 'epic' },
  { id: 'ragequit_god', title: 'Rage God', description: 'Make 30 opponents rage quit', icon: '💀', category: 'opportunity', target: 30, rarity: 'legendary' },

  // Milestone Achievements
  { id: 'games_10', title: 'Getting Experience', description: 'Play 10 games', icon: '🎮', category: 'milestone', target: 10, rarity: 'common' },
  { id: 'games_50', title: 'Veteran', description: 'Play 50 games', icon: '🏅', category: 'milestone', target: 50, rarity: 'common' },
  { id: 'games_100', title: 'Experienced', description: 'Play 100 games', icon: '🎖️', category: 'milestone', target: 100, rarity: 'rare' },
  { id: 'games_250', title: 'Seasoned Pro', description: 'Play 250 games', icon: '🏆', category: 'milestone', target: 250, rarity: 'epic' },
  { id: 'games_500', title: 'Living Legend', description: 'Play 500 games', icon: '👑', category: 'milestone', target: 500, rarity: 'legendary' },
  { id: 'games_1000', title: 'Immortal', description: 'Play 1000 games', icon: '🌟', category: 'milestone', target: 1000, rarity: 'mythic' },
  { id: 'games_2500', title: 'Eternal', description: 'Play 2500 games', icon: '⚡', category: 'milestone', target: 2500, rarity: 'mythic' },
  { id: 'weeks_5', title: 'Regular Player', description: 'Complete 5 weeks', icon: '📅', category: 'milestone', target: 5, rarity: 'common' },
  { id: 'weeks_10', title: 'Dedicated', description: 'Complete 10 weeks', icon: '🗓️', category: 'milestone', target: 10, rarity: 'rare' },
  { id: 'weeks_25', title: 'Long Term Commitment', description: 'Complete 25 weeks', icon: '📆', category: 'milestone', target: 25, rarity: 'epic' },
  { id: 'weeks_50', title: 'Addicted', description: 'Complete 50 weeks', icon: '🗓️', category: 'milestone', target: 50, rarity: 'legendary' },
  { id: 'weeks_100', title: 'Lifelong Player', description: 'Complete 100 weeks', icon: '💎', category: 'milestone', target: 100, rarity: 'mythic' },

  // Creative and Fun Achievements
  { id: 'friday_night_legend', title: 'Friday Night Legend', description: 'Win 10 games on Friday nights', icon: '🌙', category: 'special', target: 10, rarity: 'rare' },
  { id: 'weekend_warrior', title: 'Weekend Warrior', description: 'Complete 10 weekend leagues', icon: '⚔️', category: 'milestone', target: 10, rarity: 'rare' },
  { id: 'monday_blues', title: 'Monday Blues Beater', description: 'Win 5 games on Monday mornings', icon: '☕', category: 'special', target: 5, rarity: 'rare' },
  { id: 'midnight_oil', title: 'Burning the Midnight Oil', description: 'Win 10 games after midnight', icon: '🕛', category: 'special', target: 10, rarity: 'rare' },
  { id: 'early_bird', title: 'Early Bird', description: 'Win 10 games before 8 AM', icon: '🐦', category: 'special', target: 10, rarity: 'rare' },
  { id: 'lucky_number_7', title: 'Lucky Number 7', description: 'Win with exactly 7 goals scored', icon: '🍀', category: 'special', target: 1, rarity: 'rare' },
  { id: 'unlucky_13', title: 'Unlucky 13 Conqueror', description: 'Win your 13th game in a row', icon: '🔮', category: 'special', target: 1, rarity: 'epic' },
  { id: 'perfectionist', title: 'Perfectionist', description: 'Win 5 games with perfect 10.0 ratings', icon: '💯', category: 'strength', target: 5, rarity: 'legendary' },
  { id: 'underdog_hero', title: 'Underdog Hero', description: 'Beat 20 opponents with higher skill ratings', icon: '🥊', category: 'opportunity', target: 20, rarity: 'epic' },
  { id: 'giant_slayer', title: 'Giant Slayer', description: 'Beat 10 opponents rated 9+ skill', icon: '⚔️', category: 'opportunity', target: 10, rarity: 'epic' },
  { id: 'boss_battle', title: 'Boss Battle Victor', description: 'Beat 5 opponents rated 10/10 skill', icon: '👹', category: 'opportunity', target: 5, rarity: 'legendary' },
  { id: 'speed_demon', title: 'Speed Demon', description: 'Win 10 games in under 12 minutes', icon: '💨', category: 'special', target: 10, rarity: 'rare' },
  { id: 'marathon_runner', title: 'Marathon Runner', description: 'Play a 30+ minute game', icon: '🏃', category: 'special', target: 1, rarity: 'rare' },
  { id: 'efficiency_expert', title: 'Efficiency Expert', description: 'Win with 90%+ pass accuracy 10 times', icon: '🎯', category: 'strength', target: 10, rarity: 'epic' },
  { id: 'possession_master', title: 'Possession Master', description: 'Win with 80%+ possession 5 times', icon: '⚽', category: 'strength', target: 5, rarity: 'rare' },
  { id: 'defensive_masterclass', title: 'Defensive Masterclass', description: 'Win without conceding for 5 straight games', icon: '🛡️', category: 'strength', target: 1, rarity: 'epic' },
  { id: 'counter_attack_king', title: 'Counter Attack King', description: 'Score 20 counter-attack goals', icon: '⚡', category: 'strength', target: 20, rarity: 'rare' },
  { id: 'set_piece_specialist', title: 'Set Piece Specialist', description: 'Score 15 goals from set pieces', icon: '🥅', category: 'strength', target: 15, rarity: 'rare' },
  { id: 'long_shot_legend', title: 'Long Shot Legend', description: 'Score 10 goals from outside the box', icon: '🚀', category: 'strength', target: 10, rarity: 'rare' },
  { id: 'header_hero', title: 'Header Hero', description: 'Score 20 headed goals', icon: '🦅', category: 'strength', target: 20, rarity: 'rare' },
  { id: 'volleh_master', title: 'Volley Master', description: 'Score 10 volley goals', icon: '⚽', category: 'strength', target: 10, rarity: 'epic' },
  { id: 'bicycle_kick_god', title: 'Bicycle Kick God', description: 'Score 3 bicycle kick goals', icon: '🚴', category: 'strength', target: 3, rarity: 'legendary' },
  { id: 'free_kick_wizard', title: 'Free Kick Wizard', description: 'Score 15 free kick goals', icon: '🧙', category: 'strength', target: 15, rarity: 'epic' },
  { id: 'penalty_perfectionist', title: 'Penalty Perfectionist', description: 'Score 25 penalties without missing', icon: '🎯', category: 'strength', target: 25, rarity: 'legendary' },
  { id: 'skill_move_master', title: 'Skill Move Master', description: 'Complete 100 successful skill moves', icon: '🕺', category: 'strength', target: 100, rarity: 'epic' },
  { id: 'nutmeg_king', title: 'Nutmeg King', description: 'Nutmeg opponents 50 times', icon: '🥜', category: 'strength', target: 50, rarity: 'rare' },
  { id: 'crossbar_challenge', title: 'Crossbar Challenge', description: 'Hit the crossbar 10 times', icon: '🎯', category: 'special', target: 10, rarity: 'rare' },
  { id: 'woodwork_warrior', title: 'Woodwork Warrior', description: 'Hit the post 15 times', icon: '🪵', category: 'weakness', target: 15, rarity: 'rare' },
  { id: 'comeback_kid', title: 'Comeback Kid', description: 'Complete 10 successful comebacks', icon: '🔄', category: 'opportunity', target: 10, rarity: 'epic' },
  { id: 'choker', title: 'The Choker', description: 'Lose 5 games while leading at 90 minutes', icon: '😰', category: 'weakness', target: 5, rarity: 'rare' },
  { id: 'last_minute_hero', title: 'Last Minute Hero', description: 'Score 10 goals after 90 minutes', icon: '⏱️', category: 'opportunity', target: 10, rarity: 'epic' },
  { id: 'stoppage_time_king', title: 'Stoppage Time King', description: 'Win 5 games with stoppage time goals', icon: '⏰', category: 'opportunity', target: 5, rarity: 'rare' },
  { id: 'injury_time_warrior', title: 'Injury Time Warrior', description: 'Score 20 goals in injury time', icon: '🩹', category: 'opportunity', target: 20, rarity: 'epic' },
  { id: 'first_minute_striker', title: 'First Minute Striker', description: 'Score in the first minute 10 times', icon: '⚡', category: 'strength', target: 10, rarity: 'rare' },
  { id: 'own_goal_magnet', title: 'Own Goal Magnet', description: 'Benefit from 10 opponent own goals', icon: '🧲', category: 'opportunity', target: 10, rarity: 'rare' },
  { id: 'red_card_collector', title: 'Red Card Collector', description: 'Receive 5 red cards', icon: '🟥', category: 'weakness', target: 5, rarity: 'rare' },
  { id: 'yellow_card_king', title: 'Yellow Card King', description: 'Accumulate 50 yellow cards', icon: '🟨', category: 'weakness', target: 50, rarity: 'rare' },
  { id: 'clean_player', title: 'Clean Player', description: 'Play 25 games without any cards', icon: '😇', category: 'strength', target: 25, rarity: 'epic' },
  { id: 'fair_play_award', title: 'Fair Play Award', description: 'Complete 100 games with minimal fouls', icon: '🤝', category: 'strength', target: 100, rarity: 'legendary' },
  { id: 'substitution_genius', title: 'Substitution Genius', description: 'Win 10 games after making game-changing subs', icon: '🔄', category: 'strength', target: 10, rarity: 'epic' },
  { id: 'formation_master', title: 'Formation Master', description: 'Win with 5 different formations', icon: '📋', category: 'strength', target: 5, rarity: 'rare' },
  { id: 'tactical_genius', title: 'Tactical Genius', description: 'Win games with all formation types', icon: '🧠', category: 'strength', target: 1, rarity: 'legendary' },
  { id: 'super_sub', title: 'Super Sub', description: 'Score 25 goals with substitutes', icon: '🔄', category: 'strength', target: 25, rarity: 'epic' },
  { id: 'captain_fantastic', title: 'Captain Fantastic', description: 'Score 50 goals with your captain', icon: '👨‍✈️', category: 'strength', target: 50, rarity: 'epic' },
  { id: 'bench_warmer', title: 'Bench Warmer', description: 'Use all 5 substitutions in 20 games', icon: '🪑', category: 'special', target: 20, rarity: 'rare' },
  { id: 'injury_prone', title: 'Injury Prone', description: 'Have 10 players get injured', icon: '🩹', category: 'weakness', target: 10, rarity: 'rare' },
  { id: 'fitness_guru', title: 'Fitness Guru', description: 'Maintain 90%+ fitness for entire squad 10 times', icon: '💪', category: 'strength', target: 10, rarity: 'epic' },
  { id: 'chemistry_king', title: 'Chemistry King', description: 'Achieve perfect chemistry 25 times', icon: '🧪', category: 'strength', target: 25, rarity: 'epic' },
  { id: 'pack_luck_god', title: 'Pack Luck God', description: 'Pack 10 players rated 85+', icon: '📦', category: 'opportunity', target: 10, rarity: 'mythic' },
  { id: 'transfer_market_king', title: 'Transfer Market King', description: 'Make 100 profitable transfers', icon: '💰', category: 'strength', target: 100, rarity: 'legendary' },
  { id: 'budget_manager', title: 'Budget Manager', description: 'Win with a team worth under 100k', icon: '💸', category: 'opportunity', target: 1, rarity: 'epic' },
  { id: 'big_spender', title: 'Big Spender', description: 'Build a team worth over 10 million', icon: '💎', category: 'special', target: 1, rarity: 'legendary' },
  { id: 'loyalty_reward', title: 'Loyalty Reward', description: 'Use the same squad for 50 games', icon: '❤️', category: 'special', target: 50, rarity: 'rare' },
  { id: 'squad_rotation', title: 'Squad Rotation Master', description: 'Use 50 different players', icon: '🔄', category: 'special', target: 50, rarity: 'epic' },
  { id: 'one_club_legend', title: 'One Club Legend', description: 'Use players from only one club', icon: '🏟️', category: 'special', target: 1, rarity: 'rare' },
  { id: 'national_team', title: 'National Team Builder', description: 'Build a squad from one nationality', icon: '🏴', category: 'special', target: 1, rarity: 'rare' },
  { id: 'rainbow_squad', title: 'Rainbow Squad', description: 'Use players from 10 different nations', icon: '🌈', category: 'special', target: 10, rarity: 'epic' },
  { id: 'veteran_squad', title: 'Veteran Squad', description: 'Use a squad with average age 33+', icon: '👴', category: 'special', target: 1, rarity: 'rare' },
  { id: 'youth_academy', title: 'Youth Academy', description: 'Use a squad with average age under 21', icon: '👶', category: 'special', target: 1, rarity: 'rare' },
  { id: 'height_advantage', title: 'Height Advantage', description: 'Use a squad with average height 6\'2"+', icon: '📏', category: 'special', target: 1, rarity: 'rare' },
  { id: 'speed_merchant', title: 'Speed Merchant', description: 'Use a squad with 90+ pace average', icon: '💨', category: 'special', target: 1, rarity: 'epic' },
  { id: 'tank_squad', title: 'Tank Squad', description: 'Use a squad with 90+ physical average', icon: '🛡️', category: 'special', target: 1, rarity: 'epic' },
  { id: 'technical_masters', title: 'Technical Masters', description: 'Use a squad with 90+ dribbling average', icon: '🕺', category: 'special', target: 1, rarity: 'epic' },
  { id: 'brick_wall', title: 'Brick Wall', description: 'Use a squad with 90+ defending average', icon: '🧱', category: 'special', target: 1, rarity: 'epic' },
  { id: 'goal_machine_squad', title: 'Goal Machine Squad', description: 'Use a squad with 90+ shooting average', icon: '🎯', category: 'special', target: 1, rarity: 'epic' },
  { id: 'pass_masters', title: 'Pass Masters', description: 'Use a squad with 90+ passing average', icon: '🎯', category: 'special', target: 1, rarity: 'epic' },
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
    case 'wins_1000':
      return totalWins;
    
    // Goal achievements
    case 'first_goal':
    case 'goals_10':
    case 'goals_50':
    case 'goals_100':
    case 'goals_250':
    case 'goals_500':
    case 'goals_1000':
      return totalGoals;
    
    // Game milestone achievements
    case 'games_10':
    case 'games_50':
    case 'games_100':
    case 'games_250':
    case 'games_500':
    case 'games_1000':
    case 'games_2500':
      return allGames.length;
    
    // Week milestone achievements
    case 'weeks_5':
    case 'weeks_10':
    case 'weeks_25':
    case 'weeks_50':
    case 'weeks_100':
      return completedWeeks;
    
    // Win streak achievements
    case 'win_streak_3':
    case 'win_streak_5':
    case 'win_streak_7':
    case 'win_streak_10':
    case 'win_streak_15':
    case 'win_streak_20':
    case 'win_streak_25':
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
    
    case 'super_hat_trick':
      return allGames.some(game => {
        const [goalsFor] = game.scoreLine.split('-').map(Number);
        return goalsFor >= 4;
      }) ? 4 : 0;
    
    case 'perfect_hat_trick':
      return allGames.some(game => {
        const [goalsFor] = game.scoreLine.split('-').map(Number);
        return goalsFor >= 5;
      }) ? 5 : 0;
    
    case 'double_hat_trick':
      return allGames.some(game => {
        const [goalsFor] = game.scoreLine.split('-').map(Number);
        return goalsFor >= 6;
      }) ? 6 : 0;
    
    case 'penalty_hero':
      return allGames.filter(game => game.penaltyShootout?.userWon).length > 0 ? 1 : 0;
    
    case 'penalty_specialist':
      return allGames.filter(game => game.penaltyShootout?.userWon).length;
    
    case 'penalty_master':
      return allGames.filter(game => game.penaltyShootout?.userWon).length;
    
    case 'penalty_god':
      return allGames.filter(game => game.penaltyShootout?.userWon).length;
    
    case 'ragequit_victim':
      return allGames.filter(game => game.gameContext === 'rage_quit').length;
    
    case 'ragequit_master':
      return allGames.filter(game => game.gameContext === 'rage_quit').length;
    
    case 'ragequit_god':
      return allGames.filter(game => game.gameContext === 'rage_quit').length;
    
    case 'clean_sheet':
      return allGames.filter(game => {
        const [, goalsAgainst] = game.scoreLine.split('-').map(Number);
        return goalsAgainst === 0 && game.result === 'win';
      }).length > 0 ? 1 : 0;
    
    case 'clean_sheets_5':
    case 'clean_sheets_10':
    case 'clean_sheets_25':
      return allGames.filter(game => {
        const [, goalsAgainst] = game.scoreLine.split('-').map(Number);
        return goalsAgainst === 0 && game.result === 'win';
      }).length;
    
    case 'comeback_master':
      return allGames.filter(game => game.gameContext === 'comeback').length;
    
    case 'great_escape':
      return allGames.filter(game => game.gameContext === 'great_comeback').length;
    
    case 'impossible_comeback':
      return allGames.filter(game => game.gameContext === 'impossible_comeback').length;
    
    case 'goal_fest_week':
      return weeklyData.some(week => week.totalGoals >= 30) ? 30 : 0;
    
    case 'goal_machine_week':
      return weeklyData.some(week => week.totalGoals >= 40) ? 40 : 0;
    
    case 'goal_tsunami':
      return weeklyData.some(week => week.totalGoals >= 50) ? 50 : 0;
    
    // Time-based achievements
    case 'friday_night_legend':
    case 'monday_blues':
    case 'midnight_oil':
    case 'early_bird':
      // These would need additional date/time tracking in game data
      return 0;
    
    case 'weekend_warrior':
      return completedWeeks;
    
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
