
import { GameResult, WeeklyPerformance } from '@/types/futChampions';
import { PlayerCard, Squad } from '@/types/squads';

export const generateGameInsights = (
  game: GameResult, 
  weekStats: WeeklyPerformance,
  previousGames: GameResult[]
): string[] => {
  const insights: string[] = [];
  const isWin = game.result === 'win';

  // Performance-based insights
  if (isWin) {
    if (game.opponentSkill >= 8) {
      insights.push("🏆 Exceptional performance! Defeating a highly skilled opponent shows your improvement.");
    }
    if (game.duration <= 15) {
      insights.push("⚡ Quick victory! You dominated early and maintained control throughout the match.");
    }
    if (weekStats.totalWins >= 15) {
      insights.push("🔥 You're on fire this week! Your consistency is paying off in Champions.");
    }
  } else {
    if (game.opponentSkill <= 3) {
      insights.push("🎯 Focus needed: losses against weaker opponents suggest concentration issues. Take breaks between games.");
    }
    if (game.stressLevel && game.stressLevel >= 8) {
      insights.push("🧘 High stress detected. Consider playing when you're more relaxed for better performance.");
    }
  }

  // Pattern analysis
  const recentGames = previousGames.slice(-5);
  const recentWins = recentGames.filter(g => g.result === 'win').length;
  
  if (recentWins <= 1 && recentGames.length >= 5) {
    insights.push("📊 Struggling streak detected. Try switching formations or taking a longer break.");
  }
  
  if (recentWins >= 4 && recentGames.length >= 5) {
    insights.push("🚀 Hot streak! You're in the zone - keep this momentum going.");
  }

  // Time-based insights
  const hour = new Date().getHours();
  if (hour >= 22 || hour <= 6) {
    if (!isWin) {
      insights.push("🌙 Late night gaming affecting performance? Consider your peak hours for optimal results.");
    }
  }

  // Goal-based insights
  if (weekStats.targetWins && weekStats.totalWins >= weekStats.targetWins * 0.8) {
    insights.push("🎯 Nearly at your weekly target! Stay focused and finish strong.");
  }

  return insights.slice(0, 3); // Limit to 3 insights
};

export const generateWeeklyInsights = (week: WeeklyPerformance, allWeeks: WeeklyPerformance[]): string[] => {
  const insights: string[] = [];
  
  const winRate = week.totalWins / Math.max(week.totalWins + week.totalLosses, 1) * 100;
  
  if (winRate >= 75) {
    insights.push("🔥 Outstanding week! You're performing at an elite level in FUT Champions.");
  } else if (winRate >= 60) {
    insights.push("💪 Solid performance this week. You're consistently above average.");
  } else if (winRate >= 45) {
    insights.push("📈 Room for improvement. Focus on key areas to boost your win rate.");
  } else {
    insights.push("🎯 Challenging week. Consider reviewing your tactics and squad selection.");
  }

  // Compare to previous weeks
  if (allWeeks.length > 1) {
    const prevWeek = allWeeks[allWeeks.length - 2];
    const prevWinRate = prevWeek.totalWins / Math.max(prevWeek.totalWins + prevWeek.totalLosses, 1) * 100;
    
    if (winRate > prevWinRate + 10) {
      insights.push("📊 Significant improvement from last week! Keep building on this progress.");
    } else if (winRate < prevWinRate - 10) {
      insights.push("📉 Performance dipped from last week. Analyze what changed and adjust accordingly.");
    }
  }

  return insights;
};

export const generateSquadInsights = (squad: Squad, players: PlayerCard[]): string[] => {
  const insights: string[] = [];
  
  const squadPlayers = [
    ...squad.startingXI.filter(pos => pos.player).map(pos => pos.player!),
    ...squad.substitutes.filter(pos => pos.player).map(pos => pos.player!)
  ];

  if (squadPlayers.length === 0) return insights;

  const avgRating = squadPlayers.reduce((sum, p) => sum + p.rating, 0) / squadPlayers.length;
  
  if (avgRating >= 85) {
    insights.push("⭐ Elite squad! Your high-rated players give you a competitive advantage.");
  }

  // Chemistry insights
  const leagues = [...new Set(squadPlayers.map(p => p.league))];
  const nations = [...new Set(squadPlayers.map(p => p.nationality))];
  
  if (leagues.length <= 3) {
    insights.push("🔗 Good league links! This should boost your squad's chemistry rating.");
  }
  
  if (nations.length <= 5) {
    insights.push("🌍 Strong nationality connections! Chemistry boosts incoming.");
  }

  // Performance insights
  const topPerformers = squadPlayers
    .filter(p => p.gamesPlayed > 5)
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 3);

  if (topPerformers.length > 0) {
    insights.push(`🏆 Top performer: ${topPerformers[0].name} with ${topPerformers[0].averageRating.toFixed(1)} avg rating.`);
  }

  return insights.slice(0, 4);
};

