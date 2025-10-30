// src/components/UserAccountSettings.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
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
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, User } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from '@/hooks/useTheme';

// Zod schema for profile validation
const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be 20 characters or less'),
  display_name: z.string().min(2, 'Display name must be at least 2 characters').max(30, 'Display name must be 30 characters or less'),
  avatar_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// --- Main Component ---
const UserAccountSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentThemeName, setTheme, themeData } = useTheme();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: '',
      display_name: '',
      avatar_url: '',
    },
  });

  // Watch avatar_url for live preview
  const avatarUrl = form.watch('avatar_url');

  // Load profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username, display_name, avatar_url')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          form.reset({
            username: data.username || '',
            display_name: data.display_name || '',
            avatar_url: data.avatar_url || '',
          });
        }
      } catch (error: any) {
        toast.error('Failed to load profile', { description: error.message });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user, form]);

  // Handle form submission
  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...values,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error('Failed to update profile', { description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card className="glass-card-content">
        <CardHeader><CardTitle>My Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p>Loading profile...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="glass-card-content">
        <CardHeader>
          <CardTitle>Public Profile</CardTitle>
          <CardDescription>This information is visible to other users on leaderboards and friend lists.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback>
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <FormField
                  control={form.control}
                  name="avatar_url"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Avatar URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="@username" {...field} />
                    </FormControl>
                    <FormDescription>This is your unique, public username.</FormDescription>
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
                      <Input placeholder="Your Name" {...field} />
                    </FormControl>
                    <FormDescription>This name will be shown on leaderboards and insights.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Theme selector */}
      <Card className="glass-card-content">
        <CardHeader>
            <CardTitle>Theme & Appearance</CardTitle>
            <CardDescription>Choose how you want the app to look.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="space-y-2">
             <Label htmlFor="theme-selector">Theme</Label>
             <Select value={currentThemeName} onValueChange={(value) => setTheme(value as keyof typeof themeData)}>
               <SelectTrigger id="theme-selector" className="w-full md:w-[240px]">
                 <SelectValue placeholder="Select a theme" />
               </SelectTrigger>
               <SelectContent>
                 {Object.keys(themeData).map((themeName) => (
                   <SelectItem key={themeName} value={themeName}>
                     {themeData[themeName]?.name || themeName}
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
             <p className="text-sm text-muted-foreground">This selects from all themes defined in your project.</p>
           </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserAccountSettings;