
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import GameRecordForm from '@/components/GameRecordForm';
import CurrentRunStats from '@/components/CurrentRunStats';
import DashboardSection from '@/components/DashboardSection';
import { useDataSync } from '@/hooks/useDataSync';
import { Plus, Trophy, Target, TrendingUp, Play } from 'lucide-react';

const CurrentRun = () => {
  const { getCurrentWeek, weeklyData, addNewWeek } = useDataSync();
  const [showGameForm, setShowGameForm] = useState(false);
  
  const currentWeek = getCurrentWeek();

  const handleStartNewRun = () => {
    const newWeek = addNewWeek();
    console.log('Started new run:', newWeek);
  };

  const getRunStatus = () => {
    if (!currentWeek) return 'No Active Run';
    if (currentWeek.isCompleted) return 'Run Completed';
    return 'Run In Progress';
  };

  const getRunProgress = () => {
    if (!currentWeek) return 0;
    return (currentWeek.games.length / 15) * 100; // Assuming 15 games per run
  };

  if (!currentWeek) {
    return (
      <div className="min-h-screen">
        <Navigation />
        
        <main className="lg:ml-64 p-4 lg:p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-fifa-blue/20">
                  <Trophy className="h-8 w-8 text-fifa-blue" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white page-header">Current Run</h1>
                  <p className="text-gray-400 mt-1">Track your active Champions League run</p>
                </div>
              </div>
            </div>

            {/* No Active Run */}
            <Card className="glass-card">
              <CardContent className="text-center py-16">
                <Trophy className="h-20 w-20 mx-auto mb-6 text-gray-400 opacity-50" />
                <h3 className="text-2xl font-bold text-white mb-4">No Active Run</h3>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  Start a new Champions League run to begin tracking your performance and statistics.
                </p>
                <Button onClick={handleStartNewRun} size="lg" className="gap-2">
                  <Play className="h-5 w-5" />
                  Start New Run
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="lg:ml-64 p-4 lg:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-fifa-blue/20">
                <Trophy className="h-8 w-8 text-fifa-blue" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white page-header">Current Run</h1>
                <p className="text-gray-400 mt-1">Week {currentWeek.weekNumber} • {getRunStatus()}</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              {!currentWeek.isCompleted && (
                <Button onClick={() => setShowGameForm(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Game
                </Button>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="metric-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-fifa-green text-sm">
                  <Trophy className="h-4 w-4" />
                  Games Played
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-fifa-green font-bold text-2xl">{currentWeek.games.length}</p>
                <p className="text-xs text-gray-400">of 15 total</p>
              </CardContent>
            </Card>

            <Card className="metric-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-fifa-blue text-sm">
                  <Target className="h-4 w-4" />
                  Win Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-fifa-blue font-bold text-2xl">
                  {currentWeek.games.length > 0 
                    ? ((currentWeek.totalWins / currentWeek.games.length) * 100).toFixed(1)
                    : '0'
                  }%
                </p>
                <p className="text-xs text-gray-400">{currentWeek.totalWins}W {currentWeek.totalLosses}L</p>
              </CardContent>
            </Card>

            <Card className="metric-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-fifa-purple text-sm">
                  <TrendingUp className="h-4 w-4" />
                  Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-fifa-purple font-bold text-2xl">{currentWeek.totalGoals}</p>
                <p className="text-xs text-gray-400">scored</p>
              </CardContent>
            </Card>

            <Card className="metric-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-fifa-gold text-sm">
                  <Trophy className="h-4 w-4" />
                  Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-fifa-gold font-bold text-2xl">{getRunProgress().toFixed(0)}%</p>
                <p className="text-xs text-gray-400">complete</p>
              </CardContent>
            </Card>
          </div>

          {/* Run Status */}
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Run Status</CardTitle>
                <Badge 
                  variant={currentWeek.isCompleted ? "default" : "secondary"}
                  className={currentWeek.isCompleted ? "bg-fifa-green" : "bg-fifa-blue"}
                >
                  {getRunStatus()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
                <div 
                  className="bg-fifa-blue h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${getRunProgress()}%` }}
                ></div>
              </div>
              <p className="text-gray-400 text-sm">
                {currentWeek.games.length} of 15 games completed
              </p>
            </CardContent>
          </Card>

          {/* Current Run Statistics */}
          <DashboardSection settingKey="showTopPerformers" settingsSection="currentWeekSettings">
            <CurrentRunStats />
          </DashboardSection>

          {/* Game Record Form Modal */}
          {showGameForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-900 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
