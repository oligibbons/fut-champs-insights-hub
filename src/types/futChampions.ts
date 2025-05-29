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
  goalInvolvements?: number; // Goals + Assists
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
  tactics?: string; // cutbacks, long shots, skill moves, etc.
}

export interface PenaltyShootout {
  userScore: number;
  opponentScore: number;
  userWon: boolean;
}

export interface GameResult {
  id: string;
  weekId: string;
  gameNumber: number;
  result: 'win' | 'loss';
  scoreLine: string;
  penaltyShootout?: PenaltyShootout;
  opponentSkill: number; // 1-10
  gameContext: 'normal' | 'rage_quit' | 'extra_time' | 'penalties' | 'disconnect' | 'hacker' | 'free_win';
  comments: string;
  playerStats: PlayerPerformance[];
  teamStats: TeamStats;
  opponentAnalysis?: OpponentAnalysis;
  date: string;
  time?: string;
  duration: number; // in minutes
  actualGameTime?: number; // Time actually playing vs paused
  rageMoments?: number; // How many times you wanted to rage quit
  stressLevel?: number; // 1-10 how stressful the game was
  squadUsed?: string; // Squad ID
  serverQuality?: number; // 1-10 rating of gameplay/server quality
  gameRating?: string; // F, D, C, B, A, S
  gameScore?: number; // 0-100
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

export interface QualifierRun {
  id: string;
  totalGames: number;
  winsRequired: number;
  games: GameResult[];
  isCompleted: boolean;
  qualified: boolean;
  startDate: string;
  endDate?: string;
}

export interface WeeklyPerformance {
  id: string;
  weekNumber: number;
  customName?: string; // New field for custom week names
  startDate: string;
  endDate: string;
  games: GameResult[];
  qualifierRun?: QualifierRun;
  totalWins: number;
  totalLosses: number;
  totalGoals: number;
  totalConceded: number;
  totalExpectedGoals: number;
  totalExpectedGoalsAgainst: number;
  averageOpponentSkill: number;
  squadUsed: string; // squad ID
  weeklyRating: number;
  weekRating?: string; // F, D, C, B, A, S
  weekScore?: number; // 0-100
  isCompleted: boolean;
  winTarget?: WeeklyTarget;
  currentRank?: string;
  startingRank?: string;
  bestStreak?: number;
  worstStreak?: number;
  averageGameDuration?: number;
  totalPlayTime?: number; // in minutes
  averageServerQuality?: number;
  targetRank?: string;
  targetWins?: number;
  personalNotes?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'wins' | 'goals' | 'streaks' | 'performance' | 'consistency' | 'milestone' | 'special' | 'legend';
  unlockedAt?: string;
  progress?: number;
  target?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  tier?: number; // For progressive achievements
}

export interface PlayerMilestone {
  playerId: string;
  type: 'goals' | 'assists' | 'appearances' | 'clean_sheets' | 'rating';
  milestone: number;
  achieved: boolean;
  achievedAt?: string;
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
  type: 'tactical' | 'player' | 'formation' | 'general' | 'opponent' | 'prediction' | 'improvement';
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

export interface AppTheme {
  id: string;
  name: string;
  description: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
}

export interface UserSettings {
  preferredFormation: string;
  trackingStartDate: string;
  gameplayStyle: 'aggressive' | 'balanced' | 'defensive';
  notifications: boolean;
  gamesPerWeek: number;
  theme: string;
  dashboardSettings: DashboardSettings;
  currentWeekSettings: DashboardSettings;
  qualifierSettings: {
    totalGames: number;
    winsRequired: number;
  };
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
    showAnimations: boolean;
    dynamicFeedback: boolean;
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
  mvp?: string; // Most Valuable Player
  liability?: string; // Player letting team down
}

export interface GlobalPlayerStats {
  playerId: string;
  name: string;
  position: string;
  totalGames: number;
  totalGoals: number;
  totalAssists: number;
  goalInvolvements: number;
  averageRating: number;
  totalMinutes: number;
  yellowCards: number;
  redCards: number;
  cleanSheets: number;
  biggestWin: string;
  biggestLoss: string;
  hatTricks: number;
  consistency: number;
  formTrend: 'improving' | 'declining' | 'stable';
}

export interface MatchFeedback {
  type: 'encouragement' | 'motivation' | 'analysis' | 'tip';
  message: string;
  context: 'win' | 'loss' | 'milestone' | 'streak';
}

// FC25 Rank System - Updated with correct win requirements
export const FC25_RANKS = [
  { name: 'Rank X', wins: 2, color: '#8B4513' },
  { name: 'Rank IX', wins: 4, color: '#CD853F' },
  { name: 'Rank VIII', wins: 6, color: '#DAA520' },
  { name: 'Rank VII', wins: 7, color: '#FFD700' },
  { name: 'Rank VI', wins: 8, color: '#00CED1' },
  { name: 'Rank V', wins: 9, color: '#1E90FF' },
  { name: 'Rank IV', wins: 10, color: '#9932CC' },
  { name: 'Rank III', wins: 11, color: '#FF1493' },
  { name: 'Rank II', wins: 13, color: '#FF4500' },
  { name: 'Rank I', wins: 15, color: '#FF0000' }
];

// Game Rating System
export const GAME_RATINGS = [
  { letter: 'F', minScore: 0, maxScore: 39, color: '#8B0000' },
  { letter: 'D', minScore: 40, maxScore: 49, color: '#DC143C' },
  { letter: 'C', minScore: 50, maxScore: 69, color: '#FF8C00' },
  { letter: 'B', minScore: 70, maxScore: 79, color: '#FFD700' },
  { letter: 'A', minScore: 80, maxScore: 89, color: '#32CD32' },
  { letter: 'S', minScore: 90, maxScore: 100, color: '#9932CC' }
];
