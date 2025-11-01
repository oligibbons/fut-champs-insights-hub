// src/components/FriendRequests.tsx
// --- THIS IS THE FIX (Part 1) ---
// Import the single, correct hook
import { useFriends } from '@/hooks/useFriends';
// --- END OF FIX ---
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Check, X, Mail } from 'lucide-react';
import { Badge } from './ui/badge';

interface FriendRequestsProps {
  requestCount: number;
}

export const FriendRequests = ({ requestCount }: FriendRequestsProps) => {
  // --- THIS IS THE FIX (Part 2) ---
  // Use the correct hook and get the values
  const { friendRequests: requests, loading, acceptFriendRequest, removeFriend } = useFriends();
  // We can treat the hook's 'loading' as the response loading state for simplicity
  const isLoadingResponse = loading;
  // --- END OF FIX ---

  const handleResponse = (requestId: string, newStatus: 'accepted' | 'declined') => {
    if (newStatus === 'accepted') {
      acceptFriendRequest(requestId);
    } else {
      // 'removeFriend' also works for declining
      removeFriend(requestId);
    }
  };
  
  return (
    <Card className="glass-card shadow-lg border-white/10 rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Friend Requests</CardTitle>
          {requestCount > 0 && (
            <Badge className="bg-primary text-primary-foreground">
              {requestCount}
            </Badge>
          )}
        </div>
        <CardDescription>
          Accept or decline pending requests.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && (
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

        {!loading && requests && requests.length === 0 && (
          <div className="flex flex-col items-center justify-center h-24 text-center">
            <Mail className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No pending requests</p>
          </div>
        )}

        {!loading && requests && requests.map((req) => (
          <div key={req.id} className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-10 w-10">
                {/* --- FIX: Use correct profile data --- */}
                <AvatarImage src={req.friend_profile?.avatar_url || ''} />
                <AvatarFallback>{req.friend_profile?.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-white">{req.friend_profile?.display_name}</div>
                <div className="text-sm text-muted-foreground">@{req.friend_profile?.username}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleResponse(req.id, 'accepted')}
                disabled={isLoadingResponse}
                className="hover:bg-green-500/10 hover:border-green-500"
              >
                {isLoadingResponse ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 text-green-500" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleResponse(req.id, 'declined')}
                disabled={isLoadingResponse}
                className="hover:bg-red-500/10 hover:border-red-500"
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