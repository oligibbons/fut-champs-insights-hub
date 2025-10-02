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
  yellowCards: number;
  redCards: number;
  offsides?: number;
  crosses?: number;
  duelsWon?: number;
  tacklesSuccessful?: number;
  distanceCovered: number;
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
  gameNumber: number;
  result: 'win' | 'loss';
  scoreLine: string;
  date: string;
  opponentSkill: number;
  duration: number; // in minutes
  gameContext: 'normal' | 'rage_quit' | 'extra_time' | 'penalties' | 'disconnect' | 'hacker' | 'free_win';
  comments?: string;
  teamStats: TeamStats;
  playerStats: PlayerPerformance[];
  crossPlayEnabled?: boolean;
  penaltyShootout?: PenaltyShootout;
  time?: string; // Time of day the game was played
  actualGameTime?: number; // Actual game duration in minutes
  stressLevel?: number; // 1-10 stress level
  serverQuality?: number; // 1-10 server quality rating
  gameRating?: string; // A-F rating for the game
  datePlayed?: string;
  gameScore?: number;
  rageQuits?: number;
  timePlayed?: string;
  crossPlay?: boolean;
  tags?: string[]; // Match tags
  opponentPlayStyle?: string; // Opponent play style
  opponentFormation?: string; // Opponent formation
  opponentSquadRating?: number; // Opponent squad rating
  game_version?: string;
}

export interface Squad {
  id: string;
  name: string;
  formation: string;
  players: Player[];
  created: string;
  lastUsed: string;
  isDefault?: boolean;
  startingXI?: Array<{
    position: string;
    player?: Player;
  }>;
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
  currentStreak?: number; 
  gamesPlayed?: number; 
  averageGameDuration?: number;
  totalPlayTime?: number; // in minutes
  averageServerQuality?: number;
  targetRank?: string;
  targetWins?: number;
  personalNotes?: string;
  cpsScore?: number; // Champs Performance Score
  game_version?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'games' | 'wins' | 'goals' | 'streaks' | 'weekly' | 'cleanSheets' | 'assists' | 'special' | 'time' | 'defense' | 'squads' | 'formations' | 'consistency' | 'efficiency' | 'stats' | 'opponents' | 'engagement' | 'social' | 'competitive' | 'meta' | 'ultimate' | 'hidden' | 'improvement' | 'variety';
  threshold: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
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
  gameplayStyle: 'attacking' | 'balanced' | 'defensive' | 'possession' | 'counter';
  notifications: boolean;
  gamesPerWeek: number;
  theme: string;
  carouselSpeed: number;
  defaultCrossPlay?: boolean;
  dashboardSettings: {
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
  };
  currentWeekSettings: {
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
  };
  qualifierSettings: {
    totalGames: number;
    winsRequired: number;
  };
  targetSettings: {
    autoSetTargets: boolean;
    adaptiveTargets: boolean;
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

// Game Rating System
export const GAME_RATINGS = [
  { letter: 'F', minScore: 0, maxScore: 39, color: '#8B0000' },
  { letter: 'D', minScore: 40, maxScore: 49, color: '#DC143C' },
  { letter: 'C', minScore: 50, maxScore: 69, color: '#FF8C00' },
  { letter: 'B', minScore: 70, maxScore: 79, color: '#FFD700' },
  { letter: 'A', minScore: 80, maxScore: 89, color: '#32CD32' },
  { letter: 'S', minScore: 90, maxScore: 100, color: '#9932CC' }
];

// CPS (Champs Performance Score) weights
export const CPS_WEIGHTS = {
  goalsScored: 0.30, 
  xgDifferential: 0.25,
  playerRating: 0.20,
  goalsConceded: 0.15,
  cards: 0.10,
  result: 0.30
};

// FC25 Reward Ranks (Old Style) - Renamed `name` to `rank` for consistency
export const FC25_REWARD_RANKS = [
  { rank: 'Rank X', wins: 2 },
  { rank: 'Rank IX', wins: 4 },
  { rank: 'Rank VIII', wins: 6 },
  { rank: 'Rank VII', wins: 7 },
  { rank: 'Rank VI', wins: 8 },
  { rank: 'Rank V', wins: 9 },
  { rank: 'Rank IV', wins: 10 },
  { rank: 'Rank III', wins: 11 },
  { rank: 'Rank II', wins: 13 },
  { rank: 'Rank I', wins: 15 }
];

// FC26 Reward Ranks (New Style - Reversed)
const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV"];
export const FC26_REWARD_RANKS = Array.from({ length: 15 }, (_, i) => ({
  wins: i + 1,
  rank: `Rank ${romanNumerals[14 - i]}` // Reverses numerals so 1 win = Rank XV, 15 wins = Rank I
}));

export const getRewardRanks = (gameVersion: string) => {
  return gameVersion === 'FC25' ? FC25_REWARD_RANKS : FC26_REWARD_RANKS;
};

