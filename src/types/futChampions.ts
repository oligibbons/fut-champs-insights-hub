// src/types/futChampions.ts

import { PlayerCard, Squad } from './squads'; // Assuming PlayerCard & Squad are defined here

// Based on your provided PlayerPerformance
export interface PlayerPerformance {
  id: string; // From DB schema: uuid, primary key
  game_id?: string; // From DB schema: uuid, foreign key (nullable)
  user_id: string; // From DB schema: uuid, not null
  player_id?: string; // From DB schema: uuid, foreign key (assuming added)
  player_name: string; // From DB schema: text, not null (use this if player_id missing)
  position: string; // From DB schema: text, not null
  minutes_played?: number; // From DB schema: integer, default 90
  goals?: number; // From DB schema: integer, default 0
  assists?: number; // From DB schema: integer, default 0
  rating?: number; // From DB schema: numeric, default 7.0
  yellow_cards?: number; // From DB schema: integer, default 0
  red_cards?: number; // From DB schema: integer, default 0
  own_goals?: number; // From DB schema: integer, default 0
  created_at?: string; // From DB schema: timestamp with time zone, default now()
  // Fields from your type not directly in DB schema (might be calculated):
  // wasSubstituted?: boolean;
  // keyPasses?: number;
  // shotsOnTarget?: number; // DB has this in team_stats
  // tackles?: number;
  // interceptions?: number;
  // passAccuracy?: number; // DB has this in team_stats
}

// Type for inserting new player performances (matches DB + player_id)
export interface PlayerPerformanceInsert extends Omit<PlayerPerformance, 'id' | 'created_at' | 'game_id'> {
  user_id: string;
  game_id?: string; // Added later in CurrentRun
  player_id?: string; // Important: ensure this is passed from form if available
}


// Based on DB schema team_statistics
export interface TeamStatistics {
  id: string; // uuid
  game_id?: string; // uuid, foreign key
  user_id: string; // uuid, foreign key
  possession?: number; // integer, default 50
  passes?: number; // integer, default 100
  pass_accuracy?: number; // integer, default 75
  shots?: number; // integer, default 10
  shots_on_target?: number; // integer, default 5
  corners?: number; // integer, default 3
  fouls?: number; // integer, default 8
  yellow_cards?: number; // integer, default 1
  red_cards?: number; // integer, default 0
  expected_goals?: number; // numeric, default 1.5
  expected_goals_against?: number; // numeric, default 1.0
  dribble_success_rate?: number; // Added via SQL
  created_at?: string; // timestamp with time zone
  // Fields from your TeamStats not in DB schema:
  // actualGoals?: number; // This is game_results.user_goals
  // actualGoalsAgainst?: number; // This is game_results.opponent_goals
  // offsides?: number;
  // crosses?: number;
  // duelsWon?: number;
  // tacklesSuccessful?: number;
  // distanceCovered?: number;
}

// Type for inserting team statistics (matches DB)
export type TeamStatisticsInsert = Omit<TeamStatistics, 'id' | 'created_at' | 'game_id'> & {
    game_id?: string; // Added later in CurrentRun
};

// Based on DB schema game_results and your GameResult type
export interface Game {
  id: string; // uuid
  user_id: string; // uuid
  week_id: string; // uuid
  game_number: number; // integer (matches DB) - Your type used gameNumber
  result: 'win' | 'loss'; // text
  score_line: string; // text
  user_goals?: number; // integer (matches DB)
  opponent_goals?: number; // integer (matches DB)
  overtime_result?: 'none' | 'win_ot' | 'loss_ot' | 'win_pen' | 'loss_pen'; // text (nullable, from previous update)
  opponent_skill?: number; // integer, 1-10 (matches DB) - Your type used opponentSkill
  opponent_username?: string; // text (nullable, from previous update)
  squad_quality_comparison?: 'even' | 'mine_better' | 'opponent_better'; // Added via SQL
  game_context: string; // text, default 'normal' (matches DB & your type)
  comments?: string; // text
  date_played?: string; // timestamp with time zone (matches DB) - Your type used date
  time_played?: string; // text (nullable, matches DB) - Your type used time
  duration: number; // integer (matches DB & your type)
  actual_game_time?: number; // integer (nullable, matches DB)
  rage_moments?: number; // integer, default 0 (matches DB) - Your type used rageQuits?
  stress_level?: number; // integer, 1-10 (matches DB & your type)
  squad_used?: string; // text (Squad ID) (matches DB)
  server_quality?: number; // integer, 1-10 (matches DB & your type)
  game_rating?: string; // text (nullable, matches DB & your type)
  game_score?: number; // integer, 0-100 (matches DB & your type)
  created_at?: string; // timestamp with time zone
  opponent_xg?: number; // numeric, default 1.0 (matches DB)
  cross_play_enabled?: boolean; // boolean, default false (matches DB) - Your type used crossPlay?
  tags?: string[]; // text[] (matches DB & your type)
  game_version: string; // text, not null (matches DB & your type)
  // Fields from your type not in DB schema:
  // penaltyShootout?: PenaltyShootout;
  // opponentPlayStyle?: string; // Removed via SQL
  // opponentFormation?: string; // Removed via SQL
  // opponentSquadRating?: number; // Removed via SQL

