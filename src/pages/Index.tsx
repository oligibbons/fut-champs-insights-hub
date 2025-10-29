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
import { LayoutGrid, Users, BarChart3, Share } from 'lucide-react'; // Added Share icon
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
import logo from '/fut-trackr-logo.jpg'; //
import { useTheme } from '@/hooks/useTheme'; //
import RunChunkAnalysis from '@/components/RunChunkAnalysis';
import { useAllRunsData } from '@/hooks/useAllRunsData'; // --- Use your data hook ---
import ShareableCardGenerator from '@/components/ShareableCardGenerator'; // --- Import the generator ---
import { Button } from '@/components/ui/button'; // --- Import Button ---
import { WeeklyPerformance } from '@/types/futChampions'; // Type for runs data

interface DashboardItem {
    id: string;
    component: React.FC<any>; // Allow components to accept props
    order: number;
}

const componentsMap: Record<string, React.FC<any>> = {
    overview: DashboardOverview,
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
    { id: 'runChunkAnalysis', component: componentsMap.runChunkAnalysis, order: 9.5 },
    { id: 'matchTagAnalysis', component: componentsMap.matchTagAnalysis, order: 10 },
    { id: 'formationTracker', component: componentsMap.formationTracker, order: 11 },
    { id: 'cpsGauge', component: componentsMap.cpsGauge, order: 12 },
    { id: 'xgAnalytics', component: componentsMap.xgAnalytics, order: 13 },
    { id: 'playerConsistency', component: componentsMap.playerConsistency, order: 14 },
    { id: 'positionalHeatMap', component: componentsMap.positionalHeatMap, order: 15 },
];

// Filter the default layout *once*
const initialLayout = [...defaultLayout]
    .filter(item => componentsMap[item.id])
    .sort((a, b) => a.order - b.order);

