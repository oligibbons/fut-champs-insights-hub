// src/pages/CurrentRun.tsx (User's version + Modal Logic + Type Updates)
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
// ** Use reconciled types **
import { Game, PlayerPerformanceInsert, TeamStatisticsInsert, WeeklyPerformance, PlayerPerformance } from '@/types/futChampions'; // Added PlayerPerformance
import GameRecordForm from '@/components/GameRecordForm';
import GameListItem from '@/components/GameListItem';
import RunNamingModal from '@/components/RunNamingModal';
import WeekProgress from '@/components/WeekProgress';
import CurrentRunStats from '@/components/CurrentRunStats';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trophy, Loader2, CheckCircle } from 'lucide-react'; // Added CheckCircle
import { useTheme } from '@/hooks/useTheme';
import { useMobile } from '@/hooks/use-mobile';
import { Card, CardContent } from '@/components/ui/card';
import { useGameVersion } from '@/contexts/GameVersionContext';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
// ** Added Modal Imports (ensure paths are correct) **
import GameCompletionModal from '@/components/GameCompletionModal';
import WeekCompletionPopup from '@/components/WeekCompletionPopup';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
    const [games, setGames] = useState<Game[]>([]);
    // ** Store full WeeklyPerformance **
    const [currentRun, setCurrentRun] = useState<WeeklyPerformance | null>(null);
    const [loading, setLoading] = useState(true);
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingGame, setEditingGame] = useState<Game | null>(null);
    const [isNamingModalOpen, setIsNamingModalOpen] = useState(false);
    // ** Modal States **
    const [showGameCompletionModal, setShowGameCompletionModal] = useState(false);
    const [lastSubmittedGame, setLastSubmittedGame] = useState<Game | null>(null); // For GameCompletionModal
    const [showWeekCompletionPopup, setShowWeekCompletionPopup] = useState(false);
    const [runToComplete, setRunToComplete] = useState<WeeklyPerformance | null>(null); // For WeekCompletionPopup

    const sensors = useSensors( useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates, }), ...(isMobile ? [] : [useSensor(TouchSensor)]) );

    useEffect(() => {
        if (user && gameVersion) { fetchCurrentRunAndGames(); }
        else { setLoading(false); setCurrentRun(null); setGames([]); }
    }, [user, gameVersion]);

    const fetchCurrentRunAndGames = async () => {
        if (!user || !gameVersion) return;
        setLoading(true); setError(null);
        try {
            // Fetch full weekly_performance data
            const { data: runData, error: runError } = await supabase
                .from('weekly_performances')
                .select('*') // Select all fields
                .eq('user_id', user.id)
                .eq('is_completed', false)
                .eq('game_version', gameVersion)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (runError && runError.code !== 'PGRST116') throw runError;

            if (runData) {
                const fetchedRun = runData as WeeklyPerformance;
                setCurrentRun(fetchedRun); // Store full run data

                const { data: gamesData, error: gamesError } = await supabase
                    .from('game_results')
                     // Fetch relations needed for display AND modals
                    .select(`*, team_statistics(*), player_performances(*, players(*))`)
                    .eq('week_id', fetchedRun.id)
                    .order('game_number', { ascending: true }); // Use DB field name
                if (gamesError) throw gamesError;

                const processedGames = (gamesData || []).map(g => ({
                    ...g,
                    // Ensure team_stats is single object
                    team_stats: Array.isArray(g.team_statistics) ? g.team_statistics[0] : g.team_statistics,
                    // Ensure player_performances is array and map structure
                     player_performances: (g.player_performances || []).map((p: any) => ({
                        ...p,
                        player_id: p.player_id || p.players?.id,
                        player_name: p.player_name || p.players?.name,
                        // Map other fields from your type if names differ from DB
                        rating: p.rating,
                        goals: p.goals,
                        assists: p.assists,
                        yellow_cards: p.yellow_cards,
                        red_cards: p.red_cards,
                        own_goals: p.own_goals,
                        minutes_played: p.minutes_played,
                     }) as PlayerPerformance)
                })) as Game[];

                setGames(processedGames);

                // Attach games to run for modal context
                 setCurrentRun(prevRun => prevRun ? { ...prevRun, games: processedGames } : null);


            } else {
                setCurrentRun(null); setGames([]);
            }
        } catch (err: any) {
             console.error("Fetch Run Error:", err);
            setError('Failed run fetch: ' + err.message);
            toast({ title: "Error", description: 'Failed run fetch: ' + err.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const startNewRun = async () => {
        if (!user || !gameVersion) return;
        setLoading(true);
        try {
            const { data: latestWeek, error: latestWeekError } = await supabase.from('weekly_performances').select('week_number').eq('user_id', user.id).eq('game_version', gameVersion).order('week_number', { ascending: false }).limit(1).single();
            if (latestWeekError && latestWeekError.code !== 'PGRST116') throw latestWeekError;
            const nextWeekNumber = latestWeek ? latestWeek.week_number + 1 : 1;
            // Insert full record
            const { data, error } = await supabase
                .from('weekly_performances')
                .insert({
                    user_id: user.id,
                    start_date: new Date().toISOString(),
                    week_number: nextWeekNumber,
                    game_version: gameVersion,
                    // Add defaults for any NOT NULL fields without DB defaults if needed
                })
                .select('*') // Select full new run data
                .single();
            if (error) throw error;
            setCurrentRun(data as WeeklyPerformance); // Set full run data
            setGames([]); // Reset games
            setShowForm(true); // Show form for first game
            toast({ title: "Success", description: "New run started!" });
        } catch (err: any) {
             setError('Failed start run: ' + err.message);
             toast({ title: "Error", description: 'Failed start run: ' + err.message, variant: "destructive" });
        } finally { setLoading(false); }
    };

    // --- UPDATED SUBMIT HANDLER ---
    const handleGameSubmit = async (
         // Use reconciled Game type, omitting fields set server-side/here
        gameData: Omit<Game, 'id' | 'created_at' | 'week_id' | 'score_line' | 'date_played' | 'player_performances' | 'team_stats' | 'user_id'>,
        playerPerformances: PlayerPerformanceInsert[],
        teamStats: TeamStatisticsInsert
    ) => {
        if (!user || !currentRun) return;
        setFormSubmitting(true);
        let latestGameData: Game | null = null; // To store data for modal

        try {
            let savedGameId: string | null = null;
            const scoreLine = `${gameData.user_goals}-${gameData.opponent_goals}`;
            const currentGameNumber = editingGame ? editingGame.game_number : (games.length + 1);

             // Prepare data matching DB schema, including new fields
             const gameDataForDb = {
                ...gameData,
                user_id: user.id,
                week_id: currentRun.id,
                game_number: currentGameNumber,
                score_line: scoreLine,
                opponent_username: gameData.opponent_username || null,
                comments: gameData.comments || null,
                // opponent_skill: gameData.opponent_skill, // Field removed
                squad_quality_comparison: gameData.squad_quality_comparison,
             };

            // Database operations (Upsert logic for game, team stats, player performances)
            // ... (your existing Supabase upsert logic for game_results, team_statistics, player_performances)
             if (editingGame) {
                // Update game_results
                const { data: updatedGame, error: gameUpdateError } = await supabase
                    .from('game_results')
                    .update(gameDataForDb)
                    .eq('id', editingGame.id)
                    .select(`*, team_statistics(*), player_performances(*)`) // Fetch updated data
                    .single();
                if (gameUpdateError) throw gameUpdateError;
                savedGameId = editingGame.id;
                latestGameData = updatedGame as Game;

                // Upsert team stats (handle potential existing record)
                 const teamStatsForDb = { ...teamStats, game_id: savedGameId, week_id: currentRun.id, user_id: user.id };
                const { error: tsUpdateError } = await supabase.from('team_statistics').upsert(teamStatsForDb, { onConflict: 'game_id' });
                if (tsUpdateError) console.warn("Error upserting team stats:", tsUpdateError); // Log warning, maybe don't fail entire submit

                // Delete existing player performances and insert new ones
                await supabase.from('player_performances').delete().eq('game_id', savedGameId);
                if (playerPerformances.length > 0) {
                    const performancesWithIds = playerPerformances.map(p => ({ ...p, game_id: savedGameId, week_id: currentRun.id, user_id: user.id }));
                    const { error: ppInsertError } = await supabase.from('player_performances').insert(performancesWithIds);
                    if (ppInsertError) throw ppInsertError;
                }

            } else { // Inserting new game
                 const { data: newGame, error: gameInsertError } = await supabase
                    .from('game_results')
                    .insert(gameDataForDb)
                    .select(`*, team_statistics(*), player_performances(*)`) // Fetch new data
                    .single();
                if (gameInsertError) throw gameInsertError;
                if (!newGame?.id) throw new Error("Failed to retrieve new game ID.");
                savedGameId = newGame.id;
                latestGameData = newGame as Game;

                // Insert team stats
                 if (Object.keys(teamStats).length > 0) {
                     const teamStatsForDb = { ...teamStats, game_id: savedGameId, week_id: currentRun.id, user_id: user.id };
                     const { error: tsInsertError } = await supabase.from('team_statistics').insert(teamStatsForDb);
                     if (tsInsertError) console.warn("Error inserting team stats:", tsInsertError);
                 }

                // Insert player performances
                 if (playerPerformances.length > 0) {
                    const performancesWithIds = playerPerformances.map(p => ({ ...p, game_id: savedGameId, week_id: currentRun.id, user_id: user.id }));
                    const { error: ppInsertError } = await supabase.from('player_performances').insert(performancesWithIds);
                    if (ppInsertError) throw ppInsertError;
                 }
            }


            toast({ title: "Success", description: `Game ${currentGameNumber} ${editingGame ? 'updated' : 'recorded'}!` });
            setShowForm(false); setEditingGame(null);
            await fetchCurrentRunAndGames(); // Re-fetch all data

            // Trigger Game Completion Modal
            if (latestGameData && currentRun) {
                 // We need to potentially re-fetch the run data *with* the newly added game included for the modal context
                 // Or, manually add the latestGameData to the currentRun.games state temporarily for the modal
                 const runDataForModal = {
                     ...currentRun,
                     games: [...(currentRun.games || []), latestGameData] // Add latest game to the list for modal
                 }
                 setLastSubmittedGame(latestGameData);
                 // Pass the potentially augmented run data if GameCompletionModal relies on weekData.games directly
                 setCurrentRun(runDataForModal); // Update state if modal uses it directly
                 setShowGameCompletionModal(true);
            }


        } catch (err: any) {
            console.error("Game Submit Error:", err);
            setError(`Failed to save game: ${err.message}`);
            toast({ title: "Error", description: `Failed to save game: ${err.message}`, variant: "destructive" });
        } finally {
            setFormSubmitting(false);
        }
    };

    // --- DELETE LOGIC ---
    const handleDeleteGame = async (gameId: string) => {
        setLoading(true);
        try {
            const gameToDelete = games.find(g => g.id === gameId);
            if (!gameToDelete) throw new Error("Game not found");
            const deletedGameNumber = gameToDelete.game_number;

            // Delete dependencies first (using game_id)
            await supabase.from('player_performances').delete().eq('game_id', gameId);
            await supabase.from('team_statistics').delete().eq('game_id', gameId);

            // Delete the game result (using id)
            const { error: gameError } = await supabase.from('game_results').delete().eq('id', gameId);
            if (gameError) throw gameError;

            // Update subsequent game numbers
            const updates = games
                .filter(g => g.id !== gameId && g.game_number > deletedGameNumber)
                .map(g => ({ id: g.id, game_number: g.game_number - 1 }));

            if (updates.length > 0) {
                // Use upsert to update multiple rows based on their 'id'
                const { error: updateError } = await supabase.from('game_results').upsert(updates);
                if (updateError) {
                    console.error("Error updating subsequent game numbers:", updateError);
                    // Optionally throw error or show toast
                    toast({ title: "Warning", description: "Could not update subsequent game numbers.", variant: "destructive" });
                }
            }

            toast({ title: "Success", description: "Game deleted successfully." });
            await fetchCurrentRunAndGames(); // Re-fetch to update state

        } catch (err: any) {
             console.error("Delete Game Error:", err);
             setError(`Failed to delete game: ${err.message}`);
             toast({ title: "Error", description: `Failed to delete game: ${err.message}`, variant: "destructive" });
        }
        finally { setLoading(false); }
    };

    // --- EDIT LOGIC ---
     const handleEditGame = async (gameId: string) => {
        // Find game with potentially nested relations already fetched
        const gameToEdit = games.find(g => g.id === gameId);
        if (!gameToEdit) {
             toast({ title: "Error", description: "Could not find game data to edit.", variant: "destructive" });
             return;
        }
        // Ensure relations are present (fetchCurrentRunAndGames should handle this)
        if (!gameToEdit.team_stats || !gameToEdit.player_performances) {
             console.warn("Editing game with missing relations, might cause issues:", gameToEdit);
             // Optionally refetch single game with relations if needed, but fetchCurrentRunAndGames should cover it
        }
        setEditingGame(gameToEdit);
        setShowForm(true);
    };

    // --- CANCEL FORM ---
    const handleCancelForm = () => { setShowForm(false); setEditingGame(null); };

    // --- DRAG END ---
    // (Assuming this handles reordering games - update game_number via Supabase)
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id && over) {
            const oldIndex = games.findIndex((g) => g.id === active.id);
            const newIndex = games.findIndex((g) => g.id === over.id);

            if (oldIndex === -1 || newIndex === -1) return;

            const newOrderGames = arrayMove(games, oldIndex, newIndex);
            setGames(newOrderGames); // Optimistic UI update

            // Prepare updates for Supabase
            const updates = newOrderGames.map((game, index) => ({
                id: game.id,
                game_number: index + 1, // Update game_number based on new array index
            }));

            try {
                setLoading(true); // Indicate loading state
                const { error: updateError } = await supabase.from('game_results').upsert(updates);
                if (updateError) {
                    console.error("Error updating game order:", updateError);
                    toast({ title: "Error", description: "Failed to save new game order.", variant: "destructive" });
                    // Revert optimistic update on error
                    setGames(games);
                } else {
                    toast({ title: "Success", description: "Game order updated." });
                    // Optionally refetch to confirm, though upsert should be reliable
                    // await fetchCurrentRunAndGames();
                }
            } catch (err: any) {
                 console.error("Drag End Error:", err);
                 toast({ title: "Error", description: "An unexpected error occurred while reordering.", variant: "destructive" });
                 setGames(games); // Revert on unexpected error
            } finally {
                 setLoading(false);
            }
        }
    };


    // --- NAME UPDATE ---
    const handleNameUpdate = async (newName: string) => {
         if (!currentRun) return;
        setLoading(true); // Add loading state
        try {
            const { data, error } = await supabase
                .from('weekly_performances')
                .update({ custom_name: newName || null }) // Set to null if empty string
                .eq('id', currentRun.id)
                .select() // Select updated data
                .single();
            if (error) throw error;
            // Update local state with potentially updated object
            setCurrentRun(prev => prev ? { ...prev, ...(data || {}) } : null);
            toast({ title: "Success", description: "Run name updated." });
            setIsNamingModalOpen(false);
        } catch (err: any) {
             console.error("Name Update Error:", err);
             toast({ title: "Error", description: `Failed to update run name: ${err.message}`, variant: "destructive" });
        } finally {
            setLoading(false); // Remove loading state
        }
    };

     // --- COMPLETE RUN ---
     const handleCompleteRun = async () => {
        if (!currentRun) return;
        setLoading(true);
        try {
             // Fetch latest full run data including games for the popup context
             const { data: latestRunData, error: fetchError } = await supabase
                .from('weekly_performances')
                 // Ensure relations are fetched correctly for the popup
                .select(`*, games:game_results(*, team_statistics(*), player_performances(*, players(*)))`)
                .eq('id', currentRun.id)
                .single();

             if (fetchError) throw fetchError;
             if (!latestRunData) throw new Error("Could not refetch run data before completion.");

            // Mark the run as completed
            const { data: updatedRun, error: updateError } = await supabase
                .from('weekly_performances')
                .update({ is_completed: true, end_date: new Date().toISOString() })
                .eq('id', currentRun.id)
                .select() // Select basic updated data to confirm update
                .single();

            if (updateError) throw updateError;

             // Combine the fully populated data (latestRunData) with the update confirmation (updatedRun)
             const finalRunDataForPopup = { ...latestRunData, ...updatedRun } as WeeklyPerformance;

            // Ensure 'games' array exists on the final data for the popup
            if (!finalRunDataForPopup.games) {
                 finalRunDataForPopup.games = latestRunData.games || [];
            }


            setRunToComplete(finalRunDataForPopup); // Set data for the popup
            setCurrentRun(null); // Clear current run state from view
            setGames([]); // Clear games list from view
            setShowWeekCompletionPopup(true); // Show completion popup
            setShowGameCompletionModal(false); // Ensure game modal is closed
            toast({ title: "Run Completed!", description: "Finalized successfully.", variant: "success" });

        } catch (err: any) {
             console.error("Complete Run Error:", err);
             toast({ title: "Error", description: `Failed to complete run: ${err.message}`, variant: "destructive" });
        }
        finally { setLoading(false); }
    };

    const nextGameNumber = games.length + 1;

    // --- RENDER LOGIC ---
    if (loading && !currentRun && !error && user && gameVersion) { // Show loading only on initial load for a specific game version
        return <div className="text-center p-10"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>;
    }
    if (!user && !loading) { return <div className="text-center p-10 text-muted-foreground">Please log in to view your runs.</div>}
    if (!gameVersion && user && !loading) { return <div className="text-center p-10 text-muted-foreground">Please select a game version from settings.</div>}
    // Show error only if it's not a "no rows" error during initial fetch
    if (error && !(error.includes('PGRST116') && !currentRun)) {
         return <div className="text-center p-10 text-destructive">Error loading run data: {error}</div>;
    }


    return (
        <div className="space-y-6 pb-4">
            {/* Case: No Active Run Found */}
            {!currentRun && !loading && user && gameVersion && !showForm ? (
                <Card className="glass-card shadow-lg border-border/20">
                    <CardContent className="p-6 text-center">
                        <Trophy className="h-12 w-12 mx-auto text-primary mb-4" />
                        <h2 className="text-xl font-semibold text-white mb-2">No Active Run</h2>
                        <p className="text-muted-foreground mb-6">Start a new FUT Champions run for {gameVersion} to begin tracking.</p>
                        <Button onClick={startNewRun} disabled={loading}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Start New Run
                        </Button>
                    </CardContent>
                </Card>
            // Case: Active Run Exists OR Form is Shown (even if run creation failed but form is open)
            ) : (currentRun || showForm) && gameVersion ? (
                <> {/* Active Run View or Form View */}
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-white truncate">
                                {currentRun ? (currentRun.custom_name || `Week ${currentRun.week_number}`) : `New Run`}
                            </h1>
                            {currentRun && ( // Only show edit button if run exists
                            <Button variant="ghost" size="icon" onClick={() => setIsNamingModalOpen(true)} aria-label="Edit run name">
                                <Edit className="h-4 w-4 text-muted-foreground hover:text-white" />
                            </Button>
                             )}
                        </div>
                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                            {/* Show Add Game only if NOT showing form and run exists */}
                             {!showForm && currentRun && (
                                // --- GAME LIMIT CHANGE (Button) ---
                                <Button
                                    onClick={() => { setEditingGame(null); setShowForm(true); }}
                                    disabled={loading || games.length >= 15}
                                    aria-label={`Add game ${games.length + 1} of 15`}
                                >
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add Game
                                    {/* --- GAME LIMIT CHANGE (Text) --- */}
                                    {games.length < 15 ? ` (${games.length + 1}/15)` : ' (Max Reached)'}
                                </Button>
                             )}
                             {/* Show Complete Run only if NOT showing form, run exists, has games, and isn't completed */}
                            {!showForm && currentRun && games.length >= 1 && !currentRun.is_completed && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" disabled={loading}>
                                            <CheckCircle className="mr-2 h-4 w-4" /> Complete Run
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                         <AlertDialogHeader>
                                             <AlertDialogTitle>Complete Run?</AlertDialogTitle>
                                             <AlertDialogDescription>
                                                 Finalize this run with {games.length} game(s)? You can't add more games after completing.
                                             </AlertDialogDescription>
                                         </AlertDialogHeader>
                                         <AlertDialogFooter>
                                             <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                                             <AlertDialogAction onClick={handleCompleteRun} disabled={loading} className="bg-destructive hover:bg-destructive/80">
                                                 {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : null}
                                                 Yes, Complete
                                             </AlertDialogAction>
                                         </AlertDialogFooter>
                                     </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                    </div>

                    {/* Naming Modal (only mounts if currentRun exists) */}
                    {currentRun && <RunNamingModal isOpen={isNamingModalOpen} onClose={() => setIsNamingModalOpen(false)} currentName={currentRun.custom_name || ''} onSave={handleNameUpdate} />}

                    {/* Game Record Form (Conditional) */}
                    {showForm && (
                        <GameRecordForm
                            onSubmit={handleGameSubmit}
                            onCancel={handleCancelForm}
                            game={editingGame}
                            nextGameNumber={nextGameNumber}
                            isLoading={formSubmitting}
                            // Pass required context if run exists, handle potential null if form shown before run created
                            weekId={currentRun?.id || ''} // Pass empty string if run doesn't exist yet? Handle in form.
                            gameVersion={gameVersion} // Always pass gameVersion
                        />
                    )}

                    {/* Stats and Progress Cards (Only show if run exists and form is hidden) */}
                    {currentRun && !showForm && (
                        <>
                            <Card className="glass-card shadow-md border-border/20"><CardContent className="p-4 md:p-6"><CurrentRunStats games={games} /></CardContent></Card>
                            {/* Pass currentRun data to WeekProgress */}
                             <Card className="glass-card shadow-md border-border/20"><CardContent className="p-4 md:p-6"><WeekProgress currentWeek={currentRun} /></CardContent></Card>

                            {/* Game List Section */}
                            <Card className="glass-card shadow-md border-border/20">
                                <CardContent className="p-4 md:p-6">
                                    <h3 className="text-lg font-semibold text-white mb-4">Recorded Games ({games.length})</h3>
                                    {games.length === 0 ? (
                                        <p className="text-muted-foreground text-center py-4">No games recorded yet for this run.</p>
                                    ) : (
                                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                            <SortableContext items={games.map(g => g.id)} strategy={verticalListSortingStrategy}>
                                                <div className="space-y-3">
                                                    {games.map(game => (
                                                        <SortableGameListItem key={game.id} game={game} onEdit={handleEditGame} onDelete={() => handleDeleteGame(game.id)} />
                                                    ))}
                                                </div>
                                            </SortableContext>
                                        </DndContext>
                                    )}
                                </CardContent>
                             </Card>
                        </>
                    )}

                    {/* --- Modals --- */}
                    {/* Game Completion Modal */}
                    <GameCompletionModal
                        isOpen={showGameCompletionModal}
                        onClose={() => {setShowGameCompletionModal(false); setLastSubmittedGame(null);}}
                        game={lastSubmittedGame}
                        weekData={currentRun} // Pass the most up-to-date run data
                    />
                    {/* Week Completion Popup */}
                    <WeekCompletionPopup
                        isOpen={showWeekCompletionPopup}
                        onClose={() => { setShowWeekCompletionPopup(false); setRunToComplete(null); }}
                        runData={runToComplete}
                        // onNewWeek={startNewRun} // Optionally pass startNewRun if needed
                    />
                </>
            // Fallback for unexpected states (e.g., loading finished but no user/version somehow)
            ) : null }
        </div>
    );
};

export default CurrentRun;
