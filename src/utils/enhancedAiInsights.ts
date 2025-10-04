import type { WeeklyPerformance, GameResult, AIInsight } from "@/types/futChampions";

// --- HELPER FUNCTIONS ---
// FIX: Added 'export' so this function can be used in other files like Analytics.tsx
export const calculateAllTimeStats = (weeklyData: WeeklyPerformance[]) => {
  const allGames: GameResult[] = weeklyData.flatMap(w => w.games || []);
  const totalGames = allGames.length;
  if (totalGames === 0) return null;

  const totalWins = allGames.filter(g => g.result === 'win').length;
  const totalLosses = totalGames - totalWins;
  const winRate = totalGames > 0 ? (totalWins / totalGames) * 100 : 0;

  const goalsScored = allGames.reduce((acc, g) => acc + (parseInt(g.scoreLine.split('-')[0]) || 0), 0);
  const goalsConceded = allGames.reduce((acc, g) => acc + (parseInt(g.scoreLine.split('-')[1]) || 0), 0);
  const avgGoalsScored = totalGames > 0 ? goalsScored / totalGames : 0;
  const avgGoalsConceded = totalGames > 0 ? goalsConceded / totalGames : 0;

  const cleanSheets = allGames.filter(g => parseInt(g.scoreLine.split('-')[1]) === 0).length;
  const rageQuits = allGames.filter(g => g.gameContext === 'rage_quit').length;

  return {
    totalGames,
    totalWins,
    totalLosses,
    winRate,
    goalsScored,
    goalsConceded,
    avgGoalsScored,
    avgGoalsConceded,
    cleanSheets,
    rageQuits,
  };
};

// --- INSIGHT GENERATION MODULES ---

const generateStrengthInsights = (stats: ReturnType<typeof calculateAllTimeStats>): AIInsight[] => {
  if (!stats) return [];
  const insights: AIInsight[] = [];

  if (stats.winRate > 60) {
    insights.push({
      id: 'strength_high_win_rate',
      type: 'tactical',
      title: 'Dominant Performer',
      description: `Your overall win rate of ${stats.winRate.toFixed(1)}% is impressive. You consistently outperform your opponents.`,
      confidence: 95,
      actionable: false,
      priority: 'high',
      category: 'strength',
      generated: new Date().toISOString()
    });
  }

  if (stats.avgGoalsScored > 2.5) {
    insights.push({
      id: 'strength_high_scoring',
      type: 'tactical',
      title: 'Attacking Powerhouse',
      description: `You average ${stats.avgGoalsScored.toFixed(1)} goals per game, indicating a formidable attack.`,
      confidence: 90,
      actionable: false,
      priority: 'medium',
      category: 'strength',
      generated: new Date().toISOString()
    });
  }
  
  if (stats.avgGoalsConceded < 1.5) {
      insights.push({
      id: 'strength_solid_defense',
      type: 'tactical',
      title: 'Defensive Fortress',
      description: `Conceding only ${stats.avgGoalsConceded.toFixed(1)} goals on average suggests your defense is a key strength.`,
      confidence: 90,
      actionable: false,
      priority: 'medium',
      category: 'strength',
      generated: new Date().toISOString()
    });
  }

  return insights;
};

const generateWeaknessInsights = (stats: ReturnType<typeof calculateAllTimeStats>): AIInsight[] => {
    if (!stats) return [];
    const insights: AIInsight[] = [];

    if (stats.winRate < 40 && stats.totalGames > 10) {
        insights.push({
            id: 'weakness_low_win_rate',
            type: 'tactical',
            title: 'Inconsistent Results',
            description: `Your win rate of ${stats.winRate.toFixed(1)}% is an area for improvement. Let's focus on converting losses to wins.`,
            confidence: 95,
            actionable: true,
            priority: 'high',
            category: 'weakness',
            generated: new Date().toISOString()
        });
    }

    if (stats.avgGoalsConceded > 2.5) {
        insights.push({
            id: 'weakness_leaky_defense',
            type: 'tactical',
            title: 'Leaky Defense',
            description: `You concede an average of ${stats.avgGoalsConceded.toFixed(1)} goals per game. Tightening up your defense could significantly boost your win rate.`,
            confidence: 90,
            actionable: true,
            priority: 'high',
            category: 'weakness',
            generated: new Date().toISOString()
        });
    }

    if (stats.rageQuits / stats.totalGames > 0.1) {
        insights.push({
            id: 'weakness_rage_quits',
            type: 'general',
            title: 'Mental Game Focus',
            description: `A significant number of your games end in rage quits. Focusing on maintaining composure could prevent unnecessary losses.`,
            confidence: 85,
            actionable: true,
            priority: 'medium',
            category: 'weakness',
            generated: new Date().toISOString()
        });
    }
    
    return insights;
};

const generateTrendInsights = (weeklyData: WeeklyPerformance[]): AIInsight[] => {
    if (weeklyData.length < 2) return [];
    const insights: AIInsight[] = [];
    const lastTwoWeeks = weeklyData.slice(-2);
    const lastWeek = lastTwoWeeks[1];
    const previousWeek = lastTwoWeeks[0];

    const lastWeekWinRate = (lastWeek.totalWins / (lastWeek.gamesPlayed || 1)) * 100;
    const prevWeekWinRate = (previousWeek.totalWins / (previousWeek.gamesPlayed || 1)) * 100;

    if (lastWeekWinRate > prevWeekWinRate + 10) {
        insights.push({
            id: 'trend_improving_form',
            type: 'general',
            title: 'Improving Form',
            description: `Your win rate jumped from ${prevWeekWinRate.toFixed(0)}% to ${lastWeekWinRate.toFixed(0)}%. You're on an upward trend!`,
            confidence: 80,
            actionable: false,
            priority: 'high',
            category: 'opportunity',
            generated: new Date().toISOString()
        });
    }
    
    return insights;
};


// --- MAIN EXPORT FUNCTION ---
export const generateEnhancedAIInsights = (weeklyData: WeeklyPerformance[]): AIInsight[] => {
  const allTimeStats = calculateAllTimeStats(weeklyData);

  if (!allTimeStats) {
    return [{
        id: 'no_data',
        type: 'general',
        title: 'Ready for Insights',
        description: 'Play a few games to start generating personalized AI insights and analytics.',
        confidence: 100,
        actionable: false,
        priority: 'medium',
        category: 'opportunity',
        generated: new Date().toISOString()
    }];
  }

  const strengthInsights = generateStrengthInsights(allTimeStats);
  const weaknessInsights = generateWeaknessInsights(allTimeStats);
  const trendInsights = generateTrendInsights(allTimeStats);

  // Combine and sort by priority
  const allInsights = [...strengthInsights, ...weaknessInsights, ...trendInsights];
  
  const priorityOrder = { 'high': 1, 'medium': 2, 'low': 3 };
  allInsights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return allInsights;
};

