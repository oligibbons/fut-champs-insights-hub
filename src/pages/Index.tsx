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
import PerformanceRadar from '@/components/PerformanceRadar';
import MatchTagAnalysis from '@/components/MatchTagAnalysis';
import FormationTracker from '@/components/FormationTracker';
// --- FIX: Import the final set of components ---
import PrimaryInsightCard from '@/components/PrimaryInsightCard';
import GoalInvolvementChart from '@/components/GoalInvolvementChart';
import CPSGauge from '@/components/CPSGauge';
import PositionalHeatMap from '@/components/PositionalHeatMap';


interface DashboardItem {
    id: string;
    component: React.FC;
    order: number;
}

const componentsMap: Record<string, React.FC> = {
    overview: DashboardOverview, // The hero section (chart + 4 stats)
    recentRuns: RecentRuns,
    records: FUTTrackrRecords,
    playerMovers: PlayerMovers,
    clubLegends: ClubLegends,
    playerHistoryTable: PlayerHistoryTable,
    xgAnalytics: XGAnalytics,
    playerConsistency: PlayerConsistencyChart,
    performanceRadar: PerformanceRadar,
    matchTagAnalysis: MatchTagAnalysis,
    formationTracker: FormationTracker,
    // --- FIX: Add new components ---
    primaryInsight: PrimaryInsightCard,
    goalInvolvement: GoalInvolvementChart,
    cpsGauge: CPSGauge,
    positionalHeatMap: PositionalHeatMap,
};

const defaultLayout: DashboardItem[] = [
    // Define order based on tabs
    // Overview Tab
    { id: 'overview', component: componentsMap.overview, order: 1 },
    { id: 'primaryInsight', component: componentsMap.primaryInsight, order: 2 }, // Added
    { id: 'recentRuns', component: componentsMap.recentRuns, order: 3 },
    { id: 'records', component: componentsMap.records, order: 4 }, 
    // Player Hub Tab
    { id: 'playerMovers', component: componentsMap.playerMovers, order: 5 },
    { id: 'goalInvolvement', component: componentsMap.goalInvolvement, order: 6 }, // Added
    { id: 'clubLegends', component: componentsMap.clubLegends, order: 7 },
    { id: 'playerHistoryTable', component: componentsMap.playerHistoryTable, order: 8 },
    // Analytics Tab
    { id: 'performanceRadar', component: componentsMap.performanceRadar, order: 9 },
    { id: 'matchTagAnalysis', component: componentsMap.matchTagAnalysis, order: 10 },
    { id: 'formationTracker', component: componentsMap.formationTracker, order: 11 },
    { id: 'cpsGauge', component: componentsMap.cpsGauge, order: 12 }, // Added
    { id: 'xgAnalytics', component: componentsMap.xgAnalytics, order: 13 },
    { id: 'playerConsistency', component: componentsMap.playerConsistency, order: 14 },
    { id: 'positionalHeatMap', component: componentsMap.positionalHeatMap, order: 15 }, // Added
];

const Dashboard = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [layout, setLayout] = useState<DashboardItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLayout();
    }, [user]);

    // fetchLayout remains robust
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

    // findAndRenderSection handles self-titled components correctly
    const findAndRenderSection = (id: string) => {
        const item = layout.find(item => item.id === id);
        if (!item) return null; 
        
        const selfTitledComponents = [
            'playerHistoryTable', 'xgAnalytics', 'playerConsistency',
            'performanceRadar', 'matchTagAnalysis', 'formationTracker',
            // --- FIX: Add new self-titled components ---
            'primaryInsight', 'goalInvolvement', 'cpsGauge', 'positionalHeatMap'
        ];
        if (selfTitledComponents.includes(id)) {
            // Render without DashboardSection wrapper if component has its own title/card
             return <item.component key={item.id} />;
        }

        // Handle components that NEED the DashboardSection wrapper for a title
        let title = '';
         switch (id) {
            case 'playerMovers': title = 'Player Movers'; break;
            case 'records': title = 'All-Time Records'; break;
            case 'recentRuns': title = 'Recent Runs'; break;
            case 'overview': title = ''; break; // The overview component is the hero, no title needed
            case 'clubLegends': title = 'Club Legends'; break;
            default: title = item.id.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        }

        if (title) {
            return (
                <DashboardSection key={item.id} title={title}>
                    <item.component />
                </DashboardSection>
            );
        } else if (id === 'overview') {
            // Render overview component directly without wrapper
            return <item.component key={item.id} />;
        } else {
             // Fallback just in case
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
            
            {/* --- FIX: Add PrimaryInsightCard --- */}
            <TabsContent value="overview" className="space-y-6">
                {findAndRenderSection('overview')}
                {findAndRenderSection('primaryInsight')} 
                {findAndRenderSection('recentRuns')}
                {findAndRenderSection('records')}
            </TabsContent>

            {/* --- FIX: Add GoalInvolvementChart --- */}
            <TabsContent value="players" className="space-y-6">
                {findAndRenderSection('playerMovers')}
                {findAndRenderSection('goalInvolvement')}
                {findAndRenderSection('clubLegends')}
                {findAndRenderSection('playerHistoryTable')}
            </TabsContent>

            {/* --- FIX: Add CPSGauge and PositionalHeatMap --- */}
            <TabsContent value="analytics" className="space-y-6">
                {findAndRenderSection('performanceRadar')}
                {findAndRenderSection('matchTagAnalysis')}
                {findAndRenderSection('formationTracker')}
                {findAndRenderSection('cpsGauge')}
                {findAndRenderSection('xgAnalytics')}
                {findAndRenderSection('playerConsistency')}
                {findAndRenderSection('positionalHeatMap')}
            </TabsContent>

        </Tabs>
    );
};

export default Dashboard;
