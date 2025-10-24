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
import { LayoutGrid, Users, BarChart3 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import PlayerMovers from '@/components/PlayerMovers';
import PlayerHistoryTable from '@/components/PlayerHistoryTable';
import XGAnalytics from '@/components/XGAnalytics';
import PlayerConsistencyChart from '@/components/PlayerConsistencyChart';
// --- FIX: Import the new Analytics components ---
import PerformanceRadar from '@/components/PerformanceRadar';
import MatchTagAnalysis from '@/components/MatchTagAnalysis';
import FormationTracker from '@/components/FormationTracker';

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
    xgAnalytics: XGAnalytics,
    playerConsistency: PlayerConsistencyChart,
    // --- FIX: Add new components to map ---
    performanceRadar: PerformanceRadar,
    matchTagAnalysis: MatchTagAnalysis,
    formationTracker: FormationTracker,
};

const defaultLayout: DashboardItem[] = [
    // Overview Tab
    { id: 'overview', component: componentsMap.overview, order: 1 },
    { id: 'recentRuns', component: componentsMap.recentRuns, order: 2 },
    { id: 'records', component: componentsMap.records, order: 3 }, 
    // Player Hub Tab
    { id: 'playerMovers', component: componentsMap.playerMovers, order: 4 },
    { id: 'clubLegends', component: componentsMap.clubLegends, order: 5 },
    { id: 'playerHistoryTable', component: componentsMap.playerHistoryTable, order: 6 },
    // Analytics Tab
    { id: 'xgAnalytics', component: componentsMap.xgAnalytics, order: 7 },
    { id: 'playerConsistency', component: componentsMap.playerConsistency, order: 8 },
    // --- FIX: Add new components to default layout ---
    { id: 'performanceRadar', component: componentsMap.performanceRadar, order: 9 },
    { id: 'matchTagAnalysis', component: componentsMap.matchTagAnalysis, order: 10 },
    { id: 'formationTracker', component: componentsMap.formationTracker, order: 11 },
];

const Dashboard = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [layout, setLayout] = useState<DashboardItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLayout();
    }, [user]);

    // fetchLayout remains the same, it correctly handles new components
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
        if (!item) return null; 
        
        // --- FIX: Components that have internal titles don't need DashboardSection wrapper ---
        const selfTitledComponents = [
            'playerHistoryTable', 'xgAnalytics', 'playerConsistency',
            'performanceRadar', 'matchTagAnalysis', 'formationTracker' 
        ];
        if (selfTitledComponents.includes(id)) {
            return <item.component key={item.id} />;
        }

        // --- FIX: Adjust titles for existing wrapped components ---
        let title = '';
         switch (id) {
            case 'playerMovers': title = 'Player Movers'; break;
            case 'records': title = 'All-Time Records'; break;
            case 'recentRuns': title = 'Recent Runs'; break;
            case 'overview': title = 'Key Metrics & Trends'; break; // Updated title
            case 'clubLegends': title = 'Club Legends'; break; // Keep title for this carousel
            default: title = item.id.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        }

        // Only wrap in DashboardSection if a title is set
        if (title) {
            return (
                <DashboardSection key={item.id} title={title}>
                    <item.component />
                </DashboardSection>
            );
        } else {
             // Should not happen with current logic, but safe fallback
             return <item.component key={item.id}/>
        }
    };


    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-12 w-80 rounded-2xl" />
                <div className="space-y-6">
                    <Skeleton className="h-64 w-full rounded-2xl" />
                    <Skeleton className="h-48 w-full rounded-2xl" />
                    <Skeleton className="h-96 w-full rounded-2xl" /> 
                </div>
            </div>
        );
    }

    return (
        <Tabs defaultValue="overview" className="space-y-6">
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

            {/* --- FIX: Render all analytics components in the Analytics tab --- */}
            <TabsContent value="analytics" className="space-y-6">
                {findAndRenderSection('performanceRadar')}
                {findAndRenderSection('matchTagAnalysis')}
                {findAndRenderSection('formationTracker')}
                {findAndRenderSection('xgAnalytics')}
                {findAndRenderSection('playerConsistency')}
            </TabsContent>

        </Tabs>
    );
};

export default Dashboard;
