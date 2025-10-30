// src/integrations/supabase/types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      // --- EXISTING TABLES ---
      achievements: {
        Row: {
          achievement_id: string
          category: string
          description: string
          id: string
          progress: number | null
          rarity: string
          target: number | null
          title: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          category: string
          description: string
          id?: string
          progress?: number | null
          rarity: string
          target?: number | null
          title: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          category?: string
          description?: string
          id?: string
          progress?: number | null
          rarity?: string
          target?: number | null
          title?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      friends: {
        Row: {
          created_at: string
          friend_id: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          id?: string
          status: string
          user_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "friends_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friends_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      game_results: {
        Row: {
          actual_game_time: number | null
          comments: string | null
          created_at: string
          cross_play_enabled: boolean | null
          date_played: string
          duration: number
          game_context: string
          game_number: number
          game_rating: string | null
          game_score: number | null
          id: string
          opponent_goals: number | null
          opponent_skill: number
          opponent_xg: number | null
          rage_moments: number | null
          result: string
          score_line: string
          server_quality: number | null
          squad_used: string | null
          stress_level: number | null
          time_played: string | null
          user_goals: number | null
          user_id: string
          week_id: string
        }
        Insert: {
          actual_game_time?: number | null
          comments?: string | null
          created_at?: string
          cross_play_enabled?: boolean | null
          date_played?: string
          duration: number
          game_context?: string
          game_number: number
          game_rating?: string | null
          game_score?: number | null
          id?: string
          opponent_goals?: number | null
          opponent_skill: number
          opponent_xg?: number | null
          rage_moments?: number | null
          result: string
          score_line: string
          server_quality?: number | null
          squad_used?: string | null
          stress_level?: number | null
          time_played?: string | null
          user_goals?: number | null
          user_id: string
          week_id: string
        }
        Update: {
          actual_game_time?: number | null
          comments?: string | null
          created_at?: string
          cross_play_enabled?: boolean | null
          date_played?: string
          duration?: number
          game_context?: string
          game_number?: number
          game_rating?: string | null
          game_score?: number | null
          id?: string
          opponent_goals?: number | null
          opponent_skill?: number
          opponent_xg?: number | null
          rage_moments?: number | null
          result?: string
          score_line?: string
          server_quality?: number | null
          squad_used?: string | null
          stress_level?: number | null
          time_played?: string | null
          user_goals?: number | null
          user_id?: string
          week_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_results_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "weekly_performances"
            referencedColumns: ["id"]
          },
        ]
      }
      player_performances: {
        Row: {
          assists: number | null
          created_at: string | null
          game_id: string | null
          goals: number | null
          id: string
          minutes_played: number | null
          player_name: string
          position: string
          rating: number | null
          red_cards: number | null
          user_id: string
          yellow_cards: number | null
        }
        Insert: {
          assists?: number | null
          created_at?: string | null
          game_id?: string | null
          goals?: number | null
          id?: string
          minutes_played?: number | null
          player_name: string
          position: string
          rating?: number | null
          red_cards?: number | null
          user_id: string
          yellow_cards?: number | null
        }
        Update: {
          assists?: number | null
          created_at?: string | null
          game_id?: string | null
          goals?: number | null
          id?: string
          minutes_played?: number | null
          player_name?: string
          position?: string
          rating?: number | null
          red_cards?: number | null
          user_id?: string
          yellow_cards?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "player_performances_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "game_results"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          assists: number | null
          average_rating: number | null
          card_type: string
          clean_sheets: number | null
          club: string | null
          created_at: string
          defending: number | null
          dribbling: number | null
          games_played: number | null
          goals: number | null
          id: string
          image_url: string | null
          last_used: string | null
          league: string | null
          losses: number | null
          minutes_played: number | null
          name: string
          nationality: string | null
          own_goals: number | null
          pace: number | null
          passing: number | null
          physical: number | null
          position: string
          price: number | null
          rating: number
          red_cards: number | null
          shooting: number | null
          updated_at: string
          user_id: string
          wins: number | null
          yellow_cards: number | null
        }
        Insert: {
          assists?: number | null
          average_rating?: number | null
          card_type: string
          clean_sheets?: number | null
          club?: string | null
          created_at?: string
          defending?: number | null
          dribbling?: number | null
          games_played?: number | null
          goals?: number | null
          id?: string
          image_url?: string | null
          last_used?: string | null
          league?: string | null
          losses?: number | null
          minutes_played?: number | null
          name: string
          nationality?: string | null
          own_goals?: number | null
          pace?: number | null
          passing?: number | null
          physical?: number | null
          position: string
          price?: number | null
          rating: number
          red_cards?: number | null
          shooting?: number | null
          updated_at?: string
          user_id: string
          wins?: number | null
          yellow_cards?: number | null
        }
        Update: {
          assists?: number | null
          average_rating?: number | null
          card_type?: string
          clean_sheets?: number | null
          club?: string | null
          created_at?: string
          defending?: number | null
          dribbling?: number | null
          games_played?: number | null
          goals?: number | null
          id?: string
          image_url?: string | null
          last_used?: string | null
          league?: string | null
          losses?: number | null
          minutes_played?: number | null
          name?: string
          nationality?: string | null
          own_goals?: number | null
          pace?: number | null
          passing?: number | null
          physical?: number | null
          position?: string
          price?: number | null
          rating?: number
          red_cards?: number | null
          shooting?: number | null
          updated_at?: string
          user_id?: string
          wins?: number | null
          yellow_cards?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "players_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          best_rank: string | null
          best_streak: number | null
          created_at: string
          current_streak: number | null
          display_name: string | null
          id: string
          total_games: number | null
          total_goals: number | null
          total_wins: number | null
          updated_at: string
          username: string
          is_admin?: boolean // Added this based on AuthContext
        }
        Insert: {
          avatar_url?: string | null
          best_rank?: string | null
          best_streak?: number | null
          created_at?: string
          current_streak?: number | null
          display_name?: string | null
          id: string
          total_games?: number | null
          total_goals?: number | null
          total_wins?: number | null
          updated_at?: string
          username: string
          is_admin?: boolean
        }
        Update: {
          avatar_url?: string | null
          best_rank?: string | null
          best_streak?: number | null
          created_at?: string
          current_streak?: number | null
          display_name?: string | null
          id?: string
          total_games?: number | null
          total_goals?: number | null
          total_wins?: number | null
          updated_at?: string
          username?: string
          is_admin?: boolean
        }
        Relationships: [
           {
            foreignKeyName: "profiles_id_fkey" // Assumed from your schema dump
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      squads: {
        Row: {
          average_age: number | null
          created_at: string
          description: string | null
          formation: string
          games_played: number | null
          id: string
          is_default: boolean | null
          key_players: string[] | null
          last_used: string | null
          losses: number | null
          name: string
          total_rating: number | null
          total_value: number | null
          updated_at: string
          user_id: string
          wins: number | null
        }
        Insert: {
          average_age?: number | null
          created_at?: string
          description?: string | null
          formation: string
          games_played?: number | null
          id?: string
          is_default?: boolean | null
          key_players?: string[] | null
          last_used?: string | null
          losses?: number | null
          name: string
          total_rating?: number | null
          total_value?: number | null
          updated_at?: string
          user_id: string
          wins?: number | null
        }
        Update: {
          average_age?: number | null
          created_at?: string
          description?: string | null
          formation?: string
          games_played?: number | null
          id?: string
          is_default?: boolean | null
          key_players?: string[] | null
          last_used?: string | null
          losses?: number | null
          name?: string
          total_rating?: number | null
          total_value?: number | null
          updated_at?: string
          user_id?: string
          wins?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "squads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_statistics: {
        Row: {
          corners: number | null
          created_at: string | null
          expected_goals: number | null
          expected_goals_against: number | null
          fouls: number | null
          game_id: string | null
          id: string
          pass_accuracy: number | null
          passes: number | null
          possession: number | null
          red_cards: number | null
          shots: number | null
          shots_on_target: number | null
          user_id: string
          yellow_cards: number | null
        }
        Insert: {
          corners?: number | null
          created_at?: string | null
          expected_goals?: number | null
          expected_goals_against?: number | null
          fouls?: number | null
          game_id?: string | null
          id?: string
          pass_accuracy?: number | null
          passes?: number | null
          possession?: number | null
          red_cards?: number | null
          shots?: number | null
          shots_on_target?: number | null
          user_id: string
          yellow_cards?: number | null
        }
        Update: {
          corners?: number | null
          created_at?: string | null
          expected_goals?: number | null
          expected_goals_against?: number | null
          fouls?: number | null
          game_id?: string | null
          id?: string
          pass_accuracy?: number | null
          passes?: number | null
          possession?: number | null
          red_cards?: number | null
          shots?: number | null
          shots_on_target?: number | null
          user_id?: string
          yellow_cards?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "team_statistics_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "game_results"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_performances: {
        Row: {
          average_game_duration: number | null
          average_opponent_skill: number | null
          average_server_quality: number | null
          best_streak: number | null
          created_at: string
          current_rank: string | null
          custom_name: string | null
          end_date: string | null
          id: string
          is_completed: boolean | null
          minimum_rank: string | null
          personal_notes: string | null
          squad_used: string | null
          start_date: string
          starting_rank: string | null
          target_clean_sheets: number | null
          target_goals: number | null
          target_rank: string | null
          target_wins: number | null
          total_conceded: number | null
          total_expected_goals: number | null
          total_expected_goals_against: number | null
          total_goals: number | null
          total_losses: number | null
          total_play_time: number | null
          total_wins: number | null
          updated_at: string
          user_id: string
          week_number: number
          week_rating: string | null
          week_score: number | null
          weekly_rating: number | null
          worst_streak: number | null
        }
        Insert: {
          average_game_duration?: number | null
          average_opponent_skill?: number | null
          average_server_quality?: number | null
          best_streak?: number | null
          created_at?: string
          current_rank?: string | null
          custom_name?: string | null
          end_date?: string | null
          id?: string
          is_completed?: boolean | null
          minimum_rank?: string | null
          personal_notes?: string | null
          squad_used?: string | null
          start_date: string
          starting_rank?: string | null
          target_clean_sheets?: number | null
          target_goals?: number | null
          target_rank?: string | null
          target_wins?: number | null
          total_conceded?: number | null
          total_expected_goals?: number | null
          total_expected_goals_against?: number | null
          total_goals?: number | null
          total_losses?: number | null
          total_play_time?: number | null
          total_wins?: number | null
          updated_at?: string
          user_id: string
          week_number: number
          week_rating?: string | null
          week_score?: number | null
          weekly_rating?: number | null
          worst_streak?: number | null
        }
        Update: {
          average_game_duration?: number | null
          average_opponent_skill?: number | null
          average_server_quality?: number | null
          best_streak?: number | null
          created_at?: string
          current_rank?: string | null
          custom_name?: string | null
          end_date?: string | null
          id?: string
          is_completed?: boolean | null
          minimum_rank?: string | null
          personal_notes?: string | null
          squad_used?: string | null
          start_date?: string
          starting_rank?: string | null
          target_clean_sheets?: number | null
          target_goals?: number | null
          target_rank?: string | null
          target_wins?: number | null
          total_conceded?: number | null
          total_expected_goals?: number | null
          total_expected_goals_against?: number | null
          total_goals?: number | null
          total_losses?: number | null
          total_play_time?: number | null
          total_wins?: number | null
          updated_at?: string
          user_id?: string
          week_number?: number
          week_rating?: string | null
          week_score?: number | null
          weekly_rating?: number | null
          worst_streak?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "weekly_performances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }

      // --- NEW TABLES ---

      champs_leagues: {
        Row: {
          id: string
          name: string
          admin_user_id: string
          champs_run_end_date: string
          created_at: string
          updated_at: string
          is_completed: boolean | null
          league_code: string | null
          max_participants: number | null
          description: string | null
          status: string // We added this
        }
        Insert: {
          id?: string
          name: string
          admin_user_id: string
          champs_run_end_date: string
          created_at?: string
          updated_at?: string
          is_completed?: boolean | null
          league_code?: string | null
          max_participants?: number | null
          description?: string | null
          status?: string
        }
        Update: {
          id?: string
          name?: string
          admin_user_id?: string
          champs_run_end_date?: string
          created_at?: string
          updated_at?: string
          is_completed?: boolean | null
          league_code?: string | null
          max_participants?: number | null
          description?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "champs_leagues_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }

      champs_league_participants: {
        Row: {
          id: string
          league_id: string
          user_id: string
          joined_at: string
          total_points: number | null
          last_updated: string | null
          weekly_performance_id: string | null // We added this
        }
        Insert: {
          id?: string
          league_id: string
          user_id: string
          joined_at?: string
          total_points?: number | null
          last_updated?: string | null
          weekly_performance_id?: string | null
        }
        Update: {
          id?: string
          league_id?: string
          user_id?: string
          joined_at?: string
          total_points?: number | null
          last_updated?: string | null
          weekly_performance_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "champs_league_participants_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "champs_leagues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "champs_league_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "champs_league_participants_weekly_performance_id_fkey"
            columns: ["weekly_performance_id"]
            isOneToOne: false
            referencedRelation: "weekly_performances"
            referencedColumns: ["id"]
          },
        ]
      }

      champs_league_challenges: {
        Row: {
          id: string
          league_id: string
          challenge_id: string
          points: number
          created_at: string
        }
        Insert: {
          id?: string
          league_id: string
          challenge_id: string
          points: number
          created_at?: string
        }
        Update: {
          id?: string
          league_id?: string
          challenge_id?: string
          points?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "champs_league_challenges_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "champs_leagues"
            referencedColumns: ["id"]
          },
        ]
      }

      champs_league_challenge_results: {
        Row: {
          id: string
          league_id: string
          challenge_id: string
          user_id: string
          points_earned: number | null
          game_achieved: number | null
          metric_value: Json | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          league_id: string
          challenge_id: string
          user_id: string
          points_earned?: number | null
          game_achieved?: number | null
          metric_value?: Json | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          league_id?: string
          challenge_id?: string
          user_id?: string
          points_earned?: number | null
          game_achieved?: number | null
          metric_value?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "champs_league_challenge_results_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "champs_leagues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "champs_league_challenge_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }

      league_invites: {
        Row: {
          id: string
          league_id: string
          inviter_id: string
          invitee_id: string | null
          token: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          league_id: string
          inviter_id: string
          invitee_id?: string | null
          token: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          league_id?: string
          inviter_id?: string
          invitee_id?: string | null
          token?: string
          status?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "league_invites_inviter_id_fkey"
            columns: ["inviter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "league_invites_invitee_id_fkey"
            columns: ["invitee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "league_invites_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "champs_leagues"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      // --- ADD THIS NEW FUNCTION ---
      is_league_participant: {
        Args: {
          league_id_to_check: string
          user_id_to_check: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// --- HELPER TYPES (based on your schema) ---

// Base profile
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]

// Friend type using your 'friends' table structure
export type Friend = Database["public"]["Tables"]["friends"]["Row"] & {
  // We'll join the profile in the hook, calling it 'friend_profile'
  friend_profile: Profile 
}
// Friend request type
export type FriendRequest = Database["public"]["Tables"]["friends"]["Row"] & {
  // We'll join the requester's profile
  requester_profile: Profile
}

// League types
export type League = Database["public"]["Tables"]["champs_leagues"]["Row"]
export type LeagueParticipant = Database["public"]["Tables"]["champs_league_participants"]["Row"] & {
  profile: Profile // Joined participant profile
}
export type LeagueChallenge = Database["public"]["Tables"]["champs_league_challenges"]["Row"]
export type LeagueChallengeResult = Database["public"]["Tables"]["champs_league_challenge_results"]["Row"]
export type LeagueInvite = Database["public"]["Tables"]["league_invites"]["Row"]

// The complete, detailed league object
export type LeagueDetails = League & {
  participants: LeagueParticipant[]
  challenges: LeagueChallenge[]
  results: LeagueChallengeResult[]
  admin: Profile // Joined admin profile
}

// In-app invite, joined with league name and inviter profile
export type PendingLeagueInvite = LeagueInvite & {
  champs_leagues: Pick<League, "id" | "name">
  inviter: Pick<Profile, "id" | "display_name" | "username" | "avatar_url">
}


// --- EXISTING HELPER TYPES (from your file) ---

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const