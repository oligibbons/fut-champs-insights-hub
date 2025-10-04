import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSquadData } from '@/hooks/useSquadData';
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
// import { DndProvider } from 'react-dnd';
// import { HTML5Backend } from 'react-dnd-html5-backend';
// import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';

const Squads = () => {
  const { user } = useAuth();
  const { squads, saveSquad, deleteSquad, setSquadAsDefault } = useSquadData();
  const [isBuilding, setIsBuilding] = useState(false);
  const [editingSquad, setEditingSquad] = useState<Squad | null>(null);
  const [selectedGameVersion, setSelectedGameVersion] = useState('FC25');
  const { toast } = useToast();
  const { currentTheme } = useTheme();

  const handleAddNewSquad = () => {
    setEditingSquad(null);
    setIsBuilding(true);
  };

  const handleEditSquad = (squad: Squad) => {
    setEditingSquad(squad);
    setIsBuilding(true);
  };

  const handleSaveSquad = (squad: Squad) => {
    saveSquad(squad);
    setIsBuilding(false);
    setEditingSquad(null);
  };

  const handleDeleteSquad = (squadId: string) => {
    deleteSquad(squadId);
    toast({
      title: "Squad Deleted",
      description: "The squad has been successfully deleted.",
    });
  };
  
  const handleSetDefault = (squadId: string) => {
    setSquadAsDefault(squadId);
    toast({
      title: "Default Squad Updated",
      description: "This is now your default squad for analytics.",
    });
  };

  if (isBuilding) {
    return (
      // <DndProvider backend={HTML5Backend}>
        <SquadBuilder
          squad={editingSquad || undefined}
          gameVersion={selectedGameVersion}
          onSave={handleSaveSquad}
          onCancel={() => setIsBuilding(false)}
        />
      // </DndProvider>
    );
  }

  const filteredSquads = squads.filter(squad => squad.game_version === selectedGameVersion);

  return (
    <div className="animate-fade-in">
      <header className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-4xl font-bold tracking-tighter" style={{color: currentTheme.colors.primary}}>My Squads</h1>
            <p className="text-muted-foreground mt-1">Manage your squads for different game versions.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full p-1" style={{backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border, borderWidth: 1}}>
            {['FC25', 'FC24'].map(version => (
              <Button
                key={version}
                size="sm"
                onClick={() => setSelectedGameVersion(version)}
                className={`rounded-full transition-all duration-300 ${selectedGameVersion === version ? 'text-white' : 'text-muted-foreground'}`}
                style={{backgroundColor: selectedGameVersion === version ? currentTheme.colors.primary : 'transparent'}}
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
      
      {/* <AnimatePresence> */}
        {filteredSquads.length > 0 ? (
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            // initial={{ opacity: 0 }}
            // animate={{ opacity: 1 }}
            // exit={{ opacity: 0 }}
          >
            {filteredSquads.map((squad) => (
              <div
                key={squad.id}
                // layout
                // initial={{ opacity: 0, scale: 0.9 }}
                // animate={{ opacity: 1, scale: 1 }}
                // exit={{ opacity: 0, scale: 0.9 }}
                // transition={{ duration: 0.3 }}
              >
                <Card
                  style={{ 
                    backgroundColor: currentTheme.colors.cardBg, 
                    borderColor: squad.isDefault ? currentTheme.colors.primary : currentTheme.colors.border,
                    '--tw-ring-color': currentTheme.colors.primary
                  }}
                  className={`rounded-3xl shadow-depth-lg border-2 group transition-all duration-300 ${squad.isDefault ? 'ring-2 ring-offset-2 ring-offset-background' : ''}`}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl font-bold tracking-tight" style={{color: currentTheme.colors.heading}}>
                          {squad.name}
                        </CardTitle>
                        <p className="text-sm" style={{color: currentTheme.colors.textSecondary}}>{squad.formation}</p>
                      </div>
                      {squad.isDefault && (
                        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full" style={{backgroundColor: currentTheme.colors.primary, color: currentTheme.colors.primaryContrast}}>
                          <Shield size={14} />
                          Default
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
                      <div>
                        <p className="font-bold text-lg" style={{color: currentTheme.colors.text}}>{squad.gamesPlayed}</p>
                        <p style={{color: currentTheme.colors.textSecondary}}>Played</p>
                      </div>
                      <div>
                        <p className="font-bold text-lg" style={{color: 'hsl(var(--primary-green))'}}>{squad.wins}</p>
                        <p style={{color: currentTheme.colors.textSecondary}}>Wins</p>
                      </div>
                      <div>
                        <p className="font-bold text-lg" style={{color: 'hsl(var(--primary-red))'}}>{squad.losses}</p>
                        <p style={{color: currentTheme.colors.textSecondary}}>Losses</p>
                      </div>
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
                      <Button size="icon" variant="ghost" onClick={() => handleEditSquad(squad)} className="hover:bg-white/20">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="text-red-500 hover:bg-red-500/20 hover:text-red-400">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your squad and all its associated data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteSquad(squad.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <div 
            // initial={{ opacity: 0, y: 20 }}
            // animate={{ opacity: 1, y: 0 }}
            // exit={{ opacity: 0, y: -20 }}
            className="text-center py-16 rounded-xl"
            style={{backgroundColor: currentTheme.colors.cardBg}}
          >
            <Users className="mx-auto h-12 w-12" style={{color: currentTheme.colors.textSecondary}} />
            <h3 className="mt-4 text-lg font-semibold" style={{color: currentTheme.colors.heading}}>No Squads Yet</h3>
            <p className="mt-1 text-sm" style={{color: currentTheme.colors.textSecondary}}>
              Get started by creating a new squad for {selectedGameVersion}.
            </p>
            <div className="mt-6">
              <Button onClick={handleAddNewSquad} className="modern-button-primary">
                <Plus className="h-4 w-4 mr-2" />
                Create First Squad
              </Button>
            </div>
          </div>
        )}
      {/* </AnimatePresence> */}
    </div>
  );
};

export default Squads;
