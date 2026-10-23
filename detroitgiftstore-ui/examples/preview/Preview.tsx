/**
 * Live preview of the component system. Bundled into a single HTML page by
 * examples/preview/build.mjs. All products are sample data.
 */
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AddToCartButton,
  Badge,
  Button,
  EmptyState,
  Price,
  ProductGrid,
  QuantityStepper,
  Rating,
  type Product,
} from '../../src';

function art(bg: string, fg: string, label: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="${bg}"/><circle cx="200" cy="170" r="92" fill="${fg}" opacity=".18"/><text x="200" y="196" font-family="Georgia,serif" font-size="74" font-weight="700" text-anchor="middle" fill="${fg}">${label}</text><text x="200" y="320" font-family="system-ui,sans-serif" font-size="20" letter-spacing="6" text-anchor="middle" fill="${fg}" opacity=".7">DETROIT</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const usd = (amount: number) => ({ amount, currencyCode: 'USD' });

const PRODUCTS: Product[] = [
  { id: '1', handle: 'mitten-mug', title: 'Mitten State Mug', vendor: 'Rust Belt Pottery', price: usd(1800), compareAtPrice: usd(2400), image: { src: art('#0f5132', '#f3efe6', 'MUG') }, availableForSale: true, inventoryQuantity: 3, badges: ['local-maker'], rating: { value: 4.6, count: 38 } },
  { id: '2', handle: 'hustles-tee', title: 'Detroit Hustles Harder Tee', vendor: 'Motor City Threads', price: usd(3200), image: { src: art('#1c1b19', '#e9c46a', 'TEE') }, availableForSale: false, badges: ['bestseller'], rating: { value: 4.9, count: 212 } },
  { id: '3', handle: 'belle-isle-candle', title: 'Belle Isle Soy Candle', vendor: 'Detroit Candle Co.', price: usd(2600), image: { src: art('#b3541e', '#fff4ea', 'BELLE') }, availableForSale: true, inventoryQuantity: 40, badges: ['new'] },
  { id: '4', handle: 'corktown-coffee', title: 'Corktown Morning Coffee, 12 oz', vendor: 'Eastside Roasters', price: usd(1600), image: { src: art('#4a2e1f', '#f1d9b5', 'BREW') }, availableForSale: true, badges: ['local-maker'], rating: { value: 4.3, count: 17 } },
  { id: '5', handle: 'map-print', title: 'Motor City Neighborhood Map Print, 18×24', vendor: 'Woodward Press', price: usd(4500), image: { src: art('#24476b', '#e8eef5', 'MAP') }, availableForSale: true, inventoryQuantity: 2, badges: ['limited'] },
  { id: '6', handle: 'coney-pin', title: 'Coney Dog Enamel Pin (image link broken on purpose)', vendor: 'Pin City', price: usd(1000), image: { src: 'missing-image.jpg' }, availableForSale: true },
  { id: '7', handle: 'tote', title: 'Eastern Market Saturday Canvas Tote Bag with Extra-Long Reinforced Shoulder Straps', vendor: 'Gratiot Goods', price: usd(2200), compareAtPrice: usd(2800), image: { src: art('#6b7f3a', '#f5f7ee', 'TOTE') }, availableForSale: true, rating: { value: 4.1, count: 9 } },
  { id: '8', handle: 'spirit-print', title: 'Spirit of Detroit Postcard Set', vendor: 'Woodward Press', price: usd(1200), image: { src: art('#5b3a6b', '#f3eaf7', 'POST') }, availableForSale: true, badges: ['new'] },
];

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
let corktownTries = 0;
/** Simulated cart: the coffee fails on the first try so the error state is visible. */
async function addToCart(p: Product) {
  await wait(900);
  if (p.id === '4' && corktownTries++ === 0) throw new Error('Simulated network error');
}

type GridState = 'loaded' | 'loading' | 'empty' | 'error' | 'more-failed' | 'fetching-more';
const STATES: Array<{ id: GridState; label: string }> = [
  { id: 'loaded', label: 'Loaded' },
  { id: 'loading', label: 'Loading' },
  { id: 'fetching-more', label: 'Loading more' },
  { id: 'empty', label: 'No results' },
  { id: 'error', label: 'Failed to load' },
  { id: 'more-failed', label: 'Load more failed' },
];

function GridDemo() {
  const [state, setState] = useState<GridState>('loaded');
  const props = {
    loaded: { products: PRODUCTS, hasMore: true },
    loading: { products: undefined, isLoading: true },
    'fetching-more': { products: PRODUCTS.slice(0, 4), isFetchingMore: true, hasMore: true },
    empty: { products: [] },
    error: { products: undefined, error: true },
    'more-failed': { products: PRODUCTS.slice(0, 4), error: true },
  }[state];

  return (
    <section className="pv-section" aria-labelledby="grid-h">
      <div className="pv-section__head">
        <h2 id="grid-h">ProductGrid + ProductCard</h2>
        <p>Pick a state to see how the grid handles it. Add to cart works: the coffee fails on its first try so you can see the error and retry.</p>
      </div>
      <div className="pv-tabs" role="radiogroup" aria-label="Grid state">
        {STATES.map((s) => (
          <label key={s.id} className="pv-tab">
            <input type="radio" name="grid-state" id={`state-${s.id}`} checked={state === s.id} onChange={() => setState(s.id)} />
            <span>{s.label}</span>
          </label>
        ))}
      </div>
      <ProductGrid
        key={state}
        label="Sample gifts"
        headingLevel="h3"
        getProductHref={(p) => `#${p.handle}`}
        onAddToCart={addToCart}
        onRetry={() => setState('loaded')}
        onLoadMore={() => setState('fetching-more')}
        emptyState={
          <EmptyState
            headingLevel="h3"
            title="No results for “snow globe”"
            description="Check the spelling or try a broader term like “mug” or “Detroit tee”."
            actions={<Button variant="secondary" onClick={() => setState('loaded')}>Clear search</Button>}
          />
        }
        {...props}
      />
    </section>
  );
}

function DetailDemo() {
  const [qty, setQty] = useState(1);
  const p = PRODUCTS[0]!;
  return (
    <section className="pv-section" aria-labelledby="pdp-h">
      <div className="pv-section__head">
        <h2 id="pdp-h">Product page pieces</h2>
        <p>Price, Rating, QuantityStepper (max 3, matching stock) and AddToCartButton.</p>
      </div>
      <div className="pv-pdp">
        <img src={p.image!.src} alt="" width={400} height={400} className="pv-pdp__img" />
        <div className="pv-pdp__info">
          <p className="pv-eyebrow">{p.vendor}</p>
          <h3 className="pv-pdp__title">{p.title}</h3>
          <Rating value={4.6} count={38} />
          <Price price={p.price} compareAtPrice={p.compareAtPrice} size="lg" />
          <div className="pv-row">
            <Badge tone="brand">Detroit made</Badge>
            <Badge tone="warning">Only 3 left</Badge>
          </div>
          <div className="pv-row">
            <QuantityStepper value={qty} onChange={setQty} max={3} label="Quantity" />
            <AddToCartButton size="lg" productTitle={p.title} onAdd={() => wait(900)} style={{ flex: 1 }} />
          </div>
        </div>
      </div>
    </section>
  );
}

function ButtonsDemo() {
  const [loading, setLoading] = useState(false);
  return (
    <section className="pv-section" aria-labelledby="btn-h">
      <div className="pv-section__head">
        <h2 id="btn-h">Buttons and badges</h2>
        <p>Every variant and size. Loading keeps the button’s width and focus.</p>
      </div>
      <div className="pv-row">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
        <Button disabled>Disabled</Button>
      </div>
      <div className="pv-row">
        <Button size="sm">Small</Button>
        <Button>Medium</Button>
        <Button size="lg">Large</Button>
        <Button
          variant="secondary"
          loading={loading}
          onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1500); }}
        >
          Click to load
        </Button>
      </div>
      <div className="pv-row">
        <Badge>Bestseller</Badge>
        <Badge tone="brand">New</Badge>
        <Badge tone="sale">25% off</Badge>
        <Badge tone="warning">Only 2 left</Badge>
        <Badge tone="muted">Sold out</Badge>
      </div>
    </section>
  );
}

function App() {
  return (
    <div className="pv-page">
      <header className="pv-header">
        <p className="pv-eyebrow">detroitgiftstore.com</p>
        <h1>Detroit Gift Store UI</h1>
        <p>The real React components from <code>detroitgiftstore-ui</code>, running live. Products and images are samples. Light or dark follows your theme.</p>
      </header>
      <GridDemo />
      <DetailDemo />
      <ButtonsDemo />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
