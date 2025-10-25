// src/components/PlayerSearchModal.tsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'; // Ensure DialogFooter is imported
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PlayerCard, CardType } from '@/types/squads';
import { useSquadData } from '@/hooks/useSquadData';
import { Search, Plus, User, Edit, Loader2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/hooks/useTheme';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

interface PlayerSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayerSelect: (player: PlayerCard) => void;
  position?: string;
}

const PlayerSearchModal = ({ isOpen, onClose, onPlayerSelect, position }: PlayerSearchModalProps) => {
  const { getPlayerSuggestions, savePlayer, cardTypes = [], loading: squadDataLoading } = useSquadData();
  const { toast } = useToast();
  const { currentTheme } = useTheme();

  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<PlayerCard[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<PlayerCard | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const initialNewPlayerState = useMemo(() => ({
    name: '', position: position || 'CM', rating: 75,
    card_type: cardTypes.find(ct => ct.is_default)?.id || cardTypes[0]?.id || '',
    club: '', nationality: '', league: '', pace: 70, shooting: 70, passing: 70, dribbling: 70, defending: 70, physical: 70,
    price: 0, is_evolution: false,
    diving: position === 'GK' ? 70 : undefined, handling: position === 'GK' ? 70 : undefined, kicking: position === 'GK' ? 70 : undefined,
    reflexes: position === 'GK' ? 70 : undefined, speed: position === 'GK' ? 70 : undefined, positioning: position === 'GK' ? 70 : undefined,
    is_goalkeeper: position === 'GK',
  }), [position, cardTypes]);

  const [newPlayer, setNewPlayer] = useState<Partial<PlayerCard>>(initialNewPlayerState);

  useEffect(() => {
    if (searchTerm.trim()) { setSuggestions(getPlayerSuggestions(searchTerm)); }
    else { setSuggestions([]); }
  }, [searchTerm, getPlayerSuggestions]);

  useEffect(() => {
    if (isOpen) {
       const currentInitialState = {
         ...initialNewPlayerState, position: position || 'CM',
         card_type: cardTypes.find(ct => ct.is_default)?.id || cardTypes[0]?.id || '',
         is_goalkeeper: position === 'GK',
         diving: position === 'GK' ? 70 : undefined, handling: position === 'GK' ? 70 : undefined, kicking: position === 'GK' ? 70 : undefined,
         reflexes: position === 'GK' ? 70 : undefined, speed: position === 'GK' ? 70 : undefined, positioning: position === 'GK' ? 70 : undefined,
       };
       setNewPlayer(currentInitialState);
       setShowCreateForm(false); setEditingPlayer(null); setSearchTerm('');
    }
  }, [isOpen, position, cardTypes, initialNewPlayerState]);

  const handleCreateOrUpdate = async () => {
    if (!newPlayer.name?.trim()) { toast({ title: "Name Required", variant: "destructive" }); return; }
    setIsSaving(true);
    const playerToSave: Partial<PlayerCard> = { ...newPlayer, id: editingPlayer ? editingPlayer.id : undefined, is_goalkeeper: newPlayer.position === 'GK' };
    if (playerToSave.position !== 'GK') { delete playerToSave.diving; delete playerToSave.handling; delete playerToSave.kicking; delete playerToSave.reflexes; delete playerToSave.speed; delete playerToSave.positioning; }
    else { delete playerToSave.pace; delete playerToSave.shooting; delete playerToSave.passing; delete playerToSave.dribbling; delete playerToSave.defending; delete playerToSave.physical; }
    const savedPlayer = await savePlayer(playerToSave);
    setIsSaving(false);
    if (savedPlayer) { onPlayerSelect(savedPlayer); onClose(); toast({ title: editingPlayer ? "Player Updated" : "Player Created" }); }
  };

  const handleEditPlayer = (player: PlayerCard) => {
    setEditingPlayer(player);
    const playerEditData = { ...initialNewPlayerState, ...player };
    setNewPlayer(playerEditData);
    setShowCreateForm(true);
  };

  const resetAndClose = () => { onClose(); }

  const getCardTypeStyle = (cardTypeId: string | undefined) => {
    if (!cardTypeId) return { background: currentTheme.colors.surface, color: currentTheme.colors.foreground };
    const customType = cardTypes.find(ct => ct.id === cardTypeId);
    if(customType) return { background: `linear-gradient(135deg, ${customType.primary_color}, ${customType.secondary_color || customType.primary_color})`, color: customType.highlight_color || currentTheme.colors.primaryForeground };
    return { background: currentTheme.colors.muted, color: currentTheme.colors.mutedForeground };
 };

  const handleInputChange = useCallback((field: keyof PlayerCard, value: string | number | boolean) => {
      let processedValue = value;
      // Coerce number fields safely, allow temporary empty string
      if (typeof initialNewPlayerState[field] === 'number') {
           processedValue = value === '' ? '' : (Number(value) || 0);
      }
      setNewPlayer(prev => ({ ...prev, [field]: processedValue }));
  }, [initialNewPlayerState]); // Dependency on initial state shape

  const handleNumberBlur = useCallback((field: keyof PlayerCard) => {
       const currentValue = newPlayer[field];
       let finalValue = Number(currentValue) || 0; // Default to 0 if empty or NaN

       // Apply constraints
       const statsFields = ['rating', 'pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical', 'diving', 'handling', 'kicking', 'reflexes', 'speed', 'positioning'];
       if(statsFields.includes(field)) {
           finalValue = Math.max(0, Math.min(99, finalValue));
       } else {
           finalValue = Math.max(0, finalValue); // General non-negative (like price)
       }

       // Only update state if the final value is different
       if (newPlayer[field] !== finalValue) {
           setNewPlayer(prev => ({ ...prev, [field]: finalValue }));
       }
  }, [newPlayer]); // Dependency on newPlayer state


  const isGoalkeeper = newPlayer.position === 'GK';
  const outfieldStats: (keyof PlayerCard)[] = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'];
  const gkStats: (keyof PlayerCard)[] = ['diving', 'handling', 'kicking', 'reflexes', 'speed', 'positioning'];


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && resetAndClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] flex flex-col glass-card border-border/20 text-white p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/20 shrink-0"> {/* Ensure header doesn't shrink */}
          <DialogTitle>{showCreateForm ? (editingPlayer ? 'Edit Player' : 'Create New Player') : 'Search or Create Player'}</DialogTitle>
        </DialogHeader>

        {/* --- SEARCH VIEW --- */}
        {!showCreateForm ? (
          <div className="flex flex-col gap-4 pt-4 flex-grow min-h-0 px-6"> {/* Use flex-grow and min-h-0 */}
            <div className="relative shrink-0"> {/* Prevent input shrink */}
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search existing players..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9"/>
            </div>

            <ScrollArea className="flex-grow pr-3 -mr-3 min-h-[100px]"> {/* Let ScrollArea grow */}
                <div className="space-y-2">
                    {suggestions.map((player) => (
                        <div key={player.id} className="flex items-center justify-between p-2 rounded-lg group hover:bg-white/10 transition-colors cursor-pointer" onClick={() => onPlayerSelect(player)}>
                           <div className="flex items-center gap-3 flex-1 overflow-hidden">
                               <Badge style={getCardTypeStyle(player.card_type)} className="text-xs font-bold px-1.5 py-0.5 shrink-0">{player.rating}</Badge>
                               <div className="overflow-hidden">
                                   <p className="font-medium truncate">{player.name}</p>
                                   <p className="text-muted-foreground text-xs truncate">{player.position} {player.club && `• ${player.club}`}</p>
                               </div>
                           </div>
                           <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); handleEditPlayer(player); }} className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-white hover:bg-white/20 ml-2 shrink-0"> <Edit className="h-4 w-4" /> </Button>
                        </div>
                    ))}
                     {searchTerm.trim() && suggestions.length === 0 && (
                        <div className="text-center py-6 text-muted-foreground"><User className="h-8 w-8 mx-auto mb-2 opacity-50" /><p className="text-sm">No players found.</p></div>
                    )}
                     {!searchTerm.trim() && !squadDataLoading && suggestions.length === 0 && (
                        <div className="text-center py-6 text-muted-foreground"><p className="text-sm">Start typing to search...</p></div>
                     )}
                     {squadDataLoading && !searchTerm.trim() && (
                         <div className="text-center py-6 text-muted-foreground"><Loader2 className="h-6 w-6 mx-auto animate-spin" /></div>
                     )}
                </div>
            </ScrollArea>

            {/* Footer correctly placed INSIDE the main div, pushed down by flex-grow on ScrollArea */}
            <DialogFooter className="pt-4 border-t border-border/20 px-0 pb-6 shrink-0"> {/* No horizontal padding, adjust bottom padding */}
                <Button onClick={() => { setEditingPlayer(null); setNewPlayer(initialNewPlayerState); setShowCreateForm(true); }} variant="secondary" className="w-full sm:w-auto">
                   <Plus className="h-4 w-4 mr-2" />Create New Player
               </Button>
           </DialogFooter>
          </div> // Closing outer div for !showCreateForm
        ) : ( // Closing parenthesis for the conditional was potentially missing or misplaced
        /* --- CREATE/EDIT VIEW --- */
            // Needs explicit flex structure for footer push
            <div className="flex flex-col flex-grow min-h-0 pt-4 px-6">
                 <ScrollArea className="flex-grow min-h-0 pr-3 -mr-3"> {/* Scrollable form content */}
                    <div className="space-y-4 pb-4">
                        {/* Core Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1"><Label htmlFor="playerName">Player Name*</Label><Input id="playerName" value={newPlayer.name || ''} onChange={(e) => handleInputChange('name', e.target.value)} required /></div>
                            <div className="space-y-1"><Label htmlFor="position">Position</Label><Select value={newPlayer.position} onValueChange={(value) => { handleInputChange('position', value); handleInputChange('is_goalkeeper', value === 'GK'); }}><SelectTrigger id="position"><SelectValue /></SelectTrigger><SelectContent>{['GK', 'CB', 'LB', 'RB', 'LWB', 'RWB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'CF', 'ST'].map(pos => (<SelectItem key={pos} value={pos}>{pos}</SelectItem>))}</SelectContent></Select></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1"><Label htmlFor="rating">Rating</Label><Input id="rating" type="number" min="0" max="99" value={newPlayer.rating ?? ''} onChange={(e) => handleInputChange('rating', e.target.value)} onBlur={() => handleNumberBlur('rating')} /></div>
                            <div className="space-y-1"><Label htmlFor="cardType">Card Type</Label>
                                {squadDataLoading ? <Skeleton className="h-9 w-full rounded-md" /> :
                                <Select value={newPlayer.card_type} onValueChange={(value) => handleInputChange('card_type', value)} disabled={cardTypes.length === 0}>
                                    <SelectTrigger id="cardType"><SelectValue placeholder={cardTypes.length === 0 ? "No card types" : "Select..."} /></SelectTrigger>
                                    <SelectContent>{cardTypes.map(type => (<SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>))}</SelectContent>
                                </Select>}
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 pt-2"><Checkbox id="isEvolution" checked={newPlayer.is_evolution} onCheckedChange={(checked) => handleInputChange('is_evolution', !!checked)} /><Label htmlFor="isEvolution" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Is Evolution Card?</Label></div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border/20">
                            <div className="space-y-1"><Label htmlFor="club">Club</Label><Input id="club" value={newPlayer.club || ''} onChange={(e) => handleInputChange('club', e.target.value)} /></div>
                            <div className="space-y-1"><Label htmlFor="nationality">Nationality</Label><Input id="nationality" value={newPlayer.nationality || ''} onChange={(e) => handleInputChange('nationality', e.target.value)} /></div>
                            <div className="space-y-1"><Label htmlFor="league">League</Label><Input id="league" value={newPlayer.league || ''} onChange={(e) => handleInputChange('league', e.target.value)} /></div>
                        </div>
                        <div className="pt-4 border-t border-border/20">
                            <Label className="mb-2 block font-medium">Base Stats (0-99)</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
                                {(isGoalkeeper ? gkStats : outfieldStats).map(stat => (
                                    <div key={stat} className="space-y-1">
                                        <Label htmlFor={stat} className='capitalize text-sm text-muted-foreground'>{stat}</Label>
                                        <Input id={stat} type="number" min="0" max="99" value={newPlayer[stat] ?? ''} onChange={(e) => handleInputChange(stat, e.target.value)} onBlur={() => handleNumberBlur(stat)} />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="pt-4 border-t border-border/20">
                            <div className="space-y-1">
                                <Label htmlFor="price">Market Price (Optional)</Label>
                                <Input id="price" type="number" min="0" value={newPlayer.price ?? ''} onChange={(e) => handleInputChange('price', e.target.value)} onBlur={() => handleNumberBlur('price')} />
                            </div>
                        </div>
                    </div>
                 </ScrollArea>
                 <DialogFooter className="mt-auto pt-4 border-t border-border/20 pb-6 shrink-0"> {/* Adjusted padding */}
                    <Button onClick={() => { setShowCreateForm(false); setEditingPlayer(null); /* No reset needed here */ }} variant="outline" disabled={isSaving}>Back to Search</Button>
                    <Button onClick={handleCreateOrUpdate} disabled={isSaving}>
                        {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : (editingPlayer ? <Edit className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />)}
                        {editingPlayer ? 'Update Player' : 'Create Player'}
                    </Button>
                 </DialogFooter>
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PlayerSearchModal;
