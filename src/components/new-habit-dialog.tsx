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
import { BookOpen, Dumbbell, HeartPulse, GlassWater, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Habit } from './habit-card';

const icons = {
  BookOpen: <BookOpen className="inline-block h-4 w-4 mr-2" />,
  Dumbbell: <Dumbbell className="inline-block h-4 w-4 mr-2" />,
  HeartPulse: <HeartPulse className="inline-block h-4 w-4 mr-2" />,
  GlassWater: <GlassWater className="inline-block h-4 w-4 mr-2" />,
};

const habitFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Habit name must be at least 2 characters.',
  }),
  icon: z.enum(Object.keys(icons) as [keyof typeof icons, ...(keyof typeof icons)[]]),
  goal: z.coerce.number().min(1, 'Goal must be at least 1').max(7, 'Goal can be at most 7'),
});

type HabitFormValues = z.infer<typeof habitFormSchema>;

export function NewHabitDialog() {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const form = useForm<HabitFormValues>({
    resolver: zodResolver(habitFormSchema),
    defaultValues: {
      name: '',
      icon: 'BookOpen',
      goal: 7,
    },
  });

  const onSubmit = async (data: HabitFormValues) => {
    // In a real app, you'd call an API to save the habit
    console.log('New habit created:', data);
    
    // For now we just show a toast
    toast({
      title: 'Habit Created!',
      description: `Your new habit "${data.name}" has been added.`,
    });
    setOpen(false);
    form.reset();
  };
  
    React.useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Habit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Habit</DialogTitle>
          <DialogDescription>
            What new positive habit are you starting today?
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Habit Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Morning Walk" {...field} />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <Input type="number" placeholder="e.g. 5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Create Habit</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
