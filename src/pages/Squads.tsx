
import { useState } from 'react';
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
import { Plus, Users, Trophy, Edit, Copy, Trash2, Star, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Squads = () => {
  const { squads, saveSquad, deleteSquad } = useSquadData();
  const { activeAccount } = useAccountData();
  const { toast } = useToast();
  
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingSquad, setEditingSquad] = useState<Squad | undefined>();
  const [showDeleteDialog, setShowDeleteDialog] = useState<Squad | null>(null);

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
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      gamesPlayed: 0,
      wins: 0,
      losses: 0
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
              <h1 className="text-4xl font-bold gradient-text mb-3">Squad Management</h1>
              <p className="text-gray-400 text-lg">Build and manage your ultimate teams for {activeAccount}</p>
            </div>
            <Button
              onClick={() => setShowBuilder(true)}
              className="modern-button-primary text-lg px-8 py-4 rounded-2xl shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Squad
            </Button>
          </div>

          {squads.length === 0 ? (
            <Card className="glass-card rounded-3xl shadow-depth-lg border-0 animate-fade-in">
              <CardContent className="text-center py-16">
                <div className="w-24 h-24 bg-fifa-purple/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Users className="h-12 w-12 text-fifa-purple/60" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">No Squads Created</h3>
                <p className="text-gray-400 text-lg max-w-md mx-auto mb-6">
                  Start building your ultimate team with our advanced squad builder. Choose formations, assign players, and create winning combinations.
                </p>
                <Button
                  onClick={() => setShowBuilder(true)}
                  className="modern-button-primary text-lg px-8 py-4 rounded-2xl"
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
                return (
                  <Card key={squad.id} className="glass-card rounded-3xl shadow-depth-lg border-0 hover:scale-105 transition-all duration-300 group">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <CardTitle className="text-white text-xl group-hover:text-fifa-blue transition-colors">
                            {squad.name}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-fifa-blue/20 text-fifa-blue border-fifa-blue/30 rounded-xl">
                              {squad.formation}
                            </Badge>
                            {completeness.isComplete && (
                              <Badge className="bg-fifa-green/20 text-fifa-green border-fifa-green/30 rounded-xl">
                                <Star className="h-3 w-3 mr-1" />
                                Complete
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditSquad(squad)}
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopySquad(squad)}
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowDeleteDialog(squad)}
                            className="bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-xl"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Squad Stats */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-fifa-blue">{completeness.starting}</p>
                          <p className="text-xs text-gray-400">Starting XI</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-fifa-purple">{completeness.substitutes}</p>
                          <p className="text-xs text-gray-400">Substitutes</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-fifa-green">{completeness.reserves}</p>
                          <p className="text-xs text-gray-400">Reserves</p>
                        </div>
                      </div>

                      {/* Performance Stats */}
                      {squad.gamesPlayed > 0 && (
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Performance</span>
                            <span className="text-fifa-gold font-medium">
                              {squad.gamesPlayed} games
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-fifa-green">{squad.wins}W</span>
                            <span className="text-fifa-red">{squad.losses}L</span>
                            <span className="text-fifa-blue">
                              {((squad.wins / squad.gamesPlayed) * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Last Modified */}
                      <div className="flex items-center gap-2 text-xs text-gray-400">
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
            <DialogContent className="glass-card border-red-500/30 rounded-3xl shadow-3xl">
              <DialogHeader>
                <DialogTitle className="text-white text-xl">Delete Squad</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-gray-300">
                  Are you sure you want to delete "{showDeleteDialog?.name}"? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteDialog(null)}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-2xl"
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
