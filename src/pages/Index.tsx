import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import DashboardOverview from '@/components/DashboardOverview';
import RecentRuns from '@/components/RecentRuns';
import TopPerformers from '@/components/TopPerformers';
import LowestRatedPlayers from '@/components/LowestRatedPlayers';
import ClubLegends from '@/components/ClubLegends';
import FUTTrackrRecords from '@/components/FUTTrackrRecords';
import DashboardSection from '@/components/DashboardSection';
import { useToast } from '@/hooks/use-toast';
import { useMobile } from '@/hooks/use-mobile'; // <-- Import useMobile

// Define the structure for dashboard layout items
interface DashboardItem {
  id: string;
  component: React.FC; // Component type
  order: number;
  // Add any other props needed by DashboardSection if necessary
}

// Define your dashboard components
const componentsMap: Record<string, React.FC> = {
  overview: DashboardOverview,
  recentRuns: RecentRuns,
  topPerformers: TopPerformers,
  lowestRated: LowestRatedPlayers,
  clubLegends: ClubLegends,
  records: FUTTrackrRecords,
  // Add other components here as needed
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
  const isMobile = useMobile(); // <-- Use the hook
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

      if (error && error.code !== 'PGRST116') throw error; // Ignore 'No rows found'

      if (data?.dashboard_layout) {
        // Map saved IDs/order to the full DashboardItem structure
        const savedLayout = data.dashboard_layout as { id: string; order: number }[];
        const loadedLayout = savedLayout
          .map(item => {
            const component = componentsMap[item.id];
            if (!component) return null; // Handle case where component might not exist anymore
            return { ...item, component };
          })
          .filter((item): item is DashboardItem => item !== null) // Filter out nulls
          .sort((a, b) => a.order - b.order); // Ensure sorted by order
        
        // Add any missing default components
        defaultLayout.forEach(defaultItem => {
            if (!loadedLayout.some(loadedItem => loadedItem.id === defaultItem.id)) {
                // Find appropriate order (append or insert based on default order)
                loadedLayout.push({...defaultItem}); 
            }
        });
        
        // Ensure final sort
        setLayout(loadedLayout.sort((a, b) => a.order - b.order));
          
      } else {
        // No layout saved, use default and sort it
        setLayout([...defaultLayout].sort((a, b) => a.order - b.order));
      }
    } catch (err: any) {
      toast({ title: "Error", description: `Failed to load dashboard layout: ${err.message}`, variant: "destructive" });
      setLayout([...defaultLayout].sort((a, b) => a.order - b.order)); // Fallback to default on error
    } finally {
      setLoading(false);
    }
  };

  const saveLayout = async (newLayout: DashboardItem[]) => {
    if (!user) return;
    // Only save id and order
    const layoutToSave = newLayout.map(({ id, order }) => ({ id, order }));
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({ user_id: user.id, dashboard_layout: layoutToSave }, { onConflict: 'user_id' });

      if (error) throw error;
      toast({ title: "Success", description: "Dashboard layout saved." });
    } catch (err: any) {
      toast({ title: "Error", description: `Failed to save dashboard layout: ${err.message}`, variant: "destructive" });
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;

    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    const reorderedLayout = Array.from(layout);
    const [movedItem] = reorderedLayout.splice(source.index, 1);
    reorderedLayout.splice(destination.index, 0, movedItem);

    // Update order property based on new index
    const updatedLayout = reorderedLayout.map((item, index) => ({
      ...item,
      order: index + 1,
    }));

    setLayout(updatedLayout);
    saveLayout(updatedLayout);
  };

  if (loading) {
    return <div>Loading dashboard...</div>; // Or a skeleton loader
  }

  return (
    <div className="space-y-6">
      {/* --- Conditionally Render DragDropContext --- */}
      {!isMobile ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="dashboardSections">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-6"
              >
                {layout.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                      >
                        <DashboardSection title={item.id.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} dragHandleProps={provided.dragHandleProps}>
                          <item.component />
                        </DashboardSection>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        // --- Render without Drag-and-Drop on Mobile ---
        <div className="space-y-6">
          {layout.map((item) => (
             <DashboardSection key={item.id} title={item.id.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}>
                <item.component />
             </DashboardSection>
          ))}
        </div>
      )}
      {/* --- End Conditional Rendering --- */}
    </div>
  );
};

export default Dashboard;
