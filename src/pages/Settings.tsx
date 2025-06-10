import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import AccountManager from '@/components/AccountManager';
import UserAccountSettings from '@/components/UserAccountSettings';
import { Settings as SettingsIcon, Palette, Gamepad2, User, BarChart3, Target, Sparkles } from 'lucide-react';
import { useDataSync } from '@/hooks/useDataSync';

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
  showCurrentRunStats: boolean;
}

const Settings = () => {
  const { currentTheme, currentThemeName, setTheme, themes, themeData } = useTheme();
  const { toast } = useToast();
  const { settings, setSettings } = useDataSync();

  const [dashboardSettings, setDashboardSettings] = useState<DashboardSettings>(
    settings.dashboardSettings as DashboardSettings
  );

  const [currentWeekSettings, setCurrentWeekSettings] = useState<CurrentWeekSettings>(
    settings.currentWeekSettings as CurrentWeekSettings
  );

  // Load settings from dataSync
  useEffect(() => {
    setDashboardSettings(settings.dashboardSettings as DashboardSettings);
    setCurrentWeekSettings(settings.currentWeekSettings as CurrentWeekSettings);
  }, [settings]);

  const saveDashboardSettings = (newSettings: DashboardSettings) => {
    setDashboardSettings(newSettings);
    setSettings({
      ...settings,
      dashboardSettings: newSettings
    });
    toast({
      title: "Dashboard Settings Updated",
      description: "Your dashboard preferences have been saved.",
    });
  };

  const saveCurrentWeekSettings = (newSettings: CurrentWeekSettings) => {
    setCurrentWeekSettings(newSettings);
    setSettings({
      ...settings,
      currentWeekSettings: newSettings
    });
    toast({
      title: "Current Week Settings Updated",
      description: "Your current week preferences have been saved.",
    });
  };

  const resetSettings = () => {
    const defaultDashboard: DashboardSettings = {
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
    };

    const defaultCurrentWeek: CurrentWeekSettings = {
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
      showCurrentRunStats: true
    };

    setDashboardSettings(defaultDashboard);
    setCurrentWeekSettings(defaultCurrentWeek);
    setSettings({
      ...settings,
      dashboardSettings: defaultDashboard,
      currentWeekSettings: defaultCurrentWeek
    });
    
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to their default values.",
    });
  };

  const handleThemeChange = (themeName: string) => {
    setTheme(themeName);
    setSettings({
      ...settings,
      theme: themeName
    });
    toast({
      title: "Theme Updated",
      description: `Switched to ${themeData[themeName]?.name || themeName} theme.`,
    });
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="lg:ml-20 lg:hover:ml-64 transition-all duration-500 p-4 lg:p-6 pb-24">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Enhanced Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-fifa-purple/20 to-fifa-blue/20 border border-fifa-purple/30">
                <SettingsIcon className="h-8 w-8 text-fifa-purple" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-fifa-purple via-fifa-blue to-fifa-gold bg-clip-text text-transparent">
                  Settings
                </h1>
                <p className="text-gray-400 mt-1">Customize your FUTALYST experience</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Tabs defaultValue="account" className="w-full">
              <TabsList className="flex w-full overflow-x-auto glass-card">
                <TabsTrigger value="account" className="flex-shrink-0">
                  <User className="h-4 w-4 mr-2" />
                  <span>Account</span>
                </TabsTrigger>
                <TabsTrigger value="fc25-accounts" className="flex-shrink-0">
                  <Gamepad2 className="h-4 w-4 mr-2" />
                  <span>FC25 Accounts</span>
                </TabsTrigger>
                <TabsTrigger value="appearance" className="flex-shrink-0">
                  <Palette className="h-4 w-4 mr-2" />
                  <span>Appearance</span>
                </TabsTrigger>
                <TabsTrigger value="dashboard" className="flex-shrink-0">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  <span>Dashboard</span>
                </TabsTrigger>
                <TabsTrigger value="targets" className="flex-shrink-0">
                  <Target className="h-4 w-4 mr-2" />
                  <span>Targets</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="account" className="space-y-4 mt-4">
                <UserAccountSettings />
              </TabsContent>

              <TabsContent value="fc25-accounts" className="space-y-4 mt-4">
                <AccountManager />
              </TabsContent>

              <TabsContent value="appearance" className="space-y-4 mt-4">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Palette className="h-5 w-5 text-fifa-gold" />
                      Theme & Appearance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-white font-medium">Choose Theme</Label>
                        <Select value={currentThemeName} onValueChange={handleThemeChange}>
                          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {themes.map((themeName) => (
                              <SelectItem key={themeName} value={themeName}>
                                <div className="flex items-center gap-2">
                                  <Sparkles className="h-4 w-4" />
                                  {themeData[themeName]?.name || themeName}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Enhanced Theme Preview */}
                      <div className="p-6 rounded-xl border bg-gradient-to-br from-white/5 to-white/10" style={{ 
                        borderColor: currentTheme.colors.border 
                      }}>
                        <h4 className="font-semibold mb-4 text-white flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-fifa-gold" />
                          Theme Preview
                        </h4>
                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-3">
                            {Object.entries(currentTheme.colors.fifa).map(([name, color]) => (
                              <div key={name} className="flex items-center gap-2">
                                <div 
                                  className="w-6 h-6 rounded-full border-2 border-white/20" 
                                  style={{ backgroundColor: color }}
                                />
                                <span className="text-sm text-gray-300 capitalize">{name}</span>
                              </div>
                            ))}
                          </div>
                          <div className="p-4 rounded-lg" style={{ backgroundColor: currentTheme.colors.cardBg }}>
                            <p className="text-white font-medium">Sample Card</p>
                            <p className="text-gray-400 text-sm mt-1">
                              Current theme: {themeData[currentThemeName]?.name}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="dashboard" className="space-y-4 mt-4">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <BarChart3 className="h-5 w-5 text-fifa-blue" />
                      Dashboard Display Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {Object.entries(dashboardSettings).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-gray-700/50 hover:bg-white/10 transition-colors">
                          <div>
                            <p className="text-white font-medium">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {value ? 'Visible on dashboard' : 'Hidden from dashboard'}
                            </p>
                          </div>
                          <Switch
                            checked={value}
                            onCheckedChange={(checked) =>
                              saveDashboardSettings({ ...dashboardSettings, [key]: checked })
                            }
                          />
                        </div>
                      ))}
                    </div>
                    <div className="pt-4 border-t border-gray-700">
                      <Button 
                        onClick={resetSettings} 
                        variant="outline"
                        className="w-full sm:w-auto border-gray-600 text-gray-400 hover:text-white hover:border-gray-500"
                      >
                        Reset to Defaults
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="targets" className="space-y-4 mt-4">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Target className="h-5 w-5 text-fifa-green" />
                      Target & Goal Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {Object.entries(currentWeekSettings).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-gray-700/50 hover:bg-white/10 transition-colors">
                          <div>
                            <p className="text-white font-medium">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {value ? 'Enabled in current week view' : 'Disabled in current week view'}
                            </p>
                          </div>
                          <Switch
                            checked={value}
                            onCheckedChange={(checked) =>
                              saveCurrentWeekSettings({ ...currentWeekSettings, [key]: checked })
                            }
                          />
                        </div>
                      ))}
                    </div>
                    <div className="pt-4 border-t border-gray-700">
                      <Button 
                        onClick={resetSettings} 
                        variant="outline"
                        className="w-full sm:w-auto border-gray-600 text-gray-400 hover:text-white hover:border-gray-500"
                      >
                        Reset to Defaults
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;