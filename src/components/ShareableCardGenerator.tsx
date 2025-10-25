import React, { useState, useRef, useCallback } from 'react';
import { toJpeg } from 'html-to-image';
import { saveAs } from 'file-saver';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'; //
import { Button } from '@/components/ui/button'; //
import { Loader2, Camera, Download, Share2 } from 'lucide-react';
import CardPreview from './CardPreview'; // We will create this
import CardCustomizer from './CardCustomizer'; // We will create this
import { WeeklyPerformance } from '@/types/futChampions'; //
import { useToast } from '@/hooks/use-toast'; //
import { useTheme } from '@/hooks/useTheme'; //

// Define structure for options (Expand this significantly!)
export interface CardOptions {
  showRecord: boolean;
  showWinRate: boolean;
  showGoalsForAgainst: boolean;
  showTopScorer: boolean;
  showTopPlaymaker: boolean;
  showXGStats: boolean;
  // --- TODO: Add ALL other togglable metrics/sections ---
  // e.g., showAvgPossession, showPassAccuracy, showBestRank, showLongestStreak, etc.
}

// --- TODO: Define the full list of available metrics for the customizer ---
export const availableMetrics = [
    { id: 'showRecord', label: 'Record (W-L)', group: 'General' },
    { id: 'showWinRate', label: 'Win Rate %', group: 'General' },
    { id: 'showGoalsForAgainst', label: 'Goals For/Against', group: 'General' },
    { id: 'showTopScorer', label: 'Top Scorer', group: 'Players' },
    { id: 'showTopPlaymaker', label: 'Top Playmaker', group: 'Players' },
    { id: 'showXGStats', label: 'Expected Goals (xG)', group: 'Team Stats' },
    // Add many more based on WeeklyPerformance and aggregated stats
];

interface ShareableCardGeneratorProps {
  runData?: WeeklyPerformance | null; // For single run
  allRunsData?: WeeklyPerformance[] | null; // For overall stats
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
  const { currentTheme } = useTheme(); // Get theme for background color
  const [options, setOptions] = useState<CardOptions>({
    // --- TODO: Set sensible default options ---
    showRecord: true,
    showWinRate: true,
    showGoalsForAgainst: true,
    showTopScorer: true,
    showTopPlaymaker: true,
    showXGStats: false,
    // ... other defaults ...
  });
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOptionsChange = useCallback((optionKey: keyof CardOptions, value: boolean) => {
    setOptions((prev) => ({ ...prev, [optionKey]: value }));
    setImageDataUrl(null); // Clear preview when options change
  }, []);

  const generateImage = useCallback(async () => {
    if (!cardPreviewRef.current) return;
    setIsLoading(true);
    setImageDataUrl(null);
    try {
      // Determine background color based on theme
      // This is an approximation, adjust as needed or pass theme vars
      const bgColor = currentTheme.name === 'dark' ? '#1b2133' : '#ffffff'; // Example dark/light

      const dataUrl = await toJpeg(cardPreviewRef.current, {
        quality: 0.95,
        backgroundColor: bgColor,
        // Increase pixelRatio for higher resolution images (especially on retina displays)
        pixelRatio: 2,
        // Style might be needed if fonts/images aren't rendering correctly
        // style: { /* CSS overrides if necessary */ }
      });
      setImageDataUrl(dataUrl);
      toast({ title: "Preview Generated!" });
    } catch (error) {
      console.error('Error generating image:', error);
      toast({ title: "Error Generating Image", description: String(error), variant: "destructive" });
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
                title: 'My FUT Champs Stats | FUT Trackr',
                text: `Check out my ${runData ? `Week ${runData.week_number}` : 'overall'} stats tracked via FUTTrackr.com! #FUTTrackr #FUTChamps`,
                files: [file],
            });
            toast({ title: "Shared successfully!" });
        } else {
            toast({ title: "Web Share Not Supported", description: "Save the image and share it manually.", variant: "default" });
            // Consider showing manual share links (Twitter, Reddit etc.)
        }
    } catch (error) {
        console.error('Error sharing:', error);
        if (String(error).includes('AbortError')) return; // User cancelled share
        toast({ title: "Error Sharing", description: String(error), variant: "destructive" });
    }
  }, [imageDataUrl, runData, toast]);

  const cardType = runData ? 'run' : 'overall';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl sm:max-w-2xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl h-[90vh] flex flex-col"> {/* Adjust size & height */}
            <DialogHeader>
                <DialogTitle>Create Your {cardType === 'run' ? `Run ${runData?.week_number}` : 'Overall'} Stat Card</DialogTitle>
                <DialogDescription>
                    Select the stats you want to display, generate a preview, then save or share!
                </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 flex-1 overflow-hidden"> {/* flex-1 and overflow */}

                {/* --- Column 1: Customizer --- */}
                <div className="md:col-span-1 overflow-y-auto pr-3 custom-scrollbar"> {/* Ensure scrollbar */}
                    <h3 className="text-lg font-semibold mb-3 text-white sticky top-0 bg-background z-10 pb-2">Customize Card</h3> {/* Sticky header */}
                     <CardCustomizer
                        options={options}
                        onChange={handleOptionsChange}
                        availableMetrics={availableMetrics}
                        cardType={cardType}
                     />
                </div>

                {/* --- Column 2: Preview & Actions --- */}
                <div className="md:col-span-2 flex flex-col items-center justify-start gap-4 overflow-y-auto"> {/* Allow scroll if needed */}
                     {/* Preview Container with fixed aspect ratio */}
                     <div className="w-full max-w-[320px] aspect-[9/16] border border-border/50 rounded-lg overflow-hidden shadow-lg bg-card flex-shrink-0"> {/* Use bg-card, flex-shrink-0 */}
                         {/* The element to capture */}
                         <div ref={cardPreviewRef} className="h-full w-full">
                            {/* Pass data down */}
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
                             {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Camera className="h-4 w-4 mr-2" />}
                             {imageDataUrl ? 'Regenerate Preview' : 'Generate Preview'}
                         </Button>
                         <Button onClick={saveImage} disabled={!imageDataUrl || isLoading} size="sm">
                             <Download className="h-4 w-4 mr-2" /> Save JPEG
                         </Button>
                         <Button onClick={shareImage} disabled={!imageDataUrl || isLoading} size="sm">
                             <Share2 className="h-4 w-4 mr-2" /> Share
                         </Button>
                    </div>
                    {!imageDataUrl && !isLoading && <p className="text-xs text-muted-foreground mt-1 flex-shrink-0">Generate a preview to save or share.</p>}
                    {isLoading && <p className="text-xs text-primary mt-1 flex-shrink-0">Generating image...</p>}
                </div>
            </div>
        </DialogContent>
    </Dialog>
  );
};

export default ShareableCardGenerator;
