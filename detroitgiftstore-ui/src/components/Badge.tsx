import type { HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export type BadgeTone = 'neutral' | 'brand' | 'sale' | 'warning' | 'muted';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ tone = 'neutral', className, ...rest }: BadgeProps) {
  return <span className={cn('dgs-badge', tone !== 'neutral' && `dgs-badge--${tone}`, className)} {...rest} />;
}
