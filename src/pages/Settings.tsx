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
        {/* **UI FIX:** Applied styling from Dashboard (Index.tsx)
          - Added 'glass-card', 'rounded-2xl', 'shadow-xl', 'border-0', 'p-2', 'h-auto'
          - Kept responsive grid for 5 tabs: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5'
        */}
        <TabsList className="glass-card rounded-2xl shadow-xl border-0 p-2 h-auto grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
          {/* **UI FIX:** Applied 'tabs-trigger-style' and dashboard layout classes */}
          <TabsTrigger value="profile" className="tabs-trigger-style rounded-xl flex-1 flex gap-2 items-center justify-center">
            <User className="h-4 w-4" /> {/* Removed mr-2 */}
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="tabs-trigger-style rounded-xl flex-1 flex gap-2 items-center justify-center">
            <Shield className="h-4 w-4" /> {/* Removed mr-2 */}
            Security
          </TabsTrigger>
          <TabsTrigger value="preferences" className="tabs-trigger-style rounded-xl flex-1 flex gap-2 items-center justify-center">
            <Settings2 className="h-4 w-4" /> {/* Removed mr-2 */}
            Preferences
          </TabsTrigger>
          <TabsTrigger value="notifications" className="tabs-trigger-style rounded-xl flex-1 flex gap-2 items-center justify-center">
            <Bell className="h-4 w-4" /> {/* Removed mr-2 */}
            Notifications
          </TabsTrigger>
          <TabsTrigger value="danger_zone" className="tabs-trigger-style rounded-xl flex-1 flex gap-2 items-center justify-center">
            <ShieldAlert className="h-4 w-4" /> {/* Removed mr-2 */}
            Danger Zone
          </TabsTrigger>
        </TabsList>

        {/* **UI FIX:** Changed mt-6 to mt-4 for consistency with Dashboard */}
        
        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-4">
          <UserAccountSettings />
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-4">
          <UserSecuritySettings />
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="mt-4">
          <UserPreferences />
        </TabsContent>

        {/* **NEW NOTIFICATIONS CONTENT** */}
        <TabsContent value="notifications" className="mt-4">
          <UserNotificationSettings />
        </TabsContent>

        {/* Danger Zone Tab */}
        <TabsContent value="danger_zone" className="mt-4">
          <DangerZone />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;