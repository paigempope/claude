import { forwardRef, type ButtonHTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import { cn } from '../utils/cn';
import { Spinner } from './Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  /** Shows a spinner, blocks clicks, keeps width stable and stays focusable. */
  loading?: boolean;
  /** Screen-reader text while loading. Default: "Loading". */
  loadingLabel?: string;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

/**
 * Disabled/loading buttons use aria-disabled instead of the native `disabled`
 * attribute so they remain in the tab order and focus isn't lost mid-action.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    fullWidth,
    loading = false,
    loadingLabel = 'Loading',
    disabled,
    startIcon,
    endIcon,
    type = 'button',
    className,
    onClick,
    children,
    ...rest
  },
  ref,
) {
  const inert = disabled || loading;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (inert) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'dgs-btn',
        `dgs-btn--${variant}`,
        size !== 'md' && `dgs-btn--${size}`,
        fullWidth && 'dgs-btn--full',
        className,
      )}
      aria-disabled={inert || undefined}
      aria-busy={loading || undefined}
      onClick={handleClick}
      {...rest}
    >
      <span className="dgs-btn__content">
        {startIcon && <span aria-hidden="true">{startIcon}</span>}
        {children}
        {endIcon && <span aria-hidden="true">{endIcon}</span>}
      </span>
      {loading && (
        <span className="dgs-btn__spinner">
          <Spinner />
          <span className="dgs-visually-hidden">{loadingLabel}</span>
        </span>
      )}
    </button>
  );
});
