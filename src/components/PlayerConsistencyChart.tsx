import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WeeklyPerformance } from '@/types/futChampions';
import { ResponsiveContainer, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Bar, ErrorBar } from 'recharts';
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
        const median = ratings[Math.floor(ratings.length / 2)];
        
        return {
            name: playerName,
            median: median,
            range: [min, max], // Data for the ErrorBar component
        };
    });

  return (
    <Card style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}>
      <CardHeader>
        <CardTitle style={{ color: currentTheme.colors.text }}>Player Rating Consistency (Min. 10 Games)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, bottom: 20, left: 100 }}>
            <CartesianGrid stroke={currentTheme.colors.border} strokeDasharray="3 3" />
            <XAxis type="number" stroke={currentTheme.colors.muted} domain={[4, 10]} />
            <YAxis type="category" dataKey="name" stroke={currentTheme.colors.muted} width={100} />
            <Tooltip 
              cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
              contentStyle={{
                backgroundColor: currentTheme.colors.surface,
                borderColor: currentTheme.colors.border
              }}
              formatter={(value, name, props) => {
                if (name === 'median' && props.payload.range) {
                  return [`Median: ${value.toFixed(1)} | Range: ${props.payload.range[0]} - ${props.payload.range[1]}`, null]
                }
                return [value, name]
              }}
            />
            <Bar dataKey="median" fill={currentTheme.colors.primary}>
                <ErrorBar dataKey="range" width={5} strokeWidth={2} stroke={currentTheme.colors.accent} direction="x" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default PlayerConsistencyChart;
