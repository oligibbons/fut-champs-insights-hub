// src/components/PlayerConsistencyChart.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WeeklyPerformance } from '@/types/futChampions';
import { BoxPlot, ViolinPlot, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PlayerConsistencyChartProps {
  weeklyData: WeeklyPerformance[];
}

const PlayerConsistencyChart = ({ weeklyData }: PlayerConsistencyChartProps) => {
  const allPlayerPerformances = weeklyData.flatMap(week => week.games.flatMap(game => game.playerStats || []));
  const playerRatings = allPlayerPerformances.reduce((acc, perf) => {
    if (!acc[perf.name]) {
      acc[perf.name] = [];
    }
    acc[perf.name].push(perf.rating);
    return acc;
  }, {} as { [key: string]: number[] });

  const chartData = Object.keys(playerRatings).map(playerName => {
    const ratings = playerRatings[playerName];
    const min = Math.min(...ratings);
    const max = Math.max(...ratings);
    const q1 = ratings.sort((a, b) => a - b)[Math.floor(ratings.length / 4)];
    const q3 = ratings.sort((a, b) => a - b)[Math.floor((3 * ratings.length) / 4)];
    const median = ratings.sort((a, b) => a - b)[Math.floor(ratings.length / 2)];

    return {
      name: playerName,
      boxPlot: [min, q1, median, q3, max],
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Player Rating Consistency</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BoxPlot data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <ViolinPlot dataKey="boxPlot" fill="#8884d8" />
          </BoxPlot>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default PlayerConsistencyChart;
