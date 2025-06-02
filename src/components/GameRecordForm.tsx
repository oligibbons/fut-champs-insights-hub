import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from "@/components/ui/slider"
import { Calendar } from 'lucide-react';
import { PlayerPerformance } from '@/types/futChampions';
import PlayerStatsForm from './PlayerStatsForm';

interface GameRecordFormProps {
  onSubmit: (data: any) => void;
  gameNumber: number;
  defaultCrossPlay?: boolean;
}

const GameRecordForm = ({ onSubmit, gameNumber, defaultCrossPlay = false }: GameRecordFormProps) => {
  const [crossPlayEnabled, setCrossPlayEnabled] = useState(defaultCrossPlay);
  const [result, setResult] = useState<'win' | 'loss'>('win');
  const [scoreLine, setScoreLine] = useState('0-0');
  const [opponentSkill, setOpponentSkill] = useState('5');
  const [duration, setDuration] = useState('15');
  const [gameContext, setGameContext] = useState('normal');
  const [comments, setComments] = useState('');
  const [shots, setShots] = useState('');
  const [shotsOnTarget, setShotsOnTarget] = useState('');
  const [possession, setPossession] = useState('');
  const [expectedGoals, setExpectedGoals] = useState('');
  const [expectedGoalsAgainst, setExpectedGoalsAgainst] = useState('');
  const [passes, setPasses] = useState('');
  const [passAccuracy, setPassAccuracy] = useState('');
  const [corners, setCorners] = useState('');
  const [fouls, setFouls] = useState('');
  const [playerPerformances, setPlayerPerformances] = useState<PlayerPerformance[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!scoreLine.match(/^\d+-\d+$/)) {
      alert('Score line must be in the format X-Y');
      return;
    }

    if (isNaN(parseInt(opponentSkill)) || parseInt(opponentSkill) < 1 || parseInt(opponentSkill) > 10) {
      alert('Opponent skill must be a number between 1 and 10');
      return;
    }

    if (isNaN(parseInt(duration)) || parseInt(duration) < 1) {
      alert('Duration must be a valid number');
      return;
    }

    const gameData = {
      result: result as 'win' | 'loss',
      scoreLine,
      opponentSkill: parseInt(opponentSkill),
      duration: parseInt(duration),
      gameContext,
      comments,
      crossPlayEnabled,
      teamStats: {
        shots: parseInt(shots) || 0,
        shotsOnTarget: parseInt(shotsOnTarget) || 0,
        possession: parseInt(possession) || 0,
        expectedGoals: parseFloat(expectedGoals) || 0,
        actualGoals: parseInt(scoreLine.split('-')[0]) || 0,
        expectedGoalsAgainst: parseFloat(expectedGoalsAgainst) || 0,
        actualGoalsAgainst: parseInt(scoreLine.split('-')[1]) || 0,
        passes: parseInt(passes) || 0,
        passAccuracy: parseInt(passAccuracy) || 0,
        corners: parseInt(corners) || 0,
        fouls: parseInt(fouls) || 0,
      },
      playerStats: playerPerformances
    };

    onSubmit(gameData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Record Game {gameNumber}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Game Result Section */}
        <Card className="glass-card static-element">
          <CardHeader>
            <CardTitle className="text-white">Game Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="result" className="text-gray-300">Result</Label>
                <Select value={result} onValueChange={(value) => setResult(value as 'win' | 'loss')}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Select result" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600 text-white">
                    <SelectItem value="win" className="text-white">Win</SelectItem>
                    <SelectItem value="loss" className="text-white">Loss</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="scoreLine" className="text-gray-300">Score Line</Label>
                <Input
                  id="scoreLine"
                  type="text"
                  value={scoreLine}
                  onChange={(e) => setScoreLine(e.target.value)}
                  placeholder="e.g., 3-2"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="opponentSkill" className="text-gray-300">Opponent Skill (1-10)</Label>
                <Input
                  id="opponentSkill"
                  type="number"
                  min="1"
                  max="10"
                  value={opponentSkill}
                  onChange={(e) => setOpponentSkill(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="duration" className="text-gray-300">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="gameContext" className="text-gray-300">Game Context</Label>
              <Select value={gameContext} onValueChange={setGameContext}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Select context" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600 text-white">
                  <SelectItem value="normal" className="text-white">Normal</SelectItem>
                  <SelectItem value="rage_quit" className="text-white">Rage Quit</SelectItem>
                  <SelectItem value="extra_time" className="text-white">Extra Time</SelectItem>
                  <SelectItem value="penalties" className="text-white">Penalties</SelectItem>
                  <SelectItem value="disconnect" className="text-white">Disconnect</SelectItem>
                  <SelectItem value="hacker" className="text-white">Hacker</SelectItem>
                  <SelectItem value="free_win" className="text-white">Free Win</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Cross-Play Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="crossPlay" className="text-gray-300">Cross-Play Enabled</Label>
                <p className="text-sm text-gray-500">Was cross-platform play enabled for this match?</p>
              </div>
              <Switch
                id="crossPlay"
                checked={crossPlayEnabled}
                onCheckedChange={setCrossPlayEnabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* Team Stats Section */}
        <Card className="glass-card static-element">
          <CardHeader>
            <CardTitle className="text-white">Team Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="shots" className="text-gray-300">Shots</Label>
                <Input
                  id="shots"
                  type="number"
                  value={shots}
                  onChange={(e) => setShots(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="shotsOnTarget" className="text-gray-300">Shots on Target</Label>
                <Input
                  id="shotsOnTarget"
                  type="number"
                  value={shotsOnTarget}
                  onChange={(e) => setShotsOnTarget(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="possession" className="text-gray-300">Possession (%)</Label>
                <Input
                  id="possession"
                  type="number"
                  value={possession}
                  onChange={(e) => setPossession(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="expectedGoals" className="text-gray-300">Expected Goals (xG)</Label>
                <Input
                  id="expectedGoals"
                  type="number"
                  step="0.1"
                  value={expectedGoals}
                  onChange={(e) => setExpectedGoals(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="expectedGoalsAgainst" className="text-gray-300">Expected Goals Against (xGA)</Label>
                <Input
                  id="expectedGoalsAgainst"
                  type="number"
                  step="0.1"
                  value={expectedGoalsAgainst}
                  onChange={(e) => setExpectedGoalsAgainst(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="passes" className="text-gray-300">Passes</Label>
                <Input
                  id="passes"
                  type="number"
                  value={passes}
                  onChange={(e) => setPasses(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="passAccuracy" className="text-gray-300">Pass Accuracy (%)</Label>
                <Input
                  id="passAccuracy"
                  type="number"
                  value={passAccuracy}
                  onChange={(e) => setPassAccuracy(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="corners" className="text-gray-300">Corners</Label>
                <Input
                  id="corners"
                  type="number"
                  value={corners}
                  onChange={(e) => setCorners(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="fouls" className="text-gray-300">Fouls</Label>
                <Input
                  id="fouls"
                  type="number"
                  value={fouls}
                  onChange={(e) => setFouls(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Player Stats Section */}
        <Card className="glass-card static-element">
            <CardHeader>
              <CardTitle className="text-white">Player Performances</CardTitle>
            </CardHeader>
            <CardContent>
              <PlayerStatsForm playerPerformances={playerPerformances} setPlayerPerformances={setPlayerPerformances} />
            </CardContent>
        </Card>

        {/* Additional Comments Section */}
        <Card className="glass-card static-element">
          <CardHeader>
            <CardTitle className="text-white">Additional Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="comments" className="text-gray-300">Comments</Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Any additional notes about the game?"
              className="bg-gray-800 border-gray-600 text-white resize-none"
            />
          </CardContent>
        </Card>

        <Button type="submit" className="modern-button-primary">
          Record Game
        </Button>
      </form>
    </div>
  );
};

export default GameRecordForm;
