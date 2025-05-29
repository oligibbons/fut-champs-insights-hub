
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/hooks/useTheme';
import { WeeklyPerformance, FC25_RANKS } from '@/types/futChampions';
import { Trophy, Target, TrendingUp, TrendingDown, Star, BarChart3, Award, Calendar } from 'lucide-react';

interface WeekCompletionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  weekData: WeeklyPerformance;
  onNewWeek: () => void;
}

const WeekCompletionPopup = ({ isOpen, onClose, weekData, onNewWeek }: WeekCompletionPopupProps) => {
  const { currentTheme } = useTheme();

  const winRate = weekData.games.length > 0 ? (weekData.totalWins / weekData.games.length) * 100 : 0;
  const achievedRank = FC25_RANKS.find(rank => weekData.totalWins >= rank.wins);
  const nextRank = FC25_RANKS.find(rank => weekData.totalWins < rank.wins);
  
  const xgPerformance = weekData.totalExpectedGoals > 0 
    ? ((weekData.totalGoals - weekData.totalExpectedGoals) / weekData.totalExpectedGoals) * 100 
    : 0;
    
  const xgaPerformance = weekData.totalExpectedGoalsAgainst > 0 
    ? ((weekData.totalConceded - weekData.totalExpectedGoalsAgainst) / weekData.totalExpectedGoalsAgainst) * 100 
    : 0;

  // Calculate best and worst performances
  const allPlayerRatings = weekData.games.flatMap(game => game.playerStats.map(p => p.rating));
  const bestRating = Math.max(...allPlayerRatings);
  const worstRating = Math.min(...allPlayerRatings);
  const avgRating = allPlayerRatings.reduce((a, b) => a + b, 0) / allPlayerRatings.length;

  const getWeekGrade = () => {
    if (winRate >= 80) return { grade: 'S', color: '#9932CC' };
    if (winRate >= 70) return { grade: 'A', color: '#32CD32' };
    if (winRate >= 60) return { grade: 'B', color: '#FFD700' };
    if (winRate >= 50) return { grade: 'C', color: '#FF8C00' };
    if (winRate >= 40) return { grade: 'D', color: '#DC143C' };
    return { grade: 'F', color: '#8B0000' };
  };

  const weekGrade = getWeekGrade();

  const handleStartNewWeek = () => {
    onNewWeek();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-6xl max-h-[95vh] overflow-y-auto rounded-3xl" 
           style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}>
        <div className="p-8 space-y-8">
          <div className="flex items-center gap-4">
            <div className="p-6 bg-gradient-to-br from-primary to-accent rounded-3xl">
              <Trophy className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold" style={{ color: currentTheme.colors.text }}>
                {weekData.customName || `Week ${weekData.weekNumber}`} Complete!
              </h1>
              <p className="text-xl" style={{ color: currentTheme.colors.muted }}>
                Performance Summary & Analysis
              </p>
            </div>
          </div>

          {/* Week Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-3xl" style={{ backgroundColor: weekGrade.color + '20' }}>
              <div className="text-8xl font-bold mb-4" style={{ color: weekGrade.color }}>
                {weekGrade.grade}
              </div>
              <div className="text-2xl font-semibold" style={{ color: currentTheme.colors.text }}>
                Week Grade
              </div>
              <div className="text-lg" style={{ color: currentTheme.colors.muted }}>
                {winRate.toFixed(1)}% Win Rate
              </div>
            </div>

            <div className="text-center p-8 rounded-3xl" style={{ backgroundColor: currentTheme.colors.surface }}>
              <div className="text-6xl font-bold mb-4" style={{ color: currentTheme.colors.primary }}>
                {weekData.totalWins}
              </div>
              <div className="text-2xl font-semibold" style={{ color: currentTheme.colors.text }}>
                Total Wins
              </div>
              <div className="text-lg" style={{ color: currentTheme.colors.muted }}>
                {weekData.totalLosses} Losses
              </div>
            </div>

            <div className="text-center p-8 rounded-3xl" style={{ backgroundColor: achievedRank ? achievedRank.color + '20' : currentTheme.colors.surface }}>
              <div className="text-3xl font-bold mb-4" style={{ color: achievedRank?.color || currentTheme.colors.text }}>
                {achievedRank?.name || 'Unranked'}
              </div>
              <div className="text-2xl font-semibold" style={{ color: currentTheme.colors.text }}>
                Final Rank
              </div>
              {nextRank && (
                <div className="text-lg" style={{ color: currentTheme.colors.muted }}>
                  {nextRank.wins - weekData.totalWins} wins to {nextRank.name}
                </div>
              )}
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl" style={{ backgroundColor: currentTheme.colors.surface }}>
              <div className="flex items-center gap-3 mb-3">
                <Target className="h-6 w-6" style={{ color: currentTheme.colors.accent }} />
                <span className="text-lg font-medium" style={{ color: currentTheme.colors.text }}>Goals</span>
              </div>
              <div className="text-4xl font-bold" style={{ color: currentTheme.colors.accent }}>
                {weekData.totalGoals}
              </div>
              <div className="text-sm" style={{ color: currentTheme.colors.muted }}>
                {(weekData.totalGoals / weekData.games.length).toFixed(1)} per game
              </div>
            </div>

            <div className="p-6 rounded-2xl" style={{ backgroundColor: currentTheme.colors.surface }}>
              <div className="flex items-center gap-3 mb-3">
                <BarChart3 className="h-6 w-6" style={{ color: currentTheme.colors.secondary }} />
                <span className="text-lg font-medium" style={{ color: currentTheme.colors.text }}>Avg Rating</span>
              </div>
              <div className="text-4xl font-bold" style={{ color: currentTheme.colors.secondary }}>
                {avgRating.toFixed(1)}
              </div>
              <div className="text-sm" style={{ color: currentTheme.colors.muted }}>
                Best: {bestRating.toFixed(1)}
              </div>
            </div>

            <div className="p-6 rounded-2xl" style={{ backgroundColor: currentTheme.colors.surface }}>
              <div className="flex items-center gap-3 mb-3">
                <Star className="h-6 w-6" style={{ color: currentTheme.colors.primary }} />
                <span className="text-lg font-medium" style={{ color: currentTheme.colors.text }}>XG Diff</span>
              </div>
              <div className="text-4xl font-bold" style={{ color: xgPerformance > 0 ? '#10b981' : '#ef4444' }}>
                {xgPerformance > 0 ? '+' : ''}{xgPerformance.toFixed(1)}%
              </div>
              <div className="text-sm" style={{ color: currentTheme.colors.muted }}>
                vs Expected
              </div>
            </div>

            <div className="p-6 rounded-2xl" style={{ backgroundColor: currentTheme.colors.surface }}>
              <div className="flex items-center gap-3 mb-3">
                <Award className="h-6 w-6" style={{ color: currentTheme.colors.text }} />
                <span className="text-lg font-medium" style={{ color: currentTheme.colors.text }}>Opponent</span>
              </div>
              <div className="text-4xl font-bold" style={{ color: currentTheme.colors.text }}>
                {weekData.averageOpponentSkill.toFixed(1)}
              </div>
              <div className="text-sm" style={{ color: currentTheme.colors.muted }}>
                Avg Skill
              </div>
            </div>
          </div>

          {/* XG Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-3xl" style={{ backgroundColor: currentTheme.colors.surface }}>
              <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3" style={{ color: currentTheme.colors.text }}>
                <TrendingUp className="h-6 w-6" style={{ color: currentTheme.colors.primary }} />
                Attack Analysis
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-lg" style={{ color: currentTheme.colors.muted }}>Goals Scored</span>
                  <span className="text-lg font-bold" style={{ color: currentTheme.colors.text }}>{weekData.totalGoals}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-lg" style={{ color: currentTheme.colors.muted }}>Expected Goals</span>
                  <span className="text-lg font-bold" style={{ color: currentTheme.colors.text }}>{weekData.totalExpectedGoals.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg" style={{ color: currentTheme.colors.muted }}>Performance</span>
                  <div className="flex items-center gap-3">
                    {xgPerformance > 0 ? (
                      <TrendingUp className="h-5 w-5 text-green-400" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-400" />
                    )}
                    <span className={`text-lg font-bold ${xgPerformance > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {xgPerformance > 0 ? '+' : ''}{xgPerformance.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl" style={{ backgroundColor: currentTheme.colors.surface }}>
              <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3" style={{ color: currentTheme.colors.text }}>
                <TrendingDown className="h-6 w-6" style={{ color: currentTheme.colors.secondary }} />
                Defense Analysis
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-lg" style={{ color: currentTheme.colors.muted }}>Goals Conceded</span>
                  <span className="text-lg font-bold" style={{ color: currentTheme.colors.text }}>{weekData.totalConceded}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-lg" style={{ color: currentTheme.colors.muted }}>Expected Goals Against</span>
                  <span className="text-lg font-bold" style={{ color: currentTheme.colors.text }}>{weekData.totalExpectedGoalsAgainst.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg" style={{ color: currentTheme.colors.muted }}>Performance</span>
                  <div className="flex items-center gap-3">
                    {xgaPerformance < 0 ? (
                      <TrendingUp className="h-5 w-5 text-green-400" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-400" />
                    )}
                    <span className={`text-lg font-bold ${xgaPerformance < 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {xgaPerformance > 0 ? '+' : ''}{xgaPerformance.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="p-8 rounded-3xl" style={{ backgroundColor: currentTheme.colors.surface }}>
            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3" style={{ color: currentTheme.colors.text }}>
              <Star className="h-6 w-6" style={{ color: currentTheme.colors.accent }} />
              Week Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
              <div className="space-y-3">
                <h4 className="text-xl font-medium text-green-400">Strengths</h4>
                <div style={{ color: currentTheme.colors.muted }}>
                  {winRate >= 70 && <p>✅ Excellent win rate - you're dominating!</p>}
                  {xgPerformance > 15 && <p>✅ Clinical finishing - outperforming XG significantly</p>}
                  {xgaPerformance < -10 && <p>✅ Solid defense - conceding less than expected</p>}
                  {avgRating >= 7.5 && <p>✅ Consistent team performance across all players</p>}
                  {weekData.averageOpponentSkill >= 7 && <p>✅ Competing against high-level opponents</p>}
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-xl font-medium text-red-400">Areas for Improvement</h4>
                <div style={{ color: currentTheme.colors.muted }}>
                  {winRate < 50 && <p>⚠️ Win rate needs improvement - focus on consistency</p>}
                  {xgPerformance < -20 && <p>⚠️ Finishing could be better - practice in skill games</p>}
                  {xgaPerformance > 15 && <p>⚠️ Defensive stability needed - conceding too many</p>}
                  {avgRating < 7.0 && <p>⚠️ Team performance inconsistent - squad changes needed?</p>}
                  {worstRating < 6.0 && <p>⚠️ Some players underperforming - consider substitutions</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-6">
            <Button onClick={onClose} variant="outline" className="flex-1 py-4 text-xl rounded-2xl" style={{ borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}>
              Review Later
            </Button>
            <Button onClick={handleStartNewWeek} className="flex-1 py-4 text-xl rounded-2xl" style={{ backgroundColor: currentTheme.colors.primary, color: '#ffffff' }}>
              <Calendar className="h-6 w-6 mr-3" />
              Start Next Week
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeekCompletionPopup;
