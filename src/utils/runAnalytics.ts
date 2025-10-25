// src/utils/runAnalytics.ts
import { Game, WeeklyPerformance } from '@/types/futChampions'; // Make sure Game is imported

export interface ChunkRecord {
  wins: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  gameCount: number;
}

export interface RunChunkStats {
  runId: string;
  runName: string;
  beginning: ChunkRecord;
  middle: ChunkRecord;
  end: ChunkRecord;
  runData: WeeklyPerformance; // Store the full run data for the popup
}

/**
 * Calculates the W-L record for a specific chunk of games (e.g., games 1-5).
 */
export const calculateChunkRecord = (games: Game[], start: number, end: number): ChunkRecord => {
  // --- Safety Check: Ensure games is an array ---
  const validGames = Array.isArray(games) ? games : []; 
  const chunkGames = validGames.filter(
    (g) => g.game_number >= start && g.game_number <= end
  );

  return chunkGames.reduce(
    (acc, game) => {
      const isWin = game.result === 'win';
      // --- Safety Check: Ensure goals are numbers ---
      const userGoals = typeof game.user_goals === 'number' ? game.user_goals : 0;
      const opponentGoals = typeof game.opponent_goals === 'number' ? game.opponent_goals : 0;
      return {
        wins: acc.wins + (isWin ? 1 : 0),
        losses: acc.losses + (!isWin ? 1 : 0),
        goalsFor: acc.goalsFor + userGoals,
        goalsAgainst: acc.goalsAgainst + opponentGoals,
        gameCount: acc.gameCount + 1,
      };
    },
    { wins: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, gameCount: 0 }
  );
};

/**
 * Processes a single run into its three chunks.
 */
export const processRunForChunks = (run: WeeklyPerformance): RunChunkStats => {
  // --- Safety Check: Ensure run.games is an array ---
  const games = Array.isArray(run.games) ? run.games : []; 
  return {
    runId: run.id,
    runName: run.custom_name || `Week ${run.week_number}`,
    beginning: calculateChunkRecord(games, 1, 5),
    middle: calculateChunkRecord(games, 6, 10),
    end: calculateChunkRecord(games, 11, 15),
    runData: run,
  };
};

/**
 * Compares two chunks to find the "better" one (more wins, then fewer losses).
 */
const getBestChunk = (
  currentBest: RunChunkStats | null,
  newRun: RunChunkStats,
  chunkKey: 'beginning' | 'middle' | 'end'
): RunChunkStats | null => { // Allow returning null
  // --- Safety Check: Ensure runData and games exist, and chunk has games ---
  if (!newRun?.runData || !Array.isArray(newRun.runData.games) || newRun[chunkKey].gameCount === 0) {
      return currentBest;
  }
  if (!currentBest) return newRun;

  const currentStats = currentBest[chunkKey];
  const newStats = newRun[chunkKey];

  if (newStats.wins > currentStats.wins) return newRun;
  if (newStats.wins === currentStats.wins) {
    if (newStats.losses < currentStats.losses) return newRun;
  }
  return currentBest;
};

/**
 * Compares two chunks to find the "worse" one (fewer wins, then more losses).
 */
const getWorstChunk = (
  currentWorst: RunChunkStats | null,
  newRun: RunChunkStats,
  chunkKey: 'beginning' | 'middle' | 'end'
): RunChunkStats | null => { // Allow returning null
  // --- Safety Check: Ensure runData and games exist, and chunk has games ---
  if (!newRun?.runData || !Array.isArray(newRun.runData.games) || newRun[chunkKey].gameCount === 0) {
      return currentWorst;
  }
  if (!currentWorst) return newRun;

  const currentStats = currentWorst[chunkKey];
  const newStats = newRun[chunkKey];

  if (newStats.wins < currentStats.wins) return newRun;
  if (newStats.wins === currentStats.wins) {
    if (newStats.losses > currentStats.losses) return newRun;
  }
  return currentWorst;
};

export interface AllTimeChunkStats {
  bestBeginning: RunChunkStats | null;
  bestMiddle: RunChunkStats | null;
  bestEnd: RunChunkStats | null;
  worstBeginning: RunChunkStats | null;
  worstMiddle: RunChunkStats | null;
  worstEnd: RunChunkStats | null;
}

/**
 * Calculates the best/worst chunk stats from a list of all historical runs.
 */
export const calculateAllTimeChunkStats = (
  allRuns: WeeklyPerformance[] // Expecting an array, even if empty
): AllTimeChunkStats => {
  // --- !! FIX: Explicitly check if allRuns is an array !! ---
  if (!Array.isArray(allRuns)) {
    console.error("calculateAllTimeChunkStats received non-array:", allRuns);
    // Return empty stats if input is invalid
    return {
      bestBeginning: null, bestMiddle: null, bestEnd: null,
      worstBeginning: null, worstMiddle: null, worstEnd: null,
    };
  }
  // --- End Fix ---

  const allRunChunkStats = allRuns.map(processRunForChunks);

  const stats: AllTimeChunkStats = {
    bestBeginning: null,
    bestMiddle: null,
    bestEnd: null,
    worstBeginning: null,
    worstMiddle: null,
    worstEnd: null,
  };

  for (const runStats of allRunChunkStats) {
    // Pass existing stat and new run stat to comparison functions
    stats.bestBeginning = getBestChunk(stats.bestBeginning, runStats, 'beginning');
    stats.bestMiddle = getBestChunk(stats.bestMiddle, runStats, 'middle');
    stats.bestEnd = getBestChunk(stats.bestEnd, runStats, 'end');

    stats.worstBeginning = getWorstChunk(stats.worstBeginning, runStats, 'beginning');
    stats.worstMiddle = getWorstChunk(stats.worstMiddle, runStats, 'middle');
    stats.worstEnd = getWorstChunk(stats.worstEnd, runStats, 'end');
  }

  return stats;
};
