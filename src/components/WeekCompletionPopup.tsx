import React, { useState } from 'react'; // Import useState
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog'; //
import { Button } from '@/components/ui/button'; //
import { WeeklyPerformance, PlayerPerformance } from '@/types/futChampions'; // Adjusted types
import { Trophy, Target, Users, Share } from 'lucide-react'; // Added Share icon
import CPSGauge from './CPSGauge'; //
import { useTheme } from '@/hooks/useTheme'; //
import ShareableCardGenerator from './ShareableCardGenerator'; // Import the new component

interface WeekCompletionPopupProps {
  runData: WeeklyPerformance | null; // Using WeeklyPerformance directly
  isOpen: boolean;
  onClose: () => void;
}

const WeekCompletionPopup = ({ runData: week, isOpen, onClose }: WeekCompletionPopupProps) => {
    const { currentTheme } = useTheme();
    const [showShareModal, setShowShareModal] = useState(false); // State for the generator modal

    if (!week) return null;

    // Calculations remain the same as your provided code
    const games = week.games ?? [];
    const gamesPlayed = games.length;
    const totalWins = week.total_wins ?? games.filter(g => g.result === 'win').length;
    const totalLosses = gamesPlayed - totalWins;
    const totalGoals = week.total_goals ?? games.reduce((sum, g) => sum + (g.user_goals ?? 0), 0);
    const totalConceded = week.total_conceded ?? games.reduce((sum, g) => sum + (g.opponent_goals ?? 0), 0);
    const winRate = gamesPlayed > 0 ? (totalWins / gamesPlayed) * 100 : 0;

    // Simplified top player logic (assumes player_name is reliable)
    const getTopPlayerStat = (stat: keyof PlayerPerformance) => {
        const playerStats: { [name: string]: number } = {};
        games.forEach(g => (g.player_performances ?? []).forEach(p => {
             const value = p[stat] as number | undefined;
             if (p && typeof value === 'number') {
                playerStats[p.player_name] = (playerStats[p.player_name] || 0) + value;
             }
        }));
        return Object.entries(playerStats).sort((a, b) => b[1] - a[1])[0] || ['N/A', 0];
    };
    const topScorer = getTopPlayerStat('goals');
    const topPlaymaker = getTopPlayerStat('assists');

    const StatItem = ({ label, value }: { label: string, value?: string | number | null }) => {
        if (value === null || value === undefined || value === 'N/A' || Number.isNaN(value)) return null;
        return (
           <div className="flex justify-between items-center py-2 border-b border-border/20 last:border-b-0">
               <p className="text-sm text-muted-foreground">{label}</p>
               <p className="font-bold text-base sm:text-lg text-white">
                 {typeof value === 'number' ? value.toFixed(value % 1 === 0 ? 0 : 1) : value}
               </p>
           </div>
        );
    };

  return (
    <> {/* Use Fragment to return multiple elements */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg glass-card border-border/20 text-white">
          <DialogHeader>
            <DialogTitle className="flex flex-col items-center text-center">
              <Trophy className="h-10 w-10 sm:h-12 sm:w-12 mb-2 text-primary" />
              <span className="text-xl sm:text-2xl font-bold">Weekend League Report</span>
              <span className="text-sm sm:text-base text-muted-foreground">{week.custom_name || `Week ${week.week_number}`}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {/* Final Record */}
            <div className="flex flex-col items-center justify-center space-y-1 p-4 bg-background/50 rounded-lg">
              <h3 className="font-semibold text-muted-foreground text-sm">Final Record</h3>
              <p className="text-3xl sm:text-4xl font-bold text-primary">{totalWins} <span className="text-xl sm:text-2xl text-muted-foreground"> - </span> {totalLosses}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">{winRate.toFixed(0)}% Win Rate</p>
            </div>
            {/* CPS Gauge */}
            <div className="flex flex-col items-center justify-center p-4 bg-background/50 rounded-lg">
                <h3 className="font-semibold mb-2 text-muted-foreground text-sm">Champs Player Score</h3>
                <CPSGauge games={games} size={100} />
            </div>
          </div>
          {/* Stats List */}
          <div className="space-y-1 bg-background/50 p-4 rounded-lg mb-4">
              <StatItem label="Games Played" value={gamesPlayed} />
              <StatItem label="Avg. Goals For" value={gamesPlayed > 0 ? (totalGoals / gamesPlayed) : 0} />
              <StatItem label="Avg. Goals Against" value={gamesPlayed > 0 ? (totalConceded / gamesPlayed) : 0} />
              {/* Add more key average stats if calculated */}
          </div>
          {/* Top Performers */}
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
          <DialogFooter className="mt-6 sm:flex-col sm:space-y-2"> {/* Stack buttons on small screens */}
            {/* --- Add Share Button --- */}
            <Button onClick={() => setShowShareModal(true)} variant="outline" className="w-full">
                <Share className="h-4 w-4 mr-2" /> Create Share Card
            </Button>
            {/* Close Button */}
            <DialogClose asChild>
               <Button onClick={onClose} className="w-full">Close Report</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Render the Shareable Card Generator Modal --- */}
      <ShareableCardGenerator
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        runData={week} // Pass the run data
      />
    </>
  );
};

export default WeekCompletionPopup;
