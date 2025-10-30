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
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
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
    .nullable()
    .optional(),
  avatar_url: z
    .string()
    .url('Must be a valid URL.')
    .nullable()
    .optional()
    .or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const UserAccountSettings = () => {
  const { user, profile, loading: authLoading, fetchProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    // 1. Set empty defaults
    defaultValues: {
      username: '',
      display_name: '',
      avatar_url: '',
    },
    // 2. Disable form while auth is loading
    disabled: authLoading,
  });

  // 3. This useEffect populates the form's *default values*
  //    only *after* the profile has finished loading. This sets the "clean" state.
  useEffect(() => {
    // Only reset when loading is finished.
    // `profile` can be null for a new user, which is fine.
    if (!authLoading) {
      form.reset({
        username: profile?.username || '',
        display_name: profile?.display_name || '',
        avatar_url: profile?.avatar_url || '',
      });
    }
  }, [authLoading, profile, form.reset]);


  async function onSubmit(data: ProfileFormValues) {
    // 4. This check is now the final safeguard.
    if (!user) {
       toast.error("Error", { description: "User not found. Please try logging in again." });
       return;
    }

    setIsSubmitting(true);
    try {
      // 5. Use .upsert() to CREATE or UPDATE the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id, // Set the ID to the user's ID
          username: data.username,
          display_name: data.display_name,
          avatar_url: data.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id); // Specify 'eq' for the update part

      if (profileError) throw profileError;

      // 6. Check for username change (only if profile existed before)
      if (profile && data.username !== profile.username) {
        const { error: authError } = await supabase.auth.updateUser({
          data: {
            username: data.username,
          },
        });
        if (authError) throw authError;
      }
      
      // 7. Call the now-working fetchProfile function
      await fetchProfile();

      toast.success('Profile Updated', {
        description: 'Your account settings have been saved successfully.',
      });
      
      // Reset the form's dirty state to the newly saved data
      form.reset(data);

    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Error Updating Profile', {
        description: `Failed to save settings: ${error.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="glass-card-content">
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