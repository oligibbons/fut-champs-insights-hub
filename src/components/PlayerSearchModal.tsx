import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useGameVersion } from '@/contexts/GameVersionContext';
import { PlayerCard, CardType } from '@/types/squads';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Search, Plus, User } from 'lucide-react';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';

interface PlayerSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayerSelect: (player: PlayerCard) => void;
  position?: string;
  cardTypes: CardType[]; // Now receives the custom card types
}

const PlayerSearchModal = ({ isOpen, onClose, onPlayerSelect, position, cardTypes }: PlayerSearchModalProps) => {
  const { user } = useAuth();
  const { gameVersion } = useGameVersion();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [players, setPlayers] = useState<PlayerCard[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<PlayerCard[]>([]);
  
  const [newPlayer, setNewPlayer] = useState<Partial<PlayerCard>>({
    name: '',
    rating: 85,
    position: position || 'ST',
    cardType: cardTypes.find(ct => ct.name.toLowerCase() === 'gold')?.id || cardTypes[0]?.id || 'gold',
    isEvolution: false,
    club: '',
    nationality: '',
    league: '',
    pace: 75,
    shooting: 75,
    passing: 75,
    dribbling: 75,
    defending: 75,
    physical: 75,
  });

  useEffect(() => {
    if (isOpen) {
      const fetchPlayers = async () => {
        if (!user) return;
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .eq('user_id', user.id)
          .eq('game_version', gameVersion);
        if (error) console.error('Error fetching players:', error);
        else setPlayers(data || []);
      };
      fetchPlayers();
    }
  }, [isOpen, user, gameVersion]);

  useEffect(() => {
    setFilteredPlayers(
      players.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, players]);

  useEffect(() => {
    if (position) {
        setNewPlayer(prev => ({ ...prev, position }));
    }
  }, [position]);

  const handleCreatePlayer = async () => {
    if (!user || !newPlayer.name || !newPlayer.rating || !newPlayer.position || !newPlayer.cardType) {
        toast({ title: "Missing Information", description: "Please fill out all required fields.", variant: "destructive" });
        return;
    }

    const playerToInsert = { ...newPlayer, user_id: user.id, game_version: gameVersion };

    const { data, error } = await supabase.from('players').insert(playerToInsert).select().single();

    if (error) {
        toast({ title: "Error creating player", description: error.message, variant: "destructive"});
    } else if (data) {
        toast({ title: "Player Created", description: `${data.name} has been added to your club.`});
        onPlayerSelect(data as PlayerCard);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md md:max-w-2xl bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>Add Player to Squad</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="search">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search"><Search className="h-4 w-4 mr-2"/>Search My Club</TabsTrigger>
            <TabsTrigger value="create"><Plus className="h-4 w-4 mr-2"/>Create New Player</TabsTrigger>
          </TabsList>
          
          <TabsContent value="search" className="space-y-4 pt-4">
            <Input
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-800 border-gray-600"
            />
            <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
              {filteredPlayers.length > 0 ? filteredPlayers.map(player => (
                <div key={player.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-semibold">{player.name}</p>
                    <p className="text-sm text-muted-foreground">{player.rating} {player.position}</p>
                  </div>
                  <Button size="sm" onClick={() => onPlayerSelect(player)}>Select</Button>
                </div>
              )) : (
                <div className="text-center py-4 text-gray-400"><User className="h-8 w-8 mx-auto mb-2" /><p>No players found.</p></div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-4 pt-4">
             <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                    <Label>Player Name</Label>
                    <Input placeholder="e.g., Cristiano Ronaldo" value={newPlayer.name} onChange={(e) => setNewPlayer({...newPlayer, name: e.target.value})} className="bg-gray-800 border-gray-600" />
                </div>
                <div className="space-y-2">
                    <Label>Rating</Label>
                    <Input type="number" placeholder="99" value={newPlayer.rating} onChange={(e) => setNewPlayer({...newPlayer, rating: parseInt(e.target.value)})} className="bg-gray-800 border-gray-600" />
                </div>
                 <div className="space-y-2">
                    <Label>Position</Label>
                    <Input placeholder="ST" value={newPlayer.position} onChange={(e) => setNewPlayer({...newPlayer, position: e.target.value.toUpperCase()})} className="bg-gray-800 border-gray-600" />
                </div>
                <div className="col-span-2 space-y-2">
                    <Label>Card Type</Label>
                    <Select value={newPlayer.cardType} onValueChange={(value) => setNewPlayer({...newPlayer, cardType: value})}>
                        <SelectTrigger className="bg-gray-800 border-gray-600"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {/* CORRECTED: This now maps over the cardTypes passed in from SquadBuilder */}
                            {cardTypes.map(ct => (
                                <SelectItem key={ct.id} value={ct.id}>{ct.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="col-span-2 flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                        <Label>Is it an Evo?</Label>
                        <p className="text-xs text-muted-foreground">Marks this player as an in-progress evolution.</p>
                    </div>
                    <Switch
                        checked={newPlayer.isEvolution}
                        onCheckedChange={(checked) => setNewPlayer({...newPlayer, isEvolution: checked})}
                    />
                </div>
             </div>
             <Button onClick={handleCreatePlayer} className="w-full"><Plus className="h-4 w-4 mr-2"/>Add to Squad</Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerSearchModal;
