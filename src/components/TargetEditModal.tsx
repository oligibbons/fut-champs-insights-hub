// src/components/TargetEditModal.tsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { WeeklyPerformance } from '@/types/futChampions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
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
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner'; // **This is already correct**

const rankOptions = [
  "Rank 1", "Rank 2", "Rank 3", "Rank 4", "Rank 5",
  "Rank 6", "Rank 7", "Rank 8", "Rank 9", "Rank 10",
];

// Define Zod schema for editing targets
const targetSchema = z.object({
  target_rank: z.string().optional(),
  target_wins: z.coerce.number().min(0).max(20).optional(),
});

type TargetFormValues = z.infer<typeof targetSchema>;

interface TargetEditModalProps {
  run: WeeklyPerformance;
  isOpen: boolean;
  onClose: () => void;
  onTargetsUpdated: () => void; // Callback to refresh data
}

const TargetEditModal = ({ run, isOpen, onClose, onTargetsUpdated }: TargetEditModalProps) => {
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<TargetFormValues>({
    resolver: zodResolver(targetSchema),
  });

  // Reset form when 'run' prop changes
  useEffect(() => {
    if (run) {
      form.reset({
        target_rank: run.target_rank || '',
        target_wins: run.target_wins || 0,
      });
    }
  }, [run, form]);

  const onSubmit = async (data: TargetFormValues) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('weekly_performances')
        .update({
          target_rank: data.target_rank || null,
          target_wins: data.target_wins || null,
        })
        .eq('id', run.id);

      if (error) throw error;

      // **This is already correct**
      toast.success('Targets Updated', {
        description: 'Your new targets have been saved.',
      });
      onTargetsUpdated();
      onClose();
    } catch (error: any) {
      console.error('Error updating targets:', error);
      // **This is already correct**
      toast.error('Failed to update targets', {
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card-content">
        <DialogHeader>
          <DialogTitle>Edit Targets</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="target_wins"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Wins</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" max="20" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="target_rank"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Rank</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a target rank..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {rankOptions.map(rank => (
                        <SelectItem key={rank} value={rank}>{rank}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TargetEditModal;