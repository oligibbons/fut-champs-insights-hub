import { WeeklyPerformance, GameResult } from '@/types/futChampions';

export function generateAIInsights(
  completedWeeks: WeeklyPerformance[],
  currentWeek: WeeklyPerformance | null,
  recentGames: GameResult[]
) {
  // Calculate overall stats
  const totalGames = completedWeeks.reduce((sum, week) => sum + week.games.length, 0);
  const totalWins = completedWeeks.reduce((sum, week) => sum + week.totalWins, 0);
  const totalGoals = completedWeeks.reduce((sum, week) => sum + week.totalGoals, 0);
  const totalConceded = completedWeeks.reduce((sum, week) => sum + week.totalConceded, 0);
  
  const winRate = totalGames > 0 ? (totalWins / totalGames) * 100 : 0;
  const avgGoalsPerGame = totalGames > 0 ? totalGoals / totalGames : 0;
  const avgConcededPerGame = totalGames > 0 ? totalConceded / totalGames : 0;
  
  // Calculate recent form
  const recentWins = recentGames.filter(game => game.result === 'win').length;
  const recentWinRate = recentGames.length > 0 ? (recentWins / recentGames.length) * 100 : 0;
  
  // Generate insights
  const insights = [];
  
  // Win rate insights
  if (winRate >= 70) {
    insights.push({
      id: 'high-win-rate',
      type: 'performance',
      title: 'Elite Win Rate',
      description: `Your ${winRate.toFixed(1)}% win rate is exceptional. You're consistently outperforming most players.`,
      confidence: 95,
      priority: 'low',
      category: 'strength',
      severity: 'low'
    });
  } else if (winRate >= 50 && winRate < 70) {
    insights.push({
      id: 'good-win-rate',
      type: 'performance',
      title: 'Solid Win Rate',
      description: `Your ${winRate.toFixed(1)}% win rate shows you're a competent player with room to reach elite status.`,
      confidence: 90,
      priority: 'medium',
      category: 'strength',
      severity: 'medium'
    });
  } else if (winRate < 50) {
    insights.push({
      id: 'below-average-win-rate',
      type: 'performance',
      title: 'Win Rate Needs Improvement',
      description: `Your ${winRate.toFixed(1)}% win rate suggests you're struggling to maintain consistency.`,
      confidence: 85,
      priority: 'high',
      category: 'weakness',
      severity: 'medium'
    });
  }
  
  // Recent form insights
  if (recentGames.length >= 5) {
    const formDifference = recentWinRate - winRate;
    
    if (formDifference >= 15) {
      insights.push({
        id: 'improving-form',
        type: 'performance',
        title: 'Improving Form',
        description: `Your recent win rate of ${recentWinRate.toFixed(1)}% is ${formDifference.toFixed(1)}% better than your overall average. You're showing significant improvement.`,
        confidence: 85,
        priority: 'medium',
        category: 'strength',
        severity: 'low'
      });
    } else if (formDifference <= -15) {
      insights.push({
        id: 'declining-form',
        type: 'performance',
        title: 'Declining Form',
        description: `Your recent win rate of ${recentWinRate.toFixed(1)}% is ${Math.abs(formDifference).toFixed(1)}% worse than your overall average. Your performance is trending downward.`,
        confidence: 85,
        priority: 'high',
        category: 'weakness',
        severity: 'high'
      });
    }
  }
  
  // Goal scoring insights
  if (avgGoalsPerGame >= 3.0) {
    insights.push({
      id: 'exceptional-attack',
      type: 'tactical',
      title: 'Exceptional Attack',
      description: `Averaging ${avgGoalsPerGame.toFixed(1)} goals per game puts your attack among the elite. Your finishing and chance creation are exceptional.`,
      confidence: 90,
      priority: 'low',
      category: 'strength',
      severity: 'low'
    });
  } else if (avgGoalsPerGame < 1.5) {
    insights.push({
      id: 'attacking-struggles',
      type: 'tactical',
      title: 'Attacking Struggles',
      description: `Averaging only ${avgGoalsPerGame.toFixed(1)} goals per game indicates issues with your attacking play or finishing.`,
      confidence: 90,
      priority: 'high',
      category: 'weakness',
      severity: 'high'
    });
  }
  
  // Defensive insights
  if (avgConcededPerGame < 1.0) {
    insights.push({
      id: 'elite-defense',
      type: 'tactical',
      title: 'Elite Defense',
      description: `Conceding only ${avgConcededPerGame.toFixed(1)} goals per game demonstrates exceptional defensive organization and discipline.`,
      confidence: 95,
      priority: 'low',
      category: 'strength',
      severity: 'low'
    });
  } else if (avgConcededPerGame >= 3.0) {
    insights.push({
      id: 'defensive-concerns',
      type: 'tactical',
      title: 'Defensive Concerns',
      description: `Conceding ${avgConcededPerGame.toFixed(1)} goals per game indicates major defensive issues that need immediate attention.`,
      confidence: 90,
      priority: 'high',
      category: 'weakness',
      severity: 'high'
    });
  }
  
  // Current week insights
  if (currentWeek && currentWeek.games.length >= 5) {
    const currentWinRate = (currentWeek.totalWins / currentWeek.games.length) * 100;
    const currentFormDifference = currentWinRate - winRate;
    
    if (Math.abs(currentFormDifference) >= 15) {
      insights.push({
        id: 'current-week-form',
        type: 'performance',
        title: currentFormDifference > 0 ? 'Current Week Success' : 'Current Week Struggles',
        description: currentFormDifference > 0 ?
          `You're performing ${currentFormDifference.toFixed(1)}% above your usual win rate this week.` :
          `You're performing ${Math.abs(currentFormDifference).toFixed(1)}% below your usual win rate this week.`,
        confidence: 85,
        priority: currentFormDifference > 0 ? 'low' : 'high',
        category: currentFormDifference > 0 ? 'strength' : 'weakness',
        severity: currentFormDifference > 0 ? 'low' : 'high'
      });
    }
  }
  
  // Return insights sorted by priority
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  
  return insights.sort((a, b) => 
    priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder]
  );
}

