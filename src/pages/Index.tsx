
import { useState, useEffect } from 'react';
import { useDataSync } from '@/hooks/useDataSync';
import Navigation from '@/components/Navigation';
import DashboardCarousel from '@/components/DashboardCarousel';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
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

          {/* Comprehensive Analytics Dashboard */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-fifa-blue" />
                Performance Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnalyticsDashboard />
            </CardContent>
          </Card>

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
