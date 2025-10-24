import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardOverview from '@/components/DashboardOverview';
import RecentRuns from '@/components/RecentRuns';
import TopPerformers from '@/components/TopPerformers';
import LowestRatedPlayers from '@/components/LowestRatedPlayers';
import ClubLegends from '@/components/ClubLegends';
import { FUTTrackrRecords } from '@/components/FUTTrackrRecords';
import DashboardSection from '@/components/DashboardSection';
import { useToast } from '@/hooks/use-toast';
// --- FIX: Removed all dnd-kit, useSortable, and use-mobile imports ---

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

// --- FIX: Removed SortableDashboardSection wrapper ---

const Dashboard = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [layout, setLayout] = useState<DashboardItem[]>([]);
    const [loading, setLoading] = useState(true);

    // --- FIX: Removed sensor setup and useMobile hook ---

    useEffect(() => {
        fetchLayout();
    }, [user]);

    const fetchLayout = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // --- FIX 1: Use .limit(1) instead of .single() to prevent 406 error ---
            const { data, error } = await supabase
                .from('user_settings')
                .select('value')
                .eq('user_id', user.id)
                .eq('key', 'dashboard_layout')
                .limit(1); // Get an array of 0 or 1 items

            // --- FIX 2: Simplified error check ---
            if (error) throw error;

            // --- FIX 3: Check if data array exists and has an item ---
            if (data && data.length > 0 && data[0].value) {
                 const savedLayout = data[0].value as { id: string; order: number }[];
                let loadedLayout = savedLayout
                    .map(item => {
                        const component = componentsMap[item.id];
                        return component ? { ...item, component } : null;
                    })
                    .filter((item): item is DashboardItem => item !== null);

                defaultLayout.forEach(defaultItem => {
                    if (!loadedLayout.some(item => item.id === defaultItem.id)) {
                        loadedLayout.push({...defaultItem});
                    }
                });

                loadedLayout = loadedLayout.filter(item => componentsMap[item.id]);
                setLayout(loadedLayout.sort((a, b) => a.order - b.order));
            } else {
                setLayout([...defaultLayout].sort((a, b) => a.order - b.order));
            }
        } catch (err: any) {
            toast({ title: "Error", description: `Failed to load dashboard layout: ${err.message}`, variant: "destructive" });
            setLayout([...defaultLayout].sort((a, b) => a.order - b.order));
        } finally {
            setLoading(false);
        }
    };

    // --- FIX: Removed saveLayout and handleDragEnd functions ---

    if (loading) {
        return <div>Loading dashboard...</div>;
    }

    return (
        // --- FIX: Removed DndContext and SortableContext wrappers ---
        <div className="space-y-6">
            {layout.map((item) => (
               // --- FIX: Render DashboardSection directly, without sortable wrapper ---
               <DashboardSection 
                 key={item.id} 
                 title={item.id.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                 // dragHandleProps is removed, so the handle won't show
               >
                   <item.component />
               </DashboardSection>
            ))}
        </div>
    );
};

export default Dashboard;
