'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookOpen, Dumbbell, HeartPulse, GlassWater, Loader2, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Habit } from '@/lib/database';
import { Label } from '@/components/ui/label';

const icons = {
  BookOpen: <BookOpen className="inline-block h-4 w-4 mr-2" />,
  Dumbbell: <Dumbbell className="inline-block h-4 w-4 mr-2" />,
  HeartPulse: <HeartPulse className="inline-block h-4 w-4 mr-2" />,
  GlassWater: <GlassWater className="inline-block h-4 w-4 mr-2" />,
};

const habitFormSchema = z
  .object({
    name: z.string().min(2, {
      message: 'Habit name must be at least 2 characters.',
    }),
    icon: z.enum(Object.keys(icons) as [keyof typeof icons, ...(keyof typeof icons)[]]),
    goal: z.coerce.number().min(1, 'Goal must be at least 1').max(7, 'Goal can be at most 7'),
    loggingMode: z.enum(['once', 'multiple']),
    dailyLogLimit: z.coerce.number().min(1).max(10).optional(),
  })
  .superRefine((values, ctx) => {
    if (values.loggingMode === 'multiple' && !values.dailyLogLimit) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Set a daily log limit (1–10).',
        path: ['dailyLogLimit'],
      });
    }
  });

type HabitFormValues = z.infer<typeof habitFormSchema>;

interface NewHabitDialogProps {
  addHabit: (
    newHabit: Omit<Habit, 'id' | 'streak' | 'completed' | 'color' | 'weeklyPoints' | 'canLog' | 'pointsPerLog'>,
  ) => Promise<void>;
}

export function NewHabitDialog({ addHabit }: NewHabitDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  const form = useForm<HabitFormValues>({
    resolver: zodResolver(habitFormSchema),
    defaultValues: {
      name: '',
      icon: 'BookOpen',
      goal: 7,
      loggingMode: 'once',
      dailyLogLimit: 7,
    },
  });

  const loggingMode = form.watch('loggingMode');

  const onSubmit = async (data: HabitFormValues) => {
    setIsSubmitting(true);
    try {
      await addHabit({
        name: data.name,
        icon: data.icon,
        goal: data.goal,
        allowMultipleLogsPerDay: data.loggingMode === 'multiple',
        dailyLogLimit:
          data.loggingMode === 'multiple' ? data.dailyLogLimit ?? 7 : 1,
      });
      toast({
        title: 'Habit Created!',
        description: `Your new habit "${data.name}" has been added.`,
      });
      setOpen(false);
      form.reset();
    } catch {
      // Parent handles error toast
    } finally {
      setIsSubmitting(false);
    }
  };
  
    React.useEffect(() => {
    if (!open && !isSubmitting) {
      form.reset();
    }
  }, [open, isSubmitting, form]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSubmitting) return;
    setOpen(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Habit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Create New Habit</DialogTitle>
          <DialogDescription>
            What new positive habit are you starting today?
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Habit Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Morning Walk" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an icon" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.keys(icons).map(iconKey => (
                        <SelectItem key={iconKey} value={iconKey}>
                          <div className="flex items-center">
                            {icons[iconKey as keyof typeof icons]}
                            {iconKey.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="goal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weekly Goal</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g. 5" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="loggingMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logging rules</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid gap-2"
                      disabled={isSubmitting}
                    >
                      <div className="flex items-start gap-2 rounded-md border p-3">
                        <RadioGroupItem value="once" id="log-once" className="mt-0.5" />
                        <Label htmlFor="log-once" className="cursor-pointer font-normal">
                          <span className="font-medium">Once per 24 hours</span>
                          <p className="text-xs text-muted-foreground">
                            Each log earns 1 point. Cannot log again within 24 hours.
                          </p>
                        </Label>
                      </div>
                      <div className="flex items-start gap-2 rounded-md border p-3">
                        <RadioGroupItem value="multiple" id="log-multiple" className="mt-0.5" />
                        <Label htmlFor="log-multiple" className="cursor-pointer font-normal">
                          <span className="font-medium">Multiple logs per day</span>
                          <p className="text-xs text-muted-foreground">
                            Set a daily limit (max 10). Each log earns 1 ÷ limit points.
                          </p>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {loggingMode === 'multiple' && (
              <FormField
                control={form.control}
                name="dailyLogLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Daily log limit</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Example: 7 logs/day → each log is worth ~0.14 points.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Habit'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
