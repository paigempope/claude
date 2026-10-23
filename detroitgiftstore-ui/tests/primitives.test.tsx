import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, Price, Rating, QuantityStepper, formatMoney } from '../src';

describe('formatMoney', () => {
  it('formats minor units per currency precision', () => {
    expect(formatMoney({ amount: 2499, currencyCode: 'USD' })).toBe('$24.99');
    expect(formatMoney({ amount: 2499, currencyCode: 'JPY' }, 'en-US')).toBe('¥2,499');
  });
});

describe('Button', () => {
  it('blocks clicks and stays focusable while loading', async () => {
    const onClick = vi.fn();
    render(<Button loading onClick={onClick}>Pay</Button>);
    const btn = screen.getByRole('button', { name: /pay/i });
    expect(btn).toHaveAttribute('aria-busy', 'true');
    expect(btn).toHaveAttribute('aria-disabled', 'true');
    expect(btn).not.toBeDisabled();
    await userEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('defaults to type="button" so it never submits forms by accident', () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });
});

describe('Price', () => {
  it('announces sale and regular price', () => {
    render(<Price price={{ amount: 1800, currencyCode: 'USD' }} compareAtPrice={{ amount: 2400, currencyCode: 'USD' }} />);
    expect(screen.getByText(/sale price/i)).toBeInTheDocument();
    expect(screen.getByText(/regular price/i).closest('s')).toHaveTextContent('$24.00');
  });

  it('ignores a compare-at price that is not higher', () => {
    render(<Price price={{ amount: 1800, currencyCode: 'USD' }} compareAtPrice={{ amount: 1800, currencyCode: 'USD' }} />);
    expect(screen.queryByText(/regular price/i)).not.toBeInTheDocument();
  });
});

describe('Rating', () => {
  it('exposes a single readable label and clamps bad input', () => {
    render(<Rating value={7} count={1} />);
    expect(screen.getByRole('img')).toHaveAccessibleName('Rated 5 out of 5 stars, 1 review');
  });
});

describe('QuantityStepper', () => {
  it('increments, clamps to max and disables at bounds', async () => {
    const onChange = vi.fn();
    render(<QuantityStepper defaultValue={2} max={3} onChange={onChange} />);
    const inc = screen.getByRole('button', { name: /increase/i });
    await userEvent.click(inc);
    expect(onChange).toHaveBeenLastCalledWith(3);
    expect(inc).toBeDisabled();
  });

  it('clamps typed values on blur and restores empty input', async () => {
    const onChange = vi.fn();
    render(<QuantityStepper defaultValue={2} max={10} onChange={onChange} />);
    const input = screen.getByRole('textbox');
    await userEvent.clear(input);
    await userEvent.type(input, '50');
    await userEvent.tab();
    expect(input).toHaveValue('10');
    await userEvent.clear(input);
    await userEvent.tab();
    expect(input).toHaveValue('10');
  });
});
