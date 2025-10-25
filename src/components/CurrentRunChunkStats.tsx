// src/components/CurrentRunChunkStats.tsx
import { useState, useEffect, useMemo } from 'react';
import { WeeklyPerformance } from '@/types/futChampions';
import { processRunForChunks, RunChunkStats } from '@/utils/runAnalytics';
import { RunChunkCard } from './RunChunkCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CurrentRunChunkStatsProps {
  currentRun: WeeklyPerformance | null;
}

const CurrentRunChunkStats: React.FC<CurrentRunChunkStatsProps> = ({ currentRun }) => {
  const currentRunStats = useMemo(() => {
    if (!currentRun || !currentRun.games) return null;
    return processRunForChunks(currentRun);
  }, [currentRun]);

  const isLoading = !currentRun; // Show loading skeletons if run isn't passed
  const stats = currentRunStats;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Current Run Form</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          <RunChunkCard
            title="Games 1-5"
            stats={stats?.beginning ?? null}
            isLoading={isLoading}
          />
          <RunChunkCard
            title="Games 6-10"
            stats={stats?.middle ?? null}
            isLoading={isLoading}
          />
          <RunChunkCard
            title="Games 11-15"
            stats={stats?.end ?? null}
            isLoading={isLoading}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentRunChunkStats;
