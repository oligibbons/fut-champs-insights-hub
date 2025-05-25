
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
    const completedWeeks = weeks.filter(week => week.isCompleted);
    if (completedWeeks.length === 0) return [];

    const insights: Insight[] = [];
    const totalGames = completedWeeks.reduce((sum, week) => sum + week.games.length, 0);
    const totalWins = completedWeeks.reduce((sum, week) => sum + week.totalWins, 0);
    const totalGoals = completedWeeks.reduce((sum, week) => sum + week.totalGoals, 0);
    const totalConceded = completedWeeks.reduce((sum, week) => sum + week.totalConceded, 0);
    const avgOpponentSkill = completedWeeks.reduce((sum, week) => sum + week.averageOpponentSkill, 0) / completedWeeks.length;

    const winRate = totalGames > 0 ? (totalWins / totalGames) * 100 : 0;
    const goalRatio = totalConceded > 0 ? totalGoals / totalConceded : totalGoals;

    // Win Rate Analysis
    if (winRate < 40) {
      insights.push({
        id: '1',
        type: 'tactical',
        title: 'Focus on Defensive Stability',
        description: `Your current win rate is ${winRate.toFixed(1)}%. Consider switching to a more defensive formation like 5-3-2 or 4-2-3-1 to improve defensive solidity.`,
        confidence: 85,
        actionable: true
      });
    } else if (winRate > 70) {
      insights.push({
        id: '2',
        type: 'general',
        title: 'Excellent Performance!',
        description: `Your win rate of ${winRate.toFixed(1)}% is outstanding. You're playing at a high level consistently.`,
        confidence: 95,
        actionable: false
      });
    }

    // Goal Scoring Analysis
    if (goalRatio < 1) {
      insights.push({
        id: '3',
        type: 'tactical',
        title: 'Improve Attacking Play',
        description: `You're scoring ${goalRatio.toFixed(2)} goals for every goal conceded. Focus on creating more chances and clinical finishing.`,
        confidence: 80,
        actionable: true
      });
    }

    // Opponent Skill Analysis
    if (avgOpponentSkill > 7) {
      insights.push({
        id: '4',
        type: 'general',
        title: 'Playing Strong Opposition',
        description: `Your average opponent skill level is ${avgOpponentSkill.toFixed(1)}/10. You're consistently facing skilled players, which will improve your game.`,
        confidence: 90,
        actionable: false
      });
    }

    // Weekly Consistency
    const weeklyWinRates = completedWeeks.map(week => 
      week.games.length > 0 ? (week.totalWins / week.games.length) * 100 : 0
    );
    const variance = weeklyWinRates.reduce((sum, rate) => sum + Math.pow(rate - winRate, 2), 0) / weeklyWinRates.length;
    
    if (variance > 400) {
      insights.push({
        id: '5',
        type: 'general',
        title: 'Inconsistent Performance',
        description: 'Your performance varies significantly between weeks. Try to maintain consistent training and preparation routines.',
        confidence: 75,
        actionable: true
      });
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
      
      <main className="lg:ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-2">AI Insights</h1>
              <p className="text-gray-400">AI-powered analysis for {activeAccount}</p>
            </div>
            <Button 
              onClick={handleRefreshInsights}
              disabled={isGenerating}
              className="bg-fifa-gradient hover:bg-fifa-blue/80 rounded-xl shadow-lg"
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
              <CardContent className="p-8 text-center">
                <Brain className="h-16 w-16 text-fifa-blue mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-white mb-2">No Insights Available</h3>
                <p className="text-gray-400">Complete at least one week to receive AI-powered insights.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {insights.map((insight) => (
                <Card key={insight.id} className="glass-card rounded-2xl shadow-2xl border-0 hover:shadow-3xl transition-all duration-300 hover:scale-[1.02]">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 ${getTypeColor(insight.type)} rounded-xl shadow-lg`}>
                          {getTypeIcon(insight.type)}
                        </div>
                        <div>
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
                        <Badge className="bg-fifa-green/20 text-fifa-green border-fifa-green rounded-xl">
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
