// src/components/FriendsList.tsx
// --- THIS IS THE FIX (Part 1) ---
import { useFriends } from '@/hooks/useFriends';
// --- END OF FIX ---
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

export const FriendsList = () => {
  // --- THIS IS THE FIX (Part 2) ---
  const { friends, loading } = useFriends();
  // --- END OF FIX ---

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Friends</CardTitle>
        <CardDescription>
          Your list of accepted friends.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && (
          // Skeleton loading
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))
        )}

        {!loading && friends && friends.length === 0 && (
          <p className="text-sm text-muted-foreground">You haven't added any friends yet.</p>
        )}

        {!loading && friends && friends.map((f) => (
          <div key={f.id} className="flex items-center space-x-4">
            <Avatar className="h-10 w-10">
              {/* --- FIX: Use correct profile data --- */}
              <AvatarImage src={f.friend_profile?.avatar_url || ''} />
              <AvatarFallback>{f.friend_profile?.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{f.friend_profile?.display_name}</div>
              <div className="text-sm text-muted-foreground">@{f.friend_profile?.username}</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};