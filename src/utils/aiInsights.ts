import { WeeklyPerformance, GameResult, PlayerPerformance, TeamStats } from '@/types/futChampions';

// This is the unified Insight structure that the frontend expects.
export interface Insight {
  id: string;
  title: string;
  description: string;
  category: 'strength' | 'weakness' | 'opportunity';
  priority: 'high' | 'medium' | 'low';
}

// ===================================================================================
// 1. GEMINI API-POWERED INSIGHT GENERATION (REMOTE)
// ===================================================================================

/**
 * Generates creative, holistic insights by calling the Google Gemini API.
 */
async function generateRemoteInsights(summary: string): Promise<Insight[]> {
  console.log("Attempting to generate creative insights with Gemini API...");
  const apiKey = ""; // Handled by the environment
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

  const jsonSchema = {
    type: "ARRAY",
    items: {
      type: "OBJECT",
      properties: {
        id: { type: "STRING" },
        title: { type: "STRING" },
        description: { type: "STRING" },
        category: { type: "STRING", enum: ["opportunity"] },
        priority: { type: "STRING", enum: ["high", "medium", "low"] },
      },
      required: ["id", "title", "description", "category", "priority"],
    },
  };

  const payload = {
    contents: [{ parts: [{ text: summary }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: jsonSchema,
    },
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second timeout

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`API call failed with status: ${response.status}`);
    const result = await response.json();
    if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
      const parsedJson = JSON.parse(result.candidates[0].content.parts[0].text);
      console.log("Successfully received structured insights from Gemini API:", parsedJson);
      return parsedJson as Insight[];
    } else {
      throw new Error("Invalid response structure from Gemini API.");
    }
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn("Gemini API call failed or timed out. Falling back to local insights engine only.", error);
    throw error;
  }
}

// ===================================================================================
// 2. MASSIVELY ENHANCED LOCAL INSIGHTS ENGINE
// ===================================================================================

type InsightRule = (data: AggregatedData) => Insight | null | (Insight | null)[];
interface AggregatedData {
    allGames: GameResult[];
    totalGames: number;
    winRate: number;
    recentWinRate: number;
    formDifference: number;
    avgGoals: number;
    avgConceded: number;
    shotConversionRate: number;
    chanceQuality: number;
    xgPerformance: number;
    xgaPerformance: number;
    cleanSheetRate: number;
    avgFouls: number;
    avgYellowCards: number;
    tagStats: Record<string, { count: number; wins: number; winRate: number }>;
    playerStats: Record<string, { games: number; totalRating: number; avgRating: number; goals: number; assists: number; GAs: number; }>;
}

/**
 * This is the powerful, pre-programmed local engine that provides a "metric tonne" of fallback insights.
 * It uses a rule-based system to generate highly detailed and intelligent analysis.
 */
function generateLocalInsights(allGames: GameResult[]): Insight[] {
    console.log("Generating insights with the massively enhanced local engine...");
    if (allGames.length < 5) return [];
    
    // --- MASSIVE DATA AGGREGATION ---
    const totalGames = allGames.length;
    const wins = allGames.filter(g => g.result === 'win').length;
    const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;
    const recentGames = allGames.slice(-10);
    const recentWins = recentGames.filter(g => g.result === 'win').length;
    const recentWinRate = recentGames.length > 0 ? (recentWins / recentGames.length) * 100 : 0;
    
    const totalGoals = allGames.reduce((sum, g) => sum + (g.teamStats?.actualGoals ?? 0), 0);
    const totalConceded = allGames.reduce((sum, g) => sum + (g.teamStats?.actualGoalsAgainst ?? 0), 0);
    const totalShots = allGames.reduce((sum, g) => sum + (g.teamStats?.shots ?? 0), 0);
    const totalShotsOnTarget = allGames.reduce((sum, g) => sum + (g.teamStats?.shotsOnTarget ?? 0), 0);
    const cleanSheets = allGames.filter(g => (g.teamStats?.actualGoalsAgainst ?? 1) === 0).length;

    const totalXG = allGames.reduce((sum, g) => sum + (g.teamStats?.expectedGoals ?? 0), 0);
    const totalXGA = allGames.reduce((sum, g) => sum + (g.teamStats?.expectedGoalsAgainst ?? 0), 0);

    const tagStats: Record<string, { count: number; wins: number; winRate: number }> = {};
    allGames.forEach(game => {
        game.tags?.forEach(tag => {
            if (!tagStats[tag]) tagStats[tag] = { count: 0, wins: 0, winRate: 0 };
            tagStats[tag].count++;
            if (game.result === 'win') tagStats[tag].wins++;
        });
    });
    Object.values(tagStats).forEach(stats => {
        stats.winRate = stats.count > 0 ? (stats.wins / stats.count) * 100 : 0;
    });
    
    const playerStats: AggregatedData['playerStats'] = {};
    allGames.flatMap(g => g.playerStats ?? []).forEach(p => {
        if (!playerStats[p.name]) playerStats[p.name] = { games: 0, totalRating: 0, avgRating: 0, goals: 0, assists: 0, GAs: 0 };
        playerStats[p.name].games++;
        playerStats[p.name].totalRating += p.rating;
        playerStats[p.name].goals += p.goals;
        playerStats[p.name].assists += p.assists;
    });
    Object.values(playerStats).forEach(p => {
        p.avgRating = p.totalRating / p.games;
        p.GAs = p.goals + p.assists;
    });

    const aggregatedData: AggregatedData = {
        allGames, totalGames, winRate, recentWinRate, formDifference: recentWinRate - winRate,
        avgGoals: totalGames > 0 ? totalGoals / totalGames : 0,
        avgConceded: totalGames > 0 ? totalConceded / totalGames : 0,
        shotConversionRate: totalShots > 0 ? (totalGoals / totalShots) * 100 : 0,
        chanceQuality: totalShots > 0 ? (totalShotsOnTarget / totalShots) * 100 : 0,
        xgPerformance: totalGoals - totalXG,
        xgaPerformance: totalXGA - totalConceded,
        cleanSheetRate: totalGames > 0 ? (cleanSheets / totalGames) * 100 : 0,
        avgFouls: allGames.reduce((s, g) => s + (g.teamStats?.fouls ?? 0), 0) / totalGames,
        avgYellowCards: allGames.reduce((s, g) => s + (g.teamStats?.yellowCards ?? 0), 0) / totalGames,
        tagStats, playerStats
    };

    // --- IMMENSE RULE ENGINE ---
    const rules: InsightRule[] = [
        // --- PERFORMANCE & FORM ---
        (d) => d.winRate > 65 ? { id: 'elite_win_rate', title: 'Elite Win Rate', description: `Your overall win rate of ${d.winRate.toFixed(1)}% is exceptional, placing you in a high tier of players.`, category: 'strength', priority: 'medium' } : null,
        (d) => d.winRate < 45 ? { id: 'low_win_rate', title: 'Win Rate Needs Improvement', description: `Your overall win rate of ${d.winRate.toFixed(1)}% suggests struggles with consistency. Focus on analyzing losses to find patterns.`, category: 'weakness', priority: 'high' } : null,
        (d) => d.formDifference > 20 && d.allGames.length >= 10 ? { id: 'hot_streak', title: 'Excellent Recent Form', description: `You're on fire! Your win rate in the last 10 games (${d.recentWinRate.toFixed(1)}%) is a significant improvement on your average.`, category: 'strength', priority: 'medium' } : null,
        (d) => d.formDifference < -20 && d.allGames.length >= 10 ? { id: 'cold_streak', title: 'Performance Dip', description: `You're in a slump. Your win rate in the last 10 games (${d.recentWinRate.toFixed(1)}%) is well below your average. Consider a tactical switch or a break.`, category: 'weakness', priority: 'high' } : null,

        // --- ATTACKING PROFILE ---
        (d) => d.avgGoals > 3.5 ? { id: 'hyper_attack', title: 'Lethal Attacker', description: `Averaging ${d.avgGoals.toFixed(2)} goals per game is phenomenal. Your attack is relentless and clinical.`, category: 'strength', priority: 'medium' } : null,
        (d) => d.avgGoals < 1.8 ? { id: 'shy_attack', title: 'Goal Shy', description: `Averaging only ${d.avgGoals.toFixed(2)} goals per game is a major barrier. Focus on creating higher quality chances.`, category: 'weakness', priority: 'high' } : null,
        (d) => d.shotConversionRate > 25 ? { id: 'deadly_finisher', title: 'Deadly Finisher', description: `You convert over ${d.shotConversionRate.toFixed(0)}% of your shots into goals. Your finishing is absolutely elite.`, category: 'strength', priority: 'medium' } : null,
        (d) => d.chanceQuality < 50 ? { id: 'poor_shot_selection', title: 'Poor Shot Selection', description: `Less than half (${d.chanceQuality.toFixed(0)}%) of your shots are on target. You may be taking too many low-percentage shots from difficult angles.`, category: 'weakness', priority: 'medium' } : null,
        (d) => d.xgPerformance > 5 ? { id: 'xg_overperformer', title: 'Clinical Finisher (xG)', description: `You consistently outperform your Expected Goals, having scored ${d.xgPerformance.toFixed(1)} more goals than expected. This indicates exceptional finishing skill.`, category: 'strength', priority: 'low' } : null,
        (d) => d.xgPerformance < -5 ? { id: 'xg_underperformer', title: 'Wasteful in Front of Goal (xG)', description: `You've scored ${Math.abs(d.xgPerformance).toFixed(1)} fewer goals than expected. This suggests an opportunity to improve your finishing and composure.`, category: 'weakness', priority: 'medium' } : null,

        // --- DEFENSIVE PROFILE ---
        (d) => d.avgConceded < 1.5 ? { id: 'defensive_fortress', title: 'Defensive Fortress', description: `Conceding just ${d.avgConceded.toFixed(2)} goals per game is elite. Your defensive structure is incredibly solid.`, category: 'strength', priority: 'medium' } : null,
        (d) => d.avgConceded > 3.5 ? { id: 'leaky_defense', title: 'Leaky Defense', description: `Conceding an average of ${d.avgConceded.toFixed(2)} goals is a major concern. Review your defensive shape and player instructions.`, category: 'weakness', priority: 'high' } : null,
        (d) => d.cleanSheetRate > 30 ? { id: 'clean_sheet_master', title: 'Clean Sheet Master', description: `You keep a clean sheet in ${d.cleanSheetRate.toFixed(0)}% of your games. Your ability to completely shut out opponents is a major strength.`, category: 'strength', priority: 'medium' } : null,
        (d) => d.avgYellowCards > 2.5 ? { id: 'discipline_issue', title: 'Discipline Problem', description: `Averaging ${d.avgYellowCards.toFixed(1)} yellow cards per game is very high. This suggests overly aggressive tackling, which can lead to dangerous set pieces and red cards.`, category: 'weakness', priority: 'medium' } : null,

        // --- PSYCHOLOGICAL & SITUATIONAL PROFILE ---
        (d) => {
            const comebackWins = d.tagStats['Comeback Win']?.count ?? 0;
            if (comebackWins >= 3) return { id: 'comeback_king', title: 'Resilience is Key', description: `You've secured ${comebackWins} comeback wins, showing incredible mental fortitude and the ability to change games from losing positions.`, category: 'strength', priority: 'medium' };
            return null;
        },
        (d) => {
            const bottledLeads = d.tagStats['Bottled Lead Loss']?.count ?? 0;
            if (bottledLeads >= 3) return { id: 'bottler', title: 'Struggles to Hold a Lead', description: `You've lost from a winning position ${bottledLeads} times. This is a high-priority issue to address in your game management and mentality when ahead.`, category: 'weakness', priority: 'high' };
            return null;
        },
        (d) => {
            const frustration = d.tagStats['Frustrating Game'] ?? { count: 0, winRate: 0 };
            if (frustration.count >= 5 && frustration.winRate < 30) return { id: 'frustration_weakness', title: 'Vulnerable to Frustration', description: `You have a very low win rate of ${frustration.winRate.toFixed(0)}% in games you tag as 'Frustrating'. Your opponents may be exploiting this.`, category: 'weakness', priority: 'high' };
            return null;
        },
        (d) => {
            const clutch = d.tagStats['Close Game'] ?? { count: 0, winRate: 0 };
            if (clutch.count >= 5 && clutch.winRate > 60) return { id: 'clutch_player', title: 'Clutch Performer', description: `You excel under pressure, with a high win rate of ${clutch.winRate.toFixed(0)}% in 'Close Games'. You are decisive in key moments.`, category: 'strength', priority: 'medium' };
            return null;
        },
        (d) => {
            // Tilt Factor Analysis
            let postFrustrationGames = 0, postFrustrationWins = 0;
            for(let i = 0; i < d.allGames.length - 1; i++) {
                if (d.allGames[i].tags?.includes('Frustrating Game') || d.allGames[i].tags?.includes('Undeserved Loss')) {
                    postFrustrationGames++;
                    if(d.allGames[i+1].result === 'win') postFrustrationWins++;
                }
            }
            if (postFrustrationGames >= 5 && (postFrustrationWins / postFrustrationGames) < 0.3) {
                return { id: 'tilt_factor', title: 'Prone to "Tilt"', description: `Your performance suffers after a frustrating game. Your win rate in the match immediately following a frustrating loss is only ${((postFrustrationWins / postFrustrationGames) * 100).toFixed(0)}%. Taking a short break is crucial.`, category: 'weakness', priority: 'high'};
            }
            return null;
        },
        
        // --- OPPONENT ARCHETYPE ANALYSIS ---
        (d) => {
            const metaRats = d.tagStats['Meta Rat'] ?? { count: 0, winRate: 0 };
            if (metaRats.count >= 5 && metaRats.winRate < 40) return { id: 'meta_weakness', title: 'Struggle Against "Meta" Players', description: `Your ${metaRats.winRate.toFixed(0)}% win rate against 'Meta Rats' is low. This is an opportunity to learn current meta tactics to better counter them.`, category: 'opportunity', priority: 'high' };
            return null;
        },
         (d) => {
            const skillGods = d.tagStats['Skill God'] ?? { count: 0, winRate: 0 };
            if (skillGods.count >= 3 && skillGods.winRate > 60) return { id: 'skill_god_strength', title: 'Effective Against Skillers', description: `You have a strong ${skillGods.winRate.toFixed(0)}% win rate against 'Skill Gods', suggesting your defensive positioning is excellent at containing them.`, category: 'strength', priority: 'low' };
            return null;
        },
         (d) => {
            const cutbackMerchants = d.tagStats['Cut Back Merchant'] ?? { count: 0, winRate: 0 };
            if (cutbackMerchants.count >= 5 && cutbackMerchants.winRate < 40) return { id: 'cutback_weakness', title: 'Vulnerable to Cutbacks', description: `Your ${cutbackMerchants.winRate.toFixed(0)}% win rate against 'Cut Back Merchants' is a key area to improve. Focus on covering the byline and manually selecting defenders to block the pass.`, category: 'weakness', priority: 'high' };
            return null;
        },
        
        // --- PLAYER ANALYSIS ---
        (d) => {
            const mvp = Object.entries(d.playerStats).filter(([,s])=> s.games >= 5).sort(([, a], [, b]) => b.GAs - a.GAs)[0];
            if (mvp) return { id: 'mvp', title: 'Club MVP', description: `${mvp[0]} is your most valuable player, contributing ${mvp[1].GAs} goals and assists in ${mvp[1].games} appearances.`, category: 'strength', priority: 'low'};
            return null;
        },
        (d) => {
            const unsungHero = Object.entries(d.playerStats).filter(([,s])=> s.games >= 5).sort(([, a], [, b]) => b.avgRating - a.avgRating)[0];
            if (unsungHero && unsungHero[1].GAs < (unsungHero[1].games / 3)) return { id: 'unsung_hero', title: 'Unsung Hero', description: `${unsungHero[0]} is your unsung hero. Despite low goal contributions, their average rating of ${unsungHero[1].avgRating.toFixed(2)} is among the highest in your club, indicating vital defensive work or build-up play.`, category: 'strength', priority: 'low'};
            return null;
        },
         (d) => {
            const liability = Object.entries(d.playerStats).filter(([,s])=> s.games >= 8).sort(([, a], [, b]) => a.avgRating - b.avgRating)[0];
            if (liability && liability[1].avgRating < 6.5) return { id: 'liability', title: 'Potential Liability', description: `${liability[0]} is consistently underperforming with an average rating of ${liability[1].avgRating.toFixed(2)} over ${liability[1].games} games. Consider upgrading this position.`, category: 'opportunity', priority: 'medium'};
            return null;
        },
    ];

    const generatedInsights: Insight[] = rules.flatMap(rule => {
        const result = rule(aggregatedData);
        return Array.isArray(result) ? result : [result];
    }).filter((insight): insight is Insight => insight !== null);

    const uniqueInsights = [...new Map(generatedInsights.map(item => [item.id, item])).values()];
    const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
    return uniqueInsights.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
}


