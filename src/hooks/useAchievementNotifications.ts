
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { checkAchievements } from '@/utils/achievements';
import { generateMatchFeedback } from '@/utils/feedback';
import { WeeklyPerformance, GameResult } from '@/types/futChampions';

export function useAchievementNotifications() {
  const { toast } = useToast();

  const checkAndNotifyAchievements = (weeklyData: WeeklyPerformance[], currentWeek: WeeklyPerformance | null) => {
    const newAchievements = checkAchievements(weeklyData, currentWeek);
    
    newAchievements.forEach(achievement => {
      toast({
        title: `🏆 Achievement Unlocked!`,
        description: `${achievement.title}: ${achievement.description}`,
        duration: 5000,
      });
    });

    return newAchievements;
  };

  const notifyGameFeedback = (
    game: GameResult, 
    week: WeeklyPerformance, 
    allTimeStats: { totalGames: number; totalWins: number; totalGoals: number }
  ) => {
    const feedback = generateMatchFeedback(game, week, allTimeStats);
    
    feedback.forEach((feedbackItem, index) => {
      setTimeout(() => {
        const emoji = feedbackItem.type === 'encouragement' ? '🎉' : 
                     feedbackItem.type === 'motivation' ? '💪' : 
                     feedbackItem.type === 'analysis' ? '📊' : '💡';
        
        toast({
          title: `${emoji} ${feedbackItem.type.charAt(0).toUpperCase() + feedbackItem.type.slice(1)}`,
          description: feedbackItem.message,
          duration: 4000,
        });
      }, index * 1500); // Stagger notifications
    });
  };

  const notifyMilestone = (milestone: string, description: string) => {
    toast({
      title: `🎯 Milestone Reached!`,
      description: `${milestone}: ${description}`,
      duration: 4000,
    });
  };

  const notifyTargetProgress = (current: number, target: number, type: string) => {
    const percentage = Math.round((current / target) * 100);
    
    if (percentage === 50) {
      toast({
        title: `⚡ Halfway There!`,
        description: `You're 50% towards your ${type} target (${current}/${target})`,
        duration: 3000,
      });
    } else if (percentage === 75) {
      toast({
        title: `🔥 Almost There!`,
        description: `You're 75% towards your ${type} target (${current}/${target})`,
        duration: 3000,
      });
    } else if (percentage >= 100) {
      toast({
        title: `🎯 Target Achieved!`,
        description: `Congratulations! You've reached your ${type} target!`,
        duration: 5000,
      });
    }
  };

  return {
    checkAndNotifyAchievements,
    notifyGameFeedback,
    notifyMilestone,
    notifyTargetProgress
  };
}
