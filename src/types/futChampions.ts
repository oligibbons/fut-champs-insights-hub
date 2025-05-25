
export interface Player {
  id: string;
  name: string;
  position: string;
  overall: number;
  games: number;
  goals: number;
  assists: number;
  averageRating: number;
  yellowCards: number;
  redCards: number;
  substitutions: number;
  minutesPlayed: number;
}

export interface TeamStats {
  shots: number;
  shotsOnTarget: number;
  possession: number;
  expectedGoals: number;
  actualGoals: number;
  passes: number;
  passAccuracy: number;
  corners: number;
  fouls: number;
}

export interface GameResult {
  id: string;
  weekId: string;
  gameNumber: number;
  result: 'win' | 'loss' | 'draw';
  scoreLine: string;
  opponentSkill: number; // 1-10
  gameContext: 'normal' | 'rage_quit' | 'extra_time' | 'penalties' | 'disconnect' | 'hacker' | 'free_win';
  comments: string;
  playerStats: Player[];
  teamStats: TeamStats;
  date: string;
  duration: number; // in minutes
}

export interface Squad {
  id: string;
  name: string;
  formation: string;
  players: Player[];
  created: string;
  lastUsed: string;
}

export interface WeeklyPerformance {
  id: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  games: GameResult[];
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  totalGoals: number;
  totalConceded: number;
  averageOpponentSkill: number;
  squadUsed: string; // squad ID
  weeklyRating: number;
  isCompleted: boolean;
}

export interface AIInsight {
  id: string;
  type: 'tactical' | 'player' | 'formation' | 'general';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  generated: string;
}

export interface UserSettings {
  preferredFormation: string;
  trackingStartDate: string;
  gameplayStyle: 'aggressive' | 'balanced' | 'defensive';
  notifications: boolean;
}
