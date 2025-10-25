import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardOverview from '@/components/DashboardOverview';
import RecentRuns from '@/components/RecentRuns';
import ClubLegends from '@/components/ClubLegends';
// --- FIX: Import FUTTrackrRecords as a NAMED export ---
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
    component: React.FC<any>; // Allow components to accept props
    order: number;
    // Add props if specific components need them passed down, e.g.,
    // props?: Record<string, any>;
}

// --- Define props interfaces if needed by components ---
// Example:
// interface DashboardOverviewProps { latestRun: any; allRuns: any[] }
// interface RecentRunsProps { runs: any[] }
// ... etc.

const componentsMap: Record<string, React.FC<any>> = {
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

// Filter the default layout *once* to ensure all components exist in the map.
const initialLayout = [...defaultLayout]
    .filter(item => componentsMap[item.id])
    .sort((a, b) => a.order - b.order);

const Dashboard = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const { currentTheme } = useTheme(); // Get theme for skeletons

    // Initialize state *with the default layout*
    const [layout, setLayout] = useState<DashboardItem[]>(initialLayout);
    const [loadingLayout, setLoadingLayout] = useState(true); // Renamed for clarity

    // --- You might need to fetch data needed by child components here ---
    // Example using a hypothetical hook (adjust as needed)
    // const { runs, loading: runsLoading, error: runsError } = useAllRunsData();

    useEffect(() => {
        fetchLayout();
    }, [user]);

    // fetchLayout now *updates* the layout, rather than causing the initial render
    const fetchLayout = async () => {
        if (!user) {
            setLoadingLayout(false); // No user, so stop loading
            setLayout(initialLayout); // Ensure default layout is set
            return;
        }

        setLoadingLayout(true); // Still set loading for user's layout fetch
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

                 // Ensure all components still exist in the map after merge
                 loadedLayout = loadedLayout.filter(item => componentsMap[item.id]);
                 setLayout(loadedLayout.sort((a, b) => a.order - b.order));
            } else {
                 // No saved layout, default is already set
                 setLayout(initialLayout);
            }
        } catch (err: any)
        {
            toast({ title: "Error", description: `Failed to load dashboard layout: ${err.message}`, variant: "destructive" });
             // Fallback to default layout on error
             setLayout(initialLayout);
        } finally {
            setLoadingLayout(false);
        }
    };


    const findAndRenderSection = (id: string, props?: Record<string, any>) => {
        // Find the item based on ID
        const item = layout.find(item => item.id === id);
        if (!item) return null;

        const Component = item.component;

        // Determine if the component needs the DashboardSection wrapper
        const selfContainedComponents = [
            'playerHistoryTable', 'xgAnalytics', 'playerConsistency',
            'performanceRadar', 'matchTagAnalysis', 'formationTracker',
            'primaryInsight', 'goalInvolvement', 'cpsGauge', 'positionalHeatMap',
            'overview',
            'runChunkAnalysis',
            // Add other components that handle their own Card/Title styling
        ];

        if (selfContainedComponents.includes(id)) {
             // Pass props directly to self-contained components
             return <Component key={item.id} {...props} />;
        }

        // Determine title for wrapped components
        let title = '';
         switch (id) {
             case 'playerMovers': title = 'Player Movers'; break;
             case 'records': title = 'All-Time Records'; break;
             case 'recentRuns': title = 'Recent Runs'; break;
             case 'clubLegends': title = 'Club Legends'; break;
             default:
                 // Auto-generate title (optional, adjust as needed)
                 title = item.id.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
         }

         // Render wrapped components
         return (
             <DashboardSection key={item.id} title={title}>
                 {/* Pass props to the component inside the section */}
                 <Component {...props} />
             </DashboardSection>
         );
    };

    // --- SKELETON LOADER (Optional but recommended) ---
    // Show skeletons only while fetching the *user's specific layout*
    if (loadingLayout) {
       return (
         <div className="space-y-8">
            <div className="flex items-center gap-4">
                 <Skeleton className="h-12 w-12 rounded-lg" />
                 <div>
                    <Skeleton className="h-8 w-48 mb-1" />
                    <Skeleton className="h-4 w-64" />
                 </div>
            </div>
            {/* Skeleton for TabsList */}
            <Skeleton className="h-12 w-full rounded-2xl" />
            {/* Skeletons for content */}
            <div className="space-y-6">
                <Skeleton className="h-64 w-full rounded-lg" />
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-48 w-full rounded-lg" />
            </div>
         </div>
       );
    }

    // --- ACTUAL DASHBOARD RENDER ---
    return (
        <div className="space-y-8">
             {/* --- Logo and Title Section --- */}
             <div className="flex items-center gap-4">
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

                {/* --- FIX: Place findAndRenderSection calls WITHIN the correct TabsContent --- */}

                <TabsContent value="overview" className="space-y-6 mt-4" forceMount>
                     {/* Pass necessary props if components need them */}
                     {findAndRenderSection('overview' /*, { latestRun: runs?.[0], allRuns: runs } */)}
                     {findAndRenderSection('primaryInsight')}
                     {findAndRenderSection('recentRuns' /*, { runs: runs } */)}
                     {findAndRenderSection('records' /*, { allRuns: runs } */)}
                </TabsContent>

                <TabsContent value="players" className="space-y-6 mt-4" forceMount>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {findAndRenderSection('playerMovers')}
                        {findAndRenderSection('goalInvolvement')}
                    </div>
                    <div className="grid grid-cols-1 gap-6"> {/* Changed grid cols */}
                        {findAndRenderSection('clubLegends')}
                    </div>
                     <div className="grid grid-cols-1 gap-6"> {/* Changed grid cols */}
                        {findAndRenderSection('playerHistoryTable')}
                    </div>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6 mt-4" forceMount>
                     {/* Arrange analytics components as desired */}
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                         {findAndRenderSection('performanceRadar')}
                         {findAndRenderSection('runChunkAnalysis' /*, { allRuns: runs } */)}
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
    );
};

export default Dashboard;
