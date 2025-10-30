// src/hooks/useUserSettings.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Define the structure of your settings
export interface AppSettings {
  theme: string; // Keep as string to support all your theme names
  default_game_version: 'FC25' | 'FC26';
  dashboard: {
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
  };
  notifications: {
    inAppFriendRequest: boolean;
    inAppAchievementUnlock: boolean;
    emailFriendRequest: boolean;
    emailWeeklySummary: boolean;
  };
}

// Define the default settings
const defaultSettings: AppSettings = {
  theme: 'dark_blue_saturated', // Or your default theme name
  default_game_version: 'FC26',
  dashboard: {
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
    showRecentForm: true
  },
  notifications: {
    inAppFriendRequest: true,
    inAppAchievementUnlock: true,
    emailFriendRequest: true,
    emailWeeklySummary: false,
  }
};

// Helper to deep merge defaults with fetched settings
const mergeSettings = (fetched: any): AppSettings => {
  return {
    ...defaultSettings,
    ...fetched,
    dashboard: {
      ...defaultSettings.dashboard,
      ...(fetched.dashboard || {}),
    },
    notifications: {
      ...defaultSettings.notifications,
      ...(fetched.notifications || {}),
    },
  };
};

// This hook manages loading and saving settings from the 'user_settings' table
export const useUserSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  // Fetches settings from the 'user_settings' table
  const fetchSettings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('value')
        .eq('user_id', user.id)
        .eq('key', 'app_settings') // We'll store all app settings in one JSON object
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = 'No rows found'
        throw error;
      }

      if (data) {
        // Merge fetched settings with defaults to ensure all keys are present
        setSettings(mergeSettings(data.value));
      } else {
        // No settings found, use defaults
        setSettings(defaultSettings);
      }
    } catch (error: any) {
      console.error('Error fetching settings:', error.message);
      setSettings(defaultSettings); // Fallback to defaults on error
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load settings on hook initialization
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Saves a new settings object to the 'user_settings' table
  const saveSettings = async (newSettings: Partial<AppSettings>) => {
    if (!user) return;

    const updatedSettings = { ...settings, ...newSettings };
    
    // Ensure nested objects are merged correctly
    if (newSettings.dashboard) {
        updatedSettings.dashboard = { ...settings.dashboard, ...newSettings.dashboard };
    }
    if (newSettings.notifications) {
        updatedSettings.notifications = { ...settings.notifications, ...newSettings.notifications };
    }

    setSettings(updatedSettings); // Optimistic update

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          key: 'app_settings',
          value: updatedSettings,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id, key'
        });

      if (error) throw error;
      toast.success('Settings saved');
    } catch (error: any) {
      toast.error('Failed to save settings', { description: error.message });
      // Revert optimistic update on error
      fetchSettings();
    }
  };
  
  // Helper function to save just one key
  const saveSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      saveSettings({ [key]: value });
  };

  return { settings, loading, saveSettings, saveSetting };
};