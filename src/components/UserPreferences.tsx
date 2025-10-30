// src/components/UserPreferences.tsx
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGameVersion } from '@/contexts/GameVersionContext';
import { toast } from 'sonner';
import AccountSelector from '@/components/AccountSelector';
import { useUserSettings } from '@/hooks/useUserSettings'; // **NEW: Import settings hook**
import { Switch } from '@/components/ui/switch'; // **NEW: Import Switch**
import { Skeleton } from '@/components/ui/skeleton'; // **NEW: Import Skeleton**

// Helper to format the toggle labels nicely
const formatToggleLabel = (key: string) => {
  return key
    .replace('show', '')
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, str => str.toUpperCase()) // Capitalise first letter
    .trim();
};

const UserPreferences = () => {
  const { gameVersion, setGameVersion } = useGameVersion();
  // **NEW: Get settings from our hook**
  const { settings, saveSettings, loading: settingsLoading } = useUserSettings();

  const handleGameVersionChange = (value: string) => {
    setGameVersion(value);
    toast.success("Game Version Updated", {
      description: `Now viewing data for ${value}.`,
    });
  };

  // **NEW: Handler for dashboard toggles**
  const handleDashboardSettingChange = (key: keyof typeof settings.dashboard, value: boolean) => {
    saveSettings({
      dashboard: {
        ...settings.dashboard,
        [key]: value,
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Game Version Card */}
      <Card className="glass-card-content">
        <CardHeader>
          <CardTitle>App Preferences</CardTitle>
          <CardDescription>Global preferences for how you use the app.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="game-version">Select Active Game Version</Label>
            <Select value={gameVersion} onValueChange={handleGameVersionChange}>
              <SelectTrigger id="game-version" className="w-full md:w-[240px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FC26">FC26</SelectItem>
                <SelectItem value="FC25">FC25</SelectItem>
                {/* Add other versions as needed */}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Active Gaming Account Card */}
      <Card className="glass-card-content">
        <CardHeader>
          <CardTitle>Gaming Accounts</CardTitle>
          <CardDescription>Manage your linked gaming accounts and set your active one.</CardDescription>
        </CardHeader>
        <CardContent>
          <AccountSelector />
        </CardContent>
      </Card>

      {/* **NEW: Dashboard Customisation Card** */}
      <Card className="glass-card-content">
        <CardHeader>
          <CardTitle>Dashboard Customisation</CardTitle>
          <CardDescription>Choose which widgets are visible on your main dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          {settingsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(9)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(settings.dashboard).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between space-x-2 p-3 bg-muted/30 rounded-lg">
                  <Label htmlFor={key} className="flex-1 cursor-pointer">
                    {formatToggleLabel(key)}
                  </Label>
                  <Switch
                    id={key}
                    checked={value}
                    onCheckedChange={(checked) => handleDashboardSettingChange(key as keyof typeof settings.dashboard, checked)}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserPreferences;