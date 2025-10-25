// src/hooks/useAllRunsData.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useGameVersion } from '@/contexts/GameVersionContext';
import { WeeklyPerformance, Game } from '@/types/futChampions'; // Ensure Game is imported
import { toast } from '@/components/ui/use-toast';

// Define a type that ensures games are included and is an array
export type WeeklyPerformanceWithGames = WeeklyPerformance & {
  games: Game[]; // Explicitly an array
};

export const useAllRunsData = () => {
  const { user } = useAuth();
  const { gameVersion } = useGameVersion();
  // Initialize state with []
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
      setRuns([]); // Reset runs before fetching
      try {
        const { data, error: fetchError } = await supabase
          .from('weekly_performances')
          // Fetch games relation, aliased correctly
          .select('*, games:game_results(*)') 
          .eq('user_id', user.id)
          .eq('game_version', gameVersion)
          .order('week_number', { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        // Process data: ensure 'games' is always an array and sort them
        const processedData = (data || [])
          .map(run => {
              // Ensure games is an array, default to [] if null/undefined
              const gamesArray = Array.isArray(run.games) ? run.games : [];
              // Sort games within each run
              gamesArray.sort((a, b) => a.game_number - b.game_number);
              // Return run with guaranteed games array
              return { ...run, games: gamesArray };
          })
          // Filter out any runs where something went wrong (though map should handle it)
          .filter((run): run is WeeklyPerformanceWithGames => Array.isArray(run.games));

        setRuns(processedData);

      } catch (err: any) {
        console.error('Error fetching all runs:', err);
        setError(err);
        setRuns([]); // Ensure runs is empty on error
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
  // Removed toast from dependencies as it can cause re-renders
  }, [user, gameVersion]); 

  return { runs, loading, error };
};
