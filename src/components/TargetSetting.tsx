
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { WeeklyTarget, WeeklyPerformance } from '@/types/futChampions';
import { Target, Trophy, TrendingUp, Star, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TargetSettingProps {
  currentWeek: WeeklyPerformance | null;
  onTargetSet: (target: WeeklyTarget) => void;
  weeklyData: WeeklyPerformance[];
}

const TargetSetting = ({ currentWeek, onTargetSet, weeklyData }: TargetSettingProps) => {
  const { toast } = useToast();
  const [target, setTarget] = useState<WeeklyTarget>({
    wins: 11,
    minimumRank: 'Gold 1',
    goalsScored: 25,
    cleanSheets: 3,
    custom: ''
  });

  // Calculate suggested targets based on previous performance
  const calculateSuggestedTargets = (): WeeklyTarget => {
    if (weeklyData.length === 0) {
      return { wins: 11, minimumRank: 'Gold 1', goalsScored: 25, cleanSheets: 3 };
    }

    const recentWeeks = weeklyData.slice(-3);
    const avgWins = recentWeeks.reduce((sum, week) => sum + week.totalWins, 0) / recentWeeks.length;
    const avgGoals = recentWeeks.reduce((sum, week) => sum + week.totalGoals, 0) / recentWeeks.length;
    
    // Adaptive targeting - aim slightly higher than recent average
    const suggestedWins = Math.min(Math.max(Math.ceil(avgWins + 1), 8), 15);
    const suggestedGoals = Math.ceil(avgGoals * 1.1);

    return {
      wins: suggestedWins,
      goalsScored: suggestedGoals,
      cleanSheets: Math.max(Math.ceil(suggestedWins * 0.2), 2),
      minimumRank: getRankSuggestion(suggestedWins)
    };
  };

  const getRankSuggestion = (wins: number): string => {
    if (wins >= 14) return 'Elite';
    if (wins >= 11) return 'Gold 1';
    if (wins >= 8) return 'Gold 2';
    if (wins >= 5) return 'Gold 3';
    return 'Silver 1';
  };

  const getTargetDifficulty = (wins: number): { level: string; color: string } => {
    if (wins >= 14) return { level: 'Legendary', color: 'text-fifa-gold' };
    if (wins >= 12) return { level: 'Hard', color: 'text-fifa-red' };
    if (wins >= 9) return { level: 'Medium', color: 'text-fifa-blue' };
    return { level: 'Easy', color: 'text-fifa-green' };
  };

  const handleSubmit = () => {
    onTargetSet(target);
    toast({
      title: "Target Set!",
      description: `Your goal is ${target.wins} wins this week. Good luck!`,
    });
  };

  const handleUseSuggested = () => {
    const suggested = calculateSuggestedTargets();
    setTarget(suggested);
  };

  const suggestedTargets = calculateSuggestedTargets();
  const difficulty = getTargetDifficulty(target.wins);

  const presetTargets = [
    { name: 'Casual', wins: 7, rank: 'Silver 1', goals: 18 },
    { name: 'Competitive', wins: 11, rank: 'Gold 1', goals: 25 },
    { name: 'Tryhard', wins: 14, rank: 'Elite', goals: 35 },
    { name: 'Pro Level', wins: 15, rank: 'Elite', goals: 40 }
  ];

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Target className="h-5 w-5 text-fifa-blue" />
          Set Weekly Targets
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Presets */}
        <div className="space-y-3">
          <Label className="text-gray-300">Quick Presets</Label>
          <div className="grid grid-cols-2 gap-2">
            {presetTargets.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                size="sm"
                onClick={() => setTarget({
                  wins: preset.wins,
                  minimumRank: preset.rank,
                  goalsScored: preset.goals,
                  cleanSheets: Math.ceil(preset.wins * 0.2)
                })}
                className="text-left justify-start bg-white/5 border-white/20 text-white hover:bg-white/10"
              >
                <div>
                  <p className="font-medium">{preset.name}</p>
                  <p className="text-xs text-gray-400">{preset.wins} wins • {preset.rank}</p>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* AI Suggested */}
        <div className="p-4 bg-fifa-blue/10 border border-fifa-blue/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-fifa-blue flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              AI Suggested Target
            </h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleUseSuggested}
              className="text-fifa-blue border-fifa-blue/30 hover:bg-fifa-blue/10"
            >
              Use This
            </Button>
          </div>
          <p className="text-sm text-white">
            Based on your recent performance: <strong>{suggestedTargets.wins} wins</strong> • {suggestedTargets.minimumRank}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            This target adapts to your skill level and recent form
          </p>
        </div>

        {/* Custom Target Setting */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="wins" className="text-gray-300">Target Wins *</Label>
            <Input
              id="wins"
              type="number"
              min="0"
              max="15"
              value={target.wins}
              onChange={(e) => setTarget({...target, wins: parseInt(e.target.value) || 0})}
              className="bg-white/10 border-white/20 text-white"
            />
            <div className="flex items-center gap-2">
              <Badge className={`${difficulty.color} bg-transparent border-current`}>
                {difficulty.level}
              </Badge>
              <span className="text-xs text-gray-400">
                {target.wins}/15 games ({((target.wins/15)*100).toFixed(0)}% win rate needed)
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rank" className="text-gray-300">Minimum Rank</Label>
            <Select value={target.minimumRank} onValueChange={(value) => setTarget({...target, minimumRank: value})}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bronze 3">Bronze 3</SelectItem>
                <SelectItem value="Bronze 2">Bronze 2</SelectItem>
                <SelectItem value="Bronze 1">Bronze 1</SelectItem>
                <SelectItem value="Silver 3">Silver 3</SelectItem>
                <SelectItem value="Silver 2">Silver 2</SelectItem>
                <SelectItem value="Silver 1">Silver 1</SelectItem>
                <SelectItem value="Gold 3">Gold 3</SelectItem>
                <SelectItem value="Gold 2">Gold 2</SelectItem>
                <SelectItem value="Gold 1">Gold 1</SelectItem>
                <SelectItem value="Elite">Elite</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goals" className="text-gray-300">Goals Target</Label>
            <Input
              id="goals"
              type="number"
              min="0"
              value={target.goalsScored || ''}
              onChange={(e) => setTarget({...target, goalsScored: parseInt(e.target.value) || undefined})}
              className="bg-white/10 border-white/20 text-white"
              placeholder="Optional"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cleanSheets" className="text-gray-300">Clean Sheets</Label>
            <Input
              id="cleanSheets"
              type="number"
              min="0"
              max="15"
              value={target.cleanSheets || ''}
              onChange={(e) => setTarget({...target, cleanSheets: parseInt(e.target.value) || undefined})}
              className="bg-white/10 border-white/20 text-white"
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="custom" className="text-gray-300">Custom Goal</Label>
          <Textarea
            id="custom"
            value={target.custom || ''}
            onChange={(e) => setTarget({...target, custom: e.target.value})}
            className="bg-white/10 border-white/20 text-white"
            placeholder="e.g., 'Score with every player in my squad' or 'Don't concede more than 1 goal per game'"
            rows={2}
          />
        </div>

        <Button 
          onClick={handleSubmit}
          className="w-full bg-fifa-gradient hover:shadow-lg transition-all duration-300"
        >
          <Trophy className="h-4 w-4 mr-2" />
          Set Target for Week {currentWeek?.weekNumber || 'Next'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TargetSetting;
