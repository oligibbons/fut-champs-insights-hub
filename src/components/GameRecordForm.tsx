import { useEffect, useCallback, memo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
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
import { Save, Loader2, UserPlus, Users, Plus, Minus, Trophy, Shield, BarChartHorizontal, Star } from 'lucide-react';
import PlayerStatsForm from './PlayerStatsForm';
import { Squad, PlayerCard, SquadPlayer } from '@/types/squads';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayerPerformance } from '@/types/futChampions';
import { get, isEqual } from 'lodash';

// Interfaces
interface SquadPlayerJoin { id: string; player_id: string; position: string; slot_id: string; players: PlayerCard; }
interface SquadWithPlayers extends Squad { squad_players: SquadPlayerJoin[]; }

// Zod Schema
const gameFormSchema = z.object({
    user_goals: z.coerce.number().min(0), opponent_goals: z.coerce.number().min(0), duration: z.coerce.number().min(1), opponent_skill: z.number().min(1).max(10), server_quality: z.number().min(1).max(10), stress_level: z.number().min(1).max(10), cross_play_enabled: z.boolean(), opponent_play_style: z.string(), opponent_formation: z.string().optional(), opponent_squad_rating: z.coerce.number().min(50).max(99), squad_id: z.string().min(1, { message: "Please select a squad." }), tags: z.array(z.string()).optional(), comments: z.string().optional(), team_stats: z.object({ shots: z.coerce.number().min(0), shotsOnTarget: z.coerce.number().min(0), possession: z.coerce.number().min(0).max(100), expectedGoals: z.coerce.number().min(0), expectedGoalsAgainst: z.coerce.number().min(0), passes: z.coerce.number().min(0), passAccuracy: z.coerce.number().min(0).max(100), corners: z.coerce.number().min(0), fouls: z.coerce.number().min(0), yellowCards: z.coerce.number().min(0), redCards: z.coerce.number().min(0), }), player_stats: z.array(z.any()).optional(),
});

