import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import WeeklyOverview from '@/components/WeeklyOverview';
import StatCard from '@/components/StatCard';
import DashboardCarousel from '@/components/DashboardCarousel';
import AchievementSystem from '@/components/AchievementSystem';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { WeeklyPerformance, UserSettings, GameResult } from '@/types/futChampions';
import { 
  Trophy, 
  TrendingUp, 
  Calendar, 
  Users, 
  Plus,
  Target,
  Clock,
  Star,
  BarChart3,
  Zap,
  Award
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const [weeklyData] = useLocalStorage<WeeklyPerformance[]>('futChampions_weeks', []);
  const [settings] = useLocalStorage<UserSettings>('futChampions_settings', {
    preferredFormation: '4-3-3',
    trackingStartDate: new Date().toISOString().split('T')[0],
    gameplayStyle: 'balanced',
    notifications: true,
    gamesPerWeek: 15,
    theme: 'default',
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
  const [currentWeek, setCurrentWeek] = useState<WeeklyPerformance | null>(null);
  const [overallStats, setOverallStats] = useState({
    totalWeeks: 0,
    totalGames: 0,
    totalWins: 0,
    totalGoals: 0,
    averageWinRate: 0,
    bestWeek: 0,
    totalPlaytime: 0,
    averageGameTime: 0,
    currentStreak: 0,
    bestStreak: 0
  });

  useEffect(() => {
    if (weeklyData.length > 0) {
      const current = weeklyData.find(week => !week.isCompleted) || weeklyData[weeklyData.length - 1];
      setCurrentWeek(current);

      // Calculate comprehensive overall stats
      const totalGames = weeklyData.reduce((sum, week) => sum + week.games.length, 0);
      const totalWins = weeklyData.reduce((sum, week) => sum + week.totalWins, 0);
      const totalGoals = weeklyData.reduce((sum, week) => sum + week.totalGoals, 0);
      const averageWinRate = totalGames > 0 ? (totalWins / totalGames) * 100 : 0;
      const bestWeek = Math.max(...weeklyData.map(week => week.totalWins));
      
      // Calculate playtime stats
      const allGames = weeklyData.flatMap(week => week.games);
      const totalPlaytime = allGames.reduce((sum, game) => sum + game.duration, 0);
      const averageGameTime = allGames.length > 0 ? totalPlaytime / allGames.length : 0;
      
      // Calculate streaks
      const sortedGames = allGames.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      let currentStreak = 0;
      let bestStreak = 0;
      let tempStreak = 0;
      
      for (let i = sortedGames.length - 1; i >= 0; i--) {
        if (sortedGames[i].result === 'win') {
          if (i === sortedGames.length - 1 || currentStreak > 0) {
            currentStreak++;
          }
          tempStreak++;
          bestStreak = Math.max(bestStreak, tempStreak);
        } else {
          tempStreak = 0;
          if (currentStreak === 0) break;
        }
      }

      setOverallStats({
        totalWeeks: weeklyData.length,
        totalGames,
        totalWins,
        totalGoals,
        averageWinRate,
        bestWeek,
        totalPlaytime: Math.round(totalPlaytime / 60), // Convert to hours
        averageGameTime: Math.round(averageGameTime),
        currentStreak,
        bestStreak
      });
    }
  }, [weeklyData]);

  const getCurrentWeekData = () => {
    if (!currentWeek) {
      return {
        weekNumber: 1,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        averageOpponentSkill: 0
      };
    }

    return {
      weekNumber: currentWeek.weekNumber,
      gamesPlayed: currentWeek.games.length,
      wins: currentWeek.totalWins,
      losses: currentWeek.totalLosses,
      goalsFor: currentWeek.totalGoals,
      goalsAgainst: currentWeek.totalConceded,
      averageOpponentSkill: currentWeek.averageOpponentSkill
    };
  };

  const recentGames = currentWeek?.games.slice(-5) || [];

  const enabledTiles = Object.entries(settings.dashboardSettings)
    .filter(([_, enabled]) => enabled)
    .map(([key, _]) => key);

  // Calculate achievements count
  const unlockedAchievements = 3; // This would be calculated by the achievement system

  // Mock stats calculation
  const calculateStats = () => {
    const allGames = weeklyData.flatMap(week => week.games);
    return {
      totalGames: allGames.length,
      totalWins: weeklyData.reduce((sum, week) => sum + week.totalWins, 0),
      totalGoals: weeklyData.reduce((sum, week) => sum + week.totalGoals, 0),
      avgRating: allGames.length > 0 ? 
        allGames.reduce((sum, game) => {
          const avgPlayerRating = game.playerStats.length > 0 
            ? game.playerStats.reduce((playerSum, player) => playerSum + player.rating, 0) / game.playerStats.length
            : 7.0;
          return sum + avgPlayerRating;
        }, 0) / allGames.length : 7.0,
      currentStreak: calculateCurrentStreak(allGames)
    };
  };

  const calculateCurrentStreak = (games: GameResult[]): number => {
    if (games.length === 0) return 0;
    
    let streak = 0;
    const sortedGames = [...games].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    for (const game of sortedGames) {
      if (game.result === 'win') {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="lg:ml-64 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-3 p-4 bg-fifa-gradient rounded-3xl shadow-2xl">
              <Trophy className="h-8 w-8 text-white" />
              <h1 className="text-3xl lg:text-4xl font-bold text-white">
                FUT Champions Insights Hub
              </h1>
            </div>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Track, analyze, and dominate your FUT Champions journey with AI-powered insights and comprehensive performance analytics.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
            <StatCard
              title="Total Games"
              value={stats.totalGames.toString()}
              icon={<Target className="h-6 w-6" />}
              trend={5}
              className="stat-card-gradient-blue"
            />
            <StatCard
              title="Total Wins"
              value={stats.totalWins.toString()}
              icon={<Trophy className="h-6 w-6" />}
              trend={10}
              className="stat-card-gradient-green"
            />
            <StatCard
              title="Total Goals"
              value={stats.totalGoals.toString()}
              icon={<Target className="h-6 w-6" />}
              trend={8}
              className="stat-card-gradient-gold"
            />
            <StatCard
              title="Avg Rating"
              value={stats.avgRating.toFixed(1)}
              icon={<Star className="h-6 w-6" />}
              trend={3}
              className="stat-card-gradient-purple"
            />
            <StatCard
              title="Win Streak"
              value={stats.currentStreak.toString()}
              icon={<TrendingUp className="h-6 w-6" />}
              trend={stats.currentStreak > 0 ? 15 : 0}
              className="stat-card-gradient-red"
            />
          </div>

          {/* Main Dashboard Carousel */}
          <DashboardCarousel 
            title="Performance Overview"
            weeklyData={weeklyData}
            currentWeek={currentWeek}
            enabledTiles={enabledTiles}
          />

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Recent Games */}
            <Card className="glass-card p-4 lg:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Recent Games</h3>
                <Link to="/current-week">
                  <Button variant="outline" size="sm" className="text-sm">View All</Button>
                </Link>
              </div>
              
              <div className="space-y-3">
                {recentGames.length > 0 ? (
                  recentGames.map((game) => (
                    <div key={game.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <Badge 
                          variant={game.result === 'win' ? 'default' : 'destructive'}
                          className="w-10 text-center flex-shrink-0"
                        >
                          {game.result === 'win' ? 'W' : 'L'}
                        </Badge>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{game.scoreLine}</p>
                          <p className="text-xs text-gray-400">Game {game.gameNumber}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-gray-400">Opponent Skill</p>
                        <p className="text-sm font-medium text-white">{game.opponentSkill}/10</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 lg:py-8 text-gray-400">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No games played yet</p>
                    <Link to="/current-week">
                      <Button variant="outline" size="sm" className="mt-2 text-sm">
                        Start First Game
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </Card>

            {/* Enhanced Quick Actions */}
            <Card className="glass-card p-4 lg:p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <Link to="/current-week" className="block">
                  <Button className="w-full justify-start bg-fifa-blue hover:bg-fifa-blue/80 text-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Record New Game
                  </Button>
                </Link>
                
                <Link to="/squads" className="block">
                  <Button variant="outline" className="w-full justify-start text-sm">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Squads
                  </Button>
                </Link>
                
                <Link to="/analytics" className="block">
                  <Button variant="outline" className="w-full justify-start text-sm">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Deep Analytics
                  </Button>
                </Link>
                
                <Link to="/insights" className="block">
                  <Button variant="outline" className="w-full justify-start text-sm">
                    <Trophy className="h-4 w-4 mr-2" />
                    AI Insights
                  </Button>
                </Link>

                {/* Achievement preview */}
                <div className="pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Latest Achievement</span>
                    <Badge className="bg-fifa-gold/20 text-fifa-gold border-fifa-gold/30">
                      <Award className="h-3 w-3 mr-1" />
                      {unlockedAchievements}
                    </Badge>
                  </div>
                  <p className="text-xs text-white">First Victory unlocked!</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Weekly Overview */}
          {currentWeek && (
            <WeeklyOverview 
              weekData={getCurrentWeekData()}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
