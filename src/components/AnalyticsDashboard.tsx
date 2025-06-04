
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAccountData } from '@/hooks/useAccountData';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, Target, Trophy, Users, Calendar, BarChart3, Brain, Lightbulb, TrendingDown } from 'lucide-react';
import { generateAIInsights } from '@/utils/aiInsights';
import { useState, useEffect } from 'react';

const AnalyticsDashboard = () => {
  const { weeks, activeAccount } = useAccountData();
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const completedWeeks = weeks.filter(week => week.isCompleted);
  const currentWeek = weeks.find(week => !week.isCompleted);
  const recentGames = weeks.flatMap(week => week.games).slice(-10);

  useEffect(() => {
    if (completedWeeks.length > 0) {
      const insights = generateAIInsights(completedWeeks, currentWeek, recentGames);
      setAiInsights(insights);
    }
  }, [completedWeeks, currentWeek, recentGames]);

  // Calculate comprehensive stats
  const allTimeStats = {
    totalGames: completedWeeks.reduce((sum, week) => sum + week.games.length, 0),
    totalWins: completedWeeks.reduce((sum, week) => sum + week.totalWins, 0),
    totalGoals: completedWeeks.reduce((sum, week) => sum + week.totalGoals, 0),
    totalConceded: completedWeeks.reduce((sum, week) => sum + week.totalConceded, 0),
    avgOpponentSkill: completedWeeks.length > 0 
      ? completedWeeks.reduce((sum, week) => sum + week.averageOpponentSkill, 0) / completedWeeks.length 
      : 0
  };

  // Weekly progression data
  const weeklyProgression = completedWeeks.map(week => ({
    week: `W${week.weekNumber}`,
    winRate: week.games.length > 0 ? (week.totalWins / week.games.length) * 100 : 0,
    goals: week.totalGoals,
    conceded: week.totalConceded,
    goalDiff: week.totalGoals - week.totalConceded,
    avgOpponentSkill: week.averageOpponentSkill
  }));

  // Game context distribution
  const gameContexts = weeks.flatMap(week => week.games).reduce((acc: any, game) => {
    acc[game.gameContext] = (acc[game.gameContext] || 0) + 1;
    return acc;
  }, {});

  const contextData = Object.entries(gameContexts).map(([context, count]) => ({
    name: context.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: count as number,
    color: getContextColor(context)
  }));

  // Performance by opponent skill
  const skillPerformance = Array.from({ length: 10 }, (_, i) => {
    const skill = i + 1;
    const games = weeks.flatMap(week => week.games).filter(game => game.opponentSkill === skill);
    const wins = games.filter(game => game.result === 'win').length;
    return {
      skill: skill.toString(),
      games: games.length,
      winRate: games.length > 0 ? (wins / games.length) * 100 : 0,
      avgGoals: games.length > 0 ? games.reduce((sum, game) => {
        const [goals] = game.scoreLine.split('-').map(Number);
        return sum + goals;
      }, 0) / games.length : 0
    };
  }).filter(item => item.games > 0);

  // Goal scoring trends
  const goalTrends = completedWeeks.slice(-10).map(week => ({
    week: `W${week.weekNumber}`,
    goalsFor: week.totalGoals,
    goalsAgainst: week.totalConceded,
    avgPerGame: week.games.length > 0 ? week.totalGoals / week.games.length : 0
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

  const getTips = () => {
    const tips = [];
    const winRate = allTimeStats.totalGames > 0 ? (allTimeStats.totalWins / allTimeStats.totalGames) * 100 : 0;
    const avgGoalsPerGame = allTimeStats.totalGames > 0 ? allTimeStats.totalGoals / allTimeStats.totalGames : 0;
    const avgConcededPerGame = allTimeStats.totalGames > 0 ? allTimeStats.totalConceded / allTimeStats.totalGames : 0;

    // Performance-based tips
    if (winRate < 50) {
      tips.push({
        type: 'improvement',
        title: 'Focus on Consistency',
        content: 'Your win rate is below 50%. Try practicing in Division Rivals before jumping into Champions.',
        icon: <Target className="h-5 w-5 text-fifa-blue" />
      });
    }

    if (avgGoalsPerGame < 1.5) {
      tips.push({
        type: 'attacking',
        title: 'Improve Your Attack',
        content: 'You\'re averaging fewer than 1.5 goals per game. Work on your finishing and chance creation.',
        icon: <TrendingUp className="h-5 w-5 text-fifa-green" />
      });
    }

    if (avgConcededPerGame > 2) {
      tips.push({
        type: 'defensive',
        title: 'Tighten Your Defense',
        content: 'You\'re conceding too many goals. Focus on defensive positioning and manual defending.',
        icon: <TrendingDown className="h-5 w-5 text-fifa-red" />
      });
    }

    // AI-based tips from insights
    aiInsights.slice(0, 3).forEach(insight => {
      if (insight.actionable) {
        tips.push({
          type: 'ai',
          title: insight.title,
          content: insight.description,
          icon: <Brain className="h-5 w-5 text-fifa-purple" />
        });
      }
    });

    // General tips
    tips.push(
      {
        type: 'general',
        title: 'Stay Calm Under Pressure',
        content: 'Take breaks between games, especially after losses. Mental state heavily impacts performance.',
        icon: <Lightbulb className="h-5 w-5 text-fifa-gold" />
      },
      {
        type: 'general',
        title: 'Analyze Your Games',
        content: 'Review your gameplay recordings to identify patterns in goals conceded and missed chances.',
        icon: <BarChart3 className="h-5 w-5 text-fifa-blue" />
      }
    );

    return tips;
  };

  if (completedWeeks.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="p-8 text-center">
          <BarChart3 className="h-16 w-16 text-fifa-blue mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-white mb-2">No Analytics Available</h3>
          <p className="text-gray-400">Complete at least one week to view detailed analytics.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Games</p>
                <p className="text-2xl font-bold text-white">{allTimeStats.totalGames}</p>
              </div>
              <Calendar className="h-8 w-8 text-fifa-blue" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Win Rate</p>
                <p className="text-2xl font-bold text-fifa-gold">
                  {allTimeStats.totalGames > 0 ? ((allTimeStats.totalWins / allTimeStats.totalGames) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <Trophy className="h-8 w-8 text-fifa-gold" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Goal Difference</p>
                <p className={`text-2xl font-bold ${allTimeStats.totalGoals - allTimeStats.totalConceded >= 0 ? 'text-fifa-green' : 'text-fifa-red'}`}>
                  {allTimeStats.totalGoals - allTimeStats.totalConceded > 0 ? '+' : ''}{allTimeStats.totalGoals - allTimeStats.totalConceded}
                </p>
              </div>
              <Target className="h-8 w-8 text-fifa-green" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Avg Opposition</p>
                <p className="text-2xl font-bold text-fifa-purple">{allTimeStats.avgOpponentSkill.toFixed(1)}</p>
              </div>
              <Users className="h-8 w-8 text-fifa-purple" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="charts" className="space-y-6">
        <TabsList className="glass-card">
          <TabsTrigger value="charts">Performance Charts</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="tips">Tips & Tricks</TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Win Rate Progression */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-fifa-blue" />
                  Weekly Win Rate Progression
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={weeklyProgression}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="week" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="winRate" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Goal Trends */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-fifa-green" />
                  Goal Scoring Trends
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

            {/* Performance vs Opponent Skill */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-fifa-purple" />
                  Performance vs Opponent Skill
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={skillPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="skill" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '12px' }} />
                    <Bar dataKey="winRate" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Game Context Distribution */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-fifa-gold" />
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
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aiInsights.length > 0 ? aiInsights.map((insight, index) => (
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
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      insight.severity === 'low' ? 'bg-green-500/20 text-green-400' :
                      insight.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {insight.priority} priority
                    </span>
                    <span className="text-xs text-gray-400">{insight.confidence}% confidence</span>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <Card className="glass-card col-span-2">
                <CardContent className="text-center py-8">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                  <p className="text-gray-400">AI insights will appear as you play more games.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tips" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {getTips().map((tip, index) => (
              <Card key={index} className="glass-card">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2 text-lg">
                    {tip.icon}
                    {tip.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">{tip.content}</p>
                  <div className="mt-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      tip.type === 'improvement' ? 'bg-red-500/20 text-red-400' :
                      tip.type === 'attacking' ? 'bg-green-500/20 text-green-400' :
                      tip.type === 'defensive' ? 'bg-blue-500/20 text-blue-400' :
                      tip.type === 'ai' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {tip.type === 'ai' ? 'AI Insight' : tip.type}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
