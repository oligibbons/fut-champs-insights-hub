// src/hooks/useAllSquadsData.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useGameVersion } from '@/contexts/GameVersionContext';
import { Squad, PlayerCard, SquadPlayer } from '@/types/squads'; // Make sure these types are correctly defined

// Define a type for Squad with players included
// Ensure this matches the actual structure returned by Supabase, especially the 'players' relation
export interface SquadWithPlayers extends Squad {
  squad_players: {
    player_id: string;
    slot_id: string | null; // slot_id can be null
    players: { // Assuming 'players' relation exists and has these fields
      id: string;
      name: string;
      position: string;
    } | null; // Player might not exist or relation fails
  }[];
}


export const useAllSquadsData = () => {
  const { user } = useAuth();
  const { gameVersion } = useGameVersion();
  const [squads, setSquads] = useState<SquadWithPlayers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSquads = async () => {
      // Ensure user and gameVersion are loaded
      if (!user?.id || !gameVersion) {
         setLoading(false); // Not loading if no user/version
         setSquads([]); // Clear squads if user/version changes
         return;
      }
      setLoading(true);
      setError(null);

      try {
        // Fetch all squads for the user and game version, including players
        const { data, error: fetchError } = await supabase
          .from('squads')
          .select(`
            *,
            squad_players (
              player_id,
              slot_id,
              players ( id, name, position )
            )
          `)
          .eq('user_id', user.id)
          .eq('game_version', gameVersion)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        // Filter out squads where squad_players might be null
        // And ensure players relation loaded correctly
        const validSquads = (data || []).map(squad => ({
          ...squad,
          // Ensure squad_players is an array and filter out entries where players relation failed
          squad_players: (squad.squad_players || []).filter(sp => sp.players && sp.players.id && sp.players.name && sp.players.position)
        })) as SquadWithPlayers[];

        setSquads(validSquads);

      } catch (err: any) {
        console.error('Error fetching all squads:', err);
        setError(`Failed to fetch squads: ${err.message}`);
        setSquads([]); // Clear squads on error
      } finally {
        setLoading(false);
      }
    };

    fetchSquads();
  }, [user, gameVersion]); // Re-fetch if user or gameVersion changes

  return { squads, loading, error };
};
