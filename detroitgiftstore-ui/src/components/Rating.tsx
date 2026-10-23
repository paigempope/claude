import type { HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export interface RatingProps extends HTMLAttributes<HTMLSpanElement> {
  value: number;
  count?: number;
  max?: number;
}

export function Rating({ value, count, max = 5, className, ...rest }: RatingProps) {
  const safe = Number.isFinite(value) ? Math.min(Math.max(value, 0), max) : 0;
  const rounded = Math.round(safe * 10) / 10;
  const label =
    `Rated ${rounded} out of ${max} stars` +
    (count !== undefined ? `, ${count} ${count === 1 ? 'review' : 'reviews'}` : '');
  const stars = '★'.repeat(max);

  return (
    <span className={cn('dgs-rating', className)} role="img" aria-label={label} {...rest}>
      <span className="dgs-rating__stars" aria-hidden="true">
        {stars}
        <span className="dgs-rating__fill" style={{ width: `${(safe / max) * 100}%` }}>
          {stars}
        </span>
      </span>
      {count !== undefined && <span aria-hidden="true">({count})</span>}
    </span>
  );
}
