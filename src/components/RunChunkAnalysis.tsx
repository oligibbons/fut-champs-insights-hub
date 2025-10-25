// src/components/RunChunkAnalysis.tsx
import { useState, useMemo } from 'react';
// --- Make sure WeeklyPerformance is imported correctly ---
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
  // No props needed now
}

const RunChunkAnalysis: React.FC<RunChunkAnalysisProps> = () => {
  const [view, setView] = useState<'current' | 'best' | 'worst'>('current');
  const { runs, loading: loadingAllRuns } = useAllRunsData();
  const [selectedRun, setSelectedRun] = useState<WeeklyPerformance | null>(null);

  // Find the most recent run to display as "Current"
  const currentRun = useMemo(() => {
    // --- FIX: Check (runs || []) ---
    if (loadingAllRuns || (runs || []).length === 0) return null; 
    // Assuming runs are sorted descending from the hook
    return runs[0];
  }, [runs, loadingAllRuns]);

  // Process stats for the "Current" view
  const currentRunStats = useMemo(() => {
    // --- FIX: Ensure currentRun has games ---
    if (!currentRun || !Array.isArray(currentRun.games)) return null; 
    return processRunForChunks(currentRun);
  }, [currentRun]);

  // Process stats for "Best" / "Worst" views
  const allTimeStats = useMemo(() => {
    // --- FIX: Check (runs || []) ---
    if (loadingAllRuns || (runs || []).length === 0) return null; 
    // Pass the potentially empty but guaranteed array `runs`
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
        // For current, return the specific chunks from currentRunStats
        return {
          beginning: currentRunStats, // This RunChunkStats obj contains beginning, middle, end
          middle: currentRunStats,
          end: currentRunStats,
        };
    }
  }, [view, currentRunStats, allTimeStats]);

  const handleCardClick = (runStats: RunChunkStats | null | undefined) => {
    // Allow clicking current run card if needed, or keep original logic
    // if (view === 'current' || !runStats) return; 
    if (!runStats || !runStats.runData) return; // Need runData to show popup
    setSelectedRun(runStats.runData);
  };

  // Helper to safely get the specific chunk data
  const getChunk = (
    data: RunChunkStats | null | undefined, 
    chunkKey: 'beginning' | 'middle' | 'end'
  ) => {
      if (!data) return null;
      return data[chunkKey];
  };
  
  // Helper to safely get the run name
  const getRunName = (data: RunChunkStats | null | undefined) => {
      if (!data) return '...'; // Loading or no data
      if (view === 'current') return `Current: ${data.runName ?? ''}`;
      return data.runName;
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
          {/* --- FIX: Use helper functions to safely access data --- */}
          <RunChunkCard
            title="Games 1-5"
            stats={getChunk(displayData.beginning, 'beginning')}
            runName={getRunName(displayData.beginning)}
            isLoading={loadingAllRuns}
            onClick={() => handleCardClick(displayData.beginning)}
          />
          <RunChunkCard
            title="Games 6-10"
            stats={getChunk(displayData.middle, 'middle')}
            runName={getRunName(displayData.middle)}
            isLoading={loadingAllRuns}
            onClick={() => handleCardClick(displayData.middle)}
          />
          <RunChunkCard
            title="Games 11-15"
            stats={getChunk(displayData.end, 'end')}
            runName={getRunName(displayData.end)}
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
