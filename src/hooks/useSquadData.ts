import { useLocalStorage } from './useLocalStorage';
import { useAccountData } from './useAccountData';
import { Squad, PlayerCard } from '@/types/squads';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useSquadData() {
  const { activeAccount } = useAccountData();
  const { user } = useAuth();
  const [squads, setSquads] = useLocalStorage<Squad[]>(`fc25-squads-${activeAccount}`, []);
  const [players, setPlayers] = useLocalStorage<PlayerCard[]>(`fc25-players-${activeAccount}`, []);

  // Load squads from Supabase when component mounts
  useEffect(() => {
    if (user) {
      fetchSquadsFromSupabase();
    }
  }, [user]);

  const fetchSquadsFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('squads')
        .select('*')
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error fetching squads:', error);
        return;
      }

      if (data && data.length > 0) {
        // Convert Supabase data to local Squad format
        const convertedSquads = data.map(dbSquad => {
          // Try to parse the squad data from the description field
          try {
            const squadData = JSON.parse(dbSquad.description || '{}');
            return {
              ...squadData,
              id: dbSquad.id,
              name: dbSquad.name,
              formation: dbSquad.formation,
              isDefault: dbSquad.is_default || false,
              createdAt: dbSquad.created_at,
              updatedAt: dbSquad.updated_at,
              lastModified: dbSquad.last_used || dbSquad.updated_at
            };
          } catch (e) {
            console.error('Error parsing squad data:', e);
            return null;
          }
        }).filter(Boolean);

        if (convertedSquads.length > 0) {
          setSquads(convertedSquads);
        }
      }
    } catch (e) {
      console.error('Error in fetchSquadsFromSupabase:', e);
    }
  };

  const saveSquad = async (squad: Squad) => {
    // First update local storage
    const existingSquadIndex = squads.findIndex(s => s.id === squad.id);
    let updatedSquads;
    
    if (existingSquadIndex >= 0) {
      updatedSquads = [...squads];
      updatedSquads[existingSquadIndex] = squad;
    } else {
      updatedSquads = [...squads, squad];
    }
    
    setSquads(updatedSquads);

    // Then save to Supabase if user is logged in
    if (user) {
      try {
        // Store the complex squad data in the description field as JSON
        const squadData = { ...squad };
        delete squadData.id; // Remove id to avoid duplication
        
        const { error } = await supabase
          .from('squads')
          .upsert({
            id: squad.id,
            user_id: user.id,
            name: squad.name,
            formation: squad.formation,
            is_default: squad.isDefault,
            description: JSON.stringify(squadData),
            last_used: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error('Error saving squad to Supabase:', error);
        }
      } catch (e) {
        console.error('Error in saveSquad:', e);
      }
    }
  };

  const deleteSquad = async (squadId: string) => {
    // Update local storage
    setSquads(squads.filter(s => s.id !== squadId));

    // Delete from Supabase if user is logged in
    if (user) {
      try {
        const { error } = await supabase
          .from('squads')
          .delete()
          .eq('id', squadId)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error deleting squad from Supabase:', error);
        }
      } catch (e) {
        console.error('Error in deleteSquad:', e);
      }
    }
  };

  const setDefaultSquad = async (squadId: string) => {
    // Update local storage
    const updatedSquads = squads.map(squad => ({
      ...squad,
      isDefault: squad.id === squadId
    }));
    setSquads(updatedSquads);

    // Update in Supabase if user is logged in
    if (user) {
      try {
        // First, set all squads to non-default
        await supabase
          .from('squads')
          .update({ is_default: false })
          .eq('user_id', user.id);

        // Then set the selected squad as default
        const { error } = await supabase
          .from('squads')
          .update({ is_default: true })
          .eq('id', squadId)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error setting default squad in Supabase:', error);
        }
      } catch (e) {
        console.error('Error in setDefaultSquad:', e);
      }
    }
  };

  const getDefaultSquad = (): Squad | null => {
    const defaultSquad = squads.find(squad => squad.isDefault);
    return defaultSquad || (squads.length > 0 ? squads[0] : null);
  };

  const savePlayer = async (player: PlayerCard) => {
    // Update local storage
    const existingPlayerIndex = players.findIndex(p => 
      p.name.toLowerCase() === player.name.toLowerCase() && 
      p.cardType === player.cardType && 
      p.rating === player.rating
    );
    
    let updatedPlayers;
    if (existingPlayerIndex >= 0) {
      updatedPlayers = [...players];
      updatedPlayers[existingPlayerIndex] = player;
    } else {
      updatedPlayers = [...players, player];
    }
    
    setPlayers(updatedPlayers);

    // Save to Supabase if user is logged in
    if (user) {
      try {
        const { error } = await supabase
          .from('players')
          .upsert({
            id: player.id,
            user_id: user.id,
            name: player.name,
            position: player.position,
            rating: player.rating,
            card_type: player.cardType,
            club: player.club,
            league: player.league,
            nationality: player.nationality,
            pace: player.pace,
            shooting: player.shooting,
            passing: player.passing,
            dribbling: player.dribbling,
            defending: player.defending,
            physical: player.physical,
            price: player.price,
            last_used: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error('Error saving player to Supabase:', error);
        }
      } catch (e) {
        console.error('Error in savePlayer:', e);
      }
    }
  };

  const getPlayerSuggestions = (searchTerm: string): PlayerCard[] => {
    if (!searchTerm || searchTerm.length < 2) return [];
    
    return players.filter(player => 
      player.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10);
  };

  return {
    squads,
    players,
    saveSquad,
    deleteSquad,
    setDefaultSquad,
    getDefaultSquad,
    savePlayer,
    getPlayerSuggestions,
    fetchSquadsFromSupabase
  };
}