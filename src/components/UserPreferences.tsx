// src/components/UserPreferences.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast'; // **Import toast**
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// This structure MUST match the `defaultLayout` in `src/pages/Index.tsx`
const allDashboardComponents = [
  { id: 'overview', name: 'Dashboard Overview', default: true },
  { id: 'primaryInsight', name: 'Primary Insight Card', default: true },
  { id: 'recentRuns', name: 'Recent Runs', default: true },
  { id: 'records', name: 'All-Time Records', default: true },
  { id: 'playerMovers', name: 'Player Movers', default: true },
  { id: 'goalInvolvement', name: 'Goal Involvement', default: true },
  { id: 'clubLegends', name: 'Club Legends', default: true },
  { id: 'playerHistoryTable', name: 'Player History Table', default: true },
  { id: 'performanceRadar', name: 'Performance Radar', default: false },
  { id: 'runChunkAnalysis', name: 'Run Chunk Analysis', default: false },
  { id: 'matchTagAnalysis', name: 'Match Tag Analysis', default: false },
  { id: 'formationTracker', name: 'Formation Tracker', default: false },
  { id: 'cpsGauge', name: 'CPS Gauge', default: false },
  { id: 'xgAnalytics', name: 'xG Analytics', default: false },
  { id: 'playerConsistency', name: 'Player Consistency', default: false },
  { id: 'positionalHeatMap', name: 'Positional HeatMap', default: false },
];

// Define the layout item structure
interface DashboardLayoutItem {
  id: string;
  order: number;
}
// Define the structure for enabled components
type EnabledComponents = Record<string, boolean>;

const UserPreferences = () => {
  const { user } = useAuth();
  const { toast } = useToast(); // **Get toast function**
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [enabled, setEnabled] = useState<EnabledComponents>(() => {
    const initial: EnabledComponents = {};
    allDashboardComponents.forEach(c => {
      initial[c.id] = c.default; // Start with defaults
    });
    return initial;
  });

  // Fetch saved layout on mount
  useEffect(() => {
    const fetchLayout = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('value')
          .eq('user_id', user.id)
          .eq('key', 'dashboard_layout')
          .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
          const savedLayout = data[0].value as DashboardLayoutItem[];
          const newEnabled: EnabledComponents = {};
          allDashboardComponents.forEach(c => {
            // A component is enabled if it exists in the saved layout
            newEnabled[c.id] = savedLayout.some(item => item.id === c.id);
          });
          setEnabled(newEnabled);
        }
        // If no data, the default state is already set
      } catch (error: any) {
        toast({
          title: 'Error',
          description: `Failed to load dashboard preferences: ${error.message}`,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLayout();
  }, [user, toast]);

  const handleToggle = (id: string) => {
    setEnabled(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSavePreferences = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      // Filter the full list based on the 'enabled' state
      const newLayout: DashboardLayoutItem[] = allDashboardComponents
        .filter(component => enabled[component.id])
        .map((component, index) => ({
          id: component.id,
          order: index + 1, // Re-calculate order based on filtered list
        }));

      // Upsert the setting
      const { error } = await supabase.from('user_settings').upsert(
        {
          user_id: user.id,
          key: 'dashboard_layout',
          value: newLayout,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id, key' }
      );

      if (error) throw error;

      // **Show success toast**
      toast({
        title: 'Preferences Saved',
        description: 'Your dashboard layout has been updated. It will refresh on next visit.',
      });
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      // **Show error toast**
      toast({
        title: 'Error Saving Preferences',
        description: `Failed to save preferences: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Dashboard Preferences</CardTitle>
        <CardDescription>
          Customize your dashboard by showing or hiding components.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          // Skeletons for loading state
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between space-x-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-6 w-10 rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          // Actual Toggles
          <div className="space-y-4">
            {allDashboardComponents.map(component => (
              <div
                key={component.id}
                className="flex items-center justify-between space-x-2"
              >
                <Label htmlFor={component.id} className="text-white">
                  {component.name}
                </Label>
                <Switch
                  id={component.id}
                  checked={enabled[component.id] || false}
                  onCheckedChange={() => handleToggle(component.id)}
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button onClick={handleSavePreferences} disabled={isSaving || loading}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserPreferences;