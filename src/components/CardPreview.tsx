import React, { useMemo } from 'react';
import { CardOptions, availableMetrics } from './ShareableCardGenerator';
import { WeeklyPerformance, PlayerPerformance, Game } from '@/types/futChampions';
import { useTheme } from '@/hooks/useTheme';
import logo from '/fut-trackr-logo.jpg'; //
import { Trophy, ArrowUp, ArrowDown, Target, Percent, TrendingUp, TrendingDown, Users, Shield, Footprints, Clock, ListChecks, Goal, Star, Skull, GitFork, Crown } from 'lucide-react'; // Added Crown, updated icons
import { calculateCPS } from '@/utils/gameRating'; // Placeholder function
import { cn } from '@/lib/utils';
// Assuming you have a component for simple radial/progress bars:
// import RadialProgress from './RadialProgress'; 

// --- Helper Types & Calculation Logic (Simplified for this component) ---
// NOTE: You must implement calculateAllStats thoroughly in the final project.
interface CalculatedStats {
  title?: string; record?: string; wins?: number; losses?: number; winRate?: number; goalsScored?: number; goalsConceded?: number; goalDifference?: number; gamesPlayed?: number; avgPossession?: number; passAccuracy?: number; shotAccuracy?: number; dribbleAccuracy?: number; xgFor?: number; xgAgainst?: number; xgDifferential?: number; passesPer90?: number; goalsPer90?: number; highestRatedPlayer?: { name: string; rating: number }; averagePlayerRating?: number; highestScorer?: { name: string; goals: number }; highestAssister?: { name: string; assists: number }; cleanSheets?: number; clubLegends?: { name: string; appearances: number }[]; winStreak?: number; lossStreak?: number; bestRecord?: string; worstRecord?: string; cpsScore?: number; rageQuits?: number; formationsUsed?: string[]; favouriteFormation?: string; matchTags?: { tag: string; count: number }[]; totalRuns?: number; averageWins?: number; totalPlayersUsed?: number; totalFormationsUsed?: number;
}
const calculateAllStats = (runData?: WeeklyPerformance | null, allRunsData?: WeeklyPerformance[] | null, cardType?: 'run' | 'overall'): CalculatedStats => {
    // --- FINAL IMPLEMENTATION REQUIRES COMPLEX AGGREGATION LOGIC HERE ---
    if (cardType === 'run' && runData) {
        const games = runData.games?.filter(g => g) ?? [];
        const stats: CalculatedStats = {
            title: runData.custom_name || `WEEK ${runData.week_number}`,
            gamesPlayed: games.length,
            winRate: games.length > 0 ? ((runData.total_wins ?? 0) / games.length) * 100 : 0,
            goalsScored: runData.total_goals ?? 0,
            goalsConceded: runData.total_conceded ?? 0,
            goalDifference: (runData.total_goals ?? 0) - (runData.total_conceded ?? 0),
            cpsScore: calculateCPS(games), // Use imported CPS function
            // ... all other run-specific calculations
        };
        stats.record = `${stats.winRate && stats.winRate / 100 * stats.gamesPlayed}-${stats.gamesPlayed - (stats.winRate && stats.winRate / 100 * stats.gamesPlayed)}`;
        return stats;
    }
    if (cardType === 'overall' && allRunsData) {
        const totalWins = allRunsData.reduce((sum, r) => sum + (r.total_wins ?? 0), 0);
        const totalGames = allRunsData.reduce((sum, r) => sum + (r.games?.length ?? 0), 0);
        const stats: CalculatedStats = {
            title: 'OVERALL PROFILE',
            gamesPlayed: totalGames,
            winRate: totalGames > 0 ? (totalWins / totalGames) * 100 : 0,
            totalRuns: allRunsData.length,
            // ... all other overall calculations
        };
        stats.record = `${totalWins}-${totalGames - totalWins}`;
        return stats;
    }
    return {};
};

