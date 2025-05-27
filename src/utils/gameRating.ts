
import { GameResult, WeeklyPerformance } from '@/types/futChampions';

export function calculateGameRating(game: GameResult, week: WeeklyPerformance): { letter: string; score: number; color: string } {
  let score = 50; // Base score
  
  // Win/Loss impact (40 points)
  if (game.result === 'win') {
    score += 30;
    
    // Bonus for decisive wins
    const [goalsFor, goalsAgainst] = game.scoreLine.split('-').map(Number);
    const goalDifference = goalsFor - goalsAgainst;
    if (goalDifference >= 3) score += 10;
    else if (goalDifference >= 2) score += 5;
    
    // Clean sheet bonus
    if (goalsAgainst === 0) score += 5;
  } else {
    score -= 20;
    
    // Penalty for heavy defeats
    const [goalsFor, goalsAgainst] = game.scoreLine.split('-').map(Number);
    const goalDifference = goalsAgainst - goalsFor;
    if (goalDifference >= 3) score -= 10;
    else if (goalDifference >= 2) score -= 5;
  }
  
  // Opponent skill adjustment (15 points)
  const opponentBonus = (game.opponentSkill - 5) * 2;
  score += opponentBonus;
  
  // Player performance (20 points)
  if (game.playerStats && game.playerStats.length > 0) {
    const avgRating = game.playerStats.reduce((sum, player) => sum + player.rating, 0) / game.playerStats.length;
    score += (avgRating - 6) * 4;
  }
  
  // Expected Goals performance (10 points)
  if (game.teamStats.expectedGoals > 0) {
    const [goalsFor] = game.scoreLine.split('-').map(Number);
    const xgDifference = goalsFor - game.teamStats.expectedGoals;
    score += xgDifference * 3;
  }
  
  // Context bonuses/penalties (10 points)
  switch (game.gameContext) {
    case 'extra_time':
      score += 5;
      break;
    case 'penalties':
      score += game.penaltyShootout?.userWon ? 8 : -3;
      break;
    case 'rage_quit':
      score += game.result === 'win' ? 10 : -5;
      break;
    case 'disconnect':
      score -= 5;
      break;
  }
  
  // Server quality adjustment (5 points)
  if (game.serverQuality) {
    score += (game.serverQuality - 5);
  }
  
  // Stress level adjustment (5 points)
  if (game.stressLevel) {
    score -= (game.stressLevel - 5) * 0.5;
  }
  
  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, Math.round(score)));
  
  // Determine letter grade and color
  let letter: string;
  let color: string;
  
  if (score >= 90) {
    letter = 'S';
    color = '#9932CC';
  } else if (score >= 80) {
    letter = 'A';
    color = '#32CD32';
  } else if (score >= 70) {
    letter = 'B';
    color = '#FFD700';
  } else if (score >= 50) {
    letter = 'C';
    color = '#FF8C00';
  } else if (score >= 40) {
    letter = 'D';
    color = '#DC143C';
  } else {
    letter = 'F';
    color = '#8B0000';
  }
  
  return { letter, score, color };
}

export function calculateWeekRating(week: WeeklyPerformance): { letter: string; score: number; color: string } {
  if (week.games.length === 0) {
    return { letter: 'F', score: 0, color: '#8B0000' };
  }
  
  const gameRatings = week.games.map(game => calculateGameRating(game, week));
  const avgScore = gameRatings.reduce((sum, rating) => sum + rating.score, 0) / gameRatings.length;
  
  // Week-specific bonuses
  let weekScore = avgScore;
  
  // Win rate bonus
  const winRate = (week.totalWins / week.games.length) * 100;
  if (winRate >= 80) weekScore += 5;
  else if (winRate >= 60) weekScore += 2;
  else if (winRate < 40) weekScore -= 5;
  
  // Consistency bonus (less variation in game ratings)
  const ratingVariation = Math.sqrt(
    gameRatings.reduce((sum, rating) => sum + Math.pow(rating.score - avgScore, 2), 0) / gameRatings.length
  );
  
  if (ratingVariation < 10) weekScore += 3;
  else if (ratingVariation > 20) weekScore -= 2;
  
  // Goals scored bonus
  if (week.totalGoals >= 30) weekScore += 3;
  else if (week.totalGoals >= 20) weekScore += 1;
  
  // Clean sheets bonus
  const cleanSheets = week.games.filter(game => {
    const [, goalsAgainst] = game.scoreLine.split('-').map(Number);
    return goalsAgainst === 0 && game.result === 'win';
  }).length;
  
  weekScore += cleanSheets * 2;
  
  weekScore = Math.max(0, Math.min(100, Math.round(weekScore)));
  
  // Determine letter grade and color
  let letter: string;
  let color: string;
  
  if (weekScore >= 90) {
    letter = 'S';
    color = '#9932CC';
  } else if (weekScore >= 80) {
    letter = 'A';
    color = '#32CD32';
  } else if (weekScore >= 70) {
    letter = 'B';
    color = '#FFD700';
  } else if (weekScore >= 50) {
    letter = 'C';
    color = '#FF8C00';
  } else if (weekScore >= 40) {
    letter = 'D';
    color = '#DC143C';
  } else {
    letter = 'F';
    color = '#8B0000';
  }
  
  return { letter, score: weekScore, color };
}
