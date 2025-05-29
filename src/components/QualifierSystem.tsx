
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTheme } from '@/hooks/useTheme';
import { QualifierRun, WeeklyPerformance } from '@/types/futChampions';
import { Trophy, Target, Clock, CheckCircle, XCircle, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QualifierSystemProps {
  weekData: WeeklyPerformance | null;
  onUpdateWeek: (updates: Partial<WeeklyPerformance>) => void;
}

const QualifierSystem = ({ weekData, onUpdateWeek }: QualifierSystemProps) => {
  const { currentTheme } = useTheme();
  const { toast } = useToast();
  const [qualifierRun, setQualifierRun] = useState<QualifierRun | null>(weekData?.qualifierRun || null);

  useEffect(() => {
    if (weekData?.qualifierRun) {
      setQualifierRun(weekData.qualifierRun);
    }
  }, [weekData]);

  const startQualifierRun = () => {
    if (!weekData) return;

    const newQualifierRun: QualifierRun = {
      id: `qualifier-${Date.now()}`,
      totalGames: 5,
      winsRequired: 2,
      games: [],
      isCompleted: false,
      qualified: false,
      startDate: new Date().toISOString()
    };

    setQualifierRun(newQualifierRun);
    onUpdateWeek({ qualifierRun: newQualifierRun });
    
    toast({
      title: "Qualifier Run Started!",
      description: "Good luck! You need 2 wins from 5 games.",
    });
  };

  const completeQualifierRun = (qualified: boolean) => {
    if (!qualifierRun) return;

    const completedRun = {
      ...qualifierRun,
      isCompleted: true,
      qualified,
      endDate: new Date().toISOString()
    };

    setQualifierRun(completedRun);
    onUpdateWeek({ qualifierRun: completedRun });

    toast({
      title: qualified ? "Qualified!" : "Qualification Failed",
      description: qualified ? "You've qualified for FUT Champions!" : "Better luck next time!",
    });
  };

  if (!weekData) {
    return (
      <Card style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}>
        <CardContent className="p-8 text-center">
          <Target className="h-16 w-16 mx-auto mb-4 opacity-50" style={{ color: currentTheme.colors.muted }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: currentTheme.colors.text }}>
            No Active Week
          </h3>
          <p style={{ color: currentTheme.colors.muted }}>
            Start a new week to access qualifiers.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!qualifierRun) {
    return (
      <Card style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
            <Trophy className="h-5 w-5" style={{ color: currentTheme.colors.primary }} />
            FUT Champions Qualifiers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: currentTheme.colors.text }}>
              Ready to Qualify?
            </h3>
            <p className="text-sm mb-4" style={{ color: currentTheme.colors.muted }}>
              Play 5 qualifier games and get 2 wins to access FUT Champions.
            </p>
            <Button 
              onClick={startQualifierRun}
              className="px-8 py-3"
              style={{ backgroundColor: currentTheme.colors.primary, color: '#ffffff' }}
            >
              <Play className="h-4 w-4 mr-2" />
              Start Qualifiers
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const gamesPlayed = qualifierRun.games.length;
  const wins = qualifierRun.games.filter(game => game.result === 'win').length;
  const losses = qualifierRun.games.filter(game => game.result === 'loss').length;
  const progress = (gamesPlayed / qualifierRun.totalGames) * 100;
  const canStillQualify = wins + (qualifierRun.totalGames - gamesPlayed) >= qualifierRun.winsRequired;

  return (
    <div className="space-y-6">
      <Card style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between" style={{ color: currentTheme.colors.text }}>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5" style={{ color: currentTheme.colors.primary }} />
              Qualifier Run Progress
            </div>
            <Badge 
              variant={qualifierRun.isCompleted ? (qualifierRun.qualified ? 'default' : 'destructive') : 'outline'}
              style={!qualifierRun.isCompleted ? { borderColor: currentTheme.colors.border, color: currentTheme.colors.text } : {}}
            >
              {qualifierRun.isCompleted 
                ? (qualifierRun.qualified ? 'Qualified' : 'Failed') 
                : `${gamesPlayed}/${qualifierRun.totalGames} Games`}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm mb-2" style={{ color: currentTheme.colors.muted }}>
              <span>Games Progress</span>
              <span>{gamesPlayed}/{qualifierRun.totalGames}</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl" style={{ backgroundColor: currentTheme.colors.surface }}>
              <div className="text-2xl font-bold" style={{ color: currentTheme.colors.accent }}>
                {wins}
              </div>
              <div className="text-sm" style={{ color: currentTheme.colors.muted }}>Wins</div>
            </div>
            
            <div className="text-center p-4 rounded-xl" style={{ backgroundColor: currentTheme.colors.surface }}>
              <div className="text-2xl font-bold" style={{ color: '#ef4444' }}>
                {losses}
              </div>
              <div className="text-sm" style={{ color: currentTheme.colors.muted }}>Losses</div>
            </div>
            
            <div className="text-center p-4 rounded-xl" style={{ backgroundColor: currentTheme.colors.surface }}>
              <div className="text-2xl font-bold" style={{ color: currentTheme.colors.primary }}>
                {qualifierRun.winsRequired - wins}
              </div>
              <div className="text-sm" style={{ color: currentTheme.colors.muted }}>Wins Needed</div>
            </div>
          </div>

          {/* Status */}
          {!qualifierRun.isCompleted && (
            <div className="flex items-center justify-center gap-2 p-4 rounded-xl" 
                 style={{ backgroundColor: canStillQualify ? currentTheme.colors.surface : '#ef444420' }}>
              {canStillQualify ? (
                <>
                  <CheckCircle className="h-5 w-5" style={{ color: currentTheme.colors.accent }} />
                  <span style={{ color: currentTheme.colors.text }}>Qualification still possible</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-400" />
                  <span style={{ color: currentTheme.colors.text }}>Qualification no longer possible</span>
                </>
              )}
            </div>
          )}

          {/* Recent Games */}
          {qualifierRun.games.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-3" style={{ color: currentTheme.colors.text }}>
                Recent Qualifier Games
              </h4>
              <div className="space-y-2">
                {qualifierRun.games.slice(-3).map((game, index) => (
                  <div key={game.id} className="flex items-center justify-between p-3 rounded-lg" 
                       style={{ backgroundColor: currentTheme.colors.surface }}>
                    <div className="flex items-center gap-3">
                      <Badge variant={game.result === 'win' ? 'default' : 'destructive'}>
                        {game.result === 'win' ? 'W' : 'L'}
                      </Badge>
                      <span className="text-sm" style={{ color: currentTheme.colors.text }}>
                        {game.scoreLine}
                      </span>
                    </div>
                    <span className="text-xs" style={{ color: currentTheme.colors.muted }}>
                      Game {game.gameNumber}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QualifierSystem;
