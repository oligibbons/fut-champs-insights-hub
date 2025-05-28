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
import { Settings as SettingsIcon, Palette, Bell, BarChart3, Shield, Zap, Monitor, Moon, Sun } from 'lucide-react';
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
    theme: 'futvisionary',
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

  const getThemeIcon = (themeId: string) => {
    switch (themeId) {
      case 'light': return <Sun className="h-4 w-4" />;
      case 'midnight': case 'futvisionary': case 'neon': return <Moon className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="lg:ml-64 p-4 lg:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-2xl" style={{ backgroundColor: `${currentTheme.colors.primary}20` }}>
              <SettingsIcon className="h-8 w-8" style={{ color: currentTheme.colors.primary }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">FUT Visionary Settings</h1>
              <p className="text-gray-400 mt-1">Customize your AI-powered FUT experience</p>
            </div>
          </div>

          {/* Theme Settings */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
                <Palette className="h-5 w-5" style={{ color: currentTheme.colors.accent }} />
                Visual Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-lg font-medium mb-4 block" style={{ color: currentTheme.colors.text }}>Choose Your Theme</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {themes.map(theme => (
                    <Button
                      key={theme.id}
                      variant={currentTheme.id === theme.id ? "default" : "outline"}
                      onClick={() => handleThemeChange(theme.id)}
                      className="p-4 h-auto flex-col items-start space-y-3 relative overflow-hidden"
                      style={{
                        backgroundColor: currentTheme.id === theme.id 
                          ? `${theme.colors.primary}20` 
                          : currentTheme.colors.surface,
                        borderColor: currentTheme.id === theme.id 
                          ? theme.colors.primary 
                          : currentTheme.colors.border,
                        color: currentTheme.colors.text
                      }}
                    >
                      <div className="flex items-center gap-3 w-full">
                        {getThemeIcon(theme.id)}
                        <div 
                          className="w-6 h-6 rounded-full border-2 border-white/20"
                          style={{ background: theme.colors.primary }}
                        />
                        <span className="font-semibold">{theme.name}</span>
                        {currentTheme.id === theme.id && (
                          <Badge className="ml-auto bg-fifa-green text-white">Active</Badge>
                        )}
                      </div>
                      <p className="text-sm opacity-75 text-left w-full">{theme.description}</p>
                      
                      {/* Theme Preview */}
                      <div className="flex gap-2 w-full">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: theme.colors.primary }}
                        />
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: theme.colors.secondary }}
                        />
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: theme.colors.accent }}
                        />
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* General Settings */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
                <SettingsIcon className="h-5 w-5" style={{ color: currentTheme.colors.primary }} />
                General Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="formation" style={{ color: currentTheme.colors.text }}>Preferred Formation</Label>
                  <Select 
                    value={settings.preferredFormation} 
                    onValueChange={(value) => updateSettings({ preferredFormation: value })}
                  >
                    <SelectTrigger style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}>
                      <SelectItem value="4-3-3">4-3-3</SelectItem>
                      <SelectItem value="4-2-3-1">4-2-3-1</SelectItem>
                      <SelectItem value="4-4-2">4-4-2</SelectItem>
                      <SelectItem value="3-5-2">3-5-2</SelectItem>
                      <SelectItem value="5-3-2">5-3-2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="gameplayStyle" style={{ color: currentTheme.colors.text }}>Gameplay Style</Label>
                  <Select 
                    value={settings.gameplayStyle} 
                    onValueChange={(value: 'aggressive' | 'balanced' | 'defensive') => updateSettings({ gameplayStyle: value })}
                  >
                    <SelectTrigger style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="defensive">Defensive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: currentTheme.colors.surface }}>
                <div>
                  <Label style={{ color: currentTheme.colors.text, fontWeight: 600 }}>AI Notifications</Label>
                  <p className="text-sm" style={{ color: currentTheme.colors.muted }}>Get notified about achievements and AI insights</p>
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
              <CardTitle className="flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
                <BarChart3 className="h-5 w-5" style={{ color: currentTheme.colors.secondary }} />
                Dashboard Tiles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(settings.dashboardSettings).map(([key, enabled]) => (
                  <div key={key} className="flex items-center justify-between p-3 rounded-lg" 
                       style={{ backgroundColor: currentTheme.colors.surface }}>
                    <Label style={{ color: currentTheme.colors.text }} className="capitalize">
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
              <CardTitle className="flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
                <Zap className="h-5 w-5" style={{ color: currentTheme.colors.accent }} />
                AI Analytics & Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(settings.analyticsPreferences).map(([key, enabled]) => (
                <div key={key} className="flex items-center justify-between p-4 rounded-lg" 
                     style={{ backgroundColor: currentTheme.colors.surface }}>
                  <div>
                    <Label style={{ color: currentTheme.colors.text }} className="capitalize font-medium">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Label>
                    <p className="text-sm" style={{ color: currentTheme.colors.muted }}>
                      {key === 'showAnimations' && 'Show celebratory animations and visual effects'}
                      {key === 'dynamicFeedback' && 'Get real-time AI feedback during data input'}
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
              <CardTitle className="flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
                <Shield className="h-5 w-5" style={{ color: currentTheme.colors.secondary }} />
                Qualifier Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="totalGames" style={{ color: currentTheme.colors.text }}>Total Qualifier Games</Label>
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
                    style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}
                  />
                </div>

                <div>
                  <Label htmlFor="winsRequired" style={{ color: currentTheme.colors.text }}>Wins Required</Label>
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
                    style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}
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
