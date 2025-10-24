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
import { LayoutGrid, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import PlayerMovers from '@/components/PlayerMovers';
// --- FIX: Import our detailed player table ---
import PlayerHistoryTable from '@/components/PlayerHistoryTable';

interface DashboardItem {
    id: string;
    component: React.FC;
    order: number;
}

const componentsMap: Record<string, React.FC> = {
    overview: DashboardOverview,
    recentRuns: RecentRuns,
    playerMovers: PlayerMovers,
    clubLegends: ClubLegends,
    records: FUTTrackrRecords,
    // --- FIX: Add the table to our component map ---
    playerHistoryTable: PlayerHistoryTable,
};

const defaultLayout: DashboardItem[] = [
    { id: 'overview', component: componentsMap.overview, order: 1 },
    { id: 'recentRuns', component: componentsMap.recentRuns, order: 2 },
    { id: 'records', component: componentsMap.records, order: 3 }, // Moved from "players" tab
    { id: 'playerMovers', component: componentsMap.playerMovers, order: 4 },
    { id: 'clubLegends', component: componentsMap.clubLegends, order: 5 },
    // --- FIX: Add the table to our default layout ---
    { id: 'playerHistoryTable', component: componentsMap.playerHistoryTable, order: 6 },
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
        // --- FIX: We can remove the title for the table since it's inside the component ---
        if (id === 'playerHistoryTable') {
            // The table component has its own title, so we don't need a DashboardSection
            return <item.component />;
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
                <Skeleton className="h-12 w-60 rounded-2xl" />
                <div className="space-y-6">
                    <Skeleton className="h-64 w-full rounded-2xl" />
                    <Skeleton className="h-48 w-full rounded-2xl" />
                </div>
            </div>
        );
    }

    return (
        <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="glass-card rounded-2xl shadow-xl border-0 p-2 h-auto grid grid-cols-2">
                <TabsTrigger value="overview" className="rounded-xl flex-1 flex gap-2 items-center">
                    <LayoutGrid className="h-4 w-4" />
                    Overview
                </TabsTrigger>
                <TabsTrigger value="players" className="rounded-xl flex-1 flex gap-2 items-center">
                    <Users className="h-4 w-4" />
                    Player Hub
                </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
                {findAndRenderSection('overview')}
                {findAndRenderSection('recentRuns')}
                {findAndRenderSection('records')}
            </TabsContent>

            {/* --- FIX: "Player Hub" tab is now fully complete --- */}
            <TabsContent value="players" className="space-y-6">
                {findAndRenderSection('playerMovers')}
                {findAndRenderSection('clubLegends')}
                {findAndRenderSection('playerHistoryTable')}
            </TabsContent>

        </Tabs>
    );
};

export default Dashboard;
