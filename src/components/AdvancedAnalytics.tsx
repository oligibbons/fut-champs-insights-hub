
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
  ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Users, 
  Zap, 
  Shield,
  BarChart3,
  Activity
} from 'lucide-react';

interface AdvancedAnalyticsProps {
  weeklyData: WeeklyPerformance[];
  currentWeek: WeeklyPerformance | null;
}

const AdvancedAnalytics = ({ weeklyData, currentWeek }: AdvancedAnalyticsProps) => {
  // Calculate comprehensive stats
  const allGames = weeklyData.flatMap(week => week.games);
  const allPlayerPerformances = allGames.flatMap(game => game.playerStats || []);

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
          games: 0
        };
      }
      acc[perf.name].ratings.push(perf.rating);
      acc[perf.name].goals += perf.goals;
      acc[perf.name].assists += perf.assists;
      acc[perf.name].games += 1;
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
        goalsPG: Number((player.goals / player.games).toFixed(2)),
        assistsPG: Number((player.assists / player.games).toFixed(2))
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

  const playerConsistency = getPlayerConsistency();
  const oppositionData = oppositionAnalysis();
  
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  // Weekly progression radar chart data
  const radarData = currentWeek ? [
    { metric: 'Attack', value: currentWeek.totalGoals * 6.67 }, // Scale to 100
    { metric: 'Defense', value: Math.max(0, 100 - (currentWeek.totalConceded * 10)) },
    { metric: 'Consistency', value: currentWeek.games.length > 0 ? (currentWeek.totalWins / currentWeek.games.length) * 100 : 0 },
    { metric: 'Opposition', value: (currentWeek.averageOpponentSkill || 5) * 10 },
    { metric: 'Form', value: Math.min(100, currentWeek.totalWins * 6.67) },
    { metric: 'Efficiency', value: currentWeek.totalExpectedGoals > 0 ? Math.min(100, (currentWeek.totalGoals / currentWeek.totalExpectedGoals) * 100) : 50 }
  ] : [];

  return (
    <div className="space-y-6">
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

      {/* Player Performance Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                        <p className="font-bold text-fifa-blue">{player.goalsPG}</p>
                        <p className="text-xs text-gray-400">G/G</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
              <ResponsiveContainer width="100%" height={250}>
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
      </div>

      {/* Opposition Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

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
      </div>

      {/* Key Insights */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <BarChart3 className="h-5 w-5 text-fifa-blue" />
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
                {Math.round(allGames.reduce((sum, game) => sum + game.duration, 0) / 60)}h
              </p>
              <p className="text-xs text-gray-400">Total hours</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedAnalytics;