const Dashboard = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const { currentTheme } = useTheme();

    const [layout, setLayout] = useState<DashboardItem[]>(initialLayout);
    const [loadingLayout, setLoadingLayout] = useState(true);
    const [showOverallShareModal, setShowOverallShareModal] = useState(false); // --- State for overall share modal ---

    // --- Fetch all runs data using your hook ---
    const { runs, loading: runsLoading, error: runsError } = useAllRunsData();

    useEffect(() => {
        fetchLayout();
    }, [user]);

    // fetchLayout function (remains exactly as in your provided file)
    const fetchLayout = async () => {
        if (!user) { setLoadingLayout(false); setLayout(initialLayout); return; }
        setLoadingLayout(true);
        try {
            const { data, error } = await supabase.from('user_settings').select('value').eq('user_id', user.id).eq('key', 'dashboard_layout').limit(1);
            if (error) throw error;
            if (data && data.length > 0 && data[0].value) {
                 const savedLayout = data[0].value as { id: string; order: number }[];
                 let loadedLayout = savedLayout.map(item => { const component = componentsMap[item.id]; return component ? { ...item, component } : null; }).filter((item): item is DashboardItem => item !== null);
                 defaultLayout.forEach(defaultItem => { if (!loadedLayout.some(item => item.id === defaultItem.id)) { if (componentsMap[defaultItem.id]) { loadedLayout.push({...defaultItem}); } } });
                 loadedLayout = loadedLayout.filter(item => componentsMap[item.id]);
                 setLayout(loadedLayout.sort((a, b) => a.order - b.order));
            } else { setLayout(initialLayout); }
        } catch (err: any) { toast({ title: "Error", description: `Failed to load dashboard layout: ${err.message}`, variant: "destructive" }); setLayout(initialLayout);
        } finally { setLoadingLayout(false); }
    };

    // findAndRenderSection function (modified to pass down fetched data)
    const findAndRenderSection = (id: string, specificProps?: Record<string, any>) => {
        const item = layout.find(item => item.id === id);
        if (!item) return null;

        const Component = item.component;

        // --- Define props to pass down ---
        // Adjust these based on what each component actually needs
        const commonProps = {
            allRuns: runs || [], // Pass the fetched runs data
            latestRun: runs?.[0] || null, // Pass the latest run (assuming sorted)
            // Add other data if needed by components
            ...(specificProps || {}) // Allow overriding or adding specific props
        };

        const selfContainedComponents = [
            'playerHistoryTable', 'xgAnalytics', 'playerConsistency',
            'performanceRadar', 'matchTagAnalysis', 'formationTracker',
            'primaryInsight', 'goalInvolvement', 'cpsGauge', 'positionalHeatMap',
            'overview', 'runChunkAnalysis'
        ];

        if (selfContainedComponents.includes(id)) {
             // Pass props directly
             return <Component key={item.id} {...commonProps} />;
        }

        let title = '';
         switch (id) {
             case 'playerMovers': title = 'Player Movers'; break;
             case 'records': title = 'All-Time Records'; break;
             case 'recentRuns': title = 'Recent Runs'; break;
             case 'clubLegends': title = 'Club Legends'; break;
             default: title = item.id.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
         }

         // Render wrapped components, passing props
         return (
             <DashboardSection key={item.id} title={title}>
                 <Component {...commonProps} />
             </DashboardSection>
         );
    };

    // --- Loading States ---
    if (loadingLayout || runsLoading) { // Check both layout and data loading
       return ( /* ... Skeleton ... */
         <div className="space-y-8"> <div className="flex items-center gap-4"> <Skeleton className="h-12 w-12 rounded-lg" /> <div> <Skeleton className="h-8 w-48 mb-1" /> <Skeleton className="h-4 w-64" /> </div> </div> <Skeleton className="h-12 w-full rounded-2xl" /> <div className="space-y-6"> <Skeleton className="h-64 w-full rounded-lg" /> <Skeleton className="h-48 w-full rounded-lg" /> <Skeleton className="h-48 w-full rounded-lg" /> </div> </div>
       );
    }

    // --- Error State for Runs ---
    if (runsError) {
        // You might want a more user-friendly error display
        return <div className="text-red-500 p-4">Error loading dashboard data: {runsError.message}</div>;
    }

    // --- ACTUAL DASHBOARD RENDER ---
    return (
        // --- Use Fragment to allow modal rendering alongside main content ---
        <>
            <div className="space-y-8">
                 {/* --- Logo, Title, and Share Button --- */}
                 <div className="flex items-center justify-between gap-4"> {/* Use justify-between */}
                     <div className="flex items-center gap-4">
                         <img src={logo} alt="FUT Trackr Logo" className="h-12 w-12 rounded-lg object-cover shadow-md" />
                         <div>
                             <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
                             <p style={{ color: currentTheme.colors.muted }}>Your FUT Champions command center.</p>
                         </div>
                     </div>
                     {/* --- Add Overall Share Button --- */}
                     <Button onClick={() => setShowOverallShareModal(true)} variant="outline" size="sm">
                        <Share className="h-4 w-4 mr-2" /> Share Profile Card
                     </Button>
                 </div>

                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="glass-card rounded-2xl shadow-xl border-0 p-2 h-auto grid grid-cols-3">
                         {/* ... TabsTriggers remain the same ... */}
                         <TabsTrigger value="overview" className="tabs-trigger-style rounded-xl flex-1 flex gap-2 items-center justify-center"> <LayoutGrid className="h-4 w-4" /> Overview </TabsTrigger>
                         <TabsTrigger value="players" className="tabs-trigger-style rounded-xl flex-1 flex gap-2 items-center justify-center"> <Users className="h-4 w-4" /> Player Hub </TabsTrigger>
                         <TabsTrigger value="analytics" className="tabs-trigger-style rounded-xl flex-1 flex gap-2 items-center justify-center"> <BarChart3 className="h-4 w-4" /> Analytics </TabsTrigger>
                    </TabsList>

                    {/* --- 
                      FIX: Replaced space-y-6 with grid wrappers
                      to match the mobile-first layout of the other tabs.
                    --- */}
                    <TabsContent value="overview" className="space-y-6 mt-4" forceMount>
                         
                         {/* This wrapper forces 'overview' and 'primaryInsight' into a 
                             single column on mobile/tablet and 2 columns on desktop. */}
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {findAndRenderSection('overview')}
                            {findAndRenderSection('primaryInsight')}
                         </div>

                         {/* These components are full-width, so they get their own 
                             single-column grid wrapper for consistent spacing. */}
                         <div className="grid grid-cols-1 gap-6">
                            {findAndRenderSection('recentRuns')}
                         </div>
                         <div className="grid grid-cols-1 gap-6">
                            {findAndRenderSection('records')}
                         </div>

                    </TabsContent>

                    <TabsContent value="players" className="space-y-6 mt-4" forceMount>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {findAndRenderSection('playerMovers')}
                            {findAndRenderSection('goalInvolvement')}
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                            {findAndRenderSection('clubLegends')}
                        </div>
                         <div className="grid grid-cols-1 gap-6">
                            {findAndRenderSection('playerHistoryTable')}
                        </div>
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-6 mt-4" forceMount>
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                             {findAndRenderSection('performanceRadar')}
                             {findAndRenderSection('runChunkAnalysis')}
                         </div>
                         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                             {findAndRenderSection('matchTagAnalysis')}
                             {findAndRenderSection('formationTracker')}
                             {findAndRenderSection('cpsGauge')}
                         </div>
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                             {findAndRenderSection('xgAnalytics')}
                             {findAndRenderSection('playerConsistency')}
                         </div>
                         {findAndRenderSection('positionalHeatMap')}
                     </TabsContent>

                </Tabs>
            </div>

            {/* --- Render the Overall Shareable Card Generator Modal --- */}
             <ShareableCardGenerator
                isOpen={showOverallShareModal}
                onClose={() => setShowOverallShareModal(false)}
                allRunsData={runs} // Pass all runs data fetched by the hook
             />
        </>
    );
};

export default Dashboard;