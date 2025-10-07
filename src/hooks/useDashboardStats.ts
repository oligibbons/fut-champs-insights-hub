import { useMemo } from 'react';
import { WeeklyPerformance, GameResult, PlayerPerformance } from '@/types/futChampions';

export function useDashboardStats(weeklyData: WeeklyPerformance[]) {
  const allGames = useMemo(() => weeklyData.flatMap(w => w.games), [weeklyData]);
  const allPlayerPerformances = useMemo(() => allGames.flatMap(g => g.playerStats), [allGames]);

  const stats = useMemo(() => {
    // Main Row
    const bestRecord = Math.max(...weeklyData.map(w => w.totalWins), 0);
    const averageWins = weeklyData.length > 0 ? weeklyData.reduce((acc, week) => acc + week.totalWins, 0) / weeklyData.length : 0;
    const mostGoalsInRun = Math.max(...weeklyData.map(w => w.totalGoals), 0);
    const longestWinStreak = Math.max(...weeklyData.map(w => w.bestStreak), 0);

    // Secondary Row
    const totalGoals = weeklyData.reduce((acc, week) => acc + week.totalGoals, 0);
    const averageGoalsPerGame = allGames.length > 0 ? totalGoals / allGames.length : 0;
    const totalWins = weeklyData.reduce((acc, week) => acc + week.totalWins, 0);
    const totalExpectedGoals = weeklyData.reduce((acc, week) => acc + week.totalExpectedGoals, 0);
    const xgVsGoalsRatio = totalGoals > 0 ? totalExpectedGoals / totalGoals : 0;
    const totalConceded = weeklyData.reduce((acc, week) => acc + week.totalConceded, 0);
    const overallGoalDifference = totalGoals - total
