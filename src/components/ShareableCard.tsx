import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WeeklyPerformance, GameResult } from '@/types/futChampions';
import { Share2, Download, Twitter, Facebook, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as htmlToImage from 'html-to-image';

interface ShareableCardProps {
  weekData?: WeeklyPerformance;
  gameData?: GameResult;
  type: 'week' | 'game';
}

const ShareableCard = ({ weekData, gameData, type }: ShareableCardProps) => {
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateImage = async () => {
    if (!cardRef.current) return;
    
    setIsGenerating(true);
    
    try {
      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        quality: 0.95,
        backgroundColor: '#000'
      });
      
      // Download the image
      const link = document.createElement('a');
      link.download = `futalyst-${type}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
      
      toast({
        title: "Image Generated",
        description: "Your shareable card has been downloaded.",
      });
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate shareable image.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (!cardRef.current) return;
    
    try {
      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        quality: 0.95,
        backgroundColor: '#000'
      });
      
      // Create a blob from the data URL
      const blob = await fetch(dataUrl).then(res => res.blob());
      
      // Copy to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob
        })
      ]);
      
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      
      toast({
        title: "Copied to Clipboard",
        description: "Image copied to clipboard. You can now paste it anywhere.",
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: "Copy Failed",
        description: "Failed to copy image to clipboard.",
        variant: "destructive"
      });
    }
  };

  const shareToTwitter = async () => {
    if (!cardRef.current) return;
    
    try {
      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        quality: 0.95,
        backgroundColor: '#000'
      });
      
      // Create tweet text
      let tweetText = '';
      
      if (type === 'week' && weekData) {
        tweetText = `Just finished my FUT Champions week with ${weekData.totalWins} wins! Check out my stats on FUTALYST! #FIFA #FUTChampions`;
      } else if (type === 'game' && gameData) {
        tweetText = `Just ${gameData.result === 'win' ? 'won' : 'played'} a FUT Champions game ${gameData.scoreLine}! #FIFA #FUTChampions`;
      }
      
      // Open Twitter share dialog
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent('https://futalyst.com')}`, '_blank');
    } catch (error) {
      console.error('Error sharing to Twitter:', error);
      toast({
        title: "Share Failed",
        description: "Failed to share to Twitter.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Share2 className="h-5 w-5 text-fifa-blue" />
          Share Your Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Shareable Card Preview */}
        <div className="overflow-hidden rounded-xl border border-white/20">
          <div 
            ref={cardRef}
            className="shareable-card"
          >
            <div className="shareable-card-overlay"></div>
            <div className="shareable-card-content">
              <div className="shareable-card-header">
                <img 
                  src="/lovable-uploads/6b6465f4-e466-4f3b-9761-8a829fbe395c.png" 
                  alt="FUTALYST Logo" 
                  className="shareable-card-logo"
                />
                <div className="text-sm text-white/70">
                  {new Date().toLocaleDateString()}
                </div>
              </div>
              
              <h1 className="shareable-card-title">
                {type === 'week' && weekData 
                  ? `Week ${weekData.weekNumber} Summary` 
                  : type === 'game' && gameData
                  ? `Game ${gameData.gameNumber} Result`
                  : 'FUTALYST Stats'
                }
              </h1>
              
              <div className="shareable-card-stats">
                {type === 'week' && weekData ? (
                  <>
                    <div className="shareable-card-stat">
                      <div className="shareable-card-stat-value">{weekData.totalWins}</div>
                      <div className="shareable-card-stat-label">Wins</div>
                    </div>
                    <div className="shareable-card-stat">
                      <div className="shareable-card-stat-value">{weekData.totalGoals}</div>
                      <div className="shareable-card-stat-label">Goals</div>
                    </div>
                    <div className="shareable-card-stat">
                      <div className="shareable-card-stat-value">
                        {weekData.games.length > 0 
                          ? `${(weekData.totalWins / weekData.games.length * 100).toFixed(0)}%` 
                          : '0%'
                        }
                      </div>
                      <div className="shareable-card-stat-label">Win Rate</div>
                    </div>
                  </>
                ) : type === 'game' && gameData ? (
                  <>
                    <div className="shareable-card-stat">
                      <div className="shareable-card-stat-value">{gameData.scoreLine}</div>
                      <div className="shareable-card-stat-label">Score</div>
                    </div>
                    <div className="shareable-card-stat">
                      <div className="shareable-card-stat-value">{gameData.result === 'win' ? 'Victory' : 'Defeat'}</div>
                      <div className="shareable-card-stat-label">Result</div>
                    </div>
                    <div className="shareable-card-stat">
                      <div className="shareable-card-stat-value">{gameData.opponentSkill}/10</div>
                      <div className="shareable-card-stat-label">Opponent Skill</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="shareable-card-stat">
                      <div className="shareable-card-stat-value">0</div>
                      <div className="shareable-card-stat-label">Wins</div>
                    </div>
                    <div className="shareable-card-stat">
                      <div className="shareable-card-stat-value">0</div>
                      <div className="shareable-card-stat-label">Goals</div>
                    </div>
                    <div className="shareable-card-stat">
                      <div className="shareable-card-stat-value">0%</div>
                      <div className="shareable-card-stat-label">Win Rate</div>
                    </div>
                  </>
                )}
              </div>
              
              {type === 'game' && gameData && gameData.playerStats && gameData.playerStats.length > 0 && (
                <div className="bg-black/30 p-4 rounded-xl">
                  <h3 className="text-xl font-bold text-white mb-3">Top Performers</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {gameData.playerStats
                      .sort((a, b) => b.rating - a.rating)
                      .slice(0, 3)
                      .map((player, index) => (
                        <div key={index} className="bg-white/10 p-3 rounded-lg">
                          <div className="font-bold text-white">{player.name}</div>
                          <div className="text-sm text-white/70">{player.position}</div>
                          <div className="mt-2 text-xl font-bold text-yellow-400">{player.rating.toFixed(1)}</div>
                          <div className="text-sm text-white/70">{player.goals}G {player.assists}A</div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
              
              <div className="shareable-card-footer">
                <div>Generated with FUTALYST</div>
                <div>futalyst.com</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Share Options */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Button
            onClick={generateImage}
            disabled={isGenerating}
            className="bg-fifa-blue hover:bg-fifa-blue/80"
          >
            {isGenerating ? (
              <>
                <Download className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download
              </>
            )}
          </Button>
          
          <Button
            onClick={copyToClipboard}
            variant="outline"
            className="border-fifa-purple text-fifa-purple hover:bg-fifa-purple/10"
          >
            {isCopied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </>
            )}
          </Button>
          
          <Button
            onClick={shareToTwitter}
            variant="outline"
            className="border-[#1DA1F2] text-[#1DA1F2] hover:bg-[#1DA1F2]/10"
          >
            <Twitter className="h-4 w-4 mr-2" />
            Twitter
          </Button>
          
          <Button
            onClick={() => {
              toast({
                title: "Coming Soon",
                description: "Facebook sharing will be available soon.",
              });
            }}
            variant="outline"
            className="border-[#1877F2] text-[#1877F2] hover:bg-[#1877F2]/10"
          >
            <Facebook className="h-4 w-4 mr-2" />
            Facebook
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShareableCard;