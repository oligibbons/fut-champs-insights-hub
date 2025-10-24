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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid, Users, Trophy } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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
                .select('value')
                .eq('user_id', user.id)
                .eq('key', 'dashboard_layout')
                .limit(1); 

            if (error) throw error;

            if (data && data.length > 0 && data[0].value) {
                 const savedLayout = data[0].value as { id: string; order: number }[];
                let loadedLayout = savedLayout
                    .map(item => {
                        const component = componentsMap[item.id];
                        return component ? { ...item, component } : null;
                    })
                    .filter((item): item is DashboardItem => item !== null);

                // Add any new components from defaultLayout that aren't in the saved layout
                defaultLayout.forEach(defaultItem => {
                    if (!loadedLayout.some(item => item.id === defaultItem.id)) {
                        loadedLayout.push({...defaultItem});
                    }
                });

                // Filter out any components that no longer exist in componentsMap
                loadedLayout = loadedLayout.filter(item => componentsMap[item.id]);
                setLayout(loadedLayout.sort((a, b) => a.order - b.order));
            } else {
                // No saved layout, use the default
                setLayout([...defaultLayout].sort((a, b) => a.order - b.order));
            }
        } catch (err: any) {
            toast({ title: "Error", description: `Failed to load dashboard layout: ${err.message}`, variant: "destructive" });
            setLayout([...defaultLayout].sort((a, b) => a.order - b.order));
        } finally {
            setLoading(false);
        }
    };

    // Helper function to find and render a specific dashboard section
    const findAndRenderSection = (id: string) => {
        const item = layout.find(item => item.id === id);
        
        if (!item) {
            // This case handles if a component is removed from the map 
            // but still exists in a user's saved layout.
            return null; 
        }

        return (
            <DashboardSection 
              key={item.id} 
              title={item.id.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            >
                <item.component />
            </DashboardSection>
        );
    };

    // Loading skeleton for the new tabbed layout
    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-12 w-80 rounded-2xl" />
                <div className="space-y-6">
                    <Skeleton className="h-64 w-full rounded-2xl" />
                    <Skeleton className="h-48 w-full rounded-2xl" />
                </div>
            </div>
        );
    }

    return (
        <Tabs defaultValue="overview" className="space-y-6">
            {/* STYLED TAB SWITCHER */}
            <TabsList className="glass-card rounded-2xl shadow-xl border-0 p-2 h-auto">
                <TabsTrigger value="overview" className="rounded-xl flex-1 flex gap-2 items-center">
                    <LayoutGrid className="h-4 w-4" />
                    Overview
                </TabsTrigger>
                <TabsTrigger value="players" className="rounded-xl flex-1 flex gap-2 items-center">
                    <Users className="h-4 w-4" />
                    Player Hub
                </TabsTrigger>
                <TabsTrigger value="records" className="rounded-xl flex-1 flex gap-2 items-center">
                    <Trophy className="h-4 w-4" />
                    Records
                </TabsTrigger>
            </TabsList>

            {/* TAB CONTENT */}
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
                {findAndRenderSection('overview')}
                {findAndRenderSection('recentRuns')}
            </TabsContent>

            {/* Player Hub Tab */}
            <TabsContent value="players" className="space-y-6">
                {findAndRenderSection('topPerformers')}
                {findAndRenderSection('lowestRated')}
                {findAndRenderSection('clubLegends')}
            </TabsContent>

            {/* Records Tab */}
            <TabsContent value="records" className="space-y-6">
                {findAndRenderSection('records')}
            </TabsContent>

        </Tabs>
    );
};

export default Dashboard;
