
import { WeeklyPerformance, GameResult } from '@/types/futChampions';

export interface AIInsight {
  id: string;
  type: 'strength' | 'weakness' | 'trend' | 'recommendation' | 'pattern' | 'tactical' | 'psychological';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  actionable: boolean;
  category: 'performance' | 'tactical' | 'mental' | 'technical' | 'strategic';
}

export function generateAIInsights(
  weeklyData: WeeklyPerformance[], 
  currentWeek: WeeklyPerformance | null,
  recentGames: GameResult[] = []
): AIInsight[] {
  const insights: AIInsight[] = [];
  const allGames = weeklyData.flatMap(week => week.games);
  const totalGames = allGames.length;
  
  if (totalGames === 0) return [];

  // Performance Analysis
  const totalWins = weeklyData.reduce((sum, week) => sum + week.totalWins, 0);
  const winRate = (totalWins / totalGames) * 100;
  const totalGoals = weeklyData.reduce((sum, week) => sum + week.totalGoals, 0);
  const totalConceded = weeklyData.reduce((sum, week) => sum + week.totalConceded, 0);
  const avgGoalsPerGame = totalGoals / totalGames;
  const avgConcededPerGame = totalConceded / totalGames;

  // Win Rate Analysis
  if (winRate >= 75) {
    insights.push({
      id: 'high-win-rate',
      type: 'strength',
      title: 'Exceptional Win Rate',
      description: `Outstanding ${winRate.toFixed(1)}% win rate demonstrates consistent high-level performance. You're playing at an elite level.`,
      severity: 'low',
      confidence: 95,
      actionable: false,
      category: 'performance'
    });
  } else if (winRate >= 60) {
    insights.push({
      id: 'good-win-rate',
      type: 'strength',
      title: 'Strong Performance',
      description: `Solid ${winRate.toFixed(1)}% win rate shows good consistency. Focus on maintaining this level while improving weak areas.`,
      severity: 'low',
      confidence: 85,
      actionable: true,
      category: 'performance'
    });
  } else if (winRate < 40) {
    insights.push({
      id: 'low-win-rate',
      type: 'weakness',
      title: 'Performance Concerns',
      description: `${winRate.toFixed(1)}% win rate indicates areas needing improvement. Consider tactical adjustments and practice specific scenarios.`,
      severity: 'high',
      confidence: 90,
      actionable: true,
      category: 'performance'
    });
  }

  // Goal Scoring Analysis
  if (avgGoalsPerGame >= 2.5) {
    insights.push({
      id: 'prolific-scoring',
      type: 'strength',
      title: 'Clinical Finishing',
      description: `Averaging ${avgGoalsPerGame.toFixed(1)} goals per game shows excellent attacking prowess. Your offensive play is a major strength.`,
      severity: 'low',
      confidence: 88,
      actionable: false,
      category: 'tactical'
    });
  } else if (avgGoalsPerGame < 1.2) {
    insights.push({
      id: 'goal-drought',
      type: 'weakness',
      title: 'Scoring Struggles',
      description: `Only ${avgGoalsPerGame.toFixed(1)} goals per game suggests attacking difficulties. Work on finishing, shot selection, and chance creation.`,
      severity: 'medium',
      confidence: 85,
      actionable: true,
      category: 'tactical'
    });
  }

  // Defensive Analysis
  if (avgConcededPerGame <= 1.0) {
    insights.push({
      id: 'solid-defense',
      type: 'strength',
      title: 'Defensive Solidity',
      description: `Conceding only ${avgConcededPerGame.toFixed(1)} goals per game shows excellent defensive organization and discipline.`,
      severity: 'low',
      confidence: 90,
      actionable: false,
      category: 'tactical'
    });
  } else if (avgConcededPerGame >= 2.5) {
    insights.push({
      id: 'defensive-issues',
      type: 'weakness',
      title: 'Defensive Vulnerabilities',
      description: `Conceding ${avgConcededPerGame.toFixed(1)} goals per game indicates defensive frailties. Focus on positioning, pressing, and concentration.`,
      severity: 'high',
      confidence: 88,
      actionable: true,
      category: 'tactical'
    });
  }

  // Opponent Skill Analysis
  const avgOpponentSkill = allGames.reduce((sum, game) => sum + game.opponentSkill, 0) / totalGames;
  if (avgOpponentSkill >= 7.5) {
    insights.push({
      id: 'tough-competition',
      type: 'pattern',
      title: 'Elite Competition',
      description: `Facing opponents averaging ${avgOpponentSkill.toFixed(1)}/10 skill shows you're competing at the highest level. Results may fluctuate against such opposition.`,
      severity: 'medium',
      confidence: 92,
      actionable: true,
      category: 'strategic'
    });
  }

  // Recent Form Analysis
  if (recentGames.length >= 5) {
    const recentWins = recentGames.filter(game => game.result === 'win').length;
    const recentWinRate = (recentWins / recentGames.length) * 100;
    
    if (recentWinRate >= 80) {
      insights.push({
        id: 'hot-streak',
        type: 'trend',
        title: 'Excellent Recent Form',
        description: `${recentWinRate}% win rate in last ${recentGames.length} games shows you're in top form. Maintain this momentum.`,
        severity: 'low',
        confidence: 85,
        actionable: true,
        category: 'mental'
      });
    } else if (recentWinRate <= 20) {
      insights.push({
        id: 'poor-form',
        type: 'trend',
        title: 'Concerning Recent Form',
        description: `Only ${recentWinRate}% wins in last ${recentGames.length} games suggests a dip in form. Consider tactical changes or take a break.`,
        severity: 'high',
        confidence: 90,
        actionable: true,
        category: 'mental'
      });
    }
  }

  // Stress Level Analysis
  const stressGames = allGames.filter(game => game.stressLevel);
  if (stressGames.length > 0) {
    const avgStress = stressGames.reduce((sum, game) => sum + (game.stressLevel || 0), 0) / stressGames.length;
    if (avgStress >= 7) {
      insights.push({
        id: 'high-stress',
        type: 'weakness',
        title: 'High Stress Levels',
        description: `Average stress level of ${avgStress.toFixed(1)}/10 may be impacting performance. Consider relaxation techniques and breaks.`,
        severity: 'medium',
        confidence: 80,
        actionable: true,
        category: 'mental'
      });
    }
  }

  // Server Quality Impact
  const serverGames = allGames.filter(game => game.serverQuality);
  if (serverGames.length > 0) {
    const avgServerQuality = serverGames.reduce((sum, game) => sum + (game.serverQuality || 0), 0) / serverGames.length;
    if (avgServerQuality <= 4) {
      insights.push({
        id: 'server-issues',
        type: 'pattern',
        title: 'Server Quality Issues',
        description: `Poor server quality (${avgServerQuality.toFixed(1)}/10) may be affecting your gameplay. Consider different play times or regions.`,
        severity: 'medium',
        confidence: 75,
        actionable: true,
        category: 'technical'
      });
    }
  }

  // Game Context Analysis
  const penaltyGames = allGames.filter(game => game.gameContext === 'penalties');
  if (penaltyGames.length >= 3) {
    const penaltyWins = penaltyGames.filter(game => game.result === 'win').length;
    const penaltyWinRate = (penaltyWins / penaltyGames.length) * 100;
    
    if (penaltyWinRate >= 70) {
      insights.push({
        id: 'penalty-expert',
        type: 'strength',
        title: 'Penalty Shootout Specialist',
        description: `${penaltyWinRate}% win rate in penalty shootouts shows excellent composure under pressure.`,
        severity: 'low',
        confidence: 85,
        actionable: false,
        category: 'mental'
      });
    } else if (penaltyWinRate <= 30) {
      insights.push({
        id: 'penalty-struggles',
        type: 'weakness',
        title: 'Penalty Shootout Difficulties',
        description: `Only ${penaltyWinRate}% success in penalties suggests room for improvement. Practice penalty taking and staying calm.`,
        severity: 'medium',
        confidence: 80,
        actionable: true,
        category: 'technical'
      });
    }
  }

  // Weekly Consistency Analysis
  if (weeklyData.length >= 3) {
    const weeklyWinRates = weeklyData.map(week => 
      week.games.length > 0 ? (week.totalWins / week.games.length) * 100 : 0
    );
    const winRateVariation = Math.sqrt(
      weeklyWinRates.reduce((sum, rate) => sum + Math.pow(rate - winRate, 2), 0) / weeklyWinRates.length
    );
    
    if (winRateVariation <= 15) {
      insights.push({
        id: 'consistent-performer',
        type: 'strength',
        title: 'Remarkable Consistency',
        description: `Low variation in weekly performance (${winRateVariation.toFixed(1)}%) shows excellent mental strength and reliability.`,
        severity: 'low',
        confidence: 88,
        actionable: false,
        category: 'mental'
      });
    } else if (winRateVariation >= 35) {
      insights.push({
        id: 'inconsistent-form',
        type: 'weakness',
        title: 'Inconsistent Performance',
        description: `High weekly variation (${winRateVariation.toFixed(1)}%) suggests inconsistency. Work on maintaining focus across sessions.`,
        severity: 'medium',
        confidence: 82,
        actionable: true,
        category: 'mental'
      });
    }
  }

  // Time-based Patterns
  if (allGames.length >= 10) {
    const gamesByHour = new Map<number, GameResult[]>();
    allGames.forEach(game => {
      const hour = new Date(game.date).getHours();
      if (!gamesByHour.has(hour)) gamesByHour.set(hour, []);
      gamesByHour.get(hour)!.push(game);
    });

    let bestHour = -1;
    let bestWinRate = 0;
    let worstHour = -1;
    let worstWinRate = 100;

    gamesByHour.forEach((games, hour) => {
      if (games.length >= 3) {
        const wins = games.filter(g => g.result === 'win').length;
        const winRate = (wins / games.length) * 100;
        
        if (winRate > bestWinRate) {
          bestWinRate = winRate;
          bestHour = hour;
        }
        if (winRate < worstWinRate) {
          worstWinRate = winRate;
          worstHour = hour;
        }
      }
    });

    if (bestHour !== -1 && bestWinRate >= 70) {
      insights.push({
        id: 'peak-hours',
        type: 'pattern',
        title: 'Optimal Playing Time',
        description: `${bestWinRate.toFixed(0)}% win rate at ${bestHour}:00 suggests this is your peak performance time. Schedule important games accordingly.`,
        severity: 'low',
        confidence: 75,
        actionable: true,
        category: 'strategic'
      });
    }
  }

  // Goal Difference Analysis
  const goalDifferences = allGames.map(game => {
    const [goalsFor, goalsAgainst] = game.scoreLine.split('-').map(Number);
    return goalsFor - goalsAgainst;
  });
  
  const avgGoalDifference = goalDifferences.reduce((sum, diff) => sum + diff, 0) / goalDifferences.length;
  
  if (avgGoalDifference >= 1.5) {
    insights.push({
      id: 'dominant-wins',
      type: 'strength',
      title: 'Dominant Performances',
      description: `Average goal difference of +${avgGoalDifference.toFixed(1)} shows you don't just win, you dominate games.`,
      severity: 'low',
      confidence: 85,
      actionable: false,
      category: 'performance'
    });
  }

  // Rage Quit Analysis
  const rageQuits = allGames.filter(game => game.gameContext === 'rage_quit');
  if (rageQuits.length >= 3) {
    const rageQuitWins = rageQuits.filter(game => game.result === 'win').length;
    insights.push({
      id: 'rage-quit-impact',
      type: 'pattern',
      title: 'Opponent Rage Quits',
      description: `${rageQuits.length} games ended in rage quits (${rageQuitWins} wins). Your playstyle may be frustrating opponents.`,
      severity: 'low',
      confidence: 70,
      actionable: false,
      category: 'psychological'
    });
  }

  // Expected Goals Analysis
  const xgGames = allGames.filter(game => game.teamStats.expectedGoals > 0);
  if (xgGames.length >= 5) {
    const totalXG = xgGames.reduce((sum, game) => sum + game.teamStats.expectedGoals, 0);
    const actualGoals = xgGames.reduce((sum, game) => {
      const [goals] = game.scoreLine.split('-').map(Number);
      return sum + goals;
    }, 0);
    
    const xgDifference = ((actualGoals - totalXG) / totalXG) * 100;
    
    if (xgDifference >= 15) {
      insights.push({
        id: 'clinical-finishing',
        type: 'strength',
        title: 'Clinical Finishing',
        description: `Scoring ${xgDifference.toFixed(0)}% more goals than expected shows exceptional finishing ability.`,
        severity: 'low',
        confidence: 90,
        actionable: false,
        category: 'technical'
      });
    } else if (xgDifference <= -15) {
      insights.push({
        id: 'finishing-issues',
        type: 'weakness',
        title: 'Finishing Concerns',
        description: `Scoring ${Math.abs(xgDifference).toFixed(0)}% fewer goals than expected suggests finishing practice is needed.`,
        severity: 'medium',
        confidence: 88,
        actionable: true,
        category: 'technical'
      });
    }
  }

  // Additional tactical insights based on patterns
  if (currentWeek && currentWeek.games.length >= 5) {
    const currentWinRate = (currentWeek.totalWins / currentWeek.games.length) * 100;
    const overallWinRate = winRate;
    
    if (currentWinRate > overallWinRate + 20) {
      insights.push({
        id: 'current-improvement',
        type: 'trend',
        title: 'Significant Improvement',
        description: `Current week win rate (${currentWinRate.toFixed(0)}%) is ${(currentWinRate - overallWinRate).toFixed(0)}% better than your average. You're evolving your game.`,
        severity: 'low',
        confidence: 85,
        actionable: true,
        category: 'performance'
      });
    }
  }

  // Clean sheet analysis
  const cleanSheets = allGames.filter(game => {
    const [, goalsAgainst] = game.scoreLine.split('-').map(Number);
    return goalsAgainst === 0 && game.result === 'win';
  }).length;
  
  const cleanSheetRate = (cleanSheets / totalWins) * 100;
  
  if (cleanSheetRate >= 40) {
    insights.push({
      id: 'clean-sheet-master',
      type: 'strength',
      title: 'Defensive Excellence',
      description: `${cleanSheetRate.toFixed(0)}% of wins are clean sheets, showing exceptional defensive organization and discipline.`,
      severity: 'low',
      confidence: 85,
      actionable: false,
      category: 'tactical'
    });
  }

  return insights.slice(0, 20); // Return maximum 20 insights
}

