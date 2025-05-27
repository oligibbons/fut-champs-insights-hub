
import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useTheme, themes } from '@/hooks/useTheme';
import { UserSettings } from '@/types/futChampions';
import { Settings as SettingsIcon, Palette, Bell, BarChart3, Shield, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { toast } = useToast();
  const { currentTheme, applyTheme } = useTheme();
  const [settings, setSettings] = useLocalStorage<UserSettings>('futChampions_settings', {
    preferredFormation: '4-3-3',
    trackingStartDate: new Date().toISOString().split('T')[0],
    gameplayStyle: 'balanced',
    notifications: true,
    gamesPerWeek: 15,
    theme: 'default',
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
    },
    currentWeekSettings: {
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
    qualifierSettings: {
      totalGames: 5,
      winsRequired: 2,
    },
    targetSettings: {
      autoSetTargets: false,
      adaptiveTargets: true,
      notifyOnTarget: true,
    },
    analyticsPreferences: {
      detailedPlayerStats: true,
      opponentTracking: true,
      timeTracking: true,
      stressTracking: true,
      showAnimations: true,
      dynamicFeedback: true,
    }
  });

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    toast({
      title: "Settings Updated",
      description: "Your preferences have been saved successfully.",
    });
  };

  const updateDashboardSettings = (key: keyof typeof settings.dashboardSettings, value: boolean) => {
    updateSettings({
      dashboardSettings: { ...settings.dashboardSettings, [key]: value }
    });
  };

  const updateCurrentWeekSettings = (key: keyof typeof settings.currentWeekSettings, value: boolean) => {
    updateSettings({
      currentWeekSettings: { ...settings.currentWeekSettings, [key]: value }
    });
  };

  const handleThemeChange = (themeId: string) => {
    applyTheme(themeId);
    updateSettings({ theme: themeId });
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="lg:ml-64 p-4 lg:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-fifa-blue/20 rounded-2xl">
              <SettingsIcon className="h-8 w-8 text-fifa-blue" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">Settings</h1>
              <p className="text-gray-400 mt-1">Customize your FUT Champions experience</p>
            </div>
          </div>

          {/* Theme Settings */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Palette className="h-5 w-5 text-fifa-purple" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-300 mb-3 block">Theme</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {themes.map(theme => (
                    <Button
                      key={theme.id}
                      variant={currentTheme.id === theme.id ? "default" : "outline"}
                      onClick={() => handleThemeChange(theme.id)}
                      className="p-4 h-auto flex-col items-start space-y-2 bg-white/5 border-white/20 hover:bg-white/10"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ background: theme.colors.primary }}
                        />
                        <span className="font-medium text-white">{theme.name}</span>
                      </div>
                      <p className="text-xs text-gray-400 text-left">{theme.description}</p>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* General Settings */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <SettingsIcon className="h-5 w-5 text-fifa-blue" />
                General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="formation" className="text-gray-300">Preferred Formation</Label>
                  <Select 
                    value={settings.preferredFormation} 
                    onValueChange={(value) => updateSettings({ preferredFormation: value })}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4-3-3">4-3-3</SelectItem>
                      <SelectItem value="4-2-3-1">4-2-3-1</SelectItem>
                      <SelectItem value="4-4-2">4-4-2</SelectItem>
                      <SelectItem value="3-5-2">3-5-2</SelectItem>
                      <SelectItem value="5-3-2">5-3-2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="gameplayStyle" className="text-gray-300">Gameplay Style</Label>
                  <Select 
                    value={settings.gameplayStyle} 
                    onValueChange={(value: 'aggressive' | 'balanced' | 'defensive') => updateSettings({ gameplayStyle: value })}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="defensive">Defensive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white font-medium">Notifications</Label>
                  <p className="text-sm text-gray-400">Get notified about achievements and targets</p>
                </div>
                <Switch
                  checked={settings.notifications}
                  onCheckedChange={(checked) => updateSettings({ notifications: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Dashboard Customization */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <BarChart3 className="h-5 w-5 text-fifa-green" />
                Dashboard Tiles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(settings.dashboardSettings).map(([key, enabled]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <Label className="text-white capitalize">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Label>
                    <Switch
                      checked={enabled}
                      onCheckedChange={(checked) => updateDashboardSettings(key as any, checked)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Analytics Preferences */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Zap className="h-5 w-5 text-fifa-gold" />
                Analytics & Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(settings.analyticsPreferences).map(([key, enabled]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <Label className="text-white capitalize font-medium">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Label>
                    <p className="text-sm text-gray-400">
                      {key === 'showAnimations' && 'Show celebratory animations and visual effects'}
                      {key === 'dynamicFeedback' && 'Get real-time feedback during data input'}
                      {key === 'detailedPlayerStats' && 'Track comprehensive player performance metrics'}
                      {key === 'opponentTracking' && 'Analyze opponent patterns and tactics'}
                      {key === 'timeTracking' && 'Monitor performance across different times'}
                      {key === 'stressTracking' && 'Track stress levels and their impact on performance'}
                    </p>
                  </div>
                  <Switch
                    checked={enabled}
                    onCheckedChange={(checked) => updateSettings({
                      analyticsPreferences: { ...settings.analyticsPreferences, [key]: checked }
                    })}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Qualifier Settings */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Shield className="h-5 w-5 text-fifa-red" />
                Qualifier Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="totalGames" className="text-gray-300">Total Qualifier Games</Label>
                  <Input
                    id="totalGames"
                    type="number"
                    min="1"
                    max="10"
                    value={settings.qualifierSettings.totalGames}
                    onChange={(e) => updateSettings({
                      qualifierSettings: { 
                        ...settings.qualifierSettings, 
                        totalGames: parseInt(e.target.value) 
                      }
                    })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="winsRequired" className="text-gray-300">Wins Required</Label>
                  <Input
                    id="winsRequired"
                    type="number"
                    min="1"
                    max="10"
                    value={settings.qualifierSettings.winsRequired}
                    onChange={(e) => updateSettings({
                      qualifierSettings: { 
                        ...settings.qualifierSettings, 
                        winsRequired: parseInt(e.target.value) 
                      }
                    })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Settings;
