import { useEffect, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { cn } from '../utils/cn';
import { useId } from '../utils/useId';

export interface QuantityStepperProps {
  /** Controlled value. Pair with onChange. */
  value?: number;
  /** Uncontrolled initial value. */
  defaultValue?: number;
  onChange?: (value: number) => void;
  min?: number;
  /** Typically available inventory or a per-order limit. */
  max?: number;
  step?: number;
  disabled?: boolean;
  /** Visible to screen readers; include the product name in cart rows. */
  label?: string;
  id?: string;
  className?: string;
}

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

export function QuantityStepper({
  value: controlled,
  defaultValue = 1,
  onChange,
  min = 1,
  max = 99,
  step = 1,
  disabled,
  label = 'Quantity',
  id,
  className,
}: QuantityStepperProps) {
  const inputId = useId(id, 'qty');
  const isControlled = controlled !== undefined;
  const [internal, setInternal] = useState(() => clamp(defaultValue, min, max));
  const value = isControlled ? clamp(controlled, min, max) : internal;
  // Free-typing buffer so the user can clear the field before typing a new number
  const [draft, setDraft] = useState(String(value));

  useEffect(() => setDraft(String(value)), [value]);

  const commit = (next: number) => {
    const clamped = clamp(Number.isFinite(next) ? Math.round(next) : value, min, max);
    if (!isControlled) setInternal(clamped);
    setDraft(String(clamped));
    if (clamped !== value) onChange?.(clamped);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    setDraft(digits);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') { e.preventDefault(); commit(value + step); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); commit(value - step); }
    else if (e.key === 'Enter') { commit(draft === '' ? value : Number(draft)); }
  };

  return (
    <div className={cn('dgs-stepper', className)} role="group" aria-labelledby={`${inputId}-label`}>
      <span id={`${inputId}-label`} className="dgs-visually-hidden">{label}</span>
      <button
        type="button"
        className="dgs-stepper__btn"
        aria-label={`Decrease ${label.toLowerCase()}`}
        aria-controls={inputId}
        disabled={disabled || value <= min}
        onClick={() => commit(value - step)}
      >
        −
      </button>
      <input
        id={inputId}
        className="dgs-stepper__input"
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="off"
        aria-labelledby={`${inputId}-label`}
        aria-valuemin={min}
        aria-valuemax={max}
        value={draft}
        disabled={disabled}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={() => commit(draft === '' ? value : Number(draft))}
      />
      <button
        type="button"
        className="dgs-stepper__btn"
        aria-label={`Increase ${label.toLowerCase()}`}
        aria-controls={inputId}
        disabled={disabled || value >= max}
        onClick={() => commit(value + step)}
      >
        +
      </button>
    </div>
  );
}
