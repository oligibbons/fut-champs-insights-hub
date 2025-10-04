import { WeeklyPerformance } from '@/types/futChampions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, Target, Users } from 'lucide-react';
import CPSGauge from './CPSGauge';

interface WeekCompletionPopupProps {
  weekData: WeeklyPerformance | null;
  isOpen: boolean;
  onClose: () => void;
  onNewWeek: () => void; // Kept this prop from your original file
}

const WeekCompletionPopup = ({ weekData: week, isOpen, onClose }: WeekCompletionPopupProps) => {
  if (!week) return null;

  const winRate = week.gamesPlayed > 0 ? (week.totalWins / week.gamesPlayed) * 100 : 0;
  
  const getTopScorer = () => {
    const playerGoals: { [name: string]: number } = {};
    week.games.forEach(g => g.playerStats?.forEach(p => {
      playerGoals[p.name] = (playerGoals[p.name] || 0) + p.goals;
    }));
    return Object.entries(playerGoals).sort((a, b) => b[1] - a[1])[0] || ['N/A', 0];
  };

  const getTopPlaymaker = () => {
    const playerAssists: { [name: string]: number } = {};
    week.games.forEach(g => g.playerStats?.forEach(p => {
      playerAssists[p.name] = (playerAssists[p.name] || 0) + p.assists;
    }));
    return Object.entries(playerAssists).sort((a, b) => b[1] - a[1])[0] || ['N/A', 0];
  };

  const topScorer = getTopScorer();
  const topPlaymaker = getTopPlaymaker();

  const StatItem = ({ label, value }: { label: string, value: string | number }) => (
    <div className="flex justify-between items-center py-2 border-b border-border/50">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-bold text-lg">{value}</p>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-secondary border-border">
        <DialogHeader>
          <DialogTitle className="flex flex-col items-center text-center">
            <Trophy className="h-12 w-12 mb-2 text-primary" />
            <span className="text-2xl font-bold">Weekend League Report</span>
            <span className="text-muted-foreground">{week.customName || `Week ${week.weekNumber}`}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="flex flex-col items-center justify-center space-y-2 p-4 bg-background/50 rounded-lg">
            <h3 className="font-semibold text-muted-foreground">Final Record</h3>
            <p className="text-5xl font-bold text-primary">{week.totalWins} <span className="text-3xl text-muted-foreground"> - </span> {week.totalLosses}</p>
            <p className="text-muted-foreground">{winRate.toFixed(1)}% Win Rate</p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 bg-background/50 rounded-lg">
             <h3 className="font-semibold mb-2 text-muted-foreground">Champs Player Score</h3>
             <CPSGauge games={week.games} size={120} />
          </div>
        </div>
        <div className="space-y-2 bg-background/50 p-4 rounded-lg">
            <StatItem label="Avg. Goals For / Game" value={(week.totalGoals / week.gamesPlayed).toFixed(2)} />
            <StatItem label="Avg. Goals Against / Game" value={(week.totalConceded / week.gamesPlayed).toFixed(2)} />
        </div>
         <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-3 rounded-lg bg-background/50 text-center">
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-2"><Target className="h-4 w-4"/>Top Scorer</p>
                <p className="font-bold text-lg text-primary mt-1">{topScorer[0]}</p>
                <p className="text-xs text-muted-foreground">{topScorer[1]} Goals</p>
            </div>
             <div className="p-3 rounded-lg bg-background/50 text-center">
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-2"><Users className="h-4 w-4"/>Top Playmaker</p>
                <p className="font-bold text-lg text-primary mt-1">{topPlaymaker[0]}</p>
                <p className="text-xs text-muted-foreground">{topPlaymaker[1]} Assists</p>
            </div>
        </div>
        <DialogFooter className="mt-6">
          <Button onClick={onClose} className="w-full">Return to Dashboard</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WeekCompletionPopup;
