import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import type { WeeklyPerformance } from "@/types/futChampions";

const PerformanceOverTimeChart = ({ data }: { data: WeeklyPerformance[] }) => {
  const chartData = data.map(week => ({
    name: `Week ${week.weekNumber}`,
    wins: week.totalWins,
    goalsFor: week.totalGoals,
    goalsAgainst: week.totalConceded,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-[300px] w-full">
          <LineChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Line dataKey="wins" type="monotone" stroke="hsl(var(--primary))" strokeWidth={2} dot={true} />
            <Line dataKey="goalsFor" type="monotone" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={true} />
            <Line dataKey="goalsAgainst" type="monotone" stroke="hsl(var(--destructive))" strokeWidth={2} dot={true} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default PerformanceOverTimeChart;
