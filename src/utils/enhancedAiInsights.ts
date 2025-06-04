
import { WeeklyPerformance, GameResult } from '@/types/futChampions';

export interface EnhancedAIInsight {
  id: string;
  type: 'performance' | 'tactical' | 'mental' | 'technical' | 'statistical';
  title: string;
  description: string;
  actionableAdvice: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  category: 'strength' | 'weakness' | 'opportunity' | 'threat';
  priority: 'low' | 'medium' | 'high';
  dataPoints: string[];
}

export function generateEnhancedAIInsights(
  weeklyData: WeeklyPerformance[], 
  currentWeek: WeeklyPerformance | null
): EnhancedAIInsight[] {
  const insights: EnhancedAIInsight[] = [];
  const allGames = weeklyData.flatMap(week => week.games);
  const totalGames = allGames.length;
  
  if (totalGames === 0) return [];

  // Core Statistics
  const totalWins = weeklyData.reduce((sum, week) => sum + week.totalWins, 0);
  const winRate = (totalWins / totalGames) * 100;
  const totalGoals = weeklyData.reduce((sum, week) => sum + week.totalGoals, 0);
  const totalConceded = weeklyData.reduce((sum, week) => sum + week.totalConceded, 0);
  const avgGoalsPerGame = totalGoals / totalGames;
  const avgConcededPerGame = totalConceded / totalGames;
  const goalDifference = totalGoals - totalConceded;

  // Recent form analysis (last 10 games)
  const recentGames = allGames.slice(-10);
  const recentWins = recentGames.filter(game => game.result === 'win').length;
  const recentWinRate = recentGames.length > 0 ? (recentWins / recentGames.length) * 100 : 0;

  // Win Rate Analysis
  if (winRate >= 75) {
    insights.push({
      id: 'elite-performance',
      type: 'performance',
      title: 'Elite Level Performance',
      description: `Outstanding ${winRate.toFixed(1)}% win rate demonstrates exceptional skill and consistency.`,
      actionableAdvice: 'Maintain your current approach and consider competing in higher divisions or tournaments.',
      severity: 'low',
      confidence: 95,
      category: 'strength',
      priority: 'low',
      dataPoints: [`${totalWins}/${totalGames} games won`, `${winRate.toFixed(1)}% win rate`]
    });
  } else if (winRate >= 60) {
    insights.push({
      id: 'strong-performance',
      type: 'performance',
      title: 'Solid Performance Level',
      description: `${winRate.toFixed(1)}% win rate shows good consistency with room for improvement.`,
      actionableAdvice: 'Focus on converting close losses into wins by improving game management in final minutes.',
      severity: 'low',
      confidence: 85,
      category: 'strength',
      priority: 'medium',
      dataPoints: [`${totalWins}/${totalGames} games won`, 'Consistent performer']
    });
  } else if (winRate < 40) {
    insights.push({
      id: 'performance-concerns',
      type: 'performance',
      title: 'Performance Improvement Needed',
      description: `${winRate.toFixed(1)}% win rate indicates significant areas for improvement.`,
      actionableAdvice: 'Practice in Division Rivals, watch tutorials, and consider adjusting your tactics or formation.',
      severity: 'high',
      confidence: 90,
      category: 'weakness',
      priority: 'high',
      dataPoints: [`${totalWins}/${totalGames} games won`, 'Below average performance']
    });
  }

  // Goal Scoring Analysis
  if (avgGoalsPerGame >= 2.5) {
    insights.push({
      id: 'clinical-attack',
      type: 'tactical',
      title: 'Clinical Attacking Play',
      description: `Averaging ${avgGoalsPerGame.toFixed(1)} goals per game shows excellent offensive capabilities.`,
      actionableAdvice: 'Your attack is a major strength. Focus on maintaining this while improving defensive stability.',
      severity: 'low',
      confidence: 88,
      category: 'strength',
      priority: 'low',
      dataPoints: [`${totalGoals} total goals`, `${avgGoalsPerGame.toFixed(1)} per game average`]
    });
  } else if (avgGoalsPerGame < 1.2) {
    insights.push({
      id: 'attacking-struggles',
      type: 'tactical',
      title: 'Attacking Improvement Required',
      description: `Only ${avgGoalsPerGame.toFixed(1)} goals per game suggests difficulty creating and finishing chances.`,
      actionableAdvice: 'Practice shooting drills, work on player positioning, and consider more attacking formations.',
      severity: 'medium',
      confidence: 85,
      category: 'weakness',
      priority: 'medium',
      dataPoints: [`${totalGoals} total goals`, 'Below average scoring rate']
    });
  }

  // Defensive Analysis
  if (avgConcededPerGame <= 1.0) {
    insights.push({
      id: 'defensive-excellence',
      type: 'tactical',
      title: 'Outstanding Defensive Record',
      description: `Conceding only ${avgConcededPerGame.toFixed(1)} goals per game shows exceptional defensive organization.`,
      actionableAdvice: 'Your defense is excellent. Use this foundation to be more adventurous in attack.',
      severity: 'low',
      confidence: 90,
      category: 'strength',
      priority: 'low',
      dataPoints: [`${totalConceded} total conceded`, 'Excellent defensive record']
    });
  } else if (avgConcededPerGame >= 2.5) {
    insights.push({
      id: 'defensive-issues',
      type: 'tactical',
      title: 'Defensive Vulnerabilities',
      description: `Conceding ${avgConcededPerGame.toFixed(1)} goals per game indicates defensive weaknesses.`,
      actionableAdvice: 'Focus on manual defending, improve player positioning, and consider more defensive tactics.',
      severity: 'high',
      confidence: 88,
      category: 'weakness',
      priority: 'high',
      dataPoints: [`${totalConceded} goals conceded`, 'High concession rate']
    });
  }

  // Form Analysis
  if (recentWinRate >= 80 && recentGames.length >= 5) {
    insights.push({
      id: 'hot-streak',
      type: 'mental',
      title: 'Excellent Recent Form',
      description: `${recentWinRate}% win rate in last ${recentGames.length} games shows you're in peak form.`,
      actionableAdvice: 'You\'re playing at your best. Maintain confidence and stick to your current approach.',
      severity: 'low',
      confidence: 85,
      category: 'strength',
      priority: 'low',
      dataPoints: [`${recentWins}/${recentGames.length} recent wins`, 'Hot streak active']
    });
  } else if (recentWinRate <= 20 && recentGames.length >= 5) {
    insights.push({
      id: 'poor-form',
      type: 'mental',
      title: 'Form Slump Detected',
      description: `Only ${recentWinRate}% wins in last ${recentGames.length} games suggests a temporary dip in form.`,
      actionableAdvice: 'Take a break, review recent losses, and consider tactical adjustments or formation changes.',
      severity: 'high',
      confidence: 90,
      category: 'weakness',
      priority: 'high',
      dataPoints: [`${recentWins}/${recentGames.length} recent wins`, 'Form concerns']
    });
  }

  // Goal Difference Analysis
  if (goalDifference >= 20) {
    insights.push({
      id: 'dominant-scorer',
      type: 'statistical',
      title: 'Dominant Goal Difference',
      description: `+${goalDifference} goal difference shows you consistently outplay opponents.`,
      actionableAdvice: 'Excellent balance between attack and defense. Consider playing in higher divisions.',
      severity: 'low',
      confidence: 92,
      category: 'strength',
      priority: 'low',
      dataPoints: [`+${goalDifference} goal difference`, 'Dominant performances']
    });
  } else if (goalDifference <= -10) {
    insights.push({
      id: 'goal-difference-concern',
      type: 'statistical',
      title: 'Negative Goal Difference',
      description: `${goalDifference} goal difference indicates struggles in both scoring and defending.`,
      actionableAdvice: 'Focus on basic defending first, then work on creating more scoring opportunities.',
      severity: 'high',
      confidence: 88,
      category: 'weakness',
      priority: 'high',
      dataPoints: [`${goalDifference} goal difference`, 'Needs improvement']
    });
  }

  // Opponent Skill Analysis
  const avgOpponentSkill = allGames.reduce((sum, game) => sum + game.opponentSkill, 0) / totalGames;
  if (avgOpponentSkill >= 7.5) {
    insights.push({
      id: 'tough-competition',
      type: 'statistical',
      title: 'Competing at Elite Level',
      description: `Facing opponents averaging ${avgOpponentSkill.toFixed(1)}/10 skill shows high-level competition.`,
      actionableAdvice: 'Playing tough opponents improves your game. Don\'t be discouraged by occasional losses.',
      severity: 'medium',
      confidence: 92,
      category: 'opportunity',
      priority: 'medium',
      dataPoints: [`${avgOpponentSkill.toFixed(1)}/10 avg opponent skill`, 'Elite competition']
    });
  } else if (avgOpponentSkill <= 4.0) {
    insights.push({
      id: 'easy-competition',
      type: 'statistical',
      title: 'Consider Tougher Competition',
      description: `Opponents averaging ${avgOpponentSkill.toFixed(1)}/10 skill may not challenge your development.`,
      actionableAdvice: 'Consider moving to higher divisions to face stronger opponents and improve faster.',
      severity: 'medium',
      confidence: 85,
      category: 'opportunity',
      priority: 'medium',
      dataPoints: [`${avgOpponentSkill.toFixed(1)}/10 avg opponent skill`, 'Room for challenge increase']
    });
  }

  // Weekly Consistency Analysis
  if (weeklyData.length >= 3) {
    const weeklyWinRates = weeklyData.map(week => 
      week.games.length > 0 ? (week.totalWins / week.games.length) * 100 : 0
    );
    const variance = weeklyWinRates.reduce((sum, rate) => sum + Math.pow(rate - winRate, 2), 0) / weeklyWinRates.length;
    const standardDeviation = Math.sqrt(variance);
    
    if (standardDeviation <= 15) {
      insights.push({
        id: 'consistent-performer',
        type: 'mental',
        title: 'Remarkable Consistency',
        description: `Low performance variation (${standardDeviation.toFixed(1)}%) shows excellent mental strength.`,
        actionableAdvice: 'Your consistency is a major asset. Use this reliability to build on your strengths.',
        severity: 'low',
        confidence: 88,
        category: 'strength',
        priority: 'low',
        dataPoints: [`${standardDeviation.toFixed(1)}% variation`, 'Highly consistent']
      });
    } else if (standardDeviation >= 30) {
      insights.push({
        id: 'inconsistent-form',
        type: 'mental',
        title: 'Performance Inconsistency',
        description: `High variation (${standardDeviation.toFixed(1)}%) suggests inconsistent performance levels.`,
        actionableAdvice: 'Work on mental preparation and maintaining focus across all games.',
        severity: 'medium',
        confidence: 82,
        category: 'weakness',
        priority: 'medium',
        dataPoints: [`${standardDeviation.toFixed(1)}% variation`, 'Needs consistency work']
      });
    }
  }

  // Context-based insights
  const contextGames = allGames.reduce((acc: any, game) => {
    acc[game.gameContext] = (acc[game.gameContext] || 0) + 1;
    return acc;
  }, {});

  if (contextGames.penalties >= 3) {
    const penaltyGames = allGames.filter(game => game.gameContext === 'penalties');
    const penaltyWins = penaltyGames.filter(game => game.result === 'win').length;
    const penaltyWinRate = (penaltyWins / penaltyGames.length) * 100;
    
    if (penaltyWinRate >= 70) {
      insights.push({
        id: 'penalty-specialist',
        type: 'technical',
        title: 'Penalty Shootout Expert',
        description: `${penaltyWinRate.toFixed(0)}% success rate in penalty shootouts shows excellent composure.`,
        actionableAdvice: 'Your penalty skills are excellent. This mental strength can help in other pressure situations.',
        severity: 'low',
        confidence: 85,
        category: 'strength',
        priority: 'low',
        dataPoints: [`${penaltyWins}/${penaltyGames.length} penalty wins`, 'Clutch performer']
      });
    } else if (penaltyWinRate <= 30) {
      insights.push({
        id: 'penalty-struggles',
        type: 'technical',
        title: 'Penalty Shootout Improvement Needed',
        description: `${penaltyWinRate.toFixed(0)}% penalty success rate suggests room for improvement under pressure.`,
        actionableAdvice: 'Practice penalty taking and work on staying calm in high-pressure situations.',
        severity: 'medium',
        confidence: 80,
        category: 'weakness',
        priority: 'medium',
        dataPoints: [`${penaltyWins}/${penaltyGames.length} penalty wins`, 'Pressure situations difficult']
      });
    }
  }

  return insights.slice(0, 15); // Return top 15 insights
}

