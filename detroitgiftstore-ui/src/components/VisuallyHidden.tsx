import type { HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

/** Content for screen readers only. */
export function VisuallyHidden({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn('dgs-visually-hidden', className)} {...rest} />;
}
