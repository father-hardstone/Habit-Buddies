'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressCircleProps extends React.SVGProps<SVGSVGElement> {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
}

export const ProgressCircle = React.forwardRef<SVGSVGElement, ProgressCircleProps>(
  ({ value, max = 100, size = 100, strokeWidth = 10, className, ...props }, ref) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = value / max;
    const strokeDashoffset = circumference * (1 - progress);
    const center = size / 2;

    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={cn('transform -rotate-90', className)}
        {...props}
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-muted/25"
          fill="transparent"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="stroke-current text-[--habit-color] transition-all duration-500 ease-in-out"
          fill="transparent"
        />
      </svg>
    );
  },
);
ProgressCircle.displayName = 'ProgressCircle';
