
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PlayerStatsForm from './PlayerStatsForm';
import { useAccountData } from '@/hooks/useAccountData';
import { useDataSync } from '@/hooks/useDataSync';
import { GameResult, PlayerPerformance, TeamStats } from '@/types/futChampions';
import { Play, Trophy, Users, BarChart3, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GameRecordFormProps {
  onGameSaved: (game: GameResult) => void;
  gameNumber: number;
}

const GameRecordForm = ({ onGameSaved, gameNumber }: GameRecordFormProps) => {
  const { toast } = useToast();
  const { getDefaultSquad } = useAccountData();
  const { settings } = useDataSync();
  
  const [result, setResult] = useState<'win' | 'loss'>('win');
  const [scoreLine, setScoreLine] = useState('');
  const [opponentSkill, setOpponentSkill] = useState<number>(5);
  const [duration, setDuration] = useState<number>(90);
  const [gameContext, setGameContext] = useState<'normal' | 'rage_quit' | 'extra_time' | 'penalties' | 'disconnect' | 'hacker' | 'free_win'>('normal');
  const [comments, setComments] = useState('');
  const [crossPlay, setCrossPlay] = useState(settings.defaultCrossPlay || false);
  const [gameRating, setGameRating] = useState<string>('');
  const [timePlayed, setTimePlayed] = useState<string>('');
  const [actualGameTime, setActualGameTime] = useState<number | undefined>();
  const [rageQuits, setRageQuits] = useState<number>(0);
  const [stressLevel, setStressLevel] = useState<number | undefined>();
  const [serverQuality, setServerQuality] = useState<number | undefined>();
  
  const [playerStats, setPlayerStats] = useState<PlayerPerformance[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStats>({
    possession: 50,
    passes: 300,
    passAccuracy: 80,
    shots: 10,
    shotsOnTarget: 5,
    corners: 3,
    fouls: 8,
    yellowCards: 1,
    redCards: 0,
    offsides: 2,
    expectedGoals: 1.5,
    actualGoals: 0,
    expectedGoalsAgainst: 1.0,
    actualGoalsAgainst: 0,
    distanceCovered: 105
  });

  const defaultSquad = getDefaultSquad();

  // Auto-populate squad players when default squad is available
  useEffect(() => {
    if (defaultSquad && defaultSquad.startingXI && playerStats.length === 0) {
      const startingPlayers = defaultSquad.startingXI
        .filter(pos => pos.player)
        .map(pos => ({
          id: `${pos.player!.id}-${Date.now()}`,
          name: pos.player!.name,
          position: pos.player!.position,
          rating: 6.5,
          goals: 0,
          assists: 0,
          minutesPlayed: 90,
          yellowCards: 0,
          redCards: 0,
          ownGoals: 0,
          wasSubstituted: false
        }));
      
      setPlayerStats(startingPlayers);
    }
  }, [defaultSquad]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!scoreLine) {
      toast({
        title: "Missing Score",
        description: "Please enter the final score.",
        variant: "destructive"
      });
      return;
    }

    const newGame: GameResult = {
      id: `game-${gameNumber}-${Date.now()}`,
      gameNumber,
      result,
      scoreLine,
      opponentSkill,
      duration,
      gameContext,
      comments,
      crossPlay,
      gameRating,
      timePlayed,
      actualGameTime,
      rageQuits,
      stressLevel,
      serverQuality,
      datePlayed: new Date().toISOString(),
      date: new Date().toISOString(),
      playerStats,
      teamStats,
      gameScore: calculateGameScore(),
      crossPlayEnabled: crossPlay
    };

    onGameSaved(newGame);
    resetForm();
  };

  const calculateGameScore = (): number => {
    const [ourGoals, theirGoals] = scoreLine.split('-').map(Number);
    let score = 0;
    
    // Base score from result
    if (result === 'win') score += 50;
    
    // Goal difference
    score += (ourGoals - theirGoals) * 5;
    
    // Opponent skill multiplier
    score += opponentSkill * 2;
    
    // Performance bonuses
    if (teamStats.possession > 60) score += 5;
    if (teamStats.passAccuracy > 85) score += 5;
    if ((teamStats.expectedGoals || 0) < ourGoals) score += 10; // Overperformed xG
    
    return Math.max(0, Math.min(100, score));
  };

  const resetForm = () => {
    setResult('win');
    setScoreLine('');
    setOpponentSkill(5);
    setDuration(90);
    setGameContext('normal');
    setComments('');
    setGameRating('');
    setTimePlayed('');
    setActualGameTime(undefined);
    setRageQuits(0);
    setStressLevel(undefined);
    setServerQuality(undefined);
    setPlayerStats([]);
    setTeamStats({
      possession: 50,
      passes: 300,
      passAccuracy: 80,
      shots: 10,
      shotsOnTarget: 5,
      corners: 3,
      fouls: 8,
      yellowCards: 1,
      redCards: 0,
      offsides: 2,
      expectedGoals: 1.5,
      actualGoals: 0,
      expectedGoalsAgainst: 1.0,
      actualGoalsAgainst: 0,
      distanceCovered: 105
    });
  };

  return (
    <Card className="glass-card static-element">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Play className="h-5 w-5 text-fifa-blue" />
          Record Game {gameNumber}
          {defaultSquad && (
            <Badge variant="outline" className="ml-2 text-fifa-green border-fifa-green">
              Using: {defaultSquad.name}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="players">
                <Users className="h-4 w-4 mr-2" />
                Players ({playerStats.length})
              </TabsTrigger>
              <TabsTrigger value="team">
                <BarChart3 className="h-4 w-4 mr-2" />
                Team Stats
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="result">Result</Label>
                  <Select value={result} onValueChange={(value: 'win' | 'loss') => setResult(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="win">Win</SelectItem>
                      <SelectItem value="loss">Loss</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="scoreLine">Final Score</Label>
                  <Input
                    id="scoreLine"
                    value={scoreLine}
                    onChange={(e) => setScoreLine(e.target.value)}
                    placeholder="2-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="opponentSkill">Opponent Skill (1-10)</Label>
                  <Input
                    id="opponentSkill"
                    type="number"
                    min="1"
                    max="10"
                    value={opponentSkill}
                    onChange={(e) => setOpponentSkill(parseInt(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Game Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    max="120"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="gameContext">Game Context</Label>
                  <Select value={gameContext} onValueChange={(value: any) => setGameContext(value)}>
                    <SelectTrigger>
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

                <div>
                  <Label htmlFor="gameRating">Game Rating</Label>
                  <Select value={gameRating} onValueChange={setGameRating}>
                    <SelectTrigger>
                      <SelectValue placeholder="Rate your performance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="average">Average</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                      <SelectItem value="terrible">Terrible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Cross-play Toggle */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  {crossPlay ? (
                    <Wifi className="h-5 w-5 text-fifa-blue" />
                  ) : (
                    <WifiOff className="h-5 w-5 text-gray-400" />
                  )}
                  <div>
                    <Label htmlFor="crossPlay" className="text-white">Cross-play Enabled</Label>
                    <p className="text-sm text-gray-400">Playing against other platforms</p>
                  </div>
                </div>
                <Switch
                  id="crossPlay"
                  checked={crossPlay}
                  onCheckedChange={setCrossPlay}
                />
              </div>

              {/* Optional Advanced Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="stressLevel">Stress Level (1-10)</Label>
                  <Input
                    id="stressLevel"
                    type="number"
                    min="1"
                    max="10"
                    value={stressLevel || ''}
                    onChange={(e) => setStressLevel(e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <Label htmlFor="rageQuits">Rage Moments</Label>
                  <Input
                    id="rageQuits"
                    type="number"
                    min="0"
                    max="20"
                    value={rageQuits}
                    onChange={(e) => setRageQuits(parseInt(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <Label htmlFor="serverQuality">Server Quality (1-10)</Label>
                  <Input
                    id="serverQuality"
                    type="number"
                    min="1"
                    max="10"
                    value={serverQuality || ''}
                    onChange={(e) => setServerQuality(e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="comments">Comments</Label>
                <textarea
                  id="comments"
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white resize-none"
                  rows={3}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Any notes about this game..."
                />
              </div>
            </TabsContent>

            <TabsContent value="players" className="space-y-4">
              {!defaultSquad && (
                <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-yellow-400" />
                  <p className="text-yellow-400 text-sm">
                    No default squad selected. Go to Squads page to set a default squad for automatic player population.
                  </p>
                </div>
              )}
              
              <PlayerStatsForm
                playerStats={playerStats}
                onPlayerStatsChange={setPlayerStats}
              />
            </TabsContent>

            <TabsContent value="team" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="possession">Possession %</Label>
                  <Input
                    id="possession"
                    type="number"
                    min="0"
                    max="100"
                    value={teamStats.possession}
                    onChange={(e) => setTeamStats({ ...teamStats, possession: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="passes">Total Passes</Label>
                  <Input
                    id="passes"
                    type="number"
                    min="0"
                    value={teamStats.passes}
                    onChange={(e) => setTeamStats({ ...teamStats, passes: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="passAccuracy">Pass Accuracy %</Label>
                  <Input
                    id="passAccuracy"
                    type="number"
                    min="0"
                    max="100"
                    value={teamStats.passAccuracy}
                    onChange={(e) => setTeamStats({ ...teamStats, passAccuracy: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="shots">Total Shots</Label>
                  <Input
                    id="shots"
                    type="number"
                    min="0"
                    value={teamStats.shots}
                    onChange={(e) => setTeamStats({ ...teamStats, shots: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="shotsOnTarget">Shots on Target</Label>
                  <Input
                    id="shotsOnTarget"
                    type="number"
                    min="0"
                    value={teamStats.shotsOnTarget}
                    onChange={(e) => setTeamStats({ ...teamStats, shotsOnTarget: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="expectedGoals">Expected Goals (xG)</Label>
                  <Input
                    id="expectedGoals"
                    type="number"
                    step="0.1"
                    min="0"
                    value={teamStats.expectedGoals}
                    onChange={(e) => setTeamStats({ ...teamStats, expectedGoals: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Button type="submit" className="w-full modern-button-primary">
            <Trophy className="h-4 w-4 mr-2" />
            Save Game
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default GameRecordForm;
