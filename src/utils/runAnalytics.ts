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
    // --- Safety Check: Ensure game_number exists and is a number ---
    (g) => typeof g?.game_number === 'number' && g.game_number >= start && g.game_number <= end
  );

  return chunkGames.reduce(
    (acc, game) => {
      // --- Safety Check: Ensure game and result exist ---
      const isWin = game?.result === 'win';
      // --- Safety Check: Ensure goals are numbers, default to 0 ---
      const userGoals = typeof game?.user_goals === 'number' ? game.user_goals : 0;
      const opponentGoals = typeof game?.opponent_goals === 'number' ? game.opponent_goals : 0;
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
 * Processes a single run into its three chunks. Returns null if run is invalid.
 */
export const processRunForChunks = (run: WeeklyPerformance | null | undefined): RunChunkStats | null => {
   // --- Safety Check: Ensure run exists ---
   if (!run) return null;
  // --- Safety Check: Ensure run.games is an array ---
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
  chunkKey: 'beginning' | 'middle' | 'end' // <-- FIX: Added missing quote
): RunChunkStats | null => {
  // --- Safety Check: Ensure newRunStats and its chunk exist and have games ---
  if (!newRunStats || !newRunStats[chunkKey] || newRunStats[chunkKey].gameCount === 0) {
      return currentBest;
  }
  if (!currentBest) return newRunStats; // If no current best, the new one is best

  const currentChunkRecord = currentBest[chunkKey];
  const newChunkRecord = newRunStats[chunkKey];

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
  // --- Safety Check: Ensure newRunStats and its chunk exist and have games ---
   if (!newRunStats || !newRunStats[chunkKey] || newRunStats[chunkKey].gameCount === 0) {
      return currentWorst;
  }
  if (!currentWorst) return newRunStats; // If no current worst, the new one is worst

  const currentChunkRecord = currentWorst[chunkKey];
  const newChunkRecord = newRunStats[chunkKey];

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
  allRuns: WeeklyPerformance[] // Expecting an array, even if empty
): AllTimeChunkStats => {
  // --- Safety Check: Ensure allRuns is an array ---
  if (!Array.isArray(allRuns)) {
    console.error("calculateAllTimeChunkStats received non-array:", allRuns);
    return { // Return empty stats
      bestBeginning: null, bestMiddle: null, bestEnd: null,
      worstBeginning: null, worstMiddle: null, worstEnd: null,
    };
  }

  // Process each valid run, filter out nulls if processRunForChunks fails
  const allRunChunkStats = allRuns.map(processRunForChunks).filter(Boolean) as RunChunkStats[];

  const stats: AllTimeChunkStats = {
    bestBeginning: null,
    bestMiddle: null,
    bestEnd: null,
    worstBeginning: null,
    worstMiddle: null,
    worstEnd: null,
  };

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
