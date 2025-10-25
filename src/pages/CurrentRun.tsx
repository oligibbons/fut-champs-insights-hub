import { useEffect, useCallback, useState, memo, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Save, Loader2, UserPlus, Users, Plus, Minus, Trophy, Shield, BarChartHorizontal, Star, X, Goal, Footprints, Clock, Square, SquareCheck, ShieldAlert } from 'lucide-react';
import PlayerStatsForm from './PlayerStatsForm';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Game, PlayerPerformanceInsert, TeamStatisticsInsert, PlayerPerformance } from '@/types/futChampions';
import { Squad, PlayerCard, SquadPlayer } from '@/types/squads';
import { get, set, isEqual } from 'lodash';
import { useAllSquadsData } from '@/hooks/useAllSquadsData';
import { useTheme } from '@/hooks/useTheme';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// --- ZOD SCHEMA ---
const gameFormSchema = z.object({
  game_number: z.number().min(0),
  user_goals: z.coerce.number().min(0),
  opponent_goals: z.coerce.number().min(0),
  result: z.enum(['win', 'loss']),
  overtime_result: z
    .enum(['none', 'win_ot', 'loss_ot', 'win_pen', 'loss_pen'])
    .default('none'),
  opponent_username: z.string().trim().optional().default(''),
  squad_quality_comparison: z.enum(['even', 'mine_better', 'opponent_better']).default('even'),
  game_context: z.string().default('normal'),
  comments: z.string().trim().optional().default(''),
  duration: z.coerce.number().min(1).default(90),
  stress_level: z.number().min(1).max(10).default(5),
  squad_id: z.string().uuid({ message: "Please select a squad." }).or(z.literal('')), // Allow empty string if no squads
  server_quality: z.number().min(1).max(10).default(5),
  cross_play_enabled: z.boolean().default(false),
  tags: z.array(z.string()).optional().default([]),

  team_stats: z.object({
    possession: z.coerce.number().min(0).max(100).default(50),
    passes: z.coerce.number().min(0).default(100),
    pass_accuracy: z.coerce.number().min(0).max(100).default(75),
    shots: z.coerce.number().min(0).default(10),
    shots_on_target: z.coerce.number().min(0).default(5),
    corners: z.coerce.number().min(0).default(3),
    fouls: z.coerce.number().min(0).default(8),
    yellow_cards: z.coerce.number().min(0).default(0),
    red_cards: z.coerce.number().min(0).default(0),
    expected_goals: z.coerce.number().min(0).step(0.1).default(1.0),
    expected_goals_against: z.coerce.number().min(0).step(0.1).default(1.0),
    dribble_success_rate: z.coerce.number().min(0).max(100).optional().default(70),
  }),

  player_stats: z.array(
    z.object({
      id: z.string().uuid(), // player_id
      name: z.string(),
      position: z.string(),
      minutes_played: z.coerce.number().min(0).max(120).default(90),
      goals: z.coerce.number().min(0).default(0),
      assists: z.coerce.number().min(0).default(0),
      rating: z.coerce.number().min(0).max(10).step(0.1).default(7.0),
      yellow_cards: z.coerce.number().min(0).max(2).default(0),
      red_cards: z.coerce.number().min(0).max(1).default(0),
      own_goals: z.coerce.number().min(0).default(0),
    })
  ).optional().default([]),
});

type GameFormData = z.infer<typeof gameFormSchema>;

// Match Tags Data
const matchTags = [
    { id: 'dominantWin', name: 'Dominant Win', description: 'A win where you dominated your opponent.' },
    { id: 'deservedLoss', name: 'Deserved Loss', description: 'A loss where you didn’t deserve to win.' },
    { id: 'closeGame', name: 'Close Game', description: 'A game where irrespective of the result, it was tightly contested.' },
    { id: 'extraTime', name: 'Extra Time', description: 'A game that went to Extra Time.', context: 'extra_time' },
    { id: 'penalties', name: 'Penalties', description: 'A game that went all the way to penalties.', context: 'penalties' },
    { id: 'opponentRageQuit', name: 'Opponent Rage Quit', description: 'A game where the opponent quit while you were winning.', context: 'rage_quit' },
    { id: 'iRageQuit', name: 'I Rage Quit', description: 'A game where you quit out after being behind.', context: 'rage_quit_own' },
    { id: 'freeWinReceived', name: 'Free Win Received', description: 'A game where the opponent gifted you a win. Does not impact performance stats.', specialRule: 'no_stats', context: 'free_win' },
    { id: 'freeWinGiven', name: 'Free Win Given Away', description: 'A game where you gifted the opponent a win. Does not impact performance stats.', specialRule: 'no_stats', context: 'free_win_given' },
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
    { id: 'ashamedPerformance', name: 'Performance to be ashamed of', description: 'Poor performance or had to resort to ratty tactics.' },
];

