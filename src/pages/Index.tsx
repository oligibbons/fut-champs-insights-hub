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
import { useAchievementNotifications } from '@/hooks/useAchievementNotifications';
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
import { useTheme } from '@/hooks/useTheme';

const Index = () => {
  const { currentTheme } = useTheme();
  const [weeklyData] = useLocalStorage<WeeklyPerformance[]>('futChampions_weeks', []);
  const { notifyMilestone } = useAchievementNotifications();
  
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

      // Check for major milestones and notify
      if (totalGames === 50) {
        notifyMilestone('Veteran Status', 'You\'ve played 50 games!');
      } else if (totalGames === 100) {
        notifyMilestone('Centurion', 'You\'ve reached 100 games!');
      } else if (totalGoals === 100) {
        notifyMilestone('Goal Machine', 'You\'ve scored 100 goals!');
      } else if (weeklyData.length === 10) {
        notifyMilestone('Dedicated Player', 'You\'ve completed 10 weeks!');
      }
    }
  }, [weeklyData, notifyMilestone]);

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
    const totalGames = allGames.length;
    const totalWins = weeklyData.reduce((sum, week) => sum + week.totalWins, 0);
    const winRate = totalGames > 0 ? (totalWins / totalGames) * 100 : 0;
    const totalGoals = weeklyData.reduce((sum, week) => sum + week.totalGoals, 0);
    const avgGoalsPerGame = totalGames > 0 ? totalGoals / totalGames : 0;
    
    return {
      totalGames,
      totalWins,
      totalGoals,
      winRate,
      avgGoalsPerGame,
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
            <div className="inline-flex items-center gap-4 p-6 rounded-3xl shadow-2xl animate-fade-in" 
                 style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}>
              <img 
                src="/lovable-uploads/6b6465f4-e466-4f3b-9761-8a829fbe395c.png" 
                alt="FUTALYST Logo" 
                className="w-12 h-12 object-contain floating-element"
              />
              <h1 className="text-3xl lg:text-4xl font-bold gradient-text">
                FUTALYST Analytics Hub
              </h1>
            </div>
            <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: currentTheme.colors.muted }}>
              Master your FUT Champions journey with AI-powered insights, comprehensive analytics, and data-driven performance optimization.
            </p>
          </div>

          {/* Quick Stats Grid with Enhanced Animations */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 stagger-animation">
            <StatCard
              title="Total Games"
              value={stats.totalGames.toString()}
              icon={<Target className="h-6 w-6" />}
              trend={5}
              className="stat-card-gradient-blue hover-scale glow-effect"
            />
            <StatCard
              title="Total Wins"
              value={stats.totalWins.toString()}
              icon={<Trophy className="h-6 w-6" />}
              trend={10}
              className="stat-card-gradient-green hover-scale glow-effect"
            />
            <StatCard
              title="Total Goals"
              value={stats.totalGoals.toString()}
              icon={<Target className="h-6 w-6" />}
              trend={8}
              className="stat-card-gradient-gold hover-scale glow-effect"
            />
            <StatCard
              title="Avg Rating"
              value={stats.avgRating.toFixed(1)}
              icon={<Star className="h-6 w-6" />}
              trend={3}
              className="stat-card-gradient-purple hover-scale glow-effect"
            />
            <StatCard
              title="Win Streak"
              value={stats.currentStreak.toString()}
              icon={<TrendingUp className="h-6 w-6" />}
              trend={stats.currentStreak > 0 ? 15 : 0}
              className="stat-card-gradient-red hover-scale glow-effect"
            />
          </div>

          {/* Enhanced Dashboard Carousel */}
          <DashboardCarousel 
            title="Performance Analytics Dashboard"
            weeklyData={weeklyData}
            currentWeek={currentWeek}
            enabledTiles={enabledTiles}
          />

          {/* Enhanced Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Recent Games with Celebratory Effects */}
            <Card className="glass-card hover-scale" 
                  style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}>
              <div className="p-4 lg:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold gradient-text">Recent Games</h3>
                  <Link to="/current-week">
                    <Button variant="outline" size="sm" className="modern-button-secondary">View All</Button>
                  </Link>
                </div>
                
                <div className="space-y-3">
                  {recentGames.length > 0 ? (
                    recentGames.map((game, index) => (
                      <div key={game.id} 
                           className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 animate-fade-in ${
                             game.result === 'win' ? 'bg-gradient-to-r from-green-500/20 to-green-600/10 animate-pulse-glow' : ''
                           }`}
                           style={{ 
                             backgroundColor: game.result === 'win' ? '' : currentTheme.colors.surface,
                             animationDelay: `${index * 100}ms`
                           }}>
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <Badge 
                            variant={game.result === 'win' ? 'default' : 'destructive'}
                            className={`w-10 text-center flex-shrink-0 ${
                              game.result === 'win' ? 'bg-gradient-to-r from-green-500 to-green-600 animate-pulse' : ''
                            }`}
                          >
                            {game.result === 'win' ? '🏆' : '❌'}
                          </Badge>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">{game.scoreLine}</p>
                            <p className="text-xs" style={{ color: currentTheme.colors.muted }}>Game {game.gameNumber}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs" style={{ color: currentTheme.colors.muted }}>Opponent</p>
                          <p className="text-sm font-medium text-white">{game.opponentSkill}/10</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 lg:py-8" style={{ color: currentTheme.colors.muted }}>
                      <Clock className="h-8 w-8 mx-auto mb-2 opacity-50 floating-element" />
                      <p className="text-sm">No games recorded yet</p>
                      <Link to="/current-week">
                        <Button variant="outline" size="sm" className="mt-2 modern-button-secondary">
                          Record First Game
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Enhanced Quick Actions */}
            <Card className="glass-card hover-scale" 
                  style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}>
              <div className="p-4 lg:p-6">
                <h3 className="text-lg font-semibold gradient-text mb-4">Quick Actions</h3>
                
                <div className="space-y-3">
                  <Link to="/current-week" className="block">
                    <Button className="w-full justify-start modern-button-primary group">
                      <Plus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                      Record New Game
                    </Button>
                  </Link>
                  
                  <Link to="/squads" className="block">
                    <Button variant="outline" className="w-full justify-start modern-button-secondary group">
                      <Users className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                      Manage Squads
                    </Button>
                  </Link>
                  
                  <Link to="/analytics" className="block">
                    <Button variant="outline" className="w-full justify-start modern-button-secondary group">
                      <BarChart3 className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                      Deep Analytics
                    </Button>
                  </Link>
                  
                  <Link to="/insights" className="block">
                    <Button variant="outline" className="w-full justify-start modern-button-secondary group">
                      <Trophy className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                      AI Insights
                    </Button>
                  </Link>

                  {/* Achievement preview with celebration */}
                  <div className="pt-2 border-t" style={{ borderColor: currentTheme.colors.border }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm gradient-text">Latest Achievement</span>
                      <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black animate-pulse">
                        <Award className="h-3 w-3 mr-1" />
                        {unlockedAchievements}
                      </Badge>
                    </div>
                    <p className="text-xs text-white">🎉 First Victory unlocked!</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Performance Insights Card */}
            <Card className="glass-card hover-scale" 
                  style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}>
              <div className="p-4 lg:p-6">
                <h3 className="text-lg font-semibold gradient-text mb-4">Performance Insights</h3>
                
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500/20 to-blue-600/10 border border-blue-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-blue-400" />
                      <span className="text-blue-400 font-medium text-sm">Latest Insight</span>
                    </div>
                    <p className="text-white text-sm">Your finishing has improved 23% this week!</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center p-2 bg-white/5 rounded-lg">
                      <p className="text-lg font-bold text-green-400">{stats.winRate.toFixed(0)}%</p>
                      <p className="text-xs text-gray-400">Win Rate</p>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded-lg">
                      <p className="text-lg font-bold text-blue-400">{stats.avgGoalsPerGame.toFixed(1)}</p>
                      <p className="text-xs text-gray-400">Goals/Game</p>
                    </div>
                  </div>
                  
                  <Link to="/insights" className="block">
                    <Button variant="outline" className="w-full text-sm modern-button-secondary">
                      View All Insights
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>

          {/* Weekly Overview */}
          {currentWeek && (
            <div className="animate-fade-in">
              <WeeklyOverview 
                weekData={getCurrentWeekData()}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