export function generateGameInsights(game: GameResult, weekStats: any): string[] {
  const insights: string[] = [];
  const [goalsFor, goalsAgainst] = game.scoreLine.split('-').map(Number);
  const goalDifference = goalsFor - goalsAgainst;
  
  if (game.result === 'win') {
    if (goalDifference >= 3) {
      insights.push("Dominant victory! Your tactical approach completely overwhelmed the opponent.");
    } else if (goalsAgainst === 0) {
      insights.push("Clean sheet victory demonstrates excellent defensive discipline and concentration.");
    } else if (goalDifference === 1) {
      insights.push("Hard-fought narrow win shows mental resilience and clutch performance under pressure.");
    }
    
    if (game.opponentSkill >= 8) {
      insights.push("Impressive win against high-skilled opposition proves you can compete at the elite level.");
    }
    
    if (game.gameContext === 'penalties') {
      insights.push("Penalty shootout victory demonstrates exceptional mental fortitude and composure.");
    }
  } else {
    if (goalDifference <= -3) {
      insights.push("Heavy defeat suggests tactical adjustments needed. Analyze opponent's approach and adapt.");
    } else if (goalDifference === -1) {
      insights.push("Narrow loss shows you're competitive. Small improvements could turn these into wins.");
    }
    
    if (game.opponentSkill <= 5) {
      insights.push("Loss to lower-skilled opponent indicates concentration issues or complacency.");
    }
  }
  
  if (game.stressLevel && game.stressLevel >= 7) {
    insights.push("High stress levels may have impacted decision-making. Consider relaxation techniques.");
  }
  
  if (game.serverQuality && game.serverQuality <= 4) {
    insights.push("Poor server quality likely affected gameplay. Consider playing at different times.");
  }
  
  // Streak analysis
  if (weekStats.currentStreak >= 3 && game.result === 'win') {
    insights.push(`Outstanding ${weekStats.currentStreak}-game winning streak! Momentum is building.`);
  } else if (weekStats.currentStreak <= -3 && game.result === 'loss') {
    insights.push("Losing streak requires immediate attention. Consider tactical changes or a short break.");
  }
  
  return insights;
}
