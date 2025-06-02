
import { useState, useEffect } from 'react';
import { useDataSync } from '@/hooks/useDataSync';
import Navigation from '@/components/Navigation';
import DashboardCarousel from '@/components/DashboardCarousel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Trophy, Target, Users, Calendar, BarChart3, Zap, Award, Clock, Star } from 'lucide-react';
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
  const topPerformers = playerStats.sort((a, b) => b.averageRating - a.averageRating).slice(0, 3);

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

            {/* Top Performers */}
            <Card className="glass-card static-element col-span-2">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Star className="h-5 w-5 text-fifa-gold" />
                  Top Performers (Per 90)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topPerformers.length > 0 ? topPerformers.map((player, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                      <div>
                        <p className="font-medium text-white">{player.name}</p>
                        <p className="text-xs text-gray-400">{player.position} • {player.gamesPlayed} games</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-fifa-gold">{player.goalInvolvementsPer90.toFixed(1)}</p>
                        <p className="text-xs text-gray-400">G+A/90</p>
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
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                    <p className="text-gray-400 text-sm">No active run</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card className="glass-card static-element">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-fifa-purple" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-fifa-green/10 border border-fifa-green/20 rounded-xl">
                    <p className="text-fifa-green font-medium text-sm">🎯 Target Progress</p>
                    <p className="text-white text-xs">
                      {currentRun ? `${currentRun.totalWins}/${currentRun.targetWins || 11} wins` : 'No active target'}
                    </p>
                  </div>
                  <div className="p-3 bg-fifa-blue/10 border border-fifa-blue/20 rounded-xl">
                    <p className="text-fifa-blue font-medium text-sm">📊 Data Tracking</p>
                    <p className="text-white text-xs">
                      {weeklyData.length} weeks tracked
                    </p>
                  </div>
                </div>
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
