import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/use-toast';
import { useGameVersion } from '@/contexts/GameVersionContext';
import { useDataSync } from '@/hooks/useDataSync';
import AccountSelector from '@/components/AccountSelector';
import UserAccountSettings from '@/components/UserAccountSettings';
import DataManagement from '@/components/DataManagement';
import { Settings as SettingsIcon, Palette, Gamepad2, User, BarChart3, Target, Database, Trophy, Sparkles } from 'lucide-react';

interface DashboardSettings {
  showTopPerformers: boolean; showXGAnalysis: boolean; showAIInsights: boolean; showFormAnalysis: boolean;
  showWeaknesses: boolean; showOpponentAnalysis: boolean; showPositionalAnalysis: boolean; showRecentTrends: boolean;
  showAchievements: boolean; showTargetProgress: boolean; showTimeAnalysis: boolean; showStressAnalysis: boolean;
  showMatchFacts: boolean; showWeeklyScores: boolean; showRecentForm: boolean;
}

interface CurrentWeekSettings {
  showTopPerformers: boolean; showXGAnalysis: boolean; showAIInsights: boolean; showFormAnalysis: boolean;
  showWeaknesses: boolean; showOpponentAnalysis: boolean; showPositionalAnalysis: boolean; showRecentTrends: boolean;
  showAchievements: boolean; showTargetProgress: boolean; showTimeAnalysis: boolean; showStressAnalysis: boolean;
  showCurrentRunStats: boolean;
}

