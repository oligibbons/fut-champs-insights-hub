// src/components/RunChunkAnalysis.tsx
import { useState, useMemo } from 'react';
import { WeeklyPerformance } from '@/types/futChampions';
import {
  processRunForChunks,
  calculateAllTimeChunkStats,
  AllTimeChunkStats, // Keep interface
  RunChunkStats,
  ChunkRecord // Import ChunkRecord type
} from '@/utils/runAnalytics';
import { useAllRunsData } from '@/hooks/useAllRunsData';
import { RunChunkCard } from './RunChunkCard';
import DashboardSection from './DashboardSection';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import WeekCompletionPopup from './WeekCompletionPopup';

interface RunChunkAnalysisProps {
  // No props needed
}

const RunChunkAnalysis: React.FC<RunChunkAnalysisProps> = () => {
  const [view, setView] = useState<'current' | 'best' | 'worst'>('current');
  // Hook guarantees runs is an array
  const { runs, loading: loadingAllRuns } = useAllRunsData();
  const [selectedRun, setSelectedRun] = useState<WeeklyPerformance | null>(null);

  // Safely find the most recent run
  const currentRun = useMemo(() => {
    // Check loading state and if the runs array actually has elements
    if (loadingAllRuns || !Array.isArray(runs) || runs.length === 0) return null;
    return runs[0]; // First item is the most recent
  }, [runs, loadingAllRuns]); // Depend on runs array directly

  // Process stats for the "Current" view safely
  const currentRunStats = useMemo(() => {
    // processRunForChunks handles null input
    return processRunForChunks(currentRun);
  }, [currentRun]); // Depend only on currentRun object

  // Process stats for "Best" / "Worst" views safely
  const allTimeStats = useMemo(() => {
    // Check loading and ensure runs is a non-empty array before calculating
    if (loadingAllRuns || !Array.isArray(runs) || runs.length === 0) return null;
    // calculateAllTimeChunkStats handles empty array if passed
    return calculateAllTimeChunkStats(runs);
  }, [runs, loadingAllRuns]); // Depend on runs array directly

  // Determine which *RunChunkStats* object contains the source data for each card
  const displayRunStatsSource = useMemo(() => {
    // Always return a structure, even if sources are null
    switch (view) {
      case 'best':
        return {
          beginningSource: allTimeStats?.bestBeginning ?? null,
          middleSource: allTimeStats?.bestMiddle ?? null,
          endSource: allTimeStats?.bestEnd ?? null,
        };
      case 'worst':
        return {
          beginningSource: allTimeStats?.worstBeginning ?? null,
          middleSource: allTimeStats?.worstMiddle ?? null,
          endSource: allTimeStats?.worstEnd ?? null,
        };
      case 'current':
      default:
        // Source is always currentRunStats (which might be null)
        return {
          beginningSource: currentRunStats,
          middleSource: currentRunStats,
          endSource: currentRunStats,
        };
    }
  }, [view, currentRunStats, allTimeStats]); // Depend on view and the calculated stats

  const handleCardClick = (runStats: RunChunkStats | null | undefined) => {
    // Only proceed if runStats and runStats.runData exist
    if (runStats?.runData) {
       setSelectedRun(runStats.runData);
    }
  };

  // Helper to safely get the specific chunk *record* (wins, losses etc.)
  const getChunkRecord = (
    source: RunChunkStats | null | undefined,
    chunkKey: 'beginning' | 'middle' | 'end'
  ): ChunkRecord | null => {
      // Check if source exists and the specific chunk exists on it
      return source?.[chunkKey] ?? null;
  };

  // Helper to safely get the run name for display
  const getRunNameForDisplay = (source: RunChunkStats | null | undefined): string | null => {
      // Don't show name for current view cards
      if (view === 'current') return null;
      // If loading best/worst and source is not yet available, show '...'
      if (!source) return '...';
      // Otherwise, show the name from the source
      return source.runName;
  };

  return (
    <DashboardSection title="Run Form Analysis (Games 1-15)">
      <div className="flex flex-col space-y-4">
        <ToggleGroup
          type="single"
          value={view}
          onValueChange={(value) => {
            // Ensure value is one of the allowed strings before setting state
            if (value === 'current' || value === 'best' || value === 'worst') {
               setView(value);
            }
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
          {/* Pass the specific chunk record and source RunChunkStats */}
          <RunChunkCard
            title="Games 1-5"
            stats={getChunkRecord(displayRunStatsSource.beginningSource, 'beginning')}
            runName={getRunNameForDisplay(displayRunStatsSource.beginningSource)}
            isLoading={loadingAllRuns}
            // Only make clickable if not current view
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

      {/* Popup modal remains the same */}
      <WeekCompletionPopup
        isOpen={!!selectedRun}
        onClose={() => setSelectedRun(null)}
        runData={selectedRun} // Pass the selected WeeklyPerformance object
      />
    </DashboardSection>
  );
};

export default RunChunkAnalysis;
