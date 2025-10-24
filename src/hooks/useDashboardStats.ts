import { useMemo } from 'react';
import { WeeklyPerformance, GameResult, PlayerPerformance } from '@/types/futChampions';

// --- FIX IS ON THIS LINE ---
// Added '= []' to provide a default value and prevent crashes
export function useDashboardStats(weeklyData: WeeklyPerformance[] = []) {
// --- END FIX ---

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
    const overallGoalDifference = totalGoals - totalConceded;
    const averagePlayerRating = allPlayerPerformances.length > 0 ? allPlayerPerformances.reduce((acc, p) => acc + p.rating, 0) / allPlayerPerformances.length : 0;

    // Tertiary Row
    const averageShotAccuracy = allGames.length > 0 ? allGames.reduce((acc, g) => acc + (g.teamStats?.shotsOnTarget && g.teamStats.shots ? g.teamStats.shotsOnTarget / g.teamStats.shots * 100 : 0), 0) / allGames.length : 0;
    const averagePossession = allGames.length > 0 ? allGames.reduce((acc, g) => acc + (g.teamStats?.possession || 0), 0) / allGames.length : 0;
    // Assuming dribble success rate is not available, so I'll use a placeholder. You can replace it with the actual data if you have it.
    const averageDribbleSuccess = 75; // Placeholder
    const averagePassAccuracy = allGames.length > 0 ? allGames.reduce((acc, g) => acc + (g.teamStats?.passAccuracy || 0), 0) / allGames.length : 0;
    const averagePassesPerGame = allGames.length > 0 ? allGames.reduce((acc, g) => acc + (g.teamStats?.passes || 0), 0) / allGames.length : 0;
    const totalCleanSheets = allGames.filter(g => g.scoreLine.endsWith('-0')).length;

    const mvp = (() => {
        const playerStats: { [name: string]: { totalRating: number; games: number; goals: number; assists: number } } = {};
        allPlayerPerformances.forEach(p => {
            if (p.minutesPlayed > 0) {
                if (!playerStats[p.name]) {
                    playerStats[p.name] = { totalRating: 0, games: 0, goals: 0, assists: 0 };
                }
                playerStats[p.name].totalRating += p.rating;
                playerStats[p.name].games += 1;
                playerStats[p.name].goals += p.goals;
                playerStats[p.name].assists += p.assists;
            }
        });

        const qualifiedPlayers = Object.entries(playerStats).filter(([, stats]) => stats.games >= 10);
        if (qualifiedPlayers.length === 0) {
            const allPlayers = Object.entries(playerStats);
            if (allPlayers.length === 0) return "Not enough data";
            allPlayers.sort(([, a], [, b]) => {
                const avgRatingA = a.totalRating / a.games;
                const avgRatingB = b.totalRating / b.games;
                if (avgRatingA !== avgRatingB) {
                    return avgRatingB - avgRatingA;
                }
                const goalInvolvementA = a.goals + a.assists;
                const goalInvolvementB = b.goals + b.assists;
                return goalInvolvementB - goalInvolvementA;
            });
            return allPlayers[0][0];
        }

        qualifiedPlayers.sort(([, a], [, b]) => {
            const avgRatingA = a.totalRating / a.games;
            const avgRatingB = b.totalRating / b.games;
            if (avgRatingA !== avgRatingB) {
                return avgRatingB - avgRatingA;
            }
            const goalInvolvementA = a.goals + a.assists;
            const goalInvolvementB = b.goals + b.assists;
            return goalInvolvementB - goalInvolvementA;
        });

        return qualifiedPlayers[0][0];
    })();

    const disciplineIndex = (() => {
        const totalFouls = allGames.reduce((acc, g) => acc + (g.teamStats?.fouls || 0), 0);
        const totalYellowCards = allGames.reduce((acc, g) => acc + (g.teamStats?.yellowCards || 0), 0);
        const totalRedCards = allGames.reduce((acc, g) => acc + (g.teamStats?.redCards || 0), 0);
        const gamesCount = allGames.length;
        if (gamesCount === 0) return "N/A";

        const score = (totalFouls * 0.1 + totalYellowCards * 0.5 + totalRedCards * 1) / gamesCount;

        if (score < 0.2) return "A+";
        if (score < 0.4) return "A";
        if (score < 0.6) return "B";
        if (score < 0.8) return "C";
        if (score < 1) return "D";
        return "F";
    })();

    return {
      bestRecord,
      averageWins,
      mostGoalsInRun,
      longestWinStreak,
      totalGoals,
      averageGoalsPerGame,
      totalWins,
      xgVsGoalsRatio,
      overallGoalDifference,
      averagePlayerRating,
      averageShotAccuracy,
      averagePossession,
      averageDribbleSuccess,
      averagePassAccuracy,
      averagePassesPerGame,
      totalCleanSheets,
      mvp,
      disciplineIndex
    };
  }, [weeklyData, allGames, allPlayerPerformances]);

  return stats;
}
