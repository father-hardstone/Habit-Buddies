'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressCircleProps extends React.SVGProps<SVGSVGElement> {
  value: number;
  max?: number;
}

export const ProgressCircle = React.forwardRef<SVGSVGElement, ProgressCircleProps>(
  ({ value, max = 100, className, ...props }, ref) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const progress = value / max;
    const strokeDashoffset = circumference * (1 - progress);

    return (
      <svg
        ref={ref}
        width="100"
        height="100"
        viewBox="0 0 100 100"
        className={cn("transform -rotate-90", className)}
        {...props}
      >
        <circle
          cx="50"
          cy="50"
          r={radius}
          strokeWidth="10"
          className="stroke-muted/20"
          fill="transparent"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="stroke-current text-[--habit-color] transition-all duration-500 ease-in-out"
          fill="transparent"
        />
      </svg>
    );
  }
);
ProgressCircle.displayName = 'ProgressCircle';
