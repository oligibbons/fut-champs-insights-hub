import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Squad, PlayerCard, SquadPlayer, CardType } from '../types/squads';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { useGameVersion } from '@/contexts/GameVersionContext';

export const useSquadData = () => {
  const { user } = useAuth();
  const { gameVersion } = useGameVersion();
  const [squads, setSquads] = useState<Squad[]>([]);
  const [players, setPlayers] = useState<PlayerCard[]>([]);
  const [cardTypes, setCardTypes] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSquads = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Fetch all three necessary tables in parallel. This is more efficient.
      const [
        { data: playersData, error: playersError },
        { data: squadsData, error: squadsError },
        { data: squadPlayersData, error: squadPlayersError }
      ] = await Promise.all([
        supabase.from('players').select('*').eq('user_id', user.id).eq('game_version', gameVersion),
        supabase.from('squads').select('*').eq('user_id', user.id).eq('game_version', gameVersion),
        // We fetch all squad_players and filter locally, which is often more reliable with RLS.
        supabase.from('squad_players').select('*')
      ]);

      if (playersError || squadsError || squadPlayersError) {
        // Throw the first error that occurred.
        throw playersError || squadsError || squadPlayersError;
      }
      
      const playerMap = new Map(playersData.map(p => [p.id, p as PlayerCard]));
      
      // Set the standalone players state once.
      setPlayers(playersData || []);

      // 2. Stitch the data together into a final, complete structure BEFORE setting state.
      const finalSquads = (squadsData || []).map(squad => {
        const playersInSquad = (squadPlayersData || [])
          // Find all the player links for the current squad.
          .filter(sp => sp.squad_id === squad.id)
          .map(sp => {
            const playerCard = playerMap.get(sp.player_id);
            // Attach the nested player object from the map.
            return {
              ...sp,
              players: playerCard || null
            };
          })
          // CRITICAL: Filter out any links where the player might have been deleted or doesn't exist.
          .filter(sp => sp.players !== null);

        return {
          ...squad,
          squad_players: playersInSquad,
        } as Squad;
      });

      // 3. Set the final, fully stitched state once. This is atomic and prevents race conditions.
      setSquads(finalSquads);

    } catch (error: any) {
      toast.error('Failed to fetch squad data.');
      console.error('Error fetching squad data:', error.message);
    } finally {
      setLoading(false);
    }
  }, [user, gameVersion]);
  
  const fetchPlayers = useCallback(async () => {
    if (!user) return;
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
    }
  }, [user, gameVersion]);

  useEffect(() => {
    if (user) {
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
        .select().single();
      if (squadError) throw squadError;
      if (squad_players && squad_players.length > 0) {
        const playersToInsert = squad_players.map((p: any) => ({ squad_id: newSquad.id, player_id: p.player_id || p.players.id, position: p.position, slot_id: p.slot_id }));
        const { error: playersError } = await supabase.from('squad_players').insert(playersToInsert);
        if (playersError) throw playersError;
      }
      toast.success('Squad created successfully.');
      await fetchSquads();
      return newSquad;
    } catch (error: any) {
      toast.error(`Error creating squad: ${error.message}`);
    }
  };

  const updateSquad = async (squadId: string, updates: any) => {
    if (!user) return;
    const { squad_players, ...squadDetails } = updates;
    try {
        await supabase.from('squads').update(squadDetails).eq('id', squadId);
        await supabase.from('squad_players').delete().eq('squad_id', squadId);
        if (squad_players && squad_players.length > 0) {
            const playersToInsert = squad_players.map((p: any) => ({ squad_id: squadId, player_id: p.player_id || p.players.id, position: p.position, slot_id: p.slot_id }));
            await supabase.from('squad_players').insert(playersToInsert);
        }
        toast.success('Squad updated successfully.');
        await fetchSquads();
    } catch (error: any) {
        toast.error(`Error updating squad: ${error.message}`);
    }
  };

  const duplicateSquad = async (squadId: string) => {
    const originalSquad = squads.find(s => s.id === squadId);
    if (!originalSquad) {
      toast.error("Original squad not found.");
      return;
    }
    const { id, created_at, updated_at, is_default, ...restOfSquad } = originalSquad;
    const newSquadData = { ...restOfSquad, name: `${originalSquad.name} (Copy)`, is_default: false, games_played: 0, wins: 0, losses: 0 };
    await createSquad(newSquadData);
  };
  
  const deleteSquad = async (squadId: string) => {
    try {
      await supabase.from('squads').delete().eq('id', squadId);
      setSquads(prev => prev.filter(s => s.id !== squadId));
      toast.success('Squad deleted successfully.');
    } catch (error: any) {
      toast.error('Failed to delete squad.');
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
          return null;
      }
  };
  
  const addPlayerToSquad = async (squadId: string, playerId: string, position: string) => {
    try {
        const { data, error } = await supabase.from('squad_players').insert([{ squad_id: squadId, player_id: playerId, position }]).select('*, players(*)').single();
        if (error) throw error;
        const newSquadPlayer = data as SquadPlayer;
        setSquads(prevSquads => prevSquads.map(squad => squad.id === squadId ? { ...squad, squad_players: [...(squad.squad_players || []), newSquadPlayer] } : squad));
        toast.success("Player added to squad.");
        return newSquadPlayer;
    } catch (error: any) {
        toast.error("Failed to add player to squad.");
        return null;
    }
  };

  const removePlayerFromSquad = async (squadId: string, squadPlayerId: string) => {
    try {
        await supabase.from('squad_players').delete().eq('id', squadPlayerId);
        toast.success('Player removed from squad.');
        await fetchSquads(); 
    } catch (error: any) {
        toast.error('Failed to remove player from squad.');
    }
  };

  return { squads, players, cardTypes, loading, fetchSquads, createSquad, updateSquad, duplicateSquad, deleteSquad, getPlayerSuggestions, savePlayer, addPlayerToSquad, removePlayerFromSquad };
};
