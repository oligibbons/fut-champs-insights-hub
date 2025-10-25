// src/components/SquadBuilder.tsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Squad, PlayerCard, FORMATIONS, CardType, SquadPlayer } from '@/types/squads'; // Use SquadPlayer for internal state
import PlayerSearchModal from './PlayerSearchModal';
import { Plus, Save, Trash2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import { useGameVersion } from '@/contexts/GameVersionContext';
import { useTheme } from './hooks/useTheme'; // Import useTheme
import { ScrollArea } from '@/components/ui/scroll-area'; // For bench/reserves

// --- Integrated BenchPlayerSlot ---
interface BenchPlayerSlotProps {
  slotId: string;
  slotType: 'Substitute' | 'Reserve';
  player: PlayerCard | undefined;
  onPositionClick: (slotId: string) => void;
  onRemovePlayer: (slotId: string, e?: React.MouseEvent) => void;
  cardTypes: CardType[];
}

const BenchPlayerSlot = ({ slotId, slotType, player, onPositionClick, onRemovePlayer, cardTypes }: BenchPlayerSlotProps) => {
    const { currentTheme } = useTheme();
    const getBenchBadgeStyle = (p: PlayerCard) => {
        const cardType = cardTypes.find(ct => ct.id === p.card_type);
        if (cardType) return { background: `linear-gradient(135deg, ${cardType.primary_color}, ${cardType.secondary_color || cardType.primary_color})`, color: cardType.highlight_color || currentTheme.colors.primaryForeground, borderColor: cardType.secondary_color };
        return { background: currentTheme.colors.surface, color: currentTheme.colors.foreground, borderColor: currentTheme.colors.border };
    };

    return (
      <div
        className="flex items-center gap-3 p-2 bg-background/30 rounded-lg cursor-pointer hover:bg-background/50 transition-colors group border border-border/20"
        onClick={() => onPositionClick(slotId)}
      >
        {player ? (
          <>
            <Badge className="text-sm font-bold border" style={getBenchBadgeStyle(player)}>{player.rating}</Badge>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate text-sm">{player.name}</p>
              <p className="text-muted-foreground text-xs">{player.position} {player.club && `• ${player.club}`}</p>
            </div>
            <Button
              type="button" // Ensure it doesn't submit form
              variant="ghost"
              size="icon"
              onClick={(e) => onRemovePlayer(slotId, e)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 shrink-0"
              aria-label={`Remove ${player.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <div className="flex items-center gap-3 text-muted-foreground w-full py-1">
            <div className="w-8 h-8 flex items-center justify-center bg-muted/30 rounded-md border border-dashed border-border/50">
              <Plus className="h-4 w-4" />
            </div>
            <span className="text-xs">Add {slotType}</span>
          </div>
        )}
      </div>
    );
}

// --- Main Squad Builder Component ---
interface SquadBuilderProps {
  squad?: Squad; // Base squad data passed in
  onSave: (squadSaveData: { name: string; formation: string; is_default: boolean; squad_players: { player_id: string; position: string; slot_id: string; }[] }) => void;
  onCancel: () => void;
  cardTypes: CardType[]; // Passed from parent (Squads.tsx -> useSquadData)
}

const SquadBuilder = ({ squad, onSave, onCancel, cardTypes }: SquadBuilderProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { gameVersion } = useGameVersion();
  const { currentTheme } = useTheme();

  // Internal state holds the full player objects for UI display
  const [squadData, setSquadData] = useState<Omit<Squad, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'game_version'> & { squad_players: SquadPlayer[] }>(() => {
    if (squad) {
         // Ensure squad_players has the nested 'players' object if coming from Squads.tsx
         const hydratedPlayers = (squad.squad_players || []).map(sp => ({
             ...sp,
             players: sp.players || undefined // Make sure 'players' exists or is undefined
         })).filter(sp => sp.players) as SquadPlayer[]; // Filter out any missing player data

         return {
             name: squad.name,
             formation: squad.formation,
             games_played: squad.games_played || 0,
             wins: squad.wins || 0,
             losses: squad.losses || 0,
             is_default: squad.is_default || false,
             squad_players: hydratedPlayers,
             // Include other fields if needed for display, but they won't be saved directly
             total_rating: squad.total_rating,
             average_age: squad.average_age,
             total_value: squad.total_value,
             key_players: squad.key_players,
             description: squad.description,
             last_used: squad.last_used
           };
    }
    const preferredFormation = FORMATIONS.find(f => f.name === '4-3-3') || FORMATIONS[0];
    return {
      name: `New ${gameVersion} Squad`,
      formation: preferredFormation.name,
      games_played: 0, wins: 0, losses: 0, is_default: false,
      squad_players: [],
    };
  });

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);

  // No need to fetch cardTypes locally anymore, use prop

  const handleFormationChange = (formationName: string) => {
    setSquadData(prev => ({ ...prev, formation: formationName }));
    // Consider clearing players or trying to remap them if needed, but simple change is usually fine
  };

  const handlePlayerSelect = (player: PlayerCard) => {
    if (!selectedSlotId) return;

    const currentFormation = FORMATIONS.find(f => f.name === squadData.formation);
    let positionName = 'N/A'; // Default position name
     if (selectedSlotId.startsWith('starting-')) {
        positionName = currentFormation?.positions.find(p => p.id === selectedSlotId)?.position || 'N/A';
     } else if (selectedSlotId.startsWith('sub-')) {
         positionName = 'SUB';
     } else if (selectedSlotId.startsWith('res-')) {
         positionName = 'RES';
     }

    setSquadData(currentSquadData => {
      // Remove any player currently in the selected slot
      const filteredPlayers = currentSquadData.squad_players.filter(p => p.slot_id !== selectedSlotId);

      // Create the new player entry WITH the nested player object
      const newPlayerEntry: SquadPlayer = {
        // These IDs aren't strictly needed for saving but help React keys
        id: `${selectedSlotId}-${player.id}`,
        squad_id: squad?.id || 'new-squad',
        player_id: player.id,
        position: positionName, // Store the determined position
        slot_id: selectedSlotId,
        players: player // Embed the full player data
      };

      return {
        ...currentSquadData,
        squad_players: [...filteredPlayers, newPlayerEntry],
      };
    });

    setShowPlayerModal(false);
    setSelectedSlotId(null);
  };

  const handleRemovePlayer = (slotId: string, e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent triggering click on the slot itself
    setSquadData(prev => ({
      ...prev,
      squad_players: prev.squad_players.filter(p => p.slot_id !== slotId),
    }));
  };

  const handlePositionClick = (slotId: string) => {
    setSelectedSlotId(slotId);
    setShowPlayerModal(true);
  };

  // --- SAVE HANDLER ---
  const handleSave = () => {
    if (!squadData.name.trim()) {
      toast({ title: "Name Required", description: "Squad name cannot be empty.", variant: "destructive" });
      return;
    }

    // Prepare data for saving: Extract only necessary fields for squad_players
    const squadPlayersForDb = squadData.squad_players.map(p => ({
      player_id: p.player_id,
      position: p.position, // Use the position stored when player was added
      slot_id: p.slot_id,
    }));

    const dataToSave = {
      name: squadData.name,
      formation: squadData.formation,
      is_default: squadData.is_default || false, // Ensure boolean
      squad_players: squadPlayersForDb,
      // Pass other base squad fields if needed by update logic, but not player object
      games_played: squadData.games_played || 0,
      wins: squadData.wins || 0,
      losses: squadData.losses || 0,
      // Add user_id and game_version in the parent or hook function (useSquadData)
    };

    onSave(dataToSave); // Pass the correctly formatted data
    // Toast is handled in parent/hook after successful save
  };

  const getCardStyle = (player: PlayerCard) => {
    const cardType = cardTypes.find(ct => ct.id === player.card_type);
     if (cardType) return { background: `linear-gradient(135deg, ${cardType.primary_color}, ${cardType.secondary_color || cardType.primary_color})`, color: cardType.highlight_color || currentTheme.colors.primaryForeground, borderColor: cardType.secondary_color || 'transparent' };
     return { background: currentTheme.colors.surface, color: currentTheme.colors.foreground, borderColor: currentTheme.colors.border }; // Use theme colors
  };

  const currentFormation = useMemo(() => FORMATIONS.find(f => f.name === squadData.formation), [squadData.formation]);
  const startingXI = currentFormation?.positions || [];

  const getPlayerForSlot = useCallback((slotId: string): PlayerCard | undefined => {
      return squadData.squad_players.find(p => p.slot_id === slotId)?.players;
  }, [squadData.squad_players]);

  const substituteSlots = useMemo(() => Array.from({ length: 7 }, (_, i) => `sub-${i}`), []);
  const reserveSlots = useMemo(() => Array.from({ length: 5 }, (_, i) => `res-${i}`), []);

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="glass-card overflow-hidden border-border/20">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-black/10 p-4">
          <div className="flex items-center gap-3">
            <Button onClick={onCancel} variant="ghost" size="icon" className="text-muted-foreground hover:text-white"><ArrowLeft className="h-5 w-5"/></Button>
            <div>
              <CardTitle className="text-white text-xl md:text-2xl">{squad ? 'Edit Squad' : 'Create Squad'}</CardTitle>
              <p className="text-muted-foreground text-sm">Building for {gameVersion}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button onClick={onCancel} variant="outline" className="flex-1 sm:flex-initial">Cancel</Button>
            <Button onClick={handleSave} className="flex-1 sm:flex-initial"><Save className="h-4 w-4 mr-2" />Save Squad</Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="squadName" className="block text-sm font-medium mb-1">Squad Name</Label>
              <Input id="squadName" value={squadData.name} onChange={(e) => setSquadData(prev => ({ ...prev, name: e.target.value }))} placeholder="Enter squad name"/>
            </div>
            <div>
              <Label htmlFor="formation" className="block text-sm font-medium mb-1">Formation</Label>
              <Select value={squadData.formation} onValueChange={handleFormationChange}>
                <SelectTrigger id="formation"><SelectValue /></SelectTrigger>
                <SelectContent> {/* Apply styling if needed */}
                  {FORMATIONS.map((f) => (<SelectItem key={f.name} value={f.name}>{f.name}</SelectItem>))}
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

             {/* Starting XI */}
            <TabsContent value="startingXI" className="mt-4">
              <div className="bg-gradient-to-b from-green-900/30 to-green-950/40 rounded-lg p-2 md:p-4 relative h-[500px] sm:h-[600px] md:h-[650px] border border-border/30 overflow-hidden"> {/* Responsive height */}
                <div className="absolute inset-0 bg-no-repeat bg-center bg-contain opacity-10 pointer-events-none" style={{backgroundImage: "url('/pitch.svg')"}}></div>
                <div className="relative w-full h-full">
                  {startingXI.map((pos) => {
                    const player = getPlayerForSlot(pos.id);
                    return (
                      <div key={pos.id} className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group transition-transform duration-200 hover:z-10 hover:scale-105" style={{ left: `${pos.x}%`, top: `${pos.y}%` }} onClick={() => handlePositionClick(pos.id)}>
                        {player ? (
                           <div className="relative w-16 md:w-20 text-center">
                                {/* Player Card Visual */}
                                <div className={cn("aspect-[3/4] w-full rounded-lg mx-auto flex flex-col items-center justify-center text-xs font-bold shadow-lg border", player.is_evolution && "border-2 border-teal-400 ring-1 ring-teal-500")} style={getCardStyle(player)}>
                                    <span className="text-sm md:text-base font-black leading-tight">{player.rating}</span>
                                    <span className="text-[9px] md:text-[10px] leading-tight opacity-80">{pos.position}</span>
                                </div>
                                {/* Player Name */}
                                <p className="text-xs text-white font-semibold truncate mt-0.5 bg-black/50 px-1 rounded-sm">{player.name.includes(' ') ? player.name.split(' ').pop() : player.name}</p>
                                {/* Remove Button */}
                                <Button type="button" variant="destructive" size="icon" onClick={(e) => handleRemovePlayer(pos.id, e)} className="absolute -top-2 -right-2 w-5 h-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" aria-label={`Remove ${player.name}`}> <Trash2 className="h-3 w-3" /> </Button>
                           </div>
                        ) : (
                           <div className="w-16 md:w-20 text-center"> {/* Empty Slot */}
                               <div className="aspect-[3/4] w-full border border-dashed border-white/30 rounded-lg flex flex-col items-center justify-center text-white/50 bg-white/5 hover:bg-white/10 transition-colors duration-200 mx-auto">
                                   <Plus className="h-5 w-5 md:h-6 md:w-6 opacity-50" />
                               </div>
                                <p className="text-xs text-muted-foreground font-medium mt-0.5">{pos.position}</p>
                           </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

             {/* Bench/Reserves in Scrollable Area */}
              <TabsContent value="substitutes" className="mt-4">
                 <ScrollArea className="h-[400px] md:h-[500px] pr-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {substituteSlots.map(slotId => (
                            <BenchPlayerSlot key={slotId} slotId={slotId} slotType="Substitute" player={getPlayerForSlot(slotId)} onPositionClick={handlePositionClick} onRemovePlayer={handleRemovePlayer} cardTypes={cardTypes} />
                        ))}
                    </div>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="reserves" className="mt-4">
                 <ScrollArea className="h-[400px] md:h-[500px] pr-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {reserveSlots.map(slotId => (
                            <BenchPlayerSlot key={slotId} slotId={slotId} slotType="Reserve" player={getPlayerForSlot(slotId)} onPositionClick={handlePositionClick} onRemovePlayer={handleRemovePlayer} cardTypes={cardTypes} />
                        ))}
                    </div>
                 </ScrollArea>
              </TabsContent>

          </Tabs>
        </CardContent>
      </Card>

      {/* Player Search Modal */}
      <PlayerSearchModal
        isOpen={showPlayerModal}
        onClose={() => { setShowPlayerModal(false); setSelectedSlotId(null); }}
        onPlayerSelect={handlePlayerSelect}
        // Determine position for modal based on selected slot
        position={selectedSlotId ? (startingXI.find(p => p.id === selectedSlotId)?.position || (selectedSlotId.startsWith('sub-') ? 'SUB' : (selectedSlotId.startsWith('res-') ? 'RES' : undefined))) : undefined}
        // cardTypes prop is no longer needed as modal fetches its own
      />
    </div>
  );
};

export default SquadBuilder;
