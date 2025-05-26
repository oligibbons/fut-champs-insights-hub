
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { GameResult, TeamStats } from '@/types/futChampions';
import { Trophy, Target, Clock, MessageSquare } from 'lucide-react';

interface GameRecordFormProps {
  onSubmit: (gameData: Partial<GameResult>) => void;
  gameNumber: number;
}

const GameRecordForm = ({ onSubmit, gameNumber }: GameRecordFormProps) => {
  const [result, setResult] = useState<'win' | 'loss' | ''>('');
  const [gameContext, setGameContext] = useState<string>('normal');
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();

  const goalsFor = watch('goalsFor', 0);
  const goalsAgainst = watch('goalsAgainst', 0);

  const onFormSubmit = (data: any) => {
    const teamStats: TeamStats = {
      shots: parseInt(data.shots) || 0,
      shotsOnTarget: parseInt(data.shotsOnTarget) || 0,
      possession: parseInt(data.possession) || 50,
      expectedGoals: parseFloat(data.expectedGoals) || 0,
      actualGoals: parseInt(data.goalsFor) || 0,
      expectedGoalsAgainst: parseFloat(data.expectedGoalsAgainst) || 0,
      actualGoalsAgainst: parseInt(data.goalsAgainst) || 0,
      passes: parseInt(data.passes) || 0,
      passAccuracy: parseInt(data.passAccuracy) || 0,
      corners: parseInt(data.corners) || 0,
      fouls: parseInt(data.fouls) || 0,
    };

    const gameData: Partial<GameResult> = {
      gameNumber,
      result: result as 'win' | 'loss',
      scoreLine: `${data.goalsFor}-${data.goalsAgainst}`,
      opponentSkill: parseInt(data.opponentSkill),
      gameContext: gameContext as any,
      comments: data.comments || '',
      teamStats,
      duration: parseInt(data.duration) || 90,
      date: new Date().toISOString(),
      playerStats: [] // We'll add player stats later
    };

    onSubmit(gameData);
  };

  // Auto-determine result based on score
  const handleScoreChange = () => {
    const goalsForNum = parseInt(goalsFor) || 0;
    const goalsAgainstNum = parseInt(goalsAgainst) || 0;
    
    if (goalsForNum > goalsAgainstNum) {
      setResult('win');
    } else if (goalsForNum < goalsAgainstNum) {
      setResult('loss');
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Trophy className="h-5 w-5 text-fifa-gold" />
          Record Game {gameNumber}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Game Result Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Target className="h-4 w-4" />
              Match Result
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="goalsFor" className="text-gray-300">Goals For</Label>
                <Input
                  id="goalsFor"
                  type="number"
                  min="0"
                  max="20"
                  {...register('goalsFor', { required: true, onChange: handleScoreChange })}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="goalsAgainst" className="text-gray-300">Goals Against</Label>
                <Input
                  id="goalsAgainst"
                  type="number"
                  min="0"
                  max="20"
                  {...register('goalsAgainst', { required: true, onChange: handleScoreChange })}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>

            {result && (
              <Badge 
                variant={result === 'win' ? 'default' : 'destructive'}
                className="text-sm"
              >
                {result === 'win' ? 'Victory!' : 'Defeat'}
              </Badge>
            )}
          </div>

          <Separator className="bg-white/20" />

          {/* Game Context & Opponent */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Game Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Opponent Skill (1-10)</Label>
                <Select onValueChange={(value) => setValue('opponentSkill', value)}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Rate opponent skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8,9,10].map(num => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num <= 3 ? '(Beginner)' : num <= 6 ? '(Average)' : num <= 8 ? '(Good)' : '(Pro)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-300">Game Context</Label>
                <Select value={gameContext} onValueChange={setGameContext}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal Game</SelectItem>
                    <SelectItem value="rage_quit">Rage Quit</SelectItem>
                    <SelectItem value="extra_time">Extra Time</SelectItem>
                    <SelectItem value="penalties">Penalties</SelectItem>
                    <SelectItem value="disconnect">Disconnect</SelectItem>
                    <SelectItem value="hacker">Hacker</SelectItem>
                    <SelectItem value="free_win">Free Win</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="duration" className="text-gray-300">Game Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="150"
                defaultValue="90"
                {...register('duration')}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>

          <Separator className="bg-white/20" />

          {/* Team Statistics */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Team Statistics</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="shots" className="text-gray-300">Shots</Label>
                <Input
                  id="shots"
                  type="number"
                  min="0"
                  {...register('shots')}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="shotsOnTarget" className="text-gray-300">Shots on Target</Label>
                <Input
                  id="shotsOnTarget"
                  type="number"
                  min="0"
                  {...register('shotsOnTarget')}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="possession" className="text-gray-300">Possession %</Label>
                <Input
                  id="possession"
                  type="number"
                  min="0"
                  max="100"
                  {...register('possession')}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="expectedGoals" className="text-gray-300">Expected Goals</Label>
                <Input
                  id="expectedGoals"
                  type="number"
                  step="0.1"
                  min="0"
                  {...register('expectedGoals')}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              <div>
                <Label htmlFor="expectedGoalsAgainst" className="text-gray-300">Expected Goals Against</Label>
                <Input
                  id="expectedGoalsAgainst"
                  type="number"
                  step="0.1"
                  min="0"
                  {...register('expectedGoalsAgainst')}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="passes" className="text-gray-300">Passes</Label>
                <Input
                  id="passes"
                  type="number"
                  min="0"
                  {...register('passes')}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="passAccuracy" className="text-gray-300">Pass Accuracy %</Label>
                <Input
                  id="passAccuracy"
                  type="number"
                  min="0"
                  max="100"
                  {...register('passAccuracy')}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>
          </div>

          <Separator className="bg-white/20" />

          {/* Comments */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Game Notes
            </h3>
            
            <div>
              <Label htmlFor="comments" className="text-gray-300">Comments</Label>
              <Textarea
                id="comments"
                placeholder="How did the game go? What worked well? What needs improvement?"
                {...register('comments')}
                className="bg-white/10 border-white/20 text-white min-h-[100px]"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-fifa-gradient hover:shadow-lg transition-all duration-300"
            disabled={!result}
          >
            <Trophy className="h-4 w-4 mr-2" />
            Save Game
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default GameRecordForm;
