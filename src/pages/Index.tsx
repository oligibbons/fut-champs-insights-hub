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
import PrimaryInsightCard from '@/components/PrimaryInsightCard';
import GoalInvolvementChart from '@/components/GoalInvolvementChart';
import CPSGauge from '@/components/CPSGauge';
import PositionalHeatMap from '@/components/PositionalHeatMap';
// --- VISUAL FIX: Import the logo ---
// Make sure the path is correct relative to this file, or use an absolute path like '/fut-trackr-logo.jpg' if it's in the public folder
import logo from '/fut-trackr-logo.jpg'; 
import { useTheme } from '@/hooks/useTheme'; // Import useTheme

// --- ADD THIS IMPORT ---
import RunChunkAnalysis from '@/components/RunChunkAnalysis';

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
    primaryInsight: PrimaryInsightCard,
    goalInvolvement: GoalInvolvementChart,
    cpsGauge: CPSGauge,
    positionalHeatMap: PositionalHeatMap,
    // --- ADD TO MAP ---
    runChunkAnalysis: RunChunkAnalysis,
};

const defaultLayout: DashboardItem[] = [
    // Define order based on tabs
    // Overview Tab
    { id: 'overview', component: componentsMap.overview, order: 1 },
    { id: 'primaryInsight', component: componentsMap.primaryInsight, order: 2 }, 
    { id: 'recentRuns', component: componentsMap.recentRuns, order: 3 },
    { id: 'records', component: componentsMap.records, order: 4 }, 
    // Player Hub Tab
    { id: 'playerMovers', component: componentsMap.playerMovers, order: 5 },
    { id: 'goalInvolvement', component: componentsMap.goalInvolvement, order: 6 }, 
    { id: 'clubLegends', component: componentsMap.clubLegends, order: 7 },
    { id: 'playerHistoryTable', component: componentsMap.playerHistoryTable, order: 8 },
    // Analytics Tab
    { id: 'performanceRadar', component: componentsMap.performanceRadar, order: 9 },
    // --- ADD TO LAYOUT (adjust order as you like) ---
    { id: 'runChunkAnalysis', component: componentsMap.runChunkAnalysis, order: 9.5 },
    { id: 'matchTagAnalysis', component: componentsMap.matchTagAnalysis, order: 10 },
    { id: 'formationTracker', component: componentsMap.formationTracker, order: 11 },
    { id: 'cpsGauge', component: componentsMap.cpsGauge, order: 12 }, 
    { id: 'xgAnalytics', component: componentsMap.xgAnalytics, order: 13 },
    { id: 'playerConsistency', component: componentsMap.playerConsistency, order: 14 },
    { id: 'positionalHeatMap', component: componentsMap.positionalHeatMap, order: 15 }, 
];

// --- THIS IS THE FIX ---
// Filter the default layout *once* to ensure all components exist in the map.
// This is what will be used to initialize the state.
const initialLayout = [...defaultLayout]
    .filter(item => componentsMap[item.id])
    .sort((a, b) => a.order - b.order);

