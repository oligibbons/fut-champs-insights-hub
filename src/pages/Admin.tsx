import { useState, useEffect, useMemo } from 'react';
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
    Upload,
    Plus,
    Palette,
    X
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { CardType } from '@/types/squads';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import CardTypeCreator from '@/components/CardTypeCreator'; // We will reuse the creator component

interface UserProfile {
  id: string;
  username?: string;
  display_name?: string;
  created_at: string;
  is_admin?: boolean;
  is_banned?: boolean;
  total_games?: number;
  total_wins?: number;
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
    const [users, setUsers] = useState<UserProfile[]>([]);
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
    const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState<UserProfile | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [backupInProgress, setBackupInProgress] = useState(false);
    const [restoreInProgress, setRestoreInProgress] = useState(false);

    useEffect(() => {
        const checkAdmin = async () => {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('is_admin')
                    .eq('id', user.id)
                    .single();
                
                if (error) throw error;
                const adminStatus = data?.is_admin || false;
                setIsAdmin(adminStatus);
                
                if (adminStatus) {
                    fetchUsers();
                    fetchSystemStats();
                }
            } catch (error) {
                console.error('Error checking admin status:', error);
                setIsAdmin(false);
            }
        };
        
        checkAdmin();
    }, [user]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data: profiles, error } = await supabase.from('profiles').select('*');
            if (error) throw error;
            const mappedUsers = profiles.map(profile => ({
                id: profile.id,
                username: profile.username,
                display_name: profile.display_name,
                created_at: profile.created_at,
                is_admin: profile.is_admin || false,
                is_banned: profile.is_banned || false,
                total_games: profile.total_games || 0,
                total_wins: profile.total_wins || 0
            }));
            setUsers(mappedUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast({ title: "Error", description: "Failed to load users.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const fetchSystemStats = async () => {
        try {
            const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
            const { count: gameCount } = await supabase.from('game_results').select('*', { count: 'exact', head: true });
            const { count: squadCount } = await supabase.from('squads').select('*', { count: 'exact', head: true });
            const { count: achievementCount } = await supabase.from('achievements').select('*', { count: 'exact', head: true });
            
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const { data: recentGames } = await supabase.from('game_results').select('user_id').gte('created_at', sevenDaysAgo.toISOString());
            const activeUserIds = new Set(recentGames?.map(game => game.user_id) || []);

            setSystemStats({
                totalUsers: userCount || 0,
                activeUsers: activeUserIds.size,
                totalGames: gameCount || 0,
                totalSquads: squadCount || 0,
                totalAchievements: achievementCount || 0,
                databaseSize: '128 MB', // This is a placeholder as client-side cannot determine this.
                serverStatus: 'online',
                lastBackup: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error fetching system stats:', error);
            toast({ title: "Error", description: "Failed to load system statistics.", variant: "destructive" });
        }
    };

    const handleUserSearch = (query: string) => setSearchQuery(query);

    const filteredUsers = users.filter(user => 
        (user.username && user.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.display_name && user.display_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleEditUser = (user: UserProfile) => setEditingUser(user);

    const handleSaveUser = async () => {
        if (!editingUser) return;
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    username: editingUser.username,
                    display_name: editingUser.display_name,
                    is_admin: editingUser.is_admin,
                    is_banned: editingUser.is_banned
                })
                .eq('id', editingUser.id);
            if (error) throw error;
            toast({ title: "User Updated", description: "User information has been updated successfully." });
            setEditingUser(null);
            fetchUsers();
        } catch (error) {
            console.error('Error updating user:', error);
            toast({ title: "Error", description: "Failed to update user information.", variant: "destructive" });
        }
    };

    const handleDeleteUser = async () => {
        if (!deleteConfirmation) return;
        try {
            // This would typically be a call to a secure server-side function
            // to delete the auth user and all related data.
            // The below only deletes the profile, not the user login.
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', deleteConfirmation.id);
            if (error) throw error;
            toast({ title: "Profile Deleted", description: "User profile has been deleted. Auth account may still exist.", variant: "destructive" });
            setDeleteConfirmation(null);
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user profile:', error);
            toast({ title: "Error", description: "Failed to delete user profile.", variant: "destructive" });
        }
    };

    const handleBackupDatabase = async () => {
        setBackupInProgress(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            toast({ title: "Backup Simulated", description: "Database backup simulation completed." });
            setSystemStats(prev => ({ ...prev, lastBackup: new Date().toISOString() }));
        } finally {
            setBackupInProgress(false);
        }
    };

    const handleRestoreDatabase = async () => {
        setRestoreInProgress(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 3000));
            toast({ title: "Restore Simulated", description: "Database restore simulation completed." });
        } finally {
            setRestoreInProgress(false);
        }
    };

    if (!isAdmin) {
        return (
            <div className="min-h-screen">
                <Navigation />
                <main className="lg:ml-64 p-4 lg:p-6">
                    <div className="max-w-6xl mx-auto space-y-6 flex flex-col items-center justify-center py-20">
                        <Shield className="h-20 w-20 text-red-500 mb-6 opacity-50" />
                        <h3 className="text-2xl font-semibold text-foreground mb-2">Access Denied</h3>
                        <p className="text-muted-foreground text-center max-w-md">
                            You do not have permission to access the admin panel.
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Navigation />
            <main className="lg:ml-64 p-4 lg:p-6">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/20 rounded-2xl">
                            <Settings className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
                            <p className="text-muted-foreground mt-1">System management and user administration</p>
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-primary" />
                                System Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 bg-card-foreground/5 rounded-xl">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Users className="h-5 w-5 text-primary" />
                                        <span className="font-medium text-foreground">Users</span>
                                    </div>
                                    <p className="text-2xl font-bold text-foreground">{systemStats.totalUsers}</p>
                                    <p className="text-sm text-muted-foreground">{systemStats.activeUsers} active recently</p>
                                </div>
                                <div className="p-4 bg-card-foreground/5 rounded-xl">
                                     <div className="flex items-center gap-3 mb-2">
                                        <Trophy className="h-5 w-5 text-yellow-500" />
                                        <span className="font-medium text-foreground">Games</span>
                                    </div>
                                    <p className="text-2xl font-bold text-foreground">{systemStats.totalGames}</p>
                                    <p className="text-sm text-muted-foreground">Total recorded</p>
                                </div>
                                <div className="p-4 bg-card-foreground/5 rounded-xl">
                                     <div className="flex items-center gap-3 mb-2">
                                        <Database className="h-5 w-5 text-blue-500" />
                                        <span className="font-medium text-foreground">Database</span>
                                    </div>
                                    <p className="text-2xl font-bold text-foreground">{systemStats.databaseSize}</p>
                                    <p className="text-sm text-muted-foreground">Last backup: {new Date(systemStats.lastBackup).toLocaleDateString()}</p>
                                </div>
                                <div className="p-4 bg-card-foreground/5 rounded-xl">
                                     <div className="flex items-center gap-3 mb-2">
                                        <Shield className="h-5 w-5" style={{ color: systemStats.serverStatus === 'online' ? '#10b981' : '#ef4444' }} />
                                        <span className="font-medium text-foreground">Server Status</span>
                                    </div>
                                    <p className="text-2xl font-bold capitalize" style={{ color: systemStats.serverStatus === 'online' ? '#10b981' : '#ef4444' }}>{systemStats.serverStatus}</p>
                                    <p className="text-sm text-muted-foreground">All systems go</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                <Button onClick={handleBackupDatabase} disabled={backupInProgress}>{backupInProgress ? (<><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Simulating Backup...</>) : (<><Download className="h-4 w-4 mr-2" /> Simulate Backup</>)}</Button>
                                <Button onClick={handleRestoreDatabase} disabled={restoreInProgress} variant="outline">{restoreInProgress ? (<><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Simulating Restore...</>) : (<><Upload className="h-4 w-4 mr-2" /> Simulate Restore</>)}</Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                User Management
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search users by username or display name..."
                                    value={searchQuery}
                                    onChange={(e) => handleUserSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <div className="rounded-lg border overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className='border-b'>
                                                <th className="px-4 py-3 text-left text-muted-foreground">User</th>
                                                <th className="px-4 py-3 text-left text-muted-foreground">Created</th>
                                                <th className="px-4 py-3 text-left text-muted-foreground">Games</th>
                                                <th className="px-4 py-3 text-left text-muted-foreground">Status</th>
                                                <th className="px-4 py-3 text-left text-muted-foreground">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredUsers.map((user) => (
                                                <tr key={user.id} className='border-b'>
                                                    <td className="px-4 py-3">
                                                        <div>
                                                            <p className="font-medium text-foreground">{user.display_name || user.username || 'Unknown User'}</p>
                                                            <p className="text-sm text-muted-foreground">@{user.username || 'no-username'}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-foreground">{new Date(user.created_at).toLocaleDateString()}</td>
                                                    <td className="px-4 py-3 text-foreground">{user.total_games || 0} ({user.total_wins || 0}W)</td>
                                                    <td className="px-4 py-3"><div className="flex items-center gap-2">{user.is_admin && (<Badge>Admin</Badge>)}{user.is_banned ? (<Badge variant="destructive">Banned</Badge>) : (<Badge variant="secondary">Active</Badge>)}</div></td>
                                                    <td className="px-4 py-3"><div className="flex items-center gap-2"><Button size="sm" variant="outline" onClick={() => handleEditUser(user)}><Edit className="h-4 w-4" /></Button><Button size="sm" variant="destructive" onClick={() => setDeleteConfirmation(user)}><Trash2 className="h-4 w-4" /></Button></div></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {filteredUsers.length === 0 && (
                                    <div className="text-center py-8"><Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" /><p className="text-muted-foreground">No users found.</p></div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Re-integrated CardTypeCreator component */}
                    <CardTypeCreator />

                    {editingUser && (<Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}><DialogContent><DialogHeader><DialogTitle>Edit User</DialogTitle></DialogHeader><div className="space-y-4 py-4"><div><Label>Username</Label><Input value={editingUser.username || ''} onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}/></div><div><Label>Display Name</Label><Input value={editingUser.display_name || ''} onChange={(e) => setEditingUser({ ...editingUser, display_name: e.target.value })}/></div><div className="flex items-center justify-between"><div className='space-y-1'><Label>Admin Status</Label><p className="text-sm text-muted-foreground">Grant admin privileges</p></div><Switch checked={editingUser.is_admin || false} onCheckedChange={(checked) => setEditingUser({ ...editingUser, is_admin: checked })}/></div><div className="flex items-center justify-between"><div className='space-y-1'><Label>Account Status</Label><p className="text-sm text-muted-foreground">{editingUser.is_banned ? 'Account is banned' : 'Account is active'}</p></div><Button variant="outline" onClick={() => setEditingUser({ ...editingUser, is_banned: !editingUser.is_banned })} className={editingUser.is_banned ? 'text-green-600 border-green-600' : 'text-red-600 border-red-600'}>{editingUser.is_banned ? (<><Unlock className="h-4 w-4 mr-2" />Unban</>) : (<><Lock className="h-4 w-4 mr-2" />Ban</>)}</Button></div><div className="flex gap-3 justify-end pt-4"><Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button><Button onClick={handleSaveUser}><Save className="h-4 w-4 mr-2" />Save Changes</Button></div></div></DialogContent></Dialog>)}
                    <AlertDialog open={!!deleteConfirmation} onOpenChange={() => setDeleteConfirmation(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete User Profile</AlertDialogTitle><AlertDialogDescription>This will delete the user's profile and all their associated data. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
                </div>
            </main>
        </div>
    );
};

export default Admin;
