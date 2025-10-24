import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Game, PlayerPerformanceInsert } from '@/types/futChampions';
import GameRecordForm from '@/components/GameRecordForm';
import GameListItem from '@/components/GameListItem';
import RunNamingModal from '@/components/RunNamingModal';
import WeekProgress from '@/components/WeekProgress';
import CurrentRunStats from '@/components/CurrentRunStats';
import { useToast } from '@/hooks/use-toast';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useMobile } from '@/hooks/use-mobile'; // <-- Import useMobile

const CurrentRun = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { currentTheme } = useTheme();
  const isMobile = useMobile(); // <-- Use the hook
  const [games, setGames] = useState<Game[]>([]);
  const [currentRun, setCurrentRun] = useState<{ id: string; name: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [isNamingModalOpen, setIsNamingModalOpen] = useState(false);

  useEffect(() => {
    fetchCurrentRunAndGames();
  }, [user]);

  const fetchCurrentRunAndGames = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      // Find the most recent run for the user
      const { data: runData, error: runError } = await supabase
        .from('runs')
        .select('id, name')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (runError && runError.code !== 'PGRST116') { // PGRST116: No rows found is okay
        throw runError;
      }
      
      if (runData) {
        setCurrentRun(runData);
        // Fetch games associated with this run
        const { data: gamesData, error: gamesError } = await supabase
          .from('games')
          .select('*, player_performances(*)')
          .eq('run_id', runData.id)
          .order('game_number', { ascending: true });

        if (gamesError) throw gamesError;
        setGames(gamesData || []);

      } else {
        // No runs found, create a new one? Or prompt user? For now, just set empty state.
        setCurrentRun(null);
        setGames([]);
      }
    } catch (err: any) {
      setError('Failed to fetch run data: ' + err.message);
      toast({ title: "Error", description: 'Failed to fetch run data: ' + err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const startNewRun = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('runs')
        .insert({ user_id: user.id })
        .select('id, name')
        .single();
      
      if (error) throw error;
      
      setCurrentRun(data);
      setGames([]);
      setShowForm(true); // Show form to add the first game
      toast({ title: "Success", description: "New FUT Champions run started!" });

    } catch (err: any) {
      setError('Failed to start new run: ' + err.message);
      toast({ title: "Error", description: 'Failed to start new run: ' + err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGameSubmit = async (
    gameData: Omit<Game, 'id' | 'created_at' | 'run_id'>, 
    playerPerformances: PlayerPerformanceInsert[]
  ) => {
    if (!user || !currentRun) return;

    setLoading(true);
    try {
      let savedGame: Game | null = null;
      if (editingGame) {
        // Update existing game
        const { data, error } = await supabase
          .from('games')
          .update({ ...gameData })
          .eq('id', editingGame.id)
          .select('*')
          .single();
        if (error) throw error;
        savedGame = data;

        // Delete existing performances and insert new ones
        await supabase.from('player_performances').delete().eq('game_id', editingGame.id);

      } else {
        // Insert new game
        const { data, error } = await supabase
          .from('games')
          .insert({ ...gameData, run_id: currentRun.id })
          .select('*')
          .single();
        if (error) throw error;
        savedGame = data;
      }

      if (savedGame) {
          // Insert player performances
          const performancesToInsert = playerPerformances.map(p => ({
              ...p,
              game_id: savedGame!.id,
              run_id: currentRun.id, // Add run_id here
              user_id: user.id
          }));
          const { error: perfError } = await supabase
              .from('player_performances')
              .insert(performancesToInsert);
          if (perfError) throw perfError;

          // Add game_id to performances locally for immediate display
          const savedPerformances = performancesToInsert.map(p => ({ ...p, id: 'temp-id-' + Math.random() })); // Assign temporary IDs if needed
          savedGame.player_performances = savedPerformances;

      }


      toast({ title: "Success", description: `Game ${editingGame ? 'updated' : 'recorded'} successfully!` });
      setShowForm(false);
      setEditingGame(null);
      fetchCurrentRunAndGames(); // Re-fetch to update the list

    } catch (err: any) {
      setError(`Failed to save game: ${err.message}`);
      toast({ title: "Error", description: `Failed to save game: ${err.message}`, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

   const handleDeleteGame = async (gameId: string) => {
    setLoading(true);
    try {
      // First delete related player performances
      const { error: perfError } = await supabase
        .from('player_performances')
        .delete()
        .eq('game_id', gameId);
      
      if (perfError) throw perfError;

      // Then delete the game itself
      const { error: gameError } = await supabase
        .from('games')
        .delete()
        .eq('id', gameId);

      if (gameError) throw gameError;

      toast({ title: "Success", description: "Game deleted successfully." });
      setGames(prevGames => prevGames.filter(g => g.id !== gameId)); // Update local state
      
    } catch (err: any) {
       setError(`Failed to delete game: ${err.message}`);
       toast({ title: "Error", description: `Failed to delete game: ${err.message}`, variant: "destructive" });
    } finally {
       setLoading(false);
    }
  };


  const handleEditGame = (game: Game) => {
    setEditingGame(game);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingGame(null);
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Ignore if dropped outside the list or in the same position
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    const reorderedGames = Array.from(games);
    const [movedGame] = reorderedGames.splice(source.index, 1);
    reorderedGames.splice(destination.index, 0, movedGame);

    // Update local state immediately for better UX
    setGames(reorderedGames); 

    // Update game_number based on new order and save to DB
    const updates = reorderedGames.map((game, index) => ({
      id: game.id,
      game_number: index + 1,
    }));

    try {
      const { error: updateError } = await supabase.from('games').upsert(updates);
      if (updateError) throw updateError;
      toast({ title: "Success", description: "Game order updated." });
      // Optionally re-fetch to confirm, but local update should be sufficient
      // fetchCurrentRunAndGames(); 
    } catch (err: any) {
      setError(`Failed to update game order: ${err.message}`);
      toast({ title: "Error", description: `Failed to update game order: ${err.message}`, variant: "destructive" });
      // Revert local state if DB update fails
      setGames(games); 
    }
  };

  const handleNameUpdate = async (newName: string) => {
    if (!currentRun) return;
    try {
        const { error } = await supabase
            .from('runs')
            .update({ name: newName })
            .eq('id', currentRun.id);
        if (error) throw error;
        setCurrentRun(prev => prev ? { ...prev, name: newName } : null);
        toast({ title: "Success", description: "Run name updated." });
        setIsNamingModalOpen(false);
    } catch (err: any) {
        toast({ title: "Error", description: `Failed to update run name: ${err.message}`, variant: "destructive" });
    }
  };


  if (loading && !currentRun) { // Show initial loading state only if no run is loaded yet
    return <div className="text-center p-10">Loading your run data...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-destructive">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {!currentRun ? (
        <div className="text-center p-10 space-y-4">
            <h2 className="text-2xl font-semibold">No Active Run</h2>
            <p>Ready to start tracking your FUT Champions progress?</p>
            <Button onClick={startNewRun} disabled={loading} style={{ backgroundColor: currentTheme.colors.primary, color: currentTheme.colors.primaryText}}>
                Start New Run
            </Button>
        </div>
      ) : (
        <>
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold">{currentRun.name || "Current FUT Champions Run"}</h1>
                     <Button variant="ghost" size="icon" onClick={() => setIsNamingModalOpen(true)}>
                        <Edit className="h-4 w-4" />
                     </Button>
                </div>
                 {!showForm && (
                     <Button onClick={() => setShowForm(true)} disabled={loading} style={{ backgroundColor: currentTheme.colors.primary, color: currentTheme.colors.primaryText}}>
                         <PlusCircle className="mr-2 h-4 w-4" /> Add Game
                     </Button>
                 )}
            </div>

            <RunNamingModal
                isOpen={isNamingModalOpen}
                onClose={() => setIsNamingModalOpen(false)}
                currentName={currentRun.name || ''}
                onSave={handleNameUpdate}
            />

            {showForm && (
                <GameRecordForm
                    onSubmit={handleGameSubmit}
                    isLoading={loading}
                    game={editingGame ?? undefined}
                    runId={currentRun.id}
                    onCancel={handleCancelForm}
                />
            )}

          <CurrentRunStats games={games} />
          <WeekProgress games={games} />

          {/* --- Conditionally Render DragDropContext --- */}
          {!isMobile ? (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="gamesList">
                {(provided) => (
                  <div 
                    {...provided.droppableProps} 
                    ref={provided.innerRef} 
                    className="space-y-4"
                  >
                    {games.map((game, index) => (
                      <Draggable key={game.id} draggableId={game.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps} // The drag handle
                          >
                            <GameListItem 
                              game={game} 
                              onEdit={handleEditGame} 
                              onDelete={handleDeleteGame} 
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            // --- Render without Drag-and-Drop on Mobile ---
            <div className="space-y-4">
              {games.map((game) => (
                 <GameListItem 
                    key={game.id} // Use game.id as key here too
                    game={game} 
                    onEdit={handleEditGame} 
                    onDelete={handleDeleteGame} 
                  />
              ))}
            </div>
          )}
          {/* --- End Conditional Rendering --- */}
        </>
      )}
    </div>
  );
};

export default CurrentRun;
