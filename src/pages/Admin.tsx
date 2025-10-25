import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'; // Corrected Import
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Users, BarChart, Bug, ShieldCheck, Paintbrush, Award, Search, Edit, Trash2, Save, Lock, Unlock, RefreshCw, Plus, X, Database, Trophy, Download, Upload, Shield } from "lucide-react";
import Navigation from '@/components/Navigation';
import { CardType as CustomCardTypeFromSquads } from '@/types/squads';
import { useGameVersion } from '@/contexts/GameVersionContext';
import { useTheme } from '@/hooks/useTheme'; // Import useTheme

// --- TYPE DEFINITIONS ---
interface UserProfile {
  id: string;
  username?: string;
  display_name?: string;
  created_at: string;
  is_admin?: boolean;
  is_banned?: boolean;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  criteria: Record<string, any>;
}

// --- USER MANAGEMENT COMPONENT ---
const UserManagement = () => {
  const { toast } = useToast();
  const { currentTheme } = useTheme();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<UserProfile | null>(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) toast({ title: 'Error fetching users', description: error.message, variant: 'destructive' });
    else setUsers(data || []);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    const { error } = await supabase.from('profiles').update({ username: editingUser.username, display_name: editingUser.display_name, is_admin: editingUser.is_admin, is_banned: editingUser.is_banned }).eq('id', editingUser.id);
    if (error) toast({ title: 'Error updating user', description: error.message, variant: 'destructive' });
    else {
      toast({ title: 'User Updated', description: 'User information has been updated.' });
      setEditingUser(null);
      fetchUsers();
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirmation) return;
    const { error } = await supabase.from('profiles').delete().eq('id', deleteConfirmation.id);
    if (error) toast({ title: 'Error deleting user', description: error.message, variant: 'destructive' });
    else {
      toast({ title: 'User Deleted', description: 'User profile has been removed.' });
      setDeleteConfirmation(null);
      fetchUsers();
    }
  };
  
  const filteredUsers = users.filter(user => (user.username?.toLowerCase().includes(searchQuery.toLowerCase())) || (user.display_name?.toLowerCase().includes(searchQuery.toLowerCase())));

  return (
    <>
      <Card className="glass-card rounded-2xl shadow-2xl border-0">
        <CardHeader><CardTitle>User Management</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search users..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="pl-10 glass-card"
              style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border }}
            />
          </div>
          <div className="rounded-lg border border-white/10 overflow-hidden"><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-white/10"><th className="px-4 py-3 text-left text-gray-400">User</th><th className="px-4 py-3 text-left text-gray-400">Created</th><th className="px-4 py-3 text-left text-gray-400">Status</th><th className="px-4 py-3 text-left text-gray-400">Actions</th></tr></thead><tbody>
            {filteredUsers.map((user) => (<tr key={user.id} className="border-b border-white/10"><td className="px-4 py-3"><p className="font-medium text-white">{user.display_name || user.username}</p><p className="text-sm text-gray-400">@{user.username}</p></td><td className="px-4 py-3 text-white">{new Date(user.created_at).toLocaleDateString()}</td><td className="px-4 py-3"><div className="flex items-center gap-2">{user.is_admin && <Badge>Admin</Badge>}{user.is_banned ? <Badge variant="destructive">Banned</Badge> : <Badge variant="secondary">Active</Badge>}</div></td><td className="px-4 py-3"><div className="flex items-center gap-2"><Button size="sm" variant="outline" onClick={() => setEditingUser(user)}><Edit className="h-4 w-4" /></Button><Button size="sm" variant="destructive" onClick={() => setDeleteConfirmation(user)}><Trash2 className="h-4 w-4" /></Button></div></td></tr>))}
          </tbody></table></div></div>
        </CardContent>
      </Card>
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="glass-card rounded-2xl shadow-2xl border-0">
          <DialogHeader><DialogTitle>Edit User</DialogTitle></DialogHeader>
          {editingUser && (<div className="space-y-4 py-4">
            <div><Label>Username</Label><Input value={editingUser.username || ''} onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })} style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border }} /></div>
            <div><Label>Display Name</Label><Input value={editingUser.display_name || ''} onChange={(e) => setEditingUser({ ...editingUser, display_name: e.target.value })} style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border }} /></div>
            <div className="flex items-center justify-between"><div className="space-y-1"><Label>Admin Status</Label><p className="text-sm text-gray-400">Grant admin privileges</p></div><Switch checked={editingUser.is_admin} onCheckedChange={(checked) => setEditingUser({ ...editingUser, is_admin: checked })} /></div>
            <div className="flex items-center justify-between"><div className="space-y-1"><Label>Account Status</Label><p className="text-sm text-gray-400">{editingUser.is_banned ? 'Banned' : 'Active'}</p></div><Button variant="outline" onClick={() => setEditingUser({ ...editingUser, is_banned: !editingUser.is_banned })} className={editingUser.is_banned ? 'text-green-600 border-green-600' : 'text-red-600 border-red-600'}>{editingUser.is_banned ? (<><Unlock className="h-4 w-4 mr-2" />Unban</>) : (<><Lock className="h-4 w-4 mr-2" />Ban</>)}</Button></div>
            <div className="flex gap-3 justify-end pt-4"><Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button><Button onClick={handleSaveUser}><Save className="h-4 w-4 mr-2" />Save</Button></div>
          </div>)}
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!deleteConfirmation} onOpenChange={() => setDeleteConfirmation(null)}>
        <AlertDialogContent className="glass-card rounded-2xl shadow-2xl border-0">
          <AlertDialogHeader><AlertDialogTitle>Delete User?</AlertDialogTitle><AlertDialogDescription>This will delete the user's profile data. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// --- SYSTEM STATUS COMPONENT ---
const SystemStatus = () => {
    const [stats, setStats] = useState({ totalUsers: 0, totalGames: 0, serverStatus: 'online' });
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const fetchStats = async () => {
        setLoading(true);
        try {
            const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
            const { count: gameCount } = await supabase.from('game_results').select('*', { count: 'exact', head: true });
            setStats(prev => ({ ...prev, totalUsers: userCount || 0, totalGames: gameCount || 0, serverStatus: 'online' }));
        } catch (error) {
            setStats(prev => ({ ...prev, serverStatus: 'degraded' }));
            toast({ title: "Error", description: "Could not fetch system stats.", variant: "destructive" });
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchStats(); }, []);

    return (
        <Card className="glass-card rounded-2xl shadow-2xl border-0">
            <CardHeader className='flex-row items-center justify-between'><CardTitle>System Status</CardTitle><Button variant="ghost" size="icon" onClick={fetchStats} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></Button></CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard icon={Users} title="Total Users" value={stats.totalUsers} />
                    <StatCard icon={Trophy} title="Total Games" value={stats.totalGames} />
                    <StatCard icon={Shield} title="Server Status" value={stats.serverStatus} isStatus={true} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Button disabled><Download className="h-4 w-4 mr-2" /> Simulate Backup</Button><Button variant="outline" disabled><Upload className="h-4 w-4 mr-2" /> Simulate Restore</Button></div>
            </CardContent>
        </Card>
    );
};

const StatCard = ({ icon: Icon, title, value, isStatus }: { icon: React.ElementType, title: string, value: string | number, isStatus?: boolean }) => {
    const { currentTheme } = useTheme();
    return (
        <div className="p-4 bg-white/5 rounded-xl">
            <div className="flex items-center gap-3 mb-2"><Icon className={`h-5 w-5 ${isStatus && value === 'online' ? 'text-green-500' : 'text-primary'}`} style={{ color: isStatus && value === 'online' ? 'text-green-500' : currentTheme.colors.primary }} /><span className="font-medium text-white">{title}</span></div>
            <p className={`text-2xl font-bold capitalize ${isStatus && value === 'online' ? 'text-green-500' : 'text-white'}`}>{value}</p>
        </div>
    );
};


// --- CARD TYPE CREATOR COMPONENT (with 3 colors) ---
const CardTypeCreator = () => {
    const { user } = useAuth();
    const { gameVersion } = useGameVersion();
    const { toast } = useToast();
    const { currentTheme } = useTheme();
    const [cardTypes, setCardTypes] = useState<CustomCardTypeFromSquads[]>([]);
    const [newCardType, setNewCardType] = useState({ name: '', primary_color: '#4B0082', secondary_color: '#FFD700', highlight_color: '#FFFFFF' });
    const [editingCardType, setEditingCardType] = useState<CustomCardTypeFromSquads | null>(null);
    const CardPreview = ({ name, primaryColor, secondaryColor, highlightColor }: { name: string, primaryColor: string, secondaryColor: string, highlightColor: string }) => (
        <div className="w-full max-w-[220px] aspect-[3/4] p-2 rounded-xl shadow-lg mx-auto" style={{ background: `linear-gradient(135deg, ${primaryColor} 50%, ${secondaryColor} 50%)` }}>
            <div className="w-full h-full border-2 border-white/20 rounded-lg flex flex-col justify-between items-center text-center p-2" style={{ color: highlightColor }}>
                <div className='w-full'><div className="font-bold text-2xl leading-none">99</div><div className="font-semibold text-lg leading-none">ST</div><div className="h-4 w-6 bg-gray-400/50 rounded-sm mt-1 mx-auto border border-white/20" title="Nation Flag Placeholder"></div></div>
                <div className="w-full font-bold text-xl uppercase tracking-tighter leading-tight break-words">{name || "Player Name"}</div>
                <div className="w-full grid grid-cols-2 gap-x-2 gap-y-1 text-xs font-bold"><span>99 PAC</span><span>99 SHO</span><span>99 PAS</span><span>99 DRI</span><span>99 DEF</span><span>99 PHY</span></div>
            </div>
        </div>
    );
    const fetchCardTypes = async () => {
        if (!user) return;
        const { data, error } = await supabase.from('card_types').select('*').eq('user_id', user.id).eq('game_version', gameVersion);
        if (error) console.error("Error fetching card types", error);
        else setCardTypes(data || []);
    };
    useEffect(() => { fetchCardTypes(); }, [user, gameVersion]);
    const handleSave = async () => {
        if (!user || !newCardType.name) { toast({ title: "Name is required.", variant: 'destructive' }); return; }
        const { error } = await supabase.from('card_types').insert({ ...newCardType, id: `${gameVersion}-${newCardType.name.toLowerCase().replace(/\s+/g, '-')}`, user_id: user.id, game_version: gameVersion });
        if (error) toast({ title: "Error saving card type", description: error.message, variant: 'destructive' });
        else {
            toast({ title: "Card Type Saved!", description: `${newCardType.name} has been added.` });
            setNewCardType({ name: '', primary_color: '#4B0082', secondary_color: '#FFD700', highlight_color: '#FFFFFF' });
            fetchCardTypes();
        }
    };
    const handleDelete = async (id: string) => {
        const { error } = await supabase.from('card_types').delete().eq('id', id);
        if (error) toast({ title: "Error deleting card type", description: error.message, variant: 'destructive' });
        else { toast({ title: "Card Type Deleted" }); fetchCardTypes(); }
    };
    const handleUpdate = async () => {
        if (!editingCardType) return;
        const { error } = await supabase.from('card_types').update({ name: editingCardType.name, primary_color: editingCardType.primary_color, secondary_color: editingCardType.secondary_color, highlight_color: editingCardType.highlight_color }).eq('id', editingCardType.id);
        if (error) toast({ title: "Error updating card type", description: error.message, variant: 'destructive' });
        else {
            toast({ title: "Card Type Updated!", description: `${editingCardType.name} has been updated.` });
            setEditingCardType(null);
            fetchCardTypes();
        }
    };
    return (
        <Card className="glass-card rounded-2xl shadow-2xl border-0">
            <CardHeader><CardTitle>Card Type Creator</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h3 className="font-semibold text-white">Create New Card Type</h3>
                    <div className="space-y-2"><Label htmlFor="card-name">Card Name</Label><Input id="card-name" placeholder="e.g., Team of the Season" value={newCardType.name} onChange={(e) => setNewCardType({ ...newCardType, name: e.target.value })} style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border }}/></div>
                    <div className="grid grid-cols-3 gap-4"><div className="space-y-2"><Label htmlFor="primary-color">Primary</Label><Input id="primary-color" type="color" value={newCardType.primary_color} onChange={(e) => setNewCardType({ ...newCardType, primary_color: e.target.value })} /></div><div className="space-y-2"><Label htmlFor="secondary-color">Secondary</Label><Input id="secondary-color" type="color" value={newCardType.secondary_color} onChange={(e) => setNewCardType({ ...newCardType, secondary_color: e.target.value })} /></div><div className="space-y-2"><Label htmlFor="highlight-color">Highlights</Label><Input id="highlight-color" type="color" value={newCardType.highlight_color} onChange={(e) => setNewCardType({ ...newCardType, highlight_color: e.target.value })} /></div></div>
                    <div className="pt-4"><h4 className="font-semibold text-sm mb-2 text-white">Live Preview:</h4><CardPreview name={newCardType.name} primaryColor={newCardType.primary_color} secondaryColor={newCardType.secondary_color} highlightColor={newCardType.highlight_color} /></div>
                    <Button onClick={handleSave} style={{ backgroundColor: currentTheme.colors.primary, color: currentTheme.colors.primaryText }}><Plus className="h-4 w-4 mr-2" />Save New Card Type</Button>
                </div>
                <div className="space-y-4"><h3 className="font-semibold text-white">Existing Card Types ({gameVersion})</h3><div className="space-y-2 max-h-96 overflow-y-auto pr-2">{cardTypes.map(card => (<div key={card.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg"><div className="flex items-center gap-3"><div className="w-5 h-5 rounded-full border border-border" style={{background: `linear-gradient(135deg, ${card.primary_color} 50%, ${card.secondary_color} 50%)`}}></div><span className="font-medium text-white">{card.name}</span></div><div className="flex items-center gap-2"><Dialog><DialogTrigger asChild><Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setEditingCardType(card)}><Edit className="h-4 w-4" /></Button></DialogTrigger><DialogContent className="glass-card rounded-2xl shadow-2xl border-0"><DialogHeader><DialogTitle>Edit Card Type</DialogTitle></DialogHeader>{editingCardType && editingCardType.id === card.id && (<div className="space-y-4 pt-4"><div className="space-y-2"><Label htmlFor="edit-card-name">Card Name</Label><Input id="edit-card-name" value={editingCardType.name} onChange={(e) => setEditingCardType({ ...editingCardType, name: e.target.value })} style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border }}/></div><div className="grid grid-cols-3 gap-4"><div className="space-y-2"><Label htmlFor="edit-primary-color">Primary</Label><Input id="edit-primary-color" type="color" value={editingCardType.primary_color} onChange={(e) => setEditingCardType({ ...editingCardType, primary_color: e.target.value })} /></div><div className="space-y-2"><Label htmlFor="edit-secondary-color">Secondary</Label><Input id="edit-secondary-color" type="color" value={editingCardType.secondary_color} onChange={(e) => setEditingCardType({ ...editingCardType, secondary_color: e.target.value })} /></div><div className="space-y-2"><Label htmlFor="edit-highlight-color">Highlights</Label><Input id="edit-highlight-color" type="color" value={editingCardType.highlight_color} onChange={(e) => setEditingCardType({ ...editingCardType, highlight_color: e.target.value })} /></div></div><div className="pt-4"><h4 className="font-semibold text-sm mb-2 text-white">Live Preview:</h4><CardPreview name={editingCardType.name} primaryColor={editingCardType.primary_color} secondaryColor={editingCardType.secondary_color} highlightColor={editingCardType.highlight_color} /></div><Button onClick={handleUpdate} style={{ backgroundColor: currentTheme.colors.primary, color: currentTheme.colors.primaryText }}>Save Changes</Button></div>)}</DialogContent></Dialog><Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => handleDelete(card.id)}><Trash2 className="h-4 w-4" /></Button></div></div>))}</div></div>
            </CardContent>
        </Card>
    );
};

// --- ACHIEVEMENT CREATOR COMPONENT ---
const AchievementCreator = () => {
    const { toast } = useToast();
    const { currentTheme } = useTheme();
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  
    useEffect(() => { fetchAchievements(); }, []);
  
    const fetchAchievements = async () => {
      const { data, error } = await supabase.from('achievements').select('*');
      if (error) toast({ title: 'Error fetching achievements', description: error.message, variant: 'destructive' });
      else setAchievements(data || []);
    };
  
    const handleSave = async () => {
      if (!editingAchievement?.name) { toast({ title: "Name is required", variant: "destructive" }); return; }
      try { if (typeof editingAchievement.criteria !== 'object') JSON.parse(editingAchievement.criteria as any); }
      catch(e) { toast({ title: "Invalid JSON", description: "The criteria field must contain valid JSON.", variant: "destructive"}); return; }
  
      const achievementToSave = { ...editingAchievement, criteria: typeof editingAchievement.criteria === 'string' ? JSON.parse(editingAchievement.criteria) : editingAchievement.criteria };
  
      const { error } = editingAchievement.id.startsWith('new-')
        ? await supabase.from('achievements').insert(achievementToSave)
        : await supabase.from('achievements').update(achievementToSave).eq('id', achievementToSave.id);
  
      if (error) toast({ title: 'Error saving achievement', description: error.message, variant: 'destructive' });
      else { toast({ title: 'Achievement Saved', description: `${achievementToSave.name} has been saved.` }); setEditingAchievement(null); fetchAchievements(); }
    };
  
    const handleDelete = async (id: string) => {
      const { error } = await supabase.from('achievements').delete().eq('id', id);
      if (error) toast({ title: 'Error deleting achievement', description: error.message, variant: 'destructive' });
      else { toast({ title: 'Achievement Deleted' }); fetchAchievements(); }
    };
  
    const startNew = () => setEditingAchievement({ id: `new-${Date.now()}`, name: '', description: '', tier: 'bronze', criteria: {} });
  
    return (
      <Card className="glass-card rounded-2xl shadow-2xl border-0">
        <CardHeader className="flex-row items-center justify-between"><CardTitle>Achievement Management</CardTitle><Button onClick={startNew} style={{ backgroundColor: currentTheme.colors.primary, color: currentTheme.colors.primaryText }}><Plus className="h-4 w-4 mr-2" /> Create New</Button></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4 p-4 rounded-lg bg-white/5">{editingAchievement ? (<><h3 className="font-semibold text-white">{editingAchievement.id.startsWith('new-') ? 'Create' : 'Edit'} Achievement</h3><Input placeholder="Achievement Name" value={editingAchievement.name} onChange={(e) => setEditingAchievement({...editingAchievement, name: e.target.value })} style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border }}/><Textarea placeholder="Description" value={editingAchievement.description} onChange={(e) => setEditingAchievement({...editingAchievement, description: e.target.value })} style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border }}/><Select value={editingAchievement.tier} onValueChange={(value: Achievement['tier']) => setEditingAchievement({...editingAchievement, tier: value })}><SelectTrigger style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border }}><SelectValue/></SelectTrigger><SelectContent><SelectItem value="bronze">Bronze</SelectItem><SelectItem value="silver">Silver</SelectItem><SelectItem value="gold">Gold</SelectItem><SelectItem value="platinum">Platinum</SelectItem></SelectContent></Select><div><Label>Criteria (JSON)</Label><Textarea placeholder='{ "stat": "wins", "value": 10 }' value={JSON.stringify(editingAchievement.criteria, null, 2)} onChange={(e) => setEditingAchievement({...editingAchievement, criteria: e.target.value as any })} className="font-mono h-32" style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border }}/></div><div className="flex gap-2"><Button onClick={() => setEditingAchievement(null)} variant="outline" className="w-full"><X className="h-4 w-4 mr-2"/>Cancel</Button><Button onClick={handleSave} className="w-full" style={{ backgroundColor: currentTheme.colors.primary, color: currentTheme.colors.primaryText }}><Save className="h-4 w-4 mr-2"/>Save</Button></div></>) : <p className="text-gray-400 text-center py-10">Select or create an achievement.</p> }</div>
          <div className="md:col-span-2 space-y-2">{achievements.map(ach => (<div key={ach.id} className="flex items-center justify-between p-2 rounded-md hover:bg-white/10"><div className="flex items-center gap-4"><Badge variant={ach.tier === 'gold' || ach.tier === 'platinum' ? 'default' : 'secondary'}>{ach.tier}</Badge><div><p className="font-medium text-white">{ach.name}</p><p className="text-sm text-gray-400">{ach.description}</p></div></div><div className="flex items-center gap-2"><Button variant="ghost" size="icon" onClick={() => setEditingAchievement(ach)}><Edit className="h-4 w-4"/></Button><Button variant="ghost" size="icon" onClick={() => handleDelete(ach.id)}><Trash2 className="h-4 w-4 text-red-500"/></Button></div></div>))}</div>
        </CardContent>
      </Card>
    );
};

// --- PLACEHOLDER COMPONENTS ---
const SiteAnalytics = () => <Card className="glass-card rounded-2xl shadow-2xl border-0"><CardHeader><CardTitle>Site Analytics</CardTitle></CardHeader><CardContent><p className="text-gray-400">Overview of site usage and key metrics.</p></CardContent></Card>;
const BugReports = () => <Card className="glass-card rounded-2xl shadow-2xl border-0"><CardHeader><CardTitle>Bug Reports</CardTitle></CardHeader><CardContent><p className="text-gray-400">Review and manage user-submitted bug reports.</p></CardContent></Card>;

// --- MAIN ADMIN PAGE ---
const Admin = () => {
    const { user } = useAuth();
    const { currentTheme } = useTheme();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAdminStatus = async () => {
            if (!user) { setLoading(false); return; }
            const { data, error } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
            if (error) console.error("Error checking admin status:", error);
            setIsAdmin(data?.is_admin || false);
            setLoading(false);
        };
        checkAdminStatus();
    }, [user]);

    if(loading) return <div className="flex items-center justify-center h-screen"><RefreshCw className="h-8 w-8 animate-spin" style={{ color: currentTheme.colors.primary }}/></div>;
    if(!isAdmin) return (<div className="min-h-screen"><Navigation /><main className="lg:ml-64 p-4 lg:p-6 flex items-center justify-center h-full"><div className="text-center"><ShieldCheck className="h-16 w-16 mx-auto mb-4 text-red-500" /><h2 className="text-2xl font-bold text-white">Access Denied</h2><p className="text-gray-400">You do not have permission to view this page.</p></div></main></div>);
    
  return (
    <div className="min-h-screen">
        <Navigation />
        <main className="lg:ml-64 p-4 lg:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl" style={{ backgroundColor: `${currentTheme.colors.primary}20` }}>
                      <ShieldCheck className="h-8 w-8" style={{ color: currentTheme.colors.primary }} />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-white">
                        Admin Panel
                      </h1>
                      <p className="text-gray-400 mt-1">Site-wide management and analytics.</p>
                    </div>
                </div>
                <Tabs defaultValue="users" className="w-full">
                    <div className="overflow-x-auto pb-2">
                        <TabsList className="glass-card rounded-2xl shadow-xl border-0 p-2 h-auto inline-flex w-max">
                            <TabsTrigger value="users" className="rounded-xl"><Users className="h-4 w-4 mr-2" />User Management</TabsTrigger>
                            <TabsTrigger value="status" className="rounded-xl"><ShieldCheck className="h-4 w-4 mr-2" />System Status</TabsTrigger>
                            <TabsTrigger value="card-types" className="rounded-xl"><Paintbrush className="h-4 w-4 mr-2" />Card Types</TabsTrigger>
                            <TabsTrigger value="achievements" className="rounded-xl"><Award className="h-4 w-4 mr-2" />Achievements</TabsTrigger>
                            <TabsTrigger value="analytics" className="rounded-xl"><BarChart className="h-4 w-4 mr-2" />Site Analytics</TabsTrigger>
                            <TabsTrigger value="bugs" className="rounded-xl"><Bug className="h-4 w-4 mr-2" />Bug Reports</TabsTrigger>
                        </TabsList>
                    </div>
                    <TabsContent value="users" className="mt-6"><UserManagement /></TabsContent>
                    <TabsContent value="status" className="mt-6"><SystemStatus /></TabsContent>
                    <TabsContent value="card-types" className="mt-6"><CardTypeCreator /></TabsContent>
                    <TabsContent value="achievements" className="mt-6"><AchievementCreator /></TabsContent>
                    <TabsContent value="analytics" className="mt-6"><SiteAnalytics /></TabsContent>
                    <TabsContent value="bugs" className="mt-6"><BugReports /></TabsContent>
                </Tabs>
            </div>
        </main>
    </div>
  );
};

export default Admin;
