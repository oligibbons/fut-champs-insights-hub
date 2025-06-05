
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDataSync } from '@/hooks/useDataSync';
import { Trophy, Target, TrendingUp, Calendar, Award, Zap, BarChart3, Users } from 'lucide-react';
import AnalyticsTooltip from './AnalyticsTooltip';

const DashboardOverview = () => {
  const { weeklyData, calculatePlayerStats } = useDataSync();
  
  // All-time statistics
  const allTimeStats = {
    totalGames: weeklyData.reduce((sum, week) => sum + week.games.length, 0),
    totalWins: weeklyData.reduce((sum, week) => sum + week.totalWins, 0),
    totalGoals: weeklyData.reduce((sum, week) => sum + week.totalGoals, 0),
    totalConceded: weeklyData.reduce((sum, week) => sum + week.totalConceded, 0),
    completedWeeks: weeklyData.filter(week => week.isCompleted).length,
    avgGoalsPerGame: 0,
    avgConcededPerGame: 0,
    winRate: 0,
    goalDifference: 0
  };

  allTimeStats.avgGoalsPerGame = allTimeStats.totalGames > 0 ? allTimeStats.totalGoals / allTimeStats.totalGames : 0;
  allTimeStats.avgConcededPerGame = allTimeStats.totalGames > 0 ? allTimeStats.totalConceded / allTimeStats.totalGames : 0;
  allTimeStats.winRate = allTimeStats.totalGames > 0 ? (allTimeStats.totalWins / allTimeStats.totalGames) * 100 : 0;
  allTimeStats.goalDifference = allTimeStats.totalGoals - allTimeStats.totalConceded;

  // Personal records
  const personalRecords = {
    bestWeekWins: Math.max(...weeklyData.map(week => week.totalWins), 0),
    bestWeekGoals: Math.max(...weeklyData.map(week => week.totalGoals), 0),
    bestWeekCleanSheets: Math.max(...weeklyData.map(week => 
      week.games.filter(game => parseInt(game.scoreLine.split('-')[1]) === 0).length
    ), 0),
    longestWinStreak: Math.max(...weeklyData.map(week => week.bestStreak || 0), 0),
    bestGoalDifference: Math.max(...weeklyData.map(week => week.totalGoals - week.totalConceded), 0),
    highestWeeklyRating: Math.max(...weeklyData.map(week => week.weeklyRating || 0), 0)
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
    isActive: !activeWeek.isCompleted
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
            title="Goal Difference"
            description="Total goals scored minus total goals conceded. Positive values indicate balanced attacking and defensive play."
          >
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Goal Difference</p>
                    <p className={`text-2xl font-bold ${allTimeStats.goalDifference >= 0 ? 'text-fifa-green' : 'text-fifa-red'}`}>
                      {allTimeStats.goalDifference > 0 ? '+' : ''}{allTimeStats.goalDifference}
                    </p>
                    <p className="text-xs text-gray-500">vs {allTimeStats.avgConcededPerGame.toFixed(1)} conceded/game</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-fifa-purple" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnalyticsTooltip
            title="Best Weekly Performance"
            description="Highest number of wins achieved in a single FIFA Champions week."
          >
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Best Week (Wins)</p>
                    <p className="text-xl font-bold text-fifa-blue">{personalRecords.bestWeekWins}</p>
                    <p className="text-xs text-gray-500">wins in one week</p>
                  </div>
                  <Trophy className="h-6 w-6 text-fifa-blue" />
                </div>
              </CardContent>
            </Card>
          </AnalyticsTooltip>

          <AnalyticsTooltip
            title="Most Goals in One Week"
            description="Highest number of goals scored in a single FIFA Champions week."
          >
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Best Week (Goals)</p>
                    <p className="text-xl font-bold text-fifa-green">{personalRecords.bestWeekGoals}</p>
                    <p className="text-xs text-gray-500">goals in one week</p>
                  </div>
                  <Target className="h-6 w-6 text-fifa-green" />
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
                    <p className="text-sm text-gray-400">Longest Streak</p>
                    <p className="text-xl font-bold text-fifa-purple">{personalRecords.longestWinStreak}</p>
                    <p className="text-xs text-gray-500">consecutive wins</p>
                  </div>
                  <Zap className="h-6 w-6 text-fifa-purple" />
                </div>
              </CardContent>
            </Card>
          </AnalyticsTooltip>

          <AnalyticsTooltip
            title="Best Clean Sheet Week"
            description="Most clean sheets (games with 0 goals conceded) achieved in one week."
          >
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Best Clean Sheets</p>
                    <p className="text-xl font-bold text-fifa-blue">{personalRecords.bestWeekCleanSheets}</p>
                    <p className="text-xs text-gray-500">in one week</p>
                  </div>
                  <Award className="h-6 w-6 text-fifa-blue" />
                </div>
              </CardContent>
            </Card>
          </AnalyticsTooltip>

          <AnalyticsTooltip
            title="Best Goal Difference Week"
            description="Highest goal difference (goals scored minus conceded) achieved in one week."
          >
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Best Goal Diff</p>
                    <p className="text-xl font-bold text-fifa-green">+{personalRecords.bestGoalDifference}</p>
                    <p className="text-xs text-gray-500">in one week</p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-fifa-green" />
                </div>
              </CardContent>
            </Card>
          </AnalyticsTooltip>

          <AnalyticsTooltip
            title="Highest Weekly Rating"
            description="Best overall weekly performance rating achieved based on wins, goals, and opposition quality."
          >
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Highest Rating</p>
                    <p className="text-xl font-bold text-fifa-gold">{personalRecords.highestWeeklyRating.toFixed(1)}</p>
                    <p className="text-xs text-gray-500">weekly rating</p>
                  </div>
                  <Users className="h-6 w-6 text-fifa-gold" />
                </div>
              </CardContent>
            </Card>
          </AnalyticsTooltip>
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
                  {currentRunStats.isActive && (
                    <span className="text-sm bg-fifa-green/20 text-fifa-green px-2 py-1 rounded-full">
                      Active
                    </span>
                  )}
                </CardTitle>
              </AnalyticsTooltip>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;
