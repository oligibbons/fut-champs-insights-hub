
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useDataSync } from '@/hooks/useDataSync';
import { useToast } from '@/hooks/use-toast';
import { Target, Save, TrendingUp, Trophy, Shield, Users } from 'lucide-react';

const WeeklyTargets = () => {
  const { getCurrentWeek, updateWeek } = useDataSync();
  const { toast } = useToast();
  const currentWeek = getCurrentWeek();
  
  const [targets, setTargets] = useState({
    wins: 11,
    goalsScored: undefined as number | undefined,
    cleanSheets: undefined as number | undefined,
    minimumRank: undefined as number | undefined
  });
  
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (currentWeek?.winTarget) {
      setTargets({
        wins: currentWeek.winTarget.wins || 11,
        goalsScored: currentWeek.winTarget.goalsScored,
        cleanSheets: currentWeek.winTarget.cleanSheets,
        minimumRank: currentWeek.winTarget.minimumRank
      });
    }
  }, [currentWeek]);

  const handleSaveTargets = async () => {
    if (!currentWeek) return;
    
    try {
      const updatedWeek = {
        ...currentWeek,
        winTarget: targets
      };
      
      await updateWeek(currentWeek.id, updatedWeek);
      setIsEditing(false);
      
      toast({
        title: "Targets Updated",
        description: "Your weekly targets have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update targets. Please try again.",
        variant: "destructive"
      });
    }
  };

  const calculateProgress = (current: number, target: number | undefined) => {
    if (!target) return 0;
    return Math.min(100, (current / target) * 100);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-fifa-green';
    if (progress >= 75) return 'bg-fifa-gold';
    if (progress >= 50) return 'bg-fifa-blue';
    return 'bg-fifa-red';
  };

  if (!currentWeek) {
    return (
      <Card className="glass-card">
        <CardContent className="text-center py-8">
          <Target className="h-12 w-12 mx-auto mb-4 text-gray-500" />
          <p className="text-gray-400">No active week found. Start a new week to set targets.</p>
        </CardContent>
      </Card>
    );
  }

  const cleanSheets = currentWeek.games.filter(game => 
    parseInt(game.scoreLine.split('-')[1]) === 0
  ).length;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-fifa-gold" />
            Weekly Targets
          </div>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant="outline"
            size="sm"
            className="border-fifa-blue text-fifa-blue hover:bg-fifa-blue/10"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Wins Target</Label>
                <Input
                  type="number"
                  min="1"
                  max="15"
                  value={targets.wins}
                  onChange={(e) => setTargets(prev => ({ 
                    ...prev, 
                    wins: parseInt(e.target.value) || 11 
                  }))}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <Label className="text-white">Goals Scored Target (Optional)</Label>
                <Input
                  type="number"
                  min="0"
                  value={targets.goalsScored || ''}
                  onChange={(e) => setTargets(prev => ({ 
                    ...prev, 
                    goalsScored: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  placeholder="e.g. 25"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <Label className="text-white">Clean Sheets Target (Optional)</Label>
                <Input
                  type="number"
                  min="0"
                  max="15"
                  value={targets.cleanSheets || ''}
                  onChange={(e) => setTargets(prev => ({ 
                    ...prev, 
                    cleanSheets: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  placeholder="e.g. 5"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <Label className="text-white">Minimum Rank Target (Optional)</Label>
                <Input
                  type="number"
                  min="1"
                  value={targets.minimumRank || ''}
                  onChange={(e) => setTargets(prev => ({ 
                    ...prev, 
                    minimumRank: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  placeholder="e.g. 45"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>
            
            <Button 
              onClick={handleSaveTargets}
              className="w-full bg-fifa-green hover:bg-fifa-green/80"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Targets
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Wins Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-fifa-gold" />
                  <span className="text-white font-medium">Wins</span>
                </div>
                <Badge variant={currentWeek.totalWins >= targets.wins ? "default" : "secondary"}>
                  {currentWeek.totalWins} / {targets.wins}
                </Badge>
              </div>
              <Progress 
                value={calculateProgress(currentWeek.totalWins, targets.wins)} 
                className="h-2"
              />
            </div>

            {/* Goals Progress */}
            {targets.goalsScored && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-fifa-green" />
                    <span className="text-white font-medium">Goals Scored</span>
                  </div>
                  <Badge variant={currentWeek.totalGoals >= targets.goalsScored ? "default" : "secondary"}>
                    {currentWeek.totalGoals} / {targets.goalsScored}
                  </Badge>
                </div>
                <Progress 
                  value={calculateProgress(currentWeek.totalGoals, targets.goalsScored)} 
                  className="h-2"
                />
              </div>
            )}

            {/* Clean Sheets Progress */}
            {targets.cleanSheets && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-fifa-blue" />
                    <span className="text-white font-medium">Clean Sheets</span>
                  </div>
                  <Badge variant={cleanSheets >= targets.cleanSheets ? "default" : "secondary"}>
                    {cleanSheets} / {targets.cleanSheets}
                  </Badge>
                </div>
                <Progress 
                  value={calculateProgress(cleanSheets, targets.cleanSheets)} 
                  className="h-2"
                />
              </div>
            )}

            {/* Rank Target */}
            {targets.minimumRank && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-fifa-purple" />
                    <span className="text-white font-medium">Target Rank</span>
                  </div>
                  <Badge variant="outline">
                    Reach Rank {targets.minimumRank}
                  </Badge>
                </div>
              </div>
            )}

            {/* Overall Progress Summary */}
            <div className="pt-4 border-t border-gray-600">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">Overall Progress</span>
                <span className="text-fifa-gold font-bold">
                  {Math.round(calculateProgress(currentWeek.totalWins, targets.wins))}%
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeeklyTargets;
