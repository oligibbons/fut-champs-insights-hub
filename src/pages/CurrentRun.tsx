
import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GameRecordForm from '@/components/GameRecordForm';
import CurrentRunStats from '@/components/CurrentRunStats';
import { useAccountData } from '@/hooks/useAccountData';
import { useTheme } from '@/hooks/useTheme';
import { Play, Plus, TrendingUp, BarChart3, Users, Trophy } from 'lucide-react';

const CurrentRun = () => {
  const { currentTheme } = useTheme();
  const { getCurrentWeek, addNewWeek } = useAccountData();
  const [showGameForm, setShowGameForm] = useState(false);
  
  const currentWeek = getCurrentWeek();

  const handleStartNewWeek = () => {
    addNewWeek();
  };

  const handleAddGame = () => {
    if (!currentWeek) {
      handleStartNewWeek();
    }
    setShowGameForm(true);
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="lg:ml-64 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
          {/* Header */}
          <div className="page-header">
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
              Current Run
            </h1>
            <p className="text-lg" style={{ color: currentTheme.colors.muted }}>
              Track your active Weekend League performance and stats
            </p>
          </div>

          {/* Quick Stats */}
          {currentWeek && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="metric-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Play className="h-4 w-4 text-fifa-blue" />
                    <span className="text-sm text-gray-400">Games</span>
                  </div>
                  <p className="text-2xl font-bold text-white mt-1">{currentWeek.games.length}/15</p>
                </CardContent>
              </Card>

              <Card className="metric-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-fifa-green" />
                    <span className="text-sm text-gray-400">Wins</span>
                  </div>
                  <p className="text-2xl font-bold text-fifa-green mt-1">{currentWeek.totalWins}</p>
                </CardContent>
              </Card>

              <Card className="metric-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-fifa-purple" />
                    <span className="text-sm text-gray-400">Streak</span>
                  </div>
                  <p className="text-2xl font-bold text-fifa-purple mt-1">{currentWeek.currentStreak || 0}</p>
                </CardContent>
              </Card>

              <Card className="metric-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-fifa-gold" />
                    <span className="text-sm text-gray-400">Win Rate</span>
                  </div>
                  <p className="text-2xl font-bold text-fifa-gold mt-1">
                    {currentWeek.games.length > 0 ? Math.round((currentWeek.totalWins / currentWeek.games.length) * 100) : 0}%
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Content */}
          {!currentWeek ? (
            <Card className="glass-card">
              <CardContent className="text-center py-16">
                <Trophy className="h-20 w-20 mx-auto mb-6 text-gray-400 opacity-50" />
                <h3 className="text-2xl font-bold text-white mb-4">No Active Weekend League</h3>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  Start a new Weekend League run to begin tracking your performance and statistics.
                </p>
                <Button 
                  onClick={handleStartNewWeek} 
                  size="lg"
                  className="bg-gradient-to-r from-fifa-blue to-fifa-purple hover:from-fifa-blue/80 hover:to-fifa-purple/80"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start New Weekend League
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="overview" className="space-y-6">
              <div className="flex items-center justify-between">
                <TabsList className="bg-white/10 backdrop-blur-sm border-white/20">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-fifa-blue">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="stats" className="data-[state=active]:bg-fifa-blue">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Detailed Stats
                  </TabsTrigger>
                  <TabsTrigger value="games" className="data-[state=active]:bg-fifa-blue">
                    <Play className="h-4 w-4 mr-2" />
                    Games
                  </TabsTrigger>
                </TabsList>

                <Button 
                  onClick={handleAddGame}
                  className="bg-gradient-to-r from-fifa-green to-fifa-blue hover:from-fifa-green/80 hover:to-fifa-blue/80"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Game
                </Button>
              </div>

              <TabsContent value="overview" className="space-y-6">
                <CurrentRunStats />
              </TabsContent>

              <TabsContent value="stats" className="space-y-6">
                <CurrentRunStats />
              </TabsContent>

              <TabsContent value="games" className="space-y-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-white">Games This Run</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {currentWeek.games.length > 0 ? (
                      <div className="space-y-3">
                        {currentWeek.games.map((game, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Badge variant={game.result === 'win' ? 'default' : 'destructive'}>
                                Game {index + 1}
                              </Badge>
                              <span className="text-white font-medium">{game.scoreLine}</span>
                              <Badge variant="outline" className="text-gray-400">
                                vs {game.opponentSkill}/10
                              </Badge>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-400">{new Date(game.date).toLocaleDateString()}</p>
                              <p className="text-xs text-gray-500">{game.duration} mins</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Play className="h-16 w-16 mx-auto mb-4 text-gray-400 opacity-50" />
                        <h3 className="text-xl font-medium text-white mb-2">No Games Yet</h3>
                        <p className="text-gray-400 mb-6">Start recording games to see them here.</p>
                        <Button onClick={handleAddGame} variant="outline">
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Game
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          {/* Game Recording Modal */}
          {showGameForm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-auto">
                <GameRecordForm 
                  onClose={() => setShowGameForm(false)}
                  weekId={currentWeek?.id}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CurrentRun;
