# @detroitgiftstore/ui

React + TypeScript component system for **detroitgiftstore.com**. It's accessible, themeable, has no runtime dependencies, and covers the loading, empty, error and edge states that real storefront traffic hits.

```bash
npm install
npm run typecheck   # strict TS, incl. noUncheckedIndexedAccess
npm test            # Vitest + Testing Library (behaviour and a11y assertions)
```

---

## 1. Architecture

```
src/
├── styles/
│   ├── tokens.css        ← design tokens (the only place colors/spacing live)
│   └── components.css    ← component styles; read tokens only, prefix .dgs-
├── types/commerce.ts     ← Money, Product, ProductImage… (domain contracts)
├── utils/                ← cn(), formatMoney(), isDiscounted(), useId()
├── hooks/
│   └── useAsyncAction.ts ← pending/success/error lifecycle, double-submit guard
├── components/
│   ├── Primitives        Button · Spinner · Skeleton · Badge · VisuallyHidden
│   ├── Commerce atoms    Price · Rating · QuantityStepper · AddToCartButton
│   ├── Feedback          StateMessage → EmptyState · ErrorState
│   └── Composites        ProductCard · ProductCardSkeleton · ProductGrid
└── index.ts              ← the only public entry point
```

**Layering rules**

| Layer | May import | Knows about commerce? |
|---|---|---|
| Tokens / utils | nothing | No |
| Primitives | utils | No, reusable anywhere (account pages, checkout) |
| Commerce atoms | primitives, types | Yes, but no data fetching |
| Composites | everything above | Yes, still **presentational**: data comes in through props |

Components never fetch data. Whatever data layer you use (Shopify Storefront API, React Query, SWR) passes in `products`, `isLoading` and `error`, so the same grid works on collection pages, search results, "You may also like" and gift guides.

**Design decisions**

- **Money is in minor units** (`2499` = $24.99). This avoids float bugs, and `formatMoney` respects each currency's decimal places (JPY has none).
- **Plain CSS with tokens, no CSS-in-JS.** There's no runtime cost, it works with any framework (Next.js RSC included), and a theme is just token overrides.
- **Dark mode** follows `prefers-color-scheme`, and `<html data-theme="light|dark">` overrides it.
- **No runtime dependencies.** React is the only peer dependency.

---

## 2. Props / API

### `ProductGrid`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `products` | `Product[] \| undefined` | **required** | `undefined` = not loaded, `[]` = no results |
| `getProductHref` | `(p) => string` | **required** | Keeps URL structure out of the component |
| `isLoading` | `boolean` | `false` | First load → skeleton grid + "Loading…" status |
| `isFetchingMore` | `boolean` | `false` | Keeps results, appends skeletons |
| `error` | `unknown` | — | Never rendered raw. Full-page error if nothing loaded, inline if paginating |
| `onRetry` | `() => void` | — | Adds a "Try again" button to error states |
| `hasMore` / `onLoadMore` | `boolean` / `() => void` | — | "Load more" button (better for a11y than infinite scroll) |
| `onAddToCart` | `(p) => Promise` | — | Omit for browse-only grids |
| `onAddToCartError` | `(err, p) => void` | — | Hook for logging and toasts |
| `linkComponent` | `ElementType` | `'a'` | Pass Next.js / Remix `Link` |
| `priorityCount` | `number` | `4` | First N images eager-loaded with `fetchpriority=high` (LCP) |
| `skeletonCount` | `number` | `8` | |
| `headingLevel` | `'h2' \| 'h3' \| 'h4'` | `'h3'` | Match the page outline |
| `emptyState` | `ReactNode` | built-in | e.g. "Clear filters" actions |
| `renderProduct` | `(p, i) => ReactNode` | `ProductCard` | Escape hatch |
| `label` | `string` | `'Products'` | Accessible name of the list |

**State precedence:** loading (nothing loaded yet) → error (nothing loaded yet) → empty → results (paginating, or a pagination error shown inline).

### `ProductCard`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `product` | `Product` | **required** | |
| `href` | `string` | **required** | |
| `onAddToCart` | `(p) => Promise` | — | Renders `AddToCartButton` |
| `priority` | `boolean` | `false` | For above-the-fold cards |
| `lowStockThreshold` | `number` | `5` | "Only N left" badge. `0` disables it |
| `linkComponent`, `headingLevel`, `imageSizes`, `locale`, `children`, `className` | | | `children` sits above the price (e.g. swatches) |

Badge priority: **Sold out** › **% off** › `product.badges` (`new`, `local-maker` → "Detroit made", `bestseller`, `limited`). At most 2 are shown, so the image stays readable.

### `AddToCartButton`

`onAdd` (required) · `availableForSale` · `productTitle` (used in announcements) · `onError` · `labels` (idle, pending, success, error, soldOut copy) · any `Button` prop.
It goes idle → pending (spinner, clicks ignored) → success ("Added ✓") or error ("Try again"), then resets after 2s and announces the result through a polite live region.

