// src/components/WeekCompletionPopup.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
// ** Use reconciled types **
import { WeeklyPerformance, ProcessedWeeklyPerformance, PlayerPerformance } from "@/types/futChampions";
import { Trophy, Target, Users, Bot } from 'lucide-react'; // Added Bot
import CPSGauge from './CPSGauge'; // Assuming this component exists and works
import { useTheme } from "@/hooks/useTheme";

interface WeekCompletionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  runData: WeeklyPerformance | ProcessedWeeklyPerformance | null; // Use reconciled types
  // onNewWeek?: () => void; // Keep if needed
}

const WeekCompletionPopup = ({ isOpen, onClose, runData }: WeekCompletionPopupProps) => {
    const { currentTheme } = useTheme();

    if (!runData) return null;

    // Use games array length if available, otherwise fallback to DB totals
    const gamesPlayed = runData.games?.length ?? (runData.total_wins ?? 0) + (runData.total_losses ?? 0);
    const totalWins = runData.total_wins ?? 0;
    const totalLosses = runData.total_losses ?? 0;
    const winRate = gamesPlayed > 0 ? (totalWins / gamesPlayed) * 100 : 0;

    // Check if we have processed data
    const isProcessed = 'averagePossession' in runData;
    const displayData = runData as ProcessedWeeklyPerformance; // Cast for easier access

    const getTopPlayerStat = (stat: keyof PlayerPerformance) => {
        const playerStats: { [name: string]: number } = {};
        runData.games?.forEach(g => g.player_performances?.forEach(p => {
             const value = p[stat] as number | undefined; // Cast to number
             if (typeof value === 'number') {
                playerStats[p.player_name] = (playerStats[p.player_name] || 0) + value;
             }
        }));
        return Object.entries(playerStats).sort((a, b) => b[1] - a[1])[0] || ['N/A', 0];
    };

    const topScorer = getTopPlayerStat('goals');
    const topPlaymaker = getTopPlayerStat('assists');

    const StatItem = ({ label, value }: { label: string, value?: string | number }) => {
        if (value === undefined || value === null || value === 'N/A') return null; // Don't render if no value
        return (
           <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-b-0">
             <p className="text-sm text-muted-foreground">{label}</p>
             <p className="font-bold text-lg text-white">{value}</p>
           </div>
        );
    };


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg glass-card border-border/20 text-white">
            <DialogHeader>
            <DialogTitle className="flex flex-col items-center text-center">
                 <Trophy className="h-12 w-12 mb-2 text-primary" />
                 <span className="text-2xl font-bold">Weekend League Report</span>
                 <span className="text-muted-foreground">{runData.custom_name || `Week ${runData.week_number}`}</span>
            </DialogTitle>
            {/* Removed redundant description */}
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                 <div className="flex flex-col items-center justify-center space-y-1 p-4 bg-background/50 rounded-lg">
                     <h3 className="font-semibold text-muted-foreground text-sm">Final Record</h3>
                     <p className="text-4xl font-bold text-primary">{totalWins} <span className="text-2xl text-muted-foreground"> - </span> {totalLosses}</p>
                     <p className="text-xs text-muted-foreground">{winRate.toFixed(0)}% Win Rate</p>
                 </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-background/50 rounded-lg">
                      <h3 className="font-semibold mb-2 text-muted-foreground text-sm">Champs Player Score</h3>
                      {/* Assuming CPSGauge takes games array */}
                      <CPSGauge games={runData.games ?? []} size={100} />
                  </div>
            </div>

            <div className="space-y-1 bg-background/50 p-4 rounded-lg mb-4">
                 <StatItem label="Games Played" value={gamesPlayed} />
                 {/* Use calculated averages from Processed data if available */}
                 {isProcessed ? (
                    <>
                       <StatItem label="Avg. Goals For / Game" value={displayData.games && displayData.games.length > 0 ? (displayData.total_goals ?? 0 / displayData.games.length).toFixed(1) : 'N/A'} />
                       <StatItem label="Avg. Goals Against / Game" value={displayData.games && displayData.games.length > 0 ? (displayData.total_conceded ?? 0 / displayData.games.length).toFixed(1) : 'N/A'} />
                       <StatItem label="Avg. Possession" value={displayData.averagePossession?.toFixed(0) + '%'} />
                       <StatItem label="Avg. Pass Accuracy" value={displayData.averagePassAccuracy?.toFixed(0) + '%'} />
                       <StatItem label="Avg. Dribble Success" value={displayData.averageDribbleSuccess?.toFixed(0) + '%'} />
                    </>
                 ) : (
                    // Fallback if not processed (less likely now with useAccountData update)
                    <>
                       <StatItem label="Avg. Goals For / Game" value={gamesPlayed > 0 ? ((runData.total_goals ?? 0) / gamesPlayed).toFixed(1) : 'N/A'} />
                       <StatItem label="Avg. Goals Against / Game" value={gamesPlayed > 0 ? ((runData.total_conceded ?? 0) / gamesPlayed).toFixed(1) : 'N/A'} />
                    </>
                 )}


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
            <DialogClose asChild>
                <Button onClick={onClose} className="w-full">Close Report</Button>
            </DialogClose>
            {/* Removed 'Start New Week' button - handle this flow in CurrentRun */}
            </DialogFooter>
        </DialogContent>
        </Dialog>
    );
};

export default WeekCompletionPopup;
