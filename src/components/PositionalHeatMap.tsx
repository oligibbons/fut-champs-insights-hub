import React, { useMemo } from 'react';
import { GameResult } from '@/types/futChampions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PositionalHeatMapProps {
  games: GameResult[];
}

interface PositionStat {
  position: string;
  games: number;
  goals: number;
  assists: number;
  avgRating: number;
}

const positionCoordinates: Record<string, { x: number; y: number }> = {
  GK: { x: 50, y: 90 },
  LB: { x: 20, y: 75 }, LWB: { x: 20, y: 60 },
  CB: { x: 40, y: 80 }, CB_C: { x: 50, y: 80 }, CB_R: { x: 60, y: 80 },
  RB: { x: 80, y: 75 }, RWB: { x: 80, y: 60 },
  CDM: { x: 50, y: 65 },
  LM: { x: 20, y: 45 },
  CM: { x: 40, y: 50 }, CM_R: { x: 60, y: 50 },
  RM: { x: 80, y: 45 },
  CAM: { x: 50, y: 35 },
  LW: { x: 20, y: 20 },
  RW: { x: 80, y: 20 },
  CF: { x: 50, y: 20 },
  ST: { x: 50, y: 10 }, ST_L: { x: 40, y: 15 }, ST_R: { x: 60, y: 15 },
};

const PositionalHeatMap: React.FC<PositionalHeatMapProps> = ({ games }) => {
  const positionData = useMemo(() => {
    const stats: Record<string, PositionStat> = {};
    games.forEach(game => {
      game.playerStats?.forEach(p => {
        const pos = p.position.toUpperCase();
        if (!stats[pos]) {
          stats[pos] = { position: pos, games: 0, goals: 0, assists: 0, avgRating: 0 };
        }
        stats[pos].games += 1;
        stats[pos].goals += p.goals;
        stats[pos].assists += p.assists;
        stats[pos].avgRating = (stats[pos].avgRating * (stats[pos].games - 1) + p.rating) / stats[pos].games;
      });
    });
    return Object.values(stats);
  }, [games]);

  const maxRating = Math.max(...positionData.map(p => p.avgRating), 0);

  const getColor = (rating: number) => {
    const intensity = Math.max(0, (rating - 6) / 4); // Normalize from 6-10 to 0-1
    if (rating < 6.5) return `hsla(var(--destructive), ${intensity * 0.8})`;
    if (rating < 7.5) return `hsla(48, 90%, 50%, ${intensity * 0.8})`;
    return `hsla(var(--primary), ${intensity * 0.8})`;
  };

  return (
    <div className="aspect-[4/3] relative bg-gradient-to-b from-green-900/50 to-green-950/50 rounded-lg p-4 border border-border">
      <div className="absolute inset-0 bg-no-repeat bg-center bg-contain" style={{ backgroundImage: "url('/pitch.svg')", opacity: 0.1 }}></div>
      <TooltipProvider>
        {positionData.map(pos => {
          const coords = positionCoordinates[pos.position] || positionCoordinates[pos.position.split('_')[0]];
          if (!coords) return null;

          const size = 30 + (pos.games * 2);

          return (
            <Tooltip key={pos.position}>
              <TooltipTrigger asChild>
                <div
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:z-10"
                  style={{
                    left: `${coords.x}%`,
                    top: `${coords.y}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    background: getColor(pos.avgRating),
                    boxShadow: `0 0 15px ${getColor(pos.avgRating)}`,
                  }}
                >
                  <span className="text-xs font-bold text-white drop-shadow-lg">{pos.position}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-bold text-lg">{pos.position}</p>
                <p>Avg. Rating: <span className="font-semibold">{pos.avgRating.toFixed(2)}</span></p>
                <p>Games: <span className="font-semibold">{pos.games}</span></p>
                <p>Goals: <span className="font-semibold">{pos.goals}</span></p>
                <p>Assists: <span className="font-semibold">{pos.assists}</span></p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>
    </div>
  );
};

export default PositionalHeatMap;
