
import { useLocalStorage } from './useLocalStorage';
import { WeeklyPerformance } from '@/types/futChampions';

export function useAccountData() {
  const [activeAccount] = useLocalStorage<string>('fc25-active-account', 'Main Account');
  const [weeks, setWeeks] = useLocalStorage<WeeklyPerformance[]>(`fc25-weeks-${activeAccount}`, []);
  
  const getCurrentWeek = (): WeeklyPerformance | null => {
    const currentWeek = weeks.find(week => !week.isCompleted);
    return currentWeek || null;
  };

  const addNewWeek = (): WeeklyPerformance => {
    const newWeekNumber = weeks.length + 1;
    const newWeek: WeeklyPerformance = {
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
      squadUsed: '',
      weeklyRating: 0,
      isCompleted: false
    };
    
    const updatedWeeks = [...weeks, newWeek];
    setWeeks(updatedWeeks);
    return newWeek;
  };

  const updateWeek = (weekId: string, updatedWeek: WeeklyPerformance) => {
    const updatedWeeks = weeks.map(week => 
      week.id === weekId ? updatedWeek : week
    );
    setWeeks(updatedWeeks);
  };

  return {
    activeAccount,
    weeks,
    setWeeks,
    getCurrentWeek,
    addNewWeek,
    updateWeek
  };
}
