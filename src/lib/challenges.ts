// src/lib/challenges.ts

// Defines the shape of a single challenge
export interface Challenge {
    id: string;
    name: string;
    description: string;
    category: 'Offensive' | 'Defensive' | 'Technical' | 'Management' | 'Bonus' | 'First To Achieve';
    points: number;
    evaluationType: 'competitive' | 'binary' | 'firstToAchieve';
    metric: string; // The key used for evaluation
    minGames?: number;
    
    // For 'binary' challenges
    conditions?: {
      metric: string;
      operator: '==' | '>=' | '<=' | '===' | '>';
      value: number | boolean;
      type: 'runTotal' | 'singleGame';
    }[];
    
    // For 'firstToAchieve' challenges
    value?: number | boolean; // The target value to achieve
    minPasses?: number; // Special case for first_6
  }
  
  // This is the global, immutable pool of all available challenges
  export const CHALLENGE_POOL: Challenge[] = [
    // --- Offensive Challenges (7) ---
    { id: 'off_1', name: 'Most Goals Scored', description: 'Score the most goals in the league.', category: 'Offensive', points: 3, evaluationType: 'competitive', metric: 'totalGoalsScored' },
    { id: 'off_2', name: 'Highest XG Differential', description: 'Achieve the highest positive Expected Goal Differential in the league.', category: 'Offensive', points: 4, evaluationType: 'competitive', metric: 'totalXGDiff' },
    { id: 'off_3', name: 'Most Hat-Tricks', description: 'Score the most hat-tricks (3+ goals in a single game) in the league.', category: 'Offensive', points: 2, evaluationType: 'competitive', metric: 'totalHatTricks' },
    { id: 'off_4', name: 'Most Assists', description: 'Provide the most assists in the league.', category: 'Offensive', points: 3, evaluationType: 'competitive', metric: 'totalAssists' },
    { id: 'off_5', name: 'Highest Shot Accuracy', description: 'Achieve the highest Shot Accuracy in the league (min 15 games).', category: 'Offensive', points: 4, evaluationType: 'competitive', metric: 'avgShotAccuracy', minGames: 15 },
    { id: 'off_6', name: 'Biggest Win Margin', description: 'Achieve the largest goal difference in a single winning game.', category: 'Offensive', points: 4, evaluationType: 'competitive', metric: 'maxWinMargin' },
    { id: 'off_7', name: 'Most Wins', description: 'Win the most games in the league', category: 'Offensive', points: 5, evaluationType: 'competitive', metric: 'totalWins' },
  
    // --- Defensive Challenges (8) ---
    { id: 'def_1', name: 'Most Clean Sheets', description: 'Achieve the most clean sheets (0 goals conceded) in the league.', category: 'Defensive', points: 5, evaluationType: 'competitive', metric: 'totalCleanSheets' },
    { id: 'def_2', name: 'Fewest Goals Conceded', description: 'Concede the fewest goals over a full Champs run.', category: 'Defensive', points: 4, evaluationType: 'competitive', metric: 'totalGoalsConceded' },
    { id: 'def_3', name: 'Lowest XG Conceded Per Game', description: 'Have the lowest average Expected Goals Conceded per game (min 10 games).', category: 'Defensive', points: 5, evaluationType: 'competitive', metric: 'avgXGConceded', minGames: 10 },
    { id: 'def_4', name: 'Fewest Fouls Conceded Per Game', description: 'Commit the fewest fouls per game (min 10 games).', category: 'Defensive', points: 4, evaluationType: 'competitive', metric: 'avgFouls', minGames: 10 },
    { id: 'def_5', name: 'Most Goals from Defenders', description: 'Score the most goals using players categorized as Defenders (CB, LB, RB, LWB, RWB).', category: 'Defensive', points: 3, evaluationType: 'competitive', metric: 'totalDefenderGoals' },
    { id: 'def_6', name: 'Most Consecutive Clean Sheets', description: 'Achieve the longest streak of consecutive clean sheets in the league.', category: 'Defensive', points: 4, evaluationType: 'competitive', metric: 'maxConsecutiveCleanSheets' },
    { id: 'def_7', name: 'No Red Cards', description: 'Complete the Champs run without receiving any red cards.', category: 'Defensive', points: 3, evaluationType: 'binary', conditions: [{ metric: 'totalRedCards', operator: '==', value: 0, type: 'runTotal' }] },
    { id: 'def_8', name: 'Best Disciplinary Record', description: 'Fewest total fouls committed.', category: 'Defensive', points: 2, evaluationType: 'competitive', metric: 'totalFouls' }, // Simplified metric for evaluation
  
    // --- Technical & Midfield Challenges (5) ---
    { id: 'tech_1', name: 'Highest Pass Accuracy', description: 'Achieve the highest Pass Accuracy in the league.', category: 'Technical', points: 4, evaluationType: 'competitive', metric: 'avgPassAccuracy' },
    { id: 'tech_2', name: 'Highest Average Possession', description: 'Average the highest possession percentage per game.', category: 'Technical', points: 3, evaluationType: 'competitive', metric: 'avgPossession' },
    { id: 'tech_3', name: 'Most Passes', description: 'Make the most passes in the league.', category: 'Technical', points: 3, evaluationType: 'competitive', metric: 'totalPasses' },
    { id: 'tech_4', name: 'Most Goals from Midfielders', description: 'Score the most goals using players categorized as Midfielders (CM, CDM, CAM, LM, RM).', category: 'Technical', points: 3, evaluationType: 'competitive', metric: 'totalMidfielderGoals' },
    { id: 'tech_5', name: 'Highest Average Player Rating', description: 'Achieve the highest average player rating for your squad.', category: 'Technical', points: 2, evaluationType: 'competitive', metric: 'avgPlayerRating' },
  
    // --- Match Management & Strategy Challenges (5) ---
    { id: 'mgmt_1', name: 'Longest Unbeaten Streak', description: 'Achieve the longest unbeaten streak in the league.', category: 'Management', points: 5, evaluationType: 'competitive', metric: 'maxUnbeatenStreak' },
    { id: 'mgmt_2', name: 'Most Games Played (No Quits)', description: 'Play the most games in the league without rage quitting.', category: 'Management', points: 3, evaluationType: 'competitive', metric: 'totalGamesNoQuits' },
    { id: 'mgmt_3', name: 'Most Extra Time Wins', description: 'Win the most games that go to Extra Time.', category: 'Management', points: 4, evaluationType: 'competitive', metric: 'totalExtraTimeWins' },
    { id: 'mgmt_4', name: 'Most Opponent Rage Quits', description: 'Win the most games by opponent rage quits.', category: 'Management', points: 3, evaluationType: 'competitive', metric: 'totalOpponentRageQuits' },
    { id: 'mgmt_5', name: 'Fewest Minutes Played', description: 'Play the fewest total minutes across all games', category: 'Management', points: 3, evaluationType: 'competitive', metric: 'totalMinutesPlayed' },
  
    // --- Quirky / Bonus Challenges (7) ---
    { id: 'quirk_1', name: 'Most Formations Used in Wins', description: 'Win games using the most *different* formations.', category: 'Bonus', points: 4, evaluationType: 'competitive', metric: 'totalUniqueWinningFormations' },
    { id: 'quirk_2', name: 'Bronze Baron', description: 'Win a game using 3+ bronze players in your starting XI.', category: 'Bonus', points: 3, evaluationType: 'binary', conditions: [{ metric: 'bronzeStarterWin', operator: '==', value: true, type: 'singleGame' }] },
    { id: 'quirk_3', name: 'Goalie Goal!', description: 'Score a goal with your Goalkeeper.', category: 'Bonus', points: 4, evaluationType: 'binary', conditions: [{ metric: 'goalieGoal', operator: '==', value: true, type: 'singleGame' }] },
    { id: 'quirk_4', name: 'Most Unique Goalscorers', description: 'Score goals with the highest number of different players.', category: 'Bonus', points: 3, evaluationType: 'competitive', metric: 'totalUniqueGoalscorers' },
    { id: 'quirk_5', name: 'No Subs, No Problem', description: 'Win the most games without making any substitutions.', category: 'Bonus', points: 3, evaluationType: 'competitive', metric: 'totalWinsNoSubs' },
    { id: 'quirk_6', name: 'Loan Star Performer', description: 'Score 5+ goals with a Loan Player in a single Champs run.', category: 'Bonus', points: 2, evaluationType: 'binary', conditions: [{ metric: 'totalLoanPlayerGoals', operator: '>=', value: 5, type: 'runTotal' }] },
    { id: 'quirk_7', name: 'Perfect Game', description: 'Win a game without conceding a single shot on target.', category: 'Bonus', points: 4, evaluationType: 'binary', conditions: [{ metric: 'winZeroShotsOnTargetConceded', operator: '==', value: true, type: 'singleGame' }] },
  
    // --- New "First to Achieve" Challenges (9) ---
    { id: 'first_1', name: 'First to 5 Goals in a Game', description: 'Be the first player in the league to score 5+ goals in a single match.', category: 'First To Achieve', points: 2, evaluationType: 'firstToAchieve', metric: 'goalsInSingleMatch', value: 5 },
    { id: 'first_2', name: 'First Clean Sheet', description: 'Be the first player in the league to achieve a clean sheet.', category: 'First To Achieve', points: 2, evaluationType: 'firstToAchieve', metric: 'cleanSheet', value: true },
    { id: 'first_3', name: 'First Red Card Received', description: 'Be the first player in the league to receive a red card.', category: 'First To Achieve', points: 2, evaluationType: 'firstToAchieve', metric: 'redCardReceived', value: true },
    { id: 'first_4', name: 'First to 3-0 Win', description: 'Be the first player in the league to win a game by a 3-0 scoreline.', category: 'First To Achieve', points: 2, evaluationType: 'firstToAchieve', metric: 'winBy3_0', value: true },
    { id: 'first_5', name: 'First Golden Goal Win', description: 'Be the first player in the league to win a game by scoring 1 goal.', category: 'First To Achieve', points: 5, evaluationType: 'firstToAchieve', metric: 'winBy1_0', value: true },
    { id: 'first_6', name: 'First Perfect Pass Accuracy', description: 'Be the first player to achieve 100% Pass Accuracy (min 50 passes) in a single game.', category: 'First To Achieve', points: 2, evaluationType: 'firstToAchieve', metric: 'perfectPassAccuracyGame', value: true, minPasses: 50 },
    { id: 'first_7', name: 'First Opponent Rage Quit', description: 'Be the first player to have an opponent rage quit.', category: 'First To Achieve', points: 2, evaluationType: 'firstToAchieve', metric: 'opponentRageQuit', value: true },
    { id: 'first_8', name: 'First Goal from Defender', description: 'Be the first player to score a goal with a player categorized as a Defender.', category: 'First To Achieve', points: 2, evaluationType: 'firstToAchieve', metric: 'defenderGoalInGame', value: true },
    { id: 'first_9', name: 'First Penalty Shootout Win', description: 'Be the first player to win a game via a penalty shootout.', category: 'First To Achieve', points: 2, evaluationType: 'firstToAchieve', metric: 'penaltyShootoutWin', value: true },
  ];