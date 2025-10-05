import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { PlayerCard } from '@/types/squads';
import { useGameVersion } from '@/contexts/GameVersionContext';

interface PlayerSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayerSelect: (player: PlayerCard) => void;
  squadId?: string;
  editingPlayer?: PlayerCard | null;
}

const PlayerSearchModal = ({ isOpen, onClose, onPlayerSelect, editingPlayer }: PlayerSearchModalProps) => {
  const { user } = useAuth();
  const { gameVersion } = useGameVersion();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlayerCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newPlayer, setNewPlayer] = useState<Partial<PlayerCard>>({
    name: '',
    rating: 80,
    position: 'ST',
    card_type: 'Gold Rare',
  });
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  useEffect(() => {
    if (editingPlayer) {
      setNewPlayer(editingPlayer);
      setIsCreatingNew(true);
    } else {
      setNewPlayer({ name: '', rating: 80, position: 'ST', card_type: 'Gold Rare' });
      setIsCreatingNew(false);
    }
  }, [editingPlayer]);

  const searchPlayers = useCallback(async () => {
    if (!searchQuery.trim() || !user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('user_id', user.id)
        .eq('game_version', gameVersion)
        .ilike('name', `%${searchQuery}%`);
      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching players:', error);
      toast.error('Failed to search for players.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, user, gameVersion]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      searchPlayers();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, searchPlayers]);

  const handleCreateOrUpdate = async () => {
    if (!user || !newPlayer.name || !newPlayer.rating || !newPlayer.position || !newPlayer.card_type) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      const playerToSave = {
        id: editingPlayer ? editingPlayer.id : undefined,
        name: newPlayer.name,
        position: newPlayer.position,
        rating: newPlayer.rating,
        card_type: newPlayer.card_type,
        club: newPlayer.club,
        nationality: newPlayer.nationality,
        league: newPlayer.league,
        pace: newPlayer.pace,
        shooting: newPlayer.shooting,
        passing: newPlayer.passing,
        dribbling: newPlayer.dribbling,
        defending: newPlayer.defending,
        physical: newPlayer.physical,
        is_evolution: newPlayer.is_evolution,
        user_id: user.id,
        game_version: gameVersion,
      };

      const { data, error } = await supabase
        .from('players')
        .upsert([playerToSave])
        .select()
        .single();

      if (error) {
        console.error('Error saving player to Supabase:', error);
        throw error;
      }

      toast.success(`Player ${editingPlayer ? 'updated' : 'created'} successfully!`);
      onPlayerSelect(data as PlayerCard);
      onClose();
    } catch (error) {
      toast.error('Error saving player. Please check the console for details.');
    }
  };

  const renderPlayerStatsInputs = () => (
    <div className="grid grid-cols-2 gap-4">
      <Input
        type="number"
        placeholder="Pace"
        value={newPlayer.pace || ''}
        onChange={(e) => setNewPlayer({ ...newPlayer, pace: parseInt(e.target.value) })}
      />
      <Input
        type="number"
        placeholder="Shooting"
        value={newPlayer.shooting || ''}
        onChange={(e) => setNewPlayer({ ...newPlayer, shooting: parseInt(e.target.value) })}
      />
      <Input
        type="number"
        placeholder="Passing"
        value={newPlayer.passing || ''}
        onChange={(e) => setNewPlayer({ ...newPlayer, passing: parseInt(e.target.value) })}
      />
      <Input
        type="number"
        placeholder="Dribbling"
        value={newPlayer.dribbling || ''}
        onChange={(e) => setNewPlayer({ ...newPlayer, dribbling: parseInt(e.target.value) })}
      />
      <Input
        type="number"
        placeholder="Defending"
        value={newPlayer.defending || ''}
        onChange={(e) => setNewPlayer({ ...newPlayer, defending: parseInt(e.target.value) })}
      />
      <Input
        type="number"
        placeholder="Physical"
        value={newPlayer.physical || ''}
        onChange={(e) => setNewPlayer({ ...newPlayer, physical: parseInt(e.target.value) })}
      />
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingPlayer ? 'Edit Player' : 'Add Player to Squad'}</DialogTitle>
        </DialogHeader>
        
        {!isCreatingNew ? (
          <>
            <Input
              placeholder="Search for a player..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {isLoading && <p>Loading...</p>}
            <div className="max-h-60 overflow-y-auto">
              {searchResults.map((player) => (
                <div
                  key={player.id}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => onPlayerSelect(player)}
                >
                  {player.name} ({player.rating}) - {player.position}
                </div>
              ))}
            </div>
            <Button onClick={() => setIsCreatingNew(true)}>Create New Player</Button>
          </>
        ) : (
          <div className="space-y-4">
            <Input
              placeholder="Player Name"
              value={newPlayer.name || ''}
              onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Rating"
              value={newPlayer.rating || ''}
              onChange={(e) => setNewPlayer({ ...newPlayer, rating: parseInt(e.target.value) })}
            />
            <Input
              placeholder="Position"
              value={newPlayer.position || ''}
              onChange={(e) => setNewPlayer({ ...newPlayer, position: e.target.value })}
            />
            <Input
              placeholder="Card Type"
              value={newPlayer.card_type || ''}
              onChange={(e) => setNewPlayer({ ...newPlayer, card_type: e.target.value })}
            />
            {renderPlayerStatsInputs()}
          </div>
        )}

        <DialogFooter>
          {isCreatingNew && (
            <>
              <Button variant="outline" onClick={() => setIsCreatingNew(false)}>Back to Search</Button>
              <Button onClick={handleCreateOrUpdate}>
                {editingPlayer ? 'Update Player' : 'Create and Add Player'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerSearchModal;
