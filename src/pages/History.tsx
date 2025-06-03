import { useState } from 'react';
import Navigation from '@/components/Navigation';
import PlayerHistoryTable from '@/components/PlayerHistoryTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { WeeklyPerformance, GameResult } from '@/types/futChampions';
import { Search, Calendar, Trophy, Target, Clock, Star, Filter, Users, Trash2, StopCircle } from 'lucide-react';
import { calculateWeekRating, calculateGameRating } from '@/utils/gameRating';
import { useDataSync } from '@/hooks/useDataSync';
import { toast } from '@/hooks/use-toast';

const History = () => {
  const { weeklyData, setWeeklyData } = useDataSync();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResult, setFilterResult] = useState<'all' | 'win' | 'loss'>('all');
  const [filterWeek, setFilterWeek] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'score'>('date');
  const [viewMode, setViewMode] = useState<'weeks' | 'games' | 'players'>('weeks');
  const [deleteWeekDialog, setDeleteWeekDialog] = useState<{ isOpen: boolean; weekId: string | null }>({
    isOpen: false,
    weekId: null
  });
  const [endWeekDialog, setEndWeekDialog] = useState<{ isOpen: boolean; weekId: string | null }>({
    isOpen: false,
    weekId: null
  });

  const filteredWeeks = weeklyData.filter(week => {
    if (filterWeek !== 'all' && week.id !== filterWeek) return false;
    return week.weekNumber.toString().includes(searchTerm.toLowerCase());
  });

  const allGames = weeklyData.flatMap(week => 
    week.games.map(game => ({ ...game, weekNumber: week.weekNumber }))
  );

  const filteredGames = allGames.filter(game => {
    if (filterResult !== 'all' && game.result !== filterResult) return false;
    if (filterWeek !== 'all') {
      const week = weeklyData.find(w => w.id === filterWeek);
      if (!week || game.weekNumber !== week.weekNumber) return false;
    }
    return (
      game.gameNumber.toString().includes(searchTerm) ||
      game.scoreLine.includes(searchTerm) ||
      game.comments.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const sortedGames = [...filteredGames].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'rating':
        const ratingA = a.playerStats?.reduce((sum, p) => sum + p.rating, 0) / (a.playerStats?.length || 1) || 0;
        const ratingB = b.playerStats?.reduce((sum, p) => sum + p.rating, 0) / (b.playerStats?.length || 1) || 0;
        return ratingB - ratingA;
      case 'score':
        const week = weeklyData.find(w => w.weekNumber === a.weekNumber);
        const gameRatingA = week ? calculateGameRating(a as GameResult, week) : { score: 0 };
        const gameRatingB = week ? calculateGameRating(b as GameResult, week) : { score: 0 };
        return gameRatingB.score - gameRatingA.score;
      default:
        return 0;
    }
  });

  const handleDeleteWeek = (weekId: string) => {
    setDeleteWeekDialog({ isOpen: true, weekId });
  };

  const confirmDeleteWeek = () => {
    if (deleteWeekDialog.weekId) {
      const updatedWeeks = weeklyData.filter(week => week.id !== deleteWeekDialog.weekId);
      setWeeklyData(updatedWeeks);
      toast({
        title: "Week Deleted",
        description: "The week and all its games have been permanently deleted.",
      });
    }
    setDeleteWeekDialog({ isOpen: false, weekId: null });
  };

  const handleEndWeek = (weekId: string) => {
    setEndWeekDialog({ isOpen: true, weekId });
  };

  const confirmEndWeek = () => {
    if (endWeekDialog.weekId) {
      const updatedWeeks = weeklyData.map(week => 
        week.id === endWeekDialog.weekId 
          ? { ...week, isCompleted: true, endDate: new Date().toISOString() }
          : week
      );
      setWeeklyData(updatedWeeks);
      toast({
        title: "Week Ended",
        description: "The week has been marked as completed.",
      });
    }
    setEndWeekDialog({ isOpen: false, weekId: null });
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="lg:ml-64 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold gradient-text mb-2">Match History</h1>
            <p className="text-gray-400 text-sm">Review your past performance and analyze trends</p>
          </div>

          {/* Controls */}
          <Card className="glass-card mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
                {/* Search */}
                <div className="flex-1 min-w-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder={viewMode === 'weeks' ? "Search weeks..." : viewMode === 'games' ? "Search games..." : "Search players..."}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>

                {/* View Mode Toggle */}
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'weeks' ? 'default' : 'outline'}
                    onClick={() => setViewMode('weeks')}
                    size="sm"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Weeks
                  </Button>
                  <Button
                    variant={viewMode === 'games' ? 'default' : 'outline'}
                    onClick={() => setViewMode('games')}
                    size="sm"
                  >
                    <Trophy className="h-4 w-4 mr-2" />
                    Games
                  </Button>
                  <Button
                    variant={viewMode === 'players' ? 'default' : 'outline'}
                    onClick={() => setViewMode('players')}
                    size="sm"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Players
                  </Button>
                </div>

                {/* Filters - only for games view */}
                {viewMode === 'games' && (
                  <>
                    <Select value={filterResult} onValueChange={(value: any) => setFilterResult(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Results</SelectItem>
                        <SelectItem value="win">Wins Only</SelectItem>
                        <SelectItem value="loss">Losses Only</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">By Date</SelectItem>
                        <SelectItem value="rating">By Rating</SelectItem>
                        <SelectItem value="score">By Score</SelectItem>
                      </SelectContent>
                    </Select>
                  </>
                )}

                {viewMode !== 'players' && (
                  <Select value={filterWeek} onValueChange={setFilterWeek}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Weeks</SelectItem>
                      {weeklyData.map(week => (
                        <SelectItem key={week.id} value={week.id}>
                          Week {week.weekNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          {viewMode === 'players' ? (
            <PlayerHistoryTable weeklyData={weeklyData} />
          ) : viewMode === 'weeks' ? (
            <div className="grid gap-4 lg:gap-6">
              {filteredWeeks.length === 0 ? (
                <Card className="glass-card">
                  <CardContent className="p-8 text-center">
                    <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Weeks Found</h3>
                    <p className="text-gray-400">No weeks match your current search criteria.</p>
                  </CardContent>
                </Card>
              ) : (
                filteredWeeks.reverse().map(week => {
                  const weekRating = calculateWeekRating(week);
                  return (
                    <Card key={week.id} className="glass-card hover:shadow-2xl transition-all duration-300">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-white text-xl">Week {week.weekNumber}</CardTitle>
                            <p className="text-gray-400 text-sm">
                              {new Date(week.startDate).toLocaleDateString()} - 
                              {week.endDate ? new Date(week.endDate).toLocaleDateString() : 'Ongoing'}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex gap-2">
                              {!week.isCompleted && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEndWeek(week.id)}
                                  className="text-yellow-400 border-yellow-400 hover:bg-yellow-400/10"
                                >
                                  <StopCircle className="h-4 w-4 mr-1" />
                                  End Week
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteWeek(week.id)}
                                className="text-red-400 border-red-400 hover:bg-red-400/10"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-2">
                                <span 
                                  className="text-2xl font-bold px-3 py-1 rounded-lg"
                                  style={{ backgroundColor: weekRating.color, color: 'white' }}
                                >
                                  {weekRating.letter}
                                </span>
                                <span className="text-sm text-gray-400">{weekRating.score}/100</span>
                              </div>
                            </div>
                            <Badge className={week.isCompleted ? 'bg-green-600' : 'bg-yellow-600'}>
                              {week.isCompleted ? 'Completed' : 'In Progress'}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-white">{week.games.length}</div>
                            <div className="text-xs text-gray-400">Games</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-400">{week.totalWins}</div>
                            <div className="text-xs text-gray-400">Wins</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-fifa-gold">{week.totalGoals}</div>
                            <div className="text-xs text-gray-400">Goals</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-400">
                              {week.games.length > 0 ? (week.totalWins / week.games.length * 100).toFixed(0) : 0}%
                            </div>
                            <div className="text-xs text-gray-400">Win Rate</div>
                          </div>
                        </div>
                        
                        {week.currentRank && (
                          <div className="text-center">
                            <Badge className="bg-fifa-purple text-white">
                              Achieved: {week.currentRank}
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          ) : (
            <div className="grid gap-3">
              {sortedGames.length === 0 ? (
                <Card className="glass-card">
                  <CardContent className="p-8 text-center">
                    <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Games Found</h3>
                    <p className="text-gray-400">No games match your current search criteria.</p>
                  </CardContent>
                </Card>
              ) : (
                sortedGames.map(game => {
                  const week = weeklyData.find(w => w.weekNumber === game.weekNumber);
                  const gameRating = week ? calculateGameRating(game as GameResult, week) : { letter: 'F', score: 0, color: '#8B0000' };
                  const avgPlayerRating = game.playerStats?.reduce((sum, p) => sum + p.rating, 0) / (game.playerStats?.length || 1) || 0;
                  
                  return (
                    <Card key={game.id} className="glass-card hover:shadow-lg transition-all duration-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 min-w-0 flex-1">
                            <Badge 
                              variant={game.result === 'win' ? 'default' : 'destructive'}
                              className="w-12 text-center flex-shrink-0"
                            >
                              {game.result === 'win' ? 'W' : 'L'}
                            </Badge>
                            
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-white">Week {game.weekNumber}, Game {game.gameNumber}</span>
                                <span className="text-gray-400">•</span>
                                <span className="text-lg font-bold text-white">{game.scoreLine}</span>
                                {game.penaltyShootout && (
                                  <Badge variant="outline" className="text-xs">
                                    Pens: {game.penaltyShootout.userScore}-{game.penaltyShootout.opponentScore}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-400">
                                <span>Opponent: {game.opponentSkill}/10</span>
                                {game.time && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {game.time}
                                  </span>
                                )}
                                {avgPlayerRating > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Star className="h-3 w-3" />
                                    {avgPlayerRating.toFixed(1)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right flex-shrink-0">
                            <div className="flex items-center gap-2">
                              <span 
                                className="text-lg font-bold px-2 py-1 rounded"
                                style={{ backgroundColor: gameRating.color, color: 'white' }}
                              >
                                {gameRating.letter}
                              </span>
                              <span className="text-xs text-gray-400">{gameRating.score}</span>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {new Date(game.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        
                        {game.comments && (
                          <div className="mt-3 text-sm text-gray-300 bg-white/5 rounded p-2">
                            {game.comments}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          )}
        </div>
      </main>

      {/* Delete Week Confirmation Dialog */}
      <AlertDialog open={deleteWeekDialog.isOpen} onOpenChange={(open) => setDeleteWeekDialog({ isOpen: open, weekId: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Week</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this week and all its games? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteWeek} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* End Week Confirmation Dialog */}
      <AlertDialog open={endWeekDialog.isOpen} onOpenChange={(open) => setEndWeekDialog({ isOpen: open, weekId: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Week</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to end this week? This will mark it as completed and you won't be able to add more games to it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmEndWeek} className="bg-yellow-600 hover:bg-yellow-700">
              End Week
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default History;