// ===================================================================================
// 3. MAIN EXPORTED FUNCTION (HYBRID STRATEGY)
// ===================================================================================

export async function generateEnhancedAIInsights(weeks: WeeklyPerformance[]): Promise<Insight[]> {
    const allGames = weeks.flatMap(week => week.games);
    
    // Always run the powerful local engine first.
    const localInsights = generateLocalInsights(allGames);
    
    // Prepare a summary for the Gemini API, asking for what the local engine CAN'T do.
    const summary = `
      Analyze the following FIFA/FC Champions performance data summary.
      A local analysis has already identified these strengths: ${localInsights.filter(i=>i.category==='strength').map(i=>i.title).join(', ') || 'None'}.
      The key weaknesses found were: ${localInsights.filter(i=>i.category==='weakness').map(i=>i.title).join(', ') || 'None'}.
      
      Data contains ${allGames.length} games. Key stats: Win Rate: ${(allGames.filter(g => g.result === 'win').length / allGames.length * 100).toFixed(1)}%. Avg Goals: ${(allGames.reduce((s, g) => s + (g.teamStats?.actualGoals ?? 0), 0) / allGames.length).toFixed(2)}.

      Most Frequent Match Tags:
      ${Object.entries(allGames.flatMap(game => game.tags || []).reduce((acc: any, tag: string) => { acc[tag] = (acc[tag] || 0) + 1; return acc; }, {})).sort(([, a]: any, [, b]: any) => b - a).slice(0, 5).map(([tag, count]) => `- ${tag}: ${count} times`).join('\n')}

      Your task is to provide 2-3 CREATIVE and HOLISTIC "opportunity" insights that the local data analysis might miss. Focus on tactical suggestions (e.g., "Given your low win rate against 'Meta Rats' and high pass accuracy, consider a slower, more deliberate build-up playstyle to counter their high press"), mentality shifts, or pattern recognition that requires human-like intuition. Do not repeat the existing strengths or weaknesses.
      Return a JSON array of insight objects with properties: 'id', 'title', 'description', 'category' ('opportunity' only), and 'priority' ('high', 'medium', or 'low').
    `;

    try {
        const remoteInsights = await generateRemoteInsights(summary);
        // Combine the local insights with the creative remote ones.
        const combined = [...localInsights, ...remoteInsights];
        return [...new Map(combined.map(item => [item.id, item])).values()];
    } catch (error) {
        // If Gemini fails, the user still gets a massive list of high-quality local insights.
        return localInsights;
    }
}

