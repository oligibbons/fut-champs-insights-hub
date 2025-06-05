import { useState } from 'react';
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
import { Settings as SettingsIcon, Palette, Gamepad2, User, BarChart3, Target } from 'lucide-react';

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

  const [dashboardSettings, setDashboardSettings] = useState<DashboardSettings>({
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
  });

  const [currentWeekSettings, setCurrentWeekSettings] = useState<CurrentWeekSettings>({
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
  });

  const saveDashboardSettings = (newSettings: DashboardSettings) => {
    setDashboardSettings(newSettings);
    localStorage.setItem('dashboard-settings', JSON.stringify(newSettings));
    toast({
      title: "Dashboard Settings Updated",
      description: "Your dashboard preferences have been saved.",
    });
  };

  const saveCurrentWeekSettings = (newSettings: CurrentWeekSettings) => {
    setCurrentWeekSettings(newSettings);
    localStorage.setItem('current-week-settings', JSON.stringify(newSettings));
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
    saveDashboardSettings(defaultDashboard);
    saveCurrentWeekSettings(defaultCurrentWeek);
  };

  const handleThemeChange = (themeName: string) => {
    setTheme(themeName);
    toast({
      title: "Theme Updated",
      description: `Switched to ${themeData[themeName]?.name || themeName} theme.`,
    });
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="lg:ml-20 lg:hover:ml-64 transition-all duration-500 p-4 lg:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-2xl" style={{ backgroundColor: `${currentTheme.colors.fifa.purple}20` }}>
              <SettingsIcon className="h-8 w-8" style={{ color: currentTheme.colors.fifa.purple }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: currentTheme.colors.text }}>Settings</h1>
              <p className="text-gray-400 mt-1">Customize your FUTALYST experience</p>
            </div>
          </div>

          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid w-full grid-cols-5 glass-card">
              <TabsTrigger value="account">
                <User className="h-4 w-4 mr-2" />
                Account
              </TabsTrigger>
              <TabsTrigger value="fc25-accounts">
                <Gamepad2 className="h-4 w-4 mr-2" />
                FC25 Accounts
              </TabsTrigger>
              <TabsTrigger value="appearance">
                <Palette className="h-4 w-4 mr-2" />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="dashboard">
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="targets">
                <Target className="h-4 w-4 mr-2" />
                Targets
              </TabsTrigger>
            </TabsList>

            <TabsContent value="account" className="space-y-4">
              <UserAccountSettings />
            </TabsContent>

            <TabsContent value="fc25-accounts" className="space-y-4">
              <AccountManager />
            </TabsContent>

            <TabsContent value="appearance" className="space-y-4">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
                    <Palette className="h-5 w-5" style={{ color: currentTheme.colors.fifa.gold }} />
                    Theme Selection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label style={{ color: currentTheme.colors.text }}>Choose Theme</Label>
                    <Select value={currentThemeName} onValueChange={handleThemeChange}>
                      <SelectTrigger className="bg-gray-800 border-gray-600" style={{ color: currentTheme.colors.text }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {themes.map((themeName) => (
                          <SelectItem key={themeName} value={themeName}>
                            {themeData[themeName]?.name || themeName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Theme Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="p-4 rounded-xl border" style={{ 
                      background: currentTheme.colors.cardBg,
                      borderColor: currentTheme.colors.border 
                    }}>
                      <h4 className="font-semibold mb-2" style={{ color: currentTheme.colors.text }}>
                        Preview
                      </h4>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: currentTheme.colors.fifa.blue }}></div>
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: currentTheme.colors.fifa.green }}></div>
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: currentTheme.colors.fifa.gold }}></div>
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: currentTheme.colors.fifa.red }}></div>
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: currentTheme.colors.fifa.purple }}></div>
                        </div>
                        <p className="text-sm" style={{ color: currentTheme.colors.muted }}>
                          Current theme: {themeData[currentThemeName]?.name}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dashboard" className="space-y-4">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
                    <BarChart3 className="h-5 w-5" style={{ color: currentTheme.colors.fifa.blue }} />
                    Dashboard Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(dashboardSettings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <p className="text-white font-medium">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
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
                  <Button onClick={resetSettings} variant="outline">
                    Reset to Defaults
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="targets" className="space-y-4">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
                    <Target className="h-5 w-5" style={{ color: currentTheme.colors.fifa.green }} />
                    Targets Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(currentWeekSettings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <p className="text-white font-medium">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
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
                  <Button onClick={resetSettings} variant="outline">
                    Reset to Defaults
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Settings;
