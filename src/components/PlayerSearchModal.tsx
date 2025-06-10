import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PlayerCard, CARD_TYPES } from '@/types/squads';
import { useSquadData } from '@/hooks/useSquadData';
import { Search, Plus, User, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PlayerSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayerSelect: (player: PlayerCard) => void;
  position?: string;
}

const PlayerSearchModal = ({ isOpen, onClose, onPlayerSelect, position }: PlayerSearchModalProps) => {
  const { players, savePlayer, getPlayerSuggestions } = useSquadData();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<PlayerCard[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<PlayerCard | null>(null);
  const [customCardTypes, setCustomCardTypes] = useState<string[]>([]);
  
  // New player form state
  const [newPlayer, setNewPlayer] = useState<Partial<PlayerCard>>({
    name: '',
    position: position || 'CM',
    rating: 75,
    cardType: 'gold',
    club: '',
    nationality: '',
    league: '',
    pace: 75,
    shooting: 75,
    passing: 75,
    dribbling: 75,
    defending: 75,
    physical: 75,
    price: 0
  });

  useEffect(() => {
    if (searchTerm) {
      const playerSuggestions = getPlayerSuggestions(searchTerm);
      setSuggestions(playerSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, getPlayerSuggestions]);

  useEffect(() => {
    // Load custom card types from localStorage
    const saved = localStorage.getItem('futChampions_customCardTypes');
    if (saved) {
      setCustomCardTypes(JSON.parse(saved));
    }
  }, []);

  const handleCreatePlayer = () => {
    if (!newPlayer.name?.trim()) {
      toast({
        title: "Error",
        description: "Player name is required",
        variant: "destructive"
      });
      return;
    }

    const player: PlayerCard = {
      id: `player-${Date.now()}`,
      name: newPlayer.name!,
      position: newPlayer.position!,
      rating: newPlayer.rating!,
      cardType: newPlayer.cardType as PlayerCard['cardType'],
      club: newPlayer.club || 'Unknown',
      nationality: newPlayer.nationality || 'Unknown',
      league: newPlayer.league || 'Unknown',
      pace: newPlayer.pace || 75,
      shooting: newPlayer.shooting || 75,
      passing: newPlayer.passing || 75,
      dribbling: newPlayer.dribbling || 75,
      defending: newPlayer.defending || 75,
      physical: newPlayer.physical || 75,
      price: newPlayer.price || 0,
      goals: 0,
      assists: 0,
      averageRating: 0,
      yellowCards: 0,
      redCards: 0,
      minutesPlayed: 0,
      wins: 0,
      losses: 0,
      cleanSheets: 0,
      imageUrl: '',
      lastUsed: new Date().toISOString()
    };

    savePlayer(player);
    onPlayerSelect(player);
    setShowCreateForm(false);
    setNewPlayer({
      name: '',
      position: position || 'CM',
      rating: 75,
      cardType: 'gold',
      club: '',
      nationality: '',
      league: '',
      pace: 75,
      shooting: 75,
      passing: 75,
      dribbling: 75,
      defending: 75,
      physical: 75,
      price: 0
    });
    
    toast({
      title: "Player Created",
      description: `${player.name} has been added to your database.`
    });
  };

  const handleEditPlayer = (player: PlayerCard) => {
    setEditingPlayer(player);
    setNewPlayer(player);
    setShowCreateForm(true);
  };

  const handleUpdatePlayer = () => {
    if (!editingPlayer || !newPlayer.name?.trim()) return;

    const updatedPlayer: PlayerCard = {
      ...editingPlayer,
      ...newPlayer,
      id: editingPlayer.id,
      lastUsed: new Date().toISOString()
    };

    savePlayer(updatedPlayer);
    onPlayerSelect(updatedPlayer);
    setShowCreateForm(false);
    setEditingPlayer(null);
    
    toast({
      title: "Player Updated",
      description: `${updatedPlayer.name} has been updated.`
    });
  };

  const addCustomCardType = () => {
    const customType = prompt('Enter custom card type:');
    if (customType && customType.trim()) {
      const newCustomTypes = [...customCardTypes, customType.trim().toLowerCase()];
      setCustomCardTypes(newCustomTypes);
      localStorage.setItem('futChampions_customCardTypes', JSON.stringify(newCustomTypes));
      setNewPlayer(prev => ({ ...prev, cardType: customType.trim().toLowerCase() as PlayerCard['cardType'] }));
    }
  };

  const getCardTypeColor = (cardType: PlayerCard['cardType']) => {
    switch (cardType) {
      case 'bronze': return 'bg-amber-700 text-white';
      case 'silver': return 'bg-gray-400 text-black';
      case 'gold': return 'bg-yellow-500 text-black';
      case 'inform': return 'bg-gray-800 text-white';
      case 'totw': return 'bg-blue-600 text-white';
      case 'toty': return 'bg-blue-900 text-white';
      case 'tots': return 'bg-green-600 text-white';
      case 'icon': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black';
      case 'hero': return 'bg-purple-600 text-white';
      default: return 'bg-purple-500 text-white';
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'name' || field === 'club' || field === 'nationality' || field === 'league') {
      setNewPlayer(prev => ({ ...prev, [field]: value }));
    } else {
      // For numeric fields
      const numValue = parseInt(value);
      if (!isNaN(numValue) || value === '') {
        setNewPlayer(prev => ({ 
          ...prev, 
          [field]: value === '' ? '' : numValue 
        }));
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">
            {showCreateForm ? (editingPlayer ? 'Edit Player' : 'Create New Player') : 'Search Players'}
          </DialogTitle>
        </DialogHeader>

        {!showCreateForm ? (
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search for players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-600 text-white"
              />
            </div>

            {/* Create New Player Button */}
            <Button
              onClick={() => setShowCreateForm(true)}
              className="w-full modern-button-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Player
            </Button>

            {/* Search Results */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {suggestions.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 group"
                >
                  <div className="flex items-center gap-3 flex-1" onClick={() => onPlayerSelect(player)}>
                    <Badge className={`${getCardTypeColor(player.cardType)} text-xs`}>
                      {player.rating}
                    </Badge>
                    <div>
                      <p className="text-white font-medium">{player.name}</p>
                      <p className="text-gray-400 text-sm">{player.position} • {player.club}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditPlayer(player);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-700 border-gray-600 text-white"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {searchTerm && suggestions.length === 0 && (
                <div className="text-center py-4 text-gray-400">
                  <User className="h-8 w-8 mx-auto mb-2" />
                  <p>No players found. Create a new one?</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Player Name</label>
                <Input
                  value={newPlayer.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Enter player name"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">Position</label>
                <Select
                  value={newPlayer.position}
                  onValueChange={(value) => setNewPlayer(prev => ({ ...prev, position: value }))}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    {['GK', 'CB', 'LB', 'RB', 'LWB', 'RWB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'CF', 'ST'].map(pos => (
                      <SelectItem key={pos} value={pos} className="text-white hover:bg-gray-800">{pos}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Rating</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={newPlayer.rating === '' ? '' : newPlayer.rating}
                  onChange={(e) => handleInputChange('rating', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="75"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">Card Type</label>
                <div className="flex gap-2">
                  <Select
                    value={newPlayer.cardType}
                    onValueChange={(value) => setNewPlayer(prev => ({ ...prev, cardType: value as PlayerCard['cardType'] }))}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      {[...CARD_TYPES, ...customCardTypes].map(type => (
                        <SelectItem key={type} value={type} className="text-white hover:bg-gray-800">{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    onClick={addCustomCardType}
                    size="sm"
                    variant="outline"
                    className="bg-gray-700 border-gray-600 text-white"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Club</label>
                <Input
                  value={newPlayer.club || ''}
                  onChange={(e) => handleInputChange('club', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Club name"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">Nationality</label>
                <Input
                  value={newPlayer.nationality || ''}
                  onChange={(e) => handleInputChange('nationality', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Country"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">League</label>
                <Input
                  value={newPlayer.league || ''}
                  onChange={(e) => handleInputChange('league', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="League name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Pace</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={newPlayer.pace === '' ? '' : newPlayer.pace}
                  onChange={(e) => handleInputChange('pace', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="75"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">Shooting</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={newPlayer.shooting === '' ? '' : newPlayer.shooting}
                  onChange={(e) => handleInputChange('shooting', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="75"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">Passing</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={newPlayer.passing === '' ? '' : newPlayer.passing}
                  onChange={(e) => handleInputChange('passing', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="75"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">Dribbling</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={newPlayer.dribbling === '' ? '' : newPlayer.dribbling}
                  onChange={(e) => handleInputChange('dribbling', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="75"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">Defending</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={newPlayer.defending === '' ? '' : newPlayer.defending}
                  onChange={(e) => handleInputChange('defending', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="75"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">Physical</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={newPlayer.physical === '' ? '' : newPlayer.physical}
                  onChange={(e) => handleInputChange('physical', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="75"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingPlayer(null);
                }}
                variant="outline"
                className="flex-1 bg-gray-700 border-gray-600 text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={editingPlayer ? handleUpdatePlayer : handleCreatePlayer}
                className="flex-1 modern-button-primary"
              >
                {editingPlayer ? 'Update Player' : 'Create Player'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PlayerSearchModal;