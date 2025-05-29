
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { WeeklyPerformance, PlayerPerformance } from '@/types/futChampions';
import { Search, Users, Star, ChevronUp, ChevronDown } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

interface PlayerHistoryTableProps {
  weeklyData: WeeklyPerformance[];
}

interface PlayerStats {
  name: string;
  position: string;
  totalGames: number;
  totalGoals: number;
  totalAssists: number;
  totalMinutes: number;
  averageRating: number;
  yellowCards: number;
  redCards: number;
  ownGoals: number;
  bestRating: number;
  worstRating: number;
  gamesWon: number;
  gamesLost: number;
}

type SortField = 'name' | 'position' | 'totalGames' | 'totalGoals' | 'totalAssists' | 'averageRating' | 'gamesWon';
type SortDirection = 'asc' | 'desc';

const PlayerHistoryTable = ({ weeklyData }: PlayerHistoryTableProps) => {
  const { currentTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPosition, setFilterPosition] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('totalGames');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Aggregate all player performances
  const playerStats: PlayerStats[] = [];
  const playerMap = new Map<string, PlayerStats>();

  weeklyData.forEach(week => {
    week.games.forEach(game => {
      game.playerStats?.forEach((player: PlayerPerformance) => {
        const key = `${player.name}-${player.position}`;
        
        if (!playerMap.has(key)) {
          playerMap.set(key, {
            name: player.name,
            position: player.position,
            totalGames: 0,
            totalGoals: 0,
            totalAssists: 0,
            totalMinutes: 0,
            averageRating: 0,
            yellowCards: 0,
            redCards: 0,
            ownGoals: 0,
            bestRating: player.rating,
            worstRating: player.rating,
            gamesWon: 0,
            gamesLost: 0
          });
        }

        const stats = playerMap.get(key)!;
        stats.totalGames += 1;
        stats.totalGoals += player.goals;
        stats.totalAssists += player.assists;
        stats.totalMinutes += player.minutesPlayed;
        stats.yellowCards += player.yellowCards;
        stats.redCards += player.redCards;
        stats.ownGoals += player.ownGoals;
        stats.bestRating = Math.max(stats.bestRating, player.rating);
        stats.worstRating = Math.min(stats.worstRating, player.rating);
        
        if (game.result === 'win') stats.gamesWon += 1;
        else stats.gamesLost += 1;
      });
    });
  });

  // Calculate averages and convert to array
  playerMap.forEach(stats => {
    if (stats.totalGames > 0) {
      const totalRating = weeklyData
        .flatMap(week => week.games)
        .flatMap(game => game.playerStats || [])
        .filter(player => player.name === stats.name && player.position === stats.position)
        .reduce((sum, player) => sum + player.rating, 0);
      
      stats.averageRating = totalRating / stats.totalGames;
      playerStats.push(stats);
    }
  });

  // Filter players
  const filteredPlayers = playerStats.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = filterPosition === 'all' || player.position === filterPosition;
    return matchesSearch && matchesPosition;
  });

  // Handle column click sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Sort players
  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortField) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'position':
        aValue = a.position;
        bValue = b.position;
        break;
      case 'totalGames':
        aValue = a.totalGames;
        bValue = b.totalGames;
        break;
      case 'totalGoals':
        aValue = a.totalGoals;
        bValue = b.totalGoals;
        break;
      case 'totalAssists':
        aValue = a.totalAssists;
        bValue = b.totalAssists;
        break;
      case 'averageRating':
        aValue = a.averageRating;
        bValue = b.averageRating;
        break;
      case 'gamesWon':
        aValue = a.gamesWon;
        bValue = b.gamesWon;
        break;
      default:
        aValue = a.totalGames;
        bValue = b.totalGames;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    } else {
      return sortDirection === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
    }
  });

  const positions = [...new Set(playerStats.map(p => p.position))].sort();

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-white/5 transition-colors select-none"
      style={{ color: currentTheme.colors.text }}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortField === field && (
          sortDirection === 'asc' ? 
            <ChevronUp className="h-4 w-4" /> : 
            <ChevronDown className="h-4 w-4" />
        )}
      </div>
    </TableHead>
  );

  return (
    <Card style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
          <Users className="h-5 w-5" style={{ color: currentTheme.colors.primary }} />
          Player History ({playerStats.length} players)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: currentTheme.colors.muted }} />
            <Input
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}
            />
          </div>
          
          <Select value={filterPosition} onValueChange={setFilterPosition}>
            <SelectTrigger className="w-40" style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Positions</SelectItem>
              {positions.map(position => (
                <SelectItem key={position} value={position}>{position}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: currentTheme.colors.surface }}>
          <Table>
            <TableHeader>
              <TableRow style={{ borderColor: currentTheme.colors.border }}>
                <SortableHeader field="name">Player</SortableHeader>
                <SortableHeader field="position">Position</SortableHeader>
                <SortableHeader field="totalGames">Games</SortableHeader>
                <SortableHeader field="totalGoals">Goals</SortableHeader>
                <SortableHeader field="totalAssists">Assists</SortableHeader>
                <SortableHeader field="averageRating">Avg Rating</SortableHeader>
                <SortableHeader field="gamesWon">Win Rate</SortableHeader>
                <TableHead style={{ color: currentTheme.colors.text }}>Cards</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPlayers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8" style={{ color: currentTheme.colors.muted }}>
                    No players found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                sortedPlayers.map((player, index) => (
                  <TableRow key={`${player.name}-${player.position}`} style={{ borderColor: currentTheme.colors.border }}>
                    <TableCell style={{ color: currentTheme.colors.text }}>
                      <div className="font-medium">{player.name}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" style={{ borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}>
                        {player.position}
                      </Badge>
                    </TableCell>
                    <TableCell style={{ color: currentTheme.colors.text }}>{player.totalGames}</TableCell>
                    <TableCell style={{ color: currentTheme.colors.text }}>{player.totalGoals}</TableCell>
                    <TableCell style={{ color: currentTheme.colors.text }}>{player.totalAssists}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3" style={{ color: currentTheme.colors.accent }} />
                        <span style={{ color: currentTheme.colors.text }}>{player.averageRating.toFixed(1)}</span>
                      </div>
                    </TableCell>
                    <TableCell style={{ color: currentTheme.colors.text }}>
                      {player.totalGames > 0 ? ((player.gamesWon / player.totalGames) * 100).toFixed(0) : 0}%
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {player.yellowCards > 0 && (
                          <Badge className="bg-yellow-500 text-black text-xs px-1">
                            {player.yellowCards}Y
                          </Badge>
                        )}
                        {player.redCards > 0 && (
                          <Badge className="bg-red-500 text-white text-xs px-1">
                            {player.redCards}R
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerHistoryTable;
