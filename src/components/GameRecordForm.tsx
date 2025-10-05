import { useState, useEffect, useCallback } from 'react';
import { useForm, Controller, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Toggle } from '@/components/ui/toggle';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeft, ArrowRight, Save, Loader2, UserPlus, Users, Plus, Minus } from 'lucide-react'; 
import PlayerStatsForm from './PlayerStatsForm';
import { useSquadData } from '@/hooks/useSquadData';
import { Squad } from '@/types/squads';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';
import { PlayerPerformance } from '@/types/futChampions';
import { get } from 'lodash';

// Schema for form validation using Zod
const gameFormSchema = z.object({
    user_goals: z.coerce.number().min(0),
    opponent_goals: z.coerce.number().min(0),
    duration: z.coerce.number().min(1),
    opponent_skill: z.number().min(1).max(10),
    server_quality: z.number().min(1).max(10),
    stress_level: z.number().min(1).max(10),
    cross_play_enabled: z.boolean(),
    opponent_play_style: z.string(),
    opponent_formation: z.string().optional(),
    opponent_squad_rating: z.coerce.number().min(50).max(99),
    squad_id: z.string().min(1, { message: "Please select a squad." }),
    tags: z.array(z.string()).optional(),
    comments: z.string().optional(),
    team_stats: z.object({
        shots: z.coerce.number().min(0),
        shotsOnTarget: z.coerce.number().min(0),
        possession: z.coerce.number().min(0).max(100),
        expectedGoals: z.coerce.number().min(0),
        expectedGoalsAgainst: z.coerce.number().min(0),
        passes: z.coerce.number().min(0),
        passAccuracy: z.coerce.number().min(0).max(100),
        corners: z.coerce.number().min(0),
        fouls: z.coerce.number().min(0),
        yellowCards: z.coerce.number().min(0),
        redCards: z.coerce.number().min(0),
    }),
    player_stats: z.array(z.any()).optional(),
});

