import { useMemo } from 'react';
import { WeeklyPerformance, PlayerPerformance } from '@/types/futChampions'; // Removed unused GameResult

// Default empty array for the argument
export function useDashboardStats(weeklyData: WeeklyPerformance[] = []) {

  // Early return if initial data is not usable
  if (!weeklyData || !Array.isArray(weeklyData)) {
    // Return a memoized default stats object
    return useMemo(() => ({
      bestRecord: 0, averageWins: 0, mostGoalsInRun: 0, longestWinStreak: 0,
      totalGoals: 0, averageGoalsPerGame: 0, totalWins: 0, xgVsGoalsRatio: 0,
      overallGoalDifference: 0, averagePlayerRating: 0, averageShotAccuracy: 0,
      averagePossession: 0, averageDribbleSuccess: 75, // Placeholder
      averagePassAccuracy: 0, averagePassesPerGame: 0, totalCleanSheets: 0,
      mvp: "N/A", disciplineIndex: "N/A"
    }), []);
  }

  // Calculate allGames, ensuring weeklyData and games within it are arrays
  const allGames = useMemo(() =>
    (weeklyData || [])
      .flatMap(w => (w && Array.isArray(w.games) ? w.games : [])) // Ensure w.games is an array
      .filter(g => g), // Remove any potential null/undefined games
    [weeklyData]
  );

  // Calculate allPlayerPerformances, ensuring allGames and playerStats are arrays
  const allPlayerPerformances = useMemo(() =>
    (allGames || [])
      .flatMap(g => (g && Array.isArray(g.playerStats) ? g.playerStats : [])) // Ensure g.playerStats is an array
      .filter(p => p), // Remove any potential null/undefined player stats
    [allGames]
  );

  // Calculate the main stats object
  const stats = useMemo(() => {
    // Re-validate arrays inside this specific useMemo block for extra safety
    const safeWeeklyData = Array.isArray(weeklyData) ? weeklyData : [];
    const safeAllGames = Array.isArray(allGames) ? allGames : [];
    const safeAllPlayerPerformances = Array.isArray(allPlayerPerformances) ? allPlayerPerformances : [];

    // --- Early exit within useMemo if derived arrays are empty ---
    // This might be redundant due to the top-level check, but adds safety
    if (safeWeeklyData.length === 0 && safeAllGames.length === 0 && safeAllPlayerPerformances.length === 0) {
        return {
          bestRecord: 0, averageWins: 0, mostGoalsInRun: 0, longestWinStreak: 0,
          totalGoals: 0, averageGoalsPerGame: 0, totalWins: 0, xgVsGoalsRatio: 0,
          overallGoalDifference: 0, averagePlayerRating: 0, averageShotAccuracy: 0,
          averagePossession: 0, averageDribbleSuccess: 75, averagePassAccuracy: 0,
          averagePassesPerGame: 0, totalCleanSheets: 0, mvp: "N/A", disciplineIndex: "N/A"
        };
    }
    // --- End Early Exit ---


    // Calculations (with added null checks just in case)
    const bestRecord = Math.max(0, ...safeWeeklyData.map(w => w?.totalWins || 0));
    const totalWinsSum = safeWeeklyData.reduce((acc, week) => acc + (week?.totalWins || 0), 0);
    const averageWins = safeWeeklyData.length > 0 ? totalWinsSum / safeWeeklyData.length : 0;
    const mostGoalsInRun = Math.max(0, ...safeWeeklyData.map(w => w?.totalGoals || 0));
    const longestWinStreak = Math.max(0, ...safeWeeklyData.map(w => w?.bestStreak || 0));

    const totalGoals = safeWeeklyData.reduce((acc, week) => acc + (week?.totalGoals || 0), 0);
    const averageGoalsPerGame = safeAllGames.length > 0 ? totalGoals / safeAllGames.length : 0;
    const totalWins = totalWinsSum; // Already calculated
    const totalExpectedGoals = safeWeeklyData.reduce((acc, week) => acc + (week?.totalExpectedGoals || 0), 0);
    const xgVsGoalsRatio = totalGoals > 0 ? totalExpectedGoals / totalGoals : 0;
    const totalConceded = safeWeeklyData.reduce((acc, week) => acc + (week?.totalConceded || 0), 0);
    const overallGoalDifference = totalGoals - totalConceded;

    const ratingSum = safeAllPlayerPerformances.reduce((acc, p) => acc + (p?.rating || 0), 0);
    const averagePlayerRating = safeAllPlayerPerformances.length > 0 ? ratingSum / safeAllPlayerPerformances.length : 0;


    const shotsAccuracySum = safeAllGames.reduce((acc, g) => {
        const shots = g?.teamStats?.shots;
        const shotsOnTarget = g?.teamStats?.shotsOnTarget;
        return acc + (shotsOnTarget && shots ? (shotsOnTarget / shots * 100) : 0);
    }, 0);
    const averageShotAccuracy = safeAllGames.length > 0 ? shotsAccuracySum / safeAllGames.length : 0;

    const possessionSum = safeAllGames.reduce((acc, g) => acc + (g?.teamStats?.possession || 0), 0);
    const averagePossession = safeAllGames.length > 0 ? possessionSum / safeAllGames.length : 0;

    const averageDribbleSuccess = 75; // Placeholder

    const passAccuracySum = safeAllGames.reduce((acc, g) => acc + (g?.teamStats?.passAccuracy || 0), 0);
    const averagePassAccuracy = safeAllGames.length > 0 ? passAccuracySum / safeAllGames.length : 0;

    const passesSum = safeAllGames.reduce((acc, g) => acc + (g?.teamStats?.passes || 0), 0);
    const averagePassesPerGame = safeAllGames.length > 0 ? passesSum / safeAllGames.length : 0;

    const totalCleanSheets = safeAllGames.filter(g => g?.scoreLine?.endsWith('-0')).length;


    // --- MVP Calculation ---
    const mvp = (() => {
      // Ensure safeAllPlayerPerformances is definitely an array before proceeding
      if (!Array.isArray(safeAllPlayerPerformances) || safeAllPlayerPerformances.length === 0) {
        return "Not enough data";
      }

      const playerStats: { [name: string]: { totalRating: number; games: number; goals: number; assists: number } } = {};

      // *** The critical forEach loop ***
      safeAllPlayerPerformances.forEach(p => {
        if (p && p.minutesPlayed > 0 && p.name && typeof p.rating === 'number') {
          if (!playerStats[p.name]) {
            playerStats[p.name] = { totalRating: 0, games: 0, goals: 0, assists: 0 };
          }
          playerStats[p.name].totalRating += p.rating;
          playerStats[p.name].games += 1;
          playerStats[p.name].goals += p.goals || 0;
          playerStats[p.name].assists += p.assists || 0;
        }
      });
      // *** End of forEach loop ***


      const qualifiedPlayers = Object.entries(playerStats).filter(([, stats]) => stats.games >= 10);

      let sortedPlayers: [string, { totalRating: number; games: number; goals: number; assists: number }][];

      if (qualifiedPlayers.length > 0) {
        sortedPlayers = qualifiedPlayers;
      } else {
        const allPlayers = Object.entries(playerStats);
        if (allPlayers.length === 0) return "Not enough data";
        sortedPlayers = allPlayers;
      }

      sortedPlayers.sort(([, a], [, b]) => {
          const avgRatingA = a.games > 0 ? a.totalRating / a.games : 0;
          const avgRatingB = b.games > 0 ? b.totalRating / b.games : 0;
          if (avgRatingA !== avgRatingB) {
              return avgRatingB - avgRatingA; // Sort descending by average rating
          }
          // Tie-breaker: goal involvement (goals + assists)
          const goalInvolvementA = a.goals + a.assists;
          const goalInvolvementB = b.goals + b.assists;
          return goalInvolvementB - goalInvolvementA; // Sort descending by goal involvement
      });

      return sortedPlayers[0]?.[0] || "Not enough data"; // Return name of the top player

    })(); // --- End MVP Calculation ---


    // --- Discipline Index Calculation ---
    const disciplineIndex = (() => {
        if (safeAllGames.length === 0) return "N/A";

        const totalFouls = safeAllGames.reduce((acc, g) => acc + (g?.teamStats?.fouls || 0), 0);
        const totalYellowCards = safeAllGames.reduce((acc, g) => acc + (g?.teamStats?.yellowCards || 0), 0);
        const totalRedCards = safeAllGames.reduce((acc, g) => acc + (g?.teamStats?.redCards || 0), 0);
        const gamesCount = safeAllGames.length;

        const score = (totalFouls * 0.1 + totalYellowCards * 0.5 + totalRedCards * 1) / gamesCount;

        if (score < 0.2) return "A+";
        if (score < 0.4) return "A";
        if (score < 0.6) return "B";
        if (score < 0.8) return "C";
        if (score < 1) return "D";
        return "F";
    })(); // --- End Discipline Index ---

    // Return the calculated stats
    return {
      bestRecord, averageWins, mostGoalsInRun, longestWinStreak, totalGoals,
      averageGoalsPerGame, totalWins, xgVsGoalsRatio, overallGoalDifference,
      averagePlayerRating, averageShotAccuracy, averagePossession,
      averageDribbleSuccess, averagePassAccuracy, averagePassesPerGame,
      totalCleanSheets, mvp, disciplineIndex
    };

  // Dependencies for the main stats calculation
  }, [weeklyData, allGames, allPlayerPerformances]);

  // Return the memoized stats object
  return stats;
}
