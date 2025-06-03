
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import GameRecordForm from '@/components/GameRecordForm';
import CurrentRunStats from '@/components/CurrentRunStats';
import { useDataSync } from '@/hooks/useDataSync';
import { useAccountData } from '@/hooks/useAccountData';
import { Plus, Trophy, Target, TrendingUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const CurrentRun = () => {
  const { getCurrentWeek } = useDataSync();
  const { addNewWeek } = useAccountData();
  const [showGameForm, setShowGameForm] = useState(false);
  
  const currentWeek = getCurrentWeek();

  const handleStartNewWeek = () => {
    const newWeek = addNewWeek();
    toast({
      title: "New Week Started!",
      description: `Week ${newWeek.weekNumber} is now active.`,
    });
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="lg:ml-64 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-fifa-purple/20">
                <Trophy className="h-8 w-8 text-fifa-purple" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white page-header">Current Run</h1>
                <p className="text-gray-400 mt-1">Track your active FUT Champions weekend</p>
              </div>
            </div>
            
            {currentWeek ? (
              <Button 
                onClick={() => setShowGameForm(true)}
                className="bg-fifa-green hover:bg-fifa-green/80"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Game
              </Button>
            ) : (
              <Button 
                onClick={handleStartNewWeek}
                className="bg-fifa-blue hover:bg-fifa-blue/80"
              >
                <Plus className="h-4 w-4 mr-2" />
                Start New Week
              </Button>
            )}
          </div>

          {/* Current Week Overview */}
          {currentWeek ? (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Week {currentWeek.weekNumber} Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-fifa-green">{currentWeek.totalWins}</div>
                    <div className="text-sm text-gray-400">Wins</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-fifa-red">{currentWeek.totalLosses}</div>
                    <div className="text-sm text-gray-400">Losses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-fifa-blue">{currentWeek.games.length}/15</div>
                    <div className="text-sm text-gray-400">Games Played</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-fifa-gold">
                      {currentWeek.games.length > 0 ? ((currentWeek.totalWins / currentWeek.games.length) * 100).toFixed(1) : 0}%
                    </div>
                    <div className="text-sm text-gray-400">Win Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-card">
              <CardContent className="text-center py-12">
                <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-400 opacity-50" />
                <h3 className="text-xl font-medium text-white mb-2">No Active Week</h3>
                <p className="text-gray-400 mb-6">Start a new FUT Champions week to begin tracking your performance.</p>
                <Button 
                  onClick={handleStartNewWeek}
                  className="bg-fifa-blue hover:bg-fifa-blue/80"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Start New Week
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Current Run Stats */}
          <CurrentRunStats />

          {/* Game Record Form Modal */}
          {showGameForm && currentWeek && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-slate-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <GameRecordForm 
                  weekId={currentWeek.id}
                  onClose={() => setShowGameForm(false)}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CurrentRun;
