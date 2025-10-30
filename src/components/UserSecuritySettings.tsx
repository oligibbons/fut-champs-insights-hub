// src/components/UserSecuritySettings.tsx
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Eye, EyeOff, LogOut } from 'lucide-react';

// Schema for updating email
const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
});
type EmailFormValues = z.infer<typeof emailSchema>;

// Schema for updating password
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});
type PasswordFormValues = z.infer<typeof passwordSchema>;

const UserSecuritySettings = () => {
  const { user, updateUser, reauthenticate, updatePassword, signOut } = useAuth();
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  const [isSignOutAllSubmitting, setIsSignOutAllSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: user?.email || '',
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
    },
  });

  const onEmailSubmit = async (values: EmailFormValues) => {
    setIsEmailSubmitting(true);
    try {
      const { error } = await updateUser({ email: values.email });
      if (error) throw error;
      toast.success('Email update request sent', {
        description: 'Please check both your old and new email inboxes to confirm the change.',
      });
    } catch (error: any) {
      toast.error('Failed to update email', { description: error.message });
    } finally {
      setIsEmailSubmitting(false);
    }
  };

  const onPasswordSubmit = async (values: PasswordFormValues) => {
    setIsPasswordSubmitting(true);
    try {
      // 1. Reauthenticate with the current password
      const { error: reauthError } = await reauthenticate(values.currentPassword);
      if (reauthError) throw reauthError;

      // 2. If reauthentication is successful, update the password
      const { error: updateError } = await updatePassword(values.newPassword);
      if (updateError) throw updateError;

      toast.success('Password updated successfully');
      passwordForm.reset();
    } catch (error: any) {
      toast.error('Failed to update password', {
        description: error.message === 'Invalid user credentials' ? 'Your current password was incorrect.' : error.message,
      });
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  const handleSignOutAll = async () => {
    setIsSignOutAllSubmitting(true);
    try {
      const { error } = await signOut({ scope: 'global' });
      if (error) throw error;
      toast.success('Signed out from all devices', {
        description: 'You have been signed out from all other sessions. You will need to log in again on other devices.',
      });
    } catch (error: any) {
      toast.error('Failed to sign out all devices', { description: error.message });
    } finally {
      setIsSignOutAllSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Update Email Card */}
      <Card className="glass-card-content">
        <CardHeader>
          <CardTitle>Update Email</CardTitle>
          <CardDescription>Change the email address associated with your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isEmailSubmitting}>
                {isEmailSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Email
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Update Password Card */}
      <Card className="glass-card-content">
        <CardHeader>
          <CardTitle>Update Password</CardTitle>
          <CardDescription>
            You must provide your current password to set a new one.
            {user?.app_metadata.provider === 'email' ? '' : ' You are logged in via a social provider and cannot change your password here.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user?.app_metadata.provider === 'email' ? (
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type={showCurrentPassword ? 'text' : 'password'} {...field} />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type={showNewPassword ? 'text' : 'password'} {...field} />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isPasswordSubmitting}>
                  {isPasswordSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Set New Password
                </Button>
              </form>
            </Form>
          ) : (
            <Alert>
              <AlertTitle>Social Login Active</AlertTitle>
              <AlertDescription>
                You are logged in via a social provider ({user?.app_metadata.provider}). You must change your password on that platform.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      {/* Active Sessions Card */}
      <Card className="glass-card-content">
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            If you've lost a device or are signed in on a public computer, you can sign out from all sessions, including this one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleSignOutAll} disabled={isSignOutAllSubmitting}>
            {isSignOutAllSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
            Sign out from all devices
          </Button>
        </CardContent>
      </Card>
      
      {/* Note on 2FA */}
      <Alert>
        <AlertTitle>Looking for Two-Factor Authentication (2FA)?</AlertTitle>
        <AlertDescription>
          We are working on implementing multi-factor authentication to further secure your account. This feature will be available in a future update.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default UserSecuritySettings;