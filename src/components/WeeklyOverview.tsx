import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, TrendingUp, Clock } from 'lucide-react';
import StatCard from './StatCard';
import { WeeklyPerformance } from '@/types/futChampions';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface WeeklyOverviewProps {
  weekData: WeeklyPerformance | null;
}

const WeeklyOverview = ({ weekData }: WeeklyOverviewProps) => {
  const [gameVersion] = useLocalStorage('gameVersion', 'FC26');

  if (!weekData) {
    return null;
  }

  const { weekNumber, games, totalWins, totalLosses, totalGoals, totalConceded, averageOpponentSkill } = weekData;
  const gamesPlayed = games.length;
  
  // FC25 has a different number of games in some reward tiers, but the weekend is still 15 games.
  const TOTAL_GAMES = 15;

  const winRate = gamesPlayed > 0 ? (totalWins / gamesPlayed) * 100 : 0;
  const progress = (gamesPlayed / TOTAL_GAMES) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold gradient-text">Week {weekNumber} Overview</h2>
        <Badge variant="outline" className="text-fifa-gold border-fifa-gold">
          {gamesPlayed}/{TOTAL_GAMES} Games
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Win Rate"
          value={`${winRate.toFixed(1)}%`}
          icon={<Trophy className="h-5 w-5 text-fifa-gold" />}
          trend={winRate > 60 ? 15 : winRate < 40 ? -10 : 5}
        />
        
        <StatCard
          title="Goals For"
          value={totalGoals.toString()}
          icon={<Target className="h-5 w-5 text-fifa-green" />}
          subtitle={`${(totalGoals / Math.max(gamesPlayed, 1)).toFixed(1)} per game`}
        />
        
        <StatCard
          title="Goal Difference"
          value={(totalGoals - totalConceded).toString()}
          icon={<TrendingUp className="h-5 w-5 text-fifa-blue" />}
          trend={totalGoals - totalConceded > 0 ? 20 : -15}
        />
        
        <StatCard
          title="Avg Opponent Skill"
          value={averageOpponentSkill.toFixed(1)}
          icon={<Clock className="h-5 w-5 text-fifa-purple" />}
          subtitle="Out of 10"
        />
      </div>

      <Card className="glass-card p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Week Progress</h3>
            <span className="text-sm text-gray-400">{gamesPlayed} of {TOTAL_GAMES} games</span>
          </div>
          
          <Progress value={progress} className="h-2" />
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-fifa-green/20 rounded-lg">
              <p className="text-2xl font-bold text-fifa-green">{totalWins}</p>
              <p className="text-xs text-gray-400">Wins</p>
            </div>
            <div className="p-3 bg-fifa-red/20 rounded-lg">
              <p className="text-2xl font-bold text-fifa-red">{totalLosses}</p>
              <p className="text-xs text-gray-400">Losses</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WeeklyOverview;
