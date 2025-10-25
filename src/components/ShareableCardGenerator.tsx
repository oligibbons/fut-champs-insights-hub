import React, { useState, useRef, useCallback, useMemo } from 'react';
import { toJpeg } from 'html-to-image';
import { saveAs } from 'file-saver';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'; //
import { Button } from '@/components/ui/button'; //
import { Loader2, Camera, Download, Share2 } from 'lucide-react';
import CardPreview from './CardPreview'; // We will create this
import CardCustomizer from './CardCustomizer'; // We will create this
import { WeeklyPerformance, PlayerPerformance } from '@/types/futChampions'; //
import { useToast } from '@/hooks/use-toast'; //
import { useTheme } from '@/hooks/useTheme'; //

// Define structure for options
export interface CardOptions {
  // General
  showRecord: boolean;
  showWinRate: boolean;
  showGoalsScored: boolean;
  showGoalsConceded: boolean;
  showGoalDifference: boolean;
  showGamesPlayed: boolean;
  showAvgServerQuality: boolean;
  showAvgStressLevel: boolean;

  // Team Stats
  showAvgPossession: boolean;
  showPassAccuracy: boolean;
  showShotAccuracy: boolean;
  showDribbleAccuracy: boolean;
  showXGFor: boolean;
  showXGAgainst: boolean;
  showXGDifferential: boolean;
  showPassesPer90: boolean;
  showGoalsPer90: boolean;

  // Player Stats
  showHighestRatedPlayer: boolean;
  showAveragePlayerRating: boolean;
  showHighestScorer: boolean;
  showHighestAssister: boolean;
  showCleanSheets: boolean; // Overall only
  showClubLegends: boolean; // Overall only

  // Streaks & Records
  showWinStreak: boolean;
  showLossStreak: boolean; // Overall only
  showBestRecord: boolean; // Overall only
  showWorstRecord: boolean; // Overall only

  // Analysis
  showCPS: boolean; // Run only
  showRageQuits: boolean;
  showFormationsUsed: boolean;
  showFavouriteFormation: boolean; // Overall only
  showMatchTagAnalysis: boolean;

  // Overall Profile Only
  showTotalRuns: boolean;
  showAverageWins: boolean;
  showTotalPlayersUsed: boolean;
  showTotalFormationsUsed: boolean;
}

// Define available metrics for the customizer
export interface MetricDefinition {
  id: keyof CardOptions;
  label: string;
  group: 'General' | 'Team Stats' | 'Player Stats' | 'Streaks & Records' | 'Analysis' | 'Overall Profile';
  runOnly?: boolean;
  overallOnly?: boolean;
}

