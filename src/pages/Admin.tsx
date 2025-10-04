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
    X,
    Server,
    FileJson,
    BookOpen
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Interfaces
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

interface AchievementDefinition {
    id: string;
    title: string;
    description: string;
    category: string;
    rarity: string;
    secret: boolean;
    game_version: string;
    conditions: any; // JSONB
    created_at?: string;
    updated_at?: string;
}

const defaultAchievementJSON = {
  "id": "unique_achievement_id",
  "title": "Achievement Title",
  "description": "A brief description of what this achievement is for.",
  "category": "wins",
  "rarity": "common",
  "secret": false,
  "game_version": "FC26",
  "conditions": [
    {
      "metric": "total_wins",
      "operator": "gte",
      "value": 10,
      "scope": "all_time"
    }
  ]
};

const Admin = () => {
    const { user } = useAuth();
    const { currentTheme } = useTheme();
    const { toast } = useToast();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    // State for each tab
    const [users, setUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState<User | null>(null);
    
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
    const [backupInProgress, setBackupInProgress] = useState(false);
    const [restoreInProgress, setRestoreInProgress] = useState(false);

    const [cardTypes, setCardTypes] = useState<CardType[]>([]);
    const [newCardType, setNewCardType] = useState<Partial<CardType>>({ name: '', color: '#ffffff', text_color: '#000000', is_default: false });
    const [editingCardType, setEditingCardType] = useState<CardType | null>(null);
    const [cardManagementGameVersion, setCardManagementGameVersion] = useState<'FC26' | 'FC25'>('FC26');

    const [achievements, setAchievements] = useState<AchievementDefinition[]>([]);
    const [editingAchievement, setEditingAchievement] = useState<AchievementDefinition | null>(null);
    const [achievementJson, setAchievementJson] = useState(JSON.stringify(defaultAchievementJSON, null, 2));
    const [isJsonValid, setIsJsonValid] = useState(true);

    useEffect(() => {
        const checkAdmin = async () => {
            if (!user) {
                setLoading(false);
                return;
            };
            try {
                const { data, error } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
                if (error && error.code !== 'PGRST116') throw error; // Ignore if no profile found yet
                
                const adminStatus = data?.is_admin || false;
                setIsAdmin(adminStatus);
                
                if (adminStatus) {
                    await Promise.all([
                        fetchUsers(),
                        fetchSystemStats(),
                        fetchCardTypes(),
                        fetchAchievementDefinitions()
                    ]);
                }
            } catch (error) {
                console.error('Error checking admin status:', error);
                setIsAdmin(false);
            } finally {
                setLoading(false);
            }
        };
        checkAdmin();
    }, [user]);

    const fetchUsers = async () => {
        try {
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
        const { data, error } = await supabase.from('card_types').select('*');
        if (error) toast({ title: 'Error fetching card types', description: error.message, variant: 'destructive' });
        else setCardTypes(data || []);
    };

    const fetchAchievementDefinitions = async () => {
        const { data, error } = await supabase.from('achievement_definitions').select('*');
        if (error) toast({ title: 'Error fetching achievement definitions', description: error.message, variant: 'destructive' });
        else setAchievements(data || []);
    };
    
    const handleUserSearch = (query: string) => setSearchQuery(query);
    const filteredUsers = useMemo(() => users.filter(u => (u.username && u.username.toLowerCase().includes(searchQuery.toLowerCase())) || (u.display_name && u.display_name.toLowerCase().includes(searchQuery.toLowerCase()))), [users, searchQuery]);
    const handleEditUser = (user: User) => setEditingUser(user);
    
    const handleSaveUser = async () => {
        if (!editingUser) return;
        try {
            const { error } = await supabase.from('profiles').update({ username: editingUser.username, display_name: editingUser.display_name, is_admin: editingUser.is_admin, is_banned: editingUser.is_banned }).eq('id', editingUser.id);
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

    const gameVersionedCardTypes = useMemo(() => cardTypes.filter(ct => ct.game_version === cardManagementGameVersion), [cardTypes, cardManagementGameVersion]);

    const handleSaveCardType = async () => {
        if (!newCardType.name) return toast({ title: 'Error', description: 'Card type name is required.', variant: 'destructive' });
        const cardToSave = { ...newCardType, user_id: user?.id, game_version: cardManagementGameVersion };
        const { error } = await supabase.from('card_types').insert([cardToSave]);
        if (error) toast({ title: 'Error saving card type', description: error.message, variant: 'destructive' });
        else {
            toast({ title: 'Success', description: 'New card type added.' });
            setNewCardType({ name: '', color: '#ffffff', text_color: '#000000', is_default: false });
            fetchCardTypes();
        }
    };

    const handleUpdateCardType = async () => {
        if (!editingCardType || !editingCardType.name) return;
        const { error } = await supabase.from('card_types').update(editingCardType).eq('id', editingCardType.id);
        if (error) toast({ title: 'Error updating card type', description: error.message, variant: 'destructive' });
        else {
            toast({ title: 'Success', description: 'Card type updated.' });
            setEditingCardType(null);
            fetchCardTypes();
        }
    };

    const handleDeleteCardType = async (id: string) => {
        const { error } = await supabase.from('card_types').delete().eq('id', id);
        if (error) toast({ title: 'Error deleting card type', description: error.message, variant: 'destructive' });
        else {
            toast({ title: 'Success', description: 'Card type deleted.' });
            fetchCardTypes();
        }
    };

    const handleAchievementJsonChange = (jsonString: string) => {
        setAchievementJson(jsonString);
        try {
            JSON.parse(jsonString);
            setIsJsonValid(true);
        } catch (e) {
            setIsJsonValid(false);
        }
    };

    const handleSelectAchievementToEdit = (achievement: AchievementDefinition) => {
        setEditingAchievement(achievement);
        setAchievementJson(JSON.stringify(achievement, null, 2));
        setIsJsonValid(true);
    };

    const handleSaveAchievement = async () => {
        if (!isJsonValid) return toast({ title: 'Invalid JSON', variant: 'destructive' });
        const achievementData: AchievementDefinition = JSON.parse(achievementJson);
        const { error } = await supabase.from('achievement_definitions').upsert(achievementData);
        if (error) toast({ title: 'Error Saving Achievement', description: error.message, variant: 'destructive' });
        else {
            toast({ title: 'Achievement Saved', description: `"${achievementData.title}" has been saved.` });
            setEditingAchievement(null);
            setAchievementJson(JSON.stringify(defaultAchievementJSON, null, 2));
            fetchAchievementDefinitions();
        }
    };

    const handleDeleteAchievement = async (id: string) => {
        const { error } = await supabase.from('achievement_definitions').delete().eq('id', id);
        if (error) toast({ title: 'Error Deleting Achievement', description: error.message, variant: 'destructive' });
        else {
            toast({ title: 'Achievement Deleted' });
            fetchAchievementDefinitions();
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading Admin Panel...</div>;
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen">
                <Navigation />
                <main className="lg:ml-64 p-4 lg:p-6"><div className="max-w-6xl mx-auto space-y-6"><div className="flex flex-col items-center justify-center py-20"><Shield className="h-20 w-20 text-fifa-red mb-6 opacity-50" /><h3 className="text-2xl font-semibold text-white mb-2">Access Denied</h3><p className="text-gray-400 text-center max-w-md">You do not have permission to access the admin panel.</p></div></div></main>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Navigation />
            <main className="lg:ml-64 p-4 lg:p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 rounded-2xl" style={{ backgroundColor: `${currentTheme.colors.primary}20` }}><Settings className="h-8 w-8" style={{ color: currentTheme.colors.primary }} /></div>
                        <div><h1 className="text-3xl font-bold gradient-text">Admin Dashboard</h1><p className="text-gray-400 mt-1">System management and user administration</p></div>
                    </div>

                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-5">
                            <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-2"/>Overview</TabsTrigger>
                            <TabsTrigger value="users"><Users className="h-4 w-4 mr-2"/>Users</TabsTrigger>
                            <TabsTrigger value="cards"><Palette className="h-4 w-4 mr-2"/>Card Types</TabsTrigger>
                            <TabsTrigger value="achievements"><Trophy className="h-4 w-4 mr-2"/>Achievements</TabsTrigger>
                            <TabsTrigger value="system"><Server className="h-4 w-4 mr-2"/>System</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="overview" className="mt-4">
                            <Card className="glass-card">
                                <CardHeader><CardTitle className="flex items-center gap-2" style={{ color: currentTheme.colors.text }}><BarChart3 className="h-5 w-5" style={{ color: currentTheme.colors.primary }} /> System Overview</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="p-4 rounded-xl" style={{ backgroundColor: currentTheme.colors.surface }}><div className="flex items-center gap-3 mb-2"><Users className="h-5 w-5" style={{ color: currentTheme.colors.primary }} /><span className="font-medium" style={{ color: currentTheme.colors.text }}>Users</span></div><p className="text-2xl font-bold" style={{ color: currentTheme.colors.text }}>{systemStats.totalUsers}</p><p className="text-sm" style={{ color: currentTheme.colors.muted }}>{systemStats.activeUsers} active</p></div>
                                        <div className="p-4 rounded-xl" style={{ backgroundColor: currentTheme.colors.surface }}><div className="flex items-center gap-3 mb-2"><Trophy className="h-5 w-5" style={{ color: currentTheme.colors.accent }} /><span className="font-medium" style={{ color: currentTheme.colors.text }}>Games</span></div><p className="text-2xl font-bold" style={{ color: currentTheme.colors.text }}>{systemStats.totalGames}</p><p className="text-sm" style={{ color: currentTheme.colors.muted }}>Total recorded</p></div>
                                        <div className="p-4 rounded-xl" style={{ backgroundColor: currentTheme.colors.surface }}><div className="flex items-center gap-3 mb-2"><Database className="h-5 w-5" style={{ color: currentTheme.colors.secondary }} /><span className="font-medium" style={{ color: currentTheme.colors.text }}>Database</span></div><p className="text-2xl font-bold" style={{ color: currentTheme.colors.text }}>{systemStats.databaseSize}</p><p className="text-sm" style={{ color: currentTheme.colors.muted }}>Last backup: {new Date(systemStats.lastBackup).toLocaleDateString()}</p></div>
                                        <div className="p-4 rounded-xl" style={{ backgroundColor: currentTheme.colors.surface }}><div className="flex items-center gap-3 mb-2"><Shield className="h-5 w-5" style={{ color: systemStats.serverStatus === 'online' ? '#10b981' : '#ef4444' }} /><span className="font-medium" style={{ color: currentTheme.colors.text }}>Server Status</span></div><p className="text-2xl font-bold capitalize" style={{ color: systemStats.serverStatus === 'online' ? '#10b981' : systemStats.serverStatus === 'degraded' ? '#f59e0b' : '#ef4444' }}>{systemStats.serverStatus}</p><p className="text-sm" style={{ color: currentTheme.colors.muted }}>All systems operational</p></div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="users" className="mt-4">
                            <Card className="glass-card">
                                <CardHeader><CardTitle className="flex items-center gap-2" style={{ color: currentTheme.colors.text }}><Users className="h-5 w-5" style={{ color: currentTheme.colors.primary }} /> User Management <Badge variant="outline" className="ml-2 text-xs">Limited Access</Badge></CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: currentTheme.colors.muted }} /><Input placeholder="Search users..." value={searchQuery} onChange={(e) => handleUserSearch(e.target.value)} className="pl-10" style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}/></div>
                                    <div className="rounded-lg overflow-hidden" style={{ backgroundColor: currentTheme.colors.surface }}><div className="overflow-x-auto"><table className="w-full"><thead><tr style={{ borderColor: currentTheme.colors.border }}><th className="px-4 py-3 text-left" style={{ color: currentTheme.colors.text }}>User</th><th className="px-4 py-3 text-left" style={{ color: currentTheme.colors.text }}>Created</th><th className="px-4 py-3 text-left" style={{ color: currentTheme.colors.text }}>Games</th><th className="px-4 py-3 text-left" style={{ color: currentTheme.colors.text }}>Status</th><th className="px-4 py-3 text-left" style={{ color: currentTheme.colors.text }}>Actions</th></tr></thead><tbody>{filteredUsers.map((u) => (<tr key={u.id} style={{ borderColor: currentTheme.colors.border }}><td className="px-4 py-3"><div><p className="font-medium" style={{ color: currentTheme.colors.text }}>{u.display_name || u.username || 'N/A'}</p><p className="text-sm" style={{ color: currentTheme.colors.muted }}>@{u.username || 'N/A'}</p></div></td><td className="px-4 py-3" style={{ color: currentTheme.colors.text }}>{new Date(u.created_at).toLocaleDateString()}</td><td className="px-4 py-3" style={{ color: currentTheme.colors.text }}>{u.total_games || 0} ({u.total_wins || 0}W)</td><td className="px-4 py-3"><div className="flex items-center gap-2">{u.is_admin && (<Badge className="bg-fifa-blue text-white">Admin</Badge>)}{u.is_banned ? (<Badge className="bg-fifa-red text-white">Banned</Badge>) : (<Badge className="bg-fifa-green text-white">Active</Badge>)}</div></td><td className="px-4 py-3"><div className="flex items-center gap-2"><Button size="sm" variant="outline" onClick={() => handleEditUser(u)} style={{ borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}><Edit className="h-4 w-4" /></Button><Button size="sm" variant="outline" onClick={() => setDeleteConfirmation(u)} className="border-fifa-red text-fifa-red hover:bg-fifa-red/10"><Trash2 className="h-4 w-4" /></Button></div></td></tr>))}</tbody></table></div>{filteredUsers.length === 0 && (<div className="text-center py-8"><Users className="h-12 w-12 mx-auto mb-4 opacity-50" style={{ color: currentTheme.colors.muted }} /><p style={{ color: currentTheme.colors.muted }}>No users found.</p></div>)}</div>
                                    <div className="p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/10"><div className="flex items-start gap-3"><AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" /><div><p className="font-medium text-yellow-500 mb-1">Limited Functionality</p><p className="text-sm text-yellow-400">Full user management requires a secure backend API.</p></div></div></div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="cards" className="mt-4">
                            <Card className="glass-card">
                                <CardHeader><CardTitle className="flex items-center gap-2" style={{ color: currentTheme.colors.text }}><Palette className="h-5 w-5" style={{ color: currentTheme.colors.primary }} /> Card Type Management</CardTitle></CardHeader>
                                <CardContent>
                                    <Tabs value={cardManagementGameVersion} onValueChange={(value) => setCardManagementGameVersion(value as 'FC26' | 'FC25')}><TabsList className="mb-4"><TabsTrigger value="FC26">FC26</TabsTrigger><TabsTrigger value="FC25">FC25</TabsTrigger></TabsList></Tabs>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="md:col-span-1 space-y-4 p-4 rounded-lg" style={{ backgroundColor: currentTheme.colors.surface }}>
                                            <h3 className="font-semibold text-white">{editingCardType ? 'Edit' : 'Create'} Card Type for {cardManagementGameVersion}</h3>
                                            <Input placeholder="Card Name" value={editingCardType ? editingCardType.name : newCardType.name || ''} onChange={(e) => editingCardType ? setEditingCardType({...editingCardType, name: e.target.value }) : setNewCardType({ ...newCardType, name: e.target.value })} style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}/>
                                            <div className="flex items-center gap-4"><label className="text-white">Color:</label><Input type="color" value={editingCardType ? editingCardType.color : newCardType.color} onChange={(e) => editingCardType ? setEditingCardType({...editingCardType, color: e.target.value }) : setNewCardType({ ...newCardType, color: e.target.value })} className="w-16 h-8 p-1"/></div>
                                            <div className="flex items-center gap-4"><label className="text-white">Text:</label><Input type="color" value={editingCardType ? editingCardType.text_color : newCardType.text_color} onChange={(e) => editingCardType ? setEditingCardType({...editingCardType, text_color: e.target.value }) : setNewCardType({ ...newCardType, text_color: e.target.value })} className="w-16 h-8 p-1"/></div>
                                            <div className="flex items-center justify-between"><label className="text-white">Is Default?</label><Switch checked={editingCardType ? !!editingCardType.is_default : !!newCardType.is_default} onCheckedChange={(checked) => editingCardType ? setEditingCardType({...editingCardType, is_default: checked }) : setNewCardType({ ...newCardType, is_default: checked })}/></div>
                                            {editingCardType ? (<div className="flex gap-2"><Button onClick={() => setEditingCardType(null)} variant="outline" className="w-full"><X className="h-4 w-4 mr-2"/>Cancel</Button><Button onClick={handleUpdateCardType} className="w-full bg-fifa-blue hover:bg-fifa-blue/80"><Save className="h-4 w-4 mr-2"/>Update</Button></div>) : (<Button onClick={handleSaveCardType} className="w-full bg-fifa-green hover:bg-fifa-green/80"><Plus className="h-4 w-4 mr-2"/>Add</Button>)}
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            {gameVersionedCardTypes.map(ct => (<div key={ct.id} className="flex items-center justify-between p-2 rounded-md hover:bg-white/10" style={{ backgroundColor: currentTheme.colors.surface }}><div className="flex items-center gap-4"><div className="p-2 rounded-md text-sm font-bold" style={{ backgroundColor: ct.color, color: ct.text_color }}>{ct.name}</div>{ct.is_default && <Badge variant="secondary">Default</Badge>}</div><div className="flex items-center gap-2"><Button variant="ghost" size="icon" onClick={() => setEditingCardType(ct)}><Edit className="h-4 w-4 text-gray-400 hover:text-white"/></Button><Button variant="ghost" size="icon" onClick={() => handleDeleteCardType(ct.id)}><Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500"/></Button></div></div>))}
                                            {gameVersionedCardTypes.length === 0 && (<p className="text-gray-400 text-center py-8">No card types for {cardManagementGameVersion}.</p>)}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="achievements" className="mt-4">
                            <Card className="glass-card">
                                <CardHeader><CardTitle className="flex items-center gap-2" style={{ color: currentTheme.colors.text }}><Trophy className="h-5 w-5" style={{ color: currentTheme.colors.primary }} /> Achievement Management</CardTitle></CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="font-semibold text-white mb-2">Achievement Definitions</h3>
                                        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">{achievements.map(ach => (<div key={ach.id} className="flex items-center justify-between p-2 rounded-md hover:bg-white/10" style={{ backgroundColor: currentTheme.colors.surface }}><div><p className="font-medium text-white">{ach.title} <span className="text-xs text-gray-400">({ach.game_version})</span></p><p className="text-sm text-gray-400">{ach.description}</p></div><div className="flex items-center gap-2"><Button variant="ghost" size="icon" onClick={() => handleSelectAchievementToEdit(ach)}><Edit className="h-4 w-4 text-gray-400 hover:text-white"/></Button><Button variant="ghost" size="icon" onClick={() => handleDeleteAchievement(ach.id)}><Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500"/></Button></div></div>))}</div>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-white flex items-center gap-2"><FileJson className="h-5 w-5" /> {editingAchievement ? 'Edit Achievement' : 'Create New Achievement'}</h3>
                                        <Textarea value={achievementJson} onChange={(e) => handleAchievementJsonChange(e.target.value)} rows={20} className={`font-mono text-sm ${!isJsonValid ? 'border-red-500' : ''}`} style={{ backgroundColor: currentTheme.colors.surface, color: currentTheme.colors.text }}/>
                                        {!isJsonValid && <p className="text-red-500 text-sm">Invalid JSON format.</p>}
                                        <div className="flex gap-2"><Button onClick={() => { setEditingAchievement(null); setAchievementJson(JSON.stringify(defaultAchievementJSON, null, 2)); }} variant="outline" className="w-full"><Plus className="h-4 w-4 mr-2"/> New</Button><Button onClick={handleSaveAchievement} disabled={!isJsonValid} className="w-full bg-fifa-blue hover:bg-fifa-blue/80"><Save className="h-4 w-4 mr-2" />{editingAchievement ? 'Update' : 'Save'}</Button></div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="system" className="mt-4">
                            <Card className="glass-card">
                                <CardHeader><CardTitle className="flex items-center gap-2" style={{ color: currentTheme.colors.text }}><Server className="h-5 w-5" style={{ color: currentTheme.colors.primary }} /> System & Data</CardTitle></CardHeader>
                                <CardContent>
                                     <div className="p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/10 mb-6"><div className="flex items-start gap-3"><AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" /><div><p className="font-medium text-yellow-500 mb-1">High-Risk Actions</p><p className="text-sm text-yellow-400">Database operations are simulated and require a secure backend implementation.</p></div></div></div>
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                        <Button onClick={handleBackupDatabase} disabled={backupInProgress} className="bg-fifa-blue hover:bg-fifa-blue/80">{backupInProgress ? (<><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Simulating...</>) : (<><Download className="h-4 w-4 mr-2" /> Simulate Backup</>)}</Button>
                                        <Button onClick={handleRestoreDatabase} disabled={restoreInProgress} variant="outline" className="border-fifa-blue text-fifa-blue hover:bg-fifa-blue/10">{restoreInProgress ? (<><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Simulating...</>) : (<><Upload className="h-4 w-4 mr-2" /> Simulate Restore</>)}</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {editingUser && (<Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}><DialogContent style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}><DialogHeader><DialogTitle style={{ color: currentTheme.colors.text }}>Edit User</DialogTitle></DialogHeader><div className="space-y-4"><div><label className="block font-medium mb-2" style={{ color: currentTheme.colors.text }}>Username</label><Input value={editingUser.username || ''} onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })} style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}/></div><div><label className="block font-medium mb-2" style={{ color: currentTheme.colors.text }}>Display Name</label><Input value={editingUser.display_name || ''} onChange={(e) => setEditingUser({ ...editingUser, display_name: e.target.value })} style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}/></div><div className="flex items-center justify-between"><div><label className="font-medium" style={{ color: currentTheme.colors.text }}>Admin Status</label><p className="text-sm" style={{ color: currentTheme.colors.muted }}>Grant admin privileges</p></div><Switch checked={editingUser.is_admin || false} onCheckedChange={(checked) => setEditingUser({ ...editingUser, is_admin: checked })}/></div><div className="flex items-center justify-between"><div><label className="font-medium" style={{ color: currentTheme.colors.text }}>Account Status</label><p className="text-sm" style={{ color: currentTheme.colors.muted }}>{editingUser.is_banned ? 'Banned' : 'Active'}</p></div><Button variant="outline" onClick={() => setEditingUser({ ...editingUser, is_banned: !editingUser.is_banned })} className={editingUser.is_banned ? 'border-fifa-green text-fifa-green' : 'border-fifa-red text-fifa-red'}>{editingUser.is_banned ? (<><Unlock className="h-4 w-4 mr-2" />Unban</>) : (<><Lock className="h-4 w-4 mr-2" />Ban</>)}</Button></div><div className="flex gap-3 justify-end"><Button variant="outline" onClick={() => setEditingUser(null)} style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}>Cancel</Button><Button onClick={handleSaveUser} className="bg-fifa-blue hover:bg-fifa-blue/80"><Save className="h-4 w-4 mr-2" />Save</Button></div></div></DialogContent></Dialog>)}
                    <AlertDialog open={!!deleteConfirmation} onOpenChange={() => setDeleteConfirmation(null)}><AlertDialogContent style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}><AlertDialogHeader><AlertDialogTitle style={{ color: currentTheme.colors.text }}>Delete User Profile</AlertDialogTitle><AlertDialogDescription style={{ color: currentTheme.colors.muted }}>Are you sure? This removes their profile data but not their auth account.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteUser} className="bg-fifa-red hover:bg-fifa-red/80"><Trash2 className="h-4 w-4 mr-2" />Delete Profile</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
                </div>
            </main>
        </div>
    );
};

export default Admin;

