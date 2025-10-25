// src/types/futChampions.ts (Based on user's version, merged with DB schema & new fields)

import { PlayerCard, Squad as SquadsType } from './squads'; // Use alias if needed

// Interface matching DB schema + player_id link
export interface PlayerPerformance {
  id: string; // uuid
  game_id?: string | null; // uuid, nullable FK
  user_id: string; // uuid, FK (should be not null based on schema)
  player_id?: string | null; // uuid, nullable FK (added via SQL)
  player_name: string; // text, not null
  position: string; // text, not null
  minutes_played?: number | null; // integer, default 90
  goals?: number | null; // integer, default 0
  assists?: number | null; // integer, default 0
  rating?: number | null; // numeric, default 7.0 (use number in TS)
  yellow_cards?: number | null; // integer, default 0
  red_cards?: number | null; // integer, default 0
  own_goals?: number | null; // integer, default 0
  created_at?: string | null; // timestamp with time zone, default now()
  // Fields from user's type not directly in DB (can be added if calculated/needed elsewhere)
  // wasSubstituted?: boolean;
  // keyPasses?: number;
  // shotsOnTarget?: number; // In team_stats
  // tackles?: number;
  // interceptions?: number;
  // passAccuracy?: number; // In team_stats
}

// Type for inserting new player performances
export interface PlayerPerformanceInsert extends Omit<PlayerPerformance, 'id' | 'created_at' | 'game_id'> {
  user_id: string;
  game_id?: string; // Added later
  player_id?: string | null; // Include player_id
}

// Interface matching DB schema + dribble_success_rate
export interface TeamStatistics {
  id: string; // uuid
  game_id?: string | null; // uuid, nullable FK
  user_id: string; // uuid, not null FK
  possession?: number | null; // integer, default 50
  passes?: number | null; // integer, default 100
  pass_accuracy?: number | null; // integer, default 75
  shots?: number | null; // integer, default 10
  shots_on_target?: number | null; // integer, default 5
  corners?: number | null; // integer, default 3
  fouls?: number | null; // integer, default 8
  yellow_cards?: number | null; // integer, default 1 -> should be 0? Check DB default
  red_cards?: number | null; // integer, default 0
  expected_goals?: number | null; // numeric, default 1.5 (use number in TS)
  expected_goals_against?: number | null; // numeric, default 1.0 (use number in TS)
  dribble_success_rate?: number | null; // Added via SQL, integer
  created_at?: string | null; // timestamp with time zone, default now()
  // Fields from user's type not in DB:
  // actualGoals?: number; // game_results.user_goals
  // actualGoalsAgainst?: number; // game_results.opponent_goals
  // offsides?: number;
  // crosses?: number;
  // duelsWon?: number;
  // tacklesSuccessful?: number;
  // distanceCovered?: number; // User type had this, DB doesn't
}

// Type for inserting team statistics
export type TeamStatisticsInsert = Omit<TeamStatistics, 'id' | 'created_at' | 'game_id'> & {
    game_id?: string; // Optional context
};

// Interface matching DB schema + new/removed fields + relations
export interface Game {
  id: string; // uuid
  user_id: string; // uuid
  week_id: string; // uuid
  game_number: number; // integer (DB uses game_number)
  result: 'win' | 'loss'; // text
  score_line: string; // text
  user_goals?: number | null; // integer
  opponent_goals?: number | null; // integer
  overtime_result?: 'none' | 'win_ot' | 'loss_ot' | 'win_pen' | 'loss_pen' | null; // text, nullable
  opponent_skill?: number | null; // integer, 1-10 (DB has this)
  opponent_username?: string | null; // text, nullable
  squad_quality_comparison?: 'even' | 'mine_better' | 'opponent_better' | null; // Added via SQL, text
  game_context: string; // text, default 'normal'
  comments?: string | null; // text, nullable
  date_played?: string | null; // timestamp with time zone (DB uses date_played)
  time_played?: string | null; // text, nullable
  duration: number; // integer (DB requires not null)
  actual_game_time?: number | null; // integer, nullable
  rage_moments?: number | null; // integer, default 0
  stress_level?: number | null; // integer, 1-10
  squad_used?: string | null; // text (Squad ID), nullable
  server_quality?: number | null; // integer, 1-10
  game_rating?: string | null; // text, nullable
  game_score?: number | null; // integer, 0-100
  created_at?: string | null; // timestamp with time zone
  opponent_xg?: number | null; // numeric, default 1.0
  cross_play_enabled?: boolean | null; // boolean, default false
  tags?: string[] | null; // text[], nullable
  game_version: string; // text, not null
  // Fields from user's type not directly in DB (removed or calculated):
  // penaltyShootout?: PenaltyShootout;
  // opponentPlayStyle?: string; // Removed via SQL
  // opponentFormation?: string; // Removed via SQL
  // opponentSquadRating?: number; // Removed via SQL

