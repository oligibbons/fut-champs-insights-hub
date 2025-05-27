
import { GameResult, WeeklyPerformance } from '@/types/futChampions';

export function calculateGameRating(game: GameResult): { rating: string; score: number } {
  let score = 50; // Base score
  
  // Win/Loss impact (40 points)
  if (game.result === 'win') {
    score += 40;
  } else {
    score -= 20;
  }
  
  // Goal difference impact (20 points max)
  const [goalsFor, goalsAgainst] = game.scoreLine.split('-').map(Number);
  const goalDiff = goalsFor - goalsAgainst;
  score += Math.min(Math.max(goalDiff * 5, -20), 20);
  
  // XG performance (15 points max)
  const xgDiff = game.teamStats.actualGoals - game.teamStats.expectedGoals;
  score += Math.min(Math.max(xgDiff * 3, -10), 15);
  
  // Opponent skill bonus (10 points max)
  if (game.opponentSkill >= 8) score += 10;
  else if (game.opponentSkill >= 6) score += 5;
  else if (game.opponentSkill <= 3) score -= 5;
  
  // Clean sheet bonus (5 points)
  if (goalsAgainst === 0 && game.result === 'win') score += 5;
  
  // High scoring bonus (5 points)
  if (goalsFor >= 4) score += 5;
  
  // Penalty win bonus (5 points)
  if (game.penaltyShootout?.userWon) score += 5;
  
  // Game context penalties
  if (game.gameContext === 'rage_quit') score -= 5;
  if (game.gameContext === 'disconnect') score -= 10;
  if (game.gameContext === 'hacker') score -= 15;
  
  // Clamp score between 0 and 100
  score = Math.max(0, Math.min(100, score));
  
  // Convert to letter grade
  let rating = 'F';
  if (score >= 95) rating = 'S';
  else if (score >= 85) rating = 'A';
  else if (score >= 75) rating = 'B';
  else if (score >= 65) rating = 'C';
  else if (score >= 50) rating = 'D';
  
  return { rating, score: Math.round(score) };
}

export function calculateWeekRating(week: WeeklyPerformance): { rating: string; score: number } {
  if (week.games.length === 0) return { rating: 'F', score: 0 };
  
  let score = 50; // Base score
  
  // Win rate impact (40 points)
  const winRate = week.totalWins / week.games.length;
  score += winRate * 40;
  
  // Target achievement (20 points)
  if (week.winTarget && week.totalWins >= week.winTarget.wins) {
    score += 20;
  }
  
  // Goal difference (15 points max)
  const goalDiff = week.totalGoals - week.totalConceded;
  score += Math.min(Math.max(goalDiff, -15), 15);
  
  // XG performance (15 points max)
  const xgDiff = week.totalGoals - week.totalExpectedGoals;
  score += Math.min(Math.max(xgDiff * 2, -10), 15);
  
  // Opponent strength bonus (10 points max)
  if (week.averageOpponentSkill >= 7) score += 10;
  else if (week.averageOpponentSkill >= 5) score += 5;
  
  // Consistency bonus (10 points max)
  const gameRatings = week.games.map(game => calculateGameRating(game).score);
  const consistency = 100 - (Math.max(...gameRatings) - Math.min(...gameRatings));
  score += (consistency / 100) * 10;
  
  // Clamp score between 0 and 100
  score = Math.max(0, Math.min(100, score));
  
  // Convert to letter grade
  let rating = 'F';
  if (score >= 95) rating = 'S';
  else if (score >= 85) rating = 'A';
  else if (score >= 75) rating = 'B';
  else if (score >= 65) rating = 'C';
  else if (score >= 50) rating = 'D';
  
  return { rating, score: Math.round(score) };
}
