
import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/hooks/useTheme';
import { GameResult } from '@/types/futChampions';
import { generateGameInsights } from '@/utils/aiInsights';
import { Trophy, Target, TrendingUp, Star, Calendar, Clock, Zap, Sparkles, Award } from 'lucide-react';

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
}

const GameCompletionModal = ({ isOpen, onClose, game, weekStats }: GameCompletionModalProps) => {
  const { currentTheme } = useTheme();
  const [showCelebration, setShowCelebration] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Generate AI insights
      const gameInsights = generateGameInsights(game, weekStats);
      setInsights(gameInsights);

      // Show celebration for wins
      if (game.result === 'win') {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }

      // Show insights after animation
      const timer = setTimeout(() => setShowInsights(true), 1500);
      return () => clearTimeout(timer);
    } else {
      setShowInsights(false);
      setShowCelebration(false);
    }
  }, [isOpen, game, weekStats]);

  const isWin = game.result === 'win';
  const [goalsFor, goalsAgainst] = game.scoreLine.split('-').map(Number);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-3xl rounded-3xl shadow-3xl border-0 p-0 overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: currentTheme.colors.cardBg }}
      >
        {/* Celebration Overlay */}
        {showCelebration && isWin && (
          <div className="absolute inset-0 z-50 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-green-500/20 to-blue-500/20 animate-pulse" />
            <div className="absolute top-10 left-10 text-6xl animate-bounce">🎉</div>
            <div className="absolute top-20 right-10 text-5xl animate-bounce" style={{ animationDelay: '0.2s' }}>⚡</div>
            <div className="absolute bottom-20 left-20 text-4xl animate-bounce" style={{ animationDelay: '0.4s' }}>🏆</div>
            <div className="absolute bottom-10 right-20 text-5xl animate-bounce" style={{ animationDelay: '0.6s' }}>✨</div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Sparkles className="h-20 w-20 text-yellow-400 animate-spin" />
            </div>
          </div>
        )}

        {/* Header with Enhanced Result Display */}
        <div className={`p-8 text-center relative overflow-hidden ${
          isWin 
            ? 'bg-gradient-to-br from-green-500/30 via-emerald-600/20 to-green-700/30' 
            : 'bg-gradient-to-br from-red-500/30 via-rose-600/20 to-red-700/30'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          
          {/* Animated Background Elements */}
          <div className="absolute inset-0 opacity-20">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-2 h-2 rounded-full ${isWin ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: '2s'
                }}
              />
            ))}
          </div>

          <div className="relative z-10">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl ${
              isWin 
                ? 'bg-gradient-to-br from-green-400 to-green-600' 
                : 'bg-gradient-to-br from-red-400 to-red-600'
            }`}>
              {isWin ? (
                <Trophy className="h-12 w-12 text-white animate-bounce" />
              ) : (
                <Target className="h-12 w-12 text-white" />
              )}
            </div>

            <h2 className={`text-5xl font-bold mb-4 ${
              isWin ? 'text-green-300' : 'text-red-300'
            } animate-fade-in`}>
              {isWin ? 'VICTORY!' : 'DEFEAT'}
            </h2>

            <div className="text-6xl font-bold text-white mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              {game.scoreLine}
            </div>

            <div className="flex items-center justify-center gap-6 flex-wrap">
              <Badge variant="outline" className="text-lg px-6 py-3 bg-black/30 backdrop-blur-md border-white/30">
                <Clock className="h-5 w-5 mr-2" />
                {game.duration} minutes
              </Badge>
              <Badge variant="outline" className="text-lg px-6 py-3 bg-black/30 backdrop-blur-md border-white/30">
                <Star className="h-5 w-5 mr-2" />
                Opponent {game.opponentSkill}/10
              </Badge>
              {goalsFor >= 3 && isWin && (
                <Badge className="text-lg px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black animate-pulse">
                  <Award className="h-5 w-5 mr-2" />
                  Hat-trick Hero!
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Week Performance Stats */}
        <div className="p-8 border-b border-opacity-20" style={{ borderColor: currentTheme.colors.border }}>
          <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
            <TrendingUp className="h-6 w-6" style={{ color: currentTheme.colors.primary }} />
            Week Performance Analytics
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg">
              <p className="text-3xl font-bold mb-2" style={{ color: currentTheme.colors.primary }}>
                {weekStats.totalGames}
              </p>
              <p className="text-sm text-gray-400">Games Played</p>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(weekStats.totalGames / 15) * 100}%` }}
                />
              </div>
            </div>

            <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/10">
              <p className="text-3xl font-bold text-green-400 mb-2">{weekStats.wins}</p>
              <p className="text-sm text-gray-400">Victories</p>
              <p className="text-xs text-green-300 mt-1">+{isWin ? 1 : 0} this game</p>
            </div>

            <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/10">
              <p className="text-3xl font-bold text-red-400 mb-2">{weekStats.losses}</p>
              <p className="text-sm text-gray-400">Defeats</p>
              <p className="text-xs text-red-300 mt-1">+{!isWin ? 1 : 0} this game</p>
            </div>

            <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10">
              <p className="text-3xl font-bold text-purple-400 mb-2">{weekStats.currentStreak}</p>
              <p className="text-sm text-gray-400">Current Streak</p>
              <p className="text-xs text-purple-300 mt-1">
                {weekStats.currentStreak > 0 ? '🔥 On fire!' : '💪 Keep going!'}
              </p>
            </div>
          </div>

          {/* Win Rate Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Win Rate</span>
              <span>{weekStats.winRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-1000 ${
                  weekStats.winRate >= 70 
                    ? 'bg-gradient-to-r from-green-500 to-green-600' 
                    : weekStats.winRate >= 50 
                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                    : 'bg-gradient-to-r from-red-500 to-red-600'
                }`}
                style={{ width: `${Math.min(weekStats.winRate, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Enhanced AI Insights Section */}
        <div className="p-8">
          <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
            <Zap className="h-6 w-6 text-yellow-400" />
            AI Performance Analysis
          </h3>
          
          <div className="space-y-4">
            {insights.length > 0 ? (
              insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-2xl border transition-all duration-700 transform hover:scale-105 ${
                    showInsights ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                  }`}
                  style={{ 
                    backgroundColor: `${currentTheme.colors.surface}80`, 
                    borderColor: currentTheme.colors.border,
                    transitionDelay: `${index * 300}ms`,
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500/20 to-yellow-600/10">
                      <Sparkles className="h-5 w-5 text-yellow-400" />
                    </div>
                    <p className="text-white leading-relaxed flex-1">{insight}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Zap className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                <p className="text-gray-400">Analyzing your performance...</p>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className="p-8 bg-gradient-to-t from-black/20 to-transparent">
          <div className="flex gap-4">
            <Button
              onClick={onClose}
              className="flex-1 text-lg py-6 rounded-2xl font-semibold modern-button-primary group"
              style={{ backgroundColor: currentTheme.colors.primary }}
            >
              <span className="group-hover:scale-110 transition-transform">Continue Journey</span>
            </Button>
            
            {isWin && weekStats.currentStreak >= 3 && (
              <Button
                variant="outline"
                className="px-6 py-6 rounded-2xl border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20"
              >
                <Trophy className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Motivational Message */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-400">
              {isWin 
                ? weekStats.currentStreak >= 5 
                  ? "🔥 You're unstoppable! Keep this momentum going!"
                  : "🎯 Great job! Every victory builds your legacy."
                : weekStats.currentStreak <= -3
                ? "💪 Champions are forged in defeat. Your comeback starts now!"
                : "📈 Learn, adapt, and dominate. Your next victory awaits!"
              }
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GameCompletionModal;
