
import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDataSync } from '@/hooks/useDataSync';
import { UserSettings } from '@/types/futChampions';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { Settings as SettingsIcon, Save, RefreshCw, Trash2, User, Shield, Eye, Gamepad2, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FORMATIONS } from '@/types/squads';

const Settings = () => {
  const { currentTheme } = useTheme();
  const { toast } = useToast();
  const { user } = useAuth();
  const { settings, setSettings, deleteAllData } = useDataSync();

  const handleSave = () => {
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
      defaultCrossPlay: false,
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

  const handleDeleteAllData = () => {
    if (window.confirm('Are you sure you want to delete ALL data? This cannot be undone!')) {
      deleteAllData();
      
      toast({
        title: "All Data Deleted",
        description: "All FUT Champions data has been permanently deleted.",
        variant: "destructive"
      });
    }
  };

  const updateSettings = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  const updateNestedSettings = (section: string, key: string, value: any) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section as keyof UserSettings],
        [key]: value
      }
    });
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="lg:ml-20 lg:hover:ml-64 transition-all duration-500 p-4 lg:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-2xl" style={{ backgroundColor: `${currentTheme.colors.primary}20` }}>
              <SettingsIcon className="h-8 w-8" style={{ color: currentTheme.colors.primary }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-gray-400 mt-1">Customize your FUTALYST experience</p>
            </div>
          </div>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-5 glass-card static-element">
              <TabsTrigger value="general" className="data-[state=active]:bg-fifa-blue/20">
                <Gamepad2 className="h-4 w-4 mr-2" />
                General
              </TabsTrigger>
              <TabsTrigger value="display" className="data-[state=active]:bg-fifa-blue/20">
                <Eye className="h-4 w-4 mr-2" />
                Display
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-fifa-blue/20">
                <Database className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="account" className="data-[state=active]:bg-fifa-blue/20">
                <User className="h-4 w-4 mr-2" />
                Account
              </TabsTrigger>
              <TabsTrigger value="data" className="data-[state=active]:bg-fifa-blue/20">
                <Shield className="h-4 w-4 mr-2" />
                Data
              </TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general" className="space-y-6">
              <Card className="glass-card static-element">
                <CardHeader>
                  <CardTitle className="text-white">Game Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="preferredFormation" className="text-gray-300">Preferred Formation</Label>
                      <Select 
                        value={settings.preferredFormation} 
                        onValueChange={(value) => updateSettings('preferredFormation', value)}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          {FORMATIONS.map(formation => (
                            <SelectItem key={formation.name} value={formation.name} className="text-white">
                              {formation.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gamesPerWeek" className="text-gray-300">Games Per Run</Label>
                      <Input
                        id="gamesPerWeek"
                        type="number"
                        min="1"
                        max="30"
                        value={settings.gamesPerWeek}
                        onChange={(e) => updateSettings('gamesPerWeek', parseInt(e.target.value) || 15)}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gameplayStyle" className="text-gray-300">Gameplay Style</Label>
                      <Select 
                        value={settings.gameplayStyle} 
                        onValueChange={(value: any) => updateSettings('gameplayStyle', value)}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="attacking" className="text-white">Attacking</SelectItem>
                          <SelectItem value="balanced" className="text-white">Balanced</SelectItem>
                          <SelectItem value="defensive" className="text-white">Defensive</SelectItem>
                          <SelectItem value="possession" className="text-white">Possession</SelectItem>
                          <SelectItem value="counter" className="text-white">Counter-Attack</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="carouselSpeed" className="text-gray-300">Dashboard Carousel Speed (seconds)</Label>
                      <Input
                        id="carouselSpeed"
                        type="number"
                        min="3"
                        max="30"
                        value={settings.carouselSpeed || 12}
                        onChange={(e) => updateSettings('carouselSpeed', parseInt(e.target.value) || 12)}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                      <div>
                        <Label htmlFor="notifications" className="text-gray-300">Enable Notifications</Label>
                        <p className="text-sm text-gray-500">Get notified about achievements and milestones</p>
                      </div>
                      <Switch
                        id="notifications"
                        checked={settings.notifications}
                        onCheckedChange={(checked) => updateSettings('notifications', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                      <div>
                        <Label htmlFor="defaultCrossPlay" className="text-gray-300">Default Cross-Play Setting</Label>
                        <p className="text-sm text-gray-500">Default state for cross-play when recording games</p>
                      </div>
                      <Switch
                        id="defaultCrossPlay"
                        checked={settings.defaultCrossPlay || false}
                        onCheckedChange={(checked) => updateSettings('defaultCrossPlay', checked)}
                      />
                    </div>
                  </div>

                  <Button onClick={handleSave} className="modern-button-primary">
                    <Save className="h-4 w-4 mr-2" />
                    Save General Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Display Settings */}
            <TabsContent value="display" className="space-y-6">
              <Card className="glass-card static-element">
                <CardHeader>
                  <CardTitle className="text-white">Dashboard Display</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(settings.dashboardSettings).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                        <Label htmlFor={key} className="text-gray-300 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Label>
                        <Switch
                          id={key}
                          checked={value}
                          onCheckedChange={(checked) => updateNestedSettings('dashboardSettings', key, checked)}
                        />
                      </div>
                    ))}
                  </div>
                  <Button onClick={handleSave} className="modern-button-primary">
                    <Save className="h-4 w-4 mr-2" />
                    Save Display Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Settings */}
            <TabsContent value="analytics" className="space-y-6">
              <Card className="glass-card static-element">
                <CardHeader>
                  <CardTitle className="text-white">Analytics Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(settings.analyticsPreferences).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                        <Label htmlFor={key} className="text-gray-300 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Label>
                        <Switch
                          id={key}
                          checked={value}
                          onCheckedChange={(checked) => updateNestedSettings('analyticsPreferences', key, checked)}
                        />
                      </div>
                    ))}
                  </div>
                  <Button onClick={handleSave} className="modern-button-primary">
                    <Save className="h-4 w-4 mr-2" />
                    Save Analytics Settings
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass-card static-element">
                <CardHeader>
                  <CardTitle className="text-white">Target Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {Object.entries(settings.targetSettings).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                        <Label htmlFor={key} className="text-gray-300 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Label>
                        <Switch
                          id={key}
                          checked={value}
                          onCheckedChange={(checked) => updateNestedSettings('targetSettings', key, checked)}
                        />
                      </div>
                    ))}
                  </div>
                  <Button onClick={handleSave} className="modern-button-primary">
                    <Save className="h-4 w-4 mr-2" />
                    Save Target Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Account Management */}
            <TabsContent value="account" className="space-y-6">
              <Card className="glass-card static-element">
                <CardHeader>
                  <CardTitle className="text-white">Account Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Email</Label>
                      <p className="text-white">{user?.email || 'Not available'}</p>
                    </div>
                    <div>
                      <Label className="text-gray-300">Account Created</Label>
                      <p className="text-white">
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Not available'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card static-element">
                <CardHeader>
                  <CardTitle className="text-white">FC25 Account Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-400">
                    Manage multiple FC25 accounts to track different profiles separately.
                    Coming soon - ability to create, switch between, and manage multiple FC25 accounts.
                  </p>
                  <Button disabled className="w-full" variant="outline">
                    Manage FC25 Accounts (Coming Soon)
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Data Management */}
            <TabsContent value="data" className="space-y-6">
              <Card className="glass-card static-element">
                <CardHeader>
                  <CardTitle className="text-white">Data Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <h4 className="text-red-400 font-semibold mb-2">Danger Zone</h4>
                      <p className="text-gray-300 text-sm mb-4">
                        This will permanently delete all your FUTALYST data including games, squads, players, and achievements. This action cannot be undone.
                      </p>
                      <Button 
                        onClick={handleDeleteAllData}
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete All Data
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-4">
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
