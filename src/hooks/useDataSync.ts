
import { useState, useEffect } from 'react';
import { useSupabaseData } from './useSupabaseData';
import { useAccountData } from './useAccountData';
import { WeeklyPerformance, PlayerPerformance } from '@/types/futChampions';

// Settings type for dashboard configuration
interface DashboardSettings {
  showTopPerformers: boolean;
  showMatchFacts: boolean;
  showWeeklyScores: boolean;
  showRecentForm: boolean;
  showTargetProgress: boolean;
}

interface CurrentWeekSettings {
  showCurrentRunStats: boolean;
}

interface Settings {
  dashboardSettings: DashboardSettings;
  currentWeekSettings: CurrentWeekSettings;
}

const defaultSettings: Settings = {
  dashboardSettings: {
    showTopPerformers: true,
    showMatchFacts: true,
    showWeeklyScores: true,
    showRecentForm: true,
    showTargetProgress: true,
  },
  currentWeekSettings: {
    showCurrentRunStats: true,
  }
};

export const useDataSync = () => {
  const supabaseData = useSupabaseData();
  const accountData = useAccountData();
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  // Calculate player statistics across all weeks
  const calculatePlayerStats = (): PlayerPerformance[] => {
    const allGames = supabaseData.weeklyData.flatMap(week => week.games || []);
    const playerStatsMap = new Map<string, {
      name: string;
      position: string;
      totalRating: number;
      games: number;
      goals: number;
      assists: number;
      totalMinutes: number;
    }>();

    allGames.forEach(game => {
      game.playerStats?.forEach(player => {
        const key = `${player.name}-${player.position}`;
        const existing = playerStatsMap.get(key) || {
          name: player.name,
          position: player.position,
          totalRating: 0,
          games: 0,
          goals: 0,
          assists: 0,
          totalMinutes: 0
        };

        existing.totalRating += player.rating;
        existing.games += 1;
        existing.goals += player.goals;
        existing.assists += player.assists;
        existing.totalMinutes += player.minutesPlayed;

        playerStatsMap.set(key, existing);
      });
    });

    return Array.from(playerStatsMap.values()).map((stats, index) => ({
      id: `stat-${index}`,
      name: stats.name,
      position: stats.position,
      rating: stats.totalRating / stats.games,
      goals: stats.goals,
      assists: stats.assists,
      yellowCards: 0,
      redCards: 0,
      ownGoals: 0,
      minutesPlayed: stats.totalMinutes,
      wasSubstituted: false,
      goalInvolvementsPer90: stats.totalMinutes > 0 ? ((stats.goals + stats.assists) / stats.totalMinutes) * 90 : 0
    }));
  };

  return {
    // Supabase data
    weeklyData: supabaseData.weeklyData,
    loading: supabaseData.loading,
    saveGame: supabaseData.saveGame,
    createWeek: supabaseData.createWeek,
    updateWeek: supabaseData.updateWeek,
    updateGame: supabaseData.updateGame,
    getCurrentWeek: supabaseData.getCurrentWeek,
    refreshData: supabaseData.refreshData,
    
    // Account data (for backwards compatibility)
    weeks: accountData.weeks,
    activeAccount: accountData.activeAccount,
    accounts: accountData.accounts,
    addAccount: accountData.addAccount,
    switchAccount: accountData.switchAccount,
    updateAccountData: accountData.updateAccountData,
    setWeeklyData: () => {}, // Legacy function for compatibility
    
    // Computed data
    calculatePlayerStats,
    
    // Settings
    settings,
    setSettings,
  };
};
