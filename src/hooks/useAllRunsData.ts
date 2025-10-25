// src/hooks/useAllRunsData.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useGameVersion } from '@/contexts/GameVersionContext';
import { WeeklyPerformance } from '@/types/futChampions';
import { toast } from '@/components/ui/use-toast';

// Define a type that ensures games are included
export type WeeklyPerformanceWithGames = WeeklyPerformance & {
  games: Game[];
};

export const useAllRunsData = () => {
  const { user } = useAuth();
  const { gameVersion } = useGameVersion();
  const [runs, setRuns] = useState<WeeklyPerformanceWithGames[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchAllRuns = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all runs for the user and game version,
        // and fetch all associated games
        const { data, error: fetchError } = await supabase
          .from('weekly_performance')
          .select('*, games(*)')
          .eq('user_id', user.id)
          .eq('game_version', gameVersion)
          .order('week_number', { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        // Ensure data matches the expected type, filtering out any with null games
        const validData = data.filter(
          (run): run is WeeklyPerformanceWithGames => Array.isArray(run.games)
        );
        
        setRuns(validData);

      } catch (err: any) {
        console.error('Error fetching all runs:', err);
        setError(err);
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
  }, [user, gameVersion]);

  return { runs, loading, error };
};
