import { useMemo } from 'react';
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Shield, Swords, BrainCircuit, Zap, Rabbit, Anchor, Gem, Target, Flame, Bot, BarChart, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

const playstyleConfig = {
  // Defensive Styles
  TheFortress: {
    name: 'The Fortress',
    description: "Your defense is a masterclass in organization and resilience. Conceding is simply not an option.",
    icon: Shield,
    styles: "from-gray-700 via-gray-900 to-black text-gray-200",
  },
  ParkTheBusSpecialist: {
    name: 'Park the Bus Specialist',
    description: "You are a master of defensive organization, setting up a wall that is nearly impossible to break down.",
    icon: Anchor,
    styles: "from-blue-900 via-gray-800 to-black text-blue-100",
  },

  // Possession Styles
  PossessionMaster: {
    name: 'Possession Master',
    description: "You control the game's tempo with patient, intricate build-up play, starving your opponent of the ball.",
    icon: BrainCircuit,
    styles: "from-sky-800 via-indigo-900 to-indigo-900 text-sky-100",
  },
  TikiTakaMaestro: {
    name: 'Tiki-Taka Maestro',
    description: "You weave intricate passing webs around your opponents, playing a beautiful and effective style of football.",
    icon: Gem,
    styles: "from-teal-700 via-cyan-800 to-sky-900 text-cyan-100",
  },

  // Attacking Styles
  CounterAttackKing: {
    name: 'Counter-Attack King',
    description: "You strike with lightning speed, turning defense into a devastating attack in the blink of an eye.",
    icon: Zap,
    styles: "from-yellow-600 via-orange-800 to-red-900 text-yellow-100",
  },
  ClinicalFinisher: {
    name: 'Clinical Finisher',
    description: "You are lethal in front of goal, converting your chances with deadly and reliable precision.",
    icon: Target,
    styles: "from-red-700 via-red-900 to-black text-red-100",
  },
  TheEntertainer: {
    name: 'The Entertainer',
    description: "You guarantee goals and excitement in every match, playing an open and relentlessly attacking brand of football.",
    icon: Flame,
    styles: "from-orange-500 via-red-600 to-purple-800 text-orange-100",
  },
  PaceAbuser: {
    name: 'Pace Abuser',
    description: "You terrorize defenses from the flanks and through the middle, using raw speed to create chaos.",
    icon: Rabbit,
    styles: "from-purple-500 via-pink-600 to-fuchsia-800 text-purple-100",
  },
  
  // Balanced/Other Styles
  BalancedTactician: {
    name: 'Balanced Tactician',
    description: "You are a well-rounded player, adaptable to any situation and capable of winning in a variety of ways.",
    icon: BarChart,
    styles: "from-slate-600 via-slate-800 to-slate-900 text-slate-200",
  },
  TheGrinder: {
    name: 'The Grinder',
    description: "You specialize in winning tight games, showcasing mental fortitude and tactical discipline to get the result.",
    icon: Bot,
    styles: "from-green-800 via-gray-800 to-black text-green-200",
  },
  DayPlayer: {
    name: 'Day Player',
    description: "You primarily play during the day, facing the daytime player base.",
    icon: Sun,
    styles: "from-blue-400 via-yellow-300 to-orange-400 text-slate-800",
  },
  NightOwl: {
    name: 'Night Owl',
    description: "You are a creature of the night, battling it out when the sun goes down.",
    icon: Moon,
    styles: "from-indigo-900 via-purple-900 to-black text-indigo-200",
  },
};

type PlaystyleName = keyof typeof playstyleConfig;

export function Playstyle() {
  const { weeklyData } = useSupabaseData();
  const allGames = useMemo(() => weeklyData.flatMap(w => w.games), [weeklyData]);
  const recentGames = allGames.slice(-150);

  // A helper to get the average time of day games are played
  const averageGameHour = useMemo(() => {
    if (recentGames.length === 0) return null;
    const totalHours = recentGames.reduce((acc, game) => {
      if (!game.time) return acc;
      const [hours] = game.time.split(':').map(Number);
      return acc + hours;
    }, 0);
    return totalHours / recentGames.length;
  }, [recentGames]);
  
  // A bit of a hack to reuse the hook with recent games
  const recentWeeklyData = useMemo(() => [{ ...weeklyData[0], games: recentGames }], [weeklyData, recentGames]);
  const stats = useDashboardStats(recentWeeklyData);

  const playstyleName: PlaystyleName = useMemo(() => {
    const { averagePossession, averageGoalsPerGame, totalCleanSheets, averagePassAccuracy, averageShotAccuracy, averagePassesPerGame } = stats;
    const gamesCount = recentGames.length;
    if (gamesCount < 10) return 'BalancedTactician'; // Not enough data for a real style

    const cleanSheetRatio = totalCleanSheets / gamesCount;

    // Define playstyles from most specific to most general
    const playstyles: { name: PlaystyleName; condition: () => boolean }[] = [
      { name: 'TikiTakaMaestro', condition: () => averagePossession > 60 && averagePassAccuracy > 88 && averagePassesPerGame > 150 },
      { name: 'TheFortress', condition: () => cleanSheetRatio > 0.4 && averageGoalsPerGame < 2.0 },
      { name: 'ParkTheBusSpecialist', condition: () => averagePossession < 45 && cleanSheetRatio > 0.3 },
      { name: 'ClinicalFinisher', condition: () => averageShotAccuracy > 65 && averageGoalsPerGame > 2.0 },
      { name: 'CounterAttackKing', condition: () => averagePossession < 48 && averageGoalsPerGame > 2.5 && averageShotAccuracy > 55 },
      { name: 'PaceAbuser', condition: () => averagePossession < 52 && averageGoalsPerGame > 2.8 },
      { name: 'TheEntertainer', condition: () => averageGoalsPerGame > 3.0 && stats.overallGoalDifference > 1 },
      { name: 'PossessionMaster', condition: () => averagePossession > 58 && averagePassAccuracy > 85 },
      { name: 'TheGrinder', condition: () => stats.overallGoalDifference > 0 && averageGoalsPerGame < 2.2 && averagePossession < 55 },
      { name: 'NightOwl', condition: () => averageGameHour !== null && (averageGameHour >= 21 || averageGameHour <= 5) },
      { name: 'DayPlayer', condition: () => averageGameHour !== null && averageGameHour > 5 && averageGameHour < 21 },
    ];
    
    const matchedStyle = playstyles.find(p => p.condition());
    return matchedStyle ? matchedStyle.name : 'BalancedTactician';

  }, [stats, recentGames, averageGameHour]);

  const { name, description, icon: Icon, styles } = playstyleConfig[playstyleName];

  return (
    <div className={cn("bg-gradient-to-br rounded-2xl shadow-lg p-6 w-full flex flex-col items-center justify-center text-center space-y-2", styles)}>
      <Icon className="h-10 w-10 mb-2" />
      <h3 className="text-3xl font-bold tracking-tight">{name}</h3>
      <p className="text-sm max-w-md opacity-90">{description}</p>
    </div>
  );
}
