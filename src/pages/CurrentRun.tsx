
import { useState } from 'react';
import { useDataSync } from '@/hooks/useDataSync';
import Navigation from '@/components/Navigation';
import CurrentRunStats from '@/components/CurrentRunStats';
import GameRecordForm from '@/components/GameRecordForm';
import GameEditModal from '@/components/GameEditModal';
import RunNamingModal from '@/components/RunNamingModal';
import TargetEditModal from '@/components/TargetEditModal';
import DashboardSection from '@/components/DashboardSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Play, Edit3, Target, Calendar, Trophy, TrendingUp, Users, BarChart3 } from 'lucide-react';
import { GameResult, WeeklyTarget } from '@/types/futChampions';

const CurrentRun = () => {
  const { toast } = useToast();
  const { getCurrentWeek, weeklyData, setWeeklyData, settings } = useDataSync();
  const currentWeek = getCurrentWeek();
  
  const [showGameForm, setShowGameForm] = useState(false);
  const [editingGame, setEditingGame] = useState<GameResult | null>(null);
  const [showRunNaming, setShowRunNaming] = useState(false);
  const [showTargetEdit, setShowTargetEdit] = useState(false);

  const handleGameSaved = () => {
    setShowGameForm(false);
    toast({
      title: "Game Recorded!",
      description: "Your game has been successfully saved.",
    });
  };

  const handleGameEdit = (updatedGame: GameResult) => {
    if (!currentWeek) return;
    
    const updatedWeeks = weeklyData.map(week => {
      if (week.id === currentWeek.id) {
        const updatedGames = week.games.map(game =>
          game.id === updatedGame.id ? updatedGame : game
        );
        return { ...week, games: updatedGames };
      }
      return week;
    });
    
    setWeeklyData(updatedWeeks);
    setEditingGame(null);
  };

  const handleRunNameSave = (name: string) => {
    if (!currentWeek) return;
    
    const updatedWeeks = weeklyData.map(week =>
      week.id === currentWeek.id ? { ...week, customName: name } : week
    );
    
    setWeeklyData(updatedWeeks);
    toast({
      title: "Run Named",
      description: `Your run has been named: ${name}`,
    });
  };

  const handleTargetSave = (target: WeeklyTarget) => {
    if (!currentWeek) return;
    
    const updatedWeeks = weeklyData.map(week =>
      week.id === currentWeek.id ? { ...week, winTarget: target } : week
    );
    
    setWeeklyData(updatedWeeks);
    toast({
      title: "Targets Updated",
      description: "Your weekly targets have been updated.",
    });
  };

  const getRunDisplayName = () => {
    if (!currentWeek) return "No Active Run";
    if (currentWeek.customName) return currentWeek.customName;
    
    const now = new Date();
    const month = now.toLocaleString('default', { month: 'long' });
    const year = now.getFullYear();
    const week = Math.ceil(now.getDate() / 7);
    return `${month} ${year} - Week ${week}`;
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="lg:ml-20 lg:hover:ml-64 transition-all duration-500 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-fifa-blue/20 to-fifa-purple/20">
                <Play className="h-8 w-8 text-fifa-blue" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-fifa-blue via-fifa-purple to-fifa-gold bg-clip-text text-transparent">
                  Current Run
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-gray-400">{getRunDisplayName()}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRunNaming(true)}
                    className="text-fifa-blue hover:text-fifa-blue/80 p-1 h-auto"
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
            
            {currentWeek && (
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowTargetEdit(true)}
                  variant="outline"
                  className="text-fifa-purple border-fifa-purple/30 hover:bg-fifa-purple/10"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Edit Targets
                </Button>
                <Button
                  onClick={() => setShowGameForm(true)}
                  className="modern-button-primary"
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Record Game
                </Button>
              </div>
            )}
          </div>

          {currentWeek ? (
            <div className="space-y-8">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="metric-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-fifa-green text-sm">
                      <Trophy className="h-4 w-4" />
                      Games Played
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-fifa-green font-bold text-2xl">{currentWeek.games.length}/15</p>
                    <p className="text-xs text-gray-400">{15 - currentWeek.games.length} remaining</p>
                  </CardContent>
                </Card>

                <Card className="metric-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-fifa-blue text-sm">
                      <TrendingUp className="h-4 w-4" />
                      Current Record
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-fifa-blue font-bold text-2xl">{currentWeek.totalWins}W - {currentWeek.totalLosses}L</p>
                    <p className="text-xs text-gray-400">
                      {currentWeek.games.length > 0 ? `${Math.round((currentWeek.totalWins / currentWeek.games.length) * 100)}% win rate` : 'No games played'}
                    </p>
                  </CardContent>
                </Card>

                <Card className="metric-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-fifa-purple text-sm">
                      <BarChart3 className="h-4 w-4" />
                      Goal Difference
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`font-bold text-2xl ${(currentWeek.totalGoals - currentWeek.totalConceded) >= 0 ? 'text-fifa-green' : 'text-fifa-red'}`}>
                      {currentWeek.totalGoals - currentWeek.totalConceded > 0 ? '+' : ''}{currentWeek.totalGoals - currentWeek.totalConceded}
                    </p>
                    <p className="text-xs text-gray-400">{currentWeek.totalGoals} for, {currentWeek.totalConceded} against</p>
                  </CardContent>
                </Card>

                <Card className="metric-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-fifa-gold text-sm">
                      <Target className="h-4 w-4" />
                      Target Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-fifa-gold font-bold text-2xl">
                      {currentWeek.winTarget ? `${currentWeek.totalWins}/${currentWeek.winTarget.wins}` : 'None Set'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {currentWeek.winTarget ? `${currentWeek.winTarget.wins - currentWeek.totalWins} wins needed` : 'Click to set targets'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Games */}
              {currentWeek.games.length > 0 && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Recent Games
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {currentWeek.games.slice(-5).reverse().map((game) => (
                        <div key={game.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-3">
                            <Badge className={`${game.result === 'win' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                              Game {game.gameNumber}
                            </Badge>
                            <div>
                              <p className="font-medium text-white">{game.scoreLine}</p>
                              <p className="text-sm text-gray-400">
                                {game.result === 'win' ? 'Victory' : 'Defeat'} • {game.duration} mins • Opponent: {game.opponentSkill}/10
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingGame(game)}
                            className="text-fifa-blue hover:text-fifa-blue/80"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Detailed Analytics */}
              <DashboardSection settingKey="showCurrentRunStats" settingsSection="currentWeekSettings">
                <CurrentRunStats />
              </DashboardSection>

              {/* Game Recording Form */}
              {showGameForm && (
                <GameRecordForm
                  onGameSaved={handleGameSaved}
                  onClose={() => setShowGameForm(false)}
                  gameNumber={currentWeek.games.length + 1}
                  weekId={currentWeek.id}
                />
              )}
            </div>
          ) : (
            <Card className="glass-card">
              <CardContent className="text-center py-12">
                <Play className="h-16 w-16 mx-auto mb-4 text-gray-400 opacity-50" />
                <h3 className="text-xl font-medium text-white mb-2">No Active Run</h3>
                <p className="text-gray-400 mb-6">Start your Champions League run by recording your first game.</p>
                <Button onClick={() => setShowGameForm(true)} className="modern-button-primary">
                  <Trophy className="h-4 w-4 mr-2" />
                  Start New Run
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Modals */}
      <GameEditModal
        game={editingGame}
        isOpen={!!editingGame}
        onClose={() => setEditingGame(null)}
        onSave={handleGameEdit}
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

export default CurrentRun;
