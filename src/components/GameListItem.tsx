import { Game } from '@/types/futChampions';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface GameListItemProps {
  game: Game;
  onEdit: (game: Game) => void;
  onDelete: (gameId: string) => void;
}

const GameListItem = ({ game, onEdit, onDelete }: GameListItemProps) => {
  const isWin = game.result === 'win';
  return (
    <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
      <div className="flex items-center gap-4">
        <div className={`w-2 h-10 rounded-full ${isWin ? 'bg-green-500' : 'bg-red-500'}`} />
        <div>
          <p className="font-semibold">Game #{game.game_number}</p>
          <p className="text-sm text-muted-foreground">{isWin ? 'Win' : 'Loss'}</p>
        </div>
      </div>
      <p className="text-2xl font-bold">{game.score_line}</p>
      <div className="flex gap-2">
        <Button variant="outline" size="icon" onClick={() => onEdit(game)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="destructive" size="icon" onClick={() => onDelete(game.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default GameListItem;
