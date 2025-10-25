import { useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  FutChampsRun,
  Game,
  PlayerPerformance,
  PenaltyShootout,
} from '@/types/futChampions';
import GameRecordForm from '@/components/GameRecordForm';
import GameListItem from '@/components/GameListItem';
import CurrentRunStats from '@/components/CurrentRunStats';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trophy } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import GameEditModal from '@/components/GameEditModal';
import { useGameVersion } from '@/contexts/GameVersionContext';
import RunNamingModal from '@/components/RunNamingModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import QualifierSystem from '@/components/QualifierSystem';

const CurrentRun = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { gameVersion } = useGameVersion();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [isNamingModalOpen, setIsNamingModalOpen] = useState(false);
  const [showQualifiers, setShowQualifiers] = useState(false);

  const fetchCurrentRun = async () => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('fut_champs_runs')
      .select('*, games(*, player_performances(*), penalty_shootout(*))')
      .eq('user_id', user.id)
      .eq('game_version', gameVersion)
      .is('completed_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is fine
      console.error('Error fetching current run:', error);
      throw new Error(error.message);
    }
    return data as FutChampsRun | null;
  };

  const {
    data: futChampsRun,
    isLoading,
    refetch,
  } = useQuery<FutChampsRun | null>({
    queryKey: ['currentRun', user?.id, gameVersion],
    queryFn: fetchCurrentRun,
    enabled: !!user,
  });

  const startNewRunMutation = useMutation({
    mutationFn: async ({ name, type }: { name: string; type: 'qualifiers' | 'finals' }) => {
      if (!user) throw new Error('User not logged in');
      const { data, error } = await supabase
        .from('fut_champs_runs')
        .insert({
          user_id: user.id,
          name: name,
          game_version: gameVersion,
          run_type: type,
          ...(type === 'qualifiers' && {
            qualifier_games_played: 0,
            qualifier_points: 0,
            qualified: false,
          })
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: 'New Run Started',
        description: `Your new run "${data.name}" has begun.`,
        className: 'bg-green-500 text-white',
      });
      queryClient.invalidateQueries({ queryKey: ['currentRun'] });
      queryClient.invalidateQueries({ queryKey: ['futChampsRuns'] });
      setIsNamingModalOpen(false);
      setShowQualifiers(data.run_type === 'qualifiers');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to start new run: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const addGameMutation = useMutation({
    mutationFn: async (newGameData: Omit<Game, 'id' | 'created_at' | 'run_id'>) => {
      if (!futChampsRun) throw new Error('No active run');

      const {
        player_performances,
        penalty_shootout,
        ...gameData
      } = newGameData;

      // 1. Insert the game
      const { data: game, error: gameError } = await supabase
        .from('games')
        .insert({ ...gameData, run_id: futChampsRun.id })
        .select()
        .single();

      if (gameError) throw new Error(`Game insert error: ${gameError.message}`);

      // 2. Insert player performances
      if (player_performances && player_performances.length > 0) {
        const performancesWithGameId = player_performances.map((p) => ({
          ...p,
          game_id: game.id,
          user_id: user?.id, // Ensure user_id is set
          player_name: p.name, // Map name to player_name if needed by schema
        }));

        const { error: perfError } = await supabase
          .from('player_performances')
          .insert(performancesWithGameId);

        if (perfError) {
          console.error('Error inserting performances:', perfError);
          // Decide if you want to throw here, which would roll back
          throw new Error(`Performance insert error: ${perfError.message}`);
        }
      }

      // 3. Insert penalty shootout if exists
      if (penalty_shootout) {
        const { error: penError } = await supabase
          .from('penalty_shootout')
          .insert({ ...penalty_shootout, game_id: game.id });

        if (penError)
          throw new Error(`Penalty shootout insert error: ${penError.message}`);
      }
      
      // 4. Update run stats if it's a qualifier
      if (futChampsRun.run_type === 'qualifiers') {
        const newPoints = (futChampsRun.qualifier_points || 0) + (newGameData.result === 'win' ? 4 : (newGameData.result === 'loss' ? 1 : 0));
        const newGamesPlayed = (futChampsRun.qualifier_games_played || 0) + 1;
        const qualified = newPoints >= 20; // Assuming 20 points to qualify

        const { error: runUpdateError } = await supabase
          .from('fut_champs_runs')
          .update({
            qualifier_points: newPoints,
            qualifier_games_played: newGamesPlayed,
            qualified: qualified,
            ...(newGamesPlayed === 10 && { completed_at: new Date().toISOString() }) // Complete run after 10 games
          })
          .eq('id', futChampsRun.id);

        if (runUpdateError) throw new Error(`Run update error: ${runUpdateError.message}`);
      }


      return game;
    },
    onSuccess: () => {
      toast({
        title: 'Game Recorded',
        description: 'Your match has been added to the run.',
        className: 'bg-green-500 text-white',
      });
      queryClient.invalidateQueries({ queryKey: ['currentRun'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      setIsFormVisible(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to add game: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const updateGameMutation = useMutation({
    mutationFn: async (updatedGame: Game) => {
      const {
        id: gameId,
        player_performances,
        penalty_shootout,
        ...gameData
      } = updatedGame;

      // 1. Update the game
      const { error: gameError } = await supabase
        .from('games')
        .update(gameData)
        .eq('id', gameId);
      if (gameError) throw new Error(`Game update error: ${gameError.message}`);

      // 2. Delete existing player performances
      const { error: deletePerfError } = await supabase
        .from('player_performances')
        .delete()
        .eq('game_id', gameId);
      if (deletePerfError)
        throw new Error(`Delete perf error: ${deletePerfError.message}`);

      // 3. Insert new player performances
      if (player_performances && player_performances.length > 0) {
        const performancesWithGameId = player_performances.map((p) => ({
          ...p,
          game_id: gameId,
          user_id: user?.id,
          player_name: p.name,
        }));
        const { error: insertPerfError } = await supabase
          .from('player_performances')
          .insert(performancesWithGameId);
        if (insertPerfError)
          throw new Error(`Insert perf error: ${insertPerfError.message}`);
      }

      // 4. Delete existing penalty shootout
      const { error: deletePenError } = await supabase
        .from('penalty_shootout')
        .delete()
        .eq('game_id', gameId);
      if (deletePenError)
        console.error('Error deleting old shootout, continuing...'); // Non-critical

      // 5. Insert new penalty shootout if exists
      if (penalty_shootout) {
        const { error: insertPenError } = await supabase
          .from('penalty_shootout')
          .insert({ ...penalty_shootout, game_id: gameId });
        if (insertPenError)
          throw new Error(`Insert pen error: ${insertPenError.message}`);
      }

      // 6. Recalculate qualifier stats if needed
      if (futChampsRun?.run_type === 'qualifiers') {
        // Refetch the entire run to trigger recalculation
        await refetch();
        const games = futChampsRun.games || [];
        let newPoints = 0;
        games.forEach(game => {
          if (game.id === updatedGame.id) {
            newPoints += updatedGame.result === 'win' ? 4 : (updatedGame.result === 'loss' ? 1 : 0);
          } else {
            newPoints += game.result === 'win' ? 4 : (game.result === 'loss' ? 1 : 0);
          }
        });
        const newGamesPlayed = games.length;
        const qualified = newPoints >= 20;

        const { error: runUpdateError } = await supabase
          .from('fut_champs_runs')
          .update({
            qualifier_points: newPoints,
            qualifier_games_played: newGamesPlayed,
            qualified: qualified,
          })
          .eq('id', futChampsRun.id);
        
        if (runUpdateError) throw new Error(`Run update error: ${runUpdateError.message}`);
      }
    },
    onSuccess: () => {
      toast({
        title: 'Game Updated',
        description: 'Your match has been successfully updated.',
        className: 'bg-blue-500 text-white',
      });
      queryClient.invalidateQueries({ queryKey: ['currentRun'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      setEditingGame(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update game: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const deleteGameMutation = useMutation({
    mutationFn: async (gameId: string) => {
      // Deletions will cascade based on foreign key constraints
      const { error } = await supabase.from('games').delete().eq('id', gameId);
      if (error) throw new Error(error.message);

      // Recalculate qualifier stats if needed
      if (futChampsRun?.run_type === 'qualifiers') {
        const remainingGames = futChampsRun.games?.filter(g => g.id !== gameId) || [];
        let newPoints = 0;
        remainingGames.forEach(game => {
          newPoints += game.result === 'win' ? 4 : (game.result === 'loss' ? 1 : 0);
        });
        const newGamesPlayed = remainingGames.length;
        const qualified = newPoints >= 20;

        const { error: runUpdateError } = await supabase
          .from('fut_champs_runs')
          .update({
            qualifier_points: newPoints,
            qualifier_games_played: newGamesPlayed,
            qualified: qualified,
          })
          .eq('id', futChampsRun.id);
        
        if (runUpdateError) throw new Error(`Run update error: ${runUpdateError.message}`);
      }
    },
    onSuccess: () => {
      toast({
        title: 'Game Deleted',
        description: 'Your match has been removed from the run.',
        className: 'bg-red-500 text-white',
      });
      queryClient.invalidateQueries({ queryKey: ['currentRun'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete game: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const completeRunMutation = useMutation({
    mutationFn: async () => {
      if (!futChampsRun) throw new Error('No active run');
      const { error } = await supabase
        .from('fut_champs_runs')
        .update({ completed_at: new Date().toISOString() })
        .eq('id', futChampsRun.id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({
        title: 'Run Completed!',
        description: 'Well played! Your run has been archived.',
        className: 'bg-green-500 text-white',
      });
      queryClient.invalidateQueries({ queryKey: ['currentRun'] });
      queryClient.invalidateQueries({ queryKey: ['futChampsRuns'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to complete run: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const handleStartRun = ({ name, type }: { name: string; type: 'qualifiers' | 'finals' }) => {
    startNewRunMutation.mutate({ name, type });
  };

  const handleSubmitGame = (
    gameData: Omit<Game, 'id' | 'created_at' | 'run_id'>,
    players: PlayerPerformance[],
    penaltyShootout: PenaltyShootout | null,
  ) => {
    const newGameData = {
      ...gameData,
      player_performances: players,
      penalty_shootout: penaltyShootout,
    };
    addGameMutation.mutate(newGameData);
  };

  const handleUpdateGame = (
    gameData: Omit<Game, 'created_at' | 'run_id'>,
    players: PlayerPerformance[],
    penaltyShootout: PenaltyShootout | null,
  ) => {
    const updatedGame = {
      ...gameData,
      run_id: futChampsRun!.id,
      created_at: editingGame!.created_at, // Preserve original creation time
      player_performances: players,
      penalty_shootout: penaltyShootout,
    };
    updateGameMutation.mutate(updatedGame as Game);
  };

  const handleDeleteGame = (gameId: string) => {
    deleteGameMutation.mutate(gameId);
  };

  // ----------------------------------------------------------------
  // FIX 1: Default 'games' to '|| []'
  // This ensures games is ALWAYS an array, even if futChampsRun is null
  // or futChampsRun.games is null/undefined.
  // ----------------------------------------------------------------
  const games = useMemo(() => futChampsRun?.games || [], [futChampsRun]);

  const maxGames = futChampsRun?.run_type === 'qualifiers' ? 10 : 20;

  // ----------------------------------------------------------------
  // FIX 2: Handle the main loading state
  // ----------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // ----------------------------------------------------------------
  // FIX 3: Handle the "No Active Run" state
  // ----------------------------------------------------------------
  if (!futChampsRun) {
    return (
      <div className="container mx-auto p-4 text-center">
        <Card className="glass-card shadow-lg">
          <CardContent className="p-10 flex flex-col items-center justify-center">
            <Trophy className="h-16 w-16 text-fifa-gold mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No Active Run</h2>
            <p className="text-gray-300 mb-6">
              Start a new FUT Champions run to begin tracking your games.
            </p>
            <Button
              onClick={() => setIsNamingModalOpen(true)}
              className="bg-fifa-green hover:bg-fifa-green/80 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Start New Run
            </Button>
            <RunNamingModal
              isOpen={isNamingModalOpen}
              onClose={() => setIsNamingModalOpen(false)}
              onSubmit={handleStartRun}
              isLoading={startNewRunMutation.isPending}
            />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // If we have a run, but 'games' is somehow still not an array
  // (should be covered by FIX 1, but as a fallback)
  const safeGames = Array.isArray(games) ? games : [];
  const gamesPlayed = safeGames.length;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <CurrentRunStats run={futChampsRun} games={safeGames} />
      
      {futChampsRun.run_type === 'qualifiers' && (
        <QualifierSystem run={futChampsRun} />
      )}

      {gamesPlayed < maxGames && !isFormVisible && (
        <Button
          onClick={() => setIsFormVisible(true)}
          className="w-full bg-fifa-green hover:bg-fifa-green/80 text-white shadow-lg"
          size="lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Record Game {gamesPlayed + 1}
        </Button>
      )}

      {isFormVisible && (
        <GameRecordForm
          onSubmit={handleSubmitGame}
          onCancel={() => setIsFormVisible(false)}
          isLoading={addGameMutation.isPending}
          gameNumber={gamesPlayed + 1}
        />
      )}

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Match History</h3>
        {safeGames.length === 0 ? (
          <p className="text-center text-gray-400">No games recorded yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {safeGames
              .sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime(),
              )
              .map((game, index) => (
                <GameListItem
                  key={game.id}
                  game={game}
                  gameNumber={gamesPlayed - index}
                  onEdit={() => setEditingGame(game)}
                  onDelete={handleDeleteGame}
                  isDeleting={deleteGameMutation.isPending && deleteGameMutation.variables === game.id}
                />
              ))}
          </div>
        )}
      </div>

      {gamesPlayed >= maxGames && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              className="w-full bg-fifa-gold hover:bg-fifa-gold/80 text-black font-bold shadow-lg"
              size="lg"
            >
              <Trophy className="h-5 w-5 mr-2" />
              Complete Run
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="glass-card text-white border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle>Complete Your Run?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300">
                Are you sure you want to complete this run? This will archive
                the run and you can start a new one.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-700 hover:bg-gray-600 text-white border-0">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => completeRunMutation.mutate()}
                className="bg-fifa-green hover:bg-fifa-green/80 text-white"
                disabled={completeRunMutation.isPending}
              >
                {completeRunMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Complete Run'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {editingGame && (
        <GameEditModal
          game={editingGame}
          isOpen={!!editingGame}
          onClose={() => setEditingGame(null)}
          onSubmit={handleUpdateGame}
          isLoading={updateGameMutation.isPending}
        />
      )}
      
      <RunNamingModal
        isOpen={isNamingModalOpen}
        onClose={() => setIsNamingModalOpen(false)}
        onSubmit={handleStartRun}
        isLoading={startNewRunMutation.isPending}
      />
    </div>
  );
};

export default CurrentRun;
