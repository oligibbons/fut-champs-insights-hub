import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PlayerCard, CardType } from '@/types/squads';
import { useSquadData } from '@/hooks/useSquadData';
import { Search, Plus, User, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useGameVersion } from '@/contexts/GameVersionContext';
import { supabase } from '@/integrations/supabase/client';

interface PlayerSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayerSelect: (player: PlayerCard) => void;
  position?: string;
  cardTypes: CardType[];
}

const PlayerSearchModal = ({ isOpen, onClose, onPlayerSelect, position, cardTypes }: PlayerSearchModalProps) => {
  const { user } = useAuth();
  const { gameVersion } = useGameVersion();
  const { players, savePlayer, getPlayerSuggestions } = useSquadData();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<PlayerCard[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<PlayerCard | null>(null);
  
  const [newPlayer, setNewPlayer] = useState<Partial<PlayerCard>>({
    name: '',
    position: position || 'CM',
    rating: 75,
    card_type: cardTypes.find(ct => ct.is_default)?.id || cardTypes[0]?.id || '',
    club: '',
    nationality: '',
    league: '',
    pace: 75,
    shooting: 75,
    passing: 75,
    dribbling: 75,
    defending: 75,
    physical: 75,
    price: 0,
    isEvolution: false
  });

  useEffect(() => {
    setSuggestions(searchTerm ? getPlayerSuggestions(searchTerm) : players);
  }, [searchTerm, getPlayerSuggestions, players]);

  useEffect(() => {
    if (isOpen) {
        setNewPlayer(prev => ({ 
            ...prev, 
            position: position || 'CM',
            card_type: cardTypes.find(ct => ct.is_default)?.id || cardTypes[0]?.id || ''
        }));
    }
  }, [isOpen, position, cardTypes]);

  const handleCreateOrUpdate = async () => {
    if (!user) { toast({ title: "Authentication Error", variant: "destructive" }); return; }
    if (!newPlayer.name?.trim()) { toast({ title: "Player name is required", variant: "destructive" }); return; }

    // This object now perfectly matches your Supabase 'players' table schema
    const playerToSave = {
      id: editingPlayer ? editingPlayer.id : undefined,
      name: newPlayer.name,
      position: newPlayer.position,
      rating: newPlayer.rating,
      card_type: newPlayer.card_type, // CORRECTED: Was cardType
      club: newPlayer.club,
      nationality: newPlayer.nationality,
      league: newPlayer.league,
      pace: newPlayer.pace,
      shooting: newPlayer.shooting,
      passing: newPlayer.passing,
      dribbling: newPlayer.dribbling,
      defending: newPlayer.defending,
      physical: newPlayer.physical,
      is_evolution: newPlayer.isEvolution,
      user_id: user.id,
      game_version: gameVersion
    };

    const { data, error } = await supabase.from('players').upsert(playerToSave).select().single();

    if (error) {
      console.error("Error saving player:", error);
      toast({ title: `Error saving player`, description: error.message, variant: "destructive"});
    } else if (data) {
      savePlayer(data as PlayerCard);
      onPlayerSelect(data as PlayerCard);
      resetForm();
      toast({ title: `Player ${editingPlayer ? 'Updated' : 'Created'}`, description: `${data.name} has been saved.` });
    }
  };

  const handleEditPlayer = (player: PlayerCard) => {
    setEditingPlayer(player);
    setNewPlayer(player);
    setShowCreateForm(true);
  };
  
  const resetForm = () => {
    setShowCreateForm(false);
    setEditingPlayer(null);
    setNewPlayer({
        name: '', position: position || 'CM', rating: 75, card_type: cardTypes.find(ct => ct.is_default)?.id || cardTypes[0]?.id || '',
        club: '', nationality: '', league: '', pace: 75, shooting: 75, passing: 75,
        dribbling: 75, defending: 75, physical: 75, price: 0, isEvolution: false
    });
  };

  const getCardTypeStyle = (cardType: PlayerCard['card_type']) => {
    const customType = cardTypes.find(ct => ct.id === cardType);
    if(customType) return { background: `linear-gradient(135deg, ${customType.primary_color} 50%, ${customType.secondary_color} 50%)`, color: customType.highlight_color };
    return { background: '#888', color: 'white'};
  };

  const handleInputChange = (field: keyof PlayerCard, value: string | number) => {
    setNewPlayer(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>{showCreateForm ? (editingPlayer ? 'Edit Player' : 'Create New Player') : 'Search Players'}</DialogTitle>
          {/* FIXED: Added DialogDescription to resolve accessibility warning */}
          <DialogDescription>Search for a player in your club or create a new one to add to your squad.</DialogDescription>
        </DialogHeader>

        {!showCreateForm ? (
          <div className="space-y-4 pt-4">
            <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><Input placeholder="Search for players..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-gray-800 border-gray-600"/></div>
            <Button onClick={() => setShowCreateForm(true)} className="w-full modern-button-primary"><Plus className="h-4 w-4 mr-2" />Create New Player</Button>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {suggestions.map((player) => (
                <div key={player.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg group">
                  <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => onPlayerSelect(player)}>
                    <Badge style={getCardTypeStyle(player.card_type)} className="text-xs">{player.rating}</Badge>
                    <div><p className="font-medium">{player.name}</p><p className="text-gray-400 text-sm">{player.position} • {player.club}</p></div>
                  </div>
                  <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleEditPlayer(player); }} className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-700 border-gray-600"><Edit className="h-3 w-3" /></Button>
                </div>
              ))}
              {searchTerm && suggestions.length === 0 && (<div className="text-center py-4 text-gray-400"><User className="h-8 w-8 mx-auto mb-2" /><p>No players found.</p></div>)}
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Player Name</Label><Input value={newPlayer.name || ''} onChange={(e) => handleInputChange('name', e.target.value)} className="bg-gray-800 border-gray-600"/></div>
              <div><Label>Position</Label><Select value={newPlayer.position} onValueChange={(value) => setNewPlayer(prev => ({ ...prev, position: value }))}><SelectTrigger className="bg-gray-800 border-gray-600"><SelectValue /></SelectTrigger><SelectContent>{['GK', 'CB', 'LB', 'RB', 'LWB', 'RWB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'CF', 'ST'].map(pos => (<SelectItem key={pos} value={pos}>{pos}</SelectItem>))}</SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Rating</Label><Input type="number" value={newPlayer.rating || ''} onChange={(e) => handleInputChange('rating', e.target.value)} className="bg-gray-800 border-gray-600"/></div>
              <div><Label>Card Type</Label>
                <Select value={newPlayer.card_type} onValueChange={(value) => setNewPlayer(prev => ({ ...prev, card_type: value }))}>
                    <SelectTrigger className="bg-gray-800 border-gray-600"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {cardTypes.map(type => ( <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem> ))}
                    </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-2"><Checkbox id="isEvolution" checked={newPlayer.isEvolution} onCheckedChange={(checked) => setNewPlayer(prev => ({ ...prev, isEvolution: !!checked }))} /><Label htmlFor="isEvolution">Is Evolution Card?</Label></div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Club</Label><Input value={newPlayer.club || ''} onChange={(e) => handleInputChange('club', e.target.value)} className="bg-gray-800 border-gray-600"/></div>
              <div><Label>Nationality</Label><Input value={newPlayer.nationality || ''} onChange={(e) => handleInputChange('nationality', e.target.value)} className="bg-gray-800 border-gray-600"/></div>
              <div><Label>League</Label><Input value={newPlayer.league || ''} onChange={(e) => handleInputChange('league', e.target.value)} className="bg-gray-800 border-gray-600"/></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'].map(stat => (<div key={stat}><Label className='capitalize'>{stat}</Label><Input type="number" value={newPlayer[stat as keyof PlayerCard] as number | '' || ''} onChange={(e) => handleInputChange(stat as keyof PlayerCard, e.target.value)} className="bg-gray-800 border-gray-600"/></div>))}
            </div>
            <div className="flex gap-4">
              <Button onClick={resetForm} variant="outline" className="flex-1 bg-gray-700 border-gray-600">Cancel</Button>
              <Button onClick={handleCreateOrUpdate} className="flex-1 modern-button-primary">{editingPlayer ? 'Update Player' : 'Create Player'}</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PlayerSearchModal;
