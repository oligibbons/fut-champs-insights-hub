import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Download, Trash2, RefreshCw, AlertTriangle } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const DataManagement = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const exportData = async () => {
    setIsExporting(true);
    
    try {
      // Gather all user data
      const userData: any = {
        exportDate: new Date().toISOString(),
        user: {
          id: user?.id,
          email: user?.email
        },
        data: {}
      };
      
      // Fetch profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
        
      userData.data.profile = profileData;
      
      // Fetch weekly performances
      const { data: weeklyData } = await supabase
        .from('weekly_performances')
        .select('*')
        .eq('user_id', user?.id);
        
      userData.data.weeklyPerformances = weeklyData;
      
      // Fetch game results
      const { data: gameData } = await supabase
        .from('game_results')
        .select('*')
        .eq('user_id', user?.id);
        
      userData.data.gameResults = gameData;
      
      // Fetch player performances
      const { data: playerData } = await supabase
        .from('player_performances')
        .select('*')
        .eq('user_id', user?.id);
        
      userData.data.playerPerformances = playerData;
      
      // Fetch team statistics
      const { data: teamData } = await supabase
        .from('team_statistics')
        .select('*')
        .eq('user_id', user?.id);
        
      userData.data.teamStatistics = teamData;
      
      // Fetch squads
      const { data: squadData } = await supabase
        .from('squads')
        .select('*')
        .eq('user_id', user?.id);
        
      userData.data.squads = squadData;
      
      // Fetch players
      const { data: playersData } = await supabase
        .from('players')
        .select('*')
        .eq('user_id', user?.id);
        
      userData.data.players = playersData;
      
      // Fetch achievements
      const { data: achievementsData } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user?.id);
        
      userData.data.achievements = achievementsData;
      
      // Fetch friends
      const { data: friendsData } = await supabase
        .from('friends')
        .select('*')
        .eq('user_id', user?.id);
        
      userData.data.friends = friendsData;
      
      // Create and download file
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `futalyst-data-export-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Data Exported",
        description: "Your data has been exported successfully.",
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const deleteAllData = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast({
        title: "Confirmation Required",
        description: "Please type 'DELETE' to confirm account deletion.",
        variant: "destructive"
      });
      return;
    }

    setIsDeleting(true);
    
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Delete all user data from Supabase
      const tables = [
        'player_performances',
        'team_statistics',
        'game_results',
        'weekly_performances',
        'achievements',
        'players',
        'squads',
        'friends'
      ];
      
      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('user_id', user.id);
          
        if (error) {
          console.error(`Error deleting from ${table}:`, error);
        }
      }
      
      // Clear localStorage
      localStorage.clear();
      
      toast({
        title: "Data Deleted",
        description: "All your data has been successfully deleted.",
      });
      
      setShowDeleteConfirm(false);
      setDeleteConfirmText('');
      
      // Refresh the page
      window.location.reload();
    } catch (error) {
      console.error('Error deleting data:', error);
      toast({
        title: "Deletion Failed",
        description: "There was an error deleting your data.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Download className="h-5 w-5 text-fifa-green" />
          Data Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-fifa-green/10 rounded-xl">
          <h4 className="text-white font-medium mb-2">Export Your Data</h4>
          <p className="text-gray-400 text-sm mb-3">
            Download a complete copy of all your FUTALYST data including match records, 
            performance statistics, and account settings.
          </p>
          <Button 
            onClick={exportData} 
            variant="outline" 
            className="border-fifa-green text-fifa-green"
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </>
            )}
          </Button>
        </div>

        <div className="p-4 bg-fifa-red/10 rounded-xl border border-fifa-red/30">
          <h4 className="text-white font-medium mb-2">Delete All Data</h4>
          <p className="text-gray-400 text-sm mb-3">
            Permanently delete all your data including games, squads, players, and achievements. This action cannot be undone.
          </p>
          
          <Button 
            onClick={() => setShowDeleteConfirm(true)}
            variant="outline" 
            className="border-fifa-red text-fifa-red"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete All Data
          </Button>
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-fifa-red" />
              Delete All Data
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              This action will permanently delete all your data. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-fifa-red/10 rounded-lg border border-fifa-red/30">
              <p className="text-white text-sm">
                You are about to delete:
              </p>
              <ul className="list-disc list-inside text-gray-300 text-sm mt-2 space-y-1">
                <li>All game records and statistics</li>
                <li>All squads and player cards</li>
                <li>All achievements and progress</li>
                <li>All settings and preferences</li>
              </ul>
            </div>
            
            <div>
              <Label className="text-white text-sm">
                Type "DELETE" to confirm data deletion:
              </Label>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="bg-gray-800 border-fifa-red text-white mt-1"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => {
                setShowDeleteConfirm(false);
                setDeleteConfirmText('');
              }}
              className="border-gray-600 text-gray-400"
            >
              Cancel
            </Button>
            <Button 
              onClick={deleteAllData}
              className="bg-fifa-red hover:bg-fifa-red/80"
              disabled={deleteConfirmText !== 'DELETE' || isDeleting}
            >
              {isDeleting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Confirm Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default DataManagement;