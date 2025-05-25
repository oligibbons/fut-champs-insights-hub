
import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import WeeklyOverview from '@/components/WeeklyOverview';
import StatCard from '@/components/StatCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { WeeklyPerformance } from '@/types/futChampions';
import { 
  Trophy, 
  TrendingUp, 
  Calendar, 
  Users, 
  Plus,
  Target,
  Clock,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const [weeklyData] = useLocalStorage<WeeklyPerformance[]>('futChampions_weeks', []);
  const [currentWeek, setCurrentWeek] = useState<WeeklyPerformance | null>(null);
  const [overallStats, setOverallStats] = useState({
    totalWeeks: 0,
    totalGames: 0,
    totalWins: 0,
    totalGoals: 0,
    averageWinRate: 0,
    bestWeek: 0
  });

  useEffect(() => {
    if (weeklyData.length > 0) {
      const current = weeklyData.find(week => !week.isCompleted) || weeklyData[weeklyData.length - 1];
      setCurrentWeek(current);

      // Calculate overall stats
      const totalGames = weeklyData.reduce((sum, week) => sum + week.games.length, 0);
      const totalWins = weeklyData.reduce((sum, week) => sum + week.totalWins, 0);
      const totalGoals = weeklyData.reduce((sum, week) => sum + week.totalGoals, 0);
      const averageWinRate = totalGames > 0 ? (totalWins / totalGames) * 100 : 0;
      const bestWeek = Math.max(...weeklyData.map(week => week.totalWins));

      setOverallStats({
        totalWeeks: weeklyData.length,
        totalGames,
        totalWins,
        totalGoals,
        averageWinRate,
        bestWeek
      });
    }
  }, [weeklyData]);

  const getCurrentWeekData = () => {
    if (!currentWeek) {
      return {
        weekNumber: 1,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        averageOpponentSkill: 0
      };
    }

    return {
      weekNumber: currentWeek.weekNumber,
      gamesPlayed: currentWeek.games.length,
      wins: currentWeek.totalWins,
      losses: currentWeek.totalLosses,
      draws: currentWeek.totalDraws,
      goalsFor: currentWeek.totalGoals,
      goalsAgainst: currentWeek.totalConceded,
      averageOpponentSkill: currentWeek.averageOpponentSkill
    };
  };

  const recentGames = currentWeek?.games.slice(-5) || [];

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="lg:ml-64 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text">FUT Champions Dashboard</h1>
              <p className="text-gray-400 mt-1">Track your ultimate team performance</p>
            </div>
            <Link to="/current-week">
              <Button className="bg-fifa-gradient hover:shadow-lg transition-all duration-300">
                <Plus className="h-4 w-4 mr-2" />
                New Game
              </Button>
            </Link>
          </div>

          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Weeks"
              value={overallStats.totalWeeks}
              icon={<Calendar className="h-5 w-5 text-fifa-blue" />}
            />
            <StatCard
              title="Overall Win Rate"
              value={`${overallStats.averageWinRate.toFixed(1)}%`}
              icon={<Trophy className="h-5 w-5 text-fifa-gold" />}
            />
            <StatCard
              title="Total Goals"
              value={overallStats.totalGoals}
              icon={<Target className="h-5 w-5 text-fifa-green" />}
            />
            <StatCard
              title="Best Week"
              value={`${overallStats.bestWeek} wins`}
              icon={<Star className="h-5 w-5 text-fifa-purple" />}
            />
          </div>

          {/* Current Week Overview */}
          <WeeklyOverview weekData={getCurrentWeekData()} />

          {/* Recent Games & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Games */}
            <Card className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Recent Games</h3>
                <Link to="/current-week">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
              
              <div className="space-y-3">
                {recentGames.length > 0 ? (
                  recentGames.map((game, index) => (
                    <div key={game.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge 
                          variant={game.result === 'win' ? 'default' : game.result === 'loss' ? 'destructive' : 'secondary'}
                          className="w-12 text-center"
                        >
                          {game.result === 'win' ? 'W' : game.result === 'loss' ? 'L' : 'D'}
                        </Badge>
                        <div>
                          <p className="text-sm font-medium text-white">{game.scoreLine}</p>
                          <p className="text-xs text-gray-400">Game {game.gameNumber}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Opponent Skill</p>
                        <p className="text-sm font-medium text-white">{game.opponentSkill}/10</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No games played yet</p>
                    <Link to="/current-week">
                      <Button variant="outline" size="sm" className="mt-2">
                        Start First Game
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <Link to="/current-week" className="block">
                  <Button className="w-full justify-start bg-fifa-blue hover:bg-fifa-blue/80">
                    <Plus className="h-4 w-4 mr-2" />
                    Record New Game
                  </Button>
                </Link>
                
                <Link to="/squads" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Squads
                  </Button>
                </Link>
                
                <Link to="/analytics" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </Link>
                
                <Link to="/insights" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Trophy className="h-4 w-4 mr-2" />
                    AI Insights
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