export const generatePlayerInsights = (player: PlayerCard): string[] => {
  const insights: string[] = [];
  
  if (player.gamesPlayed === 0) {
    insights.push("🆕 New signing! Time to see how they perform in your squad.");
    return insights;
  }

  const goalRatio = player.goals / Math.max(player.gamesPlayed, 1);
  const assistRatio = player.assists / Math.max(player.gamesPlayed, 1);
  
  if (goalRatio >= 0.7) {
    insights.push("⚽ Prolific goal scorer! This player is clinical in front of goal.");
  } else if (assistRatio >= 0.5) {
    insights.push("🎯 Creative force! Excellent at setting up teammates for goals.");
  }

  if (player.averageRating >= 8.0) {
    insights.push("🌟 Consistent performer! Rarely has a bad game for your team.");
  } else if (player.averageRating <= 6.0 && player.gamesPlayed >= 5) {
    insights.push("📉 Struggling form. Consider rotation or tactical changes.");
  }

  const winRate = player.wins / Math.max(player.gamesPlayed, 1) * 100;
  if (winRate >= 70) {
    insights.push("🍀 Lucky charm! Team performs better with this player.");
  }

  return insights.slice(0, 3);
};

export const generateDashboardInsights = (
  weeks: WeeklyPerformance[], 
  squads: Squad[], 
  players: PlayerCard[]
): string[] => {
  const insights: string[] = [];
  
  if (weeks.length === 0) {
    insights.push("🚀 Welcome to FUT Champions tracking! Start by recording your first week of games.");
    return insights;
  }

  const currentWeek = weeks.find(w => !w.isCompleted);
  const completedWeeks = weeks.filter(w => w.isCompleted);
  
  // Current week insights
  if (currentWeek) {
    const totalGames = currentWeek.totalWins + currentWeek.totalLosses;
    if (totalGames >= 20) {
      insights.push("🏁 Week nearly complete! Just a few more games to finish strong.");
    } else if (totalGames >= 10) {
      insights.push("⚡ Halfway through the week! Maintain your focus for the remaining games.");
    }
  }

  // Overall performance insights
  if (completedWeeks.length >= 3) {
    const avgWinRate = completedWeeks.reduce((sum, w) => {
      const games = w.totalWins + w.totalLosses;
      return sum + (games > 0 ? w.totalWins / games : 0);
    }, 0) / completedWeeks.length * 100;

    if (avgWinRate >= 70) {
      insights.push("🏆 Elite player! You're consistently performing at the highest level.");
    } else if (avgWinRate >= 55) {
      insights.push("💪 Strong performer! You're above average and improving.");
    }
  }

  // Squad insights
  if (squads.length > 0) {
    const defaultSquad = squads.find(s => s.isDefault);
    if (defaultSquad && defaultSquad.gamesPlayed > 10) {
      const winRate = defaultSquad.wins / defaultSquad.gamesPlayed * 100;
      if (winRate >= 65) {
        insights.push(`⭐ Your "${defaultSquad.name}" squad is performing excellently!`);
      } else if (winRate <= 40) {
        insights.push(`🔧 Consider adjusting your "${defaultSquad.name}" formation or players.`);
      }
    }
  }

  // Achievement insights
  const totalGames = weeks.reduce((sum, w) => sum + w.totalWins + w.totalLosses, 0);
  if (totalGames >= 100) {
    insights.push("🎯 Milestone: 100+ games played! You're a FUT Champions veteran.");
  } else if (totalGames >= 50) {
    insights.push("📈 Halfway to 100 games! Your experience is growing rapidly.");
  }

  return insights.slice(0, 5);
};
