import { Game } from '@/types/futChampions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Shield, Pencil, Trash2 } from 'lucide-react';

interface GameCardProps {
  game: Game;
  onEdit: (game: Game) => void;
  onDelete: (gameId: string) => void;
}

const GameCard = ({ game, onEdit, onDelete }: GameCardProps) => {
  const isWin = game.result === 'win';

  return (
    <Card className={`flex flex-col justify-between border-l-4 ${isWin ? 'border-green-500' : 'border-red-500'}`}>
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
      <CardFooter className="flex gap-2">
         <Button variant="outline" size="sm" className="w-full" onClick={() => onEdit(game)}>
            <Pencil className="h-4 w-4 mr-2" /> Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(game.id)}>
            <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GameCard;