// --- Reusable Visual Component for Stat Blocks ---
interface StatBlockProps { Icon: React.ElementType; label: string; value: string | number | undefined | null; unit?: string; colorClass?: string; }
const StatBlock: React.FC<StatBlockProps> = ({ Icon, label, value, unit, colorClass = "text-foreground" }) => {
    if (value === undefined || value === null || value === "" || Number.isNaN(value) || value === 'N/A') return null;
    const displayValue = typeof value === 'number' ? (Number.isInteger(value) ? value : value.toFixed(1)) : value;
    return (
        <div className="flex flex-col items-start justify-start space-y-0.5 p-2 bg-white/5 rounded-md text-left">
            <div className="flex items-center text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider">
                <Icon className={cn("h-3 w-3 mr-1", colorClass)} />
                {label}
            </div>
            <p className={cn("text-lg sm:text-xl font-extrabold leading-none", colorClass)}>
                {displayValue}{unit}
            </p>
        </div>
    );
};
// --- Reusable Visual Component for Player Stats ---
interface PlayerHighlightProps { Icon: React.ElementType; label: string; name?: string; stat?: string | number; colorClass?: string; }
const PlayerHighlight: React.FC<PlayerHighlightProps> = ({ Icon, label, name, stat, colorClass = "text-foreground" }) => {
    if (!name || stat === undefined || stat === null) return null;
    return (
        <div className="flex items-center justify-between p-2 bg-white/10 rounded-lg">
             <div className="flex items-center space-x-2">
                <Icon className={cn("h-4 w-4 flex-shrink-0", colorClass)} />
                <div className="flex flex-col items-start min-w-0">
                    <p className="text-[10px] text-muted-foreground uppercase leading-none">{label}</p>
                    <p className="text-sm font-semibold truncate w-full">{name}</p>
                </div>
             </div>
             <p className={cn("text-lg font-extrabold flex-shrink-0", colorClass)}>
                {typeof stat === 'number' ? stat.toFixed(stat % 1 === 0 ? 0 : 1) : stat}
             </p>
        </div>
    );
};


interface CardPreviewProps {
  runData?: WeeklyPerformance | null;
  allRunsData?: WeeklyPerformance[] | null;
  options: CardOptions;
  cardType: 'run' | 'overall';
  userScreenName: string; // New required prop
}

