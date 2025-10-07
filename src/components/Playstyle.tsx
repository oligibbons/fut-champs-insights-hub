import { useMemo } from 'react';
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useDashboardStats } from "@/hooks/useDashboardStats";

export function Playstyle() {
  const { weeklyData } = useSupabaseData();
  const allGames = useMemo(() => weeklyData.flatMap(w => w.games), [weeklyData]);
  const recentGames = allGames.slice(-150);
  const recentWeeklyData = [{ ...weeklyData[0], games: recentGames }]; // A bit of a hack to reuse the hook
  const stats = useDashboardStats(recentWeeklyData);

  const playstyle = useMemo(() => {
    const { averagePossession, averageGoalsPerGame, totalCleanSheets, averagePassAccuracy, averageShotAccuracy, averagePassesPerGame } = stats;

    const playstyles = [
        { name: "Counter Attack King", condition: () => averagePossession < 48 && averageGoalsPerGame > 2.5 && averageShotAccuracy > 55, description: "You strike fast and hard, turning defense into attack in the blink of an eye." },
        { name: "Possession Monster", condition: () => averagePossession > 58 && averagePassAccuracy > 85, description: "You control the game with patient build-up play, starving your opponent of the ball." },
        { name: "Defensive Dynamo", condition: () => totalCleanSheets / recentGames.length > 0.3 && averageGoalsPerGame < 2, description: "Your defense is a fortress, frustrating opponents and grinding out results." },
        { name: "Clinical Finisher", condition: () => averageShotAccuracy > 60 && averageGoalsPerGame > 2.0, description: "You are lethal in front of goal, converting chances with deadly precision." },
        { name: "Midfield Maestro", condition: () => averagePassAccuracy > 88 && averagePossession > 55, description: "You dictate the tempo of the game from the middle of the park, pulling the strings with your passing range." },
        { name: "High Press Hero", condition: () => averagePossession < 50 && stats.disciplineIndex.match(/[C-F]/), description: "You suffocate your opponents with relentless pressure, forcing mistakes high up the pitch." },
        { name: "Park the Bus Specialist", condition: () => averagePossession < 45 && totalCleanSheets / recentGames.length > 0.4, description: "You are a master of defensive organization, setting up a wall that is nearly impossible to break down." },
        { name: "Tiki-Taka Master", condition: () => averagePossession > 62 && averagePassAccuracy > 90 && averagePassesPerGame > 150, description: "You weave intricate passing webs around your opponents, playing a beautiful and effective style of football." },
        { name: "Gegenpress Guru", condition: () => averagePossession > 55 && stats.disciplineIndex.match(/[C-F]/) && averageGoalsPerGame > 2.2, description: "You win the ball back instantly after losing it, turning turnovers into immediate goalscoring opportunities." },
        { name: "Wing Play Wizard", condition: () => averageGoalsPerGame > 2.0 && averagePassesPerGame < 130, description: "You terrorize defenses from the flanks, using pace and crossing to create chances." },
        { name: "Long Ball Merchant", condition: () => averagePassAccuracy < 75 && averageGoalsPerGame > 1.8, description: "You favor a direct approach, launching long balls to powerful forwards to disrupt defenses." },
        { name: "Set Piece Specialist", condition: () => averageGoalsPerGame > 1.5, description: "You are a threat from every dead-ball situation, with a knack for scoring from free-kicks and corners." },
        { name: "The Entertainer", condition: () => averageGoalsPerGame > 3.0 && stats.overallGoalDifference > 1, description: "You guarantee goals and excitement in every match, playing an open and attacking brand of football." },
        { name: "The Grinder", condition: () => stats.overallGoalDifference >= 0 && averageGoalsPerGame < 2.0, description: "You specialize in winning tight games, showcasing mental fortitude and tactical discipline." },
        { name: "Balanced Tactician", condition: () => true, description: "You are a well-rounded player, adaptable and capable of winning in a variety of ways." },
    ];

    return playstyles.find(p => p.condition()) || playstyles[playstyles.length - 1];
  }, [stats]);

  return (
    <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg p-6 w-full">
      <h3 className="text-2xl font-bold text-foreground">{playstyle.name}</h3>
      <p className="text-muted-foreground mt-2">{playstyle.description}</p>
    </div>
  );
}
