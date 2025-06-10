import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WeeklyPerformance, PlayerPerformance } from '@/types/futChampions';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Users, 
  Zap, 
  Shield,
  BarChart3,
  Activity,
  Lightbulb
} from 'lucide-react';
import { useState } from 'react';

interface AdvancedAnalyticsProps {
  weeklyData: WeeklyPerformance[];
  currentWeek: WeeklyPerformance | null;
}

const AdvancedAnalytics = ({ weeklyData, currentWeek }: AdvancedAnalyticsProps) => {
  const [activeTab, setActiveTab] = useState<'performance' | 'players' | 'patterns' | 'predictions'>('performance');
  
  // Calculate comprehensive stats
  const allGames = weeklyData.flatMap(week => week.games);
  const allPlayerPerformances = allGames.flatMap(game => game.playerStats || []);
  const totalMinutes = allGames.reduce((sum, game) => sum + game.duration, 0);

  // Performance over time data
  const performanceOverTime = weeklyData.map(week => ({
    week: `W${week.weekNumber}`,
    winRate: week.games.length > 0 ? (week.totalWins / week.games.length) * 100 : 0,
    avgGoalsFor: week.games.length > 0 ? week.totalGoals / week.games.length : 0,
    avgGoalsAgainst: week.games.length > 0 ? week.totalConceded / week.games.length : 0,
    avgOpponentSkill: week.averageOpponentSkill || 5,
    games: week.games.length
  }));

  // Time analysis data
  const timeAnalysis = allGames.map(game => ({
    game: `G${game.gameNumber}`,
    duration: game.duration,
    actualTime: game.actualGameTime || game.duration,
    pauseTime: (game.duration - (game.actualGameTime || game.duration)),
    stress: game.stressLevel || 5,
    result: game.result
  }));

  // Player consistency analysis
  const getPlayerConsistency = () => {
    const playerStats = allPlayerPerformances.reduce((acc, perf) => {
      if (!acc[perf.name]) {
        acc[perf.name] = {
          name: perf.name,
          position: perf.position,
          ratings: [],
          goals: 0,
          assists: 0,
          games: 0,
          totalMinutes: 0
        };
      }
      
      acc[perf.name].ratings.push(perf.rating);
      acc[perf.name].goals += perf.goals;
      acc[perf.name].assists += perf.assists;
      acc[perf.name].games += 1;
      acc[perf.name].totalMinutes += perf.minutesPlayed;
      return acc;
    }, {} as any);

    return Object.values(playerStats).map((player: any) => {
      const avgRating = player.ratings.reduce((sum: number, rating: number) => sum + rating, 0) / player.ratings.length;
      const variance = player.ratings.reduce((sum: number, rating: number) => sum + Math.pow(rating - avgRating, 2), 0) / player.ratings.length;
      const consistency = Math.max(0, 100 - (variance * 10)); // Convert variance to consistency score

      return {
        ...player,
        avgRating: Number(avgRating.toFixed(1)),
        consistency: Number(consistency.toFixed(1)),
        goalsPer90: player.totalMinutes > 0 ? Number(((player.goals / player.totalMinutes) * 90).toFixed(2)) : 0,
        assistsPer90: player.totalMinutes > 0 ? Number(((player.assists / player.totalMinutes) * 90).toFixed(2)) : 0
      };
    }).sort((a, b) => b.avgRating - a.avgRating);
  };

  // Opposition analysis
  const oppositionAnalysis = () => {
    const skillGroups = { 
      'Beginner (1-3)': 0, 
      'Average (4-6)': 0, 
      'Good (7-8)': 0, 
      'Expert (9-10)': 0 
    };
    
    const results = { 
      'Beginner (1-3)': { wins: 0, losses: 0 }, 
      'Average (4-6)': { wins: 0, losses: 0 }, 
      'Good (7-8)': { wins: 0, losses: 0 }, 
      'Expert (9-10)': { wins: 0, losses: 0 } 
    };

    allGames.forEach(game => {
      let group = 'Average (4-6)';
      if (game.opponentSkill <= 3) group = 'Beginner (1-3)';
      else if (game.opponentSkill <= 6) group = 'Average (4-6)';
      else if (game.opponentSkill <= 8) group = 'Good (7-8)';
      else group = 'Expert (9-10)';

      skillGroups[group as keyof typeof skillGroups]++;
      if (game.result === 'win') {
        results[group as keyof typeof results].wins++;
      } else {
        results[group as keyof typeof results].losses++;
      }
    });

    return Object.entries(skillGroups).map(([skill, games]) => ({
      skill,
      games,
      wins: results[skill as keyof typeof results].wins,
      losses: results[skill as keyof typeof results].losses,
      winRate: games > 0 ? (results[skill as keyof typeof results].wins / games) * 100 : 0
    }));
  };

  // Stress and performance correlation
  const stressAnalysis = allGames.filter(game => game.stressLevel).map(game => ({
    stress: game.stressLevel,
    result: game.result === 'win' ? 1 : 0,
    duration: game.duration,
    opponentSkill: game.opponentSkill
  }));

  // Server quality analysis
  const serverQualityAnalysis = allGames.filter(game => game.serverQuality).map(game => ({
    quality: game.serverQuality,
    result: game.result === 'win' ? 1 : 0
  }));

  // Game context distribution
  const gameContexts = allGames.reduce((acc, game) => {
    acc[game.gameContext] = (acc[game.gameContext] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const contextData = Object.entries(gameContexts).map(([context, count]) => ({
    name: context.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: count,
    color: getContextColor(context)
  }));

  // Time of day analysis
  const timeOfDayData = allGames
    .filter(game => game.time)
    .reduce((acc, game) => {
      const hour = parseInt(game.time!.split(':')[0]);
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

  const timeOfDayChartData = Object.entries(timeOfDayData).map(([hour, count]) => ({
    hour: parseInt(hour),
    count,
    timeLabel: `${hour}:00`
  })).sort((a, b) => a.hour - b.hour);

  const playerConsistency = getPlayerConsistency();
  const oppositionData = oppositionAnalysis();
  
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  // Weekly progression radar chart data
  const radarData = currentWeek ? [
    { metric: 'Attack', value: Math.min(100, currentWeek.totalGoals * 6.67) }, // Scale to 100
    { metric: 'Defense', value: Math.max(0, 100 - (currentWeek.totalConceded * 6.67)) },
    { metric: 'Consistency', value: currentWeek.games.length > 0 ? (currentWeek.totalWins / currentWeek.games.length) * 100 : 0 },
    { metric: 'Opposition', value: (currentWeek.averageOpponentSkill || 5) * 10 },
    { metric: 'Form', value: Math.min(100, currentWeek.totalWins * 6.67) },
    { metric: 'Efficiency', value: currentWeek.totalExpectedGoals > 0 ? Math.min(100, (currentWeek.totalGoals / currentWeek.totalExpectedGoals) * 100) : 50 }
  ] : [];

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

  // XG vs Actual Goals Scatter Plot
  const xgScatterData = allGames
    .filter(game => game.teamStats && game.teamStats.expectedGoals !== undefined)
    .map(game => {
      const [goalsFor] = game.scoreLine.split('-').map(Number);
      return {
        xg: game.teamStats.expectedGoals,
        goals: goalsFor,
        game: `G${game.gameNumber}`,
        result: game.result
      };
    });

  // Possession vs Win Rate
  const possessionData = allGames
    .filter(game => game.teamStats && game.teamStats.possession !== undefined)
    .reduce((acc, game) => {
      const possessionBucket = Math.floor(game.teamStats.possession / 10) * 10;
      const key = `${possessionBucket}-${possessionBucket + 9}`;
      
      if (!acc[key]) {
        acc[key] = { possession: key, games: 0, wins: 0 };
      }
      
      acc[key].games += 1;
      if (game.result === 'win') {
        acc[key].wins += 1;
      }
      
      return acc;
    }, {} as Record<string, { possession: string; games: number; wins: number; }>);

  const possessionChartData = Object.values(possessionData)
    .map(data => ({
      ...data,
      winRate: data.games > 0 ? (data.wins / data.games) * 100 : 0
    }))
    .sort((a, b) => {
      const aStart = parseInt(a.possession.split('-')[0]);
      const bStart = parseInt(b.possession.split('-')[0]);
      return aStart - bStart;
    });

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button 
          variant={activeTab === 'performance' ? 'default' : 'outline'}
          onClick={() => setActiveTab('performance')}
          className="flex items-center gap-2"
        >
          <BarChart3 className="h-4 w-4" />
          Performance Trends
        </Button>
        <Button 
          variant={activeTab === 'players' ? 'default' : 'outline'}
          onClick={() => setActiveTab('players')}
          className="flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          Player Analysis
        </Button>
        <Button 
          variant={activeTab === 'patterns' ? 'default' : 'outline'}
          onClick={() => setActiveTab('patterns')}
          className="flex items-center gap-2"
        >
          <Activity className="h-4 w-4" />
          Game Patterns
        </Button>
        <Button 
          variant={activeTab === 'predictions' ? 'default' : 'outline'}
          onClick={() => setActiveTab('predictions')}
          className="flex items-center gap-2"
        >
          <Lightbulb className="h-4 w-4" />
          Insights & Predictions
        </Button>
      </div>

      {/* Performance Trends Tab */}
      {activeTab === 'performance' && (
        <>
          {/* Performance Trends */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="h-5 w-5 text-fifa-blue" />
                Performance Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="week" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }} 
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="winRate" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    name="Win Rate %" 
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgGoalsFor" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="Goals/Game" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgGoalsAgainst" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                    name="Conceded/Game" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Opposition Analysis */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Shield className="h-5 w-5 text-fifa-red" />
                  Opposition Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={oppositionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="skill" 
                      stroke="#9CA3AF" 
                      fontSize={10}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }} 
                    />
                    <Bar dataKey="winRate" fill="#3B82F6" name="Win Rate %" />
                    <Bar dataKey="games" fill="#8B5CF6" name="Games Played" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Game Context Distribution */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <BarChart3 className="h-5 w-5 text-fifa-gold" />
                  Game Context Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={contextData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {contextData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Time Analysis */}
            {timeAnalysis.length > 0 && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Clock className="h-5 w-5 text-fifa-gold" />
                    Time & Stress Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={timeAnalysis.slice(-10)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="game" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="duration" 
                        stroke="#F59E0B" 
                        name="Duration (min)" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="stress" 
                        stroke="#EF4444" 
                        name="Stress Level" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Time of Day Analysis */}
            {timeOfDayChartData.length > 0 && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Clock className="h-5 w-5 text-fifa-purple" />
                    Time of Day Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={timeOfDayChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="timeLabel" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }} 
                      />
                      <Bar dataKey="count" fill="#8B5CF6" name="Games Played" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}

      {/* Player Analysis Tab */}
      {activeTab === 'players' && (
        <>
          {/* Player Performance Matrix */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="h-5 w-5 text-fifa-green" />
                Player Consistency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {playerConsistency.slice(0, 8).map((player, index) => (
                  <div key={player.name} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className="w-8 h-8 flex items-center justify-center bg-fifa-blue/20 text-fifa-blue">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium text-white">{player.name}</p>
                        <p className="text-xs text-gray-400">{player.position} • {player.games} games</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <div className="text-center">
                          <p className="font-bold text-fifa-gold">{player.avgRating}</p>
                          <p className="text-xs text-gray-400">Rating</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-fifa-green">{player.consistency}%</p>
                          <p className="text-xs text-gray-400">Consistency</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-fifa-blue">{player.goalsPer90.toFixed(2)}</p>
                          <p className="text-xs text-gray-400">G/90</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Player Contribution Scatter Plot */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Target className="h-5 w-5 text-fifa-green" />
                Player Contribution Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    type="number" 
                    dataKey="avgRating" 
                    name="Rating" 
                    domain={[5, 10]}
                    stroke="#9CA3AF"
                    label={{ value: 'Average Rating', position: 'insideBottom', offset: -10, fill: '#9CA3AF' }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="goalsPer90" 
                    name="Goals per 90" 
                    stroke="#9CA3AF"
                    label={{ value: 'Goals per 90', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
                  />
                  <ZAxis 
                    type="number" 
                    dataKey="games" 
                    range={[50, 400]} 
                    name="Games Played" 
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                    formatter={(value: any, name: string) => {
                      return [value.toFixed(2), name];
                    }}
                    labelFormatter={(value) => ''}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-gray-900 p-3 rounded-lg border border-gray-700 shadow-lg">
                            <p className="font-bold text-white">{data.name}</p>
                            <p className="text-sm text-gray-300">{data.position} • {data.games} games</p>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <div>
                                <p className="text-xs text-gray-400">Rating</p>
                                <p className="text-sm text-fifa-gold">{data.avgRating.toFixed(1)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Goals/90</p>
                                <p className="text-sm text-fifa-green">{data.goalsPer90.toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Assists/90</p>
                                <p className="text-sm text-fifa-blue">{data.assistsPer90.toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Consistency</p>
                                <p className="text-sm text-fifa-purple">{data.consistency}%</p>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter 
                    name="Players" 
                    data={playerConsistency} 
                    fill="#8884d8"
                  >
                    {playerConsistency.map((entry, index) => {
                      // Color based on position
                      let color = '#3B82F6'; // Default blue
                      if (entry.position.includes('ST') || entry.position.includes('CF') || entry.position.includes('LW') || entry.position.includes('RW')) {
                        color = '#EF4444'; // Red for attackers
                      } else if (entry.position.includes('CM') || entry.position.includes('CAM') || entry.position.includes('CDM') || entry.position.includes('LM') || entry.position.includes('RM')) {
                        color = '#10B981'; // Green for midfielders
                      } else if (entry.position.includes('CB') || entry.position.includes('LB') || entry.position.includes('RB') || entry.position.includes('GK')) {
                        color = '#8B5CF6'; // Purple for defenders
                      }
                      
                      return (
                        <Cell key={`cell-${index}`} fill={color} />
                      );
                    })}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Current Week Radar Chart */}
          {currentWeek && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Activity className="h-5 w-5 text-fifa-purple" />
                  Week {currentWeek.weekNumber} Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                    <PolarRadiusAxis 
                      domain={[0, 100]} 
                      tick={{ fontSize: 10, fill: '#9CA3AF' }}
                      tickCount={5}
                    />
                    <Radar 
                      name="Performance" 
                      dataKey="value" 
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Game Patterns Tab */}
      {activeTab === 'patterns' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* XG vs Actual Goals */}
            {xgScatterData.length > 0 && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Target className="h-5 w-5 text-fifa-green" />
                    Expected vs Actual Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        type="number" 
                        dataKey="xg" 
                        name="Expected Goals" 
                        stroke="#9CA3AF"
                        label={{ value: 'Expected Goals (xG)', position: 'insideBottom', offset: -10, fill: '#9CA3AF' }}
                      />
                      <YAxis 
                        type="number" 
                        dataKey="goals" 
                        name="Actual Goals" 
                        stroke="#9CA3AF"
                        label={{ value: 'Actual Goals', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
                      />
                      <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                        formatter={(value: any) => [value, '']}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            const efficiency = data.xg > 0 ? ((data.goals - data.xg) / data.xg) * 100 : 0;
                            return (
                              <div className="bg-gray-900 p-3 rounded-lg border border-gray-700 shadow-lg">
                                <p className="font-bold text-white">{data.game}</p>
                                <p className="text-sm text-gray-300">Result: {data.result === 'win' ? 'Win' : 'Loss'}</p>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                  <div>
                                    <p className="text-xs text-gray-400">Expected Goals</p>
                                    <p className="text-sm text-fifa-blue">{data.xg.toFixed(2)}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-400">Actual Goals</p>
                                    <p className="text-sm text-fifa-green">{data.goals}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <p className="text-xs text-gray-400">Finishing Efficiency</p>
                                    <p className={`text-sm ${efficiency >= 0 ? 'text-fifa-green' : 'text-fifa-red'}`}>
                                      {efficiency > 0 ? '+' : ''}{efficiency.toFixed(0)}%
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Scatter 
                        name="Games" 
                        data={xgScatterData} 
                        fill="#8884d8"
                      >
                        {xgScatterData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.result === 'win' ? '#10B981' : '#EF4444'} 
                          />
                        ))}
                      </Scatter>
                      {/* Reference line for xG = goals */}
                      <Line 
                        type="monotone" 
                        dataKey="xg" 
                        stroke="#9CA3AF" 
                        strokeDasharray="5 5" 
                        dot={false}
                        activeDot={false}
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Possession vs Win Rate */}
            {possessionChartData.length > 0 && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Activity className="h-5 w-5 text-fifa-blue" />
                    Possession Impact Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={possessionChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="possession" 
                        stroke="#9CA3AF"
                        label={{ value: 'Possession %', position: 'insideBottom', offset: -10, fill: '#9CA3AF' }}
                      />
                      <YAxis 
                        stroke="#9CA3AF"
                        label={{ value: 'Win Rate %', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                        formatter={(value: any, name: string) => {
                          return [value.toFixed(1) + '%', name];
                        }}
                      />
                      <Bar 
                        dataKey="winRate" 
                        fill="#3B82F6" 
                        name="Win Rate %" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Server Quality Impact */}
            {serverQualityAnalysis.length > 0 && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Zap className="h-5 w-5 text-fifa-gold" />
                    Server Quality Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart
                      data={
                        Array.from({ length: 10 }, (_, i) => i + 1)
                          .map(quality => {
                            const matches = serverQualityAnalysis.filter(g => g.quality === quality);
                            const wins = matches.filter(g => g.result === 1).length;
                            return {
                              quality,
                              games: matches.length,
                              winRate: matches.length > 0 ? (wins / matches.length) * 100 : 0
                            };
                          })
                          .filter(d => d.games > 0)
                      }
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="quality" 
                        stroke="#9CA3AF"
                        label={{ value: 'Server Quality Rating', position: 'insideBottom', offset: -10, fill: '#9CA3AF' }}
                      />
                      <YAxis 
                        stroke="#9CA3AF"
                        label={{ value: 'Win Rate %', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                        formatter={(value: any, name: string) => {
                          return [value.toFixed(1) + '%', name];
                        }}
                      />
                      <Bar 
                        dataKey="winRate" 
                        fill="#F59E0B" 
                        name="Win Rate %" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Stress Level Impact */}
            {stressAnalysis.length > 0 && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Activity className="h-5 w-5 text-fifa-red" />
                    Stress Level Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart
                      data={
                        Array.from({ length: 10 }, (_, i) => i + 1)
                          .map(stress => {
                            const matches = stressAnalysis.filter(g => g.stress === stress);
                            const wins = matches.filter(g => g.result === 1).length;
                            return {
                              stress,
                              games: matches.length,
                              winRate: matches.length > 0 ? (wins / matches.length) * 100 : 0
                            };
                          })
                          .filter(d => d.games > 0)
                      }
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="stress" 
                        stroke="#9CA3AF"
                        label={{ value: 'Stress Level', position: 'insideBottom', offset: -10, fill: '#9CA3AF' }}
                      />
                      <YAxis 
                        stroke="#9CA3AF"
                        label={{ value: 'Win Rate %', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                        formatter={(value: any, name: string) => {
                          return [value.toFixed(1) + '%', name];
                        }}
                      />
                      <Bar 
                        dataKey="winRate" 
                        fill="#EF4444" 
                        name="Win Rate %" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}

      {/* Insights & Predictions Tab */}
      {activeTab === 'predictions' && (
        <>
          {/* Key Insights */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Lightbulb className="h-5 w-5 text-fifa-gold" />
                Key Performance Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Best performer */}
                {playerConsistency.length > 0 && (
                  <div className="p-4 bg-fifa-green/10 border border-fifa-green/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-fifa-green" />
                      <span className="text-fifa-green font-medium text-sm">Star Player</span>
                    </div>
                    <p className="text-white font-bold">{playerConsistency[0].name}</p>
                    <p className="text-xs text-gray-400">{playerConsistency[0].avgRating} avg rating</p>
                  </div>
                )}

                {/* Toughest opposition */}
                <div className="p-4 bg-fifa-red/10 border border-fifa-red/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-fifa-red" />
                    <span className="text-fifa-red font-medium text-sm">Challenge Level</span>
                  </div>
                  <p className="text-white font-bold">
                    {allGames.length > 0 
                      ? `${(allGames.reduce((sum, game) => sum + game.opponentSkill, 0) / allGames.length).toFixed(1)}/10`
                      : 'N/A'
                    }
                  </p>
                  <p className="text-xs text-gray-400">Avg opponent skill</p>
                </div>

                {/* Current form */}
                <div className="p-4 bg-fifa-blue/10 border border-fifa-blue/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-fifa-blue" />
                    <span className="text-fifa-blue font-medium text-sm">Current Form</span>
                  </div>
                  <p className="text-white font-bold">
                    {currentWeek && currentWeek.games.length > 0
                      ? `${((currentWeek.totalWins / currentWeek.games.length) * 100).toFixed(0)}%`
                      : 'N/A'
                    }
                  </p>
                  <p className="text-xs text-gray-400">This week</p>
                </div>

                {/* Total playtime */}
                <div className="p-4 bg-fifa-gold/10 border border-fifa-gold/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-fifa-gold" />
                    <span className="text-fifa-gold font-medium text-sm">Playtime</span>
                  </div>
                  <p className="text-white font-bold">
                    {Math.round(totalMinutes / 60)}h
                  </p>
                  <p className="text-xs text-gray-400">Total hours</p>
                </div>
              </div>

              {/* Win Prediction */}
              {currentWeek && currentWeek.games.length > 0 && (
                <div className="mt-6 p-4 bg-fifa-purple/10 border border-fifa-purple/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="h-5 w-5 text-fifa-purple" />
                    <span className="text-fifa-purple font-medium">Win Prediction</span>
                  </div>
                  <p className="text-white mb-2">
                    Based on your current form and historical patterns, we predict you'll finish this week with approximately:
                  </p>
                  <div className="flex items-center justify-center gap-8 mt-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-fifa-gold">
                        {Math.min(15, Math.round(currentWeek.totalWins + (currentWeek.totalWins / currentWeek.games.length) * (15 - currentWeek.games.length)))}
                      </p>
                      <p className="text-sm text-gray-400">Predicted Wins</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-fifa-green">
                        {Math.min(15, Math.round(currentWeek.totalGoals + (currentWeek.totalGoals / currentWeek.games.length) * (15 - currentWeek.games.length)))}
                      </p>
                      <p className="text-sm text-gray-400">Predicted Goals</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Recommendations */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Lightbulb className="h-5 w-5 text-fifa-blue" />
                Performance Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Attacking Recommendation */}
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-fifa-green" />
                    <span className="text-fifa-green font-medium text-sm">Attacking Advice</span>
                  </div>
                  <p className="text-white text-sm">
                    {allGames.length > 0 ? (
                      allGames.reduce((sum, game) => {
                        const [goals] = game.scoreLine.split('-').map(Number);
                        return sum + goals;
                      }, 0) / allGames.length >= 3.0 
                        ? "Your attacking output is excellent. Focus on maintaining this clinical edge while ensuring you're not sacrificing defensive stability."
                        : allGames.reduce((sum, game) => {
                            const [goals] = game.scoreLine.split('-').map(Number);
                            return sum + goals;
                          }, 0) / allGames.length >= 2.0
                        ? "Your attacking output is solid. Look for opportunities to create higher quality chances rather than increasing shot volume."
                        : "Your attacking output needs improvement. Focus on patient build-up play and only taking high-percentage shots."
                    ) : "Not enough data to provide attacking advice."}
                  </p>
                </div>

                {/* Defensive Recommendation */}
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-fifa-red" />
                    <span className="text-fifa-red font-medium text-sm">Defensive Advice</span>
                  </div>
                  <p className="text-white text-sm">
                    {allGames.length > 0 ? (
                      allGames.reduce((sum, game) => {
                        const [, conceded] = game.scoreLine.split('-').map(Number);
                        return sum + conceded;
                      }, 0) / allGames.length <= 1.0
                        ? "Your defensive organization is exceptional. Continue with your current defensive setup and focus on quick transitions from defense to attack."
                        : allGames.reduce((sum, game) => {
                            const [, conceded] = game.scoreLine.split('-').map(Number);
                            return sum + conceded;
                          }, 0) / allGames.length <= 2.0
                        ? "Your defense is solid but could be improved. Focus on not pulling defenders out of position and using jockey more effectively."
                        : "Your defense needs significant improvement. Consider using a more defensive formation and focusing on manual defending fundamentals."
                    ) : "Not enough data to provide defensive advice."}
                  </p>
                </div>

                {/* Mental Recommendation */}
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-fifa-purple" />
                    <span className="text-fifa-purple font-medium text-sm">Mental Approach</span>
                  </div>
                  <p className="text-white text-sm">
                    {stressAnalysis.length > 0
                      ? "Your performance data shows a correlation between stress levels and results. Take short breaks between games, especially after losses, and practice mindfulness techniques during high-pressure moments."
                      : "Track your stress levels during games to identify how they impact your performance. Developing mental resilience is as important as technical skill."}
                  </p>
                </div>

                {/* Tactical Recommendation */}
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-fifa-blue" />
                    <span className="text-fifa-blue font-medium text-sm">Tactical Approach</span>
                  </div>
                  <p className="text-white text-sm">
                    {possessionChartData.length > 0
                      ? possessionChartData.sort((a, b) => b.winRate - a.winRate)[0].possession.startsWith('6') || 
                        possessionChartData.sort((a, b) => b.winRate - a.winRate)[0].possession.startsWith('7')
                        ? "Your data shows you perform best with a possession-based approach. Focus on patient build-up play and breaking down defensive blocks."
                        : "Your data suggests you excel with a more direct, counter-attacking approach. Focus on quick transitions and exploiting space behind the defense."
                      : "Experiment with different tactical approaches to identify your optimal play style. Track possession stats to find your sweet spot."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AdvancedAnalytics;