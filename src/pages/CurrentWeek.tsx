import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import GameRecordForm from '@/components/GameRecordForm';
import WeekProgress from '@/components/WeekProgress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { WeeklyPerformance, GameResult } from '@/types/futChampions';
import { ArrowLeft, Trophy, Calendar, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CurrentWeek = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [weeklyData, setWeeklyData] = useLocalStorage<WeeklyPerformance[]>('futChampions_weeks', []);
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
      isCompleted: updatedGames.length >= 15,
      endDate: updatedGames.length >= 15 ? new Date().toISOString() : currentWeek.endDate
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
  const canAddGame = currentWeek && currentWeek.games.length < 15;

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="lg:ml-64 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate('/')}
                className="bg-white/10 border-white/20 text-white"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold gradient-text">Current Week</h1>
                <p className="text-gray-400 mt-1">Track your FUT Champions performance</p>
              </div>
            </div>

            {canAddGame && !showGameForm && (
              <Button 
                onClick={() => setShowGameForm(true)}
                className="bg-fifa-gradient hover:shadow-lg transition-all duration-300"
              >
                <Trophy className="h-4 w-4 mr-2" />
                Record Game {nextGameNumber}
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Week Progress */}
            <div className="lg:col-span-1">
              <WeekProgress 
                weekData={currentWeek} 
                onNewWeek={createNewWeek}
              />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {showGameForm && canAddGame ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">Record New Game</h2>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowGameForm(false)}
                      className="bg-white/10 border-white/20 text-white"
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
                          <div key={game.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Badge 
                                variant={game.result === 'win' ? 'default' : 'destructive'}
                                className="w-12 text-center"
                              >
                                {game.result === 'win' ? 'W' : 'L'}
                              </Badge>
                              <div>
                                <p className="font-medium text-white">Game {game.gameNumber}</p>
                                <p className="text-sm text-gray-400">{game.scoreLine}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-white">Opponent: {game.opponentSkill}/10</p>
                              <p className="text-xs text-gray-400">{game.gameContext.replace('_', ' ')}</p>
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
                            className="mt-2 bg-white/10 border-white/20 text-white"
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
