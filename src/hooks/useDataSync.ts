
import { useLocalStorage } from './useLocalStorage';
import { WeeklyPerformance, Player, Squad, UserSettings, GameResult } from '@/types/futChampions';

export function useDataSync() {
  const [activeAccount] = useLocalStorage<string>('fc25-active-account', 'Main Account');
  
  // Unified data storage keys
  const getStorageKey = (type: string) => `fc25-${type}-${activeAccount}`;
  
  const [weeklyData, setWeeklyData] = useLocalStorage<WeeklyPerformance[]>(getStorageKey('weeks'), []);
  const [players, setPlayers] = useLocalStorage<Player[]>(getStorageKey('players'), []);
  const [squads, setSquads] = useLocalStorage<Squad[]>(getStorageKey('squads'), []);
  const [settings, setSettings] = useLocalStorage<UserSettings>('fc25-settings', {
    preferredFormation: '4-3-3',
    trackingStartDate: new Date().toISOString().split('T')[0],
    gameplayStyle: 'balanced',
    notifications: true,
    gamesPerWeek: 15,
    theme: 'futvisionary',
    carouselSpeed: 12,
    defaultCrossPlay: false,
    dashboardSettings: {
      showTopPerformers: true,
      showXGAnalysis: true,
      showAIInsights: true,
      showFormAnalysis: true,
      showWeaknesses: true,
      showOpponentAnalysis: true,
      showPositionalAnalysis: true,
      showRecentTrends: true,
      showAchievements: true,
      showTargetProgress: true,
      showTimeAnalysis: true,
      showStressAnalysis: true,
    },
    currentWeekSettings: {
      showTopPerformers: true,
      showXGAnalysis: true,
      showAIInsights: true,
      showFormAnalysis: true,
      showWeaknesses: true,
      showOpponentAnalysis: true,
      showPositionalAnalysis: true,
      showRecentTrends: true,
      showAchievements: true,
      showTargetProgress: true,
      showTimeAnalysis: true,
      showStressAnalysis: true,
    },
    qualifierSettings: {
      totalGames: 5,
      winsRequired: 2,
    },
    targetSettings: {
      autoSetTargets: false,
      adaptiveTargets: true,
      notifyOnTarget: true,
    },
    analyticsPreferences: {
      detailedPlayerStats: true,
      opponentTracking: true,
      timeTracking: true,
      stressTracking: true,
      showAnimations: true,
      dynamicFeedback: true,
    }
  });

  const getCurrentWeek = (): WeeklyPerformance | null => {
    return weeklyData.find(week => !week.isCompleted) || null;
  };

  const addGameToWeek = (weekId: string, game: GameResult) => {
    const updatedWeeks = weeklyData.map(week => {
      if (week.id === weekId) {
        const updatedGames = [...week.games, game];
        return {
          ...week,
          games: updatedGames,
          totalWins: updatedGames.filter(g => g.result === 'win').length,
          totalLosses: updatedGames.filter(g => g.result === 'loss').length,
          totalGoals: updatedGames.reduce((sum, g) => {
            const [goals] = g.scoreLine.split('-').map(Number);
            return sum + goals;
          }, 0),
          totalConceded: updatedGames.reduce((sum, g) => {
            const [, conceded] = g.scoreLine.split('-').map(Number);
            return sum + conceded;
          }, 0),
          averageOpponentSkill: updatedGames.reduce((sum, g) => sum + g.opponentSkill, 0) / updatedGames.length,
          totalPlayTime: updatedGames.reduce((sum, g) => sum + g.duration, 0),
          averageGameDuration: updatedGames.reduce((sum, g) => sum + g.duration, 0) / updatedGames.length,
          isCompleted: updatedGames.length >= settings.gamesPerWeek,
          gamesPlayed: updatedGames.length,
        };
      }
      return week;
    });
    setWeeklyData(updatedWeeks);
  };

  const calculatePlayerStats = () => {
    const allGames = weeklyData.flatMap(week => week.games || []);
    const playerStats = new Map();

    allGames.forEach(game => {
      game.playerStats?.forEach(playerPerf => {
        const existing = playerStats.get(playerPerf.name) || {
          name: playerPerf.name,
          position: playerPerf.position,
          gamesPlayed: 0,
          totalMinutes: 0,
          goals: 0,
          assists: 0,
          totalRating: 0,
          yellowCards: 0,
          redCards: 0
        };

        existing.gamesPlayed += 1;
        existing.totalMinutes += playerPerf.minutesPlayed;
        existing.goals += playerPerf.goals;
        existing.assists += playerPerf.assists;
        existing.totalRating += playerPerf.rating;
        existing.yellowCards += playerPerf.yellowCards;
        existing.redCards += playerPerf.redCards;

        playerStats.set(playerPerf.name, existing);
      });
    });

    return Array.from(playerStats.values()).map(player => ({
      ...player,
      averageRating: player.gamesPlayed > 0 ? (player.totalRating / player.gamesPlayed) : 0,
      goalsPer90: player.totalMinutes > 0 ? (player.goals * 90) / player.totalMinutes : 0,
      assistsPer90: player.totalMinutes > 0 ? (player.assists * 90) / player.totalMinutes : 0,
      goalInvolvements: player.goals + player.assists,
      goalInvolvementsPer90: player.totalMinutes > 0 ? ((player.goals + player.assists) * 90) / player.totalMinutes : 0
    }));
  };

  const getDefaultSquad = () => {
    return squads.find(squad => squad.isDefault === true) || null;
  };

  const deleteAllData = () => {
    // Clear all FC25 data from localStorage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('fc25-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Reset state to empty arrays/defaults
    setWeeklyData([]);
    setPlayers([]);
    setSquads([]);
    
    // Reset settings to defaults
    setSettings({
      preferredFormation: '4-3-3',
      trackingStartDate: new Date().toISOString().split('T')[0],
      gameplayStyle: 'balanced',
      notifications: true,
      gamesPerWeek: 15,
      theme: 'futvisionary',
      carouselSpeed: 12,
      defaultCrossPlay: false,
      dashboardSettings: {
        showTopPerformers: true,
        showXGAnalysis: true,
        showAIInsights: true,
        showFormAnalysis: true,
        showWeaknesses: true,
        showOpponentAnalysis: true,
        showPositionalAnalysis: true,
        showRecentTrends: true,
        showAchievements: true,
        showTargetProgress: true,
        showTimeAnalysis: true,
        showStressAnalysis: true,
      },
      currentWeekSettings: {
        showTopPerformers: true,
        showXGAnalysis: true,
        showAIInsights: true,
        showFormAnalysis: true,
        showWeaknesses: true,
        showOpponentAnalysis: true,
        showPositionalAnalysis: true,
        showRecentTrends: true,
        showAchievements: true,
        showTargetProgress: true,
        showTimeAnalysis: true,
        showStressAnalysis: true,
      },
      qualifierSettings: {
        totalGames: 5,
        winsRequired: 2,
      },
      targetSettings: {
        autoSetTargets: false,
        adaptiveTargets: true,
        notifyOnTarget: true,
      },
      analyticsPreferences: {
        detailedPlayerStats: true,
        opponentTracking: true,
        timeTracking: true,
        stressTracking: true,
        showAnimations: true,
        dynamicFeedback: true,
      }
    });
  };

  return {
    activeAccount,
    weeklyData,
    setWeeklyData,
    players,
    setPlayers,
    squads,
    setSquads,
    settings,
    setSettings,
    getCurrentWeek,
    addGameToWeek,
    calculatePlayerStats,
    getStorageKey,
    getDefaultSquad,
    deleteAllData
  };
}
