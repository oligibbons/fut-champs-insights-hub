// src/hooks/useSquadData.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Squad, PlayerCard, SquadPlayer, CardType } from '../types/squads'; // Make sure SquadPlayer includes the 'players' relation possibility
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner'; // Using sonner directly
import { useGameVersion } from '@/contexts/GameVersionContext';

// Extend SquadPlayer type locally if not already done in types/squads.ts
interface HydratedSquadPlayer extends SquadPlayer {
    players: PlayerCard; // Ensure this is part of the type for stitched data
}
interface HydratedSquad extends Squad {
    squad_players: HydratedSquadPlayer[];
}

export const useSquadData = () => {
  const { user } = useAuth();
  const { gameVersion } = useGameVersion();
  const [squads, setSquads] = useState<HydratedSquad[]>([]); // Use HydratedSquad type
  const [players, setPlayers] = useState<PlayerCard[]>([]);
  const [cardTypes, setCardTypes] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllData = useCallback(async () => {
    if (!user?.id || !gameVersion) {
        setLoading(false); // Ensure loading is set to false if no user/version
        setSquads([]);
        setPlayers([]);
        setCardTypes([]); // Also clear card types
        return;
    }
    setLoading(true);

    try {
      // Parallel fetching
      const [squadsRes, playersRes, squadPlayersRes, cardTypesRes] = await Promise.all([
        supabase.from('squads').select('*').eq('user_id', user.id).eq('game_version', gameVersion),
        supabase.from('players').select('*').eq('user_id', user.id).eq('game_version', gameVersion),
        supabase.from('squad_players').select('id, squad_id, player_id, position, slot_id').in('squad_id', 
            (await supabase.from('squads').select('id').eq('user_id', user.id).eq('game_version', gameVersion)).data?.map(s => s.id) || []
        ), // Fetch links matching user's squads
        supabase.from('card_types').select('*').eq('user_id', user.id).eq('game_version', gameVersion)
      ]);

      if (squadsRes.error) throw squadsRes.error;
      if (playersRes.error) throw playersRes.error;
      if (squadPlayersRes.error) throw squadPlayersRes.error;
      if (cardTypesRes.error) throw cardTypesRes.error;

      const squadsData = squadsRes.data || [];
      const playersData = playersRes.data || [];
      const squadPlayersData = squadPlayersRes.data || [];
      const cardTypesData = cardTypesRes.data || [];

      setPlayers(playersData);
      setCardTypes(cardTypesData);

      if (squadsData.length === 0) {
        setSquads([]);
        setLoading(false);
        return;
      }

      // Stitching logic
      const playerMap = new Map(playersData.map(p => [p.id, p]));
      const stitchedSquads = squadsData.map(squad => {
        const relevantLinks = squadPlayersData.filter(sp => sp.squad_id === squad.id);
        const hydratedPlayers = relevantLinks
          .map(link => {
            const playerData = playerMap.get(link.player_id);
            if (playerData) {
              // Construct the object matching HydratedSquadPlayer
              return {
                 id: link.id || `${link.squad_id}-${link.player_id}`, // Use link ID or generate one
                 squad_id: link.squad_id,
                 player_id: link.player_id,
                 position: link.position,
                 slot_id: link.slot_id,
                 players: playerData // Embed player data
               };
            }
            return null;
          })
          .filter((sp): sp is HydratedSquadPlayer => sp !== null); // Type guard

        return {
          ...squad,
          squad_players: hydratedPlayers
        };
      });

      setSquads(stitchedSquads);

    } catch (error: any) {
      toast.error('Failed to fetch squad data.', { description: error.message });
      console.error('Error fetching squad data:', error.message);
      // Reset state on error
      setSquads([]);
      setPlayers([]);
      setCardTypes([]);
    } finally {
      setLoading(false);
    }
  }, [user, gameVersion]);

  // Initial fetch and fetch on user/gameVersion change
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]); // fetchAllData includes user and gameVersion dependencies

  const createSquad = async (squadData: any): Promise<boolean> => {
    if (!user?.id) return false;
    const { squad_players, ...squadDetails } = squadData;
    try {
      const { data: newSquad, error } = await supabase
        .from('squads')
        .insert([{ ...squadDetails, user_id: user.id, game_version: gameVersion }])
        .select('id') // Select only ID
        .single();
      if (error || !newSquad?.id) throw error || new Error("Failed to get new squad ID");

      if (squad_players && squad_players.length > 0) {
        const playersToInsert = squad_players.map((p: any) => ({
             squad_id: newSquad.id,
             player_id: p.player_id, // Should be just player_id from SquadBuilder save format
             position: p.position,
             slot_id: p.slot_id,
             // user_id: user.id // <-- **FIX: Removed this line**
            }));
        const { error: spError } = await supabase.from('squad_players').insert(playersToInsert);
         if (spError) throw spError; // Throw if linking players fails
      }
      toast.success('Squad created successfully.');
      await fetchAllData(); // Refresh
      return true;
    } catch (error: any) {
      toast.error(`Error creating squad: ${error.message}`);
      console.error("Create Squad Error:", error);
      return false;
    }
  };

  const updateSquad = async (squadId: string, updates: any): Promise<boolean> => {
    if (!user?.id) return false;
    const { squad_players, ...squadDetails } = updates;
    try {
      // Update squad details
      const { error: squadUpdateError } = await supabase.from('squads').update(squadDetails).eq('id', squadId);
      if (squadUpdateError) throw squadUpdateError;

      // Replace squad players
      const { error: deleteError } = await supabase.from('squad_players').delete().eq('squad_id', squadId);
       if (deleteError) throw deleteError; // Stop if deletion fails

      if (squad_players && squad_players.length > 0) {
        const playersToInsert = squad_players.map((p: any) => ({
            squad_id: squadId,
            player_id: p.player_id,
            position: p.position,
            slot_id: p.slot_id,
            // user_id: user.id // <-- **FIX: Removed this line**
           }));
        const { error: insertError } = await supabase.from('squad_players').insert(playersToInsert);
         if (insertError) throw insertError; // Stop if insertion fails
      }
      toast.success('Squad updated successfully.');
      await fetchAllData(); // Refresh
      return true;
    } catch (error: any) {
      toast.error(`Error updating squad: ${error.message}`);
       console.error("Update Squad Error:", error);
      await fetchAllData(); // Refresh even on error to revert potential partial UI changes
      return false;
    }
  };

  const deleteSquad = async (squadId: string): Promise<boolean> => {
    try {
      // Delete links first
      const { error: spDeleteError } = await supabase.from('squad_players').delete().eq('squad_id', squadId);
       if (spDeleteError) throw spDeleteError;

      // Delete squad
      const { error: squadDeleteError } = await supabase.from('squads').delete().eq('id', squadId);
       if (squadDeleteError) throw squadDeleteError;

      toast.success('Squad deleted successfully.');
      await fetchAllData(); // Refresh
      return true;
    } catch (error: any) {
      toast.error(`Failed to delete squad: ${error.message}`);
       console.error("Delete Squad Error:", error);
      return false;
    }
  };

   const duplicateSquad = async (squadId: string): Promise<boolean> => {
        if (!user?.id) return false;
        const originalSquad = squads.find(s => s.id === squadId);
        if (!originalSquad) {
            toast.error("Original squad not found.");
            return false;
        }

        const { id, created_at, updated_at, squad_players, ...squadDetails } = originalSquad;
        const newName = `${squadDetails.name} Copy`;

        try {
            // Create new squad entry
            const { data: newSquad, error: createError } = await supabase
                .from('squads')
                .insert([{ ...squadDetails, name: newName, user_id: user.id, game_version: gameVersion, is_default: false }])
                .select('id')
                .single();
            if (createError || !newSquad?.id) throw createError || new Error("Failed to create duplicate squad entry.");

            // Duplicate player links
            if (squad_players && squad_players.length > 0) {
                const playersToInsert = squad_players.map(p => ({
                    squad_id: newSquad.id,
                    player_id: p.player_id,
                    position: p.position,
                    slot_id: p.slot_id,
                    // user_id: user.id // <-- **FIX: Removed this line**
                }));
                 const { error: insertError } = await supabase.from('squad_players').insert(playersToInsert);
                 if (insertError) {
                     // Attempt to clean up the partially created squad if player insertion fails
                     await supabase.from('squads').delete().eq('id', newSquad.id);
                     throw insertError;
                 }
            }

            toast.success(`Squad "${newName}" created.`);
            await fetchAllData(); // Refresh the list
            return true;
        } catch (error: any) {
            toast.error(`Failed to duplicate squad: ${error.message}`);
             console.error("Duplicate Squad Error:", error);
            return false;
        }
    };


  const savePlayer = async (player: Partial<PlayerCard>): Promise<PlayerCard | null> => {
    if (!user?.id) return null;
    // Ensure essential fields have defaults if missing (though form should handle this)
    const playerToSave = {
        ...player,
        user_id: user.id,
        game_version: gameVersion,
        rating: player.rating ?? 0,
        position: player.position ?? 'N/A',
        card_type: player.card_type ?? cardTypes.find(ct => ct.is_default)?.id ?? 'default', // Fallback needed
    };
    try {
      const { data, error } = await supabase
          .from('players')
          .upsert(playerToSave, { onConflict: 'id' }) // Use onConflict if ID is present for updates
          .select()
          .single();
      if (error) throw error;
      // Instead of full refetch, just update local players state for performance
      setPlayers(prevPlayers => {
           const index = prevPlayers.findIndex(p => p.id === data.id);
           if (index !== -1) {
               const updatedPlayers = [...prevPlayers];
               updatedPlayers[index] = data;
               return updatedPlayers;
           } else {
               return [...prevPlayers, data];
           }
      });
      // Optionally still call fetchAllData if squad structures might change based on player updates (unlikely)
      // await fetchAllData();
      return data as PlayerCard;
    } catch (error: any) {
      toast.error(`Failed to save player: ${error.message}`);
       console.error("Save Player Error:", error);
      return null;
    }
  };

  // Simple local filter for suggestions
  const getPlayerSuggestions = useCallback((searchTerm: string): PlayerCard[] => {
      if (!searchTerm) return [];
      const lowerCaseSearch = searchTerm.toLowerCase();
      // Consider adding position filter if needed later
      return players.filter(p => p.name.toLowerCase().includes(lowerCaseSearch));
  }, [players]); // Depends only on the players list

  const refetchSquads = useCallback(() => {
        fetchAllData();
  }, [fetchAllData]);

  return {
      squads,
      players,
      cardTypes,
      loading,
      createSquad,
      updateSquad,
      deleteSquad,
      duplicateSquad,
      savePlayer,
      getPlayerSuggestions,
      refetchSquads // Expose refetch if needed externally
    };
};
