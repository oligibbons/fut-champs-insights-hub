import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Squad } from '@/types/squads';
import SquadBuilder from '@/components/SquadBuilder';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Plus, Trash2, Edit, Star, Users, Shield } from 'lucide-react';
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
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/useTheme';
import { useGameVersion } from '@/contexts/GameVersionContext'; // CORRECT: Use the global context
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';

const Squads = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { currentTheme } = useTheme();
  const { gameVersion, setGameVersion } = useGameVersion(); // CORRECT: Use global state

  const [squads, setSquads] = useState<Squad[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [editingSquad, setEditingSquad] = useState<Squad | null>(null);
  const [loading, setLoading] = useState(true);

  // CORRECT: Fetch data directly from Supabase, filtered by the global gameVersion
  useEffect(() => {
    const fetchSquads = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from('squads')
        .select('*')
        .eq('user_id', user.id)
        .eq('game_version', gameVersion) // Filter by the context's game version
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching squads:', error);
        toast({ title: "Error", description: "Could not fetch your squads.", variant: "destructive" });
      } else {
        setSquads(data as Squad[] || []);
      }
      setLoading(false);
    };

    fetchSquads();
  }, [user, gameVersion, toast]); // Re-fetches whenever the global gameVersion changes

  const handleAddNewSquad = () => {
    setEditingSquad(null);
    setIsBuilding(true);
  };

  const handleEditSquad = (squad: Squad) => {
    setEditingSquad(squad);
    setIsBuilding(true);
  };

  const handleSaveSquad = async (squadData: Squad) => {
     if (!user) return;
    const isUpdating = squads.some(s => s.id === squadData.id);

    const dataToSave = {
        ...squadData,
        user_id: user.id,
        game_version: gameVersion,
        updated_at: new Date().toISOString()
    };
    
    const { error } = isUpdating
        ? await supabase.from('squads').update(dataToSave).eq('id', squadData.id)
        : await supabase.from('squads').insert(dataToSave);

    if (error) {
      toast({ title: "Error saving squad.", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Squad ${isUpdating ? 'Updated' : 'Created'}` });
      const { data } = await supabase.from('squads').select('*').eq('user_id', user.id).eq('game_version', gameVersion).order('created_at', { ascending: false });
      setSquads(data as Squad[] || []);
    }

    setIsBuilding(false);
    setEditingSquad(null);
  };

  const handleDeleteSquad = async (squadId: string) => {
    const { error } = await supabase.from('squads').delete().eq('id', squadId);
    if (error) {
        toast({ title: "Error deleting squad.", description: error.message, variant: "destructive"});
    } else {
        setSquads(squads.filter(s => s.id !== squadId));
        toast({ title: "Squad Deleted" });
    }
  };
  
  const handleSetDefault = async (squadId: string) => {
    if(!user) return;
    // Set all other squads for this game version to not be default
    await supabase.from('squads').update({ is_default: false }).eq('user_id', user.id).eq('game_version', gameVersion);
    // Set the selected one as default
    await supabase.from('squads').update({ is_default: true }).eq('id', squadId);
    // Update local state to reflect change
    setSquads(squads.map(s => ({...s, isDefault: s.id === squadId})));
    toast({ title: "Default Squad Updated" });
  };

  if (isBuilding) {
    return (
        <SquadBuilder
          squad={editingSquad || undefined}
          gameVersion={gameVersion} // CORRECT: Pass the global game version down
          onSave={handleSaveSquad}
          onCancel={() => setIsBuilding(false)}
        />
    );
  }

  return (
    <div className="animate-fade-in">
      <header className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-4xl font-bold tracking-tighter" style={{color: currentTheme.colors.primary}}>My Squads</h1>
            <p className="text-muted-foreground mt-1">Manage your squads for different game versions.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full p-1" style={{backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border, borderWidth: 1}}>
            {['FC25', 'FC26'].map(version => ( // CORRECT: Shows FC26
              <Button
                key={version}
                size="sm"
                onClick={() => setGameVersion(version as 'FC25' | 'FC26')}
                className={`rounded-full transition-all duration-300 ${gameVersion === version ? 'text-white' : 'text-muted-foreground'}`}
                style={{backgroundColor: gameVersion === version ? currentTheme.colors.primary : 'transparent'}}
              >
                {version}
              </Button>
            ))}
          </div>
          <Button onClick={handleAddNewSquad} className="modern-button-primary">
            <Plus className="h-4 w-4 mr-2" />
            Create New Squad
          </Button>
        </div>
      </header>
      
      {squads.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {squads.map((squad) => (
            <div key={squad.id}>
              <Card
                style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: squad.isDefault ? currentTheme.colors.primary : currentTheme.colors.border, '--tw-ring-color': currentTheme.colors.primary }}
                className={`rounded-3xl shadow-depth-lg border-2 group transition-all duration-300 ${squad.isDefault ? 'ring-2 ring-offset-2 ring-offset-background' : ''}`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl font-bold tracking-tight" style={{color: currentTheme.colors.heading}}>{squad.name}</CardTitle>
                      <p className="text-sm" style={{color: currentTheme.colors.textSecondary}}>{squad.formation}</p>
                    </div>
                    {squad.isDefault && (
                      <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full" style={{backgroundColor: currentTheme.colors.primary, color: currentTheme.colors.primaryContrast}}>
                        <Shield size={14} />Default
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="aspect-video rounded-xl mb-4 overflow-hidden relative flex items-center justify-center" style={{backgroundColor: currentTheme.colors.background}}>
                    <Users className="h-16 w-16" style={{color: currentTheme.colors.textSecondary}}/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div><p className="font-bold text-lg" style={{color: currentTheme.colors.text}}>{squad.gamesPlayed}</p><p style={{color: currentTheme.colors.textSecondary}}>Played</p></div>
                    <div><p className="font-bold text-lg" style={{color: 'hsl(var(--primary-green))'}}>{squad.wins}</p><p style={{color: currentTheme.colors.textSecondary}}>Wins</p></div>
                    <div><p className="font-bold text-lg" style={{color: 'hsl(var(--primary-red))'}}>{squad.losses}</p><p style={{color: currentTheme.colors.textSecondary}}>Losses</p></div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between p-4 bg-black/20 rounded-b-3xl">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleSetDefault(squad.id)} disabled={squad.isDefault} className="modern-button-secondary">
                      <Star className={`h-4 w-4 mr-2 ${squad.isDefault ? 'text-yellow-400 fill-yellow-400' : ''}`} />
                      {squad.isDefault ? 'Default' : 'Set Default'}
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => handleEditSquad(squad)} className="hover:bg-white/20"><Edit className="h-4 w-4" /></Button>
                    <AlertDialog><AlertDialogTrigger asChild><Button size="icon" variant="ghost" className="text-red-500 hover:bg-red-500/20 hover:text-red-400"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                      <AlertDialogContent>
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
        <div className="text-center py-16 rounded-xl" style={{backgroundColor: currentTheme.colors.cardBg}}>
          <Users className="mx-auto h-12 w-12" style={{color: currentTheme.colors.textSecondary}} />
          <h3 className="mt-4 text-lg font-semibold" style={{color: currentTheme.colors.heading}}>No Squads Yet for {gameVersion}</h3>
          <p className="mt-1 text-sm" style={{color: currentTheme.colors.textSecondary}}>Get started by creating a new squad.</p>
          <div className="mt-6"><Button onClick={handleAddNewSquad} className="modern-button-primary"><Plus className="h-4 w-4 mr-2" />Create First Squad</Button></div>
        </div>
      )}
    </div>
  );
};

export default Squads;
