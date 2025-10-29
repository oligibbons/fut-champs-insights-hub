import React, { useState, useEffect, useMemo, useRef } from 'react'; // Added React and useRef
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useGameVersion } from '@/contexts/GameVersionContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Squad } from '@/types/squads';
import { PlayerPerformance, Game, OpponentSquad } from '@/types/futChampions';
import { getRatingColor, getOverallGameRating, getDefensiveRating, getOffensiveRating, getPossessionRating } from '@/utils/gameRating';
import { Info, Shield, Sword, Users, BarChart2 } from 'lucide-react';

import DashboardSection from '@/components/DashboardSection';
import PlayerStatsForm from '@/components/PlayerStatsForm';
import OpponentSquadInput from './OpponentSquadInput';
import PenaltyShootoutInput from './PenaltyShootoutInput';

// Zod schema for game record
const gameRecordSchema = z.object({
  result: z.enum(['win', 'loss', 'draw']),
  score_own: z.number().min(0).max(50),
  score_opponent: z.number().min(0).max(50),
  game_mode: z.string().min(1, "Game mode is required"),
  opponent_name: z.string().optional(),
  match_notes: z.string().optional(),
  game_duration: z.number().min(90), // Assuming min duration based on previous code
  penalties: z.object({
    went_to_penalties: z.boolean(),
    own_score: z.number().min(0),
    opponent_score: z.number().min(0),
  }).optional(),
  opponentSquad: z.custom<OpponentSquad>().optional(),
  playerPerformances: z.array(z.object({
    id: z.string(), // player_id
    name: z.string(),
    position: z.string(),
    // --- FIX: Add isSub to the schema ---
    isSub: z.boolean(),
    minutes_played: z.any().transform(val => {
      const num = parseInt(String(val), 10);
      return isNaN(num) ? 0 : num;
    }).refine(val => val >= 0, { message: "Minutes must be 0 or more" }),
    rating: z.any().transform(val => {
      const num = parseFloat(String(val));
      return isNaN(num) ? 0 : num;
    }).refine(val => val >= 0 && val <= 10, { message: "Rating must be between 0 and 10" }),
    goals: z.any().transform(val => {
      const num = parseInt(String(val), 10);
      return isNaN(num) ? 0 : num;
    }).refine(val => val >= 0, { message: "Goals must be 0 or more" }),
    assists: z.any().transform(val => {
      const num = parseInt(String(val), 10);
      return isNaN(num) ? 0 : num;
    }).refine(val => val >= 0, { message: "Assists must be 0 or more" }),
    yellow_cards: z.any().transform(val => {
      const num = parseInt(String(val), 10);
      return isNaN(num) ? 0 : num;
    }).refine(val => val >= 0, { message: "Yellow cards must be 0 or more" }),
    red_cards: z.any().transform(val => {
      const num = parseInt(String(val), 10);
      return isNaN(num) ? 0 : num;
    }).refine(val => val >= 0, { message: "Red cards must be 0 or more" }),
    own_goals: z.any().transform(val => {
      const num = parseInt(String(val), 10);
      return isNaN(num) ? 0 : num;
    }).refine(val => val >= 0, { message: "Own goals must be 0 or more" }),
  })),
});

interface GameRecordFormProps {
  squad: Squad | null;
  onGameRecorded: (newGame: Game) => void;
  runId: string;
}

