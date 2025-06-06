import { useState, useEffect, useCallback } from 'react';
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
import { Save, Users, BarChart3, MessageSquare, X, Trophy } from 'lucide-react';
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

  // Team stats with more realistic defaults
  const [teamStats, setTeamStats] = useState<TeamStats>({
    shots: 8,
    shotsOnTarget: 4,
    possession: 50,
    expectedGoals: 1.2,
    actualGoals: 0,
    expectedGoalsAgainst: 1.0,
    actualGoalsAgainst: 0,
    passes: 100,
    passAccuracy: 78,
    corners: 3,
    fouls: 0,
    yellowCards: 0,
    redCards: 0,
    distanceCovered: 0
  });

  // Player stats
  const [playerStats, setPlayerStats] = useState<PlayerPerformance[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Auto-populate starting XI when component loads - only once
  useEffect(() => {
    if (!isInitialized) {
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

        setPlayerStats(startingPlayers);
      } else {
        // Create default players if no squad data
        const defaultPlayers: PlayerPerformance[] = [
          { id: 'gk-1', name: 'Goalkeeper', position: 'GK', rating: 7.0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, ownGoals: 0, minutesPlayed: duration, wasSubstituted: false },
          { id: 'def-1', name: 'Defender 1', position: 'CB', rating: 7.0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, ownGoals: 0, minutesPlayed: duration, wasSubstituted: false },
          { id: 'def-2', name: 'Defender 2', position: 'CB', rating: 7.0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, ownGoals: 0, minutesPlayed: duration, wasSubstituted: false },
          { id: 'mid-1', name: 'Midfielder 1', position: 'CM', rating: 7.0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, ownGoals: 0, minutesPlayed: duration, wasSubstituted: false },
          { id: 'mid-2', name: 'Midfielder 2', position: 'CM', rating: 7.0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, ownGoals: 0, minutesPlayed: duration, wasSubstituted: false },
          { id: 'att-1', name: 'Attacker 1', position: 'ST', rating: 7.0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, ownGoals: 0, minutesPlayed: duration, wasSubstituted: false }
        ];
        setPlayerStats(defaultPlayers);
      }
      setIsInitialized(true);
    }
  }, [getDefaultSquad, duration, isInitialized]);

  // Update player minutes when duration changes - but only if players exist and are initialized
  const updatePlayerMinutes = useCallback(() => {
    if (isInitialized && playerStats.length > 0) {
      setPlayerStats(prev => prev.map(player => ({
        ...player,
        minutesPlayed: player.position === 'SUB' ? 0 : duration
      })));
    }
  }, [duration, isInitialized, playerStats.length]);

  useEffect(() => {
    updatePlayerMinutes();
  }, [updatePlayerMinutes]);

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
    <div className="w-full max-w-5xl mx-auto">
      <Card className="glass-card">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="h-5 w-5 text-fifa-gold" />
              Record Game {gameNumber}
            </CardTitle>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 glass-card">
              <TabsTrigger value="basic" className="text-xs sm:text-sm">
                <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Basic Info</span>
                <span className="sm:hidden">Basic</span>
              </TabsTrigger>
              <TabsTrigger value="team" className="text-xs sm:text-sm">
                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Team Stats</span>
                <span className="sm:hidden">Team</span>
              </TabsTrigger>
              <TabsTrigger value="players" className="text-xs sm:text-sm">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Players
              </TabsTrigger>
              <TabsTrigger value="notes" className="text-xs sm:text-sm">
                <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Notes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6 mt-6">
              {/* Score Input */}
              <div className="p-4 bg-gradient-to-r from-fifa-blue/10 to-fifa-purple/10 rounded-xl border border-fifa-blue/20">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-fifa-gold" />
                  Match Result
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white font-medium">Your Goals</Label>
                    <Input
                      type="number"
                      min="0"
                      value={userGoals}
                      onChange={(e) => setUserGoals(e.target.value)}
                      placeholder="0"
                      className="bg-gray-800 border-gray-600 text-white text-lg text-center font-bold"
                    />
                  </div>
                  <div>
                    <Label className="text-white font-medium">Opponent Goals</Label>
                    <Input
                      type="number"
                      min="0"
                      value={opponentGoals}
                      onChange={(e) => setOpponentGoals(e.target.value)}
                      placeholder="0"
                      className="bg-gray-800 border-gray-600 text-white text-lg text-center font-bold"
                    />
                  </div>
                </div>
                {userGoals && opponentGoals && (
                  <div className="mt-4 text-center">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
                      result === 'win' 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      <span className="font-bold text-lg">{userGoals}-{opponentGoals}</span>
                      <span>{result === 'win' ? '🏆 Victory!' : '❌ Defeat'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Game Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white font-medium">Opponent Skill Level</Label>
                  <Select value={opponentSkill.toString()} onValueChange={(value) => setOpponentSkill(parseInt(value))}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8,9,10].map(skill => (
                        <SelectItem key={skill} value={skill.toString()}>
                          {skill}/10 {skill <= 3 ? '(Beginner)' : skill <= 6 ? '(Intermediate)' : skill <= 8 ? '(Advanced)' : '(Expert)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white font-medium">Game Duration (minutes)</Label>
                  <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="90">90 minutes (Regular)</SelectItem>
                      <SelectItem value="105">105 minutes (Extra Time - AET)</SelectItem>
                      <SelectItem value="120">120 minutes (Full Extra Time)</SelectItem>
                      <SelectItem value="45">45 minutes (Rage Quit)</SelectItem>
                      <SelectItem value="30">30 minutes (Early Disconnect)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white font-medium">Game Context</Label>
                  <Select value={gameContext} onValueChange={setGameContext}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal Game</SelectItem>
                      <SelectItem value="rage_quit">Opponent Rage Quit</SelectItem>
                      <SelectItem value="extra_time">Extra Time</SelectItem>
                      <SelectItem value="penalties">Penalties</SelectItem>
                      <SelectItem value="disconnect">Connection Issues</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-3 pt-6">
                  <Switch
                    id="crossplay"
                    checked={crossPlayEnabled}
                    onCheckedChange={setCrossPlayEnabled}
                  />
                  <Label htmlFor="crossplay" className="text-white font-medium">Cross-Platform Match</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="team" className="space-y-6 mt-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Key Stats */}
                <div>
                  <Label className="text-white font-medium">Possession (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={teamStats.possession}
                    onChange={(e) => setTeamStats(prev => ({ ...prev, possession: parseInt(e.target.value) || 0 }))}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white font-medium">Total Shots</Label>
                  <Input
                    type="number"
                    min="0"
                    value={teamStats.shots}
                    onChange={(e) => setTeamStats(prev => ({ ...prev, shots: parseInt(e.target.value) || 0 }))}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white font-medium">Shots on Target</Label>
                  <Input
                    type="number"
                    min="0"
                    value={teamStats.shotsOnTarget}
                    onChange={(e) => setTeamStats(prev => ({ ...prev, shotsOnTarget: parseInt(e.target.value) || 0 }))}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white font-medium">Expected Goals (xG)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={teamStats.expectedGoals}
                    onChange={(e) => setTeamStats(prev => ({ ...prev, expectedGoals: parseFloat(e.target.value) || 0 }))}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>

                {/* Additional Stats */}
                <div>
                  <Label className="text-white font-medium">Total Passes</Label>
                  <Input
                    type="number"
                    min="0"
                    value={teamStats.passes}
                    onChange={(e) => setTeamStats(prev => ({ ...prev, passes: parseInt(e.target.value) || 0 }))}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white font-medium">Pass Accuracy (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={teamStats.passAccuracy}
                    onChange={(e) => setTeamStats(prev => ({ ...prev, passAccuracy: parseInt(e.target.value) || 0 }))}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white font-medium">Corners</Label>
                  <Input
                    type="number"
                    min="0"
                    value={teamStats.corners}
                    onChange={(e) => setTeamStats(prev => ({ ...prev, corners: parseInt(e.target.value) || 0 }))}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white font-medium">Opponent xG (xGa)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={teamStats.expectedGoalsAgainst}
                    onChange={(e) => setTeamStats(prev => ({ ...prev, expectedGoalsAgainst: parseFloat(e.target.value) || 0 }))}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white font-medium">Fouls Committed</Label>
                  <Input
                    type="number"
                    min="0"
                    value={teamStats.fouls}
                    onChange={(e) => setTeamStats(prev => ({ ...prev, fouls: parseInt(e.target.value) || 0 }))}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white font-medium">Yellow Cards</Label>
                  <Input
                    type="number"
                    min="0"
                    value={teamStats.yellowCards}
                    onChange={(e) => setTeamStats(prev => ({ ...prev, yellowCards: parseInt(e.target.value) || 0 }))}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white font-medium">Red Cards</Label>
                  <Input
                    type="number"
                    min="0"
                    max="2"
                    value={teamStats.redCards}
                    onChange={(e) => setTeamStats(prev => ({ ...prev, redCards: parseInt(e.target.value) || 0 }))}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="players" className="mt-6">
              {isInitialized && (
                <PlayerStatsForm 
                  playerStats={playerStats}
                  onPlayerStatsChange={setPlayerStats}
                  gameDuration={duration}
                />
              )}
            </TabsContent>

            <TabsContent value="notes" className="space-y-4 mt-6">
              <div>
                <Label className="text-white font-medium">Match Comments & Notes</Label>
                <Textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Add any notes about this match - tactics used, key moments, areas for improvement..."
                  className="bg-gray-800 border-gray-600 text-white min-h-[120px]"
                  rows={5}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-700">
            <Button 
              onClick={handleSubmit} 
              className="flex-1 bg-fifa-green hover:bg-fifa-green/80 text-white font-medium py-3"
              size="lg"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Game Data
            </Button>
            {onClose && (
              <Button 
                onClick={onClose} 
                variant="outline" 
                className="sm:w-auto border-gray-600 text-gray-400 hover:text-white hover:border-gray-500"
                size="lg"
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameRecordForm;
