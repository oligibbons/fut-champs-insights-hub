
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WeeklyTarget } from '@/types/futChampions';
import { Target } from 'lucide-react';

interface TargetEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (target: WeeklyTarget) => void;
  currentTarget?: WeeklyTarget;
}

const TargetEditModal = ({ isOpen, onClose, onSave, currentTarget }: TargetEditModalProps) => {
  const [wins, setWins] = useState(10);
  const [goalsScored, setGoalsScored] = useState<number | undefined>();
  const [cleanSheets, setCleanSheets] = useState<number | undefined>();
  const [minimumRank, setMinimumRank] = useState('');

  useEffect(() => {
    if (currentTarget) {
      setWins(currentTarget.wins);
      setGoalsScored(currentTarget.goalsScored);
      setCleanSheets(currentTarget.cleanSheets);
      setMinimumRank(currentTarget.minimumRank || '');
    }
  }, [currentTarget]);

  const handleSave = () => {
    const target: WeeklyTarget = {
      wins,
      goalsScored,
      cleanSheets,
      minimumRank: minimumRank || undefined
    };
    onSave(target);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5" />
            Edit Targets
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-white">Target Wins</Label>
            <Input
              type="number"
              min="0"
              max="15"
              value={wins}
              onChange={(e) => setWins(parseInt(e.target.value))}
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>

          <div>
            <Label className="text-white">Target Goals (Optional)</Label>
            <Input
              type="number"
              min="0"
              value={goalsScored || ''}
              onChange={(e) => setGoalsScored(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="No target set"
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>

          <div>
            <Label className="text-white">Clean Sheets Target (Optional)</Label>
            <Input
              type="number"
              min="0"
              value={cleanSheets || ''}
              onChange={(e) => setCleanSheets(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="No target set"
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>

          <div>
            <Label className="text-white">Minimum Rank (Optional)</Label>
            <Input
              value={minimumRank}
              onChange={(e) => setMinimumRank(e.target.value)}
              placeholder="e.g., Rank V"
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1 modern-button-primary">
              Save Targets
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TargetEditModal;
