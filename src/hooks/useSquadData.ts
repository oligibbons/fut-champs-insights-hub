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
      // DEFINITIVE FIX: This explicit query tells Supabase to fetch all squads,
      // and for each squad, to fetch all related `squad_players` records,
      // and for each of those, to fetch the full related `players` record.
      const { data: squadsData, error: squadsError } = await supabase
        .from('squads')
        .select(`
          *,
          squad_players (
            *,
            players (*)
          )
        `)
        .eq('user_id', user.id)
        .eq('game_version', gameVersion);

      if (squadsError) {
        throw squadsError;
      }

      // Directly set the correctly-structured data from Supabase.
      setSquads(squadsData || []);

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
        fetchSquads();
        fetchPlayers();
        fetchCardTypes();
    }
  }, [user, gameVersion, fetchSquads, fetchPlayers, fetchCardTypes]);

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
      console.error('Error creating squad:', error);
    }
  };

  const updateSquad = async (squadId: string, updates: any) => {
    if (!user) return;
    const { squad_players, ...squadDetails } = updates;
    try {
        const { error: squadError } = await supabase.from('squads').update(squadDetails).eq('id', squadId);
        if (squadError) throw squadError;
        const { error: deleteError } = await supabase.from('squad_players').delete().eq('squad_id', squadId);
        if (deleteError) throw deleteError;
        if (squad_players && squad_players.length > 0) {
            const playersToInsert = squad_players.map((p: any) => ({ squad_id: squadId, player_id: p.player_id || p.players.id, position: p.position, slot_id: p.slot_id }));
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
    const { id, created_at, updated_at, is_default, ...restOfSquad } = originalSquad;
    const newSquadData = { ...restOfSquad, name: `${originalSquad.name} (Copy)`, is_default: false, games_played: 0, wins: 0, losses: 0 };
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
