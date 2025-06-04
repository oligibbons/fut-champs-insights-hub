import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { GameResult, PlayerPerformance, TeamStats } from '@/types/futChampions';
import { useSquadData } from '@/hooks/useSquadData';
import { Save, Users, BarChart3, MessageSquare } from 'lucide-react';
import PlayerStatsForm from './PlayerStatsForm';

interface GameRecordFormProps {
  onGameSaved: (gameData: Omit<GameResult, 'id'>) => void;
  gameNumber: number;
  onClose?: () => void;
  weekId?: string;
}

const GameRecordForm = ({ onGameSaved, gameNumber, onClose, weekId }: GameRecordFormProps) => {
  const { toast } = useToast();
  const { getDefaultSquad } = useSquadData();
  
  // Basic game info
  const [userGoals, setUserGoals] = useState('');
  const [opponentGoals, setOpponentGoals] = useState('');
  const [result, setResult] = useState<'win' | 'loss'>('win');
  const [opponentSkill, setOpponentSkill] = useState(5);
  const [duration, setDuration] = useState(90);
  const [gameContext, setGameContext] = useState<string>('normal');
  const [crossPlayEnabled, setCrossPlayEnabled] = useState(false);
  const [comments, setComments] = useState('');

  // Team stats with better defaults
  const [teamStats, setTeamStats] = useState<TeamStats>({
    shots: 12,
    shotsOnTarget: 6,
    possession: 55,
    expectedGoals: 1.8,
    actualGoals: 0,
    expectedGoalsAgainst: 1.2,
    actualGoalsAgainst: 0,
    passes: 320,
    passAccuracy: 82,
    corners: 4,
    fouls: 8,
    yellowCards: 1,
    redCards: 0,
    distanceCovered: 0
  });

  // Player stats
  const [playerStats, setPlayerStats] = useState<PlayerPerformance[]>([]);

  // Auto-populate starting XI when component loads
  useEffect(() => {
    const defaultSquad = getDefaultSquad();
    if (defaultSquad && defaultSquad.startingXI) {
      const startingPlayers: PlayerPerformance[] = defaultSquad.startingXI
        .filter(pos => pos.player)
        .map((pos, index) => ({
          id: `${pos.player!.id}-${index}`,
          name: pos.player!.name,
          position: pos.position,
          rating: 7.0,
          goals: 0,
          assists: 0,
          yellowCards: 0,
          redCards: 0,
          ownGoals: 0,
          minutesPlayed: duration,
          wasSubstituted: false
        }));

      const benchPlayers: PlayerPerformance[] = [
        { id: 'bench-1', name: 'Substitute 1', position: 'SUB', rating: 6.5, goals: 0, assists: 0, yellowCards: 0, redCards: 0, ownGoals: 0, minutesPlayed: 0, wasSubstituted: false },
        { id: 'bench-2', name: 'Substitute 2', position: 'SUB', rating: 6.5, goals: 0, assists: 0, yellowCards: 0, redCards: 0, ownGoals: 0, minutesPlayed: 0, wasSubstituted: false },
        { id: 'bench-3', name: 'Substitute 3', position: 'SUB', rating: 6.5, goals: 0, assists: 0, yellowCards: 0, redCards: 0, ownGoals: 0, minutesPlayed: 0, wasSubstituted: false }
      ];

      setPlayerStats([...startingPlayers, ...benchPlayers]);
    }
  }, [getDefaultSquad, duration]);

  // Update all player minutes when duration changes
  useEffect(() => {
    setPlayerStats(prev => prev.map(player => ({
      ...player,
      minutesPlayed: player.position === 'SUB' ? 0 : duration
    })));
  }, [duration]);

  // Update actual goals when user/opponent goals change
  useEffect(() => {
    const userG = parseInt(userGoals) || 0;
    const oppG = parseInt(opponentGoals) || 0;
    
    setTeamStats(prev => ({
      ...prev,
      actualGoals: userG,
      actualGoalsAgainst: oppG
    }));

    if (userGoals && opponentGoals) {
      setResult(userG > oppG ? 'win' : 'loss');
    }
  }, [userGoals, opponentGoals]);

  const handleSubmit = () => {
    if (!userGoals || !opponentGoals) {
      toast({
        title: "Missing Information",
        description: "Please enter both user and opponent goals.",
        variant: "destructive"
      });
      return;
    }

    const gameData: Omit<GameResult, 'id'> = {
      gameNumber,
      result,
      scoreLine: `${userGoals}-${opponentGoals}`,
      date: new Date().toISOString(),
      opponentSkill,
      duration,
      gameContext: gameContext as any,
      comments: comments || undefined,
      crossPlayEnabled,
      teamStats,
      playerStats
    };

    onGameSaved(gameData);
    
    toast({
      title: "Game Recorded",
      description: `Game ${gameNumber} has been successfully recorded.`,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Save className="h-5 w-5" />
            Record Game {gameNumber}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4 glass-card">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="team">Team Stats</TabsTrigger>
              <TabsTrigger value="players">
                <Users className="h-4 w-4 mr-2" />
                Players
              </TabsTrigger>
              <TabsTrigger value="notes">
                <MessageSquare className="h-4 w-4 mr-2" />
                Notes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Your Goals</Label>
                  <Input
                    type="number"
                    min="0"
                    value={userGoals}
                    onChange={(e) => setUserGoals(e.target.value)}
                    placeholder="0"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Opponent Goals</Label>
                  <Input
                    type="number"
                    min="0"
                    value={opponentGoals}
                    onChange={(e) => setOpponentGoals(e.target.value)}
                    placeholder="0"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Opponent Skill (1-10)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={opponentSkill}
                    onChange={(e) => setOpponentSkill(parseInt(e.target.value))}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Game Duration (minutes)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="120"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Game Context</Label>
                  <Select value={gameContext} onValueChange={setGameContext}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal Game</SelectItem>
                      <SelectItem value="rage_quit">Rage Quit</SelectItem>
                      <SelectItem value="extra_time">Extra Time</SelectItem>
                      <SelectItem value="penalties">Penalties</SelectItem>
                      <SelectItem value="disconnect">Disconnect</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="crossplay"
                    checked={crossPlayEnabled}
                    onCheckedChange={setCrossPlayEnabled}
                  />
                  <Label htmlFor="crossplay" className="text-white">Cross-Play Enabled</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="team" className="space-y-4 mt-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-white">Possession (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={teamStats.possession}
                    onChange={(e) => setTeamStats(prev => ({ ...prev, possession: parseInt(e.target.value) }))}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Total Passes</Label>
                  <Input
                    type="number"
                    min="0"
                    value={teamStats.passes}
                    onChange={(e) => setTeamStats(prev => ({ ...prev, passes: parseInt(e.target.value) }))}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Pass Accuracy (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={teamStats.passAccuracy}
                    onChange={(e) => setTeamStats(prev => ({ ...prev, passAccuracy: parseInt(e.target.value) }))}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Shots</Label>
                  <Input
                    type="number"
                    min="0"
                    value={teamStats.shots}
                    onChange={(e) => setTeamStats(prev => ({ ...prev, shots: parseInt(e.target.value) }))}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Shots on Target</Label>
                  <Input
                    type="number"
                    min="0"
                    value={teamStats.shotsOnTarget}
                    onChange={(e) => setTeamStats(prev => ({ ...prev, shotsOnTarget: parseInt(e.target.value) }))}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Corners</Label>
                  <Input
                    type="number"
                    min="0"
                    value={teamStats.corners}
                    onChange={(e) => setTeamStats(prev => ({ ...prev, corners: parseInt(e.target.value) }))}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Expected Goals (xG)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={teamStats.expectedGoals}
                    onChange={(e) => setTeamStats(prev => ({ ...prev, expectedGoals: parseFloat(e.target.value) }))}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Opponent xG (xGa)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={teamStats.expectedGoalsAgainst}
                    onChange={(e) => setTeamStats(prev => ({ ...prev, expectedGoalsAgainst: parseFloat(e.target.value) }))}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Fouls</Label>
                  <Input
                    type="number"
                    min="0"
                    value={teamStats.fouls}
                    onChange={(e) => setTeamStats(prev => ({ ...prev, fouls: parseInt(e.target.value) }))}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="players" className="mt-6">
              <PlayerStatsForm 
                playerStats={playerStats}
                onPlayerStatsChange={setPlayerStats}
                gameDuration={duration}
              />
            </TabsContent>

            <TabsContent value="notes" className="space-y-4 mt-6">
              <div>
                <Label className="text-white">Game Comments</Label>
                <Textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Add any notes about this game..."
                  className="bg-gray-800 border-gray-600 text-white"
                  rows={4}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-4 mt-6">
            <Button onClick={handleSubmit} className="flex-1 modern-button-primary">
              <Save className="h-4 w-4 mr-2" />
              Save Game
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameRecordForm;
