// src/components/CreateLeagueForm.tsx
import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useCreateLeague } from '@/hooks/useChallengeMode';
import { useSelectableUserRuns } from '@/hooks/useSupabaseData';
import { useFriendsList } from '@/hooks/useFriends';
import { CHALLENGE_POOL, Challenge } from '@/lib/challenges';
import { Check, ChevronsUpDown, Loader2, Shuffle, Users, Trophy, CalendarIcon, ArrowRight, ArrowLeft } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '@/lib/utils';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';
import { ScrollArea } from './ui/scroll-area';
import { Checkbox } from './ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { toast } from 'sonner';

// Validation Schema
const createLeagueSchema = z.object({
  name: z.string().min(3, 'League name must be at least 3 characters.').max(50, 'Must be 50 characters or less.'),
  admin_run_id: z.string({ required_error: 'You must select a champs run.' }),
  champs_run_end_date: z.date({ required_error: 'You must set an end date.' }),
  challenges: z.array(z.string()).min(25, 'You must select at least 25 challenges.').max(30, 'You can select a maximum of 30 challenges.'),
  friend_ids_to_invite: z.array(z.string()).max(19, 'You can invite a maximum of 19 friends.'), // Max 19 + admin = 20
});

type CreateLeagueFormValues = z.infer<typeof createLeagueSchema>;

interface CreateLeagueFormProps {
  onSuccess: (newLeagueId: string) => void;
}

export const CreateLeagueForm = ({ onSuccess }: CreateLeagueFormProps) => {
  const [step, setStep] = useState(1);
  const createLeague = useCreateLeague();
  
  const { data: selectableRuns, isLoading: isLoadingRuns } = useSelectableUserRuns();
  const { data: friends, isLoading: isLoadingFriends } = useFriendsList();

  const form = useForm<CreateLeagueFormValues>({
    resolver: zodResolver(createLeagueSchema),
    defaultValues: {
      name: '',
      admin_run_id: undefined,
      champs_run_end_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // Default 4 days from now
      challenges: [],
      friend_ids_to_invite: [],
    },
  });

  const nextStep = async () => {
    const fieldsToValidate: ('name' | 'admin_run_id' | 'champs_run_end_date' | 'challenges')[] = [
      ['name', 'admin_run_id', 'champs_run_end_date'],
      ['challenges'],
    ][step - 1] as any;

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setStep(s => s + 1);
    }
  };

  const prevStep = () => setStep(s => s - 1);

  const handleRandomizeChallenges = () => {
    const shuffled = [...CHALLENGE_POOL].sort(() => 0.5 - Math.random());
    const randomSelection = shuffled.slice(0, 25).map(c => c.id);
    form.setValue('challenges', randomSelection);
    toast.success('Randomized 25 challenges!');
  };

  async function onSubmit(data: CreateLeagueFormValues) {
    // Map selected challenge IDs to the {id, points} structure
    const selectedChallenges = data.challenges.map(id => {
      const challenge = CHALLENGE_POOL.find(c => c.id === id);
      return { id: id, points: challenge?.points || 3 }; // Default to 3 points if not found
    });

    createLeague.mutate({
      name: data.name,
      champs_run_end_date: data.champs_run_end_date,
      admin_run_id: data.admin_run_id,
      challenges: selectedChallenges,
      friend_ids_to_invite: data.friend_ids_to_invite,
    }, {
      onSuccess: (newLeagueId) => {
        onSuccess(newLeagueId);
        form.reset();
        setStep(1);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: League Details */}
        <div className={cn("space-y-6", step !== 1 && "hidden")}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>League Name</FormLabel>
                <FormControl>
                  <Input placeholder="Weekend Warriors" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="admin_run_id"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Anchor to Champs Run</FormLabel>
                {isLoadingRuns ? <Skeleton className="h-10 w-full" /> : (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your current or upcoming run..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {selectableRuns?.map(run => (
                        <SelectItem key={run.id} value={run.id}>
                          {run.label} {run.is_completed ? "(Completed)" : `(${run.total_wins || 0}-${run.total_losses || 0})`}
                        </SelectItem>
                      ))}
                      {selectableRuns?.length === 0 && (
                        <div className="p-4 text-sm text-muted-foreground">No recent runs found. Please start a new run.</div>
                      )}
                    </SelectContent>
                  </Select>
                )}
                <FormDescription>Your league scores will be based on this run.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="champs_run_end_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>League End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date() || date > new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>Leagues auto-complete after 4 days by default.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Step 2: Select Challenges */}
        <div className={cn("space-y-4", step !== 2 && "hidden")}>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div>
              <FormLabel>Select Challenges (25-30)</FormLabel>
              <FormDescription>
                {form.getValues('challenges').length} selected
              </FormDescription>
            </div>
            <Button type="button" variant="outline" onClick={handleRandomizeChallenges}>
              <Shuffle className="mr-2 h-4 w-4" /> Randomize (25)
            </Button>
          </div>
          <FormMessage>{form.formState.errors.challenges?.message}</FormMessage>
          
          <ScrollArea className="h-72 w-full rounded-md border p-4">
            <FormField
              control={form.control}
              name="challenges"
              render={() => (
                <FormItem className="space-y-3">
                  {CHALLENGE_POOL.map((challenge) => (
                    <FormField
                      key={challenge.id}
                      control={form.control}
                      name="challenges"
                      render={({ field }) => (
                        <FormItem
                          key={challenge.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(challenge.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, challenge.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== challenge.id
                                      )
                                    )
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>{challenge.name} ({challenge.points} pts)</FormLabel>
                            <FormDescription>{challenge.description}</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  ))}
                </FormItem>
              )}
            />
          </ScrollArea>
        </div>

        {/* Step 3: Invite Friends */}
        <div className={cn("space-y-4", step !== 3 && "hidden")}>
          <FormLabel>Invite Friends (Optional)</FormLabel>
          <FormDescription>Select friends to invite to your new league.</FormDescription>
          <FormMessage>{form.formState.errors.friend_ids_to_invite?.message}</FormMessage>
          
          <ScrollArea className="h-72 w-full rounded-md border p-4">
            {isLoadingFriends ? <Skeleton className="h-10 w-full" /> : (
              <FormField
                control={form.control}
                name="friend_ids_to_invite"
                render={() => (
                  <FormItem className="space-y-3">
                    {friends && friends.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        You haven't added any friends yet. Go to the Friends page to add some!
                      </p>
                    )}
                    {friends?.map((friend) => (
                      <FormField
                        key={friend.friend.id}
                        control={form.control}
                        name="friend_ids_to_invite"
                        render={({ field }) => (
                          <FormItem
                            key={friend.friend.id}
                            className="flex flex-row items-center space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(friend.friend.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, friend.friend.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== friend.friend.id
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={friend.friend.avatar_url || ''} />
                              <AvatarFallback>{friend.friend.username.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <FormLabel className="font-normal">{friend.friend.display_name} (@{friend.friend.username})</FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </FormItem>
                )}
              />
            )}
          </ScrollArea>
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={prevStep} disabled={step === 1}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>

          {step !== 3 && (
            <Button type="button" onClick={nextStep}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}

          {step === 3 && (
            <Button type="submit" disabled={createLeague.isPending}>
              {createLeague.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trophy className="mr-2 h-4 w-4" />
              )}
              Create League
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};