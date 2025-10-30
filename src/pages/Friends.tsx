// src/pages/Friends.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddFriendForm } from '@/components/AddFriendForm';
import { FriendRequests } from '@/components/FriendRequests';
import { FriendsList } from '@/components/FriendsList';
import { useFriendRequests } from '@/hooks/useFriends';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Mail } from 'lucide-react';

const Friends = () => {
  const { data: requests } = useFriendRequests();
  const requestCount = requests?.length || 0;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Friends</h1>

      <Tabs defaultValue="friends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 sm:w-auto">
          <TabsTrigger value="friends">
            <Users className="mr-2 h-4 w-4" />
            My Friends
          </TabsTrigger>
          <TabsTrigger value="requests">
            <Mail className="mr-2 h-4 w-4" />
            Requests
            {requestCount > 0 && (
              <Badge className="ml-2 bg-primary text-primary-foreground">
                {requestCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="add">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Friend
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends">
          <FriendsList />
        </TabsContent>

        <TabsContent value="requests">
          <FriendRequests />
        </TabsContent>

        <TabsContent value="add">
          <AddFriendForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Friends;