  // Relations loaded via joins/manual fetch
  team_stats?: TeamStatistics | null; // Single object
  player_performances?: PlayerPerformance[] | null; // Array
}

// Interface matching DB schema + relations
export interface WeeklyPerformance {
  id: string; // uuid
  user_id: string; // uuid
  week_number: number; // integer
  custom_name?: string | null; // text, nullable
  start_date: string; // timestamp with time zone
  end_date?: string | null; // timestamp with time zone, nullable
  total_wins?: number | null; // integer, default 0
  total_losses?: number | null; // integer, default 0
  total_goals?: number | null; // integer, default 0
  total_conceded?: number | null; // integer, default 0
  total_expected_goals?: number | null; // numeric, default 0
  total_expected_goals_against?: number | null; // numeric, default 0
  average_opponent_skill?: number | null; // numeric, default 0
  squad_used?: string | null; // text (Squad ID), nullable
  weekly_rating?: number | null; // numeric, default 0
  week_rating?: string | null; // text, nullable
  week_score?: number | null; // integer, default 0
  is_completed?: boolean | null; // boolean, default false
  target_wins?: number | null; // integer, nullable
  current_rank?: string | null; // text, nullable
  starting_rank?: string | null; // text, nullable
  best_streak?: number | null; // integer, default 0
  worst_streak?: number | null; // integer, default 0
  current_streak?: number | null; // integer, default 0
  average_game_duration?: number | null; // numeric, nullable
  total_play_time?: number | null; // integer, default 0
  average_server_quality?: number | null; // numeric, nullable
  target_rank?: string | null; // text, nullable
  personal_notes?: string | null; // text, nullable
  created_at?: string | null; // timestamp with time zone
  updated_at?: string | null; // timestamp with time zone
  target_goals?: number | null; // integer, nullable
  target_clean_sheets?: number | null; // integer, nullable
  minimum_rank?: string | null; // text, nullable
  game_version: string; // text, not null
  // Fields from user's type not directly in DB:
  // qualifierRun?: QualifierRun;
  // winTarget?: WeeklyTarget;
  // gamesPlayed?: number; // Calculated
  // cpsScore?: number;

  // Relations loaded via joins/manual fetch
  games?: Game[] | null; // Array
}

// --- Other types can remain as they were in your file if used elsewhere ---
export interface Player { /* ... as provided ... */ }
export interface OpponentAnalysis { /* ... as provided ... */ }
export interface PenaltyShootout { /* ... as provided ... */ }
// export interface GameResult { /* ... MERGED INTO Game ... */ } // Use Game interface now
// export interface Squad { /* ... USE TYPE FROM './squads' ... */ } // Use Squad from squads.ts
export interface WeeklyTarget { /* ... as provided ... */ }
export interface QualifierRun { /* ... as provided ... */ }
export interface Achievement { /* ... as provided ... */ }
export interface PlayerMilestone { /* ... as provided ... */ }
export interface PlayerForm { /* ... as provided ... */ }
export interface AIInsight { /* ... as provided ... */ }
export interface DashboardSettings { /* ... as provided ... */ }
export interface AppTheme { /* ... as provided ... */ }
export interface UserSettings { /* ... as provided ... */ }
export interface WeeklyStats { /* ... as provided ... */ }
export interface GlobalPlayerStats { /* ... as provided ... */ }
export interface MatchFeedback { /* ... as provided ... */ }

// --- Constants remain the same ---
export const GAME_RATINGS = [ /* ... */ ];
export const CPS_WEIGHTS = { /* ... */ };
export const FC25_REWARD_RANKS = [ /* ... */ ];
export const FC26_REWARD_RANKS = [ /* ... */ ];
export const getRewardRanks = (gameVersion: string) => { /* ... */ };
