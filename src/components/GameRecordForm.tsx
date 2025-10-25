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
import { Save, Loader2, UserPlus, Users, Plus, Minus, Trophy, Shield, BarChartHorizontal, Star, X, Goal, Footprints, Clock, Square, SquareCheck, ShieldAlert } from 'lucide-react'; // Added missing icons
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
  squad_id: z.string().uuid({ message: "Please select a squad." }),
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
                            className={cn("h-8 text-sm font-semibold", inputClassName, minInputWidth)}
                            onChange={(e) => {
                                let val = e.target.value;
                                const numRegex = step < 1 ? /^\d*\.?\d*$/ : /^\d*$/;
                                if (numRegex.test(val)) {
                                     if (step >= 1 && val !== '') {
                                         field.onChange(parseInt(val, 10));
                                     } else {
                                         field.onChange(val);
                                     }
                                }
                            }}
                             onBlur={(e) => {
                                let valStr = e.target.value;
                                let valNum = parseFloat(valStr);
                                if (valStr === '' || isNaN(valNum)) { valNum = min; }
                                valNum = Math.max(min, Math.min(max, valNum));
                                const finalValue = step < 1 ? parseFloat(valNum.toFixed(1)) : Math.round(valNum);
                                field.onChange(finalValue);
                            }}
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
            <Controller name={name} control={control} render={({ fieldState: { error } }) => error ? <p className="text-xs text-red-500 mt-1">{error.message}</p> : null} />
        </div>
    );
});


