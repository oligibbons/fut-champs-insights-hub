import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useTheme } from '@/hooks/useTheme';
import { UserSettings } from '@/types/futChampions';
import { FORMATIONS } from '@/types/squads';
import Navigation from '@/components/Navigation';
import { Settings as SettingsIcon, Palette, Trash2, RefreshCw, Download, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { currentTheme, themes, applyTheme } = useTheme();
  const { toast } = useToast();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
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
    setSettings({ ...settings, ...newSettings });
  };

  const updateDashboardSettings = (key: string, value: boolean) => {
    setSettings({
      ...settings,
      dashboardSettings: {
        ...settings.dashboardSettings,
        [key]: value
      }
    });
  };

  const handleDataReset = () => {
    if (showResetConfirm) {
      // Clear all local storage data except settings
      const keysToRemove = [
        'futChampions_weeks',
        'fc25-squads-',
        'fc25-players-',
        'futChampions_achievements'
      ];
      
      keysToRemove.forEach(key => {
        if (key.endsWith('-')) {
          // Handle keys with dynamic suffixes
          Object.keys(localStorage).forEach(storageKey => {
            if (storageKey.startsWith(key)) {
              localStorage.removeItem(storageKey);
            }
          });
        } else {
          localStorage.removeItem(key);
        }
      });
      
      toast({
        title: "Data Reset Complete",
        description: "All performance data has been cleared. Settings preserved.",
      });
      
      setShowResetConfirm(false);
    } else {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 5000);
    }
  };

  const exportData = () => {
    const data = {
      settings,
      weeklyData: JSON.parse(localStorage.getItem('futChampions_weeks') || '[]'),
      squads: Object.keys(localStorage)
        .filter(key => key.startsWith('fc25-squads-'))
        .reduce((acc, key) => ({ ...acc, [key]: JSON.parse(localStorage.getItem(key) || '[]') }), {}),
      players: Object.keys(localStorage)
        .filter(key => key.startsWith('fc25-players-'))
        .reduce((acc, key) => ({ ...acc, [key]: JSON.parse(localStorage.getItem(key) || '[]') }), {}),
      achievements: JSON.parse(localStorage.getItem('futChampions_achievements') || '[]')
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `futalyst-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data Exported",
      description: "Your FUTALYST data has been downloaded as a JSON file.",
    });
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="lg:ml-64 p-4 lg:p-6 transition-all duration-500">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-2xl" style={{ backgroundColor: `${currentTheme.colors.primary}20` }}>
              <SettingsIcon className="h-8 w-8" style={{ color: currentTheme.colors.primary }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">FUTALYST Settings</h1>
              <p className="text-gray-400 mt-1">Customize your analytics experience</p>
            </div>
          </div>

          {/* Theme Settings */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
                <Palette className="h-5 w-5" />
                Theme & Appearance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {themes.map((theme) => (
                  <div
                    key={theme.id}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                      currentTheme.id === theme.id 
                        ? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/30' 
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                    onClick={() => applyTheme(theme.id)}
                    style={{ backgroundColor: currentTheme.colors.surface }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-white">{theme.name}</h3>
                      {currentTheme.id === theme.id && (
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mb-3">{theme.description}</p>
                    <div className="flex gap-2">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.colors.secondary }} />
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.colors.accent }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Dashboard Customization */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle style={{ color: currentTheme.colors.text }}>Dashboard Tiles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(settings.dashboardSettings).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 rounded-lg"
                       style={{ backgroundColor: currentTheme.colors.surface }}>
                    <Label htmlFor={key} className="text-white cursor-pointer">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Label>
                    <Switch
                      id={key}
                      checked={value}
                      onCheckedChange={(checked) => updateDashboardSettings(key, checked)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* General Settings */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle style={{ color: currentTheme.colors.text }}>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-white">Preferred Formation</Label>
                  <Select value={settings.preferredFormation} onValueChange={(value) => updateSettings({ preferredFormation: value })}>
                    <SelectTrigger style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {FORMATIONS.map((formation) => (
                        <SelectItem key={formation.name} value={formation.name}>
                          {formation.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Gameplay Style</Label>
                  <Select value={settings.gameplayStyle} onValueChange={(value: 'aggressive' | 'balanced' | 'defensive') => updateSettings({ gameplayStyle: value })}>
                    <SelectTrigger style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border }}>
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

              <div className="flex items-center justify-between p-3 rounded-lg"
                   style={{ backgroundColor: currentTheme.colors.surface }}>
                <div>
                  <Label className="text-white">Enable Notifications</Label>
                  <p className="text-sm text-gray-400">Get achievement and milestone notifications</p>
                </div>
                <Switch
                  checked={settings.notifications}
                  onCheckedChange={(checked) => updateSettings({ notifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg"
                   style={{ backgroundColor: currentTheme.colors.surface }}>
                <div>
                  <Label className="text-white">Show Animations</Label>
                  <p className="text-sm text-gray-400">Enable celebratory animations and effects</p>
                </div>
                <Switch
                  checked={settings.analyticsPreferences.showAnimations}
                  onCheckedChange={(checked) => updateSettings({ 
                    analyticsPreferences: { 
                      ...settings.analyticsPreferences, 
                      showAnimations: checked 
                    } 
                  })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle style={{ color: currentTheme.colors.text }}>Data Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={exportData}
                  variant="outline"
                  className="w-full modern-button-secondary"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>

                <Button
                  variant="outline"
                  className="w-full modern-button-secondary"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import Data
                </Button>

                <Button
                  onClick={handleDataReset}
                  variant="destructive"
                  className={`w-full ${showResetConfirm ? 'bg-red-600 hover:bg-red-700 animate-pulse' : ''}`}
                >
                  {showResetConfirm ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Confirm Reset
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Reset All Data
                    </>
                  )}
                </Button>
              </div>

              {showResetConfirm && (
                <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/50">
                  <p className="text-red-300 text-sm">
                    ⚠️ Warning: This will permanently delete all your game data, squads, and statistics. 
                    Settings will be preserved. Click again to confirm.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Settings;
