// src/components/AddFriendForm.tsx
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
import { Loader2, UserPlus } from 'lucide-react';

const addFriendSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters.'),
});

type AddFriendFormValues = z.infer<typeof addFriendSchema>;

export const AddFriendForm = () => {
  const addFriend = useAddFriend();

  const form = useForm<AddFriendFormValues>({
    resolver: zodResolver(addFriendSchema),
    defaultValues: {
      username: '',
    },
  });

  function onSubmit(data: AddFriendFormValues) {
    addFriend.mutate(data.username, {
      onSuccess: () => {
        form.reset();
      },
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Friend</CardTitle>
        <CardDescription>
          Send a friend request by entering their unique username.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="friend_username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={addFriend.isPending} className="w-full sm:w-auto">
              {addFriend.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              Send Friend Request
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};