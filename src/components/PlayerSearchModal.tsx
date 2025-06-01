
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlayerCard } from '@/types/squads';
import { useSquadData } from '@/hooks/useSquadData';
import { Search, Star, Plus, UserPlus } from 'lucide-react';

interface PlayerSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayerSelect: (player: PlayerCard) => void;
  position?: string;
}

const PlayerSearchModal = ({ isOpen, onClose, onPlayerSelect, position }: PlayerSearchModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCardType, setSelectedCardType] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlayerData, setNewPlayerData] = useState({
    name: '',
    cardType: 'gold' as const,
    rating: 75
  });
  const { players, savePlayer } = useSquadData();

  // Sample player database - in a real app this would come from an API
  const SAMPLE_PLAYERS: PlayerCard[] = [
    // Top-tier players
    { id: 'messi', name: 'Lionel Messi', position: 'RW', rating: 93, cardType: 'gold', club: 'Inter Miami', league: 'MLS', nationality: 'Argentina', pace: 85, shooting: 92, passing: 91, dribbling: 95, defending: 38, physical: 65, price: 850000 },
    { id: 'mbappe', name: 'Kylian Mbappé', position: 'ST', rating: 91, cardType: 'gold', club: 'Real Madrid', league: 'LaLiga', nationality: 'France', pace: 97, shooting: 89, passing: 80, dribbling: 92, defending: 36, physical: 78, price: 1200000 },
    { id: 'haaland', name: 'Erling Haaland', position: 'ST', rating: 91, cardType: 'gold', club: 'Manchester City', league: 'Premier League', nationality: 'Norway', pace: 89, shooting: 94, passing: 65, dribbling: 80, defending: 45, physical: 88, price: 1100000 },
    { id: 'vinicius', name: 'Vinícius Jr.', position: 'LW', rating: 90, cardType: 'gold', club: 'Real Madrid', league: 'LaLiga', nationality: 'Brazil', pace: 95, shooting: 83, passing: 85, dribbling: 92, defending: 29, physical: 61, price: 950000 },
    { id: 'rodri', name: 'Rodri', position: 'CDM', rating: 91, cardType: 'gold', club: 'Manchester City', league: 'Premier League', nationality: 'Spain', pace: 62, shooting: 67, passing: 91, dribbling: 85, defending: 88, physical: 86, price: 800000 },
    
    // Premier League stars
    { id: 'salah', name: 'Mohamed Salah', position: 'RW', rating: 89, cardType: 'gold', club: 'Liverpool', league: 'Premier League', nationality: 'Egypt', pace: 90, shooting: 87, passing: 81, dribbling: 90, defending: 45, physical: 75, price: 750000 },
    { id: 'debruyne', name: 'Kevin De Bruyne', position: 'CAM', rating: 91, cardType: 'gold', club: 'Manchester City', league: 'Premier League', nationality: 'Belgium', pace: 76, shooting: 86, passing: 93, dribbling: 88, defending: 64, physical: 78, price: 850000 },
    { id: 'kane', name: 'Harry Kane', position: 'ST', rating: 90, cardType: 'gold', club: 'Bayern Munich', league: 'Bundesliga', nationality: 'England', pace: 68, shooting: 91, passing: 83, dribbling: 82, defending: 47, physical: 82, price: 700000 },
    
    // La Liga talents
    { id: 'bellingham', name: 'Jude Bellingham', position: 'CM', rating: 90, cardType: 'gold', club: 'Real Madrid', league: 'LaLiga', nationality: 'England', pace: 80, shooting: 83, passing: 86, dribbling: 87, defending: 78, physical: 86, price: 900000 },
    { id: 'pedri', name: 'Pedri', position: 'CM', rating: 85, cardType: 'gold', club: 'FC Barcelona', league: 'LaLiga', nationality: 'Spain', pace: 69, shooting: 63, passing: 88, dribbling: 91, defending: 59, physical: 63, price: 650000 },
    { id: 'gavi', name: 'Gavi', position: 'CM', rating: 83, cardType: 'gold', club: 'FC Barcelona', league: 'LaLiga', nationality: 'Spain', pace: 73, shooting: 59, passing: 84, dribbling: 89, defending: 63, physical: 68, price: 550000 },
    
    // Serie A players
    { id: 'osimhen', name: 'Victor Osimhen', position: 'ST', rating: 87, cardType: 'gold', club: 'Napoli', league: 'Serie A', nationality: 'Nigeria', pace: 90, shooting: 85, passing: 68, dribbling: 81, defending: 38, physical: 85, price: 650000 },
    { id: 'lautaro', name: 'Lautaro Martínez', position: 'ST', rating: 86, cardType: 'gold', club: 'Inter Milan', league: 'Serie A', nationality: 'Argentina', pace: 84, shooting: 86, passing: 73, dribbling: 86, defending: 38, physical: 80, price: 600000 },
    
    // Bundesliga stars
    { id: 'musiala', name: 'Jamal Musiala', position: 'CAM', rating: 84, cardType: 'gold', club: 'Bayern Munich', league: 'Bundesliga', nationality: 'Germany', pace: 82, shooting: 74, passing: 84, dribbling: 91, defending: 34, physical: 64, price: 500000 },
    { id: 'wirtz', name: 'Florian Wirtz', position: 'CAM', rating: 83, cardType: 'gold', club: 'Bayer Leverkusen', league: 'Bundesliga', nationality: 'Germany', pace: 75, shooting: 80, passing: 86, dribbling: 89, defending: 42, physical: 65, price: 480000 },
    
    // Defenders
    { id: 'vandijk', name: 'Virgil van Dijk', position: 'CB', rating: 90, cardType: 'gold', club: 'Liverpool', league: 'Premier League', nationality: 'Netherlands', pace: 75, shooting: 60, passing: 91, dribbling: 72, defending: 92, physical: 86, price: 650000 },
    { id: 'ruben', name: 'Rúben Dias', position: 'CB', rating: 88, cardType: 'gold', club: 'Manchester City', league: 'Premier League', nationality: 'Portugal', pace: 61, shooting: 50, passing: 89, dribbling: 70, defending: 91, physical: 85, price: 580000 },
    { id: 'marquinhos', name: 'Marquinhos', position: 'CB', rating: 87, cardType: 'gold', club: 'PSG', league: 'Ligue 1', nationality: 'Brazil', pace: 76, shooting: 48, passing: 87, dribbling: 79, defending: 90, physical: 78, price: 520000 },
    
    // Goalkeepers
    { id: 'courtois', name: 'Thibaut Courtois', position: 'GK', rating: 90, cardType: 'gold', club: 'Real Madrid', league: 'LaLiga', nationality: 'Belgium', pace: 45, shooting: 17, passing: 75, dribbling: 43, defending: 15, physical: 78, price: 400000 },
    { id: 'alisson', name: 'Alisson', position: 'GK', rating: 89, cardType: 'gold', club: 'Liverpool', league: 'Premier League', nationality: 'Brazil', pace: 54, shooting: 29, passing: 83, dribbling: 52, defending: 15, physical: 90, price: 380000 },
    { id: 'neuer', name: 'Manuel Neuer', position: 'GK', rating: 88, cardType: 'gold', club: 'Bayern Munich', league: 'Bundesliga', nationality: 'Germany', pace: 43, shooting: 25, passing: 91, dribbling: 48, defending: 15, physical: 83, price: 350000 },
    
    // Some special cards
    { id: 'messi_toty', name: 'Lionel Messi', position: 'RW', rating: 97, cardType: 'toty', club: 'Inter Miami', league: 'MLS', nationality: 'Argentina', pace: 90, shooting: 96, passing: 95, dribbling: 99, defending: 42, physical: 70, price: 2500000 },
    { id: 'mbappe_tots', name: 'Kylian Mbappé', position: 'ST', rating: 95, cardType: 'tots', club: 'Real Madrid', league: 'LaLiga', nationality: 'France', pace: 99, shooting: 93, passing: 85, dribbling: 96, defending: 40, physical: 82, price: 2200000 },
    
    // Some silver/bronze players for variety
    { id: 'youngster1', name: 'João Silva', position: 'CM', rating: 72, cardType: 'silver', club: 'Sporting CP', league: 'Liga Portugal', nationality: 'Portugal', pace: 78, shooting: 65, passing: 74, dribbling: 80, defending: 68, physical: 70, price: 25000 },
    { id: 'youngster2', name: 'Marco Rossi', position: 'ST', rating: 68, cardType: 'bronze', club: 'AC Milan', league: 'Serie A', nationality: 'Italy', pace: 82, shooting: 71, passing: 60, dribbling: 75, defending: 35, physical: 68, price: 15000 },
  ];

  const [availablePlayers] = useState<PlayerCard[]>(SAMPLE_PLAYERS);

  const filteredPlayers = availablePlayers.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.club.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCardType = selectedCardType === 'all' || player.cardType === selectedCardType;
    const matchesPosition = !position || player.position === position || 
                           (position === 'CB' && ['CB', 'LB', 'RB'].includes(player.position)) ||
                           (position === 'CM' && ['CM', 'CDM', 'CAM'].includes(player.position)) ||
                           (position === 'ST' && ['ST', 'CF'].includes(player.position)) ||
                           (position === 'LW' && ['LW', 'LM'].includes(player.position)) ||
                           (position === 'RW' && ['RW', 'RM'].includes(player.position));
    
    return matchesSearch && matchesCardType && matchesPosition;
  });

  const handlePlayerSelect = (player: PlayerCard) => {
    savePlayer(player);
    onPlayerSelect(player);
  };

  const handleCreatePlayer = () => {
    if (!newPlayerData.name.trim()) return;

    const newPlayer: PlayerCard = {
      id: `custom-${Date.now()}`,
      name: newPlayerData.name,
      position: position || 'CM',
      rating: newPlayerData.rating,
      cardType: newPlayerData.cardType,
      club: 'Custom Club',
      league: 'Custom League',
      nationality: 'Custom',
      pace: Math.floor(Math.random() * 40) + 50,
      shooting: Math.floor(Math.random() * 40) + 50,
      passing: Math.floor(Math.random() * 40) + 50,
      dribbling: Math.floor(Math.random() * 40) + 50,
      defending: Math.floor(Math.random() * 40) + 50,
      physical: Math.floor(Math.random() * 40) + 50,
      price: newPlayerData.rating * 1000
    };

    handlePlayerSelect(newPlayer);
    setShowCreateForm(false);
    setNewPlayerData({ name: '', cardType: 'gold', rating: 75 });
  };

  const getCardTypeColor = (cardType: PlayerCard['cardType']) => {
    switch (cardType) {
      case 'bronze': return 'bg-amber-700 text-white border-amber-600';
      case 'silver': return 'bg-gray-400 text-black border-gray-500';
      case 'gold': return 'bg-yellow-500 text-black border-yellow-600';
      case 'inform': return 'bg-gray-800 text-white border-gray-700';
      case 'totw': return 'bg-blue-600 text-white border-blue-700';
      case 'toty': return 'bg-blue-900 text-white border-blue-800';
      case 'tots': return 'bg-green-600 text-white border-green-700';
      case 'icon': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black border-orange-600';
      case 'hero': return 'bg-purple-600 text-white border-purple-700';
      default: return 'bg-yellow-500 text-black border-yellow-600';
    }
  };

  const cardTypes = ['all', 'bronze', 'silver', 'gold', 'inform', 'totw', 'toty', 'tots', 'icon', 'hero'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Search className="h-5 w-5 text-fifa-blue" />
            Search Players {position && `for ${position}`}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {!showCreateForm ? (
            <>
              {/* Search and Filters */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Search by name, club, or position..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                  />
                </div>
                <select
                  value={selectedCardType}
                  onChange={(e) => setSelectedCardType(e.target.value)}
                  className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                >
                  {cardTypes.map(type => (
                    <option key={type} value={type} className="bg-gray-800">
                      {type === 'all' ? 'All Cards' : type.toUpperCase()}
                    </option>
                  ))}
                </select>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-fifa-blue hover:bg-fifa-blue/80"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Player
                </Button>
              </div>

              {/* Results */}
              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredPlayers.length > 0 ? (
                  filteredPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg border border-gray-700 cursor-pointer transition-colors hover:bg-gray-700"
                      onClick={() => handlePlayerSelect(player)}
                    >
                      <div className={`w-16 h-20 rounded border-2 flex flex-col items-center justify-center text-xs font-bold ${getCardTypeColor(player.cardType)}`}>
                        <div className="text-lg font-bold">{player.rating}</div>
                        <div className="text-xs">{player.position}</div>
                        {player.cardType === 'icon' && <Star className="h-3 w-3 mt-1" />}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-white text-lg">{player.name}</h3>
                        <p className="text-gray-400 text-sm">{player.club} • {player.league}</p>
                        <p className="text-gray-500 text-xs">{player.nationality}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            PAC {player.pace}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            SHO {player.shooting}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            PAS {player.passing}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-fifa-gold font-bold text-lg">
                          {player.price ? `${Math.round(player.price / 1000)}K` : 'N/A'}
                        </div>
                        <div className="text-gray-400 text-sm">Coins</div>
                      </div>
                      
                      <Plus className="h-5 w-5 text-fifa-blue" />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Search className="h-16 w-16 mx-auto mb-4 text-gray-500" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Players Found</h3>
                    <p className="text-gray-400">Try adjusting your search terms or filters</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Create New Player Form */
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Create New Player</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Player Name</label>
                  <Input
                    type="text"
                    placeholder="Enter player name..."
                    value={newPlayerData.name}
                    onChange={(e) => setNewPlayerData({ ...newPlayerData, name: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Card Type</label>
                  <select
                    value={newPlayerData.cardType}
                    onChange={(e) => setNewPlayerData({ ...newPlayerData, cardType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                  >
                    <option value="bronze">Bronze</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="inform">Inform</option>
                    <option value="totw">TOTW</option>
                    <option value="toty">TOTY</option>
                    <option value="tots">TOTS</option>
                    <option value="icon">Icon</option>
                    <option value="hero">Hero</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Rating</label>
                  <Input
                    type="number"
                    min="40"
                    max="99"
                    value={newPlayerData.rating}
                    onChange={(e) => setNewPlayerData({ ...newPlayerData, rating: parseInt(e.target.value) || 75 })}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreatePlayer} className="bg-fifa-blue hover:bg-fifa-blue/80">
                  Create Player
                </Button>
                <Button onClick={() => setShowCreateForm(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerSearchModal;
