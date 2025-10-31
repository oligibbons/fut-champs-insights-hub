// src/hooks/useAllRunsData.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useGameVersion } from '@/contexts/GameVersionContext';
import { WeeklyPerformance, Game } from '@/types/futChampions';
import { toast } from '@/components/ui/use-toast';

// Simple interface for this hook's processed data
export interface Run extends WeeklyPerformance {
  games: Game[]; // Include the games array
  gameCount: number;
}

export const useAllRunsData = () => {
  // --- THIS IS THE FIX (Part 1) ---
  const { user, loading: authLoading } = useAuth();
  // --- END OF FIX ---
  
  const { gameVersion } = useGameVersion();
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllRuns = useCallback(async () => {
    // --- THIS IS THE FIX (Part 2) ---
    // Wait for auth to be ready
    if (!user || !gameVersion || authLoading) {
      setRuns([]);
      setLoading(false);
      return;
    }
    // --- END OF FIX ---

    setLoading(true);
    setError(null);

    try {
      // Fetch all weekly performances and all games in parallel
      const [weeksRes, gamesRes] = await Promise.all([
        supabase
          .from('weekly_performances')
          .select('*')
          .eq('user_id', user.id)
          .eq('game_version', gameVersion)
          .order('week_number', { ascending: false }),
        supabase
          .from('game_results')
          .select('*')
          .eq('user_id', user.id)
          .eq('game_version', gameVersion)
          .order('game_number', { ascending: true }),
      ]);

      if (weeksRes.error) throw new Error(`Weekly Runs Error: ${weeksRes.error.message}`);
      if (gamesRes.error) throw new Error(`Games Error: ${gamesRes.error.message}`);

      const weeks: WeeklyPerformance[] = weeksRes.data || [];
      const games: Game[] = gamesRes.data || [];

      // Create a map of games by week_id
      const gamesMap = new Map<string, Game[]>();
      games.forEach(game => {
        if (!gamesMap.has(game.week_id)) {
          gamesMap.set(game.week_id, []);
        }
        gamesMap.get(game.week_id)!.push(game);
      });

      // Combine weeks with their games
      const processedRuns: Run[] = weeks.map(week => {
        const weekGames = gamesMap.get(week.id) || [];
        return {
          ...week,
          games: weekGames,
          gameCount: weekGames.length,
        };
      });

      setRuns(processedRuns);
    } catch (err: any) {
      console.error('Error fetching all runs data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  // --- THIS IS THE FIX (Part 3) ---
  }, [user, gameVersion, authLoading]);
  // --- END OF FIX ---

  useEffect(() => {
    fetchAllRuns();
  }, [fetchAllRuns]);
  
  // Function to delete a run (and all its associated data)
  const deleteRun = async (weekId: string) => {
    if (!user) {
        toast({ title: "Error", description: "Not authenticated.", variant: "destructive" });
        return;
    }
    
    // Check if the run is linked to a league participant
    try {
       const { data: participantData, error: participantError } = await supabase
        .from('champs_league_participants')
        .select('id')
        .eq('weekly_performance_id', weekId)
        .limit(1);

      if (participantError) throw new Error(`League Check Error: ${participantError.message}`);

      if (participantData && participantData.length > 0) {
        toast({
          title: "Cannot Delete Run",
          description: "This run is linked to a Champs League. Please remove it from the league before deleting.",
          variant: "destructive",
        });
        return;
      }

    } catch (err: any) {
       console.error("Error checking league link:", err);
       toast({ title: "Error", description: err.message, variant: "destructive" });
       return;
    }

    // If not linked, proceed with deletion
    try {
        setLoading(true);
        // We need to delete associated data in order due to foreign keys
        // 1. player_performances (references game_results)
        // 2. team_statistics (references game_results)
        // 3. game_results (references weekly_performances)
        // 4. weekly_performances
        
        // This is tricky. We need the game_ids first.
        const { data: gameIds, error: gameIdsError } = await supabase
            .from('game_results')
            .select('id')
            .eq('week_id', weekId)
            .eq('user_id', user.id); // Extra check
            
        if (gameIdsError) throw new Error(`Game ID Fetch Error: ${gameIdsError.message}`);

        const ids = gameIds.map(g => g.id);

        if (ids.length > 0) {
            // 1. Delete player_performances
            const { error: perfError } = await supabase
                .from('player_performances')
                .delete()
                .in('game_id', ids);
            if (perfError) throw new Error(`Player Perf Delete Error: ${perfError.message}`);

            // 2. Delete team_statistics
            const { error: statsError } = await supabase
                .from('team_statistics')
                .delete()
                .in('game_id', ids);
             if (statsError) throw new Error(`Team Stats Delete Error: ${statsError.message}`);
        }
        
        // 3. Delete game_results
        const { error: gameError } = await supabase
            .from('game_results')
            .delete()
            .eq('week_id', weekId);
        if (gameError) throw new Error(`Game Results Delete Error: ${gameError.message}`);
            
        // 4. Delete weekly_performance
        const { error: weekError } = await supabase
            .from('weekly_performances')
            .delete()
            .eq('id', weekId)
            .eq('user_id', user.id);
        if (weekError) throw new Error(`Weekly Perf Delete Error: ${weekError.message}`);

        toast({ title: "Success", description: "Run and all associated games have been deleted." });
        fetchAllRuns(); // Refresh data

    } catch (err: any)
    {
        console.error("Error deleting run:", err);
        toast({ title: "Error deleting run", description: err.message, variant: "destructive" });
    } finally {
        setLoading(false);
    }
  };

  return { runs, loading, error, refetchRuns: fetchAllRuns, deleteRun };
};
