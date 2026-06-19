'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type ThemeToggleProps = {
  variant?: 'floating' | 'sidebar';
  className?: string;
};

export function ThemeToggle({ variant = 'floating', className }: ThemeToggleProps) {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && (resolvedTheme === 'dark' || theme === 'dark');

  const toggle = () => setTheme(isDark ? 'light' : 'dark');

  if (variant === 'sidebar') {
    return (
      <>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggle}
          className={cn(
            'w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden',
            className,
          )}
        >
          {isDark ? <Sun className="mr-2 size-4" /> : <Moon className="mr-2 size-4" />}
          {isDark ? 'Light mode' : 'Dark mode'}
        </Button>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              className={cn(
                'hidden size-9 group-data-[collapsible=icon]:flex',
                className,
              )}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {isDark ? 'Light mode' : 'Dark mode'}
          </TooltipContent>
        </Tooltip>
      </>
    );
  }

  return (
    <div className={cn('fixed bottom-5 right-5 z-50', className)}>
      <Button
        variant="outline"
        size="icon"
        onClick={toggle}
        className="size-12 rounded-full shadow-lg transition-all hover:scale-110 hover:shadow-xl"
      >
        <Sun className="size-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute size-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </div>
  );
}
