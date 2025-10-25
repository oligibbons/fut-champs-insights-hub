// src/components/RunChunkAnalysis.tsx
import { useState, useMemo } from 'react';
import { WeeklyPerformance } from '@/types/futChampions';
import {
  processRunForChunks,
  calculateAllTimeChunkStats,
  AllTimeChunkStats,
  RunChunkStats,
} from '@/utils/runAnalytics';
import { useAllRunsData, WeeklyPerformanceWithGames } from '@/hooks/useAllRunsData';
import { RunChunkCard } from './RunChunkCard';
import DashboardSection from './DashboardSection';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import WeekCompletionPopup from './WeekCompletionPopup';

interface RunChunkAnalysisProps {
  // We get the current run from the same hook
}

const RunChunkAnalysis: React.FC<RunChunkAnalysisProps> = () => {
  const [view, setView] = useState<'current' | 'best' | 'worst'>('current');
  const { runs, loading: loadingAllRuns } = useAllRunsData();
  const [selectedRun, setSelectedRun] = useState<WeeklyPerformance | null>(null);

  // Find the most recent run to display as "Current"
  const currentRun = useMemo(() => {
    if (loadingAllRuns || runs.length === 0) return null;
    // Assuming runs are sorted by date/week_number descending from the hook
    return runs[0];
  }, [runs, loadingAllRuns]);

  // Process stats for the "Current" view
  const currentRunStats = useMemo(() => {
    if (!currentRun) return null;
    return processRunForChunks(currentRun);
  }, [currentRun]);

  // Process stats for "Best" / "Worst" views
  const allTimeStats = useMemo(() => {
    if (loadingAllRuns || runs.length === 0) return null;
    return calculateAllTimeChunkStats(runs);
  }, [runs, loadingAllRuns]);

  // Determine which stats to display based on the selected view
  const displayData = useMemo(() => {
    switch (view) {
      case 'best':
        return {
          beginning: allTimeStats?.bestBeginning,
          middle: allTimeStats?.bestMiddle,
          end: allTimeStats?.bestEnd,
        };
      case 'worst':
        return {
          beginning: allTimeStats?.worstBeginning,
          middle: allTimeStats?.worstMiddle,
          end: allTimeStats?.worstEnd,
        };
      case 'current':
      default:
        return {
          beginning: currentRunStats,
          middle: currentRunStats,
          end: currentRunStats,
        };
    }
  }, [view, currentRunStats, allTimeStats]);

  const handleCardClick = (runStats: RunChunkStats | null | undefined) => {
    if (view === 'current' || !runStats) return;
    setSelectedRun(runStats.runData);
  };

  return (
    <DashboardSection title="Run Form Analysis (Games 1-15)">
      <div className="flex flex-col space-y-4">
        <ToggleGroup
          type="single"
          value={view}
          onValueChange={(value) => {
            if (value) setView(value as any);
          }}
          className="w-full"
        >
          <ToggleGroupItem value="current" aria-label="Current Run" className="flex-1">
            Current
          </ToggleGroupItem>
          <ToggleGroupItem value="best" aria-label="Best Ever" className="flex-1">
            Best Ever
          </ToggleGroupItem>
          <ToggleGroupItem value="worst" aria-label="Worst Ever" className="flex-1">
            Worst Ever
          </ToggleGroupItem>
        </ToggleGroup>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <RunChunkCard
            title="Games 1-5"
            stats={displayData.beginning?.[view === 'current' ? 'beginning' : 'beginning'] ?? null}
            runName={view === 'current' ? `Current: ${currentRunStats?.runName ?? ''}` : displayData.beginning?.runName}
            isLoading={loadingAllRuns}
            onClick={() => handleCardClick(displayData.beginning)}
          />
          <RunChunkCard
            title="Games 6-10"
            stats={displayData.middle?.[view === 'current' ? 'middle' : 'middle'] ?? null}
            runName={view === 'current' ? `Current: ${currentRunStats?.runName ?? ''}` : displayData.middle?.runName}
            isLoading={loadingAllRuns}
            onClick={() => handleCardClick(displayData.middle)}
          />
          <RunChunkCard
            title="Games 11-15"
            stats={displayData.end?.[view === 'current' ? 'end' : 'end'] ?? null}
            runName={view === 'current' ? `Current: ${currentRunStats?.runName ?? ''}` : displayData.end?.runName}
            isLoading={loadingAllRuns}
            onClick={() => handleCardClick(displayData.end)}
          />
        </div>
      </div>

      {/* The popup modal */}
      <WeekCompletionPopup
        isOpen={!!selectedRun}
        onClose={() => setSelectedRun(null)}
        runData={selectedRun}
      />
    </DashboardSection>
  );
};

export default RunChunkAnalysis;
