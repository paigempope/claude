import type { HTMLAttributes } from 'react';
import type { Money } from '../types/commerce';
import { cn } from '../utils/cn';
import { formatMoney, isDiscounted } from '../utils/money';

export interface PriceProps extends HTMLAttributes<HTMLSpanElement> {
  price: Money;
  compareAtPrice?: Money | null;
  /** Prefix such as "From" for products with variant price ranges. */
  prefix?: string;
  size?: 'md' | 'lg';
  locale?: string;
}

/**
 * Screen readers hear "Sale price $18.00, regular price $24.00" instead of
 * two bare numbers with an invisible strikethrough.
 */
export function Price({ price, compareAtPrice, prefix, size = 'md', locale, className, ...rest }: PriceProps) {
  const onSale = isDiscounted(price, compareAtPrice);
  const current = formatMoney(price, locale);

  return (
    <span className={cn('dgs-price', onSale && 'dgs-price--sale', size === 'lg' && 'dgs-price--lg', className)} {...rest}>
      <span className="dgs-price__current">
        {onSale && <span className="dgs-visually-hidden">Sale price </span>}
        {prefix && `${prefix} `}
        {current}
      </span>
      {onSale && (
        <s className="dgs-price__compare">
          <span className="dgs-visually-hidden">Regular price </span>
          {formatMoney(compareAtPrice, locale)}
        </s>
      )}
    </span>
  );
}
