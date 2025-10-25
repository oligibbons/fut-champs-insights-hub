import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { WeeklyPerformance, GameResult } from '@/types/futChampions';
import { Search, Calendar, Trophy, Users, Trash2, StopCircle, History as HistoryIcon, Star } from 'lucide-react';
import { useDataSync } from '@/hooks/useDataSync';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WeekCompletionPopup from '@/components/WeekCompletionPopup';
import GameCompletionPopup from '@/components/GameCompletionPopup';
import { useGameVersion } from '@/contexts/GameVersionContext';
import PlayerHistoryTable from '@/components/PlayerHistoryTable';
import ClubLegends from '@/components/ClubLegends';
import { useTheme } from '@/hooks/useTheme'; // Import useTheme

const History = () => {
  const { weeklyData, deleteWeek, endWeek } = useDataSync();
  const { gameVersion } = useGameVersion();
  const { currentTheme } = useTheme(); // Get theme
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResult, setFilterResult] = useState<'all' | 'win' | 'loss'>('all');
  const [filterWeek, setFilterWeek] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'score'>('date');
  const [viewMode, setViewMode] = useState<'weeks' | 'games' | 'players' | 'legends'>('weeks');
  
  const [deleteWeekDialog, setDeleteWeekDialog] = useState<{ isOpen: boolean; weekId: string | null }>({ isOpen: false, weekId: null });
  const [endWeekDialog, setEndWeekDialog] = useState<{ isOpen: boolean; weekId: string | null }>({ isOpen: false, weekId: null });
  
  const [selectedWeek, setSelectedWeek] = useState<WeeklyPerformance | null>(null);
  const [selectedGame, setSelectedGame] = useState<GameResult | null>(null);

  const gameVersionedData = useMemo(() => {
    return weeklyData.filter(week => week.game_version === gameVersion);
  }, [weeklyData, gameVersion]);

  const allGames = useMemo(() => gameVersionedData.flatMap(week => 
    week.games.map(game => ({ ...game, weekNumber: week.weekNumber, weekId: week.id }))
  ), [gameVersionedData]);

  const filteredAndSortedContent = useMemo(() => {
    if (viewMode === 'weeks') {
      return gameVersionedData.filter(week => {
          if (filterWeek !== 'all' && week.id !== filterWeek) return false;
          return week.weekNumber.toString().includes(searchTerm.toLowerCase()) || 
                 (week.customName && week.customName.toLowerCase().includes(searchTerm.toLowerCase()));
        }).sort((a, b) => b.weekNumber - a.weekNumber);
    }
    if (viewMode === 'games') {
        const filtered = allGames.filter(game => {
            if (filterResult !== 'all' && game.result !== filterResult) return false;
            if (filterWeek !== 'all' && game.weekId !== filterWeek) return false;
            return game.gameNumber.toString().includes(searchTerm) || game.scoreLine.includes(searchTerm);
        });

        return filtered.sort((a, b) => {
            if (sortBy === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
            return 0;
        });
    }
    return [];
  }, [viewMode, gameVersionedData, allGames, searchTerm, filterResult, filterWeek, sortBy]);


  const handleDeleteWeek = (weekId: string) => setDeleteWeekDialog({ isOpen: true, weekId });
  const confirmDeleteWeek = async () => {
    if (deleteWeekDialog.weekId) {
      await deleteWeek(deleteWeekDialog.weekId);
      toast({ title: "Week Deleted" });
    }
    setDeleteWeekDialog({ isOpen: false, weekId: null });
  };

  const handleEndWeek = (weekId: string) => setEndWeekDialog({ isOpen: true, weekId });
  const confirmEndWeek = async () => {
    if (endWeekDialog.weekId) {
      await endWeek(endWeekDialog.weekId);
      toast({ title: "Week Marked as Complete" });
    }
    setEndWeekDialog({ isOpen: false, weekId: null });
  };

  const getWeekStatsForGame = (game: GameResult) => {
      const week = gameVersionedData.find(w => w.id === (game as any).weekId);
      if (!week) return { winRate: 0, currentStreak: 0 };
      return {
          winRate: week.gamesPlayed > 0 ? (week.totalWins / week.gamesPlayed) * 100 : 0,
          currentStreak: week.currentStreak || 0
      }
  }
  
  const inputStyle = { 
    backgroundColor: currentTheme.colors.surface, 
    borderColor: currentTheme.colors.border,
    color: currentTheme.colors.text 
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl" style={{ backgroundColor: `${currentTheme.colors.primary}20` }}>
              <HistoryIcon className="h-8 w-8" style={{ color: currentTheme.colors.primary }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Match History
              </h1>
              <p className="text-gray-400 mt-1">Review your past performance and analyze trends for {gameVersion}</p>
            </div>
        </div>

        <Card className="glass-card rounded-2xl shadow-2xl border-0">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="pl-10"
                  style={inputStyle}
                />
              </div>
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
                <TabsList className="glass-card rounded-2xl shadow-xl border-0 p-2 h-auto">
                    <TabsTrigger value="weeks" className="rounded-xl"><Calendar className="h-4 w-4 mr-2"/>Weeks</TabsTrigger>
                    <TabsTrigger value="games" className="rounded-xl"><Trophy className="h-4 w-4 mr-2"/>Games</TabsTrigger>
                    <TabsTrigger value="players" className="rounded-xl"><Users className="h-4 w-4 mr-2"/>Players</TabsTrigger>
                    <TabsTrigger value="legends" className="rounded-xl"><Star className="h-4 w-4 mr-2"/>Legends</TabsTrigger>
                </TabsList>
              </Tabs>
              {viewMode === 'games' && (<Select value={filterResult} onValueChange={(v) => setFilterResult(v as any)}><SelectTrigger className="w-full md:w-[120px]" style={inputStyle}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="win">Wins</SelectItem><SelectItem value="loss">Losses</SelectItem></SelectContent></Select>)}
              {viewMode !== 'players' && viewMode !== 'legends' && (<Select value={filterWeek} onValueChange={setFilterWeek}><SelectTrigger className="w-full md:w-[150px]" style={inputStyle}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Weeks</SelectItem>{gameVersionedData.map(w => <SelectItem key={w.id} value={w.id}>Week {w.weekNumber}</SelectItem>)}</SelectContent></Select>)}
            </div>
          </CardContent>
        </Card>

        {viewMode === 'weeks' && (
            <div className="grid gap-6">
                {(filteredAndSortedContent as WeeklyPerformance[]).map(week => (
                    <Card key={week.id} className="glass-card rounded-2xl shadow-2xl border-0 hover:bg-white/10 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="cursor-pointer" onClick={() => setSelectedWeek(week)}>
                                <CardTitle className="text-white">{week.customName || `Week ${week.weekNumber}`}</CardTitle>
                                <p className="text-sm text-gray-400">{new Date(week.startDate).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {!week.isCompleted && <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleEndWeek(week.id); }}><StopCircle className="h-4 w-4 mr-2" /> End Week</Button>}
                                <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteWeek(week.id); }}><Trash2 className="h-4 w-4 mr-2" /> Delete</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div><p className="text-2xl font-bold text-white">{week.gamesPlayed}</p><p className="text-xs text-gray-400">Games</p></div>
                            <div><p className="text-2xl font-bold text-green-500">{week.totalWins}</p><p className="text-xs text-gray-400">Wins</p></div>
                            <div><p className="text-2xl font-bold text-white">{week.gamesPlayed > 0 ? ((week.totalWins / week.gamesPlayed) * 100).toFixed(0) : 0}%</p><p className="text-xs text-gray-400">Win Rate</p></div>
                            <div><p className="text-2xl font-bold text-white">{week.totalGoals}</p><p className="text-xs text-gray-400">Goals</p></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )}
        {viewMode === 'games' && (
            <Card className="glass-card rounded-2xl shadow-2xl border-0">
                <CardContent className="p-4 space-y-2">
                    {(filteredAndSortedContent as (GameResult & {weekNumber: number, weekId: string})[]).map(game => (
                        <div key={game.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10" onClick={() => setSelectedGame(game)}>
                            <div className="flex items-center gap-4">
                                <Badge variant={game.result === 'win' ? 'default' : 'destructive'}>{game.result.toUpperCase()}</Badge>
                                <div>
                                    <p className="font-semibold text-white">Week {game.weekNumber}, Game {game.gameNumber}: <span className="font-mono">{game.scoreLine}</span></p>
                                    <p className="text-xs text-gray-400">vs Skill: {game.opponentSkill}/10</p>
                                </div>
                            </div>
                            <span className="text-xs text-gray-400">{new Date(game.date).toLocaleDateString()}</span>
                        </div>
                    ))}
                </CardContent>
            </Card>
        )}
        {viewMode === 'players' && <PlayerHistoryTable weeklyData={gameVersionedData} />}
        {viewMode === 'legends' && <ClubLegends />}
      </div>

      <AlertDialog open={deleteWeekDialog.isOpen} onOpenChange={(open) => setDeleteWeekDialog({ isOpen: open, weekId: null })}>
        <AlertDialogContent className="glass-card rounded-2xl shadow-2xl border-0">
            <AlertDialogHeader><AlertDialogTitle>Delete Week?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. All games within this week will be permanently deleted.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={confirmDeleteWeek}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={endWeekDialog.isOpen} onOpenChange={(open) => setEndWeekDialog({ isOpen: open, weekId: null })}>
        <AlertDialogContent className="glass-card rounded-2xl shadow-2xl border-0">
            <AlertDialogHeader><AlertDialogTitle>End Week?</AlertDialogTitle><AlertDialogDescription>This will mark the week as completed. You won't be able to add more games.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={confirmEndWeek}>End Week</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <WeekCompletionPopup isOpen={!!selectedWeek} onClose={() => setSelectedWeek(null)} weekData={selectedWeek} onNewWeek={() => {}}/>
      <GameCompletionPopup isOpen={!!selectedGame} onClose={() => setSelectedGame(null)} game={selectedGame} weekStats={selectedGame ? getWeekStatsForGame(selectedGame) : {winRate: 0, currentStreak: 0}} />
    </>
  );
};

export default History;
