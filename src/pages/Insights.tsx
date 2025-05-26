
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
    // Get all games, not just from completed weeks
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

    // Get player performances
    const allPlayerPerformances = allGames.flatMap(game => game.playerStats || []);
    const topScorers = allPlayerPerformances.reduce((acc, perf) => {
      const existing = acc.find(p => p.name === perf.name);
      if (existing) {
        existing.goals += perf.goals;
        existing.games += 1;
      } else {
        acc.push({ name: perf.name, goals: perf.goals, games: 1 });
      }
      return acc;
    }, [] as any[]).sort((a, b) => b.goals - a.goals);

    // Single game insights
    if (totalGames === 1) {
      const game = allGames[0];
      if (game.result === 'win') {
        insights.push({
          id: '1',
          type: 'general',
          title: 'Great Start!',
          description: `Excellent first game! You won ${game.scoreLine} against a ${game.opponentSkill}/10 rated opponent.`,
          confidence: 90,
          actionable: false
        });
      } else {
        insights.push({
          id: '2',
          type: 'tactical',
          title: 'Learning Opportunity',
          description: `First game was tough, but every loss is a chance to improve. Consider analyzing what went wrong in the ${game.scoreLine} result.`,
          confidence: 85,
          actionable: true
        });
      }
    }

    // Win Rate Analysis (for 2+ games)
    if (totalGames >= 2) {
      if (winRate < 40) {
        insights.push({
          id: '3',
          type: 'tactical',
          title: 'Focus on Defensive Stability',
          description: `Your current win rate is ${winRate.toFixed(1)}%. Consider switching to a more defensive formation like 5-3-2 or 4-2-3-1 to improve defensive solidity.`,
          confidence: 85,
          actionable: true
        });
      } else if (winRate > 70) {
        insights.push({
          id: '4',
          type: 'general',
          title: 'Excellent Performance!',
          description: `Your win rate of ${winRate.toFixed(1)}% is outstanding. You're playing at a high level consistently.`,
          confidence: 95,
          actionable: false
        });
      }
    }

    // Goal Scoring Analysis
    if (totalGames >= 3) {
      if (goalRatio < 1) {
        insights.push({
          id: '5',
          type: 'tactical',
          title: 'Improve Attacking Play',
          description: `You're scoring ${goalRatio.toFixed(2)} goals for every goal conceded. Focus on creating more chances and clinical finishing.`,
          confidence: 80,
          actionable: true
        });
      }
    }

    // Player Performance Insights
    if (topScorers.length > 0 && topScorers[0].goals > 0) {
      insights.push({
        id: '6',
        type: 'player',
        title: 'Top Scorer Identified',
        description: `${topScorers[0].name} is your key player with ${topScorers[0].goals} goals in ${topScorers[0].games} games. Build your tactics around them!`,
        confidence: 90,
        actionable: true
      });
    }

    // Opponent Skill Analysis
    if (avgOpponentSkill > 7) {
      insights.push({
        id: '7',
        type: 'general',
        title: 'Playing Strong Opposition',
        description: `Your average opponent skill level is ${avgOpponentSkill.toFixed(1)}/10. You're consistently facing skilled players, which will improve your game.`,
        confidence: 90,
        actionable: false
      });
    }

    // Recent form analysis (last 5 games)
    if (totalGames >= 5) {
      const recentGames = allGames.slice(-5);
      const recentWins = recentGames.filter(game => game.result === 'win').length;
      const recentForm = (recentWins / 5) * 100;
      
      if (recentForm < 40) {
        insights.push({
          id: '8',
          type: 'tactical',
          title: 'Poor Recent Form',
          description: `You've won only ${recentWins} of your last 5 games. Consider changing formation or adjusting tactics.`,
          confidence: 85,
          actionable: true
        });
      } else if (recentForm > 60) {
        insights.push({
          id: '9',
          type: 'general',
          title: 'Hot Streak!',
          description: `You're in great form with ${recentWins} wins in your last 5 games. Keep up the momentum!`,
          confidence: 90,
          actionable: false
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
                <p className="text-gray-400">Play at least one game to receive AI-powered insights.</p>
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
