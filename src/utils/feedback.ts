
import { GameResult, WeeklyPerformance } from '@/types/futChampions';

export interface MatchFeedback {
  type: 'encouragement' | 'motivation' | 'analysis' | 'tip';
  message: string;
  context: 'win' | 'loss' | 'milestone' | 'streak';
}

export function generateMatchFeedback(
  game: GameResult,
  weekData: WeeklyPerformance
): MatchFeedback | null {
  const winRate = weekData.games.length > 0 ? (weekData.totalWins / weekData.games.length) * 100 : 0;
  
  if (game.result === 'win') {
    if (weekData.currentStreak && weekData.currentStreak >= 3) {
      return {
        type: 'encouragement',
        message: `Amazing! You're on a ${weekData.currentStreak} game win streak! Keep this momentum going!`,
        context: 'streak'
      };
    }
    return {
      type: 'encouragement',
      message: `Great win! Your performance is showing real improvement.`,
      context: 'win'
    };
  } else {
    if (winRate < 30) {
      return {
        type: 'motivation',
        message: `Don't give up! Every champion has faced tough periods. Analyze your games and come back stronger!`,
        context: 'loss'
      };
    }
    return {
      type: 'tip',
      message: `Take a moment to review what went wrong. Small adjustments can make a big difference!`,
      context: 'loss'
    };
  }
}
