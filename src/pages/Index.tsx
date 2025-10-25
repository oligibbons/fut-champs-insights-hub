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

const Dashboard = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const { currentTheme } = useTheme(); // Get theme for skeletons
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
                        // Check if component exists in map before adding
                        return component ? { ...item, component } : null; 
                    })
                    // Filter out nulls (components that might have been removed)
                    .filter((item): item is DashboardItem => item !== null);

                // Add any missing default components (newly added ones)
                defaultLayout.forEach(defaultItem => {
                    if (!loadedLayout.some(item => item.id === defaultItem.id)) {
                         // Make sure the component actually exists before pushing
                        if (componentsMap[defaultItem.id]) {
                            loadedLayout.push({...defaultItem});
                        }
                    }
                });

                // Final filter to ensure all components in layout exist in the map
                loadedLayout = loadedLayout.filter(item => componentsMap[item.id]); 
                setLayout(loadedLayout.sort((a, b) => a.order - b.order));
            } else {
                // No saved layout, use the default, ensuring all components exist
                setLayout([...defaultLayout].filter(item => componentsMap[item.id]).sort((a, b) => a.order - b.order));
            }
        } catch (err: any)
        {
            toast({ title: "Error", description: `Failed to load dashboard layout: ${err.message}`, variant: "destructive" });
             // Fallback to default layout on error
            setLayout([...defaultLayout].filter(item => componentsMap[item.id]).sort((a, b) => a.order - b.order));
        } finally {
            setLoading(false);
        }
    };


    const findAndRenderSection = (id: string) => {
        const item = layout.find(item => item.id === id);
        if (!item) return null; 
        
        // Components that render their own Card/Title wrapper
        const selfContainedComponents = [
            'playerHistoryTable', 'xgAnalytics', 'playerConsistency',
            'performanceRadar', 'matchTagAnalysis', 'formationTracker',
            'primaryInsight', 'goalInvolvement', 'cpsGauge', 'positionalHeatMap',
            'overview', // The overview component now structures itself
            // --- ADD TO THIS LIST ---
            'runChunkAnalysis'
        ];
        if (selfContainedComponents.includes(id)) {
             return <item.component key={item.id} />;
        }

        // Components that need the DashboardSection wrapper for title/structure
        let title = '';
         switch (id) {
            case 'playerMovers': title = 'Player Movers'; break;
            case 'records': title = 'All-Time Records'; break;
            case 'recentRuns': title = 'Recent Runs'; break;
            case 'clubLegends': title = 'Club Legends'; break;
            // Add other cases here if needed
            default: 
                // Fallback title generation if somehow missed
                title = item.id.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        }

        // Only wrap if a title makes sense for the component type
        if (title) {
            return (
                <DashboardSection key={item.id} title={title}>
                    <item.component />
                </DashboardSection>
            );
        } else {
             // Render directly if no title needed (shouldn't happen often with current list)
             return <item.component key={item.id}/>
        }
    };

    if (loading) {
        return (
            <div className="space-y-8"> {/* Match main spacing */}
                 {/* Skeleton for Logo + Title */}
                 <div className="flex items-center gap-4 mb-4">
                    <Skeleton className="h-12 w-12 rounded-lg" style={{ backgroundColor: currentTheme.colors.surface }} />
                    <div>
                        <Skeleton className="h-8 w-40 mb-1" style={{ backgroundColor: currentTheme.colors.surface }} />
                        <Skeleton className="h-4 w-64" style={{ backgroundColor: currentTheme.colors.surface }} />
                    </div>
                 </div>
                 {/* Skeleton for Tabs */}
                <Skeleton className="h-12 w-full md:w-96 rounded-2xl" style={{ backgroundColor: currentTheme.colors.surface }} /> 
                {/* Skeleton for Content */}
                <div className="space-y-6">
                    <Skeleton className="h-64 w-full rounded-2xl" style={{ backgroundColor: currentTheme.colors.surface }} />
                    <Skeleton className="h-48 w-full rounded-2xl" style={{ backgroundColor: currentTheme.colors.surface }} />
                    <Skeleton className="h-96 w-full rounded-2xl" style={{ backgroundColor: currentTheme.colors.surface }} /> 
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8"> {/* Increased main spacing */}
             {/* --- Logo and Title Section --- */}
             <div className="flex items-center gap-4"> {/* Removed mb-4, spacing handled by parent */}
                 <img 
                    src={logo} 
                    alt="FUT Trackr Logo" 
                    className="h-12 w-12 rounded-lg object-cover shadow-md" // Added shadow
                 />
                 <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
                    <p style={{ color: currentTheme.colors.muted }}>Your FUT Champions command center.</p>
                 </div>
             </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="glass-card rounded-2xl shadow-xl border-0 p-2 h-auto grid grid-cols-3">
                     <TabsTrigger value="overview" className="tabs-trigger-style rounded-xl flex-1 flex gap-2 items-center justify-center"> {/* Centered content */}
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
            
                <TabsContent value="overview" className="space-y-6">
                    {findAndRenderSection('overview')}
                    {findAndRenderSection('primaryInsight')} 
                    {findAndRenderSection('recentRuns')}
                    {findAndRenderSection('records')}
                </TabsContent>

                {/* --- FIX: Updated Player Hub Tab --- */}
                <TabsContent value="players" className="space-y-6">
                    {/* This grid stacks on mobile (grid-cols-1) and goes 2-wide on large screens */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {findAndRenderSection('playerMovers')}
                        {findAndRenderSection('goalInvolvement')}
                    </div>
                    {/* This second grid does the same, keeping the layout clean */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {findAndRenderSection('clubLegends')}
                        {findAndRenderSection('playerHistoryTable')}
                    </div>
                </TabsContent>
                {/* --- END FIX --- */}

                <TabsContent value="analytics" className="space-y-6">
                    {findAndRenderSection('performanceRadar')}
                    {/* --- IT WILL RENDER HERE AUTOMATICALLY --- */}
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
