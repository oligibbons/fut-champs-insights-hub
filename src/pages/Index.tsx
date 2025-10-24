import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardOverview from '@/components/DashboardOverview';
import RecentRuns from '@/components/RecentRuns';
import TopPerformers from '@/components/TopPerformers';
import LowestRatedPlayers from '@/components/LowestRatedPlayers';
import ClubLegends from '@/components/ClubLegends';
import { FUTTrackrRecords } from '@/components/FUTTrackrRecords';
import DashboardSection from '@/components/DashboardSection'; // Needs modification or wrapping
import { useToast } from '@/hooks/use-toast';
import { useMobile } from '@/hooks/use-mobile'; // <-- Import useMobile

// Import dnd-kit components
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    TouchSensor, // Import TouchSensor
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable, // Import useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react'; // Example drag handle icon

interface DashboardItem {
    id: string;
    component: React.FC;
    order: number;
}

const componentsMap: Record<string, React.FC> = {
    overview: DashboardOverview,
    recentRuns: RecentRuns,
    topPerformers: TopPerformers,
    lowestRated: LowestRatedPlayers,
    clubLegends: ClubLegends,
    records: FUTTrackrRecords,
};

const defaultLayout: DashboardItem[] = [
    { id: 'overview', component: componentsMap.overview, order: 1 },
    { id: 'recentRuns', component: componentsMap.recentRuns, order: 2 },
    { id: 'topPerformers', component: componentsMap.topPerformers, order: 3 },
    { id: 'lowestRated', component: componentsMap.lowestRated, order: 4 },
    { id: 'clubLegends', component: componentsMap.clubLegends, order: 5 },
    { id: 'records', component: componentsMap.records, order: 6 },
];

// Wrapper for DashboardSection to make it sortable
const SortableDashboardSection = ({ item }: { item: DashboardItem }) => {
    const isMobile = useMobile();
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.7 : 1,
        zIndex: isDragging ? 10 : undefined, // Ensure dragging item is on top
    };

    // Conditionally apply listeners only if not mobile
    const dragHandleListeners = isMobile ? undefined : listeners;

    return (
        <div ref={setNodeRef} style={style} {...attributes} /* Apply attributes here */ >
            <DashboardSection
                title={item.id.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                // Pass listeners to the specific drag handle element inside DashboardSection
                dragHandleProps={dragHandleListeners}
            >
                <item.component />
            </DashboardSection>
        </div>
    );
};


const Dashboard = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const isMobile = useMobile(); // Use hook here
    const [layout, setLayout] = useState<DashboardItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Setup sensors - conditionally include TouchSensor
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
        // Only include TouchSensor if NOT on mobile
        ...(isMobile ? [] : [useSensor(TouchSensor)])
    );


    useEffect(() => {
        fetchLayout();
    }, [user]);

    const fetchLayout = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // --- FIX 1: Use .limit(1) instead of .single() to prevent 406 error ---
            const { data, error } = await supabase
                .from('user_settings')
                .select('value')
                .eq('user_id', user.id)
                .eq('key', 'dashboard_layout')
                .limit(1); // Get an array of 0 or 1 items

            // --- FIX 2: Simplified error check ---
            if (error) throw error;

            // --- FIX 3: Check if data array exists and has an item ---
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
        } catch (err: any) {
            toast({ title: "Error", description: `Failed to load dashboard layout: ${err.message}`, variant: "destructive" });
            setLayout([...defaultLayout].sort((a, b) => a.order - b.order));
        } finally {
            setLoading(false);
        }
    };

    const saveLayout = async (newLayout: DashboardItem[]) => {
        if (!user) return;
        const layoutToSave = newLayout.map(({ id, order }) => ({ id, order }));
        try {
            // This upsert now works correctly *if* you ran the SQL query from Step 1
            const { error } = await supabase
                .from('user_settings')
                .upsert({ 
                    user_id: user.id, 
                    key: 'dashboard_layout',
                    value: layoutToSave
                }, { 
                    onConflict: 'user_id, key' // This relies on the SQL constraint
                });

            if (error) throw error;
            toast({ title: "Success", description: "Dashboard layout saved." });
        } catch (err: any) {
            toast({ title: "Error", description: `Failed to save dashboard layout: ${err.message}`, variant: "destructive" });
        }
    };

    // Reintroduce handleDragEnd
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setLayout((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                const reorderedItems = arrayMove(items, oldIndex, newIndex);

                // Update order property based on new index
                 const updatedLayout = reorderedItems.map((item, index) => ({
                    ...item,
                    order: index + 1,
                 }));

                saveLayout(updatedLayout); // Save the new layout
                return updatedLayout; // Update state
            });
        }
    };


    if (loading) {
        return <div>Loading dashboard...</div>;
    }

    return (
        <div className="space-y-6">
             {/* dnd-kit Context */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={layout.map(item => item.id)} // Use item IDs
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-6">
                        {layout.map((item) => (
                           <SortableDashboardSection key={item.id} item={item} />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
};

export default Dashboard;
