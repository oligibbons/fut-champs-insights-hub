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
import { Save, Users, BarChart3, MessageSquare, X, Trophy, UserPlus } from 'lucide-react';
import PlayerStatsForm from './PlayerStatsForm';
import MobileNumberInput from './MobileNumberInput';
import { Badge } from './ui/badge';

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
  const [userGoals, setUserGoals] = useState<number | null>(null);
  const [opponentGoals, setOpponentGoals] = useState<number | null>(null);
  const [result, setResult] = useState<'win' | 'loss'>('win');
  const [opponentSkill, setOpponentSkill] = useState(5);
  const [duration, setDuration] = useState(90);
  const [gameContext, setGameContext] = useState<string>('normal');
  const [crossPlayEnabled, setCrossPlayEnabled] = useState(false);
  const [comments, setComments] = useState('');
  const [matchTags, setMatchTags] = useState<string[]>([]);
  const [opponentPlayStyle, setOpponentPlayStyle] = useState<string>('balanced');
  const [opponentFormation, setOpponentFormation] = useState<string>('');
  const [opponentSquadRating, setOpponentSquadRating] = useState<number>(85);

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
  const [activeTab, setActiveTab] = useState('basic');

  // Available tags for matches
  const availableTags = [
    { id: 'comeback', label: 'Comeback Win', color: 'bg-fifa-green/20 text-fifa-green' },
    { id: 'bottled', label: 'Bottled Lead', color: 'bg-fifa-red/20 text-fifa-red' },
    { id: 'bad-servers', label: 'Bad Servers', color: 'bg-fifa-gold/20 text-fifa-gold' },
    { id: 'scripting', label: 'Scripting', color: 'bg-fifa-purple/20 text-fifa-purple' },
    { id: 'good-opponent', label: 'Good Opponent', color: 'bg-fifa-blue/20 text-fifa-blue' },
    { id: 'lucky-win', label: 'Lucky Win', color: 'bg-green-500/20 text-green-500' },
    { id: 'unlucky-loss', label: 'Unlucky Loss', color: 'bg-red-500/20 text-red-500' },
    { id: 'dominated', label: 'Dominated', color: 'bg-purple-500/20 text-purple-500' },
    { id: 'close-game', label: 'Close Game', color: 'bg-yellow-500/20 text-yellow-500' },
    { id: 'high-scoring', label: 'High Scoring', color: 'bg-blue-400/20 text-blue-400' },
    { id: 'defensive', label: 'Defensive Battle', color: 'bg-gray-500/20 text-gray-400' },
    { id: 'counter-attack', label: 'Counter Attack', color: 'bg-orange-500/20 text-orange-500' }
  ];

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

        // Add substitutes with 0 minutes played by default
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
            minutesPlayed: 0, // Default to 0 minutes for subs
            wasSubstituted: false
          }));

        setPlayerStats([...startingPlayers, ...substitutePlayers]);
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

  // Update player minutes when duration changes
  useEffect(() => {
    if (isInitialized && playerStats.length > 0) {
      // Only update starting players, not substitutes
      setPlayerStats(prevStats => 
        prevStats.map(player => {
          // Only update players who are not substitutes (have non-zero minutes)
          if (player.minutesPlayed > 0) {
            return { ...player, minutesPlayed: duration };
          }
          return player;
        })
      );
    }
  }, [duration, isInitialized]);

  // Add substitute from squad
  const addSubstituteFromSquad = () => {
    const defaultSquad = getDefaultSquad();
    if (defaultSquad && defaultSquad.startingXI) {
      // Find unused players from the squad
      const usedPlayerIds = playerStats.map(p => p.id.split('-')[0]);
      const unusedPlayers = defaultSquad.startingXI.filter(pos => 
        pos.player && !usedPlayerIds.includes(pos.player.id)
      );
      
      if (unusedPlayers.length > 0) {
        const substitute = unusedPlayers[0];
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
          minutesPlayed: 0, // Default to 0 minutes for subs
          wasSubstituted: false
        };
        setPlayerStats(prev => [...prev, newPlayer]);
      } else {
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
          minutesPlayed: 0, // Default to 0 minutes for subs
          wasSubstituted: false
        };
        setPlayerStats(prev => [...prev, newPlayer]);
      }
    }
  };

  // Update actual goals when user/opponent goals change
  useEffect(() => {
    const userG = userGoals ?? 0;
    const oppG = opponentGoals ?? 0;
    
    setTeamStats(prev => ({
      ...prev,
      actualGoals: userG,
      actualGoalsAgainst: oppG
    }));

    if (userGoals !== null && opponentGoals !== null) {
      setResult(userG > oppG ? 'win' : 'loss');
    }
  }, [userGoals, opponentGoals]);

  const toggleMatchTag = (tagId: string) => {
    setMatchTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId) 
        : [...prev, tagId]
    );
  };

  const handleSubmit = () => {
    if (userGoals === null || opponentGoals === null) {
      toast({
        title: "Missing Information",
        description: "Please enter both user and opponent goals.",
        variant: "destructive"
      });
      return;
    }

    // Filter out substitutes with 0 minutes played
    const filteredPlayerStats = playerStats.filter(player => 
      player.position !== 'SUB' || player.minutesPlayed > 0
    );

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
      playerStats: filteredPlayerStats,
      tags: matchTags,
      opponentPlayStyle,
      opponentFormation: opponentFormation || undefined,
      opponentSquadRating: opponentSquadRating || undefined
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
          <div className="mobile-tabs">
            <Button
              variant={activeTab === 'basic' ? 'default' : 'outline'}
              onClick={() => setActiveTab('basic')}
              className="mobile-tab-button"
            >
              <Save className="h-4 w-4 mr-2" />
              Basic Info
            </Button>
            <Button
              variant={activeTab === 'team' ? 'default' : 'outline'}
              onClick={() => setActiveTab('team')}
              className="mobile-tab-button"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Team Stats
            </Button>
            <Button
              variant={activeTab === 'players' ? 'default' : 'outline'}
              onClick={() => setActiveTab('players')}
              className="mobile-tab-button"
            >
              <Users className="h-4 w-4 mr-2" />
              Players
            </Button>
            <Button
              variant={activeTab === 'notes' ? 'default' : 'outline'}
              onClick={() => setActiveTab('notes')}
              className="mobile-tab-button"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Notes
            </Button>
          </div>

          {activeTab === 'basic' && (
            <div className="space-y-6">
              {/* Score Input */}
              <div className="p-4 bg-gradient-to-r from-fifa-blue/10 to-fifa-purple/10 rounded-xl border border-fifa-blue/20">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-fifa-gold" />
                  Match Result
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white font-medium">Your Goals</Label>
                    <MobileNumberInput
                      label=""
                      value={userGoals ?? ''}
                      onChange={setUserGoals}
                      min={0}
                      max={20}
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-white font-medium">Opponent Goals</Label>
                    <MobileNumberInput
                      label=""
                      value={opponentGoals ?? ''}
                      onChange={setOpponentGoals}
                      min={0}
                      max={20}
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>
                </div>
                {userGoals !== null && opponentGoals !== null && (
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
                  <MobileNumberInput
                    label=""
                    value={duration}
                    onChange={setDuration}
                    min={1}
                    max={120}
                    placeholder="90"
                    className="mt-1"
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

              {/* Opponent Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-2">Opponent Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-white font-medium">Play Style</Label>
                    <Select value={opponentPlayStyle} onValueChange={setOpponentPlayStyle}>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="balanced">Balanced</SelectItem>
                        <SelectItem value="possession">Possession</SelectItem>
                        <SelectItem value="counter-attack">Counter Attack</SelectItem>
                        <SelectItem value="high-press">High Press</SelectItem>
                        <SelectItem value="drop-back">Drop Back</SelectItem>
                        <SelectItem value="long-ball">Long Ball</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-white font-medium">Formation</Label>
                    <Input
                      value={opponentFormation}
                      onChange={(e) => setOpponentFormation(e.target.value)}
                      placeholder="e.g. 4-2-3-1"
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white font-medium">Squad Rating</Label>
                    <MobileNumberInput
                      label=""
                      value={opponentSquadRating}
                      onChange={setOpponentSquadRating}
                      min={70}
                      max={99}
                      placeholder="85"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Match Tags */}
              <div>
                <Label className="text-white font-medium mb-2 block">Match Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <Badge
                      key={tag.id}
                      variant={matchTags.includes(tag.id) ? "default" : "outline"}
                      className={`cursor-pointer ${matchTags.includes(tag.id) ? tag.color : 'hover:bg-white/10'}`}
                      onClick={() => toggleMatchTag(tag.id)}
                    >
                      {tag.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Key Stats */}
                <div>
                  <Label className="text-white font-medium">Possession (%)</Label>
                  <MobileNumberInput
                    label=""
                    value={teamStats.possession}
                    onChange={(value) => setTeamStats(prev => ({ ...prev, possession: value }))}
                    min={0}
                    max={100}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-white font-medium">Total Shots</Label>
                  <MobileNumberInput
                    label=""
                    value={teamStats.shots}
                    onChange={(value) => setTeamStats(prev => ({ ...prev, shots: value }))}
                    min={0}
                    max={50}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-white font-medium">Shots on Target</Label>
                  <MobileNumberInput
                    label=""
                    value={teamStats.shotsOnTarget}
                    onChange={(value) => setTeamStats(prev => ({ ...prev, shotsOnTarget: value }))}
                    min={0}
                    max={50}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-white font-medium">Expected Goals (xG)</Label>
                  <MobileNumberInput
                    label=""
                    value={teamStats.expectedGoals}
                    onChange={(value) => setTeamStats(prev => ({ ...prev, expectedGoals: value }))}
                    min={0}
                    max={10}
                    step={0.1}
                    decimals={1}
                    className="mt-1"
                  />
                </div>

                {/* Additional Stats */}
                <div>
                  <Label className="text-white font-medium">Total Passes</Label>
                  <MobileNumberInput
                    label=""
                    value={teamStats.passes}
                    onChange={(value) => setTeamStats(prev => ({ ...prev, passes: value }))}
                    min={0}
                    max={1000}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-white font-medium">Pass Accuracy (%)</Label>
                  <MobileNumberInput
                    label=""
                    value={teamStats.passAccuracy}
                    onChange={(value) => setTeamStats(prev => ({ ...prev, passAccuracy: value }))}
                    min={0}
                    max={100}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-white font-medium">Corners</Label>
                  <MobileNumberInput
                    label=""
                    value={teamStats.corners}
                    onChange={(value) => setTeamStats(prev => ({ ...prev, corners: value }))}
                    min={0}
                    max={20}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-white font-medium">Opponent xG (xGa)</Label>
                  <MobileNumberInput
                    label=""
                    value={teamStats.expectedGoalsAgainst}
                    onChange={(value) => setTeamStats(prev => ({ ...prev, expectedGoalsAgainst: value }))}
                    min={0}
                    max={10}
                    step={0.1}
                    decimals={1}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-white font-medium">Fouls Committed</Label>
                  <MobileNumberInput
                    label=""
                    value={teamStats.fouls}
                    onChange={(value) => setTeamStats(prev => ({ ...prev, fouls: value }))}
                    min={0}
                    max={20}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-white font-medium">Yellow Cards</Label>
                  <MobileNumberInput
                    label=""
                    value={teamStats.yellowCards}
                    onChange={(value) => setTeamStats(prev => ({ ...prev, yellowCards: value }))}
                    min={0}
                    max={10}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-white font-medium">Red Cards</Label>
                  <MobileNumberInput
                    label=""
                    value={teamStats.redCards}
                    onChange={(value) => setTeamStats(prev => ({ ...prev, redCards: value }))}
                    min={0}
                    max={5}
                    className="mt-1"
                  />
                </div>
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
                  gameDuration={duration}
                />
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
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
            </div>
          )}

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