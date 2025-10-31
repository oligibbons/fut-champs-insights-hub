// src/hooks/useAllSquadsData.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useGameVersion } from '@/contexts/GameVersionContext';
import { Squad, PlayerCard, SquadPlayer, CardType } from '@/types/squads';
import { toast } from '@/components/ui/use-toast';

// This is the "FullSquad" type from useSquadData.ts
export interface FullSquadPlayer extends SquadPlayer {
  playerDetails: PlayerCard | null;
}
export interface FullSquad extends Squad {
  players: FullSquadPlayer[];
  cardTypes?: CardType[];
}
// End FullSquad type

// --- THIS IS THE FIX (Part 1: Correctly typing the hook's return value) ---
interface UseAllSquadsDataReturn {
  squads: FullSquad[];
  allPlayers: PlayerCard[];
  allCardTypes: CardType[];
  loading: boolean;
  error: string | null;
  refetchSquads: () => void;
  createSquad: (name: string, formation: string, isDefault: boolean) => Promise<Squad | null>;
  deleteSquad: (squadId: string) => Promise<void>;
  setDefaultSquad: (squadId: string) => Promise<void>;
}

export const useAllSquadsData = (): UseAllSquadsDataReturn => {
// --- END OF FIX ---

  // --- THIS IS THE FIX (Part 2: Auth loading state) ---
  const { user, loading: authLoading } = useAuth();
  // --- END OF FIX ---
  
  const { gameVersion } = useGameVersion();
  const [squads, setSquads] = useState<FullSquad[]>([]);
  const [allPlayers, setAllPlayers] = useState<PlayerCard[]>([]);
  const [allCardTypes, setAllCardTypes] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllSquadData = useCallback(async () => {
    // --- THIS IS THE FIX (Part 3: Wait for auth) ---
    // Wait for auth to be ready
    if (!user || !gameVersion || authLoading) {
      setSquads([]);
      setAllPlayers([]);
      setAllCardTypes([]);
      setLoading(false);
      return;
    }
    // --- END OF FIX ---

    setLoading(true);
    setError(null);

    try {
      // Fetch all squads, all squad_players, all players, and all card types in parallel
      const [
        squadsRes,
        squadPlayersRes,
        allPlayersRes,
        cardTypesRes
      ] = await Promise.all([
        supabase.from('squads').select('*').eq('user_id', user.id).eq('game_version', gameVersion).order('created_at', { ascending: false }),
        supabase.from('squad_players').select('*'), // We'll filter this locally after fetching
        supabase.from('players').select('*').eq('user_id', user.id).eq('game_version', gameVersion),
        supabase.from('card_types').select('*').eq('user_id', user.id).eq('game_version', gameVersion),
      ]);

      if (squadsRes.error) throw new Error(`Squads Error: ${squadsRes.error.message}`);
      if (squadPlayersRes.error) throw new Error(`Squad Players Error: ${squadPlayersRes.error.message}`);
      if (allPlayersRes.error) throw new Error(`All Players Error: ${allPlayersRes.error.message}`);
      if (cardTypesRes.error) throw new Error(`Card Types Error: ${cardTypesRes.error.message}`);
      
      const allSquadsData: Squad[] = squadsRes.data || [];
      const allSquadPlayersData: SquadPlayer[] = squadPlayersRes.data || [];
      const allPlayersData: PlayerCard[] = allPlayersRes.data || [];
      const allCardTypesData: CardType[] = cardTypesRes.data || [];

      setAllPlayers(allPlayersData);
      setAllCardTypes(allCardTypesData);

      // Create maps for quick lookup
      const playerMap = new Map(allPlayersData.map(p => [p.id, p]));
      const squadPlayersMap = new Map<string, SquadPlayer[]>();
      allSquadPlayersData.forEach(sp => {
        if (!squadPlayersMap.has(sp.squad_id)) {
          squadPlayersMap.set(sp.squad_id, []);
        }
        squadPlayersMap.get(sp.squad_id)!.push(sp);
      });
      
      // Combine all data into FullSquad objects
      const fullSquads: FullSquad[] = allSquadsData.map(squad => {
        const playersForThisSquad = squadPlayersMap.get(squad.id) || [];
        const fullSquadPlayers: FullSquadPlayer[] = playersForThisSquad.map(sp => ({
          ...sp,
          playerDetails: playerMap.get(sp.player_id) || null,
        }));

        return {
          ...squad,
          players: fullSquadPlayers,
          cardTypes: allCardTypesData, // Attach all card types to each squad
        };
      });

      setSquads(fullSquads);

    } catch (err: any) {
      console.error("Error fetching all squads data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  // --- THIS IS THE FIX (Part 4: Auth loading dependency) ---
  }, [user, gameVersion, authLoading]);
  // --- END OF FIX ---

  useEffect(() => {
    fetchAllSquadData();
  }, [fetchAllSquadData]);

  // Function to create a new squad
  const createSquad = async (name: string, formation: string, isDefault: boolean): Promise<Squad | null> => {
    if (!user || !gameVersion) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return null;
    }

    try {
      setLoading(true);
      
      // If setting as default, first unset other defaults
      if (isDefault) {
        const { error: unsetError } = await supabase
          .from('squads')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .eq('game_version', gameVersion)
          .eq('is_default', true);
          
        if (unsetError) throw new Error(`Unset Default Error: ${unsetError.message}`);
      }
      
      const newSquad = {
        user_id: user.id,
        name,
        formation,
        is_default: isDefault,
        game_version: gameVersion,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('squads')
        .insert(newSquad)
        .select()
        .single();
        
      if (error) throw new Error(`Create Squad Error: ${error.message}`);

      toast({ title: "Success", description: "Squad created!" });
      fetchAllSquadData(); // Refresh list
      return data;
      
    } catch (err: any) {
      console.error("Error creating squad:", err);
      toast({ title: "Error creating squad", description: err.message, variant: "destructive" });
      setLoading(false);
      return null;
    }
  };

  // Function to delete a squad
  const deleteSquad = async (squadId: string) => {
    if (!user) return;
    
    try {
      // First, delete associated squad_players (due to foreign key constraints)
      const { error: playersDeleteError } = await supabase
        .from('squad_players')
        .delete()
        .eq('squad_id', squadId);

      if (playersDeleteError) throw new Error(`Delete Players Error: ${playersDeleteError.message}`);

      // Then, delete the squad itself
      const { error: squadDeleteError } = await supabase
        .from('squads')
        .delete()
        .eq('id', squadId)
        .eq('user_id', user.id);
        
      if (squadDeleteError) throw new Error(`Delete Squad Error: ${squadDeleteError.message}`);
      
      toast({ title: "Success", description: "Squad deleted." });
      fetchAllSquadData(); // Refresh list

    } catch (err: any) {
      console.error("Error deleting squad:", err);
      toast({ title: "Error deleting squad", description: err.message, variant: "destructive" });
    }
  };

  // Function to set a squad as default
  const setDefaultSquad = async (squadId: string) => {
     if (!user || !gameVersion) return;
     
     try {
        setLoading(true);
        // Use an RPC call or transaction if this gets complex
        // For now, two separate calls:
        
        // 1. Unset all other defaults
        const { error: unsetError } = await supabase
          .from('squads')
          .update({ is_default: false, updated_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .eq('game_version', gameVersion)
          .eq('is_default', true);

        if (unsetError) throw new Error(`Unset Default Error: ${unsetError.message}`);

        // 2. Set the new default
        const { error: setError } = await supabase
            .from('squads')
            .update({ is_default: true, updated_at: new Date().toISOString() })
            .eq('id', squadId)
            .eq('user_id', user.id);
        
        if (setError) throw new Error(`Set Default Error: ${setError.message}`);
        
        toast({ title: "Success", description: "Default squad updated." });
        fetchAllSquadData(); // Refresh list
        
     } catch (err: any) {
        console.error("Error setting default squad:", err);
        toast({ title: "Error setting default", description: err.message, variant: "destructive" });
     } finally {
        setLoading(false);
     }
  };

  return { squads, allPlayers, allCardTypes, loading, error, refetchSquads: fetchAllSquadData, createSquad, deleteSquad, setDefaultSquad };
};

