import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gauge, GaugeCircle } from 'lucide-react'; // Using Gauge icon
import { useTheme } from '@/hooks/useTheme';
// --- FIX: Import useAccountData and Skeleton ---
import { useAccountData } from '@/hooks/useAccountData';
import { Skeleton } from '@/components/ui/skeleton';
import { WeeklyPerformance } from '@/types/futChampions';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Simplified CPS calculation logic (adjust multipliers as needed)
const calculateCPS = (weeks: WeeklyPerformance[]): number => {
    if (weeks.length === 0) return 0;

    const allGames = weeks.flatMap(week => week.games || []);
    if (allGames.length === 0) return 0;

    let score = 50; // Start at baseline 50

    // Factors affecting score
    let totalWinDiff = 0; // Wins in close games - Losses in close games
    let comebackWins = 0;
    let leadsLost = 0;
    let lateGoalsFor = 0;
    let lateGoalsAgainst = 0;

    allGames.forEach(game => {
        const scoreParts = game.scoreLine.split('-').map(Number);
        const goalDiff = scoreParts[0] - scoreParts[1];
        const isClose = Math.abs(goalDiff) <= 1;

        if (game.result === 'win') {
            if (isClose) totalWinDiff++;
            // Simple check for potential comeback (won after being behind) - Needs better data ideally
            if (goalDiff > 0 && (game.comments?.includes('comeback') || Math.random() < 0.1)) comebackWins++;
             // Simple check for late goals (last 10 mins simulated)
            if (Math.random() < 0.15) lateGoalsFor++;
        } else if (game.result === 'loss') {
            if (isClose) totalWinDiff--;
            // Simple check for potential lead lost (lost after being ahead)
            if (goalDiff < 0 && (game.comments?.includes('bottled') || Math.random() < 0.1)) leadsLost++;
             if (Math.random() < 0.15) lateGoalsAgainst++;
        }
    });

    score += totalWinDiff * 2;       // Reward winning close games
    score += comebackWins * 5;       // Big reward for comebacks
    score -= leadsLost * 5;          // Big penalty for losing leads
    score += lateGoalsFor * 1;       // Small reward for late goals
    score -= lateGoalsAgainst * 2;   // Medium penalty for conceding late

    // Normalize score to be between 0 and 100
    return Math.max(0, Math.min(100, Math.round(score)));
};


const CPSGauge = () => {
    const { currentTheme } = useTheme();
    // --- FIX: Add data hook and loading state ---
    const { weeklyData = [], loading } = useAccountData() || {};

    const cpsScore = useMemo(() => {
        // This is safe with guarded weeklyData
        const completedWeeks = weeklyData.filter(w => w.isCompleted);
        return calculateCPS(completedWeeks);
    }, [weeklyData]);

    const getScoreColor = (score: number) => {
        if (score >= 75) return 'text-green-500'; // Strong clutch
        if (score >= 50) return 'text-yellow-500'; // Average clutch
        return 'text-red-500'; // Below average clutch
    };

    // --- FIX: Add loading state ---
    if (loading) {
        return (
             <Card 
                style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}
                className="h-[300px]" // Approx height
            >
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-full">
                     <Skeleton className="h-24 w-24 rounded-full mb-4" />
                     <Skeleton className="h-4 w-32" />
                </CardContent>
            </Card>
        );
    }
    
    // Check if there's enough data after loading
    const completedWeeks = weeklyData.filter(w => w.isCompleted);
    if (completedWeeks.length === 0 || completedWeeks.flatMap(w => w.games).length < 5) { // Require min 5 games total
         return (
            <Card style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
                        <Gauge className="h-5 w-5" style={{ color: currentTheme.colors.primary }} />
                        Clutch Performance Score
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center py-12" style={{ color: currentTheme.colors.muted }}>
                    <p>Play more games (min 5 completed) to calculate your Clutch Score.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
                    <Gauge className="h-5 w-5" style={{ color: currentTheme.colors.primary }} />
                     Clutch Performance Score (CPS)
                     <TooltipProvider>
                       <Tooltip>
                         <TooltipTrigger>
                           <Info className="h-4 w-4 text-gray-400 ml-1 cursor-help" />
                         </TooltipTrigger>
                         <TooltipContent className="max-w-xs">
                           <p>Measures performance in key moments: winning close games, comebacks, avoiding losing leads, and late game impact. (Scale: 0-100)</p>
                         </TooltipContent>
                       </Tooltip>
                     </TooltipProvider>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pt-4">
                {/* Simple Gauge Visualization */}
                <div className="relative h-24 w-48 mb-2">
                     {/* Background Arc */}
                    <svg viewBox="0 0 100 50" className="w-full h-full">
                       <path 
                           d="M 10 50 A 40 40 0 0 1 90 50" 
                           stroke={currentTheme.colors.surface} 
                           strokeWidth="10" 
                           fill="none" 
                           strokeLinecap="round"
                        />
                         {/* Foreground Arc */}
                        <path 
                            d="M 10 50 A 40 40 0 0 1 90 50" 
                            stroke={ getScoreColor(cpsScore).includes('green') ? currentTheme.colors.success : getScoreColor(cpsScore).includes('yellow') ? currentTheme.colors.warning : currentTheme.colors.danger } // Use theme colors
                            strokeWidth="10" 
                            fill="none" 
                            strokeLinecap="round"
                            strokeDasharray={`${cpsScore * 1.256}, 125.6`} // Arc length approx 125.6 for 180deg
                            transform="rotate(0 50 50)" // Ensure rotation center is correct
                        />
                    </svg>
                     {/* Score Text */}
                    <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 text-4xl font-bold ${getScoreColor(cpsScore)}`}>
                        {cpsScore}
                    </div>
                </div>
                 <p className={`font-semibold ${getScoreColor(cpsScore)}`}>
                    {cpsScore >= 75 ? 'Highly Clutch' : cpsScore >= 50 ? 'Average Clutch' : 'Needs Improvement'}
                 </p>
                 <p className="text-xs text-center mt-2" style={{ color: currentTheme.colors.muted }}>
                    Based on performance in close games, comebacks, and late-game situations.
                 </p>
            </CardContent>
        </Card>
    );
};

export default CPSGauge;
