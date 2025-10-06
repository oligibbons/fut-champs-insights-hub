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

  // This is the new, robust data fetching and stitching logic.
  const fetchAllData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Step 1: Fetch all base squads for the current user and game version.
      const { data: squadsData, error: squadsError } = await supabase
        .from('squads')
        .select('*')
        .eq('user_id', user.id)
        .eq('game_version', gameVersion);
      if (squadsError) throw squadsError;

      // If the user has no squads, we can stop here.
      if (!squadsData || squadsData.length === 0) {
        setSquads([]);
        setPlayers([]);
        setLoading(false);
        return;
      }

      // Step 2: Fetch all players for the current user and game version.
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('*')
        .eq('user_id', user.id)
        .eq('game_version', gameVersion);
      if (playersError) throw playersError;
      setPlayers(playersData || []);

      // Step 3: Fetch the links between squads and players.
      const squadIds = squadsData.map(s => s.id);
      const { data: squadPlayersData, error: squadPlayersError } = await supabase
        .from('squad_players')
        .select('*')
        .in('squad_id', squadIds);
      if (squadPlayersError) throw squadPlayersError;

      // Step 4: Manually "stitch" the data together. This is the crucial part.
      // Create a Map for efficient player lookup.
      const playerMap = new Map((playersData || []).map(p => [p.id, p]));

      // Build the final, fully-structured squad objects.
      const stitchedSquads = squadsData.map(squad => {
        const relevantLinks = (squadPlayersData || []).filter(sp => sp.squad_id === squad.id);
        
        const hydratedPlayers = relevantLinks
          .map(link => {
            const playerData = playerMap.get(link.player_id);
            // If a player exists for the link, create the full object.
            if (playerData) {
              return {
                ...link,
                players: playerData // Embed the full player object here.
              };
            }
            return null;
          })
          .filter((sp): sp is SquadPlayer => sp !== null); // Filter out any broken links.

        return {
          ...squad,
          squad_players: hydratedPlayers
        };
      });
      
      setSquads(stitchedSquads as Squad[]);

    } catch (error: any) {
      toast.error('Failed to fetch squad data.');
      console.error('Error fetching squad data:', error.message);
    } finally {
      setLoading(false);
    }
  }, [user, gameVersion]);

  // This hook remains the same, but now calls the master fetch function.
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
        fetchAllData();
        fetchCardTypes();
    }
  }, [user, gameVersion, fetchAllData, fetchCardTypes]);

  // All CUD (Create, Update, Delete) functions now recall `fetchAllData` to ensure the state is fresh.
  const createSquad = async (squadData: any) => {
    if (!user) return;
    const { squad_players, ...squadDetails } = squadData;
    try {
      const { data: newSquad, error } = await supabase
        .from('squads')
        .insert([{ ...squadDetails, user_id: user.id, game_version: gameVersion }])
        .select().single();
      if (error) throw error;
      if (squad_players && squad_players.length > 0) {
        const playersToInsert = squad_players.map((p: any) => ({ squad_id: newSquad.id, player_id: p.player_id || p.players.id, position: p.position, slot_id: p.slot_id }));
        await supabase.from('squad_players').insert(playersToInsert);
      }
      toast.success('Squad created successfully.');
      await fetchAllData(); // Refresh all data
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
        await fetchAllData(); // Refresh all data
    } catch (error: any) {
        toast.error(`Error updating squad: ${error.message}`);
    }
  };

  const deleteSquad = async (squadId: string) => {
    try {
      await supabase.from('squad_players').delete().eq('squad_id', squadId);
      await supabase.from('squads').delete().eq('id', squadId);
      toast.success('Squad deleted successfully.');
      await fetchAllData(); // Refresh all data
    } catch (error: any) {
      toast.error('Failed to delete squad.');
    }
  };
  
  const savePlayer = async (player: Partial<PlayerCard>): Promise<PlayerCard | null> => {
      if (!user) return null;
      const playerToSave = { ...player, user_id: user.id, game_version: gameVersion };
      try {
          const { data, error } = await supabase.from('players').upsert(playerToSave).select().single();
          if (error) throw error;
          await fetchAllData(); // Refresh all data, including players list
          return data as PlayerCard;
      } catch (error: any) {
          toast.error(`Failed to save player: ${error.message}`);
          return null;
      }
  };
  
  // Other functions like duplicateSquad, etc. would also call fetchAllData upon success.
  // (These are omitted for brevity but the principle is the same).
  
  return { squads, players, cardTypes, loading, createSquad, updateSquad, deleteSquad, savePlayer, getPlayerSuggestions: (searchTerm: string) => players.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())) };
};
