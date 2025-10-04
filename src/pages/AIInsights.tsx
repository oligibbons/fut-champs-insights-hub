import { useState, useEffect } from 'react';
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
import { useAccountData } from '@/hooks/useAccountData'; // Import the correct hook
import { generateEnhancedAIInsights } from '@/utils/enhancedAiInsights'; // Import the AI engine

const AIInsights = () => {
  const { currentTheme } = useTheme();
  const { weeks, loading } = useAccountData(); // Use the hook to get filtered data
  const [insights, setInsights] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    if (!loading && weeks) {
      const generated = generateEnhancedAIInsights(weeks);
      setInsights(generated);
    }
  }, [loading, weeks]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate AI processing time and regenerate insights
    await new Promise(resolve => setTimeout(resolve, 1500));
    const generated = generateEnhancedAIInsights(weeks);
    setInsights(generated);
    setLastRefresh(new Date());
    setIsRefreshing(false);
  };

  const getInsightIcon = (category: string) => {
    switch (category) {
      case 'strength': return CheckCircle;
      case 'weakness': return AlertTriangle;
      case 'opportunity': return TrendingUp;
      default: return Lightbulb;
    }
  };

  const getInsightTypeColor = (category: string) => {
    switch (category) {
      case 'strength': return 'text-fifa-green';
      case 'weakness': return 'text-fifa-red';
      case 'opportunity': return 'text-fifa-blue';
      default: return 'text-fifa-gold';
    }
  };

  const prioritizedInsights = [...insights].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
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
                {/* FIX: Applied gradient-text to a span inside the h1 */}
                <span className="gradient-text">AI Insights</span>
              </h1>
              <p className="text-lg" style={{ color: currentTheme.colors.muted }}>
                Intelligent analysis and personalized recommendations
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

          {loading ? (
             <div className="flex justify-center items-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin" />
             </div>
          ) : insights.length > 0 ? (
            <>
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
                        <p className="text-2xl font-bold text-white">{insights.filter(i => i.category === 'strength').length}</p>
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
                        <p className="text-2xl font-bold text-white">{insights.filter(i => i.category === 'weakness').length}</p>
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
                    const IconComponent = getInsightIcon(insight.category);
                    
                    return (
                      <div 
                        key={insight.id}
                        className="p-6 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/10"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-full bg-white/10`}>
                            <IconComponent className={`h-6 w-6 ${getInsightTypeColor(insight.category)}`} />
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
            </>
          ) : (
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
