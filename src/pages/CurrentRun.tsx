// src/pages/CurrentRun.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
// Adjusted imports for types
import { Game, PlayerPerformanceInsert, TeamStatisticsInsert } from '@/types/futChampions';
import GameRecordForm from '@/components/GameRecordForm'; // Use the new form
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
import { useGameVersion } from '@/contexts/GameVersionContext';
import {
    DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor,
    useSensor, useSensors, DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove, SortableContext, sortableKeyboardCoordinates,
    verticalListSortingStrategy, useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// SortableGameListItem remains the same
const SortableGameListItem = ({ game, onEdit, onDelete }: { game: Game; onEdit: (gameId: string) => void; onDelete: (id: string) => void }) => {
    const isMobile = useMobile();
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: game.id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
    return (
        <div ref={setNodeRef} style={style}>
            <GameListItem game={game} onEdit={() => onEdit(game.id)} onDelete={onDelete} dragHandleProps={isMobile ? undefined : { ...attributes, ...listeners }}/>
        </div>
    );
};


const CurrentRun = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const { currentTheme } = useTheme();
    const isMobile = useMobile();
    const { gameVersion } = useGameVersion();
    const [games, setGames] = useState<Game[]>([]); // This might need associated team_stats/player_performances for editing
    const [currentRun, setCurrentRun] = useState<{ id: string; name: string | null } | null>(null);
    const [loading, setLoading] = useState(true);
    const [formSubmitting, setFormSubmitting] = useState(false); // Separate loading state for form
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingGame, setEditingGame] = useState<Game | null>(null); // State to hold the full game object for editing
    const [isNamingModalOpen, setIsNamingModalOpen] = useState(false);

    const sensors = useSensors( useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates, }), ...(isMobile ? [] : [useSensor(TouchSensor)]) );

    useEffect(() => {
        if (user && gameVersion) { fetchCurrentRunAndGames(); }
        else { setLoading(false); setCurrentRun(null); setGames([]); } // Clear on user/version change
    }, [user, gameVersion]);

    const fetchCurrentRunAndGames = async () => {
        if (!user || !gameVersion) return;
        setLoading(true); setError(null);
        try {
            const { data: runData, error: runError } = await supabase.from('weekly_performances').select('id, custom_name').eq('user_id', user.id).eq('is_completed', false).eq('game_version', gameVersion).order('created_at', { ascending: false }).limit(1).single();
            if (runError && runError.code !== 'PGRST116') throw runError;

            if (runData) {
                setCurrentRun({ id: runData.id, name: runData.custom_name });
                // Fetch games with related data needed for editing form
                const { data: gamesData, error: gamesError } = await supabase
                    .from('game_results')
                    .select(`*, team_statistics(*), player_performances(*)`) // Fetch related data
                    .eq('week_id', runData.id)
                    .order('game_number', { ascending: true });
                if (gamesError) throw gamesError;

                // Ensure team_statistics is an object, not array, matching the form expectation
                 const processedGames = (gamesData || []).map(g => ({
                    ...g,
                    team_stats: Array.isArray(g.team_statistics) ? g.team_statistics[0] : g.team_statistics // Take first if array
                 }));

                setGames(processedGames);
            } else {
                setCurrentRun(null); setGames([]);
            }
        } catch (err: any) { setError('Failed run fetch: ' + err.message); toast({ title: "Error", description: 'Failed run fetch: ' + err.message, variant: "destructive" }); }
        finally { setLoading(false); }
    };

    const startNewRun = async () => { /* ... (no changes needed here) ... */
        if (!user || !gameVersion) return;
        setLoading(true);
        try {
            const { data: latestWeek, error: latestWeekError } = await supabase.from('weekly_performances').select('week_number').eq('user_id', user.id).eq('game_version', gameVersion).order('week_number', { ascending: false }).limit(1).single();
            if (latestWeekError && latestWeekError.code !== 'PGRST116') throw latestWeekError;
            const nextWeekNumber = latestWeek ? latestWeek.week_number + 1 : 1;
            const { data, error } = await supabase.from('weekly_performances').insert({ user_id: user.id, start_date: new Date().toISOString(), week_number: nextWeekNumber, game_version: gameVersion }).select('id, custom_name').single();
            if (error) throw error;
            setCurrentRun({ id: data.id, name: data.custom_name }); setGames([]); setShowForm(true);
            toast({ title: "Success", description: "New run started!" });
        } catch (err: any) { setError('Failed start run: ' + err.message); toast({ title: "Error", description: 'Failed start run: ' + err.message, variant: "destructive" }); }
        finally { setLoading(false); }
    };

    // --- UPDATED SUBMIT HANDLER ---
    const handleGameSubmit = async (
        gameData: Omit<Game, 'id' | 'created_at' | 'week_id' | 'score_line'>,
        playerPerformances: PlayerPerformanceInsert[],
        teamStats: TeamStatisticsInsert // Add teamStats
    ) => {
        if (!user || !currentRun) return;
        setFormSubmitting(true); // Use separate loading state

        try {
            let savedGameId: string | null = null;
            const scoreLine = `${gameData.user_goals}-${gameData.opponent_goals}`;

            // --- Editing Logic ---
            if (editingGame) {
                // Update game_results
                const { error: gameUpdateError } = await supabase
                    .from('game_results')
                    .update({ ...gameData, score_line: scoreLine })
                    .eq('id', editingGame.id);
                if (gameUpdateError) throw gameUpdateError;
                savedGameId = editingGame.id;

                // Update team_statistics (using upsert in case it didn't exist)
                if (Object.keys(teamStats).length > 0) { // Only update if stats weren't skipped
                    const { error: teamStatsUpsertError } = await supabase
                        .from('team_statistics')
                        .upsert({ ...teamStats, game_id: savedGameId, user_id: user.id }, { onConflict: 'game_id' }); // Upsert based on game_id
                     if (teamStatsUpsertError) console.warn("Error upserting team stats:", teamStatsUpsertError.message); // Log warning but continue
                }

                // Delete old player_performances and insert new ones
                await supabase.from('player_performances').delete().eq('game_id', savedGameId);
                if (playerPerformances.length > 0) {
                     const performancesToInsert = playerPerformances.map(p => ({
                        ...p, game_id: savedGameId, user_id: user.id
                     }));
                     const { error: perfInsertError } = await supabase.from('player_performances').insert(performancesToInsert);
                     if (perfInsertError) throw perfInsertError; // Throw if player stats fail
                }

            // --- Inserting Logic ---
            } else {
                 const nextGameNum = games.length > 0 ? Math.max(...games.map(g => g.game_number)) + 1 : 1;
                // Insert into game_results
                const { data: newGame, error: gameInsertError } = await supabase
                    .from('game_results')
                    .insert({ ...gameData, week_id: currentRun.id, game_number: nextGameNum, score_line: scoreLine, user_id: user.id })
                    .select('id')
                    .single();
                if (gameInsertError) throw gameInsertError;
                if (!newGame?.id) throw new Error("Failed to retrieve new game ID.");
                savedGameId = newGame.id;

                // Insert team_statistics
                 if (Object.keys(teamStats).length > 0) {
                    const { error: teamStatsInsertError } = await supabase
                        .from('team_statistics')
                        .insert({ ...teamStats, game_id: savedGameId, user_id: user.id });
                    if (teamStatsInsertError) console.warn("Error inserting team stats:", teamStatsInsertError.message); // Log warning
                 }

                // Insert player_performances
                 if (playerPerformances.length > 0) {
                     const performancesToInsert = playerPerformances.map(p => ({
                        ...p, game_id: savedGameId, user_id: user.id
                     }));
                     const { error: perfInsertError } = await supabase.from('player_performances').insert(performancesToInsert);
                     if (perfInsertError) throw perfInsertError; // Throw if player stats fail
                 }
            }

            toast({ title: "Success", description: `Game ${editingGame ? 'updated' : 'recorded'} successfully!` });
            setShowForm(false); setEditingGame(null);
            await fetchCurrentRunAndGames(); // Re-fetch all data

        } catch (err: any) {
            console.error("Game Submit Error:", err);
            setError(`Failed to save game: ${err.message}`);
            toast({ title: "Error", description: `Failed to save game: ${err.message}`, variant: "destructive" });
        } finally {
            setFormSubmitting(false); // End form submission loading
        }
    };

    // --- UPDATED DELETE LOGIC ---
    const handleDeleteGame = async (gameId: string) => {
        setLoading(true);
        try {
            const gameToDelete = games.find(g => g.id === gameId);
            if (!gameToDelete) throw new Error("Game not found");
            const deletedGameNumber = gameToDelete.game_number;

            // Delete dependencies first (order matters for foreign keys)
            await supabase.from('player_performances').delete().eq('game_id', gameId);
            await supabase.from('team_statistics').delete().eq('game_id', gameId);

            // Delete the game result
            const { error: gameError } = await supabase.from('game_results').delete().eq('id', gameId);
            if (gameError) throw gameError;

            // Update subsequent game numbers
            const updates = games
                .filter(g => g.id !== gameId && g.game_number > deletedGameNumber)
                .map(g => ({ id: g.id, game_number: g.game_number - 1 }));

            if (updates.length > 0) {
                const { error: updateError } = await supabase.from('game_results').upsert(updates);
                if (updateError) console.warn("Error updating subsequent game numbers:", updateError); // Warn but proceed
            }

            toast({ title: "Success", description: "Game deleted successfully." });
            await fetchCurrentRunAndGames(); // Re-fetch the updated list

        } catch (err: any) {
            setError(`Failed to delete game: ${err.message}`);
            toast({ title: "Error", description: `Failed to delete game: ${err.message}`, variant: "destructive" });
             // Optionally re-fetch even on error to ensure consistency
             await fetchCurrentRunAndGames();
        } finally {
            setLoading(false);
        }
    };

    // --- UPDATED EDIT LOGIC ---
     const handleEditGame = async (gameId: string) => {
        // Find the full game object (already fetched with stats/players)
        const gameToEdit = games.find(g => g.id === gameId);
        if (!gameToEdit) {
            toast({ title: "Error", description: "Could not find game data to edit.", variant: "destructive" });
            return;
        }
         console.log("Editing Game Data:", gameToEdit); // Debug log
        setEditingGame(gameToEdit);
        setShowForm(true);
    };

    const handleCancelForm = () => { setShowForm(false); setEditingGame(null); };

    const handleDragEnd = async (event: DragEndEvent) => { /* ... (no changes needed here) ... */
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = games.findIndex((game) => game.id === active.id);
            const newIndex = games.findIndex((game) => game.id === over.id);
            if (oldIndex === -1 || newIndex === -1) return; // Safety check
            const reorderedGames = arrayMove(games, oldIndex, newIndex);
            setGames(reorderedGames);
            const updates = reorderedGames.map((game, index) => ({ id: game.id, game_number: index + 1 }));
            try {
                const { error: updateError } = await supabase.from('game_results').upsert(updates);
                if (updateError) throw updateError;
                toast({ title: "Success", description: "Game order updated." });
            } catch (err: any) {
                setError(`Failed order update: ${err.message}`); toast({ title: "Error", description: `Failed order update: ${err.message}`, variant: "destructive" });
                fetchCurrentRunAndGames(); // Revert
            }
        }
    };

    const handleNameUpdate = async (newName: string) => { /* ... (no changes needed here) ... */
         if (!currentRun) return;
        try {
            const { error } = await supabase.from('weekly_performances').update({ custom_name: newName }).eq('id', currentRun.id);
            if (error) throw error;
            setCurrentRun(prev => prev ? { ...prev, name: newName } : null);
            toast({ title: "Success", description: "Run name updated." }); setIsNamingModalOpen(false);
        } catch (err: any) { toast({ title: "Error", description: `Failed name update: ${err.message}`, variant: "destructive" }); }
    };

    const nextGameNumber = games.length > 0 ? Math.max(...games.map(g => g.game_number)) + 1 : 1;

    // --- RENDER LOGIC ---
    if (loading && !currentRun && !error) { /* Initial loading */ return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-4 text-muted-foreground">Loading run...</p></div>; }
    if (error) { /* Error display */ return <div className="text-center p-10 text-destructive">{error}</div>; }

    return (
        <div className="space-y-6 pb-4"> {/* Add padding bottom */}
            {!currentRun ? (
                /* No Active Run Card */
                <Card className="glass-card rounded-2xl shadow-xl border-border/20">
                    <CardContent className="text-center p-8 md:p-10 space-y-4">
                        <Trophy className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h2 className="text-xl md:text-2xl font-semibold text-white">No Active Run</h2>
                        <p className="text-muted-foreground text-sm md:text-base">Start tracking your FUT Champions progress?</p>
                        <Button onClick={startNewRun} disabled={loading}> Start New Run </Button>
                    </CardContent>
                </Card>
            ) : (
                <> {/* Active Run View */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6"> {/* Responsive header */}
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl md:text-3xl font-bold text-white truncate max-w-[200px] sm:max-w-xs md:max-w-md">{currentRun.name || `Week ${games[0]?.week_number || '...'}`}</h1>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsNamingModalOpen(true)}><Edit className="h-4 w-4 text-muted-foreground hover:text-white" /></Button>
                        </div>
                        {!showForm && (<Button onClick={() => { setEditingGame(null); setShowForm(true); }} disabled={loading}><PlusCircle className="mr-2 h-4 w-4" /> Add Game</Button>)}
                    </div>

                    <RunNamingModal isOpen={isNamingModalOpen} onClose={() => setIsNamingModalOpen(false)} currentName={currentRun.name || ''} onSave={handleNameUpdate} />

                    {/* FORM DISPLAY (Modal might be better on mobile?) */}
                    {showForm && (
                         <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
                             <div className="w-full max-w-4xl max-h-[90vh]"> {/* Constrain size */}
                                <GameRecordForm
                                    key={editingGame?.id || 'new'} // Force re-render on edit change
                                    onSubmit={handleGameSubmit}
                                    isLoading={formSubmitting} // Use specific loading state
                                    game={editingGame ?? undefined}
                                    weekId={currentRun.id}
                                    onCancel={handleCancelForm}
                                    gameVersion={gameVersion}
                                    nextGameNumber={nextGameNumber}
                                />
                             </div>
                         </div>
                    )}

                    {/* Stats Cards */}
                    <Card className="glass-card rounded-2xl shadow-xl border-border/20"><CardContent className="p-4 md:p-6"><CurrentRunStats games={games} /></CardContent></Card>
                    <Card className="glass-card rounded-2xl shadow-xl border-border/20"><CardContent className="p-4 md:p-6"><WeekProgress games={games} /></CardContent></Card>

                    {/* Game List */}
                    <Card className="glass-card rounded-2xl shadow-xl border-border/20">
                        <CardContent className="p-4 md:p-6">
                             <h3 className="text-lg font-semibold mb-4 text-white">Recorded Games ({games.length})</h3>
                            {games.length > 0 ? (
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                    <SortableContext items={games.map(g => g.id)} strategy={verticalListSortingStrategy}>
                                        <div className="space-y-3">
                                            {games.map((game) => (
                                                <SortableGameListItem key={game.id} game={game} onEdit={handleEditGame} onDelete={handleDeleteGame} />
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            ) : (
                                <p className="text-center text-muted-foreground py-4">No games recorded for this run yet.</p>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
};

export default CurrentRun;
