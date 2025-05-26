
export interface PlayerPerformance {
  id: string;
  name: string;
  position: string;
  rating: number; // out of 10, to 1 decimal place
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  ownGoals: number;
  minutesPlayed: number;
  wasSubstituted: boolean;
}

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
  expectedGoalsAgainst: number;
  actualGoalsAgainst: number;
  passes: number;
  passAccuracy: number;
  corners: number;
  fouls: number;
}

export interface GameResult {
  id: string;
  weekId: string;
  gameNumber: number;
  result: 'win' | 'loss';
  scoreLine: string;
  opponentSkill: number; // 1-10
  gameContext: 'normal' | 'rage_quit' | 'extra_time' | 'penalties' | 'disconnect' | 'hacker' | 'free_win';
  comments: string;
  playerStats: PlayerPerformance[];
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
  totalGoals: number;
  totalConceded: number;
  totalExpectedGoals: number;
  totalExpectedGoalsAgainst: number;
  averageOpponentSkill: number;
  squadUsed: string; // squad ID
  weeklyRating: number;
  isCompleted: boolean;
  winTarget?: number; // Target wins for the week
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

export interface DashboardSettings {
  showTopPerformers: boolean;
  showXGAnalysis: boolean;
  showAIInsights: boolean;
  showFormAnalysis: boolean;
  showWeaknesses: boolean;
  showOpponentAnalysis: boolean;
  showPositionalAnalysis: boolean;
  showRecentTrends: boolean;
}

export interface UserSettings {
  preferredFormation: string;
  trackingStartDate: string;
  gameplayStyle: 'aggressive' | 'balanced' | 'defensive';
  notifications: boolean;
  gamesPerWeek: number;
  dashboardSettings: DashboardSettings;
  currentWeekSettings: DashboardSettings;
}
