import { WeeklyPerformance, GameResult } from '@/types/futChampions';

interface EnhancedInsight {
  id: string;
  type: 'performance' | 'tactical' | 'mental' | 'technical' | 'statistical';
  title: string;
  description: string;
  actionableAdvice?: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  category: 'strength' | 'weakness' | 'opportunity' | 'threat';
  severity: 'low' | 'medium' | 'high';
  dataPoints?: string[];
}

export function generateEnhancedAIInsights(
  completedWeeks: WeeklyPerformance[],
  currentWeek: WeeklyPerformance | null
): EnhancedInsight[] {
  if (completedWeeks.length === 0) return [];

  const allGames = completedWeeks.flatMap(week => week.games);
  const recentGames = allGames.slice(-10);
  
  const totalGames = allGames.length;
  const totalWins = allGames.filter(game => game.result === 'win').length;
  const totalLosses = allGames.filter(game => game.result === 'loss').length;
  const winRate = totalGames > 0 ? (totalWins / totalGames) * 100 : 0;
  
  const totalGoals = allGames.reduce((sum, game) => {
    const [goals] = game.scoreLine.split('-').map(Number);
    return sum + goals;
  }, 0);
  
  const totalConceded = allGames.reduce((sum, game) => {
    const [, conceded] = game.scoreLine.split('-').map(Number);
    return sum + conceded;
  }, 0);
  
  const avgGoalsPerGame = totalGames > 0 ? totalGoals / totalGames : 0;
  const avgConcededPerGame = totalGames > 0 ? totalConceded / totalGames : 0;
  
  const insights: EnhancedInsight[] = [];
  
  // Win rate analysis
  if (totalGames >= 5) {
    if (winRate >= 70) {
      insights.push({
        id: 'high-win-rate',
        type: 'performance',
        title: 'Elite Win Rate',
        description: `Your ${winRate.toFixed(1)}% win rate is exceptional. You're consistently outperforming most players.`,
        actionableAdvice: 'Consider increasing opponent skill level or trying more challenging formations to continue improving.',
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
        actionableAdvice: 'Focus on consistency and reducing mistakes in close games to push your win rate higher.',
        confidence: 90,
        priority: 'medium',
        category: 'strength',
        severity: 'medium'
      });
    } else if (winRate < 50 && winRate >= 35) {
      insights.push({
        id: 'below-average-win-rate',
        type: 'performance',
        title: 'Win Rate Needs Improvement',
        description: `Your ${winRate.toFixed(1)}% win rate suggests you're struggling to maintain consistency.`,
        actionableAdvice: 'Review your losses for patterns. Consider simplifying your tactics and focusing on defensive stability first.',
        confidence: 85,
        priority: 'high',
        category: 'weakness',
        severity: 'medium'
      });
    } else if (winRate < 35) {
      insights.push({
        id: 'low-win-rate',
        type: 'performance',
        title: 'Significant Win Rate Concerns',
        description: `Your ${winRate.toFixed(1)}% win rate indicates fundamental issues that need addressing.`,
        actionableAdvice: 'Take a step back and focus on mastering the basics. Consider skill games, practice matches, or watching tutorials before returning to competitive play.',
        confidence: 90,
        priority: 'high',
        category: 'weakness',
        severity: 'high'
      });
    }
  }

  // Recent form analysis
  if (recentGames.length >= 5) {
    const recentWins = recentGames.filter(game => game.result === 'win').length;
    const recentWinRate = (recentWins / recentGames.length) * 100;
    const overallWinRate = totalGames > 0 ? (totalWins / totalGames) * 100 : 0;
    const winRateDifference = recentWinRate - overallWinRate;

    if (winRateDifference >= 15) {
      insights.push({
        id: 'improving-form',
        type: 'performance',
        title: 'Rapidly Improving Form',
        description: `Your recent win rate of ${recentWinRate.toFixed(1)}% is ${winRateDifference.toFixed(1)}% better than your overall average. You're showing significant improvement.`,
        actionableAdvice: 'Analyze what's changed in your recent games and double down on those successful adjustments.',
        confidence: 85,
        priority: 'medium',
        category: 'strength',
        severity: 'low',
        dataPoints: [
          `Recent win rate: ${recentWinRate.toFixed(1)}%`,
          `Overall win rate: ${overallWinRate.toFixed(1)}%`,
          `Improvement: ${winRateDifference.toFixed(1)}%`
        ]
      });
    } else if (winRateDifference <= -15) {
      insights.push({
        id: 'declining-form',
        type: 'performance',
        title: 'Concerning Form Decline',
        description: `Your recent win rate of ${recentWinRate.toFixed(1)}% is ${Math.abs(winRateDifference).toFixed(1)}% worse than your overall average. Your performance is trending downward.`,
        actionableAdvice: 'Take a short break or return to formations and tactics that worked well for you previously. Consider if fatigue or frustration might be affecting your play.',
        confidence: 85,
        priority: 'high',
        category: 'weakness',
        severity: 'high',
        dataPoints: [
          `Recent win rate: ${recentWinRate.toFixed(1)}%`,
          `Overall win rate: ${overallWinRate.toFixed(1)}%`,
          `Decline: ${Math.abs(winRateDifference).toFixed(1)}%`
        ]
      });
    }
  }

  // Goal scoring analysis
  if (totalGames >= 5) {
    if (avgGoalsPerGame >= 3.5) {
      insights.push({
        id: 'exceptional-attack',
        type: 'tactical',
        title: 'Elite Attacking Output',
        description: `Averaging ${avgGoalsPerGame.toFixed(1)} goals per game puts your attack among the elite. Your finishing and chance creation are exceptional.`,
        actionableAdvice: 'Continue with your current attacking approach, but ensure you're not sacrificing defense for these high scoring games.',
        confidence: 90,
        priority: 'low',
        category: 'strength',
        severity: 'low'
      });
    } else if (avgGoalsPerGame >= 2.5 && avgGoalsPerGame < 3.5) {
      insights.push({
        id: 'strong-attack',
        type: 'tactical',
        title: 'Strong Attacking Output',
        description: `Averaging ${avgGoalsPerGame.toFixed(1)} goals per game shows you have a potent attack that creates consistent scoring opportunities.`,
        actionableAdvice: 'Your attack is working well. Focus on maintaining this while potentially improving your defensive stability.',
        confidence: 85,
        priority: 'low',
        category: 'strength',
        severity: 'low'
      });
    } else if (avgGoalsPerGame < 1.5) {
      insights.push({
        id: 'attacking-struggles',
        type: 'tactical',
        title: 'Attacking Efficiency Concerns',
        description: `Averaging only ${avgGoalsPerGame.toFixed(1)} goals per game indicates significant issues with your attacking play or finishing.`,
        actionableAdvice: 'Work on creating higher quality chances and clinical finishing. Consider skill games focused on attacking scenarios or adjusting to more attacking tactics.',
        confidence: 90,
        priority: 'high',
        category: 'weakness',
        severity: 'high'
      });
    }
  }

  // Defensive analysis
  if (totalGames >= 5) {
    if (avgConcededPerGame < 1.0) {
      insights.push({
        id: 'elite-defense',
        type: 'tactical',
        title: 'Elite Defensive Stability',
        description: `Conceding only ${avgConcededPerGame.toFixed(1)} goals per game demonstrates exceptional defensive organization and discipline.`,
        actionableAdvice: 'Your defensive setup is working perfectly. Focus on maintaining this stability while potentially looking for ways to convert this into more counter-attacking opportunities.',
        confidence: 95,
        priority: 'low',
        category: 'strength',
        severity: 'low'
      });
    } else if (avgConcededPerGame >= 1.0 && avgConcededPerGame < 2.0) {
      insights.push({
        id: 'solid-defense',
        type: 'tactical',
        title: 'Solid Defensive Foundation',
        description: `Conceding ${avgConcededPerGame.toFixed(1)} goals per game shows you have a reliable defensive structure.`,
        actionableAdvice: 'Your defense is working well. Continue with your current approach while looking for minor optimizations.',
        confidence: 85,
        priority: 'low',
        category: 'strength',
        severity: 'low'
      });
    } else if (avgConcededPerGame >= 3.0) {
      insights.push({
        id: 'defensive-concerns',
        type: 'tactical',
        title: 'Significant Defensive Vulnerabilities',
        description: `Conceding ${avgConcededPerGame.toFixed(1)} goals per game indicates major defensive issues that need immediate attention.`,
        actionableAdvice: 'Consider switching to a more defensive formation, reducing your depth, or practicing manual defending. Focus on not pulling defenders out of position.',
        confidence: 90,
        priority: 'high',
        category: 'weakness',
        severity: 'high'
      });
    }
  }

  // Goal difference analysis
  const goalDifference = totalGoals - totalConceded;
  const avgGoalDifferencePerGame = totalGames > 0 ? goalDifference / totalGames : 0;

  if (totalGames >= 10) {
    if (avgGoalDifferencePerGame >= 2.0) {
      insights.push({
        id: 'dominant-performances',
        type: 'performance',
        title: 'Dominant Performance Metrics',
        description: `Your average goal difference of +${avgGoalDifferencePerGame.toFixed(1)} per game shows you're consistently dominating opponents.`,
        actionableAdvice: 'You're performing at an elite level. Consider challenging yourself with higher-skilled opponents to continue improving.',
        confidence: 95,
        priority: 'low',
        category: 'strength',
        severity: 'low'
      });
    } else if (avgGoalDifferencePerGame <= -1.5) {
      insights.push({
        id: 'consistently-outmatched',
        type: 'performance',
        title: 'Consistently Outmatched',
        description: `Your average goal difference of ${avgGoalDifferencePerGame.toFixed(1)} per game indicates you're regularly being outplayed by opponents.`,
        actionableAdvice: 'Focus on fundamentals and consider playing against lower-skilled opponents temporarily to build confidence and practice core mechanics.',
        confidence: 90,
        priority: 'high',
        category: 'weakness',
        severity: 'high'
      });
    }
  }

  // Opponent skill analysis
  if (totalGames >= 10) {
    const avgOpponentSkill = allGames.reduce((sum, game) => sum + game.opponentSkill, 0) / totalGames;
    
    if (avgOpponentSkill >= 8.0) {
      insights.push({
        id: 'elite-competition',
        type: 'statistical',
        title: 'Competing Against the Elite',
        description: `You're consistently facing high-level opponents (${avgOpponentSkill.toFixed(1)}/10 average), which is excellent for skill development.`,
        actionableAdvice: 'Continue challenging yourself against strong opponents, but ensure you're learning from each match by reviewing key moments.',
        confidence: 90,
        priority: 'medium',
        category: 'opportunity',
        severity: 'medium'
      });
    } else if (avgOpponentSkill < 5.0) {
      insights.push({
        id: 'limited-challenge',
        type: 'statistical',
        title: 'Limited Competitive Challenge',
        description: `Your average opponent skill level (${avgOpponentSkill.toFixed(1)}/10) suggests you may not be facing sufficient challenges to improve rapidly.`,
        actionableAdvice: 'Consider seeking out stronger opponents to accelerate your skill development, even if it means losing more games initially.',
        confidence: 85,
        priority: 'medium',
        category: 'opportunity',
        severity: 'medium'
      });
    }
  }

  // Player performance analysis
  const allPlayerStats = allGames.flatMap(game => game.playerStats || []);
  
  if (allPlayerStats.length > 0) {
    const playerPerformanceMap = new Map();
    
    allPlayerStats.forEach(player => {
      if (!playerPerformanceMap.has(player.name)) {
        playerPerformanceMap.set(player.name, {
          name: player.name,
          position: player.position,
          appearances: 0,
          totalRating: 0,
          goals: 0,
          assists: 0,
          minutesPlayed: 0
        });
      }
      
      const stats = playerPerformanceMap.get(player.name);
      stats.appearances += 1;
      stats.totalRating += player.rating;
      stats.goals += player.goals;
      stats.assists += player.assists;
      stats.minutesPlayed += player.minutesPlayed;
    });
    
    const playerPerformances = Array.from(playerPerformanceMap.values())
      .map(player => ({
        ...player,
        averageRating: player.totalRating / player.appearances,
        goalsPerGame: player.goals / player.appearances,
        assistsPerGame: player.assists / player.appearances,
        minutesPerGame: player.minutesPlayed / player.appearances,
        goalContributions: player.goals + player.assists,
        goalContributionsPerGame: (player.goals + player.assists) / player.appearances
      }))
      .filter(player => player.appearances >= 5);
    
    // Find standout performers
    const topRatedPlayers = [...playerPerformances]
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 3);
    
    const topScorers = [...playerPerformances]
      .sort((a, b) => b.goalsPerGame - a.goalsPerGame)
      .slice(0, 3);
    
    const topCreators = [...playerPerformances]
      .sort((a, b) => b.assistsPerGame - a.assistsPerGame)
      .slice(0, 3);
    
    // Find underperforming players
    const underperformingPlayers = playerPerformances
      .filter(player => player.appearances >= 10 && player.averageRating < 6.5)
      .sort((a, b) => a.averageRating - b.averageRating)
      .slice(0, 3);
    
    if (topRatedPlayers.length > 0) {
      insights.push({
        id: 'standout-performers',
        type: 'technical',
        title: 'Standout Performers Identified',
        description: `${topRatedPlayers[0].name} (${topRatedPlayers[0].position}) is your highest-rated player with an average rating of ${topRatedPlayers[0].averageRating.toFixed(1)}.`,
        actionableAdvice: 'Build your tactics around these top performers and ensure they're in positions to maximize their impact.',
        confidence: 90,
        priority: 'medium',
        category: 'strength',
        severity: 'low',
        dataPoints: topRatedPlayers.map(p => `${p.name} (${p.position}): ${p.averageRating.toFixed(1)} rating`)
      });
    }
    
    if (topScorers.length > 0 && topScorers[0].goalsPerGame >= 1.0) {
      insights.push({
        id: 'clinical-finisher',
        type: 'technical',
        title: 'Elite Goal Scoring Talent',
        description: `${topScorers[0].name} (${topScorers[0].position}) is averaging an exceptional ${topScorers[0].goalsPerGame.toFixed(1)} goals per game.`,
        actionableAdvice: 'Ensure this player gets into scoring positions frequently and receives quality service.',
        confidence: 90,
        priority: 'medium',
        category: 'strength',
        severity: 'low',
        dataPoints: topScorers.map(p => `${p.name} (${p.position}): ${p.goalsPerGame.toFixed(1)} goals per game`)
      });
    }
    
    if (underperformingPlayers.length > 0) {
      insights.push({
        id: 'underperforming-players',
        type: 'technical',
        title: 'Players Requiring Attention',
        description: `${underperformingPlayers[0].name} (${underperformingPlayers[0].position}) is consistently underperforming with an average rating of only ${underperformingPlayers[0].averageRating.toFixed(1)}.`,
        actionableAdvice: 'Consider replacing these players or adjusting your tactics to better suit their strengths.',
        confidence: 85,
        priority: 'high',
        category: 'weakness',
        severity: 'medium',
        dataPoints: underperformingPlayers.map(p => `${p.name} (${p.position}): ${p.averageRating.toFixed(1)} rating`)
      });
    }
  }

  // Game context analysis
  const gameContexts = allGames.reduce((acc, game) => {
    acc[game.gameContext] = (acc[game.gameContext] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const totalRageQuits = gameContexts['rage_quit'] || 0;
  const rageQuitPercentage = totalGames > 0 ? (totalRageQuits / totalGames) * 100 : 0;
  
  if (rageQuitPercentage >= 20 && totalGames >= 10) {
    insights.push({
      id: 'rage-quit-inducer',
      type: 'mental',
      title: 'Frustration Generator',
      description: `${rageQuitPercentage.toFixed(1)}% of your games end in rage quits from opponents, suggesting your play style may be particularly frustrating to face.`,
      actionableAdvice: 'Your ability to frustrate opponents is a strength. Continue with tactics that maintain possession and control the game tempo.',
      confidence: 85,
      priority: 'low',
      category: 'strength',
      severity: 'low'
    });
  }

  // Penalty shootout analysis
  const penaltyGames = allGames.filter(game => game.gameContext === 'penalties');
  const penaltyWins = penaltyGames.filter(game => game.result === 'win').length;
  const penaltyLosses = penaltyGames.filter(game => game.result === 'loss').length;
  
  if (penaltyGames.length >= 5) {
    const penaltyWinRate = (penaltyWins / penaltyGames.length) * 100;
    
    if (penaltyWinRate >= 70) {
      insights.push({
        id: 'penalty-specialist',
        type: 'technical',
        title: 'Penalty Shootout Specialist',
        description: `You excel in penalty shootouts with a ${penaltyWinRate.toFixed(1)}% win rate (${penaltyWins}W-${penaltyLosses}L).`,
        actionableAdvice: 'Your penalty technique is excellent. In close games, don't be afraid to play conservatively and take your chances in a shootout.',
        confidence: 90,
        priority: 'medium',
        category: 'strength',
        severity: 'low'
      });
    } else if (penaltyWinRate <= 30) {
      insights.push({
        id: 'penalty-weakness',
        type: 'technical',
        title: 'Penalty Shootout Struggles',
        description: `You're struggling in penalty shootouts with only a ${penaltyWinRate.toFixed(1)}% win rate (${penaltyWins}W-${penaltyLosses}L).`,
        actionableAdvice: 'Practice penalty techniques and develop a consistent strategy. In close games, push for a winner in regular time to avoid shootouts.',
        confidence: 90,
        priority: 'high',
        category: 'weakness',
        severity: 'medium'
      });
    }
  }

  // Time of day analysis
  const gamesWithTime = allGames.filter(game => game.time);
  
  if (gamesWithTime.length >= 10) {
    const morningGames = gamesWithTime.filter(game => {
      const hour = parseInt(game.time!.split(':')[0]);
      return hour >= 6 && hour < 12;
    });
    
    const afternoonGames = gamesWithTime.filter(game => {
      const hour = parseInt(game.time!.split(':')[0]);
      return hour >= 12 && hour < 18;
    });
    
    const eveningGames = gamesWithTime.filter(game => {
      const hour = parseInt(game.time!.split(':')[0]);
      return hour >= 18 && hour < 24;
    });
    
    const nightGames = gamesWithTime.filter(game => {
      const hour = parseInt(game.time!.split(':')[0]);
      return hour >= 0 && hour < 6;
    });
    
    const morningWinRate = morningGames.length > 0 ? 
      (morningGames.filter(g => g.result === 'win').length / morningGames.length) * 100 : 0;
    
    const afternoonWinRate = afternoonGames.length > 0 ? 
      (afternoonGames.filter(g => g.result === 'win').length / afternoonGames.length) * 100 : 0;
    
    const eveningWinRate = eveningGames.length > 0 ? 
      (eveningGames.filter(g => g.result === 'win').length / eveningGames.length) * 100 : 0;
    
    const nightWinRate = nightGames.length > 0 ? 
      (nightGames.filter(g => g.result === 'win').length / nightGames.length) * 100 : 0;
    
    const timePerformances = [
      { time: 'Morning', winRate: morningWinRate, games: morningGames.length },
      { time: 'Afternoon', winRate: afternoonWinRate, games: afternoonGames.length },
      { time: 'Evening', winRate: eveningWinRate, games: eveningGames.length },
      { time: 'Night', winRate: nightWinRate, games: nightGames.length }
    ].filter(t => t.games >= 3);
    
    timePerformances.sort((a, b) => b.winRate - a.winRate);
    
    if (timePerformances.length >= 2) {
      const bestTime = timePerformances[0];
      const worstTime = timePerformances[timePerformances.length - 1];
      
      if (bestTime.winRate - worstTime.winRate >= 20) {
        insights.push({
          id: 'optimal-play-time',
          type: 'statistical',
          title: 'Optimal Playing Hours Identified',
          description: `You perform significantly better during ${bestTime.time} hours (${bestTime.winRate.toFixed(1)}% win rate) compared to ${worstTime.time} hours (${worstTime.winRate.toFixed(1)}% win rate).`,
          actionableAdvice: `Schedule your most important games during ${bestTime.time} hours when possible to maximize your chances of success.`,
          confidence: 85,
          priority: 'medium',
          category: 'opportunity',
          severity: 'medium',
          dataPoints: timePerformances.map(t => `${t.time}: ${t.winRate.toFixed(1)}% win rate (${t.games} games)`)
        });
      }
    }
  }

  // Server quality analysis
  const gamesWithServerQuality = allGames.filter(game => game.serverQuality !== undefined);
  
  if (gamesWithServerQuality.length >= 10) {
    const goodServerGames = gamesWithServerQuality.filter(game => game.serverQuality! >= 7);
    const badServerGames = gamesWithServerQuality.filter(game => game.serverQuality! <= 4);
    
    const goodServerWinRate = goodServerGames.length > 0 ? 
      (goodServerGames.filter(g => g.result === 'win').length / goodServerGames.length) * 100 : 0;
    
    const badServerWinRate = badServerGames.length > 0 ? 
      (badServerGames.filter(g => g.result === 'win').length / badServerGames.length) * 100 : 0;
    
    if (goodServerWinRate - badServerWinRate >= 20 && badServerGames.length >= 5) {
      insights.push({
        id: 'server-quality-impact',
        type: 'statistical',
        title: 'Server Quality Significantly Impacts Performance',
        description: `Your win rate drops by ${(goodServerWinRate - badServerWinRate).toFixed(1)}% when playing on poor quality servers.`,
        actionableAdvice: 'Consider playing during off-peak hours or using a wired connection to improve server quality. If you notice poor server quality at the start of a match, adjust to a more conservative play style.',
        confidence: 90,
        priority: 'high',
        category: 'weakness',
        severity: 'medium',
        dataPoints: [
          `Good server win rate: ${goodServerWinRate.toFixed(1)}% (${goodServerGames.length} games)`,
          `Poor server win rate: ${badServerWinRate.toFixed(1)}% (${badServerGames.length} games)`,
          `Impact: ${(goodServerWinRate - badServerWinRate).toFixed(1)}% difference`
        ]
      });
    }
  }

  // Stress level analysis
  const gamesWithStressLevel = allGames.filter(game => game.stressLevel !== undefined);
  
  if (gamesWithStressLevel.length >= 10) {
    const lowStressGames = gamesWithStressLevel.filter(game => game.stressLevel! <= 3);
    const highStressGames = gamesWithStressLevel.filter(game => game.stressLevel! >= 7);
    
    const lowStressWinRate = lowStressGames.length > 0 ? 
      (lowStressGames.filter(g => g.result === 'win').length / lowStressGames.length) * 100 : 0;
    
    const highStressWinRate = highStressGames.length > 0 ? 
      (highStressGames.filter(g => g.result === 'win').length / highStressGames.length) * 100 : 0;
    
    if (lowStressWinRate - highStressWinRate >= 20 && highStressGames.length >= 5) {
      insights.push({
        id: 'stress-management',
        type: 'mental',
        title: 'Stress Management Opportunity',
        description: `Your performance drops significantly under high stress, with a ${(lowStressWinRate - highStressWinRate).toFixed(1)}% lower win rate in high-stress games.`,
        actionableAdvice: 'Develop a pre-game routine to manage stress. Take short breaks between games, especially after losses. Practice mindfulness or deep breathing during intense moments.',
        confidence: 90,
        priority: 'high',
        category: 'weakness',
        severity: 'high',
        dataPoints: [
          `Low stress win rate: ${lowStressWinRate.toFixed(1)}% (${lowStressGames.length} games)`,
          `High stress win rate: ${highStressWinRate.toFixed(1)}% (${highStressGames.length} games)`,
          `Impact: ${(lowStressWinRate - highStressWinRate).toFixed(1)}% difference`
        ]
      });
    }
  }

  // Game duration analysis
  if (allGames.length >= 10) {
    const shortGames = allGames.filter(game => game.duration <= 12);
    const longGames = allGames.filter(game => game.duration >= 16);
    
    const shortGamesWinRate = shortGames.length > 0 ? 
      (shortGames.filter(g => g.result === 'win').length / shortGames.length) * 100 : 0;
    
    const longGamesWinRate = longGames.length > 0 ? 
      (longGames.filter(g => g.result === 'win').length / longGames.length) * 100 : 0;
    
    if (Math.abs(shortGamesWinRate - longGamesWinRate) >= 20 && shortGames.length >= 5 && longGames.length >= 5) {
      const betterDuration = shortGamesWinRate > longGamesWinRate ? 'shorter' : 'longer';
      const betterWinRate = Math.max(shortGamesWinRate, longGamesWinRate);
      const worseWinRate = Math.min(shortGamesWinRate, longGamesWinRate);
      
      insights.push({
        id: 'game-duration-impact',
        type: 'statistical',
        title: 'Game Duration Performance Pattern',
        description: `You perform significantly better in ${betterDuration} games with a ${betterWinRate.toFixed(1)}% win rate compared to ${worseWinRate.toFixed(1)}% in ${betterDuration === 'shorter' ? 'longer' : 'shorter'} games.`,
        actionableAdvice: betterDuration === 'shorter' ? 
          'Your quick, decisive play style works well. Focus on fast build-up and direct attacking to keep games shorter.' : 
          'You excel in longer, more methodical games. Focus on possession and game management rather than rushing attacks.',
        confidence: 85,
        priority: 'medium',
        category: 'opportunity',
        severity: 'medium',
        dataPoints: [
          `Short games win rate: ${shortGamesWinRate.toFixed(1)}% (${shortGames.length} games)`,
          `Long games win rate: ${longGamesWinRate.toFixed(1)}% (${longGames.length} games)`,
          `Difference: ${Math.abs(shortGamesWinRate - longGamesWinRate).toFixed(1)}%`
        ]
      });
    }
  }

  // Possession analysis
  const gamesWithPossession = allGames.filter(game => game.teamStats && game.teamStats.possession !== undefined);
  
  if (gamesWithPossession.length >= 10) {
    const highPossessionGames = gamesWithPossession.filter(game => game.teamStats.possession >= 60);
    const lowPossessionGames = gamesWithPossession.filter(game => game.teamStats.possession <= 40);
    
    const highPossessionWinRate = highPossessionGames.length > 0 ? 
      (highPossessionGames.filter(g => g.result === 'win').length / highPossessionGames.length) * 100 : 0;
    
    const lowPossessionWinRate = lowPossessionGames.length > 0 ? 
      (lowPossessionGames.filter(g => g.result === 'win').length / lowPossessionGames.length) * 100 : 0;
    
    if (Math.abs(highPossessionWinRate - lowPossessionWinRate) >= 20 && highPossessionGames.length >= 5 && lowPossessionGames.length >= 5) {
      const betterStyle = highPossessionWinRate > lowPossessionWinRate ? 'possession-based' : 'counter-attacking';
      const betterWinRate = Math.max(highPossessionWinRate, lowPossessionWinRate);
      const worseWinRate = Math.min(highPossessionWinRate, lowPossessionWinRate);
      
      insights.push({
        id: 'play-style-effectiveness',
        type: 'tactical',
        title: 'Optimal Play Style Identified',
        description: `You perform significantly better with a ${betterStyle} approach (${betterWinRate.toFixed(1)}% win rate vs ${worseWinRate.toFixed(1)}%).`,
        actionableAdvice: betterStyle === 'possession-based' ? 
          'Focus on formations and tactics that maximize possession. Practice patient build-up play and breaking down defensive blocks.' : 
          'Embrace counter-attacking football with quick transitions. Set up with a solid defensive base and focus on fast breaks.',
        confidence: 90,
        priority: 'high',
        category: 'opportunity',
        severity: 'medium',
        dataPoints: [
          `High possession win rate: ${highPossessionWinRate.toFixed(1)}% (${highPossessionGames.length} games)`,
          `Low possession win rate: ${lowPossessionWinRate.toFixed(1)}% (${lowPossessionGames.length} games)`,
          `Difference: ${Math.abs(highPossessionWinRate - lowPossessionWinRate).toFixed(1)}%`
        ]
      });
    }
  }

  // Expected goals analysis
  const gamesWithXG = allGames.filter(game => 
    game.teamStats && 
    game.teamStats.expectedGoals !== undefined && 
    game.teamStats.expectedGoalsAgainst !== undefined
  );
  
  if (gamesWithXG.length >= 10) {
    const totalXG = gamesWithXG.reduce((sum, game) => sum + game.teamStats.expectedGoals, 0);
    const totalActualGoals = gamesWithXG.reduce((sum, game) => {
      const [goals] = game.scoreLine.split('-').map(Number);
      return sum + goals;
    }, 0);
    
    const totalXGA = gamesWithXG.reduce((sum, game) => sum + game.teamStats.expectedGoalsAgainst, 0);
    const totalActualConceded = gamesWithXG.reduce((sum, game) => {
      const [, conceded] = game.scoreLine.split('-').map(Number);
      return sum + conceded;
    }, 0);
    
    const xgPerformance = ((totalActualGoals - totalXG) / totalXG) * 100;
    const xgaPerformance = ((totalActualConceded - totalXGA) / totalXGA) * 100;
    
    if (xgPerformance >= 20) {
      insights.push({
        id: 'clinical-finishing',
        type: 'technical',
        title: 'Elite Finishing Efficiency',
        description: `You're outperforming your xG by ${xgPerformance.toFixed(1)}%, demonstrating exceptional finishing ability.`,
        actionableAdvice: 'Your finishing is excellent. Continue to focus on getting into high-quality scoring positions.',
        confidence: 90,
        priority: 'low',
        category: 'strength',
        severity: 'low',
        dataPoints: [
          `Expected goals: ${totalXG.toFixed(1)}`,
          `Actual goals: ${totalActualGoals}`,
          `Overperformance: ${xgPerformance.toFixed(1)}%`
        ]
      });
    } else if (xgPerformance <= -20) {
      insights.push({
        id: 'finishing-issues',
        type: 'technical',
        title: 'Finishing Efficiency Concerns',
        description: `You're underperforming your xG by ${Math.abs(xgPerformance).toFixed(1)}%, indicating issues with finishing quality.`,
        actionableAdvice: 'Practice finishing in skill games and focus on shot selection. Consider using players with better shooting stats or adjusting shooting techniques.',
        confidence: 90,
        priority: 'high',
        category: 'weakness',
        severity: 'high',
        dataPoints: [
          `Expected goals: ${totalXG.toFixed(1)}`,
          `Actual goals: ${totalActualGoals}`,
          `Underperformance: ${Math.abs(xgPerformance).toFixed(1)}%`
        ]
      });
    }
    
    if (xgaPerformance <= -20) {
      insights.push({
        id: 'exceptional-goalkeeping',
        type: 'technical',
        title: 'Exceptional Defensive Performance',
        description: `You're conceding ${Math.abs(xgaPerformance).toFixed(1)}% fewer goals than expected, showing excellent goalkeeping and last-ditch defending.`,
        actionableAdvice: 'Your defensive unit and goalkeeper are performing exceptionally. Maintain this defensive setup.',
        confidence: 90,
        priority: 'low',
        category: 'strength',
        severity: 'low',
        dataPoints: [
          `Expected goals against: ${totalXGA.toFixed(1)}`,
          `Actual goals conceded: ${totalActualConceded}`,
          `Overperformance: ${Math.abs(xgaPerformance).toFixed(1)}%`
        ]
      });
    } else if (xgaPerformance >= 20) {
      insights.push({
        id: 'goalkeeping-concerns',
        type: 'technical',
        title: 'Goalkeeping Performance Issues',
        description: `You're conceding ${xgaPerformance.toFixed(1)}% more goals than expected, indicating potential issues with goalkeeping or defensive errors.`,
        actionableAdvice: 'Consider upgrading your goalkeeper or adjusting defensive tactics to provide better protection. Focus on not conceding high-quality chances.',
        confidence: 90,
        priority: 'high',
        category: 'weakness',
        severity: 'high',
        dataPoints: [
          `Expected goals against: ${totalXGA.toFixed(1)}`,
          `Actual goals conceded: ${totalActualConceded}`,
          `Underperformance: ${xgaPerformance.toFixed(1)}%`
        ]
      });
    }
  }

  // Cross-platform analysis
  const crossPlayGames = allGames.filter(game => game.crossPlayEnabled === true);
  const nonCrossPlayGames = allGames.filter(game => game.crossPlayEnabled === false);
  
  if (crossPlayGames.length >= 5 && nonCrossPlayGames.length >= 5) {
    const crossPlayWinRate = (crossPlayGames.filter(g => g.result === 'win').length / crossPlayGames.length) * 100;
    const nonCrossPlayWinRate = (nonCrossPlayGames.filter(g => g.result === 'win').length / nonCrossPlayGames.length) * 100;
    
    if (Math.abs(crossPlayWinRate - nonCrossPlayWinRate) >= 15) {
      const betterMode = crossPlayWinRate > nonCrossPlayWinRate ? 'cross-platform' : 'same-platform';
      const betterWinRate = Math.max(crossPlayWinRate, nonCrossPlayWinRate);
      const worseWinRate = Math.min(crossPlayWinRate, nonCrossPlayWinRate);
      
      insights.push({
        id: 'cross-platform-impact',
        type: 'statistical',
        title: 'Cross-Platform Performance Difference',
        description: `You perform ${Math.abs(crossPlayWinRate - nonCrossPlayWinRate).toFixed(1)}% better in ${betterMode} matches.`,
        actionableAdvice: `When possible, prioritize ${betterMode} matchmaking to maximize your win rate.`,
        confidence: 85,
        priority: 'medium',
        category: 'opportunity',
        severity: 'medium',
        dataPoints: [
          `Cross-platform win rate: ${crossPlayWinRate.toFixed(1)}% (${crossPlayGames.length} games)`,
          `Same-platform win rate: ${nonCrossPlayWinRate.toFixed(1)}% (${nonCrossPlayGames.length} games)`,
          `Difference: ${Math.abs(crossPlayWinRate - nonCrossPlayWinRate).toFixed(1)}%`
        ]
      });
    }
  }

  // Generate additional insights based on current week if available
  if (currentWeek && currentWeek.games.length > 0) {
    const currentWeekWinRate = (currentWeek.totalWins / currentWeek.games.length) * 100;
    const overallWinRate = totalGames > 0 ? (totalWins / totalGames) * 100 : 0;
    const winRateDifference = currentWeekWinRate - overallWinRate;
    
    if (Math.abs(winRateDifference) >= 15 && currentWeek.games.length >= 5) {
      insights.push({
        id: 'current-week-form',
        type: 'performance',
        title: winRateDifference > 0 ? 'Current Week Breakthrough' : 'Current Week Struggles',
        description: winRateDifference > 0 ?
          `You're performing ${winRateDifference.toFixed(1)}% above your usual win rate this week.` :
          `You're performing ${Math.abs(winRateDifference).toFixed(1)}% below your usual win rate this week.`,
        actionableAdvice: winRateDifference > 0 ?
          'Analyze what's working well this week and continue with your current approach.' :
          'Take a short break or return to tactics that have worked well for you in the past.',
        confidence: 85,
        priority: winRateDifference > 0 ? 'low' : 'high',
        category: winRateDifference > 0 ? 'strength' : 'weakness',
        severity: winRateDifference > 0 ? 'low' : 'high'
      });
    }
  }

  // Add more insights based on specific patterns
  
  // Comeback analysis
  const comebackGames = allGames.filter(game => {
    if (game.result !== 'win') return false;
    
    // Check if there are comments mentioning comeback
    if (game.comments && game.comments.toLowerCase().includes('comeback')) return true;
    
    // Check score line for potential comebacks
    const [goalsFor, goalsAgainst] = game.scoreLine.split('-').map(Number);
    return goalsFor > goalsAgainst && goalsAgainst >= 2;
  });
  
  if (comebackGames.length >= 3) {
    insights.push({
      id: 'comeback-specialist',
      type: 'mental',
      title: 'Comeback Specialist',
      description: `You've demonstrated exceptional mental strength by completing ${comebackGames.length} comebacks.`,
      actionableAdvice: 'Your resilience is a major asset. Don't get discouraged when conceding first, as you've proven you can turn games around.',
      confidence: 85,
      priority: 'medium',
      category: 'strength',
      severity: 'low'
    });
  }

  // Randomize the order slightly to prevent constant reshuffling
  // but maintain priority ordering
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  
  return insights
    .sort((a, b) => {
      // First sort by priority
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by confidence
      return b.confidence - a.confidence;
    })
    .slice(0, 12); // Limit to prevent overwhelming the user
}