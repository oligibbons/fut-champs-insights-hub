// src/components/CurrentRunChunkStats.tsx
import { useMemo } from 'react';
import { WeeklyPerformance } from '@/types/futChampions';
import { processRunForChunks, RunChunkStats, ChunkRecord } from '@/utils/runAnalytics'; // Import ChunkRecord
import { RunChunkCard } from './RunChunkCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CurrentRunChunkStatsProps {
  currentRun: WeeklyPerformance | null;
}

const CurrentRunChunkStats: React.FC<CurrentRunChunkStatsProps> = ({ currentRun }) => {
  // processRunForChunks now handles null check
  const currentRunStats = useMemo(() => {
    return processRunForChunks(currentRun);
  }, [currentRun]);

  // Determine loading state based only on whether currentRun exists
  const isLoading = !currentRun; 

  // Safely get chunk records, default to null if stats don't exist
  const beginningStats = currentRunStats?.beginning ?? null;
  const middleStats = currentRunStats?.middle ?? null;
  const endStats = currentRunStats?.end ?? null;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Current Run Form</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3"> {/* Adjusted grid for smaller screens */}
          <RunChunkCard
            title="Games 1-5"
            stats={beginningStats}
            isLoading={isLoading}
            // No runName needed for current view
            // No onClick needed
          />
          <RunChunkCard
            title="Games 6-10"
            stats={middleStats}
            isLoading={isLoading}
          />
          <RunChunkCard
            title="Games 11-15"
            stats={endStats}
            isLoading={isLoading}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentRunChunkStats;
