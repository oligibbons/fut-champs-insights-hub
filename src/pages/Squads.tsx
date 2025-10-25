// src/pages/Squads.tsx
import { useState, useMemo } from 'react';
import { useSquadData } from '@/hooks/useSquadData';
import { Squad, CardType, PlayerCard, FORMATIONS, SquadPlayerJoin } from '@/types/squads';
import SquadBuilder from '@/components/SquadBuilder';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Plus, Trash2, Edit, Star, Users, Shield, Copy, Loader2 } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/useTheme';
import { useGameVersion } from '@/contexts/GameVersionContext';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // <-- **FIX: Added missing Tooltip imports**

// --- SquadVisual Component --- (Minor refinement for safety)
const SquadVisual = ({ squad, cardTypes }: { squad: Squad, cardTypes: CardType[] }) => {
    const { currentTheme } = useTheme();
    const formation = useMemo(() => FORMATIONS.find(f => f.name === squad.formation), [squad.formation]);

    const getCardStyle = (player: PlayerCard) => {
        const cardType = cardTypes.find(ct => ct.id === player.card_type);
        if (cardType) {
            return {
                background: `linear-gradient(135deg, ${cardType.primary_color}, ${cardType.secondary_color || cardType.primary_color})`,
                color: cardType.highlight_color || currentTheme.colors.primaryForeground, // Fallback color
                borderColor: cardType.secondary_color || 'transparent',
            };
        }
        // Fallback style using theme surface color
        return { background: currentTheme.colors.surface, color: currentTheme.colors.foreground, borderColor: currentTheme.colors.border };
    };

    if (!formation || !squad.squad_players || squad.squad_players.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                <Users className="h-10 w-10" />
                <p className="mt-2 text-xs">Empty Squad</p>
            </div>
        );
    }

    const startingXI = formation.positions.map(pos => {
        // Find player ensuring the nested 'players' object exists
        const playerSlot = squad.squad_players.find(sp => sp.slot_id === pos.id && sp.players);
        return { ...pos, player: playerSlot?.players }; // player will be PlayerCard or undefined
    });

    return (
        <div className="w-full h-full bg-cover bg-center rounded-lg relative aspect-video" style={{ backgroundImage: "url('/pitch-horizontal.svg')" }}>
            {startingXI.map(({ id, x, y, position, player }) => (
                <div
                    key={id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    // Responsive width, slightly larger
                    style={{ top: `${y}%`, left: `${x}%`, width: '14%', maxWidth: '60px' }}
                >
                    {player ? (
                        <div className="relative group flex flex-col items-center">
                            <div
                                className={cn(
                                    "aspect-[3/4] w-full rounded-md flex flex-col items-center justify-center font-bold shadow-lg border text-center",
                                    player.is_evolution && "border-teal-400 border-2" // Evolution indicator
                                )}
                                style={getCardStyle(player)}
                            >
                                <span className="text-[10px] sm:text-xs font-black leading-tight">{player.rating}</span>
                                <span className="text-[8px] sm:text-[10px] leading-tight">{position}</span>
                            </div>
                            {/* Tooltip for full name on hover */}
                            <TooltipProvider delayDuration={200}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                      <p className="text-white text-[8px] font-semibold text-center truncate bg-black/60 rounded-b-md px-1 mt-[-2px] w-[90%] z-10">
                                         {/* Show last name, fallback to full name */}
                                        {player.name.includes(' ') ? player.name.split(' ').pop() : player.name}
                                      </p>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                        <p>{player.name}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    ) : (
                        <div className="aspect-[3/4] rounded-md flex flex-col items-center justify-center bg-black/40 border border-dashed border-white/20">
                            <span className="text-white text-[9px] font-bold opacity-70">{position}</span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};


const Squads = () => {
    const { toast } = useToast();
    const { currentTheme } = useTheme();
    const { gameVersion, setGameVersion } = useGameVersion();

    // Use specific type from hook if available, otherwise fallback
    const { squads = [], createSquad, updateSquad, deleteSquad, duplicateSquad, cardTypes = [], loading, refetchSquads } = useSquadData();

    const [isBuilding, setIsBuilding] = useState(false);
    const [editingSquad, setEditingSquad] = useState<SquadWithPlayers | null>(null); // Use SquadWithPlayers type

    const handleAddNewSquad = () => {
        setEditingSquad(null);
        setIsBuilding(true);
    };

    const handleEditSquad = (squad: SquadWithPlayers) => {
        setEditingSquad(squad);
        setIsBuilding(true);
    };

    const handleDuplicateSquad = async (squadId: string) => {
        const success = await duplicateSquad(squadId);
        if (success) {
            toast({ title: "Squad Duplicated", description: "A copy of the squad has been created." });
        } // Error handled in useSquadData
    };

    const handleSaveSquad = async (squadData: any) => {
        let success = false;
        if (editingSquad) {
            success = await updateSquad(editingSquad.id, squadData);
        } else {
            success = await createSquad(squadData);
        }
        if (success) {
            setIsBuilding(false);
            setEditingSquad(null);
            // refetchSquads(); // Refetch handled internally by useSquadData now
        } // Error handled in useSquadData
    };

     const handleCancelBuilder = () => {
        setIsBuilding(false);
        setEditingSquad(null);
        refetchSquads(); // Refetch to discard any potential unsaved changes shown in SquadBuilder preview
    };

    const handleDeleteSquad = async (squadId: string) => {
        await deleteSquad(squadId);
        // Toast handled in useSquadData
    };

    const handleSetDefault = async (squadId: string) => {
        const currentDefault = squads.find(s => s.is_default);
        // Optimistic UI update (optional but nice)
        // const optimisticSquads = squads.map(s => ({...s, is_default: s.id === squadId}));
        // setSquads(optimisticSquads); // Need to adjust type if using optimistic

        if (currentDefault && currentDefault.id !== squadId) {
             // Update old default first
            const oldSuccess = await updateSquad(currentDefault.id, { is_default: false });
            if (!oldSuccess) return; // Stop if removing old default fails
        }
        // Set new default
        await updateSquad(squadId, { is_default: true });
        // Toast handled in useSquadData
    };

    // --- Loading State ---
    if (loading && squads.length === 0) { // Show skeleton only on initial load
        return (
             <div className="space-y-8 animate-fade-in">
                 {/* Header Skeleton */}
                 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                     <div>
                         <Skeleton className="h-10 w-48 mb-2" />
                         <Skeleton className="h-4 w-64" />
                     </div>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                           <Skeleton className="h-9 w-32 rounded-full" />
                           <Skeleton className="h-10 w-48 rounded-lg" />
                      </div>
                 </div>
                 {/* Grid Skeleton */}
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                     {[1, 2, 3].map(i => (
                         <Card key={i} className="rounded-3xl shadow-lg border" style={{ backgroundColor: currentTheme.colors.card, borderColor: currentTheme.colors.border }}>
                              <CardHeader className="pb-4"><Skeleton className="h-6 w-3/4 mb-1" /><Skeleton className="h-4 w-1/4" /></CardHeader>
                              <CardContent><Skeleton className="aspect-video rounded-xl mb-4" /></CardContent>
                              <CardFooter className="p-4 bg-black/20 rounded-b-3xl"><Skeleton className="h-8 w-full" /></CardFooter>
                         </Card>
                     ))}
                 </div>
             </div>
        );
    }

    // --- Squad Builder View ---
    if (isBuilding) {
        return (
            <SquadBuilder
                squad={editingSquad || undefined}
                onSave={handleSaveSquad}
                onCancel={handleCancelBuilder} // Use updated cancel handler
                cardTypes={cardTypes} // Pass cardTypes down
            />
        );
    }

    // --- Squad List View ---
    return (
        <div className="space-y-8 animate-fade-in">
             {/* Consistent Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                 <div className="flex items-center gap-4">
                     <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shadow-md">
                        <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">My Squads</h1>
                        <p className="text-muted-foreground">Manage squads across different game versions.</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                    {/* Game Version Switcher */}
                     <div className="flex items-center gap-1 rounded-full p-1 border" style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}>
                        {['FC25', 'FC26'].map(version => (
                            <Button
                                key={version}
                                size="sm" variant="ghost" // Use ghost variant
                                onClick={() => setGameVersion(version as 'FC25' | 'FC26')}
                                className={cn(
                                    "rounded-full transition-colors duration-200 flex-1 px-4 py-1 text-sm",
                                    gameVersion === version ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                )}
                            >
                                {version}
                            </Button>
                        ))}
                    </div>
                    <Button onClick={handleAddNewSquad} className="w-full sm:w-auto" disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                        New Squad
                    </Button>
                </div>
            </div>

            {squads.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {squads.map((squad) => (
                        <Card
                            key={squad.id}
                            style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: squad.is_default ? currentTheme.colors.primary : currentTheme.colors.border, '--tw-ring-color': currentTheme.colors.primary } as React.CSSProperties} // Cast for CSS variable
                            className={`glass-card rounded-2xl shadow-lg border flex flex-col group transition-all duration-300 ${squad.is_default ? 'ring-2 ring-offset-background ring-offset-0' : ''}`} // Adjusted ring offset
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <CardTitle className="text-xl font-bold tracking-tight text-white">{squad.name}</CardTitle>
                                        <p className="text-sm text-muted-foreground">{squad.formation}</p>
                                    </div>
                                    {squad.is_default && (
                                        <div className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: currentTheme.colors.primary, color: currentTheme.colors.primaryForeground }}>
                                            <Shield size={12} /> Default
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0 flex-grow"> {/* Flex grow for content */}
                                <div className="rounded-lg mb-4 overflow-hidden relative border" style={{ borderColor: currentTheme.colors.border }}>
                                    {/* Ensure SquadVisual takes available space */}
                                    <SquadVisual squad={squad} cardTypes={cardTypes} />
                                </div>
                                {/* Simplified Stats - Consider adding Win Rate % */}
                                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                    <div><p className="font-bold text-base text-white">{squad.games_played || 0}</p><p className="text-muted-foreground">Played</p></div>
                                    <div><p className="font-bold text-base text-green-400">{squad.wins || 0}</p><p className="text-muted-foreground">Wins</p></div>
                                    <div><p className="font-bold text-base text-red-400">{squad.losses || 0}</p><p className="text-muted-foreground">Losses</p></div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between p-3 bg-black/10 mt-auto rounded-b-2xl"> {/* Footer styling */}
                                <Button size="sm" variant="outline" onClick={() => handleSetDefault(squad.id)} disabled={squad.is_default} className="text-xs">
                                    <Star className={cn("h-3 w-3 mr-1.5", squad.is_default ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground')} />
                                    {squad.is_default ? 'Default' : 'Set Default'}
                                </Button>
                                <div className="flex gap-1">
                                    <TooltipProvider><Tooltip><TooltipTrigger asChild>
                                    <Button size="icon" variant="ghost" onClick={() => handleDuplicateSquad(squad.id)} className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/10"><Copy className="h-4 w-4" /></Button>
                                    </TooltipTrigger><TooltipContent><p>Duplicate</p></TooltipContent></Tooltip></TooltipProvider>

                                    <TooltipProvider><Tooltip><TooltipTrigger asChild>
                                    <Button size="icon" variant="ghost" onClick={() => handleEditSquad(squad)} className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/10"><Edit className="h-4 w-4" /></Button>
                                    </TooltipTrigger><TooltipContent><p>Edit</p></TooltipContent></Tooltip></TooltipProvider>

                                    <AlertDialog>
                                        <TooltipProvider><Tooltip><TooltipTrigger asChild>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-500/10 hover:text-red-400"><Trash2 className="h-4 w-4" /></Button>
                                        </TooltipTrigger><TooltipContent><p>Delete</p></TooltipContent></Tooltip></TooltipProvider>
                                        <AlertDialogContent>
                                            <AlertDialogHeader><AlertDialogTitle>Delete Squad "{squad.name}"?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteSquad(squad.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                // Improved Empty State Card
                <Card className="glass-card rounded-2xl shadow-xl border-border/20 mt-8">
                    <CardContent className="text-center p-8 md:p-12 space-y-4">
                        <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                        <h3 className="text-xl font-semibold text-white">No Squads Yet for {gameVersion}</h3>
                        <p className="text-muted-foreground text-sm">Create your first squad to get started.</p>
                        <div className="mt-6">
                            <Button onClick={handleAddNewSquad}>
                                <Plus className="h-4 w-4 mr-2" />Create First Squad
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default Squads;