// Player Stat Type
type PlayerStatFormData = {
  id: string;
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

  const defaultValues = useMemo((): GameFormData => {
    const baseDefaults: GameFormData = {
        game_number: nextGameNumber,
        user_goals: 0,
        opponent_goals: 0,
        result: 'win',
        overtime_result: 'none',
        opponent_username: '',
        squad_quality_comparison: 'even',
        game_context: 'normal',
        comments: '',
        duration: 90,
        stress_level: 5,
        squad_id: squads.find(s => s.is_default)?.id || squads[0]?.id || '',
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

    if (isEditing && game) {
      const formPlayerStats: PlayerStatFormData[] = (game.player_performances || []).map(p => ({
            id: p.player_id || p.id, name: p.player_name, position: p.position,
            minutes_played: p.minutes_played ?? 90, goals: p.goals ?? 0, assists: p.assists ?? 0,
            rating: p.rating ?? 7.0, yellow_cards: p.yellow_cards ?? 0, red_cards: p.red_cards ?? 0,
            own_goals: p.own_goals ?? 0,
      }));

       const mergedData = {
         ...baseDefaults,
         game_number: game.game_number,
         user_goals: game.user_goals ?? 0,
         opponent_goals: game.opponent_goals ?? 0,
         result: game.result,
         overtime_result: game.overtime_result ?? 'none',
         opponent_username: game.opponent_username ?? '',
         squad_quality_comparison: game.squad_quality_comparison ?? 'even',
         game_context: game.game_context ?? 'normal',
         comments: game.comments ?? '',
         duration: game.duration ?? 90,
         stress_level: game.stress_level ?? 5,
         squad_id: game.squad_used ?? baseDefaults.squad_id,
         server_quality: game.server_quality ?? 5,
         cross_play_enabled: game.cross_play_enabled ?? false,
         tags: game.tags ?? [],
         team_stats: { ...baseDefaults.team_stats, ...(game.team_stats || {}), },
         player_stats: formPlayerStats,
       };
       return mergedData;
    }
    return baseDefaults;
  }, [isEditing, game, nextGameNumber, squads]);


  const form = useForm<GameFormData>({
    resolver: zodResolver(gameFormSchema),
    mode: 'onChange',
    defaultValues: defaultValues,
  });
  const { control, handleSubmit, watch, setValue, getValues, reset, formState: { errors, isSubmitting, isValid, dirtyFields } } = form;

  // Watchers
  const watchedSquadId = watch('squad_id');
  const watchedDuration = watch('duration');
  const watchedUserGoals = watch('user_goals');
  const watchedOpponentGoals = watch('opponent_goals');
  const watchedOvertimeResult = watch('overtime_result');
  const watchedTags = watch('tags');
  const watchedPlayerStats = watch('player_stats');

  const selectedSquad = useMemo(() => squads.find(s => s.id === watchedSquadId), [squads, watchedSquadId]);

  useEffect(() => { reset(defaultValues); }, [reset, defaultValues]);

  // Effect to populate/update player_stats - NOW INCLUDES SUBS
  useEffect(() => {
    if (selectedSquad?.squad_players) {
        const squadChanged = dirtyFields.squad_id;
        const isInitialOrEmpty = !watchedPlayerStats || watchedPlayerStats.length === 0;

        // Populate player list if squad changed OR it's a new game being loaded initially
        if (squadChanged || (!isEditing && isInitialOrEmpty)) {
             const squadPlayers = selectedSquad.squad_players
                // Include both starters and subs that have player data
                .filter(sp => sp.players && (sp.slot_id?.startsWith('starting-') || sp.slot_id?.startsWith('sub-')))
                .map(sp => {
                    const isStarter = sp.slot_id?.startsWith('starting-');
                    return {
                        id: sp.players!.id,
                        name: sp.players!.name,
                        position: sp.players!.position, // Or derive from slot_id if needed
                        // Starters get full duration (or watched), subs get 0
                        minutes_played: isStarter ? (watchedDuration || 90) : 0,
                        goals: 0,
                        assists: 0,
                        rating: 7.0,
                        yellow_cards: 0,
                        red_cards: 0,
                        own_goals: 0,
                    };
                })
                // Sort starters first (non-zero minutes), then subs (zero minutes), then alphabetically
                .sort((a, b) => {
                    if (a.minutes_played > 0 && b.minutes_played === 0) return -1; // a is starter, b is sub
                    if (a.minutes_played === 0 && b.minutes_played > 0) return 1;  // a is sub, b is starter
                    return a.name.localeCompare(b.name); // Sort alphabetically within groups
                });

            // Set the combined list if players were found or if it was an intended reset (not squadChanged)
            if (squadPlayers.length > 0 || !squadChanged) {
                 setValue('player_stats', squadPlayers, { shouldValidate: true, shouldDirty: !isInitialOrEmpty, shouldTouch: !isInitialOrEmpty });
            }

        } else if (!squadChanged && watchedPlayerStats) { // Update minutes for existing players ONLY if duration changes
             const updatedPlayers = watchedPlayerStats.map(p => {
                // Check if the player was originally a starter in the squad to decide if minutes should auto-update
                const squadPlayer = selectedSquad.squad_players.find(sp => sp.players?.id === p.id);
                const wasStarter = squadPlayer?.slot_id?.startsWith('starting-');
                // Only update minutes automatically if they were a starter; subs keep their manually set minutes (or 0)
                const newMinutes = wasStarter ? (watchedDuration || 90) : p.minutes_played;
                // Avoid unnecessary updates if minutes haven't changed
                return p.minutes_played !== newMinutes ? { ...p, minutes_played: newMinutes } : p;
             });

             // Check if any player object actually changed
             if(!isEqual(watchedPlayerStats, updatedPlayers)) {
                 setValue('player_stats', updatedPlayers, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
             }
        }
    } else if (!squadsLoading && !selectedSquad && watchedPlayerStats && watchedPlayerStats.length > 0) {
        // If no squad is selected AFTER loading, potentially clear players?
        // Let's keep them for now to avoid data loss if user accidentally deselects squad
        // setValue('player_stats', [], { shouldValidate: true, shouldDirty: true });
    }
  }, [selectedSquad, watchedDuration, setValue, isEditing, dirtyFields.squad_id, watchedPlayerStats, squadsLoading]);


  // Helper for steppers
  const adjustNumericalValue = useCallback((fieldName: string, delta: number, stepValue: number = 1, min: number, max: number) => {
    let currentValue = get(getValues(), fieldName);
    let currentNum = parseFloat(String(currentValue));
    if (isNaN(currentNum)) { currentNum = min; }
    let newValue = currentNum + (delta * stepValue);
    if (stepValue < 1) {
        const precision = Math.max(String(stepValue).split('.')[1]?.length || 0, String(currentNum).split('.')[1]?.length || 0);
        newValue = parseFloat(newValue.toFixed(precision || 1));
    } else { newValue = Math.round(newValue); }
    newValue = Math.max(min, Math.min(max, newValue));
    setValue(fieldName as any, newValue, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
  }, [getValues, setValue]);


  // Auto-set result based on goals and OT result
  useEffect(() => {
     if (watchedUserGoals === watchedOpponentGoals && watchedOvertimeResult !== 'none') {
        const newResult = (watchedOvertimeResult === 'win_ot' || watchedOvertimeResult === 'win_pen') ? 'win' : 'loss';
        if (getValues('result') !== newResult) {
            setValue('result', newResult, { shouldValidate: true, shouldDirty: true });
        }
     } else if (watchedUserGoals !== watchedOpponentGoals) {
        const newResult = watchedUserGoals > watchedOpponentGoals ? 'win' : 'loss';
        if (getValues('result') !== newResult) {
             setValue('result', newResult, { shouldValidate: true, shouldDirty: true });
        }
        // If goals changed to make it not a draw, ensure OT result is reset
        if (watchedOvertimeResult !== 'none') {
             setValue('overtime_result', 'none', { shouldValidate: true, shouldDirty: true });
        }
     } else { // It's a draw, no OT selected - default to loss? Or keep current? Let's keep current/default 'win' for now. Zod requires 'win' or 'loss'.
        // Maybe default to 'loss' if it's 0-0 draw initially?
        if(watchedUserGoals === 0 && watchedOpponentGoals === 0 && !dirtyFields.result){
            //setValue('result', 'loss', { shouldValidate: true });
        } else if (getValues('result') !== 'win' && getValues('result') !== 'loss') {
             setValue('result', 'win', { shouldValidate: true }); // Ensure it's one of the enum values
        }
     }
  }, [watchedUserGoals, watchedOpponentGoals, watchedOvertimeResult, setValue, getValues, dirtyFields.result]);

  // Determine game_context based on tags, OT result etc.
  useEffect(() => {
     const tags = watchedTags || [];
     let newContext = 'normal';

     const contextTag = matchTags.find(tag => tags.includes(tag.name) && tag.context);
     if (contextTag) {
         newContext = contextTag.context;
     } else if (watchedOvertimeResult === 'win_ot' || watchedOvertimeResult === 'loss_ot') {
        newContext = 'extra_time';
     } else if (watchedOvertimeResult === 'win_pen' || watchedOvertimeResult === 'loss_pen') {
         newContext = 'penalties';
     }
     // Add more specific logic if needed, e.g., high score = goal_fest

     if (getValues('game_context') !== newContext) {
        setValue('game_context', newContext, { shouldValidate: true, shouldDirty: true });
     }
  }, [watchedTags, watchedOvertimeResult, setValue, getValues]);

  // Add Substitute Logic - simplified, shows toast as subs are auto-included now
  const addSubstitute = () => {
     toast({ title: "Substitutes Ready", description: "Bench players are listed automatically. Adjust their minutes played if they came on.", variant: "default" });
  };

  // --- SUBMIT HANDLER ---
  const processSubmit = (data: GameFormData) => {
      // Filter out players with 0 minutes played BEFORE mapping
      const playerPerformancesSubmit: PlayerPerformanceInsert[] = (data.player_stats || [])
        .filter(p => p.minutes_played > 0) // <--- Key change for substitutes
        .map(p => ({
            user_id: user!.id, player_name: p.name, player_id: p.id, position: p.position,
            minutes_played: p.minutes_played, goals: p.goals, assists: p.assists,
            rating: p.rating, yellow_cards: p.yellow_cards, red_cards: p.red_cards > 0 ? 1 : 0,
            own_goals: p.own_goals,
            // game_id and week_id added by parent
        }));

     const gameDataSubmit: Omit<Game, 'id' | 'created_at' | 'week_id' | 'score_line' | 'date_played' | 'player_performances' | 'team_stats' | 'user_id'> = {
        game_number: data.game_number, user_goals: data.user_goals, opponent_goals: data.opponent_goals,
        result: data.result, overtime_result: data.overtime_result,
        opponent_username: data.opponent_username || null, squad_quality_comparison: data.squad_quality_comparison,
        game_context: data.game_context, comments: data.comments || null, duration: data.duration,
        stress_level: data.stress_level, squad_used: data.squad_id, server_quality: data.server_quality,
        cross_play_enabled: data.cross_play_enabled, tags: data.tags, game_version: gameVersion,
     };

    const teamStatsSubmit: TeamStatisticsInsert = {
        user_id: user!.id, possession: data.team_stats.possession, passes: data.team_stats.passes,
        pass_accuracy: data.team_stats.pass_accuracy, shots: data.team_stats.shots,
        shots_on_target: data.team_stats.shots_on_target, corners: data.team_stats.corners,
        fouls: data.team_stats.fouls, yellow_cards: data.team_stats.yellow_cards,
        red_cards: data.team_stats.red_cards, expected_goals: data.team_stats.expected_goals,
        expected_goals_against: data.team_stats.expected_goals_against,
        dribble_success_rate: data.team_stats.dribble_success_rate,
         // game_id and week_id added by parent
    };

    const hasNoStatsTag = data.tags?.some(tagName => matchTags.find(t => t.id === tagName || t.name === tagName)?.specialRule === 'no_stats');

    onSubmit(
        gameDataSubmit,
        hasNoStatsTag ? [] : playerPerformancesSubmit,
        hasNoStatsTag ? {} as TeamStatisticsInsert : teamStatsSubmit
    );
  };

  return (
    <Card className="glass-card rounded-2xl shadow-2xl border-0 w-full max-w-4xl mx-auto overflow-hidden">
      <CardContent className="p-4 md:p-6">
        <Form {...form}>
          <form onSubmit={handleSubmit(processSubmit)} className="flex flex-col space-y-4 md:space-y-6 h-full">
            <h2 className="text-xl font-semibold text-white">
                {isEditing ? `Editing Game ${game?.game_number}` : `Record Game ${nextGameNumber}`}
            </h2>

            <Tabs defaultValue="details" className="flex flex-col flex-1 min-h-0">
              {/* Mobile: 2 cols, SM+: 4 cols */}
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
                   <TabsTrigger value="details"><Trophy className="h-4 w-4 mr-1 md:mr-2" />Match</TabsTrigger>
                   <TabsTrigger value="opponent"><Shield className="h-4 w-4 mr-1 md:mr-2" />Opponent</TabsTrigger>
                   <TabsTrigger value="team"><BarChartHorizontal className="h-4 w-4 mr-1 md:mr-2" />Team</TabsTrigger>
                   <TabsTrigger value="players"><Star className="h-4 w-4 mr-1 md:mr-2" />Players</TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 mt-4 pr-2 -mr-2 custom-scrollbar">
               <div className="space-y-4 md:space-y-6 pb-4">
                  {/* --- Match Details Tab --- */}
                  <TabsContent value="details" className="space-y-4 md:space-y-6 mt-0">
                    <FormField control={control} name="squad_id" render={({ field }) => (
                         <FormItem className="space-y-1">
                             <FormLabel className="flex items-center gap-2 text-sm"><Users className="h-4 w-4" />Squad Used</FormLabel>
                             {squadsLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : squadsError ? <p className="text-sm text-red-500">{squadsError}</p> :
                                 <Select value={field.value} onValueChange={field.onChange} disabled={!squads || squads.length === 0}>
                                     <FormControl><SelectTrigger id="squad_id"><SelectValue placeholder={!squads || squads.length === 0 ? "No squads found" : "Select squad..."} /></SelectTrigger></FormControl>
                                     <SelectContent> {(squads || []).map((s) => (<SelectItem key={s.id} value={s.id}>{s.name} {s.is_default && "(Default)"}</SelectItem>))} </SelectContent>
                                 </Select>}
                             <FormMessage />
                         </FormItem>
                    )} />
                    <div className="text-center space-y-4">
                      <Label className="text-lg font-semibold block">Final Score</Label>
                      <div className="flex items-start justify-center gap-2 md:gap-4">
                          <div className="flex flex-col items-center flex-1 max-w-[150px]">
                               <Label className="text-sm font-medium text-primary mb-1">You</Label>
                               <div className="flex items-center w-full">
                                   <Button type="button" variant="outline" size="icon" className="w-8 h-8 p-0 shrink-0" onClick={() => adjustNumericalValue('user_goals', -1, 1, 0, 99)} disabled={watchedUserGoals <= 0}><Minus className="h-4 w-4" /></Button>
                                   <FormField control={control} name="user_goals" render={({ field }) => ( <FormItem className="flex-1 mx-1"> <FormControl><Input {...field} type="text" inputMode="numeric" className="h-12 sm:h-16 w-full text-center text-3xl sm:text-4xl px-0" onChange={(e) => /^\d*$/.test(e.target.value) && field.onChange(e.target.value === '' ? '' : parseInt(e.target.value,10))} onBlur={() => field.onChange(Math.max(0, Math.min(99, isNaN(field.value) ? 0 : field.value)))} /></FormControl> </FormItem> )} />
                                   <Button type="button" variant="outline" size="icon" className="w-8 h-8 p-0 shrink-0" onClick={() => adjustNumericalValue('user_goals', 1, 1, 0, 99)}><Plus className="h-4 w-4" /></Button>
                               </div>
                               <FormMessage className="text-xs">{errors.user_goals?.message}</FormMessage>
                          </div>
                          <span className="text-3xl sm:text-4xl font-bold text-muted-foreground pt-6">:</span>
                          <div className="flex flex-col items-center flex-1 max-w-[150px]">
                           <Label className="text-sm font-medium text-red-500 mb-1">Opponent</Label>
                           <div className="flex items-center w-full">
                                   <Button type="button" variant="outline" size="icon" className="w-8 h-8 p-0 shrink-0" onClick={() => adjustNumericalValue('opponent_goals', -1, 1, 0, 99)} disabled={watchedOpponentGoals <= 0}><Minus className="h-4 w-4" /></Button>
                                   <FormField control={control} name="opponent_goals" render={({ field }) => ( <FormItem className="flex-1 mx-1"> <FormControl><Input {...field} type="text" inputMode="numeric" className="h-12 sm:h-16 w-full text-center text-3xl sm:text-4xl px-0" onChange={(e) => /^\d*$/.test(e.target.value) && field.onChange(e.target.value === '' ? '' : parseInt(e.target.value,10))} onBlur={() => field.onChange(Math.max(0, Math.min(99, isNaN(field.value) ? 0 : field.value)))} /></FormControl> </FormItem> )} />
                                   <Button type="button" variant="outline" size="icon" className="w-8 h-8 p-0 shrink-0" onClick={() => adjustNumericalValue('opponent_goals', 1, 1, 0, 99)}><Plus className="h-4 w-4" /></Button>
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
                                  <FormControl><SelectTrigger><SelectValue placeholder="Select OT/Pen result..." /></SelectTrigger></FormControl>
                                  <SelectContent>
                                      <SelectItem value="win_ot">Win in OT</SelectItem> <SelectItem value="loss_ot">Loss in OT</SelectItem>
                                      <SelectItem value="win_pen">Win on Pens</SelectItem> <SelectItem value="loss_pen">Loss on Pens</SelectItem>
                                  </SelectContent>
                              </Select> <FormMessage />
                          </FormItem>
                      )}/>
                    )}
                    <div>
                         <NumberInputWithSteppers name="duration" label="Match Duration (Mins)" step={1} min={1} max={120} className="space-y-1" inputClassName="h-10 text-base text-center" minInputWidth="w-20" control={control} adjustValue={adjustNumericalValue} getValues={getValues} />
                         <p className="text-xs text-muted-foreground mt-1">90=Full, 120=ET, less if ended early.</p>
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
                           <FormField control={control} name="cross_play_enabled" render={({ field }) => ( <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/20 p-3 shadow-sm mt-4 col-span-1 md:col-span-2"><div className="space-y-0.5"><FormLabel>Cross-Platform Match</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem> )}/>
                       </div>
                  </TabsContent>

                  <TabsContent value="team" className="space-y-4 md:space-y-6 mt-0">
                       <h3 className="text-lg font-semibold border-b border-border/20 pb-2">Your Team Statistics</h3>
                       {/* Mobile: 2 cols, MD+: 4 cols */}
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-4">
                           <NumberInputWithSteppers name="team_stats.shots" label="Shots" control={control} adjustValue={adjustNumericalValue} getValues={getValues} />
                           <NumberInputWithSteppers name="team_stats.shots_on_target" label="On Target" max={getValues('team_stats.shots') ?? 99} control={control} adjustValue={adjustNumericalValue} getValues={getValues} />
                           <NumberInputWithSteppers name="team_stats.possession" label="Possession %" max={100} control={control} adjustValue={adjustNumericalValue} getValues={getValues} />
                           <NumberInputWithSteppers name="team_stats.passes" label="Passes" step={5} max={999} control={control} adjustValue={adjustNumericalValue} getValues={getValues} />
                           <NumberInputWithSteppers name="team_stats.pass_accuracy" label="Pass Acc %" max={100} control={control} adjustValue={adjustNumericalValue} getValues={getValues} />
                           <NumberInputWithSteppers name="team_stats.expected_goals" label="Your xG" step={0.1} max={20} control={control} adjustValue={adjustNumericalValue} getValues={getValues} />
                           <NumberInputWithSteppers name="team_stats.expected_goals_against" label="Opponent xG" step={0.1} max={20} control={control} adjustValue={adjustNumericalValue} getValues={getValues} />
                           <NumberInputWithSteppers name="team_stats.dribble_success_rate" label="Dribble %" max={100} control={control} adjustValue={adjustNumericalValue} getValues={getValues} />
                           <NumberInputWithSteppers name="team_stats.corners" label="Corners" max={99} control={control} adjustValue={adjustNumericalValue} getValues={getValues} />
                           <NumberInputWithSteppers name="team_stats.fouls" label="Fouls" max={99} control={control} adjustValue={adjustNumericalValue} getValues={getValues} />
                           <NumberInputWithSteppers name="team_stats.yellow_cards" label="Yellow Cards" max={11} control={control} adjustValue={adjustNumericalValue} getValues={getValues} />
                           <NumberInputWithSteppers name="team_stats.red_cards" label="Red Cards" max={5} control={control} adjustValue={adjustNumericalValue} getValues={getValues} />
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
                                                            "text-xs h-7 border border-border/50", // Base styles
                                                            "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary" // Selected styles
                                                         )}
                                                         pressed={field.value?.includes(tag.name)}
                                                         onPressedChange={(isPressed) => {
                                                             const currentTags = field.value || [];
                                                             const newTags = isPressed ? [...currentTags, tag.name] : currentTags.filter(t => t !== tag.name);
                                                             field.onChange(newTags);
                                                         }}
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
                        <FormField control={control} name="comments" render={({ field }) => (<FormItem><FormLabel>Comments</FormLabel><FormControl><Textarea {...field} placeholder="Key moments, tactics, frustrations..." /></FormControl><FormMessage /></FormItem>)}/>
                  </TabsContent>

                  <TabsContent value="players" className="space-y-4 flex flex-col min-h-0 mt-0">
                        <div className="flex justify-between items-center mb-2 shrink-0">
                           <h3 className="text-lg font-semibold">Player Performances</h3>
                           {/* Simplified button just to provide info now */}
                            <Button onClick={addSubstitute} size="sm" type="button" variant="outline" className='opacity-60 cursor-default'>
                                <UserPlus className="h-4 w-4 mr-2" />Subs Included
                            </Button>
                        </div>
                        <ScrollArea className="flex-grow custom-scrollbar pr-1 -mr-1 min-h-[300px]">
                           {squadsLoading ? (<p className="text-sm text-muted-foreground p-4">Loading squad...</p>)
                           : !watchedSquadId ? (<p className="text-sm text-muted-foreground p-4">Please select a squad.</p>)
                           : watchedPlayerStats && watchedPlayerStats.length > 0 ? (
                               <FormField control={control} name="player_stats" render={({ field }) => (
                                   <FormItem>
                                       <FormControl>
                                           <PlayerStatsForm
                                               players={field.value || []}
                                               onStatsChange={(updatedPlayers) => field.onChange(updatedPlayers)}
                                               gameDuration={watchedDuration || 90}
                                           />
                                       </FormControl> <FormMessage />
                                   </FormItem> )} />
                           ) : (
                               <div className="text-center py-8 border border-dashed rounded-lg text-muted-foreground">
                                   <p className='px-4'>No players found for "{selectedSquad?.name || '...'}".</p>
                                   <p className='text-xs px-4 mt-1'>Check your squad setup.</p>
                               </div>
                           )}
                        </ScrollArea>
                  </TabsContent>
               </div>
              </ScrollArea>
            </Tabs>

            <div className="flex justify-between items-center mt-auto pt-4 border-t border-border/20">
              {/* Changed Cancel button variant */}
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
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
