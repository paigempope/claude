import { useAsyncAction } from '../hooks/useAsyncAction';
import { Button, type ButtonProps } from './Button';

export interface AddToCartButtonProps
  extends Omit<ButtonProps, 'onClick' | 'loading' | 'children'> {
  /** Performs the cart mutation. Reject to show the error state. */
  onAdd: () => Promise<unknown> | unknown;
  availableForSale?: boolean;
  /** Used in announcements, e.g. "Mitten Mug added to cart". */
  productTitle?: string;
  onError?: (error: unknown) => void;
  labels?: Partial<{ idle: string; pending: string; success: string; error: string; soldOut: string }>;
}

const DEFAULT_LABELS = {
  idle: 'Add to cart',
  pending: 'Adding to cart',
  success: 'Added ✓',
  error: 'Try again',
  soldOut: 'Sold out',
};

/**
 * Owns the whole add-to-cart lifecycle: pending spinner, double-click guard,
 * success/error feedback and a polite screen-reader announcement.
 */
export function AddToCartButton({
  onAdd,
  availableForSale = true,
  productTitle,
  onError,
  labels,
  variant = 'primary',
  ...rest
}: AddToCartButtonProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const { run, status } = useAsyncAction(onAdd, { onError });

  const announcement =
    status === 'success'
      ? `${productTitle ?? 'Item'} added to cart`
      : status === 'error'
        ? `Couldn’t add ${productTitle ?? 'item'} to cart. Please try again.`
        : '';

  if (!availableForSale) {
    return (
      <Button variant="secondary" disabled {...rest}>
        {text.soldOut}
      </Button>
    );
  }

  return (
    <>
      <Button
        variant={status === 'error' ? 'danger' : variant}
        loading={status === 'pending'}
        loadingLabel={text.pending}
        onClick={() => void run()}
        {...rest}
      >
        {status === 'success' ? text.success : status === 'error' ? text.error : text.idle}
      </Button>
      {/* Live region is always mounted so changes are reliably announced */}
      <span role="status" aria-live="polite" className="dgs-visually-hidden">
        {announcement}
      </span>
    </>
  );
}
