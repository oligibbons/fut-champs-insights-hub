
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Shield, Bell, Download, Trash2, Eye, EyeOff } from 'lucide-react';

const UserAccountSettings = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState({
    displayName: '',
    username: '',
    bio: '',
    location: '',
    website: ''
  });
  
  const [notifications, setNotifications] = useState({
    gameReminders: true,
    weeklyReports: true,
    achievements: true,
    socialUpdates: false,
    marketingEmails: false
  });
  
  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showStats: true,
    showFriends: true,
    showAchievements: true
  });
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    // Load user profile from localStorage or API
    const savedProfile = localStorage.getItem('user-profile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
    
    const savedNotifications = localStorage.getItem('user-notifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
    
    const savedPrivacy = localStorage.getItem('user-privacy');
    if (savedPrivacy) {
      setPrivacy(JSON.parse(savedPrivacy));
    }
  }, []);

  const saveProfile = () => {
    localStorage.setItem('user-profile', JSON.stringify(profile));
    toast({
      title: "Profile Updated",
      description: "Your profile has been saved successfully.",
    });
  };

  const saveNotifications = (newSettings: typeof notifications) => {
    setNotifications(newSettings);
    localStorage.setItem('user-notifications', JSON.stringify(newSettings));
    toast({
      title: "Notification Settings Updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const savePrivacy = (newSettings: typeof privacy) => {
    setPrivacy(newSettings);
    localStorage.setItem('user-privacy', JSON.stringify(newSettings));
    toast({
      title: "Privacy Settings Updated",
      description: "Your privacy preferences have been saved.",
    });
  };

  const exportData = () => {
    // Gather all user data
    const userData = {
      profile,
      notifications,
      privacy,
      weeklyData: JSON.parse(localStorage.getItem('weeklyData') || '[]'),
      players: JSON.parse(localStorage.getItem('players') || '[]'),
      squads: JSON.parse(localStorage.getItem('squads') || '[]'),
      achievements: JSON.parse(localStorage.getItem('achievements') || '[]'),
      exportDate: new Date().toISOString()
    };

    // Create and download file
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `futalyst-data-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Data Exported",
      description: "Your data has been exported successfully.",
    });
  };

  const deleteAccount = () => {
    if (deleteConfirmText !== 'DELETE') {
      toast({
        title: "Confirmation Required",
        description: "Please type 'DELETE' to confirm account deletion.",
        variant: "destructive"
      });
      return;
    }

    // Clear all local data
    localStorage.clear();
    
    // Logout user
    logout();
    
    toast({
      title: "Account Deleted",
      description: "Your account and all data have been deleted.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <User className="h-5 w-5 text-fifa-blue" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
            <div className="w-16 h-16 bg-fifa-blue rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold">{user?.email}</p>
              <Badge variant="outline" className="text-fifa-green border-fifa-green">
                <Shield className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Display Name</Label>
              <Input
                value={profile.displayName}
                onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                placeholder="Your display name"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label className="text-white">Username</Label>
              <Input
                value={profile.username}
                onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
                placeholder="@username"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div className="md:col-span-2">
              <Label className="text-white">Bio</Label>
              <Textarea
                value={profile.bio}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself..."
                className="bg-gray-800 border-gray-600 text-white"
                rows={3}
              />
            </div>
            <div>
              <Label className="text-white">Location</Label>
              <Input
                value={profile.location}
                onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                placeholder="City, Country"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label className="text-white">Website</Label>
              <Input
                value={profile.website}
                onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://yourwebsite.com"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>

          <Button onClick={saveProfile} className="bg-fifa-blue hover:bg-fifa-blue/80">
            Save Profile
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Bell className="h-5 w-5 text-fifa-gold" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <p className="text-white font-medium">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </p>
                <p className="text-gray-400 text-sm">
                  {key === 'gameReminders' && 'Get reminded about your FUT Champions runs'}
                  {key === 'weeklyReports' && 'Receive weekly performance summaries'}
                  {key === 'achievements' && 'Get notified when you unlock achievements'}
                  {key === 'socialUpdates' && 'Updates from friends and community'}
                  {key === 'marketingEmails' && 'Product updates and promotional content'}
                </p>
              </div>
              <Switch
                checked={value}
                onCheckedChange={(checked) => 
                  saveNotifications({ ...notifications, [key]: checked })
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Eye className="h-5 w-5 text-fifa-purple" />
            Privacy Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(privacy).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <p className="text-white font-medium">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </p>
                <p className="text-gray-400 text-sm">
                  {key === 'profilePublic' && 'Make your profile visible to other users'}
                  {key === 'showStats' && 'Allow others to see your performance statistics'}
                  {key === 'showFriends' && 'Display your friends list on your profile'}
                  {key === 'showAchievements' && 'Show your achievements to other users'}
                </p>
              </div>
              <Switch
                checked={value}
                onCheckedChange={(checked) => 
                  savePrivacy({ ...privacy, [key]: checked })
                }
              />
            </div>
          ))}
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
          <div className="p-4 bg-fifa-green/10 rounded-xl">
            <h4 className="text-white font-medium mb-2">Export Your Data</h4>
            <p className="text-gray-400 text-sm mb-3">
              Download a complete copy of all your FUTALYST data including match records, 
              performance statistics, and account settings.
            </p>
            <Button onClick={exportData} variant="outline" className="border-fifa-green text-fifa-green">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>

          <div className="p-4 bg-fifa-red/10 rounded-xl border border-fifa-red/30">
            <h4 className="text-white font-medium mb-2">Delete Account</h4>
            <p className="text-gray-400 text-sm mb-3">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            
            {!showDeleteConfirm ? (
              <Button 
                onClick={() => setShowDeleteConfirm(true)}
                variant="outline" 
                className="border-fifa-red text-fifa-red"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            ) : (
              <div className="space-y-3">
                <div>
                  <Label className="text-white text-sm">
                    Type "DELETE" to confirm account deletion:
                  </Label>
                  <Input
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="bg-gray-800 border-fifa-red text-white mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={deleteAccount}
                    className="bg-fifa-red hover:bg-fifa-red/80"
                    disabled={deleteConfirmText !== 'DELETE'}
                  >
                    Confirm Delete
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteConfirmText('');
                    }}
                    variant="outline"
                    className="border-gray-600 text-gray-400"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserAccountSettings;
