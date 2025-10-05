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
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('squads')
        .select('*, squad_players(*, players(*))')
        .eq('user_id', user.id)
        .eq('game_version', gameVersion);

      if (error) throw error;
      setSquads(data || []);
    } catch (error) {
      toast.error('Failed to fetch squads.');
      console.error('Error fetching squads:', error);
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
    } catch (error) {
      toast.error('Failed to fetch players.');
      console.error('Error fetching players:', error);
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
    } catch (error) {
        toast.error('Failed to fetch card types.');
        console.error('Error fetching card types:', error);
    }
  }, [user, gameVersion]);


  useEffect(() => {
    if (user) {
        fetchSquads();
        fetchPlayers();
        fetchCardTypes();
    }
  }, [user, gameVersion, fetchSquads, fetchPlayers, fetchCardTypes]);

  const createSquad = async (squadData: Omit<Squad, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'squad_players'>) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('squads')
        .insert([{ ...squadData, user_id: user.id, game_version: gameVersion }])
        .select()
        .single();
      if (error) throw error;
      setSquads(prev => [...prev, data as Squad]);
      toast.success('Squad created successfully.');
      return data;
    } catch (error) {
      toast.error('Failed to create squad.');
      console.error('Error creating squad:', error);
    }
  };

  const updateSquad = async (squadId: string, updates: Partial<Squad>) => {
    try {
      const { data, error } = await supabase
        .from('squads')
        .update(updates)
        .eq('id', squadId)
        .select('*, squad_players(*, players(*))')
        .single();
      if (error) throw error;
      setSquads(prev => prev.map(s => (s.id === squadId ? data as Squad : s)));
      toast.success('Squad updated successfully.');
    } catch (error) {
      toast.error('Failed to update squad.');
      console.error('Error updating squad:', error);
    }
  };

  const deleteSquad = async (squadId: string) => {
    try {
      await supabase.from('squad_players').delete().eq('squad_id', squadId);
      const { error } = await supabase.from('squads').delete().eq('id', squadId);
      if (error) throw error;
      setSquads(prev => prev.filter(s => s.id !== squadId));
      toast.success('Squad deleted successfully.');
    } catch (error) {
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
      
      const playerToSave = {
          ...player,
          user_id: user.id,
          game_version: gameVersion,
      };

      try {
          const { data, error } = await supabase
              .from('players')
              .upsert(playerToSave)
              .select()
              .single();

          if (error) throw error;

          await fetchPlayers();
          
          return data as PlayerCard;
      } catch (error) {
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

    } catch (error) {
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
                    return { ...s, squad_players: s.squad_players.filter(p => p.id !== squadPlayerId) };
                }
                return s;
            })
        );
        toast.success('Player removed from squad.');
    } catch (error) {
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
    deleteSquad,
    getPlayerSuggestions,
    savePlayer,
    addPlayerToSquad,
    removePlayerFromSquad,
  };
};
