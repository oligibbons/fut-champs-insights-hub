// src/pages/Settings.tsx
import { User, Shield, Settings2, ShieldAlert, Bell } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import the functional components
import UserAccountSettings from '@/components/UserAccountSettings';
import UserSecuritySettings from '@/components/UserSecuritySettings';
import UserPreferences from '@/components/UserPreferences';
import DangerZone from '@/components/DangerZone';
import UserNotificationSettings from '@/components/UserNotificationSettings'; // **NEW**

const Settings = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 h-12 w-12 rounded-lg glass-card-content flex items-center justify-center shadow-md">
          <Settings2 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account, preferences, and security.</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        {/* **FIX: Updated to 5 columns** */}
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Settings2 className="h-4 w-4 mr-2" />
            Preferences
          </TabsTrigger>
          {/* **NEW NOTIFICATIONS TAB** */}
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="danger_zone">
            <ShieldAlert className="h-4 w-4 mr-2" />
            Danger Zone
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6">
          <UserAccountSettings />
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-6">
          <UserSecuritySettings />
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="mt-6">
          <UserPreferences />
        </TabsContent>

        {/* **NEW NOTIFICATIONS CONTENT** */}
        <TabsContent value="notifications" className="mt-6">
          <UserNotificationSettings />
        </TabsContent>

        {/* Danger Zone Tab */}
        <TabsContent value="danger_zone" className="mt-6">
          <DangerZone />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;