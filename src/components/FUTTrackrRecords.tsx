import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { RecordCard } from "./RecordCard";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from "@dnd-kit/sortable";
import { useState } from "react";

export function FUTTrackrRecords() {
  const { weeklyData } = useSupabaseData();
  const stats = useDashboardStats(weeklyData);

  const initialItems = {
    main: ["bestRecord", "averageWins", "mostGoalsInRun", "longestWinStreak"],
    secondary: ["totalGoals", "averageGoalsPerGame", "totalWins", "xgVsGoalsRatio", "overallGoalDifference", "averagePlayerRating"],
    tertiary: ["averageShotAccuracy", "averagePossession", "averageDribbleSuccess", "averagePassAccuracy", "averagePassesPerGame", "totalCleanSheets", "mvp", "disciplineIndex"],
  };

  const [items, setItems] = useState(initialItems);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const cardData: { [key: string]: { title: string; value: string | number; tooltip: string; trend: "up" | "down" | "neutral" } } = {
    bestRecord: { title: "Best Record", value: `${stats.bestRecord} Wins`, tooltip: "Highest wins achieved in a single run.", trend: "up" },
    averageWins: { title: "Average Wins", value: stats.averageWins.toFixed(1), tooltip: "Average number of wins per run.", trend: "neutral" },
    mostGoalsInRun: { title: "Most Goals in Run", value: stats.mostGoalsInRun, tooltip: "Most goals scored in a single run.", trend: "down" },
    longestWinStreak: { title: "Longest Win Streak", value: stats.longestWinStreak, tooltip: "Most consecutive wins without a loss.", trend: "up" },
    totalGoals: { title: "Total Goals", value: stats.totalGoals, tooltip: "Total goals scored across all runs.", trend: "up" },
    averageGoalsPerGame: { title: "Avg Goals / Game", value: stats.averageGoalsPerGame.toFixed(2), tooltip: "Average goals scored per game.", trend: "up" },
    totalWins: { title: "Total Wins", value: stats.totalWins, tooltip: "Total wins across all runs.", trend: "neutral" },
    xgVsGoalsRatio: { title: "xG vs Goals", value: `${stats.xgVsGoalsRatio.toFixed(2)}`, tooltip: "Ratio of expected goals to actual goals.", trend: "down" },
    overallGoalDifference: { title: "Goal Difference", value: stats.overallGoalDifference, tooltip: "Overall goal difference.", trend: "up" },
    averagePlayerRating: { title: "Avg Player Rating", value: stats.averagePlayerRating.toFixed(2), tooltip: "Average performance rating of all players with 1 or more minutes in a match.", trend: "up" },
    averageShotAccuracy: { title: "Shot Accuracy", value: `${stats.averageShotAccuracy.toFixed(1)}%`, tooltip: "Average shot accuracy.", trend: "up" },
    averagePossession: { title: "Possession", value: `${stats.averagePossession.toFixed(1)}%`, tooltip: "Average possession.", trend: "down" },
    averageDribbleSuccess: { title: "Dribble Success", value: `${stats.averageDribbleSuccess}%`, tooltip: "Average dribble success rate (placeholder data).", trend: "up" },
    averagePassAccuracy: { title: "Pass Accuracy", value: `${stats.averagePassAccuracy.toFixed(1)}%`, tooltip: "Average pass accuracy.", trend: "neutral" },
    averagePassesPerGame: { title: "Passes / Game", value: stats.averagePassesPerGame.toFixed(0), tooltip: "Average passes per game.", trend: "up" },
    totalCleanSheets: { title: "Clean Sheets", value: stats.totalCleanSheets, tooltip: "Total games with no goals conceded.", trend: "up" },
    mvp: { title: "MVP", value: stats.mvp, tooltip: "Most valuable player based on performance.", trend: "neutral" },
    disciplineIndex: { title: "Discipline Index", value: stats.disciplineIndex, tooltip: "Disciplinary record rating.", trend: "up" },
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeContainer = Object.keys(items).find(key => items[key as keyof typeof items].includes(active.id as string));
      const overContainer = Object.keys(items).find(key => items[key as keyof typeof items].includes(over.id as string));

      if (activeContainer && overContainer) {
        setItems((prev) => {
          const newItems = { ...prev };
          const activeItems = newItems[activeContainer as keyof typeof items];
          const overItems = newItems[overContainer as keyof typeof items];
          const oldIndex = activeItems.indexOf(active.id as string);
          const newIndex = overItems.indexOf(over.id as string);

          if (activeContainer === overContainer) {
            newItems[activeContainer as keyof typeof items] = arrayMove(activeItems, oldIndex, newIndex);
          } else {
            const [movedItem] = activeItems.splice(oldIndex, 1);
            overItems.splice(newIndex, 0, movedItem);
          }

          return newItems;
        });
      }
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="space-y-4">
        <SortableContext items={items.main} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {items.main.map(id => (
              <RecordCard key={id} id={id} {...cardData[id]} />
            ))}
          </div>
        </SortableContext>
        <SortableContext items={items.secondary} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {items.secondary.map(id => (
              <RecordCard key={id} id={id} {...cardData[id]} />
            ))}
          </div>
        </SortableContext>
        <SortableContext items={items.tertiary} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {items.tertiary.map(id => (
              <RecordCard key={id} id={id} {...cardData[id]} />
            ))}
          </div>
        </SortableContext>
      </div>
    </DndContext>
  );
}
