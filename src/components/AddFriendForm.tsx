// src/components/AddFriendForm.tsx
import { useState } from 'react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// --- THIS IS THE FIX (Part 1) ---
import { useFriends } from '@/hooks/useFriends';
// --- END OF FIX ---
import { Loader2, UserPlus, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';

const formSchema = z.object({
  username: z.string().min(3, {
    message: 'Username must be at least 3 characters.',
  }),
});

// New component for searching users
const UserSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { userProfile } = useAuth();
  // --- THIS IS THE FIX (Part 2) ---
  const { addFriend } = useFriends();
  // --- END OF FIX ---
  const [isAdding, setIsAdding] = useState<string | null>(null); // Store ID of user being added

  const handleSearch = async () => {
    if (searchTerm.length < 3) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .ilike('username', `%${searchTerm}%`)
        .not('id', 'eq', userProfile?.id || '') // Exclude self
        .limit(5);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error: any) {
      console.error('Error searching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFriend = async (username: string, friendId: string) => {
    setIsAdding(friendId);
    await addFriend(username);
    setIsAdding(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Find Friends</CardTitle>
        <CardDescription>Search for users by their username and send a friend request.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="text"
            placeholder="Search by username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button type="button" onClick={handleSearch} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>
        <div className="space-y-2">
          {searchResults.length > 0 && (
            <ul className="divide-y divide-border rounded-md border">
              {searchResults.map((profile) => (
                <li key={profile.id} className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={profile.avatar_url || `https://avatar.vercel.sh/${profile.username}.png`}
                      alt={profile.username}
                      className="h-10 w-10 rounded-full"
                    />
                    <div>
                      <p className="font-semibold">{profile.display_name}</p>
                      <p className="text-sm text-muted-foreground">@{profile.username}</p>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleAddFriend(profile.username, profile.id)}
                    disabled={isAdding === profile.id}
                  >
                    {isAdding === profile.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Original AddFriendForm, now repurposed to just be the search component
const AddFriendForm = () => {
  return <UserSearch />;
};

export default AddFriendForm;
