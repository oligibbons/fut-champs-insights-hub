
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { WeeklyPerformance, GameResult, Achievement } from '@/types/futChampions';
import { checkAchievements } from '@/utils/achievements';
import { generateMatchFeedback } from '@/utils/feedback';

export function useAchievementNotifications() {
  const { toast } = useToast();
  const [achievements, setAchievements] = useLocalStorage<Achievement[]>('futChampions_achievements', []);

  const checkAndNotifyAchievements = (weeklyData: WeeklyPerformance[], currentWeek: WeeklyPerformance) => {
    // Calculate all-time stats
    const allTimeStats = {
      totalGames: weeklyData.reduce((sum, week) => sum + week.games.length, 0),
      totalWins: weeklyData.reduce((sum, week) => sum + week.totalWins, 0),
      totalGoals: weeklyData.reduce((sum, week) => sum + week.totalGoals, 0),
      totalCleanSheets: 0,
      longestWinStreak: Math.max(...weeklyData.map(week => week.bestStreak || 0)),
      completedWeeks: weeklyData.filter(week => week.isCompleted).length,
      averageOpponentSkill: weeklyData.length > 0 ? 
        weeklyData.reduce((sum, week) => sum + (week.averageOpponentSkill || 0), 0) / weeklyData.length : 0
    };

    // Check for new achievements
    const newAchievements = checkAchievements(allTimeStats, currentWeek, achievements);
    
    if (newAchievements.length > 0) {
      setAchievements(newAchievements);
      
      newAchievements
        .filter(achievement => achievement.unlocked && !achievements.find(a => a.id === achievement.id)?.unlocked)
        .forEach(achievement => {
          toast({
            title: "🏆 Achievement Unlocked!",
            description: `${achievement.title}: ${achievement.description}`,
            duration: 5000,
          });
        });
    }
  };

  const notifyGameFeedback = (game: GameResult, weekData: WeeklyPerformance) => {
    const feedback = generateMatchFeedback(game, weekData);
    
    if (feedback) {
      toast({
        title: feedback.type === 'encouragement' ? "🎉 Great Job!" : 
               feedback.type === 'motivation' ? "💪 Keep Going!" :
               feedback.type === 'tip' ? "💡 Pro Tip" : "📊 Analysis",
        description: feedback.message,
        duration: 4000,
      });
    }
  };

  return {
    checkAndNotifyAchievements,
    notifyGameFeedback
  };
}
