// src/components/UserNotificationSettings.tsx
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useUserSettings } from '@/hooks/useUserSettings';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

// Helper to format the toggle labels nicely
const formatToggleLabel = (key: string) => {
  switch (key) {
    case 'inAppFriendRequest':
      return 'Friend Requests (In-App)';
    case 'inAppAchievementUnlock':
      return 'Achievement Unlocks (In-App)';
    case 'emailFriendRequest':
      return 'Friend Requests (Email)';
    case 'emailWeeklySummary':
      return 'Weekly Summary (Email)';
    default:
      return key;
  }
};

const UserNotificationSettings = () => {
  const { settings, saveSettings, loading: settingsLoading } = useUserSettings();

  // Handler for notification toggles
  const handleNotificationSettingChange = (key: keyof typeof settings.notifications, value: boolean) => {
    saveSettings({
      notifications: {
        ...settings.notifications,
        [key]: value,
      }
    });
  };

  const renderToggles = (keys: (keyof typeof settings.notifications)[]) => {
    return keys.map((key) => (
      <div key={key} className="flex items-center justify-between space-x-2">
        <Label htmlFor={key} className="flex-1 cursor-pointer">
          {formatToggleLabel(key)}
        </Label>
        <Switch
          id={key}
          checked={settings.notifications[key]}
          onCheckedChange={(checked) => handleNotificationSettingChange(key, checked)}
        />
      </div>
    ));
  };

  return (
    <Card className="glass-card-content">
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Choose how you want to be notified.</CardDescription>
      </CardHeader>
      <CardContent>
        {settingsLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">In-App Notifications</h3>
              <div className="space-y-3">
                {renderToggles(['inAppFriendRequest', 'inAppAchievementUnlock'])}
              </div>
            </div>
            
            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-3">Email Notifications</h3>
              <div className="space-y-3">
                {renderToggles(['emailFriendRequest', 'emailWeeklySummary'])}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserNotificationSettings;