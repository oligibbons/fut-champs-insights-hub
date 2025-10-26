import React, { useMemo } from 'react';
import { CardOptions, availableMetrics } from './ShareableCardGenerator';
import { WeeklyPerformance, Game } from '@/types/futChampions';
import { useTheme } from '@/hooks/useTheme';
import logo from '/fut-trackr-logo.jpg'; 
import { Trophy, Target, TrendingUp, TrendingDown, Users, Goal, Crown } from 'lucide-react';
import { calculateCPS } from '@/utils/gameRating'; 
import { cn } from '@/lib/utils';
import { Playstyle } from './Playstyle'; // --- FIX: Named Import Applied ---

// --- Helper Types & Calculation Logic (Minimally defined for structure) ---
interface CalculatedStats {
  title?: string; record?: string; wins?: number; losses?: number; winRate?: number; goalsScored?: number; goalsConceded?: number; goalDifference?: number; gamesPlayed?: number; xgDifferential?: number; cpsScore?: number; highestScorer?: { name: string; goals: number }; highestAssister?: { name: string; assists: number };
  // Include all other required metrics for StatBlock
  [key: string]: any;
}
const calculateAllStats = (runData?: WeeklyPerformance | null, allRunsData?: WeeklyPerformance[] | null, cardType?: 'run' | 'overall'): CalculatedStats => {
    // --- FINAL IMPLEMENTATION REQUIRES COMPLEX AGGREGATION LOGIC HERE ---
    if (cardType === 'run' && runData) {
        const games = runData.games?.filter(g => g) ?? [];
        const stats: CalculatedStats = {
            title: runData.custom_name || `WEEK ${runData.week_number}`,
            gamesPlayed: games.length,
            winRate: games.length > 0 ? ((runData.total_wins ?? 0) / games.length) * 100 : 0,
            goalsScored: runData.total_goals ?? 0, goalsConceded: runData.total_conceded ?? 0,
            goalDifference: (runData.total_goals ?? 0) - (runData.total_conceded ?? 0),
            xgDifferential: 0.5, // Placeholder
            cpsScore: calculateCPS(games),
            highestScorer: { name: "Mbappé", goals: 12 }, highestAssister: { name: "Zidane", assists: 8 },
        };
        stats.record = `${stats.winRate && (stats.winRate / 100 * stats.gamesPlayed).toFixed(0)}-${stats.gamesPlayed - (stats.winRate && stats.winRate / 100 * stats.gamesPlayed)}`;
        return stats;
    }
    if (cardType === 'overall' && allRunsData) {
        const totalWins = allRunsData.reduce((sum, r) => sum + (r.total_wins ?? 0), 0);
        const totalGames = allRunsData.reduce((sum, r) => sum + (r.games?.length ?? 0), 0);
        const stats: CalculatedStats = {
            title: 'LIFETIME PROFILE',
            gamesPlayed: totalGames,
            winRate: totalGames > 0 ? (totalWins / totalGames) * 100 : 0,
            totalRuns: allRunsData.length,
            highestScorer: { name: "Ronaldo", goals: 300 }, highestAssister: { name: "Messi", assists: 250 },
        };
        stats.record = `${totalWins}-${totalGames - totalWins}`;
        return stats;
    }
    return {};
};

// --- Custom Stat Block Component with Themed Header ---
interface CustomStatBlockProps {
    options: CardOptions;
    stats: CalculatedStats;
    optionId: keyof CardOptions;
    Icon: React.ElementType;
    label: string;
    value: string | number | undefined | null;
    unit?: string;
    isLarge?: boolean; 
}

const ThemedStatBlock: React.FC<CustomStatBlockProps> = ({ options, stats, optionId, Icon, label, value, unit, isLarge = false }) => {
    if (!options[optionId] || value === undefined || value === null || value === 'N/A') return null;

    const { currentTheme } = useTheme();
    const isGood = typeof value === 'number' && (optionId.includes('Win') || optionId.includes('Diff') || optionId.includes('Acc')) && value >= 0;
    const color = isGood ? 'text-green-400' : 'text-primary';
    const primaryColor = `hsl(var(--primary))`; // Recalculated locally

    // Ensure value is formatted
    const displayValue = typeof value === 'number' ? (Number.isInteger(value) ? value : value.toFixed(1)) : value;

    return (
        <div className={cn(
             "relative flex flex-col p-0 overflow-hidden rounded-xl border border-white/10",
             "shadow-lg backdrop-blur-sm"
        )}>
            {/* Header Box (Heavier line weight, Themed Color) */}
            <div className="flex items-center justify-between px-3 py-2 text-white font-bold text-xs uppercase tracking-widest"
                 style={{ backgroundColor: primaryColor, borderBottom: `2px solid ${primaryColor}` }}>
                <div className="flex items-center">
                    <Icon className="h-4 w-4 mr-1.5" />
                    {label}
                </div>
            </div>
            
            {/* Content Area (Lower Line Weight, Contrast) */}
            <div className="flex-1 flex flex-col justify-center items-center p-3 sm:p-4" style={{ backgroundColor: 'transparent' }}>
                <p className={cn(
                    "text-3xl sm:text-4xl font-extrabold leading-none",
                    isLarge ? "text-xl" : color
                )} style={{ color: color }}>
                    {displayValue}{unit}
                </p>
            </div>
        </div>
    );
};

interface CardPreviewProps {
  runData?: WeeklyPerformance | null;
  allRunsData?: WeeklyPerformance[] | null;
  options: CardOptions;
  cardType: 'run' | 'overall';
  userScreenName: string;
  activeStatCount: number; 
  totalRows: number; 
}

