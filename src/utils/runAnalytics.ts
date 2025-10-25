// src/utils/runAnalytics.ts
import { Game, WeeklyPerformance } from '@/types/futChampions';

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
export const calculateChunkRecord = (games: Game[] | undefined | null, start: number, end: number): ChunkRecord => {
  // --- Safety Check: Ensure games is an array ---
  const validGames = Array.isArray(games) ? games : [];
  const chunkGames = validGames.filter(
    // --- Safety Check: Ensure game_number exists, is a number, and within range ---
    (g) => g && typeof g.game_number === 'number' && g.game_number >= start && g.game_number <= end
  );

  // Use reduce only if chunkGames has items
  if (chunkGames.length === 0) {
      return { wins: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, gameCount: 0 };
  }

  return chunkGames.reduce(
    (acc, game) => {
      // --- Safety Check: Assume game exists due to filter, check result ---
      const isWin = game.result === 'win';
      // --- Safety Check: Ensure goals are numbers, default to 0 ---
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
    { wins: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, gameCount: 0 } // Initial value
  );
};

/**
 * Processes a single run into its three chunks. Returns null if run is invalid.
 */
export const processRunForChunks = (run: WeeklyPerformance | null | undefined): RunChunkStats | null => {
   // --- Safety Check: Ensure run exists and has an id and week_number ---
   if (!run || !run.id || typeof run.week_number !== 'number') return null;

  // --- Safety Check: Ensure run.games is an array (defaults to [] if not) ---
  const games = Array.isArray(run.games) ? run.games : [];

  return {
    runId: run.id,
    runName: run.custom_name || `Week ${run.week_number}`,
    beginning: calculateChunkRecord(games, 1, 5),
    middle: calculateChunkRecord(games, 6, 10),
    end: calculateChunkRecord(games, 11, 15),
    runData: run, // Pass the original run data
  };
};

/**
 * Compares two chunks to find the "better" one (more wins, then fewer losses).
 */
const getBestChunk = (
  currentBest: RunChunkStats | null,
  newRunStats: RunChunkStats | null, // Receive processed stats
  chunkKey: 'beginning' | 'middle' | 'end'
): RunChunkStats | null => {
  // --- Safety Check: Ensure newRunStats and its specific chunk record exist and have games ---
  const newChunkRecord = newRunStats?.[chunkKey];
  if (!newChunkRecord || newChunkRecord.gameCount === 0) {
      return currentBest; // If new is invalid, keep current
  }
  // If no current best exists yet, the new one is automatically the best
  if (!currentBest) return newRunStats;

  const currentChunkRecord = currentBest[chunkKey]; // currentBest is guaranteed valid here

  // Compare wins, then losses
  if (newChunkRecord.wins > currentChunkRecord.wins) return newRunStats;
  if (newChunkRecord.wins === currentChunkRecord.wins) {
    if (newChunkRecord.losses < currentChunkRecord.losses) return newRunStats;
  }
  return currentBest; // Otherwise, current is still better or equal
};

/**
 * Compares two chunks to find the "worse" one (fewer wins, then more losses).
 */
const getWorstChunk = (
  currentWorst: RunChunkStats | null,
  newRunStats: RunChunkStats | null, // Receive processed stats
  chunkKey: 'beginning' | 'middle' | 'end'
): RunChunkStats | null => {
  // --- Safety Check: Ensure newRunStats and its specific chunk record exist and have games ---
   const newChunkRecord = newRunStats?.[chunkKey];
   if (!newChunkRecord || newChunkRecord.gameCount === 0) {
      return currentWorst; // If new is invalid, keep current
   }
  // If no current worst exists yet, the new one is automatically the worst
  if (!currentWorst) return newRunStats;

  const currentChunkRecord = currentWorst[chunkKey]; // currentWorst is guaranteed valid here

  // Compare wins, then losses
  if (newChunkRecord.wins < currentChunkRecord.wins) return newRunStats;
  if (newChunkRecord.wins === currentChunkRecord.wins) {
    if (newChunkRecord.losses > currentChunkRecord.losses) return newRunStats;
  }
  return currentWorst; // Otherwise, current is still worse or equal
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
  allRuns: WeeklyPerformance[] // Hook ensures this is an array
): AllTimeChunkStats => {
  // --- Safety Check: (Redundant if hook guarantees array, but safe) ---
  if (!Array.isArray(allRuns)) {
    console.error("calculateAllTimeChunkStats received non-array:", allRuns);
    return {
      bestBeginning: null, bestMiddle: null, bestEnd: null,
      worstBeginning: null, worstMiddle: null, worstEnd: null,
    };
  }

  // Process each run, filter out nulls if a run is invalid
  const allRunChunkStats = allRuns.map(processRunForChunks).filter(Boolean) as RunChunkStats[];

  // Initialize stats object
  const stats: AllTimeChunkStats = {
    bestBeginning: null, bestMiddle: null, bestEnd: null,
    worstBeginning: null, worstMiddle: null, worstEnd: null,
  };

  // Iterate through processed run stats to find best/worst
  for (const runStats of allRunChunkStats) {
    stats.bestBeginning = getBestChunk(stats.bestBeginning, runStats, 'beginning');
    stats.bestMiddle = getBestChunk(stats.bestMiddle, runStats, 'middle');
    stats.bestEnd = getBestChunk(stats.bestEnd, runStats, 'end');

    stats.worstBeginning = getWorstChunk(stats.worstBeginning, runStats, 'beginning');
    stats.worstMiddle = getWorstChunk(stats.worstMiddle, runStats, 'middle');
    stats.worstEnd = getWorstChunk(stats.worstEnd, runStats, 'end');
  }

  return stats;
};
