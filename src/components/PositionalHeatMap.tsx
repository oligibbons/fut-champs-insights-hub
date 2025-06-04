
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useDataSync } from '@/hooks/useDataSync';
import { MapPin, Info } from 'lucide-react';

interface PositionData {
  position: string;
  averageRating: number;
  gamesPlayed: number;
  totalMinutes: number;
  goals: number;
  assists: number;
  x: number; // Position on field (0-100%)
  y: number; // Position on field (0-100%)
}

const PositionalHeatMap = () => {
  const { weeklyData } = useDataSync();
  const [positionData, setPositionData] = useState<PositionData[]>([]);

  // Position coordinates on a football pitch (x, y as percentages)
  const positionCoordinates: Record<string, { x: number; y: number }> = {
    'GK': { x: 10, y: 50 },
    'CB': { x: 25, y: 50 },
    'LCB': { x: 25, y: 35 },
    'RCB': { x: 25, y: 65 },
    'LB': { x: 30, y: 15 },
    'RB': { x: 30, y: 85 },
    'LWB': { x: 35, y: 10 },
    'RWB': { x: 35, y: 90 },
    'CDM': { x: 40, y: 50 },
    'LDM': { x: 40, y: 35 },
    'RDM': { x: 40, y: 65 },
    'CM': { x: 55, y: 50 },
    'LCM': { x: 55, y: 35 },
    'RCM': { x: 55, y: 65 },
    'CAM': { x: 70, y: 50 },
    'LAM': { x: 70, y: 35 },
    'RAM': { x: 70, y: 65 },
    'LM': { x: 50, y: 15 },
    'RM': { x: 50, y: 85 },
    'LW': { x: 75, y: 15 },
    'RW': { x: 75, y: 85 },
    'CF': { x: 85, y: 50 },
    'ST': { x: 90, y: 50 },
    'LF': { x: 85, y: 35 },
    'RF': { x: 85, y: 65 },
  };

  useEffect(() => {
    const allGames = weeklyData.flatMap(week => week.games || []);
    const positionStats = new Map<string, {
      totalRating: number;
      gamesPlayed: number;
      totalMinutes: number;
      goals: number;
      assists: number;
    }>();

    allGames.forEach(game => {
      game.playerStats?.forEach(player => {
        const existing = positionStats.get(player.position) || {
          totalRating: 0,
          gamesPlayed: 0,
          totalMinutes: 0,
          goals: 0,
          assists: 0
        };

        existing.totalRating += player.rating;
        existing.gamesPlayed += 1;
        existing.totalMinutes += player.minutesPlayed;
        existing.goals += player.goals;
        existing.assists += player.assists;

        positionStats.set(player.position, existing);
      });
    });

    const positions: PositionData[] = Array.from(positionStats.entries()).map(([position, stats]) => ({
      position,
      averageRating: stats.gamesPlayed > 0 ? stats.totalRating / stats.gamesPlayed : 0,
      gamesPlayed: stats.gamesPlayed,
      totalMinutes: stats.totalMinutes,
      goals: stats.goals,
      assists: stats.assists,
      x: positionCoordinates[position]?.x || 50,
      y: positionCoordinates[position]?.y || 50
    }));

    setPositionData(positions);
  }, [weeklyData]);

  const getHeatColor = (rating: number) => {
    if (rating >= 8.5) return 'from-green-400 to-green-600';
    if (rating >= 8.0) return 'from-lime-400 to-green-500';
    if (rating >= 7.5) return 'from-yellow-400 to-lime-500';
    if (rating >= 7.0) return 'from-yellow-500 to-yellow-600';
    if (rating >= 6.5) return 'from-orange-400 to-yellow-500';
    if (rating >= 6.0) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-red-600';
  };

  const getIntensity = (rating: number) => {
    const intensity = Math.max(0.3, Math.min(1, (rating - 5) / 5));
    return intensity;
  };

  if (positionData.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MapPin className="h-5 w-5 text-fifa-blue" />
            Positional Performance Heat Map
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center">
          <MapPin className="h-16 w-16 text-fifa-blue mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-white mb-2">No Positional Data Available</h3>
          <p className="text-gray-400">Record games with player statistics to see positional performance analysis.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider delayDuration={2000}>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-fifa-blue" />
                  Positional Performance Heat Map
                  <Info className="h-4 w-4 text-gray-400" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Visual representation of average player ratings by position. Warmer colors indicate better performance. Hover over positions for detailed statistics.</p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full h-96 bg-gradient-to-b from-green-800/20 to-green-900/30 rounded-lg border-2 border-white/20">
            {/* Football pitch markings */}
            <div className="absolute inset-0">
              {/* Center line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/30 transform -translate-x-0.5" />
              {/* Center circle */}
              <div className="absolute top-1/2 left-1/2 w-20 h-20 border border-white/30 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
              {/* Penalty areas */}
              <div className="absolute left-0 top-1/4 bottom-1/4 w-1/6 border-r border-white/30" />
              <div className="absolute right-0 top-1/4 bottom-1/4 w-1/6 border-l border-white/30" />
              {/* Goal areas */}
              <div className="absolute left-0 top-2/5 bottom-2/5 w-12 border-r border-white/30" />
              <div className="absolute right-0 top-2/5 bottom-2/5 w-12 border-l border-white/30" />
            </div>

            {/* Position markers */}
            {positionData.map((position) => (
              <Tooltip key={position.position}>
                <TooltipTrigger asChild>
                  <div
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                    style={{
                      left: `${position.x}%`,
                      top: `${position.y}%`,
                    }}
                  >
                    <div
                      className={`w-12 h-12 rounded-full bg-gradient-to-r ${getHeatColor(position.averageRating)} 
                        flex items-center justify-center text-xs font-bold text-black shadow-lg 
                        group-hover:scale-110 transition-transform duration-200 border-2 border-white/50`}
                      style={{
                        opacity: getIntensity(position.averageRating),
                      }}
                    >
                      <div className="text-center">
                        <div className="text-[10px] font-bold">{position.position}</div>
                        <div className="text-[8px]">{position.averageRating.toFixed(1)}</div>
                      </div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-900/95 border border-white/20">
                  <div className="space-y-2">
                    <p className="font-semibold text-white">{position.position}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-300">Avg Rating:</span>
                        <span className="text-fifa-gold ml-1 font-bold">{position.averageRating.toFixed(1)}</span>
                      </div>
                      <div>
                        <span className="text-gray-300">Games:</span>
                        <span className="text-white ml-1">{position.gamesPlayed}</span>
                      </div>
                      <div>
                        <span className="text-gray-300">Minutes:</span>
                        <span className="text-white ml-1">{position.totalMinutes}</span>
                      </div>
                      <div>
                        <span className="text-gray-300">G+A:</span>
                        <span className="text-fifa-green ml-1">{position.goals + position.assists}</span>
                      </div>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}

            {/* Legend */}
            <div className="absolute bottom-2 right-2 bg-black/60 rounded-lg p-3">
              <p className="text-white text-xs font-semibold mb-2">Performance Scale</p>
              <div className="flex items-center gap-2 text-xs text-white">
                <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-red-600 rounded" />
                <span>Poor</span>
                <div className="w-3 h-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded" />
                <span>Good</span>
                <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded" />
                <span>Excellent</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default PositionalHeatMap;