// Helper component for number inputs
const NumberInputWithSteppers = memo(({ control, name, label, step = 1, min = 0, max = Infinity, className = '', inputClassName = 'text-center', minInputWidth = 'w-14', adjustValue, getValues }: any) => {
    const currentValue = get(getValues(), name, min);
    // Ensure currentValue is a number for comparison
    const currentNumValue = typeof currentValue === 'number' ? currentValue : min;
    const isMin = currentNumValue <= min;
    const isMax = currentNumValue >= max;

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
                            type="text" // Keep as text to allow intermediate states
                            inputMode={step < 1 ? "decimal" : "numeric"}
                            className={cn("h-8 text-sm font-semibold", inputClassName, minInputWidth)}
                            onChange={(e) => {
                                let val = e.target.value;
                                const numRegex = step < 1 ? /^\d*\.?\d*$/ : /^\d*$/;
                                if (numRegex.test(val)) {
                                     // Pass valid numeric string or empty string
                                     field.onChange(val);
                                }
                            }}
                             onBlur={(e) => { // Coerce and validate on blur
                                let valStr = e.target.value;
                                let valNum = step < 1 ? parseFloat(valStr) : parseInt(valStr, 10);

                                // If empty or invalid, set to min
                                if (valStr === '' || isNaN(valNum)) {
                                    valNum = min;
                                }

                                // Apply min/max constraints
                                valNum = Math.max(min, Math.min(max, valNum));

                                // Format based on step only if it's a valid number
                                const finalValue = step < 1
                                    ? parseFloat(valNum.toFixed(1))
                                    : Math.round(valNum);

                                // Update the field with the final, validated number
                                field.onChange(finalValue);
                            }}
                            // Display the value from the form state, converting null/undefined to empty string
                            value={field.value === null || field.value === undefined ? '' : String(field.value)}
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
            {/* Display validation errors using react-hook-form's error object */}
             <Controller
                name={name}
                control={control}
                render={({ fieldState: { error } }) =>
                    error ? <p className="text-xs text-red-500 mt-1">{error.message}</p> : null
                }
            />
        </div>
    );
});
NumberInputWithSteppers.displayName = 'NumberInputWithSteppers';

// Player Stat Type
type PlayerStatFormData = {
  id: string; // player_id (UUID)
  name: string;
  position: string;
  minutes_played: number;
  goals: number;
  assists: number;
  rating: number;
  yellow_cards: number;
  red_cards: number;
  own_goals: number;
};

// Form Props
interface GameRecordFormProps {
  onSubmit: (
    gameData: Omit<Game, 'id' | 'created_at' | 'week_id' | 'score_line' | 'date_played' | 'player_performances' | 'team_stats' | 'user_id'>,
    playerPerformances: PlayerPerformanceInsert[],
    teamStats: TeamStatisticsInsert
  ) => void;
  isLoading: boolean;
  game?: Game | null;
  weekId: string;
  gameVersion: string;
  nextGameNumber: number;
  onCancel: () => void;
}

