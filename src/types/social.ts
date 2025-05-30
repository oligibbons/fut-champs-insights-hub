
export interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  friend_profile: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    total_games: number;
    total_wins: number;
    total_goals: number;
    best_rank: string | null;
    current_streak: number;
    best_streak: number;
    created_at: string;
    updated_at: string;
  };
}

export interface UserProfile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  total_games: number;
  total_wins: number;
  total_goals: number;
  best_rank: string | null;
  current_streak: number;
  best_streak: number;
  created_at: string;
  updated_at: string;
}
