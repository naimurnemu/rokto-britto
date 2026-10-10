import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
        outline: 'text-foreground',
        emergency:
          'border-rose-800/40 bg-rose-950/60 text-rose-300 font-mono shadow-sm',
        success:
          'border-emerald-800/40 bg-emerald-950/60 text-emerald-300 font-mono shadow-sm',
        warning:
          'border-amber-800/40 bg-amber-950/60 text-amber-300 font-mono shadow-sm',
        info:
          'border-sky-800/40 bg-sky-950/60 text-sky-300 font-mono shadow-sm',
        subagent:
          'border-purple-800/40 bg-purple-950/60 text-purple-300 font-mono shadow-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
