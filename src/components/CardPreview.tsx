import React, { useMemo } from 'react';
import { CardOptions, availableMetrics } from './ShareableCardGenerator';
import { WeeklyPerformance, Game } from '@/types/futChampions';
import { useTheme } from '@/hooks/useTheme';
import logo from '/fut-trackr-logo.jpg';
import { Trophy, Target, TrendingUp, TrendingDown, Users, Goal, Crown, ArrowUp, ArrowDown } from 'lucide-react';
import { calculateCPS } from '@/utils/gameRating';
import { cn } from '@/lib/utils';
import { Playstyle } from './Playstyle'; 

// --- Helper Types & Calculation Logic (Minimally defined for structure) ---
interface CalculatedStats {
  title?: string; record?: string; wins?: number; losses?: number; winRate?: number; goalsScored?: number; goalsConceded?: number; goalDifference?: number; gamesPlayed?: number; xgDifferential?: number; cpsScore?: number; highestScorer?: { name: string; goals: number }; highestAssister?: { name: string; assists: number };
  [key: string]: any;
}
const calculateAllStats = (runData?: WeeklyPerformance | null, allRunsData?: WeeklyPerformance[] | null, cardType?: 'run' | 'overall'): CalculatedStats => {
    // NOTE: Placeholder logic is kept minimal to avoid introducing new bugs during styling fix.
    if (cardType === 'run' && runData) {
        const games = runData.games?.filter(g => g) ?? [];
        const stats: CalculatedStats = {
            title: runData.custom_name || `WEEK ${runData.week_number}`,
            gamesPlayed: games.length,
            winRate: games.length > 0 ? ((runData.total_wins ?? 0) / games.length) * 100 : 0,
            goalsScored: runData.total_goals ?? 0, goalsConceded: runData.total_conceded ?? 0,
            goalDifference: (runData.total_goals ?? 0) - (runData.total_conceded ?? 0),
            xgDifferential: 0.5,
            cpsScore: calculateCPS(games),
            highestScorer: { name: "Mbappé", goals: 12 }, highestAssister: { name: "Zidane", assists: 8 },
            passAccuracy: 85, // Placeholder for fix
            xgDifferential: 1.2, // Placeholder for fix
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
            goalDifference: 15,
            xgDifferential: 1.2,
            passAccuracy: 85, // Placeholder for fix
        };
        stats.record = `${totalWins}-${totalGames - totalWins}`;
        return stats;
    }
    return {};
};

// --- Custom Stat Block Component with Themed Header (HIGH FLAIR) ---
interface CustomStatBlockProps {
    options: CardOptions;
    optionId: keyof CardOptions;
    Icon: React.ElementType;
    label: string;
    value: string | number | undefined | null;
    unit?: string;
}

