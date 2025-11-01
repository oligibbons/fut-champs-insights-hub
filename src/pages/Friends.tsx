// src/pages/Friends.tsx
import AddFriendForm from '@/components/AddFriendForm';
import { FriendRequests } from '@/components/FriendRequests';
import { FriendsList } from '@/components/FriendsList';
import { useFriends } from '@/hooks/useFriends';
import { Badge } from '@/components/ui/badge';
import { UsersRound } from 'lucide-react';

const Friends = () => {
  const { friendRequests: requests } = useFriends();
  const requestCount = requests?.length || 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-primary/10">
            <UsersRound className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">
              Friends & Community
            </h1>
            <p className="text-muted-foreground mt-1">Manage your friends, requests, and find new players.</p>
          </div>
      </div>

      {/* --- New 2-Column Layout --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- Left Column (Friends List) --- */}
        <div className="lg:col-span-2">
          <FriendsList />
        </div>

        {/* --- Right Column (Requests & Add) --- */}
        <div className="space-y-8">
          <FriendRequests requestCount={requestCount} />
          <AddFriendForm />
        </div>
        
      </div>
    </div>
  );
};

export default Friends;