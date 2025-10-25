import { useMemo } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { useAccountData } from '@/hooks/useAccountData';
import { useTheme } from '@/hooks/useTheme';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import DashboardSection from '@/components/DashboardSection';
import { WeeklyPerformance } from '@/integrations/supabase/types'; // Assuming this type export exists

// Define the shape of the data our chart will use
type ChartData = {
  name: string;
  wins: number;
};

const WeeklyWinsChart = () => {
  const { weeklyData = [], loading } = useAccountData() || {};
  const { currentTheme } = useTheme();

  // Process the data for the chart
  const chartData: ChartData[] = useMemo(() => {
    if (!weeklyData) return [];

    // 1. Filter for completed weeks
    const completedWeeks = weeklyData.filter(
      (w: WeeklyPerformance) => w.is_completed
    );

    // 2. Sort by start_date ascending to get chronological order
    // We sort descending first to get the most recent, slice, then reverse.
    const sortedWeeks = completedWeeks.sort(
      (a: WeeklyPerformance, b: WeeklyPerformance) =>
        new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
    );

    // 3. Take the 8 most recent weeks for a "trend" view
    const recentWeeks = sortedWeeks.slice(0, 8);

    // 4. Reverse to put back in chronological order for the x-axis
    // 5. Map to the format recharts needs
    return recentWeeks
      .reverse()
      .map((week: WeeklyPerformance) => ({
        name: week.custom_name || `Week ${week.week_number}`,
        wins: week.total_wins || 0,
      }));
  }, [weeklyData]);

  // Chart configuration for shadcn/recharts
  const chartConfig = {
    wins: {
      label: 'Wins',
      color: 'hsl(var(--fifa-blue))', // Use the blue from your theme
    },
  };

  // Loading State
  if (loading) {
    return (
      <DashboardSection title="Recent Win Trend">
        <Skeleton
          className="h-64 w-full rounded-2xl"
          style={{ backgroundColor: currentTheme.colors.surface }}
        />
      </DashboardSection>
    );
  }

  // Empty State
  if (chartData.length === 0) {
    return (
      <DashboardSection title="Recent Win Trend">
        <div
          className="flex h-64 w-full items-center justify-center rounded-2xl"
          style={{ backgroundColor: currentTheme.colors.surface }}
        >
          <p className="text-sm text-muted-foreground">
            Complete a few weeks to see your win trend.
          </p>
        </div>
      </DashboardSection>
    );
  }

  // Active State
  return (
    <DashboardSection title="Recent Win Trend">
      {/* Set aspect ratio for the chart container */}
      <div className="h-64 w-full">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 5, // Add a little margin
                left: -15, // Adjust to align Y-axis labels
                bottom: -5, // Reduce bottom padding
              }}
              accessibilityLayer // Good for accessibility
            >
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                // Hide tick labels if they overlap
                interval="preserveStartEnd"
              />
              <YAxis
                dataKey="wins"
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                width={20} // Give space for 2-digit win numbers
              />
              <ChartTooltip
                cursor={false} // Disable cursor line
                content={
                  <ChartTooltipContent
                    className="rounded-lg" // Ensure tooltip is styled
                    labelFormatter={(value) => (
                      <div className="font-semibold">{value}</div>
                    )}
                    indicator="dot"
                  />
                }
              />
              <Bar
                dataKey="wins"
                fill="hsl(var(--fifa-blue))"
                radius={[4, 4, 0, 0]} // Rounded top corners
                barSize={30} // Set a max bar size
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </DashboardSection>
  );
};

export default WeeklyWinsChart;