### `Button`

`variant: 'primary' | 'secondary' | 'ghost' | 'danger'` · `size: 'sm' | 'md' | 'lg'` · `loading` · `loadingLabel` · `fullWidth` · `startIcon` / `endIcon` · forwards ref and all native button props. It defaults to `type="button"`.

### `Price`, `Rating`, `QuantityStepper`, `EmptyState`, `ErrorState`

```ts
<Price price compareAtPrice? prefix?="From" size?="md"|"lg" locale? />
<Rating value count? max?=5 />
<QuantityStepper value? defaultValue? onChange? min?=1 max?=99 step?=1 label?="Quantity" disabled? />
<EmptyState title description? icon? actions? headingLevel? />
<ErrorState title? description? onRetry? retryLabel? actions? />
```

### `useAsyncAction(fn, { resetAfter = 2000, onError })`

Returns `{ run, status, error, isPending }`. Use it for any async button: newsletter signup, wishlist, apply coupon.

---

## 3. Usage

```tsx
// app root (once)
import '@detroitgiftstore/ui/src/styles/tokens.css';
import '@detroitgiftstore/ui/src/styles/components.css';
```

**Collection page (Next.js)**

```tsx
import Link from 'next/link';
import { ProductGrid } from '@detroitgiftstore/ui';

<ProductGrid
  label="Holiday gifts"
  products={data?.products}
  isLoading={isLoading}
  error={error}
  onRetry={refetch}
  getProductHref={(p) => `/products/${p.handle}`}
  linkComponent={Link}
  onAddToCart={(p) => cart.add(p.id, 1)}
  onAddToCartError={(err, p) => Sentry.captureException(err, { extra: { id: p.id } })}
/>
```

**Search with no results**

```tsx
<ProductGrid
  products={results}
  getProductHref={href}
  emptyState={
    <EmptyState
      title={`No results for “${query}”`}
      description="Check the spelling or try a broader term like “mug” or “Detroit tee”."
      actions={<Button variant="secondary" onClick={clearFilters}>Clear filters</Button>}
    />
  }
/>
```

**Product detail page**

```tsx
const [qty, setQty] = useState(1);

<Price price={product.price} compareAtPrice={product.compareAtPrice} size="lg" />
<QuantityStepper value={qty} onChange={setQty} max={product.inventoryQuantity ?? 10} />
<AddToCartButton
  size="lg"
  fullWidth
  productTitle={product.title}
  availableForSale={product.availableForSale}
  onAdd={() => cart.add(product.id, qty)}
/>
```

**Seasonal theming without touching components**

```css
.holiday-section {
  --dgs-color-brand: #8b1e2d;
  --dgs-color-brand-hover: #6d1622;
}
```

There's a full, typechecked example with pagination and error handling in [`examples/CollectionPage.tsx`](examples/CollectionPage.tsx).

---

## 4. Best practices built in (and what to keep doing)

**Accessibility (targets WCAG 2.2 AA)**
- Each product card has **one** stretched link (the title), so a grid of 24 is 24 tab stops instead of 48.
- Images use empty `alt` by default because the title link already names the product. Pass `image.alt` only if it adds information.
- Disabled and loading buttons use `aria-disabled`, not `disabled`, so focus isn't lost mid-action.
- Prices read as "Sale price $18.00, regular price $24.00". Ratings read as one sentence, not five stars.
- Loading, result counts and cart outcomes are announced through live regions. Errors use `role="alert"`.
- Tap targets are at least 44px, and the focus ring uses `:focus-visible`. Reduced-motion and Windows forced-colors modes are handled.
- **Keep doing:** pass `headingLevel` to match the page outline, and put the product name in `QuantityStepper`'s `label` in cart rows.

**Performance**
- `aspect-ratio` on media and skeletons that match the card's geometry exactly mean **no layout shift** (CLS).
- The first `priorityCount` images are eager with high fetch priority, and the rest lazy-load.
- `ProductCard` is memoized. Pass stable `onAddToCart` handlers (`useCallback`) to get the benefit.
- Shared `Intl.NumberFormat` instances are cached.

**Resilience**
- Broken image URLs fall back to a placeholder. Long, unbroken titles wrap and clamp to 2 lines. A compare-at price that isn't higher, or is in another currency, is ignored. Rating input is clamped. Pasted quantities are sanitized and clamped.
- A failed "load more" keeps existing results on screen.
- Raw error messages never reach shoppers. Log them with `onAddToCartError` or `onError`.

**Scaling the system**
- New colors and spacing go into `tokens.css` first. Never hard-code values in components.
- New components go into the right layer, are exported from `index.ts` only, and ship with tests covering loading, empty and error states plus their accessible names.
- Next steps: Storybook for visual QA, `jest-axe` in CI, and visual regression tests (Chromatic or Playwright) on the card's states.