const matchTags = [
    { id: 'dominantWin', name: 'Dominant Win', description: 'A win where you dominated your opponent.' },
    { id: 'deservedLoss', name: 'Deserved Loss', description: 'A loss where you didn’t deserve to win.' },
    { id: 'closeGame', name: 'Close Game', description: 'A game where irrespective of the result, it was tightly contested.' },
    { id: 'extraTime', name: 'Extra Time', description: 'A game that went to Extra Time.' },
    { id: 'penalties', name: 'Penalties', description: 'A game that went all the way to penalties.' },
    { id: 'opponentRageQuit', name: 'Opponent Rage Quit', description: 'A game where the opponent quit while you were winning.' },
    { id: 'iRageQuit', name: 'I Rage Quit', description: 'A game where you quit out after being behind.' },
    { id: 'freeWinReceived', name: 'Free Win Received', description: 'A game where the opponent gifted you a win. Does not impact performance stats.', specialRule: 'no_stats' },
    { id: 'freeWinGiven', name: 'Free Win Given Away', description: 'A game where you gifted the opponent a win. Does not impact performance stats.', specialRule: 'no_stats' },
    { id: 'disconnected', name: 'Disconnected', description: 'A game where you were disconnected by the servers. Does not impact performance stats.', specialRule: 'no_stats' },
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
    { id: 'hacker', name: 'Hacker', description: 'A game where you faced a hacker.' },
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

interface GameRecordFormProps {
  weekId: string;
  nextGameNumber: number;
  onSave: () => Promise<void>;
  onCancel: () => void;
}

const GameRecordForm = ({ weekId, nextGameNumber, onSave, onCancel }: GameRecordFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { squads } = useSquadData();
  const defaultSquad = squads.find(s => s.is_default);

  const [step, setStep] = useState(1);

  const { control, handleSubmit, watch, setValue, getValues, formState: { errors, isSubmitting, isValid } } = useForm({
    resolver: zodResolver(gameFormSchema),
    mode: 'onChange',
    defaultValues: {
      user_goals: 0,
      opponent_goals: 0,
      duration: 90,
      opponent_skill: 5,
      server_quality: 5,
      stress_level: 5,
      cross_play_enabled: false,
      opponent_play_style: 'balanced',
      opponent_formation: '',
      opponent_squad_rating: 85,
      squad_id: defaultSquad?.id || '',
      tags: [],
      comments: '',
      team_stats: {
        shots: 8, 
        shotsOnTarget: 4, 
        possession: 50, 
        expectedGoals: 1.2,
        expectedGoalsAgainst: 1.0, 
        passes: 100, 
        passAccuracy: 78,
        corners: 3, 
        fouls: 0, 
        yellowCards: 0, 
        redCards: 0,
      },
      player_stats: [],
    },
  });

  const watchedValues = watch();
  const selectedSquad = squads.find(s => s.id === watchedValues.squad_id);

  // FIX: Centralized logic for numerical input adjustments (Steppers) with min/max enforcement
  const adjustNumericalValue = useCallback((fieldName: keyof z.infer<typeof gameFormSchema> | `team_stats.${string}`, delta: number, stepValue: number = 1) => {
    
    let currentValue = get(getValues(), fieldName);
    if (typeof currentValue !== 'number') {
        currentValue = Number(currentValue) || 0;
    }
    
    // Use precise floating point arithmetic (multiplied by 10/10)
    let newValue = (currentValue * 10 + delta * stepValue * 10) / 10;
    
    let min = 0;
    let max = Infinity;

    if (fieldName.includes('opponent_skill') || fieldName.includes('server_quality') || fieldName.includes('stress_level')) {
        max = 10;
        min = 1;
    } else if (fieldName.includes('possession') || fieldName.includes('passAccuracy')) {
        max = 100;
        min = 0;
    } else if (fieldName.includes('opponent_squad_rating')) {
        max = 99;
        min = 50;
    } else if (fieldName.includes('duration')) {
        min = 1;
    } else if (fieldName.includes('goals') || fieldName.includes('fouls') || fieldName.includes('cards') || fieldName.includes('shots') || fieldName.includes('passes') || fieldName.includes('corners')) {
        min = 0;
        max = Infinity; 
    }

    newValue = Math.max(min, Math.min(max, newValue));
    
    if (stepValue < 1) {
        // Round to step precision for decimals (e.g., xG)
        newValue = parseFloat(newValue.toFixed(1)); 
    } else {
        // For integer fields
        newValue = Math.round(newValue); 
    }

    if (newValue === 0) newValue = 0;

    setValue(fieldName as any, newValue, { shouldValidate: true, shouldDirty: true });
  }, [getValues, setValue]);


  // FIX: Reusable Number Input Component with Steppers (Applied to all numerical inputs)
  const NumberInputWithSteppers = ({ name, label, step = 1, className = '', inputClassName = 'text-center', minInputWidth = 'w-14' }: { name: keyof z.infer<typeof gameFormSchema> | `team_stats.${string}`, label: string, step?: number, className?: string, inputClassName?: string, minInputWidth?: string }) => {
    
    const currentValue = Number(get(getValues(), name)) || 0;
    let minConstraint = 0;
    if (name.includes('opponent_skill') || name.includes('server_quality') || name.includes('stress_level') || name.includes('duration')) {
        minConstraint = 1;
    }
    const isMin = currentValue <= minConstraint;

    return (
        <div className={`space-y-2 ${className}`}>
            <Label>{label}</Label>
            <div className="flex items-center gap-1">
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="w-8 h-8 p-0"
                    onClick={() => adjustNumericalValue(name, -1, step)}
                    onMouseDown={(e) => e.preventDefault()} // FIX: Prevents input blur/keyboard close
                    disabled={isMin}
                >
                    <Minus className="h-3 w-3" />
                </Button>
                <Controller 
                    name={name as any} 
                    control={control} 
                    render={({ field }) => (
                        <Input 
                            {...field} 
                            type="number" 
                            inputMode={step < 1 ? "decimal" : "numeric"} // FIX: Helps keep keyboard open on mobile
                            step={step} 
                            className={`h-8 text-sm font-semibold ${inputClassName} ${minInputWidth}`}
                            onChange={(e) => {
                                // Important: We let RHF handle the coercion via Zod, just pass the raw value
                                field.onChange(e.target.value);
                            }}
                            onBlur={(e) => field.onBlur(e)}
                        />
                    )} 
                />
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="w-8 h-8 p-0"
                    onClick={() => adjustNumericalValue(name, 1, step)}
                    onMouseDown={(e) => e.preventDefault()} // FIX: Prevents input blur/keyboard close
                >
                    <Plus className="h-3 w-3" />
                </Button>
            </div>
        </div>
    );
  };


  useEffect(() => {
    if (!watchedValues.squad_id && defaultSquad) {
        setValue('squad_id', defaultSquad.id);
    }

    if (selectedSquad) {
      const startingPlayers = (selectedSquad.squad_players?.filter(p => p.slot_id?.startsWith('starting-')) || [])
        .map(p => p.players) 
        .map(player => ({
          id: player.id,
          name: player.name,
          position: player.position,
          rating: 7.0, 
          goals: 0,
          assists: 0,
          minutesPlayed: watchedValues.duration || 90, 
          yellowCards: 0,
          redCards: 0,
          ownGoals: 0,
        }));
      
      setValue('player_stats', startingPlayers);
    } else if (squads.length > 0) {
        setValue('player_stats', []);
    }
    
  }, [selectedSquad, watchedValues.duration, defaultSquad, setValue, squads.length, watchedValues.squad_id]);

  const addSubstitute = () => {
    if (!selectedSquad) {
      toast({ title: "Please select a squad first in Step 1.", variant: "destructive" });
      return;
    }
    const currentIds = watchedValues.player_stats?.map(p => p.id) || [];
    const availableSubs = (selectedSquad.squad_players?.filter(p => p.slot_id?.startsWith('sub-')) || [])
      .map(p => p.players)
      .filter(p => !currentIds.includes(p.id));

    if (availableSubs.length > 0) {
      const subToAdd = availableSubs[0];
      const newPlayerStat: PlayerPerformance = {
        id: subToAdd.id, name: subToAdd.name, position: 'SUB', 
        rating: 6.0, 
        goals: 0, assists: 0, 
        minutesPlayed: 0, 
        yellowCards: 0, redCards: 0, ownGoals: 0,
      };
      setValue('player_stats', [...(watchedValues.player_stats || []), newPlayerStat]);
    } else {
      toast({ title: "No available substitutes left.", variant: "destructive" });
    }
  };

  const processSubmit = async (data: z.infer<typeof gameFormSchema>) => {
    if (!user) return;
    
    const result = data.user_goals > data.opponent_goals ? 'win' : 'loss';
    
    try {
        const { data: gameResult, error: gameError } = await supabase
            .from('game_results')
            .insert({
                week_id: weekId,
                user_id: user.id,
                game_number: nextGameNumber,
                result: result,
                score_line: `${data.user_goals}-${data.opponent_goals}`,
                user_goals: data.user_goals,
                opponent_goals: data.opponent_goals,
                opponent_skill: data.opponent_skill,
                server_quality: data.server_quality,
                stress_level: data.stress_level,
                duration: data.duration,
                comments: data.comments,
                tags: data.tags,
                squad_used: data.squad_id 
            })
            .select('id')
            .single();

        if (gameError) throw gameError;

        const hasNoStatsTag = data.tags?.some(tagName => matchTags.find(t => t.name === tagName)?.specialRule === 'no_stats');

        if (!hasNoStatsTag) {
            const { error: teamStatsError } = await supabase
                .from('team_statistics')
                .insert({
                    game_id: gameResult.id,
                    user_id: user.id,
                    shots: data.team_stats.shots,
                    shots_on_target: data.team_stats.shotsOnTarget,
                    possession: data.team_stats.possession,
                    expected_goals: data.team_stats.expectedGoals,
                    expected_goals_against: data.team_stats.expectedGoalsAgainst,
                    passes: data.team_stats.passes,
                    pass_accuracy: data.team_stats.passAccuracy,
                    corners: data.team_stats.corners,
                    fouls: data.team_stats.fouls,
                    yellow_cards: data.team_stats.yellowCards,
                    red_cards: data.team_stats.redCards,
                });
            if (teamStatsError) throw teamStatsError;

            const validPlayerStats = data.player_stats?.filter(p => p.minutesPlayed > 0);
            if (validPlayerStats && validPlayerStats.length > 0) {
                const performances = validPlayerStats.map(p => ({
                    game_id: gameResult.id,
                    user_id: user.id,
                    player_name: p.name,
                    position: p.position,
                    rating: parseFloat(p.rating.toFixed(1)), 
                    goals: p.goals,
                    assists: p.assists,
                    minutes_played: p.minutesPlayed,
                    yellow_cards: p.yellowCards,
                    red_cards: p.redCards,
                    own_goals: p.ownGoals
                }));
                const { error: playerStatsError } = await supabase.from('player_performances').insert(performances);
                if (playerStatsError) throw playerStatsError;
            }
        }

        toast({ title: "Game Saved Successfully!" });
        await onSave();
    } catch (error: any) {
        toast({ title: "Error Saving Game", description: error.message, variant: "destructive" });
        console.error("Error saving game:", error);
    }
  };

  return (
    <Card className="border-primary/20 border-2 overflow-hidden">
        <CardHeader className="bg-secondary/30">
            <CardTitle className="flex justify-between items-center">
                <span>Log Game #{nextGameNumber}</span>
                <span className="text-sm font-medium text-muted-foreground">Step {step} of 4</span>
            </CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(processSubmit)}>
            <CardContent className="p-4 md:p-6">
                <ScrollArea className="h-[60vh] -mr-6 pr-6">
                    <div className={step === 1 ? 'block' : 'hidden'}>
                        <div className="space-y-8 animate-in fade-in">
                            <Controller
                                name="squad_id"
                                control={control}
                                render={({ field }) => (
                                    <div className="space-y-2">
                                        <Label htmlFor="squad_id" className="flex items-center gap-2">
                                            <Users className="h-4 w-4" />
                                            Select Squad
                                        </Label>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger id="squad_id">
                                                <SelectValue placeholder="Choose a squad..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {squads.map((squad: Squad) => (
                                                    <SelectItem key={squad.id} value={squad.id}>
                                                        {squad.name} {squad.is_default && "(Default)"}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.squad_id && <p className="text-sm text-red-500">{errors.squad_id.message}</p>}
                                    </div>
                                )}
                            />

                            <div className="text-center">
                                <Label className="text-lg font-semibold">Final Score</Label>
                                <div className="flex items-center justify-center gap-2 md:gap-4 mt-2">
                                    {/* FIX: Labeled User Goals Input with Unique Steppers */}
                                    <div className="flex flex-col items-center">
                                        <Label className="text-sm font-medium text-primary mb-1">Your Goals</Label>
                                        <div className="flex items-center space-x-1">
                                            <Button type="button" variant="outline" size="icon" className="w-8 h-8 p-0" onClick={() => adjustNumericalValue('user_goals', -1)} onMouseDown={(e) => e.preventDefault()}><Minus className="h-4 w-4" /></Button>
                                            <Controller name="user_goals" control={control} render={({ field }) => <Input {...field} type="number" inputMode="numeric" className="modern-input text-4xl h-20 w-24 text-center" />} />
                                            <Button type="button" variant="outline" size="icon" className="w-8 h-8 p-0" onClick={() => adjustNumericalValue('user_goals', 1)} onMouseDown={(e) => e.preventDefault()}><Plus className="h-4 w-4" /></Button>
                                        </div>
                                    </div>
                                    
                                    <span className="text-5xl font-bold text-muted-foreground mx-2 pt-6">:</span>
                                    
                                    {/* FIX: Labeled Opponent Goals Input with Unique Steppers */}
                                    <div className="flex flex-col items-center">
                                        <Label className="text-sm font-medium text-red-500 mb-1">Opponent Goals</Label>
                                        <div className="flex items-center space-x-1">
                                            <Button type="button" variant="outline" size="icon" className="w-8 h-8 p-0" onClick={() => adjustNumericalValue('opponent_goals', -1)} onMouseDown={(e) => e.preventDefault()}><Minus className="h-4 w-4" /></Button>
                                            <Controller name="opponent_goals" control={control} render={({ field }) => <Input {...field} type="number" inputMode="numeric" className="modern-input text-4xl h-20 w-24 text-center" />} />
                                            <Button type="button" variant="outline" size="icon" className="w-8 h-8 p-0" onClick={() => adjustNumericalValue('opponent_goals', 1)} onMouseDown={(e) => e.preventDefault()}><Plus className="h-4 w-4" /></Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Duration with Steppers */}
                            <NumberInputWithSteppers name="duration" label="Match Duration (Mins)" step={5} className="space-y-2" inputClassName="h-10 text-base" minInputWidth="w-full" />
                            <p className="text-xs text-muted-foreground">Enter less than 90 if the match ended early.</p>
                        </div>
                    </div>

                    <div className={step === 2 ? 'block' : 'hidden'}>
                        <div className="space-y-6 animate-in fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Sliders for Skill, Quality, Stress (No change needed) */}
                                <Controller name="opponent_skill" control={control} render={({ field }) => <div className="space-y-2"><Label>Opponent Skill: <span className="font-bold text-primary">{field.value}</span>/10</Label><Slider value={[field.value]} onValueChange={(v) => field.onChange(v[0])} max={10} step={1} /></div>} />
                                <Controller name="server_quality" control={control} render={({ field }) => <div className="space-y-2"><Label>Server Quality: <span className="font-bold text-primary">{field.value}</span>/10</Label><Slider value={[field.value]} onValueChange={(v) => field.onChange(v[0])} max={10} step={1} /></div>} />
                                <Controller name="stress_level" control={control} render={({ field }) => <div className="space-y-2"><Label>Stress Level: <span className="font-bold text-primary">{field.value}</span>/10</Label><Slider value={[field.value]} onValueChange={(v) => field.onChange(v[0])} max={10} step={1} /></div>} />
                                <Controller name="cross_play_enabled" control={control} render={({ field }) => <div className="flex items-center space-x-2 pt-6"><Switch id="crossplay" checked={field.value} onCheckedChange={field.onChange} /><Label htmlFor="crossplay">Cross-Platform</Label></div>} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
                                <Controller name="opponent_play_style" control={control} render={({ field }) => <div><Label>Opponent Play Style</Label><Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['balanced', 'possession', 'counter-attack', 'high-press', 'drop-back'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>} />
                                <Controller name="opponent_formation" control={control} render={({ field }) => <div><Label>Opponent Formation</Label><Input {...field} placeholder="e.g. 4-2-3-1" /></div>} />
                                {/* FIX: Opponent Squad Rating with Steppers */}
                                <NumberInputWithSteppers name="opponent_squad_rating" label="Opponent Squad Rating" step={1} minInputWidth="w-full" />
                            </div>
                        </div>
                    </div>
                    
                    <div className={step === 3 ? 'block' : 'hidden'}>
                        <div className="space-y-6 animate-in fade-in">
                            <h3 className="text-lg font-semibold border-b pb-2">Team Statistics</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {/* FIX: All numerical fields now use the custom stepper component */}
                                <NumberInputWithSteppers name="team_stats.shots" label="Shots" />
                                <NumberInputWithSteppers name="team_stats.shotsOnTarget" label="Shots on Target" />
                                <NumberInputWithSteppers name="team_stats.possession" label="Possession %" />
                                <NumberInputWithSteppers name="team_stats.passes" label="Passes" step={10} />
                                <NumberInputWithSteppers name="team_stats.passAccuracy" label="Pass Accuracy %" />
                                <NumberInputWithSteppers name="team_stats.fouls" label="Fouls" />
                                <NumberInputWithSteppers name="team_stats.yellowCards" label="Yellow Cards" />
                                <NumberInputWithSteppers name="team_stats.redCards" label="Red Cards" />
                                <NumberInputWithSteppers name="team_stats.expectedGoals" label="Your xG" step={0.1} />
                                <NumberInputWithSteppers name="team_stats.expectedGoalsAgainst" label="Opponent xG" step={0.1} />
                                <NumberInputWithSteppers name="team_stats.corners" label="Corners" />
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Match Tags</Label>
                                <p className="text-sm text-muted-foreground">Select any tags that apply. Hover for details.</p>
                                <TooltipProvider>
                                    <div className="flex flex-wrap gap-2">
                                        <Controller
                                            name="tags"
                                            control={control}
                                            render={({ field }) => (
                                                <>
                                                    {matchTags.map(tag => (
                                                        <Tooltip key={tag.id}>
                                                            <TooltipTrigger asChild>
                                                                <Toggle
                                                                    variant="outline" size="sm"
                                                                    // The core multi-select logic is sound and correctly uses field.value.
                                                                    pressed={field.value?.includes(tag.name)}
                                                                    onPressedChange={(isPressed) => {
                                                                        const currentTags = Array.isArray(field.value) ? field.value : [];
                                                                        const newTags = isPressed
                                                                            ? [...currentTags, tag.name]
                                                                            : currentTags.filter(t => t !== tag.name);
                                                                        
                                                                        // This MUST work to enable multi-select.
                                                                        field.onChange(newTags); 
                                                                    }}
                                                                >
                                                                    {tag.name}
                                                                </Toggle>
                                                            </TooltipTrigger>
                                                            <TooltipContent><p>{tag.description}</p></TooltipContent>
                                                        </Tooltip>
                                                    ))}
                                                </>
                                            )}
                                        />
                                    </div>
                                </TooltipProvider>
                            </div>
                            <Controller name="comments" control={control} render={({ field }) => <div className="space-y-2"><Label>Comments</Label><Textarea {...field} placeholder="Any key moments or tactical notes?" /></div>} />
                        </div>
                    </div>

                    <div className={step === 4 ? 'block' : 'hidden'}>
                        <div className="animate-in fade-in">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Player Performances</h3>
                                <Button onClick={addSubstitute} size="sm" type="button" disabled={!selectedSquad}>
                                    <UserPlus className="h-4 w-4 mr-2" />Add Sub
                                </Button>
                            </div>
                            {!selectedSquad && (
                                <div className="text-center py-8 border border-dashed rounded-lg text-muted-foreground">
                                    Please select a squad in Step 1 to enter player statistics.
                                </div>
                            )}
                            {selectedSquad && (
                                <Controller
                                    name="player_stats"
                                    control={control}
                                    render={({ field }) => (
                                        <PlayerStatsForm
                                            players={field.value || []}
                                            onStatsChange={field.onChange}
                                            gameDuration={watchedValues.duration || 90}
                                        />
                                    )}
                                />
                            )}
                        </div>
                    </div>
                </ScrollArea>

                <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
                    <div>
                        {step > 1 && <Button type="button" variant="outline" onClick={() => setStep(step - 1)}><ArrowLeft className="h-4 w-4 mr-2" /> Previous</Button>}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                        {step < 4 && <Button 
                            type="button" 
                            onClick={() => setStep(step + 1)} 
                            disabled={!isValid || (step === 1 && !watchedValues.squad_id)}
                        >
                            Next <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>}
                        {step === 4 && <Button type="submit" disabled={isSubmitting || !watchedValues.squad_id}>
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} 
                            Save Game
                        </Button>}
                    </div>
                </div>
            </CardContent>
        </form>
    </Card>
  );
};

export default GameRecordForm;
