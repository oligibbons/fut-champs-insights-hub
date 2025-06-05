
import { useDataSync } from './useDataSync';

export function useAccountData() {
  // This hook now serves as a simple alias to useDataSync for backward compatibility
  // We removed the circular dependency by making this a simple passthrough
  const dataSync = useDataSync();
  
  const addNewWeek = () => {
    const newWeekNumber = dataSync.weeklyData.length + 1;
    const newWeek = {
      weekNumber: newWeekNumber,
      startDate: new Date().toISOString(),
      winTarget: {
        wins: 10,
        goalsScored: undefined,
        cleanSheets: undefined,
        minimumRank: undefined
      }
    };
    
    return dataSync.createWeek(newWeek);
  };

  const updateWeek = (weekId: string, updatedWeek: any) => {
    return dataSync.updateWeek(weekId, updatedWeek);
  };

  const getDefaultSquad = () => {
    return null; // Legacy function - no longer used with Supabase
  };

  return {
    activeAccount: dataSync.activeAccount,
    weeks: dataSync.weeklyData,
    setWeeks: dataSync.setWeeklyData,
    getCurrentWeek: dataSync.getCurrentWeek,
    addNewWeek,
    updateWeek,
    getDefaultSquad
  };
}
