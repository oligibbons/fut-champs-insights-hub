import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { toJpeg } from 'html-to-image';
import { saveAs } from 'file-saver';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Camera, Download, Share2 } from 'lucide-react';
import CardPreview from './CardPreview';
import CardCustomizer from './CardCustomizer';
import { WeeklyPerformance } from '@/types/futChampions';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext'; // Assuming useAuth provides user data for screen name

// Define structure for options (Final structure)
export interface CardOptions {
  showRecord: boolean; showWinRate: boolean; showGoalsScored: boolean; showGoalsConceded: boolean; showGoalDifference: boolean; showGamesPlayed: boolean;
  showAvgPossession: boolean; showPassAccuracy: boolean; showShotAccuracy: boolean; showDribbleAccuracy: boolean; showXGFor: boolean; showXGAgainst: boolean; showXGDifferential: boolean; showPassesPer90: boolean; showGoalsPer90: boolean;
  showHighestRatedPlayer: boolean; showAveragePlayerRating: boolean; showHighestScorer: boolean; showHighestAssister: boolean; showCleanSheets: boolean; showClubLegends: boolean;
  showWinStreak: boolean; showLossStreak: boolean; showBestRecord: boolean; showWorstRecord: boolean;
  showCPS: boolean; showRageQuits: boolean; showFormationsUsed: boolean; showFavouriteFormation: boolean; showMatchTagAnalysis: boolean;
  showTotalRuns: boolean; showAverageWins: boolean; showTotalPlayersUsed: boolean; showTotalFormationsUsed: boolean;
}

// Define available metrics (Final list)
export interface MetricDefinition {
  id: keyof CardOptions; label: string; group: 'General' | 'Team Stats' | 'Player Stats' | 'Streaks & Records' | 'Analysis' | 'Overall Profile'; runOnly?: boolean; overallOnly?: boolean;
}

export const availableMetrics: MetricDefinition[] = [
  { id: 'showRecord', label: 'Record (W-L)', group: 'General' }, { id: 'showWinRate', label: 'Win Rate %', group: 'General' }, { id: 'showGoalsScored', label: 'Goals Scored', group: 'General' }, { id: 'showGoalsConceded', label: 'Goals Conceded', group: 'General' }, { id: 'showGoalDifference', label: 'Goal Difference', group: 'General' }, { id: 'showGamesPlayed', label: 'Games Played', group: 'General' },
  { id: 'showAvgPossession', label: 'Avg. Possession %', group: 'Team Stats' }, { id: 'showPassAccuracy', label: 'Avg. Pass Accuracy %', group: 'Team Stats' }, { id: 'showShotAccuracy', label: 'Avg. Shot Accuracy %', group: 'Team Stats' }, { id: 'showDribbleAccuracy', label: 'Avg. Dribble Success %', group: 'Team Stats' }, { id: 'showXGFor', label: 'Avg. Expected Goals (xG)', group: 'Team Stats' }, { id: 'showXGAgainst', label: 'Avg. Expected Goals Against (xGA)', group: 'Team Stats' }, { id: 'showXGDifferential', label: 'Avg. xG Differential', group: 'Team Stats' }, { id: 'showPassesPer90', label: 'Avg. Passes per 90', group: 'Team Stats' }, { id: 'showGoalsPer90', label: 'Avg. Goals per 90', group: 'Team Stats' },
  { id: 'showHighestRatedPlayer', label: 'MVP (Highest Avg Rating)', group: 'Player Stats' }, { id: 'showAveragePlayerRating', label: 'Avg. Player Rating (Team)', group: 'Player Stats' }, { id: 'showHighestScorer', label: 'Top Scorer', group: 'Player Stats' }, { id: 'showHighestAssister', label: 'Top Assister', group: 'Player Stats' }, { id: 'showCleanSheets', label: 'Clean Sheets', group: 'Player Stats', overallOnly: true }, { id: 'showClubLegends', label: 'Club Legends (Top 3)', group: 'Player Stats', overallOnly: true },
  { id: 'showWinStreak', label: 'Best Win Streak', group: 'Streaks & Records' }, { id: 'showLossStreak', label: 'Worst Loss Streak', group: 'Streaks & Records', overallOnly: true }, { id: 'showBestRecord', label: 'Best Run Record', group: 'Streaks & Records', overallOnly: true }, { id: 'showWorstRecord', label: 'Worst Run Record', group: 'Streaks & Records', overallOnly: true },
  { id: 'showCPS', label: 'Champs Player Score (CPS)', group: 'Analysis', runOnly: true }, { id: 'showRageQuits', label: 'Rage Quits (Yours + Opponent)', group: 'Analysis' }, { id: 'showFormationsUsed', label: 'Formations Used', group: 'Analysis' }, { id: 'showFavouriteFormation', label: 'Favourite Formation', group: 'Analysis', overallOnly: true }, { id: 'showMatchTagAnalysis', label: 'Key Match Tags (Top 3)', group: 'Analysis' },
  { id: 'showTotalRuns', label: 'Total Runs Tracked', group: 'Overall Profile', overallOnly: true }, { id: 'showAverageWins', label: 'Average Wins per Run', group: 'Overall Profile', overallOnly: true }, { id: 'showTotalPlayersUsed', label: 'Total Unique Players Used', group: 'Overall Profile', overallOnly: true }, { id: 'showTotalFormationsUsed', label: 'Total Unique Formations Used', group: 'Overall Profile', overallOnly: true },
];

// --- FIX 1: Set 6 key metrics as default (Ensures square start) ---
const getDefaultOptions = (): CardOptions => {
  const defaultState: Partial<CardOptions> = {};
  const defaultMetricIds: (keyof CardOptions)[] = [
    'showRecord', // High priority
    'showWinRate', // High priority
    'showGoalDifference', // High priority
    'showXGDifferential', // High priority
    'showHighestScorer', // High priority
    'showPassAccuracy' // High priority
  ];

  availableMetrics.forEach(metric => {
    defaultState[metric.id] = defaultMetricIds.includes(metric.id);
  });
  return defaultState as CardOptions;
};

interface ShareableCardGeneratorProps {
  runData?: WeeklyPerformance | null;
  allRunsData?: WeeklyPerformance[] | null;
  isOpen: boolean;
  onClose: () => void;
  userScreenName: string;
}

const ShareableCardGenerator: React.FC<ShareableCardGeneratorProps> = ({
  runData,
  allRunsData,
  isOpen,
  onClose,
  userScreenName,
}) => {
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { currentTheme } = useTheme();
  const [options, setOptions] = useState<CardOptions>(getDefaultOptions());
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const cardType = useMemo(() => (runData ? 'run' : 'overall'), [runData]);

  // Calculate active stat count for dynamic height
  const activeStatCount = useMemo(() => {
    return availableMetrics.filter(m => {
        const isRelevant = !( (cardType === 'run' && m.overallOnly) || (cardType === 'overall' && m.runOnly) );
        return isRelevant && options[m.id];
    }).length;
  }, [options, cardType]);

  // Determine rows: Initial 2 rows (Header/Playstyle) + stats rows
  const initialRows = 2;
  const statsRows = Math.ceil(Math.max(1, activeStatCount) / 3);
  const totalRows = initialRows + statsRows;


  // FIX 2: Real-time generation logic (uses debounce for performance)
  const generateImage = useCallback(async () => {
    if (!cardContainerRef.current) return; 
    setIsLoading(true);
    setImageDataUrl(null);
    try {
      // Retain the explicit background color setting as it's more reliable than CSS variable parsing
      const cardBgColor = currentTheme.name === 'dark' ? '#1E293B' : '#FFFFFF'; 

      // NEW FIX: Get actual dimensions to explicitly pass to toJpeg
      const node = cardContainerRef.current;
      const width = node.offsetWidth;
      const height = node.offsetHeight;

      const dataUrl = await toJpeg(node, { 
        quality: 0.95,
        backgroundColor: cardBgColor,
        pixelRatio: 2,
        cacheBust: true,
        foreignObjectRendering: true, 
        // Explicitly set dimensions based on rendered component
        width: width, 
        height: height,
      });
      setImageDataUrl(dataUrl);
    } catch (error: any) {
      console.error('Error generating image:', error);
      // Enhanced toast message to reflect the likely CORS/rendering issue
      toast({ title: "Image Generation Failed", description: "Could not generate card image. This often happens if player images or remote styles fail to load.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [currentTheme.name, toast]); // Added toast to dependency array

  // --- Real-Time Update Trigger ---
  useEffect(() => {
    if (isOpen) {
        setImageDataUrl(null); // Clear old image instantly
        const timer = setTimeout(() => {
            // Check if there are any active stats before attempting generation
            if (activeStatCount > 0) {
                 generateImage();
            } else if (activeStatCount === 0) {
                 setIsLoading(false);
            }
        }, 500); // Debounce time
        return () => clearTimeout(timer);
    }
  }, [options, isOpen, cardType, generateImage, activeStatCount]); // Trigger on option change

  // Initial setup and reset
  useEffect(() => {
    if (isOpen) {
      setOptions(getDefaultOptions());
      setImageDataUrl(null);
    }
  }, [isOpen, cardType]);

  const handleOptionsChange = useCallback((optionKey: keyof CardOptions, value: boolean) => {
    setOptions((prev) => ({ ...prev, [optionKey]: value }));
    // Real-time update is handled by the useEffect dependency on `options`
  }, []);

  const saveImage = useCallback(() => {
    if (!imageDataUrl) return;
    const filename = runData ? `FUTTrackr_Run_${runData.week_number}.jpg` : 'FUTTrackr_Overall_Stats.jpg';
    saveAs(imageDataUrl, filename);
  }, [imageDataUrl, runData]);

  const shareImage = useCallback(async () => {
     if (!imageDataUrl) return;
     try {
         const response = await fetch(imageDataUrl);
         const blob = await response.blob();
         const file = new File([blob], runData ? `FUTTrackr_Run_${runData.week_number}.jpg` : 'FUTTrackr_Overall_Stats.jpg', { type: blob.type });

         if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
             await navigator.share({
                 title: `My FUT Champs Stats | FUTTrackr`,
                 text: `Check out my ${runData ? `Week ${runData.week_number}` : 'overall'} stats tracked via FUTTrackr.com! #FUTTrackr #FUTChamps`,
                 files: [file],
             });
         } else {
             toast({ title: "Web Share Not Supported", description: "Save the image and share it manually.", variant: "default" });
         }
     } catch (error: any) {
         console.error('Error sharing:', error);
         if (String(error).includes('AbortError')) return;
         toast({ title: "Error Sharing", description: error?.message || String(error), variant: "destructive" });
     }
  }, [imageDataUrl, runData, toast]);

  // Determine the dynamic height style
  const rowHeight = 110;
  const totalHeight = 32 + (totalRows * rowHeight);
  const dynamicHeightStyle = {
    height: `${totalHeight}px`,
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl sm:max-w-2xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl h-[90vh] flex flex-col p-4 sm:p-6">
            <DialogHeader>
                <DialogTitle>Create Your {cardType === 'run' ? `Run ${runData?.week_number}` : 'Overall'} Stat Card</DialogTitle>
                <DialogDescription>
                    Select up to 6 key stats for a square card, or add more to automatically extend the length.
                </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mt-2 flex-1 overflow-hidden">

                {/* --- Column 1: Customizer --- */}
                <div className="md:col-span-1 overflow-y-auto pr-3 custom-scrollbar border-r border-border/50 md:pr-4 lg:pr-6">
                    <h3 className="text-lg font-semibold mb-2 text-white sticky top-0 bg-background z-10 pb-2 -mt-1 pt-1">Customize Card ({activeStatCount} Active)</h3>
                     <CardCustomizer
                        options={options}
                        onChange={handleOptionsChange}
                        availableMetrics={availableMetrics}
                        cardType={cardType}
                     />
                </div>

                {/* --- Column 2: Preview & Actions --- */}
                <div className="md:col-span-2 flex flex-col items-center justify-start gap-4 overflow-y-auto pt-2 pl-2 md:pl-0">
                     {/* Preview Container (Dynamic Height) */}
                     <div
                        ref={cardContainerRef}
                        className="w-full max-w-[400px] border border-border/50 rounded-lg overflow-hidden shadow-lg bg-card flex-shrink-0 relative"
                        style={dynamicHeightStyle}
                     >
                         {isLoading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                         )}
                         {/* The element to capture */}
                         <div className="h-full w-full"> 
                             <CardPreview
                                 runData={runData}
                                 allRunsData={allRunsData}
                                 options={options}
                                 cardType={cardType}
                                 userScreenName={userScreenName}
                                 activeStatCount={activeStatCount}
                                 totalRows={totalRows}
                             />
                         </div>
                     </div>
                     {/* Action Buttons */}
                     <div className="flex flex-wrap justify-center gap-2 mt-2 flex-shrink-0">
                         <Button onClick={saveImage} disabled={!imageDataUrl || isLoading} size="sm">
                             <Download className="h-4 w-4 mr-1 sm:mr-2" /> Save JPEG
                         </Button>
                         <Button onClick={shareImage} disabled={!imageDataUrl || isLoading} size="sm">
                             <Share2 className="h-4 w-4 mr-1 sm:mr-2" /> Share
                         </Button>
                    </div>
                    {isLoading && <p className="text-xs text-primary mt-1 flex-shrink-0 text-center">Generating image...</p>}
                    {!imageDataUrl && !isLoading && activeStatCount > 0 && <p className="text-xs text-muted-foreground mt-1 flex-shrink-0 text-center">Toggle options to generate a live preview.</p>}
                    {!imageDataUrl && !isLoading && activeStatCount === 0 && <p className="text-xs text-destructive mt-1 flex-shrink-0 text-center font-semibold">Please select at least one metric to generate the card.</p>}
                </div>
            </div>
        </DialogContent>
    </Dialog>
  );
};

export default ShareableCardGenerator;
