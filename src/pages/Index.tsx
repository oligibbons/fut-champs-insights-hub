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
import { LayoutGrid, Users } from 'lucide-react'; // --- FIX: Removed 'Trophy' icon ---
import { Skeleton } from '@/components/ui/skeleton';
import PlayerMovers from '@/components/PlayerMovers';

interface DashboardItem {
    id: string;
    component: React.FC;
    order: number;
}

// --- FIX: The components are all correct ---
const componentsMap: Record<string, React.FC> = {
    overview: DashboardOverview,
    recentRuns: RecentRuns,
    playerMovers: PlayerMovers,
    clubLegends: ClubLegends,
    records: FUTTrackrRecords,
};

// --- FIX: The layout is all correct ---
const defaultLayout: DashboardItem[] = [
    { id: 'overview', component: componentsMap.overview, order: 1 },
    { id: 'recentRuns', component: componentsMap.recentRuns, order: 2 },
    { id: 'playerMovers', component: componentsMap.playerMovers, order: 3 },
    { id: 'clubLegends', component: componentsMap.clubLegends, order: 4 },
    { id: 'records', component: componentsMap.records, order: 5 },
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
        // --- FIX: Give the "records" component a better title on this page ---
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
                {/* --- FIX: Skeleton for a 2-tab layout --- */}
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
            {/* --- FIX: Simplified to two tabs --- */}
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
            
            {/* --- FIX: "Overview" tab now contains the hero, recent runs, AND all records --- */}
            <TabsContent value="overview" className="space-y-6">
                {findAndRenderSection('overview')}
                {findAndRenderSection('recentRuns')}
                {findAndRenderSection('records')}
            </TabsContent>

            <TabsContent value="players" className="space-y-6">
                {findAndRenderSection('playerMovers')}
                {findAndRenderSection('clubLegends')}
            </TabsContent>

            {/* --- FIX: The "Records" tab is no longer needed --- */}

        </Tabs>
    );
};

export default Dashboard;
