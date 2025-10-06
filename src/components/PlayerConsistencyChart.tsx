import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WeeklyPerformance } from '@/types/futChampions';
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, BoxPlot } from 'recharts';
import { useTheme } from '@/hooks/useTheme';

interface PlayerConsistencyChartProps {
  weeklyData: WeeklyPerformance[];
}

const PlayerConsistencyChart = ({ weeklyData }: PlayerConsistencyChartProps) => {
  const { currentTheme } = useTheme();

  const allPlayerPerformances = weeklyData.flatMap(week => week.games.flatMap(game => game.playerStats || []));
  
  const playerRatings = allPlayerPerformances.reduce((acc, perf) => {
    if (!acc[perf.name]) {
      acc[perf.name] = [];
    }
    acc[perf.name].push(perf.rating);
    return acc;
  }, {} as { [key: string]: number[] });

  const chartData = Object.keys(playerRatings)
    .filter(playerName => playerRatings[playerName].length >= 10) // Minimum 10 games played
    .map(playerName => {
        const ratings = playerRatings[playerName].sort((a, b) => a - b);
        const min = ratings[0];
        const max = ratings[ratings.length - 1];
        const q1 = ratings[Math.floor(ratings.length / 4)];
        const median = ratings[Math.floor(ratings.length / 2)];
        const q3 = ratings[Math.floor((3 * ratings.length) / 4)];
        
        return {
            name: playerName,
            box: [min, q1, median, q3, max],
        };
    });

  return (
    <Card style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}>
      <CardHeader>
        <CardTitle style={{ color: currentTheme.colors.text }}>Player Rating Consistency (Min. 10 Games)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={chartData} layout="vertical" margin={{ top: 20, right: 20, bottom: 20, left: 60 }}>
            <CartesianGrid stroke={currentTheme.colors.border} strokeDasharray="3 3" />
            <XAxis type="number" stroke={currentTheme.colors.muted} domain={[4, 10]} />
            <YAxis type="category" dataKey="name" stroke={currentTheme.colors.muted} width={100} />
            <Tooltip 
              contentStyle={{
                backgroundColor: currentTheme.colors.surface,
                borderColor: currentTheme.colors.border
              }}
            />
            <BoxPlot dataKey="box" fill={currentTheme.colors.primary} stroke={currentTheme.colors.primary} />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default PlayerConsistencyChart;
