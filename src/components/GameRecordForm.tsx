import { useState, useMemo, useEffect } from 'react';
import { GameResult, PlayerPerformance, TeamStats } from '@/types/futChampions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Save, Loader2, UserPlus } from 'lucide-react';
import PlayerStatsForm from './PlayerStatsForm';
import { NumberInputWithStepper } from './ui/number-input-with-stepper';
import { useSquadData } from '@/hooks/useSquadData';
import { PlayerCard } from '@/types/squads';
import { useToast } from '@/hooks/use-toast';

interface GameRecordFormProps {
  weekId: string;
  nextGameNumber: number;
  onSave: (gameData: Omit<GameResult, 'id'>) => Promise<void>;
  onCancel: () => void;
}

const availableTags = [
    { id: 'comeback', label: 'Comeback Win' },
    { id: 'bottled', label: 'Bottled Lead' },
    { id: 'bad-servers', label: 'Bad Servers' },
    { id: 'scripting', label: 'Scripting' },
    { id: 'good-opponent', label: 'Good Opponent' },
    { id: 'lucky-win', label: 'Lucky Win' },
    { id: 'unlucky-loss', label: 'Unlucky Loss' },
];

const GameRecordForm = ({ weekId, nextGameNumber, onSave, onCancel }: GameRecordFormProps) => {
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const { squads } = useSquadData();
  const { toast } = useToast();
  const defaultSquad = squads.find(s => s.isDefault);

  const [formData, setFormData] = useState<Partial<GameResult>>({
    gameNumber: nextGameNumber,
    result: 'win',
    scoreLine: '0-0',
    opponentSkill: 5,
    stressLevel: 5,
    serverQuality: 5,
    duration: 90,
    comments: '',
    crossPlayEnabled: false,
    opponentPlayStyle: 'balanced',
    opponentFormation: '',
    opponentSquadRating: 85,
    tags: [],
    teamStats: {
      actualGoals: 0,
      actualGoalsAgainst: 0,
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
    } as TeamStats,
    playerStats: [],
  });
  
  useEffect(() => {
     const startingPlayers = (defaultSquad?.startingXI.map(p => p.player).filter(Boolean) as PlayerCard[]).map(player => ({
        id: player.id,
        name: player.name,
        position: player.position,
        rating: 7.0,
        goals: 0,
        assists: 0,
        minutesPlayed: 90,
    })) as PlayerPerformance[];
    
    setFormData(prev => ({...prev, playerStats: startingPlayers}))
  }, [defaultSquad]);


  const handleInputChange = (field: keyof GameResult, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTeamStatsChange = (field: keyof TeamStats, value: any) => {
    setFormData(prev => ({
      ...prev,
      teamStats: { ...prev.teamStats!, [field]: value }
    }));
  };
  
  const toggleMatchTag = (tagId: string) => {
    setFormData(prev => {
        const currentTags = prev.tags || [];
        const newTags = currentTags.includes(tagId) 
            ? currentTags.filter(id => id !== tagId) 
            : [...currentTags, tagId];
        return {...prev, tags: newTags};
    });
  };

  useMemo(() => {
    const goalsFor = formData.teamStats?.actualGoals ?? 0;
    const goalsAgainst = formData.teamStats?.actualGoalsAgainst ?? 0;
    const result = goalsFor > goalsAgainst ? 'win' : 'loss';
    const scoreLine = `${goalsFor}-${goalsAgainst}`;
    setFormData(prev => ({ ...prev, result, scoreLine }));
  }, [formData.teamStats?.actualGoals, formData.teamStats?.actualGoalsAgainst]);

  const addSubstitute = () => {
      if (!defaultSquad) return;
      const currentIds = formData.playerStats?.map(p => p.id) || [];
      const availableSubs = defaultSquad.substitutes
        .map(s => s.player)
        .filter((p): p is PlayerCard => !!p && !currentIds.includes(p.id));

      if (availableSubs.length > 0) {
          const subToAdd = availableSubs[0];
          const newPlayerStat: PlayerPerformance = {
              id: subToAdd.id,
              name: subToAdd.name,
              position: 'SUB',
              rating: 6.0,
              goals: 0,
              assists: 0,
              minutesPlayed: 0
          };
          setFormData(prev => ({ ...prev, playerStats: [...(prev.playerStats || []), newPlayerStat] }));
      } else {
          toast({ title: "No available substitutes left in your default squad.", variant: "destructive" });
      }
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    // Filter out subs who didn't play
    const finalPlayerStats = formData.playerStats?.filter(p => p.minutesPlayed > 0);
    const finalData = { ...formData, date: new Date().toISOString(), playerStats: finalPlayerStats } as Omit<GameResult, 'id'>;
    await onSave(finalData);
    setIsSaving(false);
  };
  
  const isStep1Valid = (formData.teamStats?.actualGoals ?? -1) >= 0 && (formData.teamStats?.actualGoalsAgainst ?? -1) >= 0;

  return (
    <Card className="border-primary/20 border-2 overflow-hidden">
      <CardHeader className="bg-secondary/30">
        <CardTitle className="flex justify-between items-center">
          <span>Log Game #{nextGameNumber}</span>
          <span className="text-sm font-medium text-muted-foreground">Step {step} of 4</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in">
            <div className="text-center">
              <Label className="text-lg font-semibold">Final Score</Label>
              <div className="flex items-center justify-center gap-2 md:gap-4 mt-2">
                <NumberInputWithStepper label="Your Score" value={formData.teamStats?.actualGoals ?? 0} onValueChange={(val) => handleTeamStatsChange('actualGoals', val)} />
                <span className="text-5xl font-bold text-muted-foreground mx-2">:</span>
                <NumberInputWithStepper label="Opponent's Score" value={formData.teamStats?.actualGoalsAgainst ?? 0} onValueChange={(val) => handleTeamStatsChange('actualGoalsAgainst', val)} />
              </div>
               <p className={`mt-4 font-bold text-3xl tracking-wider ${formData.result === 'win' ? 'text-green-500' : 'text-red-500'}`}>
                {formData.scoreLine !== '0-0' ? (formData.result === 'win' ? 'VICTORY' : 'DEFEAT') : 'ENTER SCORE'}
              </p>
            </div>
             <div className="space-y-2">
              <Label htmlFor="duration">Match Duration (Mins)</Label>
              <Input id="duration" type="number" placeholder="e.g., 90 for a full game" value={formData.duration} onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)} />
               <p className="text-xs text-muted-foreground">Enter less than 90 if the match ended early (e.g., rage quit).</p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-4">
                  <Label>Opponent Skill: <span className="font-bold text-primary">{formData.opponentSkill}</span>/10</Label>
                  <Slider value={[formData.opponentSkill!]} onValueChange={([val]) => handleInputChange('opponentSkill', val)} max={10} step={1} />
                </div>
                 <div className="space-y-4">
                  <Label>Server Quality: <span className="font-bold text-primary">{formData.serverQuality}</span>/10</Label>
                  <Slider value={[formData.serverQuality!]} onValueChange={([val]) => handleInputChange('serverQuality', val)} max={10} step={1} />
                </div>
                 <div className="space-y-4">
                  <Label>Stress Level: <span className="font-bold text-primary">{formData.stressLevel}</span>/10</Label>
                  <Slider value={[formData.stressLevel!]} onValueChange={([val]) => handleInputChange('stressLevel', val)} max={10} step={1} />
                </div>
                 <div className="flex items-center space-x-2 pt-6">
                    <Switch id="crossplay" checked={formData.crossPlayEnabled} onCheckedChange={(val) => handleInputChange('crossPlayEnabled', val)} />
                    <Label htmlFor="crossplay">Cross-Platform Match</Label>
                </div>
             </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
                <div>
                  <Label>Opponent Play Style</Label>
                  <Select value={formData.opponentPlayStyle} onValueChange={(val) => handleInputChange('opponentPlayStyle', val)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="possession">Possession</SelectItem>
                      <SelectItem value="counter-attack">Counter Attack</SelectItem>
                      <SelectItem value="high-press">High Press</SelectItem>
                      <SelectItem value="drop-back">Drop Back</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                 <div>
                  <Label>Opponent Formation</Label>
                  <Input value={formData.opponentFormation} onChange={(e) => handleInputChange('opponentFormation', e.target.value)} placeholder="e.g. 4-2-3-1" />
                </div>
                 <div>
                  <Label>Opponent Squad Rating</Label>
                  <Input type="number" value={formData.opponentSquadRating} onChange={(e) => handleInputChange('opponentSquadRating', parseInt(e.target.value) || 85)} />
                </div>
              </div>
          </div>
        )}
        
        {step === 3 && (
            <div className="space-y-6 animate-in fade-in">
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2"><Label>Your xG</Label><Input type="number" step="0.1" value={formData.teamStats?.expectedGoals} onChange={(e) => handleTeamStatsChange('expectedGoals', parseFloat(e.target.value))} /></div>
                    <div className="space-y-2"><Label>Opponent xG</Label><Input type="number" step="0.1" value={formData.teamStats?.expectedGoalsAgainst} onChange={(e) => handleTeamStatsChange('expectedGoalsAgainst', parseFloat(e.target.value))} /></div>
                    <div className="space-y-2"><Label>Possession %</Label><Input type="number" value={formData.teamStats?.possession} onChange={(e) => handleTeamStatsChange('possession', parseInt(e.target.value))} /></div>
                    <div className="space-y-2"><Label>Shots</Label><Input type="number" value={formData.teamStats?.shots} onChange={(e) => handleTeamStatsChange('shots', parseInt(e.target.value))} /></div>
                    <div className="space-y-2"><Label>Shots on Target</Label><Input type="number" value={formData.teamStats?.shotsOnTarget} onChange={(e) => handleTeamStatsChange('shotsOnTarget', parseInt(e.target.value))} /></div>
                    <div className="space-y-2"><Label>Passes</Label><Input type="number" value={formData.teamStats?.passes} onChange={(e) => handleTeamStatsChange('passes', parseInt(e.target.value))} /></div>
                    <div className="space-y-2"><Label>Pass Accuracy %</Label><Input type="number" value={formData.teamStats?.passAccuracy} onChange={(e) => handleTeamStatsChange('passAccuracy', parseInt(e.target.value))} /></div>
                    <div className="space-y-2"><Label>Corners</Label><Input type="number" value={formData.teamStats?.corners} onChange={(e) => handleTeamStatsChange('corners', parseInt(e.target.value))} /></div>
                    <div className="space-y-2"><Label>Fouls</Label><Input type="number" value={formData.teamStats?.fouls} onChange={(e) => handleTeamStatsChange('fouls', parseInt(e.target.value))} /></div>
                    <div className="space-y-2"><Label>Yellow Cards</Label><Input type="number" value={formData.teamStats?.yellowCards} onChange={(e) => handleTeamStatsChange('yellowCards', parseInt(e.target.value))} /></div>
                    <div className="space-y-2"><Label>Red Cards</Label><Input type="number" value={formData.teamStats?.redCards} onChange={(e) => handleTeamStatsChange('redCards', parseInt(e.target.value))} /></div>
                 </div>
                 <div className="space-y-2">
                    <Label>Match Tags</Label>
                    <div className="flex flex-wrap gap-2">
                        {availableTags.map(tag => (
                            <Badge key={tag.id} variant={formData.tags?.includes(tag.id) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleMatchTag(tag.id)}>
                                {tag.label}
                            </Badge>
                        ))}
                    </div>
                </div>
                <div className="space-y-2">
                  <Label>Comments</Label>
                  <Textarea value={formData.comments} onChange={(e) => handleInputChange('comments', e.target.value)} placeholder="Any key moments or tactical notes?" />
                </div>
            </div>
        )}

        {step === 4 && (
          <div className="animate-in fade-in">
            <div className="flex justify-end mb-4">
                <Button onClick={addSubstitute} size="sm"><UserPlus className="h-4 w-4 mr-2" />Add Sub</Button>
            </div>
            <PlayerStatsForm
              players={formData.playerStats || []}
              onStatsChange={(stats) => handleInputChange('playerStats', stats)}
              gameDuration={formData.duration || 90}
            />
          </div>
        )}

        <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
          <div>
            {step > 1 && <Button variant="outline" onClick={() => setStep(step - 1)}><ArrowLeft className="h-4 w-4 mr-2" /> Previous</Button>}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onCancel}>Cancel</Button>
            {step < 4 && <Button onClick={() => setStep(step + 1)} disabled={(step === 1 && !isStep1Valid)}>Next <ArrowRight className="h-4 w-4 ml-2" /></Button>}
            {step === 4 && <Button onClick={handleSubmit} disabled={isSaving}>{isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Save Game</Button>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameRecordForm;
