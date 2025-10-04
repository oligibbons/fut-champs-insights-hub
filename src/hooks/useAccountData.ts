import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { WeeklyPerformance } from '@/types/futChampions';
import { useGameVersion } from '@/contexts/GameVersionContext'; // Import the context hook

export const useAccountData = () => {
  const { user } = useAuth();
  const { gameVersion } = useGameVersion(); // Get the current game version
  const [weeks, setWeeks] = useState<WeeklyPerformance[]>([]);
  const [activeAccount, setActiveAccount] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setLoading(true);
        // FIX: Added .eq('game_version', gameVersion) to filter the data correctly
        const { data, error } = await supabase
          .from('weekly_performances')
          .select('*, games:game_results(*, player_performances(*))')
          .eq('user_id', user.id)
          .eq('game_version', gameVersion)
          .order('week_number', { ascending: false });

        if (error) {
          console.error('Error fetching weekly data:', error);
        } else {
          // Add a gamesPlayed property to each week for easier calculations
          const weeksWithGamesPlayed = data.map(week => ({
            ...week,
            gamesPlayed: week.games?.length || 0,
          }));
          setWeeks(weeksWithGamesPlayed);
        }
        
        // Assuming active account logic remains the same
        const storedAccount = localStorage.getItem('activeAccount');
        setActiveAccount(storedAccount);
        setLoading(false);
      }
    };

    fetchData();
  }, [user, gameVersion]); // Add gameVersion as a dependency

  return { weeks, activeAccount, loading };
};