  // Relations (populated manually or via joins)
  team_stats?: TeamStatistics; // Use reconciled TeamStatistics type
  player_performances?: PlayerPerformance[]; // Use reconciled PlayerPerformance type
}

// Based on DB schema weekly_performances and your WeeklyPerformance type
export interface WeeklyPerformance {
  id: string; // uuid
  user_id: string; // uuid
  week_number: number; // integer (matches DB) - Your type used weekNumber
  custom_name?: string; // text (matches DB) - Your type used customName
  start_date: string; // timestamp with time zone (matches DB) - Your type used startDate
  end_date?: string; // timestamp with time zone (matches DB) - Your type used endDate
  total_wins?: number; // integer, default 0 (matches DB & your type)
  total_losses?: number; // integer, default 0 (matches DB & your type)
  total_goals?: number; // integer, default 0 (matches DB & your type)
  total_conceded?: number; // integer, default 0 (matches DB & your type)
  total_expected_goals?: number; // numeric, default 0 (matches DB & your type)
  total_expected_goals_against?: number; // numeric, default 0 (matches DB & your type)
  average_opponent_skill?: number; // numeric, default 0 (matches DB & your type)
  squad_used?: string; // text (Squad ID) (matches DB & your type)
  weekly_rating?: number; // numeric, default 0 (matches DB & your type)
  week_rating?: string; // text (nullable, matches DB & your type)
  week_score?: number; // integer, default 0 (matches DB & your type)
  is_completed?: boolean; // boolean, default false (matches DB & your type)
  target_wins?: number; // integer (matches DB) - Your type used targetWins
  current_rank?: string; // text (matches DB & your type)
  starting_rank?: string; // text (matches DB & your type)
  best_streak?: number; // integer, default 0 (matches DB & your type)
  worst_streak?: number; // integer, default 0 (matches DB & your type)
  current_streak?: number; // integer, default 0 (matches DB & your type)
  average_game_duration?: number; // numeric (matches DB & your type)
  total_play_time?: number; // integer, default 0 (matches DB & your type)
  average_server_quality?: number; // numeric (matches DB & your type)
  target_rank?: string; // text (matches DB & your type)
  personal_notes?: string; // text (matches DB & your type)
  created_at?: string; // timestamp with time zone
  updated_at?: string; // timestamp with time zone
  target_goals?: number; // integer (matches DB)
  target_clean_sheets?: number; // integer (matches DB)
  minimum_rank?: string; // text (matches DB) - Corresponds to your WeeklyTarget.minimumRank
  game_version: string; // text, not null (matches DB & your type)
  // Fields from your type not directly in DB schema:
  // qualifierRun?: QualifierRun;
  // winTarget?: WeeklyTarget; // Covered by individual target fields in DB
  // gamesPlayed?: number; // Can be calculated from games array length
  // cpsScore?: number;

  // Relations (populated manually)
  games?: Game[]; // Use reconciled Game type
}


// --- Other types from your file (can keep if used elsewhere) ---
// export interface Player { /* ... */ } // Consider merging/replacing with Squads.PlayerCard
// export interface OpponentAnalysis { /* ... */ }
// export interface PenaltyShootout { /* ... */ }
// export interface WeeklyTarget { /* ... */ } // Covered by fields in WeeklyPerformance
// export interface QualifierRun { /* ... */ }
// export interface Achievement { /* ... */ }
// export interface PlayerMilestone { /* ... */ }
// export interface PlayerForm { /* ... */ }
// export interface AIInsight { /* ... */ }
// export interface DashboardSettings { /* ... */ }
// export interface AppTheme { /* ... */ }
// export interface UserSettings { /* ... */ }
// export interface WeeklyStats { /* ... */ } // Likely calculated
// export interface GlobalPlayerStats { /* ... */ } // Likely calculated
// export interface MatchFeedback { /* ... */ }

// --- Constants ---
// export const GAME_RATINGS = [ /* ... */ ];
// export const CPS_WEIGHTS = { /* ... */ };
// export const FC25_REWARD_RANKS = [ /* ... */ ];
// export const FC26_REWARD_RANKS = [ /* ... */ ];
// export const getRewardRanks = (gameVersion: string) => { /* ... */ };
