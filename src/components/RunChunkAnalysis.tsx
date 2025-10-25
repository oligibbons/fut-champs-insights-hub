// src/components/RunChunkAnalysis.tsx
import { useState, useMemo } from 'react';
import { WeeklyPerformance } from '@/types/futChampions';
import {
  processRunForChunks,
  calculateAllTimeChunkStats,
  AllTimeChunkStats,
  RunChunkStats,
} from '@/utils/runAnalytics';
import { useAllRunsData } from '@/hooks/useAllRunsData'; // Removed WeeklyPerformanceWithGames, hook handles type
import { RunChunkCard } from './RunChunkCard';
import DashboardSection from './DashboardSection';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import WeekCompletionPopup from './WeekCompletionPopup';

interface RunChunkAnalysisProps {
  // No props needed
}

const RunChunkAnalysis: React.FC<RunChunkAnalysisProps> = () => {
  const [view, setView] = useState<'current' | 'best' | 'worst'>('current');
  // Hook now guarantees runs is an array
  const { runs, loading: loadingAllRuns } = useAllRunsData();
  const [selectedRun, setSelectedRun] = useState<WeeklyPerformance | null>(null);

  // Find the most recent run
  const currentRun = useMemo(() => {
    // Check loading state and if the runs array is not empty
    if (loadingAllRuns || runs.length === 0) return null;
    return runs[0]; // First item is the most recent (due to hook's sorting)
  }, [runs, loadingAllRuns]);

  // Process stats for the "Current" view
  const currentRunStats = useMemo(() => {
    // processRunForChunks now handles null check internally
    return processRunForChunks(currentRun);
  }, [currentRun]);

  // Process stats for "Best" / "Worst" views
  const allTimeStats = useMemo(() => {
    // Check loading and ensure runs is an array before calculating
    if (loadingAllRuns || !Array.isArray(runs)) return null;
    // calculateAllTimeChunkStats now handles empty array internally
    return calculateAllTimeChunkStats(runs);
  }, [runs, loadingAllRuns]);

  // Determine which *RunChunkStats* object contains the data we need for each card
  const displayRunStatsSource = useMemo(() => {
    switch (view) {
      case 'best':
        return {
          beginningSource: allTimeStats?.bestBeginning,
          middleSource: allTimeStats?.bestMiddle,
          endSource: allTimeStats?.bestEnd,
        };
      case 'worst':
        return {
          beginningSource: allTimeStats?.worstBeginning,
          middleSource: allTimeStats?.worstMiddle,
          endSource: allTimeStats?.worstEnd,
        };
      case 'current':
      default:
        // For current, all sources point to the single currentRunStats object
        return {
          beginningSource: currentRunStats,
          middleSource: currentRunStats,
          endSource: currentRunStats,
        };
    }
  }, [view, currentRunStats, allTimeStats]);

  const handleCardClick = (runStats: RunChunkStats | null | undefined) => {
    // Only allow click if we have valid runData associated
    if (!runStats?.runData) return;
    setSelectedRun(runStats.runData);
  };

  // Helper to safely get the specific chunk *record* (wins, losses etc.)
  const getChunkRecord = (
    source: RunChunkStats | null | undefined,
    chunkKey: 'beginning' | 'middle' | 'end'
  ): ChunkRecord | null => {
      if (!source) return null;
      return source[chunkKey] ?? null; // Return the specific chunk record or null
  };

  // Helper to safely get the run name for display
  const getRunNameForDisplay = (source: RunChunkStats | null | undefined): string | null => {
      if (!source) return view === 'current' ? null : '...'; // Show '...' only for best/worst loading
      if (view === 'current') return null; // Don't show name for current view cards
      return source.runName; // Show name for best/worst
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
          {/* Use flex-1 on items to ensure they fill width equally */}
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
          {/* Pass the specific chunk record and source RunChunkStats */}
          <RunChunkCard
            title="Games 1-5"
            stats={getChunkRecord(displayRunStatsSource.beginningSource, 'beginning')}
            runName={getRunNameForDisplay(displayRunStatsSource.beginningSource)}
            isLoading={loadingAllRuns}
            // Pass the source RunChunkStats object itself for the click handler
            onClick={view !== 'current' ? () => handleCardClick(displayRunStatsSource.beginningSource) : undefined}
          />
          <RunChunkCard
            title="Games 6-10"
            stats={getChunkRecord(displayRunStatsSource.middleSource, 'middle')}
            runName={getRunNameForDisplay(displayRunStatsSource.middleSource)}
            isLoading={loadingAllRuns}
            onClick={view !== 'current' ? () => handleCardClick(displayRunStatsSource.middleSource) : undefined}
          />
          <RunChunkCard
            title="Games 11-15"
            stats={getChunkRecord(displayRunStatsSource.endSource, 'end')}
            runName={getRunNameForDisplay(displayRunStatsSource.endSource)}
            isLoading={loadingAllRuns}
            onClick={view !== 'current' ? () => handleCardClick(displayRunStatsSource.endSource) : undefined}
          />
        </div>
      </div>

      {/* The popup modal */}
      <WeekCompletionPopup
        isOpen={!!selectedRun}
        onClose={() => setSelectedRun(null)}
        runData={selectedRun} // Pass the selected WeeklyPerformance object
      />
    </DashboardSection>
  );
};

export default RunChunkAnalysis;
