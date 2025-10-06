import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Squad, PlayerCard, SquadPlayer, CardType } from '../types/squads';
import { useAuth } from '../contexts/Auth/AuthContext';
import { toast } from 'sonner';
import { useGameVersion } from '@/contexts/GameVersionContext';

export const useSquadData = () => {
  const { user } = useAuth();
  const { gameVersion } = useGameVersion();
  const [squads, setSquads] = useState<Squad[]>([]);
  const [players, setPlayers] = useState<PlayerCard[]>([]);
  const [cardTypes, setCardTypes] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);

  // MODIFIED: Consolidated fetch logic using stitching to bypass deep-join RLS issues
  const fetchSquads = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);

      // 1. Fetch all accessible Player Cards (must succeed first to stitch data)
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('*')
        .eq('user_id', user.id)
        .eq('game_version', gameVersion);
      
      if (playersError) throw playersError;
      const playerMap = new Map(playersData.map(p => [p.id, p as PlayerCard]));
      setPlayers(playersData || []);

      // 2. Fetch Squads and the raw squad_players join (NO deep join on 'players')
      const { data: squadsData, error: squadsError } = await supabase
        .from('squads')
        // Simplified select to 'squad_players(*)' to avoid RLS issue on nested 'players(*)'
        .select('*, squad_players(*)') 
        .eq('user_id', user.id)
        .eq('game_version', gameVersion);

      if (squadsError) throw squadsError;

      // 3. Manual Stitching: Recreate the expected deep-joined structure
      const finalSquads = (squadsData || []).map(squad => {
          // Recreate the array of squad players with the nested 'players' object attached
          const stitchedPlayers = squad.squad_players ? squad.squad_players.map((sp: any) => {
              const playerCard = playerMap.get(sp.player_id);
              
              // Attach the fully accessible PlayerCard object (or null if RLS hid it in the initial fetch)
              return {
                  ...sp,
                  players: playerCard || null, 
              };
          }) : [];

          return {
              ...squad,
              squad_players: stitchedPlayers,
          } as Squad;
      });
      
      setSquads(finalSquads);

    } catch (error: any) {
      toast.error('Failed to fetch squads.');
      console.error('Error fetching squads:', error.message);
    } finally {
      setLoading(false);
    }
  }, [user, gameVersion]);

  // Kept separate for external use, though primary player data load is now in fetchSquads for stitching
  const fetchPlayers = useCallback(async () => {
    if (!user) return;
    // NOTE: This now uses the data from the new fetchSquads for consistency, but if called externally, 
    // it will re-fetch all players, which is harmless.
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('user_id', user.id)
        .eq('game_version', gameVersion);
      if (error) throw error;
      setPlayers(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch players.');
      console.error('Error fetching players:', error.message);
    }
  }, [user, gameVersion]);

  const fetchCardTypes = useCallback(async () => {
    if (!user) return;
    try {
        const { data, error } = await supabase
            .from('card_types')
            .select('*')
            .eq('user_id', user.id)
            .eq('game_version', gameVersion);
        if (error) throw error;
        setCardTypes(data || []);
    } catch (error: any) {
        toast.error('Failed to fetch card types.');
        console.error('Error fetching card types:', error.message);
    }
  }, [user, gameVersion]);


  useEffect(() => {
    if (user) {
        // Only fetch squads and card types, as player data is now included in fetchSquads
        fetchSquads(); 
        fetchCardTypes();
    }
  }, [user, gameVersion, fetchSquads, fetchCardTypes]);

  const createSquad = async (squadData: any) => {
    if (!user) return;

    const { squad_players, ...squadDetails } = squadData;

    try {
      const { data: newSquad, error: squadError } = await supabase
        .from('squads')
        .insert([{ ...squadDetails, user_id: user.id, game_version: gameVersion }])
        .select()
        .single();
      
      if (squadError) throw squadError;

      if (squad_players && squad_players.length > 0) {
        const playersToInsert = squad_players.map((p: any) => ({
          squad_id: newSquad.id,
          player_id: p.player_id || p.players.id,
          position: p.position,
          slot_id: p.slot_id,
        }));
        
        const { error: playersError } = await supabase.from('squad_players').insert(playersToInsert);
        if (playersError) throw playersError;
      }
      
      toast.success('Squad created successfully.');
      await fetchSquads();
      return newSquad;
    } catch (error: any) {
      toast.error(`Error creating squad: ${error.message}`);
      console.error('Error creating squad:', error);
    }
  };

  const updateSquad = async (squadId: string, updates: any) => {
    if (!user) return;

    const { squad_players, ...squadDetails } = updates;

    try {
        const { error: squadError } = await supabase
            .from('squads')
            .update(squadDetails)
            .eq('id', squadId);
        
        if (squadError) throw squadError;

        const { error: deleteError } = await supabase.from('squad_players').delete().eq('squad_id', squadId);
        if (deleteError) throw deleteError;

        if (squad_players && squad_players.length > 0) {
            const playersToInsert = squad_players.map((p: any) => ({
                squad_id: squadId,
                player_id: p.player_id || p.players.id,
                position: p.position,
                slot_id: p.slot_id,
            }));

            const { error: playersError } = await supabase.from('squad_players').insert(playersToInsert);
            if (playersError) throw playersError;
        }

        toast.success('Squad updated successfully.');
        await fetchSquads();
    } catch (error: any) {
        toast.error(`Error updating squad: ${error.message}`);
        console.error('Error updating squad:', error);
    }
  };

  const duplicateSquad = async (squadId: string) => {
    const originalSquad = squads.find(s => s.id === squadId);
    if (!originalSquad) {
      toast.error("Original squad not found.");
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, created_at, updated_at, is_default, ...restOfSquad } = originalSquad;

    const newSquadData = {
      ...restOfSquad,
      name: `${originalSquad.name} (Copy)`,
      is_default: false, // Duplicates are never the default
      games_played: 0,
      wins: 0,
      losses: 0,
    };
    
    await createSquad(newSquadData);
  };
  
  const deleteSquad = async (squadId: string) => {
    try {
      const { error } = await supabase.from('squads').delete().eq('id', squadId);
      if (error) throw error;
      
      setSquads(prev => prev.filter(s => s.id !== squadId));
      toast.success('Squad deleted successfully.');
    } catch (error: any) {
      toast.error('Failed to delete squad.');
      console.error('Error deleting squad:', error);
    }
  };

  const getPlayerSuggestions = (searchTerm: string) => {
    if (!searchTerm) return [];
    return players.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  };

  const savePlayer = async (player: Partial<PlayerCard>): Promise<PlayerCard | null> => {
      if (!user) return null;
      
      const playerToSave = { ...player, user_id: user.id, game_version: gameVersion };

      try {
          const { data, error } = await supabase.from('players').upsert(playerToSave).select().single();
          if (error) throw error;
          await fetchPlayers();
          return data as PlayerCard;
      } catch (error: any) {
          toast.error(`Failed to save player: ${error.message}`);
          console.error('Error saving player:', error);
          return null;
      }
  };
  
    const addPlayerToSquad = async (squadId: string, playerId: string, position: string) => {
    try {
        const { data, error } = await supabase
            .from('squad_players')
            .insert([{ squad_id: squadId, player_id: playerId, position }])
            .select('*, players(*)')
            .single();

        if (error) throw error;

        const newSquadPlayer = data as SquadPlayer;

        setSquads(prevSquads =>
            prevSquads.map(squad => {
                if (squad.id === squadId) {
                    const updatedPlayers = [...(squad.squad_players || []), newSquadPlayer];
                    return { ...squad, squad_players: updatedPlayers };
                }
                return squad;
            })
        );

        toast.success("Player added to squad.");
        return newSquadPlayer;

    } catch (error: any) {
        toast.error("Failed to add player to squad.");
        console.error('Error adding player to squad:', error);
        return null;
    }
  };

  const removePlayerFromSquad = async (squadId: string, squadPlayerId: string) => {
    try {
        const { error } = await supabase
            .from('squad_players')
            .delete()
            .eq('id', squadPlayerId);

        if (error) throw error;

        setSquads(prev =>
            prev.map(s => {
                if (s.id === squadId) {
                    // Filter out the removed player. Note: the types in Squad need update
                    // to reflect the joined data structure if this component relies on it.
                    // Assuming the component can handle the updated state after fetchSquads runs.
                    return { ...s, squad_players: s.squad_players.filter((p: any) => p.id !== squadPlayerId) };
                }
                return s;
            })
        );
        toast.success('Player removed from squad.');
        // Re-fetch everything to ensure state is clean and joined data is correct
        await fetchSquads(); 
    } catch (error: any) {
        toast.error('Failed to remove player from squad.');
        console.error('Error removing player from squad:', error);
    }
  };

  return {
    squads,
    players,
    cardTypes,
    loading,
    fetchSquads,
    createSquad,
    updateSquad,
    duplicateSquad,
    deleteSquad,
    getPlayerSuggestions,
    savePlayer,
    addPlayerToSquad,
    removePlayerFromSquad,
  };
};
