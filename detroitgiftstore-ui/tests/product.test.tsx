import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddToCartButton, ProductCard, ProductGrid } from '../src';
import { mug, tee } from './fixtures';

const href = (p: { handle: string }) => `/products/${p.handle}`;

describe('ProductCard', () => {
  it('renders one link, sale + maker badges, low stock and rating', () => {
    render(<ProductCard product={mug} href="/products/mitten-mug" />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAccessibleName('Mitten State Mug');
    expect(screen.getByText('25% off')).toBeInTheDocument();
    expect(screen.getByText('Detroit made')).toBeInTheDocument();
    expect(screen.getByText('Only 3 left')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /rated 4.6/i })).toBeInTheDocument();
  });

  it('shows sold-out state and a disabled cart button', () => {
    render(<ProductCard product={tee} href="/t" onAddToCart={vi.fn()} />);
    expect(screen.getAllByText('Sold out')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Sold out' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('falls back to a placeholder when the image fails', () => {
    const { container } = render(<ProductCard product={mug} href="/m" />);
    const img = container.querySelector('img')!;
    act(() => { img.dispatchEvent(new Event('error')); });
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('.dgs-card__placeholder')).not.toBeNull();
  });

  it('supports a custom router link component', () => {
    const RouterLink = ({ href, ...props }: { href: string }) => <a data-router href={href} {...props} />;
    render(<ProductCard product={mug} href="/m" linkComponent={RouterLink} />);
    expect(screen.getByRole('link')).toHaveAttribute('data-router');
  });
});

describe('AddToCartButton', () => {
  it('goes pending → success, guards double clicks, announces result', async () => {
    let resolve!: () => void;
    const onAdd = vi.fn(() => new Promise<void>((r) => { resolve = r; }));
    render(<AddToCartButton onAdd={onAdd} productTitle="Mitten State Mug" />);
    const btn = screen.getByRole('button');
    await userEvent.click(btn);
    await userEvent.click(btn);
    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(btn).toHaveAttribute('aria-busy', 'true');
    await act(async () => resolve());
    expect(btn).toHaveTextContent('Added');
    expect(screen.getByRole('status')).toHaveTextContent('Mitten State Mug added to cart');
  });

  it('shows a recoverable error state', async () => {
    const onError = vi.fn();
    render(<AddToCartButton onAdd={() => Promise.reject(new Error('500'))} onError={onError} />);
    await userEvent.click(screen.getByRole('button'));
    expect(await screen.findByRole('button', { name: 'Try again' })).toBeInTheDocument();
    expect(onError).toHaveBeenCalled();
  });
});

describe('ProductGrid', () => {
  it('shows skeletons and a busy status while loading', () => {
    const { container } = render(<ProductGrid products={undefined} isLoading getProductHref={href} />);
    expect(screen.getByRole('status')).toHaveTextContent(/loading/i);
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(container.querySelectorAll('.dgs-skeleton').length).toBeGreaterThan(0);
  });

  it('shows an error with retry when nothing loaded', async () => {
    const onRetry = vi.fn();
    render(<ProductGrid products={undefined} error={new Error('x')} onRetry={onRetry} getProductHref={href} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalled();
  });

  it('shows the empty state, or a custom one', () => {
    const { rerender } = render(<ProductGrid products={[]} getProductHref={href} />);
    expect(screen.getByRole('heading', { name: 'No gifts found' })).toBeInTheDocument();
    rerender(<ProductGrid products={[]} getProductHref={href} emptyState={<p>Custom</p>} />);
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });

  it('keeps results visible when loading more fails', () => {
    render(<ProductGrid products={[mug, tee]} error={new Error('x')} getProductHref={href} />);
    const list = screen.getByRole('list', { name: 'Products' });
    expect(within(list).getAllByRole('article')).toHaveLength(2);
    expect(screen.getByRole('alert')).toHaveTextContent(/couldn’t load more/i);
  });

  it('eager-loads only the priority images', () => {
    const { container } = render(
      <ProductGrid products={[mug, { ...mug, id: 'p3' }]} priorityCount={1} getProductHref={href} />,
    );
    const imgs = container.querySelectorAll('img');
    expect(imgs[0]).toHaveAttribute('loading', 'eager');
    expect(imgs[1]).toHaveAttribute('loading', 'lazy');
  });
});
