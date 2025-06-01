
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Squad, PlayerCard, SquadPosition, FORMATIONS } from '@/types/squads';
import { useSquadData } from '@/hooks/useSquadData';
import PlayerSearchModal from './PlayerSearchModal';
import { Plus, Users, Save, Star, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SquadBuilderProps {
  squad?: Squad;
  onSave: (squad: Squad) => void;
  onCancel: () => void;
}

const SquadBuilder = ({ squad, onSave, onCancel }: SquadBuilderProps) => {
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
  const [showPlayerModal, setShowPlayerModal] = useState(false);

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

    setSelectedPosition(null);
  };

  const handleRemovePlayer = (positionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (positionId.startsWith('starting')) {
      setSquadData(prev => ({
        ...prev,
        startingXI: prev.startingXI.map(pos => 
          pos.id === positionId ? { ...pos, player: undefined } : pos
        ),
        lastModified: new Date().toISOString()
      }));
    } else if (positionId.startsWith('sub')) {
      setSquadData(prev => ({
        ...prev,
        substitutes: prev.substitutes.map(pos => 
          pos.id === positionId ? { ...pos, player: undefined } : pos
        ),
        lastModified: new Date().toISOString()
      }));
    } else if (positionId.startsWith('res')) {
      setSquadData(prev => ({
        ...prev,
        reserves: prev.reserves.map(pos => 
          pos.id === positionId ? { ...pos, player: undefined } : pos
        ),
        lastModified: new Date().toISOString()
      }));
    }
  };

  const handleSave = () => {
    const startingCount = squadData.startingXI.filter(pos => pos.player).length;

    if (startingCount < 11) {
      toast({
        title: "Incomplete Squad",
        description: "Please fill all 11 starting positions.",
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
                  <SelectTrigger className="w-40 modern-input border-fifa-blue/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-fifa-blue/30 max-h-60">
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
                  setShowPlayerModal(true);
                }}
              >
                <div className="relative">
                  <div className={`w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-center text-xs font-bold transition-all duration-300 group-hover:scale-110 shadow-lg ${
                    position.player 
                      ? 'bg-fifa-blue/90 border-fifa-blue text-white shadow-fifa-blue/50' 
                      : 'bg-white/10 border-white/30 text-white/70 hover:bg-white/20'
                  }`}>
                    {position.player ? (
                      <div className="text-center p-1">
                        <div className="text-[10px] leading-none font-bold">{position.player.name.split(' ').slice(-1)[0]}</div>
                        <div className="text-[8px] opacity-75">{position.player.rating}</div>
                        <div className="text-[7px] opacity-50">{position.position}</div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Plus className="h-5 w-5 mx-auto mb-1" />
                        <div className="text-[8px]">{position.position}</div>
                      </div>
                    )}
                  </div>
                  {position.player && (
                    <>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-fifa-gold rounded-full flex items-center justify-center">
                        <Star className="h-3 w-3 text-white" />
                      </div>
                      <button
                        onClick={(e) => handleRemovePlayer(position.id, e)}
                        className="absolute -bottom-2 -left-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110"
                      >
                        <Trash2 className="h-3 w-3 text-white" />
                      </button>
                    </>
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
                  setShowPlayerModal(true);
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-fifa-purple/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    {position.player ? (
                      <span className="text-sm font-bold text-fifa-purple">{position.player.rating}</span>
                    ) : (
                      <Plus className="h-5 w-5 text-fifa-purple/60" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">
                      {position.player ? position.player.name : `Substitute ${index + 1}`}
                    </p>
                    {position.player && (
                      <p className="text-xs text-gray-400">{position.player.cardType} • {position.player.position}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {position.player && (
                    <button
                      onClick={(e) => handleRemovePlayer(position.id, e)}
                      className="w-8 h-8 bg-red-500/20 hover:bg-red-500 rounded-lg flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3 w-3 text-red-400 hover:text-white" />
                    </button>
                  )}
                  {!position.player && (
                    <Badge variant="outline" className="text-fifa-purple border-fifa-purple/40 bg-fifa-purple/10 rounded-xl">
                      Add Player
                    </Badge>
                  )}
                </div>
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
                  setShowPlayerModal(true);
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-fifa-green/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    {position.player ? (
                      <span className="text-sm font-bold text-fifa-green">{position.player.rating}</span>
                    ) : (
                      <Plus className="h-5 w-5 text-fifa-green/60" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">
                      {position.player ? position.player.name : `Reserve ${index + 1}`}
                    </p>
                    {position.player && (
                      <p className="text-xs text-gray-400">{position.player.cardType} • {position.player.position}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {position.player && (
                    <button
                      onClick={(e) => handleRemovePlayer(position.id, e)}
                      className="w-8 h-8 bg-red-500/20 hover:bg-red-500 rounded-lg flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3 w-3 text-red-400 hover:text-white" />
                    </button>
                  )}
                  {!position.player && (
                    <Badge variant="outline" className="text-fifa-green border-fifa-green/40 bg-fifa-green/10 rounded-xl">
                      Optional
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Player Search Modal */}
      <PlayerSearchModal
        isOpen={showPlayerModal}
        onClose={() => {
          setShowPlayerModal(false);
          setSelectedPosition(null);
        }}
        onPlayerSelect={handlePlayerSelect}
        position={selectedPosition}
      />
    </div>
  );
};

export default SquadBuilder;
