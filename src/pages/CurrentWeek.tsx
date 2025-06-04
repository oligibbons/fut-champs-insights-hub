
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
import CurrentRunStats from '@/components/CurrentRunStats';
import { Calendar, Plus, Edit, Target, Trophy, Settings } from 'lucide-react';

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
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fifa-blue mx-auto"></div>
              <p className="text-white mt-4">Loading your run data...</p>
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
            <div className="text-center py-12">
              <p className="text-white">Please log in to access your FUT Champions data.</p>
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
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-fifa-blue/20">
                <Calendar className="h-8 w-8 text-fifa-blue" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold text-white page-header">
                    {currentWeek?.customName || `Run ${currentWeek?.weekNumber || 1}`}
                  </h1>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRunNaming(true)}
                    className="text-gray-400 hover:text-white"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-gray-400 mt-1">
                  {currentWeek?.games?.length || 0}/15 games completed
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowTargetEdit(true)}
                className="flex items-center gap-2"
              >
                <Target className="h-4 w-4" />
                Edit Targets
              </Button>
              <Button 
                onClick={() => setShowGameForm(true)}
                className="modern-button-primary group"
                disabled={currentWeek?.isCompleted}
              >
                <Plus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                Record Game
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="stats" className="w-full">
            <TabsList className="grid w-full grid-cols-3 glass-card static-element">
              <TabsTrigger value="stats" className="data-[state=active]:bg-fifa-blue/20">
                <Trophy className="h-4 w-4 mr-2" />
                Current Run Stats
              </TabsTrigger>
              <TabsTrigger value="games" className="data-[state=active]:bg-fifa-blue/20">
                <Calendar className="h-4 w-4 mr-2" />
                Recent Games
              </TabsTrigger>
              <TabsTrigger value="targets" className="data-[state=active]:bg-fifa-blue/20">
                <Target className="h-4 w-4 mr-2" />
                Targets & Progress
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stats" className="space-y-4">
              <CurrentRunStats />
            </TabsContent>

            <TabsContent value="games" className="space-y-4">
              <Card className="glass-card static-element">
                <CardHeader>
                  <CardTitle className="text-white page-header">Recent Games</CardTitle>
                </CardHeader>
                <CardContent>
                  {currentWeek?.games && currentWeek.games.length > 0 ? (
                    <div className="space-y-3">
                      {currentWeek.games.slice().reverse().map((game, index) => (
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
                                <p className="text-sm text-gray-400">
                                  Game {game.gameNumber} 
                                  {game.crossPlayEnabled && <span className="ml-2 text-fifa-blue">• Cross-Play</span>}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="text-sm text-gray-400">Opponent Skill</p>
                                <p className="text-lg font-bold text-white">{game.opponentSkill}/10</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingGame(game)}
                                className="text-gray-400 hover:text-white"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
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

            <TabsContent value="targets" className="space-y-4">
              <Card className="glass-card static-element">
                <CardHeader>
                  <CardTitle className="text-white page-header">Weekly Targets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-white/5 rounded-lg">
                      <div className="text-2xl font-bold text-fifa-blue">
                        {currentWeek?.totalWins || 0}/{currentWeek?.winTarget?.wins || 10}
                      </div>
                      <div className="text-sm text-gray-400">Target Wins</div>
                    </div>
                    {currentWeek?.winTarget?.goalsScored && (
                      <div className="text-center p-4 bg-white/5 rounded-lg">
                        <div className="text-2xl font-bold text-fifa-green">
                          {currentWeek?.totalGoals || 0}/{currentWeek.winTarget.goalsScored}
                        </div>
                        <div className="text-sm text-gray-400">Target Goals</div>
                      </div>
                    )}
                    {currentWeek?.winTarget?.cleanSheets && (
                      <div className="text-center p-4 bg-white/5 rounded-lg">
                        <div className="text-2xl font-bold text-fifa-purple">
                          0/{currentWeek.winTarget.cleanSheets}
                        </div>
                        <div className="text-sm text-gray-400">Clean Sheets</div>
                      </div>
                    )}
                    {currentWeek?.winTarget?.minimumRank && (
                      <div className="text-center p-4 bg-white/5 rounded-lg">
                        <div className="text-lg font-bold text-fifa-gold">
                          {currentWeek.winTarget.minimumRank}
                        </div>
                        <div className="text-sm text-gray-400">Target Rank</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Modals */}
      {showGameForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <GameRecordForm
              onGameSaved={handleGameSubmit}
              gameNumber={(currentWeek?.games?.length || 0) + 1}
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
