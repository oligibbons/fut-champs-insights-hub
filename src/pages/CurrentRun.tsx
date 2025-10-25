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
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors, DragEndEvent } from '@nd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@nd-kit/sortable';
import { CSS } from '@nd-kit/utilities';
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
                // Ensure opponent_skill is included if still in DB/type, otherwise remove
                // opponent_skill: gameData.opponent_skill, // This field was removed
                squad_quality_comparison: gameData.squad_quality_comparison, // Added
             };
              // If opponent_skill was REMOVED via SQL:
             // delete (gameDataForDb as any).opponent_skill;


            if (editingGame) {
                // Update game_results
                const { data: updatedGame, error: gameUpdateError } = await supabase
                    .from('game_results')
                    .update(gameDataForDb)
                    .eq('id', editingGame.id)
                    .select(`*, team_statistics(*), player_performances(*)`) // Fetch updated data for modal
                    .single();
                if (gameUpdateError) throw gameUpdateError;
                savedGameId = editingGame.id;
                latestGameData = updatedGame as Game; // Store for modal if needed on edit

                // Update team stats
                if (Object.keys(teamStats).length > 0) { /* ... upsert logic ... */ }

                // Update player performances
                await supabase.from('player_performances').delete().eq('game_id', savedGameId);
                if (playerPerformances.length > 0) { /* ... insert logic ... */ }

            } else { // Inserting new game
                 const { data: newGame, error: gameInsertError } = await supabase
                    .from('game_results')
                    .insert(gameDataForDb)
                    .select(`*, team_statistics(*), player_performances(*)`) // Fetch new data for modal
                    .single();
                if (gameInsertError) throw gameInsertError;
                if (!newGame?.id) throw new Error("Failed to retrieve new game ID.");
                savedGameId = newGame.id;
                latestGameData = newGame as Game; // Store for modal

                // Insert team stats
                 if (Object.keys(teamStats).length > 0) { /* ... insert logic ... */ }

                // Insert player performances
                 if (playerPerformances.length > 0) { /* ... insert logic ... */ }
            }

            toast({ title: "Success", description: `Game ${currentGameNumber} ${editingGame ? 'updated' : 'recorded'}!` });
            setShowForm(false); setEditingGame(null);
            await fetchCurrentRunAndGames(); // Re-fetch all data

            // --- Trigger Game Completion Modal ---
            // Use the data fetched *after* submission
            if (latestGameData && currentRun) {
                 setLastSubmittedGame(latestGameData); // Set data for the complex modal
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

    // --- DELETE LOGIC --- (Ensure it handles cascades or deletes related data)
    const handleDeleteGame = async (gameId: string) => {
        setLoading(true);
        try {
            const gameToDelete = games.find(g => g.id === gameId);
            if (!gameToDelete) throw new Error("Game not found");
            const deletedGameNumber = gameToDelete.game_number;

            // Delete dependencies first
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
                if (updateError) console.warn("Error updating subsequent game numbers:", updateError);
            }

            toast({ title: "Success", description: "Game deleted successfully." });
            await fetchCurrentRunAndGames(); // Re-fetch

        } catch (err: any) { /* ... error handling ... */ }
        finally { setLoading(false); }
    };

    // --- EDIT LOGIC --- (Ensure fetched data includes relations)
     const handleEditGame = async (gameId: string) => {
        const gameToEdit = games.find(g => g.id === gameId);
        if (!gameToEdit) { /* ... error handling ... */ return; }
        // Ensure relations are loaded if fetch didn't include them initially
        // (Our fetchCurrentRunAndGames *does* include them now)
        setEditingGame(gameToEdit);
        setShowForm(true);
    };

    // --- CANCEL FORM ---
    const handleCancelForm = () => { setShowForm(false); setEditingGame(null); };

    // --- DRAG END ---
    const handleDragEnd = async (event: DragEndEvent) => { /* ... same logic ... */ };

    // --- NAME UPDATE ---
    const handleNameUpdate = async (newName: string) => {
         if (!currentRun) return;
        try {
            const { data, error } = await supabase
                .from('weekly_performances')
                .update({ custom_name: newName })
                .eq('id', currentRun.id)
                .select() // Select updated data
                .single();
            if (error) throw error;
            // Update local state with full updated object
            setCurrentRun(prev => prev ? { ...prev, ...data } : null);
            toast({ title: "Success", description: "Run name updated." }); setIsNamingModalOpen(false);
        } catch (err: any) { /* ... error handling ... */ }
    };

     // --- COMPLETE RUN ---
     const handleCompleteRun = async () => {
        if (!currentRun) return;
        setLoading(true);
        try {
             // Fetch latest full run data including games for the popup context
             const { data: latestRunData, error: fetchError } = await supabase
                .from('weekly_performances')
                .select(`*, games:game_results(*, team_statistics(*), player_performances(*))`) // Fetch games too
                .eq('id', currentRun.id)
                .single();

             if (fetchError) throw fetchError;
             if (!latestRunData) throw new Error("Could not refetch run data.");

            const { data: updatedRun, error: updateError } = await supabase
                .from('weekly_performances')
                .update({ is_completed: true, end_date: new Date().toISOString() })
                .eq('id', currentRun.id)
                .select() // Select basic updated data
                .single();

            if (updateError) throw updateError;

             // Combine latest fetched data (with games) and the update confirmation
             const finalRunDataForPopup = { ...latestRunData, ...updatedRun } as WeeklyPerformance;


            setRunToComplete(finalRunDataForPopup); // Set data for the popup
            setCurrentRun(null); // Clear current run state
            setGames([]); // Clear games list
            setShowWeekCompletionPopup(true); // Show popup
            setShowGameCompletionModal(false); // Close other modal
            toast({ title: "Run Completed!", description: "Finalized successfully." });

        } catch (err: any) { /* ... error handling ... */ }
        finally { setLoading(false); }
    };

    const nextGameNumber = games.length + 1;

    // --- RENDER LOGIC ---
    if (loading && !currentRun && !error && user) { /* ... Initial loading ... */ } // Added user check
    if (!user && !loading) { return <div className="text-center p-10 text-muted-foreground">Please log in to view your runs.</div>}
    if (error) { /* ... Error display ... */ }

    return (
        <div className="space-y-6 pb-4">
            {!currentRun && !loading && user ? ( // Show "Start New Run" only if logged in, not loading, and no current run
                <Card className="glass-card ..."> <CardContent> {/* ... No Active Run ... */} </CardContent> </Card>
            ) : currentRun ? (
                <> {/* Active Run View */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                        <div className="flex items-center gap-2">
                             {/* Use DB field week_number */}
                            <h1 className="text-2xl ...">{currentRun.custom_name || `Week ${currentRun.week_number}`}</h1>
                            <Button variant="ghost" size="icon" onClick={() => setIsNamingModalOpen(true)}><Edit className="h-4 w-4 ..." /></Button>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                            {!showForm && (<Button onClick={() => { setEditingGame(null); setShowForm(true); }} disabled={loading || games.length >= 20}><PlusCircle className="mr-2 h-4 w-4" /> Add Game {games.length < 20 ? `(${games.length}/20)` : '(Max Reached)'}</Button>)}
                            {!showForm && games.length >= 1 && !currentRun.is_completed && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" disabled={loading}> <CheckCircle className="mr-2 h-4 w-4" /> Complete Run </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                         <AlertDialogHeader> <AlertDialogTitle>Complete Run?</AlertDialogTitle> <AlertDialogDescription> Finalize this run ({games.length} games)? You can't add more games after completing. </AlertDialogDescription> </AlertDialogHeader>
                                         <AlertDialogFooter> <AlertDialogCancel>Cancel</AlertDialogCancel> <AlertDialogAction onClick={handleCompleteRun} className="bg-destructive hover:bg-destructive/80"> Yes, Complete </AlertDialogAction> </AlertDialogFooter>
                                     </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                    </div>

                    <RunNamingModal isOpen={isNamingModalOpen} onClose={() => setIsNamingModalOpen(false)} currentName={currentRun.custom_name || ''} onSave={handleNameUpdate} />

                    {/* --- THIS IS THE FIX --- */}
                    {showForm && (
                        <GameRecordForm
                            onSubmit={handleGameSubmit}
                            onCancel={handleCancelForm}
                            game={editingGame}                 // Prop name changed
                            nextGameNumber={nextGameNumber}    // Prop name changed
                            isLoading={formSubmitting}         // Prop name changed
                            
                            // Pass the new required props:
                            weekId={currentRun.id}
                            gameVersion={gameVersion}
                        />
                    )}

                    <Card className="glass-card ..."><CardContent className="p-4 md:p-6"><CurrentRunStats games={games} /></CardContent></Card>
                    <Card className="glass-card ..."><CardContent className="p-4 md:p-6"><WeekProgress games={games} targetWins={currentRun?.target_wins} /></CardContent></Card>

                    <Card className="glass-card ..."> <CardContent> <h3 className="text-lg ...">Recorded Games ({games.length})</h3> {/* ... Game List Logic ... */} </CardContent> </Card>

                    {/* --- Modals --- */}
                    {/* Pass last submitted game and full current run data */}
                    <GameCompletionModal
                        isOpen={showGameCompletionModal}
                        onClose={() => {setShowGameCompletionModal(false); setLastSubmittedGame(null);}}
                        game={lastSubmittedGame} // Pass the last submitted game
                        weekData={currentRun} // Pass the full current run data (which includes games)
                        // onCompleteRun={handleCompleteRun} // Remove if using user's modal version without this button
                    />
                    <WeekCompletionPopup
                        isOpen={showWeekCompletionPopup}
                        onClose={() => { setShowWeekCompletionPopup(false); setRunToComplete(null); }}
                        runData={runToComplete} // Pass the completed run data
                        // onNewWeek={startNewRun} // Pass if needed by WeekCompletionPopup
                    />
                </>
            ) : null /* Handles loading state or no user state */ }
        </div>
    );
};

export default CurrentRun;
