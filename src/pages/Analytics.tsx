import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAccountData } from '@/hooks/useAccountData';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, Target, Trophy, Users, Calendar, BarChart3, Brain, Lightbulb } from 'lucide-react';
import StatCard from '@/components/StatCard';
import { generateEnhancedAIInsights } from '@/utils/enhancedAiInsights';
import { useState, useEffect } from 'react';

const Analytics = () => {
  const { weeks, activeAccount } = useAccountData();
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const completedWeeks = weeks.filter(week => week.isCompleted);
  const currentWeek = weeks.find(week => !week.isCompleted);

  useEffect(() => {
    if (completedWeeks.length > 0) {
      const insights = generateEnhancedAIInsights(completedWeeks, currentWeek);
      setAiInsights(insights);
    }
  }, [completedWeeks, currentWeek]);

  // Weekly Performance Data
  const weeklyData = completedWeeks.map(week => ({
    week: `Week ${week.weekNumber}`,
    wins: week.totalWins,
    losses: week.totalLosses,
    goals: week.totalGoals,
    conceded: week.totalConceded,
    winRate: week.games.length > 0 ? (week.totalWins / week.games.length) * 100 : 0,
    goalDifference: week.totalGoals - week.totalConceded
  }));

  // Opponent Skill Distribution
  const opponentSkillData = Array.from({ length: 10 }, (_, i) => {
    const skill = i + 1;
    const count = completedWeeks.reduce((sum, week) => 
      sum + week.games.filter(game => game.opponentSkill === skill).length, 0
    );
    return { skill: `${skill}`, count, name: `Skill ${skill}` };
  }).filter(item => item.count > 0);

  // Game Context Distribution
  const gameContexts = ['normal', 'rage_quit', 'extra_time', 'penalties', 'disconnect', 'hacker', 'free_win'];
  const contextData = gameContexts.map(context => {
    const count = completedWeeks.reduce((sum, week) => 
      sum + week.games.filter(game => game.gameContext === context).length, 0
    );
    return { 
      name: context.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()), 
      value: count,
      color: getContextColor(context)
    };
  }).filter(item => item.value > 0);

  const totalGames = completedWeeks.reduce((sum, week) => sum + week.games.length, 0);
  const totalWins = completedWeeks.reduce((sum, week) => sum + week.totalWins, 0);
  const totalGoals = completedWeeks.reduce((sum, week) => sum + week.totalGoals, 0);
  const totalConceded = completedWeeks.reduce((sum, week) => sum + week.totalConceded, 0);
  const avgOpponentSkill = completedWeeks.length > 0 
    ? completedWeeks.reduce((sum, week) => sum + week.averageOpponentSkill, 0) / completedWeeks.length 
    : 0;

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

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="lg:ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold gradient-text mb-2">Performance Analytics</h1>
            <p className="text-gray-400">Detailed performance metrics and AI insights for {activeAccount}</p>
          </div>

          {completedWeeks.length === 0 ? (
            <Card className="glass-card rounded-2xl shadow-2xl border-0">
              <CardContent className="p-8 text-center">
                <BarChart3 className="h-16 w-16 text-fifa-blue mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-white mb-2">No Analytics Available</h3>
                <p className="text-gray-400">Complete at least one week to view performance analytics.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  title="Total Games"
                  value={totalGames}
                  icon={<Calendar className="h-5 w-5 text-fifa-blue" />}
                  className="rounded-2xl shadow-2xl border-0"
                />
                <StatCard
                  title="Win Rate"
                  value={`${totalGames > 0 ? ((totalWins / totalGames) * 100).toFixed(1) : 0}%`}
                  icon={<Trophy className="h-5 w-5 text-fifa-gold" />}
                  className="rounded-2xl shadow-2xl border-0"
                />
                <StatCard
                  title="Goals Scored"
                  value={totalGoals}
                  icon={<Target className="h-5 w-5 text-fifa-green" />}
                  className="rounded-2xl shadow-2xl border-0"
                />
                <StatCard
                  title="Avg Opponent Skill"
                  value={avgOpponentSkill.toFixed(1)}
                  icon={<Users className="h-5 w-5 text-fifa-purple" />}
                  className="rounded-2xl shadow-2xl border-0"
                />
              </div>

              <Tabs defaultValue="performance" className="space-y-6">
                <TabsList className="glass-card rounded-2xl shadow-xl border-0 p-2">
                  <TabsTrigger value="performance" className="rounded-xl">Weekly Performance</TabsTrigger>
                  <TabsTrigger value="distribution" className="rounded-xl">Game Distribution</TabsTrigger>
                  <TabsTrigger value="trends" className="rounded-xl">Trends</TabsTrigger>
                  <TabsTrigger value="ai-insights" className="rounded-xl">
                    <Brain className="h-4 w-4 mr-2" />
                    AI Insights
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="performance" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="glass-card rounded-2xl shadow-2xl border-0">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                          <TrendingUp className="h-5 w-5 text-fifa-blue" />
                          Weekly Win Rate
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={weeklyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="week" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                borderRadius: '12px'
                              }} 
                            />
                            <Bar dataKey="winRate" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card className="glass-card rounded-2xl shadow-2xl border-0">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                          <Target className="h-5 w-5 text-fifa-green" />
                          Goals vs Conceded
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={weeklyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="week" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                borderRadius: '12px'
                              }} 
                            />
                            <Line type="monotone" dataKey="goals" stroke="#10b981" strokeWidth={3} dot={{ r: 6 }} />
                            <Line type="monotone" dataKey="conceded" stroke="#ef4444" strokeWidth={3} dot={{ r: 6 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="distribution" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="glass-card rounded-2xl shadow-2xl border-0">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                          <Users className="h-5 w-5 text-fifa-purple" />
                          Opponent Skill Distribution
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={opponentSkillData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="skill" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                borderRadius: '12px'
                              }} 
                            />
                            <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card className="glass-card rounded-2xl shadow-2xl border-0">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
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
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                borderRadius: '12px'
                              }} 
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="trends" className="space-y-6">
                  <Card className="glass-card rounded-2xl shadow-2xl border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <TrendingUp className="h-5 w-5 text-fifa-blue" />
                        Goal Difference Trend
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={weeklyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="week" stroke="#9ca3af" />
                          <YAxis stroke="#9ca3af" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                              border: '1px solid rgba(59, 130, 246, 0.3)',
                              borderRadius: '12px'
                            }} 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="goalDifference" 
                            stroke="#fbbf24" 
                            strokeWidth={4} 
                            dot={{ r: 8, fill: '#fbbf24' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="ai-insights" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {aiInsights.length > 0 ? aiInsights.map((insight, index) => (
                      <Card key={insight.id} className="glass-card rounded-2xl shadow-2xl border-0">
                        <CardHeader>
                          <CardTitle className={`flex items-center gap-2 text-lg ${
                            insight.category === 'strength' ? 'text-fifa-green' :
                            insight.category === 'weakness' ? 'text-fifa-red' :
                            insight.category === 'opportunity' ? 'text-fifa-blue' :
                            'text-fifa-gold'
                          }`}>
                            {insight.category === 'strength' ? <Trophy className="h-5 w-5" /> :
                             insight.category === 'weakness' ? <Target className="h-5 w-5" /> :
                             insight.category === 'opportunity' ? <TrendingUp className="h-5 w-5" /> :
                             <Lightbulb className="h-5 w-5" />}
                            {insight.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-white">{insight.description}</p>
                          
                          <div className="p-3 bg-fifa-blue/10 border border-fifa-blue/20 rounded-xl">
                            <p className="text-fifa-blue font-medium text-sm mb-1">💡 Actionable Advice:</p>
                            <p className="text-white text-sm">{insight.actionableAdvice}</p>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                insight.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                insight.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-green-500/20 text-green-400'
                              }`}>
                                {insight.priority} priority
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                insight.type === 'performance' ? 'bg-blue-500/20 text-blue-400' :
                                insight.type === 'tactical' ? 'bg-purple-500/20 text-purple-400' :
                                insight.type === 'mental' ? 'bg-pink-500/20 text-pink-400' :
                                insight.type === 'technical' ? 'bg-orange-500/20 text-orange-400' :
                                'bg-gray-500/20 text-gray-400'
                              }`}>
                                {insight.type}
                              </span>
                            </div>
                            <span className="text-xs text-gray-400">{insight.confidence}% confidence</span>
                          </div>
                          
                          {insight.dataPoints && insight.dataPoints.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-xs text-gray-400">Data Points:</p>
                              {insight.dataPoints.map((point: string, idx: number) => (
                                <p key={idx} className="text-xs text-gray-300">• {point}</p>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )) : (
                      <Card className="glass-card rounded-2xl shadow-2xl border-0 col-span-2">
                        <CardContent className="text-center py-8">
                          <Brain className="h-16 w-16 mx-auto mb-4 text-gray-500" />
                          <h3 className="text-xl font-semibold text-white mb-2">Generating AI Insights</h3>
                          <p className="text-gray-400">AI insights will appear as you complete more weeks and games.</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
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
