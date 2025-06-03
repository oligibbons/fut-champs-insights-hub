
import { useState, useEffect } from 'react';
import { useDataSync } from '@/hooks/useDataSync';
import Navigation from '@/components/Navigation';
import DashboardCarousel from '@/components/DashboardCarousel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Trophy, Target, Users, Calendar, BarChart3, Zap, Award, Clock, Star, Activity, PieChart, LineChart } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const { weeklyData, getCurrentWeek, calculatePlayerStats, settings } = useDataSync();

  const currentRun = getCurrentWeek();
  const playerStats = calculatePlayerStats();

  const calculateStats = () => {
    const allGames = weeklyData.flatMap(week => week.games || []);
    const totalGames = allGames.length;
    const totalWins = weeklyData.reduce((sum, week) => sum + week.totalWins, 0);
    const totalGoals = weeklyData.reduce((sum, week) => sum + week.totalGoals, 0);
    const totalConceded = weeklyData.reduce((sum, week) => sum + week.totalConceded, 0);
    const totalOpponentSkills = weeklyData.reduce((sum, week) => sum + week.averageOpponentSkill * week.games.length, 0);
    const totalGamesPlayed = weeklyData.reduce((sum, week) => sum + week.games.length, 0);

    const avgRating = totalGames > 0 ? weeklyData.reduce((sum, week) => {
      const weekRating = week.games.reduce((gameSum, game) => {
        const gameAvg = (game.playerStats || []).reduce((pSum, player) => pSum + player.rating, 0) / Math.max((game.playerStats || []).length, 1);
        return gameSum + (gameAvg || 6.5);
      }, 0) / Math.max(week.games.length, 1);
      return sum + weekRating;
    }, 0) / weeklyData.length : 0;

    return {
      totalGames,
      totalWins,
      totalGoals,
      avgRating: +avgRating.toFixed(1),
      winRate: totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0,
      goalDifference: totalGoals - totalConceded,
      avgOpponentSkill: totalGamesPlayed > 0 ? +(totalOpponentSkills / totalGamesPlayed).toFixed(1) : 0
    };
  };

  const allTimeStats = calculateStats();
  const topPerformers = playerStats.sort((a, b) => b.goalInvolvementsPer90 - a.goalInvolvementsPer90).slice(0, 3);

  // Calculate recent form
  const recentGames = weeklyData.flatMap(week => week.games || []).slice(-5);
  const recentForm = recentGames.map(game => game.result);

  // Calculate weekly progress
  const weeklyProgress = weeklyData.map((week, index) => ({
    week: index + 1,
    wins: week.totalWins,
    winRate: week.games.length > 0 ? (week.totalWins / week.games.length) * 100 : 0
  }));

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="lg:ml-20 lg:hover:ml-64 transition-all duration-500 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-fifa-blue/20 to-fifa-purple/20">
              <BarChart3 className="h-8 w-8 text-fifa-blue" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-fifa-blue via-fifa-purple to-fifa-gold bg-clip-text text-transparent">
                FUTALYST Analytics Hub
              </h1>
              <p className="text-gray-400 mt-1">Welcome back! Here's your performance overview</p>
            </div>
          </div>

          {/* Dashboard Carousel */}
          <DashboardCarousel
            weeklyData={weeklyData}
            currentWeek={currentRun}
            enabledTiles={Object.keys(settings.dashboardSettings).filter(key => 
              settings.dashboardSettings[key as keyof typeof settings.dashboardSettings]
            )}
          />

          {/* Enhanced Analytics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Performance Overview */}
            <Card className="glass-card static-element col-span-2">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-fifa-gold" />
                  Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white/5 rounded-xl">
                    <div className="text-2xl font-bold text-fifa-blue mb-1">{allTimeStats.totalGames}</div>
                    <div className="text-sm text-gray-400">Total Games</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-xl">
                    <div className="text-2xl font-bold text-fifa-green mb-1">{allTimeStats.winRate}%</div>
                    <div className="text-sm text-gray-400">Win Rate</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-xl">
                    <div className="text-2xl font-bold text-fifa-gold mb-1">{allTimeStats.totalGoals}</div>
                    <div className="text-sm text-gray-400">Total Goals</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-xl">
                    <div className="text-2xl font-bold text-fifa-purple mb-1">{allTimeStats.avgRating}</div>
                    <div className="text-sm text-gray-400">Avg Rating</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Performers (Per 90) */}
            <Card className="glass-card static-element col-span-2">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Star className="h-5 w-5 text-fifa-gold" />
                  Top Performers (Per 90 mins)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topPerformers.length > 0 ? topPerformers.map((player, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                      <div>
                        <p className="font-medium text-white">{player.name}</p>
                        <p className="text-xs text-gray-400">{player.position} • {player.gamesPlayed} games • {player.totalMinutes} mins</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-fifa-gold">{player.goalInvolvementsPer90.toFixed(1)}</p>
                        <p className="text-xs text-gray-400">G+A/90</p>
                        <p className="text-xs text-gray-300">{player.goalsPer90.toFixed(1)}G {player.assistsPer90.toFixed(1)}A</p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-4">
                      <Users className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                      <p className="text-gray-400 text-sm">No player data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Current Run Status */}
            <Card className="glass-card static-element">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-fifa-blue" />
                  Current Run
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentRun ? (
                  <div className="space-y-3">
                    <div className="text-center p-3 bg-white/5 rounded-xl">
                      <div className="text-2xl font-bold text-fifa-green mb-1">{currentRun.totalWins}</div>
                      <div className="text-sm text-gray-400">Wins</div>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-xl">
                      <div className="text-2xl font-bold text-fifa-blue mb-1">{currentRun.games.length}/15</div>
                      <div className="text-sm text-gray-400">Games</div>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-xl">
                      <div className="text-2xl font-bold text-fifa-purple mb-1">{currentRun.currentStreak || 0}</div>
                      <div className="text-sm text-gray-400">Streak</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                    <p className="text-gray-400 text-sm">No active run</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Form */}
            <Card className="glass-card static-element">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-fifa-green" />
                  Recent Form
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-center gap-1">
                    {recentForm.length > 0 ? recentForm.map((result, index) => (
                      <div
                        key={index}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          result === 'win' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}
                      >
                        {result === 'win' ? 'W' : 'L'}
                      </div>
                    )) : (
                      <div className="text-center py-2">
                        <p className="text-gray-400 text-sm">No recent games</p>
                      </div>
                    )}
                  </div>
                  {recentGames.length > 0 && (
                    <div className="text-center p-3 bg-white/5 rounded-xl">
                      <div className="text-lg font-bold text-fifa-blue mb-1">
                        {Math.round((recentForm.filter(r => r === 'win').length / recentForm.length) * 100)}%
                      </div>
                      <div className="text-sm text-gray-400">Recent Win Rate</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Weekly Progress Chart */}
            <Card className="glass-card static-element col-span-2">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-fifa-purple" />
                  Weekly Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                {weeklyProgress.length > 0 ? (
                  <div className="space-y-3">
                    {weeklyProgress.slice(-4).map((week, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <div>
                          <p className="font-medium text-white">Week {week.week}</p>
                          <p className="text-sm text-gray-400">{week.wins} wins</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-fifa-blue">{week.winRate.toFixed(0)}%</p>
                          <div className="w-16 bg-white/10 rounded-full h-2 mt-1">
                            <div 
                              className="h-2 bg-fifa-blue rounded-full transition-all duration-500"
                              style={{ width: `${week.winRate}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Activity className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                    <p className="text-gray-400 text-sm">No weekly data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Goal Analysis */}
            <Card className="glass-card static-element col-span-2">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-fifa-gold" />
                  Goal Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-white/5 rounded-xl">
                    <div className="text-2xl font-bold text-fifa-green mb-1">{allTimeStats.totalGoals}</div>
                    <div className="text-sm text-gray-400">Goals For</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-xl">
                    <div className="text-2xl font-bold text-fifa-red mb-1">{allTimeStats.totalGoals - allTimeStats.goalDifference}</div>
                    <div className="text-sm text-gray-400">Goals Against</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-xl">
                    <div className={`text-2xl font-bold mb-1 ${allTimeStats.goalDifference >= 0 ? 'text-fifa-green' : 'text-fifa-red'}`}>
                      {allTimeStats.goalDifference > 0 ? '+' : ''}{allTimeStats.goalDifference}
                    </div>
                    <div className="text-sm text-gray-400">Difference</div>
                  </div>
                </div>
                {allTimeStats.totalGames > 0 && (
                  <div className="mt-4 text-center p-3 bg-white/5 rounded-xl">
                    <div className="text-lg font-bold text-fifa-purple mb-1">
                      {(allTimeStats.totalGoals / allTimeStats.totalGames).toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-400">Goals Per Game</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="glass-card static-element">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={() => navigate('/current-week')} className="modern-button-primary">
                <Calendar className="h-4 w-4 mr-2" />
                Record New Game
              </Button>
              <Button onClick={() => navigate('/squads')} className="modern-button-secondary">
                <Users className="h-4 w-4 mr-2" />
                Manage Squads
              </Button>
              <Button onClick={() => navigate('/achievements')} className="modern-button-secondary">
                <Trophy className="h-4 w-4 mr-2" />
                View Achievements
              </Button>
              <Button onClick={() => navigate('/settings')} className="modern-button-secondary">
                <Target className="h-4 w-4 mr-2" />
                Adjust Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