const CardPreview: React.FC<CardPreviewProps> = ({ runData, allRunsData, options, cardType, userScreenName, activeStatCount, totalRows }) => {
  const { currentTheme } = useTheme();
  const stats = useMemo(() => calculateAllStats(runData, allRunsData, cardType), [runData, allRunsData, cardType]);
  
  const activeStatsToRender = useMemo(() => {
    return availableMetrics.filter(m => options[m.id]);
  }, [options]);

  const primaryColor = `hsl(var(--primary))`;

  // --- Dynamic Grid Templates ---
  // The first 3 rows are fixed (Header, Playstyle, 1st Row of Stats)
  // Subsequent rows are added for extra stats.
  const rowHeight = 110; // Fixed row height in pixels for dynamic scaling
  const dynamicHeight = 100 + (totalRows * rowHeight); // Base padding (100) + row height

  const gridTemplate = {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      // Define rows for Header (110px), Playstyle (110px), and then dynamic rows for stats
      gridTemplateRows: `110px 110px repeat(${totalRows - 2}, ${rowHeight}px)`,
      gap: '12px',
      padding: '16px', // Overall padding
      // Override total height of the container to enable dynamic extension in CSS
      height: 'auto', 
      minHeight: '400px'
  };

  // --- Background Style (Dark Charcoal Radial Gradient) ---
  const radialBackground = {
    // Custom charcoal gradient effect
    background: `radial-gradient(circle at 50% 50%, 
                 rgba(27, 27, 27, 1) 0%, 
                 rgba(18, 18, 18, 1) 70%)`,
  };

  return (
    <div 
        className="w-full text-white font-sans overflow-hidden relative" 
        style={{ ...radialBackground, height: `${dynamicHeight}px` }}> {/* Use dynamic height */}
      
      {/* Main Grid Container */}
      <div className="h-full w-full absolute inset-0" style={gridTemplate as React.CSSProperties}>
        
        {/* Spot 1: Title & User Info (Grid span 1x1, Row 1) */}
        <div className="flex flex-col justify-between p-3 rounded-xl bg-white/5" style={{ gridArea: '1 / 1 / 2 / 2' }}>
            <img src={logo} alt="FUT Trackr Logo" className="h-8 w-8 object-cover flex-shrink-0" />
            <div className='mt-auto pt-2'>
                <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest leading-tight">
                    {cardType === 'run' ? 'WEEKLY PERFORMANCE' : 'OVERALL PROFILE'}
                </h3>
                <h2 className="text-xl font-bold text-primary truncate leading-tight">
                    @{userScreenName}
                </h2>
            </div>
        </div>
        
        {/* Spot 2 & 3: Playstyle Component (Grid span 1x2 merged, Row 1) */}
        <div className="p-3 rounded-xl bg-white/5" style={{ gridArea: '1 / 2 / 2 / 4' }}>
            {/* The Playstyle component needs to be designed to be self-contained and visually bold */}
            <Playstyle showAsCard={false} /> 
        </div>

        {/* --- Custom Stat Spots (Starting Row 2) --- */}
        {activeStatsToRender.map((metric, index) => {
            // Calculate grid area dynamically: Row starts at 2 (third row)
            const row = 2 + Math.floor(index / 3);
            const colStart = 1 + (index % 3);
            
            // --- Map Logic ---
            let statValue: any = stats[metric.id.replace('show', '').toLowerCase()] ?? 'N/A'; // Default generic lookup
            let statUnit = '';
            let statLabel = metric.label;
            let currentIcon: React.ElementType = Trophy;
            
            // Comprehensive Mapping
            if (metric.id === 'showWinRate') { statValue = stats.winRate; statUnit = '%'; currentIcon = Trophy; }
            else if (metric.id === 'showGoalDifference') { statValue = stats.goalDifference; currentIcon = Goal; }
            else if (metric.id === 'showXGDifferential') { statValue = stats.xgDifferential; currentIcon = Target; }
            else if (metric.id === 'showGoalsScored') { statValue = stats.goalsScored; currentIcon = ArrowUp; }
            else if (metric.id === 'showGoalsConceded') { statValue = stats.goalsConceded; currentIcon = ArrowDown; }
            else if (metric.id === 'showHighestScorer') { statValue = stats.highestScorer?.goals; currentIcon = Goal; statLabel = 'Top Scorer Goals'; }
            // Add more specific metric mappings here...
            
            return (
                <div key={metric.id} style={{ gridArea: `${row} / ${colStart} / ${row + 1} / ${colStart + 1}` }}>
                    <ThemedStatBlock
                        options={options}
                        stats={stats}
                        optionId={metric.id}
                        Icon={currentIcon}
                        label={statLabel}
                        value={statValue}
                        unit={statUnit}
                        isLarge={metric.group === 'Player Stats'}
                    />
                </div>
            );
        })}
      </div>
      
      {/* 4. WATERMARK FOOTER (Absolute positioning) */}
       <div className="absolute bottom-0 left-0 right-0 py-2 text-center text-[10px] font-medium uppercase tracking-widest"
             style={{ 
                 backgroundColor: 'rgba(0, 0, 0, 0.5)', 
                 color: 'hsl(var(--muted-foreground))', 
                 borderTop: `1px solid ${primaryColor}` 
             }}>
           DATA CAPTURED & GENERATED BY FUTTRACKR.COM
       </div>
    </div>
  );
};

export default CardPreview;
