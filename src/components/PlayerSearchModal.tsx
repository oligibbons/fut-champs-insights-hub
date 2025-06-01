
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlayerCard } from '@/types/squads';
import { Search, Plus } from 'lucide-react';
import { useSquadData } from '@/hooks/useSquadData';

interface PlayerSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayerSelect: (player: PlayerCard) => void;
  position?: string;
}

const PlayerSearchModal = ({ isOpen, onClose, onPlayerSelect, position }: PlayerSearchModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newPlayerData, setNewPlayerData] = useState({
    name: '',
    position: position || 'ST',
    rating: 75,
    cardType: 'gold' as PlayerCard['cardType'],
    club: '',
    nationality: '',
    league: ''
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const { players, savePlayer, getPlayerSuggestions } = useSquadData();

  const suggestions = getPlayerSuggestions(searchTerm);

  const handleCreatePlayer = () => {
    const newPlayer: PlayerCard = {
      id: `player-${Date.now()}`,
      name: newPlayerData.name,
      position: newPlayerData.position,
      rating: newPlayerData.rating,
      cardType: newPlayerData.cardType,
      club: newPlayerData.club,
      nationality: newPlayerData.nationality,
      league: newPlayerData.league,
      gamesPlayed: 0,
      goals: 0,
      assists: 0,
      cleanSheets: 0,
      averageRating: 7.0,
      yellowCards: 0,
      redCards: 0,
      ownGoals: 0,
      minutesPlayed: 0,
      wins: 0,
      losses: 0,
      lastUsed: new Date().toISOString()
    };

    savePlayer(newPlayer);
    onPlayerSelect(newPlayer);
    setNewPlayerData({
      name: '',
      position: position || 'ST',
      rating: 75,
      cardType: 'gold',
      club: '',
      nationality: '',
      league: ''
    });
    setShowCreateForm(false);
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
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto glass-card border-white/20">
        <DialogHeader>
          <DialogTitle className="text-white">
            {showCreateForm ? 'Create New Player' : 'Search Players'}
          </DialogTitle>
        </DialogHeader>

        {!showCreateForm ? (
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search for a player..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 modern-input"
              />
            </div>

            {/* Search Results */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {suggestions.length > 0 ? (
                suggestions.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
                    onClick={() => {
                      onPlayerSelect(player);
                      onClose();
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Badge className={`${getCardTypeColor(player.cardType)} text-xs`}>
                        {player.rating}
                      </Badge>
                      <div>
                        <p className="text-white font-medium">{player.name}</p>
                        <p className="text-gray-400 text-sm">{player.position} • {player.club}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {player.cardType.toUpperCase()}
                    </Badge>
                  </div>
                ))
              ) : searchTerm.length > 2 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>No players found for "{searchTerm}"</p>
                  <Button
                    onClick={() => {
                      setNewPlayerData(prev => ({ ...prev, name: searchTerm }));
                      setShowCreateForm(true);
                    }}
                    className="mt-2 modern-button-primary"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create "{searchTerm}"
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>Start typing to search for players</p>
                </div>
              )}
            </div>

            {/* Create New Player Button */}
            <div className="border-t border-white/20 pt-4">
              <Button
                onClick={() => setShowCreateForm(true)}
                className="w-full modern-button-secondary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Player
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Create Player Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Player Name</label>
                <Input
                  value={newPlayerData.name}
                  onChange={(e) => setNewPlayerData(prev => ({ ...prev, name: e.target.value }))}
                  className="modern-input"
                  placeholder="Enter player name"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Position</label>
                <Select value={newPlayerData.position} onValueChange={(value) => setNewPlayerData(prev => ({ ...prev, position: value }))}>
                  <SelectTrigger className="modern-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GK">GK</SelectItem>
                    <SelectItem value="CB">CB</SelectItem>
                    <SelectItem value="LB">LB</SelectItem>
                    <SelectItem value="RB">RB</SelectItem>
                    <SelectItem value="CDM">CDM</SelectItem>
                    <SelectItem value="CM">CM</SelectItem>
                    <SelectItem value="CAM">CAM</SelectItem>
                    <SelectItem value="LM">LM</SelectItem>
                    <SelectItem value="RM">RM</SelectItem>
                    <SelectItem value="LW">LW</SelectItem>
                    <SelectItem value="RW">RW</SelectItem>
                    <SelectItem value="ST">ST</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Rating</label>
                <Input
                  type="number"
                  min="40"
                  max="99"
                  value={newPlayerData.rating}
                  onChange={(e) => setNewPlayerData(prev => ({ ...prev, rating: parseInt(e.target.value) || 75 }))}
                  className="modern-input"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Card Type</label>
                <Select value={newPlayerData.cardType} onValueChange={(value: PlayerCard['cardType']) => setNewPlayerData(prev => ({ ...prev, cardType: value }))}>
                  <SelectTrigger className="modern-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bronze">Bronze</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="inform">Inform</SelectItem>
                    <SelectItem value="totw">TOTW</SelectItem>
                    <SelectItem value="toty">TOTY</SelectItem>
                    <SelectItem value="tots">TOTS</SelectItem>
                    <SelectItem value="icon">Icon</SelectItem>
                    <SelectItem value="hero">Hero</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Club</label>
                <Input
                  value={newPlayerData.club}
                  onChange={(e) => setNewPlayerData(prev => ({ ...prev, club: e.target.value }))}
                  className="modern-input"
                  placeholder="Enter club name"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Nationality</label>
                <Input
                  value={newPlayerData.nationality}
                  onChange={(e) => setNewPlayerData(prev => ({ ...prev, nationality: e.target.value }))}
                  className="modern-input"
                  placeholder="Enter nationality"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => setShowCreateForm(false)}
                variant="outline"
                className="flex-1 modern-button-secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreatePlayer}
                disabled={!newPlayerData.name}
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
