
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
  const [opponentSkill, setOpponentSkill] = useState<number>(5);
  const [duration, setDuration] = useState<number>(90);
  const [opponentXG, setOpponentXG] = useState<number>(1.0);

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

  const handleSave = () => {
    if (!game) return;

    const updatedGame: GameResult = {
      ...game,
      scoreLine: `${userGoals}-${opponentGoals}`,
      result,
      opponentSkill,
      duration,
      teamStats: {
        ...game.teamStats,
        expectedGoalsAgainst: opponentXG,
        actualGoals: parseInt(userGoals),
        actualGoalsAgainst: parseInt(opponentGoals)
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
      <DialogContent className="bg-gray-900 border-gray-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Game {game.gameNumber}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Your Goals</Label>
              <Input
                type="number"
                min="0"
                value={userGoals}
                onChange={(e) => setUserGoals(e.target.value)}
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
                className="bg-gray-800 border-gray-600 text-white"
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

          <div>
            <Label className="text-white">Opponent Expected Goals (XGa)</Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              value={opponentXG}
              onChange={(e) => setOpponentXG(parseFloat(e.target.value))}
              className="bg-gray-800 border-gray-600 text-white"
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
