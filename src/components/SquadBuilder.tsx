import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Squad, PlayerCard, FORMATIONS, CardType, SquadPlayer } from '@/types/squads';
import PlayerSearchModal from './PlayerSearchModal';
import { Plus, Save, Trash2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from './ui/badge';
import { useGameVersion } from '@/contexts/GameVersionContext';

// --- Bench Player Slot Sub-Component ---
// This new component handles the display for each player on the bench.

interface BenchPlayerSlotProps {
  slotId: string;
  slotType: 'Substitute' | 'Reserve';
  player: PlayerCard | undefined;
  onPositionClick: (slotId: string) => void;
  onRemovePlayer: (slotId: string, e?: React.MouseEvent) => void;
  cardTypes: CardType[];
}

const BenchPlayerSlot = ({ slotId, slotType, player, onPositionClick, onRemovePlayer, cardTypes }: BenchPlayerSlotProps) => {
    const getBenchBadgeStyle = (p: PlayerCard) => {
        const cardType = cardTypes.find(ct => ct.id === p.card_type);
        if (cardType) return { backgroundColor: cardType.primary_color, color: cardType.highlight_color, borderColor: cardType.secondary_color };
        return { backgroundColor: '#555', color: '#FFF', borderColor: '#888' };
    };

    return (
      <div 
        className="flex items-center gap-3 p-2 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors group" 
        onClick={() => onPositionClick(slotId)}
      >
        {player ? (
          <>
            <Badge className="text-sm border" style={getBenchBadgeStyle(player)}>{player.rating}</Badge>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{player.name}</p>
              <p className="text-gray-400 text-sm">{player.position} • {player.club}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={(e) => onRemovePlayer(slotId, e)} 
              className="w-8 h-8 rounded-full flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <div className="flex items-center gap-3 text-gray-400 w-full">
            <div className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-md">
              <Plus className="h-4 w-4" />
            </div>
            <span>Add {slotType}</span>
          </div>
        )}
      </div>
    );
}


// --- Main Squad Builder Component ---

interface SquadBuilderProps {
  squad?: Squad;
  onSave: (squad: Omit<Squad, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'squad_players'> & { squad_players: Partial<SquadPlayer>[] }) => void;
  onCancel: () => void;
}

const SquadBuilder = ({ squad, onSave, onCancel }: SquadBuilderProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { gameVersion } = useGameVersion();
  const [cardTypes, setCardTypes] = useState<CardType[]>([]);

  const [squadData, setSquadData] = useState(() => {
    if (squad) return { ...squad, squad_players: squad.squad_players || [] };
    
    const preferredFormation = FORMATIONS.find(f => f.name === '4-3-3') || FORMATIONS[0];
    return {
      name: 'New Squad',
      formation: preferredFormation.name,
      games_played: 0,
      wins: 0,
      losses: 0,
      is_default: false,
      squad_players: [],
      updated_at: new Date().toISOString(),
    };
  });
  
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);

  useEffect(() => {
    const fetchCardTypes = async () => {
        if (!user) return;
        const { data, error } = await supabase.from('card_types').select('*').eq('user_id', user.id).eq('game_version', gameVersion);
        if (error) { toast({ title: "Error", description: "Could not load custom card designs.", variant: "destructive" }); }
        else { setCardTypes(data || []); }
    };
    fetchCardTypes();
  }, [user, gameVersion, toast]);

  const handleFormationChange = (formationName: string) => {
    setSquadData(prev => ({ ...prev, formation: formationName, updated_at: new Date().toISOString() }));
  };

  const handlePlayerSelect = (player: PlayerCard) => {
    if (!selectedSlotId) return;
  
    const currentFormation = FORMATIONS.find(f => f.name === squadData.formation);
    // Find position details for starting XI, or define for bench
    let positionName = 'SUB';
    if (selectedSlotId.startsWith('starting-')) {
        positionName = currentFormation?.positions.find(p => p.id === selectedSlotId)?.position || 'Unknown';
    } else if (selectedSlotId.startsWith('res-')) {
        positionName = 'RES';
    }

    setSquadData(currentSquadData => {
      const filteredPlayers = currentSquadData.squad_players.filter(p => p.slot_id !== selectedSlotId);

      const newPlayerEntry: Partial<SquadPlayer> = {
          player_id: player.id,
          position: positionName,
          slot_id: selectedSlotId,
          players: player 
      };

      return {
          ...currentSquadData,
          squad_players: [...filteredPlayers, newPlayerEntry],
          updated_at: new Date().toISOString(),
      };
    });
  
    setShowPlayerModal(false);
    setSelectedSlotId(null);
  };
  
  const handleRemovePlayer = (slotId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSquadData(prev => ({
        ...prev,
        squad_players: prev.squad_players.filter(p => p.slot_id !== slotId),
        updated_at: new Date().toISOString()
    }));
  };

  const handlePositionClick = (slotId: string) => { 
    setSelectedSlotId(slotId); 
    setShowPlayerModal(true); 
  };

  const handleSave = () => {
    if (!squadData.name.trim()) { toast({ title: "Error", description: "Squad name is required", variant: "destructive" }); return; }
    onSave(squadData);
    toast({ title: "Success", description: `Squad "${squadData.name}" saved.` });
  };
  
  const getCardStyle = (player: PlayerCard) => {
      const cardType = cardTypes.find(ct => ct.id === player.card_type);
      if (cardType) return { background: `linear-gradient(135deg, ${cardType.primary_color} 50%, ${cardType.secondary_color || cardType.primary_color} 50%)`, color: cardType.highlight_color };
      return { background: `linear-gradient(135deg, #333 50%, #555 50%)`, color: '#FFFFFF' };
  };

  const currentFormation = FORMATIONS.find(f => f.name === squadData.formation);
  const startingXI = currentFormation?.positions || [];

  const getPlayerForSlot = (slotId: string) => {
      return squadData.squad_players.find(p => p.slot_id === slotId)?.players;
  }

  // Define arrays for bench slots
  const substituteSlots = Array.from({ length: 7 }, (_, i) => `sub-${i}`);
  const reserveSlots = Array.from({ length: 5 }, (_, i) => `res-${i}`);

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="glass-card overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between"><div className="flex items-center gap-4"><Button onClick={onCancel} variant="ghost" size="icon"><ArrowLeft className="h-6 w-6 text-white"/></Button><div><CardTitle className="text-white flex items-center gap-2 text-2xl">{squad ? 'Edit Squad' : 'Create Squad'}</CardTitle><p className="text-gray-400">Building for {gameVersion}</p></div></div><div className="flex items-center gap-4"><Button onClick={onCancel} variant="outline" className="modern-button-secondary">Cancel</Button><Button onClick={handleSave} className="modern-button-primary"><Save className="h-4 w-4 mr-2" />Save Squad</Button></div></CardHeader>
        <CardContent className="p-4 md:p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-white text-sm font-medium mb-2">Squad Name</label><Input value={squadData.name} onChange={(e) => setSquadData(prev => ({ ...prev, name: e.target.value }))} className="modern-input" placeholder="Enter squad name"/></div><div><label className="block text-white text-sm font-medium mb-2">Formation</label><Select value={squadData.formation} onValueChange={handleFormationChange}><SelectTrigger className="modern-input"><SelectValue /></SelectTrigger><SelectContent className="max-h-60 overflow-y-auto bg-gray-900 border-gray-700">{FORMATIONS.map((f) => (<SelectItem key={f.name} value={f.name} className="text-white hover:bg-gray-800">{f.name}</SelectItem>))}</SelectContent></Select></div></div>
          <Tabs defaultValue="startingXI" className="w-full">
            <TabsList className="grid w-full grid-cols-3"><TabsTrigger value="startingXI">Starting XI</TabsTrigger><TabsTrigger value="substitutes">Substitutes</TabsTrigger><TabsTrigger value="reserves">Reserves</TabsTrigger></TabsList>
            <TabsContent value="startingXI">
              <div className="bg-gradient-to-b from-green-800/50 to-green-900/50 rounded-lg p-4 relative h-[600px] md:h-[750px] border-2 border-white/20 mt-4">
                <div className="absolute inset-0 bg-no-repeat bg-center bg-contain" style={{backgroundImage: "url('/pitch.svg')", opacity: 0.1}}></div>
                <div className="relative w-full h-full">
                  {startingXI.map((pos) => { 
                    const player = getPlayerForSlot(pos.id); 
                    return (
                      <div key={pos.id} className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group" style={{ left: `${pos.x}%`, top: `${pos.y}%` }} onClick={() => handlePositionClick(pos.id)}>
                        {player ? (
                          <div className="relative w-24 text-center">
                            <div className={cn("w-20 h-20 rounded-full mx-auto flex flex-col items-center justify-center text-xs font-bold transition-all duration-200 group-hover:scale-110", player.is_evolution && "border-2 border-teal-400")} style={getCardStyle(player)}>
                              <div className="text-xl font-bold">{player.rating}</div>
                              <div className="text-base -mt-1">{pos.position}</div>
                            </div>
                            <p className="text-sm text-white font-semibold truncate mt-1">{player.name.split(' ').pop()}</p>
                            <button onClick={(e) => handleRemovePlayer(pos.id, e)} className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-24 text-center">
                            <div className="w-20 h-20 border-2 border-dashed border-white/50 rounded-full flex flex-col items-center justify-center text-white text-xs bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200 group-hover:scale-110 mx-auto">
                              <Plus className="h-6 w-6" />
                            </div>
                            <p className="text-sm text-gray-400 font-semibold mt-1">{pos.position}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="substitutes" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {substituteSlots.map(slotId => (
                        <BenchPlayerSlot 
                            key={slotId}
                            slotId={slotId}
                            slotType="Substitute"
                            player={getPlayerForSlot(slotId)}
                            onPositionClick={handlePositionClick}
                            onRemovePlayer={handleRemovePlayer}
                            cardTypes={cardTypes}
                        />
                    ))}
                </div>
            </TabsContent>

            <TabsContent value="reserves" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {reserveSlots.map(slotId => (
                        <BenchPlayerSlot 
                            key={slotId}
                            slotId={slotId}
                            slotType="Reserve"
                            player={getPlayerForSlot(slotId)}
                            onPositionClick={handlePositionClick}
                            onRemovePlayer={handleRemovePlayer}
                            cardTypes={cardTypes}
                        />
                    ))}
                </div>
            </TabsContent>

          </Tabs>
        </CardContent>
      </Card>
      <PlayerSearchModal 
        isOpen={showPlayerModal} 
        onClose={() => { setShowPlayerModal(false); setSelectedSlotId(null); }} 
        onPlayerSelect={handlePlayerSelect} 
        position={selectedSlotId ? (FORMATIONS.find(f => f.name === squadData.formation)?.positions.find(p => p.id === selectedSlotId)?.position) : undefined}
        cardTypes={cardTypes} 
      />
    </div>
  );
};

export default SquadBuilder;
