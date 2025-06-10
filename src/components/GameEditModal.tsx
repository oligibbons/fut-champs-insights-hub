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
import { Badge } from './ui/badge';

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
  const [matchTags, setMatchTags] = useState<string[]>([]);

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

  useEffect(() => {
    if (game) {
      const [userG, oppG] = game.scoreLine.split('-').map(Number);
      setUserGoals(userG);
      setOpponentGoals(oppG);
      setResult(game.result);
      setOpponentSkill(game.opponentSkill);
      setDuration(game.duration);
      setOpponentXG(game.teamStats?.expectedGoalsAgainst || 1.0);
      setMatchTags(game.tags || []);
    }
  }, [game]);

  const toggleMatchTag = (tagId: string) => {
    setMatchTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId) 
        : [...prev, tagId]
    );
  };

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
      },
      tags: matchTags
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
              decimals={1}
              placeholder="1.0"
              className="mt-1"
            />
          </div>

          {/* Match Tags */}
          <div>
            <Label className="text-white mb-2 block">Match Tags</Label>
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