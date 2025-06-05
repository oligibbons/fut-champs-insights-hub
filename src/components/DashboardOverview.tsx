
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDataSync } from '@/hooks/useDataSync';
import { Trophy, Target, TrendingUp, TrendingDown, Calendar, Award, Zap, BarChart3, Users, Shield, Flame, Clock, Star } from 'lucide-react';
import AnalyticsTooltip from './AnalyticsTooltip';
import { Progress } from '@/components/ui/progress';

const DashboardOverview = () => {
  const { weeklyData, calculatePlayerStats } = useDataSync();
  
  // All-time statistics
  const allTimeStats = {
    totalGames: weeklyData.reduce((sum, week) => sum + week.games.length, 0),
    totalWins: weeklyData.reduce((sum, week) => sum + week.totalWins, 0),
    totalGoals: weeklyData.reduce((sum, week) => sum + week.totalGoals, 0),
    totalConceded: weeklyData.reduce((sum, week) => sum + week.totalConceded, 0),
    completedWeeks: weeklyData.filter(week => week.isCompleted).length,
    totalCleanSheets: weeklyData.reduce((sum, week) => 
      sum + week.games.filter(game => parseInt(game.scoreLine.split('-')[1]) === 0).length, 0
    ),
    avgGoalsPerGame: 0,
    avgConcededPerGame: 0,
    winRate: 0,
    goalDifference: 0,
    cleanSheetRate: 0
  };

  allTimeStats.avgGoalsPerGame = allTimeStats.totalGames > 0 ? allTimeStats.totalGoals / allTimeStats.totalGames : 0;
  allTimeStats.avgConcededPerGame = allTimeStats.totalGames > 0 ? allTimeStats.totalConceded / allTimeStats.totalGames : 0;
  allTimeStats.winRate = allTimeStats.totalGames > 0 ? (allTimeStats.totalWins / allTimeStats.totalGames) * 100 : 0;
  allTimeStats.goalDifference = allTimeStats.totalGoals - allTimeStats.totalConceded;
  allTimeStats.cleanSheetRate = allTimeStats.totalGames > 0 ? (allTimeStats.totalCleanSheets / allTimeStats.totalGames) * 100 : 0;

  // Personal records
  const personalRecords = {
    bestWeekWins: Math.max(...weeklyData.map(week => week.totalWins), 0),
    bestWeekGoals: Math.max(...weeklyData.map(week => week.totalGoals), 0),
    bestWeekCleanSheets: Math.max(...weeklyData.map(week => 
      week.games.filter(game => parseInt(game.scoreLine.split('-')[1]) === 0).length
    ), 0),
    longestWinStreak: Math.max(...weeklyData.map(week => week.bestStreak || 0), 0),
    bestGoalDifference: Math.max(...weeklyData.map(week => week.totalGoals - week.totalConceded), 0),
    highestWeeklyRating: Math.max(...weeklyData.map(week => week.weeklyRating || 0), 0),
    mostGoalsInGame: Math.max(...weeklyData.flatMap(week => 
      week.games.map(game => parseInt(game.scoreLine.split('-')[0]))
    ), 0),
    biggestWin: Math.max(...weeklyData.flatMap(week => 
      week.games.map(game => {
        const [goals, conceded] = game.scoreLine.split('-').map(Number);
        return game.result === 'win' ? goals - conceded : 0;
      })
    ), 0)
  };

  // Performance trends (last 5 weeks)
  const recentWeeks = weeklyData.filter(week => week.isCompleted).slice(-5);
  const recentPerformance = {
    avgWinRate: recentWeeks.length > 0 ? 
      recentWeeks.reduce((sum, week) => sum + (week.games.length > 0 ? (week.totalWins / week.games.length) * 100 : 0), 0) / recentWeeks.length : 0,
    avgGoalsPerWeek: recentWeeks.length > 0 ? 
      recentWeeks.reduce((sum, week) => sum + week.totalGoals, 0) / recentWeeks.length : 0,
    avgConcededPerWeek: recentWeeks.length > 0 ? 
      recentWeeks.reduce((sum, week) => sum + week.totalConceded, 0) / recentWeeks.length : 0,
    isImproving: recentWeeks.length >= 2 ? 
      recentWeeks[recentWeeks.length - 1].totalWins > recentWeeks[recentWeeks.length - 2].totalWins : false
  };

  // Current/Recent run summary
  const currentWeek = weeklyData.find(week => !week.isCompleted);
  const mostRecentWeek = weeklyData.filter(week => week.isCompleted).slice(-1)[0];
  const activeWeek = currentWeek || mostRecentWeek;

  const currentRunStats = activeWeek ? {
    name: activeWeek.customName || `Week ${activeWeek.weekNumber}`,
    gamesPlayed: activeWeek.games.length,
    wins: activeWeek.totalWins,
    losses: activeWeek.totalLosses,
    goals: activeWeek.totalGoals,
    conceded: activeWeek.totalConceded,
    winRate: activeWeek.games.length > 0 ? (activeWeek.totalWins / activeWeek.games.length) * 100 : 0,
    isActive: !activeWeek.isCompleted,
    progressToTarget: activeWeek.winTarget ? 
      Math.min(100, (activeWeek.totalWins / activeWeek.winTarget.wins) * 100) : 0,
    gamesRemaining: 15 - activeWeek.games.length
  } : null;

  return (
    <div className="space-y-8">
      {/* All-Time Performance */}
      <div>
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-fifa-blue" />
          All-Time Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnalyticsTooltip
            title="Total Games Played"
            description="Complete count of all FIFA Champions matches recorded across all weeks and accounts."
          >
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Games</p>
                    <p className="text-2xl font-bold text-white">{allTimeStats.totalGames}</p>
                    <p className="text-xs text-gray-500">{allTimeStats.completedWeeks} weeks completed</p>
                  </div>
                  <Calendar className="h-8 w-8 text-fifa-blue" />
                </div>
              </CardContent>
            </Card>
          </AnalyticsTooltip>

          <AnalyticsTooltip
            title="Overall Win Rate"
            description="Percentage of all games won. This is your primary performance indicator in FIFA Champions."
          >
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Win Rate</p>
                    <p className="text-2xl font-bold text-fifa-gold">{allTimeStats.winRate.toFixed(1)}%</p>
                    <p className="text-xs text-gray-500">{allTimeStats.totalWins}W - {allTimeStats.totalGames - allTimeStats.totalWins}L</p>
                  </div>
                  <Trophy className="h-8 w-8 text-fifa-gold" />
                </div>
              </CardContent>
            </Card>
          </AnalyticsTooltip>

          <AnalyticsTooltip
            title="Goals Per Game Average"
            description="Average goals scored per match. Higher values indicate strong attacking performance."
          >
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Goals Per Game</p>
                    <p className="text-2xl font-bold text-fifa-green">{allTimeStats.avgGoalsPerGame.toFixed(1)}</p>
                    <p className="text-xs text-gray-500">{allTimeStats.totalGoals} total goals</p>
                  </div>
                  <Target className="h-8 w-8 text-fifa-green" />
                </div>
              </CardContent>
            </Card>
          </AnalyticsTooltip>

          <AnalyticsTooltip
            title="Clean Sheet Rate"
            description="Percentage of games where you didn't concede any goals. Shows defensive strength."
          >
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Clean Sheets</p>
                    <p className="text-2xl font-bold text-fifa-blue">{allTimeStats.cleanSheetRate.toFixed(1)}%</p>
                    <p className="text-xs text-gray-500">{allTimeStats.totalCleanSheets} clean sheets</p>
                  </div>
                  <Shield className="h-8 w-8 text-fifa-blue" />
                </div>
              </CardContent>
            </Card>
          </AnalyticsTooltip>
        </div>
      </div>

      {/* Personal Records */}
      <div>
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Award className="h-6 w-6 text-fifa-gold" />
          Personal Records
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnalyticsTooltip
            title="Best Weekly Performance"
            description="Highest number of wins achieved in a single FIFA Champions week."
          >
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Best Week</p>
                    <p className="text-xl font-bold text-fifa-blue">{personalRecords.bestWeekWins} wins</p>
                    <p className="text-xs text-gray-500">in one week</p>
                  </div>
                  <Trophy className="h-6 w-6 text-fifa-blue" />
                </div>
              </CardContent>
            </Card>
          </AnalyticsTooltip>

          <AnalyticsTooltip
            title="Longest Win Streak"
            description="Most consecutive wins achieved during any FIFA Champions run."
          >
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Win Streak</p>
                    <p className="text-xl font-bold text-fifa-purple">{personalRecords.longestWinStreak}</p>
                    <p className="text-xs text-gray-500">consecutive wins</p>
                  </div>
                  <Flame className="h-6 w-6 text-fifa-purple" />
                </div>
              </CardContent>
            </Card>
          </AnalyticsTooltip>

          <AnalyticsTooltip
            title="Most Goals in One Game"
            description="Highest number of goals scored in a single match."
          >
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Most Goals</p>
                    <p className="text-xl font-bold text-fifa-green">{personalRecords.mostGoalsInGame}</p>
                    <p className="text-xs text-gray-500">in one game</p>
                  </div>
                  <Star className="h-6 w-6 text-fifa-green" />
                </div>
              </CardContent>
            </Card>
          </AnalyticsTooltip>

          <AnalyticsTooltip
            title="Biggest Victory Margin"
            description="Largest goal difference in a winning match."
          >
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Biggest Win</p>
                    <p className="text-xl font-bold text-fifa-gold">+{personalRecords.biggestWin}</p>
                    <p className="text-xs text-gray-500">goal difference</p>
                  </div>
                  <Zap className="h-6 w-6 text-fifa-gold" />
                </div>
              </CardContent>
            </Card>
          </AnalyticsTooltip>
        </div>
      </div>

      {/* Recent Performance Trends */}
      <div>
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-fifa-green" />
          Recent Performance (Last 5 Weeks)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-400">Recent Win Rate</p>
                {recentPerformance.isImproving ? (
                  <TrendingUp className="h-4 w-4 text-fifa-green" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-fifa-red" />
                )}
              </div>
              <p className="text-2xl font-bold text-white">{recentPerformance.avgWinRate.toFixed(1)}%</p>
              <p className="text-xs text-gray-500">
                {recentPerformance.isImproving ? 'Trending up' : 'Room for improvement'}
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-400">Avg Goals/Week</p>
                <Target className="h-4 w-4 text-fifa-green" />
              </div>
              <p className="text-2xl font-bold text-fifa-green">{recentPerformance.avgGoalsPerWeek.toFixed(1)}</p>
              <p className="text-xs text-gray-500">Recent average</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-400">Avg Conceded/Week</p>
                <Shield className="h-4 w-4 text-fifa-red" />
              </div>
              <p className="text-2xl font-bold text-fifa-red">{recentPerformance.avgConcededPerWeek.toFixed(1)}</p>
              <p className="text-xs text-gray-500">Recent average</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Current/Recent Run Summary */}
      {currentRunStats && (
        <div>
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-fifa-purple" />
            {currentRunStats.isActive ? 'Current Run' : 'Most Recent Run'}
          </h3>
          <Card className="glass-card">
            <CardHeader>
              <AnalyticsTooltip
                title={currentRunStats.isActive ? "Active FIFA Champions Run" : "Most Recent Completed Run"}
                description={currentRunStats.isActive ? "Your current ongoing FIFA Champions week progress and statistics." : "Summary of your most recently completed FIFA Champions week."}
              >
                <CardTitle className="text-white flex items-center justify-between">
                  <span>{currentRunStats.name}</span>
                  <div className="flex gap-2">
                    {currentRunStats.isActive && (
                      <span className="text-sm bg-fifa-green/20 text-fifa-green px-2 py-1 rounded-full">
                        Active
                      </span>
                    )}
                    {currentRunStats.gamesRemaining > 0 && (
                      <span className="text-sm bg-fifa-blue/20 text-fifa-blue px-2 py-1 rounded-full">
                        {currentRunStats.gamesRemaining} games left
                      </span>
                    )}
                  </div>
                </CardTitle>
              </AnalyticsTooltip>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-fifa-blue">{currentRunStats.gamesPlayed}</p>
                  <p className="text-sm text-gray-400">Games Played</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-fifa-green">{currentRunStats.winRate.toFixed(1)}%</p>
                  <p className="text-sm text-gray-400">Win Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-fifa-gold">{currentRunStats.wins}W - {currentRunStats.losses}L</p>
                  <p className="text-sm text-gray-400">Record</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${(currentRunStats.goals - currentRunStats.conceded) >= 0 ? 'text-fifa-green' : 'text-fifa-red'}`}>
                    {currentRunStats.goals - currentRunStats.conceded > 0 ? '+' : ''}{currentRunStats.goals - currentRunStats.conceded}
                  </p>
                  <p className="text-sm text-gray-400">Goal Difference</p>
                </div>
              </div>
              
              {currentRunStats.isActive && currentRunStats.progressToTarget > 0 && (
                <div>
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Progress to Target</span>
                    <span>{currentRunStats.progressToTarget.toFixed(1)}%</span>
                  </div>
                  <Progress value={currentRunStats.progressToTarget} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;
