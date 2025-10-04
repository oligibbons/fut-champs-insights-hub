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

interface User {
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

    // Card Type Management State
    const [cardTypes, setCardTypes] = useState<CardType[]>([]);
    const [newCardType, setNewCardType] = useState<Partial<CardType>>({ name: '', color: '#ffffff', text_color: '#000000', is_default: false });
    const [editingCardType, setEditingCardType] = useState<CardType | null>(null);
    const [cardManagementGameVersion, setCardManagementGameVersion] = useState<'FC26' | 'FC25'>('FC26');

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
                    fetchCardTypes();
                }
            } catch (error) {
                console.error('Error checking admin status:', error);
                setIsAdmin(false);
            }
        };
        
        checkAdmin();
    }, [user]);

    const fetchUsers = async () => {
        if (!isAdmin) return;
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
            toast({ title: "Error", description: "Failed to load users. You may not have admin privileges.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const fetchSystemStats = async () => {
        if (!isAdmin) return;
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
                databaseSize: '128 MB', // Placeholder
                serverStatus: 'online',
                lastBackup: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error fetching system stats:', error);
            toast({ title: "Error", description: "Failed to load system statistics.", variant: "destructive" });
        }
    };
    
    const fetchCardTypes = async () => {
        if (!isAdmin) return;
        const { data, error } = await supabase.from('card_types').select('*');
        if (error) {
            toast({ title: 'Error fetching card types', description: error.message, variant: 'destructive' });
        } else {
            setCardTypes(data || []);
        }
    };

    const gameVersionedCardTypes = useMemo(() => {
        return cardTypes.filter(ct => ct.game_version === cardManagementGameVersion);
    }, [cardTypes, cardManagementGameVersion]);

    const handleSaveCardType = async () => {
        if (!newCardType.name) {
            toast({ title: 'Error', description: 'Card type name is required.', variant: 'destructive' });
            return;
        }
        const cardToSave = {
            ...newCardType,
            user_id: user?.id,
            game_version: cardManagementGameVersion
        };
        const { error } = await supabase.from('card_types').insert([cardToSave]);
        if (error) {
            toast({ title: 'Error saving card type', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Success', description: 'New card type added.' });
            setNewCardType({ name: '', color: '#ffffff', text_color: '#000000', is_default: false });
            fetchCardTypes();
        }
    };

    const handleUpdateCardType = async () => {
        if (!editingCardType || !editingCardType.name) return;
        const { error } = await supabase.from('card_types').update(editingCardType).eq('id', editingCardType.id);
        if (error) {
            toast({ title: 'Error updating card type', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Success', description: 'Card type updated.' });
            setEditingCardType(null);
            fetchCardTypes();
        }
    };

    const handleDeleteCardType = async (id: string) => {
        const { error } = await supabase.from('card_types').delete().eq('id', id);
        if (error) {
            toast({ title: 'Error deleting card type', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Success', description: 'Card type deleted.' });
            fetchCardTypes();
        }
    };

    const handleUserSearch = (query: string) => setSearchQuery(query);
    const filteredUsers = users.filter(u => (u.username && u.username.toLowerCase().includes(searchQuery.toLowerCase())) || (u.display_name && u.display_name.toLowerCase().includes(searchQuery.toLowerCase())));
    const handleEditUser = (user: User) => setEditingUser(user);
    
    const handleSaveUser = async () => {
        if (!editingUser) return;
        try {
            const { error } = await supabase.from('profiles').update({
                username: editingUser.username,
                display_name: editingUser.display_name,
                is_admin: editingUser.is_admin,
                is_banned: editingUser.is_banned
            }).eq('id', editingUser.id);
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
            const { error } = await supabase.from('profiles').delete().eq('id', deleteConfirmation.id);
            if (error) throw error;
            toast({ title: "Profile Deleted", description: "User profile has been deleted.", variant: "destructive" });
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
        } catch (error) {
            console.error('Error simulating backup:', error);
            toast({ title: "Backup Failed", description: "Failed to simulate database backup.", variant: "destructive" });
        } finally {
            setBackupInProgress(false);
        }
    };

    const handleRestoreDatabase = async () => {
        setRestoreInProgress(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 3000));
            toast({ title: "Restore Simulated", description: "Database restore simulation completed." });
        } catch (error) {
            console.error('Error simulating restore:', error);
            toast({ title: "Restore Failed", description: "Failed to simulate database restore.", variant: "destructive" });
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
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 rounded-2xl" style={{ backgroundColor: `${currentTheme.colors.primary}20` }}>
                            <Settings className="h-8 w-8" style={{ color: currentTheme.colors.primary }} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold gradient-text">Admin Dashboard</h1>
                            <p className="text-gray-400 mt-1">System management and user administration</p>
                        </div>
                    </div>

                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
                                <BarChart3 className="h-5 w-5" style={{ color: currentTheme.colors.primary }} /> System Overview
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
                                    <p className="text-sm" style={{ color: currentTheme.colors.muted }}>{systemStats.activeUsers} active in last 7 days</p>
                                </div>
                                <div className="p-4 rounded-xl" style={{ backgroundColor: currentTheme.colors.surface }}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <Trophy className="h-5 w-5" style={{ color: currentTheme.colors.accent }} />
                                        <span className="font-medium" style={{ color: currentTheme.colors.text }}>Games</span>
                                    </div>
                                    <p className="text-2xl font-bold" style={{ color: currentTheme.colors.text }}>{systemStats.totalGames}</p>
                                    <p className="text-sm" style={{ color: currentTheme.colors.muted }}>Total recorded games</p>
                                </div>
                                <div className="p-4 rounded-xl" style={{ backgroundColor: currentTheme.colors.surface }}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <Database className="h-5 w-5" style={{ color: currentTheme.colors.secondary }} />
                                        <span className="font-medium" style={{ color: currentTheme.colors.text }}>Database</span>
                                    </div>
                                    <p className="text-2xl font-bold" style={{ color: currentTheme.colors.text }}>{systemStats.databaseSize}</p>
                                    <p className="text-sm" style={{ color: currentTheme.colors.muted }}>Last backup: {new Date(systemStats.lastBackup).toLocaleDateString()}</p>
                                </div>
                                <div className="p-4 rounded-xl" style={{ backgroundColor: currentTheme.colors.surface }}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <Shield className="h-5 w-5" style={{ color: systemStats.serverStatus === 'online' ? '#10b981' : '#ef4444' }} />
                                        <span className="font-medium" style={{ color: currentTheme.colors.text }}>Server Status</span>
                                    </div>
                                    <p className="text-2xl font-bold capitalize" style={{ color: systemStats.serverStatus === 'online' ? '#10b981' : systemStats.serverStatus === 'degraded' ? '#f59e0b' : '#ef4444' }}>{systemStats.serverStatus}</p>
                                    <p className="text-sm" style={{ color: currentTheme.colors.muted }}>All systems operational</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                <Button onClick={handleBackupDatabase} disabled={backupInProgress} className="bg-fifa-blue hover:bg-fifa-blue/80">{backupInProgress ? (<><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Simulating Backup...</>) : (<><Download className="h-4 w-4 mr-2" /> Simulate Backup</>)}</Button>
                                <Button onClick={handleRestoreDatabase} disabled={restoreInProgress} variant="outline" className="border-fifa-blue text-fifa-blue hover:bg-fifa-blue/10">{restoreInProgress ? (<><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Simulating Restore...</>) : (<><Upload className="h-4 w-4 mr-2" /> Simulate Restore</>)}</Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
                                <Users className="h-5 w-5" style={{ color: currentTheme.colors.primary }} />
                                User Management
                                <Badge variant="outline" className="ml-2 text-xs">Limited Client-Side Access</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: currentTheme.colors.muted }} />
                                <Input
                                    placeholder="Search users by username or display name..."
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
                                                <th className="px-4 py-3 text-left" style={{ color: currentTheme.colors.text }}>Games</th>
                                                <th className="px-4 py-3 text-left" style={{ color: currentTheme.colors.text }}>Status</th>
                                                <th className="px-4 py-3 text-left" style={{ color: currentTheme.colors.text }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredUsers.map((user) => (
                                                <tr key={user.id} style={{ borderColor: currentTheme.colors.border }}>
                                                    <td className="px-4 py-3">
                                                        <div>
                                                            <p className="font-medium" style={{ color: currentTheme.colors.text }}>{user.display_name || user.username || 'Unknown User'}</p>
                                                            <p className="text-sm" style={{ color: currentTheme.colors.muted }}>@{user.username || 'no-username'}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3" style={{ color: currentTheme.colors.text }}>{new Date(user.created_at).toLocaleDateString()}</td>
                                                    <td className="px-4 py-3" style={{ color: currentTheme.colors.text }}>{user.total_games || 0} ({user.total_wins || 0}W)</td>
                                                    <td className="px-4 py-3"><div className="flex items-center gap-2">{user.is_admin && (<Badge className="bg-fifa-blue text-white">Admin</Badge>)}{user.is_banned ? (<Badge className="bg-fifa-red text-white">Banned</Badge>) : (<Badge className="bg-fifa-green text-white">Active</Badge>)}</div></td>
                                                    <td className="px-4 py-3"><div className="flex items-center gap-2"><Button size="sm" variant="outline" onClick={() => handleEditUser(user)} style={{ borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}><Edit className="h-4 w-4" /></Button><Button size="sm" variant="outline" onClick={() => setDeleteConfirmation(user)} className="border-fifa-red text-fifa-red hover:bg-fifa-red/10"><Trash2 className="h-4 w-4" /></Button></div></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {filteredUsers.length === 0 && (
                                    <div className="text-center py-8"><Users className="h-12 w-12 mx-auto mb-4 opacity-50" style={{ color: currentTheme.colors.muted }} /><p style={{ color: currentTheme.colors.muted }}>No users found matching your search criteria.</p></div>
                                )}
                            </div>
                            <div className="p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/10"><div className="flex items-start gap-3"><AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" /><div><p className="font-medium text-yellow-500 mb-1">Limited Functionality</p><p className="text-sm text-yellow-400">This admin panel has limited functionality due to security restrictions. Full user management (including email access and complete user deletion) requires a secure backend API with service role access.</p></div></div></div>
                        </CardContent>
                    </Card>
                    
                    <Card className="glass-card">
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                <CardTitle className="flex items-center gap-2 mb-4 sm:mb-0" style={{ color: currentTheme.colors.text }}>
                                    <Palette className="h-5 w-5" style={{ color: currentTheme.colors.primary }} />
                                    Card Type Management
                                </CardTitle>
                                <Tabs value={cardManagementGameVersion} onValueChange={(value) => setCardManagementGameVersion(value as 'FC26' | 'FC25')}>
                                    <TabsList>
                                        <TabsTrigger value="FC26">FC26</TabsTrigger>
                                        <TabsTrigger value="FC25">FC25</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>
                        </CardHeader>
                        <CardContent>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-1 space-y-4 p-4 rounded-lg" style={{ backgroundColor: currentTheme.colors.surface }}>
                                    <h3 className="font-semibold text-white">{editingCardType ? 'Edit' : 'Create'} Card Type for {cardManagementGameVersion}</h3>
                                    <Input placeholder="Card Name (e.g., TOTS)" value={editingCardType ? editingCardType.name : newCardType.name || ''} onChange={(e) => editingCardType ? setEditingCardType({...editingCardType, name: e.target.value }) : setNewCardType({ ...newCardType, name: e.target.value })} style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}/>
                                    <div className="flex items-center gap-4"><label className="text-white">Color:</label><Input type="color" value={editingCardType ? editingCardType.color : newCardType.color} onChange={(e) => editingCardType ? setEditingCardType({...editingCardType, color: e.target.value }) : setNewCardType({ ...newCardType, color: e.target.value })} className="w-16 h-8 p-1"/></div>
                                    <div className="flex items-center gap-4"><label className="text-white">Text:</label><Input type="color" value={editingCardType ? editingCardType.text_color : newCardType.text_color} onChange={(e) => editingCardType ? setEditingCardType({...editingCardType, text_color: e.target.value }) : setNewCardType({ ...newCardType, text_color: e.target.value })} className="w-16 h-8 p-1"/></div>
                                    <div className="flex items-center justify-between"><label className="text-white">Is Default?</label><Switch checked={editingCardType ? !!editingCardType.is_default : !!newCardType.is_default} onCheckedChange={(checked) => editingCardType ? setEditingCardType({...editingCardType, is_default: checked }) : setNewCardType({ ...newCardType, is_default: checked })}/></div>
                                    {editingCardType ? (<div className="flex gap-2"><Button onClick={() => setEditingCardType(null)} variant="outline" className="w-full"><X className="h-4 w-4 mr-2"/>Cancel</Button><Button onClick={handleUpdateCardType} className="w-full bg-fifa-blue hover:bg-fifa-blue/80"><Save className="h-4 w-4 mr-2"/>Update</Button></div>) : (<Button onClick={handleSaveCardType} className="w-full bg-fifa-green hover:bg-fifa-green/80"><Plus className="h-4 w-4 mr-2"/>Add Card Type</Button>)}
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    {gameVersionedCardTypes.map(ct => (
                                        <div key={ct.id} className="flex items-center justify-between p-2 rounded-md hover:bg-white/10" style={{ backgroundColor: currentTheme.colors.surface }}>
                                            <div className="flex items-center gap-4"><div className="p-2 rounded-md text-sm font-bold" style={{ backgroundColor: ct.color, color: ct.text_color }}>{ct.name}</div>{ct.is_default && <Badge variant="secondary">Default</Badge>}</div>
                                            <div className="flex items-center gap-2"><Button variant="ghost" size="icon" onClick={() => setEditingCardType(ct)}><Edit className="h-4 w-4 text-gray-400 hover:text-white"/></Button><Button variant="ghost" size="icon" onClick={() => handleDeleteCardType(ct.id)}><Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500"/></Button></div>
                                        </div>
                                    ))}
                                    {gameVersionedCardTypes.length === 0 && (<p className="text-gray-400 text-center py-8">No card types for {cardManagementGameVersion}.</p>)}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-card">
                        <CardHeader><CardTitle className="flex items-center gap-2" style={{ color: currentTheme.colors.text }}><Search className="h-5 w-5" style={{ color: currentTheme.colors.primary }} /> SEO Management</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="block font-medium mb-2" style={{ color: currentTheme.colors.text }}>Site Title</label><Input defaultValue="FUTALYST - AI-Powered FUT Champions Analytics" style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}/></div>
                                <div><label className="block font-medium mb-2" style={{ color: currentTheme.colors.text }}>Meta Description</label><Input defaultValue="Track and analyze your FIFA Champions performance with AI-powered insights and detailed statistics." style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}/></div>
                            </div>
                            <div><label className="block font-medium mb-2" style={{ color: currentTheme.colors.text }}>Meta Keywords</label><Input defaultValue="FIFA, FUT Champions, analytics, stats tracking, football, soccer, EA Sports FC" style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}/></div>
                            <div><label className="block font-medium mb-2" style={{ color: currentTheme.colors.text }}>Open Graph Description</label><Textarea defaultValue="FUTALYST helps you track and analyze your FIFA Champions performance with AI-powered insights, detailed statistics, and personalized recommendations to improve your gameplay." style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}/></div>
                            <Button className="bg-fifa-blue hover:bg-fifa-blue/80"><Save className="h-4 w-4 mr-2" /> Save SEO Settings</Button>
                        </CardContent>
                    </Card>

                    <Card className="glass-card">
                        <CardHeader><CardTitle className="flex items-center gap-2" style={{ color: currentTheme.colors.text }}><Trophy className="h-5 w-5" style={{ color: currentTheme.colors.primary }} /> Achievement Management</CardTitle></CardHeader>
                        <CardContent><div className="space-y-4"><div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: currentTheme.colors.surface }}><div><p className="font-medium" style={{ color: currentTheme.colors.text }}>First Steps</p><p className="text-sm" style={{ color: currentTheme.colors.muted }}>Play your first Champions game</p></div><div className="flex items-center gap-2"><Badge className="bg-fifa-green text-white">Common</Badge><Button size="sm" variant="outline" style={{ borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}><Edit className="h-4 w-4" /></Button></div></div><div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: currentTheme.colors.surface }}><div><p className="font-medium" style={{ color: currentTheme.colors.text }}>Win Streak</p><p className="text-sm" style={{ color: currentTheme.colors.muted }}>Win 5 games in a row</p></div><div className="flex items-center gap-2"><Badge className="bg-fifa-purple text-white">Rare</Badge><Button size="sm" variant="outline" style={{ borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}><Edit className="h-4 w-4" /></Button></div></div><div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: currentTheme.colors.surface }}><div><p className="font-medium" style={{ color: currentTheme.colors.text }}>Perfect Week</p><p className="text-sm" style={{ color: currentTheme.colors.muted }}>Win all 15 games in a week</p></div><div className="flex items-center gap-2"><Badge className="bg-fifa-gold text-white">Legendary</Badge><Button size="sm" variant="outline" style={{ borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}><Edit className="h-4 w-4" /></Button></div></div><Button className="bg-fifa-green hover:bg-fifa-green/80"><Plus className="h-4 w-4 mr-2" /> Create New Achievement</Button></div></CardContent>
                    </Card>

                    {editingUser && (<Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}><DialogContent style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}><DialogHeader><DialogTitle style={{ color: currentTheme.colors.text }}>Edit User</DialogTitle></DialogHeader><div className="space-y-4"><div><label className="block font-medium mb-2" style={{ color: currentTheme.colors.text }}>Username</label><Input value={editingUser.username || ''} onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })} style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}/></div><div><label className="block font-medium mb-2" style={{ color: currentTheme.colors.text }}>Display Name</label><Input value={editingUser.display_name || ''} onChange={(e) => setEditingUser({ ...editingUser, display_name: e.target.value })} style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}/></div><div className="flex items-center justify-between"><div><label className="font-medium" style={{ color: currentTheme.colors.text }}>Admin Status</label><p className="text-sm" style={{ color: currentTheme.colors.muted }}>Grant admin privileges</p></div><Switch checked={editingUser.is_admin || false} onCheckedChange={(checked) => setEditingUser({ ...editingUser, is_admin: checked })}/></div><div className="flex items-center justify-between"><div><label className="font-medium" style={{ color: currentTheme.colors.text }}>Account Status</label><p className="text-sm" style={{ color: currentTheme.colors.muted }}>{editingUser.is_banned ? 'Account is currently banned' : 'Account is active'}</p></div><Button variant="outline" onClick={() => setEditingUser({ ...editingUser, is_banned: !editingUser.is_banned })} className={editingUser.is_banned ? 'border-fifa-green text-fifa-green' : 'border-fifa-red text-fifa-red'}>{editingUser.is_banned ? (<><Unlock className="h-4 w-4 mr-2" />Unban</>) : (<><Lock className="h-4 w-4 mr-2" />Ban</>)}</Button></div><div className="flex gap-3 justify-end"><Button variant="outline" onClick={() => setEditingUser(null)} style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}>Cancel</Button><Button onClick={handleSaveUser} className="bg-fifa-blue hover:bg-fifa-blue/80"><Save className="h-4 w-4 mr-2" />Save Changes</Button></div></div></DialogContent></Dialog>)}
                    <AlertDialog open={!!deleteConfirmation} onOpenChange={() => setDeleteConfirmation(null)}><AlertDialogContent style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}><AlertDialogHeader><AlertDialogTitle style={{ color: currentTheme.colors.text }}>Delete User Profile</AlertDialogTitle><AlertDialogDescription style={{ color: currentTheme.colors.muted }}>Are you sure? This will remove their profile data but not their auth account.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteUser} className="bg-fifa-red hover:bg-fifa-red/80"><Trash2 className="h-4 w-4 mr-2" />Delete Profile</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
                </div>
            </main>
        </div>
    );
};

export default Admin;

