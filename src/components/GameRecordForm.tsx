import { useEffect, useCallback, useState, memo, useMemo } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client'; // Keep if needed for other things, but parent handles submission
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Toggle } from '@/components/ui/toggle';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent } from '@/components/ui/card';
import { Save, Loader2, UserPlus, Users, Plus, Minus, Trophy, Shield, BarChartHorizontal, Star, X } from 'lucide-react';
import PlayerStatsForm from './PlayerStatsForm'; // Assuming this component exists and handles array of player stats
import { Squad, PlayerCard, SquadPlayer } from '@/types/squads';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Game, PlayerPerformanceInsert, TeamStatisticsInsert } from '@/types/futChampions';
import { get, set, isEqual } from 'lodash';
import { useAllSquadsData, SquadWithPlayers } from '@/hooks/useAllSquadsData'; // Import the new hook
import { useTheme } from '@/hooks/useTheme';

// --- ZOD SCHEMA ---
// Comprehensive schema matching DB tables
const gameFormSchema = z.object({
  // From game_results
  game_number: z.number().min(0), // Set by parent
  user_goals: z.coerce.number().min(0),
  opponent_goals: z.coerce.number().min(0),
  result: z.enum(['win', 'loss']),
  overtime_result: z // Needed for Draw logic
    .enum(['none', 'win_ot', 'loss_ot', 'win_pen', 'loss_pen'])
    .default('none'),
  opponent_skill: z.number().min(1).max(10),
  opponent_username: z.string().optional(),
  game_context: z.string().default('normal'),
  comments: z.string().optional(),
  duration: z.coerce.number().min(1),
  stress_level: z.number().min(1).max(10),
  squad_id: z.string().uuid({ message: "Please select a squad." }), // Changed from min(1)
  server_quality: z.number().min(1).max(10),
  cross_play_enabled: z.boolean(),
  tags: z.array(z.string()).optional(),

  // From team_statistics (nested object)
  team_stats: z.object({
    possession: z.coerce.number().min(0).max(100),
    passes: z.coerce.number().min(0),
    pass_accuracy: z.coerce.number().min(0).max(100),
    shots: z.coerce.number().min(0),
    shots_on_target: z.coerce.number().min(0),
    corners: z.coerce.number().min(0),
    fouls: z.coerce.number().min(0),
    yellow_cards: z.coerce.number().min(0),
    red_cards: z.coerce.number().min(0),
    expected_goals: z.coerce.number().min(0).step(0.1),
    expected_goals_against: z.coerce.number().min(0).step(0.1),
    // dribble_success_rate: z.coerce.number().min(0).max(100).optional(), // Optional field
  }),

  // From player_performances (array of objects)
  player_stats: z.array(
    z.object({
      id: z.string().uuid(), // player_id
      name: z.string(), // player_name (for display)
      position: z.string(),
      minutes_played: z.coerce.number().min(0).max(120),
      goals: z.coerce.number().min(0),
      assists: z.coerce.number().min(0),
      rating: z.coerce.number().min(0).max(10).step(0.1),
      yellow_cards: z.coerce.number().min(0).max(2), // Technically can have 2 yellows before red
      red_cards: z.coerce.number().min(0).max(1),
      own_goals: z.coerce.number().min(0),
    })
  ).optional(),
});

type GameFormData = z.infer<typeof gameFormSchema>;

