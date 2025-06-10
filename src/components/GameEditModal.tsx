import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GameResult, PlayerPerformance, TeamStats } from '@/types/futChampions';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';
import MobileNumberInput from './MobileNumberInput';

interface GameEditModalProps {
  game: GameResult | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedGame: GameResult) => void;
}

const GameEditModal = ({ game, isOpen, onClose, onSave }: GameEditModalProps) => {
  const { toast } = useToast();
  const [userGoals, setUserGoals] = useState<number | null>(null);
  const [opponentGoals, setOpponentGoals] = useState<number | null>(null);
  const [result, setResult] = useState<'win' | 'loss'>('win');
  const [opponentSkill, setOpponentSkill] = useState(5);
  const [duration, setDuration] = useState(90);
  const [opponentXG, setOpponentXG] = useState(1.0);

  useEffect(() => {
    if (game) {
      const [userG, oppG] = game.scoreLine.split('-').map(Number);
      setUserGoals(userG);
      setOpponentGoals(oppG);
      setResult(game.result);
      setOpponentSkill(game.opponentSkill);
      setDuration(game.duration);
      setOpponentXG(game.teamStats?.expectedGoalsAgainst || 1.0);
    }
  }, [game]);

  const handleSave = () => {
    if (!game || userGoals === null || opponentGoals === null) return;

    const updatedGame: GameResult = {
      ...game,
      scoreLine: `${userGoals}-${opponentGoals}`,
      result,
      opponentSkill,
      duration,
      teamStats: {
        ...game.teamStats,
        expectedGoalsAgainst: opponentXG,
        actualGoals: userGoals,
        actualGoalsAgainst: opponentGoals
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
              <MobileNumberInput
                label=""
                value={userGoals ?? 0}
                onChange={setUserGoals}
                min={0}
                max={20}
                placeholder="0"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-white">Opponent Goals</Label>
              <MobileNumberInput
                label=""
                value={opponentGoals ?? 0}
                onChange={setOpponentGoals}
                min={0}
                max={20}
                placeholder="0"
                className="mt-1"
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
            <MobileNumberInput
              label=""
              value={opponentSkill}
              onChange={setOpponentSkill}
              min={1}
              max={10}
              placeholder="5"
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-white">Game Duration (minutes)</Label>
            <MobileNumberInput
              label=""
              value={duration}
              onChange={setDuration}
              min={1}
              max={120}
              placeholder="90"
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-white">Opponent Expected Goals (XGa)</Label>
            <MobileNumberInput
              label=""
              value={opponentXG}
              onChange={setOpponentXG}
              min={0}
              max={10}
              step={0.1}
              placeholder="1.0"
              className="mt-1"
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