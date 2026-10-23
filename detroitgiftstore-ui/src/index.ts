// Styles: import once at the app root.
//   import '@detroitgiftstore/ui/src/styles/tokens.css';
//   import '@detroitgiftstore/ui/src/styles/components.css';

export * from './types/commerce';

export { cn } from './utils/cn';
export { formatMoney, isDiscounted, discountPercent } from './utils/money';
export { useAsyncAction, type AsyncStatus, type UseAsyncActionOptions } from './hooks/useAsyncAction';

export { VisuallyHidden } from './components/VisuallyHidden';
export { Spinner, type SpinnerProps } from './components/Spinner';
export { Skeleton, type SkeletonProps } from './components/Skeleton';
export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from './components/Button';
export { Badge, type BadgeProps, type BadgeTone } from './components/Badge';
export { Price, type PriceProps } from './components/Price';
export { Rating, type RatingProps } from './components/Rating';
export { QuantityStepper, type QuantityStepperProps } from './components/QuantityStepper';
export {
  StateMessage,
  EmptyState,
  ErrorState,
  type StateMessageProps,
  type EmptyStateProps,
  type ErrorStateProps,
} from './components/StateMessage';
export { AddToCartButton, type AddToCartButtonProps } from './components/AddToCartButton';
export {
  ProductCard,
  ProductCardSkeleton,
  type ProductCardProps,
  type ProductCardSkeletonProps,
} from './components/ProductCard';
export { ProductGrid, type ProductGridProps } from './components/ProductGrid';
