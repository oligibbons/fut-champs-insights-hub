
import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { UserSettings } from '@/types/futChampions';
import { useTheme } from '@/hooks/useTheme';
import { Settings as SettingsIcon, Save, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FORMATIONS } from '@/types/squads';

const Settings = () => {
  const { currentTheme } = useTheme();
  const { toast } = useToast();
  const [settings, setSettings] = useLocalStorage<UserSettings>('futChampions_settings', {
    preferredFormation: '4-3-3',
    trackingStartDate: new Date().toISOString().split('T')[0],
    gameplayStyle: 'balanced',
    notifications: true,
    gamesPerWeek: 15,
    theme: 'futvisionary',
    carouselSpeed: 12,
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

  const handleSave = () => {
    setSettings({ ...settings });
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  const handleReset = () => {
    const defaultSettings: UserSettings = {
      preferredFormation: '4-3-3',
      trackingStartDate: new Date().toISOString().split('T')[0],
      gameplayStyle: 'balanced',
      notifications: true,
      gamesPerWeek: 15,
      theme: 'futvisionary',
      carouselSpeed: 12,
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
    };
    setSettings(defaultSettings);
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to default values.",
    });
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="lg:ml-20 lg:hover:ml-64 transition-all duration-500 p-4 lg:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-2xl" style={{ backgroundColor: `${currentTheme.colors.primary}20` }}>
              <SettingsIcon className="h-8 w-8" style={{ color: currentTheme.colors.primary }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white page-header">Settings</h1>
              <p className="text-gray-400 mt-1">Customize your FUT Champions experience</p>
            </div>
          </div>

          {/* General Settings */}
          <Card className="glass-card static-element">
            <CardHeader>
              <CardTitle className="text-white">General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="preferredFormation" className="text-gray-300">Preferred Formation</Label>
                  <select
                    id="preferredFormation"
                    value={settings.preferredFormation}
                    onChange={(e) => setSettings({ ...settings, preferredFormation: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                  >
                    {Object.keys(FORMATIONS).map(formation => (
                      <option key={formation} value={formation}>{formation}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gamesPerWeek" className="text-gray-300">Games Per Week</Label>
                  <Input
                    id="gamesPerWeek"
                    type="number"
                    min="1"
                    max="30"
                    value={settings.gamesPerWeek}
                    onChange={(e) => setSettings({ ...settings, gamesPerWeek: parseInt(e.target.value) || 15 })}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gameplayStyle" className="text-gray-300">Gameplay Style</Label>
                  <select
                    id="gameplayStyle"
                    value={settings.gameplayStyle}
                    onChange={(e) => setSettings({ ...settings, gameplayStyle: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                  >
                    <option value="attacking">Attacking</option>
                    <option value="balanced">Balanced</option>
                    <option value="defensive">Defensive</option>
                    <option value="possession">Possession</option>
                    <option value="counter">Counter-Attack</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="carouselSpeed" className="text-gray-300">Dashboard Carousel Speed (seconds)</Label>
                  <Input
                    id="carouselSpeed"
                    type="number"
                    min="3"
                    max="30"
                    value={settings.carouselSpeed || 12}
                    onChange={(e) => setSettings({ ...settings, carouselSpeed: parseInt(e.target.value) || 12 })}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                  <p className="text-xs text-gray-500">How long each slide shows before auto-advancing</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications" className="text-gray-300">Enable Notifications</Label>
                  <p className="text-sm text-gray-500">Get notified about achievements and milestones</p>
                </div>
                <Switch
                  id="notifications"
                  checked={settings.notifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, notifications: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Dashboard Display Settings */}
          <Card className="glass-card static-element">
            <CardHeader>
              <CardTitle className="text-white">Dashboard Display</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(settings.dashboardSettings).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label htmlFor={key} className="text-gray-300 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Label>
                    <Switch
                      id={key}
                      checked={value}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        dashboardSettings: { ...settings.dashboardSettings, [key]: checked }
                      })}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Analytics Preferences */}
          <Card className="glass-card static-element">
            <CardHeader>
              <CardTitle className="text-white">Analytics Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(settings.analyticsPreferences).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label htmlFor={key} className="text-gray-300 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Label>
                    <Switch
                      id={key}
                      checked={value}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        analyticsPreferences: { ...settings.analyticsPreferences, [key]: checked }
                      })}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button onClick={handleSave} className="modern-button-primary">
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
            <Button onClick={handleReset} variant="outline" className="modern-button-secondary">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset to Default
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
