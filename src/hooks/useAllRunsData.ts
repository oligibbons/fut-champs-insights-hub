// src/hooks/useAllRunsData.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useGameVersion } from '@/contexts/GameVersionContext';
// --- Make sure Game type is imported ---
import { WeeklyPerformance, Game } from '@/types/futChampions'; 
import { toast } from '@/components/ui/use-toast';

// Define a type that ensures games are included
export type WeeklyPerformanceWithGames = WeeklyPerformance & {
  // --- Ensure games is explicitly typed ---
  games: Game[]; 
};

export const useAllRunsData = () => {
  const { user } = useAuth();
  const { gameVersion } = useGameVersion();
  // --- FIX: Initialize state with [] ---
  const [runs, setRuns] = useState<WeeklyPerformanceWithGames[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setRuns([]); // Ensure runs is empty if no user
      return;
    }

    const fetchAllRuns = async () => {
      setLoading(true);
      setError(null);
      try {
        // --- Use corrected table names from previous fix ---
        const { data, error: fetchError } = await supabase
          .from('weekly_performances') 
          .select('*, games:game_results(*)') // Only fetch games here, other relations might be too much
          .eq('user_id', user.id)
          .eq('game_version', gameVersion)
          .order('week_number', { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        // Ensure data matches the expected type, filtering out any with null/undefined games
        // Add sorting within the games array here if needed
        const validData = data
          .map(run => {
              // Sort games within each run
              if (Array.isArray(run.games)) {
                  run.games.sort((a, b) => a.game_number - b.game_number);
              }
              return run;
          })
          .filter(
            (run): run is WeeklyPerformanceWithGames => Array.isArray(run.games)
          );
        
        setRuns(validData);

      } catch (err: any) {
        console.error('Error fetching all runs:', err);
        setError(err);
        setRuns([]); // Reset runs on error
        toast({
          title: 'Error loading run history',
          description: err.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAllRuns();
  }, [user, gameVersion]); // Removed toast from dependencies

  return { runs, loading, error };
};
