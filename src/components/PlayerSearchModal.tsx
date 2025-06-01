
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PlayerCard } from '@/types/squads';
import { useSquadData } from '@/hooks/useSquadData';
import { Search, Plus, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PlayerSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayerSelect: (player: PlayerCard) => void;
  position?: string;
}

const PlayerSearchModal = ({ isOpen, onClose, onPlayerSelect, position }: PlayerSearchModalProps) => {
  const { toast } = useToast();
  const { players, getPlayerSuggestions, savePlayer } = useSquadData();
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<PlayerCard[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlayer, setNewPlayer] = useState<Partial<PlayerCard>>({
    name: '',
    position: position || 'ST',
    rating: 85,
    cardType: 'gold',
    club: '',
    nationality: '',
    league: '',
    pace: 80,
    shooting: 80,
    passing: 80,
    dribbling: 80,
    defending: 50,
    physical: 80,
    price: 0
  });

  useEffect(() => {
    if (searchTerm.length >= 2) {
      const playerSuggestions = getPlayerSuggestions(searchTerm);
      setSuggestions(playerSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, getPlayerSuggestions]);

  const handleCreatePlayer = () => {
    if (!newPlayer.name || !newPlayer.position || !newPlayer.rating) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const player: PlayerCard = {
      id: `player-${Date.now()}`,
      name: newPlayer.name!,
      position: newPlayer.position!,
      rating: newPlayer.rating!,
      cardType: newPlayer.cardType || 'gold',
      club: newPlayer.club || 'Unknown',
      nationality: newPlayer.nationality || 'Unknown',
      league: newPlayer.league || 'Unknown',
      pace: newPlayer.pace || 80,
      shooting: newPlayer.shooting || 80,
      passing: newPlayer.passing || 80,
      dribbling: newPlayer.dribbling || 80,
      defending: newPlayer.defending || 50,
      physical: newPlayer.physical || 80,
      price: newPlayer.price || 0,
      gamesPlayed: 0,
      goals: 0,
      assists: 0,
      averageRating: 0,
      yellowCards: 0,
      redCards: 0,
      wins: 0,
      losses: 0,
      cleanSheets: 0,
      minutesPlayed: 0,
      ownGoals: 0,
      lastUsed: new Date().toISOString()
    };

    // Save player to database
    savePlayer(player);
    
    // Select the new player
    onPlayerSelect(player);
    
    toast({
      title: "Player Created",
      description: `${player.name} has been created and added to your squad`,
    });

    // Reset form
    setNewPlayer({
      name: '',
      position: position || 'ST',
      rating: 85,
      cardType: 'gold',
      club: '',
      nationality: '',
      league: '',
      pace: 80,
      shooting: 80,
      passing: 80,
      dribbling: 80,
      defending: 50,
      physical: 80,
      price: 0
    });
    setShowCreateForm(false);
    setSearchTerm('');
    onClose();
  };

  const handlePlayerClick = (player: PlayerCard) => {
    onPlayerSelect(player);
    setSearchTerm('');
    setSuggestions([]);
    onClose();
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
      default: return 'bg-yellow-500 text-black';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">
            {showCreateForm ? 'Create New Player' : `Search Players${position ? ` - ${position}` : ''}`}
          </DialogTitle>
        </DialogHeader>

        {!showCreateForm ? (
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search for a player..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-600 text-white"
              />
            </div>

            {/* Create New Player Button */}
            <Button
              onClick={() => setShowCreateForm(true)}
              className="w-full modern-button-secondary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Player
            </Button>

            {/* Search Results */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {suggestions.length > 0 ? (
                suggestions.map((player) => (
                  <div
                    key={player.id}
                    onClick={() => handlePlayerClick(player)}
                    className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 cursor-pointer transition-colors"
                  >
                    <Badge className={`${getCardTypeColor(player.cardType)} text-xs`}>
                      {player.rating}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-white font-medium">{player.name}</p>
                      <p className="text-gray-400 text-sm">{player.position} • {player.club}</p>
                    </div>
                    {player.lastUsed && (
                      <Star className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                ))
              ) : searchTerm.length >= 2 ? (
                <div className="text-center py-8 text-gray-400">
                  No players found. Try creating a new player.
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  Start typing to search for players...
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Create Player Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="playerName" className="text-gray-300">Player Name *</Label>
                <Input
                  id="playerName"
                  placeholder="Enter player name"
                  value={newPlayer.name}
                  onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="playerPosition" className="text-gray-300">Position *</Label>
                <Select value={newPlayer.position} onValueChange={(value) => setNewPlayer({ ...newPlayer, position: value })}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    {['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'CF'].map(pos => (
                      <SelectItem key={pos} value={pos} className="text-white hover:bg-gray-800">{pos}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="playerRating" className="text-gray-300">Rating *</Label>
                <Input
                  id="playerRating"
                  type="number"
                  min="1"
                  max="99"
                  value={newPlayer.rating}
                  onChange={(e) => setNewPlayer({ ...newPlayer, rating: parseInt(e.target.value) || 85 })}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="playerCardType" className="text-gray-300">Card Type</Label>
                <Select value={newPlayer.cardType} onValueChange={(value: PlayerCard['cardType']) => setNewPlayer({ ...newPlayer, cardType: value })}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    {['bronze', 'silver', 'gold', 'inform', 'totw', 'toty', 'tots', 'icon', 'hero'].map(type => (
                      <SelectItem key={type} value={type} className="text-white hover:bg-gray-800 capitalize">{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="playerClub" className="text-gray-300">Club</Label>
                <Input
                  id="playerClub"
                  placeholder="Enter club name"
                  value={newPlayer.club}
                  onChange={(e) => setNewPlayer({ ...newPlayer, club: e.target.value })}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="playerNationality" className="text-gray-300">Nationality</Label>
                <Input
                  id="playerNationality"
                  placeholder="Enter nationality"
                  value={newPlayer.nationality}
                  onChange={(e) => setNewPlayer({ ...newPlayer, nationality: e.target.value })}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setShowCreateForm(false)}
                variant="outline"
                className="flex-1 modern-button-secondary"
              >
                Back to Search
              </Button>
              <Button
                onClick={handleCreatePlayer}
                className="flex-1 modern-button-primary"
              >
                Create Player
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PlayerSearchModal;
