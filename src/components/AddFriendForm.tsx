// src/components/AddFriendForm.tsx
import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAddFriend } from '@/hooks/useFriends';
import { Loader2, UserPlus, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Skeleton } from './ui/skeleton';
import { useToast } from '@/hooks/use-toast';

// Schema for the search input
const searchUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters.'),
});

type SearchUserFormValues = z.infer<typeof searchUserSchema>;

interface SearchResult {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
}

export const AddFriendForm = () => {
  const addFriend = useAddFriend();
  const { toast } = useToast();
  
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const form = useForm<SearchUserFormValues>({
    resolver: zodResolver(searchUserSchema),
    defaultValues: {
      username: '',
    },
  });

  // Function to search for users
  async function onSearch(data: SearchUserFormValues) {
    setIsSearching(true);
    setHasSearched(true);
    setSearchResults([]);
    
    try {
      const { data: results, error } = await supabase.rpc('search_users', {
        search_query: data.username,
      });

      if (error) throw error;
      setSearchResults(results || []);

    } catch (error: any) {
      toast({
        title: "Error searching users",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  }

  // Function to send a friend request
  function onAddFriend(userId: string) {
    // We pass the user ID to the mutation, but the hook expects a username.
    // Let's find the username from the results.
    const user = searchResults.find(u => u.id === userId);
    if (!user) return;

    addFriend.mutate(user.username, {
      onSuccess: () => {
        // Optionally, remove the user from search results after adding
        setSearchResults(prev => prev.filter(u => u.id !== userId));
      },
    });
  }

  return (
    <Card className="glass-card shadow-lg border-white/10 rounded-2xl">
      <CardHeader>
        <CardTitle>Add Friend</CardTitle>
        <CardDescription>
          Search for users by username or display name.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSearch)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Search Users</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input placeholder="username or display name" {...field} />
                      <Button type="submit" size="icon" disabled={isSearching}>
                        {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        {/* --- Search Results --- */}
        <div className="mt-6 space-y-4">
          {isSearching && (
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="h-9 w-9 rounded-md" />
              </div>
            ))
          )}

          {!isSearching && hasSearched && searchResults.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No users found. Try a different search.
            </p>
          )}

          {!isSearching && searchResults.length > 0 && (
            searchResults.map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar_url || ''} />
                    <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-white">{user.display_name}</div>
                    <div className="text-sm text-muted-foreground">@{user.username}</div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onAddFriend(user.id)}
                  disabled={addFriend.isPending}
                >
                  {addFriend.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};