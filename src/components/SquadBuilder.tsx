import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Squad, PlayerCard, SquadPosition, FORMATIONS } from '@/types/squads';
import PlayerSearchModal from './PlayerSearchModal';
import { Plus, Users, Save, Trash2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from '@/lib/utils';

interface SquadBuilderProps {
  squad?: Squad;
  gameVersion: string; // Now required
  onSave: (squad: Squad) => void;
  onCancel: () => void;
}

const SquadBuilder = ({ squad, gameVersion, onSave, onCancel }: SquadBuilderProps) => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [squadData, setSquadData] = useState<Squad>(() => {
    if (squad) return squad;

    const preferredFormation = FORMATIONS.find(f => f.name === '4-3-3') || FORMATIONS[0];
    return {
      id: `squad-${Date.now()}`,
      name: 'New Squad',
      formation: preferredFormation.name,
      startingXI: preferredFormation.positions.map((pos, index) => ({
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
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      isDefault: false,
      game_version: gameVersion, // Tag with the current game version
    };
  });

  const [selectedPosition, setSelectedPosition] = useState<SquadPosition | null>(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);

  const handleFormationChange = (formationName: string) => {
    const formationData = FORMATIONS.find(f => f.name === formationName);
    if (!formationData) return;

    const existingPlayers = squadData.startingXI.map(pos => pos.player).filter(Boolean);

    setSquadData(prev => ({
      ...prev,
      formation: formationName,
      startingXI: formationData.positions.map((pos, index) => ({
        id: `starting-${index}`,
        position: pos.position,
        player: index < existingPlayers.length ? existingPlayers[index] : undefined,
        x: pos.x,
        y: pos.y
      })),
      lastModified: new Date().toISOString()
    }));
  };

  const handlePlayerSelect = (player: PlayerCard) => {
    if (!selectedPosition) return;

    const updatedPlayer = { ...player, lastUsed: new Date().toISOString() };
    const positionId = selectedPosition.id;

    const updatePositions = (positions: SquadPosition[]) => 
      positions.map(pos => pos.id === positionId ? { ...pos, player: updatedPlayer } : pos);

    if (positionId.startsWith('starting')) {
      setSquadData(prev => ({ ...prev, startingXI: updatePositions(prev.startingXI), lastModified: new Date().toISOString() }));
    } else if (positionId.startsWith('sub')) {
      setSquadData(prev => ({ ...prev, substitutes: updatePositions(prev.substitutes), lastModified: new Date().toISOString() }));
    } else if (positionId.startsWith('res')) {
      setSquadData(prev => ({ ...prev, reserves: updatePositions(prev.reserves), lastModified: new Date().toISOString() }));
    }

    setSelectedPosition(null);
    setShowPlayerModal(false);
  };
  
  const handleRemovePlayer = (positionId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    
    const removePlayer = (positions: SquadPosition[]) => 
      positions.map(pos => pos.id === positionId ? { ...pos, player: undefined } : pos);

    if (positionId.startsWith('starting')) {
      setSquadData(prev => ({ ...prev, startingXI: removePlayer(prev.startingXI), lastModified: new Date().toISOString() }));
    } else if (positionId.startsWith('sub')) {
      setSquadData(prev => ({ ...prev, substitutes: removePlayer(prev.substitutes), lastModified: new Date().toISOString() }));
    } else if (positionId.startsWith('res')) {
      setSquadData(prev => ({ ...prev, reserves: removePlayer(prev.reserves), lastModified: new Date().toISOString() }));
    }
  };

  const handlePositionClick = (position: SquadPosition) => {
    setSelectedPosition(position);
    setShowPlayerModal(true);
  };

  const handleSave = () => {
    if (!squadData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a squad name",
        variant: "destructive"
      });
      return;
    }
    onSave({ ...squadData, userId: user?.id || 'local-user' });
    toast({
      title: "Success",
      description: `Squad "${squadData.name}" saved successfully`,
    });
  };

  const getCardTypeClasses = (cardType: PlayerCard['cardType']) => {
    const base = "border-2";
    switch (cardType) {
        case 'gold': return `${base} bg-yellow-500/20 border-yellow-400`;
        case 'icon': return `${base} bg-amber-200/20 border-amber-100`;
        case 'hero': return `${base} bg-purple-500/20 border-purple-400`;
        case 'tots': return `${base} bg-blue-500/20 border-blue-400`;
        case 'toty': return `${base} bg-sky-900/40 border-sky-700`;
        default: return `${base} bg-gray-500/20 border-gray-400`;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="glass-card overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
             <Button onClick={onCancel} variant="ghost" size="icon">
                <ArrowLeft className="h-6 w-6 text-white"/>
             </Button>
             <div>
                <CardTitle className="text-white flex items-center gap-2 text-2xl">
                    {squad ? 'Edit Squad' : 'Create Squad'}
                </CardTitle>
                <p className="text-gray-400">Building for {gameVersion}</p>
             </div>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={onCancel} variant="outline" className="modern-button-secondary">Cancel</Button>
            <Button onClick={handleSave} className="modern-button-primary">
              <Save className="h-4 w-4 mr-2" />
              Save Squad
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Squad Name</label>
              <Input
                value={squadData.name}
                onChange={(e) => setSquadData(prev => ({ ...prev, name: e.target.value }))}
                className="modern-input"
                placeholder="Enter squad name"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Formation</label>
              <Select value={squadData.formation} onValueChange={handleFormationChange}>
                <SelectTrigger className="modern-input"><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto bg-gray-900 border-gray-700">
                  {FORMATIONS.map((formation) => (
                    <SelectItem key={formation.name} value={formation.name} className="text-white hover:bg-gray-800">{formation.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="startingXI" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="startingXI">Starting XI</TabsTrigger>
              <TabsTrigger value="substitutes">Substitutes</TabsTrigger>
              <TabsTrigger value="reserves">Reserves</TabsTrigger>
            </TabsList>
            <TabsContent value="startingXI">
              <div className="bg-gradient-to-b from-green-800/50 to-green-900/50 rounded-lg p-4 relative h-96 md:h-[500px] border-2 border-white/20 mt-4">
                <div className="absolute inset-0 bg-no-repeat bg-center bg-contain" style={{backgroundImage: "url('/pitch.svg')", opacity: 0.1}}></div>
                <div className="relative w-full h-full">
                  {squadData.startingXI.map((position) => (
                    <div
                      key={position.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                      style={{ left: `${position.x}%`, top: `${position.y}%` }}
                      onClick={() => handlePositionClick(position)}
                    >
                      {position.player ? (
                        <div className="relative w-16 text-center">
                          <div className={cn("w-12 h-12 rounded-full mx-auto flex flex-col items-center justify-center text-xs font-bold transition-all duration-200 group-hover:scale-110", getCardTypeClasses(position.player.cardType))}>
                            {position.player.isEvolution && (
                                <div className="absolute inset-0 rounded-full border-2 border-teal-400 animate-ping"></div>
                            )}
                            <div className="text-sm font-bold">{position.player.rating}</div>
                            <div className="text-xs -mt-1">{position.position}</div>
                          </div>
                          <p className="text-xs text-white font-semibold truncate mt-1">{position.player.name.split(' ').pop()}</p>
                          <button
                            onClick={(e) => handleRemovePlayer(position.id, e)}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          ><Trash2 className="h-3 w-3" /></button>
                        </div>
                      ) : (
                        <div className="w-16 text-center">
                           <div className="w-12 h-12 border-2 border-dashed border-white/50 rounded-full flex flex-col items-center justify-center text-white text-xs bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200 group-hover:scale-110 mx-auto">
                              <Plus className="h-4 w-4" />
                           </div>
                           <p className="text-xs text-gray-400 font-semibold mt-1">{position.position}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="substitutes" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {squadData.substitutes.map((pos) => <BenchPlayerSlot key={pos.id} position={pos} onPositionClick={handlePositionClick} onRemovePlayer={handleRemovePlayer} />)}
              </div>
            </TabsContent>
            <TabsContent value="reserves" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {squadData.reserves.map((pos) => <BenchPlayerSlot key={pos.id} position={pos} onPositionClick={handlePositionClick} onRemovePlayer={handleRemovePlayer} />)}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <PlayerSearchModal
        isOpen={showPlayerModal}
        onClose={() => {
          setShowPlayerModal(false);
          setSelectedPosition(null);
        }}
        onPlayerSelect={handlePlayerSelect}
        position={selectedPosition?.position}
      />
    </div>
  );
};

const BenchPlayerSlot = ({ position, onPositionClick, onRemovePlayer }: { position: SquadPosition, onPositionClick: (pos: SquadPosition) => void, onRemovePlayer: (id: string) => void}) => {
    return (
        <div
            className="flex items-center gap-3 p-2 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors group"
            onClick={() => onPositionClick(position)}
        >
            {position.player ? (
                <>
                    <Badge className={cn("text-sm", getCardTypeColorForBench(position.player.cardType))}>{position.player.rating}</Badge>
                    <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{position.player.name}</p>
                        <p className="text-gray-400 text-sm">{position.player.position} • {position.player.club}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => { e.stopPropagation(); onRemovePlayer(position.id); }}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </>
            ) : (
                <div className="flex items-center gap-3 text-gray-400 w-full">
                    <div className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-md"><Plus className="h-4 w-4" /></div>
                    <span>Add {position.position === 'SUB' ? 'Substitute' : 'Reserve'}</span>
                </div>
            )}
        </div>
    )
}

const getCardTypeColorForBench = (cardType: PlayerCard['cardType']) => {
    switch (cardType) {
        case 'bronze': return 'bg-amber-700 text-white';
        case 'silver': return 'bg-gray-400 text-black';
        case 'gold': return 'bg-yellow-500 text-black';
        default: return 'bg-purple-500 text-white';
    }
};

export default SquadBuilder;