const ThemedStatBlock: React.FC<CustomStatBlockProps> = ({ options, optionId, Icon, label, value, unit }) => {
    if (!options[optionId] || value === undefined || value === null || value === 'N/A') return null;

    const primaryColor = `hsl(var(--primary))`;
    const winColor = 'hsl(130, 80%, 65%)'; 
    const lossColor = 'hsl(0, 90%, 75%)'; 
    
    // Determine color based on metric type
    const isPositive = typeof value === 'number' && (optionId.includes('Win') || optionId.includes('Diff') || optionId.includes('Acc')) && value >= 0;
    const valueColor = isPositive ? winColor : (typeof value === 'number' && value < 0) ? lossColor : primaryColor;
    
    // Formatting
    const displayValue = typeof value === 'number' ? (Number.isInteger(value) ? value : value.toFixed(2).replace(/\.?0+$/, '')) : value;

    return (
        <div className={cn(
             "relative flex flex-col p-0 overflow-hidden rounded-xl border border-transparent",
             "bg-white/5 backdrop-blur-sm"
        )}>
            {/* Header Box (Themed Color, Heavy Weight) */}
            <div className="flex items-center justify-between px-3 py-1.5 text-white font-bold text-[10px] uppercase tracking-widest leading-tight"
                 style={{ backgroundColor: primaryColor, borderBottom: `2px solid ${primaryColor}` }}>
                <div className="flex items-center">
                    <Icon className="h-3 w-3 mr-1.5" />
                    {label}
                </div>
            </div>
            
            {/* Content Area (Lower Line Weight, Contrast) */}
            <div className="flex-1 flex flex-col justify-center items-center p-2 sm:p-3">
                <p className={cn(
                    "text-3xl sm:text-4xl font-extrabold leading-none",
                )} style={{ color: valueColor }}>
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
  const rowHeight = 110;
  const gridTemplate = {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gridTemplateRows: `repeat(${totalRows}, ${rowHeight}px)`,
      gap: '12px',
      padding: '16px',
  };

  // --- FIX 3: Simplified Background for Debugging & Contrast ---
  const simplifiedBackground = {
    // Set explicit dark color and fallback
    backgroundColor: '#111111', 
    // Add subtle visual depth back via shadow or inset border if needed, but keep it simple
    boxShadow: 'inset 0 0 100px rgba(0,0,0,0.5)',
  };


  return (
    <div 
        // FIX 4: Ensure ALL text is white (or theme color) on the outer container for maximum contrast
        className="w-full text-white font-sans overflow-hidden relative" 
        style={simplifiedBackground}>
      
      {/* Main Grid Container */}
      <div className="h-full w-full absolute inset-0" style={gridTemplate as React.CSSProperties}>
        
        {/* Spot 1: Title & User Info (Row 1, Col 1) */}
        <div className="flex flex-col justify-between p-3 rounded-xl bg-white/5 backdrop-blur-sm" style={{ gridArea: '1 / 1 / 2 / 2' }}>
            <img src={logo} alt="FUT Trackr Logo" className="h-9 w-9 object-cover flex-shrink-0" />
            <div className='pt-2'>
                {/* FIX 5: Username formatting and Title using clear white text */}
                <h3 className="text-[10px] font-medium text-white/70 uppercase tracking-widest leading-tight">
                    {stats.title}
                </h3>
                <h2 className="text-xl font-bold text-white truncate leading-tight mt-0.5">
                    @{userScreenName}
                </h2>
            </div>
        </div>
        
        {/* Spot 2 & 3: Playstyle Component (Row 1, Col 2-3) */}
        <div className="p-3 rounded-xl bg-white/5 flex items-center justify-center" style={{ gridArea: '1 / 2 / 2 / 4' }}>
            {/* FIX 6: Ensure Playstyle component container gives it full space */}
            <div className="h-full w-full flex items-center justify-center">
                <Playstyle showAsCard={false} /> 
            </div>
        </div>

        {/* --- Custom Stat Spots (Starting Row 2) --- */}
        {activeStatsToRender.map((metric, index) => {
            const row = 2 + Math.floor(index / 3);
            const colStart = 1 + (index % 3);
            
            let statValue: any = stats[metric.id.replace('show', '').toLowerCase()] ?? 'N/A';
            let statUnit = '';
            let statLabel = metric.label;
            let currentIcon: React.ElementType = Trophy;
            
            // Comprehensive Mapping
            if (metric.id === 'showWinRate') { statValue = stats.winRate; statUnit = '%'; currentIcon = Trophy; }
            else if (metric.id === 'showRecord') { statValue = stats.record; currentIcon = Trophy; }
            else if (metric.id === 'showGoalDifference') { statValue = stats.goalDifference; currentIcon = Goal; }
            else if (metric.id === 'showXGDifferential') { statValue = stats.xgDifferential; currentIcon = Target; }
            else if (metric.id === 'showHighestScorer') { statValue = stats.highestScorer?.name; currentIcon = Crown; statLabel = 'Top Scorer Name'; }
            else if (metric.id === 'showPassAccuracy') { statValue = stats.passAccuracy; statUnit = '%'; currentIcon = Users; }
            else if (metric.id === 'showGoalsScored') { statValue = stats.goalsScored; currentIcon = ArrowUp; }
            else if (metric.id === 'showGoalsConceded') { statValue = stats.goalsConceded; currentIcon = ArrowDown; }
            
            return (
                <div key={metric.id} style={{ gridArea: `${row} / ${colStart} / ${row + 1} / ${colStart + 1}` }}>
                    <ThemedStatBlock
                        options={options}
                        optionId={metric.id}
                        Icon={currentIcon}
                        label={statLabel}
                        value={statValue}
                        unit={statUnit}
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
