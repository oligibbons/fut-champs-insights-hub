
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
  keyPasses?: number;
  shotsOnTarget?: number;
  tackles?: number;
  interceptions?: number;
  passAccuracy?: number;
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
  formRating?: number; // Recent form out of 10
  consistency?: number; // How consistent their performances are
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
  offsides?: number;
  crosses?: number;
  duelsWon?: number;
  tacklesSuccessful?: number;
}

export interface OpponentAnalysis {
  skillLevel: number;
  playStyle: 'aggressive' | 'defensive' | 'possession' | 'counter_attack' | 'balanced';
  formation: string;
  notes: string;
  weaknesses: string[];
  strengths: string[];
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
  opponentAnalysis?: OpponentAnalysis;
  date: string;
  duration: number; // in minutes
  actualGameTime?: number; // Time actually playing vs paused
  rageMoments?: number; // How many times you wanted to rage quit
  stressLevel?: number; // 1-10 how stressful the game was
  squadUsed?: string; // Squad ID
}

export interface Squad {
  id: string;
  name: string;
  formation: string;
  players: Player[];
  created: string;
  lastUsed: string;
}

export interface WeeklyTarget {
  wins: number;
  minimumRank?: string;
  goalsScored?: number;
  cleanSheets?: number;
  custom?: string;
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
  winTarget?: WeeklyTarget;
  currentRank?: string;
  startingRank?: string;
  bestStreak?: number;
  worstStreak?: number;
  averageGameDuration?: number;
  totalPlayTime?: number; // in minutes
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'wins' | 'goals' | 'streaks' | 'performance' | 'consistency' | 'milestone';
  unlockedAt?: string;
  progress?: number;
  target?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface PlayerForm {
  playerId: string;
  last5Games: number[]; // ratings from last 5 games
  trend: 'improving' | 'declining' | 'stable';
  consistency: number; // 0-100
  confidence: number; // 0-100 based on recent performances
}

export interface AIInsight {
  id: string;
  type: 'tactical' | 'player' | 'formation' | 'general' | 'opponent' | 'prediction';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  generated: string;
  priority: 'low' | 'medium' | 'high';
  category: 'strength' | 'weakness' | 'opportunity' | 'threat';
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
  showAchievements: boolean;
  showTargetProgress: boolean;
  showTimeAnalysis: boolean;
  showStressAnalysis: boolean;
}

export interface UserSettings {
  preferredFormation: string;
  trackingStartDate: string;
  gameplayStyle: 'aggressive' | 'balanced' | 'defensive';
  notifications: boolean;
  gamesPerWeek: number;
  dashboardSettings: DashboardSettings;
  currentWeekSettings: DashboardSettings;
  targetSettings: {
    autoSetTargets: boolean;
    adaptiveTargets: boolean; // Adjust based on performance
    notifyOnTarget: boolean;
  };
  analyticsPreferences: {
    detailedPlayerStats: boolean;
    opponentTracking: boolean;
    timeTracking: boolean;
    stressTracking: boolean;
  };
}

export interface WeeklyStats {
  avgRating: number;
  totalMinutes: number;
  bestPlayer: string;
  worstPerformance: number;
  consistencyScore: number;
  improvement: number; // vs previous week
  predictedNextWeekWins: number;
}
