
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/hooks/useTheme';
import { GameResult, PlayerPerformance } from '@/types/futChampions';
import { Trophy, Target, TrendingUp, TrendingDown, Star, Clock } from 'lucide-react';

interface GameCompletionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  gameData: GameResult;
}

const GameCompletionPopup = ({ isOpen, onClose, gameData }: GameCompletionPopupProps) => {
  const { currentTheme } = useTheme();

  const isWin = gameData.result === 'win';
  const goals = gameData.teamStats.actualGoals;
  const conceded = gameData.teamStats.actualGoalsAgainst;
  const xg = gameData.teamStats.expectedGoals;
  const xga = gameData.teamStats.expectedGoalsAgainst;
  
  const xgPerformance = xg > 0 ? ((goals - xg) / xg) * 100 : 0;
  const xgaPerformance = xga > 0 ? ((conceded - xga) / xga) * 100 : 0;

  const topPerformer = gameData.playerStats.reduce((prev, current) => 
    prev.rating > current.rating ? prev : current
  );

  const worstPerformer = gameData.playerStats.reduce((prev, current) => 
    prev.rating < current.rating ? prev : current
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in" 
                     style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl" style={{ color: currentTheme.colors.text }}>
            <div className={`p-3 rounded-2xl ${isWin ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              {isWin ? <Trophy className="h-6 w-6 text-green-400" /> : <Target className="h-6 w-6 text-red-400" />}
            </div>
            Game {gameData.gameNumber} Complete: {gameData.scoreLine}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Result Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-6 rounded-2xl" 
                 style={{ backgroundColor: isWin ? '#10b98120' : '#ef444420' }}>
              <div className="text-3xl font-bold mb-2" style={{ color: isWin ? '#10b981' : '#ef4444' }}>
                {isWin ? 'VICTORY' : 'DEFEAT'}
              </div>
              <Badge variant={isWin ? 'default' : 'destructive'} className="text-lg px-4 py-2">
                {gameData.scoreLine}
              </Badge>
            </div>

            <div className="p-6 rounded-2xl" style={{ backgroundColor: currentTheme.colors.surface }}>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span style={{ color: currentTheme.colors.muted }}>Opponent Skill</span>
                  <span className="font-bold" style={{ color: currentTheme.colors.text }}>
                    {gameData.opponentSkill}/10
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: currentTheme.colors.muted }}>Duration</span>
                  <span className="font-bold" style={{ color: currentTheme.colors.text }}>
                    {gameData.duration}min
                  </span>
                </div>
                {gameData.gameRating && (
                  <div className="flex justify-between items-center">
                    <span style={{ color: currentTheme.colors.muted }}>Game Rating</span>
                    <Badge variant="outline" style={{ borderColor: currentTheme.colors.border }}>
                      {gameData.gameRating}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* XG Analysis */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl" style={{ backgroundColor: currentTheme.colors.surface }}>
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-4 w-4" style={{ color: currentTheme.colors.primary }} />
                <span className="font-medium" style={{ color: currentTheme.colors.text }}>XG Performance</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span style={{ color: currentTheme.colors.muted }}>Goals vs XG</span>
                  <span style={{ color: currentTheme.colors.text }}>{goals} vs {xg.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-2">
                  {xgPerformance > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-400" />
                  )}
                  <span className={`text-sm ${xgPerformance > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {xgPerformance > 0 ? '+' : ''}{xgPerformance.toFixed(1)}% vs Expected
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl" style={{ backgroundColor: currentTheme.colors.surface }}>
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-4 w-4" style={{ color: currentTheme.colors.secondary }} />
                <span className="font-medium" style={{ color: currentTheme.colors.text }}>XGA Performance</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span style={{ color: currentTheme.colors.muted }}>Conceded vs XGA</span>
                  <span style={{ color: currentTheme.colors.text }}>{conceded} vs {xga.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-2">
                  {xgaPerformance < 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-400" />
                  )}
                  <span className={`text-sm ${xgaPerformance < 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {xgaPerformance > 0 ? '+' : ''}{xgaPerformance.toFixed(1)}% vs Expected
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Player Highlights */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: currentTheme.colors.text }}>
              Player Highlights
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border-2 border-green-500/30" style={{ backgroundColor: currentTheme.colors.surface }}>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-green-400" />
                  <span className="font-medium text-green-400">Man of the Match</span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold" style={{ color: currentTheme.colors.text }}>
                      {topPerformer.name}
                    </p>
                    <p className="text-sm" style={{ color: currentTheme.colors.muted }}>
                      {topPerformer.position}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">
                      {topPerformer.rating.toFixed(1)}
                    </div>
                    <div className="text-xs" style={{ color: currentTheme.colors.muted }}>
                      {topPerformer.goals}G {topPerformer.assists}A
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border-2 border-red-500/30" style={{ backgroundColor: currentTheme.colors.surface }}>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-red-400" />
                  <span className="font-medium text-red-400">Needs Improvement</span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold" style={{ color: currentTheme.colors.text }}>
                      {worstPerformer.name}
                    </p>
                    <p className="text-sm" style={{ color: currentTheme.colors.muted }}>
                      {worstPerformer.position}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-400">
                      {worstPerformer.rating.toFixed(1)}
                    </div>
                    <div className="text-xs" style={{ color: currentTheme.colors.muted }}>
                      {worstPerformer.goals}G {worstPerformer.assists}A
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="p-4 rounded-xl" style={{ backgroundColor: currentTheme.colors.surface }}>
            <h4 className="font-medium mb-2" style={{ color: currentTheme.colors.text }}>
              Quick Insights
            </h4>
            <div className="space-y-2 text-sm" style={{ color: currentTheme.colors.muted }}>
              {xgPerformance > 10 && <p>✅ Excellent finishing - you outperformed your expected goals!</p>}
              {xgPerformance < -20 && <p>⚠️ Consider working on finishing - you underperformed your XG significantly.</p>}
              {xgaPerformance < -15 && <p>🛡️ Solid defensive performance - conceded less than expected!</p>}
              {gameData.teamStats.possession > 60 && <p>⚽ Dominated possession with {gameData.teamStats.possession}%</p>}
              {topPerformer.rating >= 9.0 && <p>⭐ Outstanding individual performance from {topPerformer.name}!</p>}
            </div>
          </div>

          <Button onClick={onClose} className="w-full py-3" style={{ backgroundColor: currentTheme.colors.primary, color: '#ffffff' }}>
            Continue Playing
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GameCompletionPopup;
