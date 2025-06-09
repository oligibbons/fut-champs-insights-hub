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
      description: `${recentWinRate.toFixed(0)}% win rate in last ${recentGames.length} games shows you're in peak form.`,
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
      description: `Only ${recentWinRate.toFixed(0)}% wins in last ${recentGames.length} games suggests a temporary dip in form.`,
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

  // Extra time performance
  if (contextGames.extra_time >= 3) {
    const extraTimeGames = allGames.filter(game => game.gameContext === 'extra_time');
    const extraTimeWins = extraTimeGames.filter(game => game.result === 'win').length;
    const extraTimeWinRate = (extraTimeWins / extraTimeGames.length) * 100;
    
    if (extraTimeWinRate >= 65) {
      insights.push({
        id: 'extra-time-specialist',
        type: 'physical',
        title: 'Extra Time Specialist',
        description: `${extraTimeWinRate.toFixed(0)}% win rate in extra time shows excellent stamina and mental resilience.`,
        actionableAdvice: 'Your endurance is a major asset. Continue to use this advantage in extended games.',
        severity: 'low',
        confidence: 85,
        category: 'strength',
        priority: 'low',
        dataPoints: [`${extraTimeWins}/${extraTimeGames.length} extra time wins`, 'Superior endurance']
      });
    } else if (extraTimeWinRate <= 35) {
      insights.push({
        id: 'extra-time-struggles',
        type: 'physical',
        title: 'Extra Time Stamina Concerns',
        description: `${extraTimeWinRate.toFixed(0)}% win rate in extra time suggests stamina or concentration issues.`,
        actionableAdvice: 'Make strategic substitutions before extra time and consider player stamina attributes.',
        severity: 'medium',
        confidence: 85,
        category: 'weakness',
        priority: 'medium',
        dataPoints: [`${extraTimeWins}/${extraTimeGames.length} extra time wins`, 'Endurance concerns']
      });
    }
  }

  // Rage quit analysis
  if (contextGames.rage_quit >= 3) {
    const rageQuitGames = allGames.filter(game => game.gameContext === 'rage_quit');
    insights.push({
      id: 'frustrating-playstyle',
      type: 'tactical',
      title: 'Frustration-Inducing Playstyle',
      description: `You've caused ${rageQuitGames.length} rage quits, suggesting your style is particularly effective or frustrating.`,
      actionableAdvice: 'Your ability to demoralize opponents is valuable. Continue applying early pressure to force mistakes.',
      severity: 'low',
      confidence: 80,
      category: 'strength',
      priority: 'low',
      dataPoints: [`${rageQuitGames.length} rage quits caused`, 'Psychological advantage']
    });
  }

  // Disconnection analysis
  if (contextGames.disconnect >= 3) {
    insights.push({
      id: 'connection-issues',
      type: 'technical',
      title: 'Connection Stability Concerns',
      description: `${contextGames.disconnect} games with disconnections suggests potential network issues.`,
      actionableAdvice: 'Consider using a wired connection and playing during off-peak hours for better stability.',
      severity: 'medium',
      confidence: 75,
      category: 'threat',
      priority: 'medium',
      dataPoints: [`${contextGames.disconnect} disconnections`, 'Technical issues']
    });
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
      winGames: number;
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
          totalRating: 0,
          winGames: 0
        });
      }
      
      const stats = playerPerformance.get(key)!;
      stats.games += 1;
      stats.goals += player.goals;
      stats.assists += player.assists;
      stats.totalRating += player.rating;
      
      // Find the game this player performance belongs to
      const game = allGames.find(g => g.playerStats?.some(p => p.id === player.id));
      if (game && game.result === 'win') {
        stats.winGames += 1;
      }
    });
    
    // Find standout performers
    const standoutPlayers = Array.from(playerPerformance.values())
      .filter(p => p.games >= 5)
      .map(p => ({
        ...p,
        avgRating: p.totalRating / p.games,
        goalsPerGame: p.goals / p.games,
        assistsPerGame: p.assists / p.games,
        goalContributions: p.goals + p.assists,
        winRate: (p.winGames / p.games) * 100
      }))
      .sort((a, b) => b.avgRating - a.avgRating);
    
    if (standoutPlayers.length > 0) {
      const topPlayer = standoutPlayers[0];
      if (topPlayer.avgRating >= 8.0) {
        insights.push({
          id: 'star-player',
          type: 'performance',
          title: 'Exceptional Star Player',
          description: `${topPlayer.name} (${topPlayer.position}) is performing at an elite level with a ${topPlayer.avgRating.toFixed(1)} average rating.`,
          actionableAdvice: 'Build your tactics around this player and ensure they get plenty of involvement.',
          severity: 'low',
          confidence: 90,
          category: 'strength',
          priority: 'low',
          dataPoints: [`${topPlayer.avgRating.toFixed(1)} avg rating`, `${topPlayer.games} games played`]
        });
      }
      
      // Find top goal scorer
      const topScorer = [...standoutPlayers].sort((a, b) => b.goals - a.goals)[0];
      if (topScorer.goals >= 10) {
        insights.push({
          id: 'clinical-finisher',
          type: 'performance',
          title: 'Elite Goal Scorer',
          description: `${topScorer.name} (${topScorer.position}) has scored ${topScorer.goals} goals in ${topScorer.games} games (${topScorer.goalsPerGame.toFixed(2)}/game).`,
          actionableAdvice: 'Ensure this player gets into scoring positions frequently and receives quality service.',
          severity: 'low',
          confidence: 90,
          category: 'strength',
          priority: 'low',
          dataPoints: [`${topScorer.goals} goals`, `${topScorer.goalsPerGame.toFixed(2)} goals per game`]
        });
      }
      
      // Find top assister
      const topAssister = [...standoutPlayers].sort((a, b) => b.assists - a.assists)[0];
      if (topAssister.assists >= 8) {
        insights.push({
          id: 'playmaker',
          type: 'performance',
          title: 'Creative Playmaker',
          description: `${topAssister.name} (${topAssister.position}) has provided ${topAssister.assists} assists in ${topAssister.games} games.`,
          actionableAdvice: 'Maximize this player\'s creative influence by ensuring they have passing options ahead of them.',
          severity: 'low',
          confidence: 90,
          category: 'strength',
          priority: 'low',
          dataPoints: [`${topAssister.assists} assists`, `${topAssister.assistsPerGame.toFixed(2)} assists per game`]
        });
      }
      
      // Find player with highest win rate
      const winRatePlayer = [...standoutPlayers]
        .filter(p => p.games >= 8)
        .sort((a, b) => b.winRate - a.winRate)[0];
      
      if (winRatePlayer && winRatePlayer.winRate >= 75) {
        insights.push({
          id: 'lucky-charm',
          type: 'statistical',
          title: 'Team Catalyst',
          description: `${winRatePlayer.name} has an incredible ${winRatePlayer.winRate.toFixed(0)}% win rate when in your team.`,
          actionableAdvice: 'This player significantly improves your chances of winning. Make them a fixture in your lineup.',
          severity: 'low',
          confidence: 85,
          category: 'strength',
          priority: 'medium',
          dataPoints: [`${winRatePlayer.winRate.toFixed(0)}% win rate`, `${winRatePlayer.games} games played`]
        });
      }
      
      // Find underperforming players
      const underperformers = standoutPlayers
        .filter(p => p.games >= 8 && p.avgRating < 6.5)
        .sort((a, b) => a.avgRating - b.avgRating);
      
      if (underperformers.length > 0) {
        const worstPlayer = underperformers[0];
        insights.push({
          id: 'underperforming-player',
          type: 'performance',
          title: 'Player Replacement Needed',
          description: `${worstPlayer.name} (${worstPlayer.position}) is underperforming with only a ${worstPlayer.avgRating.toFixed(1)} average rating over ${worstPlayer.games} games.`,
          actionableAdvice: 'Consider replacing this player or adjusting tactics to better suit their strengths.',
          severity: 'medium',
          confidence: 85,
          category: 'weakness',
          priority: 'medium',
          dataPoints: [`${worstPlayer.avgRating.toFixed(1)} avg rating`, `${worstPlayer.games} games played`]
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
        type: 'tactical',
        title: `${strongestPosition.position} Position Excellence`,
        description: `Your ${strongestPosition.position} position is performing exceptionally with a ${strongestPosition.avgRating.toFixed(1)} average rating.`,
        actionableAdvice: 'Build your tactics to maximize the influence of this position on your gameplay.',
        severity: 'low',
        confidence: 85,
        category: 'strength',
        priority: 'low',
        dataPoints: [`${strongestPosition.avgRating.toFixed(1)} avg rating`, `${strongestPosition.games} games`]
      });
    }
    
    if (weakestPosition && weakestPosition.avgRating <= 6.5 && Math.abs(strongestPosition.avgRating - weakestPosition.avgRating) >= 0.8) {
      insights.push({
        id: 'weak-position',
        type: 'tactical',
        title: `${weakestPosition.position} Position Concerns`,
        description: `Your ${weakestPosition.position} position is underperforming with only a ${weakestPosition.avgRating.toFixed(1)} average rating.`,
        actionableAdvice: 'Consider player upgrades or tactical adjustments to better support this position.',
        severity: 'medium',
        confidence: 85,
        category: 'weakness',
        priority: 'medium',
        dataPoints: [`${weakestPosition.avgRating.toFixed(1)} avg rating`, `${weakestPosition.games} games`]
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
          type: 'tactical',
          title: 'Prolific Attacking Unit',
          description: `Your attacking players are averaging ${avgAttackingGoals.toFixed(1)} goals per game, showing excellent offensive efficiency.`,
          actionableAdvice: 'Continue to focus on getting the ball to your attackers in dangerous positions.',
          severity: 'low',
          confidence: 85,
          category: 'strength',
          priority: 'low',
          dataPoints: [`${avgAttackingGoals.toFixed(1)} goals per game`, 'Efficient attack']
        });
      } else if (avgAttackingGoals <= 0.3 && attackingPositions.length >= 2) {
        insights.push({
          id: 'attacking-struggles',
          type: 'tactical',
          title: 'Attacking Unit Concerns',
          description: `Your attacking players are only averaging ${avgAttackingGoals.toFixed(1)} goals per game, suggesting offensive issues.`,
          actionableAdvice: 'Work on creating better chances for your forwards and consider tactical or personnel changes.',
          severity: 'medium',
          confidence: 85,
          category: 'weakness',
          priority: 'medium',
          dataPoints: [`${avgAttackingGoals.toFixed(1)} goals per game`, 'Attacking inefficiency']
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
          type: 'tactical',
          title: 'Creative Midfield',
          description: `Your midfielders are providing ${avgMidfieldAssists.toFixed(1)} assists per game, showing excellent creativity and vision.`,
          actionableAdvice: 'Your midfield creativity is a major asset. Ensure your forwards make good runs to capitalize on this.',
          severity: 'low',
          confidence: 85,
          category: 'strength',
          priority: 'low',
          dataPoints: [`${avgMidfieldAssists.toFixed(1)} assists per game`, 'Creative engine']
        });
      } else if (avgMidfieldAssists <= 0.2 && midfieldPositions.length >= 2) {
        insights.push({
          id: 'midfield-creativity-lacking',
          type: 'tactical',
          title: 'Midfield Creativity Concerns',
          description: `Your midfielders are only providing ${avgMidfieldAssists.toFixed(1)} assists per game, suggesting limited creative output.`,
          actionableAdvice: 'Consider midfielders with better passing stats or adjust tactics to give them more creative freedom.',
          severity: 'medium',
          confidence: 80,
          category: 'weakness',
          priority: 'medium',
          dataPoints: [`${avgMidfieldAssists.toFixed(1)} assists per game`, 'Limited creativity']
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
          type: 'tactical',
          title: 'Solid Defensive Unit',
          description: `Your defenders are averaging a ${avgDefensiveRating.toFixed(1)} rating, providing a strong foundation for success.`,
          actionableAdvice: 'Your defensive solidity allows you to commit more resources to attack when needed.',
          severity: 'low',
          confidence: 85,
          category: 'strength',
          priority: 'low',
          dataPoints: [`${avgDefensiveRating.toFixed(1)} avg rating`, 'Defensive stability']
        });
      } else if (avgDefensiveRating <= 6.5 && defensivePositions.length >= 2) {
        insights.push({
          id: 'defensive-unit-concerns',
          type: 'tactical',
          title: 'Defensive Unit Improvement Needed',
          description: `Your defenders are only averaging a ${avgDefensiveRating.toFixed(1)} rating, suggesting defensive vulnerabilities.`,
          actionableAdvice: 'Invest in better defenders or adjust your defensive tactics to provide more protection.',
          severity: 'medium',
          confidence: 85,
          category: 'weakness',
          priority: 'medium',
          dataPoints: [`${avgDefensiveRating.toFixed(1)} avg rating`, 'Defensive weakness']
        });
      }
    }
  }

  // Possession analysis
  const possessionGames = allGames.filter(game => game.teamStats.possession !== undefined);
  if (possessionGames.length >= 5) {
    const avgPossession = possessionGames.reduce((sum, game) => sum + game.teamStats.possession, 0) / possessionGames.length;
    
    if (avgPossession >= 60) {
      insights.push({
        id: 'possession-dominant',
        type: 'tactical',
        title: 'Possession Dominance',
        description: `Averaging ${avgPossession.toFixed(0)}% possession shows excellent ball control and passing.`,
        actionableAdvice: 'Your possession game is strong. Focus on turning this control into dangerous chances.',
        severity: 'low',
        confidence: 85,
        category: 'strength',
        priority: 'low',
        dataPoints: [`${avgPossession.toFixed(0)}% avg possession`, 'Ball control mastery']
      });
      
      // Check if possession translates to wins
      const highPossessionGames = possessionGames.filter(game => game.teamStats.possession >= 60);
      const highPossessionWinRate = highPossessionGames.filter(g => g.result === 'win').length / highPossessionGames.length * 100;
      
      if (highPossessionWinRate < 50 && highPossessionGames.length >= 5) {
        insights.push({
          id: 'possession-without-purpose',
          type: 'tactical',
          title: 'Possession Without Purpose',
          description: `Despite high possession (${avgPossession.toFixed(0)}%), your win rate in these games is only ${highPossessionWinRate.toFixed(0)}%.`,
          actionableAdvice: 'Focus on forward progression and creating quality chances rather than just keeping the ball.',
          severity: 'medium',
          confidence: 82,
          category: 'weakness',
          priority: 'medium',
          dataPoints: [`${highPossessionWinRate.toFixed(0)}% win rate with high possession`, 'Inefficient ball use']
        });
      }
    } else if (avgPossession <= 40) {
      insights.push({
        id: 'counter-attacking',
        type: 'tactical',
        title: 'Counter-Attacking Style',
        description: `Low average possession (${avgPossession.toFixed(0)}%) suggests a counter-attacking approach.`,
        actionableAdvice: 'Your direct style can be effective. Focus on defensive solidity and quick transitions.',
        severity: 'low',
        confidence: 80,
        category: 'opportunity',
        priority: 'low',
        dataPoints: [`${avgPossession.toFixed(0)}% avg possession`, 'Direct approach']
      });
      
      // Check if counter-attacking is effective
      const lowPossessionGames = possessionGames.filter(game => game.teamStats.possession <= 40);
      const lowPossessionWinRate = lowPossessionGames.filter(g => g.result === 'win').length / lowPossessionGames.length * 100;
      
      if (lowPossessionWinRate >= 60 && lowPossessionGames.length >= 5) {
        insights.push({
          id: 'effective-counter-attacking',
          type: 'tactical',
          title: 'Effective Counter-Attacking',
          description: `${lowPossessionWinRate.toFixed(0)}% win rate with low possession shows excellent efficiency and clinical finishing.`,
          actionableAdvice: 'Your counter-attacking style is working well. Continue to focus on quick transitions and clinical finishing.',
          severity: 'low',
          confidence: 85,
          category: 'strength',
          priority: 'low',
          dataPoints: [`${lowPossessionWinRate.toFixed(0)}% win rate with low possession`, 'Counter-attack specialist']
        });
      } else if (lowPossessionWinRate <= 30 && lowPossessionGames.length >= 5) {
        insights.push({
          id: 'ineffective-counter-attacking',
          type: 'tactical',
          title: 'Counter-Attack Improvement Needed',
          description: `Only ${lowPossessionWinRate.toFixed(0)}% win rate with low possession suggests your counter-attacking needs refinement.`,
          actionableAdvice: 'Work on transition speed and ensuring your forwards are making good runs behind the defense.',
          severity: 'medium',
          confidence: 80,
          category: 'weakness',
          priority: 'medium',
          dataPoints: [`${lowPossessionWinRate.toFixed(0)}% win rate with low possession`, 'Ineffective transitions']
        });
      }
    }
  }

  // Pass accuracy analysis
  const passGames = allGames.filter(game => game.teamStats.passAccuracy !== undefined);
  if (passGames.length >= 5) {
    const avgPassAccuracy = passGames.reduce((sum, game) => sum + game.teamStats.passAccuracy, 0) / passGames.length;
    
    if (avgPassAccuracy >= 85) {
      insights.push({
        id: 'passing-excellence',
        type: 'technical',
        title: 'Passing Excellence',
        description: `${avgPassAccuracy.toFixed(0)}% pass accuracy demonstrates exceptional ball control and decision-making.`,
        actionableAdvice: 'Your passing game is elite. Continue to use this to control games and create chances.',
        severity: 'low',
        confidence: 88,
        category: 'strength',
        priority: 'low',
        dataPoints: [`${avgPassAccuracy.toFixed(0)}% pass accuracy`, 'Technical excellence']
      });
    } else if (avgPassAccuracy <= 70) {
      insights.push({
        id: 'passing-issues',
        type: 'technical',
        title: 'Passing Improvement Needed',
        description: `${avgPassAccuracy.toFixed(0)}% pass accuracy suggests room for improvement in ball retention and decision-making.`,
        actionableAdvice: 'Focus on safer passing options and consider players with better passing attributes.',
        severity: 'medium',
        confidence: 85,
        category: 'weakness',
        priority: 'medium',
        dataPoints: [`${avgPassAccuracy.toFixed(0)}% pass accuracy`, 'Technical limitation']
      });
    }
  }

  // Shot accuracy analysis
  const shotGames = allGames.filter(game => game.teamStats.shots !== undefined && game.teamStats.shotsOnTarget !== undefined);
  if (shotGames.length >= 5) {
    const totalShots = shotGames.reduce((sum, game) => sum + game.teamStats.shots, 0);
    const shotsOnTarget = shotGames.reduce((sum, game) => sum + game.teamStats.shotsOnTarget, 0);
    const shotAccuracy = (shotsOnTarget / totalShots) * 100;
    
    if (shotAccuracy >= 60) {
      insights.push({
        id: 'shot-accuracy-excellence',
        type: 'technical',
        title: 'Excellent Shot Selection',
        description: `${shotAccuracy.toFixed(0)}% of your shots are on target, showing great shot selection and technique.`,
        actionableAdvice: 'Your shot accuracy is excellent. Continue to focus on quality over quantity in shooting opportunities.',
        severity: 'low',
        confidence: 85,
        category: 'strength',
        priority: 'low',
        dataPoints: [`${shotAccuracy.toFixed(0)}% shot accuracy`, `${shotsOnTarget}/${totalShots} shots on target`]
      });
    } else if (shotAccuracy <= 40) {
      insights.push({
        id: 'shot-accuracy-issues',
        type: 'technical',
        title: 'Shot Accuracy Concerns',
        description: `Only ${shotAccuracy.toFixed(0)}% of your shots are on target, suggesting rushed or poor quality attempts.`,
        actionableAdvice: 'Work on shot selection and composure. Take an extra touch when possible to set up better shooting angles.',
        severity: 'medium',
        confidence: 85,
        category: 'weakness',
        priority: 'medium',
        dataPoints: [`${shotAccuracy.toFixed(0)}% shot accuracy`, `${shotsOnTarget}/${totalShots} shots on target`]
      });
    }
    
    // Shot efficiency analysis
    const avgShotsPerGoal = totalGoals > 0 ? totalShots / totalGoals : 0;
    
    if (avgShotsPerGoal <= 3 && totalGoals >= 10) {
      insights.push({
        id: 'clinical-conversion',
        type: 'technical',
        title: 'Clinical Shot Conversion',
        description: `Scoring a goal every ${avgShotsPerGoal.toFixed(1)} shots shows exceptional finishing efficiency.`,
        actionableAdvice: 'Your finishing is elite. Continue to focus on getting into high-percentage scoring positions.',
        severity: 'low',
        confidence: 88,
        category: 'strength',
        priority: 'low',
        dataPoints: [`${avgShotsPerGoal.toFixed(1)} shots per goal`, 'Elite finishing']
      });
    } else if (avgShotsPerGoal >= 8 && totalGoals >= 10) {
      insights.push({
        id: 'wasteful-shooting',
        type: 'technical',
        title: 'Shot Conversion Inefficiency',
        description: `Needing ${avgShotsPerGoal.toFixed(1)} shots per goal indicates wasteful finishing.`,
        actionableAdvice: 'Practice finishing in skill games and focus on composure in front of goal during matches.',
        severity: 'medium',
        confidence: 85,
        category: 'weakness',
        priority: 'medium',
        dataPoints: [`${avgShotsPerGoal.toFixed(1)} shots per goal`, 'Wasteful finishing']
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
        type: 'mental',
        title: 'Discipline Concerns',
        description: `Averaging ${yellowsPerGame.toFixed(1)} yellow and ${redsPerGame.toFixed(1)} red cards per game suggests overly aggressive play.`,
        actionableAdvice: 'Be more careful with tackles, especially when players are already on a yellow card.',
        severity: 'medium',
        confidence: 80,
        category: 'weakness',
        priority: 'medium',
        dataPoints: [`${totalYellows} yellow cards`, `${totalReds} red cards`]
      });
    } else if (yellowsPerGame <= 0.5 && redsPerGame === 0 && disciplineGames.length >= 10) {
      insights.push({
        id: 'excellent-discipline',
        type: 'mental',
        title: 'Excellent Discipline',
        description: `Your clean disciplinary record shows good control and timing in challenges.`,
        actionableAdvice: 'Your disciplined approach is an asset. Continue to focus on clean tackling and positioning.',
        severity: 'low',
        confidence: 80,
        category: 'strength',
        priority: 'low',
        dataPoints: [`${yellowsPerGame.toFixed(1)} yellow cards per game`, 'Clean tackling']
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
        type: 'tactical',
        title: 'Set Piece Opportunities',
        description: `Earning ${cornersPerGame.toFixed(1)} corners per game provides numerous set piece opportunities.`,
        actionableAdvice: 'Practice corner routines and consider players with good heading ability to capitalize on these chances.',
        severity: 'low',
        confidence: 75,
        category: 'opportunity',
        priority: 'low',
        dataPoints: [`${cornersPerGame.toFixed(1)} corners per game`, 'Set piece potential']
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

    if (bestHour !== -1 && worstHour !== -1 && bestWinRate - worstWinRate >= 30) {
      insights.push({
        id: 'time-performance-variation',
        type: 'statistical',
        title: 'Time-Based Performance Variation',
        description: `${bestWinRate.toFixed(0)}% win rate at ${bestHour}:00 vs ${worstWinRate.toFixed(0)}% at ${worstHour}:00 shows significant time-based performance differences.`,
        actionableAdvice: `Schedule important games around ${bestHour}:00 when possible for optimal performance.`,
        severity: 'medium',
        confidence: 80,
        category: 'opportunity',
        priority: 'medium',
        dataPoints: [`${bestWinRate.toFixed(0)}% win rate at ${bestHour}:00`, `${worstWinRate.toFixed(0)}% win rate at ${worstHour}:00`]
      });
    }
  }

  // Game duration impact
  const durationGames = allGames.filter(game => game.duration);
  if (durationGames.length >= 10) {
    const shortGames = durationGames.filter(game => game.duration <= 85);
    const longGames = durationGames.filter(game => game.duration >= 95);
    
    if (shortGames.length >= 5 && longGames.length >= 5) {
      const shortGameWinRate = shortGames.filter(g => g.result === 'win').length / shortGames.length * 100;
      const longGameWinRate = longGames.filter(g => g.result === 'win').length / longGames.length * 100;
      
      if (Math.abs(shortGameWinRate - longGameWinRate) >= 20) {
        const betterDuration = shortGameWinRate > longGameWinRate ? 'shorter' : 'longer';
        const betterWinRate = Math.max(shortGameWinRate, longGameWinRate);
        const worseWinRate = Math.min(shortGameWinRate, longGameWinRate);
        
        insights.push({
          id: 'game-duration-impact',
          type: 'statistical',
          title: 'Game Duration Performance Impact',
          description: `You perform better in ${betterDuration} games (${betterWinRate.toFixed(0)}% vs ${worseWinRate.toFixed(0)}% win rate).`,
          actionableAdvice: betterDuration === 'shorter' ? 
            'Your performance in quick games suggests you excel with an aggressive, high-tempo approach.' : 
            'Your performance in longer games suggests excellent stamina and mental endurance.',
          severity: 'medium',
          confidence: 80,
          category: 'opportunity',
          priority: 'medium',
          dataPoints: [`${betterWinRate.toFixed(0)}% win rate in ${betterDuration} games`, `${worseWinRate.toFixed(0)}% in ${betterDuration === 'shorter' ? 'longer' : 'shorter'} games`]
        });
      }
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
    const narrowWinRate = (narrowWins / narrowGames.length) * 100;
    
    if (narrowWins >= narrowLosses * 2) {
      insights.push({
        id: 'clutch-performer',
        type: 'mental',
        title: 'Clutch Performer',
        description: `${narrowWinRate.toFixed(0)}% win rate in close games (${narrowWins} wins, ${narrowLosses} losses) shows excellent composure under pressure.`,
        actionableAdvice: 'Your ability to win tight games is a major asset. Continue to stay calm in pressure situations.',
        severity: 'low',
        confidence: 85,
        category: 'strength',
        priority: 'low',
        dataPoints: [`${narrowWins} narrow wins`, `${narrowLosses} narrow losses`]
      });
    } else if (narrowLosses >= narrowWins * 2) {
      insights.push({
        id: 'close-game-struggles',
        type: 'mental',
        title: 'Close Game Struggles',
        description: `Only ${narrowWinRate.toFixed(0)}% win rate in close games (${narrowWins} wins, ${narrowLosses} losses) suggests difficulties in managing tight situations.`,
        actionableAdvice: 'Practice game management when leading by one goal. Consider more conservative tactics in the final minutes.',
        severity: 'medium',
        confidence: 85,
        category: 'weakness',
        priority: 'medium',
        dataPoints: [`${narrowWins} narrow wins`, `${narrowLosses} narrow losses`]
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
        type: 'tactical',
        title: 'Thrives in Open Games',
        description: `${highScoringWinRate.toFixed(0)}% win rate in high-scoring games shows you excel when matches are open and attacking.`,
        actionableAdvice: 'Your attacking prowess shines in open games. Consider aggressive tactics to create these scenarios.',
        severity: 'low',
        confidence: 80,
        category: 'strength',
        priority: 'low',
        dataPoints: [`${highScoringWins}/${highScoringGames.length} high-scoring wins`, 'Open game specialist']
      });
    } else if (highScoringWinRate <= 30) {
      insights.push({
        id: 'struggles-in-open-games',
        type: 'tactical',
        title: 'Vulnerable in Open Games',
        description: `Only ${highScoringWinRate.toFixed(0)}% win rate in high-scoring games suggests you struggle when matches become end-to-end.`,
        actionableAdvice: 'Focus on controlling game tempo and avoid getting drawn into chaotic, open matches.',
        severity: 'medium',
        confidence: 80,
        category: 'weakness',
        priority: 'medium',
        dataPoints: [`${highScoringWins}/${highScoringGames.length} high-scoring wins`, 'Prefers controlled games']
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
        type: 'tactical',
        title: 'Thrives in Tight Games',
        description: `${lowScoringWinRate.toFixed(0)}% win rate in low-scoring games shows excellent game management and defensive discipline.`,
        actionableAdvice: 'Your ability to win tight games is valuable. Consider a more controlled approach in key matches.',
        severity: 'low',
        confidence: 80,
        category: 'strength',
        priority: 'low',
        dataPoints: [`${lowScoringWins}/${lowScoringGames.length} low-scoring wins`, 'Tactical discipline']
      });
    } else if (lowScoringWinRate <= 30) {
      insights.push({
        id: 'struggles-in-tight-games',
        type: 'tactical',
        title: 'Struggles in Tight Games',
        description: `Only ${lowScoringWinRate.toFixed(0)}% win rate in low-scoring games suggests difficulty breaking down defensive opponents.`,
        actionableAdvice: 'Practice patient build-up play and creative ways to break down defensive blocks.',
        severity: 'medium',
        confidence: 80,
        category: 'weakness',
        priority: 'medium',
        dataPoints: [`${lowScoringWins}/${lowScoringGames.length} low-scoring wins`, 'Needs attacking variety']
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
        type: 'statistical',
        title: 'Consistent Scoring Threat',
        description: `You score in ${scoringRate.toFixed(0)}% of your games, showing consistent offensive threat regardless of opposition.`,
        actionableAdvice: 'Your consistent scoring is a major asset. Continue to focus on creating quality chances in every game.',
        severity: 'low',
        confidence: 90,
        category: 'strength',
        priority: 'low',
        dataPoints: [`Score in ${scoringRate.toFixed(0)}% of games`, 'Reliable attack']
      });
    } else if (scoringRate <= 60) {
      insights.push({
        id: 'scoring-consistency-issues',
        type: 'statistical',
        title: 'Scoring Consistency Issues',
        description: `You fail to score in ${(100 - scoringRate).toFixed(0)}% of your games. Improving offensive consistency is crucial.`,
        actionableAdvice: 'Work on creating a consistent attacking approach that generates chances even against tough defenses.',
        severity: 'medium',
        confidence: 85,
        category: 'weakness',
        priority: 'medium',
        dataPoints: [`Fail to score in ${(100 - scoringRate).toFixed(0)}% of games`, 'Inconsistent attack']
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
        type: 'statistical',
        title: 'Defensive Wall',
        description: `You keep clean sheets in ${cleanSheetRate.toFixed(0)}% of your games, providing a solid foundation for success.`,
        actionableAdvice: 'Your defensive solidity is excellent. Use this as a platform for consistent results.',
        severity: 'low',
        confidence: 90,
        category: 'strength',
        priority: 'low',
        dataPoints: [`${cleanSheetRate.toFixed(0)}% clean sheet rate`, `${gamesWithoutConceding} clean sheets`]
      });
    } else if (cleanSheetRate <= 20 && allGames.length >= 15) {
      insights.push({
        id: 'clean-sheet-rarity',
        type: 'statistical',
        title: 'Clean Sheet Scarcity',
        description: `You keep clean sheets in only ${cleanSheetRate.toFixed(0)}% of your games, suggesting defensive vulnerabilities.`,
        actionableAdvice: 'Focus on defensive organization and consider more conservative tactics when leading.',
        severity: 'medium',
        confidence: 85,
        category: 'weakness',
        priority: 'medium',
        dataPoints: [`${cleanSheetRate.toFixed(0)}% clean sheet rate`, `${gamesWithoutConceding} clean sheets`]
      });
    }
  }

  // Playstyle insights based on stats patterns
  if (possessionGames.length >= 10 && shotGames.length >= 10) {
    const avgPossession = possessionGames.reduce((sum, game) => sum + game.teamStats.possession, 0) / possessionGames.length;
    const totalShots = shotGames.reduce((sum, game) => sum + game.teamStats.shots, 0);
    const shotsPerGame = totalShots / shotGames.length;
    
    if (avgPossession >= 60 && shotsPerGame >= 12) {
      insights.push({
        id: 'dominant-possession-style',
        type: 'tactical',
        title: 'Dominant Possession Style',
        description: `High possession (${avgPossession.toFixed(0)}%) and shots (${shotsPerGame.toFixed(1)}/game) indicate a dominant, controlling playstyle.`,
        actionableAdvice: 'Your possession-based approach is working well. Continue to use this to wear down opponents.',
        severity: 'low',
        confidence: 85,
        category: 'strength',
        priority: 'low',
        dataPoints: [`${avgPossession.toFixed(0)}% possession`, `${shotsPerGame.toFixed(1)} shots per game`]
      });
    } else if (avgPossession <= 45 && shotsPerGame >= 10) {
      insights.push({
        id: 'counter-attack-style',
        type: 'tactical',
        title: 'Effective Counter-Attacking',
        description: `Lower possession (${avgPossession.toFixed(0)}%) but high shots (${shotsPerGame.toFixed(1)}/game) suggest an efficient counter-attacking approach.`,
        actionableAdvice: 'Your direct style is effective. Focus on quick transitions and exploiting space behind defenses.',
        severity: 'low',
        confidence: 85,
        category: 'strength',
        priority: 'low',
        dataPoints: [`${avgPossession.toFixed(0)}% possession`, `${shotsPerGame.toFixed(1)} shots per game`]
      });
    } else if (avgPossession >= 60 && shotsPerGame <= 8) {
      insights.push({
        id: 'possession-without-penetration',
        type: 'tactical',
        title: 'Possession Without Penetration',
        description: `High possession (${avgPossession.toFixed(0)}%) but few shots (${shotsPerGame.toFixed(1)}/game) suggest difficulty creating clear chances.`,
        actionableAdvice: 'Focus on more direct passing in the final third and getting players into the box.',
        severity: 'medium',
        confidence: 85,
        category: 'weakness',
        priority: 'medium',
        dataPoints: [`${avgPossession.toFixed(0)}% possession`, `${shotsPerGame.toFixed(1)} shots per game`]
      });
    }
  }

  // Randomize the order a bit to avoid always showing the same insights
  return insights
    .sort(() => Math.random() - 0.5)
    .slice(0, 15); // Return top 15 insights
}

export function generateGameSpecificInsights(game: GameResult, weekStats: any): string[] {
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
    "Against counter-attacking opponents, be careful not to commit too many players forward.",
    "Try using the offside trap against opponents who make a lot of through ball attempts.",
    "When facing opponents who use skill moves frequently, avoid rushing into tackles.",
    "Consider using the 'Hug Sideline' instruction to create width against compact defenses.",
    "Against opponents who use constant pressure, quick one-touch passing can be effective.",
    "If you're struggling to create chances, try changing to a formation with overlapping fullbacks.",
    "When defending a lead late in the game, the 'Drop Back' defensive style can be effective.",
    "Against opponents who use a lot of crosses, set your fullbacks to 'Stay Back While Attacking'.",
    "If you're struggling with possession, try using the 'Possession' game plan to give more passing options.",
    "When facing opponents with fast wingers, consider using the 'Cover Wing' instruction for your CBs.",
    "Against opponents who use a lot of long shots, set your defensive depth to 'Deep' to block shooting lanes."
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