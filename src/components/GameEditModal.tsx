import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GameResult, PlayerPerformance, TeamStats } from '@/types/futChampions';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';

interface GameEditModalProps {
  game: GameResult | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedGame: GameResult) => void;
}

const GameEditModal = ({ game, isOpen, onClose, onSave }: GameEditModalProps) => {
  const { toast } = useToast();
  const [userGoals, setUserGoals] = useState('');
  const [opponentGoals, setOpponentGoals] = useState('');
  const [result, setResult] = useState<'win' | 'loss'>('win');
  const [opponentSkill, setOpponentSkill] = useState<number | string>(5);
  const [duration, setDuration] = useState<number | string>(90);
  const [opponentXG, setOpponentXG] = useState<number | string>(1.0);

  useEffect(() => {
    if (game) {
      const [userG, oppG] = game.scoreLine.split('-').map(Number);
      setUserGoals(userG.toString());
      setOpponentGoals(oppG.toString());
      setResult(game.result);
      setOpponentSkill(game.opponentSkill);
      setDuration(game.duration);
      setOpponentXG(game.teamStats?.expectedGoalsAgainst || 1.0);
    }
  }, [game]);

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

  const handleXGChange = (value: string) => {
    if (value === '' || !isNaN(parseFloat(value))) {
      setOpponentXG(value === '' ? '' : parseFloat(value));
    }
  };

  const handleSave = () => {
    if (!game) return;

    // Validate and convert empty strings to defaults
    const finalUserGoals = userGoals === '' ? 0 : parseInt(userGoals);
    const finalOpponentGoals = opponentGoals === '' ? 0 : parseInt(opponentGoals);
    const finalOpponentSkill = opponentSkill === '' ? 5 : opponentSkill;
    const finalDuration = duration === '' ? 90 : duration;
    const finalOpponentXG = opponentXG === '' ? 1.0 : opponentXG;

    const updatedGame: GameResult = {
      ...game,
      scoreLine: `${finalUserGoals}-${finalOpponentGoals}`,
      result,
      opponentSkill: finalOpponentSkill as number,
      duration: finalDuration as number,
      teamStats: {
        ...game.teamStats,
        expectedGoalsAgainst: finalOpponentXG as number,
        actualGoals: finalUserGoals,
        actualGoalsAgainst: finalOpponentGoals
      }
    };

    onSave(updatedGame);
    toast({
      title: "Game Updated",
      description: "Your game has been successfully updated.",
    });
    onClose();
  };

  if (!game) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Game {game.gameNumber}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Your Goals</Label>
              <Input
                type="text"
                inputMode="numeric"
                value={userGoals}
                onChange={(e) => handleInputChange('userGoals', e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="0"
              />
            </div>
            <div>
              <Label className="text-white">Opponent Goals</Label>
              <Input
                type="text"
                inputMode="numeric"
                value={opponentGoals}
                onChange={(e) => handleInputChange('opponentGoals', e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <Label className="text-white">Result</Label>
            <Select value={result} onValueChange={(value: 'win' | 'loss') => setResult(value)}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="win">Win</SelectItem>
                <SelectItem value="loss">Loss</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-white">Opponent Skill (1-10)</Label>
            <Input
              type="text"
              inputMode="numeric"
              value={opponentSkill === '' ? '' : opponentSkill}
              onChange={(e) => handleInputChange('opponentSkill', e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
              placeholder="5"
            />
          </div>

          <div>
            <Label className="text-white">Game Duration (minutes)</Label>
            <Input
              type="text"
              inputMode="numeric"
              value={duration === '' ? '' : duration}
              onChange={(e) => handleInputChange('duration', e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
              placeholder="90"
            />
          </div>

          <div>
            <Label className="text-white">Opponent Expected Goals (XGa)</Label>
            <Input
              type="text"
              inputMode="decimal"
              value={opponentXG === '' ? '' : opponentXG}
              onChange={(e) => handleXGChange(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
              placeholder="1.0"
            />
          </div>

          <Button onClick={handleSave} className="w-full modern-button-primary">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GameEditModal;