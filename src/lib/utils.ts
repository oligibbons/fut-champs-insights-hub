// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { useState, useEffect, useRef } from 'react';
// --- FIX: Added type imports needed for the new function ---
import { LeagueRun } from "@/integrations/supabase/types"; 

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const useLongPress = (callback = () => {}, ms = 1000) => {
  const [startLongPress, setStartLongPress] = useState(false);
  const timeoutIdRef = useRef<number | null>(null);

  useEffect(() => {
    let timeoutId: number | null = null;
    if (startLongPress) {
      timeoutId = window.setTimeout(() => {
        callback();
        setStartLongPress(false); 
      }, ms);
      timeoutIdRef.current = timeoutId;
    } else {
      if (timeoutIdRef.current) {
        window.clearTimeout(timeoutIdRef.current);
      }
    }

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [startLongPress, ms, callback]);

  return {
    onMouseDown: () => setStartLongPress(true),
    onMouseUp: () => setStartLongPress(false),
    onMouseLeave: () => setStartLongPress(false),
    onTouchStart: () => setStartLongPress(true),
    onTouchEnd: () => setStartLongPress(false),
  };
};

// --- FIX: Added the missing function required by useLeagueDetails ---
/**
 * Calculates aggregate stats from a list of league runs.
 */
export const calculateLeagueStats = (runs: LeagueRun[]) => {
  let totalWins = 0;
  let totalLosses = 0;
  let totalGames = 0;
  let totalGoals = 0;
  let totalConceded = 0;

  for (const run of runs) {
    totalWins += run.wins || 0;
    totalLosses += run.losses || 0;
    
    if (run.games) {
      for (const game of run.games) {
        totalGoals += game.user_score || 0;
        totalConceded += game.opp_score || 0;
      }
    }
  }
  
  totalGames = totalWins + totalLosses;
  const winRate = totalGames > 0 ? (totalWins / totalGames) * 100 : 0;
  const goalDifference = totalGoals - totalConceded;

  return {
    totalWins,
    totalLosses,
    totalGames,
    totalGoals,
    totalConceded,
    goalDifference,
    winRate,
  };
};