// --- MAIN FORM COMPONENT ---
const GameRecordForm = ({
  onSubmit, isLoading, game, weekId, gameVersion, nextGameNumber, onCancel,
}: GameRecordFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { currentTheme } = useTheme();
  const { squads, loading: squadsLoading, error: squadsError } = useAllSquadsData();

  const isEditing = !!game?.id;

  // Memoized default values for the form
  const defaultValues = useMemo((): GameFormData => {
    // ----------------------------------------------------------------
    // FIX 1: Default 'squads' to '[]' to prevent 'undefined.find'
    // ----------------------------------------------------------------
    const safeSquads = squads || [];

    // Define the absolute base defaults according to the schema
    const baseDefaults: GameFormData = {
        game_number: nextGameNumber,
        user_goals: 0,
        opponent_goals: 0,
        result: 'win', // Will be adjusted by useEffect
        overtime_result: 'none',
        opponent_username: '',
        squad_quality_comparison: 'even',
        game_context: 'normal',
        comments: '',
        duration: 90,
        stress_level: 5,
        squad_id: '', // Initialize as empty, will be set below
        server_quality: 5,
        cross_play_enabled: false,
        tags: [],
        team_stats: {
            possession: 50, passes: 100, pass_accuracy: 75,
            shots: 10, shots_on_target: 5, corners: 3, fouls: 8,
            yellow_cards: 0, red_cards: 0, expected_goals: 1.0,
            expected_goals_against: 1.0, dribble_success_rate: 70,
        },
        player_stats: [],
    };

     // Determine the initial squad_id based on loaded squads
     // ----------------------------------------------------------------
     // FIX 2: Use 'safeSquads' here
     // ----------------------------------------------------------------
     const defaultSquadId = safeSquads.find(s => s.is_default)?.id || safeSquads[0]?.id || '';
     baseDefaults.squad_id = defaultSquadId;

    // If editing an existing game, merge its data
    if (isEditing && game) {
      const formPlayerStats: PlayerStatFormData[] = (game.player_performances || []).map(p => ({
            id: p.player_id || p.id, // Use player_id (UUID)
            name: p.player_name || 'Unknown',
            position: p.position || 'N/A',
            minutes_played: p.minutes_played ?? 90, goals: p.goals ?? 0, assists: p.assists ?? 0,
            rating: p.rating ?? 7.0, yellow_cards: p.yellow_cards ?? 0, red_cards: p.red_cards ?? 0,
            own_goals: p.own_goals ?? 0,
      }));

       const mergedData = {
         ...baseDefaults, // Start with base defaults
         game_number: game.game_number,
         user_goals: game.user_goals ?? 0,
         opponent_goals: game.opponent_goals ?? 0,
         result: game.result, // Use saved result
         overtime_result: game.overtime_result ?? 'none',
         opponent_username: game.opponent_username ?? '',
         squad_quality_comparison: game.squad_quality_comparison ?? 'even',
         game_context: game.game_context ?? 'normal',
         comments: game.comments ?? '',
         duration: game.duration ?? 90,
         stress_level: game.stress_level ?? 5,
         squad_id: game.squad_used ?? defaultSquadId, // Use saved or fallback to default
         server_quality: game.server_quality ?? 5,
         cross_play_enabled: game.cross_play_enabled ?? false,
         tags: game.tags ?? [],
         team_stats: { ...baseDefaults.team_stats, ...(game.team_stats || {}), }, // Merge team stats carefully
         player_stats: formPlayerStats, // Use mapped player stats
       };

        // Ensure the merged squad_id is actually valid among the loaded squads
       // ----------------------------------------------------------------
       // FIX 3: Use 'safeSquads' here
       // ----------------------------------------------------------------
       const squadExists = safeSquads.some(s => s.id === mergedData.squad_id);
       if (!squadExists) {
           mergedData.squad_id = defaultSquadId; // Fallback if saved squad_id is invalid/deleted
       }

       return mergedData;
    }

    // If creating a new game, return the base defaults (with squad_id set)
    return baseDefaults;
  // Depend on squads data being loaded
  }, [isEditing, game, nextGameNumber, squads]);


  // Initialize react-hook-form
  const form = useForm<GameFormData>({
    resolver: zodResolver(gameFormSchema),
    mode: 'onChange', // Validate on change
    defaultValues: defaultValues, // Set memoized defaults
  });
  const { control, handleSubmit, watch, setValue, getValues, reset, formState: { errors, isSubmitting, isValid, dirtyFields } } = form;

  // Watch form fields to react to changes
  const watchedSquadId = watch('squad_id');
  const watchedDuration = watch('duration');
  const watchedUserGoals = watch('user_goals');
  const watchedOpponentGoals = watch('opponent_goals');
  const watchedOvertimeResult = watch('overtime_result');
  const watchedTags = watch('tags');
  const watchedPlayerStats = watch('player_stats');

  // Find the currently selected squad object
  // ----------------------------------------------------------------
  // FIX 4: Default 'squads' to '[]' here as well
  // ----------------------------------------------------------------
  const selectedSquad = useMemo(() => (squads || []).find(s => s.id === watchedSquadId), [squads, watchedSquadId]);

   // Effect to reset the form when defaultValues change significantly
   // (e.g., switching from editing to new, or initial squad load finishes)
  useEffect(() => {
    // Compare stringified versions to detect deep changes
    if (JSON.stringify(form.formState.defaultValues) !== JSON.stringify(defaultValues)) {
        reset(defaultValues);
    }
  }, [reset, defaultValues, form.formState.defaultValues]);


  // Effect to populate/update player_stats list based on selected squad and duration
  useEffect(() => {
    // ----------------------------------------------------------------
    // FIX 5: Only check for 'selectedSquad' (which is now safe)
    // ----------------------------------------------------------------
    if (!squadsLoading && selectedSquad) {
        const squadJustChanged = dirtyFields.squad_id; // Did the user just change the squad dropdown?
        const isInitialLoadOrReset = !watchedPlayerStats || watchedPlayerStats.length === 0;

        // Condition to repopulate: Squad dropdown was just changed, OR (it's a new game AND the list is empty)
        if (squadJustChanged || (!isEditing && isInitialLoadOrReset)) {
             // ----------------------------------------------------------------
             // FIX 6: Default 'squad_players' to '[]' before filter/map
             // ----------------------------------------------------------------
             const squadPlayersData = (selectedSquad.squad_players || [])
                .filter(sp => sp.players && (sp.slot_id?.startsWith('starting-') || sp.slot_id?.startsWith('sub-')))
                .map(sp => {
                    const isStarter = sp.slot_id?.startsWith('starting-');
                    return { // Map to PlayerStatFormData structure
                        id: sp.players!.id, name: sp.players!.name,
                        position: sp.players!.position || 'N/A',
                        minutes_played: isStarter ? (watchedDuration || 90) : 0, // Subs start at 0
                        goals: 0, assists: 0, rating: 7.0,
                        yellow_cards: 0, red_cards: 0, own_goals: 0,
                    };
                })
                .sort((a, b) => { // Starters first, then subs, then alpha
                    if (a.minutes_played > 0 && b.minutes_played === 0) return -1;
                    if (a.minutes_played === 0 && b.minutes_played > 0) return 1;
                    return a.name.localeCompare(b.name);
                });

             // Update the form state with the new player list
             // Only mark dirty if it wasn't the very initial load/reset
            setValue('player_stats', squadPlayersData, { shouldValidate: true, shouldDirty: !isInitialLoadOrReset, shouldTouch: !isInitialLoadOrReset });

        } else if (!squadJustChanged && watchedPlayerStats) {
            // Squad didn't change, but maybe duration did? Update starter minutes.
             const updatedPlayers = watchedPlayerStats.map(currentPlayer => {
                // ----------------------------------------------------------------
                // FIX 7: Default 'squad_players' to '[]' before find
                // ----------------------------------------------------------------
                const squadPlayerInfo = (selectedSquad.squad_players || []).find(sp => sp.players?.id === currentPlayer.id);
                const wasStarter = squadPlayerInfo?.slot_id?.startsWith('starting-');
                 // Only update if they were a starter AND their current minutes suggest they played the full default time
                 // (preserves manual adjustments like early subs)
                 const currentDefaultDuration = game?.duration || 90; // Approx default time they might have played
                 const needsAutoUpdate = wasStarter && (currentPlayer.minutes_played === currentDefaultDuration || currentPlayer.minutes_played === 90 || currentPlayer.minutes_played === 120);

                const newMinutes = needsAutoUpdate ? (watchedDuration || 90) : currentPlayer.minutes_played;

                // Return updated object only if minutes changed
                return currentPlayer.minutes_played !== newMinutes ? { ...currentPlayer, minutes_played: newMinutes } : currentPlayer;
             });
             // Only call setValue if the resulting array is actually different
             if(!isEqual(watchedPlayerStats, updatedPlayers)) {
                 setValue('player_stats', updatedPlayers, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
             }
        }
    } else if (!squadsLoading && !selectedSquad && watchedPlayerStats && watchedPlayerStats.length > 0) {
        // Case: Squads loaded, but none is selected (or selected one is invalid)
        // Optionally clear player stats here, or leave them as they might be manually added
        // setValue('player_stats', [], { shouldValidate: true, shouldDirty: true });
    }
  // Dependencies need to carefully cover all conditions
  }, [
      selectedSquad, watchedDuration, setValue, isEditing, dirtyFields.squad_id,
      squadsLoading, reset, game?.duration,
      // Watching player stats itself can cause loops, use carefully or rely on string compare/isEqual
      // JSON.stringify(watchedPlayerStats) // Use if deep comparison needed and isEqual isn't sufficient
      watchedPlayerStats // Might be okay if updates are guarded by isEqual check
    ]);


  // Callback for +/- buttons on numeric inputs
  const adjustNumericalValue = useCallback((fieldName: string, delta: number, stepValue: number = 1, min: number, max: number) => {
    const currentValue = get(getValues(), fieldName); // Get value using lodash get for nested paths
    let currentNum = stepValue < 1 ? parseFloat(String(currentValue)) : parseInt(String(currentValue), 10); // Parse based on step
    if (isNaN(currentNum)) { currentNum = min; } // Default to min if parsing fails

    let newValue = currentNum + (delta * stepValue);

    // Handle float precision
    if (stepValue < 1 || String(fieldName).includes('rating') || String(fieldName).includes('expected_goals')) {
        const precision = String(stepValue).includes('.') ? String(stepValue).split('.')[1].length : 1;
        newValue = parseFloat(newValue.toFixed(precision));
    } else {
        newValue = Math.round(newValue); // Ensure integer for whole steps
    }

    newValue = Math.max(min, Math.min(max, newValue)); // Clamp value
    setValue(fieldName as any, newValue, { shouldValidate: true, shouldDirty: true, shouldTouch: true }); // Update form state
  }, [getValues, setValue]);


  // Effect to automatically set the 'result' field based on scores and OT
  useEffect(() => {
     let newResult: 'win' | 'loss' = getValues('result') ?? 'win'; // Start with current or default
     let needsUpdate = false;

     if (watchedUserGoals === watchedOpponentGoals) { // Draw score
        if (watchedOvertimeResult !== 'none') { // OT/Pens decided
            const otResult = (watchedOvertimeResult === 'win_ot' || watchedOvertimeResult === 'win_pen') ? 'win' : 'loss';
            if (newResult !== otResult) {
                newResult = otResult;
                needsUpdate = true;
            }
        } else { // Draw, no OT result - ensure result is valid ('win' or 'loss')
             if (newResult !== 'win' && newResult !== 'loss') {
                 newResult = 'win'; // Default to 'win' if invalid
                 needsUpdate = true;
             }
             // Keep existing valid 'win' or 'loss' if score becomes a draw without OT
        }
     } else { // Not a draw
        const scoreResult = watchedUserGoals > watchedOpponentGoals ? 'win' : 'loss';
        if (newResult !== scoreResult) {
            newResult = scoreResult;
            needsUpdate = true;
        }
        // If score is no longer a draw, reset OT result
        if (watchedOvertimeResult !== 'none') {
             setValue('overtime_result', 'none', { shouldValidate: true, shouldDirty: true }); // Reset OT
        }
     }

     // Update the form only if the calculated result is different
     if (needsUpdate) {
        setValue('result', newResult, { shouldValidate: true, shouldDirty: true });
     }
  }, [watchedUserGoals, watchedOpponentGoals, watchedOvertimeResult, setValue, getValues]);

  // Effect to determine game_context (e.g., 'penalties', 'rage_quit')
  useEffect(() => {
     const tags = watchedTags || [];
     let newContext = 'normal'; // Default context
     const currentContext = getValues('game_context');

     // Check tags first for specific contexts
     const contextTag = matchTags.find(tag => tags.includes(tag.name) && tag.context);
     if (contextTag?.context) {
         newContext = contextTag.context;
     }
     // If no tag defines context, check OT/Pens result
     else if (watchedOvertimeResult === 'win_ot' || watchedOvertimeResult === 'loss_ot') {
        newContext = 'extra_time';
     } else if (watchedOvertimeResult === 'win_pen' || watchedOvertimeResult === 'loss_pen') {
         newContext = 'penalties';
     }
     // Add more context derivations if needed (e.g., based on score difference)

     // Update form state only if context changed
     if (currentContext !== newContext) {
        setValue('game_context', newContext, { shouldValidate: true, shouldDirty: true });
     }
  }, [watchedTags, watchedOvertimeResult, setValue, getValues]);

  // Placeholder function - could be used to manually add players later
  const addSubstitute = () => {
     toast({ title: "Substitutes Ready", description: "Bench players are listed automatically. Adjust their minutes played if they came on.", variant: "default" });
  };

  // --- SUBMIT HANDLER ---
  const processSubmit = (data: GameFormData) => {
      // 1. Filter player_stats: Keep only players with minutes_played > 0
      const validPlayerPerformances = (data.player_stats || []).filter(p => p.minutes_played > 0);

      // 2. Map filtered players to PlayerPerformanceInsert structure for DB
      const playerPerformancesSubmit: PlayerPerformanceInsert[] = validPlayerPerformances.map(p => ({
            user_id: user!.id,
            player_name: p.name,
            player_id: p.id, // Should be the UUID from players table
            position: p.position,
            minutes_played: p.minutes_played,
            goals: p.goals, assists: p.assists, rating: p.rating,
            yellow_cards: p.yellow_cards, red_cards: p.red_cards > 0 ? 1 : 0, // Ensure boolean/0/1
            own_goals: p.own_goals,
            // week_id and game_id are added in the parent component (CurrentRun.tsx)
        }));

     // 3. Prepare game data, ensuring nulls for optional empty strings
     const gameDataSubmit: Omit<Game, 'id' | 'created_at' | 'week_id' | 'score_line' | 'date_played' | 'player_performances' | 'team_stats' | 'user_id'> = {
        game_number: data.game_number, user_goals: data.user_goals, opponent_goals: data.opponent_goals,
        result: data.result, overtime_result: data.overtime_result,
        opponent_username: data.opponent_username || null, // Convert empty string to null
        squad_quality_comparison: data.squad_quality_comparison,
        game_context: data.game_context, comments: data.comments || null, // Convert empty string to null
        duration: data.duration, stress_level: data.stress_level, squad_used: data.squad_id,
        server_quality: data.server_quality, cross_play_enabled: data.cross_play_enabled,
        tags: data.tags, game_version: gameVersion,
     };

    // 4. Prepare team stats data
    const teamStatsSubmit: TeamStatisticsInsert = {
        user_id: user!.id, possession: data.team_stats.possession, passes: data.team_stats.passes,
        pass_accuracy: data.team_stats.pass_accuracy, shots: data.team_stats.shots,
        shots_on_target: data.team_stats.shots_on_target, corners: data.team_stats.corners,
        fouls: data.team_stats.fouls, yellow_cards: data.team_stats.yellow_cards,
        red_cards: data.team_stats.red_cards, expected_goals: data.team_stats.expected_goals,
        expected_goals_against: data.team_stats.expected_goals_against,
        dribble_success_rate: data.team_stats.dribble_success_rate,
        // week_id and game_id are added in the parent component (CurrentRun.tsx)
    };

    // 5. Check if a "no_stats" tag is selected
    const hasNoStatsTag = data.tags?.some(tagName =>
        matchTags.find(t => t.name === tagName)?.specialRule === 'no_stats'
    );

    // 6. Call the parent onSubmit callback with prepared data
    onSubmit(
        gameDataSubmit,
        hasNoStatsTag ? [] : playerPerformancesSubmit, // Send empty player array if no_stats
        hasNoStatsTag ? {} as TeamStatisticsInsert : teamStatsSubmit // Send empty team stats object if no_stats
    );
  };

  // --- RENDER ---
  return (
    // Card container for the form
    <Card className="glass-card rounded-2xl shadow-2xl border-0 w-full max-w-4xl mx-auto overflow-hidden">
      <CardContent className="p-4 md:p-6">
        {/* React Hook Form Provider */}
        <Form {...form}>
          {/* HTML Form Element */}
          <form onSubmit={handleSubmit(processSubmit)} className="flex flex-col space-y-4 md:space-y-6 h-full">
            {/* Form Header */}
            <h2 className="text-xl font-semibold text-white">
                {isEditing ? `Editing Game ${game?.game_number}` : `Record Game ${nextGameNumber}`}
            </h2>

            {/* Tabs for Form Sections */}
            <Tabs defaultValue="details" className="flex flex-col flex-1 min-h-0">
              {/* Tab Navigation List */}
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
                   <TabsTrigger value="details"><Trophy className="h-4 w-4 mr-1 md:mr-2" />Match</TabsTrigger>
                   <TabsTrigger value="opponent"><Shield className="h-4 w-4 mr-1 md:mr-2" />Opponent</TabsTrigger>
                   <TabsTrigger value="team"><BarChartHorizontal className="h-4 w-4 mr-1 md:mr-2" />Team</TabsTrigger>
                   <TabsTrigger value="players"><Star className="h-4 w-4 mr-1 md:mr-2" />Players</TabsTrigger>
              </TabsList>

              {/* Scrollable Area for Tab Content */}
              <ScrollArea className="flex-1 mt-4 pr-2 -mr-2 custom-scrollbar">
               <div className="space-y-4 md:space-y-6 pb-4"> {/* Inner container for consistent spacing */}

                  {/* --- Match Details Tab --- */}
                  <TabsContent value="details" className="space-y-4 md:space-y-6 mt-0">
                    {/* Squad Selection Dropdown */}
                    <FormField
                      control={control} name="squad_id"
                      render={({ field }) => (
                         <FormItem className="space-y-1">
                             <FormLabel className="flex items-center gap-2 text-sm"><Users className="h-4 w-4" />Squad Used</FormLabel>
                             <FormControl>
                               {squadsLoading ? <Input disabled placeholder="Loading squads..." /> :
                                (!squads || squads.length === 0) ? <Input disabled placeholder="No squads found" /> :
                                 <Select
                                    value={field.value || ''} // Ensure value is controlled, fallback to empty string
                                    onValueChange={field.onChange}
                                    required // HTML5 required attribute
                                 >
                                     <SelectTrigger id="squad_id">
                                         <SelectValue placeholder="Select squad..." />
                                     </SelectTrigger>
                                     <SelectContent>
                                        {(squads || []).map((s) => (
                                            <SelectItem key={s.id} value={s.id}>{s.name} {s.is_default && "(Default)"}</SelectItem>
                                        ))}
                                     </SelectContent>
                                 </Select>}
                             </FormControl>
                              {/* Display specific error if field is required and empty */}
                             {errors.squad_id && errors.squad_id.type === 'invalid_string' && (!field.value || field.value === '') ?
                                <p className="text-xs text-red-500 mt-1">Please select a squad.</p> :
                                <FormMessage /> /* For other Zod errors */}
                         </FormItem>
                     )}
                    />
                    {/* Final Score Input Section */}
                    <div className="text-center space-y-4 pt-4 border-t border-border/20">
                      <Label className="text-lg font-semibold block">Final Score</Label>
                      <div className="flex items-start justify-center gap-2 md:gap-4">
                          {/* User Score */}
                          <div className="flex flex-col items-center flex-1 max-w-[150px]">
                               <Label className="text-sm font-medium text-primary mb-1">You</Label>
                               <div className="flex items-center w-full">
                                   <Button type="button" variant="outline" size="icon" className="w-8 h-8 p-0 shrink-0" onClick={() => adjustNumericalValue('user_goals', -1, 1, 0, 99)} disabled={watchedUserGoals <= 0} aria-label="Decrease your score"><Minus className="h-4 w-4" /></Button>
                                   <FormField control={control} name="user_goals" render={({ field }) => ( <FormItem className="flex-1 mx-1"> <FormControl><Input {...field} type="text" inputMode="numeric" className="h-12 sm:h-16 w-full text-center text-3xl sm:text-4xl px-0" onChange={(e) => /^\d*$/.test(e.target.value) && field.onChange(e.target.value)} onBlur={() => field.onChange(Math.max(0, Math.min(99, parseInt(String(field.value)) || 0)))} aria-label="Your goals" /></FormControl> </FormItem> )} />
                                   <Button type="button" variant="outline" size="icon" className="w-8 h-8 p-0 shrink-0" onClick={() => adjustNumericalValue('user_goals', 1, 1, 0, 99)} aria-label="Increase your score"><Plus className="h-4 w-4" /></Button>
                               </div>
                               <FormMessage className="text-xs">{errors.user_goals?.message}</FormMessage>
                          </div>
                          <span className="text-3xl sm:text-4xl font-bold text-muted-foreground pt-6">:</span> {/* Score Separator */}
                          {/* Opponent Score */}
                          <div className="flex flex-col items-center flex-1 max-w-[150px]">
                           <Label className="text-sm font-medium text-red-500 mb-1">Opponent</Label>
                           <div className="flex items-center w-full">
                                   <Button type="button" variant="outline" size="icon" className="w-8 h-8 p-0 shrink-0" onClick={() => adjustNumericalValue('opponent_goals', -1, 1, 0, 99)} disabled={watchedOpponentGoals <= 0} aria-label="Decrease opponent score"><Minus className="h-4 w-4" /></Button>
                                   <FormField control={control} name="opponent_goals" render={({ field }) => ( <FormItem className="flex-1 mx-1"> <FormControl><Input {...field} type="text" inputMode="numeric" className="h-12 sm:h-16 w-full text-center text-3xl sm:text-4xl px-0" onChange={(e) => /^\d*$/.test(e.target.value) && field.onChange(e.target.value)} onBlur={() => field.onChange(Math.max(0, Math.min(99, parseInt(String(field.value)) || 0)))} aria-label="Opponent goals" /></FormControl> </FormItem> )} />
                                   <Button type="button" variant="outline" size="icon" className="w-8 h-8 p-0 shrink-0" onClick={() => adjustNumericalValue('opponent_goals', 1, 1, 0, 99)} aria-label="Increase opponent score"><Plus className="h-4 w-4" /></Button>
                               </div>
                               <FormMessage className="text-xs">{errors.opponent_goals?.message}</FormMessage>
                          </div>
                      </div>
                    </div>
                    {/* Overtime/Penalty Result Select (Show only if score is tied) */}
                    {watchedUserGoals === watchedOpponentGoals && (
                      <FormField control={control} name="overtime_result" render={({ field }) => (
                          <FormItem>
                              <FormLabel>Result (OT/Pens)</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value ?? 'none'}>
                                  <FormControl><SelectTrigger><SelectValue placeholder="Select result if score tied..." /></SelectTrigger></FormControl>
                                  <SelectContent>
                                      <SelectItem value="win_ot">Win in OT</SelectItem> <SelectItem value="loss_ot">Loss in OT</SelectItem>
                                      <SelectItem value="win_pen">Win on Pens</SelectItem> <SelectItem value="loss_pen">Loss on Pens</SelectItem>
                                      <SelectItem value="none">N/A (Regular Draw)</SelectItem>
                                  </SelectContent>
                              </Select> <FormMessage />
                          </FormItem>
                      )}/>
                    )}
                    {/* Match Duration Input */}
                    <div>
                         <NumberInputWithSteppers name="duration" label="Match Duration (Mins)" step={1} min={1} max={120} className="space-y-1" inputClassName="h-10 text-base text-center" minInputWidth="w-20" control={control} adjustValue={adjustNumericalValue} getValues={getValues} />
                         <FormDescription className="text-xs mt-1">90=Full, 120=ET, less if ended early.</FormDescription>
                         <FormMessage className="text-xs">{errors.duration?.message}</FormMessage>
                    </div>
                  </TabsContent>

                  {/* --- Opponent Tab --- */}
                  <TabsContent value="opponent" className="space-y-4 md:space-y-6 mt-0">
                       {/* Opponent Username Input */}
                       <FormField control={control} name="opponent_username" render={({ field }) => ( <FormItem><FormLabel>Opponent Username</FormLabel><FormControl><Input {...field} placeholder="(Optional)" /></FormControl><FormMessage /></FormItem> )} />
                       {/* Squad Quality Radio Group */}
                        <FormField control={control} name="squad_quality_comparison" render={({ field }) => (
                            <FormItem className="space-y-3 pt-4 border-t border-border/20">
                                <FormLabel>Squad Quality Comparison</FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value ?? 'even'} className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
                                        <FormItem className="flex items-center space-x-3 space-y-0"> <FormControl><RadioGroupItem value="opponent_better" /></FormControl><FormLabel className="font-normal text-sm">Opponent Better</FormLabel> </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0"> <FormControl><RadioGroupItem value="even" /></FormControl><FormLabel className="font-normal text-sm">Even</FormLabel> </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0"> <FormControl><RadioGroupItem value="mine_better" /></FormControl><FormLabel className="font-normal text-sm">Mine Better</FormLabel> </FormItem>
                                    </RadioGroup>
                                </FormControl> <FormMessage />
                            </FormItem>
                        )}/>
                        {/* Server Quality, Stress Level Sliders & Cross-Play Switch */}
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4 border-t border-border/20">
                           <FormField control={control} name="server_quality" render={({ field }) => ( <FormItem><FormLabel>Server Quality: <span className="font-bold text-primary">{field.value ?? 5}</span>/10</FormLabel><FormControl><Slider value={[field.value ?? 5]} onValueChange={(v) => field.onChange(v[0])} max={10} step={1} min={1} /></FormControl><FormMessage /></FormItem>)}/>
                           <FormField control={control} name="stress_level" render={({ field }) => ( <FormItem><FormLabel>Your Stress Level: <span className="font-bold text-primary">{field.value ?? 5}</span>/10</FormLabel><FormControl><Slider value={[field.value ?? 5]} onValueChange={(v) => field.onChange(v[0])} max={10} step={1} min={1} /></FormControl><FormMessage /></FormItem>)}/>
                           <FormField control={control} name="cross_play_enabled" render={({ field }) => ( <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/20 p-3 shadow-sm mt-4 col-span-1 md:col-span-2"><div className="space-y-0.5"><FormLabel>Cross-Platform Match</FormLabel><FormDescription className="text-xs">Was opponent on a different platform?</FormDescription></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem> )}/>
                       </div>
                  </TabsContent>

                  {/* --- Team Stats Tab --- */}
                  <TabsContent value="team" className="space-y-4 md:space-y-6 mt-0">
                       <h3 className="text-lg font-semibold border-b border-border/20 pb-2">Your Team Statistics</h3>
                       {/* Grid of Team Stat Inputs */}
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-4">
                           <NumberInputWithSteppers name="team_stats.shots" label="Shots" control={control} adjustValue={adjustNumericalValue} getValues={getValues} min={0} max={99} />
                           <NumberInputWithSteppers name="team_stats.shots_on_target" label="On Target" max={getValues('team_stats.shots') ?? 99} control={control} adjustValue={adjustNumericalValue} getValues={getValues} min={0} />
                           <NumberInputWithSteppers name="team_stats.possession" label="Possession %" max={100} control={control} adjustValue={adjustNumericalValue} getValues={getValues} min={0} />
                           <NumberInputWithSteppers name="team_stats.passes" label="Passes" step={5} max={999} control={control} adjustValue={adjustNumericalValue} getValues={getValues} min={0} />
                           <NumberInputWithSteppers name="team_stats.pass_accuracy" label="Pass Acc %" max={100} control={control} adjustValue={adjustNumericalValue} getValues={getValues} min={0} />
                           <NumberInputWithSteppers name="team_stats.expected_goals" label="Your xG" step={0.1} max={20} control={control} adjustValue={adjustNumericalValue} getValues={getValues} min={0} />
                           <NumberInputWithSteppers name="team_stats.expected_goals_against" label="Opponent xG" step={0.1} max={20} control={control} adjustValue={adjustNumericalValue} getValues={getValues} min={0} />
                           <NumberInputWithSteppers name="team_stats.dribble_success_rate" label="Dribble %" max={100} control={control} adjustValue={adjustNumericalValue} getValues={getValues} min={0}/>
                           <NumberInputWithSteppers name="team_stats.corners" label="Corners" max={99} control={control} adjustValue={adjustNumericalValue} getValues={getValues} min={0}/>
                           <NumberInputWithSteppers name="team_stats.fouls" label="Fouls" max={99} control={control} adjustValue={adjustNumericalValue} getValues={getValues} min={0}/>
                           <NumberInputWithSteppers name="team_stats.yellow_cards" label="Yellow Cards" max={11} control={control} adjustValue={adjustNumericalValue} getValues={getValues} min={0}/>
                           <NumberInputWithSteppers name="team_stats.red_cards" label="Red Cards" max={5} control={control} adjustValue={adjustNumericalValue} getValues={getValues} min={0}/>
                       </div>
                       {/* Match Tags Selection */}
                       <FormField control={control} name="tags" render={({ field }) => (
                         <FormItem className="space-y-2 pt-4 border-t border-border/20">
                             <FormLabel>Match Tags</FormLabel>
                             <FormDescription className="text-xs">Select tags that apply. Hover/tap for details.</FormDescription>
                             <TooltipProvider delayDuration={300}>
                                 <div className="flex flex-wrap gap-2">
                                     {matchTags.map(tag => (
                                         <Tooltip key={tag.id}>
                                             <TooltipTrigger asChild>
                                                 <FormControl>
                                                     <Toggle
                                                         variant="outline" size="sm"
                                                         className={cn(
                                                            "text-xs h-7 border border-border/50 transition-colors duration-150", // Base styles + transition
                                                            "hover:bg-muted/50", // Hover style
                                                            "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary" // Selected styles
                                                         )}
                                                         pressed={field.value?.includes(tag.name)}
                                                         onPressedChange={(isPressed) => {
                                                             const currentTags = field.value || [];
                                                             const newTags = isPressed ? [...currentTags, tag.name] : currentTags.filter(t => t !== tag.name);
                                                             field.onChange(newTags);
                                                         }}
                                                         aria-label={`Toggle tag: ${tag.name}`}
                                                     >
                                                         {tag.name}
                                                     </Toggle>
                                                 </FormControl>
                                             </TooltipTrigger>
                                             <TooltipContent side="bottom" align="start"><p className="max-w-xs">{tag.description}</p></TooltipContent>
                                         </Tooltip>
                                     ))}
                                 </div>
                             </TooltipProvider>
                             <FormMessage />
                         </FormItem>
                       )} />
                       {/* Comments Textarea */}
                        <FormField control={control} name="comments" render={({ field }) => (<FormItem className="pt-4 border-t border-border/20"><FormLabel>Comments</FormLabel><FormControl><Textarea {...field} placeholder="Key moments, tactics, frustrations..." /></FormControl><FormMessage /></FormItem>)}/>
                  </TabsContent>

                  {/* --- Player Stats Tab --- */}
                  <TabsContent value="players" className="space-y-4 flex flex-col min-h-0 mt-0">
                        {/* Tab Header with Info Tooltip */}
                        <div className="flex justify-between items-center mb-2 shrink-0">
                           <h3 className="text-lg font-semibold">Player Performances</h3>
                           <TooltipProvider delayDuration={100}>
                             <Tooltip>
                               <TooltipTrigger asChild>
                                {/* Button acts as trigger, styled subtly */}
                                <Button type="button" variant="ghost" className='opacity-60 cursor-help px-2 h-8'>
                                  <UserPlus className="h-4 w-4 mr-1" /> Info
                                </Button>
                               </TooltipTrigger>
                               <TooltipContent side="left" className="text-xs">
                                 <p>Bench players load with 0 mins.</p>
                                 <p>Adjust minutes if they played.</p>
                                 <p>Stats only save if minutes &gt; 0.</p>
                               </TooltipContent>
                             </Tooltip>
                           </TooltipProvider>
                        </div>
                        {/* Scrollable Area for Player Stats Form */}
                        <ScrollArea className="flex-grow custom-scrollbar pr-1 -mr-1">
                           {/* Conditional Rendering based on squad loading/selection */}
                           {squadsLoading ? (<p className="text-sm text-muted-foreground p-4 text-center">Loading squad...</p>)
                           : !watchedSquadId ? (<p className="text-sm text-muted-foreground p-4 text-center">Please select a squad first.</p>)
                           : (!watchedPlayerStats || watchedPlayerStats.length === 0) ? (
                               <div className="text-center py-8 border border-dashed rounded-lg text-muted-foreground">
                                   <p className='px-4'>No players found for "{selectedSquad?.name || 'selected squad'}".</p>
                                   <p className='text-xs px-4 mt-1'>Check squad setup or select a different squad.</p>
                               </div>
                           ) : (
                               // Render PlayerStatsForm component when players exist
                               <FormField control={control} name="player_stats" render={({ field }) => (
                                   <FormItem>
                                       <FormControl>
                                           <PlayerStatsForm
                                               players={field.value || []} // Pass player data array
                                               onStatsChange={(updatedPlayers) => field.onChange(updatedPlayers)} // Update callback
                                               gameDuration={watchedDuration || 90} // Pass game duration
                                           />
                                       </FormControl>
                                       <FormMessage /> {/* Error message for the player_stats array */}
                                   </FormItem> )} />
                           )}
                        </ScrollArea>
                  </TabsContent>

               </div> {/* End Inner Content Container */}
              </ScrollArea> {/* End Scrollable Area */}
            </Tabs> {/* End Tabs Component */}

            {/* Form Footer with Action Buttons */}
            <div className="flex justify-between items-center mt-auto pt-4 border-t border-border/20">
              {/* Cancel Button */}
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
              {/* Submit Button */}
              <Button
                type="submit"
                // Disable if submitting, loading data, form invalid, or no valid squad selected
                disabled={isSubmitting || isLoading || !isValid || squadsLoading || (!watchedSquadId && (!squads || squads.length > 0))}
                aria-label={isEditing ? 'Update game record' : 'Save new game record'}
              >
                {(isSubmitting || isLoading) ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {isEditing ? 'Update Game' : 'Save Game'}
              </Button>
            </div>

          </form> {/* End HTML Form */}
        </Form> {/* End RHF Provider */}
      </CardContent>
    </Card>
  );
};

export default GameRecordForm;