export function generateMatchFeedback(game: GameResult, weekData: WeeklyPerformance) {
  const insights = [];
  
  // Result-based feedback
  if (game.result === 'win') {
    insights.push(`Great win! You're now at ${weekData.totalWins} wins for the week.`);
    
    // Win streak
    if (weekData.currentStreak && weekData.currentStreak >= 3) {
      insights.push(`You're on a ${weekData.currentStreak} game win streak! Keep the momentum going!`);
    }
    
    // Clean sheet
    const [, conceded] = game.scoreLine.split('-').map(Number);
    if (conceded === 0) {
      insights.push(`Excellent defensive performance with a clean sheet!`);
    }
  } else {
    insights.push(`Don't worry about this loss. You still have ${15 - weekData.games.length} games remaining this week.`);
    
    // Losing streak
    if (weekData.currentStreak && weekData.currentStreak <= -3) {
      insights.push(`You're on a ${Math.abs(weekData.currentStreak)} game losing streak. Consider taking a short break.`);
    }
  }
  
  // Goal analysis
  const [scored, conceded] = game.scoreLine.split('-').map(Number);
  
  if (scored >= 4) {
    insights.push(`Excellent attacking performance with ${scored} goals!`);
  } else if (scored === 0) {
    insights.push(`Work on your attacking play to avoid scoreless games.`);
  }
  
  if (conceded >= 4) {
    insights.push(`Focus on improving your defense after conceding ${conceded} goals.`);
  }
  
  // XG analysis
  if (game.teamStats.expectedGoals && game.teamStats.expectedGoalsAgainst) {
    const xgDiff = scored - game.teamStats.expectedGoals;
    const xgaDiff = conceded - game.teamStats.expectedGoalsAgainst;
    
    if (xgDiff >= 2) {
      insights.push(`Exceptional finishing efficiency, outperforming your xG by ${xgDiff.toFixed(1)} goals!`);
    } else if (xgDiff <= -2) {
      insights.push(`Work on your finishing - you underperformed your xG by ${Math.abs(xgDiff).toFixed(1)} goals.`);
    }
    
    if (xgaDiff <= -2) {
      insights.push(`Great goalkeeping and defending, conceding ${Math.abs(xgaDiff).toFixed(1)} fewer goals than expected!`);
    } else if (xgaDiff >= 2) {
      insights.push(`Your defense and goalkeeper underperformed, conceding ${xgaDiff.toFixed(1)} more goals than expected.`);
    }
  }
  
  // Player performance
  if (game.playerStats && game.playerStats.length > 0) {
    const bestPlayer = [...game.playerStats].sort((a, b) => b.rating - a.rating)[0];
    const worstPlayer = [...game.playerStats].sort((a, b) => a.rating - b.rating)[0];
    
    if (bestPlayer.rating >= 8.5) {
      insights.push(`${bestPlayer.name} had an outstanding performance with a ${bestPlayer.rating.toFixed(1)} rating!`);
    }
    
    if (worstPlayer.rating < 6.0 && game.playerStats.length >= 5) {
      insights.push(`${worstPlayer.name} struggled with a ${worstPlayer.rating.toFixed(1)} rating. Consider a substitution next time.`);
    }
    
    // Goal contributions
    const goalScorers = game.playerStats.filter(p => p.goals > 0);
    if (goalScorers.length >= 3) {
      insights.push(`Great team performance with ${goalScorers.length} different goal scorers!`);
    }
    
    // Hat-trick
    const hatTrickPlayer = game.playerStats.find(p => p.goals >= 3);
    if (hatTrickPlayer) {
      insights.push(`${hatTrickPlayer.name} scored a hat-trick! Exceptional performance!`);
    }
  }
  
  // Return 2-3 random insights to avoid repetition
  return insights.sort(() => 0.5 - Math.random()).slice(0, Math.min(3, insights.length));
}