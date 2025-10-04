import { useState } from 'react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Loader2, Trophy, BarChart2, Calendar, GaugeCircle, Bot, Star, ListChecks } from 'lucide-react';
import GameRecordForm from '@/components/GameRecordForm';
import WeekProgress from '@/components/WeekProgress';
import CurrentRunStats from '@/components/CurrentRunStats';
import { GameResult } from '@/types/futChampions';
import CPSGauge from '@/components/CPSGauge';
import { Skeleton } from '@/components/ui/skeleton';
import TopPerformers from '@/components/TopPerformers';
import AIInsights from '@/pages/AIInsights'; // Re-integrated AI Insights

const CurrentWeek = () => {
  const { weeklyData, createWeek, saveGame, loading, refreshData } = useSupabaseData();
  const [isLoggingGame, setIsLoggingGame] = useState(false);

  const currentWeek = weeklyData.find(w => !w.isCompleted) || null;

  const handleCreateWeek = async () => {
    const nextWeekNumber = weeklyData.length > 0 ? Math.max(...weeklyData.map(w => w.weekNumber)) + 1 : 1;
    await createWeek({ weekNumber: nextWeekNumber, startDate: new Date().toISOString() });
  };

  const handleSaveGame = async (gameData: Omit<GameResult, 'id'>) => {
    if (currentWeek) {
      await saveGame(currentWeek.id, gameData);
      setIsLoggingGame(false);
      await refreshData();
    }
  };

  const StatCard = ({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ElementType }) => (
    <Card className="bg-secondary/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-8 w-20 mt-1" /> : <div className="text-2xl font-bold">{value}</div>}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!currentWeek) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold mb-4">No Active Champs Run</h2>
        <p className="text-muted-foreground mb-6">Start your new Weekend League run to begin tracking.</p>
        <Button onClick={handleCreateWeek}><Plus className="mr-2 h-4 w-4" /> Start New Run</Button>
      </div>
    );
  }

  const winRate = currentWeek.gamesPlayed > 0 ? Math.round((currentWeek.totalWins / currentWeek.gamesPlayed) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{currentWeek.customName || `Week ${currentWeek.weekNumber} Run`}</h1>
        <p className="text-muted-foreground">Your live hub for the current Weekend League.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Current Record" value={`${currentWeek.totalWins}-${currentWeek.totalLosses}`} icon={Trophy} />
        <StatCard title="Win Rate" value={`${winRate}%`} icon={BarChart2} />
        <StatCard title="Games Played" value={currentWeek.gamesPlayed} icon={Calendar} />
        <Card className="flex flex-col items-center justify-center bg-secondary/50">
           <CPSGauge games={currentWeek.games} size={100} />
        </Card>
      </div>

      <WeekProgress wins={currentWeek.totalWins} losses={currentWeek.totalLosses} target={currentWeek.winTarget?.wins || 20} />

      {isLoggingGame ? (
        <GameRecordForm
          weekId={currentWeek.id}
          nextGameNumber={currentWeek.games.length + 1}
          onSave={handleSaveGame}
          onCancel={() => setIsLoggingGame(false)}
        />
      ) : (
        <div className="text-center">
          <Button size="lg" onClick={() => setIsLoggingGame(true)}><Plus className="mr-2 h-4 w-4" /> Log Next Game</Button>
        </div>
      )}

      {/* --- Restored & Enhanced Analytics Tabs --- */}
      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="stats"><BarChart3 className="h-4 w-4 mr-2" />Run Stats</TabsTrigger>
          <TabsTrigger value="gamelog"><ListChecks className="h-4 w-4 mr-2" />Game Log</TabsTrigger>
          <TabsTrigger value="performers"><Star className="h-4 w-4 mr-2" />Top Performers</TabsTrigger>
          <TabsTrigger value="insights"><Bot className="h-4 w-4 mr-2" />AI Insights</TabsTrigger>
        </TabsList>
        <TabsContent value="stats" className="mt-4">
          <CurrentRunStats week={currentWeek} />
        </TabsContent>
        <TabsContent value="gamelog" className="mt-4">
            <Card>
                <CardHeader><CardTitle>Game Log</CardTitle></CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {currentWeek.games.map(game => (
                            <div key={game.id} className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <span className={`font-bold ${game.result === 'win' ? 'text-green-500' : 'text-red-500'}`}>{game.result.toUpperCase()}</span>
                                    <span>Game {game.gameNumber}</span>
                                    <span className="font-mono">{game.scoreLine}</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    vs Skill: {game.opponentSkill}/10
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="performers" className="mt-4">
          {/* Pass the games from the current week only */}
          <TopPerformers games={currentWeek.games} />
        </TabsContent>
        <TabsContent value="insights" className="mt-4">
          {/* The AI Insights component will use its own data hooks, which respect the game version */}
          <AIInsights />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CurrentWeek;
