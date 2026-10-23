import type { ElementType, ReactNode } from 'react';
import type { Product } from '../types/commerce';
import { cn } from '../utils/cn';
import { Button } from './Button';
import { ProductCard, ProductCardSkeleton, type ProductCardProps } from './ProductCard';
import { EmptyState, ErrorState } from './StateMessage';

export interface ProductGridProps {
  /** `undefined` = not loaded yet; `[]` = loaded with no results. */
  products: Product[] | undefined;
  /** Initial load. Shows skeletons when there are no products yet. */
  isLoading?: boolean;
  /** Pagination in flight: products stay visible, skeletons are appended. */
  isFetchingMore?: boolean;
  /** Any truthy value. Never rendered directly. */
  error?: unknown;
  onRetry?: () => void;
  hasMore?: boolean;
  onLoadMore?: () => void;

  getProductHref: (product: Product) => string;
  onAddToCart?: ProductCardProps['onAddToCart'];
  onAddToCartError?: ProductCardProps['onAddToCartError'];
  linkComponent?: ElementType;
  /** Number of cards loaded eagerly as LCP candidates. Default 4. */
  priorityCount?: number;
  skeletonCount?: number;
  headingLevel?: ProductCardProps['headingLevel'];

  /** Override the "no results" UI, e.g. with filter-reset actions. */
  emptyState?: ReactNode;
  /** Full control over each item; defaults to ProductCard. */
  renderProduct?: (product: Product, index: number) => ReactNode;
  /** Accessible name for the list, e.g. "Holiday gifts". */
  label?: string;
  className?: string;
}

export function ProductGrid({
  products,
  isLoading = false,
  isFetchingMore = false,
  error,
  onRetry,
  hasMore = false,
  onLoadMore,
  getProductHref,
  onAddToCart,
  onAddToCartError,
  linkComponent,
  priorityCount = 4,
  skeletonCount = 8,
  headingLevel,
  emptyState,
  renderProduct,
  label = 'Products',
  className,
}: ProductGridProps) {
  const hasProducts = !!products && products.length > 0;
  const showSkeletonsOnly = !hasProducts && (isLoading || (products === undefined && !error));

  // 1) Initial loading
  if (showSkeletonsOnly) {
    return (
      <div className={cn('dgs-grid-wrapper', className)} aria-busy="true">
        <span role="status" className="dgs-visually-hidden">Loading {label.toLowerCase()}…</span>
        <ul className="dgs-grid" aria-hidden="true">
          {Array.from({ length: skeletonCount }, (_, i) => (
            <li key={i}><ProductCardSkeleton showAction={!!onAddToCart} /></li>
          ))}
        </ul>
      </div>
    );
  }

  // 2) Hard failure with nothing to show
  if (error && !hasProducts) {
    return <ErrorState className={className} onRetry={onRetry} />;
  }

  // 3) Loaded, no results
  if (!hasProducts) {
    return (
      <div className={className}>
        {emptyState ?? (
          <EmptyState
            title="No gifts found"
            description="Try adjusting your filters or browse our Detroit-made favorites."
          />
        )}
      </div>
    );
  }

  // 4) Results (possibly paginating, possibly with a load-more failure)
  return (
    <div className={cn('dgs-grid-wrapper', className)} aria-busy={isFetchingMore || undefined}>
      <span role="status" className="dgs-visually-hidden">
        {isFetchingMore ? 'Loading more products…' : `Showing ${products.length} ${products.length === 1 ? 'product' : 'products'}`}
      </span>
      <ul className="dgs-grid" aria-label={label}>
        {products.map((product, index) => (
          <li key={product.id}>
            {renderProduct ? (
              renderProduct(product, index)
            ) : (
              <ProductCard
                product={product}
                href={getProductHref(product)}
                linkComponent={linkComponent}
                onAddToCart={onAddToCart}
                onAddToCartError={onAddToCartError}
                priority={index < priorityCount}
                headingLevel={headingLevel}
              />
            )}
          </li>
        ))}
        {isFetchingMore &&
          Array.from({ length: Math.min(skeletonCount, 4) }, (_, i) => (
            <li key={`skeleton-${i}`} aria-hidden="true">
              <ProductCardSkeleton showAction={!!onAddToCart} />
            </li>
          ))}
      </ul>

      {error ? (
        <ErrorState
          headingLevel="h3"
          title="Couldn’t load more products"
          description="Your current results are still here."
          onRetry={onRetry}
        />
      ) : (
        hasMore &&
        onLoadMore && (
          <div className="dgs-grid__more">
            <Button variant="secondary" loading={isFetchingMore} loadingLabel="Loading more products" onClick={onLoadMore}>
              Load more
            </Button>
          </div>
        )
      )}
    </div>
  );
}
