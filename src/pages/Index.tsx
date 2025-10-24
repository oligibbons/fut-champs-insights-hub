import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
// Removed react-beautiful-dnd imports
import DashboardOverview from '@/components/DashboardOverview';
import RecentRuns from '@/components/RecentRuns';
import TopPerformers from '@/components/TopPerformers';
import LowestRatedPlayers from '@/components/LowestRatedPlayers';
import ClubLegends from '@/components/ClubLegends';
import FUTTrackrRecords from '@/components/FUTTrackrRecords';
import DashboardSection from '@/components/DashboardSection';
import { useToast } from '@/hooks/use-toast';
// Removed useMobile import

interface DashboardItem {
  id: string;
  component: React.FC; 
  order: number;
}

const componentsMap: Record<string, React.FC> = {
  overview: DashboardOverview,
  recentRuns: RecentRuns,
  topPerformers: TopPerformers,
  lowestRated: LowestRatedPlayers,
  clubLegends: ClubLegends,
  records: FUTTrackrRecords,
};

const defaultLayout: DashboardItem[] = [
  { id: 'overview', component: componentsMap.overview, order: 1 },
  { id: 'recentRuns', component: componentsMap.recentRuns, order: 2 },
  { id: 'topPerformers', component: componentsMap.topPerformers, order: 3 },
  { id: 'lowestRated', component: componentsMap.lowestRated, order: 4 },
  { id: 'clubLegends', component: componentsMap.clubLegends, order: 5 },
  { id: 'records', component: componentsMap.records, order: 6 },
];

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  // Removed isMobile state
  const [layout, setLayout] = useState<DashboardItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLayout();
  }, [user]);

  const fetchLayout = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('dashboard_layout')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error; 

      if (data?.dashboard_layout) {
        const savedLayout = data.dashboard_layout as { id: string; order: number }[];
        const loadedLayout = savedLayout
          .map(item => {
            const component = componentsMap[item.id];
            if (!component) return null; 
            return { ...item, component };
          })
          .filter((item): item is DashboardItem => item !== null) 
          .sort((a, b) => a.order - b.order); 
        
        defaultLayout.forEach(defaultItem => {
            if (!loadedLayout.some(loadedItem => loadedItem.id === defaultItem.id)) {
                loadedLayout.push({...defaultItem}); 
            }
        });
        
        setLayout(loadedLayout.sort((a, b) => a.order - b.order));
          
      } else {
        setLayout([...defaultLayout].sort((a, b) => a.order - b.order));
      }
    } catch (err: any) {
      toast({ title: "Error", description: `Failed to load dashboard layout: ${err.message}`, variant: "destructive" });
      setLayout([...defaultLayout].sort((a, b) => a.order - b.order)); // Fallback
    } finally {
      setLoading(false);
    }
  };

  // Removed saveLayout function as it's no longer needed without DnD
  // Removed onDragEnd function

  if (loading) {
    return <div>Loading dashboard...</div>; 
  }

  return (
    <div className="space-y-6">
      {/* Simplified Rendering - No Drag and Drop */}
      {layout.map((item) => (
         <DashboardSection 
            key={item.id} 
            title={item.id.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            // No dragHandleProps needed anymore
          >
            <item.component />
         </DashboardSection>
      ))}
      {/* End Simplified Rendering */}
    </div>
  );
};

export default Dashboard;
