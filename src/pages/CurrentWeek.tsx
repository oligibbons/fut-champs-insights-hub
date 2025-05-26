
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import GameRecordForm from '@/components/GameRecordForm';
import WeekProgress from '@/components/WeekProgress';
import CurrentWeekCarousel from '@/components/CurrentWeekCarousel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { WeeklyPerformance, GameResult, UserSettings } from '@/types/futChampions';
import { ArrowLeft, Trophy, Calendar, Target, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CurrentWeek = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [weeklyData, setWeeklyData] = useLocalStorage<WeeklyPerformance[]>('futChampions_weeks', []);
  const [settings] = useLocalStorage<UserSettings>('futChampions_settings', {
    preferredFormation: '4-3-3',
    trackingStartDate: new Date().toISOString().split('T')[0],
    gameplayStyle: 'balanced',
    notifications: true,
    gamesPerWeek: 15,
    dashboardSettings: {
      showTopPerformers: true,
      showXGAnalysis: true,
      showAIInsights: true,
      showFormAnalysis: true,
      showWeaknesses: true,
      showOpponentAnalysis: true,
      showPositionalAnalysis: true,
      showRecentTrends: true,
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
    }
  });
  const [currentWeek, setCurrentWeek] = useState<WeeklyPerformance | null>(null);
  const [showGameForm, setShowGameForm] = useState(false);

  useEffect(() => {
    // Find current active week or create one
    const activeWeek = weeklyData.find(week => !week.isCompleted);
    if (activeWeek) {
      setCurrentWeek(activeWeek);
    } else if (weeklyData.length === 0) {
      setCurrentWeek(null);
    }
  }, [weeklyData]);

  const createNewWeek = () => {
    const newWeekNumber = weeklyData.length + 1;
    const newWeek: WeeklyPerformance = {
      id: `week-${Date.now()}`,
      weekNumber: newWeekNumber,
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
      isCompleted: false
    };

    const updatedWeeks = [...weeklyData, newWeek];
    setWeeklyData(updatedWeeks);
    setCurrentWeek(newWeek);
    
    toast({
      title: "New Week Started",
      description: `Week ${newWeekNumber} has been created. Good luck!`,
    });
  };

  const handleGameSubmit = (gameData: Partial<GameResult>) => {
    if (!currentWeek) return;

    const newGame: GameResult = {
      id: `game-${Date.now()}`,
      weekId: currentWeek.id,
      ...gameData
    } as GameResult;

    const updatedGames = [...currentWeek.games, newGame];
    const wins = updatedGames.filter(game => game.result === 'win').length;
    const losses = updatedGames.filter(game => game.result === 'loss').length;
    const totalGoals = updatedGames.reduce((sum, game) => {
      const [goalsFor] = game.scoreLine.split('-').map(Number);
      return sum + goalsFor;
    }, 0);
    const totalConceded = updatedGames.reduce((sum, game) => {
      const [, goalsAgainst] = game.scoreLine.split('-').map(Number);
      return sum + goalsAgainst;
    }, 0);
    const avgOpponentSkill = updatedGames.reduce((sum, game) => sum + game.opponentSkill, 0) / updatedGames.length;

    const updatedWeek: WeeklyPerformance = {
      ...currentWeek,
      games: updatedGames,
      totalWins: wins,
      totalLosses: losses,
      totalGoals,
      totalConceded,
      totalExpectedGoals: updatedGames.reduce((sum, game) => sum + game.teamStats.expectedGoals, 0),
      totalExpectedGoalsAgainst: updatedGames.reduce((sum, game) => sum + game.teamStats.expectedGoalsAgainst, 0),
      averageOpponentSkill: avgOpponentSkill,
      isCompleted: updatedGames.length >= settings.gamesPerWeek,
      endDate: updatedGames.length >= settings.gamesPerWeek ? new Date().toISOString() : currentWeek.endDate
    };

    const updatedWeeks = weeklyData.map(week => 
      week.id === currentWeek.id ? updatedWeek : week
    );

    setWeeklyData(updatedWeeks);
    setCurrentWeek(updatedWeek);
    setShowGameForm(false);

    toast({
      title: "Game Recorded",
      description: `Game ${newGame.gameNumber} has been saved successfully!`,
    });

    if (updatedWeek.isCompleted) {
      toast({
        title: "Week Completed!",
        description: `Congratulations! You've finished Week ${updatedWeek.weekNumber} with ${wins} wins.`,
      });
    }
  };

  const nextGameNumber = currentWeek ? currentWeek.games.length + 1 : 1;
  const canAddGame = currentWeek && currentWeek.games.length < settings.gamesPerWeek;

  const enabledTiles = Object.entries(settings.currentWeekSettings)
    .filter(([_, enabled]) => enabled)
    .map(([key, _]) => key);

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="lg:ml-64 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate('/')}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Current Week</h1>
                <p className="text-gray-400 mt-1 text-sm">Track your FUT Champions performance</p>
              </div>
            </div>

            {canAddGame && !showGameForm && (
              <Button 
                onClick={() => setShowGameForm(true)}
                className="bg-fifa-gradient hover:shadow-lg transition-all duration-300 w-full sm:w-auto"
              >
                <Trophy className="h-4 w-4 mr-2" />
                Record Game {nextGameNumber}
              </Button>
            )}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Week Progress Sidebar */}
            <div className="xl:col-span-1">
              <WeekProgress 
                weekData={currentWeek} 
                onNewWeek={createNewWeek}
              />
            </div>

            {/* Main Content Area */}
            <div className="xl:col-span-3 space-y-6">
              {/* Current Week Analytics Carousel */}
              {currentWeek && currentWeek.games.length > 0 && (
                <CurrentWeekCarousel 
                  currentWeek={currentWeek}
                  enabledTiles={enabledTiles}
                />
              )}

              {/* Game Form or Recent Games */}
              {showGameForm && canAddGame ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h2 className="text-xl font-semibold text-white">Record New Game</h2>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowGameForm(false)}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20 w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                  </div>
                  <GameRecordForm 
                    gameNumber={nextGameNumber}
                    onSubmit={handleGameSubmit}
                  />
                </div>
              ) : (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Calendar className="h-5 w-5 text-fifa-blue" />
                      Recent Games
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {currentWeek && currentWeek.games.length > 0 ? (
                      <div className="space-y-3">
                        {currentWeek.games.slice(-5).reverse().map((game) => (
                          <div key={game.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white/5 rounded-lg gap-3">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <Badge 
                                variant={game.result === 'win' ? 'default' : 'destructive'}
                                className="w-12 text-center flex-shrink-0"
                              >
                                {game.result === 'win' ? 'W' : 'L'}
                              </Badge>
                              <div className="min-w-0">
                                <p className="font-medium text-white">Game {game.gameNumber}</p>
                                <p className="text-sm text-gray-400">{game.scoreLine}</p>
                                {game.playerStats && game.playerStats.length > 0 && (
                                  <p className="text-xs text-gray-500">
                                    {game.playerStats.reduce((total, player) => total + player.goals, 0)} goals scored
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-left sm:text-right flex-shrink-0">
                              <p className="text-sm text-white">Opponent: {game.opponentSkill}/10</p>
                              <p className="text-xs text-gray-400">{game.gameContext.replace('_', ' ')}</p>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-fifa-blue hover:text-fifa-blue hover:bg-fifa-blue/10 mt-1 h-auto p-1"
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No games recorded yet</p>
                        {currentWeek && (
                          <Button 
                            onClick={() => setShowGameForm(true)}
                            variant="outline" 
                            size="sm" 
                            className="mt-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
                          >
                            Record First Game
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CurrentWeek;
