import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAccountData } from '@/hooks/useAccountData';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Target, Trophy, Users, Calendar, BarChart3, Brain, Lightbulb, Zap } from 'lucide-react';
import StatCard from '@/components/StatCard';
import { generateEnhancedAIInsights } from '@/utils/enhancedAiInsights';
import { useState, useEffect } from 'react';
import XGAnalytics from '@/components/XGAnalytics';
import LowestRatedPlayers from '@/components/LowestRatedPlayers';
import PlayerConsistencyChart from '@/components/PlayerConsistencyChart';
import { Construction } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';


const Analytics = () => {
  const { weeks, activeAccount } = useAccountData();
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const completedWeeks = weeks.filter(week => week.isCompleted);
  const currentWeek = weeks.find(week => !week.isCompleted);
  const { currentTheme } = useTheme();

  useEffect(() => {
    if (completedWeeks.length > 0) {
      const insights = generateEnhancedAIInsights(completedWeeks, currentWeek);
      setAiInsights(insights);
    }
  }, [completedWeeks, currentWeek]);

  // Data processing remains the same...
  const weeklyData = completedWeeks.map(week => ({ /* ... */ }));
  const opponentSkillData = Array.from({ length: 10 }, (_, i) => { /* ... */ });
  const contextData = ['normal', 'rage_quit', 'extra_time', 'penalties', 'disconnect', 'hacker', 'free_win'].map(context => { /* ... */ });
  const totalGames = completedWeeks.reduce((sum, week) => sum + week.games.length, 0);
  const totalWins = completedWeeks.reduce((sum, week) => sum + week.totalWins, 0);
  const totalGoals = completedWeeks.reduce((sum, week) => sum + week.totalGoals, 0);
  const avgOpponentSkill = completedWeeks.length > 0 ? completedWeeks.reduce((sum, week) => sum + week.averageOpponentSkill, 0) / completedWeeks.length : 0;
  function getContextColor(context: string) { /* ... */ }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="lg:ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2"><span className="gradient-text">Performance Analytics</span></h1>
            <p className="text-gray-400">Detailed performance metrics and AI insights for {activeAccount}</p>
          </div>

          {completedWeeks.length === 0 ? (
            <Card className="glass-card rounded-2xl shadow-2xl border-0">
                {/* ... No Analytics Available card ... */}
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* ... StatCards ... */}
              </div>

              <Tabs defaultValue="performance" className="space-y-6">
                <TabsList className="glass-card rounded-2xl shadow-xl border-0 p-2">
                  <TabsTrigger value="performance" className="rounded-xl">Weekly Performance</TabsTrigger>
                  <TabsTrigger value="distribution" className="rounded-xl">Game Distribution</TabsTrigger>
                  <TabsTrigger value="trends" className="rounded-xl">Trends</TabsTrigger>
                  <TabsTrigger value="advanced" className="rounded-xl"><Zap className="h-4 w-4 mr-2" />Advanced</TabsTrigger>
                  <TabsTrigger value="ai-insights" className="rounded-xl"><Brain className="h-4 w-4 mr-2" />AI Insights</TabsTrigger>
                </TabsList>

                <TabsContent value="performance" className="space-y-6">
                    {/* ... existing performance content ... */}
                </TabsContent>

                <TabsContent value="distribution" className="space-y-6">
                    {/* ... existing distribution content ... */}
                </TabsContent>

                <TabsContent value="trends" className="space-y-6">
                    {/* ... existing trends content ... */}
                </TabsContent>

                <TabsContent value="advanced" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <XGAnalytics weeklyData={completedWeeks} />
                        <LowestRatedPlayers weeklyData={completedWeeks} />
                    </div>
                    <PlayerConsistencyChart weeklyData={completedWeeks} />
                    <Card style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
                                <Construction className="h-5 w-5 text-yellow-500" />
                                More Analytics Coming Soon...
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p style={{ color: currentTheme.colors.muted }}>
                                Features like Positional Importance, Efficiency vs. Possession Scatter Plot, and more are under development.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="ai-insights" className="space-y-6">
                    {/* ... existing AI insights content ... */}
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Analytics;