const CardPreview: React.FC<CardPreviewProps> = ({ runData, allRunsData, options, cardType, userScreenName }) => {
  const { currentTheme } = useTheme();
  const stats = useMemo(() => calculateAllStats(runData, allRunsData, cardType), [runData, allRunsData, cardType]);

  // Dynamic Colors (using fixed HSL/RGB from theme vars for consistent image rendering)
  const primaryColor = `hsl(var(--primary))`;
  const winColor = currentTheme.colors.win || 'hsl(130, 80%, 65%)'; // Example HSL
  const lossColor = currentTheme.colors.loss || 'hsl(0, 90%, 75%)'; // Example HSL
  const neutralColor = primaryColor; // Use primary for general stats

  const getGoalDiffColor = (diff?: number) => {
      if (diff === undefined || diff === null) return 'text-muted-foreground';
      return diff > 0 ? winColor : diff < 0 ? lossColor : 'text-muted-foreground';
  }

  // --- Visuals: Win Rate Gauge (Simulated) ---
  const winRateValue = stats.winRate ?? 0;
  const winRateColor = winRateValue >= 60 ? winColor : winRateValue >= 40 ? neutralColor : lossColor;


  return (
    <div className={cn(
        "h-full w-full flex flex-col p-4 text-xs font-poppins",
        currentTheme.name === 'dark' ? 'bg-[#151a28] text-white' : 'bg-white text-gray-800'
    )}>

      {/* 1. TOP HEADER & BRANDING */}
      <div className="flex items-center justify-between pb-3 border-b border-white/20 flex-shrink-0">
        <div className="flex flex-col items-start leading-none">
            <h1 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {cardType === 'run' ? `WEEK ${runData?.week_number} SUMMARY` : 'LIFETIME PROFILE'}
            </h1>
            <h2 className="text-lg font-extrabold text-primary pt-0.5">
                @{userScreenName || 'FUT_PLAYER'}
            </h2>
        </div>
        <img src={logo} alt="FUT Trackr Logo" className="h-8 w-8 rounded-md opacity-90" />
      </div>

      {/* 2. KEY METRICS BLOCK (Win Rate Gauge Style) */}
      <div className="flex items-center justify-between py-4 border-b border-white/10 flex-shrink-0">
          
          {/* Win Rate Gauge (Simulated) */}
          <div className="flex flex-col items-center justify-center w-1/3 min-w-[80px] h-[80px] rounded-full bg-white/10 relative">
             <div className="text-xl font-extrabold leading-none" style={{ color: winRateColor }}>
                {winRateValue.toFixed(0)}%
             </div>
             <div className="text-[10px] text-muted-foreground uppercase mt-0.5">Win Rate</div>
             {/* Actual Radial Chart/Gauge would go here */}
          </div>

          {/* W-L Record */}
          <div className="flex flex-col items-end text-right w-2/3 pl-4">
              <div className="flex text-3xl font-extrabold leading-none space-x-1">
                  <span className={winColor}>{stats.record?.split('-')[0] || 'N/A'}</span>
                  <span className="text-muted-foreground">-</span>
                  <span className={lossColor}>{stats.record?.split('-')[1] || 'N/A'}</span>
              </div>
              <div className="text-sm font-medium text-muted-foreground uppercase mt-1">
                  {stats.gamesPlayed} Games | Final Record
              </div>
          </div>
      </div>

      {/* 3. STAT SEGMENTS (Dynamic Grid) */}
      <div className="flex-1 overflow-hidden overflow-y-auto pt-4 space-y-4">
          
          {/* Group 1: Offense/Defense */}
          <div className='space-y-1.5'>
            <h3 className='text-[10px] text-muted-foreground uppercase tracking-wider pl-1'>Performance Summary</h3>
            <div className="grid grid-cols-3 gap-2">
                {options.showGoalDifference && <StatBlock Icon={Target} label="Goal Diff" value={stats.goalDifference} colorClass={getGoalDiffColor(stats.goalDifference)} />}
                {options.showXGDifferential && <StatBlock Icon={TrendingUp} label="xG Diff" value={stats.xgDifferential} colorClass={getGoalDiffColor(stats.xgDifferential)} />}
                {options.showGoalsPer90 && <StatBlock Icon={Goal} label="GF/90" value={stats.goalsPer90} />}
                {options.showRageQuits && <StatBlock Icon={Skull} label="Rage Quits" value={stats.rageQuits} colorClass={lossColor} />}
                {options.showCleanSheets && cardType === 'overall' && <StatBlock Icon={Shield} label="Clean Sheets" value={stats.cleanSheets} colorClass={winColor} />}
                {options.showCPS && cardType === 'run' && <StatBlock Icon={Star} label="CPS Score" value={stats.cpsScore} colorClass={primaryColor} />}
            </div>
          </div>
          
          {/* Group 2: Accuracy/Averages */}
          <div className='space-y-1.5'>
            <h3 className='text-[10px] text-muted-foreground uppercase tracking-wider pl-1'>Team Metrics</h3>
            <div className="grid grid-cols-2 gap-2">
                {options.showPassAccuracy && <StatBlock Icon={ListChecks} label="Pass Acc" value={stats.passAccuracy} unit="%" colorClass={neutralColor} />}
                {options.showShotAccuracy && <StatBlock Icon={Target} label="Shot Acc" value={stats.shotAccuracy} unit="%" colorClass={neutralColor} />}
                {options.showAvgPossession && <StatBlock Icon={Footprints} label="Avg Poss" value={stats.avgPossession} unit="%" colorClass={neutralColor} />}
                {options.showAveragePlayerRating && <StatBlock Icon={Users} label="Avg Rating" value={stats.averagePlayerRating} colorClass={neutralColor} />}
            </div>
          </div>

          {/* Group 3: Player/Records */}
          <div className='space-y-1.5'>
            <h3 className='text-[10px] text-muted-foreground uppercase tracking-wider pl-1'>Player & Records</h3>
            <div className='space-y-1'>
                {options.showHighestRatedPlayer && <PlayerHighlight Icon={Crown} label="MVP" name={stats.highestRatedPlayer?.name} stat={stats.highestRatedPlayer?.rating?.toFixed(1)} colorClass={primaryColor} />}
                {options.showHighestScorer && <PlayerHighlight Icon={Goal} label="Top Scorer" name={stats.highestScorer?.name} stat={stats.highestScorer?.goals} colorClass={winColor} />}
                {options.showHighestAssister && <PlayerHighlight Icon={Target} label="Top Assister" name={stats.highestAssister?.name} stat={stats.highestAssister?.assists} colorClass={winColor} />}
            </div>
          </div>

           {/* Group 4: Streaks & Formations */}
          {(options.showWinStreak || options.showFavouriteFormation) && (
             <div className='space-y-1.5'>
                <h3 className='text-[10px] text-muted-foreground uppercase tracking-wider pl-1'>Trends</h3>
                <div className='grid grid-cols-2 gap-2'>
                    {options.showWinStreak && <StatBlock Icon={TrendingUp} label="Best Win Streak" value={stats.winStreak} colorClass={winColor} />}
                    {options.showFavouriteFormation && cardType === 'overall' && <StatBlock Icon={GitFork} label="Fav Formation" value={stats.favouriteFormation || 'N/A'} colorClass={primaryColor} />}
                </div>
            </div>
          )}

           {/* Group 5: Match Tags (List Format) */}
          {options.showMatchTagAnalysis && stats.matchTags && stats.matchTags.length > 0 && (
             <div className='space-y-1.5'>
                <h3 className='text-[10px] text-muted-foreground uppercase tracking-wider pl-1'>Key Match Tags</h3>
                <div className='flex flex-wrap justify-start gap-1 text-[10px]'>
                    {stats.matchTags.map(t => <span key={t.tag} className='bg-primary/20 text-primary px-1.5 py-0.5 rounded'>{t.tag} ({t.count})</span>)}
                </div>
            </div>
          )}

      </div>

      {/* 4. FOOTER (Branding) */}
      <div className="mt-auto pt-2 border-t border-white/20 flex items-center justify-between text-[10px] text-muted-foreground/80 flex-shrink-0">
        <div className="flex items-center space-x-1">
            <img src={logo} alt="FUT Trackr Logo" className="h-4 w-4 opacity-70" />
            <span className="font-semibold text-primary">FUTTrackr.com</span>
        </div>
        <span>The Ultimate Stat Companion</span>
      </div>
    </div>
  );
};

export default CardPreview;
