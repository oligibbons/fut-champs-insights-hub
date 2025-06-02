
import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { WeeklyPerformance, UserSettings } from '@/types/futChampions';
import { useAccountData } from '@/hooks/useAccountData';
import Navigation from '@/components/Navigation';
import DashboardCarousel from '@/components/DashboardCarousel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Trophy, Target, Users, Calendar, BarChart3 } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const { activeAccount } = useAccountData();
  const [weeklyData] = useLocalStorage<WeeklyPerformance[]>(`futChampions_weeks_${activeAccount}`, []);
  const [settings] = useLocalStorage<UserSettings>('futChampions_settings', {
    preferredFormation: '4-3-3',
    trackingStartDate: new Date().toISOString().split('T')[0],
    gameplayStyle: 'balanced',
    notifications: true,
    gamesPerWeek: 15,
    theme: 'futvisionary',
    carouselSpeed: 12,
    dashboardSettings: {
      showTopPerformers: true,
      showXGAnalysis: true,
      showAIInsights: true,
      showFormAnalysis: true,
      showWeaknesses: true,
      showOpponentAnalysis: true,
      showPositionalAnalysis: true,
      showRecentTrends: true,
      showAchievements: true,
      showTargetProgress: true,
      showTimeAnalysis: true,
      showStressAnalysis: true,
    },
    currentWeekSettings: {
      showTopPerformers: true,
      showXGAnalysis: true,
      showAIInsights: true,
      showFormAnalysis: true,
      showWeaknesses: true,
      showOpponentAnalysis: true,
      showPositionalAnalysis: true,
      showRecentTrends: true,
      showAchievements: true,
      showTargetProgress: true,
      showTimeAnalysis: true,
      showStressAnalysis: true,
    },
    qualifierSettings: {
      totalGames: 5,
      winsRequired: 2,
    },
    targetSettings: {
      autoSetTargets: false,
      adaptiveTargets: true,
      notifyOnTarget: true,
    },
    analyticsPreferences: {
      detailedPlayerStats: true,
      opponentTracking: true,
      timeTracking: true,
      stressTracking: true,
      showAnimations: true,
      dynamicFeedback: true,
    }
  });

  const getCurrentWeek = (): WeeklyPerformance | undefined => {
    return weeklyData.find(week => !week.isCompleted);
  };

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

  const currentWeek = getCurrentWeek();
  const allTimeStats = calculateStats();

  useEffect(() => {
    if (!activeAccount) {
      navigate('/Login');
    }
  }, [activeAccount, navigate]);

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
            currentWeek={currentWeek}
            enabledTiles={Object.keys(settings.dashboardSettings).filter(key => 
              settings.dashboardSettings[key as keyof typeof settings.dashboardSettings]
            )}
          />

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Total Games */}
            <Card className="glass-card static-element">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-fifa-blue mb-1">{allTimeStats.totalGames}</div>
                <div className="text-sm text-gray-400">Total Games</div>
              </CardContent>
            </Card>

            {/* Total Wins */}
            <Card className="glass-card static-element">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-fifa-green mb-1">{allTimeStats.totalWins}</div>
                <div className="text-sm text-gray-400">Total Wins</div>
              </CardContent>
            </Card>

            {/* Total Goals */}
            <Card className="glass-card static-element">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-fifa-gold mb-1">{allTimeStats.totalGoals}</div>
                <div className="text-sm text-gray-400">Total Goals</div>
              </CardContent>
            </Card>

            {/* Avg Rating */}
            <Card className="glass-card static-element">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-fifa-purple mb-1">{allTimeStats.avgRating}</div>
                <div className="text-sm text-gray-400">Avg Rating</div>
              </CardContent>
            </Card>

            {/* Win Streak */}
            <Card className="glass-card static-element">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-fifa-red mb-1">{currentWeek?.currentStreak || 0}</div>
                <div className="text-sm text-gray-400">Win Streak</div>
              </CardContent>
            </Card>

            {/* Win Rate */}
            <Card className="glass-card static-element">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-fifa-blue mb-1">{allTimeStats.winRate}%</div>
                <div className="text-sm text-gray-400">Win Rate</div>
              </CardContent>
            </Card>

            {/* Goals For */}
            <Card className="glass-card static-element">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-fifa-green mb-1">{allTimeStats.totalGoals}</div>
                <div className="text-sm text-gray-400">Goals For</div>
              </CardContent>
            </Card>

            {/* Goal Difference */}
            <Card className="glass-card static-element">
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold mb-1 ${allTimeStats.goalDifference >= 0 ? 'text-fifa-green' : 'text-fifa-red'}`}>
                  {allTimeStats.goalDifference >= 0 ? '+' : ''}{allTimeStats.goalDifference}
                </div>
                <div className="text-sm text-gray-400">Goal Difference</div>
              </CardContent>
            </Card>

            {/* Avg Opponent Skill */}
            <Card className="glass-card static-element">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-fifa-gold mb-1">{allTimeStats.avgOpponentSkill}</div>
                <div className="text-sm text-gray-400">Avg Opponent Skill</div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="glass-card static-element">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={() => navigate('/CurrentWeek')} className="modern-button-primary">
                <Calendar className="h-4 w-4 mr-2" />
                Record New Game
              </Button>
              <Button onClick={() => navigate('/Squads')} className="modern-button-secondary">
                <Users className="h-4 w-4 mr-2" />
                Manage Squads
              </Button>
              <Button onClick={() => navigate('/Achievements')} className="modern-button-secondary">
                <Trophy className="h-4 w-4 mr-2" />
                View Achievements
              </Button>
              <Button onClick={() => navigate('/Settings')} className="modern-button-secondary">
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
