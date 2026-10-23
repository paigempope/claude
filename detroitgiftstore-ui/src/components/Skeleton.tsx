import type { CSSProperties, HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  /** Use for avatars / round thumbnails */
  circle?: boolean;
}

/**
 * Placeholder block. Always aria-hidden: the *container* owns the loading
 * announcement (aria-busy + a status message), not each shimmer bar.
 */
export function Skeleton({ width = '100%', height = '1em', circle, className, style, ...rest }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={cn('dgs-skeleton', circle && 'dgs-skeleton--circle', className)}
      style={{ width, height, ...style }}
      {...rest}
    />
  );
}
