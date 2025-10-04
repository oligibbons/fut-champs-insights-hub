import { useState, useEffect } from 'react';
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { generateEnhancedAIInsights } from "@/utils/enhancedAiInsights";
import { AIInsight } from "@/types/futChampions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Lightbulb, TrendingUp, ShieldAlert, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const AIInsightsPage = () => {
  const { weeklyData, loading } = useSupabaseData();
  const [insights, setInsights] = useState<AIInsight[]>([]);

  useEffect(() => {
    if (!loading && weeklyData) {
      const generatedInsights = generateEnhancedAIInsights(weeklyData);
      setInsights(generatedInsights);
    }
  }, [loading, weeklyData]);

  const getInsightIcon = (category: AIInsight['category']) => {
    switch (category) {
      case 'strength': return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'weakness': return <ShieldAlert className="h-6 w-6 text-destructive" />;
      case 'opportunity': return <TrendingUp className="h-6 w-6 text-blue-500" />;
      default: return <Lightbulb className="h-6 w-6 text-yellow-500" />;
    }
  };
  
  const getPriorityVariant = (priority: AIInsight['priority']) => {
      switch (priority) {
          case 'high': return 'destructive';
          case 'medium': return 'secondary';
          default: return 'outline';
      }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold tracking-tight">AI-Powered Insights</h1>
        <p className="text-muted-foreground">Personalized analysis of your gameplay patterns.</p>
      </div>

      {insights.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {insights.map(insight => (
            <Card key={insight.id} className="flex flex-col">
              <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                  <div className="flex-shrink-0 pt-1">{getInsightIcon(insight.category)}</div>
                  <div className="flex-1">
                      <CardTitle>{insight.title}</CardTitle>
                      <CardDescription className="line-clamp-3 mt-1">{insight.description}</CardDescription>
                  </div>
              </CardHeader>
              <CardContent className="mt-auto flex justify-end">
                  <Badge variant={getPriorityVariant(insight.priority)} className="capitalize">{insight.priority} Priority</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
            <CardHeader>
                <CardTitle>No Insights Yet</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Play a few more games to generate your first AI insights.</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIInsightsPage;
