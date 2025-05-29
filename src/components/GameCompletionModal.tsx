
import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/hooks/useTheme';
import { GameResult } from '@/types/futChampions';
import { Trophy, Target, TrendingUp, Star, Calendar, Clock, Zap } from 'lucide-react';

interface GameCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: GameResult;
  weekStats: {
    totalGames: number;
    wins: number;
    losses: number;
    winRate: number;
    currentStreak: number;
  };
  insights: string[];
}

const GameCompletionModal = ({ isOpen, onClose, game, weekStats, insights }: GameCompletionModalProps) => {
  const { currentTheme } = useTheme();
  const [showInsights, setShowInsights] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShowInsights(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setShowInsights(false);
    }
  }, [isOpen]);

  const isWin = game.result === 'win';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-2xl rounded-3xl shadow-3xl border-0 p-0 overflow-hidden"
        style={{ backgroundColor: currentTheme.colors.cardBg }}
      >
        {/* Header with result */}
        <div className={`p-8 text-center relative overflow-hidden ${isWin ? 'bg-gradient-to-br from-green-500/20 to-emerald-600/20' : 'bg-gradient-to-br from-red-500/20 to-rose-600/20'}`}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="relative z-10">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${isWin ? 'bg-green-500/30' : 'bg-red-500/30'}`}>
              {isWin ? (
                <Trophy className="h-10 w-10 text-green-400" />
              ) : (
                <Target className="h-10 w-10 text-red-400" />
              )}
            </div>
            <h2 className={`text-4xl font-bold mb-2 ${isWin ? 'text-green-400' : 'text-red-400'}`}>
              {isWin ? 'Victory!' : 'Defeat'}
            </h2>
            <p className="text-xl font-semibold text-white mb-4">{game.scoreLine}</p>
            <div className="flex items-center justify-center gap-4">
              <Badge variant="outline" className="text-lg px-4 py-2">
                <Clock className="h-4 w-4 mr-2" />
                {game.duration} min
              </Badge>
              <Badge variant="outline" className="text-lg px-4 py-2">
                <Star className="h-4 w-4 mr-2" />
                vs {game.opponentSkill}/10
              </Badge>
            </div>
          </div>
        </div>

        {/* Week Stats */}
        <div className="p-6 border-b" style={{ borderColor: currentTheme.colors.border }}>
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Week Performance
          </h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: currentTheme.colors.primary }}>
                {weekStats.totalGames}
              </p>
              <p className="text-sm" style={{ color: currentTheme.colors.muted }}>Games</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{weekStats.wins}</p>
              <p className="text-sm" style={{ color: currentTheme.colors.muted }}>Wins</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">{weekStats.losses}</p>
              <p className="text-sm" style={{ color: currentTheme.colors.muted }}>Losses</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: currentTheme.colors.accent }}>
                {weekStats.currentStreak}
              </p>
              <p className="text-sm" style={{ color: currentTheme.colors.muted }}>Streak</p>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5" />
            AI Insights
          </h3>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-2xl border transition-all duration-500 transform ${
                  showInsights ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
                style={{ 
                  backgroundColor: currentTheme.colors.surface, 
                  borderColor: currentTheme.colors.border,
                  transitionDelay: `${index * 200}ms`
                }}
              >
                <p style={{ color: currentTheme.colors.text }}>{insight}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gradient-to-t from-black/10 to-transparent">
          <Button
            onClick={onClose}
            className="w-full text-lg py-6 rounded-2xl font-semibold"
            style={{ backgroundColor: currentTheme.colors.primary, color: '#ffffff' }}
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GameCompletionModal;
