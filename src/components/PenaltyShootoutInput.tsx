
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { PenaltyShootout } from '@/types/futChampions';

interface PenaltyShootoutInputProps {
  onPenaltyChange: (penalty: PenaltyShootout | undefined) => void;
  initialPenalty?: PenaltyShootout;
}

const PenaltyShootoutInput = ({ onPenaltyChange, initialPenalty }: PenaltyShootoutInputProps) => {
  const [hasPenalties, setHasPenalties] = useState(!!initialPenalty);
  const [userScore, setUserScore] = useState(initialPenalty?.userScore || 0);
  const [opponentScore, setOpponentScore] = useState(initialPenalty?.opponentScore || 0);

  const handlePenaltyToggle = (enabled: boolean) => {
    setHasPenalties(enabled);
    if (!enabled) {
      onPenaltyChange(undefined);
      setUserScore(0);
      setOpponentScore(0);
    } else {
      const penalty: PenaltyShootout = {
        userScore,
        opponentScore,
        userWon: userScore > opponentScore
      };
      onPenaltyChange(penalty);
    }
  };

  const handleScoreChange = (type: 'user' | 'opponent', value: number) => {
    const newUserScore = type === 'user' ? value : userScore;
    const newOpponentScore = type === 'opponent' ? value : opponentScore;
    
    if (type === 'user') setUserScore(value);
    if (type === 'opponent') setOpponentScore(value);

    if (hasPenalties) {
      const penalty: PenaltyShootout = {
        userScore: newUserScore,
        opponentScore: newOpponentScore,
        userWon: newUserScore > newOpponentScore
      };
      onPenaltyChange(penalty);
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Penalty Shootout</CardTitle>
          <Switch
            checked={hasPenalties}
            onCheckedChange={handlePenaltyToggle}
          />
        </div>
      </CardHeader>
      {hasPenalties && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="user-penalties" className="text-white">Your Score</Label>
              <Input
                id="user-penalties"
                type="number"
                min="0"
                max="20"
                value={userScore}
                onChange={(e) => handleScoreChange('user', parseInt(e.target.value) || 0)}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="opponent-penalties" className="text-white">Opponent Score</Label>
              <Input
                id="opponent-penalties"
                type="number"
                min="0"
                max="20"
                value={opponentScore}
                onChange={(e) => handleScoreChange('opponent', parseInt(e.target.value) || 0)}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>
          {userScore !== opponentScore && (
            <div className="text-center">
              <span className={`text-sm font-medium ${userScore > opponentScore ? 'text-green-400' : 'text-red-400'}`}>
                {userScore > opponentScore ? 'You won the shootout!' : 'You lost the shootout'}
              </span>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default PenaltyShootoutInput;
