import React, { useMemo } from 'react';
import { GameResult } from '@/types/futChampions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PositionalHeatMapProps {
  games: GameResult[];
}

interface PositionStat {
  position: string;
  games: number;
  wins: number;
  goals: number;
  assists: number;
  avgRating: number;
  winRate: number;
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
          stats[pos] = { position: pos, games: 0, wins: 0, goals: 0, assists: 0, avgRating: 0, winRate: 0 };
        }
        stats[pos].games += 1;
        stats[pos].goals += p.goals;
        stats[pos].assists += p.assists;
        stats[pos].avgRating = (stats[pos].avgRating * (stats[pos].games - 1) + p.rating) / stats[pos].games;
        if (game.result === 'win') {
            stats[pos].wins += 1;
        }
        stats[pos].winRate = (stats[pos].wins / stats[pos].games) * 100;
      });
    });
    return Object.values(stats);
  }, [games]);

  const getColor = (rating: number, winRate: number) => {
    // Normalize rating (6-10 becomes 0-1) and winRate (0-100 becomes 0-1)
    const ratingIntensity = Math.max(0, (rating - 6) / 4);
    const winRateIntensity = winRate / 100;

    // Combine intensities, giving more weight to rating
    const combinedIntensity = (ratingIntensity * 0.7) + (winRateIntensity * 0.3);

    // Determine hue based on performance
    if (rating < 6.5 && winRate < 40) return `hsla(var(--destructive), ${combinedIntensity})`; // Poor performance
    if (rating > 7.5 && winRate > 60) return `hsla(var(--primary), ${combinedIntensity})`; // Strong performance
    return `hsla(48, 90%, 50%, ${combinedIntensity})`; // Average performance
  };

  return (
    <div className="aspect-[4/3] relative bg-gradient-to-b from-green-900/50 to-green-950/50 rounded-lg p-4 border border-border">
        {/* ... (rest of the component remains the same, just ensure getColor is called with winRate) */}
    </div>
  );
};

export default PositionalHeatMap;
