
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { GameResult, WeeklyTarget } from '@/types/futChampions';
import Navigation from '@/components/Navigation';
import GameRecordForm from '@/components/GameRecordForm';
import GameCompletionModal from '@/components/GameCompletionModal';
import GameEditModal from '@/components/GameEditModal';
import RunNamingModal from '@/components/RunNamingModal';
import TargetEditModal from '@/components/TargetEditModal';
import WeeklyTargets from '@/components/WeeklyTargets';
import CurrentRunStats from '@/components/CurrentRunStats';
import { Calendar, Plus, Edit, Target, Trophy, Settings, PlayCircle, TrendingUp } from 'lucide-react';

const CurrentWeek = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    weeklyData, 
    loading, 
    saveGame, 
    createWeek, 
    updateWeek,
    updateGame,
    getCurrentWeek 
  } = useSupabaseData();

  const [showGameForm, setShowGameForm] = useState(false);
  const [editingGame, setEditingGame] = useState<GameResult | null>(null);
  const [showRunNaming, setShowRunNaming] = useState(false);
  const [showTargetEdit, setShowTargetEdit] = useState(false);
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

  // Get or create current week
  const currentWeek = getCurrentWeek();

  // Create initial week if none exists
  useEffect(() => {
    if (!loading && user && weeklyData.length === 0) {
      const newWeek = {
        weekNumber: 1,
        startDate: new Date().toISOString(),
        winTarget: {
          wins: 10,
          goalsScored: undefined,
          cleanSheets: undefined,
          minimumRank: undefined
        }
      };
      createWeek(newWeek);
    }
  }, [loading, user, weeklyData.length, createWeek]);

  const handleGameSubmit = async (gameData: Omit<GameResult, 'id'>) => {
    if (!currentWeek) {
      toast({
        title: "Error",
        description: "No active run found. Please create a new run first.",
        variant: "destructive"
      });
      return;
    }

    try {
      await saveGame(currentWeek.id, gameData);
      
      // Calculate updated stats
      const updatedGames = currentWeek.games.length + 1;
      const wins = currentWeek.totalWins + (gameData.result === 'win' ? 1 : 0);
      const losses = currentWeek.totalLosses + (gameData.result === 'loss' ? 1 : 0);
      
      // Show completion modal
      setGameCompletionModal({
        isOpen: true,
        game: { ...gameData, id: `temp-${Date.now()}` } as GameResult,
        weekStats: {
          totalGames: updatedGames,
          wins,
          losses,
          winRate: updatedGames > 0 ? (wins / updatedGames) * 100 : 0,
          currentStreak: gameData.result === 'win' ? 1 : 0 // Simplified for now
        }
      });

      setShowGameForm(false);
      
      toast({
        title: "Game Recorded",
        description: "Your game has been successfully recorded!",
      });
    } catch (error) {
      console.error('Error saving game:', error);
      toast({
        title: "Error",
        description: "Failed to save game. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditGame = async (updatedGame: GameResult) => {
    try {
      await updateGame(updatedGame.id, updatedGame);
      setEditingGame(null);
      
      toast({
        title: "Game Updated",
        description: "Game has been successfully updated!",
      });
    } catch (error) {
      console.error('Error updating game:', error);
      toast({
        title: "Error",
        description: "Failed to update game. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRunNameSave = async (name: string) => {
    if (!currentWeek) return;
    
    try {
      await updateWeek(currentWeek.id, { customName: name });
      toast({
        title: "Run Named",
        description: `Run renamed to "${name}"`,
      });
    } catch (error) {
      console.error('Error updating run name:', error);
      toast({
        title: "Error",
        description: "Failed to update run name. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleTargetSave = async (target: WeeklyTarget) => {
    if (!currentWeek) return;
    
    try {
      await updateWeek(currentWeek.id, { winTarget: target });
      toast({
        title: "Targets Updated",
        description: "Your targets have been successfully updated!",
      });
    } catch (error) {
      console.error('Error updating targets:', error);
      toast({
        title: "Error",
        description: "Failed to update targets. Please try again.",
        variant: "destructive"
      });
    }
  };

  const generateDefaultName = () => {
    const now = new Date();
    const month = now.toLocaleString('default', { month: 'long' });
    const year = now.getFullYear();
    const week = Math.ceil(now.getDate() / 7);
    return `${month} ${year} - Week ${week}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="lg:ml-20 lg:hover:ml-64 transition-all duration-500 p-4 lg:p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-fifa-blue mx-auto mb-6"></div>
              <h3 className="text-xl font-semibold text-white mb-2">Loading Your Run Data</h3>
              <p className="text-gray-400">Please wait while we fetch your Champions League progress...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="lg:ml-20 lg:hover:ml-64 transition-all duration-500 p-4 lg:p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col items-center justify-center py-20">
              <PlayCircle className="h-20 w-20 text-fifa-blue mb-6 opacity-50" />
              <h3 className="text-2xl font-semibold text-white mb-2">Authentication Required</h3>
              <p className="text-gray-400 text-center max-w-md">
                Please log in to access your FUT Champions data and start tracking your performance.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="lg:ml-20 lg:hover:ml-64 transition-all duration-500 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Enhanced Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-fifa-blue/20 to-fifa-purple/20 border border-fifa-blue/30">
                <Calendar className="h-8 w-8 text-fifa-blue" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-fifa-blue via-fifa-purple to-fifa-gold bg-clip-text text-transparent">
                    {currentWeek?.customName || `Run ${currentWeek?.weekNumber || 1}`}
                  </h1>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRunNaming(true)}
                    className="text-gray-400 hover:text-white p-1 h-auto"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                  <p className="text-gray-400">
                    {currentWeek?.games?.length || 0}/15 games completed
                  </p>
                  <div className="hidden sm:block w-1 h-1 bg-gray-500 rounded-full"></div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-fifa-green" />
                    <span className="text-fifa-green text-sm font-medium">
                      {currentWeek?.totalWins || 0}W - {currentWeek?.totalLosses || 0}L
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setShowTargetEdit(true)}
                className="text-fifa-purple border-fifa-purple/30 hover:bg-fifa-purple/10"
                size="lg"
              >
                <Target className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Edit Targets</span>
                <span className="sm:hidden">Targets</span>
              </Button>
              <Button 
                onClick={() => setShowGameForm(true)}
                className="bg-fifa-green hover:bg-fifa-green/80 text-white font-medium"
                disabled={currentWeek?.isCompleted}
                size="lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Record Game</span>
                <span className="sm:hidden">Record</span>
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="stats" className="w-full">
            <TabsList className="grid w-full grid-cols-3 glass-card static-element">
              <TabsTrigger value="stats" className="data-[state=active]:bg-fifa-blue/20 text-xs sm:text-sm">
                <Trophy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Current Run Stats</span>
                <span className="sm:hidden">Stats</span>
              </TabsTrigger>
              <TabsTrigger value="games" className="data-[state=active]:bg-fifa-blue/20 text-xs sm:text-sm">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Recent Games</span>
                <span className="sm:hidden">Games</span>
              </TabsTrigger>
              <TabsTrigger value="targets" className="data-[state=active]:bg-fifa-blue/20 text-xs sm:text-sm">
                <Target className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Targets & Progress</span>
                <span className="sm:hidden">Targets</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stats" className="space-y-4">
              <CurrentRunStats />
            </TabsContent>

            <TabsContent value="games" className="space-y-4">
              <Card className="glass-card static-element">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-fifa-blue" />
                    Recent Games
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentWeek?.games && currentWeek.games.length > 0 ? (
                    <div className="space-y-3">
                      {currentWeek.games.slice().reverse().map((game, index) => (
                        <div key={game.id} 
                             className={`p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.02] cursor-pointer static-element ${
                               game.result === 'win' 
                                 ? 'bg-gradient-to-r from-green-500/20 to-green-600/10 border-green-500/30 hover:border-green-500/50' 
                                 : 'bg-gradient-to-r from-red-500/20 to-red-600/10 border-red-500/30 hover:border-red-500/50'
                             }`}>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                game.result === 'win' ? 'bg-green-500' : 'bg-red-500'
                              }`}>
                                <span className="text-white font-bold text-lg">
                                  {game.result === 'win' ? '🏆' : '❌'}
                                </span>
                              </div>
                              <div>
                                <p className="text-xl font-bold text-white">{game.scoreLine}</p>
                                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
                                  <span>Game {game.gameNumber}</span>
                                  <span>•</span>
                                  <span>Opponent: {game.opponentSkill}/10</span>
                                  {game.crossPlayEnabled && (
                                    <>
                                      <span>•</span>
                                      <span className="text-fifa-blue">Cross-Platform</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingGame(game)}
                              className="text-gray-400 hover:text-white self-start sm:self-center"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <Calendar className="h-20 w-20 mx-auto mb-6 text-gray-500 opacity-50" />
                      <h3 className="text-2xl font-semibold text-white mb-3">No Games Yet</h3>
                      <p className="text-gray-400 mb-6 max-w-md mx-auto">
                        Start your Champions League run by recording your first game and tracking your performance
                      </p>
                      <Button 
                        onClick={() => setShowGameForm(true)} 
                        className="bg-fifa-green hover:bg-fifa-green/80 text-white font-medium"
                        size="lg"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Record First Game
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="targets" className="space-y-4">
              <WeeklyTargets />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Enhanced Game Form Modal */}
      {showGameForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900/95 backdrop-blur-md rounded-2xl border border-gray-700/50 w-full max-w-5xl max-h-[95vh] overflow-y-auto">
            <div className="p-6">
              <GameRecordForm
                onGameSaved={handleGameSubmit}
                gameNumber={(currentWeek?.games?.length || 0) + 1}
                onClose={() => setShowGameForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      <GameCompletionModal
        isOpen={gameCompletionModal.isOpen}
        onClose={() => setGameCompletionModal({ isOpen: false, game: null, weekStats: null })}
        game={gameCompletionModal.game}
        weekStats={gameCompletionModal.weekStats}
      />

      <GameEditModal
        game={editingGame}
        isOpen={!!editingGame}
        onClose={() => setEditingGame(null)}
        onSave={handleEditGame}
      />

      <RunNamingModal
        isOpen={showRunNaming}
        onClose={() => setShowRunNaming(false)}
        onSave={handleRunNameSave}
        currentName={currentWeek?.customName}
      />

      <TargetEditModal
        isOpen={showTargetEdit}
        onClose={() => setShowTargetEdit(false)}
        onSave={handleTargetSave}
        currentTarget={currentWeek?.winTarget}
      />
    </div>
  );
};

export default CurrentWeek;
