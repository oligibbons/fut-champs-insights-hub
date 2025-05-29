import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Squad, PlayerCard, SquadPosition, FORMATIONS } from '@/types/squads';
import { useSquadData } from '@/hooks/useSquadData';
import { Plus, Users, Save, Copy, Edit, Trash2, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SquadBuilderProps {
  squad?: Squad;
  onSave: (squad: Squad) => void;
  onCancel: () => void;
}

const SquadBuilder = ({ squad, onSave, onCancel }: SquadBuilderProps) => {
  const { getPlayerSuggestions, savePlayer } = useSquadData();
  const { toast } = useToast();
  
  const [squadData, setSquadData] = useState<Squad>(() => {
    if (squad) return squad;
    
    const defaultFormation = FORMATIONS[0];
    return {
      id: `squad-${Date.now()}`,
      name: 'New Squad',
      formation: defaultFormation.name,
      startingXI: defaultFormation.positions.map((pos, index) => ({
        id: `starting-${index}`,
        position: pos.position,
        player: undefined,
        x: pos.x,
        y: pos.y
      })),
      substitutes: Array.from({ length: 7 }, (_, index) => ({
        id: `sub-${index}`,
        position: 'SUB',
        player: undefined,
        x: 0,
        y: 0
      })),
      reserves: Array.from({ length: 5 }, (_, index) => ({
        id: `res-${index}`,
        position: 'RES',
        player: undefined,
        x: 0,
        y: 0
      })),
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      gamesPlayed: 0,
      wins: 0,
      losses: 0
    };
  });

  const [selectedPosition, setSelectedPosition] = useState<SquadPosition | null>(null);
  const [playerSearch, setPlayerSearch] = useState('');
  const [suggestions, setSuggestions] = useState<PlayerCard[]>([]);
  const [showPlayerDialog, setShowPlayerDialog] = useState(false);

  useEffect(() => {
    if (playerSearch.length >= 2) {
      setSuggestions(getPlayerSuggestions(playerSearch));
    } else {
      setSuggestions([]);
    }
  }, [playerSearch, getPlayerSuggestions]);

  const handleFormationChange = (formation: string) => {
    const formationData = FORMATIONS.find(f => f.name === formation);
    if (!formationData) return;

    setSquadData(prev => ({
      ...prev,
      formation,
      startingXI: formationData.positions.map((pos, index) => ({
        id: `starting-${index}`,
        position: pos.position,
        player: prev.startingXI[index]?.player || undefined,
        x: pos.x,
        y: pos.y
      })),
      lastModified: new Date().toISOString()
    }));
  };

  const handlePlayerSelect = (player: PlayerCard) => {
    if (!selectedPosition) return;

    const updatedPlayer = {
      ...player,
      lastUsed: new Date().toISOString()
    };

    savePlayer(updatedPlayer);

    if (selectedPosition.id.startsWith('starting')) {
      setSquadData(prev => ({
        ...prev,
        startingXI: prev.startingXI.map(pos => 
          pos.id === selectedPosition.id ? { ...pos, player: updatedPlayer } : pos
        ),
        lastModified: new Date().toISOString()
      }));
    } else if (selectedPosition.id.startsWith('sub')) {
      setSquadData(prev => ({
        ...prev,
        substitutes: prev.substitutes.map(pos => 
          pos.id === selectedPosition.id ? { ...pos, player: updatedPlayer } : pos
        ),
        lastModified: new Date().toISOString()
      }));
    } else if (selectedPosition.id.startsWith('res')) {
      setSquadData(prev => ({
        ...prev,
        reserves: prev.reserves.map(pos => 
          pos.id === selectedPosition.id ? { ...pos, player: updatedPlayer } : pos
        ),
        lastModified: new Date().toISOString()
      }));
    }

    setShowPlayerDialog(false);
    setSelectedPosition(null);
    setPlayerSearch('');
  };

  const handleSave = () => {
    const startingCount = squadData.startingXI.filter(pos => pos.player).length;
    const subCount = squadData.substitutes.filter(pos => pos.player).length;

    if (startingCount < 11) {
      toast({
        title: "Incomplete Squad",
        description: "Please fill all 11 starting positions.",
        variant: "destructive"
      });
      return;
    }

    if (subCount < 7) {
      toast({
        title: "Incomplete Squad", 
        description: "Please select all 7 substitutes.",
        variant: "destructive"
      });
      return;
    }

    onSave(squadData);
    toast({
      title: "Squad Saved",
      description: `${squadData.name} has been saved successfully!`
    });
  };

  return (
    <div className="space-y-8">
      {/* Squad Header */}
      <Card className="glass-card rounded-3xl shadow-depth-lg border-0 animate-fade-in">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Input
                value={squadData.name}
                onChange={(e) => setSquadData(prev => ({ ...prev, name: e.target.value }))}
                className="text-2xl font-bold bg-transparent border-0 p-0 text-white focus:ring-0"
                placeholder="Squad Name"
              />
              <div className="flex items-center gap-4">
                <Select value={squadData.formation} onValueChange={handleFormationChange}>
                  <SelectTrigger className="w-32 modern-input border-fifa-blue/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-fifa-blue/30">
                    {FORMATIONS.map(formation => (
                      <SelectItem key={formation.name} value={formation.name}>
                        {formation.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Badge className="bg-fifa-blue/20 text-fifa-blue border-fifa-blue/30 rounded-xl">
                  <Users className="h-3 w-3 mr-1" />
                  {squadData.startingXI.filter(p => p.player).length}/11
                </Badge>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={onCancel} variant="outline" className="modern-button-secondary rounded-2xl">
                Cancel
              </Button>
              <Button onClick={handleSave} className="modern-button-primary rounded-2xl">
                <Save className="h-4 w-4 mr-2" />
                Save Squad
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Formation View */}
      <Card className="glass-card rounded-3xl shadow-depth-lg border-0">
        <CardContent className="p-8">
          <div className="relative bg-gradient-to-b from-green-900/20 to-green-700/30 rounded-3xl p-8 min-h-[600px] border border-green-500/20">
            {/* Pitch Lines */}
            <div className="absolute inset-4 border-2 border-white/20 rounded-2xl">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-16 border-2 border-white/20 border-t-0 rounded-b-2xl"></div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-16 border-2 border-white/20 border-b-0 rounded-t-2xl"></div>
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/20"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white/20 rounded-full"></div>
            </div>

            {/* Player Positions */}
            {squadData.startingXI.map((position) => (
              <div
                key={position.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{ left: `${position.x}%`, top: `${position.y}%` }}
                onClick={() => {
                  setSelectedPosition(position);
                  setShowPlayerDialog(true);
                }}
              >
                <div className="relative">
                  <div className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-xs font-bold transition-all duration-300 group-hover:scale-110 shadow-lg ${
                    position.player 
                      ? 'bg-fifa-blue/90 border-fifa-blue text-white shadow-fifa-blue/50' 
                      : 'bg-white/10 border-white/30 text-white/70 hover:bg-white/20'
                  }`}>
                    {position.player ? (
                      <div className="text-center">
                        <div className="text-[10px] leading-none">{position.player.name.split(' ').slice(-1)[0]}</div>
                        <div className="text-[8px] opacity-75">{position.player.rating}</div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Plus className="h-4 w-4 mx-auto mb-0.5" />
                        <div className="text-[8px]">{position.position}</div>
                      </div>
                    )}
                  </div>
                  {position.player && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-fifa-gold rounded-full flex items-center justify-center">
                      <Star className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Substitutes & Reserves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card rounded-3xl shadow-depth-lg border-0">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-fifa-gold" />
              Substitutes (7)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {squadData.substitutes.map((position, index) => (
              <div
                key={position.id}
                className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all duration-300 group"
                onClick={() => {
                  setSelectedPosition(position);
                  setShowPlayerDialog(true);
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-fifa-purple/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    {position.player ? (
                      <span className="text-sm font-bold text-fifa-purple">{position.player.rating}</span>
                    ) : (
                      <Plus className="h-4 w-4 text-fifa-purple/60" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {position.player ? position.player.name : `Substitute ${index + 1}`}
                    </p>
                    {position.player && (
                      <p className="text-xs text-gray-400">{position.player.cardType} • {position.player.position}</p>
                    )}
                  </div>
                </div>
                {!position.player && (
                  <Badge variant="outline" className="text-fifa-purple border-fifa-purple/40 bg-fifa-purple/10 rounded-xl">
                    Add Player
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass-card rounded-3xl shadow-depth-lg border-0">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-fifa-green" />
              Reserves (5)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {squadData.reserves.map((position, index) => (
              <div
                key={position.id}
                className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all duration-300 group"
                onClick={() => {
                  setSelectedPosition(position);
                  setShowPlayerDialog(true);
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-fifa-green/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    {position.player ? (
                      <span className="text-sm font-bold text-fifa-green">{position.player.rating}</span>
                    ) : (
                      <Plus className="h-4 w-4 text-fifa-green/60" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {position.player ? position.player.name : `Reserve ${index + 1}`}
                    </p>
                    {position.player && (
                      <p className="text-xs text-gray-400">{position.player.cardType} • {position.player.position}</p>
                    )}
                  </div>
                </div>
                {!position.player && (
                  <Badge variant="outline" className="text-fifa-green border-fifa-green/40 bg-fifa-green/10 rounded-xl">
                    Optional
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Player Selection Dialog */}
      <Dialog open={showPlayerDialog} onOpenChange={setShowPlayerDialog}>
        <DialogContent className="glass-card border-fifa-blue/30 rounded-3xl shadow-3xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">
              Add Player to {selectedPosition?.position}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Search or type player name..."
              value={playerSearch}
              onChange={(e) => setPlayerSearch(e.target.value)}
              className="modern-input border-fifa-blue/30"
            />
            
            {suggestions.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {suggestions.map((player) => (
                  <div
                    key={`${player.id}-${player.cardType}`}
                    className="p-3 bg-white/5 rounded-2xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all duration-300 group"
                    onClick={() => handlePlayerSelect(player)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">{player.name}</p>
                        <p className="text-xs text-gray-400">{player.cardType} • {player.position} • {player.rating}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-fifa-blue font-bold">{player.averageRating.toFixed(1)}</p>
                        <p className="text-xs text-gray-400">{player.gamesPlayed} games</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {playerSearch.length >= 2 && suggestions.length === 0 && (
              <Button 
                onClick={() => {
                  const newPlayer: PlayerCard = {
                    id: `player-${Date.now()}`,
                    name: playerSearch,
                    position: selectedPosition?.position || 'ST',
                    rating: 85,
                    cardType: 'gold',
                    club: '',
                    nationality: '',
                    league: '',
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
                  handlePlayerSelect(newPlayer);
                }}
                className="w-full modern-button-primary rounded-2xl"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create "{playerSearch}"
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SquadBuilder;