export function generateGameSpecificInsights(game: GameResult, weekStats: any): string[] {
  const insights: string[] = [];
  const [goalsFor, goalsAgainst] = game.scoreLine.split('-').map(Number);
  const goalDifference = goalsFor - goalsAgainst;
  
  // Result-based insights
  if (game.result === 'win') {
    if (goalDifference >= 3) {
      insights.push("🔥 Dominant performance! Your tactical approach completely overwhelmed the opponent.");
    } else if (goalsAgainst === 0) {
      insights.push("🛡️ Clean sheet victory demonstrates exceptional defensive discipline and organization.");
    } else if (goalDifference === 1) {
      insights.push("💪 Hard-fought victory shows mental resilience and ability to win tight games.");
    }
    
    if (game.opponentSkill >= 8) {
      insights.push("⭐ Outstanding result against high-skilled opposition proves you can compete at elite level.");
    }
  } else {
    if (goalDifference <= -3) {
      insights.push("📊 Heavy defeat suggests need for tactical review. Analyze opponent's approach and adapt.");
    } else if (goalDifference === -1) {
      insights.push("🎯 Narrow loss shows competitiveness. Small improvements could turn these into wins.");
    }
    
    if (game.opponentSkill <= 5) {
      insights.push("⚠️ Loss to lower-skilled opponent may indicate concentration issues or tactical mistakes.");
    }
  }
  
  // Context-based insights
  if (game.gameContext === 'penalties') {
    insights.push(game.result === 'win' 
      ? "🎯 Penalty shootout victory showcases exceptional mental fortitude under extreme pressure."
      : "🧠 Penalty loss is an opportunity to practice composure and technique in pressure situations."
    );
  }
  
  if (game.gameContext === 'extra_time') {
    insights.push("⏱️ Extra time shows even contest. Focus on stamina and concentration in extended play.");
  }
  
  // Streak analysis
  if (weekStats.currentStreak >= 3 && game.result === 'win') {
    insights.push(`🚀 Incredible ${weekStats.currentStreak}-game winning streak! Momentum is building nicely.`);
  } else if (weekStats.currentStreak <= -2 && game.result === 'loss') {
    insights.push("🔄 Consider tactical changes or a short break to reset mentally and break this pattern.");
  }
  
  return insights;
}
