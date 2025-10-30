// src/components/DangerZone.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast'; // **Import toast**
import { Loader2 } from 'lucide-react';

const DangerZone = () => {
  const { user } = useAuth();
  const { toast } = useToast(); // **Get toast function**
  const [isDeleting, setIsDeleting] = useState(false);

  // Note: Full account deletion is complex and should ideally be handled
  // by a Supabase Edge Function to ensure all related data is properly
  // orphaned or deleted (e.g., from 'auth.users').
  // This example will clear user-generated content from public tables.
  
  const handleClearData = async () => {
    if (!user) return;
    setIsDeleting(true);

    try {
      // This is a simplified example.
      // In a real app, you'd call an RPC function:
      // const { error } = await supabase.rpc('delete_user_data');
      
      // Simple example: Delete game results
      const { error: gameError } = await supabase
        .from('game_results')
        .delete()
        .eq('user_id', user.id);
      
      if (gameError) throw gameError;

      // Delete weekly performances
      const { error: weekError } = await supabase
        .from('weekly_performances')
        .delete()
        .eq('user_id', user.id);

      if (weekError) throw weekError;

      // ... add deletions for players, squads, etc. ...

      // **Show success toast**
      toast({
        title: 'Data Cleared',
        description: 'All your game and performance data has been deleted.',
      });

    } catch (error: any) {
      console.error('Error clearing data:', error);
      // **Show error toast**
      toast({
        title: 'Error',
        description: `Failed to clear data: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Full account deletion is even more destructive
  // and would require a call to a trusted RPC function.
  // We'll just add a placeholder dialog.

  return (
    <Card className="glass-card border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>
          These actions are irreversible. Please proceed with caution.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Clear All Data */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-lg border border-destructive/50 p-4">
          <div>
            <h4 className="font-semibold text-white">Clear All Data</h4>
            <p className="text-sm text-muted-foreground">
              Delete all your submitted runs, games, and player stats. Your
              account will remain.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0">
                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Clear Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all your FUT Champs data,
                  including runs, games, and player history. This action cannot
                  be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearData} disabled={isDeleting}>
                  Yes, delete all data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Delete Account */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-lg border border-destructive/50 p-4">
          <div>
            <h4 className="font-semibold text-white">Delete Account</h4>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all associated data.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                outline
                className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0"
              >
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely, 100% sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action is final. It will permanently delete your
                  entire account, profile, and all data. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    toast({
                      title: 'Feature Not Implemented',
                      description:
                        'Please contact support for account deletion.',
                      variant: 'destructive',
                    })
                  }
                >
                  I understand, delete my account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default DangerZone;