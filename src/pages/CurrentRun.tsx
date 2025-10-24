import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Game, PlayerPerformanceInsert } from '@/types/futChampions';
import GameRecordForm from '@/components/GameRecordForm';
import GameListItem from '@/components/GameListItem'; // We'll modify this slightly below if needed, or wrap it
import RunNamingModal from '@/components/RunNamingModal';
import WeekProgress from '@/components/WeekProgress';
import CurrentRunStats from '@/components/CurrentRunStats';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useMobile } from '@/hooks/use-mobile'; // <-- Import useMobile

// Import dnd-kit components
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    TouchSensor, // Import TouchSensor
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable, // Import useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Wrapper component to make GameListItem sortable
const SortableGameListItem = ({ game, onEdit, onDelete }: { game: Game; onEdit: (game: Game) => void; onDelete: (id: string) => void }) => {
    const isMobile = useMobile();
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: game.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1, // Optional: visual feedback while dragging
    };

    return (
        <div ref={setNodeRef} style={style}>
            <GameListItem
                game={game}
                onEdit={onEdit}
                onDelete={onDelete}
                 // Pass down attributes and listeners, conditionally disabling listeners on mobile
                dragHandleProps={isMobile ? undefined : { ...attributes, ...listeners }}
            />
        </div>
    );
};


const CurrentRun = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const { currentTheme } = useTheme();
    const isMobile = useMobile(); // Use hook at the top level if needed elsewhere, otherwise SortableGameListItem handles it
    const [games, setGames] = useState<Game[]>([]);
    const [currentRun, setCurrentRun] = useState<{ id: string; name: string | null } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingGame, setEditingGame] = useState<Game | null>(null);
    const [isNamingModalOpen, setIsNamingModalOpen] = useState(false);

     // Setup sensors - conditionally include TouchSensor
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
        // Only include TouchSensor if NOT on mobile, preventing scroll conflicts
        ...(isMobile ? [] : [useSensor(TouchSensor)])
    );

    useEffect(() => {
        fetchCurrentRunAndGames();
    }, [user]);

    // fetchCurrentRunAndGames, startNewRun, handleGameSubmit, handleDeleteGame, handleEditGame, handleCancelForm, handleNameUpdate remain mostly the same
    // Ensure handleGameSubmit and handleDeleteGame handle game_number updates correctly if order matters beyond display

     const fetchCurrentRunAndGames = async () => {
        if (!user) return;
        setLoading(true);
        setError(null);

        try {
            const { data: runData, error: runError } = await supabase
                .from('runs')
                .select('id, name')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (runError && runError.code !== 'PGRST116') {
                throw runError;
            }

            if (runData) {
                setCurrentRun(runData);
                const { data: gamesData, error: gamesError } = await supabase
                    .from('games')
                    .select('*, player_performances(*)')
                    .eq('run_id', runData.id)
                    .order('game_number', { ascending: true }); // Keep ordering

                if (gamesError) throw gamesError;
                setGames(gamesData || []);

            } else {
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
            setShowForm(true);
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
             // Ensure game_number is set correctly if adding a new game
            const nextGameNumber = games.length > 0 ? Math.max(...games.map(g => g.game_number)) + 1 : 1;
             // Use existing game_number if editing, otherwise calculate next or use provided
            const gameNumberToUse = editingGame ? gameData.game_number : (gameData.game_number || nextGameNumber);


            if (editingGame) {
                const { data, error } = await supabase
                    .from('games')
                    .update({ ...gameData, game_number: gameNumberToUse }) // Ensure game_number is updated
                    .eq('id', editingGame.id)
                    .select('*')
                    .single();
                if (error) throw error;
                savedGame = data;
                await supabase.from('player_performances').delete().eq('game_id', editingGame.id);
            } else {
                const dataToInsert = { ...gameData, run_id: currentRun.id, game_number: gameNumberToUse };
                const { data, error } = await supabase
                    .from('games')
                    .insert(dataToInsert)
                    .select('*')
                    .single();
                if (error) throw error;
                savedGame = data;
            }

            if (savedGame) {
                const performancesToInsert = playerPerformances.map(p => ({
                    ...p,
                    game_id: savedGame!.id,
                    run_id: currentRun.id,
                    user_id: user.id
                }));
                const { error: perfError } = await supabase
                    .from('player_performances')
                    .insert(performancesToInsert);
                if (perfError) throw perfError;
                 // Add game_id to performances locally for immediate display if needed (or rely on fetch)
                // savedGame.player_performances = performancesToInsert.map(p => ({ ...p, id: 'temp-' + Math.random() }));
            }


            toast({ title: "Success", description: `Game ${editingGame ? 'updated' : 'recorded'} successfully!` });
            setShowForm(false);
            setEditingGame(null);
            fetchCurrentRunAndGames(); // Re-fetch to update the list with correct data

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
            // Get the game number before deleting
            const gameToDelete = games.find(g => g.id === gameId);
            if (!gameToDelete) throw new Error("Game not found");
            const deletedGameNumber = gameToDelete.game_number;


            const { error: perfError } = await supabase
                .from('player_performances')
                .delete()
                .eq('game_id', gameId);
            if (perfError) throw perfError;

            const { error: gameError } = await supabase
                .from('games')
                .delete()
                .eq('id', gameId);
            if (gameError) throw gameError;

             // Update game numbers for subsequent games
            const updates = games
                .filter(g => g.game_number > deletedGameNumber)
                .map(g => ({ id: g.id, game_number: g.game_number - 1 }));

            if (updates.length > 0) {
                const { error: updateError } = await supabase.from('games').upsert(updates);
                if (updateError) console.error("Error updating subsequent game numbers:", updateError); // Log error but don't block
            }


            toast({ title: "Success", description: "Game deleted successfully." });
            // Re-fetch to get the updated list with correct game numbers
            fetchCurrentRunAndGames();

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


     // dnd-kit drag end handler
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = games.findIndex((game) => game.id === active.id);
            const newIndex = games.findIndex((game) => game.id === over.id);

            const reorderedGames = arrayMove(games, oldIndex, newIndex);

             // Update local state immediately
            setGames(reorderedGames);

            // Update game_number based on new order and save to DB
            const updates = reorderedGames.map((game, index) => ({
                id: game.id,
                game_number: index + 1, // Recalculate game number based on index
            }));


            try {
                const { error: updateError } = await supabase.from('games').upsert(updates);
                if (updateError) throw updateError;
                toast({ title: "Success", description: "Game order updated." });
                // Re-fetch needed to ensure player_performances are associated correctly if IDs changed (unlikely here)
                // fetchCurrentRunAndGames();
            } catch (err: any) {
                setError(`Failed to update game order: ${err.message}`);
                toast({ title: "Error", description: `Failed to update game order: ${err.message}`, variant: "destructive" });
                // Revert local state if DB update fails by fetching again
                fetchCurrentRunAndGames();
            }
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


    if (loading && !currentRun) {
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

                     {/* dnd-kit Context */}
                     <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={games.map(g => g.id)} // Use game IDs for items
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-4">
                                {games.map((game) => (
                                    <SortableGameListItem
                                        key={game.id}
                                        game={game}
                                        onEdit={handleEditGame}
                                        onDelete={handleDeleteGame}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </>
            )}
        </div>
    );
};

export default CurrentRun;