// Match Tags Data
const matchTags = [
    { id: 'dominantWin', name: 'Dominant Win', description: 'A win where you dominated your opponent.' }, { id: 'deservedLoss', name: 'Deserved Loss', description: 'A loss where you didn’t deserve to win.' }, { id: 'closeGame', name: 'Close Game', description: 'A game where irrespective of the result, it was tightly contested.' }, { id: 'extraTime', name: 'Extra Time', description: 'A game that went to Extra Time.' }, { id: 'penalties', name: 'Penalties', description: 'A game that went all the way to penalties.' }, { id: 'opponentRageQuit', name: 'Opponent Rage Quit', description: 'A game where the opponent quit while you were winning.' }, { id: 'iRageQuit', name: 'I Rage Quit', description: 'A game where you quit out after being behind.' }, { id: 'freeWinReceived', name: 'Free Win Received', description: 'A game where the opponent gifted you a win. Does not impact performance stats.', specialRule: 'no_stats' }, { id: 'freeWinGiven', name: 'Free Win Given Away', description: 'A game where you gifted the opponent a win. Does-not-impact performance stats.', specialRule: 'no_stats' }, { id: 'disconnected', name: 'Disconnected', description: 'A game where you were disconnected by the servers. Does not impact performance stats.', specialRule: 'no_stats' }, { id: 'badServers', name: 'Bad Servers', description: 'A game where the servers made gameplay challenging.' }, { id: 'frustratingGame', name: 'Frustrating Game', description: 'A game that caused you significant frustration.' }, { id: 'stressful', name: 'Stressful', description: 'A game that was stressful for you.' }, { id: 'skillGod', name: 'Skill God', description: 'A game against an opponent who uses a high level of skill moves effectively.' }, { id: 'undeservedLoss', name: 'Undeserved Loss', description: 'A game where you lost, but didn’t deserve to.' }, { id: 'undeservedWin', name: 'Undeserved Win', description: 'A game where you won, but didn’t deserve to.' }, { id: 'comebackWin', name: 'Comeback Win', description: 'A game where you came from behind to win.' }, { id: 'bottledLeadLoss', name: 'Bottled Lead Loss', description: 'A game where you lost from a winning position.' }, { id: 'goalFest', name: 'Goal Fest', description: 'A game with a large number of goals (typically 8+).' }, { id: 'defensiveBattle', name: 'Defensive Battle', description: 'A game where both players relied heavily on defending well.' }, { id: 'gameToBeProudOf', name: 'Game To Be Proud Of', description: 'A game that regardless of the result, you can be proud of.' }, { id: 'hacker', name: 'Hacker', description: 'A game where you faced a hacker.' }, { id: 'confirmedPro', name: 'Confirmed Pro Opponent', description: 'A game where you faced a confirmed professional FC player.' }, { id: 'eliteOpponent', name: 'Elite Opponent', description: 'A game against an elite-level player (possibly pro, but not confirmed).' }, { id: 'cutBackMerchant', name: 'Cut Back Merchant', description: 'An opponent whose sole game plan was to score cutbacks.' }, { id: 'defensiveMasterclass', name: 'Defensive Masterclass', description: 'A game where you defended to a very high level.' }, { id: 'attackingMasterclass', name: 'Attacking Masterclass', description: 'A game where you attacked to a very high level.' }, { id: 'defensiveDunce', name: 'Defensive Dunce', description: 'A game where you struggled to defend, to the point of embarrassment.' }, { id: 'attackingAmateur', name: 'Attacking Amateur', description: 'A game where you couldn’t attack to save your life.' }, { id: 'pay2WinRat', name: 'Pay2Win Rat', description: 'An opponent with a team that could only be achieved by spending a fortune.' }, { id: 'metaRat', name: 'Meta Rat', description: 'An opponent who uses every possible meta tactic/technique to get the win.' }, { id: 'opponentRubberBanded', name: 'Opponent Rubber Banded', description: 'The opponent put their controller down and stopped playing.' }, { id: 'iRubberBanded', name: 'I Rubber Banded', description: 'You put your controller down and stopped playing at some point.' }, { id: 'poorQualityOpponent', name: 'Poor Quality Opponent', description: 'An opponent who is simply not very good at the game.' }, { id: 'fairResult', name: 'Fair Result', description: 'Regardless of who won or lost, the result was a fair reflection of the performance.' }, { id: 'myOwnWorstEnemy', name: 'My Own Worst Enemy', description: 'Your own consistent mistakes caused you significant problems.' }, { id: 'funGame', name: 'Fun Game', description: 'A game that you enjoyed playing, irrespective of the result.' },
];

const NumberInputWithSteppers = memo(({ control, name, label, step = 1, className = '', inputClassName = 'text-center', minInputWidth = 'w-14', adjustValue, getValues }: any) => {
    const minConstraint = ['opponent_skill', 'server_quality', 'stress_level', 'duration'].some(f => name.includes(f)) ? 1 : 0;
    const isMin = (getValues(name) || 0) <= minConstraint;
    return ( <div className={`space-y-2 ${className}`}> <Label>{label}</Label> <div className="flex items-center gap-1"> <Button type="button" variant="outline" size="icon" className="w-8 h-8 p-0" onClick={() => adjustValue(name, -1, step)} onMouseDown={(e) => e.preventDefault()} disabled={isMin}> <Minus className="h-3 w-3" /> </Button> <Controller name={name} control={control} render={({ field }) => ( <Input {...field} type="text" inputMode={step < 1 ? "decimal" : "numeric"} className={`h-8 text-sm font-semibold ${inputClassName} ${minInputWidth}`} /> )}/> <Button type="button" variant="outline" size="icon" className="w-8 h-8 p-0" onClick={() => adjustValue(name, 1, step)} onMouseDown={(e) => e.preventDefault()}> <Plus className="h-3 w-3" /> </Button> </div> </div> );
});

interface GameRecordFormProps {
    squads: Squad[];
    weekId: string;
    nextGameNumber: number;
    onSave: () => Promise<void>;
    onCancel: () => void;
}

