
import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useLocalStorage, exportData, importData } from '@/hooks/useLocalStorage';
import { UserSettings } from '@/types/futChampions';
import { Plus, Trash2, Upload, Download, Settings2, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useLocalStorage<UserSettings>('fc25-settings', {
    preferredFormation: '4-3-3',
    trackingStartDate: new Date().toISOString().split('T')[0],
    gameplayStyle: 'balanced',
    notifications: true
  });
  
  const [accounts, setAccounts] = useLocalStorage<string[]>('fc25-accounts', ['Main Account']);
  const [activeAccount, setActiveAccount] = useLocalStorage<string>('fc25-active-account', 'Main Account');
  const [newAccountName, setNewAccountName] = useState('');
  const [allData] = useLocalStorage('fc25-weeks', []);

  const handleAddAccount = () => {
    if (newAccountName.trim() && !accounts.includes(newAccountName.trim())) {
      const updatedAccounts = [...accounts, newAccountName.trim()];
      setAccounts(updatedAccounts);
      setNewAccountName('');
      toast({
        title: "Account Added",
        description: `${newAccountName.trim()} has been added to your accounts.`,
      });
    }
  };

  const handleDeleteAccount = (accountName: string) => {
    if (accounts.length > 1) {
      const updatedAccounts = accounts.filter(acc => acc !== accountName);
      setAccounts(updatedAccounts);
      if (activeAccount === accountName) {
        setActiveAccount(updatedAccounts[0]);
      }
      toast({
        title: "Account Deleted",
        description: `${accountName} has been removed.`,
      });
    }
  };

  const handleExportData = () => {
    const exportableData = {
      settings,
      accounts,
      activeAccount,
      weekData: allData,
      exportDate: new Date().toISOString()
    };
    exportData(exportableData, 'fc25-tracker-data');
    toast({
      title: "Data Exported",
      description: "Your FUT Champions data has been exported successfully.",
    });
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const data = await importData(file);
        if (data.settings) setSettings(data.settings);
        if (data.accounts) setAccounts(data.accounts);
        if (data.activeAccount) setActiveAccount(data.activeAccount);
        toast({
          title: "Data Imported",
          description: "Your FUT Champions data has been imported successfully.",
        });
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Failed to import data. Please check the file format.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="lg:ml-64 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold gradient-text mb-6">Settings</h1>
          
          {/* Account Management */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <User className="h-5 w-5 text-fifa-blue" />
                Account Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-white mb-2 block">Active Account</Label>
                <Select value={activeAccount} onValueChange={setActiveAccount}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account} value={account}>
                        {account}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-white">Your Accounts</Label>
                <div className="flex flex-wrap gap-2">
                  {accounts.map((account) => (
                    <div key={account} className="flex items-center gap-2">
                      <Badge 
                        variant={account === activeAccount ? "default" : "outline"}
                        className={account === activeAccount ? "bg-fifa-blue" : ""}
                      >
                        {account}
                      </Badge>
                      {accounts.length > 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteAccount(account)}
                          className="h-6 w-6 p-0 text-fifa-red hover:text-fifa-red"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="New account name..."
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddAccount()}
                />
                <Button onClick={handleAddAccount} disabled={!newAccountName.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* General Settings */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Settings2 className="h-5 w-5 text-fifa-purple" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-white mb-2 block">Preferred Formation</Label>
                <Select 
                  value={settings.preferredFormation} 
                  onValueChange={(value) => setSettings({...settings, preferredFormation: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4-3-3">4-3-3</SelectItem>
                    <SelectItem value="4-4-2">4-4-2</SelectItem>
                    <SelectItem value="3-5-2">3-5-2</SelectItem>
                    <SelectItem value="4-2-3-1">4-2-3-1</SelectItem>
                    <SelectItem value="4-1-2-1-2">4-1-2-1-2</SelectItem>
                    <SelectItem value="5-3-2">5-3-2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white mb-2 block">Gameplay Style</Label>
                <Select 
                  value={settings.gameplayStyle} 
                  onValueChange={(value: 'aggressive' | 'balanced' | 'defensive') => 
                    setSettings({...settings, gameplayStyle: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aggressive">Aggressive</SelectItem>
                    <SelectItem value="balanced">Balanced</SelectItem>
                    <SelectItem value="defensive">Defensive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white mb-2 block">Tracking Start Date</Label>
                <Input
                  type="date"
                  value={settings.trackingStartDate}
                  onChange={(e) => setSettings({...settings, trackingStartDate: e.target.value})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Notifications</Label>
                  <p className="text-sm text-gray-400">Enable browser notifications for reminders</p>
                </div>
                <Switch
                  checked={settings.notifications}
                  onCheckedChange={(checked) => setSettings({...settings, notifications: checked})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Download className="h-5 w-5 text-fifa-green" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button onClick={handleExportData} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export Data
                </Button>
                
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button variant="outline" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Import Data
                  </Button>
                </div>
              </div>
              
              <p className="text-sm text-gray-400">
                Export your data to backup your progress, or import previously exported data.
                All data is stored locally in your browser.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Settings;
