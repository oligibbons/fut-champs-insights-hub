import React from 'react';
import { CardOptions } from './ShareableCardGenerator';
import { WeeklyPerformance } from '@/types/futChampions'; //
import { useTheme } from '@/hooks/useTheme'; //
import logo from '/fut-trackr-logo.jpg'; //
import { Trophy, ArrowUp, ArrowDown, Target } from 'lucide-react'; // Example icons

interface CardPreviewProps {
  runData?: WeeklyPerformance | null;
  allRunsData?: WeeklyPerformance[] | null;
  options: CardOptions;
  cardType: 'run' | 'overall';
}

// Helper to safely calculate stats (expand significantly)
const calculateStats = (runData?: WeeklyPerformance | null, allRunsData?: WeeklyPerformance[] | null, cardType?: 'run' | 'overall') => {
    if (cardType === 'run' && runData) {
        const games = runData.games || [];
        const wins = runData.total_wins ?? 0;
        const losses = runData.total_losses ?? games.length - wins;
        const gf = runData.total_goals ?? 0;
        const ga = runData.total_conceded ?? 0;
        const winRate = games.length > 0 ? (wins / games.length) * 100 : 0;
        // --- TODO: Calculate top scorer/playmaker for this run ---
        return {
            title: runData.custom_name || `Week ${runData.week_number}`,
            record: `${wins}-${losses}`,
            winRate: `${winRate.toFixed(0)}%`,
            goalsFor: gf,
            goalsAgainst: ga,
            // ... more run-specific stats
        };
    } else if (cardType === 'overall' && allRunsData) {
        // --- TODO: Calculate overall stats from allRunsData ---
        const totalGames = allRunsData.reduce((sum, run) => sum + (run.games?.length ?? 0), 0);
        const totalWins = allRunsData.reduce((sum, run) => sum + (run.total_wins ?? 0), 0);
        // ... calculate many more overall stats
        return {
            title: 'Overall Stats',
            record: `${totalWins}-${totalGames - totalWins}`, // Example
            // ... more overall stats
        };
    }
    return {}; // Default empty object
};


const CardPreview: React.FC<CardPreviewProps> = ({ runData, allRunsData, options, cardType }) => {
  const { currentTheme } = useTheme();

  // --- TODO: Calculate all necessary stats based on runData/allRunsData ---
  const stats = calculateStats(runData, allRunsData, cardType);


  // --- TODO: Define the visual structure using Tailwind ---
  // This is a very basic example structure - needs significant styling and content
  return (
    <div className={`h-full w-full flex flex-col p-4 text-foreground bg-gradient-to-br ${currentTheme.name === 'dark' ? 'from-background to-card' : 'from-gray-100 to-white'}`}> {/* Example gradient */}
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold">{stats.title || 'Stat Card'}</h2>
        {options.showRecord && <p className="text-lg font-semibold text-primary">{stats.record || 'N/A'}</p>}
      </div>

      {/* Main Stats Area (Example Grid) */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-center">
        {options.showWinRate && (
          <div className="bg-foreground/5 p-2 rounded">
            <p className="text-xs text-muted-foreground">Win Rate</p>
            <p className="text-lg font-bold">{stats.winRate || 'N/A'}</p>
          </div>
        )}
        {options.showGoalsForAgainst && (
          <div className="bg-foreground/5 p-2 rounded">
            <p className="text-xs text-muted-foreground">Goals For</p>
            <p className="text-lg font-bold">{stats.goalsFor ?? 'N/A'}</p>
          </div>
        )}
         {options.showGoalsForAgainst && (
          <div className="bg-foreground/5 p-2 rounded">
            <p className="text-xs text-muted-foreground">Goals Against</p>
            <p className="text-lg font-bold">{stats.goalsAgainst ?? 'N/A'}</p>
          </div>
        )}
        {/* --- TODO: Add conditional rendering for ALL other stats based on options --- */}
      </div>

       {/* Player Highlights (Example) */}
        {(options.showTopScorer || options.showTopPlaymaker) && (
            <div className='mb-4 space-y-2'>
                <h3 className='text-sm font-semibold text-center text-muted-foreground'>Highlights</h3>
                 {/* TODO: Add Top Scorer / Playmaker rendering */}
            </div>
        )}


      {/* --- TODO: Conditionally add small charts (recharts) here if options allow --- */}


      {/* Footer */}
      <div className="mt-auto pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
        <img src={logo} alt="FUT Trackr Logo" className="h-6 w-6 opacity-80" />
        <span>Stats via FUTTrackr.com</span>
      </div>
    </div>
  );
};

export default CardPreview;
