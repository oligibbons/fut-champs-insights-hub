
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WeeklyPerformance } from '@/types/futChampions';
import { Calendar, Trophy, Target, TrendingDown, User, TrendingUp, BarChart3 } from 'lucide-react';
import { useAccountData } from '@/hooks/useAccountData';

interface WeekProgressProps {
  weekData: WeeklyPerformance | null;
  onNewWeek: () => void;
}

const WeekProgress = ({ weekData, onNewWeek }: WeekProgressProps) => {
  const { activeAccount } = useAccountData();

  if (!weekData) {
    return (
      <Card className="glass-card rounded-3xl shadow-depth-lg border-0 animate-fade-in">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-white text-xl">
              <div className="p-3 bg-fifa-blue/20 rounded-2xl border border-fifa-blue/30">
                <Calendar className="h-5 w-5 text-fifa-blue" />
              </div>
              Start Your First Week
            </CardTitle>
            <Badge variant="outline" className="text-fifa-blue border-fifa-blue/40 bg-fifa-blue/10 rounded-xl px-4 py-2">
              <User className="h-3 w-3 mr-1" />
              {activeAccount}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-fifa-blue/10 rounded-3xl flex items-center justify-center mx-auto mb-6 floating-element">
              <Trophy className="h-12 w-12 text-fifa-blue/60" />
            </div>
            <p className="text-gray-400 mb-8 text-lg">No weeks tracked yet for {activeAccount}. Start your FUT Champions journey!</p>
            <Button onClick={onNewWeek} className="modern-button-primary text-lg px-10 py-5 rounded-2xl">
              <Trophy className="h-5 w-5 mr-2" />
              Start Week 1
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const gamesPlayed = weekData.games.length;
  const progress = (gamesPlayed / 15) * 100;
  const wins = weekData.totalWins;
  const losses = weekData.totalLosses;
  const winRate = gamesPlayed > 0 ? (wins / gamesPlayed) * 100 : 0;

  // Calculate XG Performance
  const totalXG = weekData.totalExpectedGoals || 0;
  const totalXGA = weekData.totalExpectedGoalsAgainst || 0;
  const actualGoals = weekData.totalGoals;
  const actualConceded = weekData.totalConceded;
  
  const xgPerformance = totalXG > 0 ? ((actualGoals - totalXG) / totalXG) * 100 : 0;
  const xgaPerformance = totalXGA > 0 ? ((actualConceded - totalXGA) / totalXGA) * 100 : 0;

  return (
    <Card className="glass-card rounded-3xl shadow-depth-lg border-0 animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-white text-xl">
            <div className="p-3 bg-fifa-blue/20 rounded-2xl border border-fifa-blue/30">
              <Calendar className="h-5 w-5 text-fifa-blue" />
            </div>
            Week {weekData.weekNumber} Progress
          </CardTitle>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-fifa-gold border-fifa-gold/40 bg-fifa-gold/10 rounded-xl px-4 py-2">
              <BarChart3 className="h-3 w-3 mr-1" />
              {gamesPlayed}/15 Games
            </Badge>
            <Badge variant="outline" className="text-fifa-blue border-fifa-blue/40 bg-fifa-blue/10 rounded-xl px-4 py-2">
              <User className="h-3 w-3 mr-1" />
              {activeAccount}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-8">
        <div className="bg-gradient-to-r from-white/10 to-white/5 rounded-3xl p-6 border border-white/20 backdrop-blur-lg">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400 font-medium">Games Completed</span>
            <span className="text-sm text-white font-semibold">{gamesPlayed} of 15</span>
          </div>
          <Progress value={progress} className="h-4 rounded-full bg-white/10" />
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>Start</span>
            <span>{progress.toFixed(0)}% Complete</span>
            <span>15 Games</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 stagger-animation">
          <div className="metric-card group">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-fifa-green/20 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <Trophy className="h-5 w-5 text-fifa-green" />
              </div>
              <span className="text-sm text-gray-400 font-medium">Wins</span>
            </div>
            <p className="text-4xl font-bold text-fifa-green mb-1">{wins}</p>
            <p className="text-xs text-gray-400">Win Rate: {winRate.toFixed(1)}%</p>
          </div>
          
          <div className="metric-card group">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-fifa-red/20 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <TrendingDown className="h-5 w-5 text-fifa-red" />
              </div>
              <span className="text-sm text-gray-400 font-medium">Losses</span>
            </div>
            <p className="text-4xl font-bold text-fifa-red mb-1">{losses}</p>
            <p className="text-xs text-gray-400">Remaining: {15 - gamesPlayed}</p>
          </div>
        </div>

        {/* XG Performance */}
        {gamesPlayed > 0 && totalXG > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="metric-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-fifa-blue/20 rounded-2xl">
                  <Target className="h-5 w-5 text-fifa-blue" />
                </div>
                <span className="text-sm text-gray-400 font-medium">XG Performance</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-3xl font-bold text-fifa-blue">{actualGoals}</p>
                <span className="text-gray-400">vs</span>
                <p className="text-xl text-gray-300">{totalXG.toFixed(1)}</p>
              </div>
              <div className="flex items-center gap-2">
                {xgPerformance > 0 ? (
                  <TrendingUp className="h-4 w-4 text-fifa-green" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-fifa-red" />
                )}
                <span className={`text-sm font-medium ${xgPerformance > 0 ? 'text-fifa-green' : 'text-fifa-red'}`}>
                  {xgPerformance > 0 ? '+' : ''}{xgPerformance.toFixed(1)}% vs Expected
                </span>
              </div>
            </div>

            <div className="metric-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-fifa-purple/20 rounded-2xl">
                  <TrendingUp className="h-5 w-5 text-fifa-purple" />
                </div>
                <span className="text-sm text-gray-400 font-medium">XGA Performance</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-3xl font-bold text-fifa-purple">{actualConceded}</p>
                <span className="text-gray-400">vs</span>
                <p className="text-xl text-gray-300">{totalXGA.toFixed(1)}</p>
              </div>
              <div className="flex items-center gap-2">
                {xgaPerformance < 0 ? (
                  <TrendingUp className="h-4 w-4 text-fifa-green" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-fifa-red" />
                )}
                <span className={`text-sm font-medium ${xgaPerformance < 0 ? 'text-fifa-green' : 'text-fifa-red'}`}>
                  {xgaPerformance > 0 ? '+' : ''}{xgaPerformance.toFixed(1)}% vs Expected
                </span>
              </div>
            </div>
          </div>
        )}

        {weekData.isCompleted && (
          <Button onClick={onNewWeek} className="w-full modern-button-primary text-lg py-5 rounded-2xl">
            <Trophy className="h-5 w-5 mr-2" />
            Start Next Week
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default WeekProgress;
