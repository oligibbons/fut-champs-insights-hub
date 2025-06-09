import { useState, useEffect } from 'react';
import { useSupabaseData } from './useSupabaseData';
import { WeeklyPerformance, PlayerPerformance } from '@/types/futChampions';

// Settings type for dashboard configuration
interface DashboardSettings {
  showTopPerformers: boolean;
  showXGAnalysis: boolean;
  showAIInsights: boolean;
  showFormAnalysis: boolean;
  showWeaknesses: boolean;
  showOpponentAnalysis: boolean;
  showPositionalAnalysis: boolean;
  showRecentTrends: boolean;
  showAchievements: boolean;
  showTargetProgress: boolean;
  showTimeAnalysis: boolean;
  showStressAnalysis: boolean;
  showMatchFacts: boolean;
  showWeeklyScores: boolean;
  showRecentForm: boolean;
}

interface CurrentWeekSettings {
  showCurrentRunStats: boolean;
  showTopPerformers: boolean;
  showXGAnalysis: boolean;
  showAIInsights: boolean;
  showFormAnalysis: boolean;
  showWeaknesses: boolean;
  showOpponentAnalysis: boolean;
  showPositionalAnalysis: boolean;
  showRecentTrends: boolean;
  showAchievements: boolean;
  showTargetProgress: boolean;
  showTimeAnalysis: boolean;
  showStressAnalysis: boolean;
}

interface AnalyticsPreferences {
  detailedPlayerStats: boolean;
  opponentTracking: boolean;
  timeTracking: boolean;
  stressTracking: boolean;
  showAnimations: boolean;
  dynamicFeedback: boolean;
}

interface Settings {
  preferredFormation: string;
  trackingStartDate: string;
  gameplayStyle: string;
  notifications: boolean;
  gamesPerWeek: number;
  theme: string;
  carouselSpeed: number;
  defaultCrossPlay: boolean;
  dashboardSettings: DashboardSettings;
  currentWeekSettings: CurrentWeekSettings;
  analyticsPreferences: AnalyticsPreferences;
  qualifierSettings: {
    totalGames: number;
    winsRequired: number;
  };
  targetSettings: {
    autoSetTargets: boolean;
    adaptiveTargets: boolean;
    notifyOnTarget: boolean;
  };
}

const defaultSettings: Settings = {
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
    showMatchFacts: true,
    showWeeklyScores: true,
    showRecentForm: true,
  },
  currentWeekSettings: {
    showCurrentRunStats: true,
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
  analyticsPreferences: {
    detailedPlayerStats: true,
    opponentTracking: true,
    timeTracking: true,
    stressTracking: true,
    showAnimations: true,
    dynamicFeedback: true,
  },
  qualifierSettings: {
    totalGames: 5,
    winsRequired: 2,
  },
  targetSettings: {
    autoSetTargets: false,
    adaptiveTargets: true,
    notifyOnTarget: true,
  }
};

export const useDataSync = () => {
  const supabaseData = useSupabaseData();
  const [settings, setSettings] = useState<Settings>(() => {
    // Load settings from localStorage if available
    const savedSettings = localStorage.getItem('futChampions_settings');
    if (savedSettings) {
      try {
        return { ...defaultSettings, ...JSON.parse(savedSettings) };
      } catch (e) {
        console.error('Error parsing saved settings:', e);
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('futChampions_settings', JSON.stringify(settings));
  }, [settings]);

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

  // Auto-complete week when 15 games are played
  useEffect(() => {
    const currentWeek = supabaseData.getCurrentWeek();
    if (currentWeek && currentWeek.games.length >= 15 && !currentWeek.isCompleted) {
      supabaseData.updateWeek(currentWeek.id, { 
        isCompleted: true,
        endDate: new Date().toISOString()
      });
    }
  }, [supabaseData.weeklyData]);

  // Mock functions for compatibility
  const deleteAllData = () => {
    console.log('Delete all data functionality not implemented with Supabase');
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
    
    // Legacy compatibility properties
    weeks: supabaseData.weeklyData,
    activeAccount: null,
    accounts: [],
    addAccount: () => {},
    switchAccount: () => {},
    updateAccountData: () => {},
    setWeeklyData: () => {},
    
    // Computed data
    calculatePlayerStats,
    
    // Settings
    settings,
    setSettings,
    
    // Mock data for Settings page compatibility
    players: [],
    squads: [],
    deleteAllData,
  };
};