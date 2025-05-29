
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useTheme } from '@/hooks/useTheme';
import { WeeklyPerformance } from '@/types/futChampions';
import { Edit3, Calendar, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WeekNamingProps {
  weekData: WeeklyPerformance;
  onUpdateWeek: (updates: Partial<WeeklyPerformance>) => void;
}

const WeekNaming = ({ weekData, onUpdateWeek }: WeekNamingProps) => {
  const { currentTheme } = useTheme();
  const { toast } = useToast();
  const [customName, setCustomName] = useState(weekData.customName || '');
  const [isOpen, setIsOpen] = useState(false);

  const handleSaveWeekName = () => {
    onUpdateWeek({ customName });
    setIsOpen(false);
    toast({
      title: "Week Name Updated",
      description: `Week renamed to "${customName || `Week ${weekData.weekNumber}`}"`,
    });
  };

  const displayName = weekData.customName || `Week ${weekData.weekNumber}`;

  return (
    <Card style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between" style={{ color: currentTheme.colors.text }}>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" style={{ color: currentTheme.colors.primary }} />
            {displayName}
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" style={{ borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}>
                <Edit3 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}>
              <DialogHeader>
                <DialogTitle style={{ color: currentTheme.colors.text }}>Rename Week</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label style={{ color: currentTheme.colors.text }}>Week Name</Label>
                  <Input
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder={`Week ${weekData.weekNumber}`}
                    style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}
                  />
                </div>
                <Button onClick={handleSaveWeekName} className="w-full" style={{ backgroundColor: currentTheme.colors.primary, color: '#ffffff' }}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Name
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
    </Card>
  );
};

export default WeekNaming;
