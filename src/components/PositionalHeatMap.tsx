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
  x: number;
  y: number;
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
    'SUB': { x: 50, y: 95 },
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
    if (rating >= 8.5) return '#10b981'; // green-500
    if (rating >= 8.0) return '#84cc16'; // lime-500
    if (rating >= 7.5) return '#eab308'; // yellow-500
    if (rating >= 7.0) return '#f97316'; // orange-500
    if (rating >= 6.5) return '#f59e0b'; // amber-500
    if (rating >= 6.0) return '#ef4444'; // red-500
    return '#dc2626'; // red-600
  };

  const getIntensity = (rating: number) => {
    return Math.max(0.4, Math.min(1, (rating - 4) / 6));
  };

  // Generate a full pitch heatmap
  const generateHeatmapData = () => {
    // Create a grid of points covering the entire pitch
    const gridPoints = [];
    const gridDensity = 20; // Higher number = more detailed heatmap
    
    for (let x = 0; x <= 100; x += 100/gridDensity) {
      for (let y = 0; y <= 100; y += 100/gridDensity) {
        // Calculate influence from each position
        let totalInfluence = 0;
        let weightedRating = 0;
        
        positionData.forEach(pos => {
          // Calculate distance from this grid point to the position
          const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
          // Influence decreases with distance (inverse square law with a cutoff)
          const influence = Math.max(0, 1 - Math.min(1, (distance / 30)));
          
          if (influence > 0) {
            totalInfluence += influence;
            weightedRating += pos.averageRating * influence;
          }
        });
        
        // Only add points with some influence
        if (totalInfluence > 0) {
          const avgRating = weightedRating / totalInfluence;
          gridPoints.push({
            x,
            y,
            rating: avgRating,
            intensity: getIntensity(avgRating) * Math.min(1, totalInfluence)
          });
        }
      }
    }
    
    return gridPoints;
  };

  const heatmapPoints = positionData.length > 0 ? generateHeatmapData() : [];

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
                <p>Visual representation of average player ratings by position. Heat patches show performance intensity, with ratings overlaid. Hover over positions for detailed statistics.</p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full h-96 bg-gradient-to-b from-green-800/20 to-green-900/30 rounded-lg border-2 border-white/20 overflow-hidden">
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

            {/* Full pitch heatmap */}
            {heatmapPoints.map((point, index) => (
              <div
                key={`heat-point-${index}`}
                className="absolute rounded-full blur-md pointer-events-none"
                style={{
                  left: `${point.x}%`,
                  top: `${point.y}%`,
                  width: '60px',
                  height: '60px',
                  background: `radial-gradient(circle, ${getHeatColor(point.rating)}${Math.round(point.intensity * 255).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
                  transform: 'translate(-50%, -50%)',
                  opacity: point.intensity,
                }}
              />
            ))}

            {/* Position markers with ratings */}
            {positionData.map((position) => (
              <Tooltip key={position.position}>
                <TooltipTrigger asChild>
                  <div
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group pointer-events-auto"
                    style={{
                      left: `${position.x}%`,
                      top: `${position.y}%`,
                    }}
                  >
                    <div className="relative">
                      {/* Subtle border circle */}
                      <div className="w-14 h-14 rounded-full border-2 border-white/50 bg-black/30 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <div className="text-center">
                          <div className="text-[10px] font-bold text-white">{position.position}</div>
                          <div className="text-xs font-bold text-white">{position.averageRating.toFixed(1)}</div>
                        </div>
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
                <div className="w-3 h-3 bg-red-500 rounded" />
                <span>Poor</span>
                <div className="w-3 h-3 bg-yellow-500 rounded" />
                <span>Good</span>
                <div className="w-3 h-3 bg-green-500 rounded" />
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