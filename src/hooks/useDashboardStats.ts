import { useMemo } from 'react';
import { WeeklyPerformance, GameResult, PlayerPerformance } from '@/types/futChampions';

// --- FIX 1: Add default empty array to the argument ---
export function useDashboardStats(weeklyData: WeeklyPerformance[] = []) {

  // --- NEW FIX: Early return if weeklyData is not yet available ---
  if (!weeklyData || weeklyData.length === 0) {
    return useMemo(() => ({
      bestRecord: 0,
      averageWins: 0,
      mostGoalsInRun: 0,
      longestWinStreak: 0,
      totalGoals: 0,
      averageGoalsPerGame: 0,
      totalWins: 0,
      xgVsGoalsRatio: 0,
      overallGoalDifference: 0,
      averagePlayerRating: 0,
      averageShotAccuracy: 0,
      averagePossession: 0,
      averageDribbleSuccess: 0, // Placeholder
      averagePassAccuracy: 0,
      averagePassesPerGame: 0,
      totalCleanSheets: 0,
      mvp: "N/A",
      disciplineIndex: "N/A"
    }), []); // Return default empty stats object wrapped in useMemo
  }
  // --- END NEW FIX ---

  // --- FIX 2: Keep '|| []' for safety, though early return should prevent need ---
  const allGames = useMemo(() => (weeklyData || []).flatMap(w => w.games || []), [weeklyData]);
  
  // --- FIX 3: Keep '|| []' for safety ---
  const allPlayerPerformances = useMemo(() => (allGames || []).flatMap(g => g.playerStats || []), [allGames]);

  const stats = useMemo(() => {
    // These should now be safe because of the early return
    const safeWeeklyData = weeklyData;
    const safeAllGames = allGames;
    const safeAllPlayerPerformances = allPlayerPerformances;

    // Main Row
    const bestRecord = Math.max(...safeWeeklyData.map(w => w.totalWins), 0);
    const averageWins = safeWeeklyData.length > 0 ? safeWeeklyData.reduce((acc, week) => acc + week.totalWins, 0) / safeWeeklyData.length : 0;
    const mostGoalsInRun = Math.max(...safeWeeklyData.map(w => w.totalGoals), 0);
    const longestWinStreak = Math.max(...safeWeeklyData.map(w => w.bestStreak), 0);

    // Secondary Row
    const totalGoals = safeWeeklyData.reduce((acc, week) => acc + week.totalGoals, 0);
    const averageGoalsPerGame = safeAllGames.length > 0 ? totalGoals / safeAllGames.length : 0;
    const totalWins = safeWeeklyData.reduce((acc, week) => acc + week.totalWins, 0);
    const totalExpectedGoals = safeWeeklyData.reduce((acc, week) => acc + week.totalExpectedGoals, 0);
    const xgVsGoalsRatio = totalGoals > 0 ? totalExpectedGoals / totalGoals : 0;
    const totalConceded = safeWeeklyData.reduce((acc, week) => acc + week.totalConceded, 0);
    const overallGoalDifference = totalGoals - totalConceded;
    // Add check for safeAllPlayerPerformances length before reducing
    const averagePlayerRating = safeAllPlayerPerformances.length > 0 ? safeAllPlayerPerformances.reduce((acc, p) => acc + (p?.rating || 0), 0) / safeAllPlayerPerformances.length : 0;


    // Tertiary Row
    // Add check for safeAllGames length before reducing
    const averageShotAccuracy = safeAllGames.length > 0 ? safeAllGames.reduce((acc, g) => acc + (g?.teamStats?.shotsOnTarget && g?.teamStats?.shots ? g.teamStats.shotsOnTarget / g.teamStats.shots * 100 : 0), 0) / safeAllGames.length : 0;
    const averagePossession = safeAllGames.length > 0 ? safeAllGames.reduce((acc, g) => acc + (g?.teamStats?.possession || 0), 0) / safeAllGames.length : 0;
    const averageDribbleSuccess = 75; // Placeholder
    const averagePassAccuracy = safeAllGames.length > 0 ? safeAllGames.reduce((acc, g) => acc + (g?.teamStats?.passAccuracy || 0), 0) / safeAllGames.length : 0;
    const averagePassesPerGame = safeAllGames.length > 0 ? safeAllGames.reduce((acc, g) => acc + (g?.teamStats?.passes || 0), 0) / safeAllGames.length : 0;
    // Add nullish check for g?.scoreLine
    const totalCleanSheets = safeAllGames.filter(g => g?.scoreLine?.endsWith('-0')).length;


    const mvp = (() => {
        const playerStats: { [name: string]: { totalRating: number; games: number; goals: number; assists: number } } = {};
        
        // --- FIX 4: Use the 'safe' array for forEach ---
        safeAllPlayerPerformances.forEach(p => {
          // Add nullish checks for p and properties
            if (p?.minutesPlayed > 0 && p?.name && typeof p?.rating === 'number') {
                if (!playerStats[p.name]) {
                    playerStats[p.name] = { totalRating: 0, games: 0, goals: 0, assists: 0 };
                }
                playerStats[p.name].totalRating += p.rating;
                playerStats[p.name].games += 1;
                playerStats[p.name].goals += p.goals || 0; // Add default 0
                playerStats[p.name].assists += p.assists || 0; // Add default 0
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
            return allPlayers[0][0]; // Check if allPlayers[0] exists
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

        return qualifiedPlayers[0]?.[0] || "Not enough data"; // Add check if qualifiedPlayers[0] exists
    })();

    const disciplineIndex = (() => {
        // Add checks for safeAllGames length before reducing
        const totalFouls = safeAllGames.length > 0 ? safeAllGames.reduce((acc, g) => acc + (g?.teamStats?.fouls || 0), 0) : 0;
        const totalYellowCards = safeAllGames.length > 0 ? safeAllGames.reduce((acc, g) => acc + (g?.teamStats?.yellowCards || 0), 0) : 0;
        const totalRedCards = safeAllGames.length > 0 ? safeAllGames.reduce((acc, g) => acc + (g?.teamStats?.redCards || 0), 0) : 0;

        const gamesCount = safeAllGames.length;
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