const Dashboard = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const { currentTheme } = useTheme(); // Get theme for skeletons
    
    // --- THIS IS THE FIX ---
    // Initialize state *with the default layout* instead of an empty array.
    // This ensures all components and their hooks are rendered on the first load.
    const [layout, setLayout] = useState<DashboardItem[]>(initialLayout);
    const [loading, setLoading] = useState(true); // This state is now only for the *user's saved layout*

    useEffect(() => {
        fetchLayout();
    }, [user]);

    // fetchLayout now *updates* the layout, rather than causing the initial render
    const fetchLayout = async () => {
        if (!user) {
            setLoading(false); // No user, so stop loading
            setLayout(initialLayout); // Ensure default layout is set
            return;
        }
        
        setLoading(true); // Still set loading for user's layout fetch
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

                // Add any missing default components (newly added ones)
                defaultLayout.forEach(defaultItem => {
                    if (!loadedLayout.some(item => item.id === defaultItem.id)) {
                        if (componentsMap[defaultItem.id]) {
                            loadedLayout.push({...defaultItem});
                        }
                    }
                });

                loadedLayout = loadedLayout.filter(item => componentsMap[item.id]); 
                setLayout(loadedLayout.sort((a, b) => a.order - b.order));
            } else {
                // No saved layout, we've already set the default, so just stop loading
                setLayout(initialLayout);
            }
        } catch (err: any)
        {
            toast({ title: "Error", description: `Failed to load dashboard layout: ${err.message}`, variant: "destructive" });
             // Fallback to default layout on error
            setLayout(initialLayout);
        } finally {
            setLoading(false);
        }
    };


    const findAndRenderSection = (id: string) => {
        // This will now find items on the very first render
        const item = layout.find(item => item.id === id);
        if (!item) return null; 
        
        const selfContainedComponents = [
            'playerHistoryTable', 'xgAnalytics', 'playerConsistency',
            'performanceRadar', 'matchTagAnalysis', 'formationTracker',
            'primaryInsight', 'goalInvolvement', 'cpsGauge', 'positionalHeatMap',
            'overview',
            'runChunkAnalysis'
        ];
        if (selfContainedComponents.includes(id)) {
             return <item.component key={item.id} />;
        }

        let title = '';
         switch (id) {
            case 'playerMovers': title = 'Player Movers'; break;
            case 'records': title = 'All-Time Records'; break;
            case 'recentRuns': title = 'Recent Runs'; break;
            case 'clubLegends': title = 'Club Legends'; break;
            default: 
                title = item.id.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        }

        if (title) {
            return (
                <DashboardSection key={item.id} title={title}>
                    <item.component />
                </DashboardSection>
            );
        } else {
             return <item.component key={item.id}/>
        }
    };

    // --- THIS IS THE FIX ---
    // The main `if (loading)` block is removed.
    // The page structure is now rendered unconditionally.
    // Child components will handle their own loading states.
    return (
        <div className="space-y-8">
             {/* --- Logo and Title Section --- */}
             <div className="flex items-center gap-4">
                 {/* This is a small exception: we can skeleton the logo area
                    based on the *layout* loading state if we want,
                    or just show it. Showing it is simpler and won't break anything.
                 */}
                 <img 
                    src={logo} 
                    alt="FUT Trackr Logo" 
                    className="h-12 w-12 rounded-lg object-cover shadow-md"
                 />
                 <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
                    <p style={{ color: currentTheme.colors.muted }}>Your FUT Champions command center.</p>
                 </div>
             </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="glass-card rounded-2xl shadow-xl border-0 p-2 h-auto grid grid-cols-3">
                     <TabsTrigger value="overview" className="tabs-trigger-style rounded-xl flex-1 flex gap-2 items-center justify-center">
                        <LayoutGrid className="h-4 w-4" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="players" className="tabs-trigger-style rounded-xl flex-1 flex gap-2 items-center justify-center">
                        <Users className="h-4 w-4" />
                        Player Hub
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="tabs-trigger-style rounded-xl flex-1 flex gap-2 items-center justify-center">
                        <BarChart3 className="h-4 w-4" />
                        Analytics
                    </TabsTrigger>
                </TabsList>
            
                {/* These are all rendered from the first moment.
                  `forceMount` is still crucial to prevent unmounting on tab switch.
                  The components inside `findAndRenderSection` will now render
                  their own loading states correctly.
                */}
                <TabsContent value="overview" className="space-y-6" forceMount>
                    {findAndRenderSection('overview')}
                    {findAndRenderSection('primaryInsight')} 
                    {findAndRenderSection('recentRuns')}
                    {findAndRenderSection('records')}
                </TabsContent>

                <TabsContent value="players" className="space-y-6" forceMount>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {findAndRenderSection('playerMovers')}
                        {findAndRenderSection('goalInvolvement')}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {findAndRenderSection('clubLegends')}
                        {findAndRenderSection('playerHistoryTable')}
                    </div>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6" forceMount>
                    {findAndRenderSection('performanceRadar')}
                    {findAndRenderSection('runChunkAnalysis')}
                    {findAndRenderSection('matchTagAnalysis')}
                    {findAndRenderSection('formationTracker')}
                    {findAndRenderSection('cpsGauge')}
                    {findAndRenderSection('xgAnalytics')}
                    {findAndRenderSection('playerConsistency')}
                    {findAndRenderSection('positionalHeatMap')}
                </TabsContent>

            </Tabs>
        </div> 
    );
};

export default Dashboard;
