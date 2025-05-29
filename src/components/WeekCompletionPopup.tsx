
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto animate-fade-in" 
                     style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-3xl" style={{ color: currentTheme.colors.text }}>
            <div className="p-4 bg-gradient-to-br from-primary to-accent rounded-3xl">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            {weekData.customName || `Week ${weekData.weekNumber}`} Complete!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          {/* Week Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 rounded-3xl" style={{ backgroundColor: weekGrade.color + '20' }}>
              <div className="text-6xl font-bold mb-2" style={{ color: weekGrade.color }}>
                {weekGrade.grade}
              </div>
              <div className="text-lg font-semibold" style={{ color: currentTheme.colors.text }}>
                Week Grade
              </div>
              <div className="text-sm" style={{ color: currentTheme.colors.muted }}>
                {winRate.toFixed(1)}% Win Rate
              </div>
            </div>

            <div className="text-center p-6 rounded-3xl" style={{ backgroundColor: currentTheme.colors.surface }}>
              <div className="text-4xl font-bold mb-2" style={{ color: currentTheme.colors.primary }}>
                {weekData.totalWins}
              </div>
              <div className="text-lg font-semibold" style={{ color: currentTheme.colors.text }}>
                Total Wins
              </div>
              <div className="text-sm" style={{ color: currentTheme.colors.muted }}>
                {weekData.totalLosses} Losses
              </div>
            </div>

            <div className="text-center p-6 rounded-3xl" style={{ backgroundColor: achievedRank ? achievedRank.color + '20' : currentTheme.colors.surface }}>
              <div className="text-2xl font-bold mb-2" style={{ color: achievedRank?.color || currentTheme.colors.text }}>
                {achievedRank?.name || 'Unranked'}
              </div>
              <div className="text-lg font-semibold" style={{ color: currentTheme.colors.text }}>
                Final Rank
              </div>
              {nextRank && (
                <div className="text-sm" style={{ color: currentTheme.colors.muted }}>
                  {nextRank.wins - weekData.totalWins} wins to {nextRank.name}
                </div>
              )}
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl" style={{ backgroundColor: currentTheme.colors.surface }}>
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4" style={{ color: currentTheme.colors.accent }} />
                <span className="text-sm font-medium" style={{ color: currentTheme.colors.text }}>Goals</span>
              </div>
              <div className="text-2xl font-bold" style={{ color: currentTheme.colors.accent }}>
                {weekData.totalGoals}
              </div>
              <div className="text-xs" style={{ color: currentTheme.colors.muted }}>
                {(weekData.totalGoals / weekData.games.length).toFixed(1)} per game
              </div>
            </div>

            <div className="p-4 rounded-xl" style={{ backgroundColor: currentTheme.colors.surface }}>
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4" style={{ color: currentTheme.colors.secondary }} />
                <span className="text-sm font-medium" style={{ color: currentTheme.colors.text }}>Avg Rating</span>
              </div>
              <div className="text-2xl font-bold" style={{ color: currentTheme.colors.secondary }}>
                {avgRating.toFixed(1)}
              </div>
              <div className="text-xs" style={{ color: currentTheme.colors.muted }}>
                Best: {bestRating.toFixed(1)}
              </div>
            </div>

            <div className="p-4 rounded-xl" style={{ backgroundColor: currentTheme.colors.surface }}>
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4" style={{ color: currentTheme.colors.primary }} />
                <span className="text-sm font-medium" style={{ color: currentTheme.colors.text }}>XG Diff</span>
              </div>
              <div className="text-2xl font-bold" style={{ color: xgPerformance > 0 ? '#10b981' : '#ef4444' }}>
                {xgPerformance > 0 ? '+' : ''}{xgPerformance.toFixed(1)}%
              </div>
              <div className="text-xs" style={{ color: currentTheme.colors.muted }}>
                vs Expected
              </div>
            </div>

            <div className="p-4 rounded-xl" style={{ backgroundColor: currentTheme.colors.surface }}>
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-4 w-4" style={{ color: currentTheme.colors.text }} />
                <span className="text-sm font-medium" style={{ color: currentTheme.colors.text }}>Opponent</span>
              </div>
              <div className="text-2xl font-bold" style={{ color: currentTheme.colors.text }}>
                {weekData.averageOpponentSkill.toFixed(1)}
              </div>
              <div className="text-xs" style={{ color: currentTheme.colors.muted }}>
                Avg Skill
              </div>
            </div>
          </div>

          {/* XG Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl" style={{ backgroundColor: currentTheme.colors.surface }}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
                <TrendingUp className="h-5 w-5" style={{ color: currentTheme.colors.primary }} />
                Attack Analysis
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span style={{ color: currentTheme.colors.muted }}>Goals Scored</span>
                  <span className="font-bold" style={{ color: currentTheme.colors.text }}>{weekData.totalGoals}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: currentTheme.colors.muted }}>Expected Goals</span>
                  <span className="font-bold" style={{ color: currentTheme.colors.text }}>{weekData.totalExpectedGoals.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: currentTheme.colors.muted }}>Performance</span>
                  <div className="flex items-center gap-2">
                    {xgPerformance > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    )}
                    <span className={`font-bold ${xgPerformance > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {xgPerformance > 0 ? '+' : ''}{xgPerformance.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl" style={{ backgroundColor: currentTheme.colors.surface }}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
                <TrendingDown className="h-5 w-5" style={{ color: currentTheme.colors.secondary }} />
                Defense Analysis
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span style={{ color: currentTheme.colors.muted }}>Goals Conceded</span>
                  <span className="font-bold" style={{ color: currentTheme.colors.text }}>{weekData.totalConceded}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: currentTheme.colors.muted }}>Expected Goals Against</span>
                  <span className="font-bold" style={{ color: currentTheme.colors.text }}>{weekData.totalExpectedGoalsAgainst.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: currentTheme.colors.muted }}>Performance</span>
                  <div className="flex items-center gap-2">
                    {xgaPerformance < 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    )}
                    <span className={`font-bold ${xgaPerformance < 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {xgaPerformance > 0 ? '+' : ''}{xgaPerformance.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="p-6 rounded-2xl" style={{ backgroundColor: currentTheme.colors.surface }}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
              <Star className="h-5 w-5" style={{ color: currentTheme.colors.accent }} />
              Week Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium text-green-400">Strengths</h4>
                <div style={{ color: currentTheme.colors.muted }}>
                  {winRate >= 70 && <p>✅ Excellent win rate - you're dominating!</p>}
                  {xgPerformance > 15 && <p>✅ Clinical finishing - outperforming XG significantly</p>}
                  {xgaPerformance < -10 && <p>✅ Solid defense - conceding less than expected</p>}
                  {avgRating >= 7.5 && <p>✅ Consistent team performance across all players</p>}
                  {weekData.averageOpponentSkill >= 7 && <p>✅ Competing against high-level opponents</p>}
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-red-400">Areas for Improvement</h4>
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
          <div className="flex gap-4">
            <Button onClick={onClose} variant="outline" className="flex-1" style={{ borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}>
              Review Later
            </Button>
            <Button onClick={handleStartNewWeek} className="flex-1" style={{ backgroundColor: currentTheme.colors.primary, color: '#ffffff' }}>
              <Calendar className="h-4 w-4 mr-2" />
              Start Next Week
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WeekCompletionPopup;
