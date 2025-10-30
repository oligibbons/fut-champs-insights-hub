import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/hooks/useTheme';
import { WeeklyPerformance } from '@/types/futChampions';
import { Settings, Target, Calendar, Trophy, Zap, Users, Edit3 } from 'lucide-react';
import { toast } from 'sonner'; // **MODIFIED: Import toast from sonner**
import WeekNaming from './WeekNaming';
import QualifierSystem from './QualifierSystem';

interface WeekSettingsProps {
  weekData: WeeklyPerformance | null;
  onUpdateWeek: (updates: Partial<WeeklyPerformance>) => void;
}

const WeekSettings = ({ weekData, onUpdateWeek }: WeekSettingsProps) => {
  const { currentTheme } = useTheme();
  // **MODIFIED: Removed useToast hook**
  const [targetRank, setTargetRank] = useState(weekData?.targetRank || 'Rank VII');
  const [targetWins, setTargetWins] = useState(weekData?.targetWins || 7);
  const [personalNotes, setPersonalNotes] = useState(weekData?.personalNotes || '');

  // Update local state when weekData changes
  useEffect(() => {
    if (weekData) {
      setTargetRank(weekData.targetRank || 'Rank VII');
      setTargetWins(weekData.targetWins || 7);
      setPersonalNotes(weekData.personalNotes || '');
    }
  }, [weekData]);

  const ranks = [
    { name: 'Rank I', wins: 15 },
    { name: 'Rank II', wins: 13 },
    { name: 'Rank III', wins: 11 },
    { name: 'Rank IV', wins: 10 },
    { name: 'Rank V', wins: 9 },
    { name: 'Rank VI', wins: 8 },
    { name: 'Rank VII', wins: 7 },
    { name: 'Rank VIII', wins: 6 },
    { name: 'Rank IX', wins: 4 },
    { name: 'Rank X', wins: 2 }
  ];

  const handleSetTarget = () => {
    if (!weekData) return;
    
    const selectedRank = ranks.find(r => r.name === targetRank);
    const winsNeeded = selectedRank ? selectedRank.wins : targetWins;
    
    onUpdateWeek({
      targetRank,
      targetWins: winsNeeded,
      personalNotes
    });
    
    // **MODIFIED: Use sonner toast**
    toast.success("Target Set!", {
      description: `Target set to ${targetRank} (${winsNeeded} wins)`,
    });
  };

  if (!weekData) {
    return (
      <Card style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}>
        <CardContent className="p-8 text-center">
          <Settings className="h-16 w-16 mx-auto mb-4 opacity-50" style={{ color: currentTheme.colors.muted }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: currentTheme.colors.text }}>
            No Active Week
          </h3>
          <p style={{ color: currentTheme.colors.muted }}>
            Start a new week from the Current Week page to access settings and targets.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Tabs defaultValue="general" style={{ backgroundColor: 'transparent' }}>
        <TabsList className="grid w-full grid-cols-3" style={{ backgroundColor: currentTheme.colors.surface }}>
          <TabsTrigger value="general" style={{ color: currentTheme.colors.text }}>General</TabsTrigger>
          <TabsTrigger value="qualifiers" style={{ color: currentTheme.colors.text }}>Qualifiers</TabsTrigger>
          <TabsTrigger value="targets" style={{ color: currentTheme.colors.text }}>Targets</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          {/* Week Naming */}
          <WeekNaming weekData={weekData} onUpdateWeek={onUpdateWeek} />

          {/* Week Notes */}
          <Card style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
                <Edit3 className="h-5 w-5" style={{ color: currentTheme.colors.accent }} />
                Week Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label style={{ color: currentTheme.colors.text }}>Personal Notes</Label>
                  <textarea
                    className="w-full p-3 rounded-lg resize-none"
                    rows={4}
                    placeholder="Add notes about this week's goals, formation changes, or anything else..."
                    value={personalNotes}
                    onChange={(e) => setPersonalNotes(e.target.value)}
                    style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}
                  />
                </div>
                
                {/* **MODIFIED: Added sonner toast on click** */}
                <Button 
                  onClick={() => {
                    onUpdateWeek({ personalNotes });
                    toast.success("Notes Saved", {
                      description: "Your personal notes have been updated."
                    });
                  }}
                  variant="outline"
                  style={{ borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}
                >
                  Save Notes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Week Info */}
          <Card style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
                <Zap className="h-5 w-5" style={{ color: currentTheme.colors.secondary }} />
                Week Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: currentTheme.colors.primary }}>
                    {weekData.games.length}/15
                  </div>
                  <div className="text-sm" style={{ color: currentTheme.colors.muted }}>Games Played</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: currentTheme.colors.accent }}>
                    {weekData.totalWins}
                  </div>
                  <div className="text-sm" style={{ color: currentTheme.colors.muted }}>Current Wins</div>
                </div>
              </div>
              
              <div className="mt-4 flex justify-center">
                <Badge 
                  variant="outline"
                  style={{ borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}
                >
                  {weekData.isCompleted ? 'Week Completed' : 'In Progress'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qualifiers" className="space-y-6">
          <QualifierSystem weekData={weekData} onUpdateWeek={onUpdateWeek} />
        </TabsContent>

        <TabsContent value="targets" className="space-y-6">
          {/* Target Setting */}
          <Card style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
                <Target className="h-5 w-5" style={{ color: currentTheme.colors.primary }} />
                Week Target
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label style={{ color: currentTheme.colors.text }}>Target Rank</Label>
                  <Select value={targetRank} onValueChange={setTargetRank}>
                    <SelectTrigger style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}>
                      {ranks.map(rank => (
                        <SelectItem key={rank.name} value={rank.name} style={{ color: currentTheme.colors.text }}>
                          {rank.name} ({rank.wins} wins)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label style={{ color: currentTheme.colors.text }}>Custom Wins Target</Label>
                  <Input
                    type="number"
                    min="1"
                    max="15"
                    value={targetWins}
                    onChange={(e) => setTargetWins(parseInt(e.target.value))}
                    style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleSetTarget} 
                className="w-full"
                style={{ backgroundColor: currentTheme.colors.primary, color: '#ffffff' }}
              >
                <Trophy className="h-4 w-4 mr-2" />
                Set Target
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WeekSettings;