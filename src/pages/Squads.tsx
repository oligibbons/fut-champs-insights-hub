import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import SquadBuilder from '@/components/SquadBuilder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useSquadData } from '@/hooks/useSquadData';
import { useAccountData } from '@/hooks/useAccountData';
import { Squad } from '@/types/squads';
import { Plus, Users, Trophy, Edit, Copy, Trash2, Star, Calendar, Target, TrendingUp, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { recoverSquads } from '@/utils/squadRecovery';

const Squads = () => {
  const { squads, saveSquad, deleteSquad, setDefaultSquad, fetchSquadsFromSupabase } = useSquadData();
  const { activeAccount } = useAccountData();
  const { currentTheme } = useTheme();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingSquad, setEditingSquad] = useState<Squad | undefined>();
  const [showDeleteDialog, setShowDeleteDialog] = useState<Squad | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);

  // Check if we need to recover squads
  useEffect(() => {
    const checkAndRecoverSquads = async () => {
      if (squads.length === 0 && !isRecovering) {
        setIsRecovering(true);
        try {
          await recoverSquads(user?.id);
          await fetchSquadsFromSupabase();
          toast({
            title: "Squads Recovered",
            description: "Your previously saved squads have been restored."
          });
        } catch (error) {
          console.error('Error recovering squads:', error);
        } finally {
          setIsRecovering(false);
        }
      }
    };
    
    checkAndRecoverSquads();
  }, [squads.length, user, fetchSquadsFromSupabase, toast, isRecovering]);

  const handleSaveSquad = (squad: Squad) => {
    saveSquad(squad);
    setShowBuilder(false);
    setEditingSquad(undefined);
  };

  const handleEditSquad = (squad: Squad) => {
    setEditingSquad(squad);
    setShowBuilder(true);
  };

  const handleCopySquad = (squad: Squad) => {
    const copiedSquad: Squad = {
      ...squad,
      id: `squad-${Date.now()}`,
      name: `${squad.name} (Copy)`,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      isDefault: false
    };
    saveSquad(copiedSquad);
    toast({
      title: "Squad Copied",
      description: `${copiedSquad.name} has been created.`
    });
  };

  const handleDeleteSquad = (squad: Squad) => {
    deleteSquad(squad.id);
    setShowDeleteDialog(null);
    toast({
      title: "Squad Deleted",
      description: `${squad.name} has been removed.`
    });
  };

  const handleSetDefault = (squad: Squad) => {
    setDefaultSquad(squad.id);
    toast({
      title: "Default Squad Set",
      description: `${squad.name} is now your default squad.`
    });
  };

  const getSquadCompleteness = (squad: Squad) => {
    const startingCount = squad.startingXI.filter(pos => pos.player).length;
    const subCount = squad.substitutes.filter(pos => pos.player).length;
    const reserveCount = squad.reserves.filter(pos => pos.player).length;
    
    return {
      starting: startingCount,
      substitutes: subCount,
      reserves: reserveCount,
      isComplete: startingCount === 11 && subCount === 7
    };
  };

  const getSquadStats = (squad: Squad) => {
    const allPlayers = [
      ...squad.startingXI.filter(pos => pos.player).map(pos => pos.player!),
      ...squad.substitutes.filter(pos => pos.player).map(pos => pos.player!),
      ...squad.reserves.filter(pos => pos.player).map(pos => pos.player!)
    ];

    const totalRating = allPlayers.reduce((sum, player) => sum + player.rating, 0);
    const averageRating = allPlayers.length > 0 ? totalRating / allPlayers.length : 0;
    
    const topRatedPlayers = allPlayers
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3)
      .map(p => p.name);

    const winRate = squad.gamesPlayed > 0 ? (squad.wins / squad.gamesPlayed) * 100 : 0;

    return {
      averageRating,
      topRatedPlayers,
      winRate,
      totalPlayers: allPlayers.length
    };
  };

  const handleRecoverSquads = async () => {
    setIsRecovering(true);
    try {
      await recoverSquads(user?.id);
      await fetchSquadsFromSupabase();
      toast({
        title: "Squads Recovered",
        description: "Default squads have been created."
      });
    } catch (error) {
      console.error('Error recovering squads:', error);
      toast({
        title: "Recovery Failed",
        description: "There was an error recovering squads.",
        variant: "destructive"
      });
    } finally {
      setIsRecovering(false);
    }
  };

  if (showBuilder) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="lg:ml-64 p-6">
          <div className="max-w-7xl mx-auto">
            <SquadBuilder
              squad={editingSquad}
              onSave={handleSaveSquad}
              onCancel={() => {
                setShowBuilder(false);
                setEditingSquad(undefined);
              }}
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="lg:ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-3">Squad Management</h1>
              <p className="text-lg" style={{ color: currentTheme.colors.muted }}>
                Build and manage your ultimate teams for {activeAccount}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleRecoverSquads}
                className="text-lg px-4 py-2 rounded-2xl shadow-lg transition-all duration-300"
                style={{ backgroundColor: currentTheme.colors.secondary, color: '#ffffff' }}
                disabled={isRecovering}
              >
                {isRecovering ? 'Recovering...' : 'Recover Squads'}
              </Button>
              <Button
                onClick={() => setShowBuilder(true)}
                className="text-lg px-4 py-2 rounded-2xl shadow-lg hover:scale-105 transition-all duration-300"
                style={{ backgroundColor: currentTheme.colors.primary, color: '#ffffff' }}
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Squad
              </Button>
            </div>
          </div>

          {squads.length === 0 ? (
            <Card style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }} 
                  className="rounded-3xl shadow-depth-lg border-0 animate-fade-in">
              <CardContent className="text-center py-16">
                <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6"
                     style={{ backgroundColor: currentTheme.colors.primary + '20' }}>
                  <Users className="h-12 w-12" style={{ color: currentTheme.colors.primary }} />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">No Squads Created</h3>
                <p className="text-lg max-w-md mx-auto mb-6" style={{ color: currentTheme.colors.muted }}>
                  Start building your ultimate team with our advanced squad builder. Choose formations, assign players, and create winning combinations.
                </p>
                <Button
                  onClick={() => setShowBuilder(true)}
                  className="text-lg px-8 py-4 rounded-2xl"
                  style={{ backgroundColor: currentTheme.colors.primary, color: '#ffffff' }}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Squad
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {squads.map((squad) => {
                const completeness = getSquadCompleteness(squad);
                const stats = getSquadStats(squad);
                
                return (
                  <Card key={squad.id} 
                        style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: squad.isDefault ? currentTheme.colors.primary : currentTheme.colors.border }} 
                        className={`rounded-3xl shadow-depth-lg border-2 hover:scale-105 transition-all duration-300 group ${squad.isDefault ? 'ring-2' : ''}`}>
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-white text-xl group-hover:text-fifa-blue transition-colors">
                              {squad.name}
                            </CardTitle>
                            {squad.isDefault && (
                              <Star className="h-5 w-5 text-yellow-400 fill-current" />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge style={{ backgroundColor: currentTheme.colors.primary + '30', color: currentTheme.colors.primary, borderColor: currentTheme.colors.primary + '50' }} 
                                   className="rounded-xl">
                              {squad.formation}
                            </Badge>
                            {completeness.isComplete && (
                              <Badge style={{ backgroundColor: '#10b98130', color: '#10b981', borderColor: '#10b98150' }} 
                                     className="rounded-xl">
                                <Trophy className="h-3 w-3 mr-1" />
                                Complete
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!squad.isDefault && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSetDefault(squad)}
                              style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}
                              className="rounded-xl hover:scale-110 transition-transform"
                            >
                              <Star className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditSquad(squad)}
                            style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}
                            className="rounded-xl hover:scale-110 transition-transform"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopySquad(squad)}
                            style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}
                            className="rounded-xl hover:scale-110 transition-transform"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowDeleteDialog(squad)}
                            className="bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-xl hover:scale-110 transition-transform"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      {/* Squad Completeness */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold" style={{ color: currentTheme.colors.primary }}>{completeness.starting}</p>
                          <p className="text-xs" style={{ color: currentTheme.colors.muted }}>Starting XI</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold" style={{ color: currentTheme.colors.secondary }}>{completeness.substitutes}</p>
                          <p className="text-xs" style={{ color: currentTheme.colors.muted }}>Substitutes</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold" style={{ color: currentTheme.colors.accent }}>{completeness.reserves}</p>
                          <p className="text-xs" style={{ color: currentTheme.colors.muted }}>Reserves</p>
                        </div>
                      </div>

                      {/* Squad Stats */}
                      <div className="p-4 rounded-2xl border" style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border }}>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium" style={{ color: currentTheme.colors.text }}>Squad Overview</span>
                          <Badge variant="outline" style={{ borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}>
                            {stats.averageRating.toFixed(1)} AVG
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          {stats.topRatedPlayers.length > 0 && (
                            <div>
                              <p className="text-xs" style={{ color: currentTheme.colors.muted }}>Key Players:</p>
                              <p className="text-sm font-medium" style={{ color: currentTheme.colors.text }}>
                                {stats.topRatedPlayers.slice(0, 2).join(', ')}
                              </p>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between text-sm">
                            <span style={{ color: currentTheme.colors.muted }}>Total Players</span>
                            <span style={{ color: currentTheme.colors.text }}>{stats.totalPlayers}</span>
                          </div>
                        </div>
                      </div>

                      {/* Performance Stats */}
                      {squad.gamesPlayed > 0 && (
                        <div className="p-4 rounded-2xl border" style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border }}>
                          <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="h-4 w-4" style={{ color: currentTheme.colors.accent }} />
                            <span className="text-sm font-medium" style={{ color: currentTheme.colors.text }}>Performance</span>
                          </div>
                          <div className="grid grid-cols-3 gap-3 text-center">
                            <div>
                              <p className="text-lg font-bold" style={{ color: currentTheme.colors.accent }}>{squad.gamesPlayed}</p>
                              <p className="text-xs" style={{ color: currentTheme.colors.muted }}>Games</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold text-green-400">{squad.wins}</p>
                              <p className="text-xs" style={{ color: currentTheme.colors.muted }}>Wins</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold" style={{ color: currentTheme.colors.primary }}>{stats.winRate.toFixed(0)}%</p>
                              <p className="text-xs" style={{ color: currentTheme.colors.muted }}>Win Rate</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Last Modified */}
                      <div className="flex items-center gap-2 text-xs" style={{ color: currentTheme.colors.muted }}>
                        <Calendar className="h-3 w-3" />
                        Modified {new Date(squad.lastModified).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Delete Confirmation Dialog */}
          <Dialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
            <DialogContent style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }} 
                           className="border-red-500/30 rounded-3xl shadow-3xl">
              <DialogHeader>
                <DialogTitle className="text-white text-xl">Delete Squad</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p style={{ color: currentTheme.colors.muted }}>
                  Are you sure you want to delete "{showDeleteDialog?.name}"? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteDialog(null)}
                    style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}
                    className="rounded-2xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => showDeleteDialog && handleDeleteSquad(showDeleteDialog)}
                    className="bg-red-500 hover:bg-red-600 text-white rounded-2xl"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Squad
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
};

export default Squads;