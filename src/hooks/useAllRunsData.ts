// src/hooks/useAllRunsData.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useGameVersion } from '@/contexts/GameVersionContext';
import { WeeklyPerformance, Game } from '@/types/futChampions'; // Ensure Game is imported

// Swapped from shadcn toast to sonner to match the rest of the app
import { toast } from 'sonner';

// Define a type that ensures games are included and is an array
export type WeeklyPerformanceWithGames = WeeklyPerformance & {
  games: Game[]; // Explicitly an array
};

export const useAllRunsData = () => {
  const { user } = useAuth();
  const { gameVersion } = useGameVersion();
  // Initialize state with [] - CRITICAL
  const [runs, setRuns] = useState<WeeklyPerformanceWithGames[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // If no user, ensure state is clean and stop
    if (!user) {
      setLoading(false);
      setRuns([]); // Ensure runs is empty if no user
      setError(null);
      return;
    }

    let isMounted = true; // Flag to prevent state updates on unmounted component

    const fetchAllRuns = async () => {
      setLoading(true);
      setError(null);
      setRuns([]); // Reset runs before fetching

      try {
        // --- THIS IS THE FIX ---
        // The query must also fetch the relations inside game_results
        // that useDashboardStats.ts depends on.
        const { data, error: fetchError } = await supabase
          .from('weekly_performances')
          .select(`
            *,
            games:game_results (
              *,
              playerStats:player_performances(*),
              teamStats:team_statistics(*)
            )
          `)
          .eq('user_id', user.id)
          .eq('game_version', gameVersion)
          .order('week_number', { ascending: false });
        // --- END OF FIX ---

        if (fetchError) {
          throw fetchError;
        }

        // Process data ONLY if component is still mounted
        if (isMounted) {
          const processedData = (data || []) // Ensure data is an array
            .map(run => {
                // Ensure games is an array, default to [] if null/undefined or not array
                const gamesArray = Array.isArray(run.games) ? run.games : [];
                // Sort games within each run safely
                gamesArray.sort((a, b) => (a?.game_number ?? 0) - (b?.game_number ?? 0));
                return { ...run, games: gamesArray };
            })
            // Final filter for type safety
            .filter((run): run is WeeklyPerformanceWithGames => Array.isArray(run.games));

          setRuns(processedData);
        }

      } catch (err: any) {
         if (isMounted) {
            console.error('Error fetching all runs:', err);
            setError(err);
            setRuns([]); // Ensure runs is empty on error
            // Using the correct (sonner) toast function
            toast.error('Error loading run history', {
              description: err.message,
            });
         }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAllRuns();

    // Cleanup function to set isMounted to false when component unmounts
    return () => {
      isMounted = false;
    };
  }, [user, gameVersion]); // Removed toast from dependencies

  return { runs, loading, error };
};