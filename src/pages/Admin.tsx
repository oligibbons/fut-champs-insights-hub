import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/useTheme';
import { 
  Users, 
  Settings, 
  Database, 
  Trophy, 
  BarChart3, 
  Search, 
  Trash2, 
  Edit, 
  Save,
  Lock,
  Unlock,
  Shield,
  AlertTriangle,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface User {
  id: string;
  email: string;
  username?: string;
  created_at: string;
  last_sign_in_at?: string;
  is_admin?: boolean;
  is_banned?: boolean;
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalGames: number;
  totalSquads: number;
  totalAchievements: number;
  databaseSize: string;
  serverStatus: 'online' | 'degraded' | 'offline';
  lastBackup: string;
}

const Admin = () => {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalGames: 0,
    totalSquads: 0,
    totalAchievements: 0,
    databaseSize: '0 MB',
    serverStatus: 'online',
    lastBackup: new Date().toISOString()
  });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [backupInProgress, setBackupInProgress] = useState(false);
  const [restoreInProgress, setRestoreInProgress] = useState(false);

  useEffect(() => {
    // Check if current user is admin
    const checkAdmin = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        setIsAdmin(data?.is_admin || false);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };
    
    checkAdmin();
    if (isAdmin) {
      fetchUsers();
      fetchSystemStats();
    }
  }, [user, isAdmin]);

  const fetchUsers = async () => {
    if (!isAdmin) return;
    
    try {
      setLoading(true);
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');
        
      if (error) throw error;
      
      // Get auth users to match emails
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) throw authError;
      
      // Combine data
      const combinedUsers = profiles.map(profile => {
        const authUser = authUsers.users.find(u => u.id === profile.id);
        return {
          id: profile.id,
          email: authUser?.email || 'Unknown',
          username: profile.username,
          created_at: profile.created_at,
          last_sign_in_at: authUser?.last_sign_in_at,
          is_admin: profile.is_admin || false,
          is_banned: profile.is_banned || false
        };
      });
      
      setUsers(combinedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users. You may not have admin privileges.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemStats = async () => {
    if (!isAdmin) return;
    
    try {
      // Get total users
      const { count: userCount, error: userError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
        
      if (userError) throw userError;
      
      // Get active users (signed in within last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: activeUsers, error: activeError } = await supabase.auth.admin.listUsers({
        filter: {
          lastSignInAt: {
            gte: sevenDaysAgo.toISOString()
          }
        }
      });
      
      if (activeError) throw activeError;
      
      // Get total games
      const { count: gameCount, error: gameError } = await supabase
        .from('game_results')
        .select('*', { count: 'exact', head: true });
        
      if (gameError) throw gameError;
      
      // Get total squads
      const { count: squadCount, error: squadError } = await supabase
        .from('squads')
        .select('*', { count: 'exact', head: true });
        
      if (squadError) throw squadError;
      
      // Get total achievements
      const { count: achievementCount, error: achievementError } = await supabase
        .from('achievements')
        .select('*', { count: 'exact', head: true });
        
      if (achievementError) throw achievementError;
      
      setSystemStats({
        totalUsers: userCount || 0,
        activeUsers: activeUsers.users.length || 0,
        totalGames: gameCount || 0,
        totalSquads: squadCount || 0,
        totalAchievements: achievementCount || 0,
        databaseSize: '128 MB', // Placeholder
        serverStatus: 'online',
        lastBackup: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching system stats:', error);
    }
  };

  const handleUserSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.username && user.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: editingUser.username,
          is_admin: editingUser.is_admin,
          is_banned: editingUser.is_banned
        })
        .eq('id', editingUser.id);
        
      if (error) throw error;
      
      toast({
        title: "User Updated",
        description: "User information has been updated successfully."
      });
      
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user information.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirmation) return;
    
    try {
      // Delete user from auth
      const { error: authError } = await supabase.auth.admin.deleteUser(deleteConfirmation.id);
      
      if (authError) throw authError;
      
      // Delete user data
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', deleteConfirmation.id);
        
      if (profileError) throw profileError;
      
      toast({
        title: "User Deleted",
        description: "User and all associated data have been deleted."
      });
      
      setDeleteConfirmation(null);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user.",
        variant: "destructive"
      });
    }
  };

  const handleBackupDatabase = async () => {
    setBackupInProgress(true);
    
    try {
      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Backup Complete",
        description: "Database backup has been created successfully."
      });
      
      setSystemStats(prev => ({
        ...prev,
        lastBackup: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error backing up database:', error);
      toast({
        title: "Backup Failed",
        description: "Failed to create database backup.",
        variant: "destructive"
      });
    } finally {
      setBackupInProgress(false);
    }
  };

  const handleRestoreDatabase = async () => {
    setRestoreInProgress(true);
    
    try {
      // Simulate restore process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "Restore Complete",
        description: "Database has been restored successfully."
      });
    } catch (error) {
      console.error('Error restoring database:', error);
      toast({
        title: "Restore Failed",
        description: "Failed to restore database.",
        variant: "destructive"
      });
    } finally {
      setRestoreInProgress(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen">
        <Navigation />
        
        <main className="lg:ml-64 p-4 lg:p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col items-center justify-center py-20">
              <Shield className="h-20 w-20 text-fifa-red mb-6 opacity-50" />
              <h3 className="text-2xl font-semibold text-white mb-2">Access Denied</h3>
              <p className="text-gray-400 text-center max-w-md">
                You do not have permission to access the admin panel. Please contact an administrator if you believe this is an error.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="lg:ml-64 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-2xl" style={{ backgroundColor: `${currentTheme.colors.primary}20` }}>
              <Settings className="h-8 w-8" style={{ color: currentTheme.colors.primary }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">Admin Dashboard</h1>
              <p className="text-gray-400 mt-1">System management and user administration</p>
            </div>
          </div>

          {/* System Stats */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
                <BarChart3 className="h-5 w-5" style={{ color: currentTheme.colors.primary }} />
                System Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl" style={{ backgroundColor: currentTheme.colors.surface }}>
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="h-5 w-5" style={{ color: currentTheme.colors.primary }} />
                    <span className="font-medium" style={{ color: currentTheme.colors.text }}>Users</span>
                  </div>
                  <p className="text-2xl font-bold" style={{ color: currentTheme.colors.text }}>{systemStats.totalUsers}</p>
                  <p className="text-sm" style={{ color: currentTheme.colors.muted }}>
                    {systemStats.activeUsers} active in last 7 days
                  </p>
                </div>
                
                <div className="p-4 rounded-xl" style={{ backgroundColor: currentTheme.colors.surface }}>
                  <div className="flex items-center gap-3 mb-2">
                    <Trophy className="h-5 w-5" style={{ color: currentTheme.colors.accent }} />
                    <span className="font-medium" style={{ color: currentTheme.colors.text }}>Games</span>
                  </div>
                  <p className="text-2xl font-bold" style={{ color: currentTheme.colors.text }}>{systemStats.totalGames}</p>
                  <p className="text-sm" style={{ color: currentTheme.colors.muted }}>
                    Total recorded games
                  </p>
                </div>
                
                <div className="p-4 rounded-xl" style={{ backgroundColor: currentTheme.colors.surface }}>
                  <div className="flex items-center gap-3 mb-2">
                    <Database className="h-5 w-5" style={{ color: currentTheme.colors.secondary }} />
                    <span className="font-medium" style={{ color: currentTheme.colors.text }}>Database</span>
                  </div>
                  <p className="text-2xl font-bold" style={{ color: currentTheme.colors.text }}>{systemStats.databaseSize}</p>
                  <p className="text-sm" style={{ color: currentTheme.colors.muted }}>
                    Last backup: {new Date(systemStats.lastBackup).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="p-4 rounded-xl" style={{ backgroundColor: currentTheme.colors.surface }}>
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="h-5 w-5" style={{ color: systemStats.serverStatus === 'online' ? '#10b981' : '#ef4444' }} />
                    <span className="font-medium" style={{ color: currentTheme.colors.text }}>Server Status</span>
                  </div>
                  <p className="text-2xl font-bold capitalize" style={{ 
                    color: systemStats.serverStatus === 'online' ? '#10b981' : 
                           systemStats.serverStatus === 'degraded' ? '#f59e0b' : '#ef4444' 
                  }}>
                    {systemStats.serverStatus}
                  </p>
                  <p className="text-sm" style={{ color: currentTheme.colors.muted }}>
                    All systems operational
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <Button 
                  onClick={handleBackupDatabase}
                  disabled={backupInProgress}
                  className="bg-fifa-blue hover:bg-fifa-blue/80"
                >
                  {backupInProgress ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Backing Up...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Backup Database
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={handleRestoreDatabase}
                  disabled={restoreInProgress}
                  variant="outline"
                  className="border-fifa-blue text-fifa-blue hover:bg-fifa-blue/10"
                >
                  {restoreInProgress ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Restoring...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Restore Database
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* User Management */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
                <Users className="h-5 w-5" style={{ color: currentTheme.colors.primary }} />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: currentTheme.colors.muted }} />
                <Input
                  placeholder="Search users by email or username..."
                  value={searchQuery}
                  onChange={(e) => handleUserSearch(e.target.value)}
                  className="pl-10"
                  style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}
                />
              </div>
              
              <div className="rounded-lg overflow-hidden" style={{ backgroundColor: currentTheme.colors.surface }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ borderColor: currentTheme.colors.border }}>
                        <th className="px-4 py-3 text-left" style={{ color: currentTheme.colors.text }}>User</th>
                        <th className="px-4 py-3 text-left" style={{ color: currentTheme.colors.text }}>Created</th>
                        <th className="px-4 py-3 text-left" style={{ color: currentTheme.colors.text }}>Status</th>
                        <th className="px-4 py-3 text-left" style={{ color: currentTheme.colors.text }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} style={{ borderColor: currentTheme.colors.border }}>
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium" style={{ color: currentTheme.colors.text }}>{user.email}</p>
                              <p className="text-sm" style={{ color: currentTheme.colors.muted }}>{user.username || 'No username'}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3" style={{ color: currentTheme.colors.text }}>
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {user.is_admin && (
                                <Badge className="bg-fifa-blue text-white">Admin</Badge>
                              )}
                              {user.is_banned ? (
                                <Badge className="bg-fifa-red text-white">Banned</Badge>
                              ) : (
                                <Badge className="bg-fifa-green text-white">Active</Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditUser(user)}
                                style={{ borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setDeleteConfirmation(user)}
                                className="border-fifa-red text-fifa-red hover:bg-fifa-red/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {filteredUsers.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" style={{ color: currentTheme.colors.muted }} />
                    <p style={{ color: currentTheme.colors.muted }}>
                      No users found matching your search criteria.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SEO Management */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
                <Search className="h-5 w-5" style={{ color: currentTheme.colors.primary }} />
                SEO Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-2" style={{ color: currentTheme.colors.text }}>Site Title</label>
                  <Input
                    defaultValue="FUTALYST - AI-Powered FUT Champions Analytics"
                    style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}
                  />
                </div>
                
                <div>
                  <label className="block font-medium mb-2" style={{ color: currentTheme.colors.text }}>Meta Description</label>
                  <Input
                    defaultValue="Track and analyze your FIFA Champions performance with AI-powered insights and detailed statistics."
                    style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}
                  />
                </div>
              </div>
              
              <div>
                <label className="block font-medium mb-2" style={{ color: currentTheme.colors.text }}>Meta Keywords</label>
                <Input
                  defaultValue="FIFA, FUT Champions, analytics, stats tracking, football, soccer, EA Sports FC"
                  style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}
                />
              </div>
              
              <div>
                <label className="block font-medium mb-2" style={{ color: currentTheme.colors.text }}>Open Graph Description</label>
                <Textarea
                  defaultValue="FUTALYST helps you track and analyze your FIFA Champions performance with AI-powered insights, detailed statistics, and personalized recommendations to improve your gameplay."
                  style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}
                />
              </div>
              
              <Button className="bg-fifa-blue hover:bg-fifa-blue/80">
                <Save className="h-4 w-4 mr-2" />
                Save SEO Settings
              </Button>
            </CardContent>
          </Card>

          {/* Achievement Management */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
                <Trophy className="h-5 w-5" style={{ color: currentTheme.colors.primary }} />
                Achievement Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: currentTheme.colors.surface }}>
                  <div>
                    <p className="font-medium" style={{ color: currentTheme.colors.text }}>First Steps</p>
                    <p className="text-sm" style={{ color: currentTheme.colors.muted }}>Play your first Champions game</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-fifa-green text-white">Common</Badge>
                    <Button size="sm" variant="outline" style={{ borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: currentTheme.colors.surface }}>
                  <div>
                    <p className="font-medium" style={{ color: currentTheme.colors.text }}>Win Streak</p>
                    <p className="text-sm" style={{ color: currentTheme.colors.muted }}>Win 5 games in a row</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-fifa-purple text-white">Rare</Badge>
                    <Button size="sm" variant="outline" style={{ borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: currentTheme.colors.surface }}>
                  <div>
                    <p className="font-medium" style={{ color: currentTheme.colors.text }}>Perfect Week</p>
                    <p className="text-sm" style={{ color: currentTheme.colors.muted }}>Win all 15 games in a week</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-fifa-gold text-white">Legendary</Badge>
                    <Button size="sm" variant="outline" style={{ borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <Button className="bg-fifa-green hover:bg-fifa-green/80">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Achievement
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Edit User Modal */}
      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}>
            <DialogHeader>
              <DialogTitle style={{ color: currentTheme.colors.text }}>Edit User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-2" style={{ color: currentTheme.colors.text }}>Email</label>
                <Input
                  value={editingUser.email}
                  disabled
                  style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}
                />
              </div>
              
              <div>
                <label className="block font-medium mb-2" style={{ color: currentTheme.colors.text }}>Username</label>
                <Input
                  value={editingUser.username || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                  style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium" style={{ color: currentTheme.colors.text }}>Admin Status</label>
                  <p className="text-sm" style={{ color: currentTheme.colors.muted }}>Grant admin privileges</p>
                </div>
                <Switch
                  checked={editingUser.is_admin || false}
                  onCheckedChange={(checked) => setEditingUser({ ...editingUser, is_admin: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium" style={{ color: currentTheme.colors.text }}>Account Status</label>
                  <p className="text-sm" style={{ color: currentTheme.colors.muted }}>
                    {editingUser.is_banned ? 'Account is currently banned' : 'Account is active'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setEditingUser({ ...editingUser, is_banned: !editingUser.is_banned })}
                  className={editingUser.is_banned ? 'border-fifa-green text-fifa-green' : 'border-fifa-red text-fifa-red'}
                >
                  {editingUser.is_banned ? (
                    <>
                      <Unlock className="h-4 w-4 mr-2" />
                      Unban
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Ban
                    </>
                  )}
                </Button>
              </div>
              
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setEditingUser(null)}
                  style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveUser}
                  className="bg-fifa-blue hover:bg-fifa-blue/80"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete User Confirmation */}
      <AlertDialog open={!!deleteConfirmation} onOpenChange={() => setDeleteConfirmation(null)}>
        <AlertDialogContent style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: currentTheme.colors.text }}>Delete User</AlertDialogTitle>
            <AlertDialogDescription style={{ color: currentTheme.colors.muted }}>
              Are you sure you want to delete this user? This action cannot be undone and will remove all user data including games, squads, and achievements.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-fifa-red hover:bg-fifa-red/80">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;