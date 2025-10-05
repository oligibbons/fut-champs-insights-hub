import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/hooks/useTheme';
import { useAccountData } from '@/hooks/useAccountData';
// Corrected the import to use the exported function name
import { EnhancedAIGenerateInsights, Insight } from '@/utils/aiInsights'; 
import {
  Brain,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Wand2,
  Loader2
} from 'lucide-react';

const AIInsights = () => {
  const { currentTheme } = useTheme();
  // Destructure currentAccount to use it later
  const { weeks, loading: dataLoading, currentAccount } = useAccountData(); 
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);

  const allGames = useMemo(() => weeks.flatMap(week => week.games), [weeks]);

  const handleGenerateInsights = async () => {
    setIsGenerating(true);
    setError(null);
    setInsights([]);

    try {
      const summary = generateSummaryForAI(allGames);
      // Corrected the function call
      const generatedInsights = await EnhancedAIGenerateInsights(summary);
      setInsights(generatedInsights);
      setLastGenerated(new Date());
    } catch (e) {
      console.error(e);
      setError("Failed to generate AI insights. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSummaryForAI = (games: any[]) => {
    const totalGames = games.length;
    const wins = games.filter(g => g.result === 'win').length;
    const losses = games.filter(g => g.result === 'loss').length;
    const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;

    const tagCounts = games
      .flatMap(game => game.tags || [])
      .reduce((acc: any, tag: string) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {});
      
    const sortedTags = Object.entries(tagCounts).sort(([, a]: any, [, b]: any) => b - a);

    let prompt = `
      Analyze the following FIFA/FC Champions performance data. Based on this data, identify 3 key strengths, 3 areas for improvement, and 2 notable opportunities or patterns.
      
      Overall Performance:
      - Total Games: ${totalGames}, Wins: ${wins}, Losses: ${losses}, Win Rate: ${winRate.toFixed(1)}%

      Most Frequent Match Tags:
      ${sortedTags.slice(0, 5).map(([tag, count]) => `- ${tag}: ${count} times`).join('\n')}

      Your task is to return a JSON array of insight objects. Each object must have the following properties: 'id' (a unique string), 'title' (a short, descriptive title), 'description' (a one-sentence explanation), 'category' ('strength', 'weakness', or 'opportunity'), and 'priority' ('high', 'medium', or 'low'). Be analytical and provide actionable feedback.
    `;
    return prompt;
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
      case 'strength': return 'text-green-500';
      case 'weakness': return 'text-red-500';
      case 'opportunity': return 'text-blue-500';
      default: return 'text-yellow-500';
    }
  };

  const prioritizedInsights = [...insights].sort((a, b) => {
    const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
    return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
  });
  
  const mostUsedTags = useMemo(() => {
    const tagCounts = allGames
      .flatMap(game => game.tags || [])
      .reduce((acc: any, tag: string) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {});
    return Object.entries(tagCounts).sort(([, a]: any, [, b]: any) => b - a).slice(0, 5);
  }, [allGames]);


  return (
    <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Wand2 className="h-8 w-8 text-primary" />
            AI-Powered Insights
          </h1>
          <p className="text-muted-foreground">Get personalized feedback on your performance based on your logged data.</p>
        </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate New Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-secondary/50 rounded-lg">
            <h4 className="font-semibold mb-2">Data Summary</h4>
            <div className="text-sm text-muted-foreground space-y-1">
                <p>Analyzing <span className="font-bold text-foreground">{allGames.length}</span> total games.</p>
                <div className="flex flex-wrap gap-2 items-center">
                    <p>Most used tags:</p>
                    {mostUsedTags.length > 0 ? mostUsedTags.map(([tag, count]) => (
                        <Badge key={tag as string} variant="secondary">{tag as string} ({count as number})</Badge>
                    )) : <p>No tags used yet.</p>}
                </div>
            </div>
          </div>
          <Button onClick={handleGenerateInsights} disabled={isGenerating || dataLoading || allGames.length < 5}>
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {isGenerating ? 'Analyzing...' : (allGames.length < 5 ? `Log ${5 - allGames.length} more games` : 'Generate Insights')}
          </Button>
            <p className="text-xs text-muted-foreground">
              Analysis is more accurate with more data. A minimum of 5 games is required.
            </p>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive/50">
          <CardContent className="p-4 flex items-center gap-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <div>
                <h4 className="font-semibold text-destructive">Analysis Failed</h4>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
          </CardContent>
        </Card>
      )}

      {insights.length > 0 && (
          <>
            {/* Insights Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Brain className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{insights.length}</p>
                      <p className="text-sm text-muted-foreground">Total Insights</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{insights.filter(i => i.category === 'strength').length}</p>
                      <p className="text-sm text-muted-foreground">Strengths</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                    <div>
                      <p className="text-2xl font-bold">{insights.filter(i => i.category === 'weakness').length}</p>
                      <p className="text-sm text-muted-foreground">Areas to Improve</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Insights List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Performance Analysis
                  </CardTitle>
                  {lastGenerated && <div className="text-sm text-muted-foreground">Last updated: {lastGenerated.toLocaleTimeString()}</div>}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {prioritizedInsights.map((insight) => {
                  const IconComponent = getInsightIcon(insight.category);
                  return (
                    <div key={insight.id} className="p-6 bg-secondary/50 rounded-xl hover:bg-secondary/80 transition-colors border border-border">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-full bg-foreground/10`}>
                          <IconComponent className={`h-6 w-6 ${getInsightTypeColor(insight.category)}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-lg text-foreground">{insight.title}</h3>
                            <Badge variant="outline" className={`text-xs ${
                              insight.priority === 'high' ? 'border-red-500/50 text-red-500' :
                              insight.priority === 'medium' ? 'border-yellow-500/50 text-yellow-500' :
                              'border-blue-500/50 text-blue-500'
                            }`}>
                              {insight.priority} priority
                            </Badge>
                          </div>
                          <p className="text-muted-foreground leading-relaxed">{insight.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </>
      )}

      {!isGenerating && insights.length === 0 && !error && allGames.length > 0 && (
         <Card>
           <CardContent className="text-center py-12">
            <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-medium mb-2">Ready for Analysis</h3>
            <p className="text-muted-foreground mb-6">
               Click the "Generate Insights" button to get your personalized performance breakdown.
             </p>
           </CardContent>
         </Card>
      )}
      
      {dataLoading && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-4 text-muted-foreground">Loading your data...</p>
        </div>
      )}

      {!dataLoading && allGames.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-medium mb-2">No Data Available</h3>
            <p className="text-muted-foreground">
              Start recording your FUT Champions games to get personalized AI insights.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIInsights;
