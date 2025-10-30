// src/components/FriendsList.tsx
import { useFriendsList } from '@/hooks/useFriends';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

export const FriendsList = () => {
  const { data: friends, isLoading } = useFriendsList();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Friends</CardTitle>
        <CardDescription>
          Your list of accepted friends.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
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

        {!isLoading && friends && friends.length === 0 && (
          <p className="text-sm text-muted-foreground">You haven't added any friends yet.</p>
        )}

        {!isLoading && friends && friends.map((f) => (
          <div key={f.id} className="flex items-center space-x-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={f.friend.avatar_url || ''} />
              <AvatarFallback>{f.friend.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{f.friend.display_name}</div>
              <div className="text-sm text-muted-foreground">@{f.friend.username}</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};