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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // <-- Added CardHeader, CardTitle
import { Save, Loader2, UserPlus, Users, Plus, Minus, Trophy, Shield, BarChartHorizontal, Star, X, Goal, Footprints, Clock, Square, SquareCheck, ShieldAlert } from 'lucide-react';
import PlayerStatsForm from '@/components/PlayerStatsForm';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Game, PlayerPerformanceInsert, TeamStatisticsInsert, PlayerPerformance, WeeklyPerformance } from '@/types/futChampions';
import { Squad, PlayerCard } from '@/types/squads'; // <-- Removed SquadPlayer, not in use
import { get, set, isEqual } from 'lodash';
import { useAllSquadsData } from '@/hooks/useAllSquadsData';
import { useTheme } from '@/hooks/useTheme';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useGameVersion } from '@/contexts/GameVersionContext';
import { supabase } from '@/integrations/supabase/client';
import WeekProgress from '@/components/WeekProgress';
import CurrentRunStats from '@/components/CurrentRunStats';
import GameListItem from '@/components/GameListItem';
import WeekCompletionPopup from '@/components/WeekCompletionPopup';

// --- ADD THIS IMPORT ---
import CurrentRunChunkStats from '@/components/CurrentRunChunkStats';

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
      // --- ADDED isSub for sorting ---
      isSub: z.boolean(), 
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
  isSub: boolean; // --- ADDED ---
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

     const defaultSquadId = safeSquads.find(s => s.is_default)?.id || safeSquads[0]?.id || '';
     baseDefaults.squad_id = defaultSquadId;

    // If editing an existing game, merge its data
    if (isEditing && game) {
      const formPlayerStats: PlayerStatFormData[] = (game.player_performances || []).map(p => ({
            id: p.player_id || p.id, // Use player_id (UUID)
            name: p.player_name || 'Unknown',
            position: p.position || 'N/A',
            // --- ADDED: Default isSub to false, this is imperfect but avoids breaking ---
            isSub: false, // This will be imperfect for edited games, as we didn't store this
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

  const selectedSquad = useMemo(() => (squads || []).find(s => s.id === watchedSquadId), [squads, watchedSquadId]);

   // Effect to reset the form when defaultValues change significantly
  useEffect(() => {
    if (JSON.stringify(form.formState.defaultValues) !== JSON.stringify(defaultValues)) {
        reset(defaultValues);
    }
  }, [reset, defaultValues, form.formState.defaultValues]);


  // Effect to populate/update player_stats list based on selected squad and duration
  useEffect(() => {
    if (!squadsLoading && selectedSquad) {
        const squadJustChanged = dirtyFields.squad_id; 
        const isInitialLoadOrReset = !watchedPlayerStats || watchedPlayerStats.length === 0;

        if (squadJustChanged || (!isEditing && isInitialLoadOrReset)) {
             const squadPlayersData = (selectedSquad.squad_players || [])
                .filter(sp => sp.players && (sp.slot_id?.startsWith('starting-') || sp.slot_id?.startsWith('sub-')))
                .map(sp => {
                    const isStarter = sp.slot_id?.startsWith('starting-');
                    return { // Map to PlayerStatFormData structure
                        id: sp.players!.id, name: sp.players!.name,
                        position: sp.players!.position || 'N/A',
                        isSub: !isStarter, // --- ADDED ---
                        minutes_played: isStarter ? (watchedDuration || 90) : 0, // Subs start at 0
                        goals: 0, assists: 0, rating: 7.0,
                        yellow_cards: 0, red_cards: 0, own_goals: 0,
                    };
                });
             
            setValue('player_stats', squadPlayersData, { shouldValidate: true, shouldDirty: !isInitialLoadOrReset, shouldTouch: !isInitialLoadOrReset });

        } else if (!squadJustChanged && watchedPlayerStats) {
             const updatedPlayers = watchedPlayerStats.map(currentPlayer => {
                const squadPlayerInfo = (selectedSquad.squad_players || []).find(sp => sp.players?.id === currentPlayer.id);
                const wasStarter = squadPlayerInfo?.slot_id?.startsWith('starting-');
                 const currentDefaultDuration = game?.duration || 90; 
                 const needsAutoUpdate = wasStarter && (currentPlayer.minutes_played === currentDefaultDuration || currentPlayer.minutes_played === 90 || currentPlayer.minutes_played === 120);

                const newMinutes = needsAutoUpdate ? (watchedDuration || 90) : currentPlayer.minutes_played;

                return currentPlayer.minutes_played !== newMinutes ? { ...currentPlayer, minutes_played: newMinutes } : currentPlayer;
             });

             if(!isEqual(watchedPlayerStats, updatedPlayers)) {
                 setValue('player_stats', updatedPlayers, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
             }
        }
    } else if (!squadsLoading && !selectedSquad && watchedPlayerStats && watchedPlayerStats.length > 0) {
        // setValue('player_stats', [], { shouldValidate: true, shouldDirty: true });
    }
  }, [
      selectedSquad, watchedDuration, setValue, isEditing, dirtyFields.squad_id,
      squadsLoading, reset, game?.duration,
      watchedPlayerStats 
    ]);


  // Callback for +/- buttons on numeric inputs
  const adjustNumericalValue = useCallback((fieldName: string, delta: number, stepValue: number = 1, min: number, max: number) => {
    const currentValue = get(getValues(), fieldName); 
    let currentNum = stepValue < 1 ? parseFloat(String(currentValue)) : parseInt(String(currentValue), 10); 
    if (isNaN(currentNum)) { currentNum = min; } 

    let newValue = currentNum + (delta * stepValue);

    if (stepValue < 1 || String(fieldName).includes('rating') || String(fieldName).includes('expected_goals')) {
        const precision = String(stepValue).includes('.') ? String(stepValue).split('.')[1].length : 1;
        newValue = parseFloat(newValue.toFixed(precision));
    } else {
        newValue = Math.round(newValue); 
    }

    newValue = Math.max(min, Math.min(max, newValue)); 
    setValue(fieldName as any, newValue, { shouldValidate: true, shouldDirty: true, shouldTouch: true }); 
  }, [getValues, setValue]);


  // Effect to automatically set the 'result' field based on scores and OT
  useEffect(() => {
     let newResult: 'win' | 'loss' = getValues('result') ?? 'win'; 
     let needsUpdate = false;

     if (watchedUserGoals === watchedOpponentGoals) { 
        if (watchedOvertimeResult !== 'none') { 
            const otResult = (watchedOvertimeResult === 'win_ot' || watchedOvertimeResult === 'win_pen') ? 'win' : 'loss';
            if (newResult !== otResult) {
                newResult = otResult;
                needsUpdate = true;
            }
        } else { 
             if (newResult !== 'win' && newResult !== 'loss') {
                 newResult = 'win'; 
                 needsUpdate = true;
             }
        }
     } else { 
        const scoreResult = watchedUserGoals > watchedOpponentGoals ? 'win' : 'loss';
        if (newResult !== scoreResult) {
            newResult = scoreResult;
            needsUpdate = true;
        }
        if (watchedOvertimeResult !== 'none') {
             setValue('overtime_result', 'none', { shouldValidate: true, shouldDirty: true }); 
        }
     }

     if (needsUpdate) {
        setValue('result', newResult, { shouldValidate: true, shouldDirty: true });
     }
  }, [watchedUserGoals, watchedOpponentGoals, watchedOvertimeResult, setValue, getValues]);

  // Effect to determine game_context (e.g., 'penalties', 'rage_quit')
  useEffect(() => {
     const tags = watchedTags || [];
     let newContext = 'normal'; 
     const currentContext = getValues('game_context');

     const contextTag = matchTags.find(tag => tags.includes(tag.name) && tag.context);
     if (contextTag?.context) {
         newContext = contextTag.context;
     }
     else if (watchedOvertimeResult === 'win_ot' || watchedOvertimeResult === 'loss_ot') {
        newContext = 'extra_time';
     } else if (watchedOvertimeResult === 'win_pen' || watchedOvertimeResult === 'loss_pen') {
         newContext = 'penalties';
     }

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
      const validPlayerPerformances = (data.player_stats || []).filter(p => p.minutes_played > 0);

      const playerPerformancesSubmit: PlayerPerformanceInsert[] = validPlayerPerformances.map(p => ({
            user_id: user!.id,
            player_name: p.name,
            player_id: p.id, 
            position: p.position,
            minutes_played: p.minutes_played,
            goals: p.goals, assists: p.assists, rating: p.rating,
            yellow_cards: p.yellow_cards, red_cards: p.red_cards > 0 ? 1 : 0, 
            own_goals: p.own_goals,
        }));

     const gameDataSubmit: Omit<Game, 'id' | 'created_at' | 'week_id' | 'score_line' | 'date_played' | 'player_performances' | 'team_stats' | 'user_id'> = {
        game_number: data.game_number, user_goals: data.user_goals, opponent_goals: data.opponent_goals,
        result: data.result, overtime_result: data.overtime_result,
        opponent_username: data.opponent_username || null, 
        squad_quality_comparison: data.squad_quality_comparison,
        game_context: data.game_context, comments: data.comments || null, 
        duration: data.duration, stress_level: data.stress_level, squad_used: data.squad_id,
        server_quality: data.server_quality, cross_play_enabled: data.cross_play_enabled,
        tags: data.tags, game_version: gameVersion,
     };

    const teamStatsSubmit: TeamStatisticsInsert = {
        user_id: user!.id, possession: data.team_stats.possession, passes: data.team_stats.passes,
        pass_accuracy: data.team_stats.pass_accuracy, shots: data.team_stats.shots,
        shots_on_target: data.team_stats.shots_on_target, corners: data.team_stats.corners,
        fouls: data.team_stats.fouls, yellow_cards: data.team_stats.yellow_cards,
        red_cards: data.team_stats.red_cards, expected_goals: data.team_stats.expected_goals,
        expected_goals_against: data.team_stats.expected_goals_against,
        dribble_success_rate: data.team_stats.dribble_success_rate,
    };

    const hasNoStatsTag = data.tags?.some(tagName =>
        matchTags.find(t => t.name === tagName)?.specialRule === 'no_stats'
    );

    onSubmit(
        gameDataSubmit,
        hasNoStatsTag ? [] : playerPerformancesSubmit, 
        hasNoStatsTag ? {} as TeamStatisticsInsert : teamStatsSubmit 
    );
  };

  // --- RENDER ---
  return (
    <Card className="glass-card rounded-2xl shadow-2xl border-0 w-full max-w-4xl mx-auto overflow-hidden">
      <CardContent className="p-4 md:p-6">
        <Form {...form}>
          <form onSubmit={handleSubmit(processSubmit)} className="flex flex-col space-y-4 md:space-y-6 h-full">
            <h2 className="text-xl font-semibold text-white">
                {isEditing ? `Editing Game ${game?.game_number}` : `Record Game ${nextGameNumber}`}
            </h2>

            <Tabs defaultValue="details" className="flex flex-col flex-1 min-h-0">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
                   <TabsTrigger value="details"><Trophy className="h-4 w-4 mr-1 md:mr-2" />Match</TabsTrigger>
                   <TabsTrigger value="opponent"><Shield className="h-4 w-4 mr-1 md:mr-2" />Opponent</TabsTrigger>
                   <TabsTrigger value="team"><BarChartHorizontal className="h-4 w-4 mr-1 md:mr-2" />Team</TabsTrigger>
                   <TabsTrigger value="players"><Star className="h-4 w-4 mr-1 md:mr-2" />Players</TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 mt-4 pr-2 -mr-2 custom-scrollbar">
               <div className="space-y-4 md:space-y-6 pb-4"> 
                  <TabsContent value="details" className="space-y-4 md:space-y-6 mt-0">
                    <FormField
                      control={control} name="squad_id"
                      render={({ field }) => (
                         <FormItem className="space-y-1">
                             <FormLabel className="flex items-center gap-2 text-sm"><Users className="h-4 w-4" />Squad Used</FormLabel>
                             <FormControl>
                               {squadsLoading ? <Input disabled placeholder="Loading squads..." /> :
                                (!squads || squads.length === 0) ? <Input disabled placeholder="No squads found" /> :
                                 <Select
                                    value={field.value || ''} 
                                    onValueChange={field.onChange}
                                    required 
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
                             {errors.squad_id && errors.squad_id.type === 'invalid_string' && (!field.value || field.value === '') ?
                                <p className="text-xs text-red-500 mt-1">Please select a squad.</p> :
                                <FormMessage /> }
                         </FormItem>
                     )}
                    />
                    <div className="text-center space-y-4 pt-4 border-t border-border/20">
                      <Label className="text-lg font-semibold block">Final Score</Label>
                      <div className="flex items-start justify-center gap-2 md:gap-4">
                          <div className="flex flex-col items-center flex-1 max-w-[150px]">
                               <Label className="text-sm font-medium text-primary mb-1">You</Label>
                               <div className="flex items-center w-full">
                                   <Button type="button" variant="outline" size="icon" className="w-8 h-8 p-0 shrink-0" onClick={() => adjustNumericalValue('user_goals', -1, 1, 0, 99)} disabled={watchedUserGoals <= 0} aria-label="Decrease your score"><Minus className="h-4 w-4" /></Button>
                                   <FormField control={control} name="user_goals" render={({ field }) => ( <FormItem className="flex-1 mx-1"> <FormControl><Input {...field} type="text" inputMode="numeric" className="h-12 sm:h-16 w-full text-center text-3xl sm:text-4xl px-0" onChange={(e) => /^\d*$/.test(e.target.value) && field.onChange(e.target.value)} onBlur={() => field.onChange(Math.max(0, Math.min(99, parseInt(String(field.value)) || 0)))} aria-label="Your goals" /></FormControl> </FormItem> )} />
                                   <Button type="button" variant="outline" size="icon" className="w-8 h-8 p-0 shrink-0" onClick={() => adjustNumericalValue('user_goals', 1, 1, 0, 99)} aria-label="Increase your score"><Plus className="h-4 w-4" /></Button>
                               </div>
                               <FormMessage className="text-xs">{errors.user_goals?.message}</FormMessage>
                          </div>
                          <span className="text-3xl sm:text-4xl font-bold text-muted-foreground pt-6">:</span> 
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
                    <div>
                         <NumberInputWithSteppers name="duration" label="Match Duration (Mins)" step={1} min={1} max={120} className="space-y-1" inputClassName="h-10 text-base text-center" minInputWidth="w-20" control={control} adjustValue={adjustNumericalValue} getValues={getValues} />
                         <FormDescription className="text-xs mt-1">90=Full, 120=ET, less if ended early.</FormDescription>
                         <FormMessage className="text-xs">{errors.duration?.message}</FormMessage>
                    </div>
                  </TabsContent>

                  <TabsContent value="opponent" className="space-y-4 md:space-y-6 mt-0">
                       <FormField control={control} name="opponent_username" render={({ field }) => ( <FormItem><FormLabel>Opponent Username</FormLabel><FormControl><Input {...field} placeholder="(Optional)" /></FormControl><FormMessage /></FormItem> )} />
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
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4 border-t border-border/20">
                           <FormField control={control} name="server_quality" render={({ field }) => ( <FormItem><FormLabel>Server Quality: <span className="font-bold text-primary">{field.value ?? 5}</span>/10</FormLabel><FormControl><Slider value={[field.value ?? 5]} onValueChange={(v) => field.onChange(v[0])} max={10} step={1} min={1} /></FormControl><FormMessage /></FormItem>)}/>
                           <FormField control={control} name="stress_level" render={({ field }) => ( <FormItem><FormLabel>Your Stress Level: <span className="font-bold text-primary">{field.value ?? 5}</span>/10</FormLabel><FormControl><Slider value={[field.value ?? 5]} onValueChange={(v) => field.onChange(v[0])} max={10} step={1} min={1} /></FormControl><FormMessage /></FormItem>)}/>
                           <FormField control={control} name="cross_play_enabled" render={({ field }) => ( <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/20 p-3 shadow-sm mt-4 col-span-1 md:col-span-2"><div className="space-y-0.5"><FormLabel>Cross-Platform Match</FormLabel><FormDescription className="text-xs">Was opponent on a different platform?</FormDescription></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem> )}/>
                       </div>
                  </TabsContent>

                  <TabsContent value="team" className="space-y-4 md:space-y-6 mt-0">
                       <h3 className="text-lg font-semibold border-b border-border/20 pb-2">Your Team Statistics</h3>
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
                                                            "text-xs h-7 border border-border/50 transition-colors duration-150", 
                                                            "hover:bg-muted/50", 
                                                            "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary"
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
                        <FormField control={control} name="comments" render={({ field }) => (<FormItem className="pt-4 border-t border-border/20"><FormLabel>Comments</FormLabel><FormControl><Textarea {...field} placeholder="Key moments, tactics, frustrations..." /></FormControl><FormMessage /></FormItem>)}/>
                  </TabsContent>

                  <TabsContent value="players" className="space-y-4 flex flex-col min-h-0 mt-0">
                        <div className="flex justify-between items-center mb-2 shrink-0">
                           <h3 className="text-lg font-semibold">Player Performances</h3>
                           <TooltipProvider delayDuration={100}>
                             <Tooltip>
                               <TooltipTrigger asChild>
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
                        <ScrollArea className="flex-grow custom-scrollbar pr-1 -mr-1">
                           {squadsLoading ? (<p className="text-sm text-muted-foreground p-4 text-center">Loading squad...</p>)
                           : !watchedSquadId ? (<p className="text-sm text-muted-foreground p-4 text-center">Please select a squad first.</p>)
                           : (!watchedPlayerStats || watchedPlayerStats.length === 0) ? (
                               <div className="text-center py-8 border border-dashed rounded-lg text-muted-foreground">
                                   <p className='px-4'>No players found for "{selectedSquad?.name || 'selected squad'}".</p>
                                   <p className='text-xs px-4 mt-1'>Check squad setup or select a different squad.</p>
                               </div>
                           ) : (
                               <FormField control={control} name="player_stats" render={({ field }) => (
                                   <FormItem>
                                       <FormControl>
                                           <PlayerStatsForm
                                               players={field.value || []} 
                                               onStatsChange={(updatedPlayers) => field.onChange(updatedPlayers)} 
                                               gameDuration={watchedDuration || 90} 
                                           />
                                       </FormControl>
                                       <FormMessage /> 
                                   </FormItem> )} />
                           )}
                        </ScrollArea>
                  </TabsContent>

               </div> 
              </ScrollArea> 
            </Tabs> 

            <div className="flex justify-between items-center mt-auto pt-4 border-t border-border/20">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
              <Button
                type="submit"
                disabled={isSubmitting || isLoading || !isValid || squadsLoading || (!watchedSquadId && (!squads || squads.length > 0))}
                aria-label={isEditing ? 'Update game record' : 'Save new game record'}
              >
                {(isSubmitting || isLoading) ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {isEditing ? 'Update Game' : 'Save Game'}
              </Button>
            </div>

          </form> 
        </Form> 
      </CardContent>
    </Card>
  );
};

// --- MAIN PAGE COMPONENT ---

const CurrentRunPage = () => {
  const { user } = useAuth();
  const { gameVersion } = useGameVersion();
  const { toast } = useToast();
  const [currentRun, setCurrentRun] = useState<WeeklyPerformance | null>(null);
  const [isLoadingRun, setIsLoadingRun] = useState(true);
  const [isSubmittingGame, setIsSubmittingGame] = useState(false);
  const [isFinishingRun, setIsFinishingRun] = useState(false);
  const [showGameForm, setShowGameForm] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);

  const fetchCurrentRun = useCallback(async (showLoading = true) => {
    if (!user) {
      setIsLoadingRun(false);
      return;
    }
    if (showLoading) setIsLoadingRun(true);

    try {
      // --- !! FIX IS HERE !! ---
      const { data, error } = await supabase
        .from('weekly_performances') // 1. Fixed: 'weekly_performances' (plural)
        .select(
          '*, games:game_results(*, team_stats:team_statistics(*), player_performances(*))' // 2. Fixed: Aliased table names
        )
        .eq('user_id', user.id)
        .eq('game_version', gameVersion)
        .eq('is_completed', false)
        .order('week_number', { ascending: false })
        .limit(1);
      // --- !! END OF FIX !! ---

      if (error) throw error;

      if (data && data.length > 0) {
        const run = data[0];
        // Sort games by game_number ascending
        if (run.games) {
          run.games.sort((a, b) => a.game_number - b.game_number);
        }
        setCurrentRun(run as WeeklyPerformance);
      } else {
        setCurrentRun(null);
      }
    } catch (err: any) {
      toast({
        title: "Error loading run",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingRun(false);
    }
  }, [user, gameVersion, toast]);

  useEffect(() => {
    fetchCurrentRun();
  }, [fetchCurrentRun]);

  const startNewRun = async () => {
    if (!user) return;
    setIsLoadingRun(true);

    try {
      // 1. Get the latest week number
      const { data: latestRun, error: latestRunError } = await supabase
        .from('weekly_performances') // Fixed
        .select('week_number')
        .eq('user_id', user.id)
        .eq('game_version', gameVersion)
        .order('week_number', { ascending: false })
        .limit(1);

      if (latestRunError) throw latestRunError;

      const newWeekNumber = (latestRun && latestRun.length > 0) ? latestRun[0].week_number + 1 : 1;
      const startDate = new Date().toISOString();

      // 2. Create the new run
      const { data: newRun, error: newRunError } = await supabase
        .from('weekly_performances') // Fixed
        .insert({
          user_id: user.id,
          week_number: newWeekNumber,
          start_date: startDate,
          game_version: gameVersion,
          is_completed: false,
          custom_name: `Week ${newWeekNumber}`, // Default name
          target_wins: 11,
          target_rank: 'Rank 5',
        })
        .select()
        .single();

      if (newRunError) throw newRunError;

      setCurrentRun({ ...newRun, games: [] }); // Set as active run
      setShowGameForm(true); // Show form to add game 1
      toast({
        title: "New Run Started!",
        description: `Good luck in Week ${newWeekNumber}!`,
      });

    } catch (err: any) {
      toast({
        title: "Error starting new run",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingRun(false);
    }
  };

  const finishCurrentRun = async () => {
    if (!currentRun) return;
    setIsFinishingRun(true);

    try {
      const { error } = await supabase
        .from('weekly_performances') // Fixed
        .update({ is_completed: true, end_date: new Date().toISOString() })
        .eq('id', currentRun.id);

      if (error) throw error;

      toast({
        title: "Run Completed!",
        description: `${currentRun.custom_name} has been saved to your history.`,
      });
      setShowCompletionPopup(true); // Show summary popup
    } catch (err: any) {
      toast({
        title: "Error finishing run",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsFinishingRun(false);
    }
  };

  const handleGameSubmit = async (
    gameData: Omit<Game, 'id' | 'created_at' | 'week_id' | 'score_line' | 'date_played' | 'player_performances' | 'team_stats' | 'user_id'>,
    playerPerformances: PlayerPerformanceInsert[],
    teamStats: TeamStatisticsInsert
  ) => {
    if (!user || !currentRun) return;
    setIsSubmittingGame(true);

    const gameId = editingGame?.id; 

    try {
      // --- 1. Upsert Game Data ---
      const gamePayload = {
        ...gameData,
        id: gameId, 
        user_id: user.id,
        week_id: currentRun.id,
        score_line: `${gameData.user_goals}-${gameData.opponent_goals}`,
        date_played: new Date().toISOString(),
      };

      const { data: savedGame, error: gameError } = await supabase
        .from('game_results') // Fixed
        .upsert(gamePayload) 
        .select()
        .single();

      if (gameError) throw gameError;

      // --- 2. Handle Team Stats ---
      const statsPayload = {
        ...teamStats,
        game_id: savedGame.id,
        user_id: user.id,
        // week_id: currentRun.id, // Not in team_statistics schema
        id: editingGame?.team_stats ? (editingGame.team_stats as any).id : undefined
      };
      
      const { error: statsError } = await supabase
        .from('team_statistics') // Fixed
        .upsert(statsPayload);

      if (statsError) throw statsError;

      // --- 3. Handle Player Performances (Delete existing then insert new) ---
      if (gameId) {
        const { error: deletePerfError } = await supabase
          .from('player_performances')
          .delete()
          .eq('game_id', gameId);
        if (deletePerfError) throw deletePerfError;
      }
      
      if (playerPerformances.length > 0) {
        const perfPayload = playerPerformances.map(p => ({
          ...p,
          game_id: savedGame.id,
          // week_id: currentRun.id, // Not in player_performances schema
          user_id: user.id,
        }));
        
        const { error: perfError } = await supabase
          .from('player_performances')
          .insert(perfPayload);

        if (perfError) throw perfError;
      }

      // --- 4. Update Run Summary ---
      await fetchCurrentRun(false); 

      toast({
        title: `Game ${savedGame.game_number} ${isEditing ? 'Updated' : 'Saved'}!`,
        description: `Result: ${savedGame.result} (${savedGame.score_line})`,
      });

      setEditingGame(null);
      setShowGameForm(false);

    } catch (err: any) {
      console.error("Error saving game:", err);
      toast({
        title: "Error saving game",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmittingGame(false);
    }
  };

  const handleEditGame = (game: Game) => {
    setEditingGame(game);
    setShowGameForm(true);
  };

  const handleCancelEdit = () => {
    setEditingGame(null);
    setShowGameForm(false);
  };
  
  const handleDeleteGame = async (gameId: string) => {
    try {
        const { error } = await supabase
            .from('game_results') // Fixed
            .delete()
            .eq('id', gameId);
        if (error) throw error;
        
        toast({
            title: "Game Deleted",
            description: "The game and its stats have been removed.",
        });
        await fetchCurrentRun(false); 
        
    } catch (err: any) {
         toast({
            title: "Error deleting game",
            description: err.message,
            variant: "destructive",
        });
    }
  };
  
  const handlePopupClose = () => {
      setShowCompletionPopup(false);
      setCurrentRun(null); 
      fetchCurrentRun(); 
  };

  // --- RENDER LOGIC ---

  if (isLoadingRun) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentRun && !isLoadingRun) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 text-center glass-card p-8">
        <Trophy className="h-16 w-16 text-primary mb-4" />
        <h2 className="text-2xl font-semibold text-white mb-2">No Active Run</h2>
        <p className="text-muted-foreground mb-6">You don't have an active FUT Champions run. Start one to begin tracking!</p>
        <Button onClick={startNewRun} disabled={isLoadingRun}>
          Start New Run
        </Button>
      </div>
    );
  }

  // If a run is active
  const nextGameNumber = currentRun.games ? currentRun.games.length + 1 : 1;
  const games = currentRun.games || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">{currentRun.custom_name || `Week ${currentRun.week_number}`}</h1>
          <p className="text-muted-foreground">Tracking {games.length} {games.length === 1 ? 'game' : 'games'} so far.</p>
        </div>
        <div className="flex gap-2">
            {!showGameForm && (
                <Button onClick={() => setShowGameForm(true)} disabled={isFinishingRun}>
                    <Plus className="h-4 w-4 mr-2" /> Record Game {nextGameNumber}
                </Button>
            )}
            <Button
                variant="destructive"
                onClick={finishCurrentRun}
                disabled={isFinishingRun || games.length === 0}
                aria-label="Finish current run"
            >
                {isFinishingRun ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trophy className="h-4 w-4" />}
            </Button>
        </div>
      </div>

      {/* --- ADDED THE NEW COMPONENT HERE --- */}
      {currentRun && (
        <CurrentRunChunkStats currentRun={currentRun} />
      )}
      {/* --- END OF ADDITION --- */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Stats) */}
        <div className="lg:col-span-1 space-y-6">
          <CurrentRunStats run={currentRun} />
          <WeekProgress run={currentRun} />
        </div>

        {/* Right Column (Form or Game List) */}
        <div className="lg:col-span-2">
          {showGameForm ? (
            <GameRecordForm
              key={editingGame?.id || 'new'} 
              onSubmit={handleGameSubmit}
              isLoading={isSubmittingGame}
              game={editingGame}
              weekId={currentRun.id}
              gameVersion={gameVersion}
              nextGameNumber={editingGame ? editingGame.game_number : nextGameNumber}
              onCancel={handleCancelEdit}
            />
          ) : (
             <Card className="glass-card">
                <CardHeader><CardTitle>Game History</CardTitle></CardHeader>
                <CardContent>
                  {games.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No games recorded for this run yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {games.map(game => (
                        <GameListItem 
                            key={game.id} 
                            game={game} 
                            onEdit={() => handleEditGame(game)} 
                            onDelete={() => handleDeleteGame(game.id)}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
             </Card>
          )}
        </div>
      </div>
      
      {/* Completion Popup */}
      <WeekCompletionPopup
        isOpen={showCompletionPopup}
        onClose={handlePopupClose}
        runData={currentRun}
      />
    </div>
  );
};

export default CurrentRunPage;
