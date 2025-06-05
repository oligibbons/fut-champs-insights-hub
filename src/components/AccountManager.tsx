import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Gamepad2, User } from 'lucide-react';

interface FC25Account {
  id: string;
  name: string;
  platform: 'PS5' | 'Xbox' | 'PC' | 'Switch';
  isActive: boolean;
  createdAt: string;
  gamesPlayed?: number;
  totalWins?: number;
}

const AccountManager = () => {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<FC25Account[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<FC25Account | null>(null);
  const [newAccount, setNewAccount] = useState({
    name: '',
    platform: 'PS5' as const
  });

  // Load accounts from localStorage
  useEffect(() => {
    const savedAccounts = localStorage.getItem('fc25-accounts');
    if (savedAccounts) {
      const parsed = JSON.parse(savedAccounts);
      setAccounts(parsed);
    } else {
      // Create default account if none exists
      const defaultAccount: FC25Account = {
        id: 'default-account',
        name: 'Main Account',
        platform: 'PS5',
        isActive: true,
        createdAt: new Date().toISOString(),
        gamesPlayed: 0,
        totalWins: 0
      };
      setAccounts([defaultAccount]);
      localStorage.setItem('fc25-accounts', JSON.stringify([defaultAccount]));
      localStorage.setItem('active-fc25-account', 'default-account');
    }
  }, []);

  const saveAccounts = (updatedAccounts: FC25Account[]) => {
    setAccounts(updatedAccounts);
    localStorage.setItem('fc25-accounts', JSON.stringify(updatedAccounts));
  };

  const addAccount = () => {
    if (!newAccount.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for the account.",
        variant: "destructive"
      });
      return;
    }

    const account: FC25Account = {
      id: `account-${Date.now()}`,
      name: newAccount.name,
      platform: newAccount.platform,
      isActive: false,
      createdAt: new Date().toISOString(),
      gamesPlayed: 0,
      totalWins: 0
    };

    const updatedAccounts = [...accounts, account];
    saveAccounts(updatedAccounts);
    
    setNewAccount({ name: '', platform: 'PS5' });
    setShowAddForm(false);
    
    toast({
      title: "Account Added",
      description: `${account.name} has been added successfully.`,
    });
  };

  const switchAccount = (accountId: string) => {
    const updatedAccounts = accounts.map(acc => ({
      ...acc,
      isActive: acc.id === accountId
    }));
    
    saveAccounts(updatedAccounts);
    localStorage.setItem('active-fc25-account', accountId);
    
    const activeAccount = updatedAccounts.find(acc => acc.id === accountId);
    toast({
      title: "Account Switched",
      description: `Switched to ${activeAccount?.name}`,
    });
    
    // Refresh the page to load data for the new account
    window.location.reload();
  };

  const deleteAccount = (accountId: string) => {
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
      localStorage.setItem('active-fc25-account', updatedAccounts[0].id);
    }
    
    saveAccounts(updatedAccounts);
    
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
          FC25 Accounts
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
                <p className="text-fifa-blue text-sm">{activeAccount?.platform} • Active Account</p>
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
                  <p className="text-gray-400 text-xs">{account.platform}</p>
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
            <div className="grid grid-cols-2 gap-3">
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
                    <SelectItem value="PC">PC (EA App/Steam)</SelectItem>
                    <SelectItem value="Switch">Nintendo Switch</SelectItem>
                  </SelectContent>
                </Select>
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
      </CardContent>
    </Card>
  );
};

export default AccountManager;
