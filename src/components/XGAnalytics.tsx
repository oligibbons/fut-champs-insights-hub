import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label } from 'recharts';
import { useTheme } from '@/hooks/useTheme';
// --- FIX: Import useAccountData and Skeleton ---
import { useAccountData } from '@/hooks/useAccountData';
import { Skeleton } from '@/components/ui/skeleton';
import { WeeklyPerformance } from '@/types/futChampions';
import { Goal } from 'lucide-react';

// --- FIX: Remove weeklyData prop ---
const XGAnalytics = ({ weeklyData: propWeeklyData }: { weeklyData?: WeeklyPerformance[] }) => {
  const { currentTheme } = useTheme();
  // --- FIX: Add data hook and loading state ---
  const { weeklyData: contextWeeklyData = [], loading } = useAccountData() || {};
  
  const weeklyData = propWeeklyData || contextWeeklyData;

  const chartData = useMemo(() => {
    // This logic is now safe
    return weeklyData
      .filter(week => week.isCompleted)
      .sort((a, b) => a.weekNumber - b.weekNumber)
      .map(week => ({
        week: `W${week.weekNumber}`,
        goals: week.totalGoals,
        xg: week.totalExpectedGoals,
        goalsPerGame: week.totalGoals / week.games.length,
        xgPerGame: week.totalExpectedGoals / week.games.length,
        games: week.games.length,
      }));
  }, [weeklyData]);

  const totalGoals = useMemo(() => weeklyData.reduce((sum, week) => sum + week.totalGoals, 0), [weeklyData]);
  const totalXG = useMemo(() => weeklyData.reduce((sum, week) => sum + week.totalExpectedGoals, 0), [weeklyData]);
  const totalGames = useMemo(() => weeklyData.reduce((sum, week) => sum + week.games.length, 0), [weeklyData]);

  const avgGoalsPerGame = totalGames > 0 ? (totalGoals / totalGames).toFixed(2) : '0.00';
  const avgXGPerGame = totalGames > 0 ? (totalXG / totalGames).toFixed(2) : '0.00';
  const overperformance = (totalGoals - totalXG).toFixed(2);

  // --- FIX: Add loading state ---
  if (loading && !propWeeklyData) {
    return (
      <Card 
        style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}
        className="h-[400px]"
      >
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
          <div className="grid grid-cols-3 gap-4 mt-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
            <Goal className="h-5 w-5" style={{ color: currentTheme.colors.primary }} />
            xG (Expected Goals) Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12" style={{ color: currentTheme.colors.muted }}>
          <p>No xG data available. Start recording games with xG to see this analysis.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
          <Goal className="h-5 w-5" style={{ color: currentTheme.colors.primary }} />
          xG (Expected Goals) Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={currentTheme.colors.border} />
              <XAxis dataKey="week" stroke={currentTheme.colors.muted} fontSize={12} />
              <YAxis stroke={currentTheme.colors.muted} fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: currentTheme.colors.surface,
                  borderColor: currentTheme.colors.border,
                  borderRadius: '0.75rem',
                  color: currentTheme.colors.text,
                }}
              />
              <Line 
                type="monotone" 
                dataKey="goalsPerGame" 
                name="Goals / Game" 
                stroke={currentTheme.colors.primary} 
                strokeWidth={2} 
                dot={{ r: 4, fill: currentTheme.colors.primary }}
              />
              <Line 
                type="monotone" 
                dataKey="xgPerGame" 
                name="xG / Game" 
                stroke={currentTheme.colors.accent} 
                strokeWidth={2} 
                strokeDasharray="5 5"
                dot={{ r: 4, fill: currentTheme.colors.accent }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-lg" style={{ backgroundColor: currentTheme.colors.surface }}>
            <p className="text-sm font-medium" style={{ color: currentTheme.colors.muted }}>Avg. Goals / Game</p>
            <p className="text-2xl font-bold" style={{ color: currentTheme.colors.text }}>{avgGoalsPerGame}</p>
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: currentTheme.colors.surface }}>
            <p className="text-sm font-medium" style={{ color: currentTheme.colors.muted }}>Avg. xG / Game</p>
            <p className="text-2xl font-bold" style={{ color: currentTheme.colors.text }}>{avgXGPerGame}</p>
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: currentTheme.colors.surface }}>
            <p className="text-sm font-medium" style={{ color: currentTheme.colors.muted }}>G-xG Overperformance</p>
            <p 
              className={`text-2xl font-bold ${parseFloat(overperformance) > 0 ? 'text-green-500' : 'text-red-500'}`}
            >
              {parseFloat(overperformance) > 0 ? '+' : ''}{overperformance}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default XGAnalytics;
