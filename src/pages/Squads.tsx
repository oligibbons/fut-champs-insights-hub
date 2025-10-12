import { useState } from 'react';
import { useSquadData } from '@/hooks/useSquadData';
import { Squad, CardType, PlayerCard, FORMATIONS } from '@/types/squads';
import SquadBuilder from '@/components/SquadBuilder';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Plus, Trash2, Edit, Star, Users, Shield, Copy } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/useTheme';
import { useGameVersion } from '@/contexts/GameVersionContext';
import { cn } from '@/lib/utils';

// --- NEW SquadVisual Component ---
const SquadVisual = ({ squad, cardTypes }: { squad: Squad, cardTypes: CardType[] }) => {
    const { currentTheme } = useTheme();
    const formation = FORMATIONS.find(f => f.name === squad.formation);

    const getCardStyle = (player: PlayerCard) => {
        const cardType = cardTypes.find(ct => ct.id === player.card_type);
        if (cardType) {
            return {
                background: `linear-gradient(135deg, ${cardType.primary_color}, ${cardType.secondary_color || cardType.primary_color})`,
                color: cardType.highlight_color,
                borderColor: cardType.secondary_color || 'transparent',
            };
        }
        return { background: '#555', color: '#FFF', borderColor: '#888' };
    };

    if (!formation || !squad.squad_players || squad.squad_players.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Users className="h-12 w-12" />
                <p className="mt-2 text-sm">Empty Squad</p>
            </div>
        );
    }

    const startingXI = formation.positions.map(pos => {
        const playerSlot = squad.squad_players.find(sp => sp.slot_id === pos.id);
        return { ...pos, player: playerSlot?.players };
    });

    return (
        <div className="w-full h-full bg-cover bg-center rounded-lg relative" style={{ backgroundImage: "url('/pitch-horizontal.svg')" }}>
            {startingXI.map(({ id, x, y, position, player }) => (
                <div
                    key={id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{ top: `${y}%`, left: `${x}%`, width: '13%', maxWidth: '55px' }}
                >
                    {player ? (
                        <div className="relative group">
                            <div className={cn("aspect-[3/4] rounded-md flex flex-col items-center justify-center font-bold shadow-lg border", player.is_evolution && "border-teal-400")} style={getCardStyle(player)}>
                                <span className="text-sm font-black">{player.rating}</span>
                                <span className="text-[10px] -mt-1">{position}</span>
                            </div>
                            <p className="text-white text-[8px] font-semibold text-center truncate bg-black/50 rounded-b-md px-1 absolute bottom-0 w-full">{player.name.split(' ').pop()}</p>
                        </div>
                    ) : (
                        <div className="aspect-[3/4] rounded-md flex flex-col items-center justify-center bg-black/40 border-2 border-dashed border-white/20">
                            <span className="text-white text-[9px] font-bold">{position}</span>
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

  const { squads, createSquad, updateSquad, deleteSquad, duplicateSquad, cardTypes, loading } = useSquadData();

  const [isBuilding, setIsBuilding] = useState(false);
  const [editingSquad, setEditingSquad] = useState<Squad | null>(null);

  const handleAddNewSquad = () => {
    setEditingSquad(null);
    setIsBuilding(true);
  };

  const handleEditSquad = (squad: Squad) => {
    setEditingSquad(squad);
    setIsBuilding(true);
  };

  const handleDuplicateSquad = async (squadId: string) => {
    await duplicateSquad(squadId);
    toast({ title: "Squad Duplicated", description: "A copy of the squad has been created." });
  };

  const handleSaveSquad = async (squadData: any) => {
    if (editingSquad) {
      await updateSquad(editingSquad.id, squadData);
    } else {
      await createSquad(squadData);
    }
    setIsBuilding(false);
    setEditingSquad(null);
  };

  const handleDeleteSquad = async (squadId: string) => {
    await deleteSquad(squadId);
    toast({ title: "Squad Deleted" });
  };

  const handleSetDefault = async (squadId: string) => {
    const currentDefault = squads.find(s => s.is_default);
    if (currentDefault && currentDefault.id !== squadId) {
      await updateSquad(currentDefault.id, { is_default: false });
    }
    await updateSquad(squadId, { is_default: true });
    toast({ title: "Default Squad Updated" });
  };

  if (loading) {
      return <div className="flex items-center justify-center h-64">Loading your squads...</div>;
  }

  if (isBuilding) {
    return (
        <SquadBuilder
          squad={editingSquad || undefined}
          onSave={handleSaveSquad}
          onCancel={() => setIsBuilding(false)}
        />
    );
  }

  return (
    <div className="animate-fade-in">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
            <h1 className="text-4xl font-bold tracking-tighter" style={{color: currentTheme.colors.primary}}>My Squads</h1>
            <p className="text-muted-foreground mt-1">Manage your squads for different game versions.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2 rounded-full p-1 w-full sm:w-auto" style={{backgroundColor: currentTheme.colors.card, borderColor: currentTheme.colors.border, borderWidth: 1}}>
            {['FC25', 'FC26'].map(version => (
              <Button
                key={version}
                size="sm"
                onClick={() => setGameVersion(version as 'FC25' | 'FC26')}
                className={`rounded-full transition-all duration-300 flex-1 ${gameVersion === version ? 'text-white' : 'text-muted-foreground'}`}
                style={{backgroundColor: gameVersion === version ? currentTheme.colors.primary : 'transparent'}}
              >
                {version}
              </Button>
            ))}
          </div>
          <Button onClick={handleAddNewSquad} className="modern-button-primary w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Create New Squad
          </Button>
        </div>
      </header>
      
      {squads.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {squads.map((squad) => (
            <div key={squad.id}>
              <Card
                style={{ backgroundColor: currentTheme.colors.card, borderColor: squad.is_default ? currentTheme.colors.primary : currentTheme.colors.border, '--tw-ring-color': currentTheme.colors.primary }}
                className={`rounded-3xl shadow-lg border group transition-all duration-300 ${squad.is_default ? 'ring-2 ring-offset-2 ring-offset-background' : ''}`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl font-bold tracking-tight" style={{color: currentTheme.colors.foreground}}>{squad.name}</CardTitle>
                      <p className="text-sm" style={{color: currentTheme.colors.mutedForeground}}>{squad.formation}</p>
                    </div>
                    {squad.is_default && (
                      <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full" style={{backgroundColor: currentTheme.colors.primary, color: currentTheme.colors.primaryForeground}}>
                        <Shield size={14} />Default
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="aspect-video rounded-xl mb-4 overflow-hidden relative flex items-center justify-center border" style={{backgroundColor: 'rgba(0,0,0,0.2)', borderColor: currentTheme.colors.border}}>
                    <SquadVisual squad={squad} cardTypes={cardTypes} />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div><p className="font-bold text-lg" style={{color: currentTheme.colors.foreground}}>{squad.games_played || 0}</p><p style={{color: currentTheme.colors.mutedForeground}}>Played</p></div>
                    <div><p className="font-bold text-lg" style={{color: 'hsl(var(--primary-green))'}}>{squad.wins || 0}</p><p style={{color: currentTheme.colors.mutedForeground}}>Wins</p></div>
                    <div><p className="font-bold text-lg" style={{color: 'hsl(var(--primary-red))'}}>{squad.losses || 0}</p><p style={{color: currentTheme.colors.mutedForeground}}>Losses</p></div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between p-4 bg-black/20 rounded-b-3xl">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleSetDefault(squad.id)} disabled={squad.is_default} className="modern-button-secondary">
                      <Star className={`h-4 w-4 mr-2 ${squad.is_default ? 'text-yellow-400 fill-yellow-400' : ''}`} />
                      {squad.is_default ? 'Default' : 'Set Default'}
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => handleDuplicateSquad(squad.id)} className="hover:bg-white/20"><Copy className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => handleEditSquad(squad)} className="hover:bg-white/20"><Edit className="h-4 w-4" /></Button>
                    <AlertDialog><AlertDialogTrigger asChild><Button size="icon" variant="ghost" className="text-red-500 hover:bg-red-500/20 hover:text-red-400"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
          _             <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete your squad.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteSquad(squad.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 rounded-xl" style={{backgroundColor: currentTheme.colors.card}}>
          <Users className="mx-auto h-12 w-12" style={{color: currentTheme.colors.mutedForeground}} />
          <h3 className="mt-4 text-lg font-semibold" style={{color: currentTheme.colors.foreground}}>No Squads Yet for {gameVersion}</h3>
          <p className="mt-1 text-sm" style={{color: currentTheme.colors.mutedForeground}}>Get started by creating a new squad.</p>
          <div className="mt-6"><Button onClick={handleAddNewSquad} className="modern-button-primary"><Plus className="h-4 w-4 mr-2" />Create First Squad</Button></div>
        </div>
      )}
    </div>
  );
};

export default Squads;
