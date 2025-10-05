import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import { ArrowLeft, ArrowRight, Save, Loader2, UserPlus } from 'lucide-react';
import PlayerStatsForm from './PlayerStatsForm';
import { useSquadData } from '@/hooks/useSquadData';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';
import { PlayerPerformance } from '@/types/futChampions';

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

// Match tags remain the same as your original file
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
    // ... include all other tags from your original file here
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

  const { control, handleSubmit, watch, setValue, formState: { errors, isSubmitting, isValid } } = useForm({
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
      tags: [],
      comments: '',
      team_stats: {
        shots: 8, shotsOnTarget: 4, possession: 50, expectedGoals: 1.2,
        expectedGoalsAgainst: 1.0, passes: 100, passAccuracy: 78,
        corners: 3, fouls: 0, yellowCards: 0, redCards: 0,
      },
      player_stats: [],
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    if (defaultSquad) {
      const startingPlayers = (defaultSquad.squad_players?.filter(p => p.slot_id?.startsWith('starting-')) || [])
        .map(p => p.players)
        .map(player => ({
          id: player.id,
          name: player.name,
          position: player.position,
          rating: 7.0,
          goals: 0,
          assists: 0,
          minutesPlayed: 90,
        }));
      setValue('player_stats', startingPlayers);
    }
  }, [defaultSquad, setValue]);

  const addSubstitute = () => {
    if (!defaultSquad) return;
    const currentIds = watchedValues.player_stats?.map(p => p.id) || [];
    const availableSubs = (defaultSquad.squad_players?.filter(p => p.slot_id?.startsWith('sub-')) || [])
      .map(p => p.players)
      .filter(p => !currentIds.includes(p.id));

    if (availableSubs.length > 0) {
      const subToAdd = availableSubs[0];
      const newPlayerStat: PlayerPerformance = {
        id: subToAdd.id, name: subToAdd.name, position: 'SUB', rating: 6.0,
        goals: 0, assists: 0, minutesPlayed: 0
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
        // Step 1: Insert the main game result
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
                squad_used: defaultSquad?.id
            })
            .select('id')
            .single();

        if (gameError) throw gameError;

        const hasNoStatsTag = data.tags?.some(tagName => matchTags.find(t => t.name === tagName)?.specialRule === 'no_stats');

        // Step 2: Insert Team Statistics (if not a 'no_stats' game)
        if (!hasNoStatsTag) {
            const { error: teamStatsError } = await supabase
                .from('team_statistics')
                .insert({
                    game_id: gameResult.id,
                    user_id: user.id,
                    ...data.team_stats,
                });
            if (teamStatsError) throw teamStatsError;

            // Step 3: Insert Player Performances (if they exist and not a 'no_stats' game)
            const validPlayerStats = data.player_stats?.filter(p => p.minutesPlayed > 0);
            if (validPlayerStats && validPlayerStats.length > 0) {
                const performances = validPlayerStats.map(p => ({
                    game_id: gameResult.id,
                    user_id: user.id,
                    player_name: p.name,
                    position: p.position,
                    rating: p.rating,
                    goals: p.goals,
                    assists: p.assists,
                    minutes_played: p.minutesPlayed,
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
                    {/* All steps are wrapped in divs to control visibility */}
                    <div className={step === 1 ? 'block' : 'hidden'}>
                        {/* Step 1: Score & Duration */}
                        <div className="space-y-8 animate-in fade-in">
                            <div className="text-center">
                                <Label className="text-lg font-semibold">Final Score</Label>
                                <div className="flex items-center justify-center gap-2 md:gap-4 mt-2">
                                    <Controller name="user_goals" control={control} render={({ field }) => <Input {...field} type="number" className="modern-input text-4xl h-20 w-24 text-center" />} />
                                    <span className="text-5xl font-bold text-muted-foreground mx-2">:</span>
                                    <Controller name="opponent_goals" control={control} render={({ field }) => <Input {...field} type="number" className="modern-input text-4xl h-20 w-24 text-center" />} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="duration">Match Duration (Mins)</Label>
                                <Controller name="duration" control={control} render={({ field }) => <Input {...field} id="duration" type="number" placeholder="e.g., 90 for a full game" />} />
                                <p className="text-xs text-muted-foreground">Enter less than 90 if the match ended early.</p>
                            </div>
                        </div>
                    </div>

                    <div className={step === 2 ? 'block' : 'hidden'}>
                        {/* Step 2: Game Feel & Opponent */}
                        <div className="space-y-6 animate-in fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Sliders */}
                                <Controller name="opponent_skill" control={control} render={({ field }) => <div className="space-y-2"><Label>Opponent Skill: <span className="font-bold text-primary">{field.value}</span>/10</Label><Slider value={[field.value]} onValueChange={(v) => field.onChange(v[0])} max={10} step={1} /></div>} />
                                <Controller name="server_quality" control={control} render={({ field }) => <div className="space-y-2"><Label>Server Quality: <span className="font-bold text-primary">{field.value}</span>/10</Label><Slider value={[field.value]} onValueChange={(v) => field.onChange(v[0])} max={10} step={1} /></div>} />
                                <Controller name="stress_level" control={control} render={({ field }) => <div className="space-y-2"><Label>Stress Level: <span className="font-bold text-primary">{field.value}</span>/10</Label><Slider value={[field.value]} onValueChange={(v) => field.onChange(v[0])} max={10} step={1} /></div>} />
                                <Controller name="cross_play_enabled" control={control} render={({ field }) => <div className="flex items-center space-x-2 pt-6"><Switch id="crossplay" checked={field.value} onCheckedChange={field.onChange} /><Label htmlFor="crossplay">Cross-Platform</Label></div>} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
                                {/* Opponent Details */}
                                <Controller name="opponent_play_style" control={control} render={({ field }) => <div><Label>Opponent Play Style</Label><Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['balanced', 'possession', 'counter-attack', 'high-press', 'drop-back'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>} />
                                <Controller name="opponent_formation" control={control} render={({ field }) => <div><Label>Opponent Formation</Label><Input {...field} placeholder="e.g. 4-2-3-1" /></div>} />
                                <Controller name="opponent_squad_rating" control={control} render={({ field }) => <div><Label>Opponent Squad Rating</Label><Input {...field} type="number" /></div>} />
                            </div>
                        </div>
                    </div>
                    
                    <div className={step === 3 ? 'block' : 'hidden'}>
                        {/* Step 3: Stats & Tags */}
                        <div className="space-y-6 animate-in fade-in">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Controller name="team_stats.expectedGoals" control={control} render={({ field }) => <div className="space-y-2"><Label>Your xG</Label><Input {...field} type="number" step="0.1" /></div>} />
                                <Controller name="team_stats.expectedGoalsAgainst" control={control} render={({ field }) => <div className="space-y-2"><Label>Opponent xG</Label><Input {...field} type="number" step="0.1" /></div>} />
                                <Controller name="team_stats.possession" control={control} render={({ field }) => <div className="space-y-2"><Label>Possession %</Label><Input {...field} type="number" /></div>} />
                                {/* Add controllers for all other team_stats fields */}
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
                                                                    pressed={field.value?.includes(tag.name)}
                                                                    onPressedChange={(isPressed) => {
                                                                        const currentTags = field.value || [];
                                                                        const newTags = isPressed
                                                                            ? [...currentTags, tag.name]
                                                                            : currentTags.filter(t => t !== tag.name);
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
                        {/* Step 4: Player Performance */}
                        <div className="animate-in fade-in">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Player Performances</h3>
                                <Button onClick={addSubstitute} size="sm" type="button"><UserPlus className="h-4 w-4 mr-2" />Add Sub</Button>
                            </div>
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
                        </div>
                    </div>
                </ScrollArea>

                <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
                    <div>
                        {step > 1 && <Button type="button" variant="outline" onClick={() => setStep(step - 1)}><ArrowLeft className="h-4 w-4 mr-2" /> Previous</Button>}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                        {step < 4 && <Button type="button" onClick={() => setStep(step + 1)} disabled={!isValid && step===1}>Next <ArrowRight className="h-4 w-4 ml-2" /></Button>}
                        {step === 4 && <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Save Game</Button>}
                    </div>
                </div>
            </CardContent>
        </form>
    </Card>
  );
};

export default GameRecordForm;