export const availableMetrics: MetricDefinition[] = [
  // General
  { id: 'showRecord', label: 'Record (W-L)', group: 'General' },
  { id: 'showWinRate', label: 'Win Rate %', group: 'General' },
  { id: 'showGoalsScored', label: 'Goals Scored', group: 'General' },
  { id: 'showGoalsConceded', label: 'Goals Conceded', group: 'General' },
  { id: 'showGoalDifference', label: 'Goal Difference', group: 'General' },
  { id: 'showGamesPlayed', label: 'Games Played', group: 'General' },
  { id: 'showAvgServerQuality', label: 'Avg. Server Quality', group: 'General' },
  { id: 'showAvgStressLevel', label: 'Avg. Stress Level', group: 'General' },

  // Team Stats
  { id: 'showAvgPossession', label: 'Avg. Possession %', group: 'Team Stats' },
  { id: 'showPassAccuracy', label: 'Avg. Pass Accuracy %', group: 'Team Stats' },
  { id: 'showShotAccuracy', label: 'Avg. Shot Accuracy %', group: 'Team Stats' },
  { id: 'showDribbleAccuracy', label: 'Avg. Dribble Success %', group: 'Team Stats' },
  { id: 'showXGFor', label: 'Avg. Expected Goals (xG)', group: 'Team Stats' },
  { id: 'showXGAgainst', label: 'Avg. Expected Goals Against (xGA)', group: 'Team Stats' },
  { id: 'showXGDifferential', label: 'Avg. xG Differential', group: 'Team Stats' },
  { id: 'showPassesPer90', label: 'Avg. Passes per 90', group: 'Team Stats' },
  { id: 'showGoalsPer90', label: 'Avg. Goals per 90', group: 'Team Stats' },

  // Player Stats
  { id: 'showHighestRatedPlayer', label: 'MVP (Highest Avg Rating)', group: 'Player Stats' },
  { id: 'showAveragePlayerRating', label: 'Avg. Player Rating (Team)', group: 'Player Stats' },
  { id: 'showHighestScorer', label: 'Top Scorer', group: 'Player Stats' },
  { id: 'showHighestAssister', label: 'Top Assister', group: 'Player Stats' },
  { id: 'showCleanSheets', label: 'Clean Sheets', group: 'Player Stats', overallOnly: true },
  { id: 'showClubLegends', label: 'Club Legends (Top 3)', group: 'Player Stats', overallOnly: true },

  // Streaks & Records
  { id: 'showWinStreak', label: 'Best Win Streak', group: 'Streaks & Records' },
  { id: 'showLossStreak', label: 'Worst Loss Streak', group: 'Streaks & Records', overallOnly: true },
  { id: 'showBestRecord', label: 'Best Run Record', group: 'Streaks & Records', overallOnly: true },
  { id: 'showWorstRecord', label: 'Worst Run Record', group: 'Streaks & Records', overallOnly: true },

  // Analysis
  { id: 'showCPS', label: 'Champs Player Score (CPS)', group: 'Analysis', runOnly: true },
  { id: 'showRageQuits', label: 'Rage Quits (Yours + Opponent)', group: 'Analysis' },
  { id: 'showFormationsUsed', label: 'Formations Used', group: 'Analysis' },
  { id: 'showFavouriteFormation', label: 'Favourite Formation', group: 'Analysis', overallOnly: true },
  { id: 'showMatchTagAnalysis', label: 'Key Match Tags (Top 3)', group: 'Analysis' },

  // Overall Profile Only
  { id: 'showTotalRuns', label: 'Total Runs Tracked', group: 'Overall Profile', overallOnly: true },
  { id: 'showAverageWins', label: 'Average Wins per Run', group: 'Overall Profile', overallOnly: true },
  { id: 'showTotalPlayersUsed', label: 'Total Unique Players Used', group: 'Overall Profile', overallOnly: true },
  { id: 'showTotalFormationsUsed', label: 'Total Unique Formations Used', group: 'Overall Profile', overallOnly: true },
];

// Define initial state based on availableMetrics (setting defaults)
const getDefaultOptions = (): CardOptions => {
  const defaultState: Partial<CardOptions> = {};
  availableMetrics.forEach(metric => {
    // Sensible defaults (adjust as needed)
    let isOnByDefault = true;
    if (metric.group === 'Team Stats' && !['showPassAccuracy', 'showShotAccuracy'].includes(metric.id)) isOnByDefault = false;
    if (metric.group === 'Analysis' || metric.group === 'Streaks & Records') isOnByDefault = false;
    if (metric.overallOnly || metric.runOnly) isOnByDefault = false; // Start specific ones off
    if (['showRecord', 'showWinRate', 'showGoalsScored', 'showGoalsConceded', 'showHighestScorer', 'showHighestAssister'].includes(metric.id)) isOnByDefault = true; // Key stats on

    defaultState[metric.id] = isOnByDefault;
  });
  return defaultState as CardOptions;
};

interface ShareableCardGeneratorProps {
  runData?: WeeklyPerformance | null;
  allRunsData?: WeeklyPerformance[] | null;
  isOpen: boolean;
  onClose: () => void;
}

