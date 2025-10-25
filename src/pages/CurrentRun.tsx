// src/pages/CurrentRun.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
// ** Use reconciled types **
import { Game, PlayerPerformanceInsert, TeamStatisticsInsert, WeeklyPerformance } from '@/types/futChampions';
import GameRecordForm from '@/components/GameRecordForm';
import GameListItem from '@/components/GameListItem';
import RunNamingModal from '@/components/RunNamingModal';
import WeekProgress from '@/components/WeekProgress';
import CurrentRunStats from '@/components/CurrentRunStats';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trophy, Loader2, CheckCircle } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useMobile } from '@/hooks/use-mobile';
import { Card, CardContent } from '@/components/ui/card';
import { useGameVersion } from '@/contexts/GameVersionContext';
import { DndContext, /* ... dnd imports ... */ DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, /* ... dnd imports ... */ useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
// ** Added Modal Imports **
import GameCompletionModal from '@/components/GameCompletionModal';
import WeekCompletionPopup from '@/components/WeekCompletionPopup';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// SortableGameListItem remains the same
const SortableGameListItem = ({ /* ... */ }) => { /* ... */ };

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
    const [showWeekCompletionPopup, setShowWeekCompletionPopup] = useState(false);
    const [runToComplete, setRunToComplete] = useState<WeeklyPerformance | null>(null); // For popup data

    const sensors = useSensors( /* ... */ );

    useEffect(() => {
        if (user && gameVersion) { fetchCurrentRunAndGames(); }
        else { setLoading(false); setCurrentRun(null); setGames([]); }
    }, [user, gameVersion]);

    const fetchCurrentRunAndGames = async () => {
        if (!user || !gameVersion) return;
        setLoading(true); setError(null);
        try {
            // ** Fetch full weekly_performance data **
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
                setCurrentRun(runData as WeeklyPerformance); // Store full run data

                const { data: gamesData, error: gamesError } = await supabase
                    .from('game_results')
                    .select(`*, team_statistics(*), player_performances(*, players(*))`) // Fetch players within performances
                    .eq('week_id', runData.id)
                    .order('game_number', { ascending: true }); // Use DB field name
                if (gamesError) throw gamesError;

                 const processedGames = (gamesData || []).map(g => ({
                    ...g,
                    // Ensure team_stats is single object
                    team_stats: Array.isArray(g.team_statistics) ? g.team_statistics[0] : g.team_statistics,
                    // Map player_performances structure if needed (ensure player_id is present)
                     player_performances: (g.player_performances || []).map((p: any) => ({
                        ...p,
                        player_id: p.player_id || p.players?.id, // Ensure player_id exists
                        player_name: p.player_name || p.players?.name // Fallback name
                     }) as PlayerPerformance)
                 })) as Game[];

                setGames(processedGames);

                // Check for completion AFTER setting data (can be uncommented if needed)
                // if (runData.is_completed && !showWeekCompletionPopup) {
                //     setRunToComplete(runData as WeeklyPerformance);
                //     setShowWeekCompletionPopup(true);
                // }

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

    // startNewRun remains the same
    const startNewRun = async () => { /* ... */ };

    // --- UPDATED SUBMIT HANDLER ---
    const handleGameSubmit = async (
        // ** Use reconciled Game type, omitting fields set server-side/here **
        gameData: Omit<Game, 'id' | 'created_at' | 'week_id' | 'score_line' | 'date_played' | 'player_performances' | 'team_stats' | 'user_id'>,
        playerPerformances: PlayerPerformanceInsert[],
        teamStats: TeamStatisticsInsert
    ) => {
        if (!user || !currentRun) return;
        setFormSubmitting(true);

        try {
            let savedGameId: string | null = null;
            const scoreLine = `${gameData.user_goals}-${gameData.opponent_goals}`;
            // ** Use games.length + 1 for next game number on insert **
            const currentGameNumber = editingGame ? editingGame.game_number : (games.length + 1);
            const isFinalGame = currentGameNumber === 20;

            // Prepare data matching DB schema
             const gameDataForDb = {
                ...gameData, // Spread the form data
                user_id: user.id,
                week_id: currentRun.id,
                game_number: currentGameNumber, // Use calculated number
                score_line: scoreLine,
                // Ensure nullable fields are null if empty, or omitted if Zod handles defaults
                opponent_username: gameData.opponent_username || null,
                comments: gameData.comments || null,
             };
             // Remove opponent_skill if it accidentally got included
             delete (gameDataForDb as any).opponent_skill;


            if (editingGame) {
                const { error: gameUpdateError } = await supabase
                    .from('game_results')
                    .update(gameDataForDb) // Pass prepared data
                    .eq('id', editingGame.id);
                if (gameUpdateError) throw gameUpdateError;
                savedGameId = editingGame.id;

                // Update team stats (Ensure teamStats includes user_id)
                if (Object.keys(teamStats).length > 0) {
                    const { error: teamStatsUpsertError } = await supabase
                        .from('team_statistics')
                        .upsert({ ...teamStats, user_id: user.id, game_id: savedGameId }, { onConflict: 'game_id' });
                    if (teamStatsUpsertError) console.warn("Error upserting team stats:", teamStatsUpsertError.message);
                }

                // Delete old player performances and insert new (Ensure PP includes user_id)
                await supabase.from('player_performances').delete().eq('game_id', savedGameId);
                if (playerPerformances.length > 0) {
                     const performancesToInsert = playerPerformances.map(p => ({
                        ...p, user_id: user.id, game_id: savedGameId
                     }));
                     const { error: perfInsertError } = await supabase.from('player_performances').insert(performancesToInsert);
                     if (perfInsertError) throw perfInsertError;
                }

            } else { // Inserting new game
                 const { data: newGame, error: gameInsertError } = await supabase
                    .from('game_results')
                    .insert(gameDataForDb) // Pass prepared data
                    .select('id')
                    .single();
                if (gameInsertError) throw gameInsertError;
                if (!newGame?.id) throw new Error("Failed to retrieve new game ID.");
                savedGameId = newGame.id;

                // Insert team stats (Ensure teamStats includes user_id)
                 if (Object.keys(teamStats).length > 0) {
                    const { error: teamStatsInsertError } = await supabase
                        .from('team_statistics')
                        .insert({ ...teamStats, user_id: user.id, game_id: savedGameId });
                    if (teamStatsInsertError) console.warn("Error inserting team stats:", teamStatsInsertError.message);
                 }

                // Insert player performances (Ensure PP includes user_id)
                 if (playerPerformances.length > 0) {
                     const performancesToInsert = playerPerformances.map(p => ({
                        ...p, user_id: user.id, game_id: savedGameId
                     }));
                     const { error: perfInsertError } = await supabase.from('player_performances').insert(performancesToInsert);
                     if (perfInsertError) throw perfInsertError;
                 }
            }

            toast({ title: "Success", description: `Game ${currentGameNumber} ${editingGame ? 'updated' : 'recorded'}!` });
            setShowForm(false); setEditingGame(null);
            await fetchCurrentRunAndGames(); // Re-fetch all data

            // ** Trigger Game Completion Modal only on INSERTING the 20th game **
            if (!editingGame && isFinalGame) {
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

    // handleDeleteGame remains the same
    const handleDeleteGame = async (gameId: string) => { /* ... */ };

    // handleEditGame remains the same
     const handleEditGame = async (gameId: string) => { /* ... */ };

    // handleCancelForm remains the same
    const handleCancelForm = () => { /* ... */ };

    // handleDragEnd remains the same
    const handleDragEnd = async (event: DragEndEvent) => { /* ... */ };

    // handleNameUpdate remains the same
    const handleNameUpdate = async (newName: string) => { /* ... */ };

     // --- Function to Mark Run as Complete ---
     const handleCompleteRun = async () => {
        if (!currentRun) return;
        setLoading(true);
        try {
            // ** Fetch the latest run data before updating **
            // This ensures we have wins/losses calculated by triggers/functions if applicable
             const { data: latestRunData, error: fetchError } = await supabase
                .from('weekly_performances')
                .select('*')
                .eq('id', currentRun.id)
                .single();

             if (fetchError) throw fetchError;
             if (!latestRunData) throw new Error("Could not refetch run data before completion.");

            const { data, error } = await supabase
                .from('weekly_performances')
                .update({ is_completed: true, end_date: new Date().toISOString() })
                .eq('id', currentRun.id)
                .select() // Select updated data
                .single();

            if (error) throw error;

            // Use the updated data (or latest fetched data) for the popup
            setRunToComplete(data as WeeklyPerformance);
            setCurrentRun(null); // Clear current run as it's now completed
            setGames([]); // Clear games list
            setShowWeekCompletionPopup(true);
            setShowGameCompletionModal(false); // Close game modal if open
            toast({ title: "Run Completed!", description: "Your weekend league run has been finalized." });
            // Optionally call fetchCurrentRunAndGames() again if you want to immediately check for a new *uncompleted* run
            // await fetchCurrentRunAndGames();
        } catch (err: any) {
            console.error("Error completing run:", err);
            toast({ title: "Error", description: `Failed to complete run: ${err.message}`, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const nextGameNumber = games.length + 1; // Simpler calculation

    // Render logic remains similar...
    if (loading && !currentRun && !error) { /* ... */ }
    if (error) { /* ... */ }

    return (
        <div className="space-y-6 pb-4">
            {!currentRun ? (
                /* No Active Run Card */
                <Card className="glass-card ..."> {/* ... */} </Card>
            ) : (
                <> {/* Active Run View */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                        <div className="flex items-center gap-2">
                             {/* Use DB field week_number */}
                            <h1 className="text-2xl ...">{currentRun.custom_name || `Week ${currentRun.week_number}`}</h1>
                            <Button variant="ghost" size="icon" onClick={() => setIsNamingModalOpen(true)}><Edit className="h-4 w-4 ..." /></Button>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                            {!showForm && (<Button onClick={() => { setEditingGame(null); setShowForm(true); }} disabled={loading || games.length >= 20}><PlusCircle className="mr-2 h-4 w-4" /> Add Game {games.length < 20 ? `(${games.length}/20)` : '(Max Reached)'}</Button>)}
                            {!showForm && games.length >= 1 && !currentRun.is_completed && ( // Show only if form is hidden, games exist, and not completed
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" disabled={loading}> <CheckCircle className="mr-2 h-4 w-4" /> Complete Run </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent> {/* ... Confirmation Dialog ... */} </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                    </div>

                    <RunNamingModal isOpen={isNamingModalOpen} onClose={() => setIsNamingModalOpen(false)} currentName={currentRun.custom_name || ''} onSave={handleNameUpdate} />

                    {showForm && ( /* ... Form Display ... */ )}

                    {/* Stats Cards - Pass target_wins from currentRun */}
                    <Card className="glass-card ..."><CardContent className="p-4 md:p-6"><CurrentRunStats games={games} /></CardContent></Card>
                    <Card className="glass-card ..."><CardContent className="p-4 md:p-6"><WeekProgress games={games} targetWins={currentRun?.target_wins} /></CardContent></Card>

                    {/* Game List (remains the same) */}
                    <Card className="glass-card ..."> <CardContent> {/* ... */} </CardContent> </Card>

                    {/* --- Modals --- */}
                    <GameCompletionModal
                        isOpen={showGameCompletionModal}
                        onClose={() => setShowGameCompletionModal(false)}
                        onCompleteRun={handleCompleteRun}
                        gamesPlayed={games.length} // Pass current count
                        // ** Pass necessary week data if modal needs it **
                        // weekData={currentRun} // Uncomment if GameCompletionModal requires week data
                    />
                    <WeekCompletionPopup
                        isOpen={showWeekCompletionPopup}
                        onClose={() => { setShowWeekCompletionPopup(false); setRunToComplete(null); }} // Clear runToComplete on close
                        runData={runToComplete} // Pass the completed run data
                        // ** Pass onNewWeek if needed **
                        // onNewWeek={startNewRun}
                    />
                </>
            )}
        </div>
    );
};

export default CurrentRun;