// Wrap with forwardRef
const GameRecordForm = React.forwardRef<HTMLDivElement, GameRecordFormProps>(({ squad, onGameRecorded, runId }, ref) => {
  const { user } = useAuth();
  const { gameVersion } = useGameVersion();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('match');

  const form = useForm<z.infer<typeof gameRecordSchema>>({
    resolver: zodResolver(gameRecordSchema),
    defaultValues: {
      result: 'win',
      score_own: 0,
      score_opponent: 0,
      game_mode: 'fut_champions',
      opponent_name: '',
      match_notes: '',
      game_duration: 90,
      penalties: {
        went_to_penalties: false,
        own_score: 0,
        opponent_score: 0,
      },
      opponentSquad: {
        formation: '4-4-2',
        rating: 85,
        chemistry: 100,
        playstyles: [],
        tactics: '',
      },
      playerPerformances: [],
    },
  });

  // Effect to reset player performances when squad changes
  useEffect(() => {
    if (squad && squad.startingXI && squad.substitutes) {
      // --- FIX: Add isSub flag to players ---
      const startingPlayers = squad.startingXI.map(pos => ({
        ...(pos.player),
        position: pos.position,
        player_id: pos.player!.id,
        isSub: false // Tag as starter
      })) || [];

      const subPlayers = squad.substitutes.map(pos => ({
        ...(pos.player),
        position: pos.position,
        player_id: pos.player!.id,
        isSub: true // Tag as substitute
      })) || [];

      const initialPerformances = [...startingPlayers, ...subPlayers].map(p => ({
        id: p.player_id!,
        name: p.name || 'Unknown Player',
        position: p.position || 'N/A',
        isSub: p.isSub, // <-- Pass the flag here
        minutes_played: p.isSub ? 0 : 90, // Default starters to 90, subs to 0
        goals: 0,
        assists: 0,
        rating: 7.0,
        yellow_cards: 0,
        red_cards: 0,
        own_goals: 0,
      }));

      form.setValue('playerPerformances', initialPerformances as any);
    }
  }, [squad, form]);

  const watchedResult = form.watch('result');
  const watchedGameDuration = form.watch('game_duration');
  const watchedPlayerPerformances = form.watch('playerPerformances');

  // Calculate overall rating
  const { overallRating, validPlayers } = useMemo(() => {
    const performances = watchedPlayerPerformances || [];
    const validPlayers = performances.filter(p => p.minutes_played > 0);
    if (validPlayers.length === 0) return { overallRating: 0, validPlayers: 0 };

    const totalRating = validPlayers.reduce((sum, p) => sum + Number(p.rating), 0);
    const avgRating = totalRating / validPlayers.length;
    return { overallRating: avgRating, validPlayers: validPlayers.length };
  }, [watchedPlayerPerformances]);

  const onSubmit = async (values: z.infer<typeof gameRecordSchema>) => {
    if (!user || !squad) {
      toast({
        title: "Error",
        description: "You must be logged in and have a squad selected.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);

    // Calculate game ratings
    const defensiveRating = getDefensiveRating(values.score_opponent);
    const offensiveRating = getOffensiveRating(values.score_own);
    const possessionRating = getPossessionRating(values.score_own, values.score_opponent, watchedResult); // Simple logic
    const overallGameRating = getOverallGameRating(
      values.score_own,
      values.score_opponent,
      watchedResult,
      overallRating, // avg player rating
      validPlayers
    );

    const gameData: Omit<Game, 'id' | 'created_at'> = {
      user_id: user.id,
      run_id: runId,
      squad_id: squad.id,
      game_version: gameVersion,
      game_mode: values.game_mode,
      result: values.result,
      score_own: values.score_own,
      score_opponent: values.score_opponent,
      went_to_penalties: values.penalties?.went_to_penalties || false,
      penalties_own: values.penalties?.own_score,
      penalties_opponent: values.penalties?.opponent_score,
      opponent_name: values.opponent_name,
      notes: values.match_notes,
      game_duration: values.game_duration,
      // Ratings
      overall_rating: overallGameRating,
      offensive_rating: offensiveRating,
      defensive_rating: defensiveRating,
      possession_rating: possessionRating,
      // Opponent Squad
      opponent_formation: values.opponentSquad?.formation,
      opponent_rating: values.opponentSquad?.rating,
      opponent_chemistry: values.opponentSquad?.chemistry,
      opponent_playstyles: values.opponentSquad?.playstyles,
      opponent_tactics: values.opponentSquad?.tactics,
    };

    try {
      // 1. Insert the game
      // Assuming 'games' is the correct table name based on your CurrentRun.tsx
      const { data: game, error: gameError } = await supabase
        .from('games')
        .insert(gameData)
        .select()
        .single();

      if (gameError) throw gameError;

      // 2. Prepare player performances
      const performances = values.playerPerformances
        .filter(p => p.minutes_played > 0) // Only save players who played
        .map(p => ({
          game_id: game.id,
          player_id: p.id,
          user_id: user.id,
          run_id: runId, // Ensure run_id is included if your table requires it
          squad_id: squad.id, // Ensure squad_id is included if your table requires it
          position: p.position,
          minutes_played: p.minutes_played,
          rating: p.rating,
          goals: p.goals,
          assists: p.assists,
          yellow_cards: p.yellow_cards,
          red_cards: p.red_cards,
          own_goals: p.own_goals,
        }));

      // 3. Insert player performances
      if (performances.length > 0) {
        const { error: perfError } = await supabase
          .from('player_performances')
          .insert(performances);

        if (perfError) throw perfError;
      }

      toast({
        title: "Game Recorded!",
        description: `Your ${values.result} (${values.score_own}-${values.score_opponent}) has been saved.`,
      });
      onGameRecorded(game);
      form.reset(); // Reset form to default values

      // Reset squad performances in the form state
       if (squad && squad.startingXI && squad.substitutes) {
          const startingPlayers = squad.startingXI.map(pos => ({
            ...(pos.player),
            position: pos.position,
            player_id: pos.player!.id,
            isSub: false // Tag as starter
          })) || [];

          const subPlayers = squad.substitutes.map(pos => ({
            ...(pos.player),
            position: pos.position,
            player_id: pos.player!.id,
            isSub: true // Tag as substitute
          })) || [];

          const initialPerformances = [...startingPlayers, ...subPlayers].map(p => ({
            id: p.player_id!,
            name: p.name || 'Unknown Player',
            position: p.position || 'N/A',
            isSub: p.isSub, // Pass the flag here
            minutes_played: p.isSub ? 0 : 90, // Default starters to 90, subs to 0
            goals: 0,
            assists: 0,
            rating: 7.0,
            yellow_cards: 0,
            red_cards: 0,
            own_goals: 0,
          }));
        form.setValue('playerPerformances', initialPerformances as any);
      }

      setActiveTab('match'); // Go back to first tab

    } catch (error: any) {
      console.error("Error recording game:", error);
      toast({
        title: "Error saving game",
        description: error.message || "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const gameModeOptions = [
    { value: 'fut_champions', label: 'FUT Champions' },
    { value: 'rivals', label: 'Rivals' },
    { value: 'squad_battles', label: 'Squad Battles' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'draft', label: 'Draft' },
    { value: 'other', label: 'Other' },
  ];

  return (
    // Attach the forwarded ref here
    <div ref={ref}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* --- FIX: Added glass-card styling --- */}
            <TabsList className="glass-card rounded-2xl shadow-xl border-0 p-2 h-auto grid w-full grid-cols-3">
              <TabsTrigger value="match" className="rounded-xl">Match</TabsTrigger>
              <TabsTrigger value="opponent" className="rounded-xl">Opponent</TabsTrigger>
              <TabsTrigger value="players" className="rounded-xl">Players</TabsTrigger>
            </TabsList>
            {/* --- END FIX --- */}

            {/* --- MATCH TAB --- */}
            <TabsContent value="match">
              <DashboardSection title="Match Result" info="Record the final score and outcome.">
                <div className="grid grid-cols-3 gap-4">
                  {/* Result */}
                  <FormField
                    control={form.control}
                    name="result"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Result</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select result" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="win">Win</SelectItem>
                            <SelectItem value="loss">Loss</SelectItem>
                            <SelectItem value="draw">Draw</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Score Own */}
                  <FormField
                    control={form.control}
                    name="score_own"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Score</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Score Opponent */}
                  <FormField
                    control={form.control}
                    name="score_opponent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opponent Score</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Penalties */}
                <Controller
                  control={form.control}
                  name="penalties"
                  render={({ field }) => (
                    <PenaltyShootoutInput
                      value={field.value || { went_to_penalties: false, own_score: 0, opponent_score: 0 }}
                      onChange={field.onChange}
                    />
                  )}
                />
              </DashboardSection>

              <DashboardSection title="Match Details" info="Provide extra context about the game.">
                  {/* Game Mode */}
                   <FormField
                    control={form.control}
                    name="game_mode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Game Mode</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select game mode" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {gameModeOptions.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Opponent Name */}
                  <FormField
                    control={form.control}
                    name="opponent_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opponent Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. FUT_Champ_123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Match Notes */}
                  <FormField
                    control={form.control}
                    name="match_notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Match Notes</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. He was very good at cutbacks..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </DashboardSection>
            </TabsContent>

            {/* --- OPPONENT TAB --- */}
            <TabsContent value="opponent">
              <Controller
                control={form.control}
                name="opponentSquad"
                render={({ field }) => (
                  <OpponentSquadInput
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </TabsContent>

            {/* --- PLAYERS TAB --- */}
            <TabsContent value="players">
              {/* Removed squad?.name interpolation to avoid potential 'undefined' */}
              <DashboardSection title="Player Performances" info="Record stats for each player in this match.">
                {!squad ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Users className="mx-auto h-12 w-12" />
                    <p className="mt-4">Please select a squad on the 'Squad' tab to record player stats.</p>
                  </div>
                ) : (
                  <PlayerStatsForm
                    key={squad.id} // Re-mounts component when squad changes
                    players={watchedPlayerPerformances}
                    onStatsChange={players => form.setValue('playerPerformances', players)}
                    gameDuration={watchedGameDuration}
                  />
                )}
              </DashboardSection>
            </TabsContent>

          </Tabs>

          {/* --- FORM SUBMISSION & RATING --- */}
          <Card className="glass-card">
            <CardContent className="pt-6">
               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                      <BarChart2 className="h-6 w-6 text-primary" />
                      <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">Est. Game Rating</span>
                          <span className={`text-2xl font-bold ${getRatingColor(overallRating)}`}>
                              {overallRating.toFixed(1)}
                          </span>
                      </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading || !squad}
                    className="w-full sm:w-auto"
                  >
                    {isLoading ? "Saving..." : "Record Game"}
                  </Button>
               </div>
               {!squad && (
                  <p className="text-xs text-destructive-foreground text-center mt-4 sm:text-right">
                      You must select a squad to record a game.
                  </p>
               )}
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}); // Close forwardRef

GameRecordForm.displayName = 'GameRecordForm'; // Add display name

export default GameRecordForm;