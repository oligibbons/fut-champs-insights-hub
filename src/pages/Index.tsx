import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardOverview from '@/components/DashboardOverview';
import RecentRuns from '@/components/RecentRuns';
import ClubLegends from '@/components/ClubLegends';
import { FUTTrackrRecords } from '@/components/FUTTrackrRecords';
import DashboardSection from '@/components/DashboardSection';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// --- FIX: Add 'BarChart3' icon for new tab ---
import { LayoutGrid, Users, BarChart3 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import PlayerMovers from '@/components/PlayerMovers';
import PlayerHistoryTable from '@/components/PlayerHistoryTable';
// --- FIX: Import our new components ---
import XGAnalytics from '@/components/XGAnalytics';
import PlayerConsistencyChart from '@/components/PlayerConsistencyChart';

interface DashboardItem {
    id: string;
    component: React.FC;
    order: number;
}

const componentsMap: Record<string, React.FC> = {
    overview: DashboardOverview,
    recentRuns: RecentRuns,
    records: FUTTrackrRecords,
    playerMovers: PlayerMovers,
    clubLegends: ClubLegends,
    playerHistoryTable: PlayerHistoryTable,
    // --- FIX: Add new components to the map ---
    xgAnalytics: XGAnalytics,
    playerConsistency: PlayerConsistencyChart,
};

const defaultLayout: DashboardItem[] = [
    { id: 'overview', component: componentsMap.overview, order: 1 },
    { id: 'recentRuns', component: componentsMap.recentRuns, order: 2 },
    { id: 'records', component: componentsMap.records, order: 3 },
    { id: 'playerMovers', component: componentsMap.playerMovers, order: 4 },
    { id: 'clubLegends', component: componentsMap.clubLegends, order: 5 },
    { id: 'playerHistoryTable', component: componentsMap.playerHistoryTable, order: 6 },
    // --- FIX: Add new components to default layout ---
    { id: 'xgAnalytics', component: componentsMap.xgAnalytics, order: 7 },
    { id: 'playerConsistency', component: componentsMap.playerConsistency, order: 8 },
];

const Dashboard = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [layout, setLayout] = useState<DashboardItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLayout();
    }, [user]);

    // This fetchLayout function is now robust and handles adding new components
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
                setLayout([...defaultLayout].sort((a, b) => a.order - b.order));
            }
        } catch (err: any)
        {
            toast({ title: "Error", description: `Failed to load dashboard layout: ${err.message}`, variant: "destructive" });
            setLayout([...defaultLayout].sort((a, b) => a.order - b.order));
        } finally {
            setLoading(false);
        }
    };

    const findAndRenderSection = (id: string) => {
        const item = layout.find(item => item.id === id);
        
        if (!item) {
            return null; 
        }
        
        // --- FIX: We can remove titles for these components too, they have them internally ---
        if (id === 'playerHistoryTable' || id === 'xgAnalytics' || id === 'playerConsistency') {
            return <item.component key={item.id} />;
        }

        let title = item.id.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        
        if (id === 'playerMovers') {
            title = 'Player Movers';
        }
        if (id === 'records') {
            title = 'All-Time Records';
        }
        if (id === 'recentRuns') {
            title = 'Recent Runs';
        }

        return (
            <DashboardSection 
              key={item.id} 
              title={title}
            >
                <item.component />
            </DashboardSection>
        );
    };

    if (loading) {
        return (
            <div className="space-y-6">
                {/* --- FIX: Skeleton for a 3-tab layout --- */}
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
            {/* --- FIX: Add new "Analytics" tab --- */}
            <TabsList className="glass-card rounded-2xl shadow-xl border-0 p-2 h-auto grid grid-cols-3">
                <TabsTrigger value="overview" className="rounded-xl flex-1 flex gap-2 items-center">
                    <LayoutGrid className="h-4 w-4" />
                    Overview
                </TabsTrigger>
                <TabsTrigger value="players" className="rounded-xl flex-1 flex gap-2 items-center">
                    <Users className="h-4 w-4" />
                    Player Hub
                </TabsTrigger>
                <TabsTrigger value="analytics" className="rounded-xl flex-1 flex gap-2 items-center">
                    <BarChart3 className="h-4 w-4" />
                    Analytics
                </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
                {findAndRenderSection('overview')}
                {findAndRenderSection('recentRuns')}
                {findAndRenderSection('records')}
            </TabsContent>

            <TabsContent value="players" className="space-y-6">
                {findAndRenderSection('playerMovers')}
                {findAndRenderSection('clubLegends')}
                {findAndRenderSection('playerHistoryTable')}
            </TabsContent>

            {/* --- FIX: Add new "Analytics" tab content --- */}
            <TabsContent value="analytics" className="space-y-6">
                {findAndRenderSection('xgAnalytics')}
                {findAndRenderSection('playerConsistency')}
            </TabsContent>

        </Tabs>
    );
};

export default Dashboard;
