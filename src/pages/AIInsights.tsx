
import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { WeeklyPerformance } from '@/types/futChampions';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Shield, 
  Zap, 
  RefreshCw,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Clock,
  Users,
  Activity
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

const AIInsights = () => {
  const { currentTheme } = useTheme();
  const [weeklyData] = useLocalStorage<WeeklyPerformance[]>('futChampions_weeks', []);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const generateInsights = () => {
    const totalGames = weeklyData.reduce((sum, week) => sum + week.games.length, 0);
    const totalWins = weeklyData.reduce((sum, week) => sum + week.totalWins, 0);
    const totalGoals = weeklyData.reduce((sum, week) => sum + week.totalGoals, 0);
    const totalConceded = weeklyData.reduce((sum, week) => sum + week.totalConceded, 0);
    const winRate = totalGames > 0 ? (totalWins / totalGames) * 100 : 0;
    const avgGoalsPerGame = totalGames > 0 ? totalGoals / totalGames : 0;
    const avgConcededPerGame = totalGames > 0 ? totalConceded / totalGames : 0;

    // Get recent games for trend analysis
    const recentGames = weeklyData
      .flatMap(week => week.games)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    const recentWins = recentGames.filter(game => game.result === 'win').length;
    const recentForm = recentGames.length > 0 ? (recentWins / recentGames.length) * 100 : 0;

    // Calculate game time patterns
    const gameTimes = weeklyData.flatMap(week => week.games).map(game => {
      const date = new Date(game.date);
      return date.getHours();
    });

    const peakHour = gameTimes.length > 0 ? 
      gameTimes.reduce((a, b, i, arr) => 
        arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
      ) : 0;

    const insights = [
      {
        id: 'performance-trend',
        type: recentForm > winRate ? 'positive' : recentForm < winRate ? 'negative' : 'neutral',
        title: recentForm > winRate ? 'Improving Form' : recentForm < winRate ? 'Declining Form' : 'Consistent Form',
        description: recentForm > winRate 
          ? `Your recent form (${recentForm.toFixed(0)}%) is ${(recentForm - winRate).toFixed(1)}% better than your overall win rate. Keep up the momentum!`
          : recentForm < winRate
          ? `Your recent form (${recentForm.toFixed(0)}%) is ${(winRate - recentForm).toFixed(1)}% below your overall average. Time to analyze what's changed.`
          : `Your recent form matches your overall performance. Consistent but room for improvement.`,
        icon: recentForm > winRate ? TrendingUp : recentForm < winRate ? TrendingDown : BarChart3,
        priority: 'high'
      },
      {
        id: 'scoring-analysis',
        type: avgGoalsPerGame > 2.5 ? 'positive' : avgGoalsPerGame < 1.5 ? 'negative' : 'neutral',
        title: avgGoalsPerGame > 2.5 ? 'Clinical Finishing' : avgGoalsPerGame < 1.5 ? 'Scoring Struggles' : 'Average Attack',
        description: avgGoalsPerGame > 2.5 
          ? `Excellent scoring rate of ${avgGoalsPerGame.toFixed(1)} goals per game. Your attacking play is clinical and effective.`
          : avgGoalsPerGame < 1.5
          ? `Scoring only ${avgGoalsPerGame.toFixed(1)} goals per game suggests you need to work on final third efficiency and shot selection.`
          : `Scoring ${avgGoalsPerGame.toFixed(1)} goals per game is decent but there's room for improvement in your attacking play.`,
        icon: Target,
        priority: 'high'
      },
      {
        id: 'defensive-analysis',
        type: avgConcededPerGame < 1.5 ? 'positive' : avgConcededPerGame > 2.5 ? 'negative' : 'neutral',
        title: avgConcededPerGame < 1.5 ? 'Solid Defense' : avgConcededPerGame > 2.5 ? 'Defensive Issues' : 'Average Defense',
        description: avgConcededPerGame < 1.5 
          ? `Excellent defensive record, conceding only ${avgConcededPerGame.toFixed(1)} goals per game. Your defensive shape is working well.`
          : avgConcededPerGame > 2.5
          ? `Conceding ${avgConcededPerGame.toFixed(1)} goals per game is too many. Focus on defensive positioning and pressure.`
          : `Conceding ${avgConcededPerGame.toFixed(1)} goals per game is acceptable but tightening up defensively could improve results.`,
        icon: Shield,
        priority: 'medium'
      },
      {
        id: 'time-analysis',
        type: 'neutral',
        title: 'Peak Performance Hours',
        description: `You play most of your games around ${peakHour}:00. Consider if this timing aligns with your energy levels and concentration.`,
        icon: Clock,
        priority: 'low'
      },
      {
        id: 'consistency-check',
        type: totalGames < 20 ? 'neutral' : winRate > 70 ? 'positive' : winRate < 50 ? 'negative' : 'neutral',
        title: totalGames < 20 ? 'Building Experience' : winRate > 70 ? 'Elite Performance' : winRate < 50 ? 'Needs Improvement' : 'Room to Grow',
        description: totalGames < 20 
          ? `With ${totalGames} games played, you're building experience. Focus on learning from each match and identifying patterns.`
          : winRate > 70
          ? `A ${winRate.toFixed(0)}% win rate over ${totalGames} games shows elite-level consistency. Maintain this standard!`
          : winRate < 50
          ? `A ${winRate.toFixed(0)}% win rate needs improvement. Analyze your losses to identify key areas for development.`
          : `${winRate.toFixed(0)}% win rate is solid but there's potential to reach the next level with tactical refinements.`,
        icon: Activity,
        priority: 'medium'
      },
      {
        id: 'tactical-insight',
        type: 'neutral',
        title: 'Formation Versatility',
        description: 'Consider experimenting with different formations based on your opponent\'s strengths and weaknesses. Tactical flexibility can be a game-changer.',
        icon: Users,
        priority: 'low'
      },
      {
        id: 'momentum-insight',
        type: totalGames > 5 ? 'positive' : 'neutral',
        title: 'Momentum Building',
        description: totalGames > 5 
          ? 'You\'re developing good gaming habits. Consistency in practice and analysis will continue to improve your performance.'
          : 'As you play more games, patterns will emerge that will help you identify areas for improvement.',
        icon: Zap,
        priority: 'low'
      },
      {
        id: 'player-development',
        type: 'positive',
        title: 'Squad Optimization',
        description: 'Regularly review your player statistics to identify your most effective players and formations for different situations.',
        icon: Users,
        priority: 'medium'
      }
    ];

    return insights;
  };

  const insights = generateInsights();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLastRefresh(new Date());
    setIsRefreshing(false);
  };

  const getInsightTypeColor = (type: string) => {
    switch (type) {
      case 'positive': return 'text-fifa-green';
      case 'negative': return 'text-fifa-red';
      case 'neutral': return 'text-fifa-blue';
      default: return 'text-fifa-blue';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive': return CheckCircle;
      case 'negative': return AlertTriangle;
      case 'neutral': return Lightbulb;
      default: return Lightbulb;
    }
  };

  const prioritizedInsights = insights.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="lg:ml-64 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
          {/* Header */}
          <div className="page-header flex items-center justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                AI Insights
              </h1>
              <p className="text-lg" style={{ color: currentTheme.colors.muted }}>
                Intelligent analysis and personalized recommendations for your FUT Champions performance
              </p>
            </div>
            <Button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="modern-button-primary"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Analyzing...' : 'Refresh Insights'}
            </Button>
          </div>

          {/* Insights Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="metric-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Brain className="h-8 w-8 text-fifa-blue" />
                  <div>
                    <p className="text-2xl font-bold text-white">{insights.length}</p>
                    <p className="text-sm text-gray-400">Total Insights</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="metric-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-fifa-green" />
                  <div>
                    <p className="text-2xl font-bold text-white">{insights.filter(i => i.type === 'positive').length}</p>
                    <p className="text-sm text-gray-400">Strengths</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="metric-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-8 w-8 text-fifa-red" />
                  <div>
                    <p className="text-2xl font-bold text-white">{insights.filter(i => i.type === 'negative').length}</p>
                    <p className="text-sm text-gray-400">Areas to Improve</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Insights List */}
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Performance Analysis
                </CardTitle>
                <div className="text-sm text-gray-400">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {prioritizedInsights.map((insight) => {
                const IconComponent = insight.icon;
                const TypeIcon = getInsightIcon(insight.type);
                
                return (
                  <div 
                    key={insight.id}
                    className="p-6 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/10"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-full bg-white/10`}>
                        <IconComponent className={`h-6 w-6 ${getInsightTypeColor(insight.type)}`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-bold text-lg">{insight.title}</h3>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              insight.priority === 'high' ? 'border-fifa-red text-fifa-red' :
                              insight.priority === 'medium' ? 'border-fifa-gold text-fifa-gold' :
                              'border-fifa-blue text-fifa-blue'
                            }`}
                          >
                            {insight.priority} priority
                          </Badge>
                          <TypeIcon className={`h-4 w-4 ${getInsightTypeColor(insight.type)}`} />
                        </div>
                        
                        <p className="text-gray-300 leading-relaxed">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* No Data State */}
          {weeklyData.length === 0 && (
            <Card className="glass-card">
              <CardContent className="text-center py-12">
                <Brain className="h-16 w-16 mx-auto mb-4 text-gray-400 opacity-50" />
                <h3 className="text-xl font-medium text-white mb-2">No Data Available</h3>
                <p className="text-gray-400 mb-6">
                  Start recording your FUT Champions games to get personalized AI insights and recommendations.
                </p>
                <Badge variant="outline" className="text-fifa-blue border-fifa-blue/30">
                  Record your first game to unlock insights
                </Badge>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default AIInsights;
