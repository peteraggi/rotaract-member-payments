'use client';

import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: number;
  className?: string;
}

const Spinner = ({ size = 20, className }: SpinnerProps) => {
  return (
    <svg
      className={cn('animate-spin text-muted-foreground', className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg>
  );
};

export default Spinner;