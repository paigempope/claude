import type { Money } from '../types/commerce';

const formatterCache = new Map<string, Intl.NumberFormat>();

function getFormatter(locale: string, currencyCode: string): Intl.NumberFormat {
  const key = `${locale}:${currencyCode}`;
  let formatter = formatterCache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, { style: 'currency', currency: currencyCode });
    formatterCache.set(key, formatter);
  }
  return formatter;
}

/** Formats minor-unit money, respecting each currency's decimal places (JPY has 0). */
export function formatMoney(money: Money, locale = 'en-US'): string {
  const formatter = getFormatter(locale, money.currencyCode);
  const digits = formatter.resolvedOptions().maximumFractionDigits ?? 2;
  return formatter.format(money.amount / 10 ** digits);
}

/** True only when compareAt is a real, higher price in the same currency. */
export function isDiscounted(price: Money, compareAt?: Money | null): compareAt is Money {
  return (
    !!compareAt &&
    compareAt.currencyCode === price.currencyCode &&
    compareAt.amount > price.amount
  );
}

export function discountPercent(price: Money, compareAt: Money): number {
  return Math.round(((compareAt.amount - price.amount) / compareAt.amount) * 100);
}
