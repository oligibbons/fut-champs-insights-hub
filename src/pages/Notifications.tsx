// src/pages/Notifications.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, AlertCircle, CheckCircle, Info, Trash2, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { formatDistanceToNow } from 'date-fns';

// Define the Notification type based on your schema
type TNotification = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  type: 'achievement' | 'friend_request' | 'system' | 'general' | 'error';
  read: boolean;
  created_at: string;
  action_url?: string;
  sender_name?: string;
};

// Helper to get the right icon
const NotificationIcon = ({ type }: { type: TNotification['type'] }) => {
  switch (type) {
    case 'achievement':
      return <CheckCircle className="h-5 w-5 text-fifa-gold" />;
    case 'friend_request':
      return <CheckCircle className="h-5 w-5 text-primary" />;
    case 'system':
      return <Info className="h-5 w-5 text-blue-400" />;
    case 'error':
      return <AlertCircle className="h-5 w-5 text-destructive" />;
    default:
      return <Bell className="h-5 w-5 text-muted-foreground" />;
  }
};

const Notifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<TNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to fetch notifications: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
      if (error) throw error;
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to mark as read: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase.from('notifications').delete().eq('id', id);
      if (error) throw error;
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast({
        title: 'Deleted',
        description: 'Notification removed.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to delete notification: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const deleteAllNotifications = async () => {
    if (!user) return;
    try {
      const { error } = await supabase.from('notifications').delete().eq('user_id', user.id);
      if (error) throw error;
      setNotifications([]);
      toast({
        title: 'All Cleared',
        description: 'All notifications have been deleted.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to clear notifications: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 h-12 w-12 rounded-lg glass-card-content flex items-center justify-center shadow-md">
            <Bell className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">Your recent activity and alerts.</p>
          </div>
        </div>
        {notifications.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all {notifications.length} of your notifications. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={deleteAllNotifications}>Delete All</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="glass-card-content p-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            </Card>
          ))
        ) : notifications.length === 0 ? (
          <Card className="glass-card-content p-8 flex flex-col items-center justify-center text-center">
            <Bell className="h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-xl font-semibold">All caught up!</h3>
            <p className="mt-1 text-muted-foreground">You have no new notifications.</p>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`glass-card-content transition-all duration-300 ${
                !notification.read ? 'border-primary/50' : 'border-transparent'
              }`}
            >
              <CardContent className="p-4 flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  <NotificationIcon type={notification.type} />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-semibold text-white">{notification.title}</p>
                  <p className="text-sm text-muted-foreground">{notification.content}</p>
                  <p className="text-xs text-muted-foreground/80">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  {!notification.read && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Mark as Read
                    </Button>
                  )}
                  {/* You could make this a confirm dialog too */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => deleteNotification(notification.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;