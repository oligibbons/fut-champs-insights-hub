import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardOverview from '@/components/DashboardOverview';
import RecentRuns from '@/components/RecentRuns';
// --- FIX: We no longer import these directly ---
// import TopPerformers from '@/components/TopPerformers';
// import LowestRatedPlayers from '@/components/LowestRatedPlayers';
import ClubLegends from '@/components/ClubLegends';
import { FUTTrackrRecords } from '@/components/FUTTrackrRecords';
import DashboardSection from '@/components/DashboardSection';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid, Users, Trophy } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
// --- FIX: Import our new component ---
import PlayerMovers from '@/components/PlayerMovers';

interface DashboardItem {
    id: string;
    component: React.FC;
    order: number;
}

const componentsMap: Record<string, React.FC> = {
    overview: DashboardOverview,
    recentRuns: RecentRuns,
    // --- FIX: Add the new component to the map ---
    playerMovers: PlayerMovers,
    clubLegends: ClubLegends,
    records: FUTTrackrRecords,
    // --- FIX: Remove the old components from the map ---
    // topPerformers: TopPerformers, (No longer needed here)
    // lowestRated: LowestRatedPlayers, (No longer needed here)
};

const defaultLayout: DashboardItem[] = [
    { id: 'overview', component: componentsMap.overview, order: 1 },
    { id: 'recentRuns', component: componentsMap.recentRuns, order: 2 },
    // --- FIX: Add new component to default layout ---
    { id: 'playerMovers', component: componentsMap.playerMovers, order: 3 },
    { id: 'clubLegends', component: componentsMap.clubLegends, order: 4 },
    { id: 'records', component: componentsMap.records, order: 5 },
    // --- FIX: Remove old components from default layout ---
    // { id: 'topPerformers', component: componentsMap.topPerformers, order: 3 },
    // { id: 'lowestRated', component: componentsMap.lowestRated, order: 4 },
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
        
        // --- This logic now maps 'playerMovers' to the <PlayerMovers /> component ---
        let title = item.id.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        
        // --- FIX: Give the new component a better title ---
        if (id === 'playerMovers') {
            title = 'Player Movers';
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
            
            <TabsContent value="overview" className="space-y-6">
                {findAndRenderSection('overview')}
                {findAndRenderSection('recentRuns')}
            </TabsContent>

            <TabsContent value="players" className="space-y-6">
                {/* --- FIX: This single component now replaces the two old ones --- */}
                {findAndRenderSection('playerMovers')}
                {findAndRenderSection('clubLegends')}
            </TabsContent>

            <TabsContent value="records" className="space-y-6">
                {findAndRenderSection('records')}
            </TabsContent>

        </Tabs>
    );
};

export default Dashboard;
