
import { useState, useMemo } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSquadData } from '@/hooks/useSquadData';
import { useAccountData } from '@/hooks/useAccountData';
import { PlayerCard } from '@/types/squads';
import { Search, Users, Trophy, Target, Star, TrendingUp, Calendar, Award } from 'lucide-react';
import StatCard from '@/components/StatCard';

const Players = () => {
  const { players } = useSquadData();
  const { activeAccount } = useAccountData();
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [sortBy, setSortBy] = useState('averageRating');

  const filteredAndSortedPlayers = useMemo(() => {
    let filtered = players.filter(player => {
      const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPosition = positionFilter === 'all' || player.position === positionFilter;
      return matchesSearch && matchesPosition && player.gamesPlayed > 0;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'averageRating':
          return b.averageRating - a.averageRating;
        case 'gamesPlayed':
          return b.gamesPlayed - a.gamesPlayed;
        case 'goals':
          return b.goals - a.goals;
        case 'assists':
          return b.assists - a.assists;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [players, searchTerm, positionFilter, sortBy]);

  const topPerformers = useMemo(() => {
    const playersWithGames = players.filter(p => p.gamesPlayed >= 3);
    return {
      topRated: playersWithGames.sort((a, b) => b.averageRating - a.averageRating).slice(0, 5),
      topScorers: playersWithGames.sort((a, b) => b.goals - a.goals).slice(0, 5),
      topAssists: playersWithGames.sort((a, b) => b.assists - a.assists).slice(0, 5),
      mostUsed: playersWithGames.sort((a, b) => b.gamesPlayed - a.gamesPlayed).slice(0, 5)
    };
  }, [players]);

  const totalStats = useMemo(() => {
    return players.reduce((acc, player) => ({
      totalPlayers: acc.totalPlayers + (player.gamesPlayed > 0 ? 1 : 0),
      totalGames: acc.totalGames + player.gamesPlayed,
      totalGoals: acc.totalGoals + player.goals,
      totalAssists: acc.totalAssists + player.assists,
      avgRating: players.length > 0 ? players.reduce((sum, p) => sum + p.averageRating, 0) / players.length : 0
    }), {
      totalPlayers: 0,
      totalGames: 0,
      totalGoals: 0,
      totalAssists: 0,
      avgRating: 0
    });
  }, [players]);

  const positions = ['all', 'GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST'];

  const getPlayerCardColor = (rating: number) => {
    if (rating >= 8.0) return 'from-fifa-gold to-yellow-400';
    if (rating >= 7.5) return 'from-fifa-green to-green-400';
    if (rating >= 7.0) return 'from-fifa-blue to-blue-400';
    if (rating >= 6.5) return 'from-fifa-purple to-purple-400';
    return 'from-gray-500 to-gray-400';
  };

  const getPerformanceLevel = (rating: number) => {
    if (rating >= 8.0) return 'Elite';
    if (rating >= 7.5) return 'Excellent';
    if (rating >= 7.0) return 'Good';
    if (rating >= 6.5) return 'Average';
    return 'Poor';
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="lg:ml-64 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold gradient-text mb-3">Player Database</h1>
            <p className="text-gray-400 text-lg">Comprehensive player statistics for {activeAccount}</p>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Players"
              value={totalStats.totalPlayers}
              icon={<Users className="h-5 w-5 text-fifa-blue" />}
              className="glass-card rounded-3xl shadow-depth-lg border-0"
            />
            <StatCard
              title="Average Rating"
              value={totalStats.avgRating.toFixed(1)}
              icon={<Star className="h-5 w-5 text-fifa-gold" />}
              className="glass-card rounded-3xl shadow-depth-lg border-0"
            />
            <StatCard
              title="Total Goals"
              value={totalStats.totalGoals}
              icon={<Target className="h-5 w-5 text-fifa-green" />}
              className="glass-card rounded-3xl shadow-depth-lg border-0"
            />
            <StatCard
              title="Total Games"
              value={totalStats.totalGames}
              icon={<Trophy className="h-5 w-5 text-fifa-purple" />}
              className="glass-card rounded-3xl shadow-depth-lg border-0"
            />
          </div>

          <Tabs defaultValue="all-players" className="space-y-6">
            <TabsList className="glass-card rounded-3xl shadow-depth-lg border-0 p-2">
              <TabsTrigger value="all-players" className="rounded-2xl">All Players</TabsTrigger>
              <TabsTrigger value="top-performers" className="rounded-2xl">Top Performers</TabsTrigger>
            </TabsList>

            <TabsContent value="all-players" className="space-y-6">
              {/* Filters */}
              <Card className="glass-card rounded-3xl shadow-depth-lg border-0">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search players..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 modern-input border-fifa-blue/30 rounded-2xl"
                      />
                    </div>
                    
                    <Select value={positionFilter} onValueChange={setPositionFilter}>
                      <SelectTrigger className="modern-input border-fifa-blue/30 rounded-2xl">
                        <SelectValue placeholder="All Positions" />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-fifa-blue/30 rounded-2xl">
                        {positions.map(pos => (
                          <SelectItem key={pos} value={pos}>
                            {pos === 'all' ? 'All Positions' : pos}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="modern-input border-fifa-blue/30 rounded-2xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-fifa-blue/30 rounded-2xl">
                        <SelectItem value="averageRating">Average Rating</SelectItem>
                        <SelectItem value="gamesPlayed">Games Played</SelectItem>
                        <SelectItem value="goals">Goals</SelectItem>
                        <SelectItem value="assists">Assists</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="text-sm text-gray-400 flex items-center">
                      {filteredAndSortedPlayers.length} player{filteredAndSortedPlayers.length !== 1 ? 's' : ''} found
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Players Grid */}
              {filteredAndSortedPlayers.length === 0 ? (
                <Card className="glass-card rounded-3xl shadow-depth-lg border-0">
                  <CardContent className="text-center py-16">
                    <Users className="h-16 w-16 text-fifa-blue mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Players Found</h3>
                    <p className="text-gray-400">
                      {players.length === 0 
                        ? "Start creating squads to build your player database."
                        : "Try adjusting your search or filters."
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredAndSortedPlayers.map((player) => (
                    <Card key={`${player.id}-${player.cardType}`} className="glass-card rounded-3xl shadow-depth-lg border-0 hover:scale-105 transition-all duration-300 group overflow-hidden">
                      <div className={`h-2 bg-gradient-to-r ${getPlayerCardColor(player.averageRating)}`} />
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-white text-lg group-hover:text-fifa-blue transition-colors">
                              {player.name}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className="bg-fifa-blue/20 text-fifa-blue border-fifa-blue/30 rounded-xl text-xs">
                                {player.position}
                              </Badge>
                              <Badge variant="outline" className="text-xs rounded-xl">
                                {player.cardType}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-fifa-gold">{player.rating}</div>
                            <div className="text-xs text-gray-400">OVR</div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-3">
                        <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-400">Performance</span>
                            <span className="text-xs text-fifa-gold">{getPerformanceLevel(player.averageRating)}</span>
                          </div>
                          <div className="text-2xl font-bold text-fifa-blue">
                            {player.averageRating.toFixed(1)}
                          </div>
                          <div className="text-xs text-gray-400">Average Rating</div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div>
                            <div className="text-lg font-bold text-fifa-green">{player.goals}</div>
                            <div className="text-xs text-gray-400">Goals</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-fifa-purple">{player.assists}</div>
                            <div className="text-xs text-gray-400">Assists</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-fifa-gold">{player.gamesPlayed}</div>
                            <div className="text-xs text-gray-400">Games</div>
                          </div>
                        </div>

                        {player.gamesPlayed > 0 && (
                          <div className="grid grid-cols-2 gap-3 text-center text-xs">
                            <div>
                              <div className="text-fifa-green font-medium">{player.wins}W</div>
                              <div className="text-gray-400">Wins</div>
                            </div>
                            <div>
                              <div className="text-fifa-red font-medium">{player.losses}L</div>
                              <div className="text-gray-400">Losses</div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Calendar className="h-3 w-3" />
                          Last used {new Date(player.lastUsed).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="top-performers" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Rated */}
                <Card className="glass-card rounded-3xl shadow-depth-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Star className="h-5 w-5 text-fifa-gold" />
                      Highest Rated
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {topPerformers.topRated.map((player, index) => (
                      <div key={`rated-${player.id}`} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-fifa-gold/20 rounded-xl flex items-center justify-center">
                            <span className="text-fifa-gold font-bold text-sm">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{player.name}</p>
                            <p className="text-xs text-gray-400">{player.position} • {player.gamesPlayed} games</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-fifa-gold font-bold">{player.averageRating.toFixed(1)}</p>
                          <p className="text-xs text-gray-400">avg rating</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Top Scorers */}
                <Card className="glass-card rounded-3xl shadow-depth-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Target className="h-5 w-5 text-fifa-green" />
                      Top Scorers
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {topPerformers.topScorers.map((player, index) => (
                      <div key={`scorer-${player.id}`} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-fifa-green/20 rounded-xl flex items-center justify-center">
                            <span className="text-fifa-green font-bold text-sm">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{player.name}</p>
                            <p className="text-xs text-gray-400">{player.position} • {player.gamesPlayed} games</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-fifa-green font-bold">{player.goals}</p>
                          <p className="text-xs text-gray-400">goals</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Top Assists */}
                <Card className="glass-card rounded-3xl shadow-depth-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <TrendingUp className="h-5 w-5 text-fifa-purple" />
                      Most Assists
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {topPerformers.topAssists.map((player, index) => (
                      <div key={`assist-${player.id}`} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-fifa-purple/20 rounded-xl flex items-center justify-center">
                            <span className="text-fifa-purple font-bold text-sm">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{player.name}</p>
                            <p className="text-xs text-gray-400">{player.position} • {player.gamesPlayed} games</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-fifa-purple font-bold">{player.assists}</p>
                          <p className="text-xs text-gray-400">assists</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Most Used */}
                <Card className="glass-card rounded-3xl shadow-depth-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Award className="h-5 w-5 text-fifa-blue" />
                      Most Used
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {topPerformers.mostUsed.map((player, index) => (
                      <div key={`used-${player.id}`} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-fifa-blue/20 rounded-xl flex items-center justify-center">
                            <span className="text-fifa-blue font-bold text-sm">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{player.name}</p>
                            <p className="text-xs text-gray-400">{player.position} • {player.averageRating.toFixed(1)} avg</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-fifa-blue font-bold">{player.gamesPlayed}</p>
                          <p className="text-xs text-gray-400">games</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Players;
