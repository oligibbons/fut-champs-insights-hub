
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlayerCard, SquadPosition } from '@/types/squads';
import { useSquadData } from '@/hooks/useSquadData';
import { Search, Plus, Star, Trophy, Clock } from 'lucide-react';

interface PlayerSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayerSelect: (player: PlayerCard) => void;
  position: SquadPosition | null;
}

const PlayerSearchModal = ({ isOpen, onClose, onPlayerSelect, position }: PlayerSearchModalProps) => {
  const { getPlayerSuggestions, savePlayer } = useSquadData();
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<PlayerCard[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    rating: 75,
    position: '',
    cardType: 'gold' as const,
    club: '',
    nationality: '',
    league: ''
  });

  useEffect(() => {
    if (searchTerm.length >= 2) {
      setSuggestions(getPlayerSuggestions(searchTerm));
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, getPlayerSuggestions]);

  useEffect(() => {
    if (position) {
      setNewPlayer(prev => ({ ...prev, position: position.position }));
    }
  }, [position]);

  const handleCreatePlayer = () => {
    if (!newPlayer.name.trim()) return;

    const player: PlayerCard = {
      id: `player-${Date.now()}`,
      name: newPlayer.name,
      position: newPlayer.position || position?.position || 'ST',
      rating: newPlayer.rating,
      cardType: newPlayer.cardType,
      club: newPlayer.club,
      nationality: newPlayer.nationality,
      league: newPlayer.league,
      gamesPlayed: 0,
      goals: 0,
      assists: 0,
      cleanSheets: 0,
      averageRating: 6.0,
      yellowCards: 0,
      redCards: 0,
      ownGoals: 0,
      minutesPlayed: 0,
      wins: 0,
      losses: 0,
      lastUsed: new Date().toISOString()
    };

    savePlayer(player);
    onPlayerSelect(player);
    handleClose();
  };

  const handleClose = () => {
    setSearchTerm('');
    setSuggestions([]);
    setShowCreateForm(false);
    setNewPlayer({
      name: '',
      rating: 75,
      position: '',
      cardType: 'gold',
      club: '',
      nationality: '',
      league: ''
    });
    onClose();
  };

  const getCardTypeColor = (type: string) => {
    switch (type) {
      case 'bronze': return 'bg-amber-600';
      case 'silver': return 'bg-gray-400';
      case 'gold': return 'bg-yellow-500';
      case 'inform': return 'bg-black';
      case 'totw': return 'bg-blue-600';
      case 'toty': return 'bg-blue-800';
      case 'tots': return 'bg-green-600';
      case 'icon': return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'hero': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      default: return 'bg-yellow-500';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-card border-fifa-blue/30 rounded-3xl shadow-3xl max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-white text-2xl flex items-center gap-3">
            <div className="w-12 h-12 bg-fifa-blue/20 rounded-2xl flex items-center justify-center">
              <Search className="h-6 w-6 text-fifa-blue" />
            </div>
            Add Player to {position?.position}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 overflow-y-auto max-h-[60vh] pr-2">
          {/* Search Section */}
          <div className="relative">
            <Input
              placeholder="Search for a player..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="modern-input border-fifa-blue/30 pl-12 h-14 text-lg"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>

          {/* Search Results */}
          {suggestions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Trophy className="h-5 w-5 text-fifa-gold" />
                Found Players ({suggestions.length})
              </h3>
              <div className="grid gap-3 max-h-64 overflow-y-auto">
                {suggestions.map((player) => (
                  <Card
                    key={`${player.id}-${player.cardType}`}
                    className="glass-card border-fifa-blue/20 cursor-pointer hover:border-fifa-blue/50 hover:scale-105 transition-all duration-300"
                    onClick={() => {
                      onPlayerSelect(player);
                      handleClose();
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-16 h-20 rounded-2xl ${getCardTypeColor(player.cardType)} flex flex-col items-center justify-center text-white relative`}>
                            <div className="text-2xl font-bold">{player.rating}</div>
                            <div className="text-xs font-medium">{player.position}</div>
                            {player.cardType !== 'gold' && (
                              <Star className="absolute -top-1 -right-1 h-4 w-4 text-yellow-300 fill-current" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-white text-lg">{player.name}</p>
                            <p className="text-sm text-gray-300">{player.club || 'Free Agent'}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className="bg-fifa-blue/20 text-fifa-blue border-fifa-blue/30 text-xs">
                                {player.cardType.toUpperCase()}
                              </Badge>
                              {player.gamesPlayed > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {player.gamesPlayed} games
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-fifa-gold">{player.averageRating.toFixed(1)}</div>
                          <div className="text-xs text-gray-400">Avg Rating</div>
                          {player.lastUsed && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                              <Clock className="h-3 w-3" />
                              {new Date(player.lastUsed).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Create New Player Section */}
          <div className="border-t border-white/10 pt-6">
            {!showCreateForm ? (
              <div className="text-center">
                <p className="text-gray-400 mb-4">
                  {searchTerm.length >= 2 && suggestions.length === 0 
                    ? `No players found for "${searchTerm}"`
                    : "Can't find the player you're looking for?"
                  }
                </p>
                <Button 
                  onClick={() => {
                    setShowCreateForm(true);
                    if (searchTerm.length >= 2) {
                      setNewPlayer(prev => ({ ...prev, name: searchTerm }));
                    }
                  }}
                  className="modern-button-primary rounded-2xl h-12 px-8"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create New Player
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Plus className="h-5 w-5 text-fifa-green" />
                  Create New Player
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Player Name *</label>
                    <Input
                      value={newPlayer.name}
                      onChange={(e) => setNewPlayer(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter player name"
                      className="modern-input border-fifa-green/30"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Rating</label>
                    <Input
                      type="number"
                      min="40"
                      max="99"
                      value={newPlayer.rating}
                      onChange={(e) => setNewPlayer(prev => ({ ...prev, rating: parseInt(e.target.value) || 75 }))}
                      className="modern-input border-fifa-green/30"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Position</label>
                    <Input
                      value={newPlayer.position || position?.position || ''}
                      onChange={(e) => setNewPlayer(prev => ({ ...prev, position: e.target.value }))}
                      placeholder="Position"
                      className="modern-input border-fifa-green/30"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Card Type</label>
                    <Select value={newPlayer.cardType} onValueChange={(value: any) => setNewPlayer(prev => ({ ...prev, cardType: value }))}>
                      <SelectTrigger className="modern-input border-fifa-green/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-fifa-green/30">
                        <SelectItem value="bronze">Bronze</SelectItem>
                        <SelectItem value="silver">Silver</SelectItem>
                        <SelectItem value="gold">Gold</SelectItem>
                        <SelectItem value="inform">In-Form</SelectItem>
                        <SelectItem value="totw">TOTW</SelectItem>
                        <SelectItem value="toty">TOTY</SelectItem>
                        <SelectItem value="tots">TOTS</SelectItem>
                        <SelectItem value="icon">Icon</SelectItem>
                        <SelectItem value="hero">Hero</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Club</label>
                    <Input
                      value={newPlayer.club}
                      onChange={(e) => setNewPlayer(prev => ({ ...prev, club: e.target.value }))}
                      placeholder="Club name"
                      className="modern-input border-fifa-green/30"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Nationality</label>
                    <Input
                      value={newPlayer.nationality}
                      onChange={(e) => setNewPlayer(prev => ({ ...prev, nationality: e.target.value }))}
                      placeholder="Nationality"
                      className="modern-input border-fifa-green/30"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 justify-end">
                  <Button
                    onClick={() => setShowCreateForm(false)}
                    variant="outline"
                    className="modern-button-secondary rounded-2xl px-6"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreatePlayer}
                    disabled={!newPlayer.name.trim()}
                    className="modern-button-primary rounded-2xl px-6"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Player
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerSearchModal;
