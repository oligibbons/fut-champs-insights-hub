// src/components/UserAccountSettings.tsx
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner'; // **STEP 1: Import toast from sonner**
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

// Schema for profile updates
const profileFormSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters.')
    .max(20, 'Username must be 20 characters or less.')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers, and underscores.'
    ),
  display_name: z
    .string()
    .max(50, 'Display name must be 50 characters or less.')
    .optional(),
  avatar_url: z.string().url('Must be a valid URL.').optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const UserAccountSettings = () => {
  const { user, profile, loading: authLoading, fetchProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: profile?.username || '',
      display_name: profile?.display_name || '',
      avatar_url: profile?.avatar_url || '',
    },
    values: { // Ensure form updates when profile loads
      username: profile?.username || '',
      display_name: profile?.display_name || '',
      avatar_url: profile?.avatar_url || '',
    },
    disabled: authLoading,
  });

  async function onSubmit(data: ProfileFormValues) {
    if (!user || !profile) return;

    setIsSubmitting(true);
    try {
      // 1. Update the 'profiles' table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          username: data.username,
          display_name: data.display_name,
          avatar_url: data.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // 2. Check if username is different, if so, update 'auth.users'
      if (data.username !== profile.username) {
        const { error: authError } = await supabase.auth.updateUser({
          data: {
            username: data.username, // Add username to auth.users.raw_user_meta_data
          },
        });
        if (authError) throw authError;
      }
      
      // 3. Refetch profile data to update context
      await fetchProfile();

      // **STEP 2 (SUCCESS): Show success toast**
      toast.success('Profile Updated', {
        description: 'Your account settings have been saved successfully.',
      });

    } catch (error: any) {
      console.error('Error updating profile:', error);
      // **STEP 2 (ERROR): Show error toast**
      toast.error('Error Updating Profile', {
        description: `Failed to save settings: ${error.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="glass-card-content"> {/* **UI FIX: Use glass-card-content** */}
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>
          Manage your public profile and account details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="your_username" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your unique username. This is public.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="display_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Name" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormDescription>
                    Your public display name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="avatar_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} value={field.value || ''} />
                  </FormControl>
                  <FormDescription>
                    A direct link to your profile picture.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting || authLoading || !form.formState.isDirty}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default UserAccountSettings;