import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Gamepad2, User, Check } from 'lucide-react';

interface Account {
  id: string;
  name: string;
  platform: 'PS5' | 'Xbox' | 'PC' | 'Switch';
  isActive: boolean;
  createdAt: string;
  gamesPlayed?: number;
  totalWins?: number;
  gamertag?: string;
}

const AccountSelector = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [newAccount, setNewAccount] = useState({
    name: '',
    platform: 'PS5' as const,
    gamertag: ''
  });

  // Load accounts from Supabase and localStorage
  useEffect(() => {
    const loadAccounts = async () => {
      // First try to load from Supabase if user is logged in
      if (user) {
        try {
          const { data, error } = await supabase
            .from('gaming_accounts')
            .select('*')
            .eq('user_id', user.id);
            
          if (error) throw error;
          
          if (data && data.length > 0) {
            const formattedAccounts = data.map(acc => ({
              id: acc.id,
              name: acc.name,
              platform: acc.platform,
              isActive: acc.is_active,
              createdAt: acc.created_at,
              gamesPlayed: acc.games_played || 0,
              totalWins: acc.total_wins || 0,
              gamertag: acc.gamertag || ''
            }));
            
            setAccounts(formattedAccounts);
            return;
          }
        } catch (error) {
          console.error('Error loading accounts from Supabase:', error);
        }
      }
      
      // Fallback to localStorage
      const savedAccounts = localStorage.getItem('accounts');
      if (savedAccounts) {
        const parsed = JSON.parse(savedAccounts);
        setAccounts(parsed);
      } else {
        // Create default account if none exists
        const defaultAccount: Account = {
          id: 'default-account',
          name: 'Main Account',
          platform: 'PS5',
          isActive: true,
          createdAt: new Date().toISOString(),
          gamesPlayed: 0,
          totalWins: 0,
          gamertag: ''
        };
        setAccounts([defaultAccount]);
        localStorage.setItem('accounts', JSON.stringify([defaultAccount]));
        localStorage.setItem('active-account', 'default-account');
      }
    };
    
    loadAccounts();
  }, [user]);

  const saveAccounts = async (updatedAccounts: Account[]) => {
    setAccounts(updatedAccounts);
    localStorage.setItem('accounts', JSON.stringify(updatedAccounts));
    
    // Save to Supabase if user is logged in
    if (user) {
      try {
        // First delete all existing accounts
        await supabase
          .from('gaming_accounts')
          .delete()
          .eq('user_id', user.id);
          
        // Then insert the updated accounts
        const accountsForSupabase = updatedAccounts.map(acc => ({
          id: acc.id,
          user_id: user.id,
          name: acc.name,
          platform: acc.platform,
          is_active: acc.isActive,
          created_at: acc.createdAt,
          games_played: acc.gamesPlayed || 0,
          total_wins: acc.totalWins || 0,
          gamertag: acc.gamertag || ''
        }));
        
        const { error } = await supabase
          .from('gaming_accounts')
          .insert(accountsForSupabase);
          
        if (error) throw error;
      } catch (error) {
        console.error('Error saving accounts to Supabase:', error);
      }
    }
  };

  const addAccount = async () => {
    if (!newAccount.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for the account.",
        variant: "destructive"
      });
      return;
    }

    const account: Account = {
      id: `account-${Date.now()}`,
      name: newAccount.name,
      platform: newAccount.platform,
      isActive: false,
      createdAt: new Date().toISOString(),
      gamesPlayed: 0,
      totalWins: 0,
      gamertag: newAccount.gamertag
    };

    const updatedAccounts = [...accounts, account];
    await saveAccounts(updatedAccounts);
    
    setNewAccount({ name: '', platform: 'PS5', gamertag: '' });
    setShowAddForm(false);
    
    toast({
      title: "Account Added",
      description: `${account.name} has been added successfully.`,
    });
  };

  const updateAccount = async () => {
    if (!editingAccount) return;
    
    const updatedAccounts = accounts.map(acc => 
      acc.id === editingAccount.id ? editingAccount : acc
    );
    
    await saveAccounts(updatedAccounts);
    setEditingAccount(null);
    
    toast({
      title: "Account Updated",
      description: `${editingAccount.name} has been updated successfully.`,
    });
  };

  const switchAccount = async (accountId: string) => {
    const updatedAccounts = accounts.map(acc => ({
      ...acc,
      isActive: acc.id === accountId
    }));
    
    await saveAccounts(updatedAccounts);
    localStorage.setItem('active-account', accountId);
    
    const activeAccount = updatedAccounts.find(acc => acc.id === accountId);
    toast({
      title: "Account Switched",
      description: `Switched to ${activeAccount?.name}`,
    });
    
    // Refresh the page to load data for the new account
    window.location.reload();
  };

  const deleteAccount = async (accountId: string) => {
    if (accounts.length <= 1) {
      toast({
        title: "Cannot Delete",
        description: "You must have at least one account.",
        variant: "destructive"
      });
      return;
    }

    const accountToDelete = accounts.find(acc => acc.id === accountId);
    const updatedAccounts = accounts.filter(acc => acc.id !== accountId);
    
    // If deleting active account, make the first remaining account active
    if (accountToDelete?.isActive && updatedAccounts.length > 0) {
      updatedAccounts[0].isActive = true;
      localStorage.setItem('active-account', updatedAccounts[0].id);
    }
    
    await saveAccounts(updatedAccounts);
    
    toast({
      title: "Account Deleted",
      description: `${accountToDelete?.name} has been deleted.`,
    });
  };

  const activeAccount = accounts.find(acc => acc.isActive);

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Gamepad2 className="h-5 w-5 text-fifa-blue" />
          Game Accounts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Account Display */}
        <div className="p-4 bg-fifa-blue/10 rounded-xl border border-fifa-blue/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-fifa-blue rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold">{activeAccount?.name}</p>
                <div className="flex items-center gap-2">
                  <p className="text-fifa-blue text-sm">{activeAccount?.platform}</p>
                  {activeAccount?.gamertag && (
                    <>
                      <span className="text-gray-500">•</span>
                      <p className="text-gray-400 text-sm">{activeAccount.gamertag}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
            <Badge className="bg-fifa-green text-white">Current</Badge>
          </div>
        </div>

        {/* All Accounts List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-white font-medium">All Accounts</h4>
            <Button
              onClick={() => setShowAddForm(true)}
              size="sm"
              className="bg-fifa-green hover:bg-fifa-green/80"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </div>

          {accounts.map((account) => (
            <div key={account.id} className="p-3 bg-white/5 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  account.isActive ? 'bg-fifa-green' : 'bg-gray-600'
                }`}>
                  <User className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{account.name}</p>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-gray-400">{account.platform}</span>
                    {account.gamertag && (
                      <>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-400">{account.gamertag}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {!account.isActive && (
                  <Button
                    onClick={() => switchAccount(account.id)}
                    size="sm"
                    variant="outline"
                    className="text-fifa-blue border-fifa-blue hover:bg-fifa-blue/10"
                  >
                    Switch
                  </Button>
                )}
                <Button
                  onClick={() => setEditingAccount(account)}
                  size="sm"
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => deleteAccount(account.id)}
                  size="sm"
                  variant="ghost"
                  className="text-fifa-red hover:bg-fifa-red/10"
                  disabled={accounts.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Account Form */}
        {showAddForm && (
          <div className="p-4 bg-white/5 rounded-xl space-y-3">
            <h4 className="text-white font-medium">Add New Account</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-white text-sm">Account Name</Label>
                <Input
                  value={newAccount.name}
                  onChange={(e) => setNewAccount(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Main Account, RTG Account"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white text-sm">Platform</Label>
                <Select 
                  value={newAccount.platform} 
                  onValueChange={(value) => setNewAccount(prev => ({ ...prev, platform: value as any }))}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PS5">PlayStation 5</SelectItem>
                    <SelectItem value="Xbox">Xbox Series X/S</SelectItem>
                    <SelectItem value="PC">PC</SelectItem>
                    <SelectItem value="Switch">Nintendo Switch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label className="text-white text-sm">Gamertag/PSN ID</Label>
                <Input
                  value={newAccount.gamertag}
                  onChange={(e) => setNewAccount(prev => ({ ...prev, gamertag: e.target.value }))}
                  placeholder="Your online gaming ID"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={addAccount} className="bg-fifa-green hover:bg-fifa-green/80">
                Add Account
              </Button>
              <Button 
                onClick={() => setShowAddForm(false)} 
                variant="outline"
                className="border-gray-600 text-gray-400"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Edit Account Form */}
        {editingAccount && (
          <div className="p-4 bg-white/5 rounded-xl space-y-3">
            <h4 className="text-white font-medium">Edit Account</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-white text-sm">Account Name</Label>
                <Input
                  value={editingAccount.name}
                  onChange={(e) => setEditingAccount(prev => ({ ...prev!, name: e.target.value }))}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white text-sm">Platform</Label>
                <Select 
                  value={editingAccount.platform} 
                  onValueChange={(value) => setEditingAccount(prev => ({ ...prev!, platform: value as any }))}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PS5">PlayStation 5</SelectItem>
                    <SelectItem value="Xbox">Xbox Series X/S</SelectItem>
                    <SelectItem value="PC">PC</SelectItem>
                    <SelectItem value="Switch">Nintendo Switch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label className="text-white text-sm">Gamertag/PSN ID</Label>
                <Input
                  value={editingAccount.gamertag || ''}
                  onChange={(e) => setEditingAccount(prev => ({ ...prev!, gamertag: e.target.value }))}
                  placeholder="Your online gaming ID"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={updateAccount} className="bg-fifa-blue hover:bg-fifa-blue/80">
                <Check className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button 
                onClick={() => setEditingAccount(null)} 
                variant="outline"
                className="border-gray-600 text-gray-400"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AccountSelector;