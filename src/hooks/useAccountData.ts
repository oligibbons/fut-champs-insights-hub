
import { useDataSync } from './useDataSync';

export function useAccountData() {
  const { 
    activeAccount, 
    weeklyData, 
    setWeeklyData, 
    getCurrentWeek, 
    getStorageKey,
    getDefaultSquad
  } = useDataSync();
  
  const addNewWeek = () => {
    const newWeekNumber = weeklyData.length + 1;
    const newWeek = {
      id: `week-${newWeekNumber}-${Date.now()}`,
      weekNumber: newWeekNumber,
      startDate: new Date().toISOString(),
      endDate: '',
      games: [],
      totalWins: 0,
      totalLosses: 0,
      totalGoals: 0,
      totalConceded: 0,
      totalExpectedGoals: 0,
      totalExpectedGoalsAgainst: 0,
      averageOpponentSkill: 0,
      squadUsed: getDefaultSquad()?.name || '',
      weeklyRating: 0,
      isCompleted: false,
      currentStreak: 0,
      gamesPlayed: 0
    };
    
    const updatedWeeks = [...weeklyData, newWeek];
    setWeeklyData(updatedWeeks);
    return newWeek;
  };

  const updateWeek = (weekId: string, updatedWeek: any) => {
    const updatedWeeks = weeklyData.map(week => 
      week.id === weekId ? updatedWeek : week
    );
    setWeeklyData(updatedWeeks);
  };

  return {
    activeAccount,
    weeks: weeklyData,
    setWeeks: setWeeklyData,
    getCurrentWeek,
    addNewWeek,
    updateWeek,
    getDefaultSquad
  };
}