// ===================================================================================
// 4. POST-MATCH FEEDBACK GENERATOR
// ===================================================================================

/**
 * Provides immediate, context-specific feedback after a single game.
 * This is an enhanced version of your original generateMatchFeedback function.
 */
export function generatePostMatchFeedback(game: GameResult, weekData: WeeklyPerformance): string[] {
  const insights = new Set<string>();
  
  const [scored, conceded] = [game.teamStats?.actualGoals ?? 0, game.teamStats?.actualGoalsAgainst ?? 0];

  // Result-based
  if (game.result === 'win') {
    insights.add(`Great win! That's ${weekData.totalWins} wins for the week.`);
    if ((weekData.currentStreak ?? 0) >= 3) {
      insights.add(`You're on a ${weekData.currentStreak} game win streak! Keep the momentum going!`);
    }
    if (conceded === 0) {
      insights.add(`An excellent defensive performance to keep a clean sheet!`);
    }
  } else if (game.result === 'loss') {
    insights.add(`Tough loss. Shake it off. ${20 - weekData.games.length} games remaining.`);
    if ((weekData.currentStreak ?? 0) <= -3) {
      insights.add(`That's a ${Math.abs(weekData.currentStreak)} game losing streak. Consider taking a short break to reset your mentality.`);
    }
  }

  // Scoreline-based
  if (scored >= 4) insights.add(`Your attack was on fire, scoring ${scored} goals!`);
  if (scored === 0 && game.result !== 'win') insights.add(`Being shut out is tough. Let's focus on creating better chances next game.`);
  if (conceded >= 4) insights.add(`Conceding ${conceded} goals is a red flag. Let's tighten up the defense.`);
  
  // xG Analysis
  if (game.teamStats?.expectedGoals !== undefined && game.teamStats?.expectedGoalsAgainst !== undefined) {
    const xgDiff = scored - game.teamStats.expectedGoals;
    if (xgDiff >= 1.5) {
      insights.add(`Clinical finishing! You outperformed your xG by ${xgDiff.toFixed(1)}.`);
    } else if (xgDiff <= -1.5) {
      insights.add(`Unlucky in front of goal. You underperformed your xG by ${Math.abs(xgDiff).toFixed(1)}.`);
    }
  }

  // Player Performance
  if (game.playerStats && game.playerStats.length > 0) {
    const bestPlayer = [...game.playerStats].sort((a, b) => b.rating - a.rating)[0];
    if (bestPlayer.rating >= 9.0) {
      insights.add(`${bestPlayer.name} was unplayable with a ${bestPlayer.rating.toFixed(1)} rating!`);
    }
    const hatTrick = game.playerStats.find(p => p.goals >= 3);
    if (hatTrick) {
      insights.add(`A hat-trick for ${hatTrick.name}! An incredible performance.`);
    }
  }

  // Return up to 3 random insights
  return Array.from(insights).sort(() => 0.5 - Math.random()).slice(0, 3);
}

