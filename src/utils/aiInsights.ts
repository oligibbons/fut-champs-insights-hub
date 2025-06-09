import { WeeklyPerformance, GameResult } from '@/types/futChampions';

export interface AIInsight {
  id: string;
  type: 'strength' | 'weakness' | 'trend' | 'recommendation' | 'pattern' | 'tactical' | 'mental';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  actionable: boolean;
  category: 'strength' | 'weakness' | 'opportunity' | 'threat';
  priority: 'low' | 'medium' | 'high';
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
      category: 'strength',
      priority: 'low'
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
      category: 'strength',
      priority: 'medium'
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
      category: 'weakness',
      priority: 'high'
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
      category: 'strength',
      priority: 'low'
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
      category: 'weakness',
      priority: 'medium'
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
      category: 'strength',
      priority: 'low'
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
      category: 'weakness',
      priority: 'high'
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
      category: 'opportunity',
      priority: 'medium'
    });
  } else if (avgOpponentSkill <= 4.5) {
    insights.push({
      id: 'easier-competition',
      type: 'pattern',
      title: 'Facing Lower-Skilled Opposition',
      description: `Your average opponent skill of ${avgOpponentSkill.toFixed(1)}/10 suggests you might benefit from seeking tougher challenges to improve.`,
      severity: 'low',
      confidence: 80,
      actionable: true,
      category: 'opportunity',
      priority: 'medium'
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
        description: `${recentWinRate.toFixed(0)}% win rate in last ${recentGames.length} games shows you're in top form. Maintain this momentum.`,
        severity: 'low',
        confidence: 85,
        actionable: true,
        category: 'strength',
        priority: 'low'
      });
    } else if (recentWinRate <= 20) {
      insights.push({
        id: 'poor-form',
        type: 'trend',
        title: 'Concerning Recent Form',
        description: `Only ${recentWinRate.toFixed(0)}% wins in last ${recentGames.length} games suggests a dip in form. Consider tactical changes or take a break.`,
        severity: 'high',
        confidence: 90,
        actionable: true,
        category: 'weakness',
        priority: 'high'
      });
    }
    
    // Form trend analysis
    if (recentGames.length >= 10) {
      const firstHalfWins = recentGames.slice(5, 10).filter(g => g.result === 'win').length;
      const secondHalfWins = recentGames.slice(0, 5).filter(g => g.result === 'win').length;
      const formTrend = secondHalfWins - firstHalfWins;
      
      if (formTrend >= 2) {
        insights.push({
          id: 'improving-trend',
          type: 'trend',
          title: 'Positive Form Trajectory',
          description: `Your recent performance shows clear improvement with ${secondHalfWins} wins in your last 5 games compared to ${firstHalfWins} in the previous 5.`,
          severity: 'low',
          confidence: 82,
          actionable: false,
          category: 'strength',
          priority: 'low'
        });
      } else if (formTrend <= -2) {
        insights.push({
          id: 'declining-trend',
          type: 'trend',
          title: 'Declining Form Trajectory',
          description: `Your performance has dipped from ${firstHalfWins} wins to ${secondHalfWins} wins in your most recent 5 games. Consider what factors have changed.`,
          severity: 'medium',
          confidence: 82,
          actionable: true,
          category: 'weakness',
          priority: 'medium'
        });
      }
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
        category: 'threat',
        priority: 'medium'
      });
    } else if (avgStress <= 3 && stressGames.length >= 5) {
      insights.push({
        id: 'calm-player',
        type: 'strength',
        title: 'Excellent Stress Management',
        description: `Your low average stress level of ${avgStress.toFixed(1)}/10 is a significant advantage, allowing for clearer decision-making.`,
        severity: 'low',
        confidence: 75,
        actionable: false,
        category: 'strength',
        priority: 'low'
      });
    }
    
    // Stress impact analysis
    const highStressGames = stressGames.filter(game => (game.stressLevel || 0) >= 7);
    const lowStressGames = stressGames.filter(game => (game.stressLevel || 0) <= 3);
    
    if (highStressGames.length >= 3 && lowStressGames.length >= 3) {
      const highStressWinRate = highStressGames.filter(g => g.result === 'win').length / highStressGames.length * 100;
      const lowStressWinRate = lowStressGames.filter(g => g.result === 'win').length / lowStressGames.length * 100;
      
      if (lowStressWinRate - highStressWinRate >= 20) {
        insights.push({
          id: 'stress-impact',
          type: 'mental',
          title: 'Stress Significantly Impacts Performance',
          description: `Your win rate drops by ${(lowStressWinRate - highStressWinRate).toFixed(0)}% when under high stress. Mental preparation could be key to improvement.`,
          severity: 'medium',
          confidence: 85,
          actionable: true,
          category: 'weakness',
          priority: 'medium'
        });
      } else if (highStressWinRate >= lowStressWinRate) {
        insights.push({
          id: 'pressure-player',
          type: 'strength',
          title: 'Thrives Under Pressure',
          description: `You perform as well or better under stress (${highStressWinRate.toFixed(0)}% win rate) compared to relaxed situations (${lowStressWinRate.toFixed(0)}%).`,
          severity: 'low',
          confidence: 80,
          actionable: false,
          category: 'strength',
          priority: 'low'
        });
      }
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
        category: 'threat',
        priority: 'medium'
      });
    }
    
    // Server impact analysis
    const goodServerGames = serverGames.filter(game => (game.serverQuality || 0) >= 7);
    const badServerGames = serverGames.filter(game => (game.serverQuality || 0) <= 3);
    
    if (goodServerGames.length >= 3 && badServerGames.length >= 3) {
      const goodServerWinRate = goodServerGames.filter(g => g.result === 'win').length / goodServerGames.length * 100;
      const badServerWinRate = badServerGames.filter(g => g.result === 'win').length / badServerGames.length * 100;
      
      if (goodServerWinRate - badServerWinRate >= 15) {
        insights.push({
          id: 'connection-dependent',
          type: 'pattern',
          title: 'Connection Quality Dependency',
          description: `Your win rate is ${(goodServerWinRate - badServerWinRate).toFixed(0)}% higher with good server quality. Consider playing during off-peak hours.`,
          severity: 'medium',
          confidence: 78,
          actionable: true,
          category: 'threat',
          priority: 'medium'
        });
      } else if (Math.abs(goodServerWinRate - badServerWinRate) <= 5) {
        insights.push({
          id: 'connection-resilient',
          type: 'strength',
          title: 'Connection Quality Resilience',
          description: `You maintain consistent performance regardless of server quality, showing excellent adaptability.`,
          severity: 'low',
          confidence: 75,
          actionable: false,
          category: 'strength',
          priority: 'low'
        });
      }
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
        description: `${penaltyWinRate.toFixed(0)}% win rate in penalty shootouts shows excellent composure under pressure.`,
        severity: 'low',
        confidence: 85,
        actionable: false,
        category: 'strength',
        priority: 'low'
      });
    } else if (penaltyWinRate <= 30) {
      insights.push({
        id: 'penalty-struggles',
        type: 'weakness',
        title: 'Penalty Shootout Difficulties',
        description: `Only ${penaltyWinRate.toFixed(0)}% success in penalties suggests room for improvement. Practice penalty taking and staying calm.`,
        severity: 'medium',
        confidence: 80,
        actionable: true,
        category: 'weakness',
        priority: 'medium'
      });
    }
  }

  const extraTimeGames = allGames.filter(game => game.gameContext === 'extra_time');
  if (extraTimeGames.length >= 3) {
    const extraTimeWins = extraTimeGames.filter(game => game.result === 'win').length;
    const extraTimeWinRate = (extraTimeWins / extraTimeGames.length) * 100;
    
    if (extraTimeWinRate >= 70) {
      insights.push({
        id: 'extra-time-specialist',
        type: 'strength',
        title: 'Extra Time Specialist',
        description: `${extraTimeWinRate.toFixed(0)}% win rate in extra time shows excellent stamina and mental fortitude.`,
        severity: 'low',
        confidence: 85,
        actionable: false,
        category: 'strength',
        priority: 'low'
      });
    } else if (extraTimeWinRate <= 30) {
      insights.push({
        id: 'extra-time-struggles',
        type: 'weakness',
        title: 'Extra Time Difficulties',
        description: `Only ${extraTimeWinRate.toFixed(0)}% success in extra time suggests fatigue or concentration issues. Work on stamina and focus.`,
        severity: 'medium',
        confidence: 80,
        actionable: true,
        category: 'weakness',
        priority: 'medium'
      });
    }
  }

  const rageQuitGames = allGames.filter(game => game.gameContext === 'rage_quit');
  if (rageQuitGames.length >= 3) {
    insights.push({
      id: 'rage-quit-inducer',
      type: 'pattern',
      title: 'Frustrating Playstyle',
      description: `You've caused ${rageQuitGames.length} rage quits, suggesting your playstyle may be particularly effective or frustrating to opponents.`,
      severity: 'low',
      confidence: 75,
      actionable: false,
      category: 'strength',
      priority: 'low'
    });
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
        category: 'strength',
        priority: 'low'
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
        category: 'weakness',
        priority: 'medium'
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
        category: 'opportunity',
        priority: 'medium'
      });
    }

    if (worstHour !== -1 && worstWinRate <= 30 && gamesByHour.get(worstHour)!.length >= 3) {
      insights.push({
        id: 'avoid-hours',
        type: 'pattern',
        title: 'Suboptimal Playing Time',
        description: `Only ${worstWinRate.toFixed(0)}% win rate at ${worstHour}:00 suggests avoiding this time slot could improve results.`,
        severity: 'medium',
        confidence: 75,
        actionable: true,
        category: 'threat',
        priority: 'medium'
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
      category: 'strength',
      priority: 'low'
    });
  } else if (avgGoalDifference <= -1.5) {
    insights.push({
      id: 'heavy-defeats',
      type: 'weakness',
      title: 'Concerning Defeat Margins',
      description: `Average goal difference of ${avgGoalDifference.toFixed(1)} shows you're often losing by multiple goals. Focus on defensive stability.`,
      severity: 'high',
      confidence: 85,
      actionable: true,
      category: 'weakness',
      priority: 'high'
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
        category: 'strength',
        priority: 'low'
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
        category: 'weakness',
        priority: 'medium'
      });
    }
    
    // Defensive xG analysis
    const totalXGA = xgGames.reduce((sum, game) => sum + game.teamStats.expectedGoalsAgainst, 0);
    const actualConceded = xgGames.reduce((sum, game) => {
      const [, goals] = game.scoreLine.split('-').map(Number);
      return sum + goals;
    }, 0);
    
    const xgaPerformance = ((actualConceded - totalXGA) / totalXGA) * 100;
    
    if (xgaPerformance <= -15) {
      insights.push({
        id: 'defensive-overperformance',
        type: 'strength',
        title: 'Exceptional Defending',
        description: `Conceding ${Math.abs(xgaPerformance).toFixed(0)}% fewer goals than expected shows excellent defensive performance and goalkeeping.`,
        severity: 'low',
        confidence: 88,
        actionable: false,
        category: 'strength',
        priority: 'low'
      });
    } else if (xgaPerformance >= 15) {
      insights.push({
        id: 'defensive-underperformance',
        type: 'weakness',
        title: 'Defensive Efficiency Concerns',
        description: `Conceding ${xgaPerformance.toFixed(0)}% more goals than expected suggests defensive or goalkeeping issues to address.`,
        severity: 'medium',
        confidence: 85,
        actionable: true,
        category: 'weakness',
        priority: 'medium'
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
        category: 'opportunity',
        priority: 'low'
      });
    } else if (currentWinRate < overallWinRate - 20) {
      insights.push({
        id: 'current-decline',
        type: 'trend',
        title: 'Current Performance Dip',
        description: `Current week win rate (${currentWinRate.toFixed(0)}%) is ${(overallWinRate - currentWinRate).toFixed(0)}% below your average. Consider what has changed.`,
        severity: 'medium',
        confidence: 85,
        actionable: true,
        category: 'weakness',
        priority: 'medium'
      });
    }
  }

  // Clean sheet analysis
  const cleanSheets = allGames.filter(game => {
    const [, goalsAgainst] = game.scoreLine.split('-').map(Number);
    return goalsAgainst === 0 && game.result === 'win';
  }).length;
  
  const cleanSheetRate = (cleanSheets / totalGames) * 100;
  
  if (cleanSheetRate >= 40) {
    insights.push({
      id: 'clean-sheet-master',
      type: 'strength',
      title: 'Defensive Excellence',
      description: `${cleanSheetRate.toFixed(0)}% of games are clean sheets, showing exceptional defensive organization and discipline.`,
      severity: 'low',
      confidence: 85,
      actionable: false,
      category: 'strength',
      priority: 'low'
    });
  } else if (cleanSheetRate <= 10 && totalGames >= 10) {
    insights.push({
      id: 'clean-sheet-rarity',
      type: 'weakness',
      title: 'Clean Sheet Scarcity',
      description: `Only ${cleanSheetRate.toFixed(0)}% of games end in clean sheets. Improving defensive stability could significantly boost results.`,
      severity: 'medium',
      confidence: 80,
      actionable: true,
      category: 'weakness',
      priority: 'medium'
    });
  }

  // Possession analysis
  const possessionGames = allGames.filter(game => game.teamStats.possession);
  if (possessionGames.length >= 5) {
    const avgPossession = possessionGames.reduce((sum, game) => sum + game.teamStats.possession, 0) / possessionGames.length;
    
    if (avgPossession >= 60) {
      insights.push({
        id: 'possession-dominant',
        type: 'pattern',
        title: 'Possession Dominance',
        description: `Averaging ${avgPossession.toFixed(0)}% possession shows excellent ball control and passing. You dictate the game's tempo.`,
        severity: 'low',
        confidence: 85,
        actionable: false,
        category: 'strength',
        priority: 'low'
      });
      
      // Check if possession translates to wins
      const highPossessionGames = possessionGames.filter(game => game.teamStats.possession >= 60);
      const highPossessionWinRate = highPossessionGames.filter(g => g.result === 'win').length / highPossessionGames.length * 100;
      
      if (highPossessionWinRate < 50 && highPossessionGames.length >= 5) {
        insights.push({
          id: 'possession-without-purpose',
          type: 'weakness',
          title: 'Possession Without Purpose',
          description: `Despite high possession (${avgPossession.toFixed(0)}%), your win rate in these games is only ${highPossessionWinRate.toFixed(0)}%. Focus on creating quality chances.`,
          severity: 'medium',
          confidence: 82,
          actionable: true,
          category: 'weakness',
          priority: 'medium'
        });
      }
    } else if (avgPossession <= 40) {
      insights.push({
        id: 'counter-attacking',
        type: 'pattern',
        title: 'Counter-Attacking Style',
        description: `Low average possession (${avgPossession.toFixed(0)}%) suggests a counter-attacking approach. Efficiency in transition is key.`,
        severity: 'low',
        confidence: 80,
        actionable: true,
        category: 'opportunity',
        priority: 'low'
      });
      
      // Check if counter-attacking is effective
      const lowPossessionGames = possessionGames.filter(game => game.teamStats.possession <= 40);
      const lowPossessionWinRate = lowPossessionGames.filter(g => g.result === 'win').length / lowPossessionGames.length * 100;
      
      if (lowPossessionWinRate >= 60 && lowPossessionGames.length >= 5) {
        insights.push({
          id: 'effective-counter-attacking',
          type: 'strength',
          title: 'Effective Counter-Attacking',
          description: `${lowPossessionWinRate.toFixed(0)}% win rate with low possession shows excellent efficiency and clinical finishing on the break.`,
          severity: 'low',
          confidence: 85,
          actionable: false,
          category: 'strength',
          priority: 'low'
        });
      } else if (lowPossessionWinRate <= 30 && lowPossessionGames.length >= 5) {
        insights.push({
          id: 'ineffective-counter-attacking',
          type: 'weakness',
          title: 'Counter-Attack Improvement Needed',
          description: `Only ${lowPossessionWinRate.toFixed(0)}% win rate with low possession suggests your counter-attacking needs refinement.`,
          severity: 'medium',
          confidence: 80,
          actionable: true,
          category: 'weakness',
          priority: 'medium'
        });
      }
    }
  }

  // Pass accuracy analysis
  const passGames = allGames.filter(game => game.teamStats.passAccuracy);
  if (passGames.length >= 5) {
    const avgPassAccuracy = passGames.reduce((sum, game) => sum + game.teamStats.passAccuracy, 0) / passGames.length;
    
    if (avgPassAccuracy >= 85) {
      insights.push({
        id: 'passing-excellence',
        type: 'strength',
        title: 'Passing Excellence',
        description: `${avgPassAccuracy.toFixed(0)}% pass accuracy demonstrates exceptional ball control and decision-making.`,
        severity: 'low',
        confidence: 88,
        actionable: false,
        category: 'strength',
        priority: 'low'
      });
    } else if (avgPassAccuracy <= 70) {
      insights.push({
        id: 'passing-issues',
        type: 'weakness',
        title: 'Passing Improvement Needed',
        description: `${avgPassAccuracy.toFixed(0)}% pass accuracy suggests room for improvement in ball retention and decision-making.`,
        severity: 'medium',
        confidence: 85,
        actionable: true,
        category: 'weakness',
        priority: 'medium'
      });
    }
  }

  // Shot accuracy analysis
  const shotGames = allGames.filter(game => game.teamStats.shots && game.teamStats.shotsOnTarget);
  if (shotGames.length >= 5) {
    const totalShots = shotGames.reduce((sum, game) => sum + game.teamStats.shots, 0);
    const shotsOnTarget = shotGames.reduce((sum, game) => sum + game.teamStats.shotsOnTarget, 0);
    const shotAccuracy = (shotsOnTarget / totalShots) * 100;
    
    if (shotAccuracy >= 60) {
      insights.push({
        id: 'shot-accuracy-excellence',
        type: 'strength',
        title: 'Excellent Shot Selection',
        description: `${shotAccuracy.toFixed(0)}% of your shots are on target, showing great shot selection and technique.`,
        severity: 'low',
        confidence: 85,
        actionable: false,
        category: 'strength',
        priority: 'low'
      });
    } else if (shotAccuracy <= 40) {
      insights.push({
        id: 'shot-accuracy-issues',
        type: 'weakness',
        title: 'Shot Accuracy Concerns',
        description: `Only ${shotAccuracy.toFixed(0)}% of your shots are on target. Work on shot selection and technique.`,
        severity: 'medium',
        confidence: 85,
        actionable: true,
        category: 'weakness',
        priority: 'medium'
      });
    }
    
    // Shot efficiency analysis
    const avgShotsPerGoal = totalGoals > 0 ? totalShots / totalGoals : 0;
    
    if (avgShotsPerGoal <= 3 && totalGoals >= 10) {
      insights.push({
        id: 'clinical-conversion',
        type: 'strength',
        title: 'Clinical Shot Conversion',
        description: `Scoring a goal every ${avgShotsPerGoal.toFixed(1)} shots shows exceptional finishing efficiency.`,
        severity: 'low',
        confidence: 88,
        actionable: false,
        category: 'strength',
        priority: 'low'
      });
    } else if (avgShotsPerGoal >= 8 && totalGoals >= 10) {
      insights.push({
        id: 'wasteful-shooting',
        type: 'weakness',
        title: 'Shot Conversion Inefficiency',
        description: `Needing ${avgShotsPerGoal.toFixed(1)} shots per goal indicates wasteful finishing. Practice composure in front of goal.`,
        severity: 'medium',
        confidence: 85,
        actionable: true,
        category: 'weakness',
        priority: 'medium'
      });
    }
  }

  // Discipline analysis
  const disciplineGames = allGames.filter(game => game.teamStats.yellowCards !== undefined || game.teamStats.redCards !== undefined);
  if (disciplineGames.length >= 5) {
    const totalYellows = disciplineGames.reduce((sum, game) => sum + (game.teamStats.yellowCards || 0), 0);
    const totalReds = disciplineGames.reduce((sum, game) => sum + (game.teamStats.redCards || 0), 0);
    
    const yellowsPerGame = totalYellows / disciplineGames.length;
    const redsPerGame = totalReds / disciplineGames.length;
    
    if (yellowsPerGame >= 2 || redsPerGame >= 0.2) {
      insights.push({
        id: 'discipline-issues',
        type: 'weakness',
        title: 'Discipline Concerns',
        description: `Averaging ${yellowsPerGame.toFixed(1)} yellow and ${redsPerGame.toFixed(1)} red cards per game suggests overly aggressive play.`,
        severity: 'medium',
        confidence: 80,
        actionable: true,
        category: 'weakness',
        priority: 'medium'
      });
    } else if (yellowsPerGame <= 0.5 && redsPerGame === 0 && disciplineGames.length >= 10) {
      insights.push({
        id: 'excellent-discipline',
        type: 'strength',
        title: 'Excellent Discipline',
        description: `Your clean disciplinary record shows good control and timing in challenges.`,
        severity: 'low',
        confidence: 80,
        actionable: false,
        category: 'strength',
        priority: 'low'
      });
    }
  }

  // Corner efficiency
  const cornerGames = allGames.filter(game => game.teamStats.corners !== undefined);
  if (cornerGames.length >= 10) {
    const totalCorners = cornerGames.reduce((sum, game) => sum + (game.teamStats.corners || 0), 0);
    const cornersPerGame = totalCorners / cornerGames.length;
    
    if (cornersPerGame >= 6) {
      insights.push({
        id: 'corner-specialist',
        type: 'pattern',
        title: 'Set Piece Opportunities',
        description: `Earning ${cornersPerGame.toFixed(1)} corners per game provides numerous set piece opportunities. Capitalize on these chances.`,
        severity: 'low',
        confidence: 75,
        actionable: true,
        category: 'opportunity',
        priority: 'low'
      });
    }
  }

  // Player performance analysis
  const allPlayerStats = allGames.flatMap(game => game.playerStats || []);
  if (allPlayerStats.length > 0) {
    // Find top performers
    const playerPerformance = new Map<string, {
      name: string;
      position: string;
      games: number;
      goals: number;
      assists: number;
      totalRating: number;
    }>();
    
    allPlayerStats.forEach(player => {
      const key = `${player.name}-${player.position}`;
      if (!playerPerformance.has(key)) {
        playerPerformance.set(key, {
          name: player.name,
          position: player.position,
          games: 0,
          goals: 0,
          assists: 0,
          totalRating: 0
        });
      }
      
      const stats = playerPerformance.get(key)!;
      stats.games += 1;
      stats.goals += player.goals;
      stats.assists += player.assists;
      stats.totalRating += player.rating;
    });
    
    // Find standout performers
    const standoutPlayers = Array.from(playerPerformance.values())
      .filter(p => p.games >= 5)
      .map(p => ({
        ...p,
        avgRating: p.totalRating / p.games,
        goalsPerGame: p.goals / p.games,
        assistsPerGame: p.assists / p.games,
        goalContributions: p.goals + p.assists
      }))
      .sort((a, b) => b.avgRating - a.avgRating);
    
    if (standoutPlayers.length > 0) {
      const topPlayer = standoutPlayers[0];
      if (topPlayer.avgRating >= 8.0) {
        insights.push({
          id: 'star-player',
          type: 'strength',
          title: 'Exceptional Star Player',
          description: `${topPlayer.name} (${topPlayer.position}) is performing at an elite level with a ${topPlayer.avgRating.toFixed(1)} average rating over ${topPlayer.games} games.`,
          severity: 'low',
          confidence: 90,
          actionable: false,
          category: 'strength',
          priority: 'low'
        });
      }
      
      // Find underperforming players
      const underperformers = standoutPlayers
        .filter(p => p.games >= 5 && p.avgRating < 6.5)
        .sort((a, b) => a.avgRating - b.avgRating);
      
      if (underperformers.length > 0) {
        const worstPlayer = underperformers[0];
        insights.push({
          id: 'underperforming-player',
          type: 'weakness',
          title: 'Player Performance Concerns',
          description: `${worstPlayer.name} (${worstPlayer.position}) is underperforming with only a ${worstPlayer.avgRating.toFixed(1)} average rating. Consider a replacement.`,
          severity: 'medium',
          confidence: 85,
          actionable: true,
          category: 'weakness',
          priority: 'medium'
        });
      }
      
      // Goal contribution analysis
      const topScorer = [...standoutPlayers].sort((a, b) => b.goals - a.goals)[0];
      if (topScorer.goals >= 10) {
        insights.push({
          id: 'prolific-scorer',
          type: 'strength',
          title: 'Prolific Goal Scorer',
          description: `${topScorer.name} (${topScorer.position}) has scored ${topScorer.goals} goals in ${topScorer.games} games, making them a key attacking asset.`,
          severity: 'low',
          confidence: 90,
          actionable: false,
          category: 'strength',
          priority: 'low'
        });
      }
      
      const topAssister = [...standoutPlayers].sort((a, b) => b.assists - a.assists)[0];
      if (topAssister.assists >= 8) {
        insights.push({
          id: 'creative-playmaker',
          type: 'strength',
          title: 'Creative Playmaker',
          description: `${topAssister.name} (${topAssister.position}) has provided ${topAssister.assists} assists in ${topAssister.games} games, showing excellent vision and passing.`,
          severity: 'low',
          confidence: 90,
          actionable: false,
          category: 'strength',
          priority: 'low'
        });
      }
    }
  }

  // Positional analysis
  if (allPlayerStats.length >= 20) {
    const positionPerformance = new Map<string, {
      position: string;
      games: number;
      totalRating: number;
      goals: number;
      assists: number;
    }>();
    
    allPlayerStats.forEach(player => {
      if (!positionPerformance.has(player.position)) {
        positionPerformance.set(player.position, {
          position: player.position,
          games: 0,
          totalRating: 0,
          goals: 0,
          assists: 0
        });
      }
      
      const stats = positionPerformance.get(player.position)!;
      stats.games += 1;
      stats.totalRating += player.rating;
      stats.goals += player.goals;
      stats.assists += player.assists;
    });
    
    const positionStats = Array.from(positionPerformance.values())
      .filter(p => p.games >= 5)
      .map(p => ({
        ...p,
        avgRating: p.totalRating / p.games,
        goalsPerGame: p.goals / p.games,
        assistsPerGame: p.assists / p.games
      }));
    
    // Find strongest and weakest positions
    const strongestPosition = [...positionStats].sort((a, b) => b.avgRating - a.avgRating)[0];
    const weakestPosition = [...positionStats].sort((a, b) => a.avgRating - b.avgRating)[0];
    
    if (strongestPosition && strongestPosition.avgRating >= 7.5) {
      insights.push({
        id: 'strong-position',
        type: 'strength',
        title: `Strong ${strongestPosition.position} Performance`,
        description: `Your ${strongestPosition.position} position is performing exceptionally with a ${strongestPosition.avgRating.toFixed(1)} average rating.`,
        severity: 'low',
        confidence: 85,
        actionable: false,
        category: 'strength',
        priority: 'low'
      });
    }
    
    if (weakestPosition && weakestPosition.avgRating <= 6.5 && Math.abs(strongestPosition.avgRating - weakestPosition.avgRating) >= 0.8) {
      insights.push({
        id: 'weak-position',
        type: 'weakness',
        title: `${weakestPosition.position} Improvement Needed`,
        description: `Your ${weakestPosition.position} position is underperforming with only a ${weakestPosition.avgRating.toFixed(1)} average rating. Consider personnel changes.`,
        severity: 'medium',
        confidence: 85,
        actionable: true,
        category: 'weakness',
        priority: 'medium'
      });
    }
    
    // Attacking contribution by position
    const attackingPositions = positionStats.filter(p => 
      ['ST', 'CF', 'LW', 'RW', 'CAM', 'LF', 'RF'].includes(p.position)
    );
    
    if (attackingPositions.length > 0) {
      const avgAttackingGoals = attackingPositions.reduce((sum, p) => sum + p.goalsPerGame, 0) / attackingPositions.length;
      
      if (avgAttackingGoals >= 0.8) {
        insights.push({
          id: 'prolific-attack',
          type: 'strength',
          title: 'Prolific Attacking Unit',
          description: `Your attacking players are averaging ${avgAttackingGoals.toFixed(1)} goals per game, showing excellent offensive efficiency.`,
          severity: 'low',
          confidence: 85,
          actionable: false,
          category: 'strength',
          priority: 'low'
        });
      } else if (avgAttackingGoals <= 0.3 && attackingPositions.length >= 2) {
        insights.push({
          id: 'attacking-struggles',
          type: 'weakness',
          title: 'Attacking Unit Concerns',
          description: `Your attacking players are only averaging ${avgAttackingGoals.toFixed(1)} goals per game. Consider tactical or personnel changes.`,
          severity: 'medium',
          confidence: 85,
          actionable: true,
          category: 'weakness',
          priority: 'medium'
        });
      }
    }
    
    // Midfield contribution
    const midfieldPositions = positionStats.filter(p => 
      ['CM', 'CDM', 'LM', 'RM', 'LCM', 'RCM', 'LDM', 'RDM'].includes(p.position)
    );
    
    if (midfieldPositions.length > 0) {
      const avgMidfieldAssists = midfieldPositions.reduce((sum, p) => sum + p.assistsPerGame, 0) / midfieldPositions.length;
      
      if (avgMidfieldAssists >= 0.5) {
        insights.push({
          id: 'creative-midfield',
          type: 'strength',
          title: 'Creative Midfield',
          description: `Your midfielders are providing ${avgMidfieldAssists.toFixed(1)} assists per game, showing excellent creativity and vision.`,
          severity: 'low',
          confidence: 85,
          actionable: false,
          category: 'strength',
          priority: 'low'
        });
      }
    }
    
    // Defensive performance
    const defensivePositions = positionStats.filter(p => 
      ['CB', 'LB', 'RB', 'LWB', 'RWB', 'LCB', 'RCB'].includes(p.position)
    );
    
    if (defensivePositions.length > 0) {
      const avgDefensiveRating = defensivePositions.reduce((sum, p) => sum + p.avgRating, 0) / defensivePositions.length;
      
      if (avgDefensiveRating >= 7.5) {
        insights.push({
          id: 'solid-defensive-unit',
          type: 'strength',
          title: 'Solid Defensive Unit',
          description: `Your defenders are averaging a ${avgDefensiveRating.toFixed(1)} rating, providing a strong foundation for success.`,
          severity: 'low',
          confidence: 85,
          actionable: false,
          category: 'strength',
          priority: 'low'
        });
      } else if (avgDefensiveRating <= 6.5 && defensivePositions.length >= 2) {
        insights.push({
          id: 'defensive-unit-concerns',
          type: 'weakness',
          title: 'Defensive Unit Improvement Needed',
          description: `Your defenders are only averaging a ${avgDefensiveRating.toFixed(1)} rating. Consider tactical or personnel changes.`,
          severity: 'medium',
          confidence: 85,
          actionable: true,
          category: 'weakness',
          priority: 'medium'
        });
      }
    }
  }

  // Comeback analysis
  const comebackGames = allGames.filter(game => {
    if (game.result !== 'win') return false;
    // Check if there's any indication of being behind in the game
    return game.comments?.toLowerCase().includes('comeback') || 
           game.comments?.toLowerCase().includes('behind') ||
           game.comments?.toLowerCase().includes('down');
  });
  
  if (comebackGames.length >= 3) {
    insights.push({
      id: 'comeback-specialist',
      type: 'strength',
      title: 'Comeback Specialist',
      description: `You've shown excellent mental strength by coming from behind to win on multiple occasions.`,
      severity: 'low',
      confidence: 75,
      actionable: false,
      category: 'strength',
      priority: 'low'
    });
  }

  // Lead protection analysis
  const leadLossGames = allGames.filter(game => {
    if (game.result !== 'loss') return false;
    // Check if there's any indication of losing a lead
    return game.comments?.toLowerCase().includes('lost lead') || 
           game.comments?.toLowerCase().includes('was ahead') ||
           game.comments?.toLowerCase().includes('blew lead');
  });
  
  if (leadLossGames.length >= 3) {
    insights.push({
      id: 'lead-protection-issues',
      type: 'weakness',
      title: 'Lead Protection Concerns',
      description: `You've lost leads multiple times, suggesting issues with game management when ahead. Practice defensive tactics.`,
      severity: 'medium',
      confidence: 75,
      actionable: true,
      category: 'weakness',
      priority: 'medium'
    });
  }

  // First half vs second half performance
  const detailedGames = allGames.filter(game => game.comments?.includes('half'));
  if (detailedGames.length >= 10) {
    const firstHalfStronger = detailedGames.filter(game => 
      game.comments?.toLowerCase().includes('strong first half') || 
      game.comments?.toLowerCase().includes('good start')
    ).length;
    
    const secondHalfStronger = detailedGames.filter(game => 
      game.comments?.toLowerCase().includes('strong second half') || 
      game.comments?.toLowerCase().includes('improved after break')
    ).length;
    
    if (firstHalfStronger >= secondHalfStronger * 2 && firstHalfStronger >= 5) {
      insights.push({
        id: 'first-half-specialist',
        type: 'pattern',
        title: 'First Half Specialist',
        description: `You consistently perform better in the first half. Focus on maintaining energy and concentration throughout the game.`,
        severity: 'low',
        confidence: 75,
        actionable: true,
        category: 'opportunity',
        priority: 'low'
      });
    } else if (secondHalfStronger >= firstHalfStronger * 2 && secondHalfStronger >= 5) {
      insights.push({
        id: 'second-half-specialist',
        type: 'pattern',
        title: 'Second Half Specialist',
        description: `You consistently perform better in the second half. Consider starting games with more intensity.`,
        severity: 'low',
        confidence: 75,
        actionable: true,
        category: 'opportunity',
        priority: 'low'
      });
    }
  }

  // Narrow wins/losses analysis
  const narrowGames = allGames.filter(game => {
    const [goalsFor, goalsAgainst] = game.scoreLine.split('-').map(Number);
    return Math.abs(goalsFor - goalsAgainst) === 1;
  });
  
  if (narrowGames.length >= 10) {
    const narrowWins = narrowGames.filter(game => game.result === 'win').length;
    const narrowLosses = narrowGames.filter(game => game.result === 'loss').length;
    
    if (narrowWins >= narrowLosses * 2) {
      insights.push({
        id: 'clutch-performer',
        type: 'strength',
        title: 'Clutch Performer',
        description: `You've won ${narrowWins} close games, showing excellent composure and game management in tight situations.`,
        severity: 'low',
        confidence: 85,
        actionable: false,
        category: 'strength',
        priority: 'low'
      });
    } else if (narrowLosses >= narrowWins * 2) {
      insights.push({
        id: 'close-game-struggles',
        type: 'weakness',
        title: 'Close Game Struggles',
        description: `You've lost ${narrowLosses} close games, suggesting difficulties in managing tight situations. Work on composure under pressure.`,
        severity: 'medium',
        confidence: 85,
        actionable: true,
        category: 'weakness',
        priority: 'medium'
      });
    }
  }

  // High-scoring game analysis
  const highScoringGames = allGames.filter(game => {
    const [goalsFor, goalsAgainst] = game.scoreLine.split('-').map(Number);
    return goalsFor + goalsAgainst >= 5;
  });
  
  if (highScoringGames.length >= 5) {
    const highScoringWins = highScoringGames.filter(game => game.result === 'win').length;
    const highScoringWinRate = (highScoringWins / highScoringGames.length) * 100;
    
    if (highScoringWinRate >= 70) {
      insights.push({
        id: 'thrives-in-open-games',
        type: 'strength',
        title: 'Thrives in Open Games',
        description: `${highScoringWinRate.toFixed(0)}% win rate in high-scoring games shows you excel when matches are open and attacking.`,
        severity: 'low',
        confidence: 80,
        actionable: true,
        category: 'strength',
        priority: 'low'
      });
    } else if (highScoringWinRate <= 30) {
      insights.push({
        id: 'struggles-in-open-games',
        type: 'weakness',
        title: 'Vulnerable in Open Games',
        description: `Only ${highScoringWinRate.toFixed(0)}% win rate in high-scoring games suggests you should aim for more controlled matches.`,
        severity: 'medium',
        confidence: 80,
        actionable: true,
        category: 'weakness',
        priority: 'medium'
      });
    }
  }

  // Low-scoring game analysis
  const lowScoringGames = allGames.filter(game => {
    const [goalsFor, goalsAgainst] = game.scoreLine.split('-').map(Number);
    return goalsFor + goalsAgainst <= 2;
  });
  
  if (lowScoringGames.length >= 5) {
    const lowScoringWins = lowScoringGames.filter(game => game.result === 'win').length;
    const lowScoringWinRate = (lowScoringWins / lowScoringGames.length) * 100;
    
    if (lowScoringWinRate >= 70) {
      insights.push({
        id: 'thrives-in-tight-games',
        type: 'strength',
        title: 'Thrives in Tight Games',
        description: `${lowScoringWinRate.toFixed(0)}% win rate in low-scoring games shows excellent game management and defensive discipline.`,
        severity: 'low',
        confidence: 80,
        actionable: true,
        category: 'strength',
        priority: 'low'
      });
    } else if (lowScoringWinRate <= 30) {
      insights.push({
        id: 'struggles-in-tight-games',
        type: 'weakness',
        title: 'Struggles in Tight Games',
        description: `Only ${lowScoringWinRate.toFixed(0)}% win rate in low-scoring games suggests difficulty breaking down defensive opponents.`,
        severity: 'medium',
        confidence: 80,
        actionable: true,
        category: 'weakness',
        priority: 'medium'
      });
    }
  }

  // Consistency in scoring
  if (allGames.length >= 10) {
    const gamesWithGoals = allGames.filter(game => {
      const [goalsFor] = game.scoreLine.split('-').map(Number);
      return goalsFor > 0;
    }).length;
    
    const scoringRate = (gamesWithGoals / allGames.length) * 100;
    
    if (scoringRate >= 90) {
      insights.push({
        id: 'consistent-scorer',
        type: 'strength',
        title: 'Consistent Scoring Threat',
        description: `You score in ${scoringRate.toFixed(0)}% of your games, showing consistent offensive threat regardless of opposition.`,
        severity: 'low',
        confidence: 90,
        actionable: false,
        category: 'strength',
        priority: 'low'
      });
    } else if (scoringRate <= 60) {
      insights.push({
        id: 'scoring-consistency-issues',
        type: 'weakness',
        title: 'Scoring Consistency Issues',
        description: `You fail to score in ${(100 - scoringRate).toFixed(0)}% of your games. Improving offensive consistency is crucial.`,
        severity: 'medium',
        confidence: 85,
        actionable: true,
        category: 'weakness',
        priority: 'medium'
      });
    }
  }

  // Consistency in conceding
  if (allGames.length >= 10) {
    const gamesWithoutConceding = allGames.filter(game => {
      const [, goalsAgainst] = game.scoreLine.split('-').map(Number);
      return goalsAgainst === 0;
    }).length;
    
    const cleanSheetRate = (gamesWithoutConceding / allGames.length) * 100;
    
    if (cleanSheetRate >= 50) {
      insights.push({
        id: 'defensive-wall',
        type: 'strength',
        title: 'Defensive Wall',
        description: `You keep clean sheets in ${cleanSheetRate.toFixed(0)}% of your games, providing a solid foundation for success.`,
        severity: 'low',
        confidence: 90,
        actionable: false,
        category: 'strength',
        priority: 'low'
      });
    }
  }

  // Comeback ability
  const comeFromBehindGames = allGames.filter(game => {
    // This is a simplification - ideally we'd have data on in-game score changes
    return game.result === 'win' && game.comments?.toLowerCase().includes('comeback');
  });
  
  if (comeFromBehindGames.length >= 3) {
    insights.push({
      id: 'comeback-king',
      type: 'strength',
      title: 'Comeback Specialist',
      description: `You've demonstrated excellent mental strength by coming from behind to win on multiple occasions.`,
      severity: 'low',
      confidence: 80,
      actionable: false,
      category: 'strength',
      priority: 'low'
    });
  }

  // Blowing leads
  const blownLeadGames = allGames.filter(game => {
    // This is a simplification - ideally we'd have data on in-game score changes
    return game.result === 'loss' && game.comments?.toLowerCase().includes('lost lead');
  });
  
  if (blownLeadGames.length >= 3) {
    insights.push({
      id: 'lead-management-issues',
      type: 'weakness',
      title: 'Lead Management Issues',
      description: `You've lost leads multiple times, suggesting problems with game management when ahead. Practice defensive tactics.`,
      severity: 'medium',
      confidence: 80,
      actionable: true,
      category: 'weakness',
      priority: 'medium'
    });
  }

  // Playstyle insights based on stats patterns
  if (possessionGames.length >= 10 && shotGames.length >= 10) {
    const avgPossession = possessionGames.reduce((sum, game) => sum + game.teamStats.possession, 0) / possessionGames.length;
    const totalShots = shotGames.reduce((sum, game) => sum + game.teamStats.shots, 0);
    const shotsPerGame = totalShots / shotGames.length;
    
    if (avgPossession >= 60 && shotsPerGame >= 12) {
      insights.push({
        id: 'dominant-possession-style',
        type: 'pattern',
        title: 'Dominant Possession Style',
        description: `High possession (${avgPossession.toFixed(0)}%) and shots (${shotsPerGame.toFixed(1)}/game) indicate a dominant, controlling playstyle.`,
        severity: 'low',
        confidence: 85,
        actionable: false,
        category: 'strength',
        priority: 'low'
      });
    } else if (avgPossession <= 45 && shotsPerGame >= 10) {
      insights.push({
        id: 'counter-attack-style',
        type: 'pattern',
        title: 'Effective Counter-Attacking',
        description: `Lower possession (${avgPossession.toFixed(0)}%) but high shots (${shotsPerGame.toFixed(1)}/game) suggest an efficient counter-attacking approach.`,
        severity: 'low',
        confidence: 85,
        actionable: false,
        category: 'strength',
        priority: 'low'
      });
    } else if (avgPossession >= 60 && shotsPerGame <= 8) {
      insights.push({
        id: 'possession-without-penetration',
        type: 'weakness',
        title: 'Possession Without Penetration',
        description: `High possession (${avgPossession.toFixed(0)}%) but few shots (${shotsPerGame.toFixed(1)}/game) suggest difficulty creating clear chances.`,
        severity: 'medium',
        confidence: 85,
        actionable: true,
        category: 'weakness',
        priority: 'medium'
      });
    }
  }

  // Game duration analysis
  if (allGames.length >= 10) {
    const avgDuration = allGames.reduce((sum, game) => sum + game.duration, 0) / allGames.length;
    
    if (avgDuration >= 100) {
      insights.push({
        id: 'extended-games',
        type: 'pattern',
        title: 'Extended Game Specialist',
        description: `Your games average ${avgDuration.toFixed(0)} minutes, suggesting frequent extra time. Stamina and concentration are key.`,
        severity: 'low',
        confidence: 80,
        actionable: true,
        category: 'opportunity',
        priority: 'low'
      });
    } else if (avgDuration <= 80) {
      insights.push({
        id: 'quick-games',
        type: 'pattern',
        title: 'Quick Game Specialist',
        description: `Your games average only ${avgDuration.toFixed(0)} minutes, suggesting efficient play or early decisions.`,
        severity: 'low',
        confidence: 80,
        actionable: false,
        category: 'opportunity',
        priority: 'low'
      });
    }
    
    // Duration impact on results
    const longGames = allGames.filter(game => game.duration >= 100);
    const shortGames = allGames.filter(game => game.duration <= 80);
    
    if (longGames.length >= 5 && shortGames.length >= 5) {
      const longGameWinRate = longGames.filter(g => g.result === 'win').length / longGames.length * 100;
      const shortGameWinRate = shortGames.filter(g => g.result === 'win').length / shortGames.length * 100;
      
      if (longGameWinRate - shortGameWinRate >= 20) {
        insights.push({
          id: 'endurance-advantage',
          type: 'strength',
          title: 'Endurance Advantage',
          description: `${longGameWinRate.toFixed(0)}% win rate in longer games vs ${shortGameWinRate.toFixed(0)}% in shorter games suggests superior stamina and focus.`,
          severity: 'low',
          confidence: 80,
          actionable: true,
          category: 'strength',
          priority: 'low'
        });
      } else if (shortGameWinRate - longGameWinRate >= 20) {
        insights.push({
          id: 'quick-game-advantage',
          type: 'strength',
          title: 'Quick Game Advantage',
          description: `${shortGameWinRate.toFixed(0)}% win rate in shorter games vs ${longGameWinRate.toFixed(0)}% in longer games suggests you excel in fast-paced matches.`,
          severity: 'low',
          confidence: 80,
          actionable: true,
          category: 'strength',
          priority: 'low'
        });
      }
    }
  }

  // Randomize the order a bit to avoid always showing the same insights
  return insights
    .sort(() => Math.random() - 0.5)
    .slice(0, 50); // Return up to 50 insights
}

