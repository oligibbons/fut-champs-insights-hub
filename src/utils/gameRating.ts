
import { GameResult, WeeklyPerformance } from '@/types/futChampions';

export function calculateGameRating(game: GameResult, week: WeeklyPerformance): { letter: string; score: number; color: string } {
  let score = 50; // Base score
  
  // Win/Loss impact (30 points)
  if (game.result === 'win') {
    score += 20;
    
    // Bonus for decisive wins
    const [goalsFor, goalsAgainst] = game.scoreLine.split('-').map(Number);
    const goalDifference = goalsFor - goalsAgainst;
    if (goalDifference >= 4) score += 15;
    else if (goalDifference >= 3) score += 10;
    else if (goalDifference >= 2) score += 5;
    
    // Clean sheet bonus
    if (goalsAgainst === 0) score += 8;
  } else {
    score -= 15;
    
    // Penalty for heavy defeats
    const [goalsFor, goalsAgainst] = game.scoreLine.split('-').map(Number);
    const goalDifference = goalsAgainst - goalsFor;
    if (goalDifference >= 4) score -= 15;
    else if (goalDifference >= 3) score -= 10;
    else if (goalDifference >= 2) score -= 5;
  }
  
  // Opponent skill adjustment (20 points)
  const opponentBonus = (game.opponentSkill - 5) * 3;
  score += opponentBonus;
  
  // Player performance (15 points)
  if (game.playerStats && game.playerStats.length > 0) {
    const avgRating = game.playerStats.reduce((sum, player) => sum + player.rating, 0) / game.playerStats.length;
    score += (avgRating - 6.5) * 5;
  }
  
  // Expected Goals performance (15 points)
  if (game.teamStats.expectedGoals > 0) {
    const [goalsFor] = game.scoreLine.split('-').map(Number);
    const xgDifference = goalsFor - game.teamStats.expectedGoals;
    score += xgDifference * 4;
  }
  
  // Context bonuses/penalties (10 points)
  switch (game.gameContext) {
    case 'extra_time':
      score += 6;
      break;
    case 'penalties':
      score += game.penaltyShootout?.userWon ? 10 : -2;
      break;
    case 'rage_quit':
      score += game.result === 'win' ? 12 : -8;
      break;
    case 'disconnect':
      score -= 8;
      break;
  }
  
  // Server quality adjustment (5 points)
  if (game.serverQuality) {
    score += (game.serverQuality - 5) * 1.5;
  }
  
  // Stress level adjustment (5 points)
  if (game.stressLevel) {
    score -= (game.stressLevel - 5) * 1;
  }
  
  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, Math.round(score)));
  
  // Enhanced letter grade system with + and - modifiers
  let letter: string;
  let color: string;
  
  if (score >= 95) {
    letter = 'S+';
    color = '#9932CC';
  } else if (score >= 90) {
    letter = 'S';
    color = '#9932CC';
  } else if (score >= 87) {
    letter = 'A+';
    color = '#32CD32';
  } else if (score >= 83) {
    letter = 'A';
    color = '#32CD32';
  } else if (score >= 80) {
    letter = 'A-';
    color = '#90EE90';
  } else if (score >= 77) {
    letter = 'B+';
    color = '#FFD700';
  } else if (score >= 73) {
    letter = 'B';
    color = '#FFD700';
  } else if (score >= 70) {
    letter = 'B-';
    color = '#F0E68C';
  } else if (score >= 67) {
    letter = 'C+';
    color = '#FF8C00';
  } else if (score >= 63) {
    letter = 'C';
    color = '#FF8C00';
  } else if (score >= 60) {
    letter = 'C-';
    color = '#DEB887';
  } else if (score >= 55) {
    letter = 'D+';
    color = '#DC143C';
  } else if (score >= 50) {
    letter = 'D';
    color = '#DC143C';
  } else if (score >= 45) {
    letter = 'D-';
    color = '#B22222';
  } else if (score >= 35) {
    letter = 'E';
    color = '#8B0000';
  } else if (score >= 25) {
    letter = 'F+';
    color = '#800000';
  } else {
    letter = 'F';
    color = '#800000';
  }
  
  return { letter, score, color };
}

export function calculateWeekRating(week: WeeklyPerformance): { letter: string; score: number; color: string } {
  if (week.games.length === 0) {
    return { letter: 'F', score: 0, color: '#800000' };
  }
  
  const gameRatings = week.games.map(game => calculateGameRating(game, week));
  const avgScore = gameRatings.reduce((sum, rating) => sum + rating.score, 0) / gameRatings.length;
  
  // Week-specific bonuses
  let weekScore = avgScore;
  
  // Win rate bonus/penalty
  const winRate = (week.totalWins / week.games.length) * 100;
  if (winRate >= 85) weekScore += 8;
  else if (winRate >= 70) weekScore += 5;
  else if (winRate >= 55) weekScore += 2;
  else if (winRate < 40) weekScore -= 8;
  else if (winRate < 25) weekScore -= 15;
  
  // Consistency bonus (less variation in game ratings)
  const ratingVariation = Math.sqrt(
    gameRatings.reduce((sum, rating) => sum + Math.pow(rating.score - avgScore, 2), 0) / gameRatings.length
  );
  
  if (ratingVariation < 8) weekScore += 5;
  else if (ratingVariation < 15) weekScore += 2;
  else if (ratingVariation > 25) weekScore -= 5;
  
  // Goals scored bonus
  if (week.totalGoals >= 35) weekScore += 5;
  else if (week.totalGoals >= 25) weekScore += 3;
  else if (week.totalGoals >= 15) weekScore += 1;
  
  // Clean sheets bonus
  const cleanSheets = week.games.filter(game => {
    const [, goalsAgainst] = game.scoreLine.split('-').map(Number);
    return goalsAgainst === 0 && game.result === 'win';
  }).length;
  
  weekScore += cleanSheets * 3;
  
  // Goals conceded penalty
  if (week.totalConceded >= 25) weekScore -= 5;
  else if (week.totalConceded >= 20) weekScore -= 3;
  
  weekScore = Math.max(0, Math.min(100, Math.round(weekScore)));
  
  // Enhanced letter grade system
  let letter: string;
  let color: string;
  
  if (weekScore >= 95) {
    letter = 'S+';
    color = '#9932CC';
  } else if (weekScore >= 90) {
    letter = 'S';
    color = '#9932CC';
  } else if (weekScore >= 87) {
    letter = 'A+';
    color = '#32CD32';
  } else if (weekScore >= 83) {
    letter = 'A';
    color = '#32CD32';
  } else if (weekScore >= 80) {
    letter = 'A-';
    color = '#90EE90';
  } else if (weekScore >= 77) {
    letter = 'B+';
    color = '#FFD700';
  } else if (weekScore >= 73) {
    letter = 'B';
    color = '#FFD700';
  } else if (weekScore >= 70) {
    letter = 'B-';
    color = '#F0E68C';
  } else if (weekScore >= 67) {
    letter = 'C+';
    color = '#FF8C00';
  } else if (weekScore >= 63) {
    letter = 'C';
    color = '#FF8C00';
  } else if (weekScore >= 60) {
    letter = 'C-';
    color = '#DEB887';
  } else if (weekScore >= 55) {
    letter = 'D+';
    color = '#DC143C';
  } else if (weekScore >= 50) {
    letter = 'D';
    color = '#DC143C';
  } else if (weekScore >= 45) {
    letter = 'D-';
    color = '#B22222';
  } else if (weekScore >= 35) {
    letter = 'E';
    color = '#8B0000';
  } else if (weekScore >= 25) {
    letter = 'F+';
    color = '#800000';
  } else {
    letter = 'F';
    color = '#800000';
  }
  
  return { letter, score: weekScore, color };
}
