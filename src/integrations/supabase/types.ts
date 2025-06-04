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
        }
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

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
