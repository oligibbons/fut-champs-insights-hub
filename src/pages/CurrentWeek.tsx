import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
// import GameCard from '@/components/GameCard'; // This component does not exist in the project.
import WeekProgress from '@/components/WeekProgress';
import { Game, FutChampsWeek } from '@/types/futChampions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import GameRecordForm from '@/components/GameRecordForm';
import { useToast } from '@/hooks/use-toast';
import { Squad } from '@/types/squads';
import WeekCompletionPopup from '@/components/WeekCompletionPopup';

const CurrentWeek = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [currentWeek, setCurrentWeek] = useState<FutChampsWeek | null>(null);
    const [games, setGames] = useState<Game[]>([]);
    const [squads, setSquads] = useState<Squad[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRecordGameModalOpen, setRecordGameModalOpen] = useState(false);
    const [showCompletionPopup, setShowCompletionPopup] = useState(false);
    const [justCompletedWeek, setJustCompletedWeek] = useState<FutChampsWeek | null>(null);

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data: weekData, error: weekError } = await supabase
                .from('weekly_performances')
                .select('*')
                .eq('user_id', user.id)
                .eq('is_completed', false)
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
            }

            const { data: squadsData, error: squadsError } = await supabase
                .from('squads')
                .select('*, squad_players(*, players(*))')
                .eq('user_id', user.id);
            if (squadsError) throw squadsError;
            setSquads(squadsData || []);

        } catch (error: any) {
            console.error('Error fetching data:', error);
            toast({ title: "Error", description: "Failed to fetch current week data.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const startNewWeek = async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from('weekly_performances')
            .insert({ user_id: user.id })
            .select()
            .single();

        if (error) {
            toast({ title: "Error", description: "Could not start a new week.", variant: "destructive" });
        } else if (data) {
            setCurrentWeek(data);
            setGames([]);
            toast({ title: "Success", description: "New FUT Champs week started!" });
        }
    };
    
    const handleSave = async () => {
        await fetchData();
        setRecordGameModalOpen(false);
        const gamesPlayed = games.length + 1;
        if (gamesPlayed === 20) {
            if(currentWeek) {
                const { data: completedWeek, error } = await supabase
                    .from('weekly_performances')
                    .update({ is_completed: true })
                    .eq('id', currentWeek.id)
                    .select()
                    .single();

                if (error) {
                    toast({ title: "Error", description: "Failed to mark week as complete.", variant: "destructive" });
                } else {
                    setJustCompletedWeek(completedWeek);
                    setShowCompletionPopup(true);
                    setCurrentWeek(null);
                    setGames([]);
                }
            }
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!currentWeek) {
        return (
            <div className="text-center p-8">
                <h2 className="text-2xl font-semibold mb-4">No Active FUT Champs Week</h2>
                <p className="mb-6">Start a new week to begin tracking your games.</p>
                <Button onClick={startNewWeek}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Start New Week
                </Button>
            </div>
        );
    }
    
    const wins = games.filter(g => g.result === 'win').length;
    const losses = games.filter(g => g.result === 'loss').length;
    const nextGameNumber = games.length + 1;

    return (
        <div className="container mx-auto p-4">
            <WeekProgress wins={wins} losses={losses} gamesPlayed={games.length} />

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Current Week</h1>
                {games.length < 20 && (
                    <Button onClick={() => setRecordGameModalOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Record Game
                    </Button>
                )}
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* The GameCard component is missing, so the list of games cannot be displayed. */}
                {/* You will need to create or restore the GameCard.tsx component to see your games here. */}
                {/*
                {games.map(game => (
                    <GameCard key={game.id} game={game} />
                ))}
                */}
            </div>
        </div>
    );
};

export default CurrentWeek;
