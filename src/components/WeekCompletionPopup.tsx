import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { WeeklyPerformance, getRewardRanks } from '@/types/futChampions';
import { Trophy, Target, TrendingUp, TrendingDown, Star, BarChart3, Award, Calendar, PieChart, LineChart, Activity, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, LineChart as ReLineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface WeekCompletionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  weekData: WeeklyPerformance;
  onNewWeek: () => void;
}

const WeekCompletionPopup: React.FC<WeekCompletionPopupProps> = ({ isOpen, onClose, weekData, onNewWeek }) => {
  const { currentTheme } = useTheme();
  const [gameVersion] = useLocalStorage('gameVersion', 'FC26');
  const rewardRanks = getRewardRanks(gameVersion);

  const { achievedRank, nextRank } = useMemo(() => {
    if (!weekData) return { achievedRank: null, nextRank: null };
    const currentRanks = getRewardRanks(gameVersion);
    const achieved = currentRanks.slice().reverse().find(rank => weekData.totalWins >= rank.wins) || null;
    const next = currentRanks.find(rank => weekData.totalWins < rank.wins) || null;
    return { achievedRank: achieved, nextRank: next };
  }, [weekData, gameVersion]);

  if (!isOpen || !weekData) return null;

  const winRate = weekData.games.length > 0 ? (weekData.totalWins / weekData.games.length) * 100 : 0;
  
  const xgPerformance = weekData.totalExpectedGoals > 0 
    ? ((weekData.totalGoals - weekData.totalExpectedGoals) / weekData.totalExpectedGoals) * 100 
    : 0;
    
  const xgaPerformance = weekData.totalExpectedGoalsAgainst > 0 
    ? ((weekData.totalConceded - weekData.totalExpectedGoalsAgainst) / weekData.totalExpectedGoalsAgainst) * 100 
    : 0;

  // Calculate best and worst performances
  const allPlayerRatings = weekData.games.flatMap(game => game.playerStats.map(p => ({...p, gameNumber: game.gameNumber})));
  const bestRating = Math.max(...allPlayerRatings.map(p => p.rating));
  const worstRating = Math.min(...allPlayerRatings.map(p => p.rating));
  const avgRating = allPlayerRatings.length > 0 ? allPlayerRatings.reduce((a, b) => a + b.rating, 0) / allPlayerRatings.length : 0;
  
  const bestPerformance = allPlayerRatings.find(p => p.rating === bestRating);
  const worstPerformance = allPlayerRatings.find(p => p.rating === worstRating);

  // Get top performers
  const playerPerformances = new Map();
  weekData.games.forEach(game => {
    game.playerStats.forEach(player => {
      if (!playerPerformances.has(player.name)) {
        playerPerformances.set(player.name, {
          name: player.name,
          position: player.position,
          games: 0,
          goals: 0,
          assists: 0,
          totalRating: 0
        });
      }
      
      const stats = playerPerformances.get(player.name);
      stats.games += 1;
      stats.goals += player.goals;
      stats.assists += player.assists;
      stats.totalRating += player.rating;
    });
  });
  
  const topPerformers = Array.from(playerPerformances.values())
    .map(p => ({
      ...p,
      avgRating: p.games > 0 ? p.totalRating / p.games : 0,
      goalContributions: p.goals + p.assists
    }))
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, 3);

  // Game context distribution
  const gameContexts = weekData.games.reduce((acc, game) => {
    acc[game.gameContext] = (acc[game.gameContext] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const contextData = Object.entries(gameContexts).map(([context, count]) => ({
    name: context.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: count,
    color: getContextColor(context)
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

  // Goal distribution data
  const goalData = weekData.games.map(game => {
    const [goalsFor, goalsAgainst] = game.scoreLine.split('-').map(Number);
    return {
      game: `Game ${game.gameNumber}`,
      scored: goalsFor,
      conceded: goalsAgainst
    };
  });

  // Win/loss progression
  const progressionData = weekData.games.map((game, index) => ({
    game: `Game ${game.gameNumber}`,
    result: game.result === 'win' ? 1 : 0,
    cumulativeWins: weekData.games.slice(0, index + 1).filter(g => g.result === 'win').length,
    cumulativeLosses: weekData.games.slice(0, index + 1).filter(g => g.result === 'loss').length,
  }));

  // Opponent skill distribution
  const opponentSkillData = Array.from({ length: 10 }, (_, i) => {
    const skill = i + 1;
    const games = weekData.games.filter(game => game.opponentSkill === skill);
    return {
      skill: skill.toString(),
      count: games.length,
      wins: games.filter(g => g.result === 'win').length,
      losses: games.filter(g => g.result === 'loss').length,
      winRate: games.length > 0 ? (games.filter(g => g.result === 'win').length / games.length) * 100 : 0
    };
  }).filter(item => item.count > 0);

  // Team stats averages
  const teamStatsAverages = {
    possession: weekData.games.reduce((sum, game) => sum + (game.teamStats?.possession || 50), 0) / (weekData.games.length || 1),
    passAccuracy: weekData.games.reduce((sum, game) => sum + (game.teamStats?.passAccuracy || 75), 0) / (weekData.games.length || 1),
    shots: weekData.games.reduce((sum, game) => sum + (game.teamStats?.shots || 0), 0) / (weekData.games.length || 1),
    shotsOnTarget: weekData.games.reduce((sum, game) => sum + (game.teamStats?.shotsOnTarget || 0), 0) / (weekData.games.length || 1),
    corners: weekData.games.reduce((sum, game) => sum + (game.teamStats?.corners || 0), 0) / (weekData.games.length || 1),
    fouls: weekData.games.reduce((sum, game) => sum + (game.teamStats?.fouls || 0), 0) / (weekData.games.length || 1)
  };

  // Performance radar data
  const radarData = [
    { metric: 'Attack', value: Math.min(100, weekData.totalGoals * 6.67) },
    { metric: 'Defense', value: Math.max(0, 100 - (weekData.totalConceded * 6.67)) },
    { metric: 'Win Rate', value: winRate },
    { metric: 'Consistency', value: Math.min(100, (weekData.bestStreak || 0) * 20) },
    { metric: 'Finishing', value: xgPerformance > 0 ? Math.min(100, xgPerformance + 50) : Math.max(0, 50 + xgPerformance/2) },
    { metric: 'Defending', value: xgaPerformance < 0 ? Math.min(100, Math.abs(xgaPerformance) + 50) : Math.max(0, 50 - xgaPerformance/2) }
  ];

  const getWeekGrade = () => {
    if (winRate >= 80) return { grade: 'S', color: '#9932CC' };
    if (winRate >= 70) return { grade: 'A', color: '#32CD32' };
    if (winRate >= 60) return { grade: 'B', color: '#FFD700' };
    if (winRate >= 50) return { grade: 'C', color: '#FF8C00' };
    if (winRate >= 40) return { grade: 'D', color: '#DC143C' };
    return { grade: 'F', color: '#8B0000' };
  };

  const weekGrade = getWeekGrade();

  const handleStartNewWeek = () => {
    onNewWeek();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-3xl border-0 p-0" 
                     style={{ backgroundColor: currentTheme.colors.cardBg }}>
        <div className="p-8 space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="p-6 bg-gradient-to-br from-primary to-accent rounded-3xl">
              <Trophy className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold" style={{ color: currentTheme.colors.text }}>
                {weekData.customName || `Week ${weekData.weekNumber}`} Complete!
              </h1>
              <p className="text-xl" style={{ color: currentTheme.colors.muted }}>
                Performance Summary & Analysis
              </p>
            </div>
          </div>

          {/* Week Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-3xl" style={{ backgroundColor: weekGrade.color + '20' }}>
              <div className="text-8xl font-bold mb-4" style={{ color: weekGrade.color }}>
                {weekGrade.grade}
              </div>
              <div className="text-2xl font-semibold" style={{ color: currentTheme.colors.text }}>
                Week Grade
              </div>
              <div className="text-lg" style={{ color: currentTheme.colors.muted }}>
                {winRate.toFixed(1)}% Win Rate
              </div>
            </div>

            <div className="text-center p-8 rounded-3xl" style={{ backgroundColor: currentTheme.colors.surface }}>
              <div className="text-6xl font-bold mb-4" style={{ color: currentTheme.colors.primary }}>
                {weekData.totalWins}
              </div>
              <div className="text-2xl font-semibold" style={{ color: currentTheme.colors.text }}>
                Total Wins
              </div>
              <div className="text-lg" style={{ color: currentTheme.colors.muted }}>
                {weekData.totalLosses} Losses
              </div>
            </div>

            <div className="text-center p-8 rounded-3xl" style={{ backgroundColor: achievedRank ? '#fbbf2420' : currentTheme.colors.surface }}>
              <div className="text-3xl font-bold mb-4" style={{ color: achievedRank ? '#fbbf24' : currentTheme.colors.text }}>
                {achievedRank?.rank || 'Unranked'}
              </div>
              <div className="text-2xl font-semibold" style={{ color: currentTheme.colors.text }}>
                Final Rank
              </div>
              {nextRank && (
                <div className="text-lg" style={{ color: currentTheme.colors.muted }}>
                  {nextRank.wins - weekData.totalWins} wins to {nextRank.rank}
                </div>
              )}
            </div>
          </div>

          {/* Performance Radar Chart */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 rounded-3xl" style={{ backgroundColor: currentTheme.colors.surface }}>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-3" style={{ color: currentTheme.colors.text }}>
                <Activity className="h-6 w-6" style={{ color: currentTheme.colors.primary }} />
                Performance Profile
              </h3>
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
            </div>

            <div className="p-6 rounded-3xl" style={{ backgroundColor: currentTheme.colors.surface }}>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-3" style={{ color: currentTheme.colors.text }}>
                <TrendingUp className="h-6 w-6" style={{ color: currentTheme.colors.primary }} />
                Win/Loss Progression
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={progressionData}>
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
                  <Area 
                    type="monotone" 
                    dataKey="cumulativeWins" 
                    stackId="1"
                    stroke="#10B981" 
                    fill="#10B981" 
                    name="Wins"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cumulativeLosses" 
                    stackId="1"
                    stroke="#EF4444" 
                    fill="#EF4444" 
                    name="Losses"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl" style={{ backgroundColor: currentTheme.colors.surface }}>
              <div className="flex items-center gap-3 mb-3">
                <Target className="h-6 w-6" style={{ color: currentTheme.colors.accent }} />
                <span className="text-lg font-medium" style={{ color: currentTheme.colors.text }}>Goals</span>
              </div>
              <div className="text-4xl font-bold" style={{ color: currentTheme.colors.accent }}>
                {weekData.totalGoals}
              </div>
              <div className="text-sm" style={{ color: currentTheme.colors.muted }}>
                {(weekData.totalGoals / (weekData.games.length || 1)).toFixed(1)} per game
              </div>
            </div>

            <div className="p-6 rounded-2xl" style={{ backgroundColor: currentTheme.colors.surface }}>
              <div className="flex items-center gap-3 mb-3">
                <BarChart3 className="h-6 w-6" style={{ color: currentTheme.colors.secondary }} />
                <span className="text-lg font-medium" style={{ color: currentTheme.colors.text }}>Avg Rating</span>
              </div>
              <div className="text-4xl font-bold" style={{ color: currentTheme.colors.secondary }}>
                {avgRating.toFixed(1)}
              </div>
              <div className="text-sm" style={{ color: currentTheme.colors.muted }}>
                Best: {bestRating.toFixed(1)}
              </div>
            </div>

            <div className="p-6 rounded-2xl" style={{ backgroundColor: currentTheme.colors.surface }}>
              <div className="flex items-center gap-3 mb-3">
                <Star className="h-6 w-6" style={{ color: currentTheme.colors.primary }} />
                <span className="text-lg font-medium" style={{ color: currentTheme.colors.text }}>XG Diff</span>
              </div>
              <div className="text-4xl font-bold" style={{ color: xgPerformance > 0 ? '#10b981' : '#ef4444' }}>
                {xgPerformance > 0 ? '+' : ''}{xgPerformance.toFixed(1)}%
              </div>
              <div className="text-sm" style={{ color: currentTheme.colors.muted }}>
                vs Expected
              </div>
            </div>

            <div className="p-6 rounded-2xl" style={{ backgroundColor: currentTheme.colors.surface }}>
              <div className="flex items-center gap-3 mb-3">
                <Award className="h-6 w-6" style={{ color: currentTheme.colors.text }} />
                <span className="text-lg font-medium" style={{ color: currentTheme.colors.text }}>Opponent</span>
              </div>
              <div className="text-4xl font-bold" style={{ color: currentTheme.colors.text }}>
                {weekData.averageOpponentSkill.toFixed(1)}
              </div>
              <div className="text-sm" style={{ color: currentTheme.colors.muted }}>
                Avg Skill
              </div>
            </div>
          </div>

          {/* Charts and Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Goal Distribution Chart */}
            <div className="p-6 rounded-3xl" style={{ backgroundColor: currentTheme.colors.surface }}>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-3" style={{ color: currentTheme.colors.text }}>
                <Activity className="h-6 w-6" style={{ color: currentTheme.colors.primary }} />
                Goal Distribution
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={goalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="game" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                        border: '1px solid rgba(59, 130, 246, 0.3)', 
                        borderRadius: '12px' 
                      }} 
                    />
                    <Bar dataKey="scored" name="Goals Scored" fill="#10b981" />
                    <Bar dataKey="conceded" name="Goals Conceded" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Game Context Distribution */}
            <div className="p-6 rounded-3xl" style={{ backgroundColor: currentTheme.colors.surface }}>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-3" style={{ color: currentTheme.colors.text }}>
                <PieChart className="h-6 w-6" style={{ color: currentTheme.colors.secondary }} />
                Game Context Distribution
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
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
                        backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                        border: '1px solid rgba(59, 130, 246, 0.3)', 
                        borderRadius: '12px' 
                      }} 
                    />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Opponent Skill Analysis */}
          <div className="p-6 rounded-3xl" style={{ backgroundColor: currentTheme.colors.surface }}>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-3" style={{ color: currentTheme.colors.text }}>
              <Users className="h-6 w-6" style={{ color: currentTheme.colors.primary }} />
              Performance vs Opponent Skill
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={opponentSkillData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="skill" stroke="#9ca3af" label={{ value: 'Opponent Skill Level', position: 'insideBottom', offset: -5 }} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                      border: '1px solid rgba(59, 130, 246, 0.3)', 
                      borderRadius: '12px' 
                    }} 
                  />
                  <Bar dataKey="winRate" name="Win Rate %" fill="#3b82f6" />
                  <Bar dataKey="count" name="Games Played" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Team Stats Overview */}
          <div className="p-6 rounded-3xl" style={{ backgroundColor: currentTheme.colors.surface }}>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-3" style={{ color: currentTheme.colors.text }}>
              <BarChart3 className="h-6 w-6" style={{ color: currentTheme.colors.primary }} />
              Team Stats Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: currentTheme.colors.primary }}>
                  {teamStatsAverages.possession.toFixed(1)}%
                </div>
                <div className="text-sm" style={{ color: currentTheme.colors.muted }}>
                  Avg Possession
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: currentTheme.colors.accent }}>
                  {teamStatsAverages.passAccuracy.toFixed(1)}%
                </div>
                <div className="text-sm" style={{ color: currentTheme.colors.muted }}>
                  Pass Accuracy
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: currentTheme.colors.secondary }}>
                  {teamStatsAverages.shots.toFixed(1)}
                </div>
                <div className="text-sm" style={{ color: currentTheme.colors.muted }}>
                  Shots per Game
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: currentTheme.colors.primary }}>
                  {teamStatsAverages.shotsOnTarget.toFixed(1)}
                </div>
                <div className="text-sm" style={{ color: currentTheme.colors.muted }}>
                  Shots on Target
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: currentTheme.colors.accent }}>
                  {teamStatsAverages.corners.toFixed(1)}
                </div>
                <div className="text-sm" style={{ color: currentTheme.colors.muted }}>
                  Corners per Game
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: currentTheme.colors.secondary }}>
                  {(teamStatsAverages.shotsOnTarget / (teamStatsAverages.shots || 1) * 100).toFixed(1)}%
                </div>
                <div className="text-sm" style={{ color: currentTheme.colors.muted }}>
                  Shot Accuracy
                </div>
              </div>
            </div>
          </div>

          {/* XG Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-3xl" style={{ backgroundColor: currentTheme.colors.surface }}>
              <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3" style={{ color: currentTheme.colors.text }}>
                <TrendingUp className="h-6 w-6" style={{ color: currentTheme.colors.primary }} />
                Attack Analysis
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-lg" style={{ color: currentTheme.colors.muted }}>Goals Scored</span>
                  <span className="text-lg font-bold" style={{ color: currentTheme.colors.text }}>{weekData.totalGoals}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-lg" style={{ color: currentTheme.colors.muted }}>Expected Goals</span>
                  <span className="text-lg font-bold" style={{ color: currentTheme.colors.text }}>{weekData.totalExpectedGoals.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg" style={{ color: currentTheme.colors.muted }}>Performance</span>
                  <div className="flex items-center gap-3">
                    {xgPerformance > 0 ? (
                      <TrendingUp className="h-5 w-5 text-green-400" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-400" />
                    )}
                    <span className={`text-lg font-bold ${xgPerformance > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {xgPerformance > 0 ? '+' : ''}{xgPerformance.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl" style={{ backgroundColor: currentTheme.colors.surface }}>
              <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3" style={{ color: currentTheme.colors.text }}>
                <TrendingDown className="h-6 w-6" style={{ color: currentTheme.colors.secondary }} />
                Defense Analysis
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-lg" style={{ color: currentTheme.colors.muted }}>Goals Conceded</span>
                  <span className="text-lg font-bold" style={{ color: currentTheme.colors.text }}>{weekData.totalConceded}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-lg" style={{ color: currentTheme.colors.muted }}>Expected Goals Against</span>
                  <span className="text-lg font-bold" style={{ color: currentTheme.colors.text }}>{weekData.totalExpectedGoalsAgainst.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg" style={{ color: currentTheme.colors.muted }}>Performance</span>
                  <div className="flex items-center gap-3">
                    {xgaPerformance < 0 ? (
                      <TrendingUp className="h-5 w-5 text-green-400" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-400" />
                    )}
                    <span className={`text-lg font-bold ${xgaPerformance < 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {xgaPerformance > 0 ? '+' : ''}{xgaPerformance.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Performers */}
          <div className="p-8 rounded-3xl" style={{ backgroundColor: currentTheme.colors.surface }}>
            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3" style={{ color: currentTheme.colors.text }}>
              <Star className="h-6 w-6" style={{ color: currentTheme.colors.accent }} />
              Top Performers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topPerformers.map((player, index) => (
                <div key={index} className="p-4 rounded-xl border" style={{ 
                  backgroundColor: currentTheme.colors.cardBg, 
                  borderColor: index === 0 ? '#fbbf24' : currentTheme.colors.border 
                }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ 
                      backgroundColor: index === 0 ? '#fbbf24' : currentTheme.colors.primary 
                    }}>
                      <span className="text-black font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: currentTheme.colors.text }}>{player.name}</p>
                      <p className="text-sm" style={{ color: currentTheme.colors.muted }}>{player.position}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="font-bold text-fifa-gold">{player.avgRating.toFixed(1)}</p>
                      <p className="text-xs text-gray-400">Rating</p>
                    </div>
                    <div>
                      <p className="font-bold text-fifa-green">{player.goals}</p>
                      <p className="text-xs text-gray-400">Goals</p>
                    </div>
                    <div>
                      <p className="font-bold text-fifa-blue">{player.assists}</p>
                      <p className="text-xs text-gray-400">Assists</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Best & Worst Performances */}
          {bestPerformance && worstPerformance && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 rounded-3xl" style={{ backgroundColor: currentTheme.colors.surface }}>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-3" style={{ color: currentTheme.colors.text }}>
                  <Star className="h-6 w-6 text-fifa-gold" />
                  Best Individual Performance
                </h3>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-fifa-gold flex items-center justify-center text-black font-bold text-2xl">
                    {bestPerformance.rating.toFixed(1)}
                  </div>
                  <div>
                    <p className="text-xl font-bold" style={{ color: currentTheme.colors.text }}>{bestPerformance.name}</p>
                    <p className="text-sm" style={{ color: currentTheme.colors.muted }}>
                      {bestPerformance.position} • Game {bestPerformance.gameNumber}
                    </p>
                    <p className="text-sm mt-1" style={{ color: currentTheme.colors.text }}>
                      {bestPerformance.goals} goals, {bestPerformance.assists} assists
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-3xl" style={{ backgroundColor: currentTheme.colors.surface }}>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-3" style={{ color: currentTheme.colors.text }}>
                  <TrendingDown className="h-6 w-6 text-fifa-red" />
                  Needs Improvement
                </h3>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-fifa-red flex items-center justify-center text-white font-bold text-2xl">
                    {worstPerformance.rating.toFixed(1)}
                  </div>
                  <div>
                    <p className="text-xl font-bold" style={{ color: currentTheme.colors.text }}>{worstPerformance.name}</p>
                    <p className="text-sm" style={{ color: currentTheme.colors.muted }}>
                      {worstPerformance.position} • Game {worstPerformance.gameNumber}
                    </p>
                    <p className="text-sm mt-1" style={{ color: currentTheme.colors.text }}>
                      Consider adjusting tactics or player position
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Insights */}
          <div className="p-8 rounded-3xl" style={{ backgroundColor: currentTheme.colors.surface }}>
            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3" style={{ color: currentTheme.colors.text }}>
              <Star className="h-6 w-6" style={{ color: currentTheme.colors.accent }} />
              Week Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
              <div className="space-y-3">
                <h4 className="text-xl font-medium text-green-400">Strengths</h4>
                <div style={{ color: currentTheme.colors.muted }}>
                  {winRate >= 70 && <p>✅ Excellent win rate - you're dominating!</p>}
                  {xgPerformance > 15 && <p>✅ Clinical finishing - outperforming XG significantly</p>}
                  {xgaPerformance < -10 && <p>✅ Solid defense - conceding less than expected</p>}
                  {avgRating >= 7.5 && <p>✅ Consistent team performance across all players</p>}
                  {weekData.averageOpponentSkill >= 7 && <p>✅ Competing against high-level opponents</p>}
                  {weekData.totalWins >= 11 && <p>✅ Achieved an excellent rank this week</p>}
                  {weekData.bestStreak && weekData.bestStreak >= 5 && <p>✅ Impressive winning streak of {weekData.bestStreak} games</p>}
                  {topPerformers.length > 0 && topPerformers[0].avgRating >= 8.0 && 
                    <p>✅ Standout performance from {topPerformers[0].name} with {topPerformers[0].avgRating.toFixed(1)} rating</p>}
                  {teamStatsAverages.possession >= 60 && <p>✅ Excellent possession control ({teamStatsAverages.possession.toFixed(1)}%)</p>}
                  {teamStatsAverages.passAccuracy >= 85 && <p>✅ Exceptional passing accuracy ({teamStatsAverages.passAccuracy.toFixed(1)}%)</p>}
                  {(teamStatsAverages.shotsOnTarget / (teamStatsAverages.shots || 1)) >= 0.6 && <p>✅ High shot accuracy ({(teamStatsAverages.shotsOnTarget / (teamStatsAverages.shots || 1) * 100).toFixed(1)}%)</p>}
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-xl font-medium text-red-400">Areas for Improvement</h4>
                <div style={{ color: currentTheme.colors.muted }}>
                  {winRate < 50 && <p>⚠️ Win rate needs improvement - focus on consistency</p>}
                  {xgPerformance < -20 && <p>⚠️ Finishing could be better - practice in skill games</p>}
                  {xgaPerformance > 15 && <p>⚠️ Defensive stability needed - conceding too many</p>}
                  {avgRating < 7.0 && <p>⚠️ Team performance inconsistent - squad changes needed?</p>}
                  {worstRating < 6.0 && <p>⚠️ Some players underperforming - consider substitutions</p>}
                  {weekData.totalConceded > weekData.totalGoals && <p>⚠️ Negative goal difference - balance attack and defense</p>}
                  {weekData.worstStreak && weekData.worstStreak <= -3 && <p>⚠️ Experienced a losing streak of {Math.abs(weekData.worstStreak)} games</p>}
                  {weekData.games.filter(g => g.result === 'loss' && g.opponentSkill <= 5).length >= 2 && 
                    <p>⚠️ Lost multiple games to lower-skilled opponents</p>}
                  {teamStatsAverages.possession < 45 && <p>⚠️ Low possession ({teamStatsAverages.possession.toFixed(1)}%) - work on ball retention</p>}
                  {teamStatsAverages.passAccuracy < 70 && <p>⚠️ Poor passing accuracy ({teamStatsAverages.passAccuracy.toFixed(1)}%)</p>}
                  {(teamStatsAverages.shotsOnTarget / (teamStatsAverages.shots || 1)) < 0.4 && <p>⚠️ Low shot accuracy ({(teamStatsAverages.shotsOnTarget / (teamStatsAverages.shots || 1) * 100).toFixed(1)}%)</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-6">
            <Button onClick={onClose} variant="outline" className="flex-1 py-4 text-xl rounded-2xl" style={{ borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}>
              Review Later
            </Button>
            <Button onClick={handleStartNewWeek} className="flex-1 py-4 text-xl rounded-2xl" style={{ backgroundColor: currentTheme.colors.primary, color: '#ffffff' }}>
              <Calendar className="h-6 w-6 mr-3" />
              Start Next Week
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WeekCompletionPopup;

