import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { GameResult, PlayerPerformance, TeamStats } from '@/types/futChampions';
import { useSquadData } from '@/hooks/useSquadData';
import { Save, Users, BarChart3, MessageSquare, X, Trophy, UserPlus } from 'lucide-react';
import PlayerStatsForm from './PlayerStatsForm';

interface GameRecordFormProps {
  onGameSaved: (gameData: Omit<GameResult, 'id'>) => void;
  gameNumber: number;
  onClose?: () => void;
  weekId?: string;
}

const GameRecordForm = ({ onGameSaved, gameNumber, onClose, weekId }: GameRecordFormProps) => {
  const { toast } = useToast();
  const { getDefaultSquad, squads } = useSquadData();
  
  // Basic game info
  const [userGoals, setUserGoals] = useState('');
  const [opponentGoals, setOpponentGoals] = useState('');
  const [result, setResult] = useState<'win' | 'loss'>('win');
  const [opponentSkill, setOpponentSkill] = useState<number | string>(5);
  const [duration, setDuration] = useState<number | string>(90);
  const [gameContext, setGameContext] = useState<string>('normal');
  const [crossPlayEnabled, setCrossPlayEnabled] = useState(false);
  const [comments, setComments] = useState('');
  const [activeTab, setActiveTab] = useState('basic');

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
        // Add starting XI players
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
            minutesPlayed: duration === '' ? 90 : Number(duration),
            wasSubstituted: false
          }));

        // Add substitutes with 0 minutes played
        const substitutePlayers: PlayerPerformance[] = defaultSquad.substitutes
          .filter(pos => pos.player)
          .map((pos, index) => ({
            id: `${pos.player!.id}-sub-${index}`,
            name: pos.player!.name,
            position: 'SUB',
            rating: 6.0,
            goals: 0,
            assists: 0,
            yellowCards: 0,
            redCards: 0,
            ownGoals: 0,
            minutesPlayed: 0, // Substitutes start with 0 minutes
            wasSubstituted: false
          }));

        setPlayerStats([...startingPlayers, ...substitutePlayers]);
      } else {
        // Create default players if no squad data
        const defaultPlayers: PlayerPerformance[] = [
          { id: 'gk-1', name: 'Goalkeeper', position: 'GK', rating: 7.0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, ownGoals: 0, minutesPlayed: duration === '' ? 90 : Number(duration), wasSubstituted: false },
          { id: 'def-1', name: 'Defender 1', position: 'CB', rating: 7.0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, ownGoals: 0, minutesPlayed: duration === '' ? 90 : Number(duration), wasSubstituted: false },
          { id: 'def-2', name: 'Defender 2', position: 'CB', rating: 7.0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, ownGoals: 0, minutesPlayed: duration === '' ? 90 : Number(duration), wasSubstituted: false },
          { id: 'mid-1', name: 'Midfielder 1', position: 'CM', rating: 7.0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, ownGoals: 0, minutesPlayed: duration === '' ? 90 : Number(duration), wasSubstituted: false },
          { id: 'mid-2', name: 'Midfielder 2', position: 'CM', rating: 7.0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, ownGoals: 0, minutesPlayed: duration === '' ? 90 : Number(duration), wasSubstituted: false },
          { id: 'att-1', name: 'Attacker 1', position: 'ST', rating: 7.0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, ownGoals: 0, minutesPlayed: duration === '' ? 90 : Number(duration), wasSubstituted: false }
        ];
        setPlayerStats(defaultPlayers);
      }
      setIsInitialized(true);
    }
  }, [getDefaultSquad, duration, isInitialized]);

  // Add substitute from squad
  const addSubstituteFromSquad = () => {
    const defaultSquad = getDefaultSquad();
    if (defaultSquad && defaultSquad.substitutes) {
      // Find unused substitutes from the squad
      const usedPlayerIds = playerStats.map(p => p.id.split('-')[0]);
      
      // First check substitutes
      const unusedSubs = defaultSquad.substitutes.filter(pos => 
        pos.player && !usedPlayerIds.includes(pos.player.id)
      );
      
      if (unusedSubs.length > 0) {
        const substitute = unusedSubs[0];
        const newPlayer: PlayerPerformance = {
          id: `${substitute.player!.id}-sub-${Date.now()}`,
          name: substitute.player!.name,
          position: 'SUB',
          rating: 6.0,
          goals: 0,
          assists: 0,
          yellowCards: 0,
          redCards: 0,
          ownGoals: 0,
          minutesPlayed: 0, // Substitutes start with 0 minutes
          wasSubstituted: false
        };
        setPlayerStats(prev => [...prev, newPlayer]);
        return;
      }
      
      // Then check reserves
      const unusedReserves = defaultSquad.reserves.filter(pos => 
        pos.player && !usedPlayerIds.includes(pos.player.id)
      );
      
      if (unusedReserves.length > 0) {
        const reserve = unusedReserves[0];
        const newPlayer: PlayerPerformance = {
          id: `${reserve.player!.id}-sub-${Date.now()}`,
          name: reserve.player!.name,
          position: 'SUB',
          rating: 6.0,
          goals: 0,
          assists: 0,
          yellowCards: 0,
          redCards: 0,
          ownGoals: 0,
          minutesPlayed: 0, // Substitutes start with 0 minutes
          wasSubstituted: false
        };
        setPlayerStats(prev => [...prev, newPlayer]);
        return;
      }
    }
    
    // Create generic substitute if no unused players
    const newPlayer: PlayerPerformance = {
      id: `sub-${Date.now()}`,
      name: `Substitute ${playerStats.filter(p => p.position === 'SUB').length + 1}`,
      position: 'SUB',
      rating: 6.0,
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      ownGoals: 0,
      minutesPlayed: 0, // Substitutes start with 0 minutes
      wasSubstituted: false
    };
    setPlayerStats(prev => [...prev, newPlayer]);
  };

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

  const handleInputChange = (field: string, value: string) => {
    if (field === 'userGoals') {
      setUserGoals(value);
    } else if (field === 'opponentGoals') {
      setOpponentGoals(value);
    } else if (field === 'opponentSkill') {
      if (value === '' || !isNaN(parseInt(value))) {
        setOpponentSkill(value === '' ? '' : parseInt(value));
      }
    } else if (field === 'duration') {
      if (value === '' || !isNaN(parseInt(value))) {
        setDuration(value === '' ? '' : parseInt(value));
      }
    }
  };

  const handleTeamStatsChange = (field: keyof TeamStats, value: string) => {
    if (value === '') {
      setTeamStats(prev => ({
        ...prev,
        [field]: ''
      }));
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        setTeamStats(prev => ({
          ...prev,
          [field]: field === 'expectedGoals' || field === 'expectedGoalsAgainst' ? numValue : Math.round(numValue)
        }));
      }
    }
  };

  const handleSubmit = () => {
    if (!userGoals || !opponentGoals) {
      toast({
        title: "Missing Information",
        description: "Please enter both user and opponent goals.",
        variant: "destructive"
      });
      return;
    }

    // Convert any empty string values to appropriate defaults
    const finalTeamStats = { ...teamStats };
    Object.keys(finalTeamStats).forEach(key => {
      const typedKey = key as keyof TeamStats;
      if (finalTeamStats[typedKey] === '') {
        if (typedKey === 'expectedGoals' || typedKey === 'expectedGoalsAgainst') {
          finalTeamStats[typedKey] = 0;
        } else {
          finalTeamStats[typedKey] = 0;
        }
      }
    });

    // Filter out substitutes with 0 minutes played
    const filteredPlayerStats = playerStats.filter(player => {
      // Keep all starting players
      if (player.position !== 'SUB') return true;
      
      // Only keep substitutes with minutes played > 0
      const minutes = player.minutesPlayed === '' ? 0 : Number(player.minutesPlayed);
      return minutes > 0;
    }).map(player => {
      // Convert any empty string values to appropriate defaults
      return {
        ...player,
        rating: player.rating === '' ? 7.0 : Number(player.rating),
        goals: player.goals === '' ? 0 : Number(player.goals),
        assists: player.assists === '' ? 0 : Number(player.assists),
        yellowCards: player.yellowCards === '' ? 0 : Number(player.yellowCards),
        redCards: player.redCards === '' ? 0 : Number(player.redCards),
        ownGoals: player.ownGoals === '' ? 0 : Number(player.ownGoals),
        minutesPlayed: player.minutesPlayed === '' ? 0 : Number(player.minutesPlayed)
      };
    });

    const gameData: Omit<GameResult, 'id'> = {
      gameNumber,
      result,
      scoreLine: `${userGoals}-${opponentGoals}`,
      date: new Date().toISOString(),
      opponentSkill: opponentSkill === '' ? 5 : Number(opponentSkill),
      duration: duration === '' ? 90 : Number(duration),
      gameContext: gameContext as any,
      comments: comments || undefined,
      crossPlayEnabled,
      teamStats: finalTeamStats,
      playerStats: filteredPlayerStats
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
          <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto pb-2">
            <Button 
              variant={activeTab === 'basic' ? 'default' : 'outline'} 
              onClick={() => setActiveTab('basic')}
              className="flex-shrink-0"
            >
              <Save className="h-4 w-4 mr-2" />
              Basic Info
            </Button>
            <Button 
              variant={activeTab === 'team' ? 'default' : 'outline'} 
              onClick={() => setActiveTab('team')}
              className="flex-shrink-0"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Team Stats
            </Button>
            <Button 
              variant={activeTab === 'players' ? 'default' : 'outline'} 
              onClick={() => setActiveTab('players')}
              className="flex-shrink-0"
            >
              <Users className="h-4 w-4 mr-2" />
              Players
            </Button>
            <Button 
              variant={activeTab === 'notes' ? 'default' : 'outline'} 
              onClick={() => setActiveTab('notes')}
              className="flex-shrink-0"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Notes
            </Button>
          </div>

          <div className="space-y-6">
            {activeTab === 'basic' && (
              <>
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
                        type="text"
                        inputMode="numeric"
                        value={userGoals}
                        onChange={(e) => handleInputChange('userGoals', e.target.value)}
                        placeholder="0"
                        className="bg-gray-800 border-gray-600 text-white text-lg text-center font-bold"
                      />
                    </div>
                    <div>
                      <Label className="text-white font-medium">Opponent Goals</Label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={opponentGoals}
                        onChange={(e) => handleInputChange('opponentGoals', e.target.value)}
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
                    <Select 
                      value={opponentSkill === '' ? '5' : opponentSkill.toString()} 
                      onValueChange={(value) => setOpponentSkill(parseInt(value))}
                    >
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
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={duration === '' ? '' : duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      placeholder="90"
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                    <p className="text-xs text-gray-400 mt-1">Enter exact duration (1-120 minutes)</p>
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
              </>
            )}

            {activeTab === 'team' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Key Stats */}
                <div>
                  <Label className="text-white font-medium">Possession (%)</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={teamStats.possession === '' ? '' : teamStats.possession}
                    onChange={(e) => handleTeamStatsChange('possession', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="50"
                  />
                </div>
                <div>
                  <Label className="text-white font-medium">Total Shots</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={teamStats.shots === '' ? '' : teamStats.shots}
                    onChange={(e) => handleTeamStatsChange('shots', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="8"
                  />
                </div>
                <div>
                  <Label className="text-white font-medium">Shots on Target</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={teamStats.shotsOnTarget === '' ? '' : teamStats.shotsOnTarget}
                    onChange={(e) => handleTeamStatsChange('shotsOnTarget', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="4"
                  />
                </div>
                <div>
                  <Label className="text-white font-medium">Expected Goals (xG)</Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={teamStats.expectedGoals === '' ? '' : teamStats.expectedGoals}
                    onChange={(e) => handleTeamStatsChange('expectedGoals', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="1.2"
                  />
                </div>

                {/* Additional Stats */}
                <div>
                  <Label className="text-white font-medium">Total Passes</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={teamStats.passes === '' ? '' : teamStats.passes}
                    onChange={(e) => handleTeamStatsChange('passes', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="100"
                  />
                </div>
                <div>
                  <Label className="text-white font-medium">Pass Accuracy (%)</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={teamStats.passAccuracy === '' ? '' : teamStats.passAccuracy}
                    onChange={(e) => handleTeamStatsChange('passAccuracy', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="78"
                  />
                </div>
                <div>
                  <Label className="text-white font-medium">Corners</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={teamStats.corners === '' ? '' : teamStats.corners}
                    onChange={(e) => handleTeamStatsChange('corners', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="3"
                  />
                </div>
                <div>
                  <Label className="text-white font-medium">Opponent xG (xGa)</Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={teamStats.expectedGoalsAgainst === '' ? '' : teamStats.expectedGoalsAgainst}
                    onChange={(e) => handleTeamStatsChange('expectedGoalsAgainst', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="1.0"
                  />
                </div>
                <div>
                  <Label className="text-white font-medium">Fouls Committed</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={teamStats.fouls === '' ? '' : teamStats.fouls}
                    onChange={(e) => handleTeamStatsChange('fouls', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label className="text-white font-medium">Yellow Cards</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={teamStats.yellowCards === '' ? '' : teamStats.yellowCards}
                    onChange={(e) => handleTeamStatsChange('yellowCards', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label className="text-white font-medium">Red Cards</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={teamStats.redCards === '' ? '' : teamStats.redCards}
                    onChange={(e) => handleTeamStatsChange('redCards', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="0"
                  />
                </div>
              </div>
            )}

            {activeTab === 'players' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Player Performance</h3>
                  <Button
                    type="button"
                    onClick={addSubstituteFromSquad}
                    size="sm"
                    className="bg-fifa-purple hover:bg-fifa-purple/80 text-white"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Substitute
                  </Button>
                </div>
                
                {isInitialized && (
                  <PlayerStatsForm 
                    playerStats={playerStats}
                    onPlayerStatsChange={setPlayerStats}
                    gameDuration={duration === '' ? 90 : Number(duration)}
                  />
                )}
              </div>
            )}

            {activeTab === 'notes' && (
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
            )}
          </div>

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