// src/components/UserNotificationSettings.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner'; // **Import toast**
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Define the shape of notification settings
interface NotificationSettings {
  email_achievements: boolean;
  email_friend_requests: boolean;
  email_system_updates: boolean;
  push_achievements: boolean;
  push_friend_requests: boolean;
  push_system_updates: boolean;
}

const defaultSettings: NotificationSettings = {
  email_achievements: false,
  email_friend_requests: true,
  email_system_updates: true,
  push_achievements: true,
  push_friend_requests: true,
  push_system_updates: true,
};

const UserNotificationSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('value')
          .eq('user_id', user.id)
          .eq('key', 'notification_settings')
          .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
          setSettings({ ...defaultSettings, ...(data[0].value as NotificationSettings) });
        } else {
          setSettings(defaultSettings);
        }
      } catch (error: any) {
        // **Show error toast**
        toast.error('Error', {
          description: `Failed to load notification settings: ${error.message}`,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user]);

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSaveSettings = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      // Upsert the setting
      const { error } = await supabase.from('user_settings').upsert(
        {
          user_id: user.id,
          key: 'notification_settings',
          value: settings,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id, key' }
      );

      if (error) throw error;

      // **Show success toast**
      toast.success('Settings Saved', {
        description: 'Your notification preferences have been updated.',
      });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      // **Show error toast**
      toast.error('Error Saving Settings', {
        description: `Failed to save settings: ${error.message}`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderSettings = (type: 'push' | 'email') => (
    <div className="space-y-4">
      <h4 className="font-semibold text-white">
        {type === 'push' ? 'Push Notifications' : 'Email Notifications'}
      </h4>
      {loading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between space-x-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-6 w-10 rounded-full" />
          </div>
        ))
      ) : (
        <>
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor={`${type}_achievements`} className="text-muted-foreground">
              New Achievements
            </Label>
            <Switch
              id={`${type}_achievements`}
              checked={settings[`${type}_achievements`]}
              onCheckedChange={() => handleToggle(`${type}_achievements`)}
            />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor={`${type}_friend_requests`} className="text-muted-foreground">
              Friend Requests
            </Label>
            <Switch
              id={`${type}_friend_requests`}
              checked={settings[`${type}_friend_requests`]}
              onCheckedChange={() => handleToggle(`${type}_friend_requests`)}
            />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor={`${type}_system_updates`} className="text-muted-foreground">
              System Updates
            </Label>
            <Switch
              id={`${type}_system_updates`}
              checked={settings[`${type}_system_updates`]}
              onCheckedChange={() => handleToggle(`${type}_system_updates`)}
            />
          </div>
        </>
      )}
    </div>
  );

  return (
    <Card className="glass-card-content"> {/* **UI FIX: Use glass-card-content** */}
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Choose how you want to be notified about activity.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {renderSettings('push')}
        {renderSettings('email')}
        <div className="flex justify-end pt-4">
          <Button onClick={handleSaveSettings} disabled={isSaving || loading}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserNotificationSettings;