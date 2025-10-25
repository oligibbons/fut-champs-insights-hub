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
export const calculateChunkRecord = (games: Game[], start: number, end: number): ChunkRecord => {
  const chunkGames = (games || []).filter(
    (g) => g.game_number >= start && g.game_number <= end
  );

  return chunkGames.reduce(
    (acc, game) => {
      const isWin = game.result === 'win';
      return {
        wins: acc.wins + (isWin ? 1 : 0),
        losses: acc.losses + (!isWin ? 1 : 0),
        goalsFor: acc.goalsFor + (game.user_goals ?? 0),
        goalsAgainst: acc.goalsAgainst + (game.opponent_goals ?? 0),
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
  const games = run.games || [];
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
): RunChunkStats => {
  if (!newRun.runData.games || newRun[chunkKey].gameCount === 0) return currentBest;
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
): RunChunkStats => {
  // Only count runs where at least one game was played in that chunk
  if (!newRun.runData.games || newRun[chunkKey].gameCount === 0) return currentWorst;
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
  allRuns: WeeklyPerformance[]
): AllTimeChunkStats => {
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
    stats.bestBeginning = getBestChunk(stats.bestBeginning, runStats, 'beginning');
    stats.bestMiddle = getBestChunk(stats.bestMiddle, runStats, 'middle');
    stats.bestEnd = getBestChunk(stats.bestEnd, runStats, 'end');

    stats.worstBeginning = getWorstChunk(stats.worstBeginning, runStats, 'beginning');
    stats.worstMiddle = getWorstChunk(stats.worstMiddle, runStats, 'middle');
    stats.worstEnd = getWorstChunk(stats.worstEnd, runStats, 'end');
  }

  return stats;
};
