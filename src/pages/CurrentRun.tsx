import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useGameVersion } from '@/contexts/GameVersionContext';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2, FlagOff, ArrowLeft } from 'lucide-react';
import GameCard from '@/components/GameCard';
import WeekProgress from '@/components/WeekProgress';
import { Game, FutChampsWeek } from '@/types/futChampions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GameRecordForm from '@/components/GameRecordForm';
import { useToast } from '@/hooks/use-toast';
import { Squad } from '@/types/squads';
import WeekCompletionPopup from '@/components/WeekCompletionPopup';
import CurrentRunStats from '@/components/CurrentRunStats';
import TopPerformers from '@/components/TopPerformers';
import RunSelector from '@/components/RunSelector';
import GameListItem from '@/components/GameListItem';
import DeleteDialog from '@/components/DeleteDialog';

const CurrentRun = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const { gameVersion } = useGameVersion();

    const [allRuns, setAllRuns] = useState<FutChampsWeek[]>([]);
    const [selectedRun, setSelectedRun] = useState<FutChampsWeek | null>(null);
    const [games, setGames] = useState<Game[]>([]);
    const [squads, setSquads] = useState<Squad[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modal States
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [gameToEdit, setGameToEdit] = useState<Game | null>(null);
    const [itemToDelete, setItemToDelete] = useState<{ type: 'run' | 'game', id: string } | null>(null);
    const [showCompletionPopup, setShowCompletionPopup] = useState(false);
    const [justCompletedWeek, setJustCompletedWeek] = useState<FutChampsWeek | null>(null);

    const fetchData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data: runsData } = await supabase.from('weekly_performances').select('*').eq('user_id', user.id).eq('game_version', gameVersion).order('start_date', { ascending: false });
            setAllRuns(runsData || []);

            const { data: squadsData } = await supabase.from('squads').select('*, squad_players(*, players(*))').eq('user_id', user.id).eq('game_version', gameVersion);
            setSquads(squadsData || []);

        } catch (error: any) {
            toast({ title: "Error", description: "Failed to fetch initial data.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [user, gameVersion, toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const fetchGamesForRun = async (runId: string) => {
        setLoading(true);
        const { data: gamesData, error } = await supabase.from('game_results').select('*, player_performances(*), team_statistics(*)').eq('week_id', runId).order('game_number', { ascending: true });
        if (error) {
            toast({ title: "Error", description: "Failed to fetch games for this run.", variant: "destructive" });
        } else {
            setGames(gamesData || []);
        }
        setLoading(false);
    };
    
    const handleSelectRun = (runId: string) => {
        const run = allRuns && allRuns.find(r => r.id === runId);
        if (run) {
            setSelectedRun(run);
            fetchGamesForRun(runId);
        }
    };

    const handleStartNewRun = async () => {
        if (!user) return;
        const { data, error } = await supabase.from('weekly_performances').insert({ user_id: user.id, game_version: gameVersion, week_number: allRuns.length + 1, start_date: new Date().toISOString() }).select().single();
        if (error) {
            toast({ title: "Error", description: "Could not start new run.", variant: "destructive" });
        } else if (data) {
            toast({ title: "Success", description: "New run started!" });
            await fetchData();
            handleSelectRun(data.id);
        }
    };

    const handleEndRun = async () => {
        if (!selectedRun) return;
        const { data: completedWeek, error } = await supabase.from('weekly_performances').update({ is_completed: true, end_date: new Date().toISOString() }).eq('id', selectedRun.id).select().single();
        if (error) {
            toast({ title: "Error", description: "Failed to end run.", variant: "destructive" });
        } else {
            setJustCompletedWeek(completedWeek);
            setShowCompletionPopup(true);
            await fetchData();
            setSelectedRun(null);
        }
    };
    
    const handleDelete = async () => {
        if (!itemToDelete) return;
        const { type, id } = itemToDelete;

        if (type === 'run') {
            await supabase.from('weekly_performances').delete().eq('id', id);
            toast({ title: "Success", description: "Run deleted successfully." });
            await fetchData();
            setSelectedRun(null);
        } else if (type === 'game') {
            await supabase.from('game_results').delete().eq('id', id);
            toast({ title: "Success", description: "Game deleted successfully." });
            if (selectedRun) fetchGamesForRun(selectedRun.id);
        }
        setItemToDelete(null);
    };
    
    const handleSaveGame = async () => {
        setIsFormOpen(false);
        setGameToEdit(null);
        if (selectedRun) {
            await fetchData();
            await fetchGamesForRun(selectedRun.id);
            const updatedRun = allRuns.find(r => r.id === selectedRun.id);
            if (updatedRun && games.length + 1 >= 15 && !updatedRun.is_completed) {
                toast({ title: "Run Auto-Completed", description: "You've reached 15 games." });
                handleEndRun();
            }
        }
    };

    const handleOpenForm = (game: Game | null = null) => {
        setGameToEdit(game);
        setIsFormOpen(true);
    }

    if (loading && !selectedRun) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!selectedRun) {
        return <RunSelector runs={allRuns} onSelectRun={handleSelectRun} onStartNewRun={handleStartNewRun} />;
    }

    const wins = games.filter(g => g.result === 'win').length;
    const losses = games.filter(g => g.result === 'loss').length;
    const nextGameNumber = games.length + 1;

    return (
        <div className="space-y-6">
            <Button variant="ghost" onClick={() => setSelectedRun(null)}><ArrowLeft className="mr-2 h-4 w-4" /> Back to All Runs</Button>

            <WeekProgress wins={wins} losses={losses} gamesPlayed={games.length} target={15} />

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h1 className="text-3xl font-bold">{selectedRun.custom_name || `Week ${selectedRun.week_number}`}</h1>
                {!selectedRun.is_completed && (
                    <div className="flex gap-2">
                        <Button onClick={() => handleOpenForm()} disabled={games.length >= 15}><PlusCircle className="mr-2 h-4 w-4" /> Record Game</Button>
                        <Button variant="outline" onClick={handleEndRun}><FlagOff className="mr-2 h-4 w-4" /> End Run</Button>
                    </div>
                )}
            </div>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>{gameToEdit ? 'Edit Game' : 'Record a Game'}</DialogTitle>
                        <DialogDescription>
                            {gameToEdit ? `Update details for game #${gameToEdit.game_number}` : `Enter details for game #${nextGameNumber}`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 min-h-0">
                        <GameRecordForm existingGame={gameToEdit} squads={squads} weekId={selectedRun.id} nextGameNumber={nextGameNumber} onSave={handleSaveGame} onCancel={() => setIsFormOpen(false)} />
                    </div>
                </DialogContent>
            </Dialog>

            <DeleteDialog isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)} onConfirm={handleDelete} itemName={itemToDelete?.type || ''} />
            <WeekCompletionPopup isOpen={showCompletionPopup} onClose={() => setShowCompletionPopup(false)} week={justCompletedWeek} />

            <Tabs defaultValue="overview" className="w-full">
              <div className="w-full overflow-x-auto pb-2">
                <TabsList className="grid w-full grid-cols-4 min-w-[400px]">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="gamelist">Game List</TabsTrigger>
                  <TabsTrigger value="stats">Run Stats</TabsTrigger>
                  <TabsTrigger value="performers">Top Performers</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="overview" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {games.map(game => (<GameCard key={game.id} game={game} onEdit={handleOpenForm} onDelete={(id) => setItemToDelete({type: 'game', id})} />))}
                </div>
              </TabsContent>
               <TabsContent value="gamelist" className="mt-4 space-y-2">
                    {games.map(game => (<GameListItem key={game.id} game={game} onEdit={handleOpenForm} onDelete={(id) => setItemToDelete({type: 'game', id})} />))}
               </TabsContent>
               <TabsContent value="stats" className="mt-4"><CurrentRunStats week={selectedRun} games={games} /></TabsContent>
              <TabsContent value="performers" className="mt-4"><TopPerformers games={games} /></TabsContent>
            </Tabs>
        </div>
    );
};

export default CurrentRun;