const Settings = () => {
  const { currentThemeName, setTheme, themeData } = useTheme();
  const { toast } = useToast();
  const { gameVersion, setGameVersion } = useGameVersion();
  const { settings, setSettings } = useDataSync();

  const [dashboardSettings, setDashboardSettings] = useState<DashboardSettings>(
    (settings.dashboardSettings as DashboardSettings) || {} as DashboardSettings
  );

  const [currentWeekSettings, setCurrentWeekSettings] = useState<CurrentWeekSettings>(
    (settings.currentWeekSettings as CurrentWeekSettings) || {} as CurrentWeekSettings
  );

  useEffect(() => {
    setDashboardSettings((settings.dashboardSettings as DashboardSettings) || {} as DashboardSettings);
    setCurrentWeekSettings((settings.currentWeekSettings as CurrentWeekSettings) || {} as CurrentWeekSettings);
  }, [settings]);

  const handleGameVersionChange = (value: string) => {
    setGameVersion(value);
    toast({
      title: "Game Version Updated",
      description: `Now viewing data for ${value}.`,
    });
  };

  const saveDashboardSettings = (newSettings: DashboardSettings) => {
    setDashboardSettings(newSettings);
    setSettings({ ...settings, dashboardSettings: newSettings });
    toast({
      title: "Dashboard Settings Saved",
      description: "Your dashboard preferences have been updated.",
    });
  };

  const saveCurrentWeekSettings = (newSettings: CurrentWeekSettings) => {
    setCurrentWeekSettings(newSettings);
    setSettings({ ...settings, currentWeekSettings: newSettings });
    toast({
      title: "Current Week Settings Saved",
      description: "Your preferences for the Current Week page have been updated.",
    });
  };
  
  const resetSettings = () => {
    const defaultDashboard: DashboardSettings = {
      showTopPerformers: true, showXGAnalysis: true, showAIInsights: true, showFormAnalysis: true,
      showWeaknesses: true, showOpponentAnalysis: true, showPositionalAnalysis: true, showRecentTrends: true,
      showAchievements: true, showTargetProgress: true, showTimeAnalysis: true, showStressAnalysis: true,
      showMatchFacts: true, showWeeklyScores: true, showRecentForm: true
    };
    const defaultCurrentWeek: CurrentWeekSettings = {
      showTopPerformers: true, showXGAnalysis: true, showAIInsights: true, showFormAnalysis: true,
      showWeaknesses: true, showOpponentAnalysis: true, showPositionalAnalysis: true, showRecentTrends: true,
      showAchievements: true, showTargetProgress: true, showTimeAnalysis: true, showStressAnalysis: true,
      showCurrentRunStats: true
    };
    setDashboardSettings(defaultDashboard);
    setCurrentWeekSettings(defaultCurrentWeek);
    setSettings({ ...settings, dashboardSettings: defaultDashboard, currentWeekSettings: defaultCurrentWeek });
    toast({
      title: "Settings Reset",
      description: "All display settings have been reset to their default values.",
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <SettingsIcon className="h-8 w-8 text-primary" />
            Settings
          </h1>
          <p className="text-muted-foreground">Customize your FUTTrackr experience.</p>
        </div>
      </div>

      <Tabs defaultValue="account" className="w-full">
        {/* MODIFICATION: Wrapped TabsList in a div that allows horizontal scrolling on mobile. */}
        <div className="w-full overflow-x-auto pb-2">
          <TabsList className="grid w-full grid-cols-[repeat(7,max-content)] sm:w-full sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
            <TabsTrigger value="account"><User className="h-4 w-4 mr-2" />Account</TabsTrigger>
            <TabsTrigger value="game"><Trophy className="h-4 w-4 mr-2" />Game</TabsTrigger>
            <TabsTrigger value="gaming-accounts"><Gamepad2 className="h-4 w-4 mr-2" />Gaming</TabsTrigger>
            <TabsTrigger value="appearance"><Palette className="h-4 w-4 mr-2" />Appearance</TabsTrigger>
            <TabsTrigger value="dashboard"><BarChart3 className="h-4 w-4 mr-2" />Dashboard</TabsTrigger>
            <TabsTrigger value="targets"><Target className="h-4 w-4 mr-2" />Current Week</TabsTrigger>
            <TabsTrigger value="data"><Database className="h-4 w-4 mr-2" />Data</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="account" className="mt-6">
          <UserAccountSettings />
        </TabsContent>

        <TabsContent value="game" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Game Version</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="game-version">Select Active Game Version</Label>
                <Select value={gameVersion} onValueChange={handleGameVersionChange}>
                  <SelectTrigger id="game-version" className="w-full md:w-[240px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FC26">FC26</SelectItem>
                    <SelectItem value="FC25">FC25</SelectItem>
                    <SelectItem value="FC24">FC24</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">This filters all data across the app to the selected game version.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="gaming-accounts" className="mt-6">
          <AccountSelector />
        </TabsContent>

        <TabsContent value="appearance" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Theme & Appearance</CardTitle></CardHeader>
            <CardContent>
               <div className="space-y-2">
                 <Label htmlFor="theme-selector">Theme</Label>
                 <Select value={currentThemeName} onValueChange={(value) => setTheme(value as keyof typeof themeData)}>
                   <SelectTrigger id="theme-selector" className="w-full md:w-[240px]">
                     <SelectValue placeholder="Select a theme" />
                   </SelectTrigger>
                   <SelectContent>
                     {Object.keys(themeData).map((themeName) => (
                       <SelectItem key={themeName} value={themeName}>
                         {themeData[themeName]?.name || themeName}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
                 <p className="text-sm text-muted-foreground">Choose how FUTTrackr looks to you.</p>
               </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="dashboard" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Dashboard Display Settings</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(dashboardSettings).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <Label htmlFor={key} className="flex-1 cursor-pointer">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Label>
                    <Switch
                      id={key}
                      checked={value}
                      onCheckedChange={(checked) => saveDashboardSettings({ ...dashboardSettings, [key]: checked })}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="targets" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Current Week Display Settings</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(currentWeekSettings).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <Label htmlFor={`cw-${key}`} className="flex-1 cursor-pointer">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Label>
                    <Switch
                      id={`cw-${key}`}
                      checked={value}
                      onCheckedChange={(checked) => saveCurrentWeekSettings({ ...currentWeekSettings, [key]: checked })}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="mt-6">
          <DataManagement />
        </TabsContent>
        
      </Tabs>
      
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Reset Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Reset all dashboard and current week display settings to their default values. This action cannot be undone.
          </p>
          <Button variant="destructive" onClick={resetSettings}>Reset All Display Settings</Button>
        </CardContent>
      </Card>

    </div>
  );
};

export default Settings;
