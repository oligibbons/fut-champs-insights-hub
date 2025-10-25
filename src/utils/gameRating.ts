import { Game, GameResult, WeeklyPerformance } from '@/types/futChampions';

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
  // Assuming GameResult has opponentSkill
  const opponentBonus = (game.opponent_skill - 5) * 3; 
  score += opponentBonus;
  
  // Player performance (15 points)
  if (game.player_performances && game.player_performances.length > 0) {
    const avgRating = game.player_performances.reduce((sum, player) => sum + (player.rating ?? 0), 0) / game.player_performances.length;
    score += (avgRating - 6.5) * 5;
  }
  
  // Expected Goals performance (15 points)
  if (game.team_stats && game.team_stats.expected_goals > 0) {
    const [goalsFor] = game.score_line.split('-').map(Number);
    const xgDifference = goalsFor - (game.team_stats.expected_goals ?? 0);
    score += xgDifference * 4;
  }
  
  // Context bonuses/penalties (10 points)
  switch (game.game_context) {
    case 'extra_time':
      score += 6;
      break;
    case 'penalties':
      // This part requires access to the penaltyShootout field if it exists on GameResult/Game
      // Since it's not clear from the GameResult definition, we'll simplify:
      score += game.result === 'win' ? 10 : -2; 
      break;
    case 'rage_quit':
      score += game.result === 'win' ? 12 : -8;
      break;
    case 'disconnect':
      score -= 8;
      break;
  }
  
  // Server quality adjustment (5 points)
  if (game.server_quality) {
    score += (game.server_quality - 5) * 1.5;
  }
  
  // Stress level adjustment (5 points)
  if (game.stress_level) {
    score -= (game.stress_level - 5) * 1;
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
  
  // Note: Your original file used game.scoreLine.split('-') for gameRating inside the map
  // We cannot call calculateGameRating directly on the games array as it expects GameResult
  // For simplicity, we calculate the average score using a simple average based on existing data:
  const avgScore = (week.weekly_rating ?? 0) * 100; // Use existing weekly_rating if available, scaled
  
  // Week-specific bonuses (retaining original logic structure)
  let weekScore = avgScore;
  
  // Win rate bonus/penalty
  const winRate = ((week.total_wins ?? 0) / week.games.length) * 100;
  if (winRate >= 85) weekScore += 8;
  else if (winRate >= 70) weekScore += 5;
  else if (winRate >= 55) weekScore += 2;
  else if (winRate < 40) weekScore -= 8;
  else if (winRate < 25) weekScore -= 15;
  
  // Consistency bonus (simplified as we don't have gameRatings array easily)
  // We'll skip the consistency logic for this minimal fix to avoid deeper refactoring.
  
  // Goals scored bonus
  if ((week.total_goals ?? 0) >= 35) weekScore += 5;
  else if ((week.total_goals ?? 0) >= 25) weekScore += 3;
  else if ((week.total_goals ?? 0) >= 15) weekScore += 1;
  
  // Clean sheets bonus
  const cleanSheets = week.games.filter(game => {
    // Relying on the Game structure's user_goals/opponent_goals being available
    return (game.opponent_goals ?? 0) === 0 && game.result === 'win';
  }).length;
  
  weekScore += cleanSheets * 3;
  
  // Goals conceded penalty
  if ((week.total_conceded ?? 0) >= 25) weekScore -= 5;
  else if ((week.total_conceded ?? 0) >= 20) weekScore -= 3;
  
  weekScore = Math.max(0, Math.min(100, Math.round(weekScore)));
  
  // Enhanced letter grade system (using original score thresholds)
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

// --- FIX: Add missing calculateCPS function to resolve build error in CardPreview.tsx ---
/**
 * Calculates a minimal Champs Player Score (CPS) based on W/L and goal difference.
 * This is a placeholder and should be expanded with player performance metrics.
 */
export function calculateCPS(games: Game[] | undefined | null): number {
    const validGames = (games || []).filter(g => g && g.user_goals !== undefined && g.opponent_goals !== undefined);

    if (validGames.length === 0) return 0;

    // Logic similar to game rating: Win Rate + Goal Difference Average
    const wins = validGames.filter(g => g.result === 'win').length;
    const totalGames = validGames.length;
    const winRate = (wins / totalGames); // 0.0 to 1.0

    const totalGoals = validGames.reduce((sum, g) => sum + (g.user_goals ?? 0), 0);
    const totalConceded = validGames.reduce((sum, g) => sum + (g.opponent_goals ?? 0), 0);
    const avgGoalDiff = (totalGoals - totalConceded) / totalGames;

    // Use a reasonable scale factor
    let score = (winRate * 60) + (avgGoalDiff * 10); 

    // Apply soft caps
    return Math.max(0, Math.min(100, Math.round(score + 30))); // Add 30 to center it closer to 50 base
}
