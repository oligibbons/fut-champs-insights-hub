// src/components/CurrentRunChunkStats.tsx
import { useMemo } from 'react';
import { WeeklyPerformance } from '@/types/futChampions';
import { processRunForChunks, ChunkRecord } from '@/utils/runAnalytics';
import { RunChunkCard } from './RunChunkCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CurrentRunChunkStatsProps {
  currentRun: WeeklyPerformance | null;
}

const CurrentRunChunkStats: React.FC<CurrentRunChunkStatsProps> = ({ currentRun }) => {
  // processRunForChunks handles null check and returns null if needed
  const currentRunStats = useMemo(() => {
    return processRunForChunks(currentRun);
  }, [currentRun]);

  // Loading state is true if currentRun is null OR if currentRunStats is null (meaning processing failed)
  const isLoading = !currentRun || !currentRunStats;

  // ---
  // --- FIX IS HERE ---
  // ---
  // We must use optional chaining (?.) because currentRunStats can be null
  // if processRunForChunks returns null (e.g., for an invalid run).
  // The nullish coalescing (?? null) ensures the stats are explicitly null
  // if currentRunStats or the .beginning property doesn't exist.
  // ---
  const beginningStats = currentRunStats?.beginning ?? null;
  const middleStats = currentRunStats?.middle ?? null;
  const endStats = currentRunStats?.end ?? null;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Current Run Form</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Check isLoading before rendering grid to prevent layout shifts */}
        {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
               <RunChunkCard title="Games 1-5" stats={null} isLoading={true} />
               <RunChunkCard title="Games 6-10" stats={null} isLoading={true} />
               <RunChunkCard title="Games 11-15" stats={null} isLoading={true} />
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <RunChunkCard
                title="Games 1-5"
                stats={beginningStats} // This is now safely null or a ChunkRecord
                isLoading={false}
                // No runName needed for current view
                // No onClick needed
              />
              <RunChunkCard
                title="Games 6-10"
                stats={middleStats} // This is now safely null or a ChunkRecord
                isLoading={false}
              />
              <RunChunkCard
                title="Games 11-15"
                stats={endStats} // This is now safely null or a ChunkRecord
                isLoading={false}
              />
            </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CurrentRunChunkStats;
