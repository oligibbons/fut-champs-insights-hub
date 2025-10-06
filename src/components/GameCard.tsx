import { Game } from '@/types/futChampions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trophy, Shield } from 'lucide-react';

interface GameCardProps {
  game: Game;
}

const GameCard = ({ game }: GameCardProps) => {
  const isWin = game.result === 'win';

  return (
    <Card className={`border-l-4 ${isWin ? 'border-green-500' : 'border-red-500'}`}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Game #{game.game_number}</CardTitle>
          {isWin ? (
            <Trophy className="h-6 w-6 text-yellow-500" />
          ) : (
            <Shield className="h-6 w-6 text-gray-500" />
          )}
        </div>
        <CardDescription>{isWin ? 'Victory' : 'Defeat'}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center items-center">
          <p className="text-4xl font-bold">{game.score_line}</p>
        </div>
        <div className="text-center mt-2">
            <p className="text-sm text-muted-foreground">Opponent Skill: {game.opponent_skill}/10</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameCard;
