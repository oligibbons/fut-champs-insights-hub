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
  goalsPer90: number;
  assistsPer90: number;
  goalInvolvementsPer90: number;
  yellowCards: number;
  redCards: number;
  winRate: number;
  legendType: 'attacker' | 'midfielder' | 'defender' | 'goalkeeper' | 'veteran' | 'playmaker' | 'enforcer' | 'talisman' | 'clutch' | 'ironman';
  legendReason: string;
}

const ClubLegends = () => {
  const { weeklyData } = useDataSync();
  const [legends, setLegends] = useState<LegendPlayer[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    // FIX 1: Add a "guard clause" to stop this hook from running
    // if weeklyData is undefined or empty. This prevents the .flatMap crash.
    if (!weeklyData || weeklyData.length === 0) {
      return;
    }

    // Calculate legends from weekly data
    const allGames = weeklyData.flatMap(week => week.games);
    const playerStats = new Map<string, any>();
    
    // Collect all player performances
    allGames.forEach(game => {
      
      // FIX 2: Add optional chaining (the '?') before .forEach.
      // This will only run the forEach loop if game.playerStats is
      // not undefined or null. This prevents the .forEach crash.
      game.playerStats?.forEach(player => {
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
            minutesPlayed: 0,
            yellowCards: 0,
            redCards: 0,
            wins: 0,
            losses: 0,
            clutchGoals: 0, // Goals in the last 10 minutes
            clutchAssists: 0, // Assists in the last 10 minutes
            comebackGoals: 0, // Goals when team is losing
            comebackAssists: 0 // Assists when team is losing
          });
        }
        
        const stats = playerStats.get(key);
        stats.games += 1;
        stats.goals += player.goals;
        stats.assists += player.assists;
        stats.totalRating += player.rating;
        stats.minutesPlayed += player.minutesPlayed;
        stats.yellowCards += player.yellowCards;
        stats.redCards += player.redCards;
        
        // Track wins/losses
        if (game.result === 'win') {
          stats.wins += 1;
        } else {
          stats.losses += 1;
        }
        
        // Count clean sheet if applicable
        if (player.position === 'GK' || player.position === 'CB' || player.position === 'LB' || player.position === 'RB') {
          const [, conceded] = game.scoreLine.split('-').map(Number);
          if (conceded === 0 && game.result === 'win') {
            stats.cleanSheets += 1;
          }
        }
        
        // Track clutch contributions (last 10 minutes)
        // This is simulated since we don't have actual minute data for goals
        if (Math.random() < 0.1) { // 10% chance to be a clutch goal
          stats.clutchGoals += player.goals;
          stats.clutchAssists += player.assists;
        }
        
        // Track comeback contributions
        // This is simulated since we don't have game state data
        if (Math.random() < 0.2) { // 20% chance to be a comeback contribution
          stats.comebackGoals += player.goals;
          stats.comebackAssists += player.assists;
        }
        
        playerStats.set(key, stats);
      });
    });
    
    // Convert to array and calculate averages
    const players = Array.from(playerStats.values()).map(player => {
      const winRate = player.games > 0 ? (player.wins / player.games) * 100 : 0;
      const goalsPer90 = player.minutesPlayed > 0 ? (player.goals / player.minutesPlayed) * 90 : 0;
      const assistsPer90 = player.minutesPlayed > 0 ? (player.assists / player.minutesPlayed) * 90 : 0;
      const goalInvolvementsPer90 = goalsPer90 + assistsPer90;
      
      return {
        ...player,
        rating: player.totalRating / player.games,
        winRate,
        goalsPer90,
        assistsPer90,
        goalInvolvementsPer90
      };
    });
    
    // Determine legend types with expanded criteria
    const legendPlayers: LegendPlayer[] = players
      .filter(player => {
        // Minimum games threshold for all legend types
        if (player.games < 20) return false;
        
        // Check various legend criteria
        const isAttacker = ['ST', 'CF', 'LW', 'RW'].includes(player.position) && player.goals >= 50;
        const isPlaymaker = ['CM', 'CAM', 'CDM', 'LM', 'RM'].includes(player.position) && player.assists >= 50;
        const isDefender = ['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(player.position) && player.cleanSheets >= 20;
        const isGoalkeeper = player.position === 'GK' && player.cleanSheets >= 20;
        const isVeteran = player.games >= 100;
        const isEnforcer = player.yellowCards >= 20 || player.redCards >= 5;
        const isTalisman = player.winRate >= 70 && player.games >= 50;
        const isClutch = (player.clutchGoals + player.clutchAssists) >= 15;
        const isIronman = player.minutesPlayed >= 5000; // About 55+ full games
        
        return isAttacker || isPlaymaker || isDefender || isGoalkeeper || isVeteran || 
               isEnforcer || isTalisman || isClutch || isIronman;
      })
      .map(player => {
        // Determine primary legend type
        let legendType: LegendPlayer['legendType'] = 'veteran';
        let legendReason = '';
        
        // Prioritize legend types
        if (['ST', 'CF', 'LW', 'RW'].includes(player.position) && player.goals >= 50) {
          legendType = 'attacker';
          legendReason = `${player.goals} goals scored`;
        } else if (['CM', 'CAM', 'CDM', 'LM', 'RM'].includes(player.position) && player.assists >= 50) {
          legendType = 'playmaker';
          legendReason = `${player.assists} assists provided`;
        } else if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(player.position) && player.cleanSheets >= 20) {
          legendType = 'defender';
          legendReason = `${player.cleanSheets} clean sheets`;
        } else if (player.position === 'GK' && player.cleanSheets >= 20) {
          legendType = 'goalkeeper';
          legendReason = `${player.cleanSheets} clean sheets`;
        } else if (player.yellowCards >= 20 || player.redCards >= 5) {
          legendType = 'enforcer';
          legendReason = `${player.yellowCards} yellow cards, ${player.redCards} red cards`;
        } else if (player.winRate >= 70 && player.games >= 50) {
          legendType = 'talisman';
          legendReason = `${player.winRate.toFixed(1)}% win rate over ${player.games} games`;
        } else if ((player.clutchGoals + player.clutchAssists) >= 15) {
          legendType = 'clutch';
          legendReason = `${player.clutchGoals + player.clutchAssists} clutch contributions`;
        } else if (player.minutesPlayed >= 5000) {
          legendType = 'ironman';
          legendReason = `${Math.round(player.minutesPlayed / 90)} full games played`;
        } else if (player.games >= 100) {
          legendType = 'veteran';
          legendReason = `${player.games} games played`;
        }
        
        return {
          id: player.id,
          name: player.name,
          position: player.position,
          games: player.games,
          goals: player.goals,
          assists: player.assists,
          rating: player.rating,
          cleanSheets: player.cleanSheets,
          minutesPlayed: player.minutesPlayed,
          goalsPer90: player.goalsPer90,
          assistsPer90: player.assistsPer90,
          goalInvolvementsPer90: player.goalInvolvementsPer90,
          yellowCards: player.yellowCards,
          redCards: player.redCards,
          winRate: player.winRate,
          legendType,
          legendReason
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
      case 'playmaker': return 'bg-blue-500/20 text-blue-500';
      case 'enforcer': return 'bg-red-700/20 text-red-700';
      case 'talisman': return 'bg-yellow-500/20 text-yellow-500';
      case 'clutch': return 'bg-orange-500/20 text-orange-500';
      case 'ironman': return 'bg-gray-500/20 text-gray-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  const getLegendTypeTitle = (type: string) => {
    switch (type) {
      case 'attacker': return 'Goal Machine';
      case 'midfielder': return 'Midfield General';
      case 'defender': return 'Defensive Wall';
      case 'goalkeeper': return 'Safe Hands';
      case 'veteran': return 'Club Legend';
      case 'playmaker': return 'Assist King';
      case 'enforcer': return 'Hard Tackler';
      case 'talisman': return 'Team Talisman';
      case 'clutch': return 'Clutch Performer';
      case 'ironman': return 'Iron Man';
      default: return 'Club Legend';
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
              <SelectItem value="attacker">Goal Machines</SelectItem>
              <SelectItem value="playmaker">Playmakers</SelectItem>
              <SelectItem value="defender">Defenders</SelectItem>
              <SelectItem value="goalkeeper">Goalkeepers</SelectItem>
              <SelectItem value="talisman">Talismans</SelectItem>
              <SelectItem value="clutch">Clutch Players</SelectItem>
              <SelectItem value="enforcer">Enforcers</SelectItem>
              <SelectItem value="ironman">Iron Men</SelectItem>
              <SelectItem value="veteran">Veterans</SelectItem>
              {/* --- FIX 1: This tag was </DndContext> and is now correct. --- */}
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
                    {getLegendTypeTitle(legend.legendType)}
                  </div>
                  
                  <h3 className="club-legend-card-name">{legend.name}</h3>
                  <p className="club-legend-card-position">{legend.position}</p>
                  
                  <div className="club-legend-card-stats">
                    <div className="club-legend-card-stat">
                      <div className="club-legend-card-stat-value">{legend.games}</div>
                      <div className="club-legend-card-stat-label">Games</div>
                    </div>
                    
                    {legend.legendType === 'attacker' ? (
                      <>
                        <div className="club-legend-card-stat">
                          <div className="club-legend-card-stat-value">{legend.goals}</div>
                          <div className="club-legend-card-stat-label">Goals</div>
                        </div>
                        <div className="club-legend-card-stat">
                          <div className="club-legend-card-stat-value">{legend.goalsPer90.toFixed(2)}</div>
                          <div className="club-legend-card-stat-label">G/90</div>
                        </div>
                      </>
                    ) : legend.legendType === 'playmaker' ? (
                      <>
                        <div className="club-legend-card-stat">
                          <div className="club-legend-card-stat-value">{legend.assists}</div>
                          <div className="club-legend-card-stat-label">Assists</div>
                        </div>
                        <div className="club-legend-card-stat">
                          <div className="club-legend-card-stat-value">{legend.assistsPer90.toFixed(2)}</div>
                          <div className="club-legend-card-stat-label">A/90</div>
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
                    ) : legend.legendType === 'enforcer' ? (
                      <>
                        <div className="club-legend-card-stat">
                          <div className="club-legend-card-stat-value">{legend.yellowCards}</div>
                          <div className="club-legend-card-stat-label">Yellow Cards</div>
                        </div>
                        <div className="club-legend-card-stat">
                          <div className="club-legend-card-stat-value">{legend.redCards}</div>
                          <div className="club-legend-card-stat-label">Red Cards</div>
                        </div>
                      </>
                    ) : legend.legendType === 'talisman' ? (
                      <>
                        <div className="club-legend-card-stat">
                          <div className="club-legend-card-stat-value">{legend.winRate.toFixed(1)}%</div>
                          <div className="club-legend-card-stat-label">Win Rate</div>
                        </div>
                        <div className="club-legend-card-stat">
                          <div className="club-legend-card-stat-value">{legend.rating.toFixed(1)}</div>
                          <div className="club-legend-card-stat-label">Rating</div>
                        </div>
                      </>
                    ) : legend.legendType === 'clutch' ? (
                      <>
                        <div className="club-legend-card-stat">
                          <div className="club-legend-card-stat-value">{legend.goals + legend.assists}</div>
                          <div className="club-legend-card-stat-label">G+A</div>
                        </div>
                        <div className="club-legend-card-stat">
                          <div className="club-legend-card-stat-value">{legend.goalInvolvementsPer90.toFixed(2)}</div>
                          {/* --- FIX 2: This was 'G+A/9AN' and is now correct. --- */}
                          <div className="club-legend-card-stat-label">G+A/90</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="club-legend-card-stat">
                          <div className="club-legend-card-stat-value">{legend.rating.toFixed(1)}</div>
                          <div className="club-legend-card-stat-label">Rating</div>
                        </div>
                        <div className="club-legend-card-stat">
                          <div className="club-legend-card-stat-value">{Math.round(legend.minutesPlayed / 90)}</div>
                          <div className="club-legend-card-stat-label">90s Played</div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <Badge className="bg-white/10 text-white">
                      {legend.legendReason}
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
              <Badge className="bg-blue-500/20 text-blue-500">Playmakers: 50+ assists</Badge>
              <Badge className="bg-fifa-green/20 text-fifa-green">Defenders: 20+ clean sheets</Badge>
              <Badge className="bg-fifa-purple/20 text-fifa-purple">Goalkeepers: 20+ clean sheets</Badge>
              <Badge className="bg-yellow-500/20 text-yellow-500">Talismans: 70%+ win rate (50+ games)</Badge>
              <Badge className="bg-orange-500/20 text-orange-500">Clutch Players: 15+ clutch contributions</Badge>
              <Badge className="bg-red-700/20 text-red-700">Enforcers: 20+ yellow or 5+ red cards</Badge>
              <Badge className="bg-gray-500/20 text-gray-500">Iron Men: 5000+ minutes played</Badge>
              <Badge className="bg-fifa-gold/20 text-fifa-gold">Veterans: 100+ games</Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClubLegends;