// Match Tags Data (Keep this extensive list)
const matchTags = [
    { id: 'dominantWin', name: 'Dominant Win', description: 'A win where you dominated your opponent.' },
    { id: 'deservedLoss', name: 'Deserved Loss', description: 'A loss where you didn’t deserve to win.' },
    { id: 'closeGame', name: 'Close Game', description: 'A game where irrespective of the result, it was tightly contested.' },
    { id: 'extraTime', name: 'Extra Time', description: 'A game that went to Extra Time.', context: 'extra_time' },
    { id: 'penalties', name: 'Penalties', description: 'A game that went all the way to penalties.', context: 'penalties' },
    { id: 'opponentRageQuit', name: 'Opponent Rage Quit', description: 'A game where the opponent quit while you were winning.', context: 'rage_quit' },
    { id: 'iRageQuit', name: 'I Rage Quit', description: 'A game where you quit out after being behind.', context: 'rage_quit_own' }, // Need distinct context?
    { id: 'freeWinReceived', name: 'Free Win Received', description: 'A game where the opponent gifted you a win. Does not impact performance stats.', specialRule: 'no_stats', context: 'free_win' },
    { id: 'freeWinGiven', name: 'Free Win Given Away', description: 'A game where you gifted the opponent a win. Does not impact performance stats.', specialRule: 'no_stats', context: 'free_win_given' }, // Need distinct context?
    { id: 'disconnected', name: 'Disconnected', description: 'A game where you were disconnected by the servers. Does not impact performance stats.', specialRule: 'no_stats', context: 'disconnect' },
    { id: 'badServers', name: 'Bad Servers', description: 'A game where the servers made gameplay challenging.' },
    { id: 'frustratingGame', name: 'Frustrating Game', description: 'A game that caused you significant frustration.' },
    { id: 'stressful', name: 'Stressful', description: 'A game that was stressful for you.' },
    { id: 'skillGod', name: 'Skill God', description: 'A game against an opponent who uses a high level of skill moves effectively.' },
    { id: 'undeservedLoss', name: 'Undeserved Loss', description: 'A game where you lost, but didn’t deserve to.' },
    { id: 'undeservedWin', name: 'Undeserved Win', description: 'A game where you won, but didn’t deserve to.' },
    { id: 'comebackWin', name: 'Comeback Win', description: 'A game where you came from behind to win.' },
    { id: 'bottledLeadLoss', name: 'Bottled Lead Loss', description: 'A game where you lost from a winning position.' },
    { id: 'goalFest', name: 'Goal Fest', description: 'A game with a large number of goals (typically 8+).' },
    { id: 'defensiveBattle', name: 'Defensive Battle', description: 'A game where both players relied heavily on defending well.' },
    { id: 'gameToBeProudOf', name: 'Game To Be Proud Of', description: 'A game that regardless of the result, you can be proud of.' },
    { id: 'hacker', name: 'Hacker', description: 'A game where you faced a hacker.', context: 'hacker' },
    { id: 'confirmedPro', name: 'Confirmed Pro Opponent', description: 'A game where you faced a confirmed professional FC player.' },
    { id: 'eliteOpponent', name: 'Elite Opponent', description: 'A game against an elite-level player (possibly pro, but not confirmed).' },
    { id: 'cutBackMerchant', name: 'Cut Back Merchant', description: 'An opponent whose sole game plan was to score cutbacks.' },
    { id: 'defensiveMasterclass', name: 'Defensive Masterclass', description: 'A game where you defended to a very high level.' },
    { id: 'attackingMasterclass', name: 'Attacking Masterclass', description: 'A game where you attacked to a very high level.' },
    { id: 'defensiveDunce', name: 'Defensive Dunce', description: 'A game where you struggled to defend, to the point of embarrassment.' },
    { id: 'attackingAmateur', name: 'Attacking Amateur', description: 'A game where you couldn’t attack to save your life.' },
    { id: 'pay2WinRat', name: 'Pay2Win Rat', description: 'An opponent with a team that could only be achieved by spending a fortune.' },
    { id: 'metaRat', name: 'Meta Rat', description: 'An opponent who uses every possible meta tactic/technique to get the win.' },
    { id: 'opponentRubberBanded', name: 'Opponent Rubber Banded', description: 'The opponent put their controller down and stopped playing.' },
    { id: 'iRubberBanded', name: 'I Rubber Banded', description: 'You put your controller down and stopped playing at some point.' },
    { id: 'poorQualityOpponent', name: 'Poor Quality Opponent', description: 'An opponent who is simply not very good at the game.' },
    { id: 'fairResult', name: 'Fair Result', description: 'Regardless of who won or lost, the result was a fair reflection of the performance.' },
    { id: 'myOwnWorstEnemy', name: 'My Own Worst Enemy', description: 'Your own consistent mistakes caused you significant problems.' },
    { id: 'funGame', name: 'Fun Game', description: 'A game that you enjoyed playing, irrespective of the result.' },
];

// Helper component for number inputs
const NumberInputWithSteppers = memo(({ control, name, label, step = 1, min = 0, max = Infinity, className = '', inputClassName = 'text-center', minInputWidth = 'w-14', adjustValue, getValues }: any) => {
    const currentValue = get(getValues(), name, min); // Default to min if undefined
    const isMin = currentValue <= min;
    const isMax = currentValue >= max;

    return (
        <div className={`space-y-1 ${className}`}>
            <Label htmlFor={name} className="text-sm">{label}</Label>
            <div className="flex items-center gap-1">
                <Button
                    type="button" variant="outline" size="icon" className="w-8 h-8 p-0"
                    onClick={() => adjustValue(name, -1, step, min, max)}
                    onMouseDown={(e) => e.preventDefault()}
                    disabled={isMin}
                    aria-label={`Decrease ${label}`}
                >
                    <Minus className="h-3 w-3" />
                </Button>
                <Controller
                    name={name}
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            id={name}
                            type="text"
                            inputMode={step < 1 ? "decimal" : "numeric"}
                            className={`h-8 text-sm font-semibold ${inputClassName} ${minInputWidth}`}
                            onChange={(e) => {
                                let val = e.target.value;
                                // Allow decimal points if step is < 1
                                if (step < 1 && val.match(/^\d*\.?\d*$/)) {
                                    field.onChange(val);
                                } else if (step >= 1 && val.match(/^\d*$/)) {
                                     field.onChange(val === '' ? '' : parseInt(val, 10)); // Allow empty string temp.
                                }
                            }}
                             onBlur={(e) => { // Coerce on blur
                                let val = parseFloat(e.target.value);
                                if (isNaN(val)) val = min; // Default to min if invalid
                                val = Math.max(min, Math.min(max, val));
                                field.onChange(step < 1 ? parseFloat(val.toFixed(1)) : Math.round(val));
                            }}
                            value={field.value ?? ''} // Handle undefined/null value
                        />
                    )}
                />
                <Button
                    type="button" variant="outline" size="icon" className="w-8 h-8 p-0"
                    onClick={() => adjustValue(name, 1, step, min, max)}
                    onMouseDown={(e) => e.preventDefault()}
                    disabled={isMax}
                     aria-label={`Increase ${label}`}
                >
                    <Plus className="h-3 w-3" />
                </Button>
            </div>
             {/* Display validation errors */}
            <Controller name={name} control={control} render={({ fieldState: { error } }) => error ? <p className="text-xs text-red-500 mt-1">{error.message}</p> : null} />
        </div>
    );
});

// Props for the new form
interface GameRecordFormProps {
  onSubmit: (
    gameData: Omit<Game, 'id' | 'created_at' | 'week_id' | 'score_line'>, // Parent calculates score_line
    playerPerformances: PlayerPerformanceInsert[],
    teamStats: TeamStatisticsInsert
  ) => void;
  isLoading: boolean;
  game?: Game & { team_stats?: TeamStatisticsInsert }; // Allow passing existing game with stats for editing
  weekId: string; // The ID of the current weekly_performance run
  gameVersion: string;
  nextGameNumber: number; // The game number for a *new* game
  onCancel: () => void;
}

// --- MAIN FORM COMPONENT ---
const GameRecordForm = ({
  onSubmit,
  isLoading,
  game, // Optional: for editing mode
  weekId,
  gameVersion,
  nextGameNumber,
  onCancel,
}: GameRecordFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { currentTheme } = useTheme();
  const { squads, loading: squadsLoading, error: squadsError } = useAllSquadsData(); // Use the new hook

  const isEditing = !!game?.id;

  const defaultValues = useMemo(() => {
    // Basic defaults
    const baseDefaults: Partial<GameFormData> = {
      game_number: isEditing ? game.game_number : nextGameNumber,
      user_goals: 0,
      opponent_goals: 0,
      result: 'win',
      overtime_result: 'none',
      opponent_skill: 5,
      opponent_username: '',
      game_context: 'normal',
      comments: '',
      duration: 90,
      stress_level: 5,
      squad_id: squads.find(s => s.is_default)?.id || squads[0]?.id || '', // Default to default or first squad
      server_quality: 5,
      cross_play_enabled: false,
      tags: [],
      team_stats: {
        possession: 50, passes: 100, pass_accuracy: 75, shots: 10, shots_on_target: 5,
        corners: 3, fouls: 8, yellow_cards: 0, red_cards: 0,
        expected_goals: 1.0, expected_goals_against: 1.0,
      },
      player_stats: [], // Will be populated by useEffect
    };

    // If editing, merge game data
    if (isEditing && game) {
      return {
        ...baseDefaults,
        game_number: game.game_number,
        user_goals: game.user_goals ?? 0,
        opponent_goals: game.opponent_goals ?? 0,
        result: game.result,
        overtime_result: game.overtime_result ?? 'none',
        opponent_skill: game.opponent_skill ?? 5,
        opponent_username: game.opponent_username ?? '',
        game_context: game.game_context ?? 'normal',
        comments: game.comments ?? '',
        duration: game.duration ?? 90,
        stress_level: game.stress_level ?? 5,
        squad_id: game.squad_used ?? baseDefaults.squad_id, // Use saved squad or default
        server_quality: game.server_quality ?? 5,
        cross_play_enabled: game.cross_play_enabled ?? false,
        tags: game.tags ?? [],
        team_stats: game.team_stats ? { // Use saved team stats if available
             possession: game.team_stats.possession ?? 50,
             passes: game.team_stats.passes ?? 100,
             pass_accuracy: game.team_stats.pass_accuracy ?? 75,
             shots: game.team_stats.shots ?? 10,
             shots_on_target: game.team_stats.shots_on_target ?? 5,
             corners: game.team_stats.corners ?? 3,
             fouls: game.team_stats.fouls ?? 8,
             yellow_cards: game.team_stats.yellow_cards ?? 0,
             red_cards: game.team_stats.red_cards ?? 0,
             expected_goals: game.team_stats.expected_goals ?? 1.0,
             expected_goals_against: game.team_stats.expected_goals_against ?? 1.0,
        } : baseDefaults.team_stats,
        // Player stats population handled by useEffect based on squad_id
        player_stats: (game.player_performances || []).map(p => ({ // Map existing performances
             id: p.player_id || p.id, // Assuming player_performances has player_id or id maps to player_id
             name: p.player_name,
             position: p.position,
             minutes_played: p.minutes_played ?? 90,
             goals: p.goals ?? 0,
             assists: p.assists ?? 0,
             rating: p.rating ?? 7.0,
             yellow_cards: p.yellow_cards ?? 0,
             red_cards: p.red_cards ?? 0,
             own_goals: p.own_goals ?? 0,
        })),
      };
    }

    return baseDefaults as GameFormData; // Cast needed because player_stats might be empty initially
  }, [isEditing, game, nextGameNumber, squads]); // Depend on squads for default squad_id

  const { control, handleSubmit, watch, setValue, getValues, reset, formState: { errors, isSubmitting, isValid, dirtyFields } } = useForm<GameFormData>({
    resolver: zodResolver(gameFormSchema),
    mode: 'onChange', // Validate on change for immediate feedback
    defaultValues: defaultValues,
  });

   // Watch relevant fields for dynamic updates
  const watchedSquadId = watch('squad_id');
  const watchedDuration = watch('duration');
  const watchedUserGoals = watch('user_goals');
  const watchedOpponentGoals = watch('opponent_goals');
  const watchedOvertimeResult = watch('overtime_result');
  const watchedTags = watch('tags', []); // Watch tags with default
  const watchedPlayerStats = watch('player_stats', defaultValues.player_stats); // Watch player_stats

  const selectedSquad = useMemo(() => squads.find(s => s.id === watchedSquadId), [squads, watchedSquadId]);

  // Reset form when default values change (e.g., when 'game' prop changes for editing)
  useEffect(() => {
      reset(defaultValues);
  }, [reset, defaultValues]);


  // Effect to populate/update player_stats based on selected squad and duration
  useEffect(() => {
    if (selectedSquad && selectedSquad.squad_players) {
        // Only reset player stats if the squad ID actually changes OR if it's the initial load for a *new* game
        const squadChanged = dirtyFields.squad_id;
        const isInitialLoadNewGame = !isEditing && !dirtyFields.player_stats; // Check if player_stats hasn't been touched

        if(squadChanged || isInitialLoadNewGame) {
            const starters = selectedSquad.squad_players
                .filter(sp => sp.players && sp.slot_id?.startsWith('starting-'))
                .map(sp => ({
                    id: sp.players!.id, // Player ID
                    name: sp.players!.name,
                    position: sp.players!.position,
                    minutes_played: watchedDuration || 90,
                    goals: 0,
                    assists: 0,
                    rating: 7.0,
                    yellow_cards: 0,
                    red_cards: 0,
                    own_goals: 0,
                }));
            setValue('player_stats', starters, { shouldValidate: true, shouldDirty: !isInitialLoadNewGame, shouldTouch: !isInitialLoadNewGame });
        } else {
             // If squad hasn't changed, just update minutes played for existing players
             const currentPlayers = getValues('player_stats') || [];
             const updatedPlayers = currentPlayers.map(p => ({
                 ...p,
                 minutes_played: watchedDuration || 90
             }));
             // Check if minutes actually changed before setting value to avoid infinite loops
             if(!isEqual(currentPlayers.map(p => p.minutes_played), updatedPlayers.map(p => p.minutes_played))) {
                 setValue('player_stats', updatedPlayers, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
             }
        }

    } else if (!squadsLoading) {
      // If no squad is selected or available, clear player stats
       if (getValues('player_stats')?.length > 0) {
           setValue('player_stats', [], { shouldValidate: true, shouldDirty: true });
       }
    }
  }, [selectedSquad, watchedDuration, setValue, getValues, isEditing, dirtyFields.squad_id, dirtyFields.player_stats, squadsLoading]);


  // Helper for steppers
  const adjustNumericalValue = useCallback((fieldName: string, delta: number, stepValue: number = 1, min: number, max: number) => {
    let currentValue = get(getValues(), fieldName);
    currentValue = (typeof currentValue !== 'number' && typeof currentValue !== 'string') ? min : (Number(currentValue) || min); // Default to min if invalid

    let newValue = currentValue + (delta * stepValue);
    // Handle floating point inaccuracies for decimal steps
    if (stepValue < 1) {
        const precision = Math.max(stepValue.toString().split('.')[1]?.length || 0, currentValue.toString().split('.')[1]?.length || 0);
        newValue = parseFloat(newValue.toFixed(precision));
    }

    newValue = Math.max(min, Math.min(max, newValue)); // Apply min/max
    setValue(fieldName, newValue, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
  }, [getValues, setValue]);

  // Auto-set result based on goals and overtime_result
  useEffect(() => {
    let newResult: 'win' | 'loss' = 'win'; // Default assumption
    if (watchedUserGoals < watchedOpponentGoals) {
      newResult = 'loss';
    } else if (watchedUserGoals === watchedOpponentGoals) {
      // If it's a draw, result depends on OT/Pens
      if (watchedOvertimeResult === 'loss_ot' || watchedOvertimeResult === 'loss_pen') {
        newResult = 'loss';
      } else if (watchedOvertimeResult === 'none') {
         // Should not happen if scores are equal, force a selection?
         // For now, assume OT Win is default if scores equal and OT is 'none'
         setValue('overtime_result', 'win_ot', { shouldDirty: true });
         newResult = 'win';
      } else {
        newResult = 'win'; // win_ot or win_pen
      }
    }
    // Only update if the result changed
    if (getValues('result') !== newResult) {
         setValue('result', newResult, { shouldDirty: true });
    }
  }, [watchedUserGoals, watchedOpponentGoals, watchedOvertimeResult, setValue, getValues]);


   // Determine game_context based on tags
    useEffect(() => {
        let context = 'normal';
        const primaryContextTag = watchedTags?.find(tagName => matchTags.find(t => t.name === tagName)?.context);
        if (primaryContextTag) {
            context = matchTags.find(t => t.name === primaryContextTag)?.context || 'normal';
        }
        // Handle OT/Pens specifically if scores are equal but no tag selected
        else if (watchedUserGoals === watchedOpponentGoals) {
            if (watchedOvertimeResult.includes('_ot')) context = 'extra_time';
            else if (watchedOvertimeResult.includes('_pen')) context = 'penalties';
        }

        if (getValues('game_context') !== context) {
            setValue('game_context', context, { shouldDirty: true });
        }
    }, [watchedTags, watchedUserGoals, watchedOpponentGoals, watchedOvertimeResult, setValue, getValues]);


  // Add Substitute Logic
  const addSubstitute = () => {
    if (!selectedSquad) {
      toast({ title: "Please select a squad first.", variant: "destructive" });
      return;
    }
    const currentPlayers = getValues('player_stats') || [];
    const currentPlayerIds = currentPlayers.map(p => p.id); // Get IDs of players already in the form

    const availableSubs = (selectedSquad.squad_players || [])
      .filter(sp => sp.players && sp.slot_id?.startsWith('sub-') && !currentPlayerIds.includes(sp.players.id))
      .map(sp => sp.players!); // Get actual player data for available subs

    if (availableSubs.length > 0) {
      // Simple: Add the first available sub. Could enhance with a dropdown/modal later.
      const subToAdd = availableSubs[0];
      const newSub = {
        id: subToAdd.id,
        name: subToAdd.name,
        position: 'SUB', // Explicitly mark as SUB
        minutes_played: 0, // Default minutes for a sub
        goals: 0,
        assists: 0,
        rating: 6.0, // Default rating for sub
        yellow_cards: 0,
        red_cards: 0,
        own_goals: 0,
      };
      setValue('player_stats', [...currentPlayers, newSub], { shouldValidate: true, shouldDirty: true });
    } else {
      toast({ title: "No available substitutes left in this squad.", variant: "default" });
    }
  };


  // --- SUBMIT HANDLER ---
  const processSubmit = (data: GameFormData) => {
    // 1. Format Game Data for Submission
    const gameDataSubmit: Omit<Game, 'id' | 'created_at' | 'week_id' | 'score_line'> = {
        game_number: isEditing ? data.game_number : nextGameNumber, // Use existing or next number
        user_goals: data.user_goals,
        opponent_goals: data.opponent_goals,
        result: data.result,
        overtime_result: data.overtime_result,
        opponent_skill: data.opponent_skill,
        opponent_username: data.opponent_username,
        game_context: data.game_context,
        comments: data.comments,
        duration: data.duration,
        stress_level: data.stress_level,
        squad_used: data.squad_id, // This is the UUID
        server_quality: data.server_quality,
        cross_play_enabled: data.cross_play_enabled,
        tags: data.tags,
        game_version: gameVersion, // From props
        // Missing DB fields that need defaults or are calculated:
        // score_line: calculated by parent
        // date_played: default NOW() in DB
        // time_played: nullable
        // actual_game_time: nullable
        // rage_moments: default 0
        // game_rating: nullable
        // game_score: nullable
        // opponent_xg: default 1.0
    };

    // 2. Format Team Stats for Submission
    const teamStatsSubmit: TeamStatisticsInsert = {
        user_id: user!.id, // Add user_id
        // game_id will be set by parent after game insert
        possession: data.team_stats.possession,
        passes: data.team_stats.passes,
        pass_accuracy: data.team_stats.pass_accuracy,
        shots: data.team_stats.shots,
        shots_on_target: data.team_stats.shots_on_target,
        corners: data.team_stats.corners,
        fouls: data.team_stats.fouls,
        yellow_cards: data.team_stats.yellow_cards,
        red_cards: data.team_stats.red_cards,
        expected_goals: data.team_stats.expected_goals,
        expected_goals_against: data.team_stats.expected_goals_against,
        // dribble_success_rate: data.team_stats.dribble_success_rate,
    };

    // 3. Format Player Stats for Submission
    const playerPerformancesSubmit: PlayerPerformanceInsert[] = (data.player_stats || [])
        .filter(p => p.minutes_played > 0) // Only submit players who played
        .map(p => ({
            user_id: user!.id, // Add user_id
            player_name: p.name, // Use name from form state
            player_id: p.id, // Store the actual player ID if available
            position: p.position,
            minutes_played: p.minutes_played,
            goals: p.goals,
            assists: p.assists,
            rating: p.rating,
            yellow_cards: p.yellow_cards,
            red_cards: p.red_cards > 0 ? 1 : 0, // Ensure red_cards is 0 or 1
            own_goals: p.own_goals,
            // game_id will be set by parent after game insert
        }));

    // Check if stats should be ignored based on tags
    const hasNoStatsTag = data.tags?.some(tagName => matchTags.find(t => t.name === tagName)?.specialRule === 'no_stats');

    // 4. Call the onSubmit prop passed from parent
    // Parent component (`CurrentRun.tsx`) will handle the actual Supabase insertions
    onSubmit(gameDataSubmit, hasNoStatsTag ? [] : playerPerformancesSubmit, hasNoStatsTag ? {} as TeamStatisticsInsert : teamStatsSubmit);
  };

  return (
    <Card className="glass-card rounded-2xl shadow-2xl border-0 w-full max-w-4xl mx-auto"> {/* Max width for larger screens */}
      <CardContent className="p-4 md:p-6">
        <Form {...form}>
          <form onSubmit={handleSubmit(processSubmit)} className="flex flex-col space-y-6 h-full"> {/* Use flex column */}
            {/* Title */}
             <h2 className="text-xl font-semibold text-white mb-4">
                {isEditing ? `Editing Game ${game.game_number}` : `Record Game ${nextGameNumber}`}
            </h2>

            {/* Tabs */}
            <Tabs defaultValue="details" className="flex flex-col flex-1 min-h-0"> {/* Flex for scrolling */}
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 sticky top-0 z-10 bg-background/80 backdrop-blur-sm"> {/* Responsive grid */}
                <TabsTrigger value="details"><Trophy className="h-4 w-4 mr-1 md:mr-2" />Match</TabsTrigger>
                <TabsTrigger value="opponent"><Shield className="h-4 w-4 mr-1 md:mr-2" />Opponent</TabsTrigger>
                <TabsTrigger value="team"><BarChartHorizontal className="h-4 w-4 mr-1 md:mr-2" />Team</TabsTrigger>
                <TabsTrigger value="players"><Star className="h-4 w-4 mr-1 md:mr-2" />Players</TabsTrigger>
              </TabsList>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto mt-4 pr-2 space-y-6 custom-scrollbar"> {/* Added custom-scrollbar */}
                {/* Match Details Tab */}
                <TabsContent value="details" className="space-y-6">
                  <Controller
                      name="squad_id"
                      control={control}
                      render={({ field }) => (
                          <div className="space-y-1">
                              <Label htmlFor="squad_id" className="flex items-center gap-2 text-sm"><Users className="h-4 w-4" />Squad Used</Label>
                              {squadsLoading ? <p className="text-sm text-muted-foreground">Loading squads...</p> :
                                squadsError ? <p className="text-sm text-red-500">{squadsError}</p> :
                                    <Select value={field.value} onValueChange={field.onChange} disabled={squads.length === 0}>
                                        <SelectTrigger id="squad_id">
                                            <SelectValue placeholder={squads.length === 0 ? "No squads found for this game version" : "Select squad..."} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {squads.map((s) => (
                                                <SelectItem key={s.id} value={s.id}>
                                                    {s.name} {s.is_default && "(Default)"}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>}
                              {errors.squad_id && <p className="text-sm text-red-500">{errors.squad_id.message}</p>}
                          </div>
                      )}
                  />
                  <div className="text-center space-y-4">
                     <Label className="text-lg font-semibold block">Final Score</Label>
                     <div className="flex items-center justify-center gap-2 md:gap-4">
                        {/* Your Score */}
                        <div className="flex flex-col items-center flex-1 max-w-[150px]">
                            <Label className="text-sm font-medium text-primary mb-1">You</Label>
                            <div className="flex items-center w-full">
                                <Button type="button" variant="outline" size="icon" className="w-8 h-8 p-0 shrink-0" onClick={() => adjustNumericalValue('user_goals', -1, 1, 0, 99)} disabled={watchedUserGoals <= 0}><Minus className="h-4 w-4" /></Button>
                                <Controller name="user_goals" control={control} render={({ field }) => <Input {...field} type="text" inputMode="numeric" className="h-16 w-full text-center text-4xl mx-1 px-0" />} />
                                <Button type="button" variant="outline" size="icon" className="w-8 h-8 p-0 shrink-0" onClick={() => adjustNumericalValue('user_goals', 1, 1, 0, 99)}><Plus className="h-4 w-4" /></Button>
                            </div>
                              {errors.user_goals && <p className="text-sm text-red-500 mt-1">{errors.user_goals.message}</p>}
                        </div>
                         {/* Separator */}
                        <span className="text-4xl font-bold text-muted-foreground pt-5">:</span>
                        {/* Opponent Score */}
                         <div className="flex flex-col items-center flex-1 max-w-[150px]">
                            <Label className="text-sm font-medium text-red-500 mb-1">Opponent</Label>
                            <div className="flex items-center w-full">
                                <Button type="button" variant="outline" size="icon" className="w-8 h-8 p-0 shrink-0" onClick={() => adjustNumericalValue('opponent_goals', -1, 1, 0, 99)} disabled={watchedOpponentGoals <= 0}><Minus className="h-4 w-4" /></Button>
                                <Controller name="opponent_goals" control={control} render={({ field }) => <Input {...field} type="text" inputMode="numeric" className="h-16 w-full text-center text-4xl mx-1 px-0" />} />
                                <Button type="button" variant="outline" size="icon" className="w-8 h-8 p-0 shrink-0" onClick={() => adjustNumericalValue('opponent_goals', 1, 1, 0, 99)}><Plus className="h-4 w-4" /></Button>
                            </div>
                             {errors.opponent_goals && <p className="text-sm text-red-500 mt-1">{errors.opponent_goals.message}</p>}
                        </div>
                     </div>
                  </div>
                   {/* Overtime/Penalty Result */}
                  {watchedUserGoals === watchedOpponentGoals && (
                    <Controller
                      control={control} name="overtime_result"
                      render={({ field }) => (
                        <div className="space-y-1">
                          <Label>Result (OT/Pens)</Label>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue placeholder="Select OT/Pen result" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="win_ot">Win in OT</SelectItem>
                              <SelectItem value="loss_ot">Loss in OT</SelectItem>
                              <SelectItem value="win_pen">Win on Pens</SelectItem>
                              <SelectItem value="loss_pen">Loss on Pens</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.overtime_result && <p className="text-sm text-red-500">{errors.overtime_result.message}</p>}
                        </div>
                      )}
                    />
                  )}
                   {/* Duration */}
                  <div>
                    <NumberInputWithSteppers name="duration" label="Match Duration (Mins)" step={1} min={1} max={120} className="space-y-1" inputClassName="h-10 text-base" minInputWidth="w-full" control={control} adjustValue={adjustNumericalValue} getValues={getValues} />
                    <p className="text-xs text-muted-foreground mt-1">90 for full game, 120 for ET, less if ended early.</p>
                  </div>
                </TabsContent>

                {/* Opponent Tab */}
                <TabsContent value="opponent" className="space-y-6">
                     <Controller name="opponent_username" control={control} render={({ field }) => <div className="space-y-1"><Label>Opponent Username</Label><Input {...field} placeholder="(Optional)" /></div>} />
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <Controller name="opponent_skill" control={control} render={({ field }) => <div className="space-y-2"><Label>Opponent Skill: <span className="font-bold text-primary">{field.value}</span>/10</Label><Slider value={[field.value ?? 5]} onValueChange={(v) => field.onChange(v[0])} max={10} step={1} min={1} /> {errors.opponent_skill && <p className="text-sm text-red-500">{errors.opponent_skill.message}</p>}</div>} />
                        <Controller name="server_quality" control={control} render={({ field }) => <div className="space-y-2"><Label>Server Quality: <span className="font-bold text-primary">{field.value}</span>/10</Label><Slider value={[field.value ?? 5]} onValueChange={(v) => field.onChange(v[0])} max={10} step={1} min={1} /> {errors.server_quality && <p className="text-sm text-red-500">{errors.server_quality.message}</p>}</div>} />
                        <Controller name="stress_level" control={control} render={({ field }) => <div className="space-y-2"><Label>Your Stress Level: <span className="font-bold text-primary">{field.value}</span>/10</Label><Slider value={[field.value ?? 5]} onValueChange={(v) => field.onChange(v[0])} max={10} step={1} min={1} /> {errors.stress_level && <p className="text-sm text-red-500">{errors.stress_level.message}</p>}</div>} />
                        <Controller name="cross_play_enabled" control={control} render={({ field }) => <div className="flex items-center space-x-2 pt-6"><Switch id="crossplay" checked={field.value} onCheckedChange={field.onChange} /><Label htmlFor="crossplay">Cross-Platform Match</Label></div>} />
                    </div>
                    <div className="pt-4 border-t">
                        <Controller name="opponent_formation" control={control} render={({ field }) => <div className="space-y-1"><Label>Opponent Formation</Label><Input {...field} placeholder="e.g. 4-2-3-1 (Optional)" /></div>} />
                    </div>
                </TabsContent>

                {/* Team Stats Tab */}
                <TabsContent value="team" className="space-y-6">
                    <h3 className="text-lg font-semibold border-b pb-2">Your Team Statistics</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-4">
                        <NumberInputWithSteppers name="team_stats.shots" label="Shots" min={0} max={99} control={control} adjustValue={adjustNumericalValue} getValues={getValues} />
                        <NumberInputWithSteppers name="team_stats.shots_on_target" label="On Target" min={0} max={getValues('team_stats.shots') ?? 99} control={control} adjustValue={adjustNumericalValue} getValues={getValues} />
                        <NumberInputWithSteppers name="team_stats.possession" label="Possession %" min={0} max={100} control={control} adjustValue={adjustNumericalValue} getValues={getValues} />
                        <NumberInputWithSteppers name="team_stats.passes" label="Passes" step={5} min={0} max={999} control={control} adjustValue={adjustNumericalValue} getValues={getValues} />
                        <NumberInputWithSteppers name="team_stats.pass_accuracy" label="Pass Acc %" min={0} max={100} control={control} adjustValue={adjustNumericalValue} getValues={getValues} />
                        <NumberInputWithSteppers name="team_stats.expected_goals" label="Your xG" step={0.1} min={0} max={20} control={control} adjustValue={adjustNumericalValue} getValues={getValues} />
                        <NumberInputWithSteppers name="team_stats.expected_goals_against" label="Opponent xG" step={0.1} min={0} max={20} control={control} adjustValue={adjustNumericalValue} getValues={getValues} />
                        <NumberInputWithSteppers name="team_stats.corners" label="Corners" min={0} max={99} control={control} adjustValue={adjustNumericalValue} getValues={getValues} />
                        <NumberInputWithSteppers name="team_stats.fouls" label="Fouls" min={0} max={99} control={control} adjustValue={adjustNumericalValue} getValues={getValues} />
                        <NumberInputWithSteppers name="team_stats.yellow_cards" label="Yellow Cards" min={0} max={11} control={control} adjustValue={adjustNumericalValue} getValues={getValues} />
                        <NumberInputWithSteppers name="team_stats.red_cards" label="Red Cards" min={0} max={5} control={control} adjustValue={adjustNumericalValue} getValues={getValues} />
                       {/* <NumberInputWithSteppers name="team_stats.dribble_success_rate" label="Dribble %" min={0} max={100} control={control} adjustValue={adjustNumericalValue} getValues={getValues} /> */}
                    </div>
                     {/* Match Tags */}
                    <div className="space-y-2 pt-4 border-t">
                        <Label>Match Tags</Label>
                        <p className="text-xs text-muted-foreground">Select tags that apply. Hover/tap for details.</p>
                        <TooltipProvider delayDuration={300}>
                            <div className="flex flex-wrap gap-2">
                                <Controller name="tags" control={control} render={({ field }) => (
                                <>
                                    {matchTags.map(tag => (
                                    <Tooltip key={tag.id}>
                                        <TooltipTrigger asChild>
                                        <Toggle variant="outline" size="sm" className={`text-xs h-7 ${field.value?.includes(tag.name) ? 'data-[state=on]:bg-primary data-[state=on]:text-primary-foreground' : ''}`} pressed={field.value?.includes(tag.name)} onPressedChange={(isPressed) => { const currentTags = field.value || []; const newTags = isPressed ? [...currentTags, tag.name] : currentTags.filter(t => t !== tag.name); field.onChange(newTags); }}>{tag.name}</Toggle>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom" align="start"><p className="max-w-xs">{tag.description}</p></TooltipContent>
                                    </Tooltip>
                                    ))}
                                </>
                                )} />
                            </div>
                        </TooltipProvider>
                    </div>
                     {/* Comments */}
                    <Controller name="comments" control={control} render={({ field }) => <div className="space-y-1"><Label>Comments</Label><Textarea {...field} placeholder="Key moments, tactics, frustrations..." /></div>} />
                </TabsContent>

                {/* Player Stats Tab */}
                <TabsContent value="players" className="space-y-4">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Player Performances</h3>
                        <Button onClick={addSubstitute} size="sm" type="button" variant="outline" disabled={!selectedSquad || squadsLoading}>
                           <UserPlus className="h-4 w-4 mr-2" />Add Sub
                        </Button>
                    </div>
                    {squadsLoading ? (<p className="text-sm text-muted-foreground">Loading squad players...</p>)
                    : !watchedSquadId ? (<p className="text-sm text-muted-foreground">Please select a squad in the 'Match' tab.</p>)
                    : watchedPlayerStats && watchedPlayerStats.length > 0 ? (
                        <Controller
                            name="player_stats"
                            control={control}
                            render={({ field }) => (
                                // Ensure PlayerStatsForm can handle this data structure
                                <PlayerStatsForm
                                    players={field.value || []}
                                    onStatsChange={(updatedPlayers) => field.onChange(updatedPlayers)}
                                    gameDuration={watchedDuration || 90}
                                />
                            )}
                        />
                    ) : (
                        <div className="text-center py-8 border border-dashed rounded-lg text-muted-foreground">
                            <p className='px-4'>No starting players found for the selected squad ("{selectedSquad?.name || '...'}"). Add players via the Squads page or select a different squad.</p>
                        </div>
                    )}
                </TabsContent>
              </div>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-auto pt-4 border-t"> {/* Use mt-auto */}
              <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting || isLoading || !isValid}>
                {isSubmitting || isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {isEditing ? 'Update Game' : 'Save Game'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default GameRecordForm;
