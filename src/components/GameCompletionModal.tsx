import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/hooks/useTheme';
import { GameResult } from '@/types/futChampions';
import { generateMatchFeedback } from '@/utils/aiInsights';
import { Trophy, Target, TrendingUp, Star, Calendar, Clock, Zap, Sparkles, Award, Shield, BarChart3, Users } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

interface GameCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: GameResult | null;
  weekStats: {
    totalGames: number;
    wins: number;
    losses: number;
    winRate: number;
    currentStreak: number;
  } | null;
}

const GameCompletionModal = ({ isOpen, onClose, game, weekStats }: GameCompletionModalProps) => {
  const { currentTheme } = useTheme();
  const [showCelebration, setShowCelebration] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && game && weekStats) {
      // Generate AI insights using the correct function
      const weekData = {
        totalWins: weekStats.wins,
        totalGoals: 0, // This would need to be passed from parent or calculated
        totalConceded: 0, // This would need to be passed from parent or calculated
        games: [], // This would need to be passed from parent
        currentStreak: weekStats.currentStreak
      };
      const gameInsights = generateMatchFeedback(game, weekData);
      
      if (gameInsights && gameInsights.message) {
        setInsights([gameInsights.message]);
      } else {
        setInsights([
          game.result === 'win' 
            ? "Great win! Keep up the momentum." 
            : "Don't worry about this loss. Learn from it and come back stronger!"
        ]);
      }

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

  // Early return if game or weekStats is null
  if (!game || !weekStats) {
    return null;
  }

  const isWin = game.result === 'win';
  const [goalsFor, goalsAgainst] = game.scoreLine.split('-').map(Number);

  // Generate performance stats for charts
  const teamStatsData = [
    { name: 'Possession', value: game.teamStats?.possession || 50, color: '#3b82f6' },
    { name: 'Pass Acc.', value: game.teamStats?.passAccuracy || 75, color: '#8b5cf6' },
    { name: 'Shot Acc.', value: game.teamStats?.shots > 0 ? (game.teamStats?.shotsOnTarget || 0) / game.teamStats?.shots * 100 : 0, color: '#10b981' }
  ];

  // XG comparison data
  const xgData = [
    { name: 'Goals', expected: game.teamStats?.expectedGoals || 0, actual: goalsFor },
    { name: 'Conceded', expected: game.teamStats?.expectedGoalsAgainst || 0, actual: goalsAgainst }
  ];

  // Player performance data
  const playerPerformanceData = game.playerStats
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5)
    .map(player => ({
      name: player.name.length > 10 ? player.name.substring(0, 10) + '...' : player.name,
      rating: player.rating,
      goals: player.goals,
      assists: player.assists
    }));

  // Display match tags if available
  const renderMatchTags = () => {
    if (!game.tags || game.tags.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-2 mt-4">
        {game.tags.map(tag => (
          <Badge 
            key={tag} 
            className={
              tag === 'comeback' ? 'bg-fifa-green/20 text-fifa-green' :
              tag === 'bottled' ? 'bg-fifa-red/20 text-fifa-red' :
              tag === 'bad-servers' ? 'bg-fifa-gold/20 text-fifa-gold' :
              tag === 'scripting' ? 'bg-fifa-purple/20 text-fifa-purple' :
              tag === 'good-opponent' ? 'bg-fifa-blue/20 text-fifa-blue' :
              tag === 'lucky-win' ? 'bg-green-500/20 text-green-500' :
              tag === 'unlucky-loss' ? 'bg-red-500/20 text-red-500' :
              tag === 'dominated' ? 'bg-purple-500/20 text-purple-500' :
              tag === 'close-game' ? 'bg-yellow-500/20 text-yellow-500' :
              tag === 'high-scoring' ? 'bg-blue-400/20 text-blue-400' :
              tag === 'defensive' ? 'bg-gray-500/20 text-gray-400' :
              tag === 'counter-attack' ? 'bg-orange-500/20 text-orange-500' :
              'bg-white/10 text-white'
            }
          >
            {tag === 'comeback' ? 'Comeback Win' :
             tag === 'bottled' ? 'Bottled Lead' :
             tag === 'bad-servers' ? 'Bad Servers' :
             tag === 'scripting' ? 'Scripting' :
             tag === 'good-opponent' ? 'Good Opponent' :
             tag === 'lucky-win' ? 'Lucky Win' :
             tag === 'unlucky-loss' ? 'Unlucky Loss' :
             tag === 'dominated' ? 'Dominated' :
             tag === 'close-game' ? 'Close Game' :
             tag === 'high-scoring' ? 'High Scoring' :
             tag === 'defensive' ? 'Defensive Battle' :
             tag === 'counter-attack' ? 'Counter Attack' :
             tag.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Badge>
        ))}
      </div>
    );
  };

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
            
            {/* Match Tags */}
            {renderMatchTags()}
          </div>
        </div>

        {/* Performance Charts */}
        <div className="p-6 border-b border-opacity-20" style={{ borderColor: currentTheme.colors.border }}>
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-fifa-blue" />
            Performance Analysis
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Team Stats Chart */}
            <div className="p-4 rounded-xl bg-white/5">
              <h4 className="text-sm font-medium text-white mb-3">Team Performance</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={teamStatsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" />
                  <XAxis type="number" domain={[0, 100]} stroke="#9ca3af" />
                  <YAxis dataKey="name" type="category" stroke="#9ca3af" width={70} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                      border: '1px solid rgba(59, 130, 246, 0.3)', 
                      borderRadius: '12px' 
                    }}
                    formatter={(value: any) => [`${value.toFixed(1)}%`, '']}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {teamStatsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* XG Comparison Chart */}
            <div className="p-4 rounded-xl bg-white/5">
              <h4 className="text-sm font-medium text-white mb-3">Expected vs Actual Goals</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={xgData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                      border: '1px solid rgba(59, 130, 246, 0.3)', 
                      borderRadius: '12px' 
                    }}
                    formatter={(value: any) => [value.toFixed(1), '']}
                  />
                  <Bar dataKey="expected" name="Expected" fill="#8b5cf6" />
                  <Bar dataKey="actual" name="Actual" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Player Performance Chart */}
        <div className="p-6 border-b border-opacity-20" style={{ borderColor: currentTheme.colors.border }}>
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
            <Users className="h-5 w-5 text-fifa-purple" />
            Player Performances
          </h3>
          
          {playerPerformanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={playerPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis yAxisId="left" orientation="left" stroke="#f59e0b" domain={[0, 10]} />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" domain={[0, Math.max(5, ...playerPerformanceData.map(p => Math.max(p.goals, p.assists)))]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                    border: '1px solid rgba(59, 130, 246, 0.3)', 
                    borderRadius: '12px' 
                  }}
                />
                <Bar yAxisId="left" dataKey="rating" name="Rating" fill="#f59e0b" />
                <Bar yAxisId="right" dataKey="goals" name="Goals" fill="#10b981" />
                <Bar yAxisId="right" dataKey="assists" name="Assists" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-400">No player performance data available</p>
            </div>
          )}
        </div>

        {/* Enhanced Week Performance Stats */}
        <div className="p-6 border-b border-opacity-20" style={{ borderColor: currentTheme.colors.border }}>
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
            <TrendingUp className="h-5 w-5" style={{ color: currentTheme.colors.primary }} />
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
        <div className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
            <Zap className="h-5 w-5 text-yellow-400" />
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
        <div className="p-6 bg-gradient-to-t from-black/20 to-transparent">
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