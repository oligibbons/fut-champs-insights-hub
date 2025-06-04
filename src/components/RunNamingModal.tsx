
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit3 } from 'lucide-react';

interface RunNamingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  currentName?: string;
}

const RunNamingModal = ({ isOpen, onClose, onSave, currentName }: RunNamingModalProps) => {
  const [runName, setRunName] = useState(currentName || '');

  const generateDefaultName = () => {
    const now = new Date();
    const month = now.toLocaleString('default', { month: 'long' });
    const year = now.getFullYear();
    const week = Math.ceil(now.getDate() / 7);
    return `${month} ${year} - Week ${week}`;
  };

  const handleSave = () => {
    const finalName = runName.trim() || generateDefaultName();
    onSave(finalName);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Name Your Run
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-white">Run Name</Label>
            <Input
              value={runName}
              onChange={(e) => setRunName(e.target.value)}
              placeholder={generateDefaultName()}
              className="bg-gray-800 border-gray-600 text-white"
            />
            <p className="text-sm text-gray-400 mt-1">
              Leave empty to use default: {generateDefaultName()}
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1 modern-button-primary">
              Save Name
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RunNamingModal;
