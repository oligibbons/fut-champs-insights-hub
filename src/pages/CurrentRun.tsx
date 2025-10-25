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
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trophy, Loader2 } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useMobile } from '@/hooks/use-mobile';
import { Card, CardContent } from '@/components/ui/card';
import { useGameVersion } from '@/contexts/GameVersionContext'; // <-- FIX: Import game version context
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Wrapper component (no changes)
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
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <GameListItem
                game={game}
                onEdit={onEdit}
                onDelete={onDelete}
                dragHandleProps={isMobile ? undefined : { ...attributes, ...listeners }}
            />
        </div>
    );
};


const CurrentRun = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const { currentTheme } = useTheme();
    const isMobile = useMobile();
    const { gameVersion } = useGameVersion(); // <-- FIX: Get current game version
    const [games, setGames] = useState<Game[]>([]);
    const [currentRun, setCurrentRun] = useState<{ id: string; name: string | null } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingGame, setEditingGame] = useState<Game | null>(null);
    const [isNamingModalOpen, setIsNamingModalOpen] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
        ...(isMobile ? [] : [useSensor(TouchSensor)])
    );

    useEffect(() => {
        if (user && gameVersion) { // <-- FIX: Wait for gameVersion
            fetchCurrentRunAndGames();
        }
    }, [user, gameVersion]); // <-- FIX: Add gameVersion to dependency array

    const fetchCurrentRunAndGames = async () => {
        if (!user || !gameVersion) return; // <-- FIX: Guard
        setLoading(true);
        setError(null);

        try {
            // --- FIX: Query 'weekly_performances' instead of 'runs' ---
            // --- Also filter by is_completed = false and game_version ---
            const { data: runData, error: runError } = await supabase
                .from('weekly_performances')
                .select('id, custom_name') // <-- FIX: Select 'custom_name'
                .eq('user_id', user.id)
                .eq('is_completed', false) // <-- FIX: Only get the active run
                .eq('game_version', gameVersion) // <-- FIX: Filter by game version
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (runError && runError.code !== 'PGRST116') { // PGRST116 = no rows found
                throw runError;
            }

            if (runData) {
                // <-- FIX: Map 'custom_name' to 'name' for the state ---
                setCurrentRun({ id: runData.id, name: runData.custom_name });

                // --- FIX: Query 'game_results' instead of 'games' ---
                const { data: gamesData, error: gamesError } = await supabase
                    .from('game_results')
                    .select('*, player_performances(*)')
                    .eq('week_id', runData.id) // <-- FIX: Filter by 'week_id'
                    .order('game_number', { ascending: true });

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
        if (!user || !gameVersion) return;
        setLoading(true);
        try {
            // --- FIX: Need to get the next week_number ---
            const { data: latestWeek, error: latestWeekError } = await supabase
                .from('weekly_performances')
                .select('week_number')
                .eq('user_id', user.id)
                .eq('game_version', gameVersion)
                .order('week_number', { ascending: false })
                .limit(1)
                .single();
            
            if (latestWeekError && latestWeekError.code !== 'PGRST116') {
                throw latestWeekError;
            }
            
            const nextWeekNumber = latestWeek ? latestWeek.week_number + 1 : 1;
            
            // --- FIX: Insert into 'weekly_performances' with all required fields ---
            const { data, error } = await supabase
                .from('weekly_performances')
                .insert({ 
                    user_id: user.id,
                    start_date: new Date().toISOString(),
                    week_number: nextWeekNumber,
                    game_version: gameVersion 
                })
                .select('id, custom_name') // <-- FIX: Select 'custom_name'
                .single();

            if (error) throw error;

            // <-- FIX: Map 'custom_name' to 'name' for state
            setCurrentRun({ id: data.id, name: data.custom_name });
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
        gameData: Omit<Game, 'id' | 'created_at' | 'run_id' | 'week_id'>, // <-- FIX: Adjusted type
        playerPerformances: PlayerPerformanceInsert[]
    ) => {
        if (!user || !currentRun) return;

        setLoading(true);
        try {
            let savedGame: Game | null = null;
            const nextGameNumber = games.length > 0 ? Math.max(...games.map(g => g.game_number)) + 1 : 1;
            const gameNumberToUse = editingGame ? gameData.game_number : (gameData.game_number || nextGameNumber);


            if (editingGame) {
                // --- FIX: Update 'game_results' ---
                const { data, error } = await supabase
                    .from('game_results')
                    .update({ ...gameData, game_number: gameNumberToUse })
                    .eq('id', editingGame.id)
                    .select('*')
                    .single();
                if (error) throw error;
                savedGame = data;
                await supabase.from('player_performances').delete().eq('game_id', editingGame.id);
            } else {
                // --- FIX: Insert into 'game_results' with 'week_id' ---
                const dataToInsert = { ...gameData, week_id: currentRun.id, game_number: gameNumberToUse };
                const { data, error } = await supabase
                    .from('game_results')
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
                    user_id: user.id
                    // --- FIX: Removed 'run_id' as it's not in the 'player_performances' table ---
                }));
                const { error: perfError } = await supabase
                    .from('player_performances')
                    .insert(performancesToInsert);
                if (perfError) throw perfError;
            }

            toast({ title: "Success", description: `Game ${editingGame ? 'updated' : 'recorded'} successfully!` });
            setShowForm(false);
            setEditingGame(null);
            fetchCurrentRunAndGames(); // Re-fetch

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
            const gameToDelete = games.find(g => g.id === gameId);
            if (!gameToDelete) throw new Error("Game not found");
            const deletedGameNumber = gameToDelete.game_number;

            const { error: perfError } = await supabase
                .from('player_performances')
                .delete()
                .eq('game_id', gameId);
            if (perfError) throw perfError;

            // --- FIX: Delete from 'game_results' ---
            const { error: gameError } = await supabase
                .from('game_results')
                .delete()
                .eq('id', gameId);
            if (gameError) throw gameError;

            const updates = games
                .filter(g => g.game_number > deletedGameNumber)
                .map(g => ({ id: g.id, game_number: g.game_number - 1 }));

            if (updates.length > 0) {
                // --- FIX: Upsert to 'game_results' ---
                const { error: updateError } = await supabase.from('game_results').upsert(updates);
                if (updateError) console.error("Error updating subsequent game numbers:", updateError);
            }

            toast({ title: "Success", description: "Game deleted successfully." });
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

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = games.findIndex((game) => game.id === active.id);
            const newIndex = games.findIndex((game) => game.id === over.id);
            const reorderedGames = arrayMove(games, oldIndex, newIndex);
            
            setGames(reorderedGames); // Update local state immediately

            const updates = reorderedGames.map((game, index) => ({
                id: game.id,
                game_number: index + 1,
            }));

            try {
                // --- FIX: Upsert to 'game_results' ---
                const { error: updateError } = await supabase.from('game_results').upsert(updates);
                if (updateError) throw updateError;
                toast({ title: "Success", description: "Game order updated." });
            } catch (err: any) {
                setError(`Failed to update game order: ${err.message}`);
                toast({ title: "Error", description: `Failed to update game order: ${err.message}`, variant: "destructive" });
                fetchCurrentRunAndGames(); // Revert local state
            }
        }
    };

    const handleNameUpdate = async (newName: string) => {
        if (!currentRun) return;
        try {
            // --- FIX: Update 'weekly_performances' and 'custom_name' ---
            const { error } = await supabase
                .from('weekly_performances')
                .update({ custom_name: newName }) // <-- FIX: 'custom_name'
                .eq('id', currentRun.id);
            if (error) throw error;
            setCurrentRun(prev => prev ? { ...prev, name: newName } : null);
            toast({ title: "Success", description: "Run name updated." });
            setIsNamingModalOpen(false);
        } catch (err: any) {
            toast({ title: "Error", description: `Failed to update run name: ${err.message}`, variant: "destructive" });
        }
    };

    // --- No changes to JSX rendering below, it all relies on the 'currentRun' and 'games' state ---
    // --- which we have correctly populated. ---

    if (loading && !currentRun) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" style={{ color: currentTheme.colors.primary }} />
                <p className="ml-4 text-gray-400">Loading your run data...</p>
            </div>
        );
    }

    if (error) {
        return <div className="text-center p-10 text-destructive">{error}</div>;
    }

    return (
        <div className="space-y-6">
            {!currentRun ? (
                <Card className="glass-card rounded-2xl shadow-2xl border-0">
                    <CardContent className="text-center p-10 space-y-4">
                        <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-400 opacity-50" />
                        <h2 className="text-2xl font-semibold text-white">No Active Run</h2>
                        <p className="text-gray-400">Ready to start tracking your FUT Champions progress?</p>
                        <Button onClick={startNewRun} disabled={loading} style={{ backgroundColor: currentTheme.colors.primary, color: currentTheme.colors.primaryText}}>
                            Start New Run
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold text-white">{currentRun.name || "Current FUT Champions Run"}</h1>
                            <Button variant="ghost" size="icon" onClick={() => setIsNamingModalOpen(true)}>
                                <Edit className="h-4 w-4 text-gray-400 hover:text-white" />
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
                        <Card className="glass-card rounded-2xl shadow-2xl border-0">
                            <CardContent className="p-4 md:p-6">
                                <GameRecordForm
                                    onSubmit={handleGameSubmit}
                                    isLoading={loading}
                                    game={editingGame ?? undefined}
                                    runId={currentRun.id} // This is fine, GameRecordForm probably just needs *an* ID
                                    onCancel={handleCancelForm}
                                    gameVersion={gameVersion} // <-- FIX: Pass gameVersion down
                                />
                            </CardContent>
                        </Card>
                    )}

                    <Card className="glass-card rounded-2xl shadow-2xl border-0">
                        <CardContent className="p-4 md:p-6">
                            <CurrentRunStats games={games} />
                        </CardContent>
                    </Card>

                    <Card className="glass-card rounded-2xl shadow-2xl border-0">
                        <CardContent className="p-4 md:p-6">
                            <WeekProgress games={games} />
                        </CardContent>
                    </Card>

                    <Card className="glass-card rounded-2xl shadow-2xl border-0">
                        <CardContent className="p-4 md:p-6">
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={games.map(g => g.id)}
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
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
};

export default CurrentRun;
