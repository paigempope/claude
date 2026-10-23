/**
 * Example: a collection page wired to a data hook.
 * Swap `useCollection` / `addToCart` for your real data layer
 * (Shopify Storefront API, React Query, SWR, etc.).
 */
import { useCallback, useEffect, useState } from 'react';
import { Button, EmptyState, ProductGrid, type Product } from '../src';
import '../src/styles/tokens.css';
import '../src/styles/components.css';

interface CollectionState {
  products: Product[] | undefined;
  isLoading: boolean;
  isFetchingMore: boolean;
  error: unknown;
  hasMore: boolean;
}

declare function fetchCollection(handle: string, cursor?: string): Promise<{ products: Product[]; nextCursor?: string }>;
declare function addToCart(productId: string, quantity: number): Promise<void>;
declare function trackError(error: unknown, context: Record<string, string>): void;

function useCollection(handle: string) {
  const [state, setState] = useState<CollectionState>({
    products: undefined, isLoading: true, isFetchingMore: false, error: null, hasMore: false,
  });
  const [cursor, setCursor] = useState<string>();

  const load = useCallback(async (after?: string) => {
    setState((s) => ({ ...s, isLoading: !after, isFetchingMore: !!after, error: null }));
    try {
      const page = await fetchCollection(handle, after);
      setCursor(page.nextCursor);
      setState((s) => ({
        products: after ? [...(s.products ?? []), ...page.products] : page.products,
        isLoading: false, isFetchingMore: false, error: null, hasMore: !!page.nextCursor,
      }));
    } catch (error) {
      setState((s) => ({ ...s, isLoading: false, isFetchingMore: false, error }));
    }
  }, [handle]);

  useEffect(() => { void load(); }, [load]);

  return { ...state, retry: () => load(cursor), loadMore: () => load(cursor) };
}

export function CollectionPage({ handle, title }: { handle: string; title: string }) {
  const { products, isLoading, isFetchingMore, error, hasMore, retry, loadMore } = useCollection(handle);

  return (
    <main>
      <h1>{title}</h1>
      <ProductGrid
        label={title}
        products={products}
        isLoading={isLoading}
        isFetchingMore={isFetchingMore}
        error={error}
        onRetry={retry}
        hasMore={hasMore}
        onLoadMore={loadMore}
        headingLevel="h2"
        getProductHref={(p) => `/products/${p.handle}`}
        onAddToCart={(p) => addToCart(p.id, 1)}
        onAddToCartError={(err, p) => trackError(err, { productId: p.id })}
        emptyState={
          <EmptyState
            title="Nothing here yet"
            description="This collection is restocking. Check back soon or explore Detroit-made bestsellers."
            actions={<Button onClick={() => (window.location.href = '/collections/detroit-made')}>Shop Detroit made</Button>}
          />
        }
      />
    </main>
  );
}
