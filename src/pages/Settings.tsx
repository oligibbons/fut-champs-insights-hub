import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import Navigation from '@/components/Navigation';
import { useDataSync } from '@/hooks/useDataSync';
import { toast } from '@/hooks/use-toast';
import { Settings, Trash2, Download, Upload, Save, RotateCcw } from 'lucide-react';
import { exportData, importData } from '@/hooks/useLocalStorage';

const SettingsPage = () => {
  const { settings, setSettings, deleteAllData, weeklyData, players, squads } = useDataSync();
  const [importFile, setImportFile] = useState<File | null>(null);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    toast({
      title: "Setting Updated",
      description: `${key} has been updated.`,
    });
  };

  const handleNestedSettingChange = (section: string, key: string, value: any) => {
    setSettings(prev => {
      const currentSection = prev[section as keyof typeof prev];
      const sectionObject = typeof currentSection === 'object' && currentSection !== null ? currentSection : {};
      
      return {
        ...prev,
        [section]: {
          ...sectionObject,
          [key]: value
        }
      };
    });
    
    toast({
      title: "Display Setting Updated",
      description: `${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} has been ${value ? 'enabled' : 'disabled'}.`,
    });
  };

  const handleExportData = () => {
    const allData = {
      settings,
      weeklyData,
      players,
      squads,
      exportDate: new Date().toISOString()
    };
    exportData(allData, 'fc25-champions-data');
    toast({
      title: "Data Exported",
      description: "Your data has been exported successfully.",
    });
  };

  const handleImportData = async () => {
    if (!importFile) return;
    
    try {
      const data = await importData(importFile);
      
      if (data.settings) setSettings(data.settings);
      // Note: weeklyData, players, squads would need to be imported via useDataSync
      
      toast({
        title: "Data Imported",
        description: "Your data has been imported successfully.",
      });
      setImportFile(null);
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to import data. Please check the file format.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAllData = () => {
    deleteAllData();
    toast({
      title: "All Data Deleted",
      description: "All your data has been permanently deleted.",
    });
  };

  const resetSettings = () => {
    setSettings({
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
    });
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to defaults.",
    });
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="lg:ml-64 p-4 lg:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-2xl bg-fifa-blue/20">
              <Settings className="h-8 w-8 text-fifa-blue" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white page-header">Settings</h1>
              <p className="text-gray-400 mt-1">Customize your FC25 Champions experience</p>
            </div>
          </div>

          {/* Basic Settings */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white">Basic Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-white">Preferred Formation</Label>
                  <Select value={settings.preferredFormation} onValueChange={(value) => handleSettingChange('preferredFormation', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3-4-3">3-4-3</SelectItem>
                      <SelectItem value="3-5-2">3-5-2</SelectItem>
                      <SelectItem value="4-2-3-1">4-2-3-1</SelectItem>
                      <SelectItem value="4-3-3">4-3-3</SelectItem>
                      <SelectItem value="4-4-2">4-4-2</SelectItem>
                      <SelectItem value="4-5-1">4-5-1</SelectItem>
                      <SelectItem value="5-3-2">5-3-2</SelectItem>
                      <SelectItem value="5-4-1">5-4-1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Gameplay Style</Label>
                  <Select value={settings.gameplayStyle} onValueChange={(value) => handleSettingChange('gameplayStyle', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="attacking">Attacking</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="defensive">Defensive</SelectItem>
                      <SelectItem value="possession">Possession</SelectItem>
                      <SelectItem value="counter">Counter-Attack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Games Per Week</Label>
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    value={settings.gamesPerWeek}
                    onChange={(e) => handleSettingChange('gamesPerWeek', parseInt(e.target.value) || 15)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Theme</Label>
                  <Select value={settings.theme} onValueChange={(value) => handleSettingChange('theme', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="futvisionary">FUT Visionary</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="champions">Champions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Carousel Speed (seconds)</Label>
                  <Slider
                    value={[settings.carouselSpeed || 12]}
                    onValueChange={([value]) => handleSettingChange('carouselSpeed', value)}
                    max={30}
                    min={3}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-400">{settings.carouselSpeed || 12} seconds</p>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-white">Enable Notifications</Label>
                  <Switch
                    checked={settings.notifications}
                    onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-white">Default Cross-Play Enabled</Label>
                  <Switch
                    checked={settings.defaultCrossPlay}
                    onCheckedChange={(checked) => handleSettingChange('defaultCrossPlay', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dashboard Settings */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white">Dashboard Display Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(settings.dashboardSettings || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label className="text-white">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Label>
                    <Switch
                      checked={value as boolean}
                      onCheckedChange={(checked) => handleNestedSettingChange('dashboardSettings', key, checked)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Current Week Settings */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white">Current Week Display Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(settings.currentWeekSettings || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label className="text-white">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Label>
                    <Switch
                      checked={value as boolean}
                      onCheckedChange={(checked) => handleNestedSettingChange('currentWeekSettings', key, checked)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Analytics Preferences */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white">Analytics Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(settings.analyticsPreferences || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label className="text-white">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Label>
                    <Switch
                      checked={value as boolean}
                      onCheckedChange={(checked) => handleNestedSettingChange('analyticsPreferences', key, checked)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white">Data Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-4">
                <Button onClick={handleExportData} variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>

                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept=".json"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleImportData} 
                    disabled={!importFile}
                    variant="outline"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button onClick={resetSettings} variant="outline" className="flex-1">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Settings
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="flex-1">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete All Data
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete All Data</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete all your data including weeks, games, players, and squads. 
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAllData}>
                          Delete Everything
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
