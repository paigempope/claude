import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../utils/cn';
import { Button } from './Button';

type HeadingLevel = 'h2' | 'h3' | 'h4';

export interface StateMessageProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode;
  description?: ReactNode;
  /** Decorative glyph or SVG; hidden from assistive tech. */
  icon?: ReactNode;
  /** Buttons / links. */
  actions?: ReactNode;
  headingLevel?: HeadingLevel;
}

/** Base layout shared by EmptyState and ErrorState. */
export function StateMessage({
  title,
  description,
  icon,
  actions,
  headingLevel: Heading = 'h2',
  className,
  ...rest
}: StateMessageProps) {
  return (
    <div className={cn('dgs-state', className)} {...rest}>
      {icon && <div className="dgs-state__icon" aria-hidden="true">{icon}</div>}
      <Heading className="dgs-state__title">{title}</Heading>
      {description && <p className="dgs-state__body">{description}</p>}
      {actions && <div className="dgs-state__actions">{actions}</div>}
    </div>
  );
}

export type EmptyStateProps = StateMessageProps;

export function EmptyState({ icon = '🎁', ...props }: EmptyStateProps) {
  return <StateMessage icon={icon} {...props} />;
}

export interface ErrorStateProps extends Omit<StateMessageProps, 'title'> {
  title?: ReactNode;
  /** Renders a "Try again" button when provided. */
  onRetry?: () => void;
  retryLabel?: string;
}

/**
 * role="alert" so the failure is announced immediately. Never render raw
 * error messages: they leak internals and aren't written for shoppers.
 */
export function ErrorState({
  title = 'Something went wrong',
  description = 'We couldn’t load this right now. Please check your connection and try again.',
  icon = '⚠',
  onRetry,
  retryLabel = 'Try again',
  actions,
  ...props
}: ErrorStateProps) {
  return (
    <StateMessage
      role="alert"
      title={title}
      description={description}
      icon={icon}
      actions={
        (onRetry || actions) && (
          <>
            {onRetry && <Button variant="secondary" onClick={onRetry}>{retryLabel}</Button>}
            {actions}
          </>
        )
      }
      {...props}
    />
  );
}
