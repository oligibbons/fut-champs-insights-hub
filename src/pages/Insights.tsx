
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAccountData } from '@/hooks/useAccountData';
import { Lightbulb, TrendingUp, Target, Users, RefreshCw, Brain } from 'lucide-react';
import { useState, useMemo } from 'react';

interface Insight {
  id: string;
  type: 'tactical' | 'player' | 'formation' | 'general';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
}

const Insights = () => {
  const { weeks, activeAccount } = useAccountData();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateInsights = (): Insight[] => {
    const allGames = weeks.flatMap(week => week.games);
    if (allGames.length === 0) return [];

    const insights: Insight[] = [];
    const totalGames = allGames.length;
    const totalWins = allGames.filter(game => game.result === 'win').length;
    const totalGoals = allGames.reduce((sum, game) => {
      const [goalsFor] = game.scoreLine.split('-').map(Number);
      return sum + goalsFor;
    }, 0);
    const totalConceded = allGames.reduce((sum, game) => {
      const [, goalsAgainst] = game.scoreLine.split('-').map(Number);
      return sum + goalsAgainst;
    }, 0);
    const avgOpponentSkill = allGames.reduce((sum, game) => sum + game.opponentSkill, 0) / allGames.length;

    const winRate = totalGames > 0 ? (totalWins / totalGames) * 100 : 0;
    const goalRatio = totalConceded > 0 ? totalGoals / totalConceded : totalGoals;

    // Generate insights based on performance
    if (totalGames >= 1) {
      if (winRate > 70) {
        insights.push({
          id: 'excellent_performance',
          type: 'general',
          title: 'Outstanding Performance!',
          description: `Your win rate of ${winRate.toFixed(1)}% is exceptional. You're playing at an elite level and consistently outperforming opponents.`,
          confidence: 95,
          actionable: false
        });
      } else if (winRate < 40) {
        insights.push({
          id: 'improve_consistency',
          type: 'tactical',
          title: 'Focus on Consistency',
          description: `Your current win rate is ${winRate.toFixed(1)}%. Consider reviewing your tactics and focusing on defensive stability to improve results.`,
          confidence: 85,
          actionable: true
        });
      }
    }

    if (totalGames >= 3) {
      if (goalRatio > 2) {
        insights.push({
          id: 'attacking_strength',
          type: 'tactical',
          title: 'Attacking Powerhouse',
          description: `You're scoring ${goalRatio.toFixed(2)} goals for every goal conceded. Your attacking play is your biggest strength - keep utilizing it!`,
          confidence: 90,
          actionable: false
        });
      } else if (goalRatio < 1) {
        insights.push({
          id: 'defensive_improvement',
          type: 'tactical',
          title: 'Tighten Your Defense',
          description: `You're conceding more goals than you score. Focus on defensive positioning and consider a more conservative formation.`,
          confidence: 85,
          actionable: true
        });
      }
    }

    if (avgOpponentSkill > 7) {
      insights.push({
        id: 'strong_opposition',
        type: 'general',
        title: 'Facing Elite Competition',
        description: `Your average opponent skill level is ${avgOpponentSkill.toFixed(1)}/10. You're consistently facing high-level players, which will accelerate your improvement.`,
        confidence: 90,
        actionable: false
      });
    }

    // XG Analysis
    const totalXG = allGames.reduce((sum, game) => sum + (game.teamStats.expectedGoals || 0), 0);
    const totalXGA = allGames.reduce((sum, game) => sum + (game.teamStats.expectedGoalsAgainst || 0), 0);
    
    if (totalXG > 0) {
      const xgPerformance = ((totalGoals - totalXG) / totalXG) * 100;
      if (xgPerformance > 20) {
        insights.push({
          id: 'clinical_finishing',
          type: 'player',
          title: 'Clinical Finishing',
          description: `You're outperforming your Expected Goals by ${xgPerformance.toFixed(1)}%. Your finishing is exceptional - maintain this clinical edge!`,
          confidence: 92,
          actionable: false
        });
      } else if (xgPerformance < -20) {
        insights.push({
          id: 'improve_finishing',
          type: 'player',
          title: 'Work on Finishing',
          description: `You're underperforming your Expected Goals by ${Math.abs(xgPerformance).toFixed(1)}%. Focus on finishing drills and shot selection.`,
          confidence: 88,
          actionable: true
        });
      }
    }

    // Recent form analysis
    if (totalGames >= 5) {
      const recentGames = allGames.slice(-5);
      const recentWins = recentGames.filter(game => game.result === 'win').length;
      const recentForm = (recentWins / 5) * 100;
      
      if (recentForm >= 80) {
        insights.push({
          id: 'hot_streak',
          type: 'general',
          title: 'On Fire! 🔥',
          description: `You've won ${recentWins} of your last 5 games (${recentForm}% win rate). You're in excellent form - ride this momentum!`,
          confidence: 95,
          actionable: false
        });
      } else if (recentForm <= 20) {
        insights.push({
          id: 'form_slump',
          type: 'tactical',
          title: 'Break the Slump',
          description: `Only ${recentWins} wins in your last 5 games. Consider changing your formation or tactics to refresh your approach.`,
          confidence: 85,
          actionable: true
        });
      }
    }

    // Player performance insights
    const allPlayerStats = allGames.flatMap(game => game.playerStats || []);
    if (allPlayerStats.length > 0) {
      const topScorer = allPlayerStats.reduce((acc, player) => {
        const existing = acc.find(p => p.name === player.name);
        if (existing) {
          existing.goals += player.goals;
          existing.games += 1;
        } else {
          acc.push({ name: player.name, goals: player.goals, games: 1 });
        }
        return acc;
      }, [] as any[]).sort((a, b) => b.goals - a.goals)[0];

      if (topScorer && topScorer.goals > 0) {
        insights.push({
          id: 'top_performer',
          type: 'player',
          title: 'Star Player Identified',
          description: `${topScorer.name} is your top performer with ${topScorer.goals} goals in ${topScorer.games} games. Build your tactics around this key player!`,
          confidence: 90,
          actionable: true
        });
      }
    }

    // Time-based insights
    const gamesByTime = allGames.filter(game => game.time);
    if (gamesByTime.length >= 5) {
      const eveningGames = gamesByTime.filter(game => {
        const hour = parseInt(game.time!.split(':')[0]);
        return hour >= 18;
      });
      const eveningWinRate = eveningGames.length > 0 ? (eveningGames.filter(g => g.result === 'win').length / eveningGames.length) * 100 : 0;
      
      const morningGames = gamesByTime.filter(game => {
        const hour = parseInt(game.time!.split(':')[0]);
        return hour < 12;
      });
      const morningWinRate = morningGames.length > 0 ? (morningGames.filter(g => g.result === 'win').length / morningGames.length) * 100 : 0;

      if (eveningWinRate - morningWinRate > 20) {
        insights.push({
          id: 'evening_performer',
          type: 'general',
          title: 'Evening Warrior',
          description: `You perform ${(eveningWinRate - morningWinRate).toFixed(1)}% better in evening games. Schedule your key matches for later in the day!`,
          confidence: 80,
          actionable: true
        });
      } else if (morningWinRate - eveningWinRate > 20) {
        insights.push({
          id: 'morning_performer',
          type: 'general',
          title: 'Early Bird Advantage',
          description: `You perform ${(morningWinRate - eveningWinRate).toFixed(1)}% better in morning games. Consider playing your important matches earlier in the day!`,
          confidence: 80,
          actionable: true
        });
      }
    }

    return insights;
  };

  const insights = useMemo(() => generateInsights(), [weeks]);

  const handleRefreshInsights = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tactical': return <Target className="h-4 w-4" />;
      case 'player': return <Users className="h-4 w-4" />;
      case 'formation': return <TrendingUp className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'tactical': return 'bg-fifa-blue';
      case 'player': return 'bg-fifa-green';
      case 'formation': return 'bg-fifa-purple';
      default: return 'bg-fifa-gold';
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="lg:ml-64 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 lg:mb-8 gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold gradient-text mb-2">AI Insights</h1>
              <p className="text-gray-400 text-sm">AI-powered analysis for {activeAccount}</p>
            </div>
            <Button 
              onClick={handleRefreshInsights}
              disabled={isGenerating}
              className="bg-fifa-gradient hover:bg-fifa-blue/80 rounded-xl shadow-lg w-full sm:w-auto"
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Brain className="h-4 w-4 mr-2" />
              )}
              {isGenerating ? 'Analyzing...' : 'Refresh Insights'}
            </Button>
          </div>

          {insights.length === 0 ? (
            <Card className="glass-card rounded-2xl shadow-2xl border-0">
              <CardContent className="p-6 lg:p-8 text-center">
                <Brain className="h-16 w-16 text-fifa-blue mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-white mb-2">No Insights Available</h3>
                <p className="text-gray-400">Play at least one game to receive AI-powered insights about your performance.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 lg:gap-6">
              {insights.map((insight) => (
                <Card key={insight.id} className="glass-card rounded-2xl shadow-2xl border-0 hover:shadow-3xl transition-all duration-300 hover:scale-[1.02]">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`p-3 ${getTypeColor(insight.type)} rounded-xl shadow-lg flex-shrink-0`}>
                          {getTypeIcon(insight.type)}
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-white text-lg">{insight.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              {insight.confidence}% confidence
                            </span>
                          </div>
                        </div>
                      </div>
                      {insight.actionable && (
                        <Badge className="bg-fifa-green/20 text-fifa-green border-fifa-green rounded-xl flex-shrink-0">
                          Actionable
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 leading-relaxed">{insight.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Insights;
