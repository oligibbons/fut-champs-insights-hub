
import { useLocalStorage } from './useLocalStorage';
import { useAccountData } from './useAccountData';
import { Squad, PlayerCard } from '@/types/squads';

export function useSquadData() {
  const { activeAccount } = useAccountData();
  const [squads, setSquads] = useLocalStorage<Squad[]>(`fc25-squads-${activeAccount}`, []);
  const [players, setPlayers] = useLocalStorage<PlayerCard[]>(`fc25-players-${activeAccount}`, []);

  const saveSquad = (squad: Squad) => {
    const existingSquadIndex = squads.findIndex(s => s.id === squad.id);
    if (existingSquadIndex >= 0) {
      const updatedSquads = [...squads];
      updatedSquads[existingSquadIndex] = squad;
      setSquads(updatedSquads);
    } else {
      setSquads([...squads, squad]);
    }
  };

  const deleteSquad = (squadId: string) => {
    setSquads(squads.filter(s => s.id !== squadId));
  };

  const setDefaultSquad = (squadId: string) => {
    const updatedSquads = squads.map(squad => ({
      ...squad,
      isDefault: squad.id === squadId
    }));
    setSquads(updatedSquads);
  };

  const getDefaultSquad = (): Squad | null => {
    return squads.find(squad => squad.isDefault) || null;
  };

  const savePlayer = (player: PlayerCard) => {
    const existingPlayerIndex = players.findIndex(p => 
      p.name.toLowerCase() === player.name.toLowerCase() && 
      p.cardType === player.cardType && 
      p.rating === player.rating
    );
    
    if (existingPlayerIndex >= 0) {
      const updatedPlayers = [...players];
      updatedPlayers[existingPlayerIndex] = player;
      setPlayers(updatedPlayers);
    } else {
      setPlayers([...players, player]);
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
    getPlayerSuggestions
  };
}
