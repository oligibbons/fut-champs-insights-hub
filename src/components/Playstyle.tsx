import { useMemo } from 'react';
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Shield, Zap, BrainCircuit, Rabbit, Anchor, Gem, Target, Flame, Bot, BarChart, Sun, Moon, Swords } from 'lucide-react';
import { cn } from "@/lib/utils";

const playstyleConfig = {
  TheFortress: {
    name: 'The Fortress',
    description: "Your defense is a masterclass in organization and resilience. Conceding is simply not an option.",
    icon: Shield,
    containerStyles: "text-slate-100 bg-slate-800",
    inlineStyles: { backgroundImage: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), repeating-linear-gradient(45deg, #334155, #334155 15px, #475569 15px, #475569 30px)' },
    iconStyles: "text-slate-300",
    titleStyles: "text-white",
  },
  ParkTheBusSpecialist: {
    name: 'Park the Bus Specialist',
    description: "You are a master of defensive organization, setting up a wall that is nearly impossible to break down.",
    icon: Anchor,
    containerStyles: "text-yellow-900 bg-yellow-400",
    inlineStyles: { backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 25px, rgba(45, 55, 72, 0.8) 25px, rgba(45, 55, 72, 0.8) 50px)' },
    iconStyles: "text-slate-800",
    titleStyles: "text-slate-900 font-black",
  },
  PossessionMaster: {
    name: 'Possession Master',
    description: "You control the game's tempo with patient, intricate build-up play, starving your opponent of the ball.",
    icon: BrainCircuit,
    containerStyles: "text-indigo-100 bg-indigo-900",
    inlineStyles: { backgroundImage: 'radial-gradient(circle, rgba(165, 180, 252, 0.1) 1px, transparent 1px)', backgroundSize: '1rem 1rem' },
    iconStyles: "animate-pulse text-indigo-300",
    titleStyles: "text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-300",
  },
  TikiTakaMaestro: {
    name: 'Tiki-Taka Maestro',
    description: "You weave intricate passing webs around your opponents, playing a beautiful and effective style of football.",
    icon: Gem,
    containerStyles: "text-cyan-100 bg-cyan-900",
    inlineStyles: { backgroundImage: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 40L40 0H20L0 20M40 40V20L20 40\' fill=\'%230891b2\' fill-opacity=\'0.4\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' },
    iconStyles: "text-cyan-300",
    titleStyles: "text-white",
  },
  CounterAttackKing: {
    name: 'Counter-Attack King',
    description: "You strike with lightning speed, turning defense into a devastating attack in the blink of an eye.",
    icon: Zap,
    containerStyles: "text-amber-100 bg-gray-900",
    inlineStyles: {},
    iconStyles: "text-amber-400 group-hover:animate-ping",
    titleStyles: "text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500",
  },
  ClinicalFinisher: {
    name: 'Clinical Finisher',
    description: "You are lethal in front of goal, converting your chances with deadly and reliable precision.",
    icon: Target,
    containerStyles: "text-red-100 bg-red-900",
    inlineStyles: { backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 10%, transparent 11%), radial-gradient(circle, rgba(255, 255, 255, 0.1) 30%, transparent 31%)' },
    iconStyles: "text-red-300",
    titleStyles: "text-white tracking-widest",
  },
  TheEntertainer: {
    name: 'The Entertainer',
    description: "You guarantee goals and excitement in every match, playing an open and relentlessly attacking brand of football.",
    icon: Flame,
    containerStyles: "text-orange-100 bg-gradient-to-br from-orange-600 via-red-700 to-purple-800",
    inlineStyles: {},
    iconStyles: "animate-bounce text-orange-200",
    titleStyles: "text-white font-black",
  },
  PaceAbuser: {
    name: 'Pace Abuser',
    description: "You terrorize defenses from the flanks and through the middle, using raw speed to create chaos.",
    icon: Rabbit,
    containerStyles: "text-white bg-gradient-to-r from-lime-400 to-cyan-400",
    inlineStyles: {},
    iconStyles: "text-slate-800",
    titleStyles: "text-slate-900 italic font-black",
  },
  AllOutAttack: {
    name: 'All Out Attack',
    description: "Defence is an afterthought. Your philosophy is simple: score one more goal than the opponent, no matter what.",
    icon: Swords,
    containerStyles: "text-rose-100 bg-rose-900 border-2 border-rose-500",
    inlineStyles: {},
    iconStyles: "text-rose-300",
    titleStyles: "text-white",
  },
  BalancedTactician: {
    name: 'Balanced Tactician',
    description: "You are a well-rounded player, adaptable to any situation and capable of winning in a variety of ways.",
    icon: BarChart,
    containerStyles: "text-slate-200 bg-slate-800",
    inlineStyles: {},
    iconStyles: "text-slate-400",
    titleStyles: "text-white",
  },
  TheGrinder: {
    name: 'The Grinder',
    description: "You specialize in winning tight games, showcasing mental fortitude and tactical discipline to get the result.",
    icon: Bot,
    containerStyles: "text-emerald-100 bg-emerald-900",
    inlineStyles: { backgroundImage: 'linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'4\' height=\'4\' viewBox=\'0 0 4 4\'%3E%3Cpath fill=\'%23059669\' fill-opacity=\'0.4\' d=\'M1 3h1v1H1V3zm2-2h1v1H3V1z\'%3E%3C/path%3E%3C/svg%3E")' },
    iconStyles: "text-emerald-400",
    titleStyles: "text-white",
  },
  DayPlayer: {
    name: 'Day Player',
    description: "You primarily play during the day, facing the daytime player base.",
    icon: Sun,
    containerStyles: "text-slate-800 bg-gradient-to-b from-sky-400 to-amber-300",
    inlineStyles: {},
    iconStyles: "text-yellow-300",
    titleStyles: "text-white font-bold",
  },
  NightOwl: {
    name: 'Night Owl',
    description: "You are a creature of the night, battling it out when the sun goes down.",
    icon: Moon,
    containerStyles: "text-indigo-200 bg-gradient-to-b from-indigo-900 to-black",
    inlineStyles: { backgroundImage: 'radial-gradient(circle, white 1%, transparent 1%)', backgroundSize: '2rem 2rem' },
    iconStyles: "text-indigo-300",
    titleStyles: "text-white",
  },
};

type PlaystyleName = keyof typeof playstyleConfig;

export function Playstyle() {
  const { weeklyData } = useSupabaseData();
  const allGames = useMemo(() => weeklyData.flatMap(w => w.games), [weeklyData]);
  const recentGames = allGames.slice(-150);

  const averageGameHour = useMemo(() => {
    if (recentGames.length === 0) return null;
    const totalHours = recentGames.reduce((acc, game) => {
      if (!game.time) return acc;
      const [hours] = game.time.split(':').map(Number);
      return acc + hours;
    }, 0);
    return totalHours / recentGames.length;
  }, [recentGames]);
  
  const recentWeeklyData = useMemo(() => [{ ...weeklyData[0], games: recentGames }], [weeklyData, recentGames]);
  const stats = useDashboardStats(recentWeeklyData);

  const playstyleName: PlaystyleName = useMemo(() => {
    const { averagePossession, averageGoalsPerGame, totalCleanSheets, averagePassAccuracy, averageShotAccuracy, averagePassesPerGame, totalConceded } = stats;
    const gamesCount = recentGames.length;
    if (gamesCount < 10) return 'BalancedTactician';

    const cleanSheetRatio = gamesCount > 0 ? totalCleanSheets / gamesCount : 0;
    const avgGoalsConceded = gamesCount > 0 ? (totalConceded || 0) / gamesCount : 0;

    const playstyles: { name: PlaystyleName; condition: () => boolean }[] = [
      { name: 'TikiTakaMaestro', condition: () => averagePossession > 60 && averagePassAccuracy > 88 && averagePassesPerGame > 150 },
      { name: 'TheFortress', condition: () => cleanSheetRatio > 0.4 && averageGoalsPerGame < 2.0 },
      { name: 'ParkTheBusSpecialist', condition: () => averagePossession < 45 && cleanSheetRatio > 0.3 },
      { name: 'ClinicalFinisher', condition: () => averageShotAccuracy > 65 && averageGoalsPerGame > 2.0 },
      { name: 'CounterAttackKing', condition: () => averagePossession < 48 && averageGoalsPerGame > 2.5 && averageShotAccuracy > 55 },
      { name: 'PaceAbuser', condition: () => averagePossession < 52 && averageGoalsPerGame > 2.8 },
      { name: 'AllOutAttack', condition: () => averageGoalsPerGame > 3.0 && avgGoalsConceded > 2.0 },
      { name: 'TheEntertainer', condition: () => averageGoalsPerGame > 3.0 && stats.overallGoalDifference > 1 },
      { name: 'PossessionMaster', condition: () => averagePossession > 58 && averagePassAccuracy > 85 },
      { name: 'TheGrinder', condition: () => stats.overallGoalDifference > 0 && averageGoalsPerGame < 2.2 && averagePossession < 55 },
      { name: 'NightOwl', condition: () => averageGameHour !== null && (averageGameHour >= 21 || averageGameHour <= 5) },
      { name: 'DayPlayer', condition: () => averageGameHour !== null && averageGameHour > 5 && averageGameHour < 21 },
    ];
    
    const matchedStyle = playstyles.find(p => p.condition());
    return matchedStyle ? matchedStyle.name : 'BalancedTactician';

  }, [stats, recentGames, averageGameHour]);

  const { name, description, icon: Icon, containerStyles, inlineStyles, iconStyles, titleStyles } = playstyleConfig[playstyleName];

  return (
    <div 
      className={cn(
        "group rounded-2xl shadow-lg p-6 w-full flex flex-col items-center justify-center text-center space-y-2 overflow-hidden relative transition-all duration-300 ease-in-out transform hover:scale-105",
        containerStyles
      )}
      style={inlineStyles}
    >
      <div className="z-10 flex flex-col items-center justify-center">
        <Icon className={cn("h-10 w-10 mb-2 transition-transform duration-300 group-hover:scale-125", iconStyles)} />
        <h3 className={cn("text-3xl font-bold tracking-tight", titleStyles)}>{name}</h3>
        <p className="text-sm max-w-md opacity-90">{description}</p>
      </div>
    </div>
  );
}