export function generateGameInsights(game: GameResult, weekStats: any): string[] {
  const insights: string[] = [];
  const [goalsFor, goalsAgainst] = game.scoreLine.split('-').map(Number);
  const goalDifference = goalsFor - goalsAgainst;
  
  // Result-based insights
  if (game.result === 'win') {
    if (goalDifference >= 5) {
      insights.push("🔥 Absolutely dominant performance! You completely outclassed your opponent in every aspect of the game.");
    } else if (goalDifference >= 3) {
      insights.push("💪 Commanding victory! Your tactical approach completely overwhelmed the opponent.");
    } else if (goalsAgainst === 0) {
      insights.push("🛡️ Clean sheet victory demonstrates excellent defensive discipline and concentration.");
    } else if (goalDifference === 1) {
      insights.push("⚔️ Hard-fought narrow win shows mental resilience and clutch performance under pressure.");
    }
    
    if (game.opponentSkill >= 8) {
      insights.push("🏆 Impressive win against high-skilled opposition proves you can compete at the elite level.");
    } else if (game.opponentSkill <= 4) {
      insights.push("✅ Solid win against a lower-rated opponent. You took care of business as expected.");
    }
    
    if (game.gameContext === 'penalties') {
      insights.push("🎯 Penalty shootout victory demonstrates exceptional mental fortitude and composure.");
    } else if (game.gameContext === 'extra_time') {
      insights.push("⏱️ Extra time victory shows superior stamina and concentration in extended play.");
    } else if (game.gameContext === 'rage_quit') {
      insights.push("💥 Your dominant play forced a rage quit. Your opponent couldn't handle the pressure!");
    }
  } else {
    if (goalDifference <= -5) {
      insights.push("📊 Heavy defeat suggests a need for significant tactical adjustments. Take time to analyze what went wrong.");
    } else if (goalDifference <= -3) {
      insights.push("🔍 Decisive defeat suggests tactical adjustments needed. Analyze opponent's approach and adapt.");
    } else if (goalDifference === -1) {
      insights.push("🎯 Narrow loss shows you're competitive. Small improvements could turn these into wins.");
    }
    
    if (game.opponentSkill >= 8) {
      insights.push("📈 Loss against a highly-skilled opponent provides valuable learning opportunities. Review the game for improvement areas.");
    } else if (game.opponentSkill <= 4) {
      insights.push("⚠️ Loss to lower-skilled opponent indicates concentration issues or complacency.");
    }
    
    if (game.gameContext === 'penalties') {
      insights.push("🎮 Penalty shootout losses can be random. Don't be too discouraged, but practice penalties for next time.");
    } else if (game.gameContext === 'extra_time') {
      insights.push("⚡ Extra time defeat might indicate fatigue issues. Consider your stamina management and substitution strategy.");
    } else if (game.gameContext === 'rage_quit') {
      insights.push("🧠 Maintaining composure is crucial. Take a short break before your next match to reset mentally.");
    }
  }
  
  // Performance insights
  if (game.teamStats) {
    if (game.teamStats.possession > 60) {
      insights.push(`🔄 Dominated possession with ${game.teamStats.possession}%. ${game.result === 'win' ? 'Excellent ball control translated to victory.' : 'Focus on turning possession into clear chances.'}`);
    } else if (game.teamStats.possession < 40) {
      insights.push(`⚡ Low possession (${game.teamStats.possession}%) but ${game.result === 'win' ? 'effective counter-attacking secured the win.' : 'struggled to maintain control of the game.'}`);
    }
    
    if (game.teamStats.shots > 15) {
      insights.push(`🎯 Created plenty of chances with ${game.teamStats.shots} shots. ${game.result === 'win' ? 'Excellent attacking pressure.' : 'Work on finishing to convert more chances.'}`);
    } else if (game.teamStats.shots < 5) {
      insights.push(`⚠️ Only ${game.teamStats.shots} shots suggests difficulties creating chances. Work on build-up play and final third entries.`);
    }
    
    if (game.teamStats.shotsOnTarget / game.teamStats.shots > 0.7 && game.teamStats.shots >= 5) {
      insights.push(`🎯 Exceptional shot accuracy of ${Math.round((game.teamStats.shotsOnTarget / game.teamStats.shots) * 100)}%. Your shot selection and technique are excellent.`);
    } else if (game.teamStats.shotsOnTarget / game.teamStats.shots < 0.3 && game.teamStats.shots >= 5) {
      insights.push(`📉 Poor shot accuracy of ${Math.round((game.teamStats.shotsOnTarget / game.teamStats.shots) * 100)}%. Work on shot selection and technique.`);
    }
    
    if (game.teamStats.passAccuracy > 85) {
      insights.push(`🔄 Excellent passing accuracy of ${game.teamStats.passAccuracy}% shows great technical skill and decision-making.`);
    } else if (game.teamStats.passAccuracy < 70) {
      insights.push(`⚠️ Low passing accuracy of ${game.teamStats.passAccuracy}% suggests rushed decisions or poor execution. Focus on composure.`);
    }
    
    if (game.teamStats.expectedGoals > 0) {
      const xgDifference = goalsFor - game.teamStats.expectedGoals;
      if (xgDifference >= 2) {
        insights.push(`🎯 Outperformed xG by ${xgDifference.toFixed(1)} goals, showing clinical finishing and quality chance creation.`);
      } else if (xgDifference <= -2) {
        insights.push(`⚠️ Underperformed xG by ${Math.abs(xgDifference).toFixed(1)} goals. Focus on composure in front of goal.`);
      }
    }
    
    if (game.teamStats.expectedGoalsAgainst > 0) {
      const xgaDifference = goalsAgainst - game.teamStats.expectedGoalsAgainst;
      if (xgaDifference <= -2) {
        insights.push(`🛡️ Conceded ${Math.abs(xgaDifference).toFixed(1)} goals fewer than xGA, showing excellent goalkeeping and defensive blocks.`);
      } else if (xgaDifference >= 2) {
        insights.push(`⚠️ Conceded ${xgaDifference.toFixed(1)} goals more than xGA. Goalkeeping or defensive positioning may need attention.`);
      }
    }
    
    if (game.teamStats.corners >= 8) {
      insights.push(`🚩 Earned ${game.teamStats.corners} corners, showing good attacking pressure. ${game.result === 'win' ? 'Effectively turned territorial advantage into a win.' : 'Work on set piece efficiency to capitalize on these opportunities.'}`);
    }
    
    if (game.teamStats.yellowCards >= 3) {
      insights.push(`🟨 Received ${game.teamStats.yellowCards} yellow cards. Be careful with aggressive challenges to avoid disadvantages.`);
    }
    
    if (game.teamStats.redCards > 0) {
      insights.push(`🟥 Red card significantly impacted the game. Maintain discipline to avoid numerical disadvantages.`);
    }
  }
  
  // Player performance insights
  if (game.playerStats && game.playerStats.length > 0) {
    const avgRating = game.playerStats.reduce((sum, p) => sum + p.rating, 0) / game.playerStats.length;
    
    if (avgRating >= 8.0) {
      insights.push(`⭐ Exceptional team performance with ${avgRating.toFixed(1)} average player rating. The entire squad was in top form.`);
    } else if (avgRating <= 6.0) {
      insights.push(`📉 Below-par team performance with only ${avgRating.toFixed(1)} average player rating. Consider tactical or personnel changes.`);
    }
    
    // Find standout performers
    const topPerformer = [...game.playerStats].sort((a, b) => b.rating - a.rating)[0];
    if (topPerformer.rating >= 8.5) {
      insights.push(`🌟 ${topPerformer.name} was outstanding with a ${topPerformer.rating.toFixed(1)} rating. ${topPerformer.goals > 0 || topPerformer.assists > 0 ? `Contributed ${topPerformer.goals} goals and ${topPerformer.assists} assists.` : 'Dominated their position.'}`);
    }
    
    // Find underperformers
    const worstPerformer = [...game.playerStats].sort((a, b) => a.rating - b.rating)[0];
    if (worstPerformer.rating <= 5.5) {
      insights.push(`⚠️ ${worstPerformer.name} struggled with a ${worstPerformer.rating.toFixed(1)} rating. Consider a different tactical approach or substitution next time.`);
    }
    
    // Goal contributions
    const goalScorers = game.playerStats.filter(p => p.goals > 0);
    if (goalScorers.length >= 3) {
      insights.push(`⚽ Great team scoring with ${goalScorers.length} different players on the scoresheet. Diverse attacking threats make you unpredictable.`);
    }
    
    const multiGoalScorers = game.playerStats.filter(p => p.goals >= 2);
    if (multiGoalScorers.length > 0) {
      multiGoalScorers.forEach(scorer => {
        if (scorer.goals >= 3) {
          insights.push(`🎩 Hat-trick hero! ${scorer.name} was unstoppable with ${scorer.goals} goals. Outstanding individual performance.`);
        } else {
          insights.push(`⚽ ${scorer.name} showed clinical finishing with a brace. Keep utilizing their scoring ability.`);
        }
      });
    }
    
    const assistMakers = game.playerStats.filter(p => p.assists >= 2);
    if (assistMakers.length > 0) {
      assistMakers.forEach(assister => {
        insights.push(`🎯 ${assister.name} showcased excellent vision with ${assister.assists} assists. Great playmaking performance.`);
      });
    }
  }
  
  // Stress level insights
  if (game.stressLevel) {
    if (game.stressLevel >= 8) {
      insights.push(`😓 High stress level (${game.stressLevel}/10) may have affected decision-making. Consider relaxation techniques before games.`);
    } else if (game.stressLevel <= 3) {
      insights.push(`😌 Low stress level (${game.stressLevel}/10) likely contributed to calm, composed play. Maintain this mental state.`);
    }
  }
  
  // Server quality insights
  if (game.serverQuality) {
    if (game.serverQuality <= 3) {
      insights.push(`🌐 Poor server quality (${game.serverQuality}/10) likely impacted gameplay. Consider playing at different times for better connections.`);
    }
  }
  
  // Streak analysis
  if (weekStats.currentStreak >= 3 && game.result === 'win') {
    insights.push(`🔥 Outstanding ${weekStats.currentStreak}-game winning streak! Momentum is building nicely.`);
  } else if (weekStats.currentStreak <= -3 && game.result === 'loss') {
    insights.push(`🔄 ${Math.abs(weekStats.currentStreak)}-game losing streak requires attention. Consider tactical changes or a short break.`);
  } else if (weekStats.currentStreak === 0 && game.result === 'win') {
    insights.push(`🔄 Excellent bounce-back win after your previous loss. Shows good mental resilience.`);
  }
  
  // Win target progress
  if (game.result === 'win' && weekStats.wins >= 5) {
    insights.push(`🎯 Now at ${weekStats.wins} wins this week. ${weekStats.wins >= 11 ? 'You\'ve reached a strong rank!' : 'Keep pushing toward your target!'}`);
  }
  
  // Random tactical insights based on game context
  const tacticalInsights = [
    "Try using quick tactics to adjust your defensive depth when protecting a lead.",
    "Player instructions can be crucial - set your CDMs to 'Stay Back While Attacking' for better defensive stability.",
    "When struggling to break down defensive opponents, try switching to a formation with width.",
    "Against high-pressing opponents, try using a more direct passing style to bypass their press.",
    "If you're dominating possession but not creating chances, try increasing your players' forward runs.",
    "When facing skilled dribblers, consider using the 'Team Press' quick tactic in key moments.",
    "Substitutions around the 60-70 minute mark can provide fresh legs when opponents are tiring.",
    "Against narrow formations, focus on attacking the wings to find space.",
    "When leading by multiple goals, consider a more possession-based approach to control the game.",
    "Against counter-attacking opponents, be careful not to commit too many players forward."
  ];
  
  // Add a random tactical insight occasionally
  if (Math.random() < 0.3) {
    insights.push(`💡 ${tacticalInsights[Math.floor(Math.random() * tacticalInsights.length)]}`);
  }
  
  // Shuffle insights and limit to 3-5 most relevant ones
  return insights
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(Math.random() * 3) + 3);
}