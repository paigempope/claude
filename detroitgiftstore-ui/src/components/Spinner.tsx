import type { HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Accessible label. Omit when the spinner sits inside an element that
   * already communicates busy state (e.g. a Button with aria-busy).
   */
  label?: string;
}

export function Spinner({ label, className, ...rest }: SpinnerProps) {
  return (
    <span
      className={cn('dgs-spinner', className)}
      {...(label ? { role: 'status', 'aria-label': label } : { 'aria-hidden': true })}
      {...rest}
    />
  );
}