const GameRecordForm = ({ squads, weekId, nextGameNumber, onSave, onCancel }: GameRecordFormProps) => {
    const { user } = useAuth();
    const { toast } = useToast();

    const { control, handleSubmit, watch, setValue, getValues, formState: { errors, isSubmitting, isValid } } = useForm({
        resolver: zodResolver(gameFormSchema),
        mode: 'onChange',
        defaultValues: {
            user_goals: 0, opponent_goals: 0, duration: 90, opponent_skill: 5, server_quality: 5,
            stress_level: 5, cross_play_enabled: false, opponent_play_style: 'balanced',
            opponent_formation: '', opponent_squad_rating: 85, squad_id: '',
            tags: [], comments: '',
            team_stats: { shots: 8, shotsOnTarget: 4, possession: 50, expectedGoals: 1.2, expectedGoalsAgainst: 1.0, passes: 100, passAccuracy: 78, corners: 3, fouls: 0, yellowCards: 0, redCards: 0 },
            player_stats: [],
        },
    });

    const watchedValues = watch();
    const selectedSquadId = watchedValues.squad_id;
    const gameDuration = watchedValues.duration;

    const selectedSquad = squads.find(s => s.id === selectedSquadId);

    const adjustNumericalValue = useCallback((fieldName: any, delta: number, stepValue: number = 1) => {
        let currentValue = get(getValues(), fieldName);
        currentValue = (typeof currentValue !== 'number') ? (Number(currentValue) || 0) : currentValue;
        let newValue = (currentValue * 10 + delta * stepValue * 10) / 10;
        let min = 0, max = Infinity;
        if (['opponent_skill', 'server_quality', 'stress_level'].some(f => fieldName.includes(f))) { min = 1; max = 10; }
        else if (fieldName.includes('duration')) { min = 1; max = 120; }
        else if (['possession', 'passAccuracy'].some(f => fieldName.includes(f))) { max = 100; }
        else if (fieldName.includes('opponent_squad_rating')) { min = 50; max = 99; }
        newValue = Math.max(min, Math.min(max, newValue));
        newValue = stepValue < 1 ? parseFloat(newValue.toFixed(1)) : Math.round(newValue);
        setValue(fieldName, newValue, { shouldValidate: true, shouldDirty: true });
    }, [getValues, setValue]);

    useEffect(() => {
        if (squads.length > 0 && !getValues('squad_id')) {
            const defaultSquad = squads.find(s => s.is_default) || squads[0];
            if (defaultSquad) {
                setValue('squad_id', defaultSquad.id, { shouldValidate: true });
            }
        }
    }, [squads, setValue, getValues]);

    useEffect(() => {
        if (selectedSquad && selectedSquad.squad_players) {
            const newStarters = selectedSquad.squad_players
                .filter((sp): sp is SquadPlayer & { players: PlayerCard } => 
                    !!sp && sp.slot_id?.startsWith('starting-') && !!sp.players
                )
                .map(sp => ({
                    id: sp.players.id,
                    name: sp.players.name,
                    position: sp.players.position,
                    rating: 7.0, goals: 0, assists: 0,
                    minutesPlayed: gameDuration || 90,
                    yellowCards: 0, redCards: 0, ownGoals: 0,
                }));
            
            const currentPlayers = getValues('player_stats') || [];
            const manualSubs = currentPlayers.filter((p: PlayerPerformance) => {
                const isStarterInNewSquad = newStarters.some(starter => starter.id === p.id);
                return p.position === 'SUB' && !isStarterInNewSquad;
            });

            const finalPlayerList = [...newStarters, ...manualSubs];

            if (!isEqual(currentPlayers, finalPlayerList)) {
                setValue('player_stats', finalPlayerList, { shouldValidate: true, shouldDirty: true });
            }
        } else {
             if (getValues('player_stats').length > 0) {
                 setValue('player_stats', [], { shouldValidate: true, shouldDirty: true });
            }
        }
    }, [selectedSquad, gameDuration, setValue, getValues]);

    const addSubstitute = () => {
        if (!selectedSquad) { toast({ title: "Please select a squad first.", variant: "destructive" }); return; }
        const currentIds = getValues('player_stats').map(p => p.id);
        const availableSubs = (selectedSquad.squad_players || [])
            .filter((sp): sp is SquadPlayer & { players: PlayerCard } => 
                !!sp && sp.slot_id?.startsWith('sub-') && !!sp.players && !currentIds.includes(sp.players.id)
            );

        if (availableSubs.length > 0) {
            const subToAdd = availableSubs[0].players;
            setValue('player_stats', [...getValues('player_stats'), { id: subToAdd.id, name: subToAdd.name, position: 'SUB', rating: 6.0, goals: 0, assists: 0, minutesPlayed: 0, yellowCards: 0, redCards: 0, ownGoals: 0, }]);
        } else {
            toast({ title: "No available substitutes left in this squad.", variant: "destructive" });
        }
    };
    
    const processSubmit = async (data: z.infer<typeof gameFormSchema>) => {
        if (!user) return;
        const result = data.user_goals > data.opponent_goals ? 'win' : 'loss';
        try {
            const { data: gameResult, error: gameError } = await supabase.from('game_results').insert({ week_id: weekId, user_id: user.id, game_number: nextGameNumber, result, score_line: `${data.user_goals}-${data.opponent_goals}`, user_goals: data.user_goals, opponent_goals: data.opponent_goals, opponent_skill: data.opponent_skill, server_quality: data.server_quality, stress_level: data.stress_level, duration: data.duration, comments: data.comments, tags: data.tags, squad_used: data.squad_id }).select('id').single();
            if (gameError) throw gameError;
            const hasNoStatsTag = data.tags?.some(tagName => matchTags.find(t => t.name === tagName)?.specialRule === 'no_stats');
            if (!hasNoStatsTag) {
                await supabase.from('team_statistics').insert({ game_id: gameResult.id, user_id: user.id, shots: data.team_stats.shots, shots_on_target: data.team_stats.shotsOnTarget, possession: data.team_stats.possession, expected_goals: data.team_stats.expectedGoals, expected_goals_against: data.team_stats.expectedGoalsAgainst, passes: data.team_stats.passes, pass_accuracy: data.team_stats.passAccuracy, corners: data.team_stats.corners, fouls: data.team_stats.fouls, yellow_cards: data.team_stats.yellowCards, red_cards: data.team_stats.redCards, });
                const validPlayerStats = data.player_stats?.filter(p => p.minutesPlayed > 0);
                if (validPlayerStats?.length > 0) {
                    const performances = validPlayerStats.map(p => ({ game_id: gameResult.id, user_id: user.id, player_name: p.name, position: p.position, rating: parseFloat(p.rating.toFixed(1)), goals: p.goals, assists: p.assists, minutes_played: p.minutesPlayed, yellow_cards: p.yellowCards, red_cards: p.redCards, own_goals: p.ownGoals }));
                    await supabase.from('player_performances').insert(performances);
                }
            }
            toast({ title: "Game Saved Successfully!" });
            await onSave();
        } catch (error: any) {
            toast({ title: "Error Saving Game", description: error.message, variant: "destructive" });
        }
    };

    return (
        <form onSubmit={handleSubmit(processSubmit)} className="flex flex-col h-full">
            <Tabs defaultValue="details" className="flex-grow flex flex-col min-h-0">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="details"><Trophy className="h-4 w-4 mr-2" />Match</TabsTrigger>
                    <TabsTrigger value="opponent"><Shield className="h-4 w-4 mr-2" />Opponent</TabsTrigger>
                    <TabsTrigger value="team"><BarChartHorizontal className="h-4 w-4 mr-2" />Team</TabsTrigger>
                    <TabsTrigger value="players"><Star className="h-4 w-4 mr-2" />Players</TabsTrigger>
                </TabsList>
                <div className="flex-1 overflow-y-auto mt-4 pr-4">
                    <TabsContent value="details" className="space-y-6 animate-in fade-in">
                        <Controller name="squad_id" control={control} render={({ field }) => ( <div className="space-y-2"> <Label htmlFor="squad_id" className="flex items-center gap-2"><Users className="h-4 w-4" />Select Squad</Label> <Select value={field.value} onValueChange={field.onChange}> <SelectTrigger id="squad_id"><SelectValue placeholder="Choose a squad..." /></SelectTrigger> <SelectContent>{squads.map((s: Squad) => <SelectItem key={s.id} value={s.id}>{s.name} {s.is_default && "(Default)"}</SelectItem>)}</SelectContent> </Select> {errors.squad_id && <p className="text-sm text-red-500">{errors.squad_id.message as string}</p>} </div> )}/>
                        <div className="text-center"> <Label className="text-lg font-semibold">Final Score</Label> <div className="flex items-center justify-center gap-2 md:gap-4 mt-2"> <div className="flex flex-col items-center"><Label className="text-sm font-medium text-primary mb-1">Your Goals</Label><div className="flex items-center space-x-1"><Button type="button" variant="outline" size="icon" className="w-8 h-8 p-0" onClick={() => adjustNumericalValue('user_goals', -1)} onMouseDown={(e) => e.preventDefault()} disabled={getValues('user_goals') <= 0}><Minus className="h-4 w-4" /></Button><Controller name="user_goals" control={control} render={({ field }) => <Input {...field} type="text" inputMode="numeric" className="modern-input text-4xl h-20 w-24 text-center" />} /><Button type="button" variant="outline" size="icon" className="w-8 h-8 p-0" onClick={() => adjustNumericalValue('user_goals', 1)} onMouseDown={(e) => e.preventDefault()}><Plus className="h-4 w-4" /></Button></div></div> <span className="text-5xl font-bold text-muted-foreground mx-2 pt-6">:</span> <div className="flex flex-col items-center"><Label className="text-sm font-medium text-red-500 mb-1">Opponent Goals</Label><div className="flex items-center space-x-1"><Button type="button" variant="outline" size="icon" className="w-8 h-8 p-0" onClick={() => adjustNumericalValue('opponent_goals', -1)} onMouseDown={(e) => e.preventDefault()} disabled={getValues('opponent_goals') <= 0}><Minus className="h-4 w-4" /></Button><Controller name="opponent_goals" control={control} render={({ field }) => <Input {...field} type="text" inputMode="numeric" className="modern-input text-4xl h-20 w-24 text-center" />} /><Button type="button" variant="outline" size="icon" className="w-8 h-8 p-0" onClick={() => adjustNumericalValue('opponent_goals', 1)} onMouseDown={(e) => e.preventDefault()}><Plus className="h-4 w-4" /></Button></div></div> </div> </div>
                        <div> <NumberInputWithSteppers name="duration" label="Match Duration (Mins)" step={5} className="space-y-2" inputClassName="h-10 text-base" minInputWidth="w-full" control={control} adjustValue={adjustNumericalValue} getValues={getValues} /> <p className="text-xs text-muted-foreground mt-1">Enter less than 90 if the match ended early.</p> </div>
                    </TabsContent>
                    <TabsContent value="opponent" className="space-y-6 animate-in fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> <Controller name="opponent_skill" control={control} render={({ field }) => <div className="space-y-2"><Label>Opponent Skill: <span className="font-bold text-primary">{field.value}</span>/10</Label><Slider value={[field.value]} onValueChange={(v) => field.onChange(v[0])} max={10} step={1} min={1} /></div>} /> <Controller name="server_quality" control={control} render={({ field }) => <div className="space-y-2"><Label>Server Quality: <span className="font-bold text-primary">{field.value}</span>/10</Label><Slider value={[field.value]} onValueChange={(v) => field.onChange(v[0])} max={10} step={1} min={1} /></div>} /> <Controller name="stress_level" control={control} render={({ field }) => <div className="space-y-2"><Label>Stress Level: <span className="font-bold text-primary">{field.value}</span>/10</Label><Slider value={[field.value]} onValueChange={(v) => field.onChange(v[0])} max={10} step={1} min={1} /></div>} /> <Controller name="cross_play_enabled" control={control} render={({ field }) => <div className="flex items-center space-x-2 pt-6"><Switch id="crossplay" checked={field.value} onCheckedChange={field.onChange} /><Label htmlFor="crossplay">Cross-Platform</Label></div>} /> </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t"> <Controller name="opponent_play_style" control={control} render={({ field }) => <div><Label>Opponent Play Style</Label><Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['balanced', 'possession', 'counter-attack', 'high-press', 'drop-back'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>} /> <Controller name="opponent_formation" control={control} render={({ field }) => <div><Label>Opponent Formation</Label><Input {...field} placeholder="e.g. 4-2-3-1" /></div>} /> <NumberInputWithSteppers name="opponent_squad_rating" label="Opponent Squad Rating" minInputWidth='w-full' control={control} adjustValue={adjustNumericalValue} getValues={getValues} /> </div>
                    </TabsContent>
                    <TabsContent value="team" className="space-y-6 animate-in fade-in">
                        <h3 className="text-lg font-semibold border-b pb-2">Team Statistics</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4"> <NumberInputWithSteppers name="team_stats.shots" label="Shots" control={control} adjustValue={adjustNumericalValue} getValues={getValues} /> <NumberInputWithSteppers name="team_stats.shotsOnTarget" label="Shots on Target" control={control} adjustValue={adjustNumericalValue} getValues={getValues} /> <NumberInputWithSteppers name="team_stats.possession" label="Possession %" control={control} adjustValue={adjustNumericalValue} getValues={getValues} /> <NumberInputWithSteppers name="team_stats.passes" label="Passes" step={10} control={control} adjustValue={adjustNumericalValue} getValues={getValues} /> <NumberInputWithSteppers name="team_stats.passAccuracy" label="Pass Accuracy %" control={control} adjustValue={adjustNumericalValue} getValues={getValues} /> <NumberInputWithSteppers name="team_stats.fouls" label="Fouls" control={control} adjustValue={adjustNumericalValue} getValues={getValues} /> <NumberInputWithSteppers name="team_stats.yellowCards" label="Yellow Cards" control={control} adjustValue={adjustNumericalValue} getValues={getValues} /> <NumberInputWithSteppers name="team_stats.redCards" label="Red Cards" control={control} adjustValue={adjustNumericalValue} getValues={getValues} /> <NumberInputWithSteppers name="team_stats.expectedGoals" label="Your xG" step={0.1} control={control} adjustValue={adjustNumericalValue} getValues={getValues} /> <NumberInputWithSteppers name="team_stats.expectedGoalsAgainst" label="Opponent xG" step={0.1} control={control} adjustValue={adjustNumericalValue} getValues={getValues} /> <NumberInputWithSteppers name="team_stats.corners" label="Corners" control={control} adjustValue={adjustNumericalValue} getValues={getValues} /> </div>
                        <div className="space-y-2"> <Label>Match Tags</Label><p className="text-sm text-muted-foreground">Select any tags that apply. Hover for details.</p> <TooltipProvider><div className="flex flex-wrap gap-2"><Controller name="tags" control={control} render={({ field }) => (<>{matchTags.map(tag => (<Tooltip key={tag.id}><TooltipTrigger asChild><Toggle variant="outline" size="sm" className={field.value?.includes(tag.name) ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-accent'} pressed={field.value?.includes(tag.name)} onPressedChange={(isPressed) => { const newTags = isPressed ? [...(field.value || []), tag.name] : (field.value || []).filter(t => t !== tag.name); field.onChange(newTags); }}>{tag.name}</Toggle></TooltipTrigger><TooltipContent><p>{tag.description}</p></TooltipContent></Tooltip>))}</>)} /></div></TooltipProvider> </div>
                        <Controller name="comments" control={control} render={({ field }) => <div className="space-y-2"><Label>Comments</Label><Textarea {...field} placeholder="Any key moments or tactical notes?" /></div>} />
                    </TabsContent>
                    <TabsContent value="players" className="animate-in fade-in">
                        <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-semibold">Player Performances</h3><Button onClick={addSubstitute} size="sm" type="button" disabled={!selectedSquad}><UserPlus className="h-4 w-4 mr-2" />Add Sub</Button></div>
                        {watchedValues.player_stats && watchedValues.player_stats.length > 0 ? (<Controller name="player_stats" control={control} render={({ field }) => (<PlayerStatsForm players={field.value || []} onStatsChange={field.onChange} gameDuration={watchedValues.duration || 90} />)} />) : (<div className="text-center py-8 border border-dashed rounded-lg text-muted-foreground"><p className='px-4'>Select a squad with a starting XI in the "Match" tab to auto-populate player performances.</p>{selectedSquad === undefined && <p className="mt-2 text-sm">Waiting for squad data...</p>}{selectedSquad && selectedSquad.squad_players.filter(sp => sp.slot_id?.startsWith('starting-')).length === 0 &&<p className="mt-2 text-sm">The squad **"{selectedSquad.name}"** may have no players in the starting XI.</p>}</div>)}
                    </TabsContent>
                </div>
            </Tabs>
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting || !isValid || !watchedValues.squad_id}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Save Game
                </Button>
            </div>
        </form>
    );
};

export default GameRecordForm;

