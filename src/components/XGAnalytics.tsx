import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WeeklyPerformance } from '@/types/futChampions';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface XGAnalyticsProps {
  weeklyData: WeeklyPerformance[];
}

const XGAnalytics = ({ weeklyData }: XGAnalyticsProps) => {
  const allGames = weeklyData.flatMap(week => week.games);
  const xgData = allGames.map(game => {
    const [goalsFor, goalsAgainst] = game.scoreLine.split('-').map(Number);
    return {
      name: `Game ${game.gameNumber}`,
      xg: game.teamStats.expectedGoals,
      goals: goalsFor,
      xga: game.teamStats.expectedGoalsAgainst,
      conceded: goalsAgainst,
      xg_diff: game.teamStats.expectedGoals - goalsFor,
      xga_diff: game.teamStats.expectedGoalsAgainst - goalsAgainst,
    };
  });

  const xgWins = allGames.filter(game => game.teamStats.expectedGoals > game.teamStats.expectedGoalsAgainst).length;
  const xgLosses = allGames.filter(game => game.teamStats.expectedGoals < game.teamStats.expectedGoalsAgainst).length;
  const xgDraws = allGames.length - xgWins - xgLosses;

  return (
    <Card>
      <CardHeader>
        <CardTitle>XG Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center mb-4">
          <div>
            <p className="text-2xl font-bold text-green-500">{xgWins}</p>
            <p className="text-xs text-muted-foreground">Wins on XG</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-500">{xgLosses}</p>
            <p className="text-xs text-muted-foreground">Losses on XG</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{xgDraws}</p>
            <p className="text-xs text-muted-foreground">Draws on XG</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={xgData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="xg_diff" fill="#8884d8" name="XG Differential" />
            <Bar dataKey="xga_diff" fill="#82ca9d" name="XGA Differential" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default XGAnalytics;
