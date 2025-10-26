import React, { useMemo } from 'react';
import { CardOptions, availableMetrics } from './ShareableCardGenerator';
import { WeeklyPerformance, Game } from '@/types/futChampions';
import { useTheme } from '@/hooks/useTheme';
import logo from '/fut-trackr-logo.jpg'; //
import { Trophy, Target, TrendingUp, TrendingDown, Users, Goal, Crown } from 'lucide-react';
import { calculateCPS } from '@/utils/gameRating'; //
import { cn } from '@/lib/utils';
import Playstyle from './Playstyle'; // --- Import Playstyle Component ---

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
            // ... placeholders for overall stats
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
    isLarge?: boolean; // Use for special stats like top scorer
}

const ThemedStatBlock: React.FC<CustomStatBlockProps> = ({ options, stats, optionId, Icon, label, value, unit, isLarge = false }) => {
    if (!options[optionId] || value === undefined || value === null || value === 'N/A') return null;

    const { currentTheme } = useTheme();
    const isGood = typeof value === 'number' && (optionId.includes('Win') || optionId.includes('Diff') || optionId.includes('Acc')) && value >= 0;
    const color = isGood ? 'text-green-400' : 'text-primary';
    const bgColor = `hsl(var(--primary) / 0.1)`; // Light wash of primary color
    
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
                    isLarge ? "text-xl" : color // Use smaller font for names
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
  activeStatCount: number; // Passed from generator
  totalRows: number; // Passed from generator
}

const CardPreview: React.FC<CardPreviewProps> = ({ runData, allRunsData, options, cardType, userScreenName, activeStatCount, totalRows }) => {
  const { currentTheme } = useTheme();
  const stats = useMemo(() => calculateAllStats(runData, allRunsData, cardType), [runData, allRunsData, cardType]);
  
  // Create an array of active stat options to render, maintaining order
  const activeStatsToRender = useMemo(() => {
    return availableMetrics.filter(m => options[m.id]);
  }, [options]);

  const primaryColor = `hsl(var(--primary))`;

  // --- Dynamic Grid Templates (Adjusted for mobile-first/square) ---
  const gridTemplate = {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gridTemplateRows: `repeat(${totalRows}, 1fr)`,
      gap: '12px', // Use pixel value for consistency in image generation
      padding: '24px', // Overall padding
  };

  // --- Background Style (Dark Charcoal Radial Gradient) ---
  const radialBackground = {
    // Uses CSS variables for theme compatibility, targeting a near-black/charcoal core
    background: `radial-gradient(circle at 50% 50%, 
                 hsl(var(--card)) 0%, 
                 hsl(var(--background)) 70%)`,
  };

  let statIndex = 0; // Tracks which of the 6 customizable spots we are on

  return (
    <div 
        className="h-full w-full text-white font-sans overflow-hidden" 
        style={radialBackground}>
      
      {/* Main Grid Container */}
      <div className="h-full w-full" style={gridTemplate as React.CSSProperties}>
        
        {/* Spot 1: Title & User Info (Grid span 1x1) */}
        <div className="flex flex-col justify-between p-3 rounded-xl bg-white/5" style={{ gridArea: '1 / 1 / 2 / 2' }}>
            <img src={logo} alt="FUT Trackr" className="h-8 w-8 object-cover" />
            <div className='mt-auto pt-2'>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                    {cardType === 'run' ? 'WEEKLY PERFORMANCE' : 'OVERALL PROFILE'}
                </h3>
                <h2 className="text-xl font-bold text-primary truncate leading-tight">
                    @{userScreenName}
                </h2>
            </div>
        </div>
        
        {/* Spot 2 & 3: Playstyle Component (Grid span 1x2 merged) */}
        <div className="p-3 rounded-xl bg-white/5" style={{ gridArea: '1 / 2 / 2 / 4' }}>
            <Playstyle showAsCard={false} /> {/* Assume this prop renders it cleanly */}
        </div>

        {/* --- Custom Stat Spots (Rows 2, 3, 4, etc.) --- */}
        {activeStatsToRender.map((metric, index) => {
            // Calculate grid area dynamically
            const row = 2 + Math.floor(index / 3);
            const colStart = 1 + (index % 3);
            const colEnd = colStart + 1;
            
            // Check if metric value is available to render
            const metricValue = stats[metric.id.replace('show', '')] ?? 'N/A';
            const metricIcon = (metric.id.includes('Win') || metric.id.includes('Goal')) ? Trophy : Target; // Simplified icon choice

            // Get the value to render. Note: this needs to be mapped to the actual stat field
            let statValue = 'N/A';
            let statUnit = '';
            let statLabel = metric.label;
            let currentIcon = Trophy;
            
            // --- This part needs comprehensive mapping logic ---
            if (metric.id === 'showWinRate') { statValue = stats.winRate; statUnit = '%'; currentIcon = Trophy; }
            else if (metric.id === 'showGoalDifference') { statValue = stats.goalDifference; currentIcon = Goal; }
            else if (metric.id === 'showHighestScorer') { statValue = stats.highestScorer?.name; currentIcon = Crown; statLabel = 'Top Scorer'; }
            // --- End mapping logic ---

            return (
                <div key={metric.id} style={{ gridArea: `${row} / ${colStart} / ${row + 1} / ${colEnd}` }}>
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
             style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', color: 'hsl(var(--muted-foreground))' }}>
           DATA CAPTURED & GENERATED BY FUTTRACKR.COM
       </div>
    </div>
  );
};

export default CardPreview;
