import { memo, useState, version as reactVersion, type ElementType, type ReactNode } from 'react';
import type { Product, ProductBadge } from '../types/commerce';
import { cn } from '../utils/cn';
import { discountPercent, isDiscounted } from '../utils/money';
import { AddToCartButton } from './AddToCartButton';
import { Badge, type BadgeTone } from './Badge';
import { Price } from './Price';
import { Rating } from './Rating';
import { Skeleton } from './Skeleton';

const BADGE_COPY: Record<ProductBadge, { label: string; tone: BadgeTone }> = {
  new: { label: 'New', tone: 'brand' },
  'local-maker': { label: 'Detroit made', tone: 'brand' },
  bestseller: { label: 'Bestseller', tone: 'neutral' },
  limited: { label: 'Limited', tone: 'neutral' },
};

// React 19 knows `fetchPriority`; React 18 only passes the lowercase attribute through.
const FETCH_PRIORITY_PROP = Number.parseInt(reactVersion, 10) >= 19 ? 'fetchPriority' : 'fetchpriority';

export interface ProductCardProps {
  product: Product;
  href: string;
  /**
   * Router link component (e.g. Next.js `Link`, Remix `Link`). Receives
   * `href`, `className` and `children`. Defaults to a plain <a>.
   */
  linkComponent?: ElementType;
  /** Omit to render a browse-only card with no cart button. */
  onAddToCart?: (product: Product) => Promise<unknown> | unknown;
  onAddToCartError?: (error: unknown, product: Product) => void;
  /** Eager-load + high fetch priority. Set for the first row (LCP). */
  priority?: boolean;
  /** Match the page outline: h2 on category pages, h3 inside a titled section. */
  headingLevel?: 'h2' | 'h3' | 'h4';
  /** Show "Only N left" at or below this inventory. Default 5. 0 disables. */
  lowStockThreshold?: number;
  /** `sizes` attribute for responsive images. */
  imageSizes?: string;
  locale?: string;
  /** Extra content above the price, e.g. a variant swatch row. */
  children?: ReactNode;
  className?: string;
}

function ProductCardImpl({
  product,
  href,
  linkComponent: Link = 'a',
  onAddToCart,
  onAddToCartError,
  priority = false,
  headingLevel: Heading = 'h3',
  lowStockThreshold = 5,
  imageSizes = '(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw',
  locale,
  children,
  className,
}: ProductCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const { title, vendor, price, compareAtPrice, image, availableForSale, inventoryQuantity, rating } = product;

  const onSale = isDiscounted(price, compareAtPrice);
  const lowStock =
    availableForSale &&
    lowStockThreshold > 0 &&
    inventoryQuantity !== undefined &&
    inventoryQuantity > 0 &&
    inventoryQuantity <= lowStockThreshold;

  const badges: Array<{ key: string; label: string; tone: BadgeTone }> = [];
  if (!availableForSale) badges.push({ key: 'sold-out', label: 'Sold out', tone: 'muted' });
  else if (onSale) badges.push({ key: 'sale', label: `${discountPercent(price, compareAtPrice)}% off`, tone: 'sale' });
  for (const b of product.badges ?? []) {
    const copy = BADGE_COPY[b];
    if (copy) badges.push({ key: b, ...copy });
  }

  return (
    <article className={cn('dgs-card', !availableForSale && 'dgs-card--sold-out', className)}>
      <div className="dgs-card__media">
        {image?.src && !imageFailed ? (
          <img
            className="dgs-card__img"
            src={image.src}
            // Title is already the link text, so a matching alt would be read twice
            alt={image.alt ?? ''}
            width={image.width}
            height={image.height}
            sizes={imageSizes}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            {...{ [FETCH_PRIORITY_PROP]: priority ? 'high' : 'auto' }}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="dgs-card__placeholder" aria-hidden="true">🎁</div>
        )}
        {badges.length > 0 && (
          <div className="dgs-card__badges">
            {badges.slice(0, 2).map((b) => (
              <Badge key={b.key} tone={b.tone}>{b.label}</Badge>
            ))}
          </div>
        )}
      </div>

      <div className="dgs-card__body">
        {vendor && <p className="dgs-card__vendor">{vendor}</p>}
        <Heading className="dgs-card__title">
          <Link href={href} className="dgs-card__link">
            {title}
          </Link>
        </Heading>
        {rating && rating.count > 0 && <Rating value={rating.value} count={rating.count} />}
        {children}

        <div className="dgs-card__footer">
          <div>
            <Price price={price} compareAtPrice={compareAtPrice} locale={locale} />
            {lowStock && (
              <div>
                <Badge tone="warning">Only {inventoryQuantity} left</Badge>
              </div>
            )}
          </div>
          {onAddToCart && (
            <AddToCartButton
              className="dgs-card__action"
              fullWidth
              size="sm"
              productTitle={title}
              availableForSale={availableForSale}
              onAdd={() => onAddToCart(product)}
              onError={onAddToCartError ? (err) => onAddToCartError(err, product) : undefined}
            />
          )}
        </div>
      </div>
    </article>
  );
}

/** Memoized: grids re-render often (filters, infinite scroll); cards rarely change. */
export const ProductCard = memo(ProductCardImpl);

export interface ProductCardSkeletonProps {
  showAction?: boolean;
  className?: string;
}

/** Mirrors ProductCard's geometry exactly so content swaps in with zero layout shift. */
export function ProductCardSkeleton({ showAction = true, className }: ProductCardSkeletonProps) {
  return (
    <div className={cn('dgs-card', className)} aria-hidden="true">
      <div className="dgs-card__media">
        <Skeleton height="100%" style={{ borderRadius: 0 }} />
      </div>
      <div className="dgs-card__body">
        <Skeleton width="40%" height="0.75rem" />
        <Skeleton width="90%" height="1rem" />
        <Skeleton width="60%" height="1rem" />
        <div className="dgs-card__footer">
          <Skeleton width="30%" height="1.1rem" />
          {showAction && <Skeleton height="36px" style={{ borderRadius: 'var(--dgs-radius-md)' }} />}
        </div>
      </div>
    </div>
  );
}
