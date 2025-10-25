import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// --- FIX: Standardize on useAccountData for all dashboard components ---
import { useAccountData } from '@/hooks/useAccountData';
import { Trophy } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useTheme } from '@/hooks/useTheme';

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
  // --- FIX: Use useAccountData and add loading state/guards ---
  const { weeklyData = [], loading } = useAccountData() || {};
  // --- END FIX
  
  const { currentTheme } = useTheme();
  const [legends, setLegends] = useState<LegendPlayer[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    // This guard clause is still correct and now works with the guarded weeklyData
    if (!weeklyData || weeklyData.length === 0) {
      return;
    }

    // Calculate legends from weekly data
    const allGames = weeklyData.flatMap(week => week.games);
    const playerStats = new Map<string, any>();
    
    // Collect all player performances
    allGames.forEach(game => {
      // This optional chain is still correct
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
        
        if (game.result === 'win') {
          stats.wins += 1;
        } else {
          stats.losses += 1;
        }
        
        if (player.position === 'GK' || player.position === 'CB' || player.position === 'LB' || player.position === 'RB') {
          const [, conceded] = game.scoreLine.split('-').map(Number);
          if (conceded === 0 && game.result === 'win') {
            stats.cleanSheets += 1;
          }
        }
        
        if (Math.random() < 0.1) { 
          stats.clutchGoals += player.goals;
          stats.clutchAssists += player.assists;
        }
        
        if (Math.random() < 0.2) { 
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
        if (player.games < 20) return false;
        
        const isAttacker = ['ST', 'CF', 'LW', 'RW'].includes(player.position) && player.goals >= 50;
        const isPlaymaker = ['CM', 'CAM', 'CDM', 'LM', 'RM'].includes(player.position) && player.assists >= 50;
        const isDefender = ['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(player.position) && player.cleanSheets >= 20;
        const isGoalkeeper = player.position === 'GK' && player.cleanSheets >= 20;
        const isVeteran = player.games >= 100;
        const isEnforcer = player.yellowCards >= 20 || player.redCards >= 5;
        const isTalisman = player.winRate >= 70 && player.games >= 50;
        const isClutch = (player.clutchGoals + player.clutchAssists) >= 15;
        const isIronman = player.minutesPlayed >= 5000; 
        
        return isAttacker || isPlaymaker || isDefender || isGoalkeeper || isVeteran || 
               isEnforcer || isTalisman || isClutch || isIronman;
      })
      .map(player => {
        let legendType: LegendPlayer['legendType'] = 'veteran';
        let legendReason = '';
        
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
          ...player,
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

  // --- FIX: Add loading state ---
  if (loading) {
    return (
      <div className="flex space-x-4">
        <Skeleton className="h-64 w-full min-w-72 rounded-2xl" />
        <Skeleton className="h-64 w-full min-w-72 rounded-2xl hidden md:block" />
        <Skeleton className="h-64 w-full min-w-72 rounded-2xl hidden lg:block" />
      </div>
    );
  }

  return (
    // We wrap the content in a Card, but the <DashboardSection> already provides one
    // So we just provide the content.
    <div>
      {/* Filter Dropdown */}
      <div className="mb-4 flex justify-end">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger 
            className="w-48"
            style={{
              backgroundColor: currentTheme.colors.surface,
              borderColor: currentTheme.colors.border,
              color: currentTheme.colors.text
            }}
          >
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
          </SelectContent>
        </Select>
      </div>

      {/* --- FIX: Replaced grid with Carousel --- */}
      {filteredLegends.length > 0 ? (
        <Carousel 
          opts={{
            align: "start",
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {filteredLegends.map((legend) => (
              <CarouselItem key={legend.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                {/* The original file had custom 'club-legend-card' CSS.
                  I am replicating that structure inside a standard Card
                  to ensure it fits the carousel.
                */}
                <Card 
                  className="overflow-hidden rounded-2xl border-0 shadow-lg"
                  style={{ 
                    backgroundColor: currentTheme.colors.surface,
                    borderColor: currentTheme.colors.border
                  }}
                >
                  <CardContent className="p-4 relative">
                    <div className={`club-legend-card-badge px-3 py-1 text-xs font-semibold rounded-full absolute top-4 left-4 ${getLegendTypeColor(legend.legendType)}`}>
                      {getLegendTypeTitle(legend.legendType)}
                    </div>
                    
                    <div className="pt-12 pb-4">
                      <h3 className="text-xl font-bold text-white">{legend.name}</h3>
                      <p className="text-sm" style={{ color: currentTheme.colors.muted }}>{legend.position}</p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-center mb-4">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: currentTheme.colors.cardBg }}>
                        <div className="text-lg font-bold text-white">{legend.games}</div>
                        <div className="text-xs" style={{ color: currentTheme.colors.muted }}>Games</div>
                      </div>
                      
                      {/* Dynamic stat based on legend type */}
                      {legend.legendType === 'attacker' ? (
                        <div className="p-2 rounded-lg" style={{ backgroundColor: currentTheme.colors.cardBg }}>
                          <div className="text-lg font-bold text-white">{legend.goals}</div>
                          <div className="text-xs" style={{ color: currentTheme.colors.muted }}>Goals</div>
                        </div>
                      ) : legend.legendType === 'playmaker' ? (
                        <div className="p-2 rounded-lg" style={{ backgroundColor: currentTheme.colors.cardBg }}>
                          <div className="text-lg font-bold text-white">{legend.assists}</div>
                          <div className="text-xs" style={{ color: currentTheme.colors.muted }}>Assists</div>
                        </div>
                      ) : legend.legendType === 'defender' || legend.legendType === 'goalkeeper' ? (
                        <div className="p-2 rounded-lg" style={{ backgroundColor: currentTheme.colors.cardBg }}>
                          <div className="text-lg font-bold text-white">{legend.cleanSheets}</div>
                          <div className="text-xs" style={{ color: currentTheme.colors.muted }}>Clean Sheets</div>
                        </div>
                      ) : legend.legendType === 'talisman' ? (
                         <div className="p-2 rounded-lg" style={{ backgroundColor: currentTheme.colors.cardBg }}>
                          <div className="text-lg font-bold text-white">{legend.winRate.toFixed(0)}%</div>
                          <div className="text-xs" style={{ color: currentTheme.colors.muted }}>Win Rate</div>
                        </div>
                      ) : (
                        <div className="p-2 rounded-lg" style={{ backgroundColor: currentTheme.colors.cardBg }}>
                          <div className="text-lg font-bold text-white">{legend.rating.toFixed(1)}</div>
                          <div className="text-xs" style={{ color: currentTheme.colors.muted }}>Rating</div>
                        </div>
                      )}
                      
                      <div className="p-2 rounded-lg" style={{ backgroundColor: currentTheme.colors.cardBg }}>
                        <div className="text-lg font-bold text-white">{legend.rating.toFixed(1)}</div>
                        <div className="text-xs" style={{ color: currentTheme.colors.muted }}>Rating</div>
                      </div>
                    </div>
                    
                    <Badge 
                      variant="outline"
                      className="border-0"
                      style={{ 
                        backgroundColor: currentTheme.colors.cardBg,
                        color: currentTheme.colors.muted
                      }}
                    >
                      {legend.legendReason}
                    </Badge>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          {/* Only show carousel arrows on desktop */}
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      ) : (
        // "No Legends" state
        <div 
          className="text-center py-12 rounded-2xl"
          style={{ backgroundColor: currentTheme.colors.surface }}
        >
          <Trophy className="h-16 w-16 mx-auto mb-4" style={{ color: currentTheme.colors.muted }} />
          <h3 className="text-xl font-semibold text-white mb-2">No Club Legends Yet</h3>
          <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: currentTheme.colors.muted }}>
            Players become legends by meeting criteria (e.g., 100+ games, 50+ goals).
          </p>
          <Badge 
            variant="outline"
            style={{ 
              borderColor: currentTheme.colors.border,
              color: currentTheme.colors.text
            }}
          >
            Keep playing to crown your first legend!
          </Badge>
        </div>
      )}
    </div>
  );
};

export default ClubLegends;
