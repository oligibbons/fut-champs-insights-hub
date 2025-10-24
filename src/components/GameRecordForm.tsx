import { useEffect, useMemo, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Game,
  PlayerPerformance,
  PlayerPerformanceInsert,
} from '@/types/futChampions';
import { useSquadData } from '@/hooks/useSquadData';
import PlayerPerformanceInput from './PlayerPerformanceInput';
import { Card, CardContent } from '@/components/ui/card';
import { Pen, Players, Save, Trophy, X } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { Checkbox } from './ui/checkbox';
import PenaltyShootoutInput from './PenaltyShootoutInput';

type GameFormData = {
  game_number: number;
  score_own: number;
  score_opponent: number;
  opponent_username: string;
  result: 'win' | 'loss';
  overtime_result: 'none' | 'win_ot' | 'loss_ot' | 'win_pen' | 'loss_pen';
  playerPerformances: PlayerPerformance[];
};

const gameFormSchema = z.object({
  game_number: z.number().min(1).max(20),
  score_own: z.number().min(0),
  score_opponent: z.number().min(0),
  opponent_username: z.string().optional(),
  result: z.enum(['win', 'loss']),
  overtime_result: z
    .enum(['none', 'win_ot', 'loss_ot', 'win_pen', 'loss_pen'])
    .default('none'),
  playerPerformances: z.array(
    z.object({
      id: z.string().optional(),
      player_id: z.string(),
      rating: z.number().min(0).max(10).nullable(),
      goals: z.number().min(0),
      assists: z.number().min(0),
      red_card: z.boolean(),
      yellow_card: z.boolean(),
      man_of_the_match: z.boolean(),
    }),
  ),
});

interface GameRecordFormProps {
  onSubmit: (
    data: Omit<Game, 'id' | 'created_at' | 'run_id'>,
    playerPerformances: PlayerPerformanceInsert[],
  ) => void;
  isLoading: boolean;
  game?: Game;
  runId: string;
  onCancel?: () => void;
}

const GameRecordForm = ({
  onSubmit,
  isLoading,
  game,
  runId,
  onCancel,
}: GameRecordFormProps) => {
  const { activeSquadPlayers, loading: squadLoading } = useSquadData();
  const { currentTheme } = useTheme();
  const [showPenalties, setShowPenalties] = useState(
    game?.overtime_result === 'win_pen' || game?.overtime_result === 'loss_pen',
  );

  // --- THIS IS THE FIX ---
  // We make defaultValues depend on `activeSquadPlayers` as well as `game`.
  const defaultValues = useMemo(() => {
    const defaultPerformances =
      activeSquadPlayers.length > 0
        ? activeSquadPlayers.map((sp) => ({
            player_id: sp.player_id,
            rating: null,
            goals: 0,
            assists: 0,
            red_card: false,
            yellow_card: false,
            man_of_the_match: false,
          }))
        : [];

    return {
      game_number: game?.game_number ?? 0,
      score_own: game?.score_own ?? 0,
      score_opponent: game?.score_opponent ?? 0,
      opponent_username: game?.opponent_username ?? '',
      result: game?.result ?? 'win',
      overtime_result: game?.overtime_result ?? 'none',
      playerPerformances: game?.player_performances ?? defaultPerformances,
    };
  }, [game, activeSquadPlayers]);
  // --- END OF FIX ---

  const form = useForm<GameFormData>({
    resolver: zodResolver(gameFormSchema),
    defaultValues: defaultValues,
  });

  const {
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
  } = form;
  const { fields } = useFieldArray({
    control,
    name: 'playerPerformances',
  });

  // This effect now correctly resets the form when the defaults change
  // (i.e., when players load OR when the game prop changes)
  useEffect(() => {
    reset(defaultValues);
    setShowPenalties(
      defaultValues.overtime_result === 'win_pen' ||
        defaultValues.overtime_result === 'loss_pen',
    );
  }, [game, reset, defaultValues]);

  const scoreOwn = watch('score_own');
  const scoreOpponent = watch('score_opponent');
  const overtimeResult = watch('overtime_result');

  useEffect(() => {
    if (scoreOwn > scoreOpponent) {
      setValue('result', 'win');
      if (overtimeResult === 'loss_ot' || overtimeResult === 'loss_pen') {
        setValue('overtime_result', 'none');
      }
    } else if (scoreOwn < scoreOpponent) {
      setValue('result', 'loss');
      if (overtimeResult === 'win_ot' || overtimeResult === 'win_pen') {
        setValue('overtime_result', 'none');
      }
    } else {
      // Draw, force OT decision
      if (overtimeResult === 'none') {
        setValue('overtime_result', 'win_ot');
        setValue('result', 'win');
      }
    }
  }, [scoreOwn, scoreOpponent, setValue, overtimeResult]);

  useEffect(() => {
    if (
      overtimeResult === 'win_ot' ||
      overtimeResult === 'win_pen'
    ) {
      setValue('result', 'win');
      setShowPenalties(overtimeResult === 'win_pen');
    } else if (
      overtimeResult === 'loss_ot' ||
      overtimeResult === 'loss_pen'
    ) {
      setValue('result', 'loss');
      setShowPenalties(overtimeResult === 'loss_pen');
    } else {
      setShowPenalties(false);
    }
  }, [overtimeResult, setValue]);

  const handleFormSubmit = (data: GameFormData) => {
    const gameData: Omit<Game, 'id' | 'created_at' | 'run_id'> = {
      game_number: data.game_number,
      score_own: data.score_own,
      score_opponent: data.score_opponent,
      opponent_username: data.opponent_username,
      result: data.result,
      overtime_result: data.overtime_result,
      run_id: runId,
    };

    const performancesData: PlayerPerformanceInsert[] =
      data.playerPerformances.map((p) => ({
        ...p,
        rating: p.rating ? Number(p.rating) : null,
        game_id: game?.id ?? '', // This will be set on the server if it's a new game
        run_id: runId,
      }));

    onSubmit(gameData, performancesData);
  };

  const getPlayerName = (playerId: string) => {
    const player = activeSquadPlayers.find((p) => p.player_id === playerId);
    return player?.players?.name ?? 'Unknown Player';
  };

  return (
    <Card
      className="border-0 shadow-lg"
      style={{
        backgroundColor: currentTheme.colors.cardBg,
        borderColor: currentTheme.colors.border,
      }}
    >
      <CardContent className="p-4 md:p-6">
        <Form {...form}>
          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className="space-y-6"
          >
            <Tabs defaultValue="game" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="game">
                  <Trophy className="mr-2 h-4 w-4" /> Game
                </TabsTrigger>
                <TabsTrigger value="players">
                  <Players className="mr-2 h-4 w-4" /> Players
                </TabsTrigger>
              </TabsList>

              <TabsContent value="game" className="space-y-4 pt-4">
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={control}
                    name="score_own"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>My Score</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                            className="border-0"
                            style={{
                              backgroundColor: currentTheme.colors.surface,
                              color: currentTheme.colors.text,
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="score_opponent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opponent Score</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                            className="border-0"
                            style={{
                              backgroundColor: currentTheme.colors.surface,
                              color: currentTheme.colors.text,
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="game_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Game</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                            className="border-0"
                            style={{
                              backgroundColor: currentTheme.colors.surface,
                              color: currentTheme.colors.text,
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {scoreOwn === scoreOpponent && (
                  <FormField
                    control={control}
                    name="overtime_result"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Match Result (OT/Pens)</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger
                              className="border-0"
                              style={{
                                backgroundColor: currentTheme.colors.surface,
                                color: currentTheme.colors.text,
                              }}
                            >
                              <SelectValue placeholder="Select OT/Pen result" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="win_ot">Win in OT</SelectItem>
                            <SelectItem value="loss_ot">Loss in OT</SelectItem>
                            <SelectItem value="win_pen">Win on Pens</SelectItem>
                            <SelectItem value="loss_pen">
                              Loss on Pens
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {showPenalties && (
                  <PenaltyShootoutInput
                    control={control}
                    setValue={setValue}
                    game={game}
                  />
                )}

                <FormField
                  control={control}
                  name="opponent_username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Opponent</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Opponent's username (optional)"
                          {...field}
                          className="border-0"
                          style={{
                            backgroundColor: currentTheme.colors.surface,
                            color: currentTheme.colors.text,
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="players" className="space-y-4 pt-4">
                {squadLoading ? (
                  <p>Loading squad...</p>
                ) : fields.length > 0 ? (
                  fields.map((field, index) => (
                    <PlayerPerformanceInput
                      key={field.id}
                      control={control}
                      index={index}
                      playerName={getPlayerName(field.player_id)}
                      currentTheme={currentTheme}
                    />
                  ))
                ) : (
                  <p>
                    No players found in your active squad. Please add players to
                    your squad first.
                  </p>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  <X className="mr-2 h-4 w-4" /> Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={isLoading}
                style={{
                  backgroundColor: currentTheme.colors.primary,
                  color: currentTheme.colors.primaryText,
                }}
              >
                {isLoading ? (
                  'Saving...'
                ) : (
                  <>
                    {game ? (
                      <Pen className="mr-2 h-4 w-4" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    {game ? 'Update Game' : 'Save Game'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default GameRecordForm;
