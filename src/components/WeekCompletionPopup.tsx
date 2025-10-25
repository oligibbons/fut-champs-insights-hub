// src/components/WeekCompletionPopup.tsx (User's Provided Version)
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog'; // Added DialogClose
import { Button } from '@/components/ui/button';
// ** Use reconciled types **
import { WeeklyPerformance, ProcessedWeeklyPerformance, PlayerPerformance, Game } from '@/types/futChampions';
import { Trophy, Target, Users } from 'lucide-react';
import CPSGauge from './CPSGauge'; // Assuming this component exists and works
import { useTheme } from '@/hooks/useTheme'; // Added useTheme import

interface WeekCompletionPopupProps {
  // ** Updated prop name to runData as passed from CurrentRun **
  runData: WeeklyPerformance | ProcessedWeeklyPerformance | null;
  isOpen: boolean;
  onClose: () => void;
  // onNewWeek?: () => void; // Keep if needed, CurrentRun doesn't pass it currently
}

const WeekCompletionPopup = ({ runData: week, isOpen, onClose }: WeekCompletionPopupProps) => {
    const { currentTheme } = useTheme(); // Use theme
    if (!week) return null;

    // Use games array length if available, otherwise fallback
    const gamesPlayed = week.games?.length ?? (week.total_wins ?? 0) + (week.total_losses ?? 0);
    const totalWins = week.total_wins ?? 0;
    const totalLosses = week.total_losses ?? 0;
    const totalGoals = week.total_goals ?? 0;
    const totalConceded = week.total_conceded ?? 0;
    const winRate = gamesPlayed > 0 ? (totalWins / gamesPlayed) * 100 : 0;

     // Type guard for ProcessedWeeklyPerformance specific fields
    const isProcessed = 'averagePossession' in week;
    const displayData = week as ProcessedWeeklyPerformance;

    const getTopPlayerStat = (stat: keyof PlayerPerformance) => {
        const playerStats: { [name: string]: number } = {};
         // Ensure games and player_performances are arrays
         (week.games ?? []).forEach(g => (g.player_performances ?? []).forEach(p => {
             const value = p[stat] as number | undefined;
             if (typeof value === 'number') {
                playerStats[p.player_name] = (playerStats[p.player_name] || 0) + value;
             }
        }));
        return Object.entries(playerStats).sort((a, b) => b[1] - a[1])[0] || ['N/A', 0];
    };


    const topScorer = getTopPlayerStat('goals');
    const topPlaymaker = getTopPlayerStat('assists');

    const StatItem = ({ label, value }: { label: string, value?: string | number | null }) => {
        // Render nothing if value is null, undefined, or 'N/A'
        if (value === null || value === undefined || value === 'N/A') {
            return null;
        }
        return (
           <div className="flex justify-between items-center py-2 border-b border-border/20 last:border-b-0">
               <p className="text-sm text-muted-foreground">{label}</p>
               <p className="font-bold text-base sm:text-lg text-white">{value}</p> {/* Use text-white */}
           </div>
        );
    };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Use glass-card style */}
      <DialogContent className="sm:max-w-lg glass-card border-border/20 text-white">
        <DialogHeader>
          <DialogTitle className="flex flex-col items-center text-center">
            <Trophy className="h-10 w-10 sm:h-12 sm:w-12 mb-2 text-primary" />
            <span className="text-xl sm:text-2xl font-bold">Weekend League Report</span>
            <span className="text-sm sm:text-base text-muted-foreground">{week.custom_name || `Week ${week.week_number}`}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="flex flex-col items-center justify-center space-y-1 p-4 bg-background/50 rounded-lg">
            <h3 className="font-semibold text-muted-foreground text-sm">Final Record</h3>
            <p className="text-3xl sm:text-4xl font-bold text-primary">{totalWins} <span className="text-xl sm:text-2xl text-muted-foreground"> - </span> {totalLosses}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">{winRate.toFixed(0)}% Win Rate</p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 bg-background/50 rounded-lg">
              <h3 className="font-semibold mb-2 text-muted-foreground text-sm">Champs Player Score</h3>
              <CPSGauge games={week.games ?? []} size={100} /> {/* Adjust size as needed */}
          </div>
        </div>
        <div className="space-y-1 bg-background/50 p-4 rounded-lg mb-4">
            <StatItem label="Games Played" value={gamesPlayed} />
            <StatItem label="Avg. Goals For" value={gamesPlayed > 0 ? (totalGoals / gamesPlayed).toFixed(1) : '0.0'} />
            <StatItem label="Avg. Goals Against" value={gamesPlayed > 0 ? (totalConceded / gamesPlayed).toFixed(1) : '0.0'} />
            {/* Display Processed Stats if available */}
            {isProcessed && <StatItem label="Avg. Possession" value={displayData.averagePossession?.toFixed(0) + '%'} />}
            {isProcessed && <StatItem label="Avg. Pass Accuracy" value={displayData.averagePassAccuracy?.toFixed(0) + '%'} />}
            {isProcessed && <StatItem label="Avg. Dribble Success" value={displayData.averageDribbleSuccess?.toFixed(0) + '%'} />}
        </div>
         <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-background/50 text-center">
                   <p className="text-sm text-muted-foreground flex items-center justify-center gap-1"><Target className="h-4 w-4"/>Top Scorer</p>
                   <p className="font-bold text-base text-primary mt-1 truncate">{topScorer[0]}</p>
                   <p className="text-xs text-muted-foreground">{topScorer[1]} Goals</p>
              </div>
               <div className="p-3 rounded-lg bg-background/50 text-center">
                   <p className="text-sm text-muted-foreground flex items-center justify-center gap-1"><Users className="h-4 w-4"/>Top Playmaker</p>
                   <p className="font-bold text-base text-primary mt-1 truncate">{topPlaymaker[0]}</p>
                   <p className="text-xs text-muted-foreground">{topPlaymaker[1]} Assists</p>
               </div>
         </div>
        <DialogFooter className="mt-6">
          {/* Use DialogClose for the button */}
          <DialogClose asChild>
             <Button onClick={onClose} className="w-full">Close Report</Button>
          </DialogClose>
          {/* Removed 'Start New Week' button */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WeekCompletionPopup;
