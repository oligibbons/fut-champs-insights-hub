// src/hooks/useUserSettings.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface UserSetting {
  id: string;
  user_id: string;
  key: string;
  value: any;
}

// Define a type for the settings map
type SettingsMap = Record<string, any>;

export const useUserSettings = () as {
  settings: SettingsMap;
  loading: boolean;
  error: string | null;
  getSetting: (key: string, defaultValue?: any) => any;
  updateSetting: (key: string, value: any) => Promise<void>;
  refetchSettings: () => void;
} => {
  // --- THIS IS THE FIX (Part 1) ---
  const { user, loading: authLoading } = useAuth();
  // --- END OF FIX ---

  const [settings, setSettings] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    // --- THIS IS THE FIX (Part 2) ---
    // Wait for auth to be ready before fetching
    if (!user || authLoading) {
      setSettings({});
      setLoading(false);
      return;
    }
    // --- END OF FIX ---

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('key, value')
        .eq('user_id', user.id);

      if (error) {
        throw new Error(`Fetch Settings Error: ${error.message}`);
      }

      // Convert array of {key, value} to a single object map
      const settingsMap = data.reduce((acc: SettingsMap, setting: { key: string; value: any }) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});

      setSettings(settingsMap);
    } catch (err: any) {
      console.error('Error fetching user settings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  // --- THIS IS THE FIX (Part 3) ---
  }, [user, authLoading]);
  // --- END OF FIX ---

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const getSetting = (key: string, defaultValue: any = null) => {
    return settings[key] ?? defaultValue;
  };

  const updateSetting = async (key: string, value: any) => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }

    try {
      // Optimistic update
      setSettings(prev => ({ ...prev, [key]: value }));

      const { data, error } = await supabase
        .from('user_settings')
        .upsert(
            { user_id: user.id, key, value, updated_at: new Date().toISOString() },
            { onConflict: 'user_id, key' }
        )
        .select('value') // Select the updated value to confirm
        .single();
    
      if (error) {
        throw new Error(`Update Setting Error: ${error.message}`);
      }

      // Re-set with confirmed data from DB
      setSettings(prev => ({ ...prev, [key]: data.value }));
      
    } catch (err: any) {
        console.error("Error updating setting:", err);
        toast({ title: "Error updating setting", description: err.message, variant: "destructive" });
        // Revert on error
        fetchSettings(); // Re-fetch to get the true state
    }
  };

  return {
    settings,
    loading,
    error,
    getSetting,
    updateSetting,
    refetchSettings: fetchSettings,
  };
};