const ShareableCardGenerator: React.FC<ShareableCardGeneratorProps> = ({
  runData,
  allRunsData,
  isOpen,
  onClose,
}) => {
  const cardPreviewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { currentTheme } = useTheme();
  const [options, setOptions] = useState<CardOptions>(getDefaultOptions());
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const cardType = useMemo(() => (runData ? 'run' : 'overall'), [runData]);

  // Reset options when modal opens or card type changes
  useEffect(() => {
    if (isOpen) {
      const defaults = getDefaultOptions();
      // Adjust defaults based on card type if needed
      setOptions(defaults);
      setImageDataUrl(null); // Clear image on open
    }
  }, [isOpen, cardType]);

  const handleOptionsChange = useCallback((optionKey: keyof CardOptions, value: boolean) => {
    setOptions((prev) => ({ ...prev, [optionKey]: value }));
    setImageDataUrl(null); // Clear preview when options change
  }, []);

  const generateImage = useCallback(async () => {
    if (!cardPreviewRef.current) return;
    setIsLoading(true);
    setImageDataUrl(null);
    try {
      const bgColor = window.getComputedStyle(document.documentElement).getPropertyValue('--background').trim();
      // Convert HSL string (like '225 30% 12%') to CSS hsl() function
      const cssBgColor = `hsl(${bgColor.replace(/ /g, ', ')})`;

      const dataUrl = await toJpeg(cardPreviewRef.current, {
        quality: 0.95,
        backgroundColor: cssBgColor || (currentTheme.name === 'dark' ? '#151a28' : '#ffffff'), // Fallback
        pixelRatio: 2, // Higher resolution
        // Add a slight delay for complex elements/fonts to render
        // skipAutoScale: true, // Try if scaling issues occur
        // cacheBust: true, // Force re-render
      });
      setImageDataUrl(dataUrl);
      toast({ title: "Preview Generated!" });
    } catch (error: any) {
      console.error('Error generating image:', error);
      toast({ title: "Error Generating Image", description: error?.message || String(error), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast, currentTheme.name]);

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
             // No toast needed here, share sheet handles confirmation/cancellation
         } else {
             toast({ title: "Web Share Not Supported", description: "Save the image and share it manually.", variant: "default" });
         }
     } catch (error: any) {
         console.error('Error sharing:', error);
         if (String(error).includes('AbortError')) return; // User cancelled share
         toast({ title: "Error Sharing", description: error?.message || String(error), variant: "destructive" });
     }
  }, [imageDataUrl, runData, toast]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl sm:max-w-2xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl h-[90vh] flex flex-col p-4 sm:p-6"> {/* Added padding */}
            <DialogHeader>
                <DialogTitle>Create Your {cardType === 'run' ? `Run ${runData?.week_number}` : 'Overall'} Stat Card</DialogTitle>
                <DialogDescription>
                    Select the stats to display, generate a preview, then save or share!
                </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mt-2 flex-1 overflow-hidden"> {/* Reduced gap, mt */}

                {/* --- Column 1: Customizer --- */}
                <div className="md:col-span-1 overflow-y-auto pr-3 custom-scrollbar border-r border-border/50 md:pr-4 lg:pr-6"> {/* Added border */}
                    <h3 className="text-lg font-semibold mb-2 text-white sticky top-0 bg-background z-10 pb-2 -mt-1 pt-1">Customize Card</h3> {/* Adjust sticky padding */}
                     <CardCustomizer
                        options={options}
                        onChange={handleOptionsChange}
                        availableMetrics={availableMetrics}
                        cardType={cardType}
                     />
                </div>

                {/* --- Column 2: Preview & Actions --- */}
                <div className="md:col-span-2 flex flex-col items-center justify-start gap-4 overflow-y-auto pt-2 pl-2 md:pl-0"> {/* Allow scroll */}
                     {/* Preview Container */}
                     <div className="w-full max-w-[300px] sm:max-w-[320px] aspect-[9/16] border border-border/50 rounded-lg overflow-hidden shadow-lg bg-card flex-shrink-0 relative"> {/* Use bg-card */}
                         {/* Loading/Error Overlay? */}
                         {isLoading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                         )}
                         {/* The element to capture */}
                         <div ref={cardPreviewRef} className="h-full w-full">
                             <CardPreview
                                 runData={runData}
                                 allRunsData={allRunsData}
                                 options={options}
                                 cardType={cardType}
                             />
                         </div>
                     </div>
                     {/* Action Buttons */}
                     <div className="flex flex-wrap justify-center gap-2 mt-2 flex-shrink-0">
                         <Button onClick={generateImage} disabled={isLoading} variant="outline" size="sm">
                             <Camera className="h-4 w-4 mr-1 sm:mr-2" />
                             {imageDataUrl ? 'Regenerate' : 'Generate'} Preview
                         </Button>
                         <Button onClick={saveImage} disabled={!imageDataUrl || isLoading} size="sm">
                             <Download className="h-4 w-4 mr-1 sm:mr-2" /> Save JPEG
                         </Button>
                         <Button onClick={shareImage} disabled={!imageDataUrl || isLoading} size="sm">
                             <Share2 className="h-4 w-4 mr-1 sm:mr-2" /> Share
                         </Button>
                    </div>
                    {!imageDataUrl && !isLoading && <p className="text-xs text-muted-foreground mt-1 flex-shrink-0 text-center">Generate a preview to save or share.</p>}
                </div>
            </div>
        </DialogContent>
    </Dialog>
  );
};

export default ShareableCardGenerator;
