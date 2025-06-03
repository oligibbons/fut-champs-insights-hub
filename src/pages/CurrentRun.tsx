import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { WeeklyPerformance, GameResult, UserSettings } from '@/types/futChampions';
import { useAchievementNotifications } from '@/hooks/useAchievementNotifications';
import { generateAIInsights } from '@/utils/aiInsights';
import Navigation from '@/components/Navigation';
import GameRecordForm from '@/components/GameRecordForm';
import WeekProgress from '@/components/WeekProgress';
import GameCompletionModal from '@/components/GameCompletionModal';
import { Calendar, Plus, BarChart3, Trophy, Target, TrendingUp } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

const CurrentRun = () => {
  const { currentTheme } = useTheme();
  const [weeklyData, setWeeklyData] = useLocalStorage<WeeklyPerformance[]>('futChampions_weeks', []);
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

  const [showGameForm, setShowGameForm] = useState(false);
  const [gameCompletionModal, setGameCompletionModal] = useState<{
    isOpen: boolean;
    game: GameResult | null;
    weekStats: {
      totalGames: number;
      wins: number;
      losses: number;
      winRate: number;
      currentStreak: number;
    } | null;
  }>({
    isOpen: false,
    game: null,
    weekStats: null
  });
  
  const { checkAndNotifyAchievements, notifyGameFeedback } = useAchievementNotifications();

  // Get or create current run
  const getCurrentRun = (): WeeklyPerformance => {
    const existingRun = weeklyData.find(week => !week.isCompleted);
    if (existingRun) {
      return existingRun;
    }

    const newRun: WeeklyPerformance = {
      id: `week-${Date.now()}`,
      weekNumber: weeklyData.length + 1,
      startDate: new Date().toISOString(),
      endDate: '',
      games: [],
      totalWins: 0,
      totalLosses: 0,
      totalGoals: 0,
      totalConceded: 0,
      totalExpectedGoals: 0,
      totalExpectedGoalsAgainst: 0,
      averageOpponentSkill: 0,
      squadUsed: '',
      weeklyRating: 0,
      isCompleted: false,
      bestStreak: 0,
      worstStreak: 0,
      currentStreak: 0,
      gamesPlayed: 0,
      weekScore: 0,
      totalPlayTime: 0,
      averageGameDuration: 0
    };

    setWeeklyData([...weeklyData, newRun]);
    return newRun;
  };

  const currentRun = getCurrentRun();

  const handleGameSubmit = (gameData: any) => {
    const newGame: GameResult = {
      ...gameData,
      id: `game-${Date.now()}`,
      date: new Date().toISOString(),
      gameNumber: currentRun.games.length + 1,
    };

    const updatedGames = [...currentRun.games, newGame];
    const updatedRun: WeeklyPerformance = {
      ...currentRun,
      games: updatedGames,
      totalWins: updatedGames.filter(g => g.result === 'win').length,
      totalLosses: updatedGames.filter(g => g.result === 'loss').length,
      totalGoals: updatedGames.reduce((sum, g) => {
        const [goals] = g.scoreLine.split('-').map(Number);
        return sum + goals;
      }, 0),
      totalConceded: updatedGames.reduce((sum, g) => {
        const [, conceded] = g.scoreLine.split('-').map(Number);
        return sum + conceded;
      }, 0),
      averageOpponentSkill: updatedGames.reduce((sum, g) => sum + g.opponentSkill, 0) / updatedGames.length,
      totalPlayTime: updatedGames.reduce((sum, g) => sum + g.duration, 0),
      averageGameDuration: updatedGames.reduce((sum, g) => sum + g.duration, 0) / updatedGames.length,
      isCompleted: updatedGames.length >= settings.gamesPerWeek,
      gamesPlayed: updatedGames.length,
      currentStreak: calculateCurrentStreak(updatedGames)
    };

    const updatedWeeklyData = weeklyData.map(week => 
      week.id === currentRun.id ? updatedRun : week
    );

    setWeeklyData(updatedWeeklyData);

    // Show completion modal with enhanced stats
    const weekStats = {
      totalGames: updatedRun.games.length,
      wins: updatedRun.totalWins,
      losses: updatedRun.totalLosses,
      winRate: updatedRun.games.length > 0 ? (updatedRun.totalWins / updatedRun.games.length) * 100 : 0,
      currentStreak: calculateCurrentStreak(updatedRun.games)
    };

    setGameCompletionModal({
      isOpen: true,
      game: newGame,
      weekStats: weekStats
    });

    // Check achievements and provide feedback
    checkAndNotifyAchievements(updatedWeeklyData, updatedRun);
    notifyGameFeedback(newGame, updatedRun);

    setShowGameForm(false);
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

  const handleNewRun = () => {
    // This function will be implemented when needed
    console.log('New run requested');
  };

  // Generate AI insights for current run
  const runInsights = generateAIInsights(weeklyData, currentRun, currentRun.games.slice(-10));

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="lg:ml-20 lg:hover:ml-64 transition-all duration-500 p-4 lg:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl" style={{ backgroundColor: `${currentTheme.colors.primary}20` }}>
                <Calendar className="h-8 w-8" style={{ color: currentTheme.colors.primary }} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white page-header">Run {currentRun.weekNumber}</h1>
                <p className="text-gray-400 mt-1">
                  {currentRun.games.length}/{settings.gamesPerWeek} games completed
                </p>
              </div>
            </div>
            
            <Button 
              onClick={() => setShowGameForm(true)}
              className="modern-button-primary group"
              disabled={currentRun.isCompleted}
            >
              <Plus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
              Record Game
            </Button>
          </div>

          {/* Run Progress */}
          <WeekProgress 
            weekData={currentRun}
            onNewWeek={handleNewRun}
          />

          {/* Enhanced Content */}
          <Tabs defaultValue="games" className="w-full">
            <TabsList className="grid w-full grid-cols-3 glass-card static-element">
              <TabsTrigger value="games" className="data-[state=active]:bg-fifa-blue/20">
                <Trophy className="h-4 w-4 mr-2" />
                Games
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-fifa-blue/20">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="insights" className="data-[state=active]:bg-fifa-blue/20">
                <Target className="h-4 w-4 mr-2" />
                AI Insights
              </TabsTrigger>
            </TabsList>

            <TabsContent value="games" className="space-y-4">
              <Card className="glass-card static-element">
                <CardHeader>
                  <CardTitle className="text-white page-header">Recent Games</CardTitle>
                </CardHeader>
                <CardContent>
                  {currentRun.games.length > 0 ? (
                    <div className="space-y-3">
                      {currentRun.games.slice().reverse().map((game, index) => (
                        <div key={game.id} 
                             className={`p-4 rounded-2xl border transition-colors duration-300 static-element ${
                               game.result === 'win' 
                                 ? 'bg-gradient-to-r from-green-500/20 to-green-600/10 border-green-500/30' 
                                 : 'bg-gradient-to-r from-red-500/20 to-red-600/10 border-red-500/30'
                             }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                game.result === 'win' ? 'bg-green-500' : 'bg-red-500'
                              }`}>
                                <span className="text-white font-bold">
                                  {game.result === 'win' ? '🏆' : '❌'}
                                </span>
                              </div>
                              <div>
                                <p className="text-lg font-bold text-white">{game.scoreLine}</p>
                                <p className="text-sm text-gray-400">Game {game.gameNumber}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-400">Opponent Skill</p>
                              <p className="text-lg font-bold text-white">{game.opponentSkill}/10</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-500" />
                      <h3 className="text-xl font-semibold text-white mb-2">No Games Yet</h3>
                      <p className="text-gray-400 mb-4">Start your run by recording your first game</p>
                      <Button onClick={() => setShowGameForm(true)} className="modern-button-primary">
                        <Plus className="h-4 w-4 mr-2" />
                        Record First Game
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="metric-card">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">{currentRun.totalWins}</div>
                    <div className="text-sm text-gray-400">Wins</div>
                  </CardContent>
                </Card>
                
                <Card className="metric-card">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-red-400 mb-2">{currentRun.totalLosses}</div>
                    <div className="text-sm text-gray-400">Losses</div>
                  </CardContent>
                </Card>
                
                <Card className="metric-card">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">{currentRun.totalGoals}</div>
                    <div className="text-sm text-gray-400">Goals Scored</div>
                  </CardContent>
                </Card>
                
                <Card className="metric-card">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-yellow-400 mb-2">
                      {currentRun.games.length > 0 ? currentRun.averageOpponentSkill.toFixed(1) : '0.0'}
                    </div>
                    <div className="text-sm text-gray-400">Avg Opponent</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    AI Performance Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {runInsights.length > 0 ? (
                    <div className="space-y-4">
                      {runInsights.slice(0, 10).map((insight, index) => (
                        <div key={insight.id} 
                             className={`p-4 rounded-2xl border transition-all duration-500 hover:scale-105 ${
                               insight.category === 'strength' 
                                 ? 'bg-gradient-to-r from-green-500/20 to-green-600/10 border-green-500/30'
                                 : insight.category === 'weakness'
                                 ? 'bg-gradient-to-r from-red-500/20 to-red-600/10 border-red-500/30'
                                 : 'bg-gradient-to-r from-blue-500/20 to-blue-600/10 border-blue-500/30'
                             }`}
                             style={{ animationDelay: `${index * 100}ms` }}>
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${
                              insight.category === 'strength' ? 'bg-green-500/30' :
                              insight.category === 'weakness' ? 'bg-red-500/30' : 'bg-blue-500/30'
                            }`}>
                              {insight.category === 'strength' ? '💪' : 
                               insight.category === 'weakness' ? '⚠️' : '📊'}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-white mb-1">{insight.title}</h4>
                              <p className="text-gray-300 text-sm">{insight.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  insight.priority === 'high' ? 'bg-red-500/30 text-red-300' :
                                  insight.priority === 'medium' ? 'bg-yellow-500/30 text-yellow-300' :
                                  'bg-green-500/30 text-green-300'
                                }`}>
                                  {insight.priority}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {insight.confidence}% confidence
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-500" />
                      <h3 className="text-xl font-semibold text-white mb-2">No Insights Yet</h3>
                      <p className="text-gray-400">Play some games to receive AI-powered insights</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Game Recording Modal */}
      {showGameForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <GameRecordForm
              onGameSaved={handleGameSubmit}
              gameNumber={currentRun.games.length + 1}
            />
            <Button 
              onClick={() => setShowGameForm(false)}
              variant="outline"
              className="mt-4 w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Enhanced Game Completion Modal */}
      <GameCompletionModal
        isOpen={gameCompletionModal.isOpen}
        onClose={() => setGameCompletionModal({ isOpen: false, game: null, weekStats: null })}
        game={gameCompletionModal.game}
        weekStats={gameCompletionModal.weekStats}
      />
    </div>
  );
};

export default CurrentRun;
