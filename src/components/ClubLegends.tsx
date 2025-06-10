import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDataSync } from '@/hooks/useDataSync';
import { Trophy, Star, Target, Users, Filter } from 'lucide-react';

interface LegendPlayer {
  id: string;
  name: string;
  position: string;
  games: number;
  goals: number;
  assists: number;
  rating: number;
  cleanSheets: number;
  minutesPlayed: number;
  legendType: 'attacker' | 'midfielder' | 'defender' | 'goalkeeper' | 'veteran';
}

const ClubLegends = () => {
  const { weeklyData } = useDataSync();
  const [legends, setLegends] = useState<LegendPlayer[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    // Calculate legends from weekly data
    const allGames = weeklyData.flatMap(week => week.games);
    const playerStats = new Map<string, any>();
    
    // Collect all player performances
    allGames.forEach(game => {
      game.playerStats.forEach(player => {
        const key = `${player.name}-${player.position}`;
        
        if (!playerStats.has(key)) {
          playerStats.set(key, {
            id: key,
            name: player.name,
            position: player.position,
            games: 0,
            goals: 0,
            assists: 0,
            totalRating: 0,
            cleanSheets: 0,
            minutesPlayed: 0
          });
        }
        
        const stats = playerStats.get(key);
        stats.games += 1;
        stats.goals += player.goals;
        stats.assists += player.assists;
        stats.totalRating += player.rating;
        stats.minutesPlayed += player.minutesPlayed;
        
        // Count clean sheet if applicable
        if (player.position === 'GK' || player.position === 'CB' || player.position === 'LB' || player.position === 'RB') {
          const [, conceded] = game.scoreLine.split('-').map(Number);
          if (conceded === 0 && game.result === 'win') {
            stats.cleanSheets += 1;
          }
        }
        
        playerStats.set(key, stats);
      });
    });
    
    // Convert to array and calculate averages
    const players = Array.from(playerStats.values()).map(player => ({
      ...player,
      rating: player.totalRating / player.games
    }));
    
    // Determine legend types
    const legendPlayers: LegendPlayer[] = players
      .filter(player => {
        // Attackers with 50+ goals
        if (['ST', 'CF', 'LW', 'RW'].includes(player.position) && player.goals >= 50) {
          return { ...player, legendType: 'attacker' };
        }
        
        // Midfielders with 50+ assists
        if (['CM', 'CAM', 'CDM', 'LM', 'RM'].includes(player.position) && player.assists >= 50) {
          return { ...player, legendType: 'midfielder' };
        }
        
        // Defenders with 20+ clean sheets
        if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(player.position) && player.cleanSheets >= 20) {
          return { ...player, legendType: 'defender' };
        }
        
        // Goalkeepers with 20+ clean sheets
        if (player.position === 'GK' && player.cleanSheets >= 20) {
          return { ...player, legendType: 'goalkeeper' };
        }
        
        // Any player with 50+ appearances
        if (player.games >= 50) {
          return { ...player, legendType: 'veteran' };
        }
        
        return false;
      })
      .map(player => {
        let legendType: 'attacker' | 'midfielder' | 'defender' | 'goalkeeper' | 'veteran' = 'veteran';
        
        if (['ST', 'CF', 'LW', 'RW'].includes(player.position) && player.goals >= 50) {
          legendType = 'attacker';
        } else if (['CM', 'CAM', 'CDM', 'LM', 'RM'].includes(player.position) && player.assists >= 50) {
          legendType = 'midfielder';
        } else if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(player.position) && player.cleanSheets >= 20) {
          legendType = 'defender';
        } else if (player.position === 'GK' && player.cleanSheets >= 20) {
          legendType = 'goalkeeper';
        }
        
        return {
          ...player,
          legendType
        };
      });
    
    setLegends(legendPlayers);
  }, [weeklyData]);

  const filteredLegends = filter === 'all' 
    ? legends 
    : legends.filter(legend => legend.legendType === filter);

  const getLegendTypeColor = (type: string) => {
    switch (type) {
      case 'attacker': return 'bg-fifa-red/20 text-fifa-red';
      case 'midfielder': return 'bg-fifa-blue/20 text-fifa-blue';
      case 'defender': return 'bg-fifa-green/20 text-fifa-green';
      case 'goalkeeper': return 'bg-fifa-purple/20 text-fifa-purple';
      case 'veteran': return 'bg-fifa-gold/20 text-fifa-gold';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <Trophy className="h-5 w-5 text-fifa-gold" />
            Club Legends
          </CardTitle>
          
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40 bg-gray-800 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Legends</SelectItem>
              <SelectItem value="attacker">Attackers</SelectItem>
              <SelectItem value="midfielder">Midfielders</SelectItem>
              <SelectItem value="defender">Defenders</SelectItem>
              <SelectItem value="goalkeeper">Goalkeepers</SelectItem>
              <SelectItem value="veteran">Veterans</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredLegends.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLegends.map((legend) => (
              <div key={legend.id} className="club-legend-card">
                <div className="club-legend-card-overlay"></div>
                <div className="club-legend-card-content">
                  <div className={`club-legend-card-badge ${getLegendTypeColor(legend.legendType)}`}>
                    {legend.legendType === 'attacker' ? 'Goal Machine' :
                     legend.legendType === 'midfielder' ? 'Playmaker' :
                     legend.legendType === 'defender' ? 'Wall' :
                     legend.legendType === 'goalkeeper' ? 'Safe Hands' :
                     'Club Legend'}
                  </div>
                  
                  <h3 className="club-legend-card-name">{legend.name}</h3>
                  <p className="club-legend-card-position">{legend.position}</p>
                  
                  <div className="club-legend-card-stats">
                    <div className="club-legend-card-stat">
                      <div className="club-legend-card-stat-value">{legend.games}</div>
                      <div className="club-legend-card-stat-label">Games</div>
                    </div>
                    
                    {legend.legendType === 'attacker' || legend.legendType === 'midfielder' ? (
                      <>
                        <div className="club-legend-card-stat">
                          <div className="club-legend-card-stat-value">{legend.goals}</div>
                          <div className="club-legend-card-stat-label">Goals</div>
                        </div>
                        <div className="club-legend-card-stat">
                          <div className="club-legend-card-stat-value">{legend.assists}</div>
                          <div className="club-legend-card-stat-label">Assists</div>
                        </div>
                      </>
                    ) : legend.legendType === 'defender' || legend.legendType === 'goalkeeper' ? (
                      <>
                        <div className="club-legend-card-stat">
                          <div className="club-legend-card-stat-value">{legend.cleanSheets}</div>
                          <div className="club-legend-card-stat-label">Clean Sheets</div>
                        </div>
                        <div className="club-legend-card-stat">
                          <div className="club-legend-card-stat-value">{legend.rating.toFixed(1)}</div>
                          <div className="club-legend-card-stat-label">Rating</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="club-legend-card-stat">
                          <div className="club-legend-card-stat-value">{legend.rating.toFixed(1)}</div>
                          <div className="club-legend-card-stat-label">Rating</div>
                        </div>
                        <div className="club-legend-card-stat">
                          <div className="club-legend-card-stat-value">{Math.round(legend.minutesPlayed / 60)}</div>
                          <div className="club-legend-card-stat-label">Hours</div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <Badge className="bg-white/10 text-white">
                      {legend.legendType === 'attacker' ? `${(legend.goals / legend.games).toFixed(1)} G/G` :
                       legend.legendType === 'midfielder' ? `${(legend.assists / legend.games).toFixed(1)} A/G` :
                       legend.legendType === 'defender' || legend.legendType === 'goalkeeper' ? 
                         `${(legend.cleanSheets / legend.games * 100).toFixed(0)}% CS` :
                       `${Math.round(legend.minutesPlayed / legend.games)} mins/game`}
                    </Badge>
                    
                    <div className="text-xs text-white/70">
                      {new Date().getFullYear()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-500 opacity-50" />
            <h3 className="text-xl font-semibold text-white mb-2">No Club Legends Yet</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Players become legends when they meet certain criteria:
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
              <Badge className="bg-fifa-red/20 text-fifa-red">Attackers: 50+ goals</Badge>
              <Badge className="bg-fifa-blue/20 text-fifa-blue">Midfielders: 50+ assists</Badge>
              <Badge className="bg-fifa-green/20 text-fifa-green">Defenders: 20+ clean sheets</Badge>
              <Badge className="bg-fifa-purple/20 text-fifa-purple">Goalkeepers: 20+ clean sheets</Badge>
              <Badge className="bg-fifa-gold/20 text-fifa-gold">Any position: 50+ games</Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClubLegends;