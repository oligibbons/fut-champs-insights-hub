
import { GameResult, WeeklyPerformance, MatchFeedback } from '@/types/futChampions';

const WIN_ENCOURAGEMENTS = [
  "Brilliant performance! You're on fire! 🔥",
  "What a win! Keep this momentum going! ⚡",
  "Dominant display! Your opponent didn't stand a chance! 💪",
  "Clinical finishing! That's how it's done! 🎯",
  "Solid victory! You're getting better with each game! 📈",
  "Impressive win! Your hard work is paying off! 🏆",
  "Outstanding performance! You made it look easy! ⭐"
];

const LOSS_MOTIVATIONS = [
  "Every loss is a lesson. Come back stronger! 💪",
  "Don't let this get you down. Champions bounce back! 🏆",
  "Analyze what went wrong and improve. You've got this! 📊",
  "Sometimes you win, sometimes you learn. Keep pushing! 🚀",
  "The best players use defeats as fuel. Time to show your character! 🔥",
  "This is just a temporary setback. Your comeback starts now! ⚡",
  "Great players are made in moments like these. Rise up! 👑"
];

const WIN_ANALYSIS_TIPS = [
  "Your passing accuracy was excellent - keep finding those key passes!",
  "Great defensive performance - clean sheets win games!",
  "Your shot conversion was clinical - maintain that composure!",
  "Excellent possession play - controlling the game is key!",
  "Your counter-attacks were lethal - timing is everything!",
  "Solid all-around performance - consistency breeds success!"
];

const LOSS_IMPROVEMENT_TIPS = [
  "Focus on your defensive shape - too many easy chances conceded",
  "Work on your finishing - create more, convert more!",
  "Improve your passing accuracy - possession wins games",
  "Stay calm under pressure - rushed decisions cost goals",
  "Study your opponent's patterns - adaptation is key",
  "Practice set pieces - they can be game-changers!"
];

export function generateMatchFeedback(
  game: GameResult, 
  week: WeeklyPerformance, 
  allTimeStats: { totalGames: number; totalWins: number; totalGoals: number }
): MatchFeedback[] {
  const feedback: MatchFeedback[] = [];
  
  // Win/Loss feedback
  if (game.result === 'win') {
    const encouragement = WIN_ENCOURAGEMENTS[Math.floor(Math.random() * WIN_ENCOURAGEMENTS.length)];
    const tip = WIN_ANALYSIS_TIPS[Math.floor(Math.random() * WIN_ANALYSIS_TIPS.length)];
    
    feedback.push({
      type: 'encouragement',
      message: encouragement,
      context: 'win'
    });
    
    feedback.push({
      type: 'analysis',
      message: tip,
      context: 'win'
    });
  } else {
    const motivation = LOSS_MOTIVATIONS[Math.floor(Math.random() * LOSS_MOTIVATIONS.length)];
    const tip = LOSS_IMPROVEMENT_TIPS[Math.floor(Math.random() * LOSS_IMPROVEMENT_TIPS.length)];
    
    feedback.push({
      type: 'motivation',
      message: motivation,
      context: 'loss'
    });
    
    feedback.push({
      type: 'tip',
      message: tip,
      context: 'loss'
    });
  }
  
  // Milestone feedback
  if (allTimeStats.totalGames === 1) {
    feedback.push({
      type: 'encouragement',
      message: "Welcome to your FUT Champions journey! 🚀",
      context: 'milestone'
    });
  }
  
  if (allTimeStats.totalGames === 50) {
    feedback.push({
      type: 'encouragement',
      message: "50 games completed! You're becoming a veteran! 🏅",
      context: 'milestone'
    });
  }
  
  if (allTimeStats.totalGoals === 100) {
    feedback.push({
      type: 'encouragement',
      message: "Century of goals! What a milestone! 💯⚽",
      context: 'milestone'
    });
  }
  
  // Streak feedback
  const recentGames = [...week.games].reverse().slice(0, 5);
  const winStreak = calculateWinStreak(recentGames);
  
  if (winStreak >= 3) {
    feedback.push({
      type: 'encouragement',
      message: `${winStreak} wins in a row! You're unstoppable! 🔥`,
      context: 'streak'
    });
  }
  
  return feedback;
}

function calculateWinStreak(games: GameResult[]): number {
  let streak = 0;
  for (const game of games) {
    if (game.result === 'win') {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
