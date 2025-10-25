import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAccountData } from '@/hooks/useAccountData';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, Target, Trophy, Users, Calendar, BarChart3, Brain, Zap, Construction } from 'lucide-react';
import StatCard from '@/components/StatCard';
import { generateEnhancedAIInsights } from '@/utils/enhancedAiInsights';
import { useState, useEffect } from 'react';
import XGAnalytics from '@/components/XGAnalytics';
import LowestRatedPlayers from '@/components/LowestRatedPlayers';
import PlayerConsistencyChart from '@/components/PlayerConsistencyChart';
import { useTheme } from '@/hooks/useTheme';

const Analytics = () => {
  // --- FIX IS ON THIS LINE ---
  const { weeks = [], activeAccount } = useAccountData() || {};
  // --- END FIX ---
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

  // --- Data processing (restored from AnalyticsDashboard) ---
  const allTimeStats = {
    totalGames: completedWeeks.reduce((sum, week) => sum + week.games.length, 0),
    totalWins: completedWeeks.reduce((sum, week) => sum + week.totalWins, 0),
    totalGoals: completedWeeks.reduce((sum, week) => sum + week.totalGoals, 0),
    totalConceded: completedWeeks.reduce((sum, week) => sum + week.totalConceded, 0),
    avgOpponentSkill: completedWeeks.length > 0
      ? completedWeeks.reduce((sum, week) => sum + week.averageOpponentSkill, 0) / completedWeeks.length
      : 0
  };

  const weeklyData = completedWeeks.map(week => ({
    week: `W${week.weekNumber}`,
    winRate: week.games.length > 0 ? (week.totalWins / week.games.length) * 100 : 0,
    goalsPerGame: week.games.length > 0 ? week.totalGoals / week.games.length : 0,
    concededPerGame: week.games.length > 0 ? week.totalConceded / week.games.length : 0,
  }));

  const opponentSkillData = Array.from({ length: 10 }, (_, i) => {
    const skill = i + 1;
    const games = weeks.flatMap(week => week.games).filter(game => game.opponentSkill === skill);
    const wins = games.filter(game => game.result === 'win').length;
    return {
      skill: skill.toString(),
      games: games.length,
      winRate: games.length > 0 ? (wins / games.length) * 100 : 0,
    };
  }).filter(item => item.games > 0);

  const gameContexts = weeks.flatMap(week => week.games).reduce((acc: any, game) => {
    acc[game.gameContext] = (acc[game.gameContext] || 0) + 1;
    return acc;
  }, {});

  const contextData = Object.entries(gameContexts).map(([context, count]) => ({
    name: context.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: count as number,
    color: getContextColor(context)
  }));
  
  const goalTrends = completedWeeks.slice(-10).map(week => ({
    week: `W${week.weekNumber}`,
    goalsFor: week.totalGoals,
    goalsAgainst: week.totalConceded,
  }));

  function getContextColor(context: string) {
    const colors = {
      normal: '#3b82f6',
      rage_quit: '#ef4444',
      extra_time: '#f59e0b',
      penalties: '#8b5cf6',
      disconnect: '#6b7280',
      hacker: '#dc2626',
      free_win: '#10b981'
    };
    return colors[context as keyof typeof colors] || '#6b7280';
  }
  // --- End data processing ---

  return (
    <div className="space-y-8">
      {/* --- New Page Header (matches Index.tsx) --- */}
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shadow-md">
          <BarChart3 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Performance Analytics</h1>
          <p style={{ color: currentTheme.colors.muted }}>
            {activeAccount ? `Detailed metrics and AI insights for ${activeAccount}` : "Detailed performance metrics and AI insights"}
          </p>
        </div>
      </div>

      {completedWeeks.length === 0 ? (
        // --- No Analytics Card (Updated Style) ---
        <Card className="glass-card rounded-2xl shadow-2xl border-0">
          <CardContent className="p-8 text-center">
            <BarChart3 className="h-16 w-16 text-primary/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Analytics Available</h3>
            <p className="text-muted-foreground">
              Complete at least one FUT Champions run to view your performance analytics.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* --- Stat Cards (Updated to use StatCard component) --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Games" value={allTimeStats.totalGames.toString()} icon={<Calendar className="h-5 w-5" />} />
            <StatCard title="Win Rate" value={`${allTimeStats.totalGames > 0 ? ((allTimeStats.totalWins / allTimeStats.totalGames) * 100).toFixed(1) : 0}%`} icon={<Trophy className="h-5 w-5" />} />
            <StatCard title="Goal Diff" value={`${allTimeStats.totalGoals - allTimeStats.totalConceded > 0 ? '+' : ''}${allTimeStats.totalGoals - allTimeStats.totalConceded}`} icon={<Target className="h-5 w-5" />} />
            <StatCard title="Avg. Opponent" value={allTimeStats.avgOpponentSkill.toFixed(1)} icon={<Users className="h-5 w-5" />} />
          </div>

          {/* --- Tabs (Full Width, Responsive) --- */}
          <Tabs defaultValue="performance" className="space-y-6">
            <TabsList className="glass-card rounded-2xl shadow-xl border-0 p-2 h-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              <TabsTrigger value="performance" className="tabs-trigger-style rounded-xl">Weekly Performance</TabsTrigger>
              <TabsTrigger value="distribution" className="tabs-trigger-style rounded-xl">Game Distribution</TabsTrigger>
              <TabsTrigger value="trends" className="tabs-trigger-style rounded-xl">Trends</TabsTrigger>
              <TabsTrigger value="advanced" className="tabs-trigger-style rounded-xl flex gap-2 items-center justify-center"><Zap className="h-4 w-4" />Advanced</TabsTrigger>
              <TabsTrigger value="ai-insights" className="tabs-trigger-style rounded-xl flex gap-2 items-center justify-center"><Brain className="h-4 w-4" />AI Insights</TabsTrigger>
            </TabsList>

            {/* --- Weekly Performance Tab --- */}
            <TabsContent value="performance" className="space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Weekly Win Rate Progression
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="week" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" domain={[0, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '12px' }} />
                      <Area type="monotone" dataKey="winRate" strokeWidth={2} stroke={currentTheme.colors.primary} fill={currentTheme.colors.primary} fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- Game Distribution Tab --- */}
            <TabsContent value="distribution" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Performance vs Opponent Skill
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={opponentSkillData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="skill" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '12px' }} />
                      <Bar dataKey="winRate" fill={currentTheme.colors.primary} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-primary" />
                    Game Context Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={contextData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        stroke={currentTheme.colors.cardBg}
                      >
                        {contextData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- Trends Tab --- */}
            <TabsContent value="trends" className="space-y-6">
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Target className="h-5 w-5 text-primary" />
                            Goal Trends
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={goalTrends}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="week" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '12px' }} />
                                <Line type="monotone" dataKey="goalsFor" stroke="#10b981" strokeWidth={3} />
                                <Line type="monotone" dataKey="goalsAgainst" stroke="#ef4444" strokeWidth={3} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* --- Advanced Tab --- */}
            <TabsContent value="advanced" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <XGAnalytics weeklyData={completedWeeks} />
                <LowestRatedPlayers weeklyData={completedWeeks} />
              </div>
              <PlayerConsistencyChart weeklyData={completedWeeks} />
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Construction className="h-5 w-5 text-yellow-500" />
                    More Analytics Coming Soon...
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Features like Positional Importance, Efficiency vs. Possession Scatter Plot, and more are under development.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- AI Insights Tab --- */}
            <TabsContent value="ai-insights" className="space-y-6">
              {aiInsights.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {aiInsights.map((insight) => (
                    <Card key={insight.id} className="glass-card">
                      <CardHeader>
                        <CardTitle className={`text-sm flex items-center gap-2 ${
                          insight.category === 'strength' ? 'text-fifa-green' :
                          insight.category === 'weakness' ? 'text-fifa-red' :
                          insight.category === 'opportunity' ? 'text-fifa-blue' :
                          'text-fifa-gold'
                        }`}>
                          <Brain className="h-4 w-4" />
                          {insight.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-white text-sm mb-3">{insight.description}</p>
                        {insight.actionableAdvice && (
                          <div className="p-2 rounded bg-white/5 mb-3 text-sm text-gray-300">
                            <strong className="text-primary">Advice:</strong> {insight.actionableAdvice}
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                                insight.priority === 'low' ? 'bg-green-500/20 text-green-400' :
                                insight.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                            }`}>
                                {insight.priority} priority
                            </span>
                            <span className="text-xs text-gray-400">{insight.confidence}% confidence</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="glass-card">
                  <CardContent className="p-8 text-center">
                    <Brain className="h-16 w-16 text-primary/50 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No AI Insights Yet</h3>
                    <p className="text-muted-foreground">
                      Play a few more games for the AI to analyze your performance patterns.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default Analytics;
