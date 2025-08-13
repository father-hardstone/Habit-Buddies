'use client';

import * as React from 'react';

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
        className={className}
        {...props}
      >
        <circle
          cx="50"
          cy="50"
          r={radius}
          strokeWidth="10"
          className="stroke-muted/50"
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
          transform="rotate(-90 50 50)"
          className="stroke-current transition-all duration-500"
          fill="transparent"
        />
      </svg>
    );
  }
);
ProgressCircle.displayName = 'ProgressCircle';
