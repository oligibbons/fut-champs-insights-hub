// src/components/FriendRequests.tsx
import { useFriendRequests, useRespondToFriendRequest } from '@/hooks/useFriends';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Check, X } from 'lucide-react';

export const FriendRequests = () => {
  const { data: requests, isLoading } = useFriendRequests();
  const respond = useRespondToFriendRequest();

  const handleResponse = (requestId: string, newStatus: 'accepted' | 'declined') => {
    respond.mutate({ requestId, newStatus });
  };
  
  const isLoadingResponse = respond.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Friend Requests</CardTitle>
        <CardDescription>
          Accept or decline pending friend requests.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          // Skeleton loading
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-9 rounded-md" />
                <Skeleton className="h-9 w-9 rounded-md" />
              </div>
            </div>
          ))
        )}

        {!isLoading && requests && requests.length === 0 && (
          <p className="text-sm text-muted-foreground">You have no pending friend requests.</p>
        )}

        {!isLoading && requests && requests.map((req) => (
          <div key={req.id} className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={req.requester.avatar_url || ''} />
                <AvatarFallback>{req.requester.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{req.requester.display_name}</div>
                <div className="text-sm text-muted-foreground">@{req.requester.username}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleResponse(req.id, 'accepted')}
                disabled={isLoadingResponse}
              >
                {isLoadingResponse ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 text-green-500" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleResponse(req.id, 'declined')}
                disabled={isLoadingResponse}
              >
                {isLoadingResponse ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 text-red-500" />}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};