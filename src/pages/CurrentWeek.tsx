import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useGameVersion } from '@/contexts/GameVersionContext';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2, BarChart2, Star, ListChecks, FlagOff } from 'lucide-react';
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
import RecentRuns from '@/components/RecentRuns';

const CurrentWeek = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const { gameVersion } = useGameVersion();
    const [currentWeek, setCurrentWeek] = useState<FutChampsWeek | null>(null);
    const [recentRuns, setRecentRuns] = useState<FutChampsWeek[]>([]);
    const [games, setGames] = useState<Game[]>([]);
    const [squads, setSquads] = useState<Squad[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRecordGameModalOpen, setRecordGameModalOpen] = useState(false);
    const [showCompletionPopup, setShowCompletionPopup] = useState(false);
    const [justCompletedWeek, setJustCompletedWeek] = useState<FutChampsWeek | null>(null);

    const fetchData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data: weekData, error: weekError } = await supabase
                .from('weekly_performances')
                .select('*')
                .eq('user_id', user.id)
                .eq('is_completed', false)
                .eq('game_version', gameVersion)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (weekError && weekError.code !== 'PGRST116') throw weekError;

            if (weekData) {
                setCurrentWeek(weekData);
                const { data: gamesData, error: gamesError } = await supabase
                    .from('game_results')
                    .select('*, player_performances(*), team_statistics(*)')
                    .eq('week_id', weekData.id)
                    .order('game_number', { ascending: true });
                if (gamesError) throw gamesError;
                setGames(gamesData || []);
            } else {
                setCurrentWeek(null);
                setGames([]);
                const { data: recentData, error: recentError } = await supabase
                    .from('weekly_performances')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('is_completed', true)
                    .eq('game_version', gameVersion)
                    .order('start_date', { ascending: false })
                    .limit(5);
                if (recentError) throw recentError;
                setRecentRuns(recentData || []);
            }

            const { data: squadsData, error: squadsError } = await supabase
                .from('squads')
                .select('*, squad_players(*, players(*))')
                .eq('user_id', user.id)
                .eq('game_version', gameVersion);
            if (squadsError) throw squadsError;
            setSquads(squadsData || []);

        } catch (error: any) {
            console.error('Error fetching data:', error);
            toast({ title: "Error", description: "Failed to fetch current week data.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [user, gameVersion, toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const endCurrentRun = useCallback(async () => {
        if (!currentWeek) return;
        const { data: completedWeek, error } = await supabase
            .from('weekly_performances')
            .update({ is_completed: true, end_date: new Date().toISOString() })
            .eq('id', currentWeek.id)
            .select()
            .single();

        if (error) {
            toast({ title: "Error", description: "Failed to end the run.", variant: "destructive" });
        } else {
            setJustCompletedWeek(completedWeek);
            setShowCompletionPopup(true);
            await fetchData();
        }
    }, [currentWeek, fetchData, toast]);

    useEffect(() => {
        if (currentWeek && games.length >= 15 && !currentWeek.is_completed) {
            toast({ title: "Run Auto-Completed", description: "You've reached 15 games. This run has been automatically ended." });
            endCurrentRun();
        }
    }, [games, currentWeek, endCurrentRun, toast]);

    const startNewWeek = async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from('weekly_performances')
            .insert({ 
                user_id: user.id, 
                game_version: gameVersion, 
                week_number: (recentRuns[0]?.week_number || 0) + 1, 
                start_date: new Date().toISOString() 
            })
            .select()
            .single();

        if (error) {
            toast({ title: "Error", description: "Could not start a new week.", variant: "destructive" });
        } else if (data) {
           await fetchData();
        }
    };
    
    const handleSave = async () => {
        setRecordGameModalOpen(false);
        await fetchData();
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!currentWeek) {
        return (
            <div className="container mx-auto p-4 space-y-6">
                 <div className="text-center p-8">
                    <h2 className="text-2xl font-semibold mb-4">No Active FUT Champs Week for {gameVersion}</h2>
                    <p className="mb-6">Start a new week to begin tracking your games.</p>
                    <Button onClick={startNewWeek}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Start New Week
                    </Button>
                </div>
                <RecentRuns runs={recentRuns} />
            </div>
        );
    }
    
    const wins = games.filter(g => g.result === 'win').length;
    const losses = games.filter(g => g.result === 'loss').length;
    const nextGameNumber = games.length + 1;

    return (
        <div className="container mx-auto p-4 space-y-6">
            <WeekProgress wins={wins} losses={losses} gamesPlayed={games.length} target={15} />

            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">{currentWeek.custom_name || `Week ${currentWeek.week_number}`}</h1>
                <div className="flex gap-2">
                    <Button onClick={() => setRecordGameModalOpen(true)} disabled={games.length >= 15}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Record Game
                    </Button>
                     <Button variant="outline" onClick={endCurrentRun}>
                        <FlagOff className="mr-2 h-4 w-4" /> End Run
                    </Button>
                </div>
            </div>

            <Dialog open={isRecordGameModalOpen} onOpenChange={setRecordGameModalOpen}>
                <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Record a Game</DialogTitle>
                        <DialogDescription>
                            Enter the details for game #{nextGameNumber} of the week.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 min-h-0">
                        <GameRecordForm
                            squads={squads}
                            weekId={currentWeek.id}
                            nextGameNumber={nextGameNumber}
                            onSave={handleSave}
                            onCancel={() => setRecordGameModalOpen(false)}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            <WeekCompletionPopup 
                isOpen={showCompletionPopup} 
                onClose={() => setShowCompletionPopup(false)}
                week={justCompletedWeek}
            />

            <Tabs defaultValue="gamelog" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="gamelog"><ListChecks className="h-4 w-4 mr-2" />Game Log</TabsTrigger>
                <TabsTrigger value="stats"><BarChart2 className="h-4 w-4 mr-2" />Run Stats</TabsTrigger>
                <TabsTrigger value="performers"><Star className="h-4 w-4 mr-2" />Top Performers</TabsTrigger>
              </TabsList>
              <TabsContent value="gamelog" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {games.map(game => (
                        <GameCard key={game.id} game={game} />
                    ))}
                </div>
              </TabsContent>
               <TabsContent value="stats" className="mt-4">
                    <CurrentRunStats week={currentWeek} games={games} />
               </TabsContent>
              <TabsContent value="performers" className="mt-4">
                    <TopPerformers games={games} />
              </TabsContent>
            </Tabs>

        </div>
    );
};

export default CurrentWeek